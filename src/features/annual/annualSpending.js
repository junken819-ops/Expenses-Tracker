/**
 * Annual & By-Year Spending Breakdown
 * Modularized from Pocket Winnie Core
 */

// ── 📊 ANNUAL & BY-YEAR SPENDING SYSTEM ───────────────
let annualInspectedYear = new Date().getFullYear();

function openAnnualSpendingModal(year){
  if(year !== undefined && !isNaN(year)){
    annualInspectedYear = Number(year);
  } else {
    annualInspectedYear = homeActiveYear;
  }
  renderAnnualSpendingModal();
  openModal('annual-spending-modal');
}

function stepAnnualYear(delta){
  annualInspectedYear += delta;
  renderAnnualSpendingModal();
}

function jumpAnnualCurrentYear(){
  annualInspectedYear = new Date().getFullYear();
  renderAnnualSpendingModal();
}

function renderAnnualSpendingModal(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const allTx = filteredTx();
  const yearStr = String(annualInspectedYear);

  // 1. Year Header & Button
  const titleEl = el('annual-year-title');
  const subEl = el('annual-year-subtitle');
  const curYearBtn = el('annual-current-year-btn');
  if(titleEl) titleEl.textContent = isZh ? `${annualInspectedYear}年 消费总览` : `${annualInspectedYear} Annual Spending`;
  if(subEl) subEl.textContent = isZh ? '按月查账 · 历年消费总览与明细' : 'Month-by-month & By-year breakdown';
  if(curYearBtn) curYearBtn.style.display = (annualInspectedYear === curYear) ? 'none' : 'inline-block';

  // 2. Year Statistics
  const yearTxs = allTx.filter(t => t.type === 'expense' && (t.date || '').startsWith(yearStr));
  const totalSpend = yearTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalCount = yearTxs.length;

  // Calculate spending per month for this year
  const monthData = [];
  let peakMonthIdx = -1;
  let peakMonthSpend = -1;
  let activeMonthCount = 0;

  for(let m = 0; m < 12; m++){
    const mTxs = yearTxs.filter(t => inMonth(t, m, annualInspectedYear));
    const mSpend = mTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const mCount = mTxs.length;
    if(mCount > 0){
      activeMonthCount++;
      if(mSpend > peakMonthSpend){
        peakMonthSpend = mSpend;
        peakMonthIdx = m;
      }
    }
    monthData.push({ month: m, spend: mSpend, count: mCount });
  }

  const avgSpend = activeMonthCount > 0 ? (totalSpend / activeMonthCount) : 0;
  const peakMonthName = peakMonthIdx >= 0 ? (isZh ? MONTH_NAMES_ZH[peakMonthIdx] : MONTH_NAMES[peakMonthIdx]) : '—';

  if(el('annual-total-spent')) el('annual-total-spent').textContent = fmt(totalSpend);
  if(el('annual-total-tx-count')) el('annual-total-tx-count').textContent = isZh ? `${totalCount} 笔消费记录` : `${totalCount} entries`;
  if(el('annual-monthly-avg')) el('annual-monthly-avg').textContent = fmt(avgSpend);
  if(el('annual-peak-month')) el('annual-peak-month').textContent = isZh ? `最高: ${peakMonthName} (${fmt(peakMonthSpend > 0 ? peakMonthSpend : 0)})` : `Peak: ${peakMonthName} (${fmt(peakMonthSpend > 0 ? peakMonthSpend : 0)})`;
  if(el('annual-active-months-count')) el('annual-active-months-count').textContent = isZh ? `${activeMonthCount} 个记账月份` : `${activeMonthCount} active months`;

  // 3. 12 Months Breakdown Cards
  const grid = el('annual-months-grid');
  if(grid){
    grid.innerHTML = '';
    monthData.forEach(md => {
      const m = md.month;
      const mName = isZh ? MONTH_NAMES_ZH[m] : MONTH_NAMES[m];
      const isCur = (annualInspectedYear === curYear && m === curMonth);
      const isHomeActive = (annualInspectedYear === homeActiveYear && m === homeActiveMonth);
      const isPeak = (m === peakMonthIdx && md.spend > 0);
      const pct = totalSpend > 0 ? Math.min(100, Math.round((md.spend / totalSpend) * 100)) : 0;

      const card = document.createElement('div');
      card.style.cssText = `background:var(--card);border:1.5px solid ${isHomeActive ? 'var(--amber)' : 'var(--border)'};border-radius:14px;padding:10px 12px;cursor:pointer;transition:all .15s`;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:13px;color:var(--text)">${mName}</strong>
            ${isCur ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(59,130,246,.18);color:#3b82f6;font-weight:700">${isZh ? '本月' : 'Current'}</span>` : ''}
            ${isHomeActive ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(245,158,11,.2);color:var(--amber);font-weight:800">${isZh ? '当前查看' : 'Viewing'}</span>` : ''}
            ${isPeak ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(239,68,68,.15);color:var(--red);font-weight:700">🔥 ${isZh ? '最高支出' : 'Peak'}</span>` : ''}
          </div>
          <div style="text-align:right">
            <span style="font-size:14px;font-weight:900;color:${md.spend > 0 ? 'var(--red)' : 'var(--muted)'}">${fmt(md.spend)}</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:6px;background:var(--bg2);border-radius:6px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${isPeak ? 'var(--red)' : 'var(--amber)'};border-radius:6px"></div>
          </div>
          <div style="font-size:10.5px;color:var(--muted);white-space:nowrap;min-width:65px;text-align:right">
            ${md.count} ${isZh ? '笔' : (md.count === 1 ? 'tx' : 'txs')} (${pct}%)
          </div>
          <button type="button" class="chip" style="font-size:10.5px;padding:3px 8px;font-weight:800;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;cursor:pointer" onclick="event.stopPropagation(); inspectMonthFromAnnual(${annualInspectedYear}, ${m})">
            ${isZh ? '查账 🔍' : 'Inspect 🔍'}
          </button>
        </div>
      `;

      card.onclick = () => {
        inspectMonthFromAnnual(annualInspectedYear, m);
      };

      grid.appendChild(card);
    });
  }

  // 4. By-Year Historical Comparison Table
  renderByYearHistoryTable();
}

function inspectMonthFromAnnual(year, month){
  homeActiveYear = year;
  homeActiveMonth = month;
  closeModal('annual-spending-modal');

  // Update Home view
  renderBalance();
  renderRecentTx();

  // Also sync Calendar view
  calCurrentYear = year;
  calCurrentMonth = month;
  renderCalendar();

  // Also sync Activity list view filter if open
  const mKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const filterEl = el('tx-month-filter');
  if(filterEl){
    filterEl.value = mKey;
    renderFullTx();
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const mName = isZh ? MONTH_NAMES_ZH[month] : MONTH_NAMES[month];
  toast(isZh ? `📅 已切换至 ${year}年${mName}` : `📅 Switched to ${mName} ${year}`);
}

function renderByYearHistoryTable(){
  const container = el('annual-by-year-table');
  if(!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const allTx = filteredTx().filter(t => t.type === 'expense');

  // Group by Year
  const yearsMap = {};
  allTx.forEach(t => {
    const y = (t.date || '').slice(0, 4);
    if(y && y.length === 4){
      if(!yearsMap[y]){
        yearsMap[y] = { year: Number(y), total: 0, count: 0, months: new Set() };
      }
      yearsMap[y].total += (Number(t.amount) || 0);
      yearsMap[y].count++;
      const m = (t.date || '').slice(0, 7);
      if(m) yearsMap[y].months.add(m);
    }
  });

  // Include current inspected year even if 0 transactions
  const inspectedYStr = String(annualInspectedYear);
  if(!yearsMap[inspectedYStr]){
    yearsMap[inspectedYStr] = { year: annualInspectedYear, total: 0, count: 0, months: new Set() };
  }

  const sortedYears = Object.values(yearsMap).sort((a,b) => b.year - a.year);

  let rowsHtml = sortedYears.map(yr => {
    const isCurrentInspected = yr.year === annualInspectedYear;
    const activeMonths = Math.max(1, yr.months.size);
    const monthlyAvg = yr.total / activeMonths;

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer;background:${isCurrentInspected ? 'rgba(245,158,11,.1)' : 'transparent'};transition:all .15s" onclick="annualInspectedYear = ${yr.year}; renderAnnualSpendingModal()">
        <div>
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:13px;color:var(--text)">${yr.year}</strong>
            ${isCurrentInspected ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:var(--amber);color:#000;font-weight:800">${isZh ? '正在查看' : 'Selected'}</span>` : ''}
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
            ${yr.count} ${isZh ? '笔记录' : 'entries'} · ${activeMonths} ${isZh ? '个记账月份' : 'active mo'} (${fmt(monthlyAvg)}/mo)
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:900;color:var(--red)">${fmt(yr.total)}</div>
          <div style="font-size:10px;color:var(--cyan);margin-top:1px">${isZh ? '点此查看 ›' : 'Tap to inspect ›'}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = rowsHtml || `<div style="padding:12px;text-align:center;color:var(--muted);font-size:11.5px">No yearly data recorded yet.</div>`;
}

function fmtDate(str){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const d=new Date(str+'T00:00:00'), t=new Date(); t.setHours(0,0,0,0);
  const y=new Date(t); y.setDate(y.getDate()-1);
  if(d.getTime()===t.getTime()) return isZh ? '今天 (TODAY)' : 'Today';
  if(d.getTime()===y.getTime()) return isZh ? '昨天 (YESTERDAY)' : 'Yesterday';
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  return d.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric' });
}
