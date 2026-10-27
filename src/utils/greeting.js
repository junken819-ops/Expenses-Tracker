/**
 * Greeting & Payday UI Stubs
 * Modularized from Pocket Winnie Core
 */

// ── GREETING ───────────────────────────────────────────
function greeting(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const h=new Date().getHours();
  if(isZh){
    return h<12 ? '早上好 ☀️' : h<17 ? '下午好 🌤️' : '晚上好 🌙';
  }
  return h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';
}

// ── PAYDAY COUNTDOWN (REMOVED) ──────────────────────────
function openPaydayQuickSettingsModal(){}
function savePaydaySettingsFromModal(){}
function renderPaydayCountdown(){
  const card = el('payday-card');
  if(card) card.style.display = 'none';
}
function updatePaydaySettings(){}
