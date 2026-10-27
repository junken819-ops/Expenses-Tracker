/**
 * Family Wallet
 * Modularized from Pocket Winnie Core
 */

// ── FEATURE 14: FAMILY WALLET ──────────────────────────
function openFamilyWalletModal(){
  if(el('partner-name-inp')) el('partner-name-inp').value = S.partnerName || '';
  renderFamilyCombinedView();
  openModal('family-wallet-modal');
}

function exportMyData(){
  const data = {
    name: S.userName || 'Partner',
    transactions: S.transactions,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pocket_winnie_${(S.userName||'user').replace(/\s+/g,'_')}_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📤 Data exported! Share this file with your partner.');
}

function importPartnerData(){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if(!data.transactions || !Array.isArray(data.transactions)){
          toast('⚠️ Invalid file format');
          return;
        }
        S.partnerData = data;
        S.partnerName = data.name || S.partnerName || 'Partner';
        if(el('partner-name-inp')) el('partner-name-inp').value = S.partnerName;
        save();
        renderFamilyCombinedView();
        toast(`✅ Imported ${data.transactions.length} transactions from ${S.partnerName}!`);
      } catch(err){
        toast('⚠️ Failed to parse file');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function clearPartnerData(){
  if(!confirm('Remove partner data?')) return;
  S.partnerData = null;
  save();
  renderFamilyCombinedView();
  toast('🗑️ Partner data cleared');
}

function renderFamilyCombinedView(){
  const container = el('family-combined-view');
  if(!container) return;
  
  if(!S.partnerData || !S.partnerData.transactions){
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted)">
      <div style="font-size:32px;margin-bottom:8px">🏡</div>
      <div style="font-size:13px;font-weight:700">No partner data imported yet</div>
      <div style="font-size:11.5px;margin-top:4px">Export your data and share with your partner. Then import their file here.</div>
    </div>`;
    return;
  }
  
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const myTxs = S.transactions.filter(t => t.date >= monthStart && t.date <= todayStr);
  const partnerTxs = S.partnerData.transactions.filter(t => t.date >= monthStart && t.date <= todayStr);
  
  const myExp = myTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const myInc = myTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const pExp = partnerTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const pInc = partnerTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  const totalExp = myExp + pExp;
  const totalInc = myInc + pInc;
  const myName = S.userName || 'You';
  const pName = S.partnerName || 'Partner';
  
  const combinedCats = {};
  [...myTxs, ...partnerTxs].filter(t => t.type === 'expense').forEach(t => {
    combinedCats[t.category] = (combinedCats[t.category]||0) + (Number(t.amount)||0);
  });
  const topCats = Object.entries(combinedCats).sort((a,b) => b[1]-a[1]).slice(0,5);
  
  container.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(236,72,153,.1));border:1.5px solid rgba(124,58,237,.25);border-radius:16px;padding:14px;margin-bottom:12px;text-align:center">
      <div style="font-size:11px;font-weight:800;color:var(--amber);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px">🏡 Household — This Month</div>
      <div style="display:flex;gap:12px">
        <div style="flex:1;background:var(--bg2);border-radius:12px;padding:10px">
          <div style="font-size:10px;color:var(--muted);font-weight:700">Combined Income</div>
          <div style="font-size:16px;font-weight:800;color:var(--green)">${fmt(totalInc)}</div>
        </div>
        <div style="flex:1;background:var(--bg2);border-radius:12px;padding:10px">
          <div style="font-size:10px;color:var(--muted);font-weight:700">Combined Expenses</div>
          <div style="font-size:16px;font-weight:800;color:var(--red)">${fmt(totalExp)}</div>
        </div>
      </div>
    </div>
    
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px">👤 Who Spent More?</div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <div style="flex:${myExp || 1};background:var(--amber);border-radius:8px;padding:6px;text-align:center;font-size:11px;font-weight:700;color:#000">${myName}: ${fmt(myExp)}</div>
        <div style="flex:${pExp || 1};background:#7c3aed;border-radius:8px;padding:6px;text-align:center;font-size:11px;font-weight:700;color:#fff">${pName}: ${fmt(pExp)}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);text-align:center">
        ${myExp > pExp ? `${myName} spent ${fmt(myExp - pExp)} more` : myExp < pExp ? `${pName} spent ${fmt(pExp - myExp)} more` : 'Equal spending! 🤝'}
      </div>
    </div>
    
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px">🏆 Top Household Categories</div>
      ${topCats.map(([cat, amt]) => {
        const c = catInfo('expense', cat);
        const pct = totalExp > 0 ? ((amt/totalExp)*100).toFixed(0) : 0;
        return `<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)">
          <span>${c.icon} ${c.name}</span>
          <span style="font-weight:700">${fmt(amt)} <span style="color:var(--muted);font-size:10px">(${pct}%)</span></span>
        </div>`;
      }).join('')}
    </div>
    
    <div style="font-size:10.5px;color:var(--dim);text-align:center;margin-bottom:12px">Partner data imported: ${S.partnerData.exportDate ? new Date(S.partnerData.exportDate).toLocaleString('en-MY') : 'Unknown'}</div>
  `;
}

// ── CONSOLIDATED HUB REDIRECTS ──
function openSharedBillsHub(){ go('more'); }
function openWealthHub(){ go('budgets'); }
function openSubscriptionsHub(){ go('more'); }
function openMarketToolkitHub(){ openCurrencyModal(); }
function openDocTaxHub(initialTab = 'gallery'){
  if(initialTab === 'statements'){
    exportMonthlyPDF();
  } else {
    openReceiptGallery();
  }
}
