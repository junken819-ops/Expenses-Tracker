/**
 * Calendar & Activity State
 * Modularized from Pocket Winnie Core
 */

// ── CALENDAR & ACTIVITY STATE ─────────────────────────
let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();
let calSelectedDateStr = today();
let txViewMode = 'calendar';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function switchTxViewMode(mode){
  txViewMode = mode;
  const calBtn = el('view-mode-cal'), listBtn = el('view-mode-list');
  const calCont = el('tx-cal-container'), listCont = el('tx-list-container');
  if(calBtn) calBtn.classList.toggle('on', mode === 'calendar');
  if(listBtn) listBtn.classList.toggle('on', mode === 'list');
  if(calCont) calCont.classList.toggle('hidden', mode !== 'calendar');
  if(listCont) listCont.classList.toggle('hidden', mode !== 'list');

  if(mode === 'calendar'){
    renderCalendar();
  } else {
    renderFullTx();
  }
}

function prevCalMonth(){
  calCurrentMonth--;
  if(calCurrentMonth < 0){
    calCurrentMonth = 11;
    calCurrentYear--;
  }
  renderCalendar();
}

function nextCalMonth(){
  calCurrentMonth++;
  if(calCurrentMonth > 11){
    calCurrentMonth = 0;
    calCurrentYear++;
  }
  renderCalendar();
}

function jumpCalToday(){
  const now = new Date();
  calCurrentYear = now.getFullYear();
  calCurrentMonth = now.getMonth();
  calSelectedDateStr = today();
  renderCalendar();
}

function addTxOnSelectedCalDate(){
  openTxModal('expense');
  el('tx-date').value = calSelectedDateStr || today();
}

function uploadReceiptOnSelectedCalDate(){
  openTxModal('expense');
  el('tx-date').value = calSelectedDateStr || today();
  setTimeout(()=>{
    startOCR();
  }, 350);
}

function renderCalendar(){
  const monthLbl = el('cal-month-label');
  if(monthLbl){
    const lang = (S && S.lang) ? S.lang : 'en';
    if(lang === 'zh'){
      monthLbl.textContent = `${calCurrentYear}年 ${MONTH_NAMES_ZH[calCurrentMonth]}`;
    } else {
      monthLbl.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;
    }
  }

  // 1. Calculate Month-Wide Stats
  const txsInMonth = filteredTx().filter(t => inMonth(t, calCurrentMonth, calCurrentYear));
  const mSpent = txsInMonth.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dailyAvg = txsInMonth.length > 0 ? (mSpent / (new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate())) : 0;
  const txCount = txsInMonth.length;

  if(el('cal-m-spent')) el('cal-m-spent').textContent = fmt(mSpent);
  if(el('cal-m-income')) el('cal-m-income').textContent = fmt(dailyAvg);
  if(el('cal-m-net')) el('cal-m-net').textContent = txCount + (typeof S !== 'undefined' && S && S.lang === 'zh' ? ' 笔' : ' txs');

  // 2. Build 7-Column Grid
  const grid = el('cal-days-grid');
  if(!grid) return;
  grid.innerHTML = '';

  const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 = Sun
  const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calCurrentYear, calCurrentMonth, 0).getDate();

  // Padding days from previous month
  for(let i = firstDayIndex - 1; i >= 0; i--){
    const pDay = prevMonthTotalDays - i;
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.innerHTML = `<span class="cal-day-num">${pDay}</span>`;
    grid.appendChild(box);
  }

  // Current month days
  const todayStr = today();
  for(let d = 1; d <= totalDays; d++){
    const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTxs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
    const daySpent = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const dayInc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const box = document.createElement('div');
    box.className = 'cal-day-box';
    if(dateStr === todayStr) box.classList.add('today');
    if(dateStr === calSelectedDateStr) box.classList.add('selected');
    if(daySpent > 0) box.classList.add('has-spend');

    const spentFmt = daySpent > 0 ? (daySpent >= 1000 ? (daySpent/1000).toFixed(1)+'k' : daySpent.toFixed(0)) : '';
    const incFmt = dayInc > 0 ? (dayInc >= 1000 ? (dayInc/1000).toFixed(1)+'k' : dayInc.toFixed(0)) : '';

    // Pending meals due on this date
    const pendingOnDay = (S.pendingMeals || []).filter(m => !m.paid && m.dueDate === dateStr);
    const pendingDotHtml = pendingOnDay.length > 0 ?
      `<div style="display:flex;justify-content:center;gap:1px;margin-top:1px">${pendingOnDay.map(m => `<span class="cal-day-pending-dot${m.dueDate < todayStr ? ' overdue' : ''}"></span>`).join('')}</div>` : '';

    box.innerHTML = `
      <span class="cal-day-num">${d}</span>
      ${daySpent > 0 ? `<span class="cal-day-spent">-${spentFmt}</span>` : ''}
      ${dayInc > 0 ? `<span class="cal-day-inc">+${incFmt}</span>` : ''}
      ${pendingDotHtml}
    `;

    // Single click: select date; Double click / 2 times: open day detail modal
    let dayClicks = 0;
    let dayTimer = null;
    box.onclick = (e) => {
      dayClicks++;
      if(dayClicks === 1){
        dayTimer = setTimeout(() => {
          dayClicks = 0;
          selectCalDate(dateStr, box);
        }, 280);
      } else if(dayClicks >= 2){
        clearTimeout(dayTimer);
        dayClicks = 0;
        if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
        openCalDayDetailModal(dateStr);
      }
    };
    box.ondblclick = (e) => {
      e.preventDefault();
      if(dayTimer) clearTimeout(dayTimer);
      dayClicks = 0;
      if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
      openCalDayDetailModal(dateStr);
    };

    grid.appendChild(box);
  }

  // Padding days for next month to complete row
  const totalCells = firstDayIndex + totalDays;
  const remaining = (7 - (totalCells % 7)) % 7;
  for(let n = 1; n <= remaining; n++){
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.innerHTML = `<span class="cal-day-num">${n}</span>`;
    grid.appendChild(box);
  }

  renderCalDayTransactions();
}

function renderCalDayTransactions(){
  const list = el('cal-day-tx-list'), empty = el('cal-day-empty');
  const titleEl = el('cal-day-selected-title'), subEl = el('cal-day-selected-sub');
  if(!list) return;
  list.innerHTML = '';

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === calSelectedDateStr);
  const dObj = new Date(calSelectedDateStr + 'T00:00:00');
  const lang = (S && S.lang) ? S.lang : 'en';
  const dNice = lang === 'zh'
    ? `${dObj.getFullYear()}年${dObj.getMonth()+1}月${dObj.getDate()}日 (星期${['日','一','二','三','四','五','六'][dObj.getDay()]})`
    : dObj.toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isTod = calSelectedDateStr === today();

  const daySpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const locs = [...new Set(txs.map(t => t.location).filter(Boolean))];
  const locSummary = locs.length > 0 ? ` · 📍 ${locs.slice(0,2).join(', ')}${locs.length>2?` +${locs.length-2} more`:''}` : '';

  const catTotals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0);
  });
  const catPills = Object.entries(catTotals).map(([cat, amt]) => {
    const c = catInfo('expense', cat);
    return `<span class="chip" style="font-size:10.5px;padding:2px 8px;background:var(--bg3);border:1px solid var(--border);pointer-events:none">${c.icon} ${c.name}: <strong>${fmt(amt)}</strong></span>`;
  }).join(' ');

  if(titleEl){
    titleEl.textContent = `${isTod ? (lang === 'zh' ? '⭐ 今天 · ' : '⭐ Today · ') : ''}${dNice}`;
  }
  if(subEl){
    const spentLbl = lang === 'zh' ? '支出' : 'Spent';
    const incLbl = lang === 'zh' ? '收入' : 'Income';
    const entryLbl = lang === 'zh' ? '笔账单' : (txs.length === 1 ? 'entry' : 'entries');
    subEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
        <div>${spentLbl}: <strong style="color:var(--red)">${fmt(daySpent)}</strong> · ${incLbl}: <strong style="color:var(--green)">${fmt(dayIncome)}</strong> (${txs.length} ${entryLbl})${locSummary}</div>
      </div>
      ${catPills ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${catPills}</div>` : ''}
    `;
  }

  if(!txs.length){
    if(empty) empty.classList.remove('hidden');
  } else {
    if(empty) empty.classList.add('hidden');
  }

  txs.forEach(tx => list.appendChild(makeTxEl(tx)));

  // Show pending meals due on this date
  const pendingOnDay = (S.pendingMeals || []).filter(m => !m.paid && m.dueDate === calSelectedDateStr);
  if(pendingOnDay.length > 0){
    if(empty) empty.classList.add('hidden');
    const pendingHdr = document.createElement('div');
    pendingHdr.style.cssText = 'font-size:11.5px;font-weight:800;color:var(--amber);margin:10px 0 6px;display:flex;align-items:center;gap:6px';
    pendingHdr.innerHTML = '🕐 Pending Meals Due';
    list.appendChild(pendingHdr);

    const todayStr = today();
    pendingOnDay.forEach(meal => {
      const isOverdue = meal.dueDate < todayStr;
      const div = document.createElement('div');
      div.className = `pending-meal-item${isOverdue ? ' overdue' : ''}`;
      div.style.cssText = 'padding:10px;margin-bottom:6px';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:var(--text)">🍽️ ${esc(meal.desc || 'Meal')}</div>
            ${meal.payTo ? `<div style="font-size:10.5px;color:var(--muted)">👤 ${esc(meal.payTo)}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:800;color:var(--amber)">${fmt(meal.amount)}</div>
            <span class="pending-meal-badge ${isOverdue ? 'overdue' : 'pending'}">${isOverdue ? '⚠️ Overdue' : '🕐 Pending'}</span>
          </div>
        </div>
        <div style="margin-top:6px;display:flex;gap:6px">
          <button type="button" class="primary-btn" style="padding:5px 12px;font-size:11px;border-radius:10px;flex:1" onclick="markMealPaid('${meal.id}')">✅ Pay Now</button>
          <button type="button" class="ghost-btn" style="padding:5px 10px;font-size:11px;border-radius:10px" onclick="openPendingMealsModal()">View All</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}
