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
let travelPlannerCooldownTotal = 40;
let travelPlannerRetryCount = 0;
const TRAVEL_PLANNER_MAX_RETRIES = 10;
let travelPlannerLastStatus = { html: '', color: '' };

const HOTEL_REGEX = /(?:\bhotels?\b|\bresorts?\b|\binns?\b|\bhostels?\b|\bmotels?\b|\bb&b\b|\bhomestays?\b|\bguesthouses?\b|guest\s*house|\bsuites?\b|\blodges?\b|\bvillas?\b|\bchalets?\b|serviced\s*apartments?|\bresidences?\b|\bairbnb\b|check-?in|酒店|宾馆|旅馆|民宿|度假村|客栈|青旅|\bwestin\b|\bhilton\b|\bmarriott\b|\bhyatt\b|shangri-?la|\bsheraton\b|\bintercontinental\b|ritz-?carlton|four\s*seasons|\bnovotel\b|\bibis\b|\bradisson\b|\bkempinski\b|\bpullman\b|le\s*meridien|st\\.?\s*regis|\brenaissance\b|crowne\s*plaza|\bmercure\b|\bswissotel\b|\baloft\b|\balila\b|banyan\s*tree|\bsofitel\b|\banantara\b|\bcitizenm\b|\btravelodge\b|tune\s*hotel|zen\s*rooms|\boyo\b)/i;

/**
 * Persists planner places and current plan to S state and localStorage
 */
function savePlannerPlaces() {
  if (typeof S !== 'undefined' && S) {
    S.travelPlannerPlaces = travelPlannerPlaces;
    S.travelPlannerCurrentPlan = travelPlannerCurrentPlan;
    S.travelPlannerDayMode = travelPlannerDayMode;
    S.travelPlannerStartTime = travelPlannerStartTime;
    S.travelPlannerTravelMode = travelPlannerTravelMode;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pw_travel_planner_places', JSON.stringify(travelPlannerPlaces));
      if (travelPlannerCurrentPlan) {
        localStorage.setItem('pw_travel_planner_current_plan', JSON.stringify(travelPlannerCurrentPlan));
      } else {
        localStorage.removeItem('pw_travel_planner_current_plan');
      }
      localStorage.setItem('pw_travel_planner_prefs', JSON.stringify({
        dayMode: travelPlannerDayMode,
        startTime: travelPlannerStartTime,
        travelMode: travelPlannerTravelMode
      }));
    }
  } catch(e) {
    console.warn('Could not save planner places to localStorage:', e);
  }
  if (typeof save === 'function') {
    try { save(); } catch(e) {}
  }
}

/**
 * Loads planner places and current plan from S state or localStorage
 */
function loadPlannerPlaces() {
  try {
    if (typeof S !== 'undefined' && S && Array.isArray(S.travelPlannerPlaces) && S.travelPlannerPlaces.length > 0) {
      travelPlannerPlaces.length = 0;
      travelPlannerPlaces.push(...S.travelPlannerPlaces);
      if (S.travelPlannerCurrentPlan) travelPlannerCurrentPlan = S.travelPlannerCurrentPlan;
      if (S.travelPlannerDayMode) travelPlannerDayMode = S.travelPlannerDayMode;
      if (S.travelPlannerStartTime) travelPlannerStartTime = S.travelPlannerStartTime;
      if (S.travelPlannerTravelMode) travelPlannerTravelMode = S.travelPlannerTravelMode;
      return;
    }
    if (typeof localStorage !== 'undefined') {
      const rawPlaces = localStorage.getItem('pw_travel_planner_places');
      if (rawPlaces) {
        const parsed = JSON.parse(rawPlaces);
        if (Array.isArray(parsed) && parsed.length > 0) {
          travelPlannerPlaces.length = 0;
          travelPlannerPlaces.push(...parsed);
          if (typeof S !== 'undefined' && S) S.travelPlannerPlaces = travelPlannerPlaces;
        }
      }
      const rawPlan = localStorage.getItem('pw_travel_planner_current_plan');
      if (rawPlan) {
        const parsedPlan = JSON.parse(rawPlan);
        if (parsedPlan && parsedPlan.days) {
          travelPlannerCurrentPlan = parsedPlan;
          if (typeof S !== 'undefined' && S) S.travelPlannerCurrentPlan = travelPlannerCurrentPlan;
        }
      }
      const rawPrefs = localStorage.getItem('pw_travel_planner_prefs');
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs);
        if (prefs.dayMode) travelPlannerDayMode = prefs.dayMode;
        if (prefs.startTime) travelPlannerStartTime = prefs.startTime;
        if (prefs.travelMode) travelPlannerTravelMode = prefs.travelMode;
      }
    }
  } catch(e) {
    console.warn('Could not load planner places from localStorage:', e);
  }
}
// Initial load on module load
loadPlannerPlaces();

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
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const text = `${place.name || ''} ${place.cuisine || ''} ${(place.categories || []).join(' ')} ${place.notes || ''}`.toLowerCase();
  
  // 🏨 Hotel / Accommodation Check-in (Slot 0 = highest priority, check in first!)
  if (HOTEL_REGEX.test(text)) {
    return { type: 'hotel', slot: 0, dwellMins: 45, icon: '🏨', label: isZh ? '酒店入住 (Hotel Check-in)' : 'Hotel Check-in' };
  }
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

  // 🏨 Ensure hotel check-in is ALWAYS in Day 1 (first day) so the traveler checks in first
  if (dayGroups.length > 1) {
    for (let d = 1; d < dayGroups.length; d++) {
      const hIdx = dayGroups[d].findIndex(p => p.type === 'hotel');
      if (hIdx !== -1) {
        const hotel = dayGroups[d].splice(hIdx, 1)[0];
        dayGroups[0].unshift(hotel);
      }
    }
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
  if (stop.type === 'hotel' || (idx === 0 && stop.type === 'hotel')) {
    return isZh 
      ? '🏨 行程第一站：优先前往酒店办理 Check-in 入住与寄存行李，轻松无负担出发！' 
      : '🏨 1st Stop: Hotel check-in & luggage drop-off first to explore freely!';
  }
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
   - 🏨 HOTEL CHECK-IN PRIORITY (FIRST STOP):
     * If the places include any hotel, resort, inn, hostel, homestay, Airbnb, or accommodation, SCHEDULE IT AS STOP #1 (THE VERY FIRST STOP) ON DAY 1!
     * The traveler must check in and drop off heavy luggage first before visiting sights, cafes, or dining.
     * The rest of the itinerary starts from this hotel.
     * In whyThisOrder, explain: "1st Stop: Hotel check-in and drop luggage first".
     * In aiTip, mention: "Check in / drop luggage at concierge & freshen up".
   - Respect natural daily rhythm for remaining stops:
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
    let cooldownSec = res?.retryAfterSeconds || 40;
    const matchSec = lastErr.match(/retry(?:ing)? in (\d+)(?:\.\d+)?s/i) || lastErr.match(/wait (\d+)s/i);
    if (matchSec && Number(matchSec[1])) {
      cooldownSec = Math.min(75, Math.max(35, parseInt(matchSec[1], 10)));
    } else {
      cooldownSec = 40; // User explicitly requested longer waiting time
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
      cooldownSeconds: 40
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

  loadPlannerPlaces();
  // Only seed from wishlist if brand new user (no saved places ever in localStorage)
  const neverSavedBefore = (typeof localStorage !== 'undefined' && localStorage.getItem('pw_travel_planner_places') === null);
  if (neverSavedBefore && travelPlannerPlaces.length === 0 && Array.isArray(S.restaurantRecords)) {
    const pending = S.restaurantRecords.filter(r => r.status === 'pending');
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
      savePlannerPlaces();
    }
  }

  // When opened from 'more' hubs, 'passport' page, or tab requests: route directly to dedicated tab!
  if (source === 'more' || source === 'passport' || source === 'tab') {
    if (typeof go === 'function') go('passport');
    if (typeof filterPassportPageStatus === 'function') filterPassportPageStatus('trip');
    if (initialLink && String(initialLink).trim()) {
      setTimeout(() => addPlaceToPlanner(initialLink.trim()), 100);
    }
    return;
  }

  // If user passed a link directly from modal source
  if (initialLink && String(initialLink).trim()) {
    openModal('travel-planner-modal');
    renderTravelPlannerUI();
    await addPlaceToPlanner(initialLink.trim());
    return;
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

function setPlannerStatus(html, color = 'var(--muted)') {
  travelPlannerLastStatus = { html, color };
  const els = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') ? document.querySelectorAll('.tp-input-status, #tp-input-status') : [];
  els.forEach(el => {
    el.innerHTML = html;
    el.style.color = color;
  });
}

function getPlannerUrlInput() {
  const inputs = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') ? document.querySelectorAll('.tp-url-input, #tp-url-input') : [];
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value && inputs[i].value.trim()) return inputs[i];
  }
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].offsetParent !== null) return inputs[i];
  }
  return inputs[0] || (typeof el === 'function' ? el('tp-url-input') : null);
}

function getPlannerStatusEl() {
  const els = document.querySelectorAll('.tp-input-status, #tp-input-status');
  for (let i = 0; i < els.length; i++) {
    if (els[i].offsetParent !== null) return els[i];
  }
  return els[0] || (typeof el === 'function' ? el('tp-input-status') : null);
}

async function pasteAndAddPlannerPlace() {
  const inp = getPlannerUrlInput();
  const statusEl = getPlannerStatusEl();
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

/**
 * Geocodes a place name to GPS coordinates via OpenStreetMap Nominatim
 */
async function geocodePlaceByName(name, city = '') {
  if (!name || name.length < 2) return null;
  const q = [name, city].filter(Boolean).join(', ');
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q), {
      headers: { 'User-Agent': 'PocketWinnie-TravelPlanner/4.6' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].lat && data[0].lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          city: city || (data[0].display_name ? data[0].display_name.split(',')[1]?.trim() : '')
        };
      }
    }
  } catch(e) {}
  return null;
}
window.geocodePlaceByName = geocodePlaceByName;

/**
 * Resolves venue name & GPS from Google Maps link or text using Gemini AI
 */
async function resolvePlaceViaGemini(inputQuery) {
  if (!S || !S.geminiApiKey || S.geminiApiKey.length < 8) return null;
  try {
    const prompt = 'Identify this venue or Google Maps location query: "' + inputQuery + '". Return ONLY a valid single-line JSON object: {"name":"Exact Venue Name","city":"City","lat":3.123,"lng":101.456,"cuisine":"Category"}';
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + S.geminiApiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (res.ok) {
      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
      const p = JSON.parse(cleanJson);
      if (p && p.name && !/Malaysia Restaurant Specialties/i.test(p.name)) {
        return {
          name: p.name,
          city: p.city || '',
          lat: (p.lat && isFinite(p.lat)) ? parseFloat(p.lat) : null,
          lng: (p.lng && isFinite(p.lng)) ? parseFloat(p.lng) : null,
          cuisine: p.cuisine || ''
        };
      }
    }
  } catch(e) {}
  return null;
}
window.resolvePlaceViaGemini = resolvePlaceViaGemini;

/**
 * Allows the user to tap and edit a place name directly
 */
function editPlannerPlaceName(idx) {
  if (idx < 0 || idx >= travelPlannerPlaces.length) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const current = travelPlannerPlaces[idx];
  const newName = prompt(isZh ? '修改目的地名称：' : 'Edit destination name:', current.name);
  if (newName && newName.trim() && newName.trim() !== current.name) {
    current.name = newName.trim();
    if (!current.lat || !current.lng) {
      geocodePlaceByName(current.name, current.city).then(geo => {
        if (geo) {
          current.lat = geo.lat;
          current.lng = geo.lng;
          if (geo.city && !current.city) current.city = geo.city;
          renderTravelPlannerUI();
        }
      });
    }
    savePlannerPlaces();
    renderTravelPlannerUI();
    if (typeof toast === 'function') toast(isZh ? ('✏️ 已重命名为：' + current.name) : ('✏️ Renamed to: ' + current.name));
  }
}
window.editPlannerPlaceName = editPlannerPlaceName;

async function addPlaceToPlanner(rawText) {
  const inp = getPlannerUrlInput();
  const statusEl = getPlannerStatusEl();
  const text = String(rawText || (inp ? inp.value : '')).trim();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if (!text) {
    setPlannerStatus(isZh ? '⚠️ 请先粘贴 Google 地图链接或输入地点' : '⚠️ Please paste a Google Maps link or enter a place name first', 'var(--red)');
    return;
  }

  setPlannerStatus(`⏳ ${isZh ? '正在自动提取地点名称、GPS定位与类别…' : 'Auto-capturing venue, GPS coordinates & details…'}`, 'var(--amber)');

  try {
    let captured = null;
    if (typeof capturePlaceFromGoogleMaps === 'function') {
      captured = await capturePlaceFromGoogleMaps(text);
    }

    let placeName = (captured && captured.name && !/Malaysia Restaurant Specialties/i.test(captured.name)) ? captured.name : '';
    let placeLat = (captured && captured.lat && isFinite(captured.lat)) ? captured.lat : null;
    let placeLng = (captured && captured.lng && isFinite(captured.lng)) ? captured.lng : null;
    let placeCity = (captured && captured.city) ? captured.city : '';
    let placeCuisine = (captured && captured.cuisine) ? captured.cuisine : '';

    // 1. If name is generic or coordinates missing: try Gemini AI
    if ((!placeName || !placeLat || !placeLng) && typeof resolvePlaceViaGemini === 'function' && S && S.geminiApiKey) {
      const geminiRes = await resolvePlaceViaGemini(text);
      if (geminiRes) {
        if (!placeName && geminiRes.name) placeName = geminiRes.name;
        if (!placeLat && geminiRes.lat) placeLat = geminiRes.lat;
        if (!placeLng && geminiRes.lng) placeLng = geminiRes.lng;
        if (!placeCity && geminiRes.city) placeCity = geminiRes.city;
        if (!placeCuisine && geminiRes.cuisine) placeCuisine = geminiRes.cuisine;
      }
    }

    // 2. Fallback: extract name from raw text directly (strip URL)
    if (!placeName) {
      const textClean = text.replace(/https?:\/\/[^\s<>"']+/gi, '').trim();
      if (textClean && textClean.length >= 2 && textClean.length <= 60 && !/^\d+$/.test(textClean)) {
        placeName = textClean;
      }
    }

    // 3. Fallback: extract name from URL string path
    if (!placeName) {
      try {
        const u = new URL(text.match(/https?:\/\/[^\s<>"']+/i)?.[0] || text);
        const m = u.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);
        if (m) placeName = decodeURIComponent(m[1].replace(/\+/g, ' ')).split(',')[0].trim();
      } catch(e) {}
    }

    if (!placeName || /Malaysia Restaurant Specialties/i.test(placeName)) {
      placeName = isZh ? '自选目的地 (点击修改名称)' : 'Destination (Tap to edit)';
    }

    // 4. If coordinates are still missing: try Nominatim geocoding on the resolved name!
    if ((!placeLat || !placeLng) && placeName && !placeName.includes('(')) {
      const geo = await geocodePlaceByName(placeName, placeCity);
      if (geo) {
        placeLat = geo.lat;
        placeLng = geo.lng;
        if (geo.city && !placeCity) placeCity = geo.city;
      }
    }

    const newPlace = {
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: placeName,
      city: placeCity,
      address: (captured && captured.address) || '',
      lat: placeLat,
      lng: placeLng,
      cuisine: placeCuisine,
      categories: (captured && captured.categories) || [],
      rating: (captured && captured.rating) || null,
      mapUrl: (captured && captured.finalUrl) || (typeof extractMapsUrl === 'function' ? extractMapsUrl(text) : text) || '',
      recommendations: (captured && captured.recommendations) || [],
      recommendationText: (captured && captured.recommendationText) || ''
    };

    // Deduplication check: prevent adding the exact same venue twice
    const isDup = travelPlannerPlaces.some(p => {
      if (newPlace.mapUrl && p.mapUrl && p.mapUrl === newPlace.mapUrl) return true;
      if (newPlace.name && p.name && p.name.trim().toLowerCase() === newPlace.name.trim().toLowerCase() && p.name !== 'Destination (Tap to edit)' && p.name !== '自选目的地 (点击编辑名称)') return true;
      return false;
    });

    if (isDup) {
      if (statusEl) {
        statusEl.innerHTML = `⚠️ ${isZh ? '该地点已在列表中：' : 'Already in itinerary:'} <strong>${newPlace.name}</strong>`;
        statusEl.style.color = 'var(--amber)';
      }
      if (inp) inp.value = '';
      if (typeof toast === 'function') toast(isZh ? `⚠️ 该地点已在行程中` : `⚠️ Place is already in itinerary`);
      return;
    }

    travelPlannerPlaces.push(newPlace);
    savePlannerPlaces();
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') document.querySelectorAll('.tp-url-input, #tp-url-input').forEach(i => i.value = '');

    const pinTag = (newPlace.lat && newPlace.lng) ? '📍 GPS OK' : '⚠️ No GPS';
    const placeMeta = inferPlaceMetadata(newPlace);
    const hotelTag = placeMeta.type === 'hotel' ? ` · ${isZh ? '🏨 酒店入住优先' : '🏨 Hotel Check-in'}` : '';
    setPlannerStatus(`✅ ${isZh ? '已添加' : 'Added'}: <strong>${newPlace.name}</strong> <span style="color:var(--green)">(${pinTag}${hotelTag})</span>`, 'var(--green)');

    renderTravelPlannerUI();
    if (typeof toast === 'function') toast(isZh ? `📍 已添加：${newPlace.name}` : `📍 Added: ${newPlace.name}`);
  } catch(err) {
    console.error('Error adding place to planner:', err);
    setPlannerStatus(isZh ? '⚠️ 识别出错，请重试' : '⚠️ Could not resolve link, please try again', 'var(--red)');
  }
}
window.addPlaceToPlanner = addPlaceToPlanner;

function removePlannerPlace(idx) {
  if (idx >= 0 && idx < travelPlannerPlaces.length) {
    const removed = travelPlannerPlaces.splice(idx, 1)[0];
    savePlannerPlaces();
    renderTravelPlannerUI();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    if (typeof toast === 'function') toast(isZh ? `🗑️ 已移除：${removed.name}` : `🗑️ Removed: ${removed.name}`);
  }
}
window.removePlannerPlace = removePlannerPlace;

function movePlannerPlace(idx, direction) {
  const target = idx + direction;
  if (target < 0 || target >= travelPlannerPlaces.length) return;
  const temp = travelPlannerPlaces[idx];
  travelPlannerPlaces[idx] = travelPlannerPlaces[target];
  travelPlannerPlaces[target] = temp;
  savePlannerPlaces();
  renderTravelPlannerUI();
}
window.movePlannerPlace = movePlannerPlace;

function clearAllPlannerPlaces() {
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if (confirm(isZh ? '确定清空已添加的地点吗？' : 'Clear all added places?')) {
    travelPlannerPlaces = [];
    travelPlannerCurrentPlan = null;
    savePlannerPlaces();
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
  savePlannerPlaces();
  renderTravelPlannerUI();
  if (typeof toast === 'function') toast(isZh ? `📥 成功从想吃清单导入 ${count} 家地点！` : `📥 Imported ${count} places from wishlist!`);
}
window.importSelectedWishlistPlaces = importSelectedWishlistPlaces;

function setPlannerDayMode(mode) {
  travelPlannerDayMode = mode;
  savePlannerPlaces();
  renderTravelPlannerUI();
}
window.setPlannerDayMode = setPlannerDayMode;

function setPlannerTravelMode(mode) {
  travelPlannerTravelMode = mode;
  savePlannerPlaces();
  renderTravelPlannerUI();
}
window.setPlannerTravelMode = setPlannerTravelMode;

function setPlannerStartTime(timeStr) {
  travelPlannerStartTime = timeStr;
  savePlannerPlaces();
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
function startTravelPlannerCooldown(seconds = 40) {
  if (travelPlannerCooldownTimer) {
    clearInterval(travelPlannerCooldownTimer);
    travelPlannerCooldownTimer = null;
  }

  const safeSec = (typeof window !== 'undefined' || Number(seconds) > 3) ? Math.max(35, Number(seconds) || 40) : Number(seconds);
  travelPlannerCooldownTotal = safeSec;
  travelPlannerCooldownRemaining = safeSec;
  travelPlannerIsLoading = false;
  travelPlannerIsCoolingDown = true;
  travelPlannerRetryCount++;
  renderTravelPlannerUI();

  // Scroll to cooldown card smoothly (works in both modal and inline page tab)
  const modalBody = (typeof el === 'function') ? el('tp-modal-body') : null;
  if (modalBody) modalBody.scrollTop = 0;
  const inlineContainer = (typeof el === 'function') ? el('tp-inline-container') : null;
  if (inlineContainer && inlineContainer.offsetParent !== null && typeof inlineContainer.scrollIntoView === 'function') {
    inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  travelPlannerCooldownTimer = setInterval(() => {
    travelPlannerCooldownRemaining--;

    // Update countdown number and progress bar across ALL containers (modal and inline tab)
    const numEls = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') ? document.querySelectorAll('.tp-cooldown-num, #tp-cooldown-num') : [];
    const barEls = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') ? document.querySelectorAll('.tp-cooldown-bar-fill') : [];
    numEls.forEach(el => { el.textContent = `${travelPlannerCooldownRemaining}s`; });
    barEls.forEach(el => {
      const pct = Math.max(0, (travelPlannerCooldownRemaining / travelPlannerCooldownTotal) * 100);
      el.style.width = `${pct}%`;
    });

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
  savePlannerPlaces();
  renderTravelPlannerUI();
  if (typeof toast === 'function') toast(isZh ? '📍 已为您生成高精度离线路线' : '📍 Offline route generated');
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
  loadPlannerPlaces();
  if (travelPlannerPlaces.length === 0) {
    if (typeof toast === 'function') toast(isZh ? '⚠️ 请先粘贴至少一个 Google 地图地点！' : '⚠️ Please add at least 1 destination first!');
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
  const modalBody = (typeof el === 'function') ? el('tp-modal-body') : null;
  if (modalBody) modalBody.scrollTop = 0;
  const inlineContainer = (typeof el === 'function') ? el('tp-inline-container') : null;
  if (inlineContainer && inlineContainer.offsetParent !== null && typeof inlineContainer.scrollIntoView === 'function') {
    inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  try {
    const apiKey = (typeof S !== 'undefined' && S && S.geminiApiKey) ? S.geminiApiKey.trim() : '';
    if (!apiKey || apiKey.length < 8) {
      travelPlannerIsLoading = false;
      renderTravelPlannerUI();
      if (typeof openGeminiModal === 'function') {
        if (typeof toast === 'function') toast(isZh ? '⚠️ 请先连接 Google Gemini API Key 以使用 AI 规划' : '⚠️ Please connect Gemini API Key for AI planning');
        openGeminiModal();
      } else {
        if (typeof toast === 'function') toast(isZh ? '⚠️ 请先在设置中填写 Google Gemini API Key' : '⚠️ Please set Gemini API Key in Settings');
      }
      return;
    }

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
      savePlannerPlaces();

      if (typeof toast === 'function') toast(isZh ? '🎉 行程路线规划完成！' : '🎉 Trip route planned successfully!');
      renderTravelPlannerUI();
      return;
    }

    // 2. If rate-limited or busy -> Start Auto Countdown!
    // As explicitly requested: "the waiting ai to plan should longer and dont use offline route"
    // Never auto-fall-back to offline route! Continue AI countdown auto-retry!
    if (result && (result.error === 'rate_limit' || result.error === 'api_error')) {
      const waitTime = Math.max(35, result.cooldownSeconds || 40);
      console.warn(`⏳ AI rate limit / cooldown detected. Initiating ${waitTime}s countdown before auto-submit...`);
      startTravelPlannerCooldown(waitTime);
      return;
    }

    // Fallback: initiate cooldown retry rather than forcing offline route
    startTravelPlannerCooldown(40);
  } catch(err) {
    console.error('Trip planner error:', err);
    startTravelPlannerCooldown(40);
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

function buildTravelPlannerBodyHTML(isZh) {
  let html = '';
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <label style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:5px">
          <span>📍</span> <span>${isZh ? '粘贴 Google 地图链接或输入地点' : 'Paste Google Maps Link or Venue'}</span>
        </label>
        <span style="font-size:10px;padding:2px 8px;border-radius:6px;background:rgba(245,158,11,.15);color:var(--amber);font-weight:800">
          ⚡ ${isZh ? '自动解析 GPS 定位' : 'Auto GPS Pin'}
        </span>
      </div>
      <div style="margin-bottom:8px">
        <input type="text" id="tp-url-input" class="form-input tp-url-input" style="width:100%;box-sizing:border-box;min-height:42px;padding:8px 12px;font-size:13px;border-color:var(--amber);border-radius:10px;background:var(--bg2);color:var(--text)"
          placeholder="${isZh ? '粘贴 Google 地图链接或输入店名 (如 Westin Hotel / Village Park)' : 'Paste Google Maps link or enter place name…'}"
          onkeydown="if(event.key==='Enter'){event.preventDefault();addPlaceToPlanner();}"/>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" class="primary-btn" onclick="pasteAndAddPlannerPlace()" style="flex:1.2;margin:0;padding:8px 12px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:5px">
          <span>📋</span> <span>${isZh ? '从剪贴板粘贴并添加' : 'Paste & Add'}</span>
        </button>
        <button type="button" class="primary-btn" onclick="addPlaceToPlanner()" style="flex:1;margin:0;padding:8px 12px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:5px">
          <span>➕</span> <span>${isZh ? '添加地点' : 'Add Place'}</span>
        </button>
      </div>
      <div id="tp-input-status" class="tp-input-status" style="font-size:11.5px;min-height:16px;margin-top:6px;color:${travelPlannerLastStatus.color || 'var(--muted)'};line-height:1.4">
        ${travelPlannerLastStatus.html || ''}
      </div>
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
                <div class="tp-place-info" onclick="editPlannerPlaceName(${idx})" style="cursor:pointer" title="${isZh ? '点击修改名称' : 'Tap to edit name'}">
                  <div class="tp-place-title">
                    <span>${meta.icon}</span>
                    <strong style="font-size:12.5px">${place.name}</strong>
                    <span style="font-size:11px;opacity:0.6;margin-left:4px">✏️</span>
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
            <span class="tp-cooldown-count tp-cooldown-num" id="tp-cooldown-num">${travelPlannerCooldownRemaining}s</span>
          </div>
          <div style="font-size:13.5px;font-weight:800;color:var(--text);margin-bottom:3px">
            ${isZh ? 'AI 正在降温冷却中 · 倒计时结束将自动重新提交' : 'AI Rate Limit Cooldown · Auto-Submitting When Ready'}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:8px;line-height:1.4">
            ${isZh 
              ? `检测到 Google AI 频次限制 (第 ${travelPlannerRetryCount} 次重试)，正在为您自动倒计时 ${travelPlannerCooldownTotal} 秒，冷却结束后将自动再次提交规划…` 
              : `Google AI rate limit or busy (Attempt ${travelPlannerRetryCount}). Counting down ${travelPlannerCooldownTotal}s to auto-submit again…`}
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
          <span>${travelPlannerCurrentPlan ? (isZh ? '🔄 重新规划路线 (Re-Plan)' : '🔄 Re-Plan Trip Route') : (isZh ? '🚀 智能规划我的行程 (Plan My Route)' : '🚀 Plan My Route (AI Trip Planner)')}</span>
        </button>
      `}
    </div>
  `;

  // 5. GENERATED ITINERARY VIEW (If planned)
  if (travelPlannerCurrentPlan && !travelPlannerIsLoading) {
    html += renderItineraryCard(travelPlannerCurrentPlan, isZh);
  }


  return html;
}

function renderTravelPlannerInlineHTML(isZh) {
  return '<div id="tp-inline-container" class="tp-inline-root" style="min-height:50vh"></div>';
}
window.renderTravelPlannerInlineHTML = renderTravelPlannerInlineHTML;

function renderInlineTravelPlannerContent() {
  renderTravelPlannerUI();
}
window.renderInlineTravelPlannerContent = renderInlineTravelPlannerContent;

function renderTravelPlannerUI() {
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const hasGeminiKey = Boolean(S.geminiApiKey && S.geminiApiKey.length > 7);

  // Model pill
  const activeModelName = (S.geminiModel && S.geminiModel !== 'auto') ? S.geminiModel : 'Gemini 2.0 Flash';
  const modelBadge = hasGeminiKey
    ? `<span class="tp-badge-ai" title="Free Tier: 15 RPM / 1M TPM">🤖 ${activeModelName} · Free AI</span>`
    : `<span class="tp-badge-offline" onclick="openGeminiModal()" title="Tap to enter your free Google AI Studio Key">⚡ Smart GPS Engine <span style="text-decoration:underline;cursor:pointer">(${isZh ? '开启 Gemini AI ›' : 'Connect Gemini AI ›'})</span></span>`;

  const bodyHtml = buildTravelPlannerBodyHTML(isZh);

  // 1. Modal Container
  const modalContainer = el('travel-planner-modal-content');
  if (modalContainer) {
    modalContainer.innerHTML = `
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
        ${bodyHtml}
      </div>
    `;
  }

  // 2. Inline Page Tab Container
  const inlineContainer = el('tp-inline-container');
  if (inlineContainer) {
    inlineContainer.innerHTML = `
      <div class="tp-inline-header" style="text-align:center;padding:14px 12px 16px;background:linear-gradient(135deg,rgba(16,185,129,.14),rgba(6,182,212,.08));border-radius:18px;margin-bottom:14px;border:1.5px solid rgba(16,185,129,.22);box-shadow:0 6px 18px rgba(0,0,0,.04)">
        <div style="font-size:34px;margin-bottom:6px">🧭</div>
        <div style="font-weight:900;font-size:17.5px;color:var(--text);display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap">
          <span>${isZh ? 'AI 智能行程路线规划' : 'AI Travel Route Planner'}</span>
          ${modelBadge}
        </div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px">
          ${isZh ? '粘贴 Google 地图链接 · 智能规划行程时刻表与今天/明天安排' : 'Paste Google Maps links · AI plans optimal timing, route & Today/Tomorrow schedule'}
        </div>
      </div>
      <div class="tp-inline-body" id="tp-inline-body">
        ${bodyHtml}
      </div>
    `;
  }
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
  Object.defineProperty(_exportTarget, 'travelPlannerCooldownTotal', {
    get: () => travelPlannerCooldownTotal,
    set: (v) => { travelPlannerCooldownTotal = v; },
    configurable: true
  });
  Object.defineProperty(_exportTarget, 'travelPlannerPlaces', {
    get: () => travelPlannerPlaces,
    set: (v) => { travelPlannerPlaces = v; },
    configurable: true
  });
  _exportTarget.savePlannerPlaces = savePlannerPlaces;
  _exportTarget.loadPlannerPlaces = loadPlannerPlaces;
  _exportTarget.HOTEL_REGEX = HOTEL_REGEX;
  _exportTarget.inferPlaceMetadata = inferPlaceMetadata;
  if (typeof window !== 'undefined') window.inferPlaceMetadata = inferPlaceMetadata;
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
  _exportTarget.editPlannerPlaceName = editPlannerPlaceName;
  _exportTarget.geocodePlaceByName = geocodePlaceByName;
  _exportTarget.resolvePlaceViaGemini = resolvePlaceViaGemini;
  _exportTarget.planTripRoute = planTripRoute;
  _exportTarget.replanTripRoute = replanTripRoute;
  _exportTarget.copyTripItineraryToClipboard = copyTripItineraryToClipboard;
  _exportTarget.renderTravelPlannerUI = renderTravelPlannerUI;
  _exportTarget.renderTravelPlannerInlineHTML = renderTravelPlannerInlineHTML;
  _exportTarget.renderInlineTravelPlannerContent = renderInlineTravelPlannerContent;
  _exportTarget.buildTravelPlannerBodyHTML = buildTravelPlannerBodyHTML;
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
