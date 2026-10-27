/**
 * Google Sheets Cloud Backup
 * Modularized from Pocket Winnie Core
 */

// ── 📊 GOOGLE SHEETS CLOUD BACKUP (APPS SCRIPT) ───────
function openGSheetModal(){
  el('gsheet-url-inp').value = S.gsheetUrl || '';
  openModal('gsheet-modal');
}

function saveGSheetUrl(){
  const url = el('gsheet-url-inp').value.trim();
  S.gsheetUrl = url;
  save();
  closeModal('gsheet-modal');
  renderProfile();
  toast(url ? '✅ Google Sheets URL configured' : 'ℹ️ Google Sheets URL cleared');
}

async function syncGSheet(){
  if(!S.gsheetUrl){
    toast('⚠️ Please configure your Google Sheets URL first');
    openGSheetModal();
    return;
  }

  const syncBtn = el('sync-now-btn');
  if(syncBtn) syncBtn.style.opacity = '0.5';
  toast('☁️ Syncing to Google Sheets…');

  const exportPayload = {
    transactions: S.transactions.map(t=>{
      const cat = catInfo(t.type, t.category);
      const acc = S.accounts.find(a=>a.id===t.accountId);
      return {
        id: t.id,
        date: t.date,
        time: t.time || '',
        type: t.type,
        category: cat.name,
        desc: t.desc,
        amount: Number(t.amount)||0,
        accountName: acc ? acc.name : 'Unknown Account',
        paymentMethod: t.paymentMethod || '',
        location: t.location || '',
        note: t.note || ''
      };
    })
  };

  try {
    const res = await fetch(S.gsheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportPayload)
    });

    const nowStr = new Date().toLocaleTimeString('en-MY', {hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'});
    S.lastSync = nowStr;
    save();
    renderProfile();
    toast(`✅ Synced ${S.transactions.length} entries to Google Sheets!`);
  } catch(err){
    console.error('Google Sheets sync error:', err);
    toast('⚠️ Could not sync. Please check your Apps Script URL');
  } finally {
    if(syncBtn) syncBtn.style.opacity = '1';
  }
}
