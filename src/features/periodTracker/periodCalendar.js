/**
 * Period Calendar Grid & Menstrual Cycle
 * Modularized from Pocket Winnie Core
 */

// ── 📅 PERIOD CALENDAR METHOD GRID ENGINE ───────────────
let periodCalInspectedDate = new Date();
let selectedPeriodInspectorDateStr = today();
let periodAiInspectDateStr = today();

function shiftPeriodCalMonth(delta){
  periodCalInspectedDate.setDate(1);
  periodCalInspectedDate.setMonth(periodCalInspectedDate.getMonth() + delta);
  renderPeriodCalendarGrid();
}

function jumpPeriodCalToday(){
  periodCalInspectedDate = new Date();
  selectedPeriodInspectorDateStr = today();
  renderPeriodCalendarGrid();
}

function renderPeriodCalendarGrid(){
  initPeriodTrackerState();
  const grid = el('period-cal-days-grid');
  const titleEl = el('period-cal-month-title');
  if(!grid) return;
  grid.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const yr = periodCalInspectedDate.getFullYear();
  const mo = periodCalInspectedDate.getMonth();

  const monthNamesZh = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  if(titleEl){
    titleEl.textContent = isZh ? `${yr}年 ${monthNamesZh[mo]}` : `${monthNamesEn[mo]} ${yr}`;
  }

  const firstDayIndex = new Date(yr, mo, 1).getDay();
  const totalDays = new Date(yr, mo + 1, 0).getDate();

  // Get info & predicted cycles
  const info = getPeriodPhaseInfo();
  const pt = S.periodTracker;
  const lastD = (pt && pt.lastPeriodDate) ? new Date(pt.lastPeriodDate + 'T00:00:00') : null;
  const cycleDays = pt.cycleLength || 28;
  const periodDays = pt.periodLength || 5;

  const todayStr = today();
  const prevMonthTotalDays = new Date(yr, mo, 0).getDate();

  // 1. Padding days from previous month (.other-month)
  for(let i = firstDayIndex - 1; i >= 0; i--){
    const pDay = prevMonthTotalDays - i;
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.style.cssText = 'min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 2px;opacity:0.25';
    box.innerHTML = `<span class="cal-day-num" style="font-size:12.5px;font-weight:700">${pDay}</span>`;
    grid.appendChild(box);
  }

  // 2. Current month days
  for(let d = 1; d <= totalDays; d++){
    const dateStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    // Phase determination for each day using clean wording tags (NO emoji symbols)
    let cellBg = 'rgba(255,255,255,.06)';
    let cellColor = 'var(--text)';
    let borderStyle = '1px solid var(--border)';
    let phaseTagHtml = '';
    let boxShadow = 'none';
    let cycleDay = 0;

    if(info.isConfigured && lastD && !isNaN(lastD.getTime())){
      const currD = new Date(dateStr + 'T00:00:00');
      const diff = Math.floor((currD - lastD) / (1000 * 60 * 60 * 24));
      cycleDay = diff >= 0 ? ((diff % cycleDays) + 1) : (cycleDays + ((diff % cycleDays) + 1));

      if(cycleDay <= periodDays){
        cellBg = 'rgba(236,72,153,.72)';
        cellColor = '#ffffff';
        borderStyle = '1.5px solid #ec4899';
        phaseTagHtml = `<span class="period-cell-tag period-tag-flow">${isZh ? '经期' : 'Period'}</span>`;
      } else if(cycleDay >= (cycleDays - 16) && cycleDay <= (cycleDays - 10)){
        cellBg = 'rgba(139,92,246,.72)';
        cellColor = '#ffffff';
        borderStyle = '1.5px solid #a78bfa';
        phaseTagHtml = `<span class="period-cell-tag period-tag-ovul">${isZh ? '排卵' : 'Fertile'}</span>`;
      } else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0){
        cellBg = 'rgba(245,158,11,.68)';
        cellColor = '#ffffff';
        borderStyle = '1.5px dashed #fbbf24';
        phaseTagHtml = `<span class="period-cell-tag period-tag-pms">${isZh ? '经前' : 'PMS'}</span>`;
      } else {
        cellBg = 'rgba(16,185,129,.62)';
        cellColor = '#ffffff';
        borderStyle = '1px solid rgba(16,185,129,.35)';
        phaseTagHtml = `<span class="period-cell-tag period-tag-safe">${isZh ? '安全' : 'Safe'}</span>`;
      }
    }

    const box = document.createElement('div');
    box.className = 'cal-day-box';
    box.id = `period-day-${dateStr}`;
    box.style.cssText = `min-height:64px;background:${cellBg};border:${borderStyle};border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:6px 3px;cursor:pointer;position:relative;transition:all .15s ease;box-shadow:${boxShadow};touch-action:manipulation;`;

    const isToday = (dateStr === todayStr);
    if(isToday){
      box.style.borderColor = 'var(--amber)';
      box.style.boxShadow = '0 0 8px rgba(255,179,0,.5)';
    }

    const isSelected = (dateStr === selectedPeriodInspectorDateStr);
    if(isSelected){
      box.style.borderColor = '#ec4899';
      box.style.background = 'linear-gradient(135deg,rgba(236,72,153,.88),rgba(139,92,246,.88))';
      box.style.boxShadow = '0 0 12px rgba(236,72,153,.6)';
    }

    // Period calendar keeps spending separate from AI dietary reference items.
    const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
    const dayFoodTxs = S.transactions.filter(t => {
      if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
      const cat = String(t.category || '').toLowerCase();
      return (cat === 'food' || cat === 'groceries') && !isPeriodCareExpense(t);
    });
    const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t));
    const daySpent = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const spentFmt = daySpent > 0 ? (daySpent >= 1000 ? (daySpent/1000).toFixed(1)+'k' : daySpent.toFixed(0)) : '';
    const dayHealthLog = (S.periodTracker.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
    const healthBits = [];
    if(dayHealthLog){
      if(dayHealthLog.flow) healthBits.push(`${isZh ? '流量' : 'Flow'}: ${dayHealthLog.flow}`);
      if(dayHealthLog.pain) healthBits.push(`${isZh ? '痛感' : 'Pain'}: ${dayHealthLog.pain}`);
      if(Array.isArray(dayHealthLog.symptoms) && dayHealthLog.symptoms.length) healthBits.push(`${isZh ? '症状' : 'Symptoms'}: ${dayHealthLog.symptoms.join(', ')}`);
    }
    const healthTagLabel = dayHealthLog ? (dayHealthLog.pain && dayHealthLog.pain !== 'none' ? (isZh ? '痛感' : 'Pain') : (Array.isArray(dayHealthLog.symptoms) && dayHealthLog.symptoms.length ? (isZh ? '症状' : 'Symptoms') : (isZh ? '记录' : 'Log'))) : '';
    const healthTagHtml = dayHealthLog ? `<span class="period-health-day-tag" title="${esc(healthBits.join(' · '))}">🩺 ${healthTagLabel}</span>` : '';
    const aiTagHtml = dayAiTxs.length > 0 ? `<span class="period-ai-day-tag" title="${isZh ? 'AI 标记可能影响经期的饮食' : 'AI flagged a food or drink that may affect your period'}">🤖 AI</span>` : '';
    const foodTagHtml = dayFoodTxs.length > 0 && dayAiTxs.length === 0 ? `<span class="period-food-day-tag" title="${isZh ? '当天有饮食记录' : 'Food or drink logged this day'}">🍽 ${isZh ? '饮食' : 'Food'}</span>` : '';

    box.innerHTML = `
      <span class="cal-day-num" style="font-size:13px;font-weight:800;color:${cellColor}">${d}</span>
      ${phaseTagHtml ? `${phaseTagHtml}` : ''}
      ${daySpent > 0 ? `<span style="font-size:9.5px;font-weight:800;color:var(--red);line-height:1">🛒 -${spentFmt}</span>` : ''}
      ${healthTagHtml}
      ${aiTagHtml}
      ${foodTagHtml}
    `;

    // ⚡ 100% RELIABLE DUAL-MODE TAP & DOUBLE-TAP HANDLER (Touch & Desktop)
    let lastTapTimestamp = 0;
    let singleTapTimeout = null;

    const triggerDoubleTap = (ev) => {
      if(ev){
        if(ev.stopPropagation) ev.stopPropagation();
        if(ev.preventDefault) ev.preventDefault();
      }
      if(singleTapTimeout){
        clearTimeout(singleTapTimeout);
        singleTapTimeout = null;
      }
      lastTapTimestamp = 0;
      selectPeriodCalDay(dateStr, cycleDay, periodDays, cycleDays, true);
    };

    const triggerSingleTap = () => {
      openDailyExpensesAndAiDietaryInspector(dateStr);
    };

    box.onclick = (e) => {
      document.querySelectorAll('#period-cal-days-grid .cal-day-box').forEach(b => {
        b.classList.remove('selected');
      });
      box.classList.add('selected');

      const now = Date.now();
      const timeSinceLast = now - lastTapTimestamp;

      if(timeSinceLast > 0 && timeSinceLast < 480){
        // Double-tap detected (< 480ms)
        triggerDoubleTap(e);
      } else {
        // First tap
        lastTapTimestamp = now;
        if(singleTapTimeout) clearTimeout(singleTapTimeout);
        singleTapTimeout = setTimeout(() => {
          triggerSingleTap();
          lastTapTimestamp = 0;
          singleTapTimeout = null;
        }, 300);
      }
    };

    box.ondblclick = (e) => {
      triggerDoubleTap(e);
    };

    grid.appendChild(box);
  }

  // 3. Padding days for next month to complete the row
  const totalCellsSoFar = firstDayIndex + totalDays;
  const nextPaddingNeeded = (7 - (totalCellsSoFar % 7)) % 7;
  for(let n = 1; n <= nextPaddingNeeded; n++){
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.style.cssText = 'min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 2px;opacity:0.25';
    box.innerHTML = `<span class="cal-day-num" style="font-size:12.5px;font-weight:700">${n}</span>`;
    grid.appendChild(box);
  }
}

function periodHealthValueLabel(value, kind, isZh){
  const key = String(value || '').toLowerCase();
  const labels = {
    flow: {
      light: isZh ? '少量' : 'Light', medium: isZh ? '中等' : 'Medium', heavy: isZh ? '多量' : 'Heavy'
    },
    pain: {
      none: isZh ? '无痛' : 'None', mild: isZh ? '轻微' : 'Mild', moderate: isZh ? '中度' : 'Moderate', severe: isZh ? '严重' : 'Severe'
    },
    symptom: {
      cramps: isZh ? '腹痛' : 'Cramps', headache: isZh ? '头痛' : 'Headache', bloating: isZh ? '腹胀' : 'Bloating', acne: isZh ? '长痘' : 'Acne', cravings: isZh ? '嗜甜' : 'Cravings', 'ai auto-parsed': isZh ? 'AI 自动解析' : 'AI auto-parsed'
    }
  };
  return (labels[kind] && labels[kind][key]) || value || '—';
}

function openDailyExpensesAndAiDietaryInspector(dateStr){
  // Hide full inspector card if open
  const fullCard = el('period-day-inspector-card');
  if(fullCard) fullCard.classList.add('hidden');

  const singleCard = el('period-single-tap-inspector-card');
  const dateStrEl = el('period-singletap-date-str');
  const totalBadgeEl = el('period-singletap-total-badge');
  const txListEl = el('period-singletap-tx-list');
  const aiInsightEl = el('period-singletap-ai-insight');

  if(!singleCard) return;
  singleCard.classList.remove('hidden');
  periodAiInspectDateStr = dateStr;
  selectedPeriodInspectorDateStr = dateStr;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const aiBtn = el('period-singletap-ai-btn');
  if(aiBtn){
    aiBtn.disabled = false;
    aiBtn.style.opacity = '1';
    aiBtn.textContent = t('period_analyze_day', isZh ? 'AI 分析本日' : 'Analyze with AI');
  }
  if(dateStrEl) dateStrEl.textContent = fmtDate(dateStr);

  // Keep care spending as the total; show AI dietary flags separately for reference.
  const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
  const dayFoodTxs = S.transactions.filter(t => {
    if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
    const cat = String(t.category || '').toLowerCase();
    return (cat === 'food' || cat === 'groceries') && !isPeriodCareExpense(t);
  });
  const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t));
  const dayTxs = [...dayCareTxs, ...dayFoodTxs];
  const dayCareTotal = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const dayHealthLog = (S.periodTracker.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
  const healthSymptoms = dayHealthLog && Array.isArray(dayHealthLog.symptoms) ? dayHealthLog.symptoms.filter(Boolean).map(s => periodHealthValueLabel(s, 'symptom', isZh)) : [];
  const healthFlow = dayHealthLog ? periodHealthValueLabel(dayHealthLog.flow, 'flow', isZh) : '—';
  const healthPain = dayHealthLog ? periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh) : '—';
  const healthDetailsHtml = dayHealthLog ? `
    <div style="background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.38);border-radius:9px;padding:7px 8px;margin-bottom:4px">
      <div style="font-size:10px;font-weight:900;color:#fbbf24;margin-bottom:3px">🩺 ${isZh ? '已记录的健康数据' : 'Recorded Health'}</div>
      <div style="font-size:10px;color:var(--text);line-height:1.45">${isZh ? '流量' : 'Flow'}: <strong>${esc(healthFlow)}</strong> · ${isZh ? '痛感' : 'Pain'}: <strong>${esc(healthPain)}</strong></div>
      <div style="font-size:10px;color:var(--text);line-height:1.45">${isZh ? '症状' : 'Symptoms'}: <strong>${esc(healthSymptoms.length ? healthSymptoms.join(', ') : '—')}</strong></div>
    </div>` : `<div style="font-size:10px;color:var(--muted);text-align:center;padding:4px 6px;border:1px dashed var(--border);border-radius:8px;margin-bottom:4px">${isZh ? '当天暂无健康记录' : 'No health log for this day'}</div>`;

  if(totalBadgeEl) totalBadgeEl.textContent = isZh ? `经期用品: ${fmt(dayCareTotal)} · 饮食: ${dayFoodTxs.length}项 · AI标记: ${dayAiTxs.length}项` : `Period Care: ${fmt(dayCareTotal)} · Food: ${dayFoodTxs.length} · AI flags: ${dayAiTxs.length}`;

  if(txListEl){
    txListEl.innerHTML = healthDetailsHtml;
    if(!dayTxs.length){
      txListEl.insertAdjacentHTML('beforeend', `<div style="font-size:10px;color:var(--muted);text-align:center;padding:6px">${t('period_no_day_items')}</div>`);
    } else {
      dayTxs.forEach(t => {
        const row = document.createElement('div');
        row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:5px 8px;display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:2px';
        const isCare = isPeriodCareExpense(t);
        const isAiDiet = !isCare && isPeriodDietAffectingTx(t);
        const typeTag = isCare ? (isZh ? '【经期用品】' : '[Care Product]') : (isAiDiet ? (isZh ? '【AI饮食提示】' : '[AI Diet Flag]') : (isZh ? '【饮食记录】' : '[Food Logged]'));
        const tagColor = isCare ? '#ec4899' : '#06b6d4';
        
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:4px;min-width:0;flex:1">
            <span style="font-size:10px;color:${tagColor};font-weight:800;flex-shrink:0">${typeTag}</span>
            <span style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.desc)}</span>
          </div>
          <span style="font-weight:800;color:var(--red);flex-shrink:0;margin-left:6px">${fmt(t.amount)}</span>
        `;
        txListEl.appendChild(row);
      });
    }
  }

  // 🤖 AI Dietary Period Pain Correlation Analysis Algorithm
  if(aiInsightEl){
    const coldKeywords = ['冰', '奶茶', '水冷', '雪糕', '冰淇淋', '沙拉', '刺身', '生鱼片', '生冷', 'ice', 'boba', 'slush', 'cold', 'salad', 'sashimi', 'gelato', 'tealive', 'chagee', 'mixue'];
    const spicyKeywords = ['麻辣', '火锅', '辣', '冬阴功', '辣椒', 'spicy', 'chili', 'hotpot', 'curry', 'mala', 'tomyam', 'sambal'];
    const caffeineKeywords = ['咖啡', '美式', '拿铁', '浓缩', 'espresso', 'latte', 'coffee', 'caffeine', 'zus'];
    const careKeywords = ['卫生巾', '暖宫贴', '暖宝宝', '卫生棉', '红糖', '止痛药', 'pad', 'tampon', 'sanitary'];

    let foundCold = [];
    let foundSpicy = [];
    let foundCaffeine = [];
    let foundCare = [];

    dayTxs.forEach(t => {
      const text = `${t.desc} ${t.note || ''}`.toLowerCase();
      coldKeywords.forEach(k => { if(text.includes(k) && !foundCold.includes(t.desc)) foundCold.push(t.desc); });
      spicyKeywords.forEach(k => { if(text.includes(k) && !foundSpicy.includes(t.desc)) foundSpicy.push(t.desc); });
      caffeineKeywords.forEach(k => { if(text.includes(k) && !foundCaffeine.includes(t.desc)) foundCaffeine.push(t.desc); });
      careKeywords.forEach(k => { if(text.includes(k) && !foundCare.includes(t.desc)) foundCare.push(t.desc); });
    });

    let insightHtml = '';
    if(foundCold.length > 0){
      insightHtml = isZh ? 
        `🚨 <strong>生冷饮品/食物提醒 (Cold Food Alert)</strong>: 记录了「${foundCold.join(', ')}」。生冷食物易刺激子宫收缩并加重痛经，建议多喝温热水或红糖姜茶。` : 
        `🚨 <strong>Cold Food Alert</strong>: Logged "${foundCold.join(', ')}". Cold drinks can cause vasoconstriction and intensify menstrual cramps.`;
    } else if(foundSpicy.length > 0){
      insightHtml = isZh ? 
        `🌶️ <strong>辛辣刺激饮食提醒 (Spicy Food Alert)</strong>: 记录了「${foundSpicy.join(', ')}」。辛辣可能加剧肠胃蠕动和腹部痉挛，建议经期维持温和清淡饮食。` : 
        `🌶️ <strong>Spicy Food Alert</strong>: Logged "${foundSpicy.join(', ')}". Spicy dishes may aggravate bloating and cramps.`;
    } else if(foundCaffeine.length > 0){
      insightHtml = isZh ? 
        `☕ <strong>咖啡因饮品提醒 (Caffeine Alert)</strong>: 记录了「${foundCaffeine.join(', ')}」。咖啡因可能会促进血管收缩并使经前情绪敏感，建议控制摄入。` : 
        `☕ <strong>High Caffeine Alert</strong>: Logged "${foundCaffeine.join(', ')}". Excessive caffeine can heighten PMS tension.`;
    } else if(foundCare.length > 0){
      insightHtml = isZh ? 
        `🌸 <strong>经期护理用品已记录</strong>: 记录了「${foundCare.join(', ')}」。及时备齐用品有助于安心度过生理期！` : 
        `🌸 <strong>Period Supplies Ready</strong>: Logged "${foundCare.join(', ')}". Good preparation ensures a comfortable cycle!`;
    } else if(dayTxs.length > 0){
      insightHtml = isZh ? 
        `✨ <strong>饮食评估良好</strong>: 当天未发现高风险生冷/烈辣项目。维持温热饮食有助于舒适度过生理期！` : 
        `✨ <strong>Balanced Diet</strong>: No high-risk cold or spicy items detected. Keep up the warm, nourishing meals!`;
    } else {
      insightHtml = isZh ? 
        `💡 <strong>暂无特殊饮食与用品</strong>: 记下当天所喝冷热饮品或卫生用品，AI 将自动分析饮食与经期痛感关联！` : 
        `💡 <strong>No Items Logged</strong>: Record what you drank, ate, or bought to let AI analyze dietary cramp triggers!`;
    }

    const recordedHealthHtml = dayHealthLog ? `
      <div style="background:rgba(251,191,36,.11);border-radius:8px;padding:6px 8px;margin-bottom:7px;font-size:10px;line-height:1.45;color:var(--text)">
        🩺 <strong>${isZh ? '本日健康记录已纳入分析' : 'Today’s health log is included'}</strong><br>
        ${isZh ? '痛感' : 'Pain'}: ${esc(healthPain)} · ${isZh ? '症状' : 'Symptoms'}: ${esc(healthSymptoms.length ? healthSymptoms.join(', ') : '—')}
      </div>` : '';
    aiInsightEl.innerHTML = recordedHealthHtml + insightHtml;
  }

  setTimeout(() => {
    singleCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
}

function openPeriodDateCareModalForInspectedDate(){
  const dateStr = periodAiInspectDateStr || selectedPeriodInspectorDateStr || today();
  const pt = S.periodTracker || {};
  const lastD = new Date((pt.lastPeriodDate || today()) + 'T00:00:00');
  const currD = new Date(dateStr + 'T00:00:00');
  const cycleDays = Number(pt.cycleLength) || 28;
  const periodDays = Number(pt.periodLength) || 5;
  const diffDays = Math.floor((currD - lastD) / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays >= 0 ? ((diffDays % cycleDays) + 1) : (cycleDays + ((diffDays % cycleDays) + 1));
  selectPeriodCalDay(dateStr, cycleDay, periodDays, cycleDays, true);
}

async function analyzeSelectedPeriodDayWithAi(){
  const insightEl = el('period-singletap-ai-insight');
  const btn = el('period-singletap-ai-btn');
  const dateStr = periodAiInspectDateStr || selectedPeriodInspectorDateStr || today();
  if(!insightEl) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const pt = S.periodTracker || {};
  const dayHealthLog = (pt.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
  const symptoms = dayHealthLog && Array.isArray(dayHealthLog.symptoms) ? dayHealthLog.symptoms.filter(Boolean) : [];
  const displaySymptoms = symptoms.map(s => periodHealthValueLabel(s, 'symptom', isZh));
  const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
  const dayFoodTxs = S.transactions.filter(t => {
    if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
    const cat = String(t.category || '').toLowerCase();
    return cat === 'food' || cat === 'groceries';
  });
  const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t) && !isPeriodCareExpense(t));
  const careTotal = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const foodItems = dayFoodTxs.map(t => `${t.desc || 'Food/drink'} (${fmt(t.amount)})`);
  const flaggedItems = dayAiTxs.map(t => t.desc || 'Food/drink');

  const lastD = new Date((pt.lastPeriodDate || today()) + 'T00:00:00');
  const currD = new Date(dateStr + 'T00:00:00');
  const cycleDays = Number(pt.cycleLength) || 28;
  const periodDays = Number(pt.periodLength) || 5;
  const diffDays = Math.floor((currD - lastD) / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays >= 0 ? ((diffDays % cycleDays) + 1) : (cycleDays + ((diffDays % cycleDays) + 1));
  let phase = 'safe';
  if(cycleDay <= periodDays) phase = 'period';
  else if(cycleDay >= cycleDays - 16 && cycleDay <= cycleDays - 10) phase = 'ovulation';
  else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0) phase = 'pms';
  const phaseLabel = isZh ? ({period:'经期',ovulation:'排卵/易孕期',pms:'经前期',safe:'安全期'}[phase]) : ({period:'Period',ovulation:'Fertile window',pms:'PMS',safe:'Stable phase'}[phase]);
  const healthText = dayHealthLog ? `${isZh ? '流量' : 'Flow'}=${periodHealthValueLabel(dayHealthLog.flow, 'flow', isZh)}, ${isZh ? '痛感' : 'Pain'}=${periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh)}, ${isZh ? '症状' : 'Symptoms'}=${displaySymptoms.length ? displaySymptoms.join(', ') : '—'}` : (isZh ? '当天没有保存健康记录' : 'No saved health log for this day');
  const foodText = foodItems.length ? foodItems.join(' | ') : (isZh ? '当天没有记录食物或饮品' : 'No food or drink entries for this day');
  const flaggedText = flaggedItems.length ? [...new Set(flaggedItems)].join(', ') : (isZh ? '没有 AI 标记饮食' : 'No AI-flagged food or drinks');

  if(btn){
    btn.disabled = true;
    btn.style.opacity = '.7';
    btn.textContent = t('period_analyzing', isZh ? '正在分析健康与饮食数据…' : 'Analyzing your health & food data…');
  }
  insightEl.innerHTML = `<div style="display:flex;align-items:center;gap:7px;color:var(--muted)"><span class="ai-scan-spinner" style="width:14px;height:14px"></span><span>${esc(t('period_analyzing', isZh ? '正在分析健康与饮食数据…' : 'Analyzing your health & food data…'))}</span></div>`;

  const promptText = `Daily Period Care Review\nDate: ${dateStr}\nCycle phase: ${phaseLabel}, cycle day ${cycleDay} of ${cycleDays}\nSaved health log: ${healthText}\nFood and drinks recorded: ${foodText}\nAI-flagged food/drinks for possible period impact: ${flaggedText}\nPeriod-care expenses: ${fmt(careTotal)}\n\nGive a concise, supportive status update. Explain possible connections between the logged symptoms and food/drinks without claiming a diagnosis or definite cause. Provide three practical actions for today and mention when to seek medical care. Reply in ${isZh ? 'Chinese' : 'English'}.`;

  let aiText = '';
  if(S.geminiApiKey){
    try {
      const generation = await generateGeminiContent(S.geminiApiKey, {
        contents: [{ parts: [{ text: promptText }] }]
      });
      const data = generation.data;
      if(data?.candidates?.[0]?.content){
        aiText = data.candidates[0].content.parts.map(part => part.text || '').join('').trim();
      }
    } catch(e) {
      console.warn('Daily Gemini analysis unavailable:', e);
    }
  }

  if(aiText){
    insightEl.innerHTML = `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.28);border-radius:9px;padding:8px;line-height:1.55"><strong style="color:#0891b2">✨ ${isZh ? 'AI 本日分析' : 'AI Daily Analysis'}</strong><div style="margin-top:5px;white-space:normal">${esc(aiText).replace(/\n/g, '<br>')}</div></div>`;
  } else {
    const textBlob = `${foodItems.join(' ')} ${flaggedItems.join(' ')}`.toLowerCase();
    const cold = ['ice','iced','cold','boba','slush','奶茶','冰','雪糕','冰淇淋','沙拉','刺身','生冷'].some(k => textBlob.includes(k));
    const spicy = ['spicy','chili','hotpot','mala','curry','tomyam','sambal','辣','麻辣','火锅','冬阴功'].some(k => textBlob.includes(k));
    const caffeine = ['coffee','caffeine','espresso','latte','美式','咖啡','拿铁','浓缩'].some(k => textBlob.includes(k));
    const foodFlags = [];
    if(cold) foodFlags.push(isZh ? '生冷饮品/食物' : 'cold food or drinks');
    if(spicy) foodFlags.push(isZh ? '辛辣食物' : 'spicy food');
    if(caffeine) foodFlags.push(isZh ? '咖啡因饮品' : 'caffeinated drinks');
    const painText = dayHealthLog ? periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh) : (isZh ? '未记录' : 'not logged');
    const symptomText = displaySymptoms.length ? displaySymptoms.join(', ') : (isZh ? '未记录' : 'none logged');
    const statusLine = isZh
      ? `你在 ${dateStr} 处于${phaseLabel}（周期第 ${cycleDay} 天）。痛感为 ${painText}，症状：${symptomText}。`
      : `On ${dateStr}, you are in the ${phaseLabel} (cycle day ${cycleDay}). Pain: ${painText}; symptoms: ${symptomText}.`;
    const foodLine = foodItems.length
      ? (isZh ? `当天记录的食物/饮品：${foodText}。` : `Food/drinks recorded: ${foodText}.`)
      : (isZh ? '当天还没有记录食物或饮品。' : 'No food or drinks were recorded for this day.');
    const flagLine = foodFlags.length
      ? (isZh ? `可留意${foodFlags.join('、')}与不适是否同时出现；这只是可能的关联，不代表确定原因。` : `Notice whether ${foodFlags.join(', ')} appear alongside discomfort; this is only a possible association, not a confirmed cause.`)
      : (isZh ? '目前没有发现明显的饮食标记。' : 'No obvious dietary flags were detected.');
    const advice = isZh
      ? '建议：补充水分并休息；记录痛感变化与饮食；若疼痛剧烈、持续或伴随异常出血，请咨询医生。'
      : 'Suggestions: hydrate and rest; keep logging pain and food; seek medical advice for severe, persistent pain or unusual bleeding.';
    insightEl.innerHTML = `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.28);border-radius:9px;padding:8px;line-height:1.55"><strong style="color:#0891b2">✨ ${isZh ? '本地 AI 本日分析' : 'On-device AI Daily Analysis'}</strong><div style="margin-top:5px">${esc(statusLine)}<br>${esc(foodLine)}<br>${esc(flagLine)}<br><br>💡 ${esc(advice)}<br><span style="font-size:9.5px;color:var(--muted)">${isZh ? '参考经期记录与消费数据生成，仅供一般信息参考。' : 'Based on your period log and spending data; for general information only.'}</span></div></div>`;
  }

  if(btn){
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.textContent = t('period_analyze_day', isZh ? 'AI 分析本日' : 'Analyze with AI');
  }
}

function selectPeriodCalDay(dateStr, cycleDay, periodDays, cycleDays, openInspector = false){
  // Hide single-tap card if double-tapped
  const singleCard = el('period-single-tap-inspector-card');
  if(singleCard) singleCard.classList.add('hidden');

  selectedPeriodInspectorDateStr = dateStr;
  const dateStrEl = el('period-inspector-date-str');
  const badgeEl = el('period-inspector-phase-badge');

  if(dateStrEl) dateStrEl.textContent = fmtDate(dateStr);

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(badgeEl){
    if(cycleDay <= periodDays){
      badgeEl.textContent = isZh ? `经期第 ${cycleDay} 天` : `Period Day ${cycleDay}`;
      badgeEl.style.background = '#ec4899';
    } else if(cycleDay >= (cycleDays - 16) && cycleDay <= (cycleDays - 10)){
      badgeEl.textContent = isZh ? `排卵期 / 易孕期` : `Fertile Window`;
      badgeEl.style.background = '#8b5cf6';
    } else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0){
      badgeEl.textContent = isZh ? `经前倒计时` : `PMS Warning`;
      badgeEl.style.background = '#f59e0b';
    } else {
      badgeEl.textContent = isZh ? `安全期` : `Safe Period`;
      badgeEl.style.background = '#10b981';
    }
  }

  // Start each date editor with a clean expense entry for the newly selected day.
  const expenseAmtInp = el('cal-inspector-expense-amt');
  const expenseDescInp = el('cal-inspector-expense-desc');
  const expenseKindInp = el('cal-inspector-expense-kind');
  if(expenseAmtInp) expenseAmtInp.value = '';
  if(expenseDescInp) expenseDescInp.value = '';
  if(expenseKindInp) expenseKindInp.value = 'care';

  // Pre-load saved symptoms for this date if existing!
  const existingLog = S.periodTracker && S.periodTracker.history ? S.periodTracker.history.find(h => h.startDate === dateStr) : null;
  if(existingLog){
    selectPeriodFlow(existingLog.flow || 'medium');
    selectPeriodPain(existingLog.pain || 'none');
    currentSelectedSymptoms = Array.isArray(existingLog.symptoms) ? [...existingLog.symptoms] : [];
    document.querySelectorAll('.period-sym-btn').forEach(btn => {
      btn.classList.toggle('on', currentSelectedSymptoms.includes(btn.dataset.sym));
    });
  } else {
    selectPeriodFlow('medium');
    selectPeriodPain('none');
    currentSelectedSymptoms = [];
    document.querySelectorAll('.period-sym-btn').forEach(btn => {
      btn.classList.remove('on');
    });
  }

  if(openInspector){
    openModal('period-date-care-modal');
  }
}

function setPeriodStartForSelectedDate(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const selDate = selectedPeriodInspectorDateStr || today();
  S.periodTracker.lastPeriodDate = selDate;
  S.periodTracker.hasSetFirstDate = true;
  if(!Array.isArray(S.periodTracker.history)) S.periodTracker.history = [];
  const existing = S.periodTracker.history.find(h => h && normalizeDateStr(h.startDate) === selDate);
  if(existing){
    existing.note = isZh ? '手动设定开潮日' : 'Manual Period Start';
  } else {
    S.periodTracker.history.unshift({ startDate: selDate, endDate: null, note: isZh ? '手动设定开潮日' : 'Manual Period Start' });
  }
  save();
  renderPeriodTrackerUI();
  if(!el('period-single-tap-inspector-card')?.classList.contains('hidden')){
    openDailyExpensesAndAiDietaryInspector(selDate);
  }
  closeModal('period-date-care-modal');
  toast(isZh ? `🩸 已将 ${fmtDate(selDate)} 设为经期第一天！` : `🩸 Set ${fmtDate(selDate)} as Period Start!`);
}

function setPeriodEndForSelectedDate(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const selDate = selectedPeriodInspectorDateStr || today();
  if(!Array.isArray(S.periodTracker.history)) S.periodTracker.history = [];
  let target = S.periodTracker.history.find(h => h && normalizeDateStr(h.startDate) === selDate);
  if(!target){
    // Find closest cycle starting on or before selDate
    target = S.periodTracker.history.find(h => h && normalizeDateStr(h.startDate) <= selDate);
  }
  if(target){
    target.endDate = selDate;
  } else {
    S.periodTracker.history.unshift({ startDate: selDate, endDate: selDate, note: isZh ? '经期结束日' : 'Period End' });
  }
  save();
  renderPeriodTrackerUI();
  if(!el('period-single-tap-inspector-card')?.classList.contains('hidden')){
    openDailyExpensesAndAiDietaryInspector(selDate);
  }
  closeModal('period-date-care-modal');
  toast(isZh ? `✅ 已将 ${fmtDate(selDate)} 设为经期结束日！` : `✅ Set ${fmtDate(selDate)} as Period End!`);
}

function savePeriodExpenseForSelectedDate(){
  const amtInp = el('cal-inspector-expense-amt');
  const descInp = el('cal-inspector-expense-desc');
  const kindInp = el('cal-inspector-expense-kind');
  if(!amtInp) return;
  const amt = parseFloat(amtInp.value);
  const desc = descInp ? descInp.value.trim() : '';
  const entryKind = kindInp && kindInp.value === 'food' ? 'food' : 'care';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!amt || amt <= 0){
    toast(isZh ? '⚠️ 请输入有效金额' : '⚠️ Enter a valid amount');
    return;
  }

  if(!desc){
    if(descInp) descInp.focus();
    toast(isZh ? '⚠️ 请先填写用品、食物或饮品名称' : '⚠️ Add an item or food description first');
    return;
  }

  const selDate = selectedPeriodInspectorDateStr || today();
  const accId = getActiveAccountId();

  // If the app has no wallet yet, hand the user to the normal expense form
  // instead of creating a record that cannot be attached to an account.
  if(!accId){
    closeModal('period-date-care-modal');
    openTxModal('expense');
    if(el('tx-date')) el('tx-date').value = selDate;
    if(el('tx-amount')) el('tx-amount').value = amt.toFixed(2);
    if(el('tx-desc')) el('tx-desc').value = desc;
    selCat = entryKind === 'food' ? 'food' : 'period_care';
    selSubCat = entryKind === 'food' ? 'food_restaurant' : 'period_sanitary_pads';
    buildCats('tx-cats', 'expense', id => selCat = id);
    toast(isZh ? '请先选择一个账户，再保存这笔记录' : 'Choose an account, then save this entry');
    return;
  }

  let finalCat = entryKind === 'food' ? 'food' : 'period_care';
  let finalSubCat = entryKind === 'food' ? 'food_restaurant' : 'period_sanitary_pads';
  if(entryKind === 'care'){
    const smart = smartAutoDetectCategoryAndPayment(desc);
    if(smart && smart.detectedCat === 'period_care' && smart.detectedSubCat){
      finalSubCat = smart.detectedSubCat;
    }
  }

  const newTx = {
    id: uid('item'),
    type: 'expense',
    amount: amt,
    desc,
    category: finalCat,
    subCategory: finalSubCat,
    date: selDate,
    accountId: accId,
    paymentMethod: 'Cash',
    note: `${entryKind === 'food' ? 'Food/drink' : 'Period care'} logged via Calendar Inspector for ${selDate}`,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(newTx);
  S.lastUsedAccId = accId;
  save();
  amtInp.value = '';
  if(descInp) descInp.value = '';
  closeModal('period-date-care-modal');
  toast(isZh ? `✅ 已记入 ${fmtDate(selDate)}：${desc} · RM ${amt.toFixed(2)}！` : `✅ Logged ${desc} · ${fmt(amt)} for ${fmtDate(selDate)}!`);
  // Close and confirm first so a rendering issue cannot make a successful save
  // look like a failed button press.
  try {
    renderAll();
    renderPeriodTrackerUI();
    if(!el('period-single-tap-inspector-card')?.classList.contains('hidden')){
      openDailyExpensesAndAiDietaryInspector(selDate);
    }
  } catch(e) {
    console.warn('Period expense saved but UI refresh failed:', e);
  }
}
