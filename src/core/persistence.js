/**
 * Local & Server Persistence Engine
 * Modularized from Pocket Winnie Core
 */

// The companion Node server provides /api/state only when the app is run on
// this computer. Netlify deploys this project as a static site, so calling the
// endpoint there would produce a 404 on every save. Keep the browser copy as
// the source of truth on hosted builds.
function canUseLocalStateApi(){
  if(typeof window === 'undefined' || !window.location) return false;
  const { protocol, hostname, port } = window.location;
  return (protocol === 'http:' || protocol === 'https:') &&
    port === '3000' &&
    (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]');
}

function save(){
  S.lastUpdated = Date.now();
  if(Array.isArray(S.transactions)){
    S.transactions.forEach(t => { if(t.photo) delete t.photo; });
  }
  try {
    const serialized = JSON.stringify(S);
    localStorage.setItem('ff2', serialized);
  } catch(e){
    console.warn('LocalStorage quota exceeded or write error:', e);
    if(e && e.name === 'QuotaExceededError'){
      toast(S.lang === 'zh'
        ? '⚠️ 本地存储空间已满，请及时同步至云端！'
        : '⚠️ Local storage is full! Please sync to cloud in Settings.');
    }
  }

  // Host-side persistence is available only from the local companion server.
  if(canUseLocalStateApi()){
    const diskState = { ...S };
    delete diskState.geminiApiKey; // Keep API key in localStorage only, avoid writing secrets to user_data.json
    fetch('/api/state', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(diskState)
    }).then(r => {
      if(!r.ok) console.warn('/api/state returned HTTP ' + r.status);
    }).catch(err => {
      console.warn('Host-side state sync failed (offline or static host):', err.message);
    });
  }
}

function load(){
  try{
    const r = localStorage.getItem('ff2');
    if(r){
      applyStateObject(JSON.parse(r));
    }
  }catch(e){
    console.error('Error reading localStorage:', e);
  }

  // A Netlify deployment is static and intentionally has no /api/state route.
  if(canUseLocalStateApi()){
    fetch('/api/state')
      .then(r => r.ok ? r.json() : null)
      .then(remoteState => {
        if(remoteState && remoteState.transactions && remoteState.transactions.length > 0){
          const localR = localStorage.getItem('ff2');
          let shouldApply = false;
          
          if (!localR) {
            shouldApply = true;
          } else {
            try {
              const localState = JSON.parse(localR);
              const localCount = (localState.transactions || []).length;
              const remoteCount = remoteState.transactions.length;
              
              if (remoteState.lastUpdated && localState.lastUpdated) {
                shouldApply = remoteState.lastUpdated > localState.lastUpdated;
              } else {
                shouldApply = remoteCount > localCount;
              }
            } catch(e) {
              shouldApply = true;
            }
          }

          if(shouldApply){
            applyStateObject(remoteState);
            try { localStorage.setItem('ff2', JSON.stringify(S)); } catch(e){}
            if(typeof renderAll === 'function') renderAll();
          }
        }
      })
      .catch(()=>{});
  }

  applyAppBackground();
}

function applyStateObject(p){
  if(!p || typeof p !== 'object') return;
  // Account system simplified to unified wallet
  let loadedAccounts = JSON.parse(JSON.stringify(DEFAULT_MY_ACCOUNTS));

  let loadedTx = p.transactions || [];
  if(Array.isArray(loadedTx)){
    loadedTx.forEach(t => {
      if(t.date) t.date = normalizeDateStr(t.date, true);
      if(t.note && typeof t.note === 'string' && t.note.includes('[object Object]')){
        t.note = t.note.replace(/\[object Object\],?\s*/g, '').trim();
      }
      t.accountId = 'default';
      if(!t.paymentMethod || t.paymentMethod === 'GrabPay'){
        t.paymentMethod = 'Cash';
      }
      if(t.photo) delete t.photo;
    });
  }
  const migratedInternalTransfers = migrateLegacyInternalTransfers(loadedTx);

  let loadedLastUsedAccId = 'default';
  let loadedSelAcc = 'all';

  const loadedMonthlyBudget = (p && p.monthlyBudget !== undefined)
    ? Number(p.monthlyBudget) || 0
    : (Array.isArray(p.budgets) && p.budgets.length > 0 ? p.budgets.reduce((s,b)=>s+(Number(b.limit)||0),0) : 0);

  S = {
    ...S,
    ...p,
    monthlyBudget: loadedMonthlyBudget,
    transactions: loadedTx,
    budgets: p.budgets || [],
    goals: p.goals || [],
    reminders: p.reminders || [],
    recurring: p.recurring || [],
    debts: p.debts || [],
    accounts: loadedAccounts,
    quickPresets: (p.quickPresets && p.quickPresets.length) ? p.quickPresets : JSON.parse(JSON.stringify(DEFAULT_QUICK_PRESETS)),
    expCategories: mergeDefaultCategories(p.expCategories, DEFAULT_EXP_CATS),
    incCategories: (p.incCategories && p.incCategories.length) ? p.incCategories : JSON.parse(JSON.stringify(DEFAULT_INC_CATS)),
    quickLogTitle: p.quickLogTitle || '⚡ Quick Log',
    lang: p.lang || 'en',
    lastUsedAccId: loadedLastUsedAccId,
    selAcc: loadedSelAcc,
    gsheetUrl: p.gsheetUrl || '',
    lastSync: p.lastSync || '',
    biometricLock: p.biometricLock || false,
    pendingMeals: p.pendingMeals || [],
    restaurantRecords: Array.isArray(p.restaurantRecords) ? p.restaurantRecords : [],
    paydayDate: p.paydayDate || 25,
    paydayAmount: p.paydayAmount || 0,
    challenges: p.challenges || [],
    streaks: p.streaks || { noSpendBest: 0, noSpendCurrent: 0, lastCheckedDate: '' },
    roundUpJar: p.roundUpJar || 0,
    partnerData: p.partnerData || null,
    partnerName: p.partnerName || '',
    familyMode: p.familyMode || false,
    weeklyReportLastShown: p.weeklyReportLastShown || '',
    locationSuggestEnabled: p.locationSuggestEnabled !== false,
    wallpaperUrl: p.wallpaperUrl !== undefined ? p.wallpaperUrl : 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg',
    wallpaperOpacity: p.wallpaperOpacity !== undefined ? p.wallpaperOpacity : 35,
    periodTracker: (p && p.periodTracker) ? p.periodTracker : (S.periodTracker || {
      lastPeriodDate: null,
      hasSetFirstDate: false,
      periodLength: 5,
      cycleLength: 28,
      history: []
    }),
    geminiApiKey: p.geminiApiKey || (typeof S !== 'undefined' && S ? S.geminiApiKey : '') || ''
  };

  if(typeof window !== 'undefined'){
    window.STATE = S;
    window.S = S;
  }

  // Keep converted legacy transfers on this device without requiring a server.
  if(migratedInternalTransfers){
    try { localStorage.setItem('ff2', JSON.stringify(S)); } catch(e){}
  }

  // Roll forward any un-checked-in wishlist records from past months into the current month
  if(typeof rollForwardPendingWishlist === 'function'){
    rollForwardPendingWishlist();
  }
}

function toast(msg,ms=2400){
  const t=el('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.add('hidden'),ms);
}