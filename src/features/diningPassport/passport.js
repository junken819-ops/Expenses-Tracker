/**
 * Global Dining & Restaurant Passport
 * Modularized from Pocket Winnie Core
 */

// ═══════════════════════════════════════════════════════════════════
// 🌏 GLOBAL DINING & RESTAURANT PASSPORT (跨国探店与美食足迹)
// ═══════════════════════════════════════════════════════════════════

const RESTAURANT_COUNTRIES = [
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', currency: 'MYR', keywords: ['malaysia', 'kuala lumpur', 'kl', 'penang', 'georgetown', 'ipoh', 'petaling jaya', 'pj', 'subang', 'damansara', 'uptown', 'bangsar', 'cheras', 'puchong', 'johor bahru', 'jb', 'melaka', 'malacca', 'sarawak', 'kuching', 'sabah', 'kota kinabalu', 'mamak', 'kopitiam', 'myr', 'rm', 'tai ho jiak', 'nasi lemak', 'roti canai', 'bak kut teh', 'malaysian'] },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', currency: 'JPY', keywords: ['japan', 'tokyo', 'osaka', 'kyoto', 'fukuoka', 'sapporo', 'nagoya', 'shinjuku', 'shibuya', 'ginza', 'ramen', 'sushi', 'izakaya', 'jpy', 'yen', '日本', 'ichiran', 'udon', 'yakitori', 'tempura', 'matcha'] },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', currency: 'THB', keywords: ['thailand', 'bangkok', 'phuket', 'chiang mai', 'pattaya', 'krabi', 'pratunam', 'sukhumvit', 'thb', 'baht', 'pad thai', 'tom yam', '泰国', '曼谷', 'jay fai', 'som tum', 'mookata'] },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', currency: 'SGD', keywords: ['singapore', 'orchard', 'marina bay', 'changi', 'sentosa', 'chinatown sg', 'sgd', 'singapore dollar', '新加坡', 'jumbo seafood', 'song fa', 'lau pa sat'] },
  { name: 'Taiwan', code: 'TW', flag: '🇹🇼', currency: 'TWD', keywords: ['taiwan', 'taipei', 'kaohsiung', 'taichung', 'tainan', 'ximending', 'shilin', 'jiufen', 'twd', 'ntd', '台湾', '台北', 'din tai fung', 'beef noodle', 'bubble tea', 'night market'] },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', currency: 'KRW', keywords: ['korea', 'south korea', 'seoul', 'busan', 'incheon', 'jeju', 'myeongdong', 'gangnam', 'hongdae', 'krw', 'won', '韩国', '首尔', 'korean bbq', 'kimchi', 'bibimbap', 'tteokbokki'] },
  { name: 'China', code: 'CN', flag: '🇨🇳', currency: 'CNY', keywords: ['china', 'shanghai', 'beijing', 'guangzhou', 'shenzhen', 'chengdu', 'cny', 'rmb', 'yuan', '中国', '上海', '北京', 'haidilao', 'hotpot', 'sichuan'] },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', currency: 'GBP', keywords: ['uk', 'united kingdom', 'london', 'manchester', 'edinburgh', 'gbp', 'pound', 'england', 'britain', '英国', '伦敦', 'fish and chips', 'pub'] },
  { name: 'United States', code: 'US', flag: '🇺🇸', currency: 'USD', keywords: ['usa', 'united states', 'new york', 'los angeles', 'san francisco', 'california', 'las vegas', 'usd', 'dollar', '美国', '纽约', 'shake shack', 'burger', 'in-n-out'] },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', currency: 'AUD', keywords: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'aud', 'australian dollar', '澳洲', '澳大利亚', '悉尼', 'brunch', 'flat white'] },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', currency: 'VND', keywords: ['vietnam', 'ho chi minh', 'saigon', 'hanoi', 'da nang', 'vnd', 'dong', 'pho', 'banh mi', '越南'] },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', currency: 'IDR', keywords: ['indonesia', 'jakarta', 'bali', 'ubud', 'seminyak', 'bandung', 'surabaya', 'idr', 'rupiah', '印尼', '巴厘岛', 'nasi goreng', 'mie goreng', 'babi guling'] },
  { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', currency: 'HKD', keywords: ['hong kong', 'hk', 'kowloon', 'central hk', 'mong kok', 'hkd', '香港', 'cha chaan teng', 'dim sum', 'roast goose'] }
];

function getCountryInfo(nameOrCode){
  if(!nameOrCode) return RESTAURANT_COUNTRIES[0];
  const q = String(nameOrCode).toLowerCase().trim();
  const found = RESTAURANT_COUNTRIES.find(c => c.name.toLowerCase() === q || c.code.toLowerCase() === q);
  if(found) return found;
  return { name: nameOrCode, code: 'XX', flag: '🌐', currency: 'USD' };
}

function detectCountryFromText(text){
  if(!text) return null;
  const lower = String(text).toLowerCase();
  for(const c of RESTAURANT_COUNTRIES){
    if(c.keywords && c.keywords.some(k => lower.includes(k))){
      return c;
    }
  }
  return null;
}

function convertAmountToMYR(amount, currency){
  const num = parseFloat(amount) || 0;
  if(num <= 0) return 0;
  if(!currency || currency === 'MYR') return num;
  const rate = (typeof liveRates !== 'undefined' && liveRates[currency]) ? liveRates[currency] : 1;
  return Math.round(num * rate * 100) / 100;
}

let passportActiveStatusFilter = 'all'; // 'all' | 'visited' | 'pending'
let passportActiveCountryFilter = 'all'; // 'all' | specific country name

function renderRestaurantPassportWidget(){
  const card = el('passport-card');
  if(!card) return;
  const countriesEl = el('passport-widget-countries');
  const countsEl = el('passport-widget-counts');
  const subEl = el('passport-widget-sub');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const records = S.restaurantRecords || [];
  const distinctCountries = [...new Set(records.map(r => r.country).filter(Boolean))];
  const visitedCount = records.filter(r => r.status === 'visited').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;

  if(countriesEl) countriesEl.textContent = distinctCountries.length;
  const rouletteTxt = el('passport-widget-roulette-txt');
  if(rouletteTxt) rouletteTxt.textContent = isZh ? '转盘选店' : 'Roulette';
  if(countsEl){
    countsEl.textContent = isZh 
      ? `${visitedCount} 打卡 · ${pendingCount} 待探店` 
      : `${visitedCount} visited · ${pendingCount} pending`;
  }
  if(subEl){
    if(records.length === 0){
      subEl.textContent = isZh ? '记录全球美食与待吃清单 · 点击开启 ›' : 'Track visited & pending restaurants · Tap ›';
    } else {
      const flags = distinctCountries.map(c => getCountryInfo(c).flag).slice(0, 4).join(' ');
      subEl.textContent = isZh 
        ? `${flags} 已记录 ${records.length} 家餐厅 · 点击查看 ›` 
        : `${flags} ${records.length} restaurant${records.length!==1?'s':''} logged · Tap ›`;
    }
  }
}

function openRestaurantPassportModal(){
  if(!S.restaurantRecords) S.restaurantRecords = [];
  // If first time and empty, offer to auto-sync existing food transactions
  if(S.restaurantRecords.length === 0 && Array.isArray(S.transactions)){
    const foodTxs = S.transactions.filter(t => t.type === 'expense' && (t.category === 'food' || t.category === 'drinks'));
    if(foodTxs.length > 0){
      syncExistingFoodTxsToPassport(true);
    }
  }
  renderRestaurantPassport();
  openModal('restaurant-passport-modal');
}
window.openRestaurantPassportModal = openRestaurantPassportModal;

let passportSearchQuery = '';
let passportPageStatusFilter = 'all'; // 'all' | 'visited' | 'pending'
let passportPageCountryFilter = 'all'; // 'all' | country name

function onPassportSearchInput(val){
  passportSearchQuery = (val || '').trim().toLowerCase();
  const clearBtn = el('passport-search-clear-btn');
  if(clearBtn) clearBtn.style.display = passportSearchQuery ? 'block' : 'none';
  renderPassportPage();
}
window.onPassportSearchInput = onPassportSearchInput;

function clearPassportSearch(){
  passportSearchQuery = '';
  const inp = el('passport-search-inp');
  if(inp) inp.value = '';
  const clearBtn = el('passport-search-clear-btn');
  if(clearBtn) clearBtn.style.display = 'none';
  renderPassportPage();
}
window.clearPassportSearch = clearPassportSearch;

let passportViewMode = 'compact'; // 'compact' | 'detailed'
let passportCollapsedCountries = {}; // { [country]: boolean }
let passportExpandedCards = {}; // { [recordId]: boolean }

function togglePassportViewMode(){
  passportViewMode = (passportViewMode === 'compact' ? 'detailed' : 'compact');
  renderPassportPage();
  renderRestaurantPassport();
}
window.togglePassportViewMode = togglePassportViewMode;

function togglePassportCountryCollapse(country){
  passportCollapsedCountries[country] = !passportCollapsedCountries[country];
  renderPassportPage();
  renderRestaurantPassport();
}
window.togglePassportCountryCollapse = togglePassportCountryCollapse;

function togglePassportCardExpand(id, e){
  if(e && e.target && e.target.closest('button, a, input, select, label')) return;
  passportExpandedCards[id] = !passportExpandedCards[id];
  renderPassportPage();
  renderRestaurantPassport();
}
window.togglePassportCardExpand = togglePassportCardExpand;

function filterPassportPageStatus(status){
  passportPageStatusFilter = status;
  ['all', 'visited', 'pending'].forEach(s => {
    const btn = el('passport-page-filter-' + s);
    if(btn){
      if(s === status) btn.classList.add('on');
      else btn.classList.remove('on');
    }
  });
  renderPassportPage();
}
window.filterPassportPageStatus = filterPassportPageStatus;

function filterPassportPageCountry(country){
  passportPageCountryFilter = country;
  renderPassportPage();
}
window.filterPassportPageCountry = filterPassportPageCountry;

// Open the Add Restaurant form or Quick Wishlist modal depending on active tab
// (Wishlist tab => Quick Add from Google Maps with zero typing, Visited tab => visited form).
function openAddPassportPlace(source){
  const st = (source === 'modal' || source === 'popup') ? passportActiveStatusFilter : passportPageStatusFilter;
  if(st === 'pending'){
    openQuickWishlistModal();
  } else {
    openAddRestaurantModal(null, null, 'visited');
  }
}
window.openAddPassportPlace = openAddPassportPlace;

// Inline Quick-Add Bar rendered directly at the top of the Wishlist tab
function passportQuickAddBarHTML(source, isZh){
  return `
    <div class="pp-quick-add-box" style="background:var(--bg2);border:1.5px dashed var(--amber);border-radius:14px;padding:12px;margin-bottom:12px;box-shadow:0 2px 8px rgba(245,158,11,.08)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px">
          <span>📌</span> <span>${isZh ? '粘贴 Google 地图链接秒入想吃清单' : 'Paste Google Maps Link to Auto-Add Wishlist'}</span>
        </div>
        <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(245,158,11,.15);color:var(--amber);font-weight:800">⚡ Auto</span>
      </div>
      <div style="display:flex;gap:6px">
        <input type="text" id="passport-quick-map-url-${source}" class="form-input" style="flex:1;min-height:38px;padding:6px 10px;font-size:12.5px;border-color:var(--amber)" placeholder="${isZh ? '直接粘贴 Google 地图链接或分享文本...' : 'Paste Google Maps link or share text here...'}" onpaste="setTimeout(()=>handleInlineWishlistPaste('${source}'), 60)" onkeydown="if(event.key==='Enter'){event.preventDefault();submitInlineWishlistQuickAdd('${source}');}"/>
        <button type="button" class="primary-btn" id="passport-quick-map-btn-${source}" onclick="pasteAndAutoAdd('${source}')" style="width:auto;margin:0;padding:6px 14px;font-size:12px;font-weight:800;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;white-space:nowrap;border:none;display:inline-flex;align-items:center;gap:4px">
          📋 ${isZh ? '粘贴链接' : 'Paste'}
        </button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:8px">
        <div id="passport-quick-map-status-${source}" style="font-size:11px;color:var(--muted);line-height:1.4;flex:1">
          ${isZh ? '💡 自动识别店名、城市、国家与定位，完全无需手动输入！' : '💡 Zero manual typing: auto-captures place name, city, country & pin location!'}
        </div>
        <button type="button" onclick="openRoulette('wishlist')" style="background:rgba(236,72,153,.12);border:1px solid rgba(236,72,153,.35);color:#ec4899;border-radius:8px;font-size:11px;font-weight:800;padding:3px 9px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:4px">
          <span>🎡</span> <span>${isZh ? '纠结吃哪家？转盘选' : 'Spin Wishlist'}</span>
        </button>
      </div>
    </div>
  `;
}

// Empty-state card for the Wishlist / Visited tabs, always with an Add button
function passportEmptyStateHTML(status, source, isZh){
  const isWish = (status === 'pending');
  const icon = isWish ? '📌' : '✅';
  const title = isWish
    ? (isZh ? '想吃清单是空的' : 'Your wishlist is empty')
    : (isZh ? '还没有打卡记录' : 'No visited places yet');
  const sub = isWish
    ? (isZh ? '把想去的餐厅加入清单，之后可一键打卡记账！' : 'Save restaurants you want to try, then check in & log them later!')
    : (isZh ? '记录你去过的餐厅吧！' : 'Log the restaurants you have been to!');
  const btn = isWish
    ? (isZh ? '粘贴地图链接快速添加' : 'Paste Map Link to Auto-Add')
    : (isZh ? '添加打卡餐厅' : 'Add Visited Place');
  const action = isWish ? `openQuickWishlistModal()` : `openAddPassportPlace('${source}')`;
  const bg = isWish ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ec4899,#d946ef)';
  return `
    <div style="text-align:center;padding:28px 16px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:14px">
      <div style="font-size:36px;margin-bottom:6px">${icon}</div>
      <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px">${title}</div>
      <div style="font-size:11px;line-height:1.5;margin-bottom:14px;max-width:280px;margin-left:auto;margin-right:auto">${sub}</div>
      <button type="button" class="primary-btn" onclick="${action}" style="font-size:12px;padding:8px 16px;width:auto;margin-bottom:0;background:${bg};color:#fff;border:none">⚡ ${btn}</button>
    </div>
  `;
}

// "Add" button shown under the list on the Wishlist / Visited tabs
function passportAddFooterHTML(status, source, isZh){
  const isWish = (status === 'pending');
  const label = isWish
    ? (isZh ? '⚡ 粘贴 Google 地图链接快速添加想吃餐厅' : '⚡ Paste Google Maps Link to Auto-Add')
    : (isZh ? '➕ 添加打卡餐厅' : '➕ Add Visited Place');
  const action = isWish ? `openQuickWishlistModal()` : `openAddPassportPlace('${source}')`;
  const color = isWish ? 'var(--amber)' : '#ec4899';
  return `
    <button type="button" class="ghost-btn" onclick="${action}" style="width:100%;margin-top:4px;padding:10px;font-size:12px;font-weight:800;color:${color};border:1px dashed ${color};border-radius:12px;background:transparent">${label}</button>
  `;
}

// Automatically rolls forward any pending wishlist records from previous months to the current month.
// Visited records (already checked in) are left untouched with their historical visit dates.
function rollForwardPendingWishlist(){
  if(typeof S === 'undefined' || !S || !Array.isArray(S.restaurantRecords)) return false;
  const currentYM = (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)).slice(0, 7);
  let changed = false;

  S.restaurantRecords.forEach(r => {
    if(r && r.status === 'pending'){
      const recordYM = (r.date || '').slice(0, 7);
      if(recordYM && recordYM < currentYM){
        r.originalDate = r.originalDate || r.date;
        r.date = typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10);
        changed = true;
      }
    }
  });

  if(changed && typeof save === 'function'){
    save();
  }
  return changed;
}
window.rollForwardPendingWishlist = rollForwardPendingWishlist;

function renderPassportCardHTML(r, isZh){
  const isPending = (r.status === 'pending');
  const isExpanded = (passportViewMode === 'detailed') || !!passportExpandedCards[r.id];
  const items = r.items || [];
  const stars = r.rating ? '⭐'.repeat(r.rating) : '';
  const priceDisplay = r.amountOriginal > 0 
    ? (r.currency !== 'MYR' ? `${r.currency} ${r.amountOriginal} ≈ ${fmt(r.amountMYR)}` : fmt(r.amountMYR))
    : (isPending ? (isZh ? '待安排' : 'Wishlist') : 'RM 0');

  const ratingBadge = (r.ratingNum) 
    ? `<span style="display:inline-flex;align-items:center;gap:2px;font-weight:700;color:#f59e0b;background:rgba(245,158,11,0.12);padding:1px 6px;border-radius:6px;font-size:10px" title="${esc(String(r.reviewsCount || ''))} Google Reviews">⭐ ${r.ratingNum}${r.reviewsCount ? ` <span style="font-weight:500;color:var(--muted);font-size:9px">(${esc(String(r.reviewsCount))})</span>` : ''}</span>`
    : (stars ? `<span>${stars}</span>` : '');

  const cuisineBadge = r.cuisine 
    ? `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;background:rgba(99,102,241,0.12);color:var(--primary,#6366f1)">🍽️ ${esc(r.cuisine)}</span>` 
    : '';

  const openStatusBadge = r.openStatus 
    ? `<span style="font-size:9.5px;font-weight:600;padding:1px 6px;border-radius:6px;background:rgba(16,185,129,0.12);color:#10b981;white-space:nowrap">🕒 ${esc(r.openStatus)}</span>` 
    : '';

  const hasRecos = (r.recommendations && r.recommendations.length > 0) || !!r.recommendationText;

  return `
    <div class="pp-item ${isExpanded ? 'expanded' : ''}" onclick="togglePassportCardExpand('${r.id}', event)">
      <div class="pp-item-main">
        <div class="pp-item-name">
          <span>${esc(r.name)}</span>
          <span class="pp-item-badge ${isPending ? 'pending' : 'visited'}">
            ${isPending ? (isZh ? '📌 待探店' : '📌 Wishlist') : (isZh ? '✅ 已打卡' : '✅ Visited')}
          </span>
        </div>
        <div class="pp-item-price" style="${isPending ? 'color:var(--amber)' : ''}">
          ${priceDisplay}
        </div>
      </div>

      <div class="pp-item-sub">
        <div class="pp-item-meta">
          ${r.city ? `<span>📍 ${esc(r.city)}</span>` : ''}
          ${cuisineBadge}
          ${ratingBadge}
          ${openStatusBadge}
          ${(isPending && r.originalDate) ? `<span style="color:var(--amber);font-weight:700" title="${isZh ? '加入想吃日期：' + r.originalDate : 'Added: ' + r.originalDate}">🔄 ${isZh ? '跨月顺延' : 'Rolled forward'}</span>` : (r.date && !isPending ? `<span>📅 ${fmtDate(r.date)}</span>` : '')}
          ${r.totalCalories > 0 ? `<span style="color:#10b981;font-weight:700">🔥 ${r.totalCalories} kcal</span>` : ''}
          ${r.totalProtein > 0 ? `<span style="color:var(--cyan);font-weight:700">🥩 ${r.totalProtein}g</span>` : ''}
        </div>
        <span class="pp-item-expand-arrow">▼</span>
      </div>

      ${r.address ? `
        <div style="font-size:10.5px;color:var(--muted);margin:4px 0 2px;display:flex;align-items:flex-start;gap:4px;line-height:1.35;overflow:hidden;text-overflow:ellipsis">
          <span style="flex-shrink:0">🏠</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.address)}</span>
        </div>
      ` : ''}

      ${hasRecos ? `
        <!-- Must-Try Recommendations & Highlights Box -->
        <div class="pp-reco-box" style="margin:7px 0 3px;padding:7px 9px;border-radius:8px;background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.05));border:1px dashed rgba(245,158,11,0.3);font-size:11px">
          <div style="font-weight:800;color:var(--amber,#f59e0b);margin-bottom:3px;display:flex;align-items:center;justify-content:space-between">
            <span style="display:flex;align-items:center;gap:4px">✨ <span>${isZh ? '必吃招牌推荐与特色亮点' : 'Must-Try Recommendations & Highlights'}</span></span>
            ${r.cuisine ? `<span style="font-size:9.5px;font-weight:600;color:var(--muted)">${esc(r.cuisine)}</span>` : ''}
          </div>
          ${r.recommendationText ? `<div style="font-size:10.5px;color:var(--text);line-height:1.4;margin-bottom:5px">${esc(r.recommendationText)}</div>` : ''}
          ${(r.recommendations && r.recommendations.length > 0) ? `
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${r.recommendations.map(rec => `
                <span style="font-size:10px;padding:2px 7px;border-radius:6px;background:rgba(245,158,11,0.16);color:var(--text);font-weight:600;border:1px solid rgba(245,158,11,0.25);display:inline-flex;align-items:center;gap:3px">
                  🍴 ${esc(rec)}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${isPending ? `
      <!-- Quick action buttons outside drawer for easy access -->
      <div onclick="event.stopPropagation()" style="display:flex;gap:6px;padding:6px 0 2px;flex-wrap:wrap">
        <button type="button" onclick="markRestaurantVisited('${r.id}')" style="flex:1;min-width:90px;padding:6px 10px;border-radius:8px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px">
          ✅ ${isZh ? '打卡记账' : 'Check-in'}
        </button>
        <label onclick="event.stopPropagation()" style="flex:1;min-width:85px;padding:6px 10px;border-radius:8px;border:1.5px dashed rgba(245,158,11,.5);background:rgba(245,158,11,.08);color:var(--amber,#f59e0b);font-size:11.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;text-align:center">
          📸 ${isZh ? '收据打卡' : 'Receipt'}
          <input type="file" accept="image/*" capture="environment" onchange="receiptCheckIn('${r.id}', this)" style="display:none"/>
        </label>
        ${(r.mapUrl && /^https?:\/\//i.test(r.mapUrl)) ? `<a href="${esc(r.mapUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(59,130,246,.3);background:rgba(59,130,246,.08);color:#3b82f6;font-size:11.5px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px">📍 ${isZh ? '导航' : 'Map'}</a>` : ''}
        ${r.phone ? `<a href="tel:${esc(r.phone.replace(/[^0-9+]/g,''))}" onclick="event.stopPropagation()" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(16,185,129,.3);background:rgba(16,185,129,.08);color:#10b981;font-size:11.5px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px">📞 ${isZh ? '拨打' : 'Call'}</a>` : ''}
        ${(r.mapUrl && /^https?:\/\//i.test(r.mapUrl)) ? `<button type="button" onclick="enrichExistingWishlistRecord('${r.id}')" title="${isZh ? '从Google地图重新同步最新信息与招牌推荐' : 'Sync latest info & recommendations from Google Maps'}" style="padding:6px 9px;border-radius:8px;border:1px solid rgba(139,92,246,.3);background:rgba(139,92,246,.08);color:#8b5cf6;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px">🔄 ${isZh ? '同步' : 'Sync'}</button>` : ''}
      </div>
      ` : ''}

      <!-- Collapsible Drawer (Details, Dishes, Actions) -->
      <div class="pp-item-drawer" onclick="event.stopPropagation()">
        ${items.length > 0 ? `
          <div class="pp-item-dishes">
            ${items.map(it => `
              <span class="pp-dish-chip">
                ${it.qty > 1 ? `<strong style="color:var(--cyan)">${it.qty}x</strong> ` : ''}<span>${esc(it.name)}</span>
                ${it.calories > 0 ? `<span style="color:#10b981;font-weight:700">🔥${it.calories * (it.qty||1)}</span>` : ''}
                ${it.protein > 0 ? `<span style="color:var(--cyan);font-weight:700">🥩${it.protein * (it.qty||1)}g</span>` : ''}
              </span>
            `).join('')}
          </div>
        ` : ''}

        ${r.notes ? `
          <div class="pp-item-notes">
            📝 ${esc(r.notes)}
          </div>
        ` : ''}

        ${r.phone && !isPending ? `
          <div style="font-size:10.5px;color:var(--muted);margin-bottom:6px">📞 <strong>${esc(r.phone)}</strong></div>
        ` : ''}

        <div class="pp-item-actions">
          ${(r.mapUrl && /^https?:\/\//i.test(r.mapUrl)) ? `<a href="${esc(r.mapUrl)}" target="_blank" rel="noopener noreferrer" class="ghost-btn" style="font-size:10px;padding:3px 8px;border-radius:6px;text-decoration:none;color:#3b82f6;border-color:rgba(59,130,246,.35)">📍 ${isZh ? '地图' : 'Map'}</a>` : ''}
          ${(r.mapUrl && /^https?:\/\//i.test(r.mapUrl)) ? `<button type="button" class="ghost-btn" onclick="enrichExistingWishlistRecord('${r.id}')" title="${isZh ? '重新同步最新信息与招牌' : 'Sync latest info'}" style="font-size:10px;padding:3px 8px;border-radius:6px;color:#8b5cf6;border-color:rgba(139,92,246,.35)">🔄 ${isZh ? '同步' : 'Sync'}</button>` : ''}
          <button type="button" class="ghost-btn" onclick="openAddRestaurantModal('${r.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px">
            ✏️ ${isZh ? '编辑' : 'Edit'}
          </button>
          <button type="button" class="ghost-btn" onclick="deleteRestaurantRecord('${r.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;color:var(--red);border-color:rgba(239,68,68,.3)">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;
}
window.renderPassportCardHTML = renderPassportCardHTML;

function renderPassportPage(){
  rollForwardPendingWishlist();
  const container = el('passport-page-country-list');
  const pillsContainer = el('passport-page-country-pills');
  if(!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!S.restaurantRecords) S.restaurantRecords = [];
  if(S.restaurantRecords.length === 0 && Array.isArray(S.transactions)){
    const foodTxs = S.transactions.filter(t => t.type === 'expense' && (t.category === 'food' || t.category === 'drinks'));
    if(foodTxs.length > 0){
      syncExistingFoodTxsToPassport(true);
    }
  }

  const records = S.restaurantRecords || [];

  // Group all records by country for stats
  const allCountryGroups = {};
  let totalVisited = 0;
  let totalPending = 0;
  let totalWorldSpend = 0;
  let totalKcalAll = 0;
  let totalProteinAll = 0;

  records.forEach(r => {
    const cName = r.country || 'Malaysia';
    if(!allCountryGroups[cName]){
      const info = getCountryInfo(cName);
      allCountryGroups[cName] = {
        name: cName,
        code: r.countryCode || info.code,
        flag: r.flag || info.flag,
        currency: r.currency || info.currency,
        records: [],
        totalMYR: 0,
        totalKcal: 0,
        totalProtein: 0,
        visitedCount: 0,
        pendingCount: 0
      };
    }
    allCountryGroups[cName].records.push(r);
    if(r.status === 'visited'){
      totalVisited++;
      totalWorldSpend += (parseFloat(r.amountMYR) || 0);
      totalKcalAll += (parseInt(r.totalCalories) || 0);
      totalProteinAll += (parseInt(r.totalProtein) || 0);
      allCountryGroups[cName].visitedCount++;
      allCountryGroups[cName].totalMYR += (parseFloat(r.amountMYR) || 0);
      allCountryGroups[cName].totalKcal += (parseInt(r.totalCalories) || 0);
      allCountryGroups[cName].totalProtein += (parseInt(r.totalProtein) || 0);
    } else {
      totalPending++;
      allCountryGroups[cName].pendingCount++;
    }
  });

  const allCountryKeys = Object.keys(allCountryGroups).sort((a,b) => {
    return allCountryGroups[b].records.length - allCountryGroups[a].records.length;
  });

  // Update hero stats
  if(el('passport-page-stat-countries')) el('passport-page-stat-countries').textContent = allCountryKeys.length;
  if(el('passport-page-stat-visited')) el('passport-page-stat-visited').textContent = totalVisited;
  if(el('passport-page-stat-pending')) el('passport-page-stat-pending').textContent = totalPending;
  if(el('passport-page-stat-spend')) el('passport-page-stat-spend').textContent = fmt(totalWorldSpend);
  if(el('passport-hero-tot-kcal')) el('passport-hero-tot-kcal').textContent = `🔥 ${totalKcalAll.toLocaleString()} kcal`;
  if(el('passport-hero-tot-protein')) el('passport-hero-tot-protein').textContent = `🥩 ${totalProteinAll}g`;

  if(el('passport-hero-flags')){
    if(allCountryKeys.length > 0){
      const flagsStr = allCountryKeys.map(k => allCountryGroups[k].flag).join(' ');
      el('passport-hero-flags').textContent = `${flagsStr} (${allCountryKeys.length} ${isZh ? '国' : 'Countries'})`;
    } else {
      el('passport-hero-flags').textContent = isZh ? '探索全球美食' : 'World Explorer';
    }
  }

  // Update view mode toggle label
  const viewModeLabel = el('passport-view-mode-label');
  if(viewModeLabel){
    viewModeLabel.textContent = passportViewMode === 'compact' 
      ? (isZh ? '简洁' : 'Compact') 
      : (isZh ? '详细' : 'Detailed');
  }

  // Render Country Pills: only detected countries self-open!
  if(pillsContainer){
    pillsContainer.innerHTML = `
      <button type="button" class="pp-country-pill ${passportPageCountryFilter === 'all' ? 'on' : ''}" onclick="filterPassportPageCountry('all')">
        🌐 ${isZh ? '全部' : 'All'} (${records.length})
      </button>
      ${allCountryKeys.map(k => {
        const cg = allCountryGroups[k];
        const isAct = (passportPageCountryFilter === k);
        return `
          <button type="button" class="pp-country-pill ${isAct ? 'on' : ''}" onclick="filterPassportPageCountry('${esc(k)}')">
            ${cg.flag} ${esc(k)} (${cg.records.length})
          </button>
        `;
      }).join('')}
    `;
  }

  // Filter records by search query, status, and country
  const filteredRecords = records.filter(r => {
    // 1. Status filter
    if(passportPageStatusFilter === 'visited' && r.status !== 'visited') return false;
    if(passportPageStatusFilter === 'pending' && r.status !== 'pending') return false;
    // 2. Country filter
    if(passportPageCountryFilter !== 'all' && (r.country || 'Malaysia') !== passportPageCountryFilter) return false;
    // 3. Search query
    if(passportSearchQuery){
      const q = passportSearchQuery;
      const inName = (r.name || '').toLowerCase().includes(q);
      const inCity = (r.city || '').toLowerCase().includes(q);
      const inCountry = (r.country || '').toLowerCase().includes(q);
      const inNotes = (r.notes || '').toLowerCase().includes(q);
      const inItems = (r.items || []).some(it => (it.name || '').toLowerCase().includes(q));
      if(!inName && !inCity && !inCountry && !inNotes && !inItems) return false;
    }
    return true;
  });

  // Update toolbar counter
  if(el('passport-list-counter')){
    el('passport-list-counter').textContent = `${filteredRecords.length} ${isZh ? '家餐厅' : 'Places'}`;
  }

  if(records.length === 0){
    if(passportPageStatusFilter === 'pending'){
      container.innerHTML = passportQuickAddBarHTML('page', isZh) + passportEmptyStateHTML('pending', 'page', isZh);
      return;
    }
    container.innerHTML = `
      <div style="text-align:center;padding:28px 16px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:14px">
        <div style="font-size:36px;margin-bottom:6px">🌏</div>
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px">
          ${isZh ? '尚未记录任何餐厅' : 'No restaurants logged yet'}
        </div>
        <div style="font-size:11px;line-height:1.5;margin-bottom:14px;max-width:280px;margin-left:auto;margin-right:auto">
          ${isZh ? '添加或导入美食账单，系统将自动自启所属国家分类！' : 'Add a restaurant to automatically self-open its country category!'}
        </div>
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
          <button type="button" class="primary-btn" onclick="openAddRestaurantModal()" style="font-size:11.5px;padding:6px 14px;width:auto;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff">
            ➕ ${isZh ? '添加第一家' : 'Add Place'}
          </button>
          <button type="button" class="ghost-btn" onclick="syncExistingFoodTxsToPassport()" style="font-size:11.5px;padding:6px 14px;width:auto;color:var(--amber);border-color:rgba(245,158,11,.3)">
            🔄 ${isZh ? '导入现有账单' : 'Sync Food Txs'}
          </button>
        </div>
      </div>
    `;
    return;
  }

  if(filteredRecords.length === 0 && !passportSearchQuery && passportPageCountryFilter === 'all' && (passportPageStatusFilter === 'pending' || passportPageStatusFilter === 'visited')){
    container.innerHTML = (passportPageStatusFilter === 'pending' ? passportQuickAddBarHTML('page', isZh) : '') + passportEmptyStateHTML(passportPageStatusFilter, 'page', isZh);
    return;
  }

  if(filteredRecords.length === 0){
    container.innerHTML = `
      <div style="text-align:center;padding:24px 16px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:12px">
        <div style="font-size:26px;margin-bottom:4px">🔍</div>
        <div style="font-size:12.5px;font-weight:800;color:var(--text);margin-bottom:2px">
          ${isZh ? '无匹配餐厅' : 'No matches found'}
        </div>
        <div style="font-size:11px;margin-bottom:10px">
          ${isZh ? '尝试更换搜索词或筛选条件' : 'Try adjusting search or filters'}
        </div>
        <button type="button" class="ghost-btn" onclick="clearPassportSearch();filterPassportPageStatus('all');filterPassportPageCountry('all')" style="font-size:10.5px;padding:4px 10px;width:auto">
          ${isZh ? '重置筛选' : 'Reset Filters'}
        </button>
      </div>
    `;
    return;
  }

  // Group filtered records by country
  const filteredCountryGroups = {};
  filteredRecords.forEach(r => {
    const cName = r.country || 'Malaysia';
    if(!filteredCountryGroups[cName]){
      const fullGroup = allCountryGroups[cName] || {};
      filteredCountryGroups[cName] = {
        name: cName,
        code: r.countryCode || fullGroup.code || 'MY',
        flag: r.flag || fullGroup.flag || '🇲🇾',
        currency: r.currency || fullGroup.currency || 'MYR',
        records: [],
        totalMYR: 0,
        totalKcal: 0,
        totalProtein: 0,
        visitedCount: 0,
        pendingCount: 0
      };
    }
    filteredCountryGroups[cName].records.push(r);
    if(r.status === 'visited'){
      filteredCountryGroups[cName].visitedCount++;
      filteredCountryGroups[cName].totalMYR += (parseFloat(r.amountMYR) || 0);
      filteredCountryGroups[cName].totalKcal += (parseInt(r.totalCalories) || 0);
      filteredCountryGroups[cName].totalProtein += (parseInt(r.totalProtein) || 0);
    } else {
      filteredCountryGroups[cName].pendingCount++;
    }
  });

  const visibleCountryKeys = Object.keys(filteredCountryGroups).sort((a,b) => {
    return filteredCountryGroups[b].records.length - filteredCountryGroups[a].records.length;
  });

  let html = (passportPageStatusFilter === 'pending') ? passportQuickAddBarHTML('page', isZh) : '';
  visibleCountryKeys.forEach(cName => {
    const cg = filteredCountryGroups[cName];
    const sortedRestList = [...cg.records].sort((a,b) => {
      if(a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    const isCollapsed = !!passportCollapsedCountries[cName];
    const currRate = (typeof liveRates !== 'undefined' && liveRates[cg.currency] && cg.currency !== 'MYR') 
      ? ` · 1 ${cg.currency} ≈ RM ${liveRates[cg.currency].toFixed(3)}` 
      : '';

    html += `
      <div class="pp-group ${isCollapsed ? 'collapsed' : ''}">
        <!-- Country Group Accordion Header -->
        <div class="pp-group-hdr" onclick="togglePassportCountryCollapse('${esc(cName)}')">
          <div class="pp-group-left">
            <span class="pp-group-flag">${cg.flag}</span>
            <div>
              <div class="pp-group-title">
                ${esc(cg.name)} <span style="font-size:10px;font-weight:600;color:var(--muted)">(${cg.records.length})</span>
              </div>
              <div class="pp-group-sub">
                ${cg.visitedCount > 0 ? `<span style="color:#10b981;font-weight:700">${cg.visitedCount} ${isZh ? '打卡' : 'visited'}</span>` : ''}
                ${(cg.visitedCount > 0 && cg.pendingCount > 0) ? ' · ' : ''}
                ${cg.pendingCount > 0 ? `<span style="color:var(--amber);font-weight:700">${cg.pendingCount} ${isZh ? '待探店' : 'wishlist'}</span>` : ''}
                ${currRate}
              </div>
            </div>
          </div>
          <div class="pp-group-right">
            <div>
              <div class="pp-group-spend">${fmt(cg.totalMYR)}</div>
              ${cg.totalKcal > 0 ? `<div style="font-size:9.5px;color:#10b981;font-weight:700">🔥 ${cg.totalKcal.toLocaleString()} kcal</div>` : ''}
            </div>
            <span class="pp-group-arrow">▼</span>
          </div>
        </div>

        <!-- Restaurant List in this Country -->
        <div class="pp-group-list">
          ${sortedRestList.map(r => renderPassportCardHTML(r, isZh)).join('')}
        </div>
      </div>
    `;
  });

  if(passportPageStatusFilter === 'pending' || passportPageStatusFilter === 'visited'){
    html += passportAddFooterHTML(passportPageStatusFilter, 'page', isZh);
  }
  container.innerHTML = html;
}
window.renderPassportPage = renderPassportPage;

function filterPassportStatus(status){
  passportActiveStatusFilter = status;
  ['all', 'visited', 'pending'].forEach(s => {
    const btn = el('passport-filter-' + s);
    if(btn){
      if(s === status) btn.classList.add('on');
      else btn.classList.remove('on');
    }
  });
  renderRestaurantPassport();
}
window.filterPassportStatus = filterPassportStatus;

function filterPassportCountry(country){
  passportActiveCountryFilter = country;
  renderRestaurantPassport();
}
window.filterPassportCountry = filterPassportCountry;

function renderRestaurantPassport(){
  const container = el('passport-country-list');
  const pillsContainer = el('passport-country-pills');
  if(!container) return;
  rollForwardPendingWishlist();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const records = S.restaurantRecords || [];

  // Group records by country
  const countryGroups = {};
  records.forEach(r => {
    const cName = r.country || 'Malaysia';
    if(!countryGroups[cName]){
      const info = getCountryInfo(cName);
      countryGroups[cName] = {
        name: cName,
        code: r.countryCode || info.code,
        flag: r.flag || info.flag,
        currency: r.currency || info.currency,
        records: [],
        totalMYR: 0,
        totalKcal: 0,
        totalProtein: 0,
        visitedCount: 0,
        pendingCount: 0
      };
    }
    countryGroups[cName].records.push(r);
    if(r.status === 'visited'){
      countryGroups[cName].visitedCount++;
      countryGroups[cName].totalMYR += (parseFloat(r.amountMYR) || 0);
      countryGroups[cName].totalKcal += (parseInt(r.totalCalories) || 0);
      countryGroups[cName].totalProtein += (parseInt(r.totalProtein) || 0);
    } else {
      countryGroups[cName].pendingCount++;
    }
  });

  const countryKeys = Object.keys(countryGroups).sort((a,b) => {
    return countryGroups[b].records.length - countryGroups[a].records.length;
  });

  // Calculate overall stats
  let totalVisited = 0;
  let totalPending = 0;
  let totalWorldSpend = 0;
  records.forEach(r => {
    if(r.status === 'visited'){
      totalVisited++;
      totalWorldSpend += (parseFloat(r.amountMYR) || 0);
    } else {
      totalPending++;
    }
  });

  // Update top stats
  if(el('passport-stat-countries')) el('passport-stat-countries').textContent = countryKeys.length;
  if(el('passport-stat-visited')) el('passport-stat-visited').textContent = totalVisited;
  if(el('passport-stat-pending')) el('passport-stat-pending').textContent = totalPending;
  if(el('passport-stat-spend')) el('passport-stat-spend').textContent = fmt(totalWorldSpend);

  // Render Country Pills: only detected countries self-open!
  if(pillsContainer){
    pillsContainer.innerHTML = `
      <button type="button" class="chip ${passportActiveCountryFilter === 'all' ? 'on' : ''}" onclick="filterPassportCountry('all')" style="font-size:10.5px;padding:3px 9px;border-radius:12px;white-space:nowrap;cursor:pointer">
        🌐 ${isZh ? '全部' : 'All'} (${records.length})
      </button>
      ${countryKeys.map(k => {
        const cg = countryGroups[k];
        const isAct = (passportActiveCountryFilter === k);
        return `
          <button type="button" class="chip ${isAct ? 'on' : ''}" onclick="filterPassportCountry('${esc(k)}')" style="font-size:10.5px;padding:3px 9px;border-radius:12px;white-space:nowrap;cursor:pointer">
            ${cg.flag} ${esc(k)} (${cg.records.length})
          </button>
        `;
      }).join('')}
    `;
  }

  // Filter country groups based on country pill
  const visibleCountries = passportActiveCountryFilter === 'all' 
    ? countryKeys 
    : countryKeys.filter(k => k === passportActiveCountryFilter);

  if(visibleCountries.length === 0){
    if(passportActiveStatusFilter === 'pending'){
      container.innerHTML = passportQuickAddBarHTML('popup', isZh) + passportEmptyStateHTML('pending', 'modal', isZh);
      return;
    }
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:16px">
        <div style="font-size:36px;margin-bottom:8px">🌏</div>
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px">
          ${isZh ? '尚未开启任何国家美食分类' : 'No Country Dining Categories Yet'}
        </div>
        <div style="font-size:11.5px;line-height:1.5;margin-bottom:16px">
          ${isZh ? '当您添加或扫描来自新国家（如马来西亚 🇲🇾、日本 🇯🇵、泰国 🇹🇭）的美食账单时，系统将自动自启该国家分类！' : 'Add a restaurant or scan a food receipt to automatically open that country category!'}
        </div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button type="button" class="primary-btn" onclick="openAddRestaurantModal()" style="font-size:11.5px;padding:8px 14px;width:auto">
            ➕ ${isZh ? '添加第一家餐厅' : 'Add First Restaurant'}
          </button>
          <button type="button" class="ghost-btn" onclick="syncExistingFoodTxsToPassport()" style="font-size:11.5px;padding:8px 14px;width:auto">
            🔄 ${isZh ? '导入现有餐饮账单' : 'Sync Food Expenses'}
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Render each visible country category section
  let cardsHtml = '';
  visibleCountries.forEach(cName => {
    const cg = countryGroups[cName];
    // Filter records by active status
    const filteredRecords = cg.records.filter(r => {
      if(passportActiveStatusFilter === 'visited') return r.status === 'visited';
      if(passportActiveStatusFilter === 'pending') return r.status === 'pending';
      return true;
    }).sort((a,b) => {
      // Pending first, or sort by date desc
      if(a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    if(filteredRecords.length === 0 && passportActiveStatusFilter !== 'all') return;

    const isCollapsed = !!passportCollapsedCountries[cName];
    cardsHtml += `
      <div class="pp-group ${isCollapsed ? 'collapsed' : ''}">
        <!-- Country Category Header -->
        <div class="pp-group-hdr" onclick="togglePassportCountryCollapse('${esc(cName)}')">
          <div class="pp-group-left">
            <span class="pp-group-flag">${cg.flag}</span>
            <div>
              <div class="pp-group-title">${esc(cg.name)}</div>
              <div class="pp-group-sub">
                ${cg.visitedCount} ${isZh ? '已打卡' : 'visited'} · ${cg.pendingCount} ${isZh ? '待探店' : 'pending'}
              </div>
            </div>
          </div>
          <div class="pp-group-right">
            <div>
              <div class="pp-group-spend">${fmt(cg.totalMYR)}</div>
              ${cg.totalKcal > 0 ? `<div style="font-size:9.5px;font-weight:700;color:#10b981">🔥 ${cg.totalKcal.toLocaleString()} kcal</div>` : ''}
            </div>
            <span class="pp-group-arrow">▼</span>
          </div>
        </div>

        <!-- Restaurant Cards in this Country -->
        <div class="pp-group-list">
          ${filteredRecords.map(r => renderPassportCardHTML(r, isZh)).join('')}
        </div>
      </div>
    `;
  });

  if(!cardsHtml){
    container.innerHTML = (passportActiveStatusFilter === 'pending' ? passportQuickAddBarHTML('popup', isZh) : '') + passportEmptyStateHTML(passportActiveStatusFilter, 'modal', isZh);
    return;
  }
  let html = (passportActiveStatusFilter === 'pending') ? passportQuickAddBarHTML('popup', isZh) : '';
  html += cardsHtml;
  if(passportActiveStatusFilter === 'pending' || passportActiveStatusFilter === 'visited'){
    html += passportAddFooterHTML(passportActiveStatusFilter, 'modal', isZh);
  }
  container.innerHTML = html;
}

function openAddRestaurantModal(editId, defaultCountry, defaultStatus){
  const form = el('add-restaurant-form');
  if(form) form.reset();

  const idInp = el('rest-edit-id');
  const titleEl = el('add-rest-modal-title');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const dishesContainer = el('rest-dishes-container');
  if(dishesContainer) dishesContainer.innerHTML = '';
  if(el('rest-map-inp')) el('rest-map-inp').value = '';
  if(el('rest-lat-inp')) el('rest-lat-inp').value = '';
  if(el('rest-lng-inp')) el('rest-lng-inp').value = '';
  if(el('rest-map-status')) el('rest-map-status').textContent = '';
  _restMapLastUrl = '';
  _lastCapturedPlaceData = null;

  if(editId){
    const record = (S.restaurantRecords || []).find(r => r.id === editId);
    if(record){
      if(idInp) idInp.value = record.id;
      if(titleEl) titleEl.textContent = isZh ? '✏️ 编辑餐厅记录' : '✏️ Edit Restaurant Record';
      setRestStatus(record.status || 'visited');
      if(el('rest-name-inp')) el('rest-name-inp').value = record.name || '';
      if(el('rest-country-sel')){
        el('rest-country-sel').value = record.country || 'Malaysia';
        onRestCountryChange(record.country || 'Malaysia');
      }
      if(el('rest-city-inp')) el('rest-city-inp').value = record.city || '';
      if(el('rest-cuisine-inp')) el('rest-cuisine-inp').value = record.cuisine || '';
      if(el('rest-address-inp')) el('rest-address-inp').value = record.address || '';
      if(el('rest-phone-inp')) el('rest-phone-inp').value = record.phone || '';
      if(el('rest-date-inp')) el('rest-date-inp').value = record.date || '';
      if(el('rest-rating-sel')) el('rest-rating-sel').value = record.rating || 5;
      if(el('rest-curr-sel')) el('rest-curr-sel').value = record.currency || 'MYR';
      if(el('rest-amount-inp')) el('rest-amount-inp').value = record.amountOriginal || '';
      if(el('rest-notes-inp')) el('rest-notes-inp').value = record.notes || '';
      if(el('rest-map-inp')) el('rest-map-inp').value = record.mapUrl || '';
      if(el('rest-lat-inp')) el('rest-lat-inp').value = (record.lat !== undefined && record.lat !== null) ? record.lat : '';
      if(el('rest-lng-inp')) el('rest-lng-inp').value = (record.lng !== undefined && record.lng !== null) ? record.lng : '';
      _restMapLastUrl = record.mapUrl || '';
      if(el('rest-sync-tx-chk')) el('rest-sync-tx-chk').checked = false;

      calcRestConvertedMYR();

      if(record.items && record.items.length > 0){
        record.items.forEach(it => {
          addRestFoodItemRow(it.name, it.price, it.calories, it.protein);
        });
      } else {
        addRestFoodItemRow();
      }
      recalcRestDishTotals();
      openModal('add-restaurant-modal');
      return;
    }
  }

  // Adding new record
  if(idInp) idInp.value = '';
  if(titleEl) titleEl.textContent = isZh ? '🍽️ 添加跨国探店记录' : '🍽️ Add Restaurant Record';
  setRestStatus(defaultStatus || 'visited');
  if(el('rest-name-inp')) el('rest-name-inp').value = '';
  if(el('rest-cuisine-inp')) el('rest-cuisine-inp').value = '';
  if(el('rest-address-inp')) el('rest-address-inp').value = '';
  if(el('rest-phone-inp')) el('rest-phone-inp').value = '';
  if(el('rest-notes-inp')) el('rest-notes-inp').value = '';
  if(el('rest-map-inp')) el('rest-map-inp').value = '';
  if(el('rest-lat-inp')) el('rest-lat-inp').value = '';
  if(el('rest-lng-inp')) el('rest-lng-inp').value = '';
  if(el('rest-map-status')) el('rest-map-status').textContent = '';
  if(el('rest-date-inp')) el('rest-date-inp').value = today();
  if(el('rest-rating-sel')) el('rest-rating-sel').value = 5;

  const initialCountry = defaultCountry || 'Malaysia';
  if(el('rest-country-sel')){
    el('rest-country-sel').value = initialCountry;
    onRestCountryChange(initialCountry);
  }
  if(el('rest-sync-tx-chk')) el('rest-sync-tx-chk').checked = true;

  addRestFoodItemRow();
  calcRestConvertedMYR();
  recalcRestDishTotals();
  openModal('add-restaurant-modal');
}
window.openAddRestaurantModal = openAddRestaurantModal;

function setRestStatus(status){
  const inp = el('rest-status-inp');
  const visitedBtn = el('rest-status-visited-btn');
  const pendingBtn = el('rest-status-pending-btn');
  const dateLbl = el('rest-date-lbl');
  const syncTxBox = el('rest-sync-tx-box');
  const titleEl = el('add-rest-modal-title');
  const submitBtn = el('rest-submit-btn');
  const mapRow = el('rest-map-row');
  const mapLabel = el('rest-map-label');
  const quickSaveBtn = el('rest-map-quick-save-btn');
  const manualFold = el('rest-manual-details-fold');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const isEditing = !!(el('rest-edit-id') && el('rest-edit-id').value);
  const visitedOnlyRows = document.querySelectorAll('.rest-visited-only');

  if(inp) inp.value = status;
  if(status === 'visited'){
    if(visitedBtn) visitedBtn.classList.add('on');
    if(pendingBtn) pendingBtn.classList.remove('on');
    if(dateLbl) dateLbl.textContent = isZh ? 'Visited Date (打卡日期)' : 'Visited Date';
    if(titleEl) titleEl.textContent = isEditing ? (isZh ? '✏️ 编辑餐厅记录' : '✏️ Edit Restaurant Record') : (isZh ? '🍽️ 添加跨国探店记录' : '🍽️ Add Restaurant Record');
    if(submitBtn) submitBtn.textContent = isZh ? '💾 保存探店记录' : '💾 Save Restaurant Record';
    if(mapLabel) mapLabel.textContent = isZh ? 'Google Maps Link (粘贴地图链接自动填写)' : 'Google Maps Link (Auto-fill)';
    if(quickSaveBtn) quickSaveBtn.textContent = isZh ? '✨ 识别' : '✨ Fill';
    if(mapRow){
      mapRow.style.borderColor = 'var(--border)';
      mapRow.style.background = 'var(--bg2)';
    }
    visitedOnlyRows.forEach(r => { r.style.display = ''; });
    if(manualFold){
      manualFold.open = true;
      manualFold.classList.add('visited-mode');
    }
  } else {
    if(pendingBtn) pendingBtn.classList.add('on');
    if(visitedBtn) visitedBtn.classList.remove('on');
    if(dateLbl) dateLbl.textContent = isZh ? 'Target Date (计划前往日期)' : 'Target Date (Optional)';
    if(titleEl) titleEl.textContent = isEditing ? (isZh ? '✏️ 编辑想吃餐厅' : '✏️ Edit Wishlist Place') : (isZh ? '📌 添加到想吃清单' : '📌 Add to Wishlist');
    if(submitBtn) submitBtn.textContent = isZh ? '💾 保存到想吃清单' : '💾 Save to Wishlist';
    if(mapLabel) mapLabel.textContent = isZh ? 'Google Maps Link (粘贴地图链接秒存想吃)' : 'Google Maps Link (Auto-Capture & Save)';
    if(quickSaveBtn) quickSaveBtn.textContent = isZh ? '⚡ 保存' : '⚡ Save';
    if(mapRow){
      mapRow.style.borderColor = 'var(--amber)';
      mapRow.style.background = 'var(--bg2)';
    }
    visitedOnlyRows.forEach(r => { r.style.display = 'none'; });
    if(manualFold){
      manualFold.classList.remove('visited-mode');
      const hasName = el('rest-name-inp') && el('rest-name-inp').value.trim();
      manualFold.open = isEditing && !!hasName;
    }
  }
}
window.setRestStatus = setRestStatus;

async function submitRestModalQuickSave(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const urlInp = el('rest-map-inp');
  const rawUrl = urlInp ? urlInp.value.trim() : '';
  const nameInp = el('rest-name-inp');
  const nameVal = nameInp ? nameInp.value.trim() : '';

  if(!rawUrl && !nameVal){
    toast(isZh ? '⚠️ 请粘贴 Google 地图链接或输入店名' : '⚠️ Please paste a Google Maps link or enter place name');
    return;
  }

  if(!nameVal && rawUrl && extractMapsUrl(rawUrl)){
    const statusEl = el('rest-map-status');
    if(statusEl){
      statusEl.textContent = isZh ? '⏳ 正在自动识别地点信息并保存…' : '⏳ Auto-capturing place & saving…';
      statusEl.style.color = 'var(--amber)';
    }
    await autoFillFromMapsLink(rawUrl, true);
  }

  saveRestaurantRecord();
}
window.submitRestModalQuickSave = submitRestModalQuickSave;

function onRestCountryChange(countryVal){
  const customRow = el('rest-custom-country-row');
  const currSel = el('rest-curr-sel');
  if(!countryVal) return;

  if(countryVal === 'Other'){
    if(customRow) customRow.classList.remove('hidden');
    if(currSel) currSel.value = 'USD';
  } else {
    if(customRow) customRow.classList.add('hidden');
    const info = getCountryInfo(countryVal);
    if(currSel && info && info.currency){
      currSel.value = info.currency;
    }
  }
  calcRestConvertedMYR();
}
window.onRestCountryChange = onRestCountryChange;

// ─── 📍 Google Maps link auto-fill ────────────────────────────────────
// Paste a Google Maps link (full or short maps.app.goo.gl) and the form fills
// name, coordinates, country and city automatically.
const MAPS_SHORT_HOST_RE = /^(maps\.app\.goo\.gl|goo\.gl|g\.co|share\.google)$/i;

// Find the first Google Maps URL inside arbitrary pasted text (e.g. the text the Maps app "Share" gives)
function extractMapsUrl(text){
  const found = String(text || '').match(/https?:\/\/[^\s<>"']+/gi);
  if(!found) return null;
  for(const raw of found){
    try{
      const u = new URL(raw.replace(/[),.;]+$/, ''));
      const isShort = MAPS_SHORT_HOST_RE.test(u.hostname);
      const isGoogle = /^(www\.|maps\.)?google\.[a-z.]+$/i.test(u.hostname) && (/^\/maps/.test(u.pathname) || /^maps\./i.test(u.hostname));
      if(isShort || isGoogle) return u.toString();
    }catch(e){}
  }
  return null;
}
window.extractMapsUrl = extractMapsUrl;

// Extract place name, real rating, review count, cuisine, and address from share text
function parseMapsShareText(rawText) {
  const result = { name: '', rating: null, reviewsCount: null, reviewsCountText: '', cuisine: '', address: '' };
  if (!rawText) return result;

  const lines = String(rawText).split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/https?:\/\//i.test(line)) continue;

    // Check for rating and review count, e.g. "4.7 ★ (763) · Fine dining restaurant"
    const starMatch = line.match(/(\d+\.\d+)\s*(?:★|⭐|stars?)/i) || line.match(/(?:★|⭐)\s*(\d+\.\d+)/);
    if (starMatch && !result.rating) {
      result.rating = parseFloat(starMatch[1]);
      const revMatch = line.match(/\(([\d,]+)\s*(?:reviews?|评价|則評論)?\)/i);
      if (revMatch) {
        result.reviewsCount = parseInt(revMatch[1].replace(/,/g, ''), 10);
        result.reviewsCountText = `${revMatch[1]} reviews`;
      }
      const cuisineMatch = line.match(/·\s*([^·\r\n\d]+)/);
      if (cuisineMatch) {
        result.cuisine = cuisineMatch[1].trim();
      }
      continue;
    }

    // Check for address pattern
    if (/jalan|street|st\.|road|rd\.|avenue|ave\.|lane|lorong|taman|building|plaza|mall|floor|block|perak|selangor|kuala lumpur|penang|johor|\b\d{5}\b/i.test(line)) {
      if (!result.address) {
        result.address = line;
        continue;
      }
    }

    // Name extraction from clean lines
    if (!result.name) {
      let cleaned = line
        .replace(/https?:\/\/[^\s<>"']+/gi, '')
        .replace(/^(check out|take a look at|look at|shared from Google Maps:?|Google Maps:?|在\s*(?:Google\s*地图|Google\s*Maps)\s*(?:上)?(?:查看|看)?[:：\s]*)\s*/i, '')
        .replace(/\s*(on Google Maps|at Google Maps|Google Maps|在\s*(?:Google\s*地图|Google\s*Maps)|Google\s*地图)\s*[:：]?\s*$/i, '')
        .replace(/[:：\-–—\s]+$/, '')
        .replace(/^【|】$/g, '')
        .replace(/^"|"$/g, '')
        .replace(/^'|'$/g, '')
        .trim();
      if (cleaned && cleaned.length >= 2 && cleaned.length <= 80 && !/^\d+[\s,.\d]*$/.test(cleaned) && !/^[★⭐\d\s().·]+$/.test(cleaned)) {
        result.name = cleaned;
      }
    }
  }

  return result;
}
window.parseMapsShareText = parseMapsShareText;

function extractPlaceNameFromShareText(rawText) {
  const parsed = parseMapsShareText(rawText);
  return parsed.name || '';
}
window.extractPlaceNameFromShareText = extractPlaceNameFromShareText;

// Smart Cuisine & Must-Try Dish Recommendation Engine
function generateDiningRecommendations(name, categories, city) {
  const cats = (categories || []).map(c => String(c).toLowerCase()).join(' ');
  const n = String(name || '').toLowerCase();
  const text = cats + ' ' + n;

  if (/steamboat|hot\s*pot|haidilao|火锅|shabu|sukiyaki/i.test(text)) {
    return {
      cuisine: 'Hot Pot & Steamboat',
      signature: 'Signature slow-simmered soup broth, premium sliced beef/pork, seafood platter & handmade fish/meat balls.',
      items: ['Signature Soup Base', 'Fresh Meat Platter', 'Handmade Meatballs', 'Seafood Platter', 'Fried Tofu Skin']
    };
  }
  if (/fine\s*dining|italian|french|steakhouse|bistro|wine|steak|european/i.test(text)) {
    return {
      cuisine: 'Fine Dining & Western',
      signature: 'Chef tasting multi-course menu, artisanal pasta, premium ribeye/tenderloin steak & signature wine pairing.',
      items: ['Chef Tasting Menu', 'Handmade Pasta', 'Premium Steak', 'Signature Dessert', 'Wine Pairing']
    };
  }
  if (/ramen|sushi|japanese|izakaya|udon|donburi|tempura|yakiniku|日料|居酒屋/i.test(text)) {
    return {
      cuisine: 'Japanese Cuisine',
      signature: 'Rich tonkotsu ramen broth, fresh sashimi slices, assorted nigiri sushi & crispy chicken karaage.',
      items: ['Special Tonkotsu Ramen', 'Salmon Sashimi', 'Aburi Sushi Platter', 'Chicken Karaage', 'Gyoza']
    };
  }
  if (/cafe|coffee|bakery|pastry|dessert|tea|brunch|waffle|cheesecake|croissant|keke|bakes|patisserie|gelato|boba|toast|咖啡|蛋糕/i.test(text)) {
    return {
      cuisine: 'Cafe & Bakery',
      signature: 'Specialty hand-drip coffee, artisanal brunch plate, signature burnt cheesecake & matcha latte.',
      items: ['Specialty Hand-Drip Coffee', 'Artisan Brunch Plate', 'Burnt Cheesecake', 'Matcha Latte', 'Butter Croissant']
    };
  }
  if (/korean|bbq|kimchi|tteokbokki|samgyeopsal|chimaek|韩式|烤肉/i.test(text)) {
    return {
      cuisine: 'Korean Cuisine',
      signature: 'Crispy soy garlic fried chicken, sizzling Korean BBQ pork belly, kimchi stew & seafood pancake.',
      items: ['Korean Fried Chicken', 'Pork Belly BBQ', 'Kimchi Jjigae', 'Seafood Pancake', 'Tteokbokki']
    };
  }
  if (/thai|tom\s*yum|mookata|pad\s*thai|som\s*tum|泰式|冬阴功/i.test(text)) {
    return {
      cuisine: 'Thai Cuisine',
      signature: 'Aromatic seafood Tom Yum Goong, green curry chicken, pad thai noodles & sweet mango sticky rice.',
      items: ['Seafood Tom Yum', 'Green Curry Chicken', 'Pad Thai', 'Mango Sticky Rice', 'Thai Milk Tea']
    };
  }
  if (/dim\s*sum|chinese|cantonese|sichuan|roast|noodle|pork|chilli|点心|粤菜|川菜|烧腊/i.test(text)) {
    return {
      cuisine: 'Chinese & Heritage',
      signature: 'Steamed siew mai & har gao dim sum, crispy roasted pork, wok-hei fried noodles & herbal soup.',
      items: ['Steamed Dim Sum Platter', 'Signature Roast Pork / Duck', 'Wok-Hei Fried Noodles', 'Double-Boiled Herbal Soup']
    };
  }
  if (/kopitiam|nasi\s*lemak|mamak|curry|roti|satay|laksa|hawker|white\s*coffee|茶餐室/i.test(text)) {
    return {
      cuisine: 'Malaysian Heritage Food',
      signature: 'Fragrant nasi lemak with spiced fried chicken, traditional Ipoh white coffee, kaya toast & curry mee.',
      items: ['Nasi Lemak Ayam Goreng', 'Traditional White Coffee', 'Kaya Butter Toast', 'Curry Mee', 'Roti Canai']
    };
  }
  if (/burger|fast\s*food|pizza|fried\s*chicken|fries|taco|mexican/i.test(text)) {
    return {
      cuisine: 'Burgers & Comfort Food',
      signature: 'Juicy handcrafted smash burger, loaded cheese fries, woodfired pizza & artisanal milkshakes.',
      items: ['Handcrafted Smash Burger', 'Loaded Cheese Fries', 'Woodfired Pizza', 'Crispy Chicken Tenders']
    };
  }
  if (/bar|pub|cocktail|beer|brewery|lounge|tapas/i.test(text)) {
    return {
      cuisine: 'Bar & Lounge',
      signature: 'Craft cocktails, artisanal draft beers, truffle fries & sharing tapas board.',
      items: ['Signature Cocktail', 'Craft Beer Pint', 'Truffle Fries', 'Tapas Sharing Board']
    };
  }

  const primaryCat = categories && categories[0] ? categories[0] : 'Restaurant Specialties';
  return {
    cuisine: primaryCat,
    signature: `House specialty dishes, chef recommendations, and popular customer favorites at ${name || 'this restaurant'}.`,
    items: ['House Specialty', 'Chef Recommendation', 'Signature Drink', 'Popular Side Dish']
  };
}
window.generateDiningRecommendations = generateDiningRecommendations;

// Pull place name + coordinates out of an expanded Google Maps URL
function parseGoogleMapsUrl(urlStr){
  const out = { name: '', lat: null, lng: null };
  let decoded = String(urlStr || '');
  try{ decoded = decodeURIComponent(decoded); }catch(e){}

  // Pin coordinates (!3d..!4d..) are the most accurate; @lat,lng is the map centre
  let m = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
       || decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
       || decoded.match(/[?&](?:q|ll|query|destination|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if(m){
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    if(isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180){ out.lat = lat; out.lng = lng; }
  }

  try{
    const u = new URL(urlStr);
    let nm = '';
    const pm = u.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);
    if(pm) nm = pm[1];
    else nm = u.searchParams.get('q') || u.searchParams.get('query') || '';
    nm = nm.replace(/\+/g, ' ');
    try{ nm = decodeURIComponent(nm); }catch(e){}
    const parts = nm.split(',').map(s => s.trim()).filter(Boolean);
    if(parts.length > 0 && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(parts[0])){
      out.name = parts[0];
      if(parts.length > 1){
        out.address = parts.slice(1).join(', ');
      }
    }
  }catch(e){}
  return out;
}
window.parseGoogleMapsUrl = parseGoogleMapsUrl;

function restCodeToFlag(code){
  code = String(code || '').toUpperCase();
  if(!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}
window.restCodeToFlag = restCodeToFlag;

// Parse rich OpenGraph/place metadata returned by CORS-friendly Microlink
function parseMicrolinkPlace(data){
  if(!data) return null;
  const title = String(data.title || data.publisher || '').trim();
  const desc = String(data.description || '').trim();

  let name = '';
  let address = '';
  let city = '';
  let state = '';
  let country = 'Malaysia';
  let rating = null;
  let cuisine = '';

  if(title && !/^Google Maps/i.test(title)){
    const parts = title.split('·').map(s => s.trim()).filter(Boolean);
    if(parts.length >= 2){
      name = parts[0];
      address = parts.slice(1).join(', ');
    } else {
      name = title;
    }
  }

  // Parse address for known cities & states
  if(address){
    const addrLow = address.toLowerCase();
    if(addrLow.includes('ipoh')) { city = 'Ipoh'; state = 'Perak'; }
    else if(addrLow.includes('kuala lumpur') || addrLow.includes('kl')) { city = 'Kuala Lumpur'; state = 'Kuala Lumpur'; }
    else if(addrLow.includes('petaling jaya') || addrLow.includes('pj') || addrLow.includes('subang') || addrLow.includes('shah alam')) { city = 'Petaling Jaya'; state = 'Selangor'; }
    else if(addrLow.includes('george town') || addrLow.includes('penang')) { city = 'Penang'; state = 'Penang'; }
    else if(addrLow.includes('johor bahru') || addrLow.includes('jb')) { city = 'Johor Bahru'; state = 'Johor'; }
    else if(addrLow.includes('melaka') || addrLow.includes('malacca')) { city = 'Melaka'; state = 'Melaka'; }
    else if(addrLow.includes('kuching')) { city = 'Kuching'; state = 'Sarawak'; }
    else if(addrLow.includes('kota kinabalu')) { city = 'Kota Kinabalu'; state = 'Sabah'; }
    else if(addrLow.includes('singapore')) { city = 'Singapore'; country = 'Singapore'; }
    else if(addrLow.includes('bangkok')) { city = 'Bangkok'; country = 'Thailand'; }
    else if(addrLow.includes('tokyo')) { city = 'Tokyo'; country = 'Japan'; }
  }

  // Parse description for rating & cuisine
  if(desc){
    const descParts = desc.split('·').map(s => s.trim()).filter(Boolean);
    for(const part of descParts){
      if(/^[★⭐]+$/.test(part)){
        rating = (part.match(/[★⭐]/g) || []).length;
      } else if(/(\d+(?:\.\d+)?)\s*[★⭐]/.test(part)){
        const m = part.match(/(\d+(?:\.\d+)?)\s*[★⭐]/);
        if(m) rating = parseFloat(m[1]);
      } else if(!cuisine && !/review|direction|map|local business|find local/i.test(part)){
        cuisine = part;
      }
    }
  }

  if(!name) return null;
  return { name, address, city, state, country, rating, cuisine };
}
window.parseMicrolinkPlace = parseMicrolinkPlace;

// Complete zero-manual-input extraction pipeline: captures name, real rating,
// review count, cuisine category, address, phone, hours, coordinates & recommendations
async function capturePlaceFromGoogleMaps(raw){
  const url = extractMapsUrl(raw);
  if(!url){
    return { ok: false, error: 'no_url' };
  }

  // Parse share sheet text metadata first (mobile user often pastes text + URL)
  const shareMeta = parseMapsShareText(raw);

  let backendData = null;
  // 1) Expand short link & fetch rich place details via local backend
  try{
    const r = await fetch('/api/resolve-map?url=' + encodeURIComponent(url));
    if(r.ok){
      const j = await r.json();
      if(j && (j.name || j.url)){
        backendData = j;
      }
    }
  }catch(e){}

  // 1b) Cloud / Static hosting fallback (e.g. GitHub Pages, Netlify static, PWA mobile)
  // When local backend is not available, fetch via CORS-enabled Microlink API
  if(!backendData || !backendData.name || backendData.name === 'Wishlist Place'){
    try{
      const microRes = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(url));
      if(microRes.ok){
        const microJson = await microRes.json();
        if(microJson && microJson.data){
          const parsed = parseMicrolinkPlace(microJson.data);
          if(parsed && parsed.name){
            backendData = {
              ok: true,
              name: parsed.name,
              address: parsed.address,
              city: parsed.city,
              state: parsed.state,
              country: parsed.country,
              rating: parsed.rating,
              cuisine: parsed.cuisine,
              finalUrl: microJson.data.url || url,
              imageUrl: microJson.data.image ? microJson.data.image.url : null
            };
          }
        }
      }
    }catch(e){}
  }

  let finalUrl = (backendData && (backendData.finalUrl || backendData.url)) || url;

  // 2) Parse URL for place name and coordinates
  const urlInfo = parseGoogleMapsUrl(finalUrl);

  // Name resolution priority: backend details > share text > URL pathname
  let name = (backendData && backendData.name && backendData.name !== 'Wishlist Place') 
    ? backendData.name 
    : (shareMeta.name || urlInfo.name || '');

  // Rating & review count
  let rating = (backendData && backendData.rating) || shareMeta.rating || null;
  let reviewsCount = (backendData && backendData.reviewsCount) || shareMeta.reviewsCount || null;
  let reviewsCountText = (backendData && backendData.reviewsCountText) || shareMeta.reviewsCountText || (reviewsCount ? `${reviewsCount} reviews` : '');

  // Categories & cuisine
  let categories = (backendData && backendData.categories && backendData.categories.length > 0)
    ? backendData.categories
    : (shareMeta.cuisine ? [shareMeta.cuisine] : []);
  let cuisine = (backendData && backendData.cuisine) || shareMeta.cuisine || '';

  // Address, phone, openStatus
  let address = (backendData && backendData.address) || shareMeta.address || '';
  let phone = (backendData && backendData.phone) || '';
  let openStatus = (backendData && backendData.openStatus) || '';
  if(typeof openStatus === 'string' && /suggest an edit|claim this|add hours|own this|add website|add phone|add missing/i.test(openStatus)){
    openStatus = '';
  }

  // Coordinates
  let lat = (backendData && backendData.lat !== undefined && backendData.lat !== null) ? backendData.lat : urlInfo.lat;
  let lng = (backendData && backendData.lng !== undefined && backendData.lng !== null) ? backendData.lng : urlInfo.lng;

  // 3) Reverse-geocode coordinates via OpenStreetMap Nominatim if address or city is missing
  let geo = null;
  if(lat !== null && lng !== null && (!address || !name)){
    try{
      const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'PocketWinnie/4.6' }
      });
      if(gr.ok) geo = await gr.json();
    }catch(e){}
  }

  if(!name){
    name = (geo && (geo.name || (geo.address && (geo.address.amenity || geo.address.restaurant || geo.address.cafe || geo.address.shop)))) || '';
  }
  if(!address && geo && geo.display_name){
    address = geo.display_name;
  }

  // Country & City resolution
  let countryName = 'Malaysia';
  let countryCode = (backendData && backendData.countryCode) || 'MY';
  let flag = '🇲🇾';
  let currency = 'MYR';
  let city = (backendData && backendData.city) || '';
  let state = (backendData && backendData.state) || '';

  if(geo && geo.address){
    const a = geo.address;
    const code = String(a.country_code || '').toUpperCase();
    const known = RESTAURANT_COUNTRIES.find(c => c.code === code);
    if(known){
      countryName = known.name;
      countryCode = known.code;
      flag = known.flag;
      currency = known.currency;
    } else if(a.country){
      countryName = a.country;
      countryCode = code || 'XX';
      flag = restCodeToFlag(code);
      currency = 'USD';
    }
    if(!city) city = a.city || a.town || a.village || a.municipality || a.suburb || a.city_district || a.state_district || a.state || '';
    if(!state) state = a.state || '';
  } else {
    const known = RESTAURANT_COUNTRIES.find(c => c.code === countryCode);
    if(known){
      countryName = known.name;
      flag = known.flag;
      currency = known.currency;
    } else if(name){
      const detected = detectCountryFromText(name);
      if(detected){
        countryName = detected.name;
        countryCode = detected.code;
        flag = detected.flag;
        currency = detected.currency;
      }
    }
  }

  // Recommendations & signature highlights
  let recommendations = (backendData && backendData.recommendations) || [];
  let recommendationText = (backendData && backendData.recommendationText) || '';

  if(!recommendationText || recommendations.length === 0){
    const localReco = generateDiningRecommendations(name, categories, city);
    cuisine = cuisine || localReco.cuisine;
    recommendations = localReco.items;
    recommendationText = localReco.signature;
  }

  // Formatted notes combining signature highlights, address & hours
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const notesLines = [];
  if(recommendationText) notesLines.push(`💡 ${recommendationText}`);
  if(recommendations && recommendations.length > 0) notesLines.push(`✨ ${isZh ? '必点招牌' : 'Must-Try'}: ${recommendations.join(', ')}`);
  if(address) notesLines.push(`🏠 ${address}`);
  if(openStatus) notesLines.push(`🕒 ${openStatus}`);
  if(phone) notesLines.push(`📞 ${phone}`);
  const notes = notesLines.join('\n');

  // Pre-generate dishes from recommendations
  const items = (recommendations || []).map(rName => ({
    name: rName,
    qty: 1,
    price: 0,
    calories: (typeof estimateCaloriesFromName === 'function' ? estimateCaloriesFromName(rName) : 0),
    protein: 0
  }));

  return {
    ok: true,
    name: name || (city ? `${city} ${cuisine || (isZh ? '精选餐厅' : 'Restaurant')}` : (countryName ? `${countryName} ${cuisine || (isZh ? '精选餐厅' : 'Restaurant')}` : (isZh ? '想吃餐厅' : 'Wishlist Restaurant'))),
    rating,
    ratingNum: rating,
    reviewsCount,
    reviewsCountText,
    categories,
    cuisine,
    address,
    city,
    state,
    country: countryName,
    countryCode,
    flag,
    currency,
    phone,
    openStatus,
    priceLevel: (backendData && backendData.priceLevel) || '',
    website: (backendData && backendData.website) || '',
    recommendations,
    recommendationText,
    notes,
    items,
    lat,
    lng,
    mapUrl: finalUrl
  };
}
window.capturePlaceFromGoogleMaps = capturePlaceFromGoogleMaps;

let _restMapLastUrl = '';
let _lastCapturedPlaceData = null;
let _restMapTimer = null;

// Called on keystroke / paste in the full modal map-link field
function onRestMapInput(val){
  clearTimeout(_restMapTimer);
  _restMapTimer = setTimeout(() => autoFillFromMapsLink(val, false), 450);
}
window.onRestMapInput = onRestMapInput;

async function autoFillFromMapsLink(raw, force){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const statusEl = el('rest-map-status');
  const setStatus = (msg, color) => { if(statusEl){ statusEl.textContent = msg; statusEl.style.color = color || 'var(--muted)'; } };

  const url = extractMapsUrl(raw);
  if(!url){
    if(raw && String(raw).trim()) setStatus(isZh ? '⚠️ 未检测到 Google 地图链接' : '⚠️ No Google Maps link detected', '#ef4444');
    else setStatus('');
    return;
  }
  if(!force && url === _restMapLastUrl) return;
  _restMapLastUrl = url;
  setStatus(isZh ? '⏳ 正在提取地点信息与招牌推荐…' : '⏳ Auto-capturing place info & recommendations…');

  const res = await capturePlaceFromGoogleMaps(raw);
  if(!res.ok){
    setStatus(isZh ? '⚠️ 无法解析该链接' : '⚠️ Could not parse this link', '#ef4444');
    return;
  }
  _lastCapturedPlaceData = res;

  const nameInp = el('rest-name-inp');
  if(nameInp && res.name && (force || !nameInp.value.trim())) nameInp.value = res.name;
  if(el('rest-lat-inp')) el('rest-lat-inp').value = res.lat !== null ? res.lat : '';
  if(el('rest-lng-inp')) el('rest-lng-inp').value = res.lng !== null ? res.lng : '';

  const sel = el('rest-country-sel');
  if(sel && res.country){
    if(RESTAURANT_COUNTRIES.some(c => c.name === res.country)){
      sel.value = res.country;
      onRestCountryChange(res.country);
    } else {
      sel.value = 'Other';
      onRestCountryChange('Other');
      if(el('rest-custom-country-inp')) el('rest-custom-country-inp').value = res.country;
      if(el('rest-custom-flag-inp')) el('rest-custom-flag-inp').value = res.flag;
    }
  }
  const cityInp = el('rest-city-inp');
  if(cityInp && res.city && (force || !cityInp.value.trim())) cityInp.value = res.city;

  if(el('rest-cuisine-inp') && res.cuisine && (force || !el('rest-cuisine-inp').value.trim())){
    el('rest-cuisine-inp').value = res.cuisine;
  }
  if(el('rest-address-inp') && res.address && (force || !el('rest-address-inp').value.trim())){
    el('rest-address-inp').value = res.address;
  }
  if(el('rest-phone-inp') && res.phone && (force || !el('rest-phone-inp').value.trim())){
    el('rest-phone-inp').value = res.phone;
  }
  if(el('rest-notes-inp') && res.notes && (force || !el('rest-notes-inp').value.trim())){
    el('rest-notes-inp').value = res.notes;
  }
  if(el('rest-rating-sel') && res.rating){
    el('rest-rating-sel').value = Math.max(1, Math.min(5, Math.round(res.rating)));
  }

  // Pre-fill dishes if empty
  const dishContainer = el('rest-dishes-container');
  if(dishContainer && res.items && res.items.length > 0){
    const existingRows = dishContainer.querySelectorAll('.rest-dish-row');
    const firstRowName = existingRows[0] ? existingRows[0].querySelector('.rest-dish-name')?.value.trim() : '';
    if(existingRows.length <= 1 && !firstRowName){
      dishContainer.innerHTML = '';
      res.items.forEach(it => {
        addRestFoodItemRow(it.name, '', it.calories, 0);
      });
      recalcRestDishTotals();
    }
  }

  const parts = [
    res.name,
    res.cuisine,
    res.rating ? `⭐ ${res.rating}` : '',
    res.city,
    res.flag + ' ' + res.country
  ].filter(Boolean).join(' · ');

  const quickSaveBtn = `<button type="button" class="chip" onclick="saveRestaurantRecord()" style="margin-left:6px;background:#10b981;color:#fff;font-weight:800;font-size:10.5px;padding:2px 8px;border-radius:6px;cursor:pointer">💾 ${isZh ? '直接保存' : 'Save Now'}</button>`;
  if(statusEl){
    statusEl.innerHTML = `<span style="color:#10b981">${isZh ? '✅ 已自动捕获：' : '✅ Auto-captured: '} ${esc(parts || 'OK')}</span>${quickSaveBtn}`;
  }
}
window.autoFillFromMapsLink = autoFillFromMapsLink;

// Instant 1-Step Wishlist Add: Auto-captures store name, real rating, cuisine,
// address, hours, and culinary recommendations and saves immediately!
async function quickAddWishlistFromUrl(raw, source){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  let statusEl = null;
  let inputEl = null;

  if(source === 'modal'){
    statusEl = el('quick-wishlist-status');
    inputEl = el('quick-wishlist-url-inp');
  } else if(source === 'page'){
    statusEl = el('passport-quick-map-status-page');
    inputEl = el('passport-quick-map-url-page');
  } else if(source === 'popup'){
    statusEl = el('passport-quick-map-status-popup');
    inputEl = el('passport-quick-map-url-popup');
  }

  const setStatus = (msg, color) => {
    if(statusEl){
      statusEl.textContent = msg;
      statusEl.style.color = color || 'var(--muted)';
    }
  };

  if(!raw || !String(raw).trim()){
    setStatus(isZh ? '⚠️ 请粘贴 Google 地图链接' : '⚠️ Please paste a Google Maps link', '#ef4444');
    return;
  }

  setStatus(isZh ? '⏳ 正在自动识别店名、评分、地址与必点招牌推荐…' : '⏳ Auto-capturing place, rating, address & dish recommendations…', 'var(--amber)');

  try{
    const res = await capturePlaceFromGoogleMaps(raw);
    if(!res.ok){
      setStatus(isZh ? '⚠️ 未识别到有效的 Google 地图链接，请检查后再试' : '⚠️ No valid Google Maps link found, please check and try again', '#ef4444');
      return;
    }

    const newRecord = {
      id: 'rest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: res.name,
      country: res.country || 'Malaysia',
      countryCode: res.countryCode || 'MY',
      flag: res.flag || '🇲🇾',
      city: res.city || '',
      state: res.state || '',
      status: 'pending', // Wishlist!
      date: today(),
      rating: res.rating ? Math.round(res.rating) : 5,
      ratingNum: res.ratingNum || res.rating || null,
      reviewsCount: res.reviewsCount || null,
      reviewsCountText: res.reviewsCountText || '',
      categories: res.categories || [],
      cuisine: res.cuisine || '',
      address: res.address || '',
      phone: res.phone || '',
      openStatus: res.openStatus || '',
      openHours: res.openHours || [],
      priceLevel: res.priceLevel || '',
      website: res.website || '',
      recommendations: res.recommendations || [],
      recommendationText: res.recommendationText || '',
      currency: res.currency || 'MYR',
      amountOriginal: 0,
      amountMYR: 0,
      notes: res.notes || '',
      items: res.items || [],
      totalCalories: (res.items || []).reduce((acc, it) => acc + (it.calories || 0), 0),
      totalProtein: (res.items || []).reduce((acc, it) => acc + (it.protein || 0), 0),
      mapUrl: res.mapUrl || '',
      lat: res.lat,
      lng: res.lng,
      createdAt: new Date().toISOString()
    };

    if(!S.restaurantRecords) S.restaurantRecords = [];
    S.restaurantRecords.push(newRecord);
    save();

    if(inputEl) inputEl.value = '';
    const ratingTag = newRecord.ratingNum ? ` ⭐${newRecord.ratingNum}` : '';
    const cuisineTag = newRecord.cuisine ? ` · ${newRecord.cuisine}` : '';
    setStatus((isZh ? '🎉 已成功加入想吃清单：' : '🎉 Added to Wishlist: ') + `${newRecord.flag} ${newRecord.name}${ratingTag}${cuisineTag}`, '#10b981');

    renderPassportPage();
    renderRestaurantPassport();
    renderRestaurantPassportWidget();
    renderAll();

    toast(isZh 
      ? `🎉 成功加入想吃清单：${newRecord.flag} ${newRecord.name}！已自动识别评分、地址与必点推荐！` 
      : `🎉 Added to Wishlist: ${newRecord.flag} ${newRecord.name}! Captured rating, address & dish recommendations!`);

    if(source === 'modal'){
      setTimeout(() => closeModal('quick-wishlist-modal'), 750);
    }
  }catch(err){
    console.error('Quick add wishlist error:', err);
    setStatus(isZh ? '⚠️ 提取失败，请重试' : '⚠️ Failed to auto-capture, please try again', '#ef4444');
  }
}
window.quickAddWishlistFromUrl = quickAddWishlistFromUrl;

// 1-Tap Refresh / Sync details and recommendations for any existing wishlist item
async function enrichExistingWishlistRecord(id){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!S.restaurantRecords) return;
  const r = S.restaurantRecords.find(x => x.id === id);
  if(!r || !r.mapUrl){
    toast(isZh ? '⚠️ 该记录没有 Google 地图链接' : '⚠️ No Google Maps link found for this place');
    return;
  }
  toast(isZh ? '⏳ 正在从 Google 地图刷新最新信息与招牌推荐…' : '⏳ Refreshing details & recommendations from Google Maps…');
  try{
    const res = await capturePlaceFromGoogleMaps(r.mapUrl);
    if(!res.ok){
      toast(isZh ? '⚠️ 无法从地图获取最新信息' : '⚠️ Could not fetch latest info from map');
      return;
    }
    if(res.name && res.name !== 'Wishlist Restaurant' && (!r.name || r.name.startsWith('Wishlist') || r.name.startsWith('想吃'))){
      r.name = res.name;
    }
    if(res.rating){
      r.rating = Math.round(res.rating);
      r.ratingNum = res.rating;
    }
    if(res.reviewsCount) r.reviewsCount = res.reviewsCount;
    if(res.reviewsCountText) r.reviewsCountText = res.reviewsCountText;
    if(res.cuisine) r.cuisine = res.cuisine;
    if(res.categories && res.categories.length > 0) r.categories = res.categories;
    if(res.address) r.address = res.address;
    if(res.city && !r.city) r.city = res.city;
    if(res.state && !r.state) r.state = res.state;
    if(res.phone) r.phone = res.phone;
    if(res.openStatus) r.openStatus = res.openStatus;
    if(res.openHours && res.openHours.length > 0) r.openHours = res.openHours;
    if(res.recommendations && res.recommendations.length > 0) r.recommendations = res.recommendations;
    if(res.recommendationText) r.recommendationText = res.recommendationText;
    if(res.lat !== null && res.lat !== undefined) r.lat = res.lat;
    if(res.lng !== null && res.lng !== undefined) r.lng = res.lng;
    if(res.notes && (!r.notes || r.notes.trim() === '')) r.notes = res.notes;
    if(res.items && res.items.length > 0 && (!r.items || r.items.length === 0)) r.items = res.items;

    save();
    renderPassportPage();
    renderRestaurantPassport();
    renderRestaurantPassportWidget();
    renderAll();
    toast(isZh ? `✅ 已成功更新 ${r.name} 的信息与招牌推荐！` : `✅ Updated ${r.name} with latest details & recommendations!`);
  }catch(e){
    toast(isZh ? '⚠️ 刷新失败，请稍后重试' : '⚠️ Failed to refresh, please try again');
  }
}
window.enrichExistingWishlistRecord = enrichExistingWishlistRecord;

function openQuickWishlistModal(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const inp = el('quick-wishlist-url-inp');
  const title = el('quick-wishlist-modal-title');
  const sub = el('quick-wishlist-modal-sub');
  const lbl = el('quick-wishlist-lbl');
  const btn = el('quick-wishlist-submit-btn');
  const status = el('quick-wishlist-status');

  if(inp) inp.value = '';
  if(status) status.textContent = '';
  if(title) title.textContent = isZh ? '📌 添加到想吃清单' : '📌 Add to Wishlist';
  if(sub) sub.textContent = isZh 
    ? '直接粘贴 Google 地图链接 — 店名、城市、国家与定位自动秒捕获，无需手动填写！' 
    : 'Paste any Google Maps link — place name, city, country & pin location will be auto-captured with zero typing!';
  if(lbl) lbl.textContent = isZh ? '📍 Google 地图链接或分享内容' : '📍 Google Maps Link or Share Text';
  if(btn) btn.textContent = isZh ? '⚡ 自动捕获并保存' : '⚡ Auto-Capture & Save';

  openModal('quick-wishlist-modal');
  setTimeout(() => { if(inp) inp.focus(); }, 100);

  if(navigator.clipboard && navigator.clipboard.readText){
    navigator.clipboard.readText().then(clip => {
      if(clip && extractMapsUrl(clip) && inp && !inp.value){
        inp.value = clip;
        if(status){
          status.textContent = isZh ? '📋 已从剪贴板读取地图链接，点击即可保存' : '📋 Pasted from clipboard, tap save to add';
          status.style.color = 'var(--cyan)';
        }
      }
    }).catch(()=>{});
  }
}
window.openQuickWishlistModal = openQuickWishlistModal;

function onQuickWishlistInput(val){
  const status = el('quick-wishlist-status');
  if(status && val && extractMapsUrl(val)){
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    status.textContent = isZh ? '✨ 地图链接有效，点击按钮或回车立即自动捕获！' : '✨ Link detected, click button or press Enter to auto-save!';
    status.style.color = 'var(--amber)';
  }
}
window.onQuickWishlistInput = onQuickWishlistInput;

function submitQuickWishlistModal(){
  const inp = el('quick-wishlist-url-inp');
  const val = inp ? inp.value.trim() : '';
  quickAddWishlistFromUrl(val, 'modal');
}
window.submitQuickWishlistModal = submitQuickWishlistModal;

function handleInlineWishlistPaste(source){
  const inp = el(`passport-quick-map-url-${source}`);
  if(inp && inp.value.trim()){
    quickAddWishlistFromUrl(inp.value.trim(), source);
  }
}
window.handleInlineWishlistPaste = handleInlineWishlistPaste;

function submitInlineWishlistQuickAdd(source){
  const inp = el(`passport-quick-map-url-${source}`);
  if(inp){
    quickAddWishlistFromUrl(inp.value.trim(), source);
  }
}
window.submitInlineWishlistQuickAdd = submitInlineWishlistQuickAdd;

// One-tap: read clipboard → fill input → auto-add
async function pasteAndAutoAdd(source){
  const inp = el(`passport-quick-map-url-${source}`);
  if(!inp) return;
  const statusEl = el(`passport-quick-map-status-${source}`);
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  try {
    const text = await navigator.clipboard.readText();
    if(text && text.trim()){
      inp.value = text.trim();
      quickAddWishlistFromUrl(text.trim(), source);
    } else {
      if(statusEl) statusEl.textContent = isZh ? '⚠️ 剪贴板是空的，请先复制 Google 地图链接！' : '⚠️ Clipboard is empty — copy a Google Maps link first!';
    }
  } catch(e) {
    // Clipboard API blocked — fallback: just submit what's in the input
    if(inp.value.trim()){
      quickAddWishlistFromUrl(inp.value.trim(), source);
    } else {
      if(statusEl) statusEl.textContent = isZh ? '⚠️ 无法读取剪贴板，请手动粘贴链接到输入框' : '⚠️ Cannot read clipboard — please paste the link manually into the field';
    }
  }
}
window.pasteAndAutoAdd = pasteAndAutoAdd;

function autoDetectCountryFromRestName(name){
  if(!name) return;
  const detected = detectCountryFromText(name);
  if(detected){
    const sel = el('rest-country-sel');
    if(sel && sel.value !== detected.name){
      sel.value = detected.name;
      onRestCountryChange(detected.name);
    }
  }
}
window.autoDetectCountryFromRestName = autoDetectCountryFromRestName;

function calcRestConvertedMYR(){
  const amtInp = el('rest-amount-inp');
  const currSel = el('rest-curr-sel');
  const disp = el('rest-converted-myr-display');
  if(!disp) return;

  const amt = amtInp ? parseFloat(amtInp.value) || 0 : 0;
  const curr = currSel ? currSel.value : 'MYR';

  if(amt <= 0){
    disp.textContent = 'RM 0.00';
    return;
  }
  const myrVal = convertAmountToMYR(amt, curr);
  disp.textContent = `RM ${myrVal.toFixed(2)}`;
}
window.calcRestConvertedMYR = calcRestConvertedMYR;

function addRestFoodItemRow(name = '', price = '', cal = '', prot = ''){
  const container = el('rest-dishes-container');
  if(!container) return;

  const row = document.createElement('div');
  row.className = 'rest-dish-row';
  row.style.cssText = 'display:grid;grid-template-columns:1.5fr 1fr 1fr 28px;gap:6px;align-items:center';
  row.innerHTML = `
    <input type="text" class="form-input rest-dish-name" placeholder="Dish Name (菜品名)" value="${esc(name)}" onblur="autoEstimateDishNutrition(this)" style="font-size:11.5px;padding:6px 8px"/>
    <input type="number" class="form-input rest-dish-cal" placeholder="🔥 kcal" value="${cal > 0 ? cal : ''}" oninput="recalcRestDishTotals()" style="font-size:11px;padding:6px 6px;text-align:center"/>
    <input type="number" class="form-input rest-dish-prot" placeholder="🥩 prot(g)" value="${prot > 0 ? prot : ''}" oninput="recalcRestDishTotals()" style="font-size:11px;padding:6px 6px;text-align:center"/>
    <button type="button" onclick="removeRestFoodItemRow(this)" style="background:rgba(239,68,68,.12);border:none;color:var(--red);border-radius:6px;height:30px;cursor:pointer;font-size:12px;font-weight:900">✕</button>
  `;
  container.appendChild(row);
  recalcRestDishTotals();
}
window.addRestFoodItemRow = addRestFoodItemRow;

function removeRestFoodItemRow(btn){
  const row = btn.closest('.rest-dish-row');
  if(row){
    row.remove();
    recalcRestDishTotals();
  }
}
window.removeRestFoodItemRow = removeRestFoodItemRow;

function autoEstimateDishNutrition(input){
  if(!input) return;
  const row = input.closest('.rest-dish-row');
  if(!row) return;
  const name = input.value.trim();
  const calInp = row.querySelector('.rest-dish-cal');
  const protInp = row.querySelector('.rest-dish-prot');
  
  if(name && (!calInp.value || parseInt(calInp.value) === 0)){
    const estCal = (typeof estimateCaloriesFromName === 'function') ? estimateCaloriesFromName(name) : -1;
    if(estCal >= 0) calInp.value = estCal;
  }
  if(name && (!protInp.value || parseInt(protInp.value) === 0)){
    const estProt = (typeof estimateProteinFromName === 'function') ? estimateProteinFromName(name) : -1;
    if(estProt >= 0) protInp.value = estProt;
    else if(calInp.value && parseInt(calInp.value) > 0){
      protInp.value = Math.max(1, Math.round(parseInt(calInp.value) * 0.04));
    }
  }
  recalcRestDishTotals();
}
window.autoEstimateDishNutrition = autoEstimateDishNutrition;

function recalcRestDishTotals(){
  const container = el('rest-dishes-container');
  if(!container) return;
  const rows = container.querySelectorAll('.rest-dish-row');
  let totCal = 0;
  let totProt = 0;

  rows.forEach(r => {
    const c = parseInt(r.querySelector('.rest-dish-cal').value) || 0;
    const p = parseInt(r.querySelector('.rest-dish-prot').value) || 0;
    totCal += c;
    totProt += p;
  });

  const totCalEl = el('rest-tot-cal');
  const totProtEl = el('rest-tot-prot');
  if(totCalEl) totCalEl.textContent = `🔥 ${totCal} kcal`;
  if(totProtEl) totProtEl.textContent = `🥩 ${totProt}g`;
}
window.recalcRestDishTotals = recalcRestDishTotals;

async function saveRestaurantRecord(){
  const editId = el('rest-edit-id') ? el('rest-edit-id').value : '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  let name = el('rest-name-inp') ? el('rest-name-inp').value.trim() : '';
  const mapInpVal = el('rest-map-inp') ? el('rest-map-inp').value.trim() : '';
  if(!name && mapInpVal && extractMapsUrl(mapInpVal)){
    const res = await capturePlaceFromGoogleMaps(mapInpVal);
    if(res && res.ok){
      name = res.name || (res.city ? `${res.city} ${isZh ? '精选餐厅' : 'Restaurant'}` : (isZh ? '想吃餐厅' : 'Wishlist Restaurant'));
      if(el('rest-name-inp')) el('rest-name-inp').value = name;
      if(el('rest-lat-inp')) el('rest-lat-inp').value = res.lat !== null ? res.lat : '';
      if(el('rest-lng-inp')) el('rest-lng-inp').value = res.lng !== null ? res.lng : '';
      if(res.country && el('rest-country-sel')){ el('rest-country-sel').value = res.country; onRestCountryChange(res.country); }
      if(res.city && el('rest-city-inp')) el('rest-city-inp').value = res.city;
    }
  }
  if(!name){
    toast('⚠️ Please enter restaurant name');
    return;
  }

  const status = el('rest-status-inp') ? el('rest-status-inp').value : 'visited';
  let country = el('rest-country-sel') ? el('rest-country-sel').value : 'Malaysia';
  let countryCode = 'MY';
  let flag = '🇲🇾';

  if(country === 'Other'){
    const customName = el('rest-custom-country-inp') ? el('rest-custom-country-inp').value.trim() : '';
    country = customName || 'World';
    flag = el('rest-custom-flag-inp') ? el('rest-custom-flag-inp').value.trim() || '🌐' : '🌐';
    countryCode = 'XX';
  } else {
    const info = getCountryInfo(country);
    countryCode = info.code;
    flag = info.flag;
  }

  const city = el('rest-city-inp') ? el('rest-city-inp').value.trim() : '';
  const cuisine = el('rest-cuisine-inp') ? el('rest-cuisine-inp').value.trim() : '';
  const address = el('rest-address-inp') ? el('rest-address-inp').value.trim() : '';
  const phone = el('rest-phone-inp') ? el('rest-phone-inp').value.trim() : '';
  const date = el('rest-date-inp') ? el('rest-date-inp').value : today();
  const rating = el('rest-rating-sel') ? parseInt(el('rest-rating-sel').value) || 5 : 5;
  const currency = el('rest-curr-sel') ? el('rest-curr-sel').value : 'MYR';
  const amountOriginal = el('rest-amount-inp') ? parseFloat(el('rest-amount-inp').value) || 0 : 0;
  const amountMYR = convertAmountToMYR(amountOriginal, currency);
  const notes = el('rest-notes-inp') ? el('rest-notes-inp').value.trim() : '';
  const syncTx = el('rest-sync-tx-chk') ? el('rest-sync-tx-chk').checked : false;
  const mapUrl = extractMapsUrl(el('rest-map-inp') ? el('rest-map-inp').value : '') || '';
  const mapLatRaw = el('rest-lat-inp') ? parseFloat(el('rest-lat-inp').value) : NaN;
  const mapLngRaw = el('rest-lng-inp') ? parseFloat(el('rest-lng-inp').value) : NaN;
  const mapLat = isFinite(mapLatRaw) ? mapLatRaw : null;
  const mapLng = isFinite(mapLngRaw) ? mapLngRaw : null;

  // Extract dishes
  const container = el('rest-dishes-container');
  const items = [];
  let totalCalories = 0;
  let totalProtein = 0;

  if(container){
    const rows = container.querySelectorAll('.rest-dish-row');
    rows.forEach(r => {
      const dName = r.querySelector('.rest-dish-name').value.trim();
      const dCal = parseInt(r.querySelector('.rest-dish-cal').value) || 0;
      const dProt = parseInt(r.querySelector('.rest-dish-prot').value) || 0;
      if(dName){
        items.push({
          name: dName,
          qty: 1,
          price: 0,
          calories: dCal,
          protein: dProt
        });
        totalCalories += dCal;
        totalProtein += dProt;
      }
    });
  }

  if(!S.restaurantRecords) S.restaurantRecords = [];

  let recordId = editId;
  if(editId){
    const idx = S.restaurantRecords.findIndex(r => r.id === editId);
    if(idx >= 0){
      const existing = S.restaurantRecords[idx] || {};
      const extraData = _lastCapturedPlaceData || {};
      S.restaurantRecords[idx] = {
        ...existing,
        mapUrl,
        lat: mapLat,
        lng: mapLng,
        name,
        country,
        countryCode,
        flag,
        city,
        cuisine,
        address,
        phone,
        status,
        date,
        rating,
        currency,
        amountOriginal,
        amountMYR,
        notes,
        items,
        totalCalories,
        totalProtein,
        ratingNum: extraData.rating !== undefined ? extraData.rating : (existing.ratingNum || null),
        reviewsCount: extraData.reviewsCount !== undefined ? extraData.reviewsCount : (existing.reviewsCount || null),
        openStatus: extraData.openStatus !== undefined ? extraData.openStatus : (existing.openStatus || null),
        recommendations: (extraData.recommendations && extraData.recommendations.length > 0) ? extraData.recommendations : (existing.recommendations || []),
        recommendationText: extraData.recommendationText !== undefined ? extraData.recommendationText : (existing.recommendationText || '')
      };
    }
  } else {
    recordId = 'rest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const extraData = _lastCapturedPlaceData || {};
    const newRecord = {
      id: recordId,
      name,
      country,
      countryCode,
      flag,
      city,
      cuisine,
      address,
      phone,
      status,
      date,
      rating,
      currency,
      amountOriginal,
      amountMYR,
      notes,
      items,
      totalCalories,
      totalProtein,
      mapUrl,
      lat: mapLat,
      lng: mapLng,
      ratingNum: extraData.rating || null,
      reviewsCount: extraData.reviewsCount || null,
      openStatus: extraData.openStatus || null,
      recommendations: extraData.recommendations || [],
      recommendationText: extraData.recommendationText || '',
      createdAt: new Date().toISOString()
    };
    S.restaurantRecords.push(newRecord);
  }
  _lastCapturedPlaceData = null;

  // Optionally sync as an expense transaction in Pocket Winnie
  if(syncTx && status === 'visited' && amountMYR > 0){
    const defaultAcc = (S.accounts && S.accounts.length) ? S.accounts[0].id : '';
    const noteItems = items.map(it => `${it.name}${it.calories > 0 ? ` [${it.calories}kcal]` : ''}${it.protein > 0 ? ` [${it.protein}g protein]` : ''}`).join(', ');
    const fullNote = `${notes ? notes + ' · ' : ''}${flag} ${country}${city ? ' (' + city + ')' : ''}${noteItems ? ' · [Items: ' + noteItems + ']' : ''}`;
    
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'expense',
      amount: amountMYR,
      category: 'food',
      subCategory: 'dining_out',
      accId: defaultAcc,
      date: date || today(),
      desc: name,
      note: fullNote,
      items: items.map(it => ({ name: it.name, qty: 1, price: 0, calories: it.calories, protein: it.protein }))
    };
    if(!S.transactions) S.transactions = [];
    S.transactions.push(newTx);
  }

  save();
  closeModal('add-restaurant-modal');
  renderRestaurantPassport();
  renderRestaurantPassportWidget();
  renderPassportPage();
  renderAll();


  if(status === 'pending'){
    toast(isZh ? `📌 已成功加入想吃清单：${flag} ${name}！` : `📌 Added to Wishlist: ${flag} ${name}!`);
  } else {
    toast(isZh ? `🎉 成功记录 ${flag} ${name}！` : `🎉 Saved ${flag} ${name}!`);
  }
}
window.saveRestaurantRecord = saveRestaurantRecord;

function markRestaurantVisited(id){
  const record = (S.restaurantRecords || []).find(r => r.id === id);
  if(!record) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const promptAmt = prompt(
    isZh 
      ? `✅ 打卡探店：【${record.name}】\n请输入本次消费金额 (${record.currency || 'MYR'})：` 
      : `✅ Check-in & Log: [${record.name}]\nEnter total bill amount (${record.currency || 'MYR'}):`, 
    record.amountOriginal > 0 ? record.amountOriginal : ''
  );
  if(promptAmt === null) return;

  const amt = parseFloat(promptAmt) || 0;
  record.status = 'visited';
  record.date = today();
  record.amountOriginal = amt;
  record.amountMYR = convertAmountToMYR(amt, record.currency || 'MYR');

  // Also log into transactions if amount > 0
  if(record.amountMYR > 0){
    const defaultAcc = (S.accounts && S.accounts.length) ? S.accounts[0].id : '';
    const items = record.items || [];
    const noteItems = items.map(it => `${it.name}${it.calories > 0 ? ` [${it.calories}kcal]` : ''}${it.protein > 0 ? ` [${it.protein}g protein]` : ''}`).join(', ');
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'expense',
      amount: record.amountMYR,
      category: 'food',
      subCategory: 'dining_out',
      accId: defaultAcc,
      date: today(),
      desc: record.name,
      note: `${record.flag} ${record.country}${record.city ? ' (' + record.city + ')' : ''} · [Items: ${noteItems || record.name}]`,
      items: items
    };
    if(!S.transactions) S.transactions = [];
    S.transactions.push(newTx);
  }

  save();
  renderRestaurantPassport();
  renderRestaurantPassportWidget();
  renderPassportPage();
  renderAll();
  toast(isZh ? `🎉 恭喜打卡探店成功：${record.name}！` : `🎉 Checked in: ${record.name}!`);
}
window.markRestaurantVisited = markRestaurantVisited;

// Receipt-based check-in: upload receipt photo → AI extracts amount → auto check-in
async function receiptCheckIn(id, fileInput){
  const record = (S.restaurantRecords || []).find(r => r.id === id);
  if(!record) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const file = fileInput && fileInput.files && fileInput.files[0];
  if(!file) return;

  toast(isZh ? '📸 正在扫描收据...' : '📸 Scanning receipt...');

  try {
    // Read file as base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    let amount = 0;

    // Try AI scan if Gemini API key is available
    if(typeof analyzeReceiptWithGemini === 'function' && S.geminiApiKey){
      try {
        const result = await analyzeReceiptWithGemini(base64);
        if(result && result.amount > 0){
          amount = result.amount;
        }
      } catch(e){
        console.warn('AI receipt scan failed, falling back to manual:', e);
      }
    }

    // If AI didn't extract amount, prompt user
    if(amount <= 0){
      const promptAmt = prompt(
        isZh
          ? `📸 收据已上传：【${record.name}】\n请输入本次消费金额 (${record.currency || 'MYR'})：`
          : `📸 Receipt uploaded: [${record.name}]\nEnter total bill amount (${record.currency || 'MYR'}):`,
        ''
      );
      if(promptAmt === null){ fileInput.value = ''; return; }
      amount = parseFloat(promptAmt) || 0;
    }

    // Mark as visited
    record.status = 'visited';
    record.date = today();
    record.amountOriginal = amount;
    record.amountMYR = convertAmountToMYR(amount, record.currency || 'MYR');

    // Log transaction if amount > 0
    if(record.amountMYR > 0){
      const defaultAcc = (S.accounts && S.accounts.length) ? S.accounts[0].id : '';
      const items = record.items || [];
      const noteItems = items.map(it => `${it.name}${it.calories > 0 ? ` [${it.calories}kcal]` : ''}${it.protein > 0 ? ` [${it.protein}g protein]` : ''}`).join(', ');
      const newTx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'expense',
        amount: record.amountMYR,
        category: 'food',
        subCategory: 'dining_out',
        accId: defaultAcc,
        date: today(),
        desc: record.name,
        note: `${record.flag || ''} ${record.country || ''}${record.city ? ' (' + record.city + ')' : ''} · 📸 Receipt check-in${noteItems ? ' · [Items: ' + noteItems + ']' : ''}`
      };
      if(!S.transactions) S.transactions = [];
      S.transactions.push(newTx);
    }

    save();
    renderRestaurantPassport();
    renderRestaurantPassportWidget();
    renderPassportPage();
    renderAll();
    toast(isZh ? `🎉 📸 收据打卡成功：${record.name}！` : `🎉 📸 Receipt check-in: ${record.name}!`);
  } catch(e){
    console.error('receiptCheckIn error:', e);
    toast(isZh ? '❌ 收据处理失败，请重试' : '❌ Receipt processing failed, please try again');
  }
  fileInput.value = '';
}
window.receiptCheckIn = receiptCheckIn;

function deleteRestaurantRecord(id){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!confirm(isZh ? '确定要删除这条餐厅记录吗？' : 'Delete this restaurant record?')) return;
  S.restaurantRecords = (S.restaurantRecords || []).filter(r => r.id !== id);
  save();
  renderRestaurantPassport();
  renderRestaurantPassportWidget();
  renderPassportPage();
  toast(isZh ? '🗑️ 记录已删除' : '🗑️ Record deleted');
}
window.deleteRestaurantRecord = deleteRestaurantRecord;

function syncExistingFoodTxsToPassport(silent = false){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const foodTxs = (S.transactions || []).filter(t => t.type === 'expense' && (t.category === 'food' || t.category === 'drinks' || getTxCalories(t) > 0));
  
  if(foodTxs.length === 0){
    if(!silent) toast(isZh ? '没有找到餐饮支出账单' : 'No food transactions found to sync');
    return;
  }

  let imported = 0;
  if(!S.restaurantRecords) S.restaurantRecords = [];

  foodTxs.forEach(t => {
    // Check if already synced
    const exists = S.restaurantRecords.some(r => r.txId === t.id || (r.name.toLowerCase() === (t.desc || '').toLowerCase() && r.date === t.date));
    if(!exists && t.desc){
      const detected = detectCountryFromText(t.desc) || RESTAURANT_COUNTRIES[0]; // default Malaysia
      const items = extractTxReceiptItems(t);
      const totalCal = getTxCalories(t);
      const totalProt = getTxProtein(t);

      S.restaurantRecords.push({
        id: 'rest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: t.desc,
        country: detected.name,
        countryCode: detected.code,
        flag: detected.flag,
        city: detected.name === 'Malaysia' ? 'Kuala Lumpur' : '',
        status: 'visited',
        date: t.date,
        currency: 'MYR',
        amountOriginal: parseFloat(t.amount) || 0,
        amountMYR: parseFloat(t.amount) || 0,
        rating: 5,
        notes: t.note ? t.note.replace(/\[.*?\]/g, '').trim() : '',
        items: items.map(it => ({
          name: it.name,
          qty: it.qty || 1,
          price: 0,
          calories: it.calories || 0,
          protein: it.protein || 0
        })),
        totalCalories: totalCal,
        totalProtein: totalProt,
        txId: t.id,
        createdAt: new Date().toISOString()
      });
      imported++;
    }
  });

  if(imported > 0){
    save();
    renderRestaurantPassport();
    renderRestaurantPassportWidget();
    renderPassportPage();
    if(!silent) toast(isZh ? `🎉 成功同步 ${imported} 条餐饮探店记录！` : `🎉 Synced ${imported} food records to passport!`);
  } else if(!silent) {
    toast(isZh ? '所有餐饮账单已在护照中' : 'All food transactions are already in passport');
  }
}
window.syncExistingFoodTxsToPassport = syncExistingFoodTxsToPassport;

// ═══════════════════════════════════════════════════════════════════