/**
 * Due Soon Reminders
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: DUE SOON ───────────────────────────────────
function renderDueSoon(){
  const now=new Date(), t=today();
  const soon=S.reminders.filter(r=>{
    if(r.paid) return false;
    const diff=(new Date(r.date+'T00:00:00')-now)/86400000;
    return diff<=7;
  }).sort((a,b)=>a.date.localeCompare(b.date));

  // Pending meals due within 7 days
  const mealsDue = (S.pendingMeals||[]).filter(m=>{
    if(m.paid) return false;
    const diff=(new Date(m.dueDate+'T00:00:00')-new Date(t+'T00:00:00'))/86400000;
    return diff<=7;
  }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));

  const sec=el('due-section'), list=el('due-list');
  if(!sec||!list) return;
  list.innerHTML='';
  if(!soon.length && !mealsDue.length){sec.classList.add('hidden');return;}
  sec.classList.remove('hidden');

  // Reminders
  soon.forEach(r=>{
    const d=new Date(r.date+'T00:00:00');
    const diff=Math.round((d-new Date(t+'T00:00:00'))/86400000);
    const lbl=diff===0?'Due today':diff<0?Math.abs(diff)+'d overdue':'Due in '+diff+'d';
    const c=catInfo('expense',r.category||'bills');
    const div=document.createElement('div'); div.className='due-item';
    div.innerHTML='<div class="due-icon">'+c.icon+'</div><div class="due-info"><div class="due-name">'+esc(r.name)+'</div><div class="due-date">'+lbl+'</div></div><div><div class="due-amt">'+fmt(r.amount)+'</div></div>';
    const payBtn=document.createElement('button');
    payBtn.className='pay-btn';
    payBtn.textContent='Pay ✓';
    payBtn.onclick=()=>payReminder(r.id);
    div.appendChild(payBtn);
    list.appendChild(div);
  });

  // Pending meals
  mealsDue.forEach(m=>{
    const diff=Math.round((new Date(m.dueDate+'T00:00:00')-new Date(t+'T00:00:00'))/86400000);
    const lbl=diff===0?'Due today':diff<0?Math.abs(diff)+'d overdue':'Due in '+diff+'d';
    const div=document.createElement('div'); div.className='due-item';
    div.innerHTML=`<div class="due-icon">🍽️</div><div class="due-info"><div class="due-name">${esc(m.desc||'Pending Meal')}</div><div class="due-date">🕐 ${lbl}${m.payTo?' · 👤 '+esc(m.payTo):''}</div></div><div><div class="due-amt">${fmt(m.amount)}</div></div>`;
    const payBtn=document.createElement('button');
    payBtn.className='pay-btn';
    payBtn.textContent='Pay ✓';
    payBtn.onclick=()=>markMealPaid(m.id);
    div.appendChild(payBtn);
    list.appendChild(div);
  });
}
