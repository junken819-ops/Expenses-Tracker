/**
 * 30-Day Cash Flow Forecast
 * Modularized from Pocket Winnie Core
 */

// FEATURE 1: 30-DAY CASH FLOW FORECAST & PAYDAY SURVIVAL
// ═══════════════════════════════════════════════════════════════════
function calculateCashFlow30Days(){
  const todayDate = new Date();
  const paydayDay = parseInt(S.paydayDate || 25, 10);
  
  // Starting liquid balance
  let startingBalance = 0;
  if(S.accounts && S.accounts.length){
    startingBalance = S.accounts.reduce((sum, a) => sum + (Number(a.openingBalance) || 0), 0);
  }
  const curMonthTxs = (S.transactions || []).filter(t => inMonth(t, todayDate.getMonth(), todayDate.getFullYear()));
  const curInc = curMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const curExp = curMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  let currentLiquid = Math.max(0, startingBalance + curInc - curExp);

  const expectedSalary = Number(S.paydayAmount) || 0;
  if(currentLiquid === 0 && expectedSalary > 0){
    const dayOfMonth = todayDate.getDate();
    const daysInCurMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
    currentLiquid = Math.max(200, expectedSalary * (1 - (dayOfMonth / daysInCurMonth)));
  } else if(currentLiquid === 0) {
    currentLiquid = 1500;
  }

  // Rolling daily burn rate over past 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(todayDate.getDate() - 30);
  const past30Exp = (S.transactions || [])
    .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dailyBurn = Math.max(15, past30Exp / 30);

  const days = [];
  let runningBal = currentLiquid;
  let minBal = currentLiquid;
  let minBalDate = '';
  let paydayEveBal = currentLiquid;
  let foundPayday = false;
  let daysToNextPayday = 0;
  const upcomingEvents = [];

  for(let i = 0; i <= 30; i++){
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + i);
    const dStr = d.toISOString().slice(0, 10);
    const dayNum = d.getDate();
    const dayName = d.toLocaleDateString('en-MY', { weekday: 'short' });
    
    let dayInflow = 0;
    let dayOutflow = dailyBurn;
    const dayEvents = [];

    // Payday
    if(dayNum === paydayDay && expectedSalary > 0){
      dayInflow += expectedSalary;
      dayEvents.push({ type: 'salary', name: 'Expected Salary 💼', amount: expectedSalary });
      if(!foundPayday){
        foundPayday = true;
        daysToNextPayday = i;
        paydayEveBal = runningBal;
      }
    }

    // Reminders
    (S.reminders || []).forEach(r => {
      if(!r.paid && r.date){
        const rDay = parseInt(r.date.slice(-2), 10);
        if(rDay === dayNum){
          const amt = Number(r.amount) || 0;
          dayOutflow += amt;
          dayEvents.push({ type: 'bill', name: r.name || 'Bill Reminder', amount: amt });
        }
      }
    });

    // Subscriptions
    (S.recurring || []).forEach(rc => {
      if(rc.nextDue){
        const rcDay = parseInt(rc.nextDue.slice(-2), 10);
        if(rcDay === dayNum){
          const amt = Number(rc.amount) || 0;
          dayOutflow += amt;
          dayEvents.push({ type: 'sub', name: rc.desc || 'Subscription', amount: amt });
        }
      }
    });

    if(i > 0){
      runningBal = runningBal + dayInflow - dayOutflow;
    }

    if(runningBal < minBal){
      minBal = runningBal;
      minBalDate = dStr;
    }

    if(dayEvents.length > 0){
      dayEvents.forEach(ev => upcomingEvents.push({ ...ev, date: dStr }));
    }

    days.push({
      date: dStr,
      dayNum,
      dayName,
      balance: Math.round(runningBal),
      inflow: dayInflow,
      outflow: Math.round(dayOutflow),
      events: dayEvents
    });
  }

  const safeDailyBurn = (daysToNextPayday > 0)
    ? Math.max(0, currentLiquid / daysToNextPayday)
    : dailyBurn;

  let status = 'healthy';
  let statusText = '🟢 Healthy';
  if(minBal < 0){
    status = 'danger';
    statusText = '🔴 Danger (Deficit)';
  } else if(minBal < 300){
    status = 'tight';
    statusText = '🟡 Tight Runway';
  }

  return {
    days,
    currentLiquid,
    minBalance: Math.round(minBal),
    minBalanceDate: minBalDate || days[0].date,
    paydayEveBalance: Math.round(paydayEveBal),
    daysToNextPayday: daysToNextPayday || (paydayDay - todayDate.getDate() + 30) % 30,
    dailyBurn: Math.round(dailyBurn),
    safeDailyBurn: Math.round(safeDailyBurn),
    status,
    statusText,
    expectedSalary,
    upcomingEvents: upcomingEvents.slice(0, 10)
  };
}

function renderCashFlowForecast(){
  const cf = calculateCashFlow30Days();

  // Overview Card on Analytics Page
  const cardStatus = el('ana-cf-status');
  if(cardStatus){
    cardStatus.className = `cf-status-pill cf-status-${cf.status}`;
    cardStatus.textContent = cf.statusText;
  }
  if(el('ana-cf-min')) el('ana-cf-min').textContent = fmt(cf.minBalance);
  if(el('ana-cf-safe-daily')) el('ana-cf-safe-daily').textContent = `${fmt(cf.safeDailyBurn)}/day`;
  if(el('ana-cf-payday-eve')) el('ana-cf-payday-eve').textContent = fmt(cf.paydayEveBalance);

  const miniWrap = el('ana-cf-chart-wrap');
  if(miniWrap){
    miniWrap.innerHTML = generateCashFlowSvg(cf.days, 320, 75, true);
  }

  // Full Modal Elements
  if(el('cf-payday-date-inp') && !el('cf-payday-date-inp').value){
    el('cf-payday-date-inp').value = S.paydayDate || 25;
  }
  if(el('cf-payday-amt-inp') && !el('cf-payday-amt-inp').value){
    el('cf-payday-amt-inp').value = S.paydayAmount || '';
  }
  const modalStatus = el('cf-modal-status');
  if(modalStatus){
    modalStatus.className = `cf-status-pill cf-status-${cf.status}`;
    modalStatus.textContent = cf.statusText;
  }
  if(el('cf-modal-min')) el('cf-modal-min').textContent = fmt(cf.minBalance);
  if(el('cf-modal-min-date')) el('cf-modal-min-date').textContent = `on ${cf.minBalanceDate}`;
  if(el('cf-modal-safe-daily')) el('cf-modal-safe-daily').textContent = `${fmt(cf.safeDailyBurn)}/day`;
  if(el('cf-modal-payday-eve')) el('cf-modal-payday-eve').textContent = fmt(cf.paydayEveBalance);
  if(el('cf-modal-days-to-pay')) el('cf-modal-days-to-pay').textContent = `${cf.daysToNextPayday} days until payday`;

  const modalSvgWrap = el('cf-modal-chart-svg-wrap');
  if(modalSvgWrap){
    modalSvgWrap.innerHTML = generateCashFlowSvg(cf.days, 340, 135, false);
  }

  const evList = el('cf-events-list');
  if(evList){
    if(!cf.upcomingEvents.length){
      evList.innerHTML = '<div style="font-size:11px;color:var(--muted);text-align:center;padding:12px">No scheduled bills or salary in next 30 days</div>';
    } else {
      evList.innerHTML = cf.upcomingEvents.map(ev => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:6px 10px;font-size:11.5px">
          <div style="display:flex;align-items:center;gap:6px">
            <span>${ev.type === 'salary' ? '💼' : (ev.type === 'sub' ? '📺' : '🧾')}</span>
            <div>
              <div style="font-weight:700;color:var(--text)">${esc(ev.name)}</div>
              <div style="font-size:9.5px;color:var(--muted)">${ev.date}</div>
            </div>
          </div>
          <div style="font-weight:800;color:${ev.type === 'salary' ? 'var(--green)' : 'var(--red)'}">
            ${ev.type === 'salary' ? '+' : '-'}${fmt(ev.amount)}
          </div>
        </div>
      `).join('');
    }
  }
}

function generateCashFlowSvg(days, width, height, isMini){
  if(!days || !days.length) return '';
  const padding = isMini ? 6 : 14;
  const w = width - (padding * 2);
  const h = height - (padding * 2);

  const balances = days.map(d => d.balance);
  const min = Math.min(...balances, 0);
  const max = Math.max(...balances, 100);
  const range = (max - min) || 1;

  const points = days.map((d, i) => {
    const x = padding + (i / (days.length - 1)) * w;
    const y = padding + h - ((d.balance - min) / range) * h;
    return { x: Math.round(x), y: Math.round(y), val: d.balance, date: d.date };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x} ${padding + h} L ${points[0].x} ${padding + h} Z`;

  let zeroLine = '';
  if(min < 0 && max > 0){
    const zeroY = Math.round(padding + h - ((0 - min) / range) * h);
    zeroLine = `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="rgba(239,68,68,0.5)" stroke-dasharray="3,3" stroke-width="1.5"/>`;
  }

  const gradientId = `cfGrad_${isMini ? 'mini' : 'modal'}`;
  return `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:100%;display:block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${zeroLine}
      <path d="${areaD}" fill="url(#${gradientId})"/>
      <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${!isMini ? points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#06b6d4" stroke="var(--bg)" stroke-width="1.5"/>
      `).join('') : ''}
    </svg>
  `;
}

function openCashFlowModal(){
  renderCashFlowForecast();
  openModal('cashflow-modal');
}

function saveCashFlowPaydaySettings(){
  const dateVal = parseInt(el('cf-payday-date-inp')?.value, 10);
  const amtVal = parseFloat(el('cf-payday-amt-inp')?.value);
  if(dateVal && dateVal >= 1 && dateVal <= 31) S.paydayDate = dateVal;
  if(!isNaN(amtVal) && amtVal >= 0) S.paydayAmount = amtVal;
  save();
  renderCashFlowForecast();
  toast('Payday settings updated ✓');
}

window.openCashFlowModal = openCashFlowModal;
window.saveCashFlowPaydaySettings = saveCashFlowPaydaySettings;
window.renderCashFlowForecast = renderCashFlowForecast;

// ═══════════════════════════════════════════════════════════════════