/**
 * Malaysian Receipt Meal Splitter
 * Modularized from Pocket Winnie Core
 */

// ── 🧾 AUTHENTIC MALAYSIAN RECEIPT MEAL SPLITTER ────────
let splitMode = 'equal';
let splitSvcRate = 10; // 10% or 5% or 0%
let splitSstRate = 6;  // 6% or 0%
let splitRoundingMode = 'bnm'; // 'bnm' (5 sen) | '10sen' | 'none'
let splitFriends = [
  { name: 'You (Me)', amount: 25 },
  { name: 'Friend 1', amount: 35 },
  { name: 'Friend 2', amount: 28 }
];

let curPromoDeal = 'none'; // 'none' | 'b1f1' | '50pct' | 'combo' | 'pct'
let b1f1SplitRule = 'fair'; // 'fair' | '5050' | 'buyer'
let p50SplitRule = 'fair';  // 'fair' | '5050' | 'buyer'

function selectPromoDeal(type){
  curPromoDeal = type;
  ['none', 'b1f1', '50pct', 'combo', 'pct'].forEach(t => {
    const chip = el(`promo-chip-${t}`);
    if(chip) chip.classList.toggle('on', t === type);
  });

  const b1f1Form = el('promo-b1f1-form');
  const p50Form = el('promo-50pct-form');
  const comboForm = el('promo-combo-form');
  const pctForm = el('promo-pct-form');
  const summary = el('promo-deal-summary');

  if(b1f1Form) b1f1Form.classList.toggle('hidden', type !== 'b1f1');
  if(p50Form) p50Form.classList.toggle('hidden', type !== '50pct');
  if(comboForm) comboForm.classList.toggle('hidden', type !== 'combo');
  if(pctForm) pctForm.classList.toggle('hidden', type !== 'pct');

  if(type === 'none'){
    if(summary) summary.style.display = 'none';
    const discInp = el('split-disc-inp');
    if(discInp) discInp.value = '';
    calcBillSplit();
  } else {
    applyPromoCalculation();
  }
}

function setB1f1SplitRule(rule){
  b1f1SplitRule = rule;
  ['fair', '5050', 'buyer'].forEach(r => {
    const btn = el(`b1f1-split-${r}`);
    if(btn) btn.classList.toggle('on', r === rule);
  });
  applyPromoCalculation();
}

function setP50SplitRule(rule){
  p50SplitRule = rule;
  ['fair', '5050', 'buyer'].forEach(r => {
    const btn = el(`p50-split-${r}`);
    if(btn) btn.classList.toggle('on', r === rule);
  });
  applyPromoCalculation();
}

function applyPromoCalculation(){
  const summary = el('promo-deal-summary');
  if(!summary) return;

  if(curPromoDeal === 'b1f1'){
    const p1 = parseFloat(el('b1f1-p1').value) || 0;
    const p2 = parseFloat(el('b1f1-p2').value) || 0;

    if(p1 > 0 || p2 > 0){
      const freeItem = Math.min(p1, p2);
      const paidItem = Math.max(p1, p2);
      const subtotal = p1 + p2;
      const discount = freeItem;

      let share1 = 0, share2 = 0;
      if(b1f1SplitRule === 'fair' && subtotal > 0){
        share1 = (p1 / subtotal) * paidItem;
        share2 = (p2 / subtotal) * paidItem;
      } else if(b1f1SplitRule === '5050'){
        share1 = paidItem / 2;
        share2 = paidItem / 2;
      } else { // buyer
        share1 = p1 >= p2 ? paidItem : 0;
        share2 = p1 < p2 ? paidItem : 0;
      }

      // Net amount after B1F1 discount — discount is already reflected in shares
      switchSplitMode('itemized');
      el('split-bill-inp').value = paidItem.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = 2;

      splitFriends = [
        { name: `Person 1 (RM ${p1.toFixed(2)})`, amount: parseFloat(share1.toFixed(2)) },
        { name: `Person 2 (RM ${p2.toFixed(2)})`, amount: parseFloat(share2.toFixed(2)) }
      ];
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `🎁 <strong>B1F1 Deal:</strong> Free item of ${fmt(freeItem)} applied! Net food bill: <strong>${fmt(paidItem)}</strong>. Person 1: ${fmt(share1)}, Person 2: ${fmt(share2)}.`;
    }
  } else if(curPromoDeal === '50pct'){
    const p1 = parseFloat(el('p50-p1').value) || 0;
    const p2 = parseFloat(el('p50-p2').value) || 0;

    if(p1 > 0 || p2 > 0){
      const fullItem = Math.max(p1, p2);
      const halfItem = Math.min(p1, p2);
      const discount = halfItem * 0.5;
      const subtotal = p1 + p2;
      const netFood = subtotal - discount;

      let share1 = 0, share2 = 0;
      if(p50SplitRule === 'fair' && subtotal > 0){
        share1 = (p1 / subtotal) * netFood;
        share2 = (p2 / subtotal) * netFood;
      } else if(p50SplitRule === '5050'){
        share1 = netFood / 2;
        share2 = netFood / 2;
      } else { // buyer
        share1 = p1 >= p2 ? fullItem : (halfItem * 0.5);
        share2 = p1 < p2 ? fullItem : (halfItem * 0.5);
      }

      // Net amount after 50% discount — discount is already reflected in shares
      switchSplitMode('itemized');
      el('split-bill-inp').value = netFood.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = 2;

      splitFriends = [
        { name: `Person 1 (RM ${p1.toFixed(2)})`, amount: parseFloat(share1.toFixed(2)) },
        { name: `Person 2 (RM ${p2.toFixed(2)})`, amount: parseFloat(share2.toFixed(2)) }
      ];
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `🏷️ <strong>2nd @ 50% Deal:</strong> Saved ${fmt(discount)}! Net food: <strong>${fmt(netFood)}</strong>. Person 1: ${fmt(share1)}, Person 2: ${fmt(share2)}.`;
    }
  } else if(curPromoDeal === 'combo'){
    const price = parseFloat(el('combo-price').value) || 0;
    const count = parseInt(el('combo-count').value) || 2;

    if(price > 0){
      el('split-bill-inp').value = price.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = count;

      splitFriends = [];
      const perItem = price / count;
      for(let i = 1; i <= count; i++){
        splitFriends.push({ name: `Friend ${i}`, amount: parseFloat(perItem.toFixed(2)) });
      }
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `☕ <strong>Combo Deal:</strong> ${fmt(price)} for ${count} items (<strong>${fmt(perItem)}</strong> each).`;
    }
  } else if(curPromoDeal === 'pct'){
    const pct = parseFloat(el('card-disc-pct').value) || 0;
    const name = (el('card-disc-name').value || 'Card Promo').trim();
    const bill = parseFloat(el('split-bill-inp').value) || 0;

    if(pct > 0 && bill > 0){
      const discount = bill * (pct / 100);
      el('split-disc-inp').value = discount.toFixed(2);

      summary.style.display = 'block';
      summary.innerHTML = `💳 <strong>${name}:</strong> ${pct}% off saves <strong>${fmt(discount)}</strong> on ${fmt(bill)}!`;
    }
  }

  calcBillSplit();
}

function openSplitterModal(defaultAmt = 0){
  const billInp = el('split-bill-inp');
  if(billInp) billInp.value = defaultAmt > 0 ? defaultAmt : '';
  renderSplitFriendsList();
  calcBillSplit();
  openModal('splitter-modal');
  if(billInp && !defaultAmt) setTimeout(() => billInp.focus(), 150);
}

function switchSplitMode(mode){
  splitMode = mode;
  const eqBtn = el('split-mode-equal-btn');
  const itemBtn = el('split-mode-item-btn');
  const eqSec = el('split-equal-section');
  const itemSec = el('split-itemized-section');

  if(eqBtn) eqBtn.classList.toggle('on', mode === 'equal');
  if(itemBtn) itemBtn.classList.toggle('on', mode === 'itemized');
  if(eqSec) eqSec.classList.toggle('hidden', mode !== 'equal');
  if(itemSec) itemSec.classList.toggle('hidden', mode !== 'itemized');

  if(mode === 'itemized'){
    renderSplitFriendsList();
  }
  calcBillSplit();
}

function setSplitSvc(rate){
  splitSvcRate = rate;
  [10, 5, 0].forEach(r => {
    const btn = el(`split-svc-${r}`);
    if(btn) btn.classList.toggle('on', r === rate);
  });
  calcBillSplit();
}

function setSplitSst(rate){
  splitSstRate = rate;
  [8, 6, 0].forEach(r => {
    const btn = el(`split-sst-${r}`);
    if(btn) btn.classList.toggle('on', r === rate);
  });
  calcBillSplit();
}

function setSplitRounding(mode){
  splitRoundingMode = mode;
  ['bnm', '10sen', 'none'].forEach(m => {
    const btn = el(`split-round-${m === '10sen' ? '10' : m}`);
    if(btn) btn.classList.toggle('on', m === mode);
  });
  calcBillSplit();
}

function renderSplitFriendsList(){
  const list = el('split-friends-list');
  if(!list) return;
  list.innerHTML = '';

  splitFriends.forEach((fr, idx) => {
    const card = document.createElement('div');
    card.className = 'item-split-card';
    card.style.cssText = 'background:var(--bg2);border:1.5px solid var(--border);border-radius:14px;padding:10px 12px;margin-bottom:8px';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <input type="text" class="form-input" style="flex:2;padding:8px 10px;font-size:12.5px;font-weight:700" value="${esc(fr.name)}" placeholder="${idx === 0 ? 'You (Me)' : 'Friend ' + (idx + 1)}" oninput="splitFriends[${idx}].name=this.value;calcBillSplit()"/>
        <div class="amt-wrap" style="flex:1.5;margin-bottom:0">
          <span class="cur-sym" style="font-size:11px">RM</span>
          <input type="number" class="amt-input" style="font-size:13px;padding:8px 6px" value="${fr.amount !== undefined && fr.amount !== null ? fr.amount : ''}" placeholder="0.00" inputmode="decimal" oninput="splitFriends[${idx}].amount=parseFloat(this.value)||0;calcBillSplit()"/>
        </div>
        ${splitFriends.length > 1 ? `<button type="button" onclick="removeSplitFriendRow(${idx})" title="Remove" style="background:rgba(239,68,68,.15);border:none;color:var(--red);border-radius:8px;width:28px;height:28px;cursor:pointer;font-weight:800;font-size:14px">✕</button>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;padding-top:4px;border-top:1px dashed var(--border)">
        <span style="color:var(--muted)">👤 ${idx === 0 ? 'Your Total (with tax & svc):' : (esc(fr.name || 'Friend ' + (idx + 1)) + ' pays:')}</span>
        <strong id="split-friend-final-${idx}" style="color:var(--green);font-size:13px">RM 0.00</strong>
      </div>
    `;
    list.appendChild(card);
  });
}

function resetSplitFriendsEqual(){
  const subtotal = splitFriends.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  if(subtotal > 0 && splitFriends.length > 0){
    const equalPart = parseFloat((subtotal / splitFriends.length).toFixed(2));
    splitFriends.forEach(f => f.amount = equalPart);
    renderSplitFriendsList();
    calcBillSplit();
    toast(`👥 Equalized: RM ${equalPart.toFixed(2)} each`);
  }
}

function addSplitFriendRow(){
  splitFriends.push({
    name: `Friend ${splitFriends.length + 1}`,
    amount: 0
  });
  renderSplitFriendsList();
  calcBillSplit();
}

function removeSplitFriendRow(idx){
  if(splitFriends.length <= 1) return;
  splitFriends.splice(idx, 1);
  renderSplitFriendsList();
  calcBillSplit();
}

// Exact Bank Negara Malaysia (BNM) 5-Sen Rounding Mechanism
function calcBnm5SenRounding(amount){
  const totalCents = Math.round(amount * 100);
  const lastDigit = totalCents % 10;
  let roundedCents = totalCents;
  
  if (lastDigit === 1 || lastDigit === 2) {
    roundedCents = totalCents - lastDigit;
  } else if (lastDigit === 3 || lastDigit === 4) {
    roundedCents = totalCents + (5 - lastDigit);
  } else if (lastDigit === 6 || lastDigit === 7) {
    roundedCents = totalCents - (lastDigit - 5);
  } else if (lastDigit === 8 || lastDigit === 9) {
    roundedCents = totalCents + (10 - lastDigit);
  }
  
  const rounded = roundedCents / 100;
  return { rounded, diff: rounded - amount };
}

function calcBillSplit(){
  let subtotal = 0;
  let pax = 1;

  if(splitMode === 'itemized'){
    subtotal = splitFriends.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    pax = Math.max(1, splitFriends.length);
  } else {
    subtotal = parseFloat(el('split-bill-inp').value) || 0;
    pax = Math.max(1, parseInt(el('split-pax-inp').value) || 1);
  }

  const place = (el('split-place-inp').value || '').trim() || 'MALAYSIAN MEAL RECEIPT';
  const discount = Math.max(0, parseFloat(el('split-disc-inp').value) || 0);
  const packaging = Math.max(0, parseFloat(el('split-pack-inp').value) || 0);

  const netSubtotal = Math.max(0, subtotal - discount);
  const serviceCharge = netSubtotal * (splitSvcRate / 100);
  const taxableAmount = netSubtotal + serviceCharge;
  const sstAmount = taxableAmount * (splitSstRate / 100);
  const totalBeforeRounding = taxableAmount + sstAmount + packaging;

  let grandTotal = totalBeforeRounding;
  let roundingDiff = 0;

  if(splitRoundingMode === 'bnm'){
    const bnm = calcBnm5SenRounding(totalBeforeRounding);
    grandTotal = bnm.rounded;
    roundingDiff = bnm.diff;
  } else if(splitRoundingMode === '10sen'){
    grandTotal = Math.ceil(totalBeforeRounding * 10) / 10;
    roundingDiff = grandTotal - totalBeforeRounding;
  }

  const perPersonEqual = grandTotal / pax;

  // Update Thermal Receipt Header & Rows
  if(el('rcpt-merchant-name')) el('rcpt-merchant-name').textContent = place.toUpperCase();
  if(el('rcpt-subtotal')) el('rcpt-subtotal').textContent = fmt(subtotal);

  const discRow = el('rcpt-disc-row');
  if(discRow){
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    if(el('rcpt-disc')) el('rcpt-disc').textContent = `- ${fmt(discount)}`;
  }

  const netRow = el('rcpt-net-row');
  if(netRow){
    netRow.style.display = discount > 0 ? 'flex' : 'none';
    if(el('rcpt-net')) el('rcpt-net').textContent = fmt(netSubtotal);
  }

  const svcRow = el('rcpt-svc-row');
  if(svcRow){
    svcRow.style.display = splitSvcRate > 0 ? 'flex' : 'none';
    if(el('rcpt-svc-label')) el('rcpt-svc-label').textContent = `Service Charge (${splitSvcRate}%)`;
    if(el('rcpt-svc')) el('rcpt-svc').textContent = fmt(serviceCharge);
  }

  const sstRow = el('rcpt-sst-row');
  if(sstRow){
    sstRow.style.display = splitSstRate > 0 ? 'flex' : 'none';
    if(el('rcpt-sst-label')) el('rcpt-sst-label').textContent = `Service Tax / SST (${splitSstRate}%)`;
    if(el('rcpt-sst')) el('rcpt-sst').textContent = fmt(sstAmount);
  }

  const packRow = el('rcpt-pack-row');
  if(packRow){
    packRow.style.display = packaging > 0 ? 'flex' : 'none';
    if(el('rcpt-pack')) el('rcpt-pack').textContent = fmt(packaging);
  }

  const roundRow = el('rcpt-round-row');
  if(roundRow){
    roundRow.style.display = splitRoundingMode !== 'none' ? 'flex' : 'none';
    if(el('rcpt-round-label')) el('rcpt-round-label').textContent = splitRoundingMode === 'bnm' ? 'BNM Rounding (5 sen)' : 'Rounding (10 sen)';
    const sign = roundingDiff >= 0 ? '+' : '-';
    if(el('rcpt-round')) el('rcpt-round').textContent = `${sign} RM ${Math.abs(roundingDiff).toFixed(2)}`;
  }

  if(el('rcpt-grand-total')) el('rcpt-grand-total').textContent = fmt(grandTotal);

  // Render Itemized vs Equal Breakdown in Receipt & Live Badges
  const itemBreakdownList = el('rcpt-itemized-breakdown-list');
  const heroBox = el('rcpt-split-hero-box');

  let myShare = perPersonEqual;

  if(splitMode === 'itemized'){
    const taxMultiplier = subtotal > 0 ? (grandTotal / subtotal) : 1;
    let computedShares = [];
    let allocatedTotal = 0;

    splitFriends.forEach((fr, idx) => {
      const rawShare = (Number(fr.amount) || 0) * taxMultiplier;
      const roundedShare = parseFloat(rawShare.toFixed(2));
      computedShares.push(roundedShare);
      allocatedTotal += roundedShare;
    });

    // Reconcile 1-cent rounding difference with grandTotal
    const diff = parseFloat((grandTotal - allocatedTotal).toFixed(2));
    if(diff !== 0 && computedShares.length > 0){
      let maxIdx = 0;
      for(let i = 1; i < computedShares.length; i++){
        if(computedShares[i] > computedShares[maxIdx]) maxIdx = i;
      }
      computedShares[maxIdx] = parseFloat((computedShares[maxIdx] + diff).toFixed(2));
    }

    // Update live badges in friend input cards
    splitFriends.forEach((fr, idx) => {
      const finalAmt = computedShares[idx] || 0;
      if(idx === 0) myShare = finalAmt;
      const finalEl = el(`split-friend-final-${idx}`);
      if(finalEl){
        finalEl.textContent = fmt(finalAmt);
      }
    });

    // Update Live Unequal Calculation Card
    if(el('unequal-grand-badge')) el('unequal-grand-badge').textContent = fmt(grandTotal);
    if(el('unequal-subtotal-badge')) el('unequal-subtotal-badge').textContent = fmt(subtotal);
    if(el('unequal-tax-badge')){
      const taxSvcSum = serviceCharge + sstAmount + packaging + roundingDiff - discount;
      el('unequal-tax-badge').textContent = `${taxSvcSum >= 0 ? '+' : ''}${fmt(taxSvcSum)}`;
    }

    const pillsContainer = el('unequal-shares-pills');
    if(pillsContainer){
      pillsContainer.innerHTML = splitFriends.map((fr, idx) => {
        const finalAmt = computedShares[idx] || 0;
        const pct = grandTotal > 0 ? ((finalAmt / grandTotal) * 100).toFixed(1) : '0';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);padding:5px 8px;border-radius:8px;font-size:11.5px">
            <span>👤 <strong>${esc(fr.name || 'Friend ' + (idx + 1))}</strong> (${fmt(fr.amount || 0)} · ${pct}%)</span>
            <span style="color:var(--green);font-weight:800">${fmt(finalAmt)}</span>
          </div>
        `;
      }).join('');
    }

    if(itemBreakdownList){
      itemBreakdownList.innerHTML = '<div style="font-size:11px;font-weight:800;border-bottom:1px dashed var(--border);padding-bottom:4px;margin-bottom:6px">INDIVIDUAL FRIEND BREAKDOWN:</div>';
      splitFriends.forEach((fr, idx) => {
        const finalAmt = computedShares[idx] || 0;
        const pct = grandTotal > 0 ? ((finalAmt / grandTotal) * 100).toFixed(0) : 0;
        const r = document.createElement('div');
        r.className = 'receipt-row';
        r.style.padding = '2px 0';
        r.innerHTML = `
          <span>👤 ${esc(fr.name || 'Friend ' + (idx + 1))} <small style="color:var(--dim)">(${fmt(fr.amount || 0)} + tax, ${pct}%)</small></span>
          <span style="font-weight:700">${fmt(finalAmt)}</span>
        `;
        itemBreakdownList.appendChild(r);
      });
    }

    if(heroBox) heroBox.style.display = 'none';
  } else {
    if(itemBreakdownList) itemBreakdownList.innerHTML = '';
    if(heroBox){
      heroBox.style.display = 'block';
      if(el('rcpt-per-person')) el('rcpt-per-person').textContent = fmt(perPersonEqual);
      if(el('rcpt-pax-count')) el('rcpt-pax-count').textContent = `Split equally among ${pax} pax`;
    }
  }

  return {
    place,
    subtotal,
    discount,
    netSubtotal,
    serviceCharge,
    sstAmount,
    packaging,
    roundingDiff,
    grandTotal,
    pax,
    perPersonEqual,
    myShare
  };
}

function generateWhatsAppSplitText(){
  const calc = calcBillSplit();
  const dateStr = today();

  let taxBreakdownLines = [];
  if(calc.discount > 0) taxBreakdownLines.push(`Diskaun / Voucher:    -RM ${calc.discount.toFixed(2)}`);
  if(splitSvcRate > 0) taxBreakdownLines.push(`Service Charge (${splitSvcRate}%):   RM ${calc.serviceCharge.toFixed(2)}`);
  if(splitSstRate > 0) taxBreakdownLines.push(`SST / Service Tax (${splitSstRate}%): RM ${calc.sstAmount.toFixed(2)}`);
  if(calc.packaging > 0) taxBreakdownLines.push(`Packaging Fee:         RM ${calc.packaging.toFixed(2)}`);
  if(splitRoundingMode !== 'none') {
    const sign = calc.roundingDiff >= 0 ? '+' : '-';
    taxBreakdownLines.push(`BNM Rounding (5 sen):  ${sign}RM ${Math.abs(calc.roundingDiff).toFixed(2)}`);
  }

  let individualBreakdownText = '';
  if(splitMode === 'itemized'){
    individualBreakdownText = `\n📋 *INDIVIDUAL BREAKDOWN (incl. tax):*\n` + splitFriends.map((f, i) => {
      const taxMultiplier = calc.subtotal > 0 ? (calc.grandTotal / calc.subtotal) : 1;
      const share = (Number(f.amount) || 0) * taxMultiplier;
      return `👉 *${f.name || 'Friend ' + (i+1)}:* RM ${share.toFixed(2)}`;
    }).join('\n') + `\n`;
  } else {
    individualBreakdownText = `👥 *Split between:* ${calc.pax} Pax\n👉 *EACH PERSON PAYS:* *RM ${calc.perPersonEqual.toFixed(2)}*\n`;
  }

  const msg = `🧾 *RECEIPT BILL BREAKDOWN — ${calc.place}*
📅 *Date:* ${dateStr}
────────────────────────────
Subtotal (Food & Drinks): RM ${calc.subtotal.toFixed(2)}
${taxBreakdownLines.join('\n')}
============================
💰 *TOTAL PAYABLE:*      *RM ${calc.grandTotal.toFixed(2)}*
────────────────────────────
${individualBreakdownText}────────────────────────────
💳 *Please transfer / pay to:*
${S.userName || 'Finance User'}
📱 *Via:* Touch 'n Go / Online Bank Transfer

_Generated with 🍯 Pocket Winnie 🍯_ 🍯`;

  return msg;
}

function shareSplitToWhatsApp(){
  const msg = generateWhatsAppSplitText();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function copySplitBreakdown(){
  const msg = generateWhatsAppSplitText();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(msg).then(() => {
      toast('📋 Receipt breakdown copied to clipboard!');
    }).catch(() => {
      prompt('Copy your receipt breakdown:', msg);
    });
  } else {
    prompt('Copy your receipt breakdown:', msg);
  }
}

function logSplitUserShare(){
  const calc = calcBillSplit();
  const share = splitMode === 'itemized' ? calc.myShare : calc.perPersonEqual;

  if(!share || share <= 0){
    toast('⚠️ Enter a valid bill amount');
    return;
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const ctx = activeSplitContext;

  // Case 1: Splitting an existing logged transaction
  if(ctx && ctx.originalTxId){
    const origTx = S.transactions.find(t => t.id === ctx.originalTxId);
    if(origTx){
      const oldAmt = Number(origTx.amount) || 0;
      origTx.amount = share;
      const splitNote = `Split bill (${calc.pax || 2} pax · Orig: RM ${calc.grandTotal.toFixed(2)})`;
      origTx.note = origTx.note ? `${origTx.note} | ${splitNote}` : splitNote;
      if(ctx.category) origTx.category = ctx.category;
      if(ctx.subCategory) origTx.subCategory = ctx.subCategory;

      save();
      renderAll();
      renderCalendar();
      renderFullTx();
      closeModal('splitter-modal');
      activeSplitContext = null;
      updateSplitterContextBanner();

      toast(isZh ? `✅ 账单金额已更新为您分摊的份额: RM ${share.toFixed(2)} (原账单: RM ${oldAmt.toFixed(2)})` : `✅ Bill updated to your share: RM ${share.toFixed(2)} (Orig: RM ${oldAmt.toFixed(2)})`);
      if(el('tx-detail-modal') && !el('tx-detail-modal').classList.contains('hidden')){
        openTxDetailModal(origTx.id);
      }
      return;
    }
  }

  // Case 2: From receipt upload or new split
  const placeName = (ctx && ctx.merchant) ? ctx.merchant : (calc.place || 'Expense');
  const targetCategory = (ctx && ctx.category) ? ctx.category : (selCat || 'food');
  const targetSubCat = (ctx && ctx.subCategory) ? ctx.subCategory : null;
  const targetDate = (ctx && ctx.date) ? ctx.date : today();
  const targetPay = (ctx && ctx.paymentMethod) ? ctx.paymentMethod : 'Cash';
  const targetAcc = (ctx && ctx.accountId) ? ctx.accountId : (S.lastUsedAccId || (S.accounts[0]?.id) || 'default');
  const targetItems = (ctx && ctx.items && ctx.items.length > 0) ? JSON.parse(JSON.stringify(ctx.items)) : [];

  closeModal('splitter-modal');
  openTxModal('expense');
  el('tx-amount').value = share.toFixed(2);
  el('tx-desc').value = `${placeName} (My Share)`;
  el('tx-note').value = `${ctx?.note ? ctx.note + ' · ' : ''}Split bill at ${placeName} (${calc.pax || 2} pax · Total: RM ${calc.grandTotal.toFixed(2)})`;
  if(el('tx-date')) el('tx-date').value = targetDate;

  selCat = targetCategory;
  selSubCat = targetSubCat;
  if(el('tx-cats')) buildCats('tx-cats', 'expense', id => selCat = id);
  if(targetPay) selectPaymentMethod(targetPay);
  if(targetAcc) setTxAccount(targetAcc);

  if(targetItems.length > 0){
    currentOcrItems = targetItems;
  }

  activeSplitContext = null;
  updateSplitterContextBanner();

  const cInfo = catInfo('expense', targetCategory);
  toast(isZh ? `🍜 已填入您的分摊金额: RM ${share.toFixed(2)} (${cInfo?.name || targetCategory})！` : `🍜 Pre-filled your share: RM ${share.toFixed(2)} (${cInfo?.name || targetCategory})!`);
}
