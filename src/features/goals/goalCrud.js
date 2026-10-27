/**
 * Goal CRUD Operations
 * Modularized from Pocket Winnie Core
 */

// ── GOALS ──────────────────────────────────────────────
function openGoalModal(){
  selGoalIcon = (typeof GOAL_ICONS !== 'undefined' && GOAL_ICONS.length) ? GOAL_ICONS[0] : '🎯';
  const nameInp = el('goal-name') || el('goal-name-inp'); if(nameInp) nameInp.value = '';
  const targetInp = el('goal-target') || el('goal-target-inp'); if(targetInp) targetInp.value = '';
  const dateInp = el('goal-date') || el('goal-deadline-inp'); if(dateInp) dateInp.value = '';
  const picker = el('goal-icon-picker');
  if(picker && typeof GOAL_ICONS !== 'undefined'){
    picker.innerHTML = '';
    GOAL_ICONS.forEach(ico => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-opt' + (ico === selGoalIcon ? ' on' : '');
      btn.textContent = ico;
      btn.onclick = () => { picker.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('on')); btn.classList.add('on'); selGoalIcon = ico; };
      picker.appendChild(btn);
    });
  }
  openModal('goal-modal');
}
function saveGoal(){
  const name = (el('goal-name') || el('goal-name-inp'))?.value.trim();
  const target = parseFloat((el('goal-target') || el('goal-target-inp'))?.value);
  const deadline = (el('goal-date') || el('goal-deadline-inp'))?.value || null;
  if(!name){ toast('⚠️ Enter a goal name'); return; }
  if(!target || target <= 0){ toast('⚠️ Enter a target amount'); return; }
  S.goals.push({ id: uid('item'), name, icon: selGoalIcon || '🎯', target, saved: 0, deadline, createdAt: new Date().toISOString() });
  save(); renderGoals(); closeModal('goal-modal'); toast('🎯 Goal created!');
}

function openDepositModal(id){
  const idInp = el('deposit-goal-id') || el('dep-goal-id');
  if(idInp) idInp.value = id;
  const amtInp = el('deposit-amt') || el('dep-amount');
  if(amtInp) amtInp.value = '';
  openModal('deposit-modal');
  if(amtInp) setTimeout(() => amtInp.focus(), 200);
}
function saveDeposit(){
  const id = (el('deposit-goal-id') || el('dep-goal-id'))?.value;
  const amtInp = el('deposit-amt') || el('dep-amount');
  const amount = parseFloat(amtInp?.value);
  if(!amount || amount <= 0){ toast('⚠️ Enter an amount'); return; }
  const g = S.goals.find(x => x.id === id); if(!g) return;
  g.saved = Math.min(Number(g.saved || 0) + amount, Number(g.target));
  save(); renderGoals(); closeModal('deposit-modal'); toast('✅ ' + fmt(amount) + ' added!');
  if(g.saved >= g.target) setTimeout(() => toast('🎉 Goal "' + g.name + '" reached!'), 600);
}
