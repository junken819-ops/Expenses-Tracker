/**
 * Debts & IOUs UI
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: DEBTS ──────────────────────────────────────
function renderDebts(){
  const list=el('debts-list'), empty=el('empty-debts');
  const sumEl=el('debt-summary');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tOwe=S.debts.filter(d=>d.dir==='owe'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  const tLent=S.debts.filter(d=>d.dir==='lent'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  if(sumEl) {
    sumEl.innerHTML=`<div class="ds-card ds-owe"><div class="ds-label">${isZh ? '我欠别人 (应还)' : 'I Owe'}</div><div class="ds-val">${fmt(tOwe)}</div></div><div class="ds-card ds-lent"><div class="ds-label">${isZh ? '别人欠我 (应收)' : 'Owed to Me'}</div><div class="ds-val">${fmt(tLent)}</div></div>`;
  }
  if(!list) return;
  list.innerHTML='';
  if(!S.debts.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const active=S.debts.filter(d=>!d.settled).sort((a,b)=>(a.due||'z').localeCompare(b.due||'z'));
  const settled=S.debts.filter(d=>d.settled);
  if(active.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '待结清 (ACTIVE)' : 'ACTIVE';list.appendChild(h);
    active.forEach(d=>list.appendChild(makeDebtEl(d)));
  }
  if(settled.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '已结清 (SETTLED)' : 'SETTLED';list.appendChild(h);
    settled.forEach(d=>list.appendChild(makeDebtEl(d)));
  }
}
function makeDebtEl(d){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const div=document.createElement('div'); div.className='debt-item'; div.style.opacity=d.settled?'0.55':'1';
  const tagLabel = d.dir==='owe' ? (isZh ? '我欠别人' : 'I Owe') : (isZh ? '别人欠我' : 'Owed to Me');
  div.innerHTML=`
    <div class="debt-tag ${d.dir==='owe'?'owe-tag':'lent-tag'}">${tagLabel}</div>
    <div class="debt-info">
      <div class="debt-person">${esc(d.person)}</div>
      ${d.note ? `<div class="debt-note">${esc(d.note)}</div>` : ''}
      ${d.due ? `<div class="debt-due">${isZh ? '应还日期: ' : 'Due: '}${d.due}</div>` : ''}
    </div>
    <div class="debt-right">
      <div class="debt-amt" style="color:${d.dir==='owe'?'#ef4444':'#10b981'}">${fmt(d.remaining)}</div>
      <div style="display:flex;gap:4px;margin-top:4px">
        ${!d.settled ? `<button class="settle-btn" type="button">${isZh ? '结清 ✓' : 'Settle ✓'}</button>` : `<span style="font-size:11px;color:var(--green)">✓ ${isZh ? '已结清' : 'Settled'}</span>`}
      </div>
      <button class="del-btn" type="button" style="margin-top:4px;display:block">✕</button>
    </div>
  `;
  const sBtn=div.querySelector('.settle-btn');
  if(sBtn) sBtn.onclick=()=>settleDebt(d.id);
  const dBtn=div.querySelector('.del-btn');
  if(dBtn) dBtn.onclick=()=>delDebt(d.id);
  return div;
}
function settleDebt(id){const d=S.debts.find(x=>x.id===id);if(d){d.settled=true;d.remaining=0;save();renderDebts();toast('Debt settled! 🎉');}}
function delDebt(id){if(confirm('Remove debt?')){S.debts=S.debts.filter(x=>x.id!==id);save();renderDebts();toast('Debt removed');}}
