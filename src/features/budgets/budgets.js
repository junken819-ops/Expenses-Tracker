/**
 * Budgets Page & Available Spending Pool
 * Modularized from Pocket Winnie Core
 */


function getMonthlyBudgetTotal(){
  if(typeof S !== 'undefined' && S && S.monthlyBudget !== undefined && Number(S.monthlyBudget) > 0){
    return Number(S.monthlyBudget);
  }
  if(typeof S !== 'undefined' && S && Array.isArray(S.budgets) && S.budgets.length > 0){
    return S.budgets.reduce((s,b) => s + (Number(b.limit)||0), 0);
  }
  return 0;
}

// ── RENDER: BUDGET PREVIEW ─────────────────────────────
function renderBudPreview(){
  const wrap=el('bud-preview'); if(!wrap) return;
  wrap.innerHTML='';
  const budgetLimit = getMonthlyBudgetTotal();
  if(budgetLimit <= 0){
    wrap.innerHTML='<p style="font-size:12px;color:var(--dim);text-align:center;padding:8px">No monthly budget set</p>';
    return;
  }
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const txs = (S.transactions || []).filter(t => t.type === 'expense' && inMonth(t, m, y));
  const sp = txs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const remaining = budgetLimit - sp;
  const pct = Math.min((sp / budgetLimit) * 100, 100);
  const col = remaining < 0 ? '#ef4444' : pct >= 85 ? '#f59e0b' : '#10b981';
  const d = document.createElement('div'); d.className = 'bud-item';
  d.innerHTML = `
    <div class="bud-hdr">
      <div class="bud-name"><span>💰</span>Monthly Available Pool</div>
      <div class="bud-amts">${fmt(sp)} / <strong>${fmt(budgetLimit)}</strong></div>
    </div>
    <div class="track"><div class="fill" style="width:${pct}%;background:${col}"></div></div>
    <div class="bud-foot" style="color:${col}">${remaining < 0 ? 'Over budget by ' + fmt(Math.abs(remaining)) : fmt(remaining) + ' available left'}</div>
  `;
  wrap.appendChild(d);
}

// ── RENDER: BUDGETS PAGE (AVAILABLE SPENDING POOL DASHBOARD) ───────────
function renderBudgets(){
  const list = el('budgets-list'), empty = el('empty-budgets');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML = '';
  if(empty) empty.classList.add('hidden');

  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const txs = (S.transactions || []).filter(t => t.type === 'expense' && inMonth(t, m, y));
  const totalSpent = txs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const budgetLimit = getMonthlyBudgetTotal();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);

  if(budgetLimit <= 0){
    // Empty state: prompt to set monthly available budget
    const emptyCard = document.createElement('div');
    emptyCard.style.cssText = 'background:linear-gradient(145deg,rgba(36,27,22,.92),rgba(24,19,16,.92));border:1.5px dashed rgba(245,158,11,.35);border-radius:20px;padding:26px 18px;text-align:center;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,.2)';
    emptyCard.innerHTML = `
      <div style="font-size:36px;margin-bottom:8px">🍯</div>
      <div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:6px">${isZh ? '尚未设置本月可用预算' : 'No Monthly Spending Budget Set'}</div>
      <p style="font-size:12px;color:var(--muted);max-width:320px;margin:0 auto 16px;line-height:1.4">
        ${isZh ? '设置一个本月所有消费的总可用资金池。记账时将实时从该池扣减，并在超支时自动发出警告提醒。' : 'Define your total available spending money across all categories for the month. Pocket Winnie will track your total spending against this pool and warn you when you overspend.'}
      </p>
      <button type="button" class="primary-btn" onclick="openBudgetModal()" style="width:auto;padding:11px 24px;font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:6px">
        <span>➕</span> <span>${isZh ? '设置月度总预算' : 'Set Monthly Spending Budget'}</span>
      </button>
      ${totalSpent > 0 ? `
        <div style="margin-top:16px;font-size:11.5px;color:var(--muted);border-top:1px solid var(--border);padding-top:12px">
          ${isZh ? '本月目前已累计支出：' : 'Total spent so far this month:'} <strong style="color:var(--text)">${fmt(totalSpent)}</strong>
        </div>
      ` : ''}
    `;
    list.appendChild(emptyCard);
  } else {
    // Active Monthly Budget: Hero Available Spending Card
    const remaining = budgetLimit - totalSpent;
    const isOver = remaining < 0;
    const overAmt = Math.abs(remaining);
    const pct = Math.min(Math.round((totalSpent / budgetLimit) * 100), 100);
    const actualPct = Math.round((totalSpent / budgetLimit) * 100);
    const safeDaily = isOver ? 0 : (remaining / daysRemaining);

    const barColor = isOver ? '#fb7185' : pct >= 85 ? '#f59e0b' : '#10b981';
    const statusBg = isOver ? 'rgba(251,113,133,.1)' : pct >= 85 ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)';
    const statusBorder = isOver ? 'rgba(251,113,133,.28)' : pct >= 85 ? 'rgba(245,158,11,.28)' : 'rgba(16,185,129,.28)';
    const statusColor = isOver ? '#fb7185' : pct >= 85 ? 'var(--amber)' : 'var(--green)';

    const hero = document.createElement('div');
    hero.style.cssText = `background:linear-gradient(145deg,rgba(36,27,22,.95),rgba(24,19,16,.95));border:1.5px solid ${statusBorder};border-radius:20px;padding:18px 16px;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,.25);position:relative;overflow:hidden`;
    hero.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:11px;font-weight:800;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};padding:4px 10px;border-radius:12px;display:inline-flex;align-items:center;gap:4px">
          <span>${isOver ? '🚨' : pct >= 85 ? '⚠️' : '🛡️'}</span>
          <span>${isOver ? (isZh ? `已超支 ${fmt(overAmt)}` : `Over Budget by ${fmt(overAmt)}`) : (isZh ? `预算健康 (${actualPct}%)` : `On Track (${actualPct}%)`)}</span>
        </span>
        <div style="display:flex;gap:6px">
          <button type="button" class="chip" onclick="openBudgetModal()" style="font-size:11px;padding:4px 10px;background:var(--bg3);border:1px solid var(--border);cursor:pointer">✏️ ${isZh ? '调整' : 'Edit'}</button>
          <button type="button" class="del-btn" onclick="clearMonthlyBudget()" title="Clear Budget" style="font-size:13px;padding:2px 6px">🗑</button>
        </div>
      </div>

      <div style="text-align:center;padding:4px 0 14px">
        <div style="font-size:11.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">
          ${isOver ? (isZh ? '本月已超额支出' : 'Overspent Amount') : (isZh ? '本月剩余可用金额' : 'Available Spending Money Left')}
        </div>
        <div style="font-size:36px;font-weight:900;color:${statusColor};line-height:1.1;letter-spacing:-.5px">
          ${isOver ? '-' + fmt(overAmt) : fmt(remaining)}
        </div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px">
          ${isZh ? `月度总资金池: ${fmt(budgetLimit)}` : `of ${fmt(budgetLimit)} total monthly pool`}
        </div>
      </div>

      <div style="height:8px;background:rgba(255,255,255,.08);border-radius:6px;overflow:hidden;margin-bottom:12px">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:6px;transition:width .4s ease"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;background:rgba(255,255,255,.03);padding:10px 8px;border-radius:14px;border:1px solid rgba(255,255,255,.07);text-align:center;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:var(--muted)">${isZh ? '总月预算' : 'Total Budget'}</div>
          <div style="font-size:12.5px;font-weight:800;color:var(--text);margin-top:2px">${fmt(budgetLimit)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--muted)">${isZh ? '本月已花' : 'Total Spent'}</div>
          <div style="font-size:12.5px;font-weight:800;color:${statusColor};margin-top:2px">${fmt(totalSpent)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--muted)">${isZh ? '每日建议' : 'Safe Daily'}</div>
          <div style="font-size:12.5px;font-weight:800;color:var(--text);margin-top:2px">${isOver ? 'RM 0.00' : fmt(safeDaily)}</div>
        </div>
      </div>

      <div style="font-size:11px;line-height:1.4;color:var(--text);background:rgba(255,255,255,.03);border:1px solid ${statusBorder};border-radius:12px;padding:8px 10px;display:flex;align-items:flex-start;gap:6px">
        <span style="flex-shrink:0">${isOver ? '🚨' : '💡'}</span>
        <span>
          ${isOver
            ? (isZh ? `本月总消费已超出设定预算 ${fmt(overAmt)}！建议在接下来 ${daysRemaining} 天严格控制非必要支出。` : `You have exceeded your monthly limit by ${fmt(overAmt)}. Try pausing non-essential purchases for the remaining ${daysRemaining} days.`)
            : (isZh ? `本月还剩 ${daysRemaining} 天。每天支出保持在 ${fmt(safeDaily)} 以内即可安全保持在预算内！` : `You have ${daysRemaining} days left. Spending ~${fmt(safeDaily)} or less per day keeps you comfortably within budget!`)}
        </span>
      </div>
    `;
    list.appendChild(hero);
  }

  // Section 2: Where did your available money go? (All Categories Breakdown)
  if(txs.length > 0){
    const catGroup = {};
    txs.forEach(t => {
      const c = t.category || 'other';
      catGroup[c] = (catGroup[c] || 0) + (Number(t.amount) || 0);
    });

    const sortedCats = Object.entries(catGroup).sort((a, b) => b[1] - a[1]);

    const breakdownBox = document.createElement('div');
    breakdownBox.style.cssText = 'background:linear-gradient(145deg,rgba(36,27,22,.9),rgba(24,19,16,.9));border:1px solid rgba(245,158,11,.18);border-radius:20px;padding:16px;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,.2)';
    breakdownBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px">
          <span>📊</span> <span>${isZh ? '资金消耗分布 (全部分类)' : 'Where Your Money Went (All Categories)'}</span>
        </span>
        <span style="font-size:10.5px;color:var(--muted)">${txs.length} ${isZh ? '笔支出' : 'txs'}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${sortedCats.map(([catId, amt]) => {
          const info = catInfo('expense', catId);
          const catPct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
          return `
            <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:9px 12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                <span style="font-size:12px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:7px">
                  <span style="font-size:15px">${info.icon}</span> <span>${esc(info.name)}</span>
                </span>
                <span style="font-size:12px;font-weight:800;color:var(--text)">
                  ${fmt(amt)} <span style="font-size:10px;font-weight:600;color:var(--muted)">(${catPct}%)</span>
                </span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${catPct}%;background:linear-gradient(90deg,#f59e0b,#d97706);border-radius:4px"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    list.appendChild(breakdownBox);
  }
}

function clearMonthlyBudget(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(confirm(isZh ? '确定要清除月度预算限额吗？' : 'Clear your monthly budget limit?')){
    S.monthlyBudget = 0;
    S.budgets = [];
    save();
    renderAll();
    toast(isZh ? '月度预算已清除' : 'Monthly budget cleared');
  }
}

function delBudget(cat){
  if(confirm('Delete budget?')){
    S.budgets = S.budgets.filter(b => b.category !== cat);
    if(S.budgets.length === 0) S.monthlyBudget = 0;
    save();
    renderBudgets();
    renderBudPreview();
    toast('Budget removed');
  }
}
