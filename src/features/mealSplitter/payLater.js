/**
 * Meal Pay Later & Pending Meals
 * Modularized from Pocket Winnie Core
 */

// ── 🕐 MEAL PAY LATER / PENDING MEALS ─────────────────
function saveMealPayLater(){
  const calc = calcBillSplit();
  const share = splitMode === 'itemized' ? calc.myShare : calc.perPersonEqual;

  if(!share || share <= 0){
    toast('⚠️ Enter a valid bill amount first');
    return;
  }

  // Pre-fill the pay-later modal with computed data
  const descInp = el('pay-later-desc');
  const amtInp = el('pay-later-amount');
  const dateInp = el('pay-later-date');

  if(descInp) descInp.value = calc.place || '';
  if(amtInp) amtInp.value = share.toFixed(2);

  // Default due date: 3 days from now
  if(dateInp){
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dateInp.value = d.toISOString().split('T')[0];
  }

  if(el('pay-later-payto')) el('pay-later-payto').value = '';
  if(el('pay-later-note')) el('pay-later-note').value = `Split ${calc.pax} pax · Total: RM ${calc.grandTotal.toFixed(2)}`;

  openModal('pay-later-modal');
}

function confirmSaveMealPayLater(){
  const descEl = el('pay-later-desc');
  const amtEl = el('pay-later-amount') || el('pay-later-amt');
  const dateEl = el('pay-later-date');
  const payToEl = el('pay-later-payto') || el('pay-later-person');
  const noteEl = el('pay-later-note');

  const desc = (descEl ? descEl.value : '').trim() || 'Meal Split';
  const amount = parseFloat(amtEl ? amtEl.value : 0) || 0;
  const dueDate = (dateEl ? dateEl.value : '').trim() || today();
  const payTo = (payToEl ? payToEl.value : '').trim();
  const note = (noteEl ? noteEl.value : '').trim();

  if(!amount || amount <= 0){
    toast('⚠️ Amount is required');
    return;
  }

  const meal = {
    id: uid('pm'),
    desc: desc || 'Meal',
    amount: amount,
    category: (activeSplitContext && activeSplitContext.category) ? activeSplitContext.category : 'food',
    subCategory: (activeSplitContext && activeSplitContext.subCategory) ? activeSplitContext.subCategory : null,
    dueDate: dueDate,
    createdDate: today(),
    payTo: payTo,
    note: note,
    paid: false,
    paidDate: ''
  };

  S.pendingMeals.push(meal);
  save();

  closeModal('pay-later-modal');
  closeModal('splitter-modal');
  activeSplitContext = null;
  updateSplitterContextBanner();
  toast(`🕐 Meal saved! Due: ${formatDateNice(dueDate)}`);
  renderAll();
}

function openPendingMealsModal(){
  renderPendingMealsList();
  openModal('pending-meals-modal');
}

function renderPendingMealsList(){
  const list = el('pending-meals-list');
  const empty = el('pending-meals-empty');
  if(!list) return;
  list.innerHTML = '';

  // Show unpaid first (sorted by due date), then paid meals
  const unpaid = S.pendingMeals.filter(m => !m.paid).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const paid = S.pendingMeals.filter(m => m.paid).sort((a,b) => (b.paidDate || '').localeCompare(a.paidDate || ''));
  const all = [...unpaid, ...paid];

  if(!all.length){
    if(empty) empty.classList.remove('hidden');
    return;
  }
  if(empty) empty.classList.add('hidden');

  const todayStr = today();
  all.forEach(meal => {
    const isOverdue = !meal.paid && meal.dueDate < todayStr;
    const dueDiff = Math.round((new Date(meal.dueDate + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
    let statusLabel = '';
    let badgeClass = 'pending';
    if(meal.paid){
      statusLabel = `✅ Paid on ${formatDateNice(meal.paidDate)}`;
      badgeClass = 'paid';
    } else if(isOverdue){
      statusLabel = `⚠️ ${Math.abs(dueDiff)}d overdue!`;
      badgeClass = 'overdue';
    } else if(dueDiff === 0){
      statusLabel = '📅 Due today';
      badgeClass = 'overdue';
    } else {
      statusLabel = `📅 Due in ${dueDiff}d`;
    }

    const div = document.createElement('div');
    div.className = `pending-meal-item${isOverdue ? ' overdue' : ''}`;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--text)">${esc(meal.desc || 'Meal')}</div>
          ${meal.payTo ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">👤 Pay to: ${esc(meal.payTo)}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:800;color:${meal.paid ? 'var(--green)' : 'var(--text)'}">${fmt(meal.amount)}</div>
          <span class="pending-meal-badge ${badgeClass}">${statusLabel}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:10.5px;color:var(--dim)">
          Created ${formatDateNice(meal.createdDate)} · Due ${formatDateNice(meal.dueDate)}
          ${meal.note ? ` · ${esc(meal.note)}` : ''}
        </div>
        <div style="display:flex;gap:6px">
          ${!meal.paid ? `
            <button type="button" class="primary-btn" style="padding:6px 14px;font-size:11px;border-radius:10px" onclick="markMealPaid('${meal.id}')">✅ Mark Paid</button>
            <button type="button" class="ghost-btn" style="padding:6px 10px;font-size:11px;border-radius:10px;color:var(--red)" onclick="deletePendingMeal('${meal.id}')">🗑️</button>
          ` : `
            <button type="button" class="ghost-btn" style="padding:6px 10px;font-size:11px;border-radius:10px;color:var(--red)" onclick="deletePendingMeal('${meal.id}')">🗑️</button>
          `}
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

function markMealPaid(id){
  const meal = S.pendingMeals.find(m => m.id === id);
  if(!meal) return;

  meal.paid = true;
  meal.paidDate = today();

  // Auto-log as expense transaction preserving category
  const tx = {
    id: uid('tx'),
    type: 'expense',
    amount: meal.amount,
    desc: meal.desc || 'Meal (Pay Later)',
    category: meal.category || 'food',
    subCategory: meal.subCategory || null,
    date: today(),
    accountId: S.lastUsedAccId || (S.accounts.length ? S.accounts[0].id : ''),
    paymentMethod: '',
    note: `Pending meal settled${meal.payTo ? ' · Paid to: ' + meal.payTo : ''}${meal.note ? ' · ' + meal.note : ''}`,
    createdAt: new Date().toISOString()
  };
  S.transactions.push(tx);
  save();
  renderPendingMealsList();
  renderAll();
  toast(`✅ Meal paid & logged: ${fmt(meal.amount)}`);
}

function deletePendingMeal(id){
  if(!confirm('Delete this pending meal?')) return;
  S.pendingMeals = S.pendingMeals.filter(m => m.id !== id);
  save();
  renderPendingMealsList();
  renderAll();
  toast('🗑️ Pending meal deleted');
}

function formatDateNice(dateStr){
  if(!dateStr) return '—';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  try {
    const localeStr = isZh ? 'zh-CN' : 'en-MY';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(localeStr, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e){ return dateStr; }
}
