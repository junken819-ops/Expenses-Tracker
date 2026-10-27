/**
 * Weekly Spending Report
 * Modularized from Pocket Winnie Core
 */

// ── FEATURE 2: WEEKLY SPENDING REPORT ─────────────────
function openWeeklyReportModal(){
  renderWeeklyReport();
  openModal('weekly-report-modal');
  S.weeklyReportLastShown = today();
  save();
}

function renderWeeklyReport(){
  const now = new Date();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  // This Week
  const twStart = new Date(now); twStart.setDate(now.getDate() - now.getDay()); twStart.setHours(0,0,0,0);
  const twTxs = S.transactions.filter(t => t.type === 'expense' && new Date(t.date+'T00:00:00') >= twStart);
  const twSpent = twTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  // Last Week
  const lwStart = new Date(twStart); lwStart.setDate(lwStart.getDate() - 7);
  const lwEnd = new Date(twStart); lwEnd.setMilliseconds(-1);
  const lwTxs = S.transactions.filter(t => {
    const d = new Date(t.date+'T00:00:00');
    return t.type === 'expense' && d >= lwStart && d <= lwEnd;
  });
  const lwSpent = lwTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  // Basic Stats
  if(el('wr-total-spent')) el('wr-total-spent').textContent = fmt(twSpent);
  const daysPassed = now.getDay() + 1;
  if(el('wr-daily-avg')) el('wr-daily-avg').textContent = fmt(twSpent / daysPassed);
  if(el('wr-tx-count')) el('wr-tx-count').textContent = twTxs.length + (isZh ? ' 笔' : '');
  
  // Comparison vs last week
  const vsEl = el('wr-vs-last');
  if(vsEl){
    if(lwSpent === 0){
      vsEl.textContent = isZh ? '上周无数据' : 'No data last week';
      vsEl.style.color = 'var(--muted)';
    } else {
      const diff = twSpent - lwSpent;
      const pct = Math.round((Math.abs(diff) / lwSpent) * 100);
      if(diff < 0){
        vsEl.textContent = isZh ? `节省了 ${pct}% (${fmt(Math.abs(diff))})` : `-${pct}% (${fmt(Math.abs(diff))})`;
        vsEl.style.color = 'var(--green)';
      } else {
        vsEl.textContent = isZh ? `增长了 +${pct}% (${fmt(diff)})` : `+${pct}% (${fmt(diff)})`;
        vsEl.style.color = 'var(--red)';
      }
    }
  }
  
  // Grade calculation
  let grade = 'A', emoji = '🌟', verdict = isZh ? '消费节奏极佳！' : 'Excellent spending control!';
  const weeklyBudget = S.budgets.reduce((s,b) => s + (Number(b.limit)||0), 0) / 4.33;
  
  if(weeklyBudget > 0){
    const ratio = twSpent / weeklyBudget;
    if(ratio > 1.25){ grade = 'D'; emoji = '🚨'; verdict = isZh ? '严重超支！请紧急控制本周剩余开销' : 'Over budget! Time to cut back.'; }
    else if(ratio > 1.0){ grade = 'C'; emoji = '⚠️'; verdict = isZh ? '稍有超支，注意缩减不必要娱乐' : 'Slightly over budget. Watch out!'; }
    else if(ratio > 0.75){ grade = 'B'; emoji = '👍'; verdict = isZh ? '稳健达标，符合每周预算规划' : 'Within budget. Solid week!'; }
    else { grade = 'A+'; emoji = '🏆'; verdict = isZh ? '极为自律！远低于预算限额' : 'Outstanding! Way under budget!'; }
  } else {
    if(twSpent > 800){ grade = 'C'; emoji = '⚠️'; verdict = isZh ? '本周总开销较高' : 'High spending week!'; }
    else if(twSpent > 400){ grade = 'B'; emoji = '👍'; verdict = isZh ? '本周开销处于正常水平' : 'Moderate spending week.'; }
    else { grade = 'A'; emoji = '🌟'; verdict = isZh ? '低消费自律周，继续保持！' : 'Very low spending week!'; }
  }
  
  if(el('wr-grade')) el('wr-grade').textContent = grade;
  if(el('wr-grade-emoji')) el('wr-grade-emoji').textContent = emoji;
  if(el('wr-verdict')) el('wr-verdict').textContent = verdict;
  
  // Top 3 Categories
  const catTotals = {};
  twTxs.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0);
  });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]).slice(0,3);
  const topCatsEl = el('wr-top-cats');
  if(topCatsEl){
    if(!sortedCats.length){
      topCatsEl.innerHTML = `<div style="font-size:12px;color:var(--muted)">${isZh ? '本周暂无支出记录' : 'No expenses this week'}</div>`;
    } else {
      topCatsEl.innerHTML = sortedCats.map(([catId, amt], i) => {
        const c = catInfo('expense', catId);
        const pct = twSpent > 0 ? Math.round((amt / twSpent) * 100) : 0;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;${i < sortedCats.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};font-size:12px">
            <span>${c.icon} ${esc(c.name)}</span>
            <strong>${fmt(amt)} <span style="font-size:10px;color:var(--muted)">(${pct}%)</span></strong>
          </div>
        `;
      }).join('');
    }
  }
  
  // AI Tip
  const tipEl = el('wr-ai-tip');
  if(tipEl){
    if(isZh){
      const tipsZh = [
        '🍳 餐饮通常占年轻群体的 30% 支出，适当自煮可月省 RM 300+！',
        '🛍️ 网购前践行“48小时冷静法则”，可减少约 40% 的冲动消费。',
        '⛽ 加油搭配现金回扣信用卡或电子钱包积分，日积月累更划算。',
        '💡 设定清晰的分类月预算，有助于更精准掌握每周消费健康度！'
      ];
      tipEl.textContent = tipsZh[Math.floor(Math.random() * tipsZh.length)];
    } else {
      const tipsEn = [
        '🍳 Food is often 30% of your expenses. Cooking twice a week can save RM 300+/month!',
        '🛍️ Try the 48-hour rule before online checkouts to curb impulse shopping.',
        '⛽ Use cash-back cards or e-wallet points on petrol for compound savings.',
        '💡 Set monthly budgets per category to get more accurate weekly report cards!'
      ];
      tipEl.textContent = tipsEn[Math.floor(Math.random() * tipsEn.length)];
    }
  }
}
