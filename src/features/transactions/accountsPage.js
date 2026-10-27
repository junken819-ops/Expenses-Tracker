/**
 * Accounts Page (Banks & Wallets)
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: ACCOUNTS PAGE (MALAYSIAN BANKS & WALLETS) ──
function renderAccounts(){}

function addQuickAmt(delta){
  const inp=el('tx-amount');
  const val = (parseFloat(inp.value)||0) + delta;
  inp.value = val.toFixed(2);
}

function updateTimeSuggestions(){
  const hr = new Date().getHours();
  const inp = el('tx-desc');
  if(!inp) return;
  if(txType === 'income'){
    inp.placeholder = 'e.g. Monthly Salary, Freelance project, Investment dividend…';
  } else {
    if(hr < 11) inp.placeholder = "e.g. Breakfast, Kopi & Toast, Roti Canai…";
    else if(hr < 14) inp.placeholder = "e.g. Lunch, Nasi Lemak, Mixed Rice, Mamak…";
    else if(hr < 17) inp.placeholder = "e.g. Tea break, Coffee, GrabCar, Snack…";
    else inp.placeholder = "e.g. Dinner, Groceries, Shell Petrol, Shopee…";
  }
}

function setTxAccount(accId){
  const sel = el('tx-acc-select');
  if(sel) sel.value = accId;
  
  const wrap = el('tx-acc-visual');
  if(wrap){
    wrap.querySelectorAll('.acc-v-card').forEach(c=>{
      c.classList.toggle('on', c.dataset.accId === accId);
    });
  }
}

function onTxAccSelectChange(accId){
  setTxAccount(accId);
}

function renderTxAccountVisual(){}

function renderPaymentMethods(){
  const grid = el('pay-methods-grid'); if(!grid) return;
  grid.innerHTML = '';
  const current = el('tx-paymethod-val')?.value || 'Cash (现金)';

  const PRIMARY_NAMES = [
    'Cash (现金)',
    'Touch \'n Go eWallet',
    'Online Banking (FPX / DuitNow)',
    'Maybank (MAE / QR)',
    'Credit Card'
  ];

  grid.classList.toggle('expanded', Boolean(showAllPayMethods));

  const listToRender = showAllPayMethods ? PAYMENT_METHODS : PAYMENT_METHODS.filter(pm => PRIMARY_NAMES.includes(pm.name) || pm.name === current);

  listToRender.forEach(pm => {
    const isSel = (pm.name === current || (current.startsWith('Cash') && pm.name.startsWith('Cash')));
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'pay-method-pill' + (isSel ? ' on' : '');
    card.innerHTML = `<span class="pay-method-ico">${pm.icon}</span><span>${pm.name}</span>`;
    card.onclick = () => selectPaymentMethod(pm.name);
    grid.appendChild(card);
  });

  const moreBtn = el('pay-method-more-btn');
  if(moreBtn){
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    moreBtn.textContent = showAllPayMethods ? (isZh ? '收起 ▴' : 'Less ▴') : (isZh ? '更多银行 ▾' : 'All Banks ▾');
  }
}

function toggleAllPayMethods(){
  showAllPayMethods = !showAllPayMethods;
  renderPaymentMethods();
}

function selectPaymentMethod(name){
  if(!name) return;
  // Normalize partial names to canonical PAYMENT_METHODS names if matched
  const match = PAYMENT_METHODS.find(pm => pm.name === name || pm.name.startsWith(name) || pm.id === name);
  const canonical = match ? match.name : name;
  if(el('tx-paymethod-val')) el('tx-paymethod-val').value = canonical;
  renderPaymentMethods();
}
