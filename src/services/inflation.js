/**
 * Malaysia Inflation & CPI Tracker
 * Modularized from Pocket Winnie Core
 */

// ── 📊 MALAYSIA INFLATION & CPI TRACKER MODAL ─────────────
function openInflationModal(){
  fetchMalaysiaInflationData();
  renderInflationComparison();
  openModal('inflation-modal');
}

function renderInflationComparison(){
  const now = new Date();
  const curM = now.getMonth(), curY = now.getFullYear();
  const prev = new Date(now); prev.setMonth(prev.getMonth() - 1);
  const prevM = prev.getMonth(), prevY = prev.getFullYear();

  const curExp = S.transactions.filter(t => t.type === 'expense' && inMonth(t, curM, curY)).reduce((s, t) => s + (Number(t.amount)||0), 0);
  const prevExp = S.transactions.filter(t => t.type === 'expense' && inMonth(t, prevM, prevY)).reduce((s, t) => s + (Number(t.amount)||0), 0);

  let userGrowth = 0;
  if(prevExp > 0){
    userGrowth = ((curExp - prevExp) / prevExp) * 100;
  }

  const userSign = userGrowth >= 0 ? '+' : '';
  const userGrowthStr = `${userSign}${userGrowth.toFixed(1)}%`;

  if(el('cpi-user-val')){
    el('cpi-user-val').textContent = userGrowthStr;
    el('cpi-user-val').style.color = userGrowth <= 2 ? 'var(--green)' : 'var(--red)';
  }

  const verdictEl = el('cpi-verdict-text');
  if(verdictEl){
    if(userGrowth > 5){
      verdictEl.textContent = `Your spending grew by ${userGrowthStr} this month. Food & dining costs in Malaysia are currently up ${cpiData.food}, so consider cooking more at home!`;
    } else if(userGrowth < 0){
      verdictEl.textContent = `Great discipline! Your spending decreased by ${Math.abs(userGrowth).toFixed(1)}% this month, beating Malaysia's inflation rate!`;
    } else {
      verdictEl.textContent = `Your personal spending is well-balanced with Malaysian national inflation trends (${cpiData.headline}).`;
    }
  }
}
