/**
 * Floating AI Warning Banners
 * Modularized from Pocket Winnie Core
 */

// ── FLOATING AI WARNING BANNER QUEUE (WITH TOUCH SWIPE) ─────────────────
let activeAiAlerts = [];
let currentAiAlertIdx = 0;
let dismissedAlertTitles = new Set();

function initFloatingAiAlerts(resetDismissed = false){
  if(resetDismissed){
    dismissedAlertTitles.clear();
  }
  const allAlerts = (typeof buildInsights === 'function' ? buildInsights() : []).filter(a => a.tag === 'alert' || a.tag === 'warn' || a.tag === 'tip');
  
  // Filter out any dismissed alerts for current session
  activeAiAlerts = allAlerts.filter(a => !dismissedAlertTitles.has(a.title));
  renderFloatingAiAlert();
}

function dismissAiAlert(title){
  dismissedAlertTitles.add(title);
  activeAiAlerts = activeAiAlerts.filter(a => a.title !== title);
  if(!activeAiAlerts.length){
    const container = el('ai-floating-alert-container');
    if(container) container.classList.add('hidden');
    toast(S.lang === 'zh' ? '所有提醒已全部忽略 🍯' : 'All active alerts dismissed for now! 🍯');
  } else {
    toast(S.lang === 'zh' ? '已忽略此条提醒' : 'Alert dismissed.');
    renderFloatingAiAlert();
  }
}

function renderFloatingAiAlert(){
  const container = el('ai-floating-alert-container');
  if(!container) return;
  
  if(!activeAiAlerts.length){
    container.classList.add('hidden');
    return;
  }
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  container.classList.remove('hidden');
  container.innerHTML = '';
  
  activeAiAlerts.forEach((alert, idx) => {
    const levelText = alert.tag === 'alert' 
      ? (isZh ? '🚨 风险预警' : '🚨 ALERT') 
      : alert.tag === 'warn' 
        ? (isZh ? '⚠️ 关注提醒' : '⚠️ WARNING') 
        : (isZh ? '💡 记账贴士' : '💡 TIP');
    
    const div = document.createElement('div');
    div.className = `ai-floating-alert alert-level-${alert.tag || 'warn'}`;
    
    let actionHtml = '';
    if (alert.action && alert.action.label) {
      actionHtml = `<div class="ai-float-action"><button type="button" class="ai-float-btn"><span>${esc(alert.action.label)}</span></button></div>`;
    }
    
    const countBadge = isZh ? `第 ${idx + 1} / ${activeAiAlerts.length} 条` : `${idx + 1} of ${activeAiAlerts.length}`;
    const swipeHint = activeAiAlerts.length > 1 ? `<div class="ai-swipe-hint">${isZh ? '↔ 滑动查看' : '↔ Swipe'}</div>` : '';
    const dismissTitle = isZh ? '忽略此条 (✕)' : 'Dismiss Alert (✕)';

    div.innerHTML = `
      <div class="ai-float-badge-row">
        <div class="ai-float-badge">${levelText} · ${countBadge}</div>
        <div class="ai-float-controls">
          ${swipeHint}
          <button type="button" class="ai-float-close-btn" title="${dismissTitle}">✕</button>
        </div>
      </div>
      <div class="ai-float-content">
        <div class="ai-float-icon">${alert.icon || '🤖'}</div>
        <div class="ai-float-info">
          <div class="ai-float-title">${esc(alert.title || (isZh ? 'AI 开销提醒' : 'AI Spending Alert'))}</div>
          <div class="ai-float-desc">${esc(alert.text || '')}</div>
          ${actionHtml}
        </div>
      </div>
    `;

    const closeBtn = div.querySelector('.ai-float-close-btn');
    if(closeBtn){
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        dismissAiAlert(alert.title);
      };
    }

    if(alert.action){
      const actionBtn = div.querySelector('.ai-float-btn');
      if(actionBtn){
        actionBtn.onclick = (e) => {
          e.stopPropagation();
          if(typeof alert.action.onClick === 'function'){
            alert.action.onClick();
          } else if(typeof alert.action.onClick === 'string'){
            try {
              new Function(alert.action.onClick)();
            } catch(err){
              console.error('Error executing alert action:', err);
            }
          }
        };
      }
    }

    container.appendChild(div);
  });
}