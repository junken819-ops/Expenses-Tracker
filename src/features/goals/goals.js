/**
 * Savings Goals UI
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: GOALS ──────────────────────────────────────
function renderGoals(){
  const list=el('goals-list'), empty=el('empty-goals');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.goals.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  S.goals.forEach(g=>{
    const pct=Math.min(Math.round(((g.saved||0)/g.target)*100),100);
    const div=document.createElement('div'); div.className='goal-card';
    div.innerHTML=`
      <div class="goal-top">
        <div class="goal-ico">${g.icon}</div>
        <div class="goal-info">
          <div class="goal-name">${esc(g.name)}</div>
          <div class="goal-target">${isZh ? '已存' : 'Saved'} ${fmt(g.saved||0)} ${isZh ? '/' : 'of'} ${fmt(g.target)}${g.deadline ? (isZh ? ` · 截止: ${g.deadline}` : ` · Due: ${g.deadline}`) : ''}</div>
        </div>
        <div class="goal-pct">${pct}%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-actions">
        <button class="goal-btn" onclick="openDepositModal('${g.id}')">➕ ${isZh ? '存入' : 'Deposit'}</button>
        <button class="del-btn" style="padding:6px 10px;border-radius:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:var(--red);font-size:12px;cursor:pointer" onclick="delGoal('${g.id}')">🗑</button>
      </div>
    `;
    list.appendChild(div);
  });
}
function delGoal(id){
  if(confirm('Delete goal?')){S.goals=S.goals.filter(g=>g.id!==id);save();renderGoals();toast('Goal deleted');}
}
