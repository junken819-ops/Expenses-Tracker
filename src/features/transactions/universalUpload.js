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

function cancelUniversalScan(){
  if(uniScanAbortController){
    try { uniScanAbortController.abort(); } catch(e){}
    uniScanAbortController = null;
  }
  isUniversalScanning = false;
  stopAiScanAnimation();
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
  uniCurrentMode = preferredMode === 'auto' ? 'expense' : preferredMode;
  if(customDate) uniCustomDate = customDate;

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

