/**
 * Home Balance & Month Navigation
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: BALANCE & MONTHLY NAVIGATION ───────────────
let homeActiveYear = new Date().getFullYear();
let homeActiveMonth = new Date().getMonth(); // 0 = Jan, 8 = Sep

function getHomeActiveMonthKey(){
  return `${homeActiveYear}-${String(homeActiveMonth + 1).padStart(2, '0')}`;
}

function stepHomeMonth(delta){
  homeActiveMonth += delta;
  if(homeActiveMonth < 0){
    homeActiveMonth = 11;
    homeActiveYear--;
  } else if(homeActiveMonth > 11){
    homeActiveMonth = 0;
    homeActiveYear++;
  }
  renderBalance();
  renderRecentTx();
}

function jumpHomeCurrentMonth(){
  const now = new Date();
  homeActiveYear = now.getFullYear();
  homeActiveMonth = now.getMonth();
  renderBalance();
  renderRecentTx();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? `📅 已返回当前月份 (${homeActiveYear}年${MONTH_NAMES_ZH[homeActiveMonth]})` : `📅 Jumped to current month (${MONTH_NAMES[homeActiveMonth]} ${homeActiveYear})`);
}

function renderBalance(){
  const txs = filteredTx();
  const now = new Date();
  const isCurMonth = (homeActiveYear === now.getFullYear() && homeActiveMonth === now.getMonth());
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  // 1. Month Header Label
  const monthName = isZh ? MONTH_NAMES_ZH[homeActiveMonth] : MONTH_NAMES[homeActiveMonth];
  const monthLabel = el('home-month-label');
  if(monthLabel){
    monthLabel.textContent = isZh
      ? `${homeActiveYear}年 ${monthName}支出 🍯`
      : `${monthName} ${homeActiveYear} Spending 🍯`;
  }

  // 2. Today / Current Month jump button
  const todayBtn = el('home-today-month-btn');
  if(todayBtn){
    todayBtn.style.display = isCurMonth ? 'none' : 'inline-block';
  }

  // 3. Active Month's Expenses -> Displayed in #bal-display
  // Starts at RM 0.00 for a new month with no expenses!
  const monthTxs = txs.filter(t => t.type === 'expense' && inMonth(t, homeActiveMonth, homeActiveYear));
  const mExp = monthTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const balEl = el('bal-display');
  if(balEl) balEl.textContent = fmt(mExp);

  // 4. Year Total Spending -> Displayed in #tot-exp
  const yearStr = String(homeActiveYear);
  const yearTxs = txs.filter(t => t.type === 'expense' && (t.date || '').startsWith(yearStr));
  const yExp = yearTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expEl = el('tot-exp');
  if(expEl) expEl.textContent = fmt(yExp);

  const yearLbl = el('home-year-total-label');
  if(yearLbl){
    yearLbl.textContent = isZh ? `${homeActiveYear}年 全年总支出` : `${homeActiveYear} Year Total`;
  }

  // 5. Period Care Expenses (in active month)
  const pExp = monthTxs.filter(t => isPeriodCareExpense(t)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const periodEl = el('tot-period-exp');
  if(periodEl) periodEl.textContent = fmt(pExp);

  const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const incEl = el('tot-inc');
  if(incEl) incEl.textContent = fmt(totalIncome);
}
// ── ACCOUNTS (REMOVED — stubs cleaned up) ──
