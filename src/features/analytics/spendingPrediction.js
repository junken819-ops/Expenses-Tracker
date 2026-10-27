/**
 * Spending Prediction
 * Modularized from Pocket Winnie Core
 */

// ── FEATURE 9: SPENDING PREDICTION ────────────────────
function renderSpendingPrediction(){
  const card = el('prediction-card');
  const textEl = el('prediction-text');
  if(!card || !textEl) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const txs = filteredTx();
  const monthExpenses = txs.filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= todayStr)
    .reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  if(dayOfMonth <= 1 || monthExpenses <= 0){
    textEl.innerHTML = isZh 
      ? `📅 本月暂无足够数据，快去记一笔账解锁预测！`
      : `📅 Not enough data yet. Start logging expenses!`;
    return;
  }
  
  const dailyAvg = monthExpenses / dayOfMonth;
  const projected = dailyAvg * daysInMonth;
  const totalBudget = getMonthlyBudgetTotal();
  
  let msg = isZh 
    ? `📈 每日均消: <strong>${fmt(dailyAvg)}</strong> · 预计月末总支出: <strong>${fmt(projected)}</strong>`
    : `📈 Daily average: <strong>${fmt(dailyAvg)}</strong> · Projected month-end: <strong>${fmt(projected)}</strong>`;
  
  if(totalBudget > 0){
    const diff = projected - totalBudget;
    if(diff > 0){
      const cutPerDay = diff / Math.max(1, (daysInMonth - dayOfMonth));
      msg += isZh 
        ? `<br>⚠️ <span style="color:var(--red);font-weight:700">预计超支 ${fmt(diff)}！</span> 建议后续每日缩减 ${fmt(cutPerDay)}`
        : `<br>⚠️ <span style="color:var(--red);font-weight:700">Projected ${fmt(diff)} OVER budget!</span> Try cutting ${fmt(cutPerDay)}/day`;
    } else {
      msg += isZh 
        ? `<br>✅ <span style="color:var(--green);font-weight:700">控制良好！预计月末可省下 ${fmt(Math.abs(diff))} 预算</span>`
        : `<br>✅ <span style="color:var(--green);font-weight:700">On track to finish ${fmt(Math.abs(diff))} under budget</span>`;
    }
  }
  
  textEl.innerHTML = msg;
}
