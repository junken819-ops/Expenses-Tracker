/**
 * Calendar Day Management
 * Modularized from Pocket Winnie Core
 */

// ── 📅 CALENDAR DAY MANAGEMENT & AUTOMATION ────────────
let calModalDateStr = today();

function selectCalDate(dateStr, boxEl){
  calSelectedDateStr = dateStr;
  const grid = el('cal-days-grid');
  if(grid) grid.querySelectorAll('.cal-day-box').forEach(b => b.classList.remove('selected'));
  if(boxEl) boxEl.classList.add('selected');
  renderCalDayTransactions();
}

function openCalDayDetailModal(dateStr){
  calModalDateStr = dateStr;
  calSelectedDateStr = dateStr;
  
  const dObj = new Date(dateStr + 'T00:00:00');
  const dFull = dObj.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const dayNum = dObj.getDate();

  if(el('cal-day-modal-title')) el('cal-day-modal-title').textContent = `📅 Day Management: ${dayNum} ${dObj.toLocaleDateString('en-MY', { month: 'short' })}`;
  if(el('cal-day-modal-date')) el('cal-day-modal-date').textContent = dFull;

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
  const daySpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  if(el('cal-day-modal-summary')){
    el('cal-day-modal-summary').innerHTML = `Spent: <strong style="color:var(--red)">${fmt(daySpent)}</strong> · Income: <strong style="color:var(--green)">${fmt(dayIncome)}</strong> (${txs.length} ${txs.length===1?'entry':'entries'})`;
  }

  // Update Dynamic Labels
  updateCalSameDaysLabel();
  if(el('cal-payday-sub')){
    el('cal-payday-sub').textContent = `Make the ${dayNum}${getOrdinalSuffix(dayNum)} of every month your payday`;
  }

  // Reset inputs & close collapsible sections by default
  if(el('cal-rec-desc')) el('cal-rec-desc').value = '';
  if(el('cal-rec-amt')) el('cal-rec-amt').value = '';
  if(el('cal-apply-all-same-days')) el('cal-apply-all-same-days').checked = false;

  const recPanel = el('cal-rec-collapse-panel');
  const paydayPanel = el('cal-payday-collapse-panel');
  const recBtn = el('cal-rec-toggle-btn');
  const paydayBtn = el('cal-payday-toggle-btn');
  const recArrow = el('cal-rec-arrow');
  const paydayArrow = el('cal-payday-arrow');

  if(recPanel) recPanel.classList.add('hidden');
  if(paydayPanel) paydayPanel.classList.add('hidden');
  if(recBtn) recBtn.classList.remove('on');
  if(paydayBtn) paydayBtn.classList.remove('on');
  if(recArrow) recArrow.style.transform = 'rotate(0deg)';
  if(paydayArrow) paydayArrow.style.transform = 'rotate(0deg)';

  // Render transactions on this day inside modal
  renderCalModalTxList(dateStr);

  openModal('cal-day-modal');
}

function toggleCalDaySection(section){
  const recPanel = el('cal-rec-collapse-panel');
  const paydayPanel = el('cal-payday-collapse-panel');
  const recBtn = el('cal-rec-toggle-btn');
  const paydayBtn = el('cal-payday-toggle-btn');
  const recArrow = el('cal-rec-arrow');
  const paydayArrow = el('cal-payday-arrow');

  if(section === 'rec'){
    if(recPanel){
      const isHidden = recPanel.classList.toggle('hidden');
      if(recBtn) recBtn.classList.toggle('on', !isHidden);
      if(recArrow) recArrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      if(!isHidden && paydayPanel){
        paydayPanel.classList.add('hidden');
        if(paydayBtn) paydayBtn.classList.remove('on');
        if(paydayArrow) paydayArrow.style.transform = 'rotate(0deg)';
      }
    }
  } else if(section === 'payday'){
    if(paydayPanel){
      const isHidden = paydayPanel.classList.toggle('hidden');
      if(paydayBtn) paydayBtn.classList.toggle('on', !isHidden);
      if(paydayArrow) paydayArrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      if(!isHidden && recPanel){
        recPanel.classList.add('hidden');
        if(recBtn) recBtn.classList.remove('on');
        if(recArrow) recArrow.style.transform = 'rotate(0deg)';
      }
    }
  }
}

function getOrdinalSuffix(i){
  const j = i % 10, k = i % 100;
  if(j === 1 && k !== 11) return 'st';
  if(j === 2 && k !== 12) return 'nd';
  if(j === 3 && k !== 13) return 'rd';
  return 'th';
}

function updateCalSameDaysLabel(){
  const dObj = new Date(calModalDateStr + 'T00:00:00');
  const weekdayName = dObj.toLocaleDateString('en-MY', { weekday: 'long' });
  const monthName = dObj.toLocaleDateString('en-MY', { month: 'long' });
  const dayNum = dObj.getDate();
  const freq = el('cal-rec-freq')?.value || 'monthly';

  const lbl = el('cal-apply-same-label');
  const sub = el('cal-apply-same-sub');
  if(lbl && sub){
    if(freq === 'weekly'){
      lbl.textContent = `☑️ Apply to all ${weekdayName}s in ${monthName}`;
      sub.textContent = `Create entries for every ${weekdayName} in the current month.`;
    } else if(freq === 'monthly'){
      lbl.textContent = `☑️ Apply to every ${dayNum}${getOrdinalSuffix(dayNum)} of the month`;
      sub.textContent = `Automates on the ${dayNum}${getOrdinalSuffix(dayNum)} of every upcoming month.`;
    } else {
      lbl.textContent = `☑️ Apply yearly on this date`;
      sub.textContent = `Recurs annually on ${dObj.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}.`;
    }
  }
}

function renderCalModalTxList(dateStr){
  const list = el('cal-day-modal-tx-list');
  if(!list) return;
  list.innerHTML = '';

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
  if(!txs.length){
    list.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted)">No transactions recorded on this day.</div>`;
    return;
  }

  txs.forEach(tx => {
    const isZh = (S.lang === 'zh');
    const presentation = transactionPresentation(tx, isZh);
    const c = presentation.category;
    const subCat = getSubCatInfo(tx.subCategory);
    const col = presentation.color;
    const acc = S.accounts.find(a => a.id === tx.accountId);
    const accIco = acc ? getAccIcon(acc) : '💳';
    const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';

    const div = document.createElement('div');
    div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all .15s';
    div.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;overflow:hidden">
          <div style="width:36px;height:36px;border-radius:10px;background:${col}22;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden">
            ${c.icon}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px">
              <strong style="font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(tx.desc || c.name)}</strong>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">
              <span>${subCat ? `${subCat.icon} ${esc(subCat.name)}` : esc(c.name)}</span>
              ${tx.time ? `<span>· ⏰ ${tx.time}</span>` : ''}
              ${acc ? `<span>· ${accIco} ${esc(acc.name)}</span>` : ''}
              ${tx.paymentMethod ? `<span>· ⚡ ${esc(tx.paymentMethod)}</span>` : ''}
              ${tx.location ? `<span>· 📍 ${esc(tx.location)}</span>` : ''}
            </div>
            ${cleanNote ? `
              <div style="font-size:11px;color:var(--text);background:var(--bg2);padding:5px 8px;border-radius:8px;margin-top:6px;border:1px solid var(--border);line-height:1.4">
                🛒 <strong>Items:</strong> ${esc(cleanNote)}
              </div>
            ` : ''}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div style="font-size:14px;font-weight:900;color:${presentation.amountColor}">
            ${presentation.amountPrefix}${fmt(tx.amount)}
          </div>
          <button type="button" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:2px 4px;border-radius:6px" onclick="event.stopPropagation(); deleteTxFromCalModal('${tx.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;

    div.onclick = () => {
      openTxDetailModal(tx.id);
    };

    list.appendChild(div);
  });
}

function deleteTxFromCalModal(txId){
  if(deleteTx(txId)){
    renderCalendar();
    renderCalModalTxList(calModalDateStr);
  }
}

function calDayAddTx(type){
  closeModal('cal-day-modal');
  openTxModal(type);
  el('tx-date').value = calModalDateStr;
}

function calDayUploadReceipt(){
  closeModal('cal-day-modal');
  openUniversalUpload('expense', calModalDateStr);
}

function setCalDayAsPayday(){
  const dayNum = parseInt(calModalDateStr.split('-')[2], 10);
  S.paydayDate = dayNum;
  save();
  renderPaydayCountdown();
  renderProfile();
  closeModal('cal-day-modal');
  toast(`🎉 Payday set to ${dayNum}${getOrdinalSuffix(dayNum)} of every month!`);
}

function saveCalDayAutomation(){
  const desc = (el('cal-rec-desc')?.value || '').trim();
  const amt = parseFloat(el('cal-rec-amt')?.value) || 0;
  const type = el('cal-rec-type')?.value || 'expense';
  const freq = el('cal-rec-freq')?.value || 'monthly';
  const applyAllSame = el('cal-apply-all-same-days')?.checked || false;

  if(!desc){
    toast('⚠️ Please enter a description');
    return;
  }
  if(amt <= 0){
    toast('⚠️ Please enter an amount');
    return;
  }

  // 1. Add to Recurring Engine
  const newRec = {
    id: uid('rec'),
    type: type,
    desc: desc,
    amount: amt,
    category: type === 'income' ? 'salary' : 'bills',
    freq: freq,
    nextDue: calModalDateStr,
    paymentMethod: 'Cash',
    createdAt: new Date().toISOString()
  };

  S.recurring.push(newRec);

  // 2. If 'Apply to all same days in this month' is checked
  if(applyAllSame && freq === 'weekly'){
    const targetDateObj = new Date(calModalDateStr + 'T00:00:00');
    const targetWeekday = targetDateObj.getDay();
    const [yStr, mStr] = calModalDateStr.split('-');
    const y = parseInt(yStr), m = parseInt(mStr);
    const daysInMonth = new Date(y, m, 0).getDate();

    let createdCount = 0;
    for(let d = 1; d <= daysInMonth; d++){
      const curDate = new Date(y, m - 1, d);
      if(curDate.getDay() === targetWeekday){
        const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        S.transactions.push({
          id: 'tx_auto_' + Date.now() + '_' + d,
          type: type,
          amount: amt,
          desc: desc,
          category: type === 'income' ? 'salary' : 'bills',
          date: ds,
          time: '10:00',
          accountId: getActiveAccountId(),
          paymentMethod: 'Cash',
          note: `Auto-applied for all ${targetDateObj.toLocaleDateString('en-MY', { weekday: 'long' })}s`,
          createdAt: new Date().toISOString()
        });
        createdCount++;
      }
    }
    toast(`🔁 Recurring rule created & applied to ${createdCount} days in this month!`);
  } else {
    toast(`🔁 Recurring ${type} saved for ${freq} schedule!`);
  }

  save();
  renderAll();
  renderCalendar();
  closeModal('cal-day-modal');
}
