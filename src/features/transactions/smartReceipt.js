/**
 * Smart Receipt Uploader & Duplicate Last Tx
 * Modularized from Pocket Winnie Core
 */

// ── 📁 SMART RECEIPT UPLOADER ──────────────────────────
async function startOCR(){
  openUniversalUpload('expense');
}

function compressReceiptForStorage(dataUrl){
  return new Promise((resolve) => {
    if(!dataUrl || !dataUrl.startsWith('data:image')) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      const maxDim = 2000; // Higher res for sharper OCR on dense receipts
      let w = img.width, h = img.height;
      if(w > maxDim || h > maxDim){
        if(w > h){
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // -- Contrast + brightness boost for faded thermal receipts ----------------
      // Apply CSS filter for reliable enhancement (avoids manual pixel manipulation).
      try {
        // Use canvas filter for contrast and brightness.
        ctx.filter = 'contrast(1.2) brightness(1.08)';
        ctx.drawImage(img, 0, 0, w, h);
        ctx.filter = 'none';
      } catch (enhanceErr) {
        console.warn('Receipt image enhancement skipped:', enhanceErr.message);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.88)); // Higher quality for dense OCR text
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
function detectGPSLocation(){
  if(!navigator.geolocation){
    toast('⚠️ GPS not supported on this browser');
    return;
  }
  toast('📍 Detecting location…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);
      if(res.ok){
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.suburb || data.address.state_district || data.address.state || 'Malaysia';
        const area = data.address.suburb || data.address.neighbourhood || data.address.road || '';
        const locStr = area ? `${area}, ${city}` : city;
        if(el('tx-location')) el('tx-location').value = locStr;
        toggleTxMoreDetails(true);
        toast(`📍 Location detected: ${locStr}`);
        return;
      }
    } catch(e){}
    if(el('tx-location')) el('tx-location').value = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    toggleTxMoreDetails(true);
    toast('📍 Coordinates tagged');
  }, () => {
    toast('⚠️ Location permission denied or unavailable');
  }, { timeout: 8000 });
}



// ── 📋 DUPLICATE LAST TRANSACTION ─────────────────────
function duplicateLastTx(){
  if(!S.transactions.length){
    toast('⚠️ No previous transaction found to duplicate');
    return;
  }
  // The newest transaction is the first in chronological unshifted array
  const last = S.transactions[0];
  const duplicated = {
    ...last,
    id: uid('item'),
    date: today(),
    note: (last.note ? last.note + ' (Copy)' : 'Copy'),
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(duplicated);
  save();
  renderAll();
  toast(`📋 Duplicated: "${duplicated.desc}" (${fmt(duplicated.amount)})`);
}
