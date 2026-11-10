/**
 * Universal AI Upload & Expenses Hub
 * Modularized from Pocket Winnie Core
 */

// ── 📸 UNIVERSAL UNIFIED AI UPLOAD & EXPENSES HUB ───────
let uniCurrentMode = 'expense'; // 'expense' | 'splitter' | 'transfer' | 'tax' | 'recurring'
let uniCustomDate = '';
let uniParsedData = null;
let uniImageDataUrl = null;
let isEditingFromUpload = false;

let uniScanAbortController = null;
let isUniversalScanning = false;
let uniScanRunsInBackground = false;

// Receipt scans are deliberately represented by a real, zero-value transaction
// while they are running. This makes the work visible on Home without affecting
// balances, and gives the user a normal record they can edit or remove at once.
const pendingReceiptScanJobs = new Map();
const RECEIPT_SCAN_DURATION_MS = 15000;

function isPendingReceiptScan(tx){
  return Boolean(tx && tx.aiScan && tx.aiScan.status === 'processing');
}

function getReceiptScanRemainingSeconds(aiScan){
  if(!aiScan || !aiScan.startedAt) return 0;
  const duration = Number(aiScan.durationMs) || RECEIPT_SCAN_DURATION_MS;
  return Math.max(0, Math.ceil((duration - (Date.now() - Number(aiScan.startedAt))) / 1000));
}

function getReceiptScanProgress(aiScan){
  if(!aiScan || !aiScan.startedAt) return 0;
  const duration = Number(aiScan.durationMs) || RECEIPT_SCAN_DURATION_MS;
  // Leave a small finishing window so a completely filled bar always means
  // that the result (or the fallback state) has actually been applied.
  return Math.min(96, Math.max(0, Math.floor(((Date.now() - Number(aiScan.startedAt)) / duration) * 100)));
}

function getReceiptScanTimeoutMessage(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  return isZh
    ? '扫描超过 15 秒。点击编辑以手动填写。'
    : 'Scan reached 15 seconds. Tap Edit to enter the details manually.';
}

function refreshPendingReceiptScanCard(txId){
  const tx = (S.transactions || []).find(item => item.id === txId);
  if(!isPendingReceiptScan(tx)) return;

  const progress = getReceiptScanProgress(tx.aiScan);
  const remaining = getReceiptScanRemainingSeconds(tx.aiScan);
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  document.querySelectorAll('.receipt-scan-card').forEach(card => {
    if(card.dataset.id !== txId) return;
    const fill = card.querySelector('.receipt-scan-progress-fill');
    const label = card.querySelector('.receipt-scan-progress-label');
    const countdown = card.querySelector('.receipt-scan-countdown');
    if(fill) fill.style.width = `${progress}%`;
    if(label) label.textContent = progress >= 96
      ? (isZh ? '正在完成资料…' : 'Finishing receipt details…')
      : (isZh ? 'AI 正在读取小票' : 'AI is reading your receipt');
    if(countdown) countdown.textContent = remaining > 0
      ? (isZh ? `~${remaining}s 剩余` : `~${remaining}s remaining`)
      : (isZh ? '完成中…' : 'Finishing…');
  });
}

function startPendingReceiptScanTicker(txId){
  const job = pendingReceiptScanJobs.get(txId);
  if(!job) return;
  if(job.timer) clearInterval(job.timer);
  refreshPendingReceiptScanCard(txId);
  job.timer = setInterval(() => refreshPendingReceiptScanCard(txId), 250);
}

function finishPendingReceiptScanJob(txId, controller = null){
  const job = pendingReceiptScanJobs.get(txId);
  if(!job || (controller && job.controller !== controller)) return;
  if(job.timer) clearInterval(job.timer);
  if(job.deadlineTimer) clearTimeout(job.deadlineTimer);
  pendingReceiptScanJobs.delete(txId);
  if(uniScanAbortController === job.controller){
    uniScanAbortController = null;
    isUniversalScanning = false;
    uniScanRunsInBackground = false;
  }
}

function didPendingReceiptScanTimeOut(txId, controller = null){
  const job = pendingReceiptScanJobs.get(txId);
  return Boolean(job && (!controller || job.controller === controller) && job.timedOut);
}

function focusHomeOnReceiptDate(dateStr){
  const parts = normalizeDateStr(dateStr || today(), true).split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  if(Number.isFinite(year) && Number.isFinite(month) && month >= 0 && month <= 11){
    homeActiveYear = year;
    homeActiveMonth = month;
  }
}

function createPendingReceiptScan(){
  const now = Date.now();
  const date = normalizeDateStr(uniCustomDate || today(), true);
  const tx = {
    id: uid('item'),
    type: 'expense',
    amount: 0,
    desc: 'Reading receipt…',
    category: 'food',
    subCategory: null,
    date,
    time: currentTimeStr(),
    accountId: 'default',
    paymentMethod: '',
    location: null,
    note: '',
    photo: null,
    items: [],
    tags: [],
    aiScan: {
      status: 'processing',
      startedAt: now,
      durationMs: RECEIPT_SCAN_DURATION_MS,
      message: ''
    },
    createdAt: new Date().toISOString()
  };
  const controller = new AbortController();
  const job = { controller, timer: null, deadlineTimer: null, timedOut: false };
  job.deadlineTimer = setTimeout(() => {
    job.timedOut = true;
    try { controller.abort(); } catch(e){}
    // Do not leave a 96% bar behind if a browser task such as image decoding
    // ignores abort. The countdown always settles into an editable state.
    markPendingReceiptScanFailed(tx.id, getReceiptScanTimeoutMessage(), controller);
  }, RECEIPT_SCAN_DURATION_MS);

  S.transactions.unshift(tx);
  pendingReceiptScanJobs.set(tx.id, job);
  uniScanAbortController = controller;
  isUniversalScanning = true;
  uniScanRunsInBackground = true;
  uniParsedData = null;
  uniImageDataUrl = null;

  focusHomeOnReceiptDate(date);
  save();
  renderAll();
  startPendingReceiptScanTicker(tx.id);
  return { tx, controller, signal: controller.signal };
}

function markPendingReceiptScanFailed(txId, message, controller = null){
  const tx = (S.transactions || []).find(item => item.id === txId);
  if(!tx || !isPendingReceiptScan(tx)){
    finishPendingReceiptScanJob(txId, controller);
    return false;
  }

  tx.aiScan.status = 'failed';
  tx.aiScan.finishedAt = Date.now();
  tx.aiScan.message = message || 'We could not read this receipt.';
  tx.desc = 'Receipt needs review';
  tx.note = tx.aiScan.message;
  finishPendingReceiptScanJob(txId, controller);
  save();
  renderAll();
  return true;
}

function applyPendingReceiptScanResult(txId, result, controller = null){
  const tx = (S.transactions || []).find(item => item.id === txId);
  if(!tx || !isPendingReceiptScan(tx)){
    finishPendingReceiptScanJob(txId, controller);
    return false;
  }

  const amount = Math.abs(Number(result.amount) || 0);
  const currency = String(result.currency || 'MYR').toUpperCase();
  const txDate = normalizeDateStr(uniCustomDate || result.date || tx.date || today(), true);
  Object.assign(tx, {
    amount,
    desc: String(result.merchant || result.recipient || 'Receipt').trim() || 'Receipt',
    category: result.category || 'food',
    subCategory: result.subCategory || null,
    tags: Array.isArray(result.tags) ? result.tags : [],
    originalCurrency: currency,
    originalAmount: result.originalAmount !== undefined ? result.originalAmount : amount,
    exchangeRate: (typeof liveRates !== 'undefined' && liveRates[currency]) || 1,
    date: txDate,
    time: result.time || tx.time || currentTimeStr(),
    paymentMethod: result.paymentMethod || 'Cash',
    location: result.location || null,
    note: formatItemsSummary(result) || '',
    items: Array.isArray(result.items) ? JSON.parse(JSON.stringify(result.items)) : [],
    sstPct: result.sstPct || 0,
    sstAmount: result.sstAmount || 0,
    serviceChargePct: result.serviceChargePct || 0,
    serviceChargeAmount: result.serviceChargeAmount || 0,
    roundingAmount: result.roundingAmount || 0,
    taxesCollectedSummary: result.taxesCollectedSummary || null,
    taxReliefCat: result.taxReliefCat || null,
    taxReliefAmount: result.taxReliefAmount || (result.taxReliefCat ? amount : 0),
    taxReliefReason: result.taxReliefReason || null,
    updatedAt: new Date().toISOString()
  });

  // Keep the completed bar on screen just long enough for the user to see it
  // reach 100%, then turn it into the normal editable transaction card.
  tx.aiScan = {
    status: 'complete',
    startedAt: tx.aiScan.startedAt,
    durationMs: tx.aiScan.durationMs || RECEIPT_SCAN_DURATION_MS,
    finishedAt: Date.now(),
    message: 'Receipt ready.'
  };

  focusHomeOnReceiptDate(txDate);
  finishPendingReceiptScanJob(txId, controller);
  save();
  renderAll();
  if(typeof renderCalendar === 'function') renderCalendar();
  if(typeof renderFullTx === 'function') renderFullTx();
  if(typeof renderTaxRelief === 'function') renderTaxRelief();

  setTimeout(() => {
    const completedTx = (S.transactions || []).find(item => item.id === txId);
    if(!completedTx || completedTx.aiScan?.status !== 'complete') return;
    delete completedTx.aiScan;
    save();
    renderAll();
    if(typeof renderCalendar === 'function') renderCalendar();
    if(typeof renderFullTx === 'function') renderFullTx();
    if(typeof renderTaxRelief === 'function') renderTaxRelief();
  }, 500);
  return true;
}

function cancelPendingReceiptScan(txId, nextStatus = 'cancelled', options = {}){
  const tx = (S.transactions || []).find(item => item.id === txId);
  const job = pendingReceiptScanJobs.get(txId);
  if(job && job.controller){
    try { job.controller.abort(); } catch(e){}
  }
  finishPendingReceiptScanJob(txId, job?.controller || null);

  if(tx && tx.aiScan && tx.aiScan.status === 'processing'){
    tx.aiScan.status = nextStatus;
    tx.aiScan.finishedAt = Date.now();
    tx.aiScan.message = nextStatus === 'manual'
      ? 'AI scan stopped. Add or adjust the details yourself.'
      : 'Receipt scan cancelled.';
    if(nextStatus === 'manual'){
      tx.desc = 'Receipt needs details';
      tx.note = tx.aiScan.message;
    }
    if(!options.skipSave) save();
    if(!options.skipRender) renderAll();
  }
}

function recoverInterruptedReceiptScans(){
  let changed = false;
  (S.transactions || []).forEach(tx => {
    // A refresh may happen during the short 100%-complete transition. The
    // receipt result is already stored, so simply reveal the normal card.
    if(tx.aiScan?.status === 'complete'){
      delete tx.aiScan;
      changed = true;
      return;
    }
    if(isPendingReceiptScan(tx)){
      tx.aiScan.status = 'failed';
      tx.aiScan.finishedAt = Date.now();
      tx.aiScan.message = 'Receipt scan was interrupted. Edit it to enter the details manually.';
      tx.desc = 'Receipt needs review';
      tx.note = tx.aiScan.message;
      changed = true;
    }
  });
  if(changed) save();
}

function cancelUniversalScan(){
  // Once a receipt has been handed to the Home screen, closing the original
  // modal must not cancel its background job. Edit/remove actions cancel it
  // explicitly via cancelPendingReceiptScan().
  if(uniScanRunsInBackground) return;
  if(uniScanAbortController){
    try { uniScanAbortController.abort(); } catch(e){}
    uniScanAbortController = null;
  }
  isUniversalScanning = false;
  stopAiScanAnimation();
}

function continueUniversalUploadManually(){
  // Abort the pending request first. handleUniversalFile checks the same signal
  // after every awaited operation, so a late response cannot overwrite the
  // manual form the user is about to see.
  cancelUniversalScan();

  if(!uniParsedData){
    uniParsedData = {
      detectedType: 'receipt',
      merchant: '',
      amount: 0,
      category: uniCurrentMode === 'transfer' ? 'other' : 'food',
      date: uniCustomDate || today(),
      time: currentTimeStr(),
      items: []
    };
  }

  const actionBtns = el('uni-action-btns');
  const badgeWrap = el('uni-detected-badge-wrap');
  if(actionBtns) actionBtns.classList.remove('hidden');
  if(badgeWrap) badgeWrap.classList.add('hidden');
  renderUniversalPreview();

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '✏️ 已停止 AI 扫描，您可以手动填写' : '✏️ AI scan stopped. You can fill in the receipt manually.');
}

function handleUniversalUploadBack(){
  cancelUniversalScan();

  if(uniParsedData || uniImageDataUrl){
    uniParsedData = null;
    uniImageDataUrl = null;
    photoData = null;
    isEditingFromUpload = false;

    // Reset Dropzone & Preview UI
    const fileInp = el('uni-file-inp');
    if(fileInp) fileInp.value = '';
    const imgPrev = el('uni-img-preview');
    if(imgPrev){ imgPrev.src = ''; imgPrev.classList.add('hidden'); }
    const placeholder = el('uni-upload-placeholder');
    if(placeholder) placeholder.classList.remove('hidden');
    const badgeWrap = el('uni-detected-badge-wrap');
    if(badgeWrap) badgeWrap.classList.add('hidden');
    const actionBtns = el('uni-action-btns');
    if(actionBtns) actionBtns.classList.add('hidden');
    const hBack = el('uni-header-back-btn');
    if(hBack) hBack.classList.add('hidden');

    renderUniversalPreview();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? '🔍 准备扫描新发票' : '🔍 Ready to scan receipt');
  } else {
    closeModal('universal-upload-modal');
  }
}

function openUniversalUpload(preferredMode = 'auto', customDate = '', forceNew = false){
  if(isUniversalScanning && uniScanRunsInBackground){
    go('home');
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? '🧾 小票正在首页识别中，您可编辑或删除该记录' : '🧾 Your receipt is being read on Home. You can edit or remove it there.');
    return;
  }
  uniCurrentMode = preferredMode === 'auto' ? 'expense' : preferredMode;
  // A calendar-initiated scan carries its selected date once; a normal scan
  // afterwards must return to today instead of reusing an old calendar day.
  uniCustomDate = customDate || '';

  // If we already have parsed receipt data and user didn't ask for a forced re-scan, show it!
  if(!forceNew && uniParsedData){
    stopAiScanAnimation();
    renderUniversalPreview();
    openModal('universal-upload-modal');
    if(el('uni-action-btns')) el('uni-action-btns').classList.remove('hidden');
    if(el('uni-detected-badge-wrap')) el('uni-detected-badge-wrap').classList.remove('hidden');
    if(el('uni-header-back-btn')) el('uni-header-back-btn').classList.remove('hidden');
    const imgPrev = el('uni-img-preview');
    if(imgPrev && uniImageDataUrl){
      imgPrev.src = uniImageDataUrl;
      imgPrev.classList.remove('hidden');
    }
    if(el('uni-upload-placeholder')) el('uni-upload-placeholder').classList.add('hidden');
    return;
  }

  cancelUniversalScan();
  uniParsedData = null;
  uniImageDataUrl = null;

  // Reset UI
  if(el('uni-file-inp')) el('uni-file-inp').value = '';
  if(el('uni-upload-placeholder')) el('uni-upload-placeholder').classList.remove('hidden');
  const imgPrev = el('uni-img-preview');
  if(imgPrev){
    imgPrev.src = '';
    imgPrev.classList.add('hidden');
  }
  stopAiScanAnimation();
  if(el('uni-detected-badge-wrap')) el('uni-detected-badge-wrap').classList.add('hidden');
  if(el('uni-action-btns')) el('uni-action-btns').classList.add('hidden');
  if(el('uni-header-back-btn')) el('uni-header-back-btn').classList.add('hidden');

  setUniversalMode(uniCurrentMode, false);
  renderUniversalPreview();

  openModal('universal-upload-modal');

  // Trigger file picker after a tiny delay for immediate convenience only if modal is active
  setTimeout(() => {
    const modal = el('universal-upload-modal');
    if(modal && !modal.classList.contains('hidden') && !uniImageDataUrl && !isUniversalScanning && el('uni-file-inp')){
      el('uni-file-inp').click();
    }
  }, 250);
}

function setUniversalMode(mode, reRender = true){
  uniCurrentMode = (mode === 'splitter') ? 'splitter' : 'expense';
  ['expense', 'splitter'].forEach(m => {
    const btn = el(`uni-mode-${m}-btn`);
    if(btn){
      if(m === uniCurrentMode) btn.classList.add('on');
      else btn.classList.remove('on');
    }
  });

  const confirmBtn = el('uni-confirm-btn');
  if(confirmBtn){
    if(uniCurrentMode === 'splitter'){
      confirmBtn.innerHTML = `<span>👥 Apply to Meal Splitter</span>`;
    } else {
      confirmBtn.innerHTML = `<span>✅ Confirm & Save Expense</span>`;
    }
  }

  if(reRender) renderUniversalPreview();
}

