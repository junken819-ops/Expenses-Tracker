/**
 * 50/30/20 Financial Health Matrix
 * Modularized from Pocket Winnie Core
 */

// ── ⚖️ 50 / 30 / 20 FINANCIAL HEALTH MATRIX ─────────────
const NEEDS_CAT_IDS = ['rent_housing', 'bills', 'groceries', 'fuel', 'toll_parking', 'health', 'education'];
const WANTS_CAT_IDS = ['food', 'shopping', 'entertainment', 'donation', 'other'];

function render50_30_20Matrix(txs, totalInc, totalExp){
  const card = el('matrix-503020-card');
  if(!card) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const exps = txs.filter(t => t.type === 'expense');
  let needsSpent = 0;
  let wantsSpent = 0;

  exps.forEach(t => {
    if(NEEDS_CAT_IDS.includes(t.category)){
      needsSpent += Number(t.amount) || 0;
    } else {
      wantsSpent += Number(t.amount) || 0;
    }
  });

  const base = totalInc > 0 ? totalInc : (totalExp > 0 ? totalExp : 1);
  const savings = Math.max(0, totalInc - totalExp);

  const needsPct = Math.round((needsSpent / base) * 100);
  const wantsPct = Math.round((wantsSpent / base) * 100);
  const savingsPct = totalInc > 0 ? Math.round((savings / totalInc) * 100) : 0;

  if(el('matrix-needs-val')) el('matrix-needs-val').textContent = `${fmt(needsSpent)} (${needsPct}%)`;
  if(el('matrix-wants-val')) el('matrix-wants-val').textContent = `${fmt(wantsSpent)} (${wantsPct}%)`;
  if(el('matrix-savings-val')) el('matrix-savings-val').textContent = `${fmt(savings)} (${savingsPct}%)`;

  if(el('matrix-needs-bar')) el('matrix-needs-bar').style.width = `${Math.min(100, (needsPct / 50) * 100)}%`;
  if(el('matrix-wants-bar')) el('matrix-wants-bar').style.width = `${Math.min(100, (wantsPct / 30) * 100)}%`;
  if(el('matrix-savings-bar')) el('matrix-savings-bar').style.width = `${Math.min(100, (savingsPct / 20) * 100)}%`;

  const gradeEl = el('matrix-health-grade');
  const verdictText = el('matrix-verdict-text');

  if(totalInc <= 0 && totalExp <= 0){
    if(gradeEl) gradeEl.textContent = isZh ? '等待数据' : 'Awaiting Data';
    if(verdictText) verdictText.textContent = isZh ? '记录当月收入与支出后，即可解锁 50/30/20 黄金财务分配诊断！' : 'Log your monthly income and expenses to unlock your 50/30/20 financial diagnosis!';
    return;
  }

  let grade = isZh ? '🏆 优秀自律' : '🏆 Excellent';
  let advice = isZh ? '你的收支分配非常健康，完美契合 50/30/20 黄金理财法则！' : 'Your spending is perfectly aligned with the golden 50/30/20 financial rule!';

  if(needsPct > 65){
    grade = isZh ? '⚠️ 刚需偏高' : '⚠️ High Needs';
    advice = isZh ? `必要刚需支出 (${needsPct}%) 超出 50% 基准。建议审视房租账单或固定支出。`: `Essential needs (${needsPct}%) exceed the 50% target. Look for ways to lower utility bills or fixed housing costs.`;
  } else if(wantsPct > 40){
    grade = isZh ? '🚨 享乐超标' : '🚨 High Wants';
    advice = isZh ? `享受型弹性支出 (${wantsPct}%) 超过 30% 上限。建议适当节制咖啡餐饮、网购与娱乐。` : `Discretionary spending (${wantsPct}%) is over the 30% limit. Trim cafe dining, online shopping, or entertainment.`;
  } else if(savingsPct < 10){
    grade = isZh ? '⚠️ 储蓄不足' : '⚠️ Low Savings';
    advice = isZh ? `储蓄率 (${savingsPct}%) 低于 20% 目标。建议在发薪日立即自动存入应急基金。` : `Savings rate (${savingsPct}%) is below the 20% target. Automate savings on salary day to build your emergency fund.`;
  }

  if(gradeEl) gradeEl.textContent = grade;
  if(verdictText) verdictText.textContent = advice;
}
