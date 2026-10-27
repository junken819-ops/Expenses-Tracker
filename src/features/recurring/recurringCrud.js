/**
 * Recurring CRUD Operations
 * Modularized from Pocket Winnie Core
 */

// ── RECURRING ──────────────────────────────────────────
function openRecModal(){
  selRecType = 'expense'; selRecCat = null;
  const dInp = el('rec-desc') || el('rec-desc-inp'); if(dInp) dInp.value = '';
  const aInp = el('rec-amt') || el('rec-amount-inp'); if(aInp) aInp.value = '';
  const sInp = el('rec-start') || el('rec-start-inp'); if(sInp) sInp.value = today();
  const fInp = el('rec-freq') || el('rec-freq-sel'); if(fInp) fInp.value = 'monthly';
  setRecType('expense');
  openModal('rec-modal');
}
function setRecType(type){
  selRecType = type;
  const expBtn = el('rec-type-exp'); if(expBtn) expBtn.classList.toggle('on', type === 'expense');
  const incBtn = el('rec-type-inc'); if(incBtn) incBtn.classList.toggle('on', type === 'income');
  if(el('rec-cats')) buildCats('rec-cats', type, id => selRecCat = id);
}
function saveRecurring(){
  const desc = (el('rec-desc') || el('rec-desc-inp'))?.value.trim();
  const amount = parseFloat((el('rec-amt') || el('rec-amount-inp'))?.value);
  const start = (el('rec-start') || el('rec-start-inp'))?.value;
  const freq = (el('rec-freq') || el('rec-freq-sel'))?.value || 'monthly';
  if(!desc){ toast('⚠️ Enter a description'); return; }
  if(!amount || amount <= 0){ toast('⚠️ Enter an amount'); return; }
  if(!selRecCat){ toast('⚠️ Pick a category'); return; }
  S.recurring.push({ id: uid('item'), type: selRecType, desc, amount, category: selRecCat, freq, nextDue: start, paymentMethod: 'Auto-Debit', createdAt: new Date().toISOString() });
  applyRecurring(); renderAll(); closeModal('rec-modal'); toast('🔁 Recurring saved!');
}
