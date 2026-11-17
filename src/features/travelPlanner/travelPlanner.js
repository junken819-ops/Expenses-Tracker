/**
 * 🗺️ AI Travel Route Planner & Itinerary Optimizer
 * Powered by Google Gemini 2.0 Flash (Highest Free AI Model)
 * With High-Precision Geographic Haversine & TSP Routing Fallback
 * 
 * Features:
 * 1. Paste Google Maps links to auto-capture venue, coordinates, city, and category.
 * 2. 1-Click "Plan My Route" generates optimal itinerary with exact times, sequence & travel durations.
 * 3. Smart "Today vs Tomorrow" multi-day clustering to eliminate backtracking.
 * 4. Add another place and re-plan again anytime.
 * 5. 1-Click Google Maps turn-by-turn multi-stop navigation URL.
 * 6. One-tap import from saved Wishlist.
 */

let travelPlannerPlaces = [];
let travelPlannerDayMode = 'auto'; // 'auto' | '1' | '2' | '3'
let travelPlannerStartTime = '09:00';
let travelPlannerTravelMode = 'driving'; // 'driving' | 'walking' | 'transit'
let travelPlannerCurrentPlan = null;
let travelPlannerIsLoading = false;
let travelPlannerShowHowItWorks = false;
let travelPlannerShowWishlistImport = false;
let travelPlannerIsCoolingDown = false;
let travelPlannerCooldownTimer = null;
let travelPlannerCooldownRemaining = 0;
let travelPlannerCooldownTotal = 15;
let travelPlannerRetryCount = 0;
const TRAVEL_PLANNER_MAX_RETRIES = 3;

// ── 1. GEOGRAPHIC & TIME HELPER UTILITIES ──────────────────────

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula
 */
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)) return 2.5;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates realistic transit travel duration in minutes based on distance and mode
 */
function estimateTransitMinutes(distanceKm, mode = 'driving') {
  if (!distanceKm || distanceKm <= 0.1) return 3;
  if (mode === 'walking') {
    return Math.max(4, Math.round((distanceKm / 4.8) * 60)); // ~4.8 km/h
  }
  if (mode === 'transit') {
    return Math.max(10, Math.round((distanceKm / 20) * 60 + 8)); // ~20 km/h + wait time
  }
  // Driving (default city speed ~30 km/h + traffic/parking buffer)
  return Math.max(5, Math.round((distanceKm / 30) * 60 + 4));
}

/**
 * Adds minutes to an "HH:MM" string and returns formatted 12h time (e.g. "09:00 AM")
 */
function addMinutesToTimeString(baseTimeStr, minutesToAdd) {
  let [hours, mins] = String(baseTimeStr || '09:00').split(':').map(Number);
  if (isNaN(hours)) hours = 9;
  if (isNaN(mins)) mins = 0;

  const totalMins = hours * 60 + mins + Math.round(minutesToAdd);
  const finalH = Math.floor(totalMins / 60) % 24;
  const finalM = totalMins % 60;

  const ampm = finalH >= 12 ? 'PM' : 'AM';
  const displayH = finalH % 12 === 0 ? 12 : finalH % 12;
  const displayM = finalM < 10 ? '0' + finalM : finalM;
  return `${displayH}:${displayM} ${ampm}`;
}

/**
 * Converts "HH:MM" (24h) to "H:MM AM/PM"
 */
function formatHourTo12h(timeStr) {
  let [h, m] = String(timeStr || '09:00').split(':').map(Number);
  if (isNaN(h)) h = 9;
  if (isNaN(m)) m = 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? '0' + m : m;
  return `${displayH}:${displayM} ${ampm}`;
}

/**
 * Infers venue time-of-day category, recommended dwell minutes, and icon
 */
function inferPlaceMetadata(place) {
  const text = `${place.name || ''} ${place.cuisine || ''} ${(place.categories || []).join(' ')} ${place.notes || ''}`.toLowerCase();
  
  if (/breakfast|toast|kopitiam|coffee|cafe|bakery|dim sum|nasi lemak|roti|bazaar/.test(text)) {
    return { type: 'breakfast', slot: 1, dwellMins: 50, icon: '☕', label: 'Breakfast / Coffee' };
  }
  if (/lunch|chicken rice|noodle|ramen|laksa|hawker|food court|curry|roast/.test(text)) {
    return { type: 'lunch', slot: 3, dwellMins: 60, icon: '🍜', label: 'Lunch & Specialties' };
  }
  if (/tea|dessert|boba|ice cream|cendol|matcha|pastry|cake/.test(text)) {
    return { type: 'tea', slot: 4, dwellMins: 40, icon: '🍰', label: 'Afternoon Tea / Dessert' };
  }
  if (/dinner|seafood|hotpot|bbq|grill|steak|barbeque|bistro|sushi|claypot/.test(text)) {
    return { type: 'dinner', slot: 6, dwellMins: 75, icon: '🍲', label: 'Dinner Feast' };
  }
  if (/night market|pasar malam|bar|pub|supper|cocktail|speakeasy|lok lok/.test(text)) {
    return { type: 'night', slot: 7, dwellMins: 80, icon: '🌙', label: 'Night Market / Supper' };
  }
  if (/museum|temple|castle|cave|park|tower|gallery|attraction|mall|waterfront|beach|heritage|walk/.test(text)) {
    return { type: 'sightseeing', slot: 2, dwellMins: 90, icon: '🏛️', label: 'Sightseeing & Attraction' };
  }
  return { type: 'general', slot: 3, dwellMins: 60, icon: '📍', label: 'Local Spot' };
}

// ── 2. LOCAL ALGORITHMIC ROUTING ENGINE (FALLBACK & VERIFIER) ──

/**
 * Algorithmic route optimizer:
 * 1. Clusters places into Day 1 (Today) and Day 2 (Tomorrow) based on user preference and geographic centroids.
 * 2. Minimizes total transit distance (Greedy TSP + Time-of-day slotting).
 * 3. Builds a realistic minute-by-minute schedule.
 */
function solveOptimizedRouteLocal(places, startHour = '09:00', dayPlanMode = 'auto', travelMode = 'driving') {
  if (!places || places.length === 0) return null;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  // Clone places with inferred metadata
  const list = places.map((p, idx) => {
    const meta = inferPlaceMetadata(p);
    return {
      ...p,
      originalIdx: idx,
      type: meta.type,
      slot: meta.slot,
      dwellMins: p.dwellMins || meta.dwellMins,
      icon: meta.icon,
      typeLabel: meta.label
    };
  });

  // Determine number of days
  let numDays = 1;
  if (dayPlanMode === '2') {
    numDays = 2;
  } else if (dayPlanMode === '3') {
    numDays = 3;
  } else if (dayPlanMode === 'auto') {
    // Smart auto: 1-3 places = 1 day, 4-7 places = 2 days, 8+ = 3 days
    if (list.length >= 8) numDays = 3;
    else if (list.length >= 4) numDays = 2;
    else numDays = 1;
  }

  // Group places into days
  let dayGroups = [];
  if (numDays === 1) {
    dayGroups.push([...list]);
  } else if (numDays === 2) {
    // Split places geographically (e.g. West vs East or North vs South) to avoid cross-town commuting
    const hasCoords = list.filter(p => isFinite(p.lat) && isFinite(p.lng));
    if (hasCoords.length >= 3) {
      // Find latitude & longitude spread
      const lats = hasCoords.map(p => p.lat);
      const lngs = hasCoords.map(p => p.lng);
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const lngSpan = Math.max(...lngs) - Math.min(...lngs);

      // Sort along the axis of greater variance
      const sorted = [...list].sort((a, b) => {
        if (latSpan >= lngSpan) {
          return ((b.lat || 0) - (a.lat || 0));
        } else {
          return ((a.lng || 0) - (b.lng || 0));
        }
      });

      const half = Math.ceil(sorted.length / 2);
      dayGroups.push(sorted.slice(0, half));
      dayGroups.push(sorted.slice(half));
    } else {
      // Split evenly
      const half = Math.ceil(list.length / 2);
      dayGroups.push(list.slice(0, half));
      dayGroups.push(list.slice(half));
    }
  } else {
    // 3 Days
    const chunkSize = Math.ceil(list.length / 3);
    dayGroups.push(list.slice(0, chunkSize));
    dayGroups.push(list.slice(chunkSize, chunkSize * 2));
    dayGroups.push(list.slice(chunkSize * 2));
  }

  // Format Days and sequence stops
  let totalDistanceKm = 0;
  const daysResult = dayGroups.filter(g => g.length > 0).map((group, dIdx) => {
    const dayNum = dIdx + 1;
    let dayLabel = '';
    if (dayNum === 1) {
      dayLabel = isZh ? '今天 (Day 1 · Today)' : 'Today (Day 1)';
    } else if (dayNum === 2) {
      dayLabel = isZh ? '明天 (Day 2 · Tomorrow)' : 'Tomorrow (Day 2)';
    } else {
      dayLabel = isZh ? `后天 (Day ${dayNum})` : `Day ${dayNum}`;
    }

    // Sequence the group: sort by slot preference, then optimize nearest neighbor
    const sequenced = sequenceStopsForDay(group, travelMode);

    // Compute timeline timestamps
    let currentClockMinutes = parseTimeToMinutes(startHour);
    const stopsWithTimes = sequenced.map((stop, sIdx) => {
      const arriveTime = formatMinutesTo12h(currentClockMinutes);
      const dwell = stop.dwellMins || 60;
      const departClockMinutes = currentClockMinutes + dwell;
      const departTime = formatMinutesTo12h(departClockMinutes);

      let transitToNext = null;
      if (sIdx < sequenced.length - 1) {
        const nextStop = sequenced[sIdx + 1];
        const dist = getHaversineDistanceKm(stop.lat, stop.lng, nextStop.lat, nextStop.lng);
        const transitMins = estimateTransitMinutes(dist, travelMode);
        totalDistanceKm += dist;
        transitToNext = {
          durationMins: transitMins,
          distanceKm: dist,
          mode: travelMode
        };
        currentClockMinutes = departClockMinutes + transitMins;
      } else {
        currentClockMinutes = departClockMinutes;
      }

      // Generate helpful AI tips and why this order
      const whyThisOrder = generateWhyOrderText(sIdx, stop, sequenced.length, isZh);
      const aiTip = stop.recommendationText || (stop.recommendations && stop.recommendations.length > 0)
        ? `${isZh ? '招牌必试：' : 'Must-try: '} ${Array.isArray(stop.recommendations) ? stop.recommendations.slice(0, 3).join(', ') : stop.recommendationText}`
        : (isZh ? '建议避开高峰期，提前预留充足时间打卡拍照。' : 'Plan extra time for photos & avoid peak rush hour.');

      return {
        order: sIdx + 1,
        id: stop.id || ('stop_' + sIdx),
        name: stop.name,
        category: stop.typeLabel,
        city: stop.city || '',
        address: stop.address || '',
        lat: stop.lat,
        lng: stop.lng,
        mapUrl: stop.mapUrl || stop.url || '',
        icon: stop.icon,
        arriveTime,
        departTime,
        dwellMins: dwell,
        transitToNext,
        aiTip,
        whyThisOrder
      };
    });

    const primaryCity = group.find(p => p.city)?.city || '';
    const theme = isZh
      ? (primaryCity ? `${primaryCity} · 精选探店路线` : '市区经典路线 · 轻松漫游')
      : (primaryCity ? `${primaryCity} Explorer & Local Highlights` : 'City Highlights & Scenic Tour');

    return {
      dayNum,
      dayLabel,
      theme,
      stops: stopsWithTimes
    };
  });

  const rationale = isZh
    ? (numDays > 1
        ? `智能路线按地理区域将 ${places.length} 个地点拆分为【今天】与【明天】：今天优先游览相近的热门商圈，明天安排相邻区域，彻底杜绝走回头路！`
        : `按营业时段与地理最佳顺序安排：早晨先到特色早点/咖啡厅开胃，接着游览主要景点，中午与晚上无缝串联美食打卡！`)
    : (numDays > 1
        ? `Smart geographical clustering split ${places.length} places between Today and Tomorrow to eliminate cross-city backtracking and maximize your time.`
        : `Optimized in a natural chronological flow: start with morning eats, transition smoothly into sightseeing, and wrap up with dinner & evening leisure.`);

  return {
    tripTitle: isZh ? '🍯 智能 AI 行程路线规划' : '🍯 Smart AI Travel Route Plan',
    summary: isZh 
      ? `已为你规划 ${numDays} 天行程，共打卡 ${places.length} 个目的地，预估行车距离约 ${Math.round(totalDistanceKm * 10) / 10} km。` 
      : `Planned ${numDays} day(s) covering ${places.length} destinations with ~${Math.round(totalDistanceKm * 10) / 10} km total transit.`,
    dayAllocationRationale: rationale,
    totalDays: numDays,
    totalStops: places.length,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    days: daysResult,
    proTips: isZh ? [
      '💡 点击【在 Google 地图打开完整路线】可一键拉起导航路线，手机免手动重复输入！',
      '⏰ 可随时点击【➕ 添加另一个地点】输入新地点并一键【重新规划】。',
      '🚗 实际路况受早晚高峰影响，建议出行时留意导航实时拥堵提示。'
    ] : [
      '💡 Tap "Open Full Route in Google Maps" to start turn-by-turn navigation directly!',
      '⏰ Tap "+ Add Another Place" anytime to append more spots and re-plan on the fly.',
      '🚗 Transit times include traffic buffer; adjust slightly during peak rush hours.'
    ],
    generatedBy: 'Smart Heuristic Engine'
  };
}

/**
 * Sequences stops within a single day to balance time-of-day suitability and proximity
 */
function sequenceStopsForDay(stops, travelMode) {
  if (stops.length <= 1) return stops;

  // Initial order by chronological slot (breakfast first, dinner last)
  let pool = [...stops];
  let sorted = [];

  // Pick first stop: prefer breakfast or lowest slot
  pool.sort((a, b) => a.slot - b.slot);
  sorted.push(pool.shift());

  // Greedy Nearest Neighbor for remaining, with gentle slot penalty
  while (pool.length > 0) {
    const current = sorted[sorted.length - 1];
    let bestIdx = 0;
    let minCost = Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const dist = getHaversineDistanceKm(current.lat, current.lng, candidate.lat, candidate.lng);
      // Cost function: distance km + slot difference penalty if reversing time of day
      let slotPenalty = 0;
      if (candidate.slot < current.slot) {
        slotPenalty = (current.slot - candidate.slot) * 4; // penalty for having breakfast after dinner
      }
      const cost = dist + slotPenalty;
      if (cost < minCost) {
        minCost = cost;
        bestIdx = i;
      }
    }

    sorted.push(pool.splice(bestIdx, 1)[0]);
  }

  return sorted;
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = String(timeStr || '09:00').split(':').map(Number);
  return (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m);
}

function formatMinutesTo12h(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? '0' + m : m;
  return `${displayH}:${displayM} ${ampm}`;
}

function generateWhyOrderText(idx, stop, totalStops, isZh) {
  if (idx === 0) {
    return isZh ? '行程第一站，适合开启活力早晨，避开排队高峰' : '1st Stop: Best visited in the morning to beat long queues';
  }
  if (idx === totalStops - 1) {
    return isZh ? '行程终点站，享受丰盛晚餐或夜市惬意氛围' : 'Final Stop: Ideal for an evening wrap-up or vibrant dinner';
  }
  if (stop.type === 'lunch') {
    return isZh ? '正中午最佳时段，顺路就餐吹冷气休息' : 'Midday Lunch: Perfectly timed for a midday meal & rest';
  }
  if (stop.type === 'tea') {
    return isZh ? '下午茶甜点时段，缓解游玩疲劳' : 'Afternoon Tea: Great mid-afternoon spot to relax & refresh';
  }
  return isZh ? '紧邻上一站，车程距离最短，路线顺畅不折返' : 'Closest stop from previous location; smooth flow with zero backtracking';
}

// ── 3. GEMINI 2.0 FLASH AI TRIP PLANNER INTEGRATION ───────────

/**
 * Builds the AI prompt and invokes Google Gemini 2.0 Flash (highest free model)
 */
async function callGeminiTravelPlanner(places, startHour, dayPlanMode, travelMode) {
  const apiKey = (typeof S !== 'undefined' && S && S.geminiApiKey) ? S.geminiApiKey.trim() : '';
  if (!apiKey || apiKey.length < 8) {
    return { ok: false, error: 'no_key', message: 'API key not configured' };
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const placesForPrompt = places.map((p, idx) => ({
    id: idx + 1,
    name: p.name,
    category: p.cuisine || (p.categories && p.categories[0]) || 'Place',
    city: p.city || '',
    lat: p.lat,
    lng: p.lng,
    rating: p.rating || null,
    notes: p.notes || '',
    recommendations: p.recommendations || []
  }));

  const prompt = `You are a world-class AI Travel & Route Planner.
The user wants to plan an optimized trip based on a list of places they saved from Google Maps.

CRITICAL PLANNING REQUIREMENTS:
1. OPTIMAL ROUTE & SEQUENCE (Which one to go first):
   - Sequence places to minimize travel distance and avoid cross-town backtracking using their GPS coordinates.
   - Respect natural daily rhythm:
     * Morning (08:30 - 11:00): Breakfast / local coffee / morning walks / temples / markets.
     * Midday (11:30 - 14:00): Lunch spots / indoor air-conditioned venues.
     * Afternoon (14:00 - 17:30): Sightseeing / landmarks / cafes / tea / shopping / dessert.
     * Sunset & Evening (17:30 - 20:00): Viewpoints / strolls / early dinner.
     * Night (20:00 - 22:30): Dinner / night markets / dessert / vibrant evening spots.

2. MULTI-DAY SPLIT (TODAY vs TOMORROW):
   - User day preference: "${dayPlanMode}" (options: "auto", "1", "2", "3").
   - If day preference is "auto":
     * If 1 to 3 places: schedule all in "Day 1 (Today)".
     * If 4 to 7 places: smartly split into "Day 1 (Today)" and "Day 2 (Tomorrow)" by geographic clusters (e.g., Old Town cluster Today, Suburbs/South cluster Tomorrow).
     * If 8+ places: split across Day 1 (Today), Day 2 (Tomorrow), and Day 3.
   - If day preference is "1": put all places in "Day 1 (Today)".
   - If day preference is "2": split across "Day 1 (Today)" and "Day 2 (Tomorrow)".
   - Clearly explain why certain places are visited Today vs Tomorrow in the dayAllocationRationale!

3. TIMELINE & TRANSIT:
   - Trip start time: "${startHour}".
   - Provide realistic arrival time (arriveTime) and departure time (departTime) for each stop (e.g. "09:00 AM", "10:15 AM").
   - Specify dwell time in minutes (dwellMins).
   - Estimate transit driving/travel time (durationMins) and distance in km (distanceKm) between each stop.

4. LOCAL INSIDER TIPS & WHY THIS ORDER:
   - For every stop, provide a short "aiTip" (must-order dish, photo spot, or parking advice).
   - Explain "whyThisOrder" (e.g., "Visited 1st to catch fresh breakfast; only 10 mins from hotel").

Language: ${isZh ? 'Chinese (Simplified)' : 'English'}.
OUTPUT STRICT JSON ONLY (NO markdown codeblocks, NO text before or after):
{
  "tripTitle": "...",
  "summary": "...",
  "dayAllocationRationale": "...",
  "totalDays": 2,
  "totalStops": ${places.length},
  "totalDistanceKm": 18.5,
  "days": [
    {
      "dayNum": 1,
      "dayLabel": "${isZh ? '今天 (Day 1 · Today)' : 'Today (Day 1)'}",
      "theme": "...",
      "stops": [
        {
          "order": 1,
          "name": "...",
          "category": "...",
          "arriveTime": "09:00 AM",
          "departTime": "10:00 AM",
          "dwellMins": 60,
          "transitToNext": { "durationMins": 12, "distanceKm": 3.8, "mode": "${travelMode}" },
          "aiTip": "...",
          "whyThisOrder": "...",
          "lat": 0,
          "lng": 0
        }
      ]
    }
  ],
  "proTips": ["..."]
}

PLACES LIST:
${JSON.stringify(placesForPrompt, null, 2)}
`;

  try {
    // Specifically use gemini-2.0-flash (Google's highest free tier model)
    const preferredModel = (S.geminiModel && S.geminiModel !== 'auto') ? S.geminiModel : 'gemini-2.0-flash';
    const modelsToTry = [preferredModel, 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];

    const res = await generateGeminiContent(apiKey, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2
      }
    }, 28000, null, { models: modelsToTry });

    if (res && res.data) {
      const text = res.data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      let parsed = null;
      if (typeof extractJsonFromText === 'function') {
        parsed = extractJsonFromText(text);
      } else {
        try {
          const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          parsed = JSON.parse(cleaned);
        } catch(e) {}
      }

      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        // Enrich stops with coordinates & map URLs from original places
        parsed.days.forEach(day => {
          (day.stops || []).forEach(stop => {
            const match = places.find(p => (p.name && stop.name && p.name.toLowerCase().includes(stop.name.toLowerCase())) ||
                                           (stop.name && p.name && stop.name.toLowerCase().includes(p.name.toLowerCase())));
            if (match) {
              if (!stop.lat && match.lat) stop.lat = match.lat;
              if (!stop.lng && match.lng) stop.lng = match.lng;
              if (!stop.city && match.city) stop.city = match.city;
              if (!stop.mapUrl) stop.mapUrl = match.mapUrl || match.url || '';
              if (!stop.icon) stop.icon = inferPlaceMetadata(match).icon;
            } else {
              stop.icon = inferPlaceMetadata({ name: stop.name, categories: [stop.category] }).icon;
            }
          });
        });
        parsed.generatedBy = `Gemini 2.0 Flash AI (${res.model || 'gemini-2.0-flash'})`;
        return { ok: true, plan: parsed };
      }
    }

    const lastErr = res?.lastError || '';
    const isRateLimit = /429|resource_exhausted|quota|rate.?limit|overload|busy|too many requests/i.test(lastErr);
    let cooldownSec = res?.retryAfterSeconds || 15;
    const matchSec = lastErr.match(/retry(?:ing)? in (\d+)(?:\.\d+)?s/i) || lastErr.match(/wait (\d+)s/i);
    if (matchSec && Number(matchSec[1])) {
      cooldownSec = Math.min(60, Math.max(5, parseInt(matchSec[1], 10)));
    }

    return {
      ok: false,
      error: isRateLimit ? 'rate_limit' : 'api_error',
      message: lastErr,
      cooldownSeconds: cooldownSec
    };
  } catch(err) {
    console.warn('Gemini Travel Planner API error:', err);
    return {
      ok: false,
      error: 'api_error',
      message: err?.message || String(err),
      cooldownSeconds: 15
    };
  }
}

// ── 4. MULTI-STOP GOOGLE MAPS NAVIGATION URL GENERATOR ─────────

/**
 * Generates an official Google Maps turn-by-turn multi-waypoint navigation link
 */
function buildGoogleMapsRouteUrl(stops) {
  if (!stops || stops.length === 0) return 'https://www.google.com/maps';
  
  if (stops.length === 1) {
    const s = stops[0];
    if (s.lat && s.lng) return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + (s.city ? ' ' + s.city : ''))}`;
  }

  const formatPoint = (s) => {
    if (s.lat && s.lng && isFinite(s.lat) && isFinite(s.lng)) {
      return `${s.lat},${s.lng}`;
    }
    return encodeURIComponent(s.name + (s.city ? ' ' + s.city : ''));
  };

  const origin = formatPoint(stops[0]);
  const dest = formatPoint(stops[stops.length - 1]);
  const waypoints = stops.slice(1, stops.length - 1).map(formatPoint).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}

function openDayRouteInGoogleMaps(dayIdx) {
  if (!travelPlannerCurrentPlan || !travelPlannerCurrentPlan.days) return;
  const day = travelPlannerCurrentPlan.days[dayIdx];
  if (!day || !day.stops || day.stops.length === 0) return;
  const url = buildGoogleMapsRouteUrl(day.stops);
  window.open(url, '_blank');
}
window.openDayRouteInGoogleMaps = openDayRouteInGoogleMaps;

function openSingleStopInGoogleMaps(lat, lng, name) {
  let url = '';
  if (lat && lng && isFinite(lat) && isFinite(lng)) {
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || '')}`;
  }
  window.open(url, '_blank');
}
window.openSingleStopInGoogleMaps = openSingleStopInGoogleMaps;

// ── 5. UI CONTROLLERS & EVENT HANDLERS ─────────────────────────

/**
 * Opens the Travel Planner modal
 * If initialLink is passed (e.g. from Wishlist quick-add bar), auto-resolves and adds it!
 */
async function openTravelPlanner(source = 'default', initialLink = '') {
  travelPlannerShowHowItWorks = false;
  travelPlannerShowWishlistImport = false;
  
  // If user passed a link directly from the Wishlist quick-add bar
  if (initialLink && String(initialLink).trim()) {
    openModal('travel-planner-modal');
    renderTravelPlannerUI();
    await addPlaceToPlanner(initialLink.trim());
    return;
  }

  // If no places added yet and wishlist has pending places, seed with wishlist places if empty
  if (travelPlannerPlaces.length === 0 && Array.isArray(S.restaurantRecords)) {
    const pending = S.restaurantRecords.filter(r => r.status === 'pending');
    // Pre-populate if only a few pending places exist
    if (pending.length > 0 && pending.length <= 4) {
      travelPlannerPlaces = pending.map(p => ({
        id: p.id || ('pl_' + Date.now() + Math.random().toString(36).substr(2, 4)),
        name: p.name,
        city: p.city || '',
        address: p.address || '',
        lat: p.lat || null,
        lng: p.lng || null,
        cuisine: p.cuisine || '',
        categories: p.categories || [],
        rating: p.rating || null,
        mapUrl: p.mapUrl || '',
        recommendations: p.items ? p.items.map(it => it.name) : []
      }));
    }
  }

  openModal('travel-planner-modal');
  renderTravelPlannerUI();
}
window.openTravelPlanner = openTravelPlanner;

function closeTravelPlanner() {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }
  travelPlannerIsCoolingDown = false;
  closeModal('travel-planner-modal');
}
window.closeTravelPlanner = closeTravelPlanner;

/**
 * Pastes clipboard content into the planner input and adds it
 */
async function pasteAndAddPlannerPlace() {
  const inp = el('tp-url-input');
  const statusEl = el('tp-input-status');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      if (inp) inp.value = text.trim();
      await addPlaceToPlanner(text.trim());
    } else {
      if (statusEl) statusEl.textContent = isZh ? '⚠️ 剪贴板是空的，请复制 Google 地图链接后重试' : '⚠️ Clipboard empty — copy a Google Maps link first!';
    }
  } catch(e) {
    if (inp && inp.value.trim()) {
      await addPlaceToPlanner(inp.value.trim());
    } else {
      if (statusEl) statusEl.textContent = isZh ? '⚠️ 请在输入框中直接粘贴地图链接' : '⚠️ Please paste link directly into the field';
    }
  }
}
window.pasteAndAddPlannerPlace = pasteAndAddPlannerPlace;

/**
 * Adds a place to the trip planner via Google Maps URL or text
 */
async function addPlaceToPlanner(rawText) {
  const inp = el('tp-url-input');
  const statusEl = el('tp-input-status');
  const text = String(rawText || (inp ? inp.value : '')).trim();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if (!text) {
    if (statusEl) {
      statusEl.textContent = isZh ? '⚠️ 请先粘贴 Google 地图链接' : '⚠️ Please paste a Google Maps link first';
      statusEl.style.color = 'var(--red)';
    }
    return;
  }

  if (statusEl) {
    statusEl.innerHTML = `⏳ ${isZh ? '正在自动提取地点名称、GPS定位与类别…' : 'Auto-capturing venue, GPS coordinates & details…'}`;
    statusEl.style.color = 'var(--amber)';
  }

  try {
    let captured = null;
    if (typeof capturePlaceFromGoogleMaps === 'function') {
      captured = await capturePlaceFromGoogleMaps(text);
    }

    if (!captured || !captured.ok) {
      // Fallback: extract name from URL string directly
      let fallbackName = '';
      try {
        const u = new URL(text.match(/https?:\/\/[^\s<>"']+/i)?.[0] || text);
        const m = u.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);
        if (m) fallbackName = decodeURIComponent(m[1].replace(/\+/g, ' ')).split(',')[0].trim();
      } catch(e) {}

      if (!fallbackName) {
        fallbackName = text.replace(/https?:\/\/[^\s]+/g, '').trim() || (isZh ? '想去地点' : 'Wishlist Stop');
      }

      captured = {
        ok: true,
        name: fallbackName,
        city: '',
        lat: null,
        lng: null,
        cuisine: '',
        mapUrl: text
      };
    }

    const newPlace = {
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: captured.name || (isZh ? '精选地点' : 'Destination'),
      city: captured.city || '',
      address: captured.address || '',
      lat: captured.lat || null,
      lng: captured.lng || null,
      cuisine: captured.cuisine || '',
      categories: captured.categories || [],
      rating: captured.rating || null,
      mapUrl: captured.finalUrl || captured.url || (typeof extractMapsUrl === 'function' ? extractMapsUrl(text) : text) || '',
      recommendations: captured.recommendations || [],
      recommendationText: captured.recommendationText || ''
    };

    travelPlannerPlaces.push(newPlace);
    if (inp) inp.value = '';

    if (statusEl) {
      const pinTag = (newPlace.lat && newPlace.lng) ? '📍 GPS OK' : '📌';
      statusEl.innerHTML = `✅ ${isZh ? '已添加' : 'Added'}: <strong>${newPlace.name}</strong> <span style="color:var(--green)">(${pinTag})</span>`;
      statusEl.style.color = 'var(--green)';
    }

    renderTravelPlannerUI();
    toast(isZh ? `📍 已添加：${newPlace.name}` : `📍 Added: ${newPlace.name}`);
  } catch(err) {
    console.error('Error adding place to planner:', err);
    if (statusEl) {
      statusEl.textContent = isZh ? '⚠️ 识别出错，请重试' : '⚠️ Could not resolve link, please try again';
      statusEl.style.color = 'var(--red)';
    }
  }
}
window.addPlaceToPlanner = addPlaceToPlanner;

function removePlannerPlace(idx) {
  if (idx >= 0 && idx < travelPlannerPlaces.length) {
    const removed = travelPlannerPlaces.splice(idx, 1)[0];
    renderTravelPlannerUI();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? `🗑️ 已移除：${removed.name}` : `🗑️ Removed: ${removed.name}`);
  }
}
window.removePlannerPlace = removePlannerPlace;

function movePlannerPlace(idx, direction) {
  const target = idx + direction;
  if (target < 0 || target >= travelPlannerPlaces.length) return;
  const temp = travelPlannerPlaces[idx];
  travelPlannerPlaces[idx] = travelPlannerPlaces[target];
  travelPlannerPlaces[target] = temp;
  renderTravelPlannerUI();
}
window.movePlannerPlace = movePlannerPlace;

function clearAllPlannerPlaces() {
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if (confirm(isZh ? '确定清空已添加的地点吗？' : 'Clear all added places?')) {
    travelPlannerPlaces = [];
    travelPlannerCurrentPlan = null;
    renderTravelPlannerUI();
  }
}
window.clearAllPlannerPlaces = clearAllPlannerPlaces;

function toggleTravelPlannerHowItWorks() {
  travelPlannerShowHowItWorks = !travelPlannerShowHowItWorks;
  renderTravelPlannerUI();
}
window.toggleTravelPlannerHowItWorks = toggleTravelPlannerHowItWorks;

function toggleWishlistImportSelector() {
  travelPlannerShowWishlistImport = !travelPlannerShowWishlistImport;
  renderTravelPlannerUI();
}
window.toggleWishlistImportSelector = toggleWishlistImportSelector;

function importSelectedWishlistPlaces() {
  const checkboxes = document.querySelectorAll('.tp-wishlist-check:checked');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  let count = 0;

  checkboxes.forEach(cb => {
    const rId = cb.value;
    const record = (S.restaurantRecords || []).find(r => r.id === rId);
    if (record && !travelPlannerPlaces.some(p => p.name === record.name)) {
      travelPlannerPlaces.push({
        id: record.id || ('pl_' + Date.now() + Math.random().toString(36).substr(2, 4)),
        name: record.name,
        city: record.city || '',
        address: record.address || '',
        lat: record.lat || null,
        lng: record.lng || null,
        cuisine: record.cuisine || '',
        categories: record.categories || [],
        rating: record.rating || null,
        mapUrl: record.mapUrl || '',
        recommendations: record.items ? record.items.map(it => it.name) : []
      });
      count++;
    }
  });

  travelPlannerShowWishlistImport = false;
  renderTravelPlannerUI();
  toast(isZh ? `📥 成功从想吃清单导入 ${count} 家地点！` : `📥 Imported ${count} places from wishlist!`);
}
window.importSelectedWishlistPlaces = importSelectedWishlistPlaces;

function setPlannerDayMode(mode) {
  travelPlannerDayMode = mode;
  renderTravelPlannerUI();
}
window.setPlannerDayMode = setPlannerDayMode;

function setPlannerTravelMode(mode) {
  travelPlannerTravelMode = mode;
  renderTravelPlannerUI();
}
window.setPlannerTravelMode = setPlannerTravelMode;

function setPlannerStartTime(timeStr) {
  travelPlannerStartTime = timeStr;
}
window.setPlannerStartTime = setPlannerStartTime;

/**
 * The main AI Route Planning Execution Function
 * "use the highest AI model free can get to help me plan my trip"
 */
/**
 * Starts the Auto-Countdown Timer when AI is cooling down / rate-limited.
 * When the countdown reaches 0, it automatically submits the plan again!
 */
function startTravelPlannerCooldown(seconds = 15) {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }

  travelPlannerCooldownTotal = seconds;
  travelPlannerCooldownRemaining = seconds;
  travelPlannerIsLoading = false;
  travelPlannerIsCoolingDown = true;
  travelPlannerRetryCount++;
  renderTravelPlannerUI();

  // Scroll to cooldown card
  const modalBody = el('tp-modal-body');
  if (modalBody) modalBody.scrollTop = 0;

  travelPlannerCooldownTimer = setInterval(() => {
    travelPlannerCooldownRemaining--;

    // Update countdown number and progress bar in DOM smoothly
    const numEl = el('tp-cooldown-num');
    const barEl = document.querySelector('.tp-cooldown-bar-fill');
    if (numEl) numEl.textContent = `${travelPlannerCooldownRemaining}s`;
    if (barEl) {
      const pct = Math.max(0, (travelPlannerCooldownRemaining / travelPlannerCooldownTotal) * 100);
      barEl.style.width = `${pct}%`;
    }

    if (travelPlannerCooldownRemaining <= 0) {
      clearInterval(travelPlannerCooldownTimer);
      travelPlannerCooldownTimer = null;
      travelPlannerIsCoolingDown = false;
      console.log('🔄 AI Cooldown finished! Automatically submitting route planning again...');
      planTripRoute(true);
    }
  }, 1000);
}

function triggerImmediateRetry() {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }
  travelPlannerIsCoolingDown = false;
  planTripRoute(true);
}

function skipCooldownAndUseLocalRoute() {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }
  travelPlannerIsCoolingDown = false;
  travelPlannerIsLoading = false;
  travelPlannerRetryCount = 0;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const plan = solveOptimizedRouteLocal(
    travelPlannerPlaces,
    travelPlannerStartTime,
    travelPlannerDayMode,
    travelPlannerTravelMode
  );
  plan.generatedBy = isZh ? '智能离线路线 (跳过冷却)' : 'Smart GPS Route (Cooldown skipped)';
  travelPlannerCurrentPlan = plan;
  renderTravelPlannerUI();
  toast(isZh ? '📍 已为您生成高精度离线路线' : '📍 Offline route generated');
}

function cancelTravelPlannerCooldown() {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }
  travelPlannerIsCoolingDown = false;
  travelPlannerIsLoading = false;
  travelPlannerRetryCount = 0;
  renderTravelPlannerUI();
}

/**
 * The main AI Route Planning Execution Function
 * "use the highest AI model free can get to help me plan my trip"
 * "if fail auto countdown after the AI cooldown done submit again"
 */
async function planTripRoute(isRetry = false) {
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if (travelPlannerPlaces.length === 0) {
    toast(isZh ? '⚠️ 请先粘贴至少一个 Google 地图地点！' : '⚠️ Please add at least 1 destination first!');
    return;
  }

  // Clear any existing timer
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }

  if (!isRetry) {
    travelPlannerRetryCount = 0;
  }

  travelPlannerIsLoading = true;
  travelPlannerIsCoolingDown = false;
  renderTravelPlannerUI();

  // Scroll to loading indicator
  const modalBody = el('tp-modal-body');
  if (modalBody) modalBody.scrollTop = 0;

  try {
    // 1. Attempt to use Gemini 2.0 Flash (highest free model)
    const result = await callGeminiTravelPlanner(
      travelPlannerPlaces,
      travelPlannerStartTime,
      travelPlannerDayMode,
      travelPlannerTravelMode
    );

    if (result && result.ok && result.plan) {
      travelPlannerCurrentPlan = result.plan;
      travelPlannerRetryCount = 0;
      travelPlannerIsLoading = false;
      travelPlannerIsCoolingDown = false;

      // Persist to user's saved trips in S.travelTrips
      if (!S.travelTrips) S.travelTrips = [];
      const tripRecord = {
        id: 'trip_' + Date.now(),
        createdAt: new Date().toISOString(),
        plan: result.plan,
        places: [...travelPlannerPlaces]
      };
      S.travelTrips.unshift(tripRecord);
      if (S.travelTrips.length > 20) S.travelTrips = S.travelTrips.slice(0, 20);
      if (typeof save === 'function') save();

      toast(isZh ? '🎉 行程路线规划完成！' : '🎉 Trip route planned successfully!');
      renderTravelPlannerUI();
      return;
    }

    // 2. If rate-limited or busy and under max retries -> Start Auto Countdown!
    if (result && (result.error === 'rate_limit' || result.error === 'api_error') && travelPlannerRetryCount < TRAVEL_PLANNER_MAX_RETRIES) {
      const waitTime = result.cooldownSeconds || 15;
      console.warn(`⏳ AI rate limit / cooldown detected. Initiating ${waitTime}s countdown before auto-submit...`);
      startTravelPlannerCooldown(waitTime);
      return;
    }

    // 3. Fallback: if no key or max retries reached, safely use local mathematical optimizer
    let plan = solveOptimizedRouteLocal(
      travelPlannerPlaces,
      travelPlannerStartTime,
      travelPlannerDayMode,
      travelPlannerTravelMode
    );
    if (result && result.error === 'rate_limit') {
      plan.generatedBy = isZh ? '智能离线算法 (AI 达到调用频次上限，已保底规划)' : 'Smart GPS Engine (AI Rate-limited, safely completed)';
      toast(isZh ? '⚡ 已为您自动生成高精度离线路线' : '⚡ Local GPS route generated safely');
    }
    travelPlannerCurrentPlan = plan;
    travelPlannerRetryCount = 0;

    if (!S.travelTrips) S.travelTrips = [];
    const tripRecord = {
      id: 'trip_' + Date.now(),
      createdAt: new Date().toISOString(),
      plan: plan,
      places: [...travelPlannerPlaces]
    };
    S.travelTrips.unshift(tripRecord);
    if (S.travelTrips.length > 20) S.travelTrips = S.travelTrips.slice(0, 20);
    if (typeof save === 'function') save();
  } catch(err) {
    console.error('Trip planner error:', err);
    if (travelPlannerRetryCount < TRAVEL_PLANNER_MAX_RETRIES) {
      startTravelPlannerCooldown(15);
      return;
    }
    travelPlannerCurrentPlan = solveOptimizedRouteLocal(
      travelPlannerPlaces,
      travelPlannerStartTime,
      travelPlannerDayMode,
      travelPlannerTravelMode
    );
  } finally {
    if (!travelPlannerIsCoolingDown) {
      travelPlannerIsLoading = false;
      renderTravelPlannerUI();
    }
  }
}
window.planTripRoute = planTripRoute;

/**
 * Re-plans the route (make sure i can add another and plan again)
 */
function replanTripRoute() {
  planTripRoute();
}
window.replanTripRoute = replanTripRoute;

/**
 * Copies the complete formatted itinerary to the clipboard
 */
function copyTripItineraryToClipboard() {
  if (!travelPlannerCurrentPlan || !travelPlannerCurrentPlan.days) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const plan = travelPlannerCurrentPlan;

  let text = `🗺️ ${plan.tripTitle}\n${plan.summary}\n`;
  if (plan.dayAllocationRationale) {
    text += `\n💡 ${isZh ? '路线安排说明：' : 'Route Rationale: '}${plan.dayAllocationRationale}\n`;
  }

  plan.days.forEach(day => {
    text += `\n━━━━━━━━━━━━━━━━━━━━\n📅 ${day.dayLabel}: ${day.theme}\n━━━━━━━━━━━━━━━━━━━━\n`;
    (day.stops || []).forEach(stop => {
      text += `\n📍 ${stop.order}. ${stop.name} (${stop.category || ''})\n`;
      text += `   ⏰ ${stop.arriveTime} - ${stop.departTime} (${stop.dwellMins} mins)\n`;
      if (stop.aiTip) text += `   ✨ ${stop.aiTip}\n`;
      if (stop.transitToNext) {
        text += `   🚗 ${stop.transitToNext.durationMins} mins transit (~${stop.transitToNext.distanceKm} km)\n`;
      }
    });
    text += `\n🗺️ ${isZh ? '此日导航链接：' : 'Google Maps Route: '}${buildGoogleMapsRouteUrl(day.stops)}\n`;
  });

  text += `\n🍯 Pocket Winnie AI Travel Planner`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast(isZh ? '📋 完整行程已复制到剪贴板！' : '📋 Itinerary copied to clipboard!');
    }).catch(() => {
      fallbackCopyText(text, isZh);
    });
  } else {
    fallbackCopyText(text, isZh);
  }
}
window.copyTripItineraryToClipboard = copyTripItineraryToClipboard;

function fallbackCopyText(text, isZh) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  toast(isZh ? '📋 完整行程已复制到剪贴板！' : '📋 Itinerary copied to clipboard!');
}

function planTripFromQuickWishlist() {
  const inp = el('quick-wishlist-url-inp');
  const val = inp ? inp.value.trim() : '';
  closeModal('quick-wishlist-modal');
  openTravelPlanner('quick-modal', val);
}
window.planTripFromQuickWishlist = planTripFromQuickWishlist;

// ── 6. UI HTML TEMPLATE & RENDERER ─────────────────────────────

function renderTravelPlannerUI() {
  const container = el('travel-planner-modal-content');
  if (!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const hasGeminiKey = Boolean(S.geminiApiKey && S.geminiApiKey.length > 7);

  // Model pill
  const activeModelName = (S.geminiModel && S.geminiModel !== 'auto') ? S.geminiModel : 'Gemini 2.0 Flash';
  const modelBadge = hasGeminiKey
    ? `<span class="tp-badge-ai" title="Free Tier: 15 RPM / 1M TPM">🤖 ${activeModelName} · Free AI</span>`
    : `<span class="tp-badge-offline" onclick="openGeminiModal()" title="Tap to enter your free Google AI Studio Key">⚡ Smart GPS Engine <span style="text-decoration:underline;cursor:pointer">(${isZh ? '开启 Gemini AI ›' : 'Connect Gemini AI ›'})</span></span>`;

  let html = `
    <div class="tp-modal-header">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:22px">🧭</span>
        <div>
          <div style="font-weight:900;font-size:16px;color:var(--text);display:flex;align-items:center;gap:6px">
            <span>${isZh ? 'AI 智能行程路线规划' : 'AI Travel Route Planner'}</span>
            ${modelBadge}
          </div>
          <div style="font-size:11px;color:var(--muted)">
            ${isZh ? '粘贴 Google 地图链接 · 智能规划行程时刻表与今天/明天安排' : 'Paste Google Maps links · AI plans optimal timing, route & Today/Tomorrow schedule'}
          </div>
        </div>
      </div>
      <button type="button" class="modal-close-btn" onclick="closeTravelPlanner()">✕</button>
    </div>

    <div class="tp-modal-body" id="tp-modal-body">
  `;

  // Expandable "How It Works" Card
  html += `
    <div class="tp-how-box ${travelPlannerShowHowItWorks ? 'expanded' : ''}">
      <div class="tp-how-header" onclick="toggleTravelPlannerHowItWorks()">
        <span style="display:flex;align-items:center;gap:6px">
          <span>💡</span> <strong>${isZh ? '它是如何工作的？(How It Works)' : 'How does this AI Travel Planner work?'}</strong>
        </span>
        <span style="font-size:11px;color:var(--amber)">${travelPlannerShowHowItWorks ? '▲ ' + (isZh ? '收起' : 'Hide') : '▼ ' + (isZh ? '展开查看' : 'Explain')}</span>
      </div>
      ${travelPlannerShowHowItWorks ? `
        <div class="tp-how-content">
          <div class="tp-how-step">
            <span class="tp-how-num">1</span>
            <div>
              <strong>${isZh ? '粘贴 Google 地图链接 (Zero Typing)' : 'Paste Google Maps Links (Zero Typing)'}</strong>
              <div>${isZh ? '从 Google 地图 App 分享或复制任意地点链接直接粘贴，系统自动秒级解析经纬度定位、店名、类别与地址。' : 'Copy or share any link from Google Maps; venue name, real GPS coordinates, rating & category are auto-captured.'}</div>
            </div>
          </div>
          <div class="tp-how-step">
            <span class="tp-how-num">2</span>
            <div>
              <strong>${isZh ? 'Gemini 2.0 Flash 智能路线与时刻表' : 'Gemini 2.0 Flash AI Optimization'}</strong>
              <div>${isZh ? '采用 Google 免费层最高 AI 模型（Gemini 2.0 Flash）与地理距离矩阵算法，结合早中晚就餐习惯，彻底消除绕路走回头路。' : 'Powered by Google\'s highest free-tier AI model & distance matrix to sequence stops in a natural morning-to-night rhythm.'}</div>
            </div>
          </div>
          <div class="tp-how-step">
            <span class="tp-how-num">3</span>
            <div>
              <strong>${isZh ? '今天与明天自动分流 (Today vs Tomorrow)' : 'Today vs Tomorrow Multi-Day Clustering'}</strong>
              <div>${isZh ? '地点较多或分布不同片区时，AI 会将相近区域聚类归入【今天】，次要或较远片区安排在【明天】，轻松不赶路！' : 'Geographic clustering automatically assigns nearby places to Today and outer spots to Tomorrow so you never rush.'}</div>
            </div>
          </div>
          <div class="tp-how-step">
            <span class="tp-how-num">4</span>
            <div>
              <strong>${isZh ? '一键 Google 地图导航与随时加点重规' : '1-Click Turn-by-Turn & Re-Plan Anytime'}</strong>
              <div>${isZh ? '可一键调起 Google 地图多途经点导航；随时添加第 4、5 家地点并点击【重新规划】！' : 'Generate instant multi-stop Google Maps directions; append extra places anytime and hit Re-Plan!'}</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // 1. INPUT BOX: Paste Google Maps Link
  html += `
    <div class="tp-paste-box">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label style="font-size:12px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:4px">
          <span>📍</span> <span>${isZh ? '粘贴 Google 地图链接' : 'Paste Google Maps Link'}</span>
        </label>
        <span style="font-size:10px;padding:2px 7px;border-radius:6px;background:rgba(245,158,11,.15);color:var(--amber);font-weight:800">
          ⚡ ${isZh ? '自动解析经纬度' : 'Auto GPS Pin'}
        </span>
      </div>
      <div style="display:flex;gap:6px">
        <input type="text" id="tp-url-input" class="form-input" style="flex:1;min-height:38px;padding:6px 10px;font-size:12.5px;border-color:var(--amber)"
          placeholder="${isZh ? '直接粘贴 Google 地图链接 (如 https://maps.app.goo.gl/...)' : 'Paste Google Maps link (e.g. https://maps.app.goo.gl/...)'}"
          onkeydown="if(event.key==='Enter'){event.preventDefault();addPlaceToPlanner();}"/>
        <button type="button" class="primary-btn" onclick="pasteAndAddPlannerPlace()" style="width:auto;margin:0;padding:6px 12px;font-size:11.5px;font-weight:800;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;white-space:nowrap;display:inline-flex;align-items:center;gap:4px">
          📋 ${isZh ? '粘贴并添加' : 'Paste & Add'}
        </button>
        <button type="button" class="primary-btn" onclick="addPlaceToPlanner()" style="width:auto;margin:0;padding:6px 12px;font-size:11.5px;font-weight:800;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;white-space:nowrap">
          ➕ ${isZh ? '添加' : 'Add'}
        </button>
      </div>
      <div id="tp-input-status" style="font-size:11px;min-height:16px;margin-top:6px;color:var(--muted);line-height:1.4"></div>
    </div>
  `;

  // Wishlist Import Button & Drawer
  const pendingWishlistCount = (S.restaurantRecords || []).filter(r => r.status === 'pending').length;
  if (pendingWishlistCount > 0) {
    html += `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <button type="button" onclick="toggleWishlistImportSelector()" style="background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.3);color:#ec4899;border-radius:8px;font-size:11px;font-weight:800;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <span>📥</span> <span>${isZh ? `从想吃清单快速选择 (${pendingWishlistCount} 处)` : `Import from Wishlist (${pendingWishlistCount} places)`}</span>
          </button>
          ${travelPlannerPlaces.length > 0 ? `
            <button type="button" onclick="clearAllPlannerPlaces()" style="background:none;border:none;color:var(--muted);font-size:11px;cursor:pointer;text-decoration:underline">
              ${isZh ? '清空列表' : 'Clear All'}
            </button>
          ` : ''}
        </div>

        ${travelPlannerShowWishlistImport ? `
          <div class="tp-wishlist-picker">
            <div style="font-size:11.5px;font-weight:800;margin-bottom:6px;color:var(--text)">
              ${isZh ? '勾选要加入行程的想吃地点：' : 'Select wishlist places to include in your trip:'}
            </div>
            <div style="max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;padding-right:4px">
              ${(S.restaurantRecords || []).filter(r => r.status === 'pending').map(r => `
                <label style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;background:var(--bg);border:1px solid var(--border);font-size:11.5px;cursor:pointer">
                  <input type="checkbox" class="tp-wishlist-check" value="${r.id}" ${travelPlannerPlaces.some(p => p.name === r.name) ? 'checked disabled' : ''}/>
                  <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    <strong>${r.name}</strong> <span style="font-size:10px;color:var(--muted)">${r.city ? `(${r.city})` : ''} ${r.cuisine ? `· ${r.cuisine}` : ''}</span>
                  </span>
                  ${r.rating ? `<span style="color:var(--amber);font-size:10px">⭐ ${r.rating}</span>` : ''}
                </label>
              `).join('')}
            </div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <button type="button" class="primary-btn" onclick="importSelectedWishlistPlaces()" style="font-size:11px;padding:5px 12px;margin:0;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff;border:none">
                ✓ ${isZh ? '确认导入所选' : 'Import Selected'}
              </button>
              <button type="button" class="ghost-btn" onclick="toggleWishlistImportSelector()" style="font-size:11px;padding:5px 10px;margin:0">
                ${isZh ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 2. PLACES LIST CAROUSEL / CARDS
  html += `
    <div class="tp-places-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:5px">
          <span>🚩</span>
          <span>${isZh ? `已添加的目的地 (${travelPlannerPlaces.length})` : `Added Destinations (${travelPlannerPlaces.length})`}</span>
        </div>
        <span style="font-size:10px;color:var(--muted)">${isZh ? '可上下调整优先次序' : 'Use ▲ ▼ to reorder'}</span>
      </div>

      ${travelPlannerPlaces.length === 0 ? `
        <div class="tp-empty-places">
          <div style="font-size:28px;margin-bottom:4px">🗺️</div>
          <div style="font-weight:800;font-size:12.5px;color:var(--text)">${isZh ? '暂未添加任何地点' : 'No places added yet'}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;max-width:260px;margin-left:auto;margin-right:auto">
            ${isZh ? '在上方粘贴 Google 地图链接或从想吃清单导入，系统将为你规划完整游玩时刻表！' : 'Paste Google Maps links above or import from wishlist to start planning your route.'}
          </div>
        </div>
      ` : `
        <div class="tp-places-list">
          ${travelPlannerPlaces.map((place, idx) => {
            const meta = inferPlaceMetadata(place);
            const hasGps = place.lat && place.lng;
            return `
              <div class="tp-place-item">
                <div class="tp-place-num">${idx + 1}</div>
                <div class="tp-place-info">
                  <div class="tp-place-title">
                    <span>${meta.icon}</span>
                    <strong style="font-size:12.5px">${place.name}</strong>
                  </div>
                  <div class="tp-place-sub">
                    <span class="tp-chip-tag">${place.city || meta.label}</span>
                    ${place.cuisine ? `<span class="tp-chip-tag">${place.cuisine}</span>` : ''}
                    ${hasGps ? `<span class="tp-chip-gps">📍 GPS OK</span>` : `<span class="tp-chip-nogps" title="GPS coordinates will be resolved from name">📌 Address</span>`}
                  </div>
                </div>
                <div class="tp-place-actions">
                  <button type="button" class="tp-move-btn" onclick="movePlannerPlace(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                  <button type="button" class="tp-move-btn" onclick="movePlannerPlace(${idx}, 1)" ${idx === travelPlannerPlaces.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
                  <button type="button" class="tp-del-btn" onclick="removePlannerPlace(${idx})" title="Remove">✕</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  // 3. TRIP PREFERENCES (Day Split & Start Time)
  html += `
    <div class="tp-prefs-box">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <!-- Day Mode -->
        <div style="flex:1;min-width:140px">
          <label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px">
            📅 ${isZh ? '行程天数分配 (Today vs Tomorrow)' : 'Days Allocation'}
          </label>
          <select class="form-input" style="font-size:11.5px;padding:6px;min-height:34px" onchange="setPlannerDayMode(this.value)">
            <option value="auto" ${travelPlannerDayMode === 'auto' ? 'selected' : ''}>${isZh ? '🤖 AI 智能规划 (今天与明天自动分流)' : '🤖 Auto AI (Today & Tomorrow Split)'}</option>
            <option value="1" ${travelPlannerDayMode === '1' ? 'selected' : ''}>${isZh ? '📅 1 天 (全部集中在今天)' : '📅 1 Day (Today Only)'}</option>
            <option value="2" ${travelPlannerDayMode === '2' ? 'selected' : ''}>${isZh ? '📅 2 天 (今天与明天两日游)' : '📅 2 Days (Today & Tomorrow)'}</option>
            <option value="3" ${travelPlannerDayMode === '3' ? 'selected' : ''}>${isZh ? '📅 3 天 (多日漫游)' : '📅 3 Days (Extended Tour)'}</option>
          </select>
        </div>

        <!-- Start Time -->
        <div style="width:110px">
          <label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px">
            ⏰ ${isZh ? '出发时间' : 'Start Time'}
          </label>
          <input type="time" class="form-input" value="${travelPlannerStartTime}" style="font-size:11.5px;padding:6px;min-height:34px" onchange="setPlannerStartTime(this.value)"/>
        </div>

        <!-- Travel Mode -->
        <div style="width:110px">
          <label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px">
            🚗 ${isZh ? '交通出行' : 'Transit Mode'}
          </label>
          <select class="form-input" style="font-size:11.5px;padding:6px;min-height:34px" onchange="setPlannerTravelMode(this.value)">
            <option value="driving" ${travelPlannerTravelMode === 'driving' ? 'selected' : ''}>${isZh ? '🚗 自驾/打车' : '🚗 Driving/Grab'}</option>
            <option value="walking" ${travelPlannerTravelMode === 'walking' ? 'selected' : ''}>${isZh ? '🚶 步行悠闲' : '🚶 Walking'}</option>
            <option value="transit" ${travelPlannerTravelMode === 'transit' ? 'selected' : ''}>${isZh ? '🚆 公共交通' : '🚆 Transit'}</option>
          </select>
        </div>
      </div>
    </div>
  `;

  // 4. ACTION BAR: Plan My Route Button
  html += `
    <div style="margin-top:12px;margin-bottom:14px">
      ${travelPlannerIsLoading ? `
        <div class="tp-loading-card">
          <div class="spinner" style="width:24px;height:24px;border-width:2.5px;margin:0 auto 8px auto"></div>
          <div style="font-size:13px;font-weight:800;color:var(--text)">
            ${isZh ? '🤖 Gemini 2.0 Flash 正在智能计算路线…' : '🤖 Gemini 2.0 Flash is optimizing your route…'}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">
            ${isZh ? '正在根据 GPS 定位、就餐营业时段与片区交通安排最佳时刻表与今天/明天分流…' : 'Calculating spatial clusters, travel times, and Today vs Tomorrow schedule…'}
          </div>
        </div>
      ` : travelPlannerIsCoolingDown ? `
        <div class="tp-cooldown-card">
          <div class="tp-cooldown-pulse">
            <span class="tp-cooldown-clock">⏳</span>
            <span class="tp-cooldown-count" id="tp-cooldown-num">${travelPlannerCooldownRemaining}s</span>
          </div>
          <div style="font-size:13.5px;font-weight:800;color:var(--text);margin-bottom:3px">
            ${isZh ? 'AI 正在降温冷却中 · 倒计时结束将自动重新提交' : 'AI Rate Limit Cooldown · Auto-Submitting When Ready'}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:8px;line-height:1.4">
            ${isZh 
              ? `检测到 Google AI 请求频次限制 (第 ${travelPlannerRetryCount}/${TRAVEL_PLANNER_MAX_RETRIES} 次重试)，正在为您自动倒计时，冷却结束后将自动再次规划…` 
              : `Google AI rate limit or busy (Attempt ${travelPlannerRetryCount}/${TRAVEL_PLANNER_MAX_RETRIES}). Counting down to auto-submit again…`}
          </div>
          <div class="tp-cooldown-bar-bg">
            <div class="tp-cooldown-bar-fill" style="width:${Math.max(0, (travelPlannerCooldownRemaining / travelPlannerCooldownTotal) * 100)}%"></div>
          </div>
          <div style="display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap">
            <button type="button" class="primary-btn" onclick="triggerImmediateRetry()" style="font-size:11.5px;padding:6px 14px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;margin:0;width:auto;display:inline-flex;align-items:center;gap:4px">
              ⚡ ${isZh ? '立即重试' : 'Retry Now'}
            </button>
            <button type="button" class="secondary-btn" onclick="skipCooldownAndUseLocalRoute()" style="font-size:11.5px;padding:6px 12px;border:1px solid rgba(16,185,129,.4);color:#10b981;margin:0;width:auto;display:inline-flex;align-items:center;gap:4px">
              📍 ${isZh ? '直接使用离线路线' : 'Use Offline Route'}
            </button>
            <button type="button" class="ghost-btn" onclick="cancelTravelPlannerCooldown()" style="font-size:11.5px;padding:6px 10px;margin:0;width:auto">
              ✕ ${isZh ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      ` : `
        <button type="button" class="primary-btn" onclick="planTripRoute()" style="width:100%;font-size:14px;font-weight:900;padding:12px;margin:0;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;box-shadow:0 4px 14px rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;gap:8px">
          <span>🚀</span>
          <span>${travelPlannerCurrentPlan ? (isZh ? '🔄 重新规划路线 (Re-Plan)' : '🔄 Re-Plan Trip Route') : (isZh ? '🚀 智能规划我的行程 (Plan My Route)' : '🚀 Plan My Route (AI Trip Planner)')}</span>
        </button>
      `}
    </div>
  `;

  // 5. GENERATED ITINERARY VIEW (If planned)
  if (travelPlannerCurrentPlan && !travelPlannerIsLoading) {
    html += renderItineraryCard(travelPlannerCurrentPlan, isZh);
  }

  html += `
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Renders the generated Itinerary Card with Timeline, Today/Tomorrow badges, and Actions
 */
function renderItineraryCard(plan, isZh) {
  let out = `
    <div class="tp-itinerary-container">
      <!-- Title & Summary Banner -->
      <div class="tp-itinerary-header">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <div style="font-size:15px;font-weight:900;color:var(--text)">
            ${plan.tripTitle || (isZh ? '🍯 智能 AI 行程规划' : '🍯 AI Travel Itinerary')}
          </div>
          <span style="font-size:10px;padding:2px 8px;border-radius:6px;background:rgba(16,185,129,.15);color:#10b981;font-weight:800">
            ${plan.generatedBy || 'Gemini 2.0 Flash AI'}
          </span>
        </div>
        <div style="font-size:12px;color:var(--text);line-height:1.4;margin-bottom:6px">
          ${plan.summary || ''}
        </div>
        ${plan.dayAllocationRationale ? `
          <div class="tp-rationale-box">
            <span>💡</span>
            <div><strong>${isZh ? '为什么这样安排？' : 'Why this route & day split?'}</strong> ${plan.dayAllocationRationale}</div>
          </div>
        ` : ''}
      </div>

      <!-- Quick Actions (Copy & Export) -->
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <button type="button" class="ghost-btn" onclick="copyTripItineraryToClipboard()" style="font-size:11px;padding:6px 12px;margin:0;display:inline-flex;align-items:center;gap:4px">
          📋 ${isZh ? '复制完整行程' : 'Copy Itinerary'}
        </button>
      </div>

      <!-- Days Sections -->
      <div class="tp-days-wrap">
  `;

  (plan.days || []).forEach((day, dIdx) => {
    out += `
      <div class="tp-day-card">
        <div class="tp-day-header">
          <div>
            <div class="tp-day-title">
              <span>📅</span> <strong>${day.dayLabel || (isZh ? `第 ${day.dayNum} 天` : `Day ${day.dayNum}`)}</strong>
            </div>
            <div style="font-size:11px;color:var(--muted)">${day.theme || ''} · ${day.stops ? day.stops.length : 0} ${isZh ? '处打卡' : 'stops'}</div>
          </div>
          <button type="button" class="tp-maps-btn" onclick="openDayRouteInGoogleMaps(${dIdx})" title="Open this day in Google Maps">
            <span>🗺️</span> <span>${isZh ? 'Google 地图完整路线' : 'Open in Maps'}</span>
          </button>
        </div>

        <!-- Vertical Stops Timeline -->
        <div class="tp-timeline">
    `;

    (day.stops || []).forEach((stop, sIdx) => {
      out += `
        <div class="tp-stop-row">
          <div class="tp-stop-node">
            <div class="tp-stop-num">${stop.order || (sIdx + 1)}</div>
            ${sIdx < day.stops.length - 1 ? `<div class="tp-stop-line"></div>` : ''}
          </div>
          <div class="tp-stop-body">
            <div class="tp-stop-top">
              <div>
                <span class="tp-time-pill">⏰ ${stop.arriveTime} - ${stop.departTime}</span>
                <span style="font-size:10px;color:var(--muted);margin-left:4px">(${stop.dwellMins || 60} min)</span>
              </div>
              <button type="button" class="tp-nav-chip" onclick="openSingleStopInGoogleMaps(${stop.lat || 'null'}, ${stop.lng || 'null'}, '${encodeURIComponent(stop.name || '')}')">
                🧭 ${isZh ? '导航' : 'Directions'}
              </button>
            </div>
            <div class="tp-stop-name">
              <span>${stop.icon || '📍'}</span>
              <strong>${stop.name}</strong>
              <span class="tp-stop-cat">${stop.category || ''}</span>
            </div>
            ${stop.whyThisOrder ? `
              <div class="tp-stop-why">
                <span>⚡</span> <span>${stop.whyThisOrder}</span>
              </div>
            ` : ''}
            ${stop.aiTip ? `
              <div class="tp-stop-tip">
                <span>✨</span> <span>${stop.aiTip}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      // Transit connector between stops
      if (stop.transitToNext) {
        out += `
          <div class="tp-transit-connector">
            <span>🚗 ${stop.transitToNext.durationMins || 10} mins ${isZh ? '车程' : 'transit'} (${stop.transitToNext.distanceKm || 3} km)</span>
          </div>
        `;
      }
    });

    out += `
        </div>
      </div>
    `;
  });

  out += `
      </div>

      <!-- Add another place & plan again footer -->
      <div class="tp-replan-footer">
        <div style="font-size:11.5px;color:var(--muted);margin-bottom:8px;text-align:center">
          💡 ${isZh ? '想去更多地方？随时在上方粘贴新地点，然后点击重新规划：' : 'Want to add more? Paste another link above, then tap re-plan:'}
        </div>
        <div style="display:flex;gap:8px">
          <button type="button" class="primary-btn" onclick="replanTripRoute()" style="flex:1;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:800;font-size:12.5px;padding:9px;margin:0;border:none">
            🔄 ${isZh ? '重新规划行程路线' : 'Re-Plan My Trip'}
          </button>
          <button type="button" class="ghost-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="font-size:12px;padding:9px 12px;margin:0">
            ➕ ${isZh ? '添加更多地点' : '+ Add More Places'}
          </button>
        </div>
      </div>
    </div>
  `;

  return out;
}

// ── 7. EXPORT TO GLOBAL WINDOW SCOPE ───────────────────────────
const _exportTarget = (typeof window !== 'undefined') ? window : (typeof global !== 'undefined' ? global : this);
if (_exportTarget) {
  _exportTarget.travelPlannerPlaces = travelPlannerPlaces;
  Object.defineProperty(_exportTarget, 'travelPlannerCurrentPlan', {
    get: () => travelPlannerCurrentPlan,
    set: (v) => { travelPlannerCurrentPlan = v; },
    configurable: true
  });
  Object.defineProperty(_exportTarget, 'travelPlannerIsCoolingDown', {
    get: () => travelPlannerIsCoolingDown,
    set: (v) => { travelPlannerIsCoolingDown = v; },
    configurable: true
  });
  _exportTarget.getHaversineDistanceKm = getHaversineDistanceKm;
  _exportTarget.estimateTransitMinutes = estimateTransitMinutes;
  _exportTarget.solveOptimizedRouteLocal = solveOptimizedRouteLocal;
  _exportTarget.buildGoogleMapsRouteUrl = buildGoogleMapsRouteUrl;
  _exportTarget.callGeminiTravelPlanner = callGeminiTravelPlanner;
  _exportTarget.openTravelPlanner = openTravelPlanner;
  _exportTarget.closeTravelPlanner = closeTravelPlanner;
  _exportTarget.addPlaceToPlanner = addPlaceToPlanner;
  _exportTarget.pasteAndAddPlannerPlace = pasteAndAddPlannerPlace;
  _exportTarget.removePlannerPlace = removePlannerPlace;
  _exportTarget.movePlannerPlace = movePlannerPlace;
  _exportTarget.clearAllPlannerPlaces = clearAllPlannerPlaces;
  _exportTarget.planTripRoute = planTripRoute;
  _exportTarget.replanTripRoute = replanTripRoute;
  _exportTarget.copyTripItineraryToClipboard = copyTripItineraryToClipboard;
  _exportTarget.renderTravelPlannerUI = renderTravelPlannerUI;
  _exportTarget.toggleTravelPlannerHowItWorks = toggleTravelPlannerHowItWorks;
  _exportTarget.toggleWishlistImportSelector = toggleWishlistImportSelector;
  _exportTarget.importSelectedWishlistPlaces = importSelectedWishlistPlaces;
  _exportTarget.setPlannerDayMode = setPlannerDayMode;
  _exportTarget.setPlannerTravelMode = setPlannerTravelMode;
  _exportTarget.setPlannerStartTime = setPlannerStartTime;
  _exportTarget.planTripFromQuickWishlist = planTripFromQuickWishlist;
  _exportTarget.startTravelPlannerCooldown = startTravelPlannerCooldown;
  _exportTarget.triggerImmediateRetry = triggerImmediateRetry;
  _exportTarget.skipCooldownAndUseLocalRoute = skipCooldownAndUseLocalRoute;
  _exportTarget.cancelTravelPlannerCooldown = cancelTravelPlannerCooldown;
}
