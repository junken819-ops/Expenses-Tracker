/**
 * Health Score UI & Habit Alerts
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: HEALTH ─────────────────────────────────────
function renderHealth(){
  const hNum = el('h-score-num');
  if(!hNum) return;
  const {score,grade,tips}=calcHealth();
  const circ=2*Math.PI*23, dash=(score/100)*circ;
  const ring=el('h-ring-fill');
  if(ring){
    ring.setAttribute('stroke-dasharray',dash+' '+(circ-dash));
    ring.setAttribute('stroke',score>=70?'#10b981':score>=50?'#f59e0b':'#ef4444');
  }
  hNum.textContent=score;
  if(el('h-grade')) el('h-grade').textContent=grade;
  const tip=tips.find(t=>t.tag==='tip')||tips[0];
  if(el('h-tip')) el('h-tip').textContent=tip?tip.txt:'';
}

// ── RENDER: AI INSIGHTS & HABIT ALERTS ─────────────────
function renderInsights(){
  const list = el('insights-list'); if(!list) return;
  list.innerHTML = '';
  const alerts = buildInsights();
  
  const badge = el('ai-alert-count-badge');
  if(badge){
    const warnCount = alerts.filter(a => a.tag === 'alert' || a.tag === 'warn').length;
    if(warnCount > 0){
      badge.textContent = `${warnCount} Alert${warnCount > 1 ? 's' : ''}`;
      badge.style.background = 'rgba(229,57,53,0.18)';
      badge.style.color = 'var(--red)';
    } else {
      badge.textContent = 'All Healthy ✨';
      badge.style.background = 'rgba(102,187,106,0.18)';
      badge.style.color = '#2e7d32';
    }
  }

  if(!alerts.length){
    list.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 4px">No alerts right now. Your honey pot is well-balanced! 🍯</div>';
    return;
  }

  alerts.slice(0, 6).forEach(ins => {
    const d = document.createElement('div');
    d.className = 'insight ins-' + (ins.tag || 'tip');
    d.innerHTML = `
      <div class="ins-icon">${ins.icon}</div>
      <div class="ins-body">
        <h4><span>${esc(ins.title)}</span> <span class="ins-tag tag-${ins.tag}">${ins.tag.toUpperCase()}</span></h4>
        <p>${esc(ins.text)}</p>
      </div>
    `;
    list.appendChild(d);
  });
}

function getTxInstantAiAlert(tx){
  if(!tx || tx.type !== 'expense') return null;
  const descLower = (tx.desc||'').toLowerCase();
  
  // Boba / Milk tea alert
  if(/(boba|bubble\s*tea|milk\s*tea|tealive|chagee|koi|gong\s*cha|xing\s*fu\s*tang|machi|heytea|tiger\s*sugar)/i.test(descLower)){
    const bobaTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && /(boba|bubble\s*tea|milk\s*tea|tealive|chagee|koi|gong\s*cha|xing\s*fu\s*tang|machi|heytea|tiger\s*sugar)/i.test(t.desc));
    if(bobaTxs.length >= 2){
      return `🧋 AI Alert: ${bobaTxs.length} milk teas this week! Watch the sugar & honey pot 🍯`;
    }
  }

  // Coffee alert
  if(/(coffee|latte|cappuccino|zus|starbucks|richiamo|gigi\s*coffee|kopi|espresso)/i.test(descLower)){
    const coffeeTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && /(coffee|latte|cappuccino|zus|starbucks|richiamo|gigi\s*coffee|kopi|espresso)/i.test(t.desc));
    if(coffeeTxs.length >= 3){
      return `☕ AI Alert: ${coffeeTxs.length} coffees logged this week! Brew at home to save 🍯`;
    }
  }

  // Expensive Food alert
  if(tx.category === 'food'){
    const todayFood = S.transactions.filter(t => t.type==='expense' && t.date === today() && t.category==='food').reduce((s,t)=>s+(Number(t.amount)||0),0);
    if(todayFood >= 45){
      return `🍽️ AI Alert: RM ${todayFood.toFixed(0)} spent on food today! Try a lighter dinner 🍯`;
    }
    if(tx.amount >= 35){
      return `🥩 AI Note: Big meal (${fmt(tx.amount)})! Balance it out tomorrow 🍯`;
    }
  }

  // Online shopping
  if(tx.category === 'shopping' || /(shopee|lazada|tiktok\s*shop|shein|zalora|taobao)/i.test(descLower)){
    const shopTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && (t.category==='shopping' || /(shopee|lazada|tiktok\s*shop|shein|zalora|taobao)/i.test(t.desc)));
    if(shopTxs.length >= 3){
      return `🛍️ AI Alert: ${shopTxs.length} online shopping orders this week! 🍯`;
    }
  }

  return null;
}
