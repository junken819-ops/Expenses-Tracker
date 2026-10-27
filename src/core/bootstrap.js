/**
 * App Initialization & Setup
 * Modularized from Pocket Winnie Core
 */

// ── OVERRIDE RENDER ALL TO HOOK NEW FEATURES ──────────
const originalRenderAll_F = (typeof renderAll === 'function') ? renderAll : function(){};
renderAll = function(){
  originalRenderAll_F();
  if(el('payday-date-inp')) el('payday-date-inp').value = S.paydayDate || 25;
};

// ── REMOVE INJECTED NETLIFY BADGE / DRAWER ─────────────
function removeNetlifyBadge(){
  const kill = () => {
    document.querySelectorAll('[data-netlify-drawer], netlify-drawer, [id*="netlify"], [class*="netlify"], iframe[src*="netlify"], iframe[name*="netlify"], div[class*="feedback"]').forEach(el => el.remove());
  };
  kill();
  try {
    const obs = new MutationObserver(kill);
    obs.observe(document.body, { childList: true, subtree: true });
  } catch(e){}
}

/* ═══════════════════════════════════════════════════════════════════
   1. INITIALIZATION & SETUP
   ═══════════════════════════════════════════════════════════════════ */
// App bootstrap (DOMContentLoaded), theme configuration, wallpaper layer setup,
// notification alerts evaluator, and third-party widget suppression.─
function init(){
  load();
  applyTheme();
  applyAppBackground();
  applyLanguage();
  applyRecurring();
  removeNetlifyBadge();
  checkBiometricOnLaunch();
  fetchLiveExchangeRates();
  fetchMalaysiaInflationData();

  const gt = el('greeting-txt'); if(gt) gt.textContent=greeting();
  renderAll();
  updateHomePeriodNavAppearance(false);
}

function detectRecurringPattern(tx) { return false; }

function openReceiptGallery(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? 'ℹ️ 系统采用轻量设计，发票智能扫描后不保留底图' : 'ℹ️ Lightweight mode: receipt images are parsed in memory and not stored');
}

function renderReceiptGallery(){}

const MY_LOCATION_CHAINS = [
  { keywords: ['shell', 'petronas', 'petron', 'caltex', 'bhp'], category: 'fuel', desc: 'Petrol', icon: '⛽' },
  { keywords: ['aeon', 'mydin', 'jaya grocer', 'village grocer', 'lotus', 'tesco', 'giant', 'econsave', 'nsk', '99 speedmart'], category: 'groceries', desc: 'Groceries', icon: '🛒' },
  { keywords: ['mcdonald', 'kfc', 'pizza hut', 'burger king', 'subway', 'nandos', 'nando', 'domino', 'texas chicken', 'marrybrown', 'a&w'], category: 'food', desc: 'Fast Food', icon: '🍔' },
  { keywords: ['starbucks', 'coffee bean', 'zus coffee', 'tealive', 'boost', 'gong cha', 'daboba', 'llao'], category: 'food', desc: 'Drinks', icon: '☕' },
  { keywords: ['uniqlo', 'h&m', 'zara', 'cotton on', 'mr diy', 'ikea', 'courts', 'harvey norman'], category: 'shopping', desc: 'Shopping', icon: '🛍️' },
  { keywords: ['watson', 'guardian', 'caring'], category: 'health', desc: 'Pharmacy', icon: '💊' },
  { keywords: ['clinic', 'hospital', 'dental'], category: 'health', desc: 'Medical', icon: '🏥' },
  { keywords: ['cinema', 'gsc', 'tgv', 'mbo'], category: 'entertainment', desc: 'Movie', icon: '🎬' },
  { keywords: ['parking', 'parkir'], category: 'toll_parking', desc: 'Parking', icon: '🅿️' }
];

function tryLocationSuggest(){
  if(!S.locationSuggestEnabled) return;
  if(!navigator.geolocation) return;
  
  const suggestionEl = el('loc-suggest-chip');
  if(suggestionEl) suggestionEl.style.display = 'none';
  
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`)
      .then(r => r.json())
      .then(data => {
        if(!data || !data.display_name) return;
        const placeName = (data.display_name || '').toLowerCase();
        const shopName = (data.name || data.address?.shop || data.address?.amenity || '').toLowerCase();
        const combined = placeName + ' ' + shopName;
        
        for(const chain of MY_LOCATION_CHAINS){
          for(const kw of chain.keywords){
            if(combined.includes(kw)){
              showLocationSuggestion(chain, data.name || data.address?.shop || chain.desc);
              return;
            }
          }
        }
      })
      .catch(() => {});
  }, () => {}, { timeout: 5000, maximumAge: 60000 });
}

function showLocationSuggestion(chain, placeName){
  let chip = el('loc-suggest-chip');
  if(!chip){
    const amountGroup = el('tx-amount');
    if(!amountGroup || !amountGroup.parentNode) return;
    chip = document.createElement('div');
    chip.id = 'loc-suggest-chip';
    chip.style.cssText = 'background:rgba(255,179,0,.15);border:1.5px solid var(--amber);border-radius:14px;padding:10px 14px;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .15s';
    amountGroup.parentNode.parentNode.insertBefore(chip, amountGroup.parentNode);
  }
  
  chip.style.display = 'flex';
  chip.innerHTML = `
    <span style="font-size:20px">${chain.icon}</span>
    <div style="flex:1">
      <div style="font-size:12px;font-weight:800;color:var(--text)">📍 Near ${esc(placeName)}</div>
      <div style="font-size:11px;color:var(--muted)">Tap to auto-fill: ${chain.desc} (${chain.category})</div>
    </div>
    <span style="font-size:11px;color:var(--amber);font-weight:700">Use ›</span>
  `;
  
  chip.onclick = () => {
    selCat = chain.category;
    if(el('tx-desc')) el('tx-desc').value = chain.desc + (placeName !== chain.desc ? ' — ' + placeName : '');
    if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
    chip.style.display = 'none';
    toast(`📍 Auto-filled: ${chain.icon} ${chain.desc}`);
  };
}
