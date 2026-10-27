/**
 * Reminders & Recurring UI
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: REMINDERS ──────────────────────────────────
function renderReminders(){
  const list=el('reminders-list'), empty=el('empty-reminders');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.reminders.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const active=S.reminders.filter(r=>!r.paid).sort((a,b)=>a.date.localeCompare(b.date));
  const paid=S.reminders.filter(r=>r.paid);
  if(active.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '待支付提醒 (UPCOMING)' : 'UPCOMING';list.appendChild(h);
    active.forEach(r=>list.appendChild(makeRemEl(r)));
  }
  if(paid.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '已完成支付 (PAID)' : 'PAID';list.appendChild(h);
    paid.forEach(r=>list.appendChild(makeRemEl(r)));
  }
}
function makeRemEl(r){
  const cat=catInfo('expense',r.category||'bills');
  const d=new Date(r.date+'T00:00:00');
  const overdue=!r.paid&&d<new Date();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  const div=document.createElement('div'); div.className='rem-item'; div.style.opacity=r.paid?'0.55':'1';
  div.innerHTML=`
    <div class="rem-icon" style="background:${overdue?'rgba(239,68,68,.12)':'rgba(245,158,11,.1)'}">${cat.icon}</div>
    <div class="rem-info" style="flex:1">
      <div class="rem-name">${esc(r.name)}</div>
      <div class="rem-date" style="color:${overdue?'#ef4444':'var(--muted)'}">
        ${overdue ? (isZh ? '⚠️ 已逾期 — ' : '⚠️ Overdue — ') : ''}${d.toLocaleDateString(localeStr,{month:'short',day:'numeric',year:'numeric'})}
      </div>
      ${!r.paid ? `<div class="rem-actions"><button class="paid-btn" type="button">✓ ${isZh ? '标记已付' : 'Mark Paid'}</button><button class="del-btn" type="button">🗑</button></div>` : `<span style="font-size:11px;color:var(--green)">✓ ${isZh ? '已支付' : 'Paid'}</span>`}
    </div>
    <div class="rem-amt">${fmt(r.amount)}</div>
  `;
  const pBtn=div.querySelector('.paid-btn');
  if(pBtn) pBtn.onclick=()=>payReminder(r.id);
  const dBtn=div.querySelector('.del-btn');
  if(dBtn) dBtn.onclick=()=>delReminder(r.id);
  return div;
}
function payReminder(id){
  const r=S.reminders.find(x=>x.id===id); if(!r) return;
  r.paid=true;
  S.transactions.unshift({
    id: uid('paid'),
    type:'expense',
    amount:Number(r.amount)||0,
    desc:r.name,
    category:r.category||'bills',
    date:today(),
    paymentMethod:'Online Banking (FPX)',
    note:'From reminder',
    accountId:'default',
    createdAt:new Date().toISOString()
  });
  save();renderAll();toast('✅ '+r.name+' marked as paid');
}
function delReminder(id){S.reminders=S.reminders.filter(r=>r.id!==id);save();renderReminders();renderDueSoon();toast('Reminder removed');}

// ── RENDER: RECURRING ──────────────────────────────────
function renderRecurring() {}
function delRec(id){S.recurring=S.recurring.filter(r=>r.id!==id);save();renderRecurring();toast('Recurring removed');}
