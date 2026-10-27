/**
 * Resilience & Compatibility Layer
 * Modularized from Pocket Winnie Core
 */

// ── 🛠️ RESILIENCE & COMPATIBILITY LAYER FOR HTML HANDLERS ──
let txMoreOpen = false;
function toggleTxMoreDetails(forceOpen){
  txMoreOpen = (forceOpen !== undefined) ? forceOpen : !txMoreOpen;
  const panel = el('tx-more-panel');
  const chevron = el('tx-more-chevron');
  if(panel){
    if(txMoreOpen) panel.classList.remove('hidden');
    else panel.classList.add('hidden');
  }
  if(chevron){
    chevron.textContent = txMoreOpen ? '▴' : '▾';
  }
}
window.toggleTxMoreDetails = toggleTxMoreDetails;

// Aliases for HTML buttons
window.delQuickPreset = typeof deleteQuickPreset === 'function' ? deleteQuickPreset : function(){};
window.savePaydayQuickSettings = typeof savePaydaySettingsFromModal === 'function' ? savePaydaySettingsFromModal : function(){};
window.recalcFxConversion = typeof calcCurrencyConversion === 'function' ? calcCurrencyConversion : function(){};
window.confirmPayLaterDebt = typeof confirmSaveMealPayLater === 'function' ? confirmSaveMealPayLater : function(){};
window.shareWhatsAppPaymentReminder = typeof shareSplitToWhatsApp === 'function' ? shareSplitToWhatsApp : function(){};
window.applyAiBudgets = typeof applyAiGeneratedBudgets === 'function' ? applyAiGeneratedBudgets : function(){};
window.openPhotoViewer = function(src){
  if(src){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:18px;cursor:pointer;animation:fadeIn .2s';
    overlay.innerHTML = `<img src="${src}" style="max-width:100%;max-height:85vh;border-radius:14px;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.8)"/><div style="color:rgba(255,255,255,.6);font-size:12px;margin-top:10px">Tap anywhere to close</div>`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  } else if(typeof openFullPhotoView === 'function'){
    openFullPhotoView();
  }
};
window.toggleTxReimbursement = typeof reimburseAdvanceTxFromDetail === 'function' ? reimburseAdvanceTxFromDetail : function(){};
window.toggleDetailTxAdvance = typeof toggleDetailTxAdvance === 'function' ? toggleDetailTxAdvance : function(){};
window.editDetailTxAdvance = typeof editDetailTxAdvance === 'function' ? editDetailTxAdvance : function(){};
window.unmarkDetailTxAdvance = typeof unmarkDetailTxAdvance === 'function' ? unmarkDetailTxAdvance : function(){};
window.splitDetailTx = typeof splitDetailTx === 'function' ? splitDetailTx : function(){};
window.splitCurrentTxModal = typeof splitCurrentTxModal === 'function' ? splitCurrentTxModal : function(){};
window.handleDetailPhotoUpload = typeof handleDetailPhotoUpload === 'function' ? handleDetailPhotoUpload : function(){};
window.removeDetailTxPhoto = typeof removeDetailTxPhoto === 'function' ? removeDetailTxPhoto : function(){};
window.editDetailTx = typeof editTxFromDetail === 'function' ? editTxFromDetail : function(){};
window.duplicateDetailTx = typeof repeatTxFromDetail === 'function' ? repeatTxFromDetail : function(){};
window.delDetailTx = typeof deleteTxFromDetail === 'function' ? deleteTxFromDetail : function(){};
window.toggleWallpaperCustomOptions = typeof toggleCustomWpDropdown === 'function' ? toggleCustomWpDropdown : function(){};
window.handleCustomWallpaperFile = function(inp){
  if(inp && inp.files && inp.files[0] && typeof handleWallpaperFileUpload === 'function'){
    handleWallpaperFileUpload({ target: inp });
  }
};
window.applyOnlineWallpaperUrl = function(){
  const inp = el('wp-online-url-inp') || el('custom-wallpaper-url');
  const raw = (inp ? inp.value : '').trim();
  if(!raw){
    if(typeof selectWallpaper === 'function') selectWallpaper('');
    toast('Wallpaper reset');
    return;
  }
  const cleanUrl = (typeof parseImageUrl === 'function') ? parseImageUrl(raw) : raw;
  if(inp) inp.value = cleanUrl;
  if(typeof selectWallpaper === 'function') selectWallpaper(cleanUrl);
  toast('🖼️ Online wallpaper applied!');
};
window.openNewCategoryModal = function(){
  if(typeof openAddCategoryForm === 'function'){
    openAddCategoryForm();
  }
};

// Petrol modal export
window.openPetrolModal = typeof openPetrolModal === 'function' ? openPetrolModal : function(){};

// Weekly report modal dynamic render fallback
const _origRenderWeeklyReport = (typeof renderWeeklyReport === 'function') ? renderWeeklyReport : null;
if(_origRenderWeeklyReport){
  window.renderWeeklyReport = function(){
    const content = el('weekly-report-content');
    if(content && !content.children.length){
      content.innerHTML = `
        <div style="background:linear-gradient(135deg,rgba(255,179,0,.15),rgba(245,158,11,.08));border:1.5px solid var(--amber);border-radius:18px;padding:16px;text-align:center;margin-bottom:14px">
          <div id="wr-grade-emoji" style="font-size:40px;margin-bottom:4px">🌟</div>
          <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">Weekly Financial Grade</div>
          <div id="wr-grade" style="font-size:36px;font-weight:900;color:var(--amber);margin:2px 0">A</div>
          <div id="wr-verdict" style="font-size:13px;font-weight:700;color:var(--text)">Great spending control this week!</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Total Spent</div>
            <div id="wr-total-spent" style="font-size:15px;font-weight:900;color:var(--red);margin-top:2px">RM 0.00</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Daily Average</div>
            <div id="wr-daily-avg" style="font-size:15px;font-weight:900;color:var(--text);margin-top:2px">RM 0.00</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Tx Count</div>
            <div id="wr-tx-count" style="font-size:15px;font-weight:900;color:var(--amber);margin-top:2px">0</div>
          </div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:12px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:800;margin-bottom:8px">🏆 Top Spending Categories</div>
          <div id="wr-top-cats" style="display:flex;flex-direction:column;gap:6px"></div>
        </div>
      `;
    }
    _origRenderWeeklyReport();
  };
}
