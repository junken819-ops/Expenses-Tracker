/**
 * Analytics Engine & Visual Charts
 * Modularized from Pocket Winnie Core
 */

// ── ANALYTICS ENGINE (COMPREHENSIVE & MULTI-DIMENSIONAL) ──
let anaInspectedDate = new Date();
let anaPeriod = 'month';
let currentAnaViewTab = 'overview';

let anaCurrentFilteredTxs = [];

function switchAnaViewTab(tab){
  currentAnaViewTab = tab;
  ['overview', 'breakdown', 'calories', 'ai'].forEach(t => {
    const btn = el('ana-view-tab-' + t);
    const pane = el('ana-pane-' + t);
    if(btn) btn.classList.toggle('on', t === tab);
    if(pane) pane.style.display = t === tab ? 'block' : 'none';
  });
  if(tab === 'calories' && typeof renderCalorieAnalytics === 'function'){
    renderCalorieAnalytics(anaCurrentFilteredTxs, anaPeriod, anaInspectedDate);
  }
}

function setAnaPeriod(p){
  anaPeriod = p;
  S.period = p;
  const sel = el('ana-period-select');
  if(sel) sel.value = p;
  renderAnalytics();
}

function stepAnaPeriod(delta){
  if(anaPeriod === 'week'){
    anaInspectedDate.setDate(anaInspectedDate.getDate() + delta * 7);
  } else if(anaPeriod === 'year'){
    anaInspectedDate.setDate(1);
    anaInspectedDate.setFullYear(anaInspectedDate.getFullYear() + delta);
  } else if(anaPeriod === 'month'){
    anaInspectedDate.setDate(1);
    anaInspectedDate.setMonth(anaInspectedDate.getMonth() + delta);
  }
  renderAnalytics();
}

function switchAnaBreakdown(mode){
  anaBreakdownMode = mode;
  const sel = el('ana-breakdown-sel');
  if(sel && sel.value !== mode) sel.value = mode;
  renderAnalytics();
}

function renderAnalytics(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const d = anaInspectedDate;
  const curYear = d.getFullYear();
  const curMonth = d.getMonth(); // 0-11
  
  // Format Stepper Title
  const stepperTitle = el('ana-stepper-title');
  const stepperBox = el('ana-stepper-box');
  if(stepperBox) stepperBox.style.display = anaPeriod === 'all' ? 'none' : 'flex';

  if(stepperTitle){
    if(anaPeriod === 'week'){
      const wStart = new Date(d);
      wStart.setDate(d.getDate() - d.getDay());
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      const f = dt => `${dt.getDate()} ${dt.toLocaleString('en-MY', {month:'short'})}`;
      stepperTitle.textContent = `${f(wStart)} – ${f(wEnd)}, ${wEnd.getFullYear()}`;
    } else if(anaPeriod === 'year'){
      stepperTitle.textContent = `${curYear}`;
    } else if(anaPeriod === 'month'){
      stepperTitle.textContent = d.toLocaleDateString(isZh ? 'zh-CN' : 'en-MY', { month: 'long', year: 'numeric' });
    }
  }

  // Filter transactions for current period
  const allTxs = filteredTx();
  let txs = [];
  let prevTxs = [];

  if(anaPeriod === 'all'){
    txs = allTxs;
  } else if(anaPeriod === 'year'){
    txs = allTxs.filter(t => {
      const dt = new Date(t.date + 'T00:00:00');
      return dt.getFullYear() === curYear;
    });
    prevTxs = allTxs.filter(t => {
      const dt = new Date(t.date + 'T00:00:00');
      return dt.getFullYear() === curYear - 1;
    });
  } else if(anaPeriod === 'week'){
    const wStart = new Date(d);
    wStart.setDate(d.getDate() - d.getDay());
    const wStartStr = `${wStart.getFullYear()}-${String(wStart.getMonth()+1).padStart(2,'0')}-${String(wStart.getDate()).padStart(2,'0')}`;
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    const wEndStr = `${wEnd.getFullYear()}-${String(wEnd.getMonth()+1).padStart(2,'0')}-${String(wEnd.getDate()).padStart(2,'0')}`;
    
    const pwStart = new Date(wStart);
    pwStart.setDate(pwStart.getDate() - 7);
    const pwStartStr = `${pwStart.getFullYear()}-${String(pwStart.getMonth()+1).padStart(2,'0')}-${String(pwStart.getDate()).padStart(2,'0')}`;
    const pwEnd = new Date(pwStart);
    pwEnd.setDate(pwStart.getDate() + 6);
    const pwEndStr = `${pwEnd.getFullYear()}-${String(pwEnd.getMonth()+1).padStart(2,'0')}-${String(pwEnd.getDate()).padStart(2,'0')}`;

    txs = allTxs.filter(t => t.date >= wStartStr && t.date <= wEndStr);
    prevTxs = allTxs.filter(t => t.date >= pwStartStr && t.date <= pwEndStr);
  } else {
    // Month
    txs = allTxs.filter(t => inMonth(t, curMonth, curYear));
    const pMonth = curMonth === 0 ? 11 : curMonth - 1;
    const pYear = curMonth === 0 ? curYear - 1 : curYear;
    prevTxs = allTxs.filter(t => inMonth(t, pMonth, pYear));
  }

  // Calculate Core Metrics
  const inc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const net = inc - exp;

  const prevInc = prevTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const prevExp = prevTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);

  if(el('ana-inc')) el('ana-inc').textContent = String(txs.length);
  if(el('ana-exp')) el('ana-exp').textContent = fmt(exp);
  if(el('ana-net')) {
    el('ana-net').textContent = (net >= 0 ? '+' : '-') + fmt(Math.abs(net));
    el('ana-net').style.color = net >= 0 ? 'var(--green)' : 'var(--red)';
  }

  // Deltas
  const incDeltaEl = el('ana-inc-sub');
  if(incDeltaEl){
    if(prevInc > 0){
      const diff = inc - prevInc;
      const pct = Math.round((diff / prevInc) * 100);
      incDeltaEl.textContent = `${diff >= 0 ? '▲ +' : '▼ '}${pct}% vs ${isZh ? '上期' : 'prev'}`;
      incDeltaEl.style.color = diff >= 0 ? 'var(--green)' : 'var(--muted)';
    } else {
      incDeltaEl.textContent = isZh ? '暂无上期对比' : 'No prior data';
      incDeltaEl.style.color = 'var(--muted)';
    }
  }

  const expDeltaEl = el('ana-exp-sub');
  if(expDeltaEl){
    if(prevExp > 0){
      const diff = exp - prevExp;
      const pct = Math.round((diff / prevExp) * 100);
      expDeltaEl.textContent = `${diff <= 0 ? '▼ ' : '▲ +'}${pct}% vs ${isZh ? '上期' : 'prev'}`;
      expDeltaEl.style.color = diff <= 0 ? 'var(--green)' : 'var(--red)';
    } else {
      expDeltaEl.textContent = isZh ? '暂无上期对比' : 'No prior data';
      expDeltaEl.style.color = 'var(--muted)';
    }
  }

  // Net Savings Rate & Daily Avg
  const netSub = el('ana-net-sub');
  if(netSub){
    const rate = inc > 0 ? Math.round((Math.max(0, net) / inc) * 100) : 0;
    netSub.textContent = isZh ? `储蓄率: ${rate}%` : `Savings Rate: ${rate}%`;
  }

  const activeDays = new Set(txs.filter(t => t.type === 'expense').map(t => t.date)).size;
  const daysInPeriod = anaPeriod === 'week' ? 7 : (anaPeriod === 'year' ? 365 : new Date(curYear, curMonth + 1, 0).getDate());
  const dailyAvg = exp / (anaPeriod === 'all' ? Math.max(1, activeDays) : daysInPeriod);
  
  if(el('ana-avg')) el('ana-avg').textContent = fmt(dailyAvg);
  if(el('ana-avg-sub')) el('ana-avg-sub').textContent = isZh ? `${activeDays} 个消费日` : `${activeDays} active days`;

  // Calculate Smart Highlights
  const exps = txs.filter(t => t.type === 'expense');
  
  // 1. Top Category
  const catTotals = {};
  exps.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0); });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
  if(el('ana-hl-top-cat')){
    if(sortedCats.length){
      const topC = catInfo('expense', sortedCats[0][0]);
      const pct = exp > 0 ? Math.round((sortedCats[0][1] / exp) * 100) : 0;
      el('ana-hl-top-cat').textContent = `${topC.icon} ${topC.name}`;
      if(el('ana-hl-top-cat-sub')) el('ana-hl-top-cat-sub').textContent = `${fmt(sortedCats[0][1])} (${pct}%)`;
    } else {
      el('ana-hl-top-cat').textContent = '—';
      if(el('ana-hl-top-cat-sub')) el('ana-hl-top-cat-sub').textContent = isZh ? '暂无支出' : '0% of spending';
    }
  }

  // 2. Largest Expense
  if(el('ana-hl-max-tx')){
    if(exps.length){
      const maxTx = exps.reduce((m, t) => (Number(t.amount) > Number(m.amount) ? t : m), exps[0]);
      el('ana-hl-max-tx').textContent = fmt(maxTx.amount);
      const descName = maxTx.desc ? esc(maxTx.desc) : catInfo('expense', maxTx.category).name;
      if(el('ana-hl-max-tx-sub')) el('ana-hl-max-tx-sub').textContent = `${descName} · ${fmtDate(maxTx.date)}`;
    } else {
      el('ana-hl-max-tx').textContent = '—';
      if(el('ana-hl-max-tx-sub')) el('ana-hl-max-tx-sub').textContent = isZh ? '暂无记录' : 'No transactions';
    }
  }

  // 3. Peak Spending Day
  const dayTotals = {};
  exps.forEach(t => { dayTotals[t.date] = (dayTotals[t.date] || 0) + (Number(t.amount) || 0); });
  const sortedDays = Object.entries(dayTotals).sort((a,b) => b[1] - a[1]);
  if(el('ana-hl-peak-day')){
    if(sortedDays.length){
      el('ana-hl-peak-day').textContent = fmt(sortedDays[0][1]);
      if(el('ana-hl-peak-day-sub')) el('ana-hl-peak-day-sub').textContent = fmtDate(sortedDays[0][0]);
    } else {
      el('ana-hl-peak-day').textContent = '—';
      if(el('ana-hl-peak-day-sub')) el('ana-hl-peak-day-sub').textContent = isZh ? '暂无峰值' : '0 days tracked';
    }
  }

  // 4. Tx Count & Avg
  if(el('ana-hl-tx-count')) el('ana-hl-tx-count').textContent = isZh ? `${txs.length} 笔` : `${txs.length} txs`;
  if(el('ana-hl-tx-avg')) {
    const avgVal = exps.length ? (exp / exps.length) : 0;
    el('ana-hl-tx-avg').textContent = isZh ? `平均每笔: ${fmt(avgVal)}` : `Avg: ${fmt(avgVal)}/tx`;
  }

  // Render Charts & Breakdown Lists
  renderEnhancedBarChart(txs, anaPeriod, d);
  renderEnhancedDonutAndList(txs, exp);
  renderAiPatternTracker(txs, inc, exp);
  renderAnaInflationBenchmark(txs, prevTxs, inc, exp);
  render50_30_20Matrix(txs, inc, exp);

  // New Visual Charts
  renderIncomeVsExpenseChart(inc, exp, prevInc, prevExp);
  renderMonthlyTrendChart(allTxs, d);
  renderBudgetGauge(exp);

  // 🥗 Calorie & Dietary Analytics Integration
  anaCurrentFilteredTxs = txs;
  renderCalorieOverviewCard(txs, anaPeriod, d);
  if(currentAnaViewTab === 'calories'){
    renderCalorieAnalytics(txs, anaPeriod, d);
  }
}


// ═══════════════════════════════════════════════════════════════════
//  VISUAL CHARTS — Income vs Expense, Monthly Trend, Budget Gauge
// ═══════════════════════════════════════════════════════════════════

function renderIncomeVsExpenseChart(inc, exp, prevInc, prevExp){
  const wrap = el('ive-bars-wrap');
  const card = el('ive-chart-card');
  if(!wrap || !card) return;
  const isZh = (S && S.lang === 'zh');

  // Hide card if no data at all
  if(inc <= 0 && exp <= 0){
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';

  const maxVal = Math.max(inc, exp, 1);
  const net = inc - exp;
  const incPct = Math.round((inc / maxVal) * 100);
  const expPct = Math.round((exp / maxVal) * 100);

  // Delta arrows
  let incDelta = '', expDelta = '';
  if(prevInc > 0){
    const d = Math.round(((inc - prevInc) / prevInc) * 100);
    incDelta = `<span style="font-size:10px;color:${d >= 0 ? 'var(--green)' : 'var(--red)'}"> ${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}%</span>`;
  }
  if(prevExp > 0){
    const d = Math.round(((exp - prevExp) / prevExp) * 100);
    expDelta = `<span style="font-size:10px;color:${d <= 0 ? 'var(--green)' : 'var(--red)'}"> ${d <= 0 ? '▼' : '▲'} ${Math.abs(d)}%</span>`;
  }

  wrap.innerHTML = `
    <div class="ive-bar-row">
      <div class="ive-bar-label">${isZh ? '收入' : 'Income'}</div>
      <div class="ive-bar-track">
        <div class="ive-bar-fill" style="width:${incPct}%;background:linear-gradient(90deg,#10b981,#34d399)">
          <span>${incPct}%</span>
        </div>
      </div>
      <div class="ive-bar-val" style="color:var(--green)">${fmt(inc)}${incDelta}</div>
    </div>
    <div class="ive-bar-row">
      <div class="ive-bar-label">${isZh ? '支出' : 'Expenses'}</div>
      <div class="ive-bar-track">
        <div class="ive-bar-fill" style="width:${expPct}%;background:linear-gradient(90deg,#ef4444,#f87171)">
          <span>${expPct}%</span>
        </div>
      </div>
      <div class="ive-bar-val" style="color:var(--red)">${fmt(exp)}${expDelta}</div>
    </div>
    <div class="ive-net-row">
      <span class="ive-net-label">${isZh ? '💎 净储蓄' : '💎 Net Savings'}</span>
      <span class="ive-net-val" style="color:${net >= 0 ? 'var(--green)' : 'var(--red)'}">
        ${net >= 0 ? '+' : ''}${fmt(net)}
      </span>
    </div>
  `;
}

function renderMonthlyTrendChart(allTxs, baseDate){
  const barsEl = el('mtrend-bars');
  const tipEl = el('mtrend-tooltip');
  const titleEl = el('mtrend-title');
  if(!barsEl) return;

  const isZh = (S && S.lang === 'zh');
  if(titleEl) titleEl.textContent = isZh ? '📊 近 6 个月支出趋势' : '📊 6-Month Spending Trend';

  const curYear = baseDate.getFullYear();
  const curMonth = baseDate.getMonth();

  // Build 6 months of data ending at current month
  const months = [];
  for(let i = 5; i >= 0; i--){
    let m = curMonth - i;
    let y = curYear;
    while(m < 0){ m += 12; y--; }
    const monthTxs = allTxs.filter(t => t.type === 'expense' && inMonth(t, m, y));
    const spend = monthTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const count = monthTxs.length;
    const label = isZh
      ? `${m+1}月`
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m];
    months.push({ m, y, spend, count, label, isCurrent: (i === 0) });
  }

  const maxSpend = Math.max(...months.map(d => d.spend), 1);
  const colors = ['#6366f1','#8b5cf6','#a78bfa','#c084fc','#e879f9','#f59e0b'];

  barsEl.innerHTML = '';
  months.forEach((d, idx) => {
    const pct = Math.max(2, Math.round((d.spend / maxSpend) * 100));
    const col = document.createElement('div');
    col.className = 'mtrend-col';

    const amtLabel = d.spend > 0
      ? (d.spend >= 1000 ? `${(d.spend/1000).toFixed(1)}k` : Math.round(d.spend).toString())
      : '';

    col.innerHTML = `
      <div class="mtrend-amt">${amtLabel}</div>
      <div class="mtrend-bar-wrap">
        <div class="mtrend-bar${d.isCurrent ? ' active' : ''}" 
             style="height:${pct}%;background:${d.isCurrent ? 'linear-gradient(180deg,#f59e0b,#d97706)' : colors[idx]}"
             data-idx="${idx}"></div>
      </div>
      <div class="mtrend-label${d.isCurrent ? ' active' : ''}">${d.label}</div>
    `;

    // Interactive click
    const bar = col.querySelector('.mtrend-bar');
    if(bar){
      bar.addEventListener('click', () => {
        if(tipEl){
          const delta = idx > 0 && months[idx-1].spend > 0
            ? Math.round(((d.spend - months[idx-1].spend) / months[idx-1].spend) * 100)
            : null;
          const deltaStr = delta !== null
            ? ` · <span style="color:${delta <= 0 ? 'var(--green)' : 'var(--red)'}">
                ${delta <= 0 ? '▼' : '▲'}${Math.abs(delta)}% vs prev
              </span>`
            : '';
          tipEl.innerHTML = `<strong>${d.label} ${d.y}</strong> · ${fmt(d.spend)} (${d.count} ${isZh ? '笔' : 'txs'})${deltaStr}`;
        }
        // Highlight active bar
        barsEl.querySelectorAll('.mtrend-bar').forEach(b => b.classList.remove('active'));
        bar.classList.add('active');
        barsEl.querySelectorAll('.mtrend-label').forEach(l => l.classList.remove('active'));
        const lbl = col.querySelector('.mtrend-label');
        if(lbl) lbl.classList.add('active');
      });
    }

    barsEl.appendChild(col);
  });

  // Set default tooltip to current month
  const cur = months[months.length - 1];
  if(tipEl && cur.spend > 0){
    const prev = months[months.length - 2];
    const delta = prev && prev.spend > 0
      ? Math.round(((cur.spend - prev.spend) / prev.spend) * 100)
      : null;
    const deltaStr = delta !== null
      ? ` · <span style="color:${delta <= 0 ? 'var(--green)' : 'var(--red)'}">
          ${delta <= 0 ? '▼' : '▲'}${Math.abs(delta)}% vs prev
        </span>`
      : '';
    tipEl.innerHTML = `<strong>${cur.label} ${cur.y}</strong> · ${fmt(cur.spend)} (${cur.count} ${isZh ? '笔' : 'txs'})${deltaStr}`;
  } else if(tipEl){
    tipEl.innerHTML = isZh ? '点击柱条查看月度详情' : 'Tap a bar for monthly details';
  }
}

function renderBudgetGauge(currentExp){
  const card = el('budget-gauge-card');
  const svgEl = el('budget-gauge-svg');
  const pctEl = el('budget-gauge-pct');
  const subEl = el('budget-gauge-sublabel');
  const infoEl = el('budget-gauge-info');
  if(!card || !svgEl) return;

  const isZh = (S && S.lang === 'zh');
  const budget = getMonthlyBudgetTotal();

  if(budget <= 0){
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';

  const pct = Math.min(Math.round((currentExp / budget) * 100), 200);
  const displayPct = Math.min(pct, 100);
  const remaining = Math.max(0, budget - currentExp);
  const isOver = currentExp > budget;

  // Color: green -> amber -> red based on percentage
  let gaugeColor = '#10b981'; // green
  if(pct >= 90) gaugeColor = '#ef4444'; // red
  else if(pct >= 70) gaugeColor = '#f59e0b'; // amber

  // SVG Arc gauge (270-degree arc)
  const cx = 50, cy = 50, r = 40;
  const startAngle = 135; // degrees
  const totalAngle = 270;
  const fillAngle = (displayPct / 100) * totalAngle;

  function polarToCartesian(cx, cy, r, angleDeg){
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function describeArc(cx, cy, r, startA, endA){
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArc = (endA - startA) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const bgArc = describeArc(cx, cy, r, startAngle, startAngle + totalAngle);
  const fillArc = fillAngle > 0 ? describeArc(cx, cy, r, startAngle, startAngle + fillAngle) : '';

  svgEl.innerHTML = `
    <path d="${bgArc}" fill="none" stroke="var(--bg2)" stroke-width="8" stroke-linecap="round"/>
    ${fillArc ? `<path d="${fillArc}" fill="none" stroke="${gaugeColor}" stroke-width="8" stroke-linecap="round" style="transition:all .5s ease"/>` : ''}
  `;

  if(pctEl){
    pctEl.textContent = `${pct}%`;
    pctEl.style.color = gaugeColor;
  }
  if(subEl) subEl.textContent = isZh ? '已用' : 'used';

  if(infoEl){
    infoEl.innerHTML = `
      <div class="budget-gauge-row">
        <span class="bg-label">${isZh ? '💰 月度预算' : '💰 Budget'}</span>
        <span class="bg-val" style="color:var(--text)">${fmt(budget)}</span>
      </div>
      <div class="budget-gauge-row">
        <span class="bg-label">${isZh ? '🔥 已花费' : '🔥 Spent'}</span>
        <span class="bg-val" style="color:var(--red)">${fmt(currentExp)}</span>
      </div>
      <div class="budget-gauge-row">
        <span class="bg-label">${isZh ? '✨ 剩余可用' : '✨ Remaining'}</span>
        <span class="bg-val" style="color:${isOver ? 'var(--red)' : 'var(--green)'}">${isOver ? (isZh ? '超支 ' : 'Over by ') + fmt(currentExp - budget) : fmt(remaining)}</span>
      </div>
      ${isOver ? `<div style="font-size:10.5px;color:var(--red);font-weight:700;margin-top:4px;text-align:center">⚠️ ${isZh ? '本月已超出预算！' : 'Over budget this month!'}</div>` : ''}
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CALORIE & NUTRITION ANALYTICS
// ═══════════════════════════════════════════════════════════════════

function extractPeriodCalorieData(txs){
  let totalKcal = 0;
  let totalProtein = 0;
  let foodSpend = 0;
  let itemCount = 0;
  const dailyMap = {};
  const dishes = [];
  const catMap = {};

  (txs || []).forEach(tx => {
    if(tx.type !== 'expense') return;
    const isFood = (tx.category === 'food' || tx.category === 'drinks' || getTxCalories(tx) > 0);
    if(!isFood) return;

    foodSpend += (Number(tx.amount) || 0);
    const txCal = getTxCalories(tx);
    const txProt = getTxProtein(tx);
    const dt = tx.date || today();

    if(!dailyMap[dt]) dailyMap[dt] = { kcal: 0, protein: 0, spend: 0, receipts: 0, dishes: [] };
    dailyMap[dt].spend += (Number(tx.amount) || 0);
    dailyMap[dt].receipts += 1;

    const items = extractTxReceiptItems(tx);
    items.forEach(it => {
      const cal = parseInt(it.calories) || 0;
      const prot = parseInt(it.protein) || 0;
      const qty = parseInt(it.qty) || 1;
      const price = parseFloat(it.price) || 0;
      if(cal > 0 || prot > 0){
        const dishTotalKcal = cal * qty;
        const dishTotalProt = prot * qty;
        totalKcal += dishTotalKcal;
        totalProtein += dishTotalProt;
        itemCount += qty;
        dailyMap[dt].kcal += dishTotalKcal;
        dailyMap[dt].protein += dishTotalProt;
        
        const dishObj = {
          name: it.name || tx.desc || 'Dish',
          cal,
          totalCal: dishTotalKcal,
          protein: prot,
          totalProtein: dishTotalProt,
          qty,
          price,
          merchant: tx.desc || '',
          date: dt,
          subCategory: it.subCategory || tx.subCategory || 'food_other'
        };
        dishes.push(dishObj);
        dailyMap[dt].dishes.push(dishObj);

        let catKey = it.subCategory || tx.subCategory || 'other';
        catMap[catKey] = (catMap[catKey] || 0) + dishTotalKcal;
      }
    });
  });

  const activeDays = Object.keys(dailyMap).filter(k => dailyMap[k].kcal > 0 || dailyMap[k].protein > 0).length;
  const avgDailyKcal = activeDays > 0 ? Math.round(totalKcal / activeDays) : 0;
  const avgDailyProtein = activeDays > 0 ? Math.round(totalProtein / activeDays) : 0;
  const costPer100Kcal = totalKcal > 0 ? ((foodSpend / totalKcal) * 100) : 0;

  return {
    totalKcal,
    totalProtein,
    foodSpend,
    itemCount,
    activeDays,
    avgDailyKcal,
    avgDailyProtein,
    costPer100Kcal,
    dailyMap,
    dishes,
    catMap
  };
}

function renderCalorieOverviewCard(txs, period, baseDate){
  const card = el('ana-cal-overview-card');
  if(!card) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const data = extractPeriodCalorieData(txs);

  const totalEl = el('ana-cal-ov-total');
  const daysEl = el('ana-cal-ov-days');
  const avgEl = el('ana-cal-ov-avg');
  const costEl = el('ana-cal-ov-cost');
  const topDishEl = el('ana-cal-ov-topdish');

  if(totalEl) totalEl.textContent = `${data.totalKcal.toLocaleString()} kcal`;
  if(daysEl) daysEl.textContent = isZh ? `${data.activeDays} 饮食日 · 🥩 ${data.totalProtein}g` : `${data.activeDays} meal days · 🥩 ${data.totalProtein}g`;
  if(avgEl) avgEl.textContent = `${data.avgDailyKcal.toLocaleString()} kcal`;
  if(costEl) costEl.textContent = `RM ${data.costPer100Kcal.toFixed(2)}`;

  if(topDishEl){
    if(data.dishes.length > 0){
      const sortedDishes = [...data.dishes].sort((a,b) => b.totalCal - a.totalCal);
      const top = sortedDishes[0];
      topDishEl.innerHTML = `
        <span>🍽️</span>
        <span>${isZh ? '最高热量菜品' : 'Top Calorie Dish'}: <strong>${esc(top.name)}</strong> (🔥 ${top.totalCal} kcal · 🥩 ${top.totalProtein}g) ${top.merchant ? '· ' + esc(top.merchant) : ''}</span>
      `;
    } else {
      topDishEl.innerHTML = `
        <span>🍽️</span>
        <span>${isZh ? '本期尚未记录食物热量，使用小票扫描自动记录！' : 'No calories logged in this period. Scan receipts to track automatically!'}</span>
      `;
    }
  }
}

function renderCalorieAnalytics(txs, period, baseDate){
  const pane = el('ana-pane-calories');
  if(!pane) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const data = extractPeriodCalorieData(txs);

  // 1. Status badge & Header
  const badge = el('ana-cal-status-badge');
  if(badge){
    if(data.totalKcal === 0){
      badge.textContent = isZh ? '暂无热量数据' : 'No Food Data';
      badge.style.background = 'rgba(255,255,255,0.06)';
      badge.style.color = 'var(--muted)';
    } else if(data.avgDailyKcal <= 1800){
      badge.textContent = isZh ? '🥗 饮食清淡' : '🥗 Light Diet';
      badge.style.background = 'rgba(16,185,129,0.2)';
      badge.style.color = '#10b981';
    } else if(data.avgDailyKcal <= 2300){
      badge.textContent = isZh ? '✅ 摄入达标' : '✅ Balanced Intake';
      badge.style.background = 'rgba(245,158,11,0.2)';
      badge.style.color = '#f59e0b';
    } else {
      badge.textContent = isZh ? '⚠️ 热量偏高' : '⚠️ High Calorie';
      badge.style.background = 'rgba(239,68,68,0.2)';
      badge.style.color = '#ef4444';
    }
  }

  // 2. Metrics cards
  if(el('ana-cal-total-val')) el('ana-cal-total-val').textContent = `${data.totalKcal.toLocaleString()} kcal`;
  if(el('ana-cal-total-sub')) el('ana-cal-total-sub').textContent = isZh ? `${data.activeDays} 个饮食日 · 🥩 共 ${data.totalProtein}g 蛋白质` : `${data.activeDays} meal days · 🥩 ${data.totalProtein}g protein`;
  if(el('ana-cal-avg-val')) el('ana-cal-avg-val').textContent = `${data.avgDailyKcal.toLocaleString()} kcal`;
  if(el('ana-cal-avg-sub')) el('ana-cal-avg-sub').textContent = isZh ? `日均 (🥩 蛋白质 ${data.avgDailyProtein}g)` : `Daily avg (🥩 ${data.avgDailyProtein}g protein)`;
  if(el('ana-cal-spend-val')) el('ana-cal-spend-val').textContent = fmt(data.foodSpend);
  if(el('ana-cal-spend-sub')) el('ana-cal-spend-sub').textContent = isZh ? `共记录 ${data.itemCount} 样食物` : `${data.itemCount} item${data.itemCount !== 1 ? 's' : ''} logged`;
  if(el('ana-cal-eff-val')) el('ana-cal-eff-val').textContent = `RM ${data.costPer100Kcal.toFixed(2)}`;
  if(el('ana-cal-eff-sub')) el('ana-cal-eff-sub').textContent = isZh ? '每 100 kcal 花费' : 'per 100 kcal consumed';

  // Benchmark progress against 2000 kcal target
  const pct = Math.min(100, Math.round((data.avgDailyKcal / 2000) * 100));
  if(el('ana-cal-progress-pct')) el('ana-cal-progress-pct').textContent = `${pct}%`;
  if(el('ana-cal-progress-fill')){
    el('ana-cal-progress-fill').style.width = `${pct}%`;
    el('ana-cal-progress-fill').style.background = data.avgDailyKcal <= 1800 ? 'linear-gradient(90deg,#10b981,#34d399)' : (data.avgDailyKcal <= 2300 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)');
  }

  // 3. Daily Calorie Bar Chart
  renderCalorieBarChart(data.dailyMap, period, baseDate, isZh);

  // 4. Top Dishes List
  const topList = el('ana-cal-top-dishes-list');
  if(topList){
    const sortedDishes = [...data.dishes].sort((a,b) => b.totalCal - a.totalCal).slice(0, 5);
    if(sortedDishes.length === 0){
      topList.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--muted)">${isZh ? '本期暂无单品数据' : 'No dish data for this period'}</div>`;
    } else {
      topList.innerHTML = sortedDishes.map((dish, i) => {
        const medal = ['🥇','🥈','🥉','4️⃣','5️⃣'][i] || '•';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:8px 10px">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
              <span style="font-size:14px;flex-shrink:0">${medal}</span>
              <div style="min-width:0;flex:1">
                <div style="font-size:12px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${dish.qty > 1 ? `<span style="color:var(--cyan);font-weight:900;margin-right:2px">${dish.qty}x</span> ` : ''}${esc(dish.name)}
                </div>
                <div style="font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${dish.merchant ? `📍 ${esc(dish.merchant)} · ` : ''}${fmtDate(dish.date)}
                </div>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:8px">
              <div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">
                <span style="font-size:11px;font-weight:900;color:#10b981;background:rgba(16,185,129,.14);padding:2px 5px;border-radius:5px;border:1px solid rgba(16,185,129,.28)">🔥 ${dish.totalCal} kcal</span>
                ${dish.totalProtein > 0 ? `<span style="font-size:10.5px;font-weight:900;color:var(--cyan);background:rgba(6,182,212,.14);padding:2px 5px;border-radius:5px;border:1px solid rgba(6,182,212,.28)">🥩 ${dish.totalProtein}g</span>` : ''}
              </div>
              ${dish.price > 0 ? `<div style="font-size:10px;color:var(--muted);margin-top:2px">${fmt(dish.price * dish.qty)}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Food Calorie Category Breakdown
  const catBreakdown = el('ana-cal-cat-breakdown');
  if(catBreakdown){
    const entries = Object.entries(data.catMap).sort((a,b) => b[1] - a[1]);
    if(entries.length === 0){
      catBreakdown.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--muted)">${isZh ? '暂无分类数据' : 'No meal categories in this period'}</div>`;
    } else {
      catBreakdown.innerHTML = entries.map(([key, kcal]) => {
        const subInfo = getSubCatInfo(key);
        const name = subInfo ? `${subInfo.icon} ${subInfo.name}` : (isZh ? '餐饮杂项' : 'Food & Drinks');
        const pct = data.totalKcal > 0 ? Math.round((kcal / data.totalKcal) * 100) : 0;
        return `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;margin-bottom:3px">
              <span style="color:var(--text)">${name}</span>
              <span style="color:#10b981">${kcal.toLocaleString()} kcal (${pct}%)</span>
            </div>
            <div style="background:var(--bg2);height:7px;border-radius:5px;overflow:hidden">
              <div style="background:#10b981;height:100%;width:${pct}%;border-radius:5px"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 6. Food Receipts List
  const receiptsList = el('ana-cal-receipts-list');
  if(receiptsList){
    const foodTxs = (txs || []).filter(t => t.type === 'expense' && (t.category === 'food' || t.category === 'drinks' || getTxCalories(t) > 0));
    if(foodTxs.length === 0){
      receiptsList.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--muted)">${isZh ? '本期暂无餐饮小票' : 'No food receipts for this period'}</div>`;
    } else {
      receiptsList.innerHTML = foodTxs.map(t => {
        const c = getTxCalories(t);
        const p = getTxProtein(t);
        const items = extractTxReceiptItems(t);
        const itemsSummary = items.map(it => it.name).filter(Boolean).slice(0, 3).join(', ');
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:8px 10px;cursor:pointer" onclick="openTxDetailModal('${t.id}')">
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${esc(t.desc || 'Restaurant')}
              </div>
              <div style="font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${fmtDate(t.date)}${itemsSummary ? ' · ' + esc(itemsSummary) : ''}
              </div>
            </div>
            <div style="text-align:right;margin-left:8px;flex-shrink:0">
              <div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">
                ${c > 0 ? `<span style="font-size:11px;font-weight:900;color:#10b981">🔥 ${c} kcal</span>` : ''}
                ${p > 0 ? `<span style="font-size:10.5px;font-weight:800;color:var(--cyan)">🥩 ${p}g</span>` : ''}
              </div>
              <div style="font-size:10px;font-weight:700;color:var(--text);margin-top:1px">${fmt(t.amount)}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderCalorieBarChart(dailyMap, period, baseDate, isZh){
  const chart = el('ana-cal-bars');
  const tip = el('ana-cal-chart-tooltip');
  if(!chart) return;
  chart.innerHTML = '';
  if(tip) tip.textContent = '';

  let labels = [];
  const curYear = baseDate.getFullYear();
  const curMonth = baseDate.getMonth();

  if(period === 'week'){
    const wStart = new Date(baseDate);
    wStart.setDate(baseDate.getDate() - baseDate.getDay());
    const dayNames = isZh ? ['周日','周一','周二','周三','周四','周五','周六'] : ['Su','Mo','Tu','We','Th','Fr','Sa'];
    for(let i = 0; i < 7; i++){
      const dt = new Date(wStart);
      dt.setDate(wStart.getDate() + i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      labels.push({ label: dayNames[i], date: ds, title: `${dayNames[i]} (${ds})` });
    }
  } else if(period === 'year'){
    const monthNames = isZh ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(let m = 0; m < 12; m++){
      labels.push({ label: monthNames[m], month: m, year: curYear, title: isZh ? `${curYear}年${m+1}月` : `${monthNames[m]} ${curYear}` });
    }
  } else {
    // Month (6 intervals of ~5 days)
    const dim = new Date(curYear, curMonth + 1, 0).getDate();
    const bucketCount = 6;
    const bucketSize = Math.ceil(dim / bucketCount);
    for(let b = 0; b < bucketCount; b++){
      const s = b * bucketSize + 1;
      const e = Math.min((b + 1) * bucketSize, dim);
      labels.push({
        label: `${s}-${e}`,
        start: s,
        end: e,
        month: curMonth,
        year: curYear,
        title: isZh ? `${curMonth+1}月${s}日 - ${e}日` : `${s}-${e} ${baseDate.toLocaleString('en-MY', {month:'short'})}`
      });
    }
  }

  // Calculate totals for each bucket
  const totals = labels.map(l => {
    let kcal = 0;
    if(period === 'week'){
      kcal = dailyMap[l.date] ? dailyMap[l.date].kcal : 0;
    } else if(period === 'year'){
      Object.keys(dailyMap).forEach(d => {
        const dt = new Date(d + 'T00:00:00');
        if(dt.getFullYear() === l.year && dt.getMonth() === l.month){
          kcal += dailyMap[d].kcal;
        }
      });
    } else {
      Object.keys(dailyMap).forEach(d => {
        const dt = new Date(d + 'T00:00:00');
        const day = dt.getDate();
        if(dt.getFullYear() === l.year && dt.getMonth() === l.month && day >= l.start && day <= l.end){
          kcal += dailyMap[d].kcal;
        }
      });
    }
    return { kcal, label: l.label, title: l.title };
  });

  const maxKcal = Math.max(...totals.map(t => t.kcal), 2500);

  totals.forEach(t => {
    const col = document.createElement('div');
    col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;cursor:pointer;position:relative';

    const pct = Math.min(100, Math.max(t.kcal > 0 ? 8 : 2, Math.round((t.kcal / maxKcal) * 100)));
    const barColor = t.kcal === 0 ? 'var(--border)' : (t.kcal <= 1800 ? '#10b981' : (t.kcal <= 2300 ? '#f59e0b' : '#ef4444'));

    col.innerHTML = `
      <div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:2px">${t.kcal > 0 ? t.kcal : ''}</div>
      <div style="width:100%;max-width:26px;height:${pct}%;background:${barColor};border-radius:6px 6px 0 0;transition:height .3s"></div>
      <div style="font-size:10px;font-weight:700;color:var(--muted);margin-top:4px">${t.label}</div>
    `;

    col.onmouseenter = () => {
      if(tip) tip.textContent = `${t.title}: ${t.kcal.toLocaleString()} kcal ${t.kcal > 0 ? (t.kcal <= 2000 ? '✅' : '⚠️') : ''}`;
    };
    col.onclick = () => {
      if(tip) tip.textContent = `${t.title}: ${t.kcal.toLocaleString()} kcal ${t.kcal > 0 ? (t.kcal <= 2000 ? '✅' : '⚠️') : ''}`;
    };

    chart.appendChild(col);
  });
}

function renderEnhancedBarChart(txs, period, baseDate){
  const chart = el('bar-chart');
  const tip = el('bar-chart-tooltip');
  if(!chart) return;
  chart.innerHTML = '';
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  let labels = [];
  const curYear = baseDate.getFullYear();
  const curMonth = baseDate.getMonth();

  if(period === 'week'){
    const wStart = new Date(baseDate);
    wStart.setDate(baseDate.getDate() - baseDate.getDay());
    const dayNames = isZh ? ['周日','周一','周二','周三','周四','周五','周六'] : ['Su','Mo','Tu','We','Th','Fr','Sa'];
    for(let i = 0; i < 7; i++){
      const dt = new Date(wStart);
      dt.setDate(wStart.getDate() + i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      labels.push({ label: dayNames[i], date: ds, title: `${dayNames[i]} (${ds})` });
    }
  } else if(period === 'year'){
    const monthNames = isZh ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(let m = 0; m < 12; m++){
      labels.push({ label: monthNames[m], month: m, year: curYear, title: isZh ? `${curYear}年${m+1}月` : `${monthNames[m]} ${curYear}` });
    }
  } else {
    // Month (6 clean 5-day intervals)
    const dim = new Date(curYear, curMonth + 1, 0).getDate();
    const bucketCount = 6;
    const bucketSize = Math.ceil(dim / bucketCount);
    for(let b = 0; b < bucketCount; b++){
      const s = b * bucketSize + 1;
      const e = Math.min((b + 1) * bucketSize, dim);
      labels.push({
        label: `${s}-${e}`,
        start: s,
        end: e,
        month: curMonth,
        year: curYear,
        title: isZh ? `${curMonth+1}月${s}日 - ${e}日` : `${s}-${e} ${baseDate.toLocaleString('en-MY', {month:'short'})}`
      });
    }
  }

  const totals = labels.map(l => {
    let exp = 0;
    txs.forEach(tx => {
      const dt = new Date(tx.date + 'T00:00:00');
      let match = false;
      if(period === 'week') match = tx.date === l.date;
      else if(period === 'year') match = dt.getFullYear() === l.year && dt.getMonth() === l.month;
      else {
        const day = dt.getDate();
        match = dt.getFullYear() === l.year && dt.getMonth() === l.month && day >= l.start && day <= l.end;
      }
      if(match){
        exp += Number(tx.amount) || 0;
      }
    });
    return { exp, label: l.label, title: l.title };
  });

  // SVG Geometry
  const W = 360;
  const H = 130;
  const padLeft = 24;
  const padRight = 24;
  const padTop = 16;
  const padBottom = 26;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom; // 88px

  const maxVal = Math.max(...totals.map(t => t.exp), 1) * 1.2;
  const N = totals.length;

  const points = totals.map((t, idx) => {
    const x = N > 1 ? padLeft + (idx / (N - 1)) * chartW : W / 2;
    const yExp = padTop + chartH - (t.exp / maxVal) * chartH;
    return { ...t, x, yExp };
  });

  function buildSmoothPath(pts, yProp){
    if(!pts.length) return '';
    if(pts.length === 1) return `M ${pts[0].x},${pts[0][yProp]}`;
    let d = `M ${pts[0].x},${pts[0][yProp]}`;
    for(let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i];
      const p1 = pts[i+1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx},${p0[yProp]} ${mx},${p1[yProp]} ${p1.x},${p1[yProp]}`;
    }
    return d;
  }

  const expLinePath = buildSmoothPath(points, 'yExp');
  const baseY = padTop + chartH;
  const expAreaPath = `${expLinePath} L ${points[points.length-1].x},${baseY} L ${points[0].x},${baseY} Z`;

  // Construct SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'trend-line-chart-svg');

  svg.innerHTML = `
    <defs>
      <linearGradient id="expTrendGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--red)" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="var(--red)" stop-opacity="0.0"/>
      </linearGradient>
    </defs>

    <!-- Grid Lines -->
    <line x1="${padLeft}" y1="${padTop}" x2="${W - padRight}" y2="${padTop}" class="trend-grid-line"/>
    <line x1="${padLeft}" y1="${padTop + chartH * 0.5}" x2="${W - padRight}" y2="${padTop + chartH * 0.5}" class="trend-grid-line"/>
    <line x1="${padLeft}" y1="${baseY}" x2="${W - padRight}" y2="${baseY}" stroke="rgba(255,255,255,.12)" stroke-width="1"/>

    <!-- Active Indicator Guideline -->
    <line id="trend-hover-guide" x1="-100" y1="${padTop}" x2="-100" y2="${baseY}" stroke="var(--amber)" stroke-dasharray="3,3" stroke-width="1.5" style="transition:all .12s ease"/>

    <!-- Area Fill -->
    <path d="${expAreaPath}" fill="url(#expTrendGrad)"/>

    <!-- Stroke Line -->
    <path d="${expLinePath}" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Data Points & X-Axis Labels -->
    ${points.map((p, idx) => `
      <g class="trend-point-group" data-idx="${idx}">
        <!-- Expense Dot -->
        ${p.exp > 0 ? `<circle cx="${p.x}" cy="${p.yExp}" r="3.5" fill="var(--red)" stroke="var(--bg2)" stroke-width="1.8" class="trend-dot"/>` : `<circle cx="${p.x}" cy="${baseY}" r="2" fill="var(--dim)"/>`}
        <!-- X-Axis Label -->
        <text x="${p.x}" y="${baseY + 16}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--dim)">${p.label}</text>
        <!-- Invisible Touch Target -->
        <rect x="${p.x - chartW / (N * 2)}" y="0" width="${chartW / N}" height="${H}" fill="transparent" style="cursor:pointer"/>
      </g>
    `).join('')}
  `;

  chart.appendChild(svg);

  // Set default tooltip to latest active bucket
  const activeBucket = points.slice().reverse().find(p => p.exp > 0) || points[points.length - 1];
  if(activeBucket && tip){
    tip.innerHTML = `<strong>${activeBucket.title}</strong> · ${isZh ? '支出' : 'Expense'}: <span style="color:var(--red)">${fmt(activeBucket.exp)}</span>`;
  }

  // Bind interactive touch / hover events
  const groups = svg.querySelectorAll('.trend-point-group');
  groups.forEach(g => {
    const idx = parseInt(g.getAttribute('data-idx'), 10);
    const p = points[idx];
    const selectPoint = () => {
      const guide = svg.querySelector('#trend-hover-guide');
      if(guide){
        guide.setAttribute('x1', p.x);
        guide.setAttribute('x2', p.x);
      }
      if(tip){
        tip.innerHTML = `<strong>${p.title}</strong> · ${isZh ? '支出' : 'Expense'}: <span style="color:var(--red)">${fmt(p.exp)}</span>`;
      }
    };
    g.addEventListener('mouseenter', selectPoint);
    g.addEventListener('click', selectPoint);
    g.addEventListener('touchstart', selectPoint, { passive: true });
  });
}
function getFoodItemSubGroup(name){
  const n = (name || '').toLowerCase();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  // 1. Drinks & Beverages
  if(/\b(tea|teh|kopi|coffee|latte|cappuccino|mocha|americano|espresso|drink|juice|boba|water|beverage|cola|coke|sprite|beer|wine|soda|lemonade|matcha|chocolate|milo)\b|冰|茶|咖啡|奶茶|果汁|饮料|水|啤酒/i.test(n)){
    return { id: 'drinks', name: isZh ? '饮料与咖啡 (Drinks)' : 'Drinks & Beverages', icon: '🧋', col: '#06b6d4' };
  }
  // 2. Main Meals (Noodles, Rice, Meat, Pasta, Burgers)
  if(/\b(rice|nasi|noodle|noodles|mee|bihun|kway teow|kuay teow|pasta|spaghetti|burger|pizza|chicken|pork|beef|duck|fish|soup|curry|bento|steak|chop|lamb|ramen|laksa|porridge)\b|饭|面|粉|鸡|肉|猪|牛|羊|鱼|饭盒|便当|汤|咖喱|拉面|粥/i.test(n)){
    return { id: 'mains', name: isZh ? '正餐与主食 (Mains)' : 'Main Meals & Staples', icon: '🍲', col: '#f59e0b' };
  }
  // 3. Snacks, Sides, Bakery & Desserts
  if(/\b(snack|fries|potato|dim sum|dumpling|cake|bread|toast|roti|dessert|ice cream|waffle|pastry|pie|croissant|bun|egg|tart|biscuit|cookie|sweet)\b|小吃|点心|炸|薯|面包|蛋糕|甜品|冰淇淋|饼|蛋挞|包/i.test(n)){
    return { id: 'snacks', name: isZh ? '小吃与烘焙 (Snacks)' : 'Sides, Snacks & Bakery', icon: '🍢', col: '#ec4899' };
  }
  // 4. Groceries & Fresh Produce
  if(/\b(grocery|vegetable|fruit|apple|banana|milk|oil|sugar|salt|tissue|soap|cleaner|market)\b|菜|蔬菜|水果|牛奶|生鲜|杂货/i.test(n)){
    return { id: 'groceries', name: isZh ? '生鲜与杂货 (Market)' : 'Groceries & Fresh Market', icon: '🛒', col: '#10b981' };
  }
  // 5. General / Other Items
  return { id: 'general', name: isZh ? '其他商品与零售 (Other)' : 'Other Items & Retail', icon: '📦', col: '#8b5cf6' };
}

function renderEnhancedDonutAndList(txs, totalExp){
  const svg = el('donut-svg'), leg = el('donut-legend'), rankList = el('ana-rank-list');
  if(!svg || !leg) return;
  svg.innerHTML = ''; leg.innerHTML = '';
  if(rankList) rankList.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const exps = txs.filter(t => t.type === 'expense');
  if(!exps.length || totalExp <= 0){
    if(el('donut-center')) el('donut-center').innerHTML = '<div style="font-size:11px;color:var(--dim)">No data</div>';
    if(rankList) rankList.innerHTML = `<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px">${isZh ? '本周期暂无支出数据' : 'No expense records in this period'}</div>`;
    return;
  }

  const breakdown = {};
  let totalCalculatedAmount = totalExp;

  if(anaBreakdownMode === 'top_items' || anaBreakdownMode === 'items'){
    // Top 5 Dishes & Items Leaderboard (Never long or overwhelming!)
    const allItems = [];
    let totalItemsAmt = 0;
    exps.forEach(tx => {
      if(tx.items && Array.isArray(tx.items) && tx.items.length > 0){
        tx.items.forEach(it => {
          const name = String(it.name || 'Item').trim();
          const p = Number(it.price) || 0;
          const q = parseInt(it.qty, 10) || 1;
          const lineTotal = p * q;
          if(!name && lineTotal <= 0) return;
          allItems.push({ name, price: lineTotal, qty: q, store: tx.desc || '' });
          totalItemsAmt += lineTotal;
        });
      } else {
        const name = (tx.desc || catInfo('expense', tx.category).name || 'Expense').trim();
        const amt = Number(tx.amount) || 0;
        allItems.push({ name, price: amt, qty: 1, store: tx.desc || '' });
        totalItemsAmt += amt;
      }
    });

    // Group duplicate names
    const itemMap = {};
    allItems.forEach(it => {
      const k = it.name.toLowerCase();
      if(!itemMap[k]){
        itemMap[k] = { name: it.name, amount: 0, count: 0, store: it.store };
      }
      itemMap[k].amount += it.price;
      itemMap[k].count += it.qty;
    });

    const sortedItems = Object.values(itemMap).sort((a,b) => b.amount - a.amount);
    const top5 = sortedItems.slice(0, 5);
    const rest = sortedItems.slice(5);

    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    top5.forEach((it, idx) => {
      breakdown[`top_${idx}`] = {
        amount: it.amount,
        count: it.count,
        label: `${rankMedals[idx]} ${it.name}`,
        icon: '🍽️',
        col: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'][idx],
        store: it.store
      };
    });

    if(rest.length > 0){
      const restTotal = rest.reduce((s,i) => s + i.amount, 0);
      const restCount = rest.reduce((s,i) => s + i.count, 0);
      breakdown['other_items'] = {
        amount: restTotal,
        count: restCount,
        label: isZh ? `📦 其他单品 (共 ${rest.length} 样)` : `📦 Other Items (${rest.length} items)`,
        icon: '📦',
        col: '#9ca3af',
        subItems: rest
      };
    }
    totalCalculatedAmount = totalItemsAmt > 0 ? totalItemsAmt : totalExp;
  } else if(anaBreakdownMode === 'food_types'){
    // Group all dishes into clean high-level food types: Mains, Drinks, Snacks, Groceries, Other
    let totalItemsAmt = 0;
    exps.forEach(tx => {
      if(tx.items && Array.isArray(tx.items) && tx.items.length > 0){
        tx.items.forEach(it => {
          const name = String(it.name || 'Item').trim();
          const p = Number(it.price) || 0;
          const q = parseInt(it.qty, 10) || 1;
          const lineTotal = p * q;
          if(!name && lineTotal <= 0) return;
          const grp = getFoodItemSubGroup(name);
          if(!breakdown[grp.id]){
            breakdown[grp.id] = { amount: 0, count: 0, label: grp.name, icon: grp.icon, col: grp.col, itemsList: [] };
          }
          breakdown[grp.id].amount += lineTotal;
          breakdown[grp.id].count += q;
          breakdown[grp.id].itemsList.push({ name, price: lineTotal, qty: q, store: tx.desc || '' });
          totalItemsAmt += lineTotal;
        });
      } else {
        const name = (tx.desc || catInfo('expense', tx.category).name || 'Expense').trim();
        const amt = Number(tx.amount) || 0;
        const grp = getFoodItemSubGroup(name);
        if(!breakdown[grp.id]){
          breakdown[grp.id] = { amount: 0, count: 0, label: grp.name, icon: grp.icon, col: grp.col, itemsList: [] };
        }
        breakdown[grp.id].amount += amt;
        breakdown[grp.id].count += 1;
        breakdown[grp.id].itemsList.push({ name, price: amt, qty: 1, store: tx.desc || '' });
        totalItemsAmt += amt;
      }
    });
    totalCalculatedAmount = totalItemsAmt > 0 ? totalItemsAmt : totalExp;
  } else if(anaBreakdownMode === 'merchant'){
    exps.forEach(tx => {
      const key = (tx.desc || tx.location || (isZh ? '其他商户' : 'General Merchant')).trim();
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label: key, icon: '🏪', col: '#f59e0b', cat: tx.category };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else if(anaBreakdownMode === 'tax'){
    let totSst = 0, totSvc = 0, totRounding = 0, totBase = 0;
    exps.forEach(tx => {
      const a = Number(tx.amount) || 0;
      const sst = Number(tx.sstAmount) || (tx.sstPct ? (a * (tx.sstPct / (100 + tx.sstPct))) : 0);
      const svc = Number(tx.serviceChargeAmount) || (tx.serviceChargePct ? (a * (tx.serviceChargePct / (100 + tx.serviceChargePct))) : 0);
      const rnd = Number(tx.roundingAmount) || 0;
      const base = Math.max(0, a - sst - svc - rnd);

      totSst += sst;
      totSvc += svc;
      totRounding += rnd;
      totBase += base;
    });

    if(totBase > 0){
      breakdown['base'] = { amount: totBase, count: exps.length, label: isZh ? '商品与餐饮基础金额 (Base Net)' : 'Base Purchases / Food Net', icon: '🛒', col: '#10b981' };
    }
    if(totSst > 0){
      breakdown['sst'] = { amount: totSst, count: exps.filter(t=>t.sstAmount>0||t.sstPct>0).length, label: isZh ? '消费与服务税 (SST 6%/8%)' : 'Malaysian SST (6%/8% Tax)', icon: '🏛️', col: '#3b82f6' };
    }
    if(totSvc > 0){
      breakdown['svc'] = { amount: totSvc, count: exps.filter(t=>t.serviceChargeAmount>0||t.serviceChargePct>0).length, label: isZh ? '餐厅服务费 (Service 10%)' : 'Restaurant Service (10%)', icon: '🛎️', col: '#f59e0b' };
    }
    if(totRounding !== 0){
      breakdown['rnd'] = { amount: Math.abs(totRounding), count: exps.filter(t=>t.roundingAmount).length, label: isZh ? '分位取整 (Rounding)' : 'Rounding Adjustment', icon: '🪙', col: '#9ca3af' };
    }
  } else if(anaBreakdownMode === 'method'){
    exps.forEach(tx => {
      const key = tx.paymentMethod || (isZh ? '现金支付' : 'Cash');
      const pm = PAYMENT_METHODS.find(p => p.name === key);
      const icon = pm ? pm.icon : '💳';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label: key, icon, col: '#06b6d4' };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else if(anaBreakdownMode === 'account'){
    exps.forEach(tx => {
      const acc = S.accounts.find(a => a.id === tx.accountId);
      const key = acc ? acc.id : 'unknown';
      const label = acc ? acc.name : (isZh ? '未指定账户' : 'Unknown Account');
      const icon = acc ? getAccIcon(acc) : '🏦';
      const col = acc && acc.color ? acc.color : '#7c3aed';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label, icon, col };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else {
    // Category (Default)
    exps.forEach(tx => {
      const key = tx.category;
      const c = catInfo('expense', key);
      const label = c.name;
      const icon = c.icon;
      const col = CAT_COLOR[key] || '#6b7280';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label, icon, col, catId: key, txs: [] };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
      if(breakdown[key].txs) breakdown[key].txs.push(tx);
    });
  }

  if(el('donut-center')){
    el('donut-center').innerHTML = `
      <div style="font-size:9.5px;font-weight:700;color:var(--dim)">TOTAL</div>
      <div style="font-size:13px;font-weight:900;color:var(--text)">${fmt(totalCalculatedAmount)}</div>
    `;
  }

  const cx = 80, cy = 80, r = 56, sw = 18, circ = 2 * Math.PI * r;
  const items = Object.values(breakdown).sort((a,b) => b.amount - a.amount);
  let offset = -circ * 0.25;

  const fallbackColors = ['#f59e0b','#3b82f6','#ec4899','#10b981','#8b5cf6','#ef4444','#06b6d4','#14b8a6','#84cc16','#6366f1','#d97706','#0284c7'];

  // Add Mode Explanation Subtitle in Rank List
  if(rankList){
    const headerTitle = {
      top_items: isZh ? '🏆 Top 5 最常消费单品 (精简榜单)' : '🏆 Top 5 Dishes & Items Leaderboard',
      items: isZh ? '🏆 Top 5 最常消费单品 (精简榜单)' : '🏆 Top 5 Dishes & Items Leaderboard',
      food_types: isZh ? '🍲 餐饮与单品分群 (点击可展开内部菜品)' : '🍲 Dishes by Type (Tap group for dish details)',
      merchant: isZh ? '🏪 最常光顾商家与餐厅消费排行' : '🏪 Top Stores & Dining Outlets',
      tax: isZh ? '🧾 消费税 (SST) 与餐饮服务费穿透分析' : '🧾 Malaysian SST & Surcharge Breakdown',
      method: isZh ? '💳 支付方式分布明细' : '💳 Payment Method Distribution',
      account: isZh ? '🏦 各银行与钱包资金支出占比' : '🏦 Bank & Wallet Spend Ratio',
      category: isZh ? '🏷️ 消费分类明细 (点击可展开具体单品)' : '🏷️ Category Ranking (Tap for Item Details)'
    }[anaBreakdownMode] || '';

    rankList.innerHTML = `<div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:8px;padding-left:2px">${headerTitle}</div>`;
  }

  items.forEach((item, idx) => {
    const pct = totalCalculatedAmount > 0 ? (item.amount / totalCalculatedAmount) : 0;
    const pctInt = Math.round(pct * 100);
    const dashLen = pct * circ;
    const color = item.col && item.col !== '#7c3aed' ? item.col : fallbackColors[idx % fallbackColors.length];

    // SVG Ring
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none'); circle.setAttribute('stroke', color); circle.setAttribute('stroke-width', sw);
    circle.setAttribute('stroke-dasharray', dashLen + ' ' + Math.max(0, circ - dashLen));
    circle.setAttribute('stroke-dashoffset', -offset);
    svg.appendChild(circle);
    offset += dashLen;

    // Legend Top 4 Items
    if(idx < 4){
      const li = document.createElement('div');
      li.className = 'leg-item';
      li.innerHTML = `
        <div class="leg-dot" style="background:${color}"></div>
        <span class="leg-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(item.label)}">${item.icon} ${esc(item.label)}</span>
        <span class="leg-pct">${pctInt}%</span>
      `;
      leg.appendChild(li);
    }

    // Detailed Itemized Ranking List
    if(rankList){
      const rankRow = document.createElement('div');
      rankRow.className = 'rank-item';
      const hasSubList = (item.txs && item.txs.length > 0) || (item.itemsList && item.itemsList.length > 0) || (item.subItems && item.subItems.length > 0);
      rankRow.style.cursor = hasSubList ? 'pointer' : 'default';

      let countLabel = `(${item.count}${isZh ? '笔' : 'x'})`;
      if(anaBreakdownMode === 'top_items' || anaBreakdownMode === 'items' || anaBreakdownMode === 'food_types'){
        countLabel = `<span style="font-size:10px;color:var(--cyan);font-weight:700">×${item.count}</span>`;
      }

      const storeSubtitle = item.store ? `<div style="font-size:10.5px;color:var(--muted);margin-top:2px">🏪 ${esc(item.store)}</div>` : '';
      const expandHint = hasSubList ? `<span style="font-size:9.5px;color:var(--dim);margin-left:4px">▾</span>` : '';

      rankRow.innerHTML = `
        <div class="rank-item-top">
          <span style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;padding-right:8px">
            <span style="font-size:15px;flex-shrink:0">${item.icon}</span>
            <span style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(item.label)} ${expandHint}</span>
            <span style="font-size:10.5px;color:var(--dim);font-weight:600;flex-shrink:0">${countLabel}</span>
          </span>
          <span style="font-weight:800;flex-shrink:0">${fmt(item.amount)} <span style="font-size:10.5px;color:var(--muted)">(${pctInt}%)</span></span>
        </div>
        ${storeSubtitle}
        <div class="rank-track" style="margin-top:6px">
          <div class="rank-bar" style="width:${pctInt}%;background:${color}"></div>
        </div>
        <div class="rank-sub-drawer hidden" id="drawer_ana_${idx}" style="margin-top:8px;padding:8px 10px;background:var(--bg3);border-radius:10px;font-size:11px;display:none"></div>
      `;

      // Expandable drawer handler for Category, Food Types, or Other Items!
      if(hasSubList){
        rankRow.onclick = () => {
          const drawer = rankRow.querySelector(`#drawer_ana_${idx}`);
          if(!drawer) return;
          if(drawer.style.display === 'none' || drawer.classList.contains('hidden')){
            drawer.style.display = 'block';
            drawer.classList.remove('hidden');
            let drawerHtml = '';

            if(item.itemsList && item.itemsList.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${item.label} · ${isZh ? '包含菜品' : 'Included Dishes'}:</div>`;
              item.itemsList.forEach(d => {
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <span style="font-weight:700;color:var(--text)">${esc(d.name)}</span>
                      <span style="font-size:10px;color:var(--cyan)"> (×${d.qty})</span>
                      ${d.store ? `<span style="font-size:9.5px;color:var(--muted)"> · ${esc(d.store)}</span>` : ''}
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(d.price)}</strong>
                  </div>
                `;
              });
            } else if(item.subItems && item.subItems.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${isZh ? '其他单品明细' : 'Other Dishes Breakdown'}:</div>`;
              item.subItems.forEach(d => {
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <span style="font-weight:700;color:var(--text)">${esc(d.name)}</span>
                      <span style="font-size:10px;color:var(--cyan)"> (×${d.count})</span>
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(d.amount)}</strong>
                  </div>
                `;
              });
            } else if(item.txs && item.txs.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${item.label} · ${isZh ? '包含账单明细' : 'Receipt Details'}:</div>`;
              item.txs.forEach(t => {
                const noteText = t.note || (t.items && t.items.length ? t.items.map(i=>`${i.name} (RM ${i.price})`).join(', ') : '');
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <div style="font-weight:700;color:var(--text)">${esc(t.desc || 'Store')} <span style="font-size:10px;color:var(--muted)">(${t.date})</span></div>
                      ${noteText ? `<div style="font-size:10px;color:var(--muted)">🛒 ${esc(noteText)}</div>` : ''}
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(t.amount)}</strong>
                  </div>
                `;
              });
            }
            drawer.innerHTML = drawerHtml;
          } else {
            drawer.style.display = 'none';
            drawer.classList.add('hidden');
          }
        };
      }

      rankList.appendChild(rankRow);
    }
  });
}

function renderAiPatternTracker(txs, inc, exp){
  const grid = el('ana-ai-pattern-grid');
  const badge = el('ana-ai-persona-badge');
  if(!grid) return;
  grid.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const exps = txs.filter(t => t.type === 'expense');

  if(!exps.length){
    if(badge) badge.textContent = isZh ? '待积累数据' : 'Awaiting Data';
    grid.innerHTML = `<div style="grid-column:span 2;font-size:11.5px;color:var(--muted);text-align:center;padding:8px 0">${isZh ? '本周期暂无消费记录，记录账单即可激活 AI 行为画像分析 🍯' : 'No expenses in this period. Log expenses to activate AI spending insights 🍯'}</div>`;
    return;
  }

  // 1. Weekend vs Weekday analysis
  let weekendSpent = 0, weekdaySpent = 0;
  exps.forEach(t => {
    const day = new Date(t.date + 'T00:00:00').getDay();
    if(day === 0 || day === 6) weekendSpent += Number(t.amount) || 0;
    else weekdaySpent += Number(t.amount) || 0;
  });
  const weekendPct = exp > 0 ? Math.round((weekendSpent / exp) * 100) : 0;

  // 2. Dining vs Groceries Ratio
  const foodSpent = exps.filter(t => t.category === 'food').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const grocerySpent = exps.filter(t => t.category === 'groceries').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalFoodGroup = foodSpent + grocerySpent;
  const diningPct = totalFoodGroup > 0 ? Math.round((foodSpent / totalFoodGroup) * 100) : 0;

  // 3. Micro-transaction leakage (< RM 20)
  const microTxs = exps.filter(t => Number(t.amount) > 0 && Number(t.amount) <= 20);
  const microSpent = microTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const microPct = exp > 0 ? Math.round((microSpent / exp) * 100) : 0;

  // 4. Frequent Daily Habits (Coffee, Tea, Delivery, Transport)
  const habitTxs = exps.filter(t => {
    const d = (t.desc || '').toLowerCase();
    return /(coffee|latte|kopi|zus|starbucks|tealive|grab|foodpanda|shopee|lazada)/i.test(d);
  });
  const habitSpent = habitTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);

  // Persona Determination
  let persona = isZh ? '⚖️ 理性规划师' : '⚖️ Balanced Planner';
  const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
  if(savingsRate >= 40){
    persona = isZh ? '🛡️ 储蓄大师' : '🛡️ Prudent Builder';
  } else if(weekendPct >= 55){
    persona = isZh ? '🏄‍♂️ 周末享乐派' : '🏄‍♂️ Weekend Splurger';
  } else if(diningPct >= 75 && foodSpent > 150){
    persona = isZh ? '🍜 美食探索家' : '🍜 Foodie Connoisseur';
  } else if(microPct >= 35){
    persona = isZh ? '⚡ 零散微开销型' : '⚡ Micro-Spender';
  }
  if(badge) badge.textContent = persona;

  // Patterns to display
  const patterns = [
    {
      icon: weekendPct >= 50 ? '🏖️' : '💼',
      title: isZh ? '周末消费偏好' : 'Weekend Spending',
      desc: isZh ? `周末占 ${weekendPct}% (${fmt(weekendSpent)})` : `Weekend: ${weekendPct}% (${fmt(weekendSpent)})`,
      status: weekendPct >= 55 ? 'warn' : 'good'
    },
    {
      icon: diningPct >= 65 ? '🍽️' : '🛒',
      title: isZh ? '餐饮 vs 买菜' : 'Dining vs Groceries',
      desc: totalFoodGroup > 0 ? (isZh ? `外食 ${diningPct}% · 买菜 ${100 - diningPct}%` : `Dine-out ${diningPct}% · Market ${100 - diningPct}%`) : (isZh ? '暂无记录' : 'No food data'),
      status: diningPct >= 75 ? 'warn' : 'good'
    },
    {
      icon: '💧',
      title: isZh ? '小额微支出漏斗' : 'Micro-Spend Leaks',
      desc: microTxs.length > 0 ? (isZh ? `${microTxs.length}笔小额共 ${fmt(microSpent)} (${microPct}%)` : `${microTxs.length} txs ≤RM20: ${fmt(microSpent)} (${microPct}%)`) : (isZh ? '控制极佳' : 'Minimal leaks'),
      status: microPct >= 30 ? 'warn' : 'good'
    },
    {
      icon: '⚡',
      title: isZh ? '高频日常习惯' : 'Habit Triggers',
      desc: habitTxs.length > 0 ? (isZh ? `外卖/咖啡/网购 ${habitTxs.length}笔 (${fmt(habitSpent)})` : `Delivery/Coffee/Apps: ${habitTxs.length} txs (${fmt(habitSpent)})`) : (isZh ? '无明显高频消费' : 'No habit spikes'),
      status: habitTxs.length >= 5 ? 'warn' : 'good'
    }
  ];

  patterns.forEach(p => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:9px 10px';
    card.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:5px;margin-bottom:2px">
        <span>${p.icon}</span> <span>${p.title}</span>
      </div>
      <div style="font-size:10px;color:${p.status==='warn'?'var(--amber)':'var(--muted)'};font-weight:600;line-height:1.35">${p.desc}</div>
    `;
    grid.appendChild(card);
  });
}

async function generateAiPeriodAudit(){
  const resultBox = el('ana-gemini-audit-result');
  const btn = el('ana-ai-audit-btn');
  if(!resultBox) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!S.geminiApiKey){
    resultBox.innerHTML = `
      <div>
        <span>${isZh 
          ? '⚠️ 尚未配置 Google Gemini API 密钥。本应用采用 100% 用户直连，零硬编码密钥保护您的隐私。请填入您的免费 Google AI 密钥：'
          : '⚠️ Google Gemini API Key not configured. Zero hardcoded keys are used — 100% direct browser connection. Please enter your free Google AI key:'}</span>
        <div style="margin-top:8px">
          <button type="button" class="primary-btn" onclick="openGeminiModal()" style="font-size:11.5px;padding:6px 14px;width:auto">🔑 ${isZh ? '立即配置 Google Gemini 密钥' : 'Configure Google Gemini Key'}</button>
        </div>
      </div>`;
    return;
  }

  const d = anaInspectedDate;
  const curYear = d.getFullYear();
  const curMonth = d.getMonth();
  const allTxs = filteredTx();
  let txs = [];

  if(anaPeriod === 'all') txs = allTxs;
  else if(anaPeriod === 'year') txs = allTxs.filter(t => new Date(t.date+'T00:00:00').getFullYear() === curYear);
  else if(anaPeriod === 'week'){
    const wStart = new Date(d); wStart.setDate(d.getDate() - d.getDay());
    const wStartStr = `${wStart.getFullYear()}-${String(wStart.getMonth()+1).padStart(2,'0')}-${String(wStart.getDate()).padStart(2,'0')}`;
    const wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 6);
    const wEndStr = `${wEnd.getFullYear()}-${String(wEnd.getMonth()+1).padStart(2,'0')}-${String(wEnd.getDate()).padStart(2,'0')}`;
    txs = allTxs.filter(t => t.date >= wStartStr && t.date <= wEndStr);
  } else {
    txs = allTxs.filter(t => inMonth(t, curMonth, curYear));
  }

  const exps = txs.filter(t => t.type === 'expense');
  const inc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const exp = exps.reduce((s,t) => s + (Number(t.amount)||0), 0);

  if(!exps.length && inc <= 0){
    resultBox.innerHTML = isZh ? '⚠️ 当前周期尚无足够的收支数据，无法生成深度审计报告。' : '⚠️ Not enough transactions in this period to generate an audit.';
    return;
  }

  // Category totals
  const catTotals = {};
  exps.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0); });

  const summaryData = {
    period: anaPeriod,
    date: d.toISOString().split('T')[0],
    totalIncome: inc,
    totalExpenses: exp,
    netSavings: inc - exp,
    savingsRate: inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0,
    categories: catTotals,
    transactionCount: txs.length,
    topMerchants: exps.slice(0, 10).map(t => `${t.desc || t.category}: RM${t.amount}`)
  };

  if(btn){
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
  resultBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;color:var(--purple2);font-weight:700">
      <span style="display:inline-block">⏳</span>
      <span>${isZh ? '正在召唤 Google Gemini AI 全面深度透视消费数据…' : 'Google Gemini AI is analyzing your spending patterns…'}</span>
    </div>
  `;

  try {
    const prompt = `You are a world-class certified Malaysian personal financial advisor AI for 🍯 Pocket Winnie 🍯.
Analyze the user's spending data for the selected period:
${JSON.stringify(summaryData, null, 2)}

Provide a concise, sharp, highly actionable financial deep-dive audit in ${isZh ? 'Simplified Chinese (简体中文)' : 'English'}.
Structure your output with these sections:
1. 🎯 **Health Score (0-100) & Verdict** (one bold sentence)
2. 🔍 **Key Findings & Spending Leaks** (2-3 bullet points identifying specific risks e.g. food delivery, dining out, weekend spikes)
3. 💡 **3 Specific Ringgit-Saving Actions for Next Month** (e.g. "Save ~RM 150 by...")
4. 🇲🇾 **Malaysian Context Tip** (e.g. EPF voluntary self-contribution, LHDN tax relief, Touch 'n Go reload management)

Keep the tone encouraging, professional, and ultra-practical. Max 250 words.`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: { temperature: 0.3 }
    };

    const generation = await generateGeminiContent(S.geminiApiKey, payload);
    const geminiRes = generation.data;

    const reply = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if(reply){
      let formatted = esc(reply)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      resultBox.innerHTML = formatted;
    } else {
      resultBox.innerHTML = isZh 
        ? '⚠️ AI 生成失败，请检查网络连接或 API Key 是否有效。' 
        : '⚠️ Could not generate audit. Please check your Gemini API key.';
    }
  } catch(err){
    resultBox.innerHTML = isZh ? '⚠️ 连接 Google AI 失败，请稍后重试。' : '⚠️ Error communicating with Google AI.';
  } finally {
    if(btn){
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}
