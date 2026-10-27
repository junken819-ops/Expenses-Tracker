/**
 * Recurring Engine
 * Modularized from Pocket Winnie Core
 */

// ── RECURRING ──────────────────────────────────────────
function nextDue(from, freq){
  const d = new Date((from || today()) + 'T00:00:00');
  if(isNaN(d.getTime())) return today();
  if(freq === 'daily') d.setDate(d.getDate() + 1);
  else if(freq === 'weekly') d.setDate(d.getDate() + 7);
  else if(freq === 'monthly') d.setMonth(d.getMonth() + 1);
  else if(freq === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function applyRecurring(){
  if(!Array.isArray(S.recurring)) S.recurring = [];
  S.recurring.forEach(r => {
    if(!r.nextDue) r.nextDue = today();
  });
}

function confirmRecurring(id){
  if(!Array.isArray(S.recurring)) return;
  const r = S.recurring.find(x => x.id === id);
  if(!r) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const txDate = (r.nextDue && r.nextDue <= today()) ? r.nextDue : today();
  const newTx = {
    id: uid('rec'),
    type: r.type || 'expense',
    amount: Number(r.amount) || 0,
    desc: r.desc,
    category: r.category || 'bills',
    date: txDate,
    paymentMethod: r.paymentMethod || 'Auto-Debit',
    note: isZh ? `周期性账单: ${r.desc}` : `Recurring bill: ${r.desc}`,
    accountId: 'default',
    createdAt: new Date().toISOString()
  };
  if(!Array.isArray(S.transactions)) S.transactions = [];
  S.transactions.unshift(newTx);
  r.lastLogged = txDate;
  r.nextDue = nextDue(txDate, r.freq || 'monthly');
  save();
  renderAll();
  toast(isZh ? `✅ 已入账: ${r.desc} (${fmt(r.amount)})` : `✅ Recorded: ${r.desc} (${fmt(r.amount)})`);
}