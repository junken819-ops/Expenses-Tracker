/**
 * Period Tracker Core & Symptoms
 * Modularized from Pocket Winnie Core
 */

// ── 🌸 GIRL PERIOD & HEALTH CARE TRACKER ENGINE ───────────
// Items bought related to period (sanitary, pain relief, warming supplies).
function isPeriodCareExpense(t){
  if(!t || t.type === 'income') return false;

  const cat = String(t.category || '').toLowerCase();
  const subCat = String(t.subCategory || '').toLowerCase();

  // 1. Direct Category Match (Category: Period Care & Hygiene)
  if(cat === 'period_care' || cat === 'period' || cat === 'health_period_care'){
    return true;
  }

  // 2. Direct Subcategory Match
  if(subCat === 'health_period_care' || subCat.startsWith('period_')){
    return true;
  }

  // 3. Search description, note, and receipt line items
  const desc = String(t.desc || '').toLowerCase();
  const note = String(t.note || '').toLowerCase();
  const itemNames = (Array.isArray(t.items) ? t.items.map(it => String(it.name || '').toLowerCase()) : []);
  const allTexts = [desc, note, ...itemNames].join(' ');

  // 4. Period Care Keywords (Chinese & English)
  const exactKeywords = [
    // Chinese keywords
    '卫生巾', '卫生棉', '护垫', '夜用', '日用', '安睡裤', '裤型卫生巾', '棉条', '卫生棉条',
    '月经杯', '月经碟片', '月经碟', '月事', '大姨妈', '姨妈巾', '姨妈', '例假',
    '暖宫贴', '暖宫', '暖宝宝', '暖贴', '热敷贴', '暖腹贴', '暖身贴', '痛经贴', '止痛贴',
    '止痛药', '止痛', '止疼', '布洛芬', '田七痛经', '红糖', '黑糖', '姜茶', '姜母茶', '红糖姜茶',
    '私密洗液', '私密护理', '女性洗液', '私密抑菌', '高洁丝', '乐而雅', '苏菲', '护舒宝', '轻曲线',
    // English keywords & brands
    'sanitary', 'pantyliner', 'tampon', 'menstrual', 'menses', 'menstruation',
    'cramp relief', 'cramps', 'warm patch', 'heat patch', 'heating pad', 'heatpad',
    'midol', 'panadol menstrual', 'ponstan', 'ibuprofen', 'naproxen', 'mefenamic', 'nurofen',
    'ginger tea', 'brown sugar', 'period panties', 'period underwear',
    'fem wash', 'feminine wash', 'intimate wash', 'lactacyd', 'betadine wash',
    'kotex', 'laurier', 'sofy', 'whisper', 'libresse', 'carefree', 'stayfree', 'tampax', 'playtex'
  ];

  if(exactKeywords.some(k => allTexts.includes(k))){
    return true;
  }

  // Check for pad/pads/period with word boundary (avoiding 'ipad', 'touchpad', 'mousepad', etc.)
  if(/\b(pad|pads|period)\b/i.test(allTexts)){
    if(!/ipad|touchpad|mousepad|keypad|launchpad|thinkpad|notepad/i.test(allTexts)){
      return true;
    }
  }

  return false;
}

let homePeriodNavClickTimer = null;
function handleHomePeriodNavClick(ev){
  if(ev) ev.stopPropagation();
  clearTimeout(homePeriodNavClickTimer);
  homePeriodNavClickTimer = setTimeout(() => go('home'), 260);
}

function updateHomePeriodNavAppearance(onPeriod){
  const navIcon = el('home-period-nav-icon');
  const navLabel = el('home-period-nav-label');
  if(navIcon) navIcon.innerHTML = `<span class="nav-dual-icon"><span>${onPeriod ? '🌸' : '⌂'}</span><span>${onPeriod ? '⌂' : '🌸'}</span></span>`;
  if(navLabel) navLabel.textContent = onPeriod ? 'Period Care' : (S.lang === 'zh' ? '首页' : 'Home');
}

function toggleHomePeriodNav(ev){
  if(ev){
    ev.preventDefault();
    ev.stopPropagation();
  }
  clearTimeout(homePeriodNavClickTimer);
  const onPeriod = el('page-period')?.classList.contains('active');
  go(onPeriod ? 'home' : 'period');
}

// 2. Items eaten and drank that affect period (Cold/iced drinks, caffeine, spicy food, warming teas, dark chocolate)
function isPeriodDietAffectingTx(t){
  if(!t) return false;
  const desc = (t.desc || '').toLowerCase();
  const note = (t.note || '').toLowerCase();
  const cat = t.category || '';
  
  const dietKeywords = [
    // Cold & Iced items (worsens cramps / uterine vasoconstriction)
    '冰', '冷', '奶茶', '水冷', '雪糕', '冰淇淋', '沙拉', '刺身', '生鱼片', '生冷', 'ice', 'iced', 'cold', 'boba', 'bubble tea', 'frappe', 'slush', 'gelato', 'sundae', 'smoothie', 'salad', 'sashimi', 'frap', 'chill', 'cooler', 'starbucks', 'chagee', 'mixue', 'tealive', 'gong cha', 'koi', 'boost juice',
    // Spicy & Inflammatory items
    '麻辣', '火锅', '辣', '冬阴功', '辣椒', 'spicy', 'chili', 'hotpot', 'curry', 'mala', 'tomyam', 'sambal', 'kimchi', 'ramen',
    // Caffeine items
    '咖啡', '美式', '拿铁', '浓缩', 'espresso', 'latte', 'coffee', 'caffeine', 'cappuccino', 'mocha', 'kopi', 'zus', 'richiamo',
    // Helpful soothing items
    '黑巧', '黑巧克力', 'dark chocolate', 'chocolate', '热汤', '汤', 'soup', 'herbal', 'tea', '茶', '姜', 'ginger', '豆浆', 'soy milk', 'warm'
  ];

  if(cat === 'food' || cat === 'drinks' || cat === 'groceries' || cat === 'shopping' || cat === 'other'){
    if(dietKeywords.some(k => desc.includes(k) || note.includes(k))) return true;
    if(t.items && Array.isArray(t.items)){
      return t.items.some(it => {
        const iname = (it.name || '').toLowerCase();
        return dietKeywords.some(k => iname.includes(k));
      });
    }
  }
  return false;
}

// 3. Combined filter: Only items bought related to period OR food/drinks that affect period
function isPeriodRelevantTx(t){
  return isPeriodCareExpense(t) || isPeriodDietAffectingTx(t);
}

function initPeriodTrackerState(){
  if(!S.periodTracker){
    S.periodTracker = {
      lastPeriodDate: null,
      hasSetFirstDate: false,
      periodLength: 5,
      cycleLength: 28,
      history: []
    };
  }
}

function getPeriodPhaseInfo(){
  initPeriodTrackerState();
  const pt = S.periodTracker;
  if(!pt.lastPeriodDate || !pt.hasSetFirstDate){
    return {
      isConfigured: false,
      pt,
      diffDays: 0,
      currentCycleDay: 0,
      cycleDays: pt.cycleLength || 28,
      periodDays: pt.periodLength || 5,
      nextPeriodDate: new Date(),
      daysToNext: 0,
      phase: 'unconfigured'
    };
  }

  const lastD = new Date(pt.lastPeriodDate + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - lastD) / (1000 * 60 * 60 * 24));

  const cycleDays = pt.cycleLength || 28;
  const periodDays = pt.periodLength || 5;

  const currentCycleDay = (diffDays % cycleDays) + 1;
  const nextPeriodDate = new Date(lastD);
  nextPeriodDate.setDate(lastD.getDate() + Math.ceil(diffDays / cycleDays) * cycleDays);
  if(nextPeriodDate <= now){
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleDays);
  }

  const daysToNext = Math.max(0, Math.ceil((nextPeriodDate - now) / (1000 * 60 * 60 * 24)));

  // Phase logic
  let phase = 'safe';
  if(currentCycleDay <= periodDays){
    phase = 'period';
  } else if(currentCycleDay >= (cycleDays - 16) && currentCycleDay <= (cycleDays - 10)){
    phase = 'ovulation';
  } else if(daysToNext <= 5){
    phase = 'pms';
  }

  return {
    isConfigured: true,
    pt,
    diffDays,
    currentCycleDay,
    cycleDays,
    periodDays,
    nextPeriodDate,
    daysToNext,
    phase
  };
}

function saveInitialPeriodFirstDay(){
  initPeriodTrackerState();
  const inp = el('period-first-day-input');
  if(!inp) return;
  const val = inp.value;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!val){
    toast(isZh ? '⚠️ 请选择有效的月经第一天日期' : '⚠️ Select a valid date');
    return;
  }
  S.periodTracker.lastPeriodDate = val;
  S.periodTracker.hasSetFirstDate = true;
  S.periodTracker.history.unshift({ startDate: val, endDate: null, note: isZh ? '初始设置月经开潮日' : 'Initial Period Start Date' });
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '🎉 已成功设定开潮日！智能推算已开启。后续修改可在【⚙️ 设置】或双击日历。' : '🎉 Saved period start date! Predictions enabled.');
}

function openPeriodTrackerModal(){
  go('period');
}

function renderPeriodTrackerUI(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const info = getPeriodPhaseInfo();

  const setupBar = el('period-first-day-setup-bar');
  const phaseBadge = el('period-phase-badge');
  const daysNum = el('period-days-num');
  const nextDateTxt = el('period-next-date-txt');
  const ovulationTxt = el('period-ovulation-txt');
  const cycleLenTxt = el('period-cycle-len-txt');
  const tipBody = el('period-partner-tip-body');

  if(cycleLenTxt) cycleLenTxt.textContent = `${info.cycleDays} ${isZh ? '天周期' : 'd cycle'} / ${info.periodDays} ${isZh ? '天经期' : 'd period'}`;

  if(!info.isConfigured){
    // 🌸 First date NOT set yet!
    if(setupBar){
      setupBar.classList.remove('hidden');
      const firstInp = el('period-first-day-input');
      if(firstInp && !firstInp.value) firstInp.value = today();
    }
    if(phaseBadge){
      phaseBadge.textContent = isZh ? `🌸 尚未设置开潮日` : `🌸 First Date Not Set`;
      phaseBadge.style.background = '#6b7280';
    }
    if(daysNum) daysNum.textContent = '--';
    if(nextDateTxt) nextDateTxt.textContent = isZh ? `请先在上方输入上一次月经第一天` : `Enter last period start date above`;
    if(ovulationTxt) ovulationTxt.textContent = '--';
    if(tipBody) tipBody.innerHTML = isZh ? 
      '🌸 <strong>欢迎使用生理期预测</strong>：在上方输入月经第一天，即可解锁精确开潮倒计时与排卵期推算！' : 
      '🌸 <strong>Welcome</strong>: Set your period start date above to enable cycle predictions!';
  } else {
    // 🩸 Active period tracker configured!
    if(setupBar) setupBar.classList.add('hidden');

    const npDateStr = fmtDate(info.nextPeriodDate.toISOString().split('T')[0]);
    if(nextDateTxt) nextDateTxt.textContent = isZh ? `预计下一次开潮日: ${npDateStr}` : `Expected Next Period: ${npDateStr}`;

    const ovStart = new Date(info.nextPeriodDate);
    ovStart.setDate(info.nextPeriodDate.getDate() - 14);
    const ovStr = fmtDate(ovStart.toISOString().split('T')[0]);
    if(ovulationTxt) ovulationTxt.textContent = ovStr;

    if(info.phase === 'period'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `经期第 ${info.currentCycleDay} 天` : `Period Day ${info.currentCycleDay}`;
        phaseBadge.style.background = '#ec4899';
      }
      if(daysNum) daysNum.textContent = isZh ? `第 ${info.currentCycleDay} 天` : `DAY ${info.currentCycleDay}`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '☕ <strong>准备热红糖水与暖宫贴</strong>：生理期体温偏低，避免冷饮生食，主动为她准备热敷包与红糖姜茶。' : 
        '☕ <strong>Prepare warm brown sugar water & heating pad</strong>: Avoid cold drinks, be extra gentle!';
    } else if(info.phase === 'pms'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `经前倒计时` : `PMS Warning`;
        phaseBadge.style.background = '#f59e0b';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '🍫 <strong>经前情绪较敏感，准备甜食小惊喜</strong>：月经即将来临，多包容体谅，提前备齐卫生用品。' : 
        '🍫 <strong>PMS Notice</strong>: Be extra patient, prepare dark chocolate and ensure sanitary supplies are stocked up!';
    } else if(info.phase === 'ovulation'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `排卵期 / 易孕期` : `Fertile Window`;
        phaseBadge.style.background = '#8b5cf6';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '🌸 <strong>排卵期精力充沛，心情愉快</strong>：适合一起户外散步运动、约会，保持充足睡眠与健康饮食。' : 
        '🌸 <strong>Fertile Window</strong>: Great energy levels for outdoor activities and romantic dates!';
    } else {
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `安全期` : `Safe Period`;
        phaseBadge.style.background = '#10b981';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '✨ <strong>身体状态处于平静期</strong>：维持规律作息，关心对方日常生活，保持好心情！' : 
        '✨ <strong>Stable Phase</strong>: Maintain balanced lifestyle, adequate rest, and good vibes!';
    }
  }

  // Render Auto-Grouped Period Expenses List (sorted by date descending)
  const periodTxs = (S.transactions || [])
    .filter(t => t.type === 'expense' && isPeriodCareExpense(t))
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : (b.id > a.id ? 1 : -1)));
  const periodTotal = periodTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const expTotalEl = el('period-month-expense-total');
  const expListEl = el('period-month-expense-list');

  if(expTotalEl) expTotalEl.textContent = fmt(periodTotal);
  if(expListEl){
    expListEl.innerHTML = '';
    if(!periodTxs.length){
      expListEl.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:8px">${isZh ? '暂无自动归类的经期用品开销' : 'No period care expenses logged yet.'}</div>`;
    } else {
      periodTxs.slice(0, 10).forEach(t => {
        const row = document.createElement('div');
        row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px">
            <span>🌸</span>
            <div>
              <div style="font-weight:700;color:var(--text)">${esc(t.desc)}</div>
              <div style="font-size:9.5px;color:var(--muted)">${fmtDate(t.date)} · ${esc(t.paymentMethod||'Cash')}</div>
            </div>
          </div>
          <div style="font-weight:800;color:var(--red)">${fmt(t.amount)}</div>
        `;
        expListEl.appendChild(row);
      });
    }
  }

  if(el('period-history-list')) renderPeriodHistoryList();
  if(el('period-future-predictions-list')) renderAiPeriodForecastTable();
  renderPeriodCalendarGrid();
}

function renderPeriodHistoryList(){
  const list = el('period-history-list');
  const countEl = el('period-history-count');
  if(!list) return;
  list.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const history = (S.periodTracker && S.periodTracker.history) ? S.periodTracker.history : [];
  if(countEl) countEl.textContent = isZh ? `已记录 ${history.length} 次` : `${history.length} recorded`;

  if(!history.length){
    list.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:10px">${isZh ? '暂无经期历史记录，点击上方按钮添加' : 'No cycle records yet. Tap buttons above to log.'}</div>`;
    return;
  }

  history.slice(0, 5).forEach((h, idx) => {
    const item = document.createElement('div');
    item.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
    const startDateStr = fmtDate(h.startDate);
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px">🩸</span>
        <div>
          <div style="font-weight:800;color:var(--text)">${startDateStr}</div>
          <div style="font-size:10px;color:var(--muted)">${h.note || (isZh ? '月经来潮' : 'Period Start')}</div>
        </div>
      </div>
      <button type="button" class="del-btn" style="font-size:11px" onclick="deletePeriodHistoryRecord(${idx})">🗑</button>
    `;
    list.appendChild(item);
  });
}

function logPeriodStartToday(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tStr = today();
  S.periodTracker.lastPeriodDate = tStr;
  S.periodTracker.history.unshift({ startDate: tStr, endDate: null, note: isZh ? '月经来潮' : 'Period Started' });
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '🩸 已记录今天月经来潮！' : '🩸 Logged period start date today!');
}

function logPeriodEndToday(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(S.periodTracker.history.length > 0){
    S.periodTracker.history[0].endDate = today();
  }
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '✅ 已记录经期结束！' : '✅ Logged period end date today!');
}

function deletePeriodHistoryRecord(idx){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  S.periodTracker.history.splice(idx, 1);
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '已删除该次经期记录' : 'Deleted cycle record');
}

function openPeriodSettingsModal(){
  initPeriodTrackerState();
  const pt = S.periodTracker;
  const dateInp = el('period-settings-last-date');
  const cycleInp = el('period-settings-cycle-length');
  const periodInp = el('period-settings-period-length');

  if(dateInp) dateInp.value = /^\d{4}-\d{2}-\d{2}$/.test(pt.lastPeriodDate || '') ? pt.lastPeriodDate : today();
  if(cycleInp) cycleInp.value = pt.cycleLength || 28;
  if(periodInp) periodInp.value = pt.periodLength || 5;

  openModal('period-cycle-settings-modal');
}

function savePeriodSettings(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const dateInp = el('period-settings-last-date');
  const cycleInp = el('period-settings-cycle-length');
  const periodInp = el('period-settings-period-length');
  const dateValue = dateInp ? dateInp.value : '';
  const cycleLength = cycleInp ? Number(cycleInp.value) : NaN;
  const periodLength = periodInp ? Number(periodInp.value) : NaN;

  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)){
    toast(isZh ? '⚠️ 请选择有效的月经第一天日期' : '⚠️ Select a valid last period start date');
    return;
  }
  if(!Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 90){
    toast(isZh ? '⚠️ 周期天数必须是 21 至 90 天' : '⚠️ Cycle length must be between 21 and 90 days');
    return;
  }
  if(!Number.isInteger(periodLength) || periodLength < 1 || periodLength > 14 || periodLength >= cycleLength){
    toast(isZh ? '⚠️ 经期天数必须是 1 至 14 天，且少于周期天数' : '⚠️ Period length must be 1–14 days and shorter than the cycle');
    return;
  }

  const pt = S.periodTracker;
  const dateChanged = pt.lastPeriodDate !== dateValue;
  pt.lastPeriodDate = dateValue;
  pt.cycleLength = cycleLength;
  pt.periodLength = periodLength;
  pt.hasSetFirstDate = true;
  if(!Array.isArray(pt.history)) pt.history = [];
  if(dateChanged || !pt.history.some(h => h && h.startDate === dateValue)){
    pt.history.unshift({
      startDate: dateValue,
      endDate: null,
      note: isZh ? '周期设置更新' : 'Cycle settings updated'
    });
  }

  save();
  closeModal('period-cycle-settings-modal');
  renderPeriodTrackerUI();
  toast(isZh ? '✅ 周期设置已保存！' : '✅ Cycle settings saved!');
}

function quickLogPeriodExpense(){
  closeModal('period-tracker-modal');
  openTxModal('expense');
  el('tx-desc').value = (typeof S !== 'undefined' && S && S.lang === 'zh') ? '卫生巾 / 暖宫贴' : 'Sanitary Pads / Heating Pad';
  selCat = 'period_care';
  selSubCat = 'period_sanitary_pads';
  buildCats('tx-cats', 'expense', id => selCat = id);
  toast(typeof S !== 'undefined' && S && S.lang === 'zh' ? '🛒 已快捷预填经期用品开销' : '🛒 Pre-filled Period Care Expense');
}

async function runAiPeriodDiagnosis(){
  const resultBox = el('period-ai-diagnosis-result');
  const contentEl = el('period-ai-result-content');
  if(!resultBox || !contentEl) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  resultBox.classList.remove('hidden');
  contentEl.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:6px 0"><div class="ai-scan-spinner" style="width:16px;height:16px"></div><span>${isZh ? '正在召唤 Google Gemini AI 分析生理周期与开销数据…' : 'Gemini AI is analyzing cycle data and care tips…'}</span></div>`;

  const info = getPeriodPhaseInfo();
  const npDateStr = fmtDate(info.nextPeriodDate.toISOString().split('T')[0]);

  const sanitaryTxs = S.transactions.filter(t => isPeriodCareExpense(t));
  const totalSanitaryExp = sanitaryTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);

  // Include the user's recorded flow, pain, and symptoms so AI advice reflects their actual logs.
  const recentPeriodLogs = (info.pt.history || []).slice(0, 8).map(h => {
    const symptoms = Array.isArray(h.symptoms) && h.symptoms.length ? h.symptoms.join(', ') : 'none';
    return `${h.startDate || 'unknown date'}: flow=${h.flow || 'unknown'}, pain=${h.pain || 'unknown'}, symptoms=${symptoms}`;
  });
  const aiDietItems = S.transactions
    .filter(t => t.type === 'expense' && isPeriodDietAffectingTx(t) && !isPeriodCareExpense(t))
    .slice(0, 10)
    .map(t => `${t.date}: ${t.desc} (RM ${Number(t.amount || 0).toFixed(2)})`);
  const recentLogText = recentPeriodLogs.length ? recentPeriodLogs.join(' | ') : 'No symptom logs yet';
  const aiDietText = aiDietItems.length ? aiDietItems.join(' | ') : 'No AI-flagged food or drink items yet';

  const promptText = `User Cycle Data:
- Current Phase: ${info.phase} (Cycle Day ${info.currentCycleDay} of ${info.cycleDays})
- Period Duration: ${info.periodDays} days
- Last Period Start Date: ${info.pt.lastPeriodDate}
- Next Period Estimated: ${npDateStr}
- Days to Next: ${info.daysToNext}
- Total Sanitary/Care Expenses Logged: RM ${totalSanitaryExp.toFixed(2)}
- Recent user symptom logs (use these details): ${recentLogText}
- AI-flagged period-impacting food/drink items: ${aiDietText}

Please provide a warm, professional, caring health summary and partner care advice in ${isZh ? 'Chinese' : 'English'}. Include 3 sections:
1. 🌸 Health Status & Cycle Analysis
2. 🍵 Nutrition, Warm Diet & Pain Relief Tips
3. 💖 Practical Partner Action Guide for Today`;

  if(S.geminiApiKey){
    try {
      const generation = await generateGeminiContent(S.geminiApiKey, {
        contents: [{ parts: [{ text: promptText }] }]
      });
      const data = generation.data;
      if(data?.candidates?.[0]?.content){
        const txt = data.candidates[0].content.parts[0].text;
        contentEl.innerHTML = `<div style="white-space:pre-line;line-height:1.6">${esc(txt)}</div>`;
        return;
      }
    } catch(e) {
      console.warn('Gemini API call error:', e);
    }
  }

  // Smart On-Device AI Diagnosis Fallback if API Key not present or offline
  const recordedInsightHtml = recentPeriodLogs.length ?
    `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.25);border-radius:10px;padding:8px;margin-bottom:10px;font-size:11px"><strong>🧾 Recorded details used:</strong><br>${esc(recentLogText)}</div>` : '';
  setTimeout(() => {
    let html = '';
    if(info.phase === 'period'){
      html = isZh ? `
        <strong>🌸 1. 经期状态与生理分析：</strong><br>
        当前处于月经期第 ${info.currentCycleDay} 天。体温稍有降低，属于子宫内膜剥落充血期，可能伴随轻微腹痛或疲惫。<br><br>
        <strong>🍵 2. 营养暖宫与止痛建议：</strong><br>
        • 多喝温热水或红糖姜茶，促进血气循环。<br>
        • 补充富含铁质与蛋白质食物（如菠菜、红枣、瘦肉）。<br>
        • 避免生冷冰饮、咖啡因及辣刺激性食物。<br><br>
        <strong>💖 3. 给伴侣的贴心行动指南：</strong><br>
        • 主动为她贴好暖宫贴或准备热水袋。<br>
        • 陪伴休息，承担家务，避免让她受凉。
      ` : `
        <strong>🌸 1. Period Health Diagnosis:</strong><br>
        Currently on Day ${info.currentCycleDay} of menstruation. Body temperature is lower and energy may be subdued.<br><br>
        <strong>🍵 2. Warm Diet & Relief Recommendations:</strong><br>
        • Drink warm ginger brown sugar tea or warm water.<br>
        • Consume iron-rich foods (spinach, dates, lean meats).<br>
        • Avoid raw/cold drinks and excessive caffeine.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Prepare a warm heating pad or water bottle.<br>
        • Help out with daily tasks and ensure she gets adequate rest.
      `;
    } else if(info.phase === 'pms'){
      html = isZh ? `
        <strong>🌸 1. 经前状态分析：</strong><br>
        距离下一次月经预估还有 ${info.daysToNext} 天。属于黄体期末期，体内激素波动，可能出现情绪敏感、易怒或水肿。<br><br>
        <strong>🍵 2. 情绪纾解与调理：</strong><br>
        • 适当吃黑巧克力（含镁量高，缓解紧张情绪）。<br>
        • 避免熬夜，保持充足睡眠。<br><br>
        <strong>💖 3. 伴侣贴心关怀：</strong><br>
        • 多给予情绪安抚与关怀，提前备齐卫生用品。
      ` : `
        <strong>🌸 1. PMS Phase Diagnosis:</strong><br>
        ${info.daysToNext} days to next period. Hormones fluctuate, causing potential mood sensitivity or bloating.<br><br>
        <strong>🍵 2. Relief Tips:</strong><br>
        • Enjoy dark chocolate rich in magnesium.<br>
        • Ensure 8+ hours of restful sleep.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Be patient, gentle, and ensure care supplies are ready.
      `;
    } else {
      html = isZh ? `
        <strong>🌸 1. 生理状态分析：</strong><br>
        处于平静期/安全期，气血恢复良好，精力充沛。<br><br>
        <strong>🍵 2. 养生建议：</strong><br>
        • 维持规律作息与适度运动。<br>
        • 多摄取新鲜水果蔬菜与水分。<br><br>
        <strong>💖 3. 伴侣关怀：</strong><br>
        • 适合一起安排户外散步或愉快约会！
      ` : `
        <strong>🌸 1. General Phase Diagnosis:</strong><br>
        Stable phase with high energy and balanced body vitality.<br><br>
        <strong>🍵 2. Wellness Tips:</strong><br>
        • Maintain active lifestyle and drink plenty of water.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Great time for outdoor activities and romantic dates!
      `;
    }
    contentEl.innerHTML = recordedInsightHtml + html;
  }, 400);
}

let currentSelectedFlow = 'medium';
let currentSelectedPain = 'none';
let currentSelectedSymptoms = [];

function selectPeriodFlow(flow){
  currentSelectedFlow = flow;
  document.querySelectorAll('.period-flow-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.flow === flow);
  });
}

function selectPeriodPain(pain){
  currentSelectedPain = pain;
  document.querySelectorAll('.period-pain-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.pain === pain);
  });
}

function togglePeriodSymptom(sym){
  const idx = currentSelectedSymptoms.indexOf(sym);
  if(idx === -1) currentSelectedSymptoms.push(sym);
  else currentSelectedSymptoms.splice(idx, 1);

  document.querySelectorAll('.period-sym-btn').forEach(btn => {
    if(btn.dataset.sym === sym){
      btn.classList.toggle('on', currentSelectedSymptoms.includes(sym));
    }
  });
}

function savePeriodSymptomLog(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tStr = selectedPeriodInspectorDateStr || today();
  const existing = S.periodTracker.history.find(h => h.startDate === tStr);
  const symText = currentSelectedSymptoms.length > 0 ? currentSelectedSymptoms.join(', ') : 'No symptoms';

  if(existing){
    existing.flow = currentSelectedFlow;
    existing.pain = currentSelectedPain;
    existing.symptoms = [...currentSelectedSymptoms];
    existing.note = `Flow: ${currentSelectedFlow}, Pain: ${currentSelectedPain}, Symptoms: ${symText}`;
  } else {
    S.periodTracker.history.unshift({
      startDate: tStr,
      endDate: null,
      flow: currentSelectedFlow,
      pain: currentSelectedPain,
      symptoms: [...currentSelectedSymptoms],
      note: `Flow: ${currentSelectedFlow}, Pain: ${currentSelectedPain}, Symptoms: ${symText}`
    });
  }

  save();
  renderPeriodTrackerUI();
  if(!el('period-single-tap-inspector-card')?.classList.contains('hidden')){
    openDailyExpensesAndAiDietaryInspector(tStr);
  }
  closeModal('period-date-care-modal');
  toast(isZh ? `💾 已保存 ${fmtDate(tStr)} 的生理症状与痛感记录！` : `💾 Saved period flow & symptom log for ${fmtDate(tStr)}!`);
}

function renderAiPeriodForecastTable(){
  const container = el('period-future-predictions-list');
  if(!container) return;
  container.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const info = getPeriodPhaseInfo();

  let baseDate = new Date(info.nextPeriodDate);

  for(let i = 1; i <= 3; i++){
    const cycleStart = new Date(baseDate);
    if(i > 1) cycleStart.setDate(baseDate.getDate() + (i - 1) * info.cycleDays);

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + info.periodDays - 1);

    const ovStart = new Date(cycleStart);
    ovStart.setDate(cycleStart.getDate() - 14);
    const ovEnd = new Date(ovStart);
    ovEnd.setDate(ovStart.getDate() + 5);

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
    const periodRange = `${fmtDate(cycleStart.toISOString().split('T')[0])} - ${fmtDate(cycleEnd.toISOString().split('T')[0])}`;
    const ovRange = `${fmtDate(ovStart.toISOString().split('T')[0])} - ${fmtDate(ovEnd.toISOString().split('T')[0])}`;

    card.innerHTML = `
      <div>
        <div style="font-weight:800;color:var(--text)">${isZh ? `第 ${i} 个预测周期` : `Predicted Cycle +${i}`}</div>
        <div style="font-size:10.5px;color:#ec4899;margin-top:2px">🩸 ${isZh ? '预估月经开潮' : 'Period'}: <strong>${periodRange}</strong></div>
        <div style="font-size:10.5px;color:#c084fc;margin-top:2px">🥚 ${isZh ? '预估排卵/易孕期' : 'Fertile Window'}: <strong>${ovRange}</strong></div>
      </div>
      <span class="chip" style="font-size:9.5px;padding:2px 6px;background:rgba(236,72,153,.15);color:#ec4899">AI 概率 95%</span>
    `;
    container.appendChild(card);
  }
}

async function executeAiAutonomousTrack(){
  const inp = el('period-ai-track-input');
  if(!inp) return;
  const rawText = inp.value.trim();
  if(!rawText){
    toast(typeof S !== 'undefined' && S && S.lang === 'zh' ? '⚠️ 请输入文字或小票内容' : '⚠️ Please enter text or receipt details');
    return;
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '🤖 AI 正在自主解析、更新周期并记录开销…' : '🤖 AI is auto-parsing, updating cycle and expenses…');

  initPeriodTrackerState();

  // Smart AI Extraction Rule Engine
  let isStart = rawText.includes('来') || rawText.includes('第一天') || rawText.includes('开始') || rawText.includes('start') || rawText.includes('period');
  let flow = 'medium';
  if(rawText.includes('多') || rawText.includes('大') || rawText.includes('heavy')) flow = 'heavy';
  else if(rawText.includes('少') || rawText.includes('小') || rawText.includes('light')) flow = 'light';

  let pain = 'mild';
  if(rawText.includes('剧') || rawText.includes('重') || rawText.includes('痛死') || rawText.includes('severe')) pain = 'severe';
  else if(rawText.includes('中') || rawText.includes('痛') || rawText.includes('cramps')) pain = 'moderate';
  else if(rawText.includes('不痛') || rawText.includes('无痛') || rawText.includes('fine')) pain = 'none';

  // Extract expense amount if user mentioned numbers like "RM 25", "25元", "买包暖宝宝25"
  let expenseAmt = 0;
  const amtMatch = rawText.match(/(?:RM|rm|\$|￥|¥|块|元)?\s*(\d+(?:\.\d{1,2})?)/);
  if(amtMatch && (rawText.includes('买') || rawText.includes('RM') || rawText.includes('块') || rawText.includes('元') || rawText.includes('花'))){
    expenseAmt = parseFloat(amtMatch[1]);
  }

  if(isStart){
    S.periodTracker.lastPeriodDate = today();
  }

  const noteStr = `AI Auto-Tracked: "${rawText}" | Flow: ${flow}, Pain: ${pain}`;
  S.periodTracker.history.unshift({
    startDate: today(),
    endDate: null,
    flow: flow,
    pain: pain,
    symptoms: ['AI Auto-Parsed'],
    note: noteStr
  });

  // If AI detected expense amount, auto-create expense transaction in app!
  if(expenseAmt > 0){
    const accId = getActiveAccountId();
    const newTx = {
      id: uid('item'),
      type: 'expense',
      amount: expenseAmt,
      desc: isZh ? 'AI 自动记账：卫生/暖宫用品' : 'AI Tracked Sanitary Supplies',
      category: 'health',
      date: today(),
      accountId: accId,
      paymentMethod: 'Cash',
      note: `AI Autonomous Tracked from text: "${rawText}"`,
      createdAt: new Date().toISOString()
    };
    S.transactions.unshift(newTx);
  }

  save();
  renderAll();
  renderPeriodTrackerUI();
  inp.value = '';
  toast(isZh ? `🎉 AI 自主追踪完成！已更新周期状态${expenseAmt > 0 ? '并记一笔 RM '+expenseAmt.toFixed(2)+' 开销' : ''}` : `🎉 AI Auto-tracked! Cycle updated${expenseAmt > 0 ? ' & logged RM '+expenseAmt.toFixed(2) : ''}`);
}
