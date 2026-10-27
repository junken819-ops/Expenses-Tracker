/**
 * Modal Dialog Manager
 * Modularized from Pocket Winnie Core
 */

// ── MODALS ─────────────────────────────────────────────
function openModal(id){ const m = el(id); if(m) m.classList.remove('hidden'); applyLanguage(); }
function closeModal(id){
  const m = el(id);
  if(m) m.classList.add('hidden');
  const locChip = el('loc-suggest-chip');
  if(locChip) locChip.style.display = 'none';
  if(id === 'universal-upload-modal'){
    stopAiScanAnimation();
    if(typeof cancelUniversalScan === 'function') cancelUniversalScan();
  }
  if(id === 'tx-modal' && el('tx-from-upload-bar')){
    el('tx-from-upload-bar').classList.add('hidden');
  }
  if(id === 'splitter-modal' && el('splitter-back-to-upload')){
    el('splitter-back-to-upload').classList.add('hidden');
  }
}
function closeModalIf(e,id){ if(e.target===el(id)) closeModal(id); }

// ── PERIOD & MONTH ─────────────────────────────────────
function inPeriod(tx, period){
  if(!tx || !tx.date) return false;
  const dStr = normalizeDateStr(tx.date);
  const parts = dStr.split('-');
  if(parts.length < 3) return true;
  
  const txYear = parseInt(parts[0], 10);
  const txMonth = parseInt(parts[1], 10) - 1;
  const txDay = parseInt(parts[2], 10);
  const d = new Date(txYear, txMonth, txDay);
  const now = new Date();

  if(period === 'week'){
    const s = new Date(now);
    s.setDate(now.getDate() - now.getDay());
    s.setHours(0,0,0,0);
    return d >= s;
  }
  if(period === 'month') return txMonth === now.getMonth() && txYear === now.getFullYear();
  if(period === 'year')  return txYear === now.getFullYear();
  return true;
}

function inMonth(tx, m, y){
  if(!tx || !tx.date) return false;
  const dStr = normalizeDateStr(tx.date);
  const parts = dStr.split('-');
  if(parts.length < 3) return false;
  const txYear = parseInt(parts[0], 10);
  const txMonth = parseInt(parts[1], 10) - 1;
  return txMonth === m && txYear === y;
}
