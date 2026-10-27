/**
 * Debt CRUD Operations
 * Modularized from Pocket Winnie Core
 */

// ── DEBTS ──────────────────────────────────────────────
function openDebtModal(){
  selDebtDir = 'owe';
  const pInp = el('debt-person') || el('debt-person-inp'); if(pInp) pInp.value = '';
  const aInp = el('debt-amt') || el('debt-amount-inp'); if(aInp) aInp.value = '';
  const nInp = el('debt-note') || el('debt-note-inp'); if(nInp) nInp.value = '';
  const dInp = el('debt-due') || el('debt-due-inp'); if(dInp) dInp.value = '';
  setDebtDir('owe');
  openModal('debt-modal');
}
function setDebtDir(dir){
  selDebtDir = dir;
  const oweBtn = el('debt-dir-owe') || el('debt-owe-btn');
  const lentBtn = el('debt-dir-lent') || el('debt-lent-btn');
  if(oweBtn) oweBtn.classList.toggle('on', dir === 'owe');
  if(lentBtn) lentBtn.classList.toggle('on', dir === 'lent');
}
function saveDebt(){
  const person = (el('debt-person') || el('debt-person-inp'))?.value.trim();
  const amount = parseFloat((el('debt-amt') || el('debt-amount-inp'))?.value);
  const note = (el('debt-note') || el('debt-note-inp'))?.value.trim() || '';
  const due = (el('debt-due') || el('debt-due-inp'))?.value || null;
  if(!person){ toast('⚠️ Enter a name'); return; }
  if(!amount || amount <= 0){ toast('⚠️ Enter an amount'); return; }
  S.debts.push({ id: uid('item'), dir: selDebtDir, person, amount, remaining: amount, note, due, settled: false, createdAt: new Date().toISOString() });
  save(); renderDebts(); closeModal('debt-modal'); toast('💸 Debt logged!');
}

// ── TRANSFERS & BALANCING (REMOVED) ───
