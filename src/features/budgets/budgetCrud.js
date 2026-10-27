/**
 * Budget CRUD Operations
 * Modularized from Pocket Winnie Core
 */

// ── BUDGET (OVERALL MONTHLY SPENDING POOL) ─────────────
function setBudgetQuickAmt(amt){
  const inp = el('bud-limit') || el('bud-amount');
  if(inp){
    inp.value = amt;
    inp.focus();
  }
}

function openBudgetModal(){
  const cur = getMonthlyBudgetTotal();
  const inp = el('bud-limit') || el('bud-amount');
  if(inp) inp.value = (cur > 0 ? cur : '');
  if(el('bud-cur')) el('bud-cur').textContent = S.currency || 'RM';
  openModal('budget-modal');
  setTimeout(() => (el('bud-limit') || el('bud-amount'))?.focus(), 220);
}

function saveBudget(){
  const inp = el('bud-limit') || el('bud-amount');
  const amount = parseFloat(inp?.value);
  if(isNaN(amount) || amount <= 0){
    toast('⚠️ Please enter a valid monthly spending budget');
    return;
  }
  S.monthlyBudget = amount;
  S.budgets = [{ category: 'all', limit: amount, name: 'Overall Monthly Spending' }];
  save();
  renderAll();
  closeModal('budget-modal');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? `✅ 已设置月度总预算: ${fmt(amount)}` : `✅ Monthly spending budget set: ${fmt(amount)}!`);
}
