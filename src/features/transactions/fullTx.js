/**
 * Full Transactions List & Search
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: FULL TX ────────────────────────────────────
function setFilter(btn, f){
  document.querySelectorAll('#tx-list-container .chips .chip').forEach(c => c.classList.remove('on'));
  if(btn) btn.classList.add('on');
  txFilter = f;
  renderFullTx();
}

function resetTxMonthFilter(){
  const f = el('tx-month-filter');
  if(f) f.value = 'all';
  renderFullTx();
}

function syncTxMonthFilterOptions(){
  const filterEl = el('tx-month-filter');
  if(!filterEl) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const currentVal = filterEl.value || 'all';

  // Get distinct months
  const allTx = filteredTx();
  const monthSet = new Set();
  const curM = new Date().toISOString().slice(0, 7);
  monthSet.add(curM);
  allTx.forEach(t => {
    const m = (t.date || '').slice(0, 7);
    if(m && m.length === 7) monthSet.add(m);
  });
  const sortedMonths = [...monthSet].sort((a,b) => b.localeCompare(a));

  let html = `<option value="all">${isZh ? '📅 全部月份与年份 (All Time)' : '📅 All Months & Years'}</option>`;
  sortedMonths.forEach(mStr => {
    const [y, mNum] = mStr.split('-');
    const mIdx = parseInt(mNum, 10) - 1;
    const mName = isZh ? `${y}年${MONTH_NAMES_ZH[mIdx]}` : `${MONTH_NAMES[mIdx]} ${y}`;
    const count = allTx.filter(t => (t.date || '').startsWith(mStr)).length;
    html += `<option value="${mStr}">${mName} (${count} ${isZh ? '笔' : 'txs'})</option>`;
  });

  filterEl.innerHTML = html;
  if(sortedMonths.includes(currentVal) || currentVal === 'all'){
    filterEl.value = currentVal;
  }
}

function renderFullTx(){
  syncTxMonthFilterOptions();
  const filterEl = el('tx-month-filter');
  const selectedMonth = (filterEl ? filterEl.value : 'all') || 'all';
  const summaryBar = el('tx-month-summary-bar');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const srch=(el('tx-search')?el('tx-search').value||'':'').toLowerCase();
  let txs=[...filteredTx()].sort((a,b)=>b.date.localeCompare(a.date));

  // Month filter
  if(selectedMonth !== 'all'){
    txs = txs.filter(t => (t.date || '').startsWith(selectedMonth));
    if(summaryBar){
      summaryBar.classList.remove('hidden');
      const [y, mNum] = selectedMonth.split('-');
      const mIdx = parseInt(mNum, 10) - 1;
      const mName = isZh ? `${y}年${MONTH_NAMES_ZH[mIdx]}` : `${MONTH_NAMES[mIdx]} ${y}`;
      const mSpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      summaryBar.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
          <span>📅</span>
          <strong>${mName}</strong>
          <span style="color:var(--muted)">(${txs.length} ${isZh ? '笔明细' : (txs.length === 1 ? 'entry' : 'entries')})</span>
        </div>
        <div>
          ${isZh ? '支出' : 'Spent'}: <strong style="color:var(--red);font-size:13px">${fmt(mSpent)}</strong>
        </div>
      `;
    }
  } else {
    if(summaryBar) summaryBar.classList.add('hidden');
  }

  if(txFilter!=='all') txs=txs.filter(t=>t.type===txFilter);

  // Tag filter
  if(typeof renderTxTagFilterBar === 'function') renderTxTagFilterBar();
  if(activeTxTagFilter && activeTxTagFilter !== 'all'){
    txs = txs.filter(t => Array.isArray(t.tags) && t.tags.map(x => String(x).toLowerCase().trim()).includes(activeTxTagFilter.toLowerCase().trim()));
  }
  if(srch) txs=txs.filter(t=>{
    const acc=S.accounts.find(a=>a.id===t.accountId);
    const accName=acc?acc.name.toLowerCase():'';
    const subCat = t.subCategory ? getSubCatInfo(t.subCategory) : null;
    const subCatName = subCat ? subCat.name.toLowerCase() : '';
    const tagStr = (t.tags && Array.isArray(t.tags)) ? t.tags.join(' ').toLowerCase() : '';
    const itemNames = (t.items && Array.isArray(t.items)) ? t.items.map(i=>i.name).join(' ').toLowerCase() : '';
    const pm = (t.paymentMethod || '').toLowerCase();
    return (t.desc && t.desc.toLowerCase().includes(srch)) || 
           (t.category && t.category.toLowerCase().includes(srch)) || 
           (t.note && t.note.toLowerCase().includes(srch)) || 
           subCatName.includes(srch) ||
           tagStr.includes(srch) ||
           itemNames.includes(srch) ||
           accName.includes(srch) || 
           pm.includes(srch);
  });
  const list=el('tx-full-list'), empty=el('empty-tx');
  if(!list) return;
  list.innerHTML='';
  if(!txs.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const groups={};
  txs.forEach(tx=>{groups[tx.date]=groups[tx.date]||[];groups[tx.date].push(tx);});
  Object.keys(groups).sort((a,b)=>b.localeCompare(a)).forEach(date=>{
    const lbl=document.createElement('div'); lbl.className='date-group'; lbl.textContent=fmtDate(date); list.appendChild(lbl);
    groups[date].forEach(tx=>list.appendChild(makeTxEl(tx)));
  });
}
