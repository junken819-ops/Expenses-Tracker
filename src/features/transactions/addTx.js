/**
 * Add & Edit Transaction Forms
 * Modularized from Pocket Winnie Core
 */

// ── ADD TRANSACTION (INCOME / EXPENSE) ─────────────────
const currentTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

function setTxCurrentTime(){
  if(el('tx-time')) el('tx-time').value = currentTimeStr();
}

function toggleTxAdvanceMode(){
  const chk = el('tx-is-advance');
  if(chk){
    chk.checked = !chk.checked;
    updateTxAdvanceVisibility();
  }
}

function updateTxAdvanceVisibility(){
  const chk = el('tx-is-advance');
  const det = el('tx-advance-details');
  if(!chk || !det) return;
  if(chk.checked){
    det.classList.remove('hidden');
    const inp = el('tx-advance-person');
    if(inp && !inp.value) inp.value = (typeof S !== 'undefined' && S && S.lang === 'zh') ? '公司报销' : 'Company Claim';
  } else {
    det.classList.add('hidden');
  }
}

function openTxModal(type = 'expense'){
  txType = type; selCat = null; selSubCat = null; showAllTxSubCats = false; photoData = null; currentOcrItems = [];
  editingTxId = null;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  el('tx-modal-title').textContent = type === 'income'
    ? (isZh ? '记录收入 (Add Income)' : 'Add Income')
    : (isZh ? '记录支出 (Add Expense)' : 'Add Expense');
  el('tx-amount').value = ''; el('tx-desc').value = ''; el('tx-note').value = ''; el('tx-date').value = today();
  if(el('tx-paymethod-val') && !isEditingFromUpload) el('tx-paymethod-val').value = 'Cash';
  if(el('tx-time')) el('tx-time').value = currentTimeStr();
  if(el('tx-location')) el('tx-location').value = '';
  el('photo-prev').classList.add('hidden'); el('photo-ph').classList.remove('hidden');
  
  if(!isEditingFromUpload){
    const hBack = el('tx-modal-header-back-btn');
    if(hBack) hBack.classList.add('hidden');
    if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.add('hidden');
  }

  // Reset advance state
  const advChk = el('tx-is-advance'); if(advChk) advChk.checked = false;
  const advDet = el('tx-advance-details'); if(advDet) advDet.classList.add('hidden');
  const advPerson = el('tx-advance-person'); if(advPerson) advPerson.value = '';
  const advStatus = el('tx-advance-status'); if(advStatus) advStatus.value = 'pending';

  // Reset tags state
  currentTxTags = [];
  if(typeof renderTxTagChips === 'function') renderTxTagChips();
  if(el('tx-tag-inp')) el('tx-tag-inp').value = '';

  txMoreOpen = false;
  showAllPayMethods = false;
  showAllCats = false;
  const panel = el('tx-more-panel'); if(panel) panel.classList.add('hidden');
  const chevron = el('tx-more-chevron'); if(chevron) chevron.textContent = '▾';
  const moreBtn = el('pay-method-more-btn'); if(moreBtn) moreBtn.textContent = 'More ▾';
  const catMoreBtn = el('cat-more-btn'); if(catMoreBtn) catMoreBtn.textContent = 'More ▾';

  el('tx-desc-label').textContent = isZh
    ? (type === 'income' ? '收入来源' : '消费名称 / 商户')
    : (type === 'income' ? 'Income Source' : 'Description');
  if(el('tx-paymethod-row')){
    if(type === 'income') el('tx-paymethod-row').classList.add('hidden');
    else el('tx-paymethod-row').classList.remove('hidden');
  }
  if(el('ocr-scan-btn')) el('ocr-scan-btn').classList.remove('hidden');

  updateTimeSuggestions();
  buildCats('tx-cats', type, id => selCat = id);
  renderPaymentMethods();

  openModal('tx-modal');
  setTimeout(() => el('tx-amount').focus(), 200);
  tryLocationSuggest();
}

function saveTx(){
  const amount = parseFloat(el('tx-amount').value);
  const desc = el('tx-desc').value.trim();
  const date = el('tx-date').value;
  const time = el('tx-time') ? el('tx-time').value : '';
  const payMethod = txType === 'income' ? 'Direct Deposit' : (el('tx-paymethod-val')?.value || 'Cash');
  const location = el('tx-location') ? el('tx-location').value.trim() : '';

  const isAdvance = (txType === 'expense' && el('tx-is-advance')) ? el('tx-is-advance').checked : false;
  const advancePerson = el('tx-advance-person') ? el('tx-advance-person').value.trim() : '';
  const advanceStatus = el('tx-advance-status') ? el('tx-advance-status').value : 'pending';

    // ── Duplicate Detection: warn if similar tx exists within ±2 days ──
  if(!editingTxId){
    const dupWindow = 2 * 86400000;
    const txDate = new Date(date || today()).getTime();
    const similar = S.transactions.find(t => {
      if(t.type !== txType) return false;
      const tAmt = Number(t.amount) || 0;
      if(Math.abs(tAmt - amount) > 0.05) return false;
      const tDate = new Date(t.date).getTime();
      if(Math.abs(tDate - txDate) > dupWindow) return false;
      const tDesc = (t.desc || '').toLowerCase();
      const newDesc = desc.toLowerCase();
      if(tDesc === newDesc || tDesc.includes(newDesc) || newDesc.includes(tDesc)) return true;
      return false;
    });
    if(similar){
      const isZhDup = (typeof S !== 'undefined' && S && S.lang === 'zh');
      const dupMsg = isZhDup
        ? '⚠️ 发现相似记录:\n' + similar.desc + ' (' + fmt(similar.amount) + ') - ' + similar.date + '\n确定要重复保存吗？'
        : '⚠️ Similar transaction found:\n' + similar.desc + ' (' + fmt(similar.amount) + ') on ' + similar.date + '\nSave duplicate anyway?';
      if(!confirm(dupMsg)) return;
    }
  }

  if(!amount || amount <= 0){ toast('⚠️ Enter a valid amount'); return; }
  if(!desc){ toast('⚠️ Add a description'); return; }
  if(!selCat){ toast('⚠️ Pick a category'); return; }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const existingTx = editingTxId ? S.transactions.find(t => t.id === editingTxId) : null;
  const selectedAccId = (el('tx-acc-select')?.value) || existingTx?.accountId || resolveAccountIdFromPayment(payMethod, S.lastUsedAccId || (S.accounts[0]?.id) || 'default');

  const newTx = {
    id: editingTxId || uid('item'),
    type: txType,
    amount,
    desc,
    category: selCat,
    subCategory: selSubCat || existingTx?.subCategory || null,
    date,
    time: time || null,
    accountId: selectedAccId,
    paymentMethod: payMethod,
    location: location || null,
    note: el('tx-note') ? el('tx-note').value.trim() : '',
    photo: null,
    items: (currentOcrItems && currentOcrItems.length > 0) ? JSON.parse(JSON.stringify(currentOcrItems)) : (existingTx?.items || []),
    tags: Array.isArray(currentTxTags) && currentTxTags.length > 0 ? [...currentTxTags] : (existingTx?.tags || []),
    
    isAdvance: isAdvance || false,
    advance: isAdvance || false,
    advancePerson: isAdvance ? (advancePerson || (isZh ? '公司报销' : 'Company Claim')) : null,
    advanceDebtor: isAdvance ? (advancePerson || (isZh ? '公司报销' : 'Company Claim')) : null,
    advanceStatus: isAdvance ? advanceStatus : null,
    advanceReimbursed: isAdvance ? (advanceStatus === 'reimbursed') : false,
    createdAt: existingTx?.createdAt || new Date().toISOString()
  };

  if(isPeriodCareExpense(newTx)){
    if(!newTx.subCategory || (!newTx.subCategory.startsWith('period_') && newTx.subCategory !== 'health_period_care')){
      newTx.subCategory = newTx.category === 'period_care' ? 'period_sanitary_pads' : 'health_period_care';
    }
  }

  // If editing, update in place; otherwise insert at beginning
  if(editingTxId){
    const idx = S.transactions.findIndex(t => t.id === editingTxId);
    if(idx !== -1){
      S.transactions[idx] = newTx;
    } else {
      S.transactions.unshift(newTx);
    }
    editingTxId = null;
  } else {
    S.transactions.unshift(newTx);
  }
  if(isEditingFromUpload){
    uniParsedData = null;
    uniImageDataUrl = null;
    isEditingFromUpload = false;
    if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.add('hidden');
  }
  // Automatically jump to the transaction's month so the user can immediately see their new entry
  if(date){
    const parts = date.split('-');
    if(parts.length >= 2){
      const savedY = parseInt(parts[0], 10);
      const savedM = parseInt(parts[1], 10) - 1;
      if(!isNaN(savedY) && !isNaN(savedM) && (savedY !== homeActiveYear || savedM !== homeActiveMonth)){
        homeActiveYear = savedY;
        homeActiveMonth = savedM;
      }
    }
  }

  save();
  renderAll();
  closeModal('tx-modal');
  toast(isZh ? `✅ ${txType==='income'?'收入已记录':'支出已记录'}: ${desc} (${fmt(amount)})` : `✅ ${txType==='income'?'Income':'Expense'} saved: ${desc} (${fmt(amount)})`);

  // Check overall monthly budget warning (all categories combined)
  if (txType === 'expense') {
    const monthlyLimit = getMonthlyBudgetTotal();
    if (monthlyLimit > 0) {
      const moStr = (date && date.length >= 7) ? date.substring(0, 7) : today().substring(0, 7);
      const spentMo = S.transactions
        .filter(t => t.type === 'expense' && t.date && t.date.startsWith(moStr))
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const remaining = monthlyLimit - spentMo;
      if (remaining < 0) {
        const over = Math.abs(remaining);
        setTimeout(() => toast(`🚨 ${isZh ? '月度总预算已超支' : 'Monthly Budget Overspent'}: ${isZh ? '已超出' : 'Exceeded by'} ${fmt(over)}! (${fmt(spentMo)} / ${fmt(monthlyLimit)})`, 5500), 1800);
      } else if (remaining <= monthlyLimit * 0.15) {
        setTimeout(() => toast(`⚠️ ${isZh ? '月度可用余额不足' : 'Budget Alert'}: ${isZh ? '仅剩' : 'Only'} ${fmt(remaining)} ${isZh ? '可用资金！' : 'available spending left this month!'}`, 4500), 1800);
      }
    }
  }

  detectRecurringPattern(newTx);

  const aiAlert = getTxInstantAiAlert(newTx);
  if(aiAlert){
    setTimeout(() => toast(aiAlert, 4200), 1200);
  }
}

let aiScanInterval = null;
const AI_SCAN_MESSAGES = [
  { step: '🤖 Connecting to Google Gemini Vision AI', sub: 'Uploading encrypted image to multimodal neural engine' },
  { step: '🔍 Detecting Merchant, Store & Payee', sub: 'Recognizing brand logos and receipt headers' },
  { step: '💵 Reading Total Amount, SST & Rounding', sub: 'Analyzing payable total, 6% SST & 5-sen BNM rounding' },
  { step: '🛒 Extracting Itemized Dishes & Goods', sub: 'Categorizing expenses and formatting receipt items' },
  { step: '🇲🇾 Verifying LHDN Tax Relief Eligibility', sub: 'Checking lifestyle, medical, sports & education claim categories' }
];

function startAiScanAnimation(context = 'universal'){
  stopAiScanAnimation();
  let stepIdx = 0;

  if(context === 'universal'){
    const progBox = el('uni-progress-box');
    const laser = el('uni-scan-laser');
    const grid = el('uni-scan-grid');
    if(progBox) progBox.classList.remove('hidden');
    if(laser) laser.classList.remove('hidden');
    if(grid) grid.classList.remove('hidden');

    const updateUniversalScanUI = () => {
      const msg = AI_SCAN_MESSAGES[stepIdx % AI_SCAN_MESSAGES.length];
      const stepEl = el('uni-progress-step');
      const subEl = el('uni-progress-sub');
      if(stepEl) stepEl.innerHTML = `${msg.step}<span class="ai-dots"></span>`;
      if(subEl) subEl.textContent = msg.sub;
      stepIdx++;
    };
    updateUniversalScanUI();
    aiScanInterval = setInterval(updateUniversalScanUI, 900);
  } else if(context === 'tx'){
    const progBox = el('ocr-progress');
    const laser = el('tx-scan-laser');
    const grid = el('tx-scan-grid');
    if(progBox) progBox.classList.remove('hidden');
    if(laser) laser.classList.remove('hidden');
    if(grid) grid.classList.remove('hidden');

    const updateUI = () => {
      const msg = AI_SCAN_MESSAGES[stepIdx % AI_SCAN_MESSAGES.length];
      const stepEl = el('ocr-progress-step');
      const subEl = el('ocr-progress-sub');
      if(stepEl) stepEl.innerHTML = `${msg.step}<span class="ai-dots"></span>`;
      if(subEl) subEl.textContent = msg.sub;
      stepIdx++;
    };
    updateUI();
    aiScanInterval = setInterval(updateUI, 900);
  }
}

function stopAiScanAnimation(){
  if(aiScanInterval){
    clearInterval(aiScanInterval);
    aiScanInterval = null;
  }
  ['uni-progress-box', 'uni-scan-laser', 'uni-scan-grid', 'ocr-progress', 'tx-scan-laser', 'tx-scan-grid', 'splitter-ocr-progress', 'xfr-ocr-progress'].forEach(id => {
    const item = el(id);
    if(item) item.classList.add('hidden');
  });
}

async function handlePhoto(inp){
  const file = inp.files[0]; if(!file) return;
  const scanBtn = el('ocr-scan-btn');
  if(scanBtn) scanBtn.style.display = 'none';

  startAiScanAnimation('tx');

  try {
    const rawDataUrl = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.readAsDataURL(file);
    });

    const compressed = await compressReceiptForStorage(rawDataUrl);
    photoData = null; // Receipt image is processed in memory for OCR extraction only, never stored
    toggleTxMoreDetails(true);

    const result = await analyzeUnifiedUploadWithGemini(compressed);
    if(result && (result.amount > 0 || result.merchant)){
      // Enrich items with calorie estimates before applying
      if(result.items && Array.isArray(result.items) && result.items.length > 0){
        await enrichItemsWithCalories(result.items);
      }
      applyReceiptStructuredData(result, 'AI');
      toast(`🤖 Auto-filled from receipt: ${result.merchant || 'Store'} · ${fmt(result.amount)}`);
    } else {
      toast('🔍 Receipt scanned! Please verify amount.');
    }
  } catch(err){
    console.warn('Photo handle notice:', err);
    toast('🔍 Receipt scanned!');
  } finally {
    photoData = null;
    stopAiScanAnimation();
    if(scanBtn) scanBtn.style.display = 'flex';
  }
}
