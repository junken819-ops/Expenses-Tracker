/**
 * Recent Transactions List & Swipe Gestures
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: RECENT TX (WITH SWIPE TO DELETE) ───────────
function renderRecentTx(){
  const list=el('recent-list'), empty=el('empty-home');
  if(!list) return;
  list.innerHTML='';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const monthName = isZh ? MONTH_NAMES_ZH[homeActiveMonth] : MONTH_NAMES[homeActiveMonth];
  const allTx = filteredTx();
  const monthTxs = allTx.filter(t => inMonth(t, homeActiveMonth, homeActiveYear));
  const sorted = [...monthTxs].sort((a,b)=>b.date.localeCompare(a.date));

  if(!sorted.length){
    if(empty){
      empty.classList.remove('hidden');
      const p = empty.querySelector('p');
      const small = empty.querySelector('small');
      if(p) p.textContent = isZh ? `${homeActiveYear}年${monthName} 暂无支出记录 (RM 0.00)` : `No transactions in ${monthName} ${homeActiveYear} yet (RM 0.00)`;
      if(small) small.textContent = isZh ? `轻点 ◀ 查看过往月份记录，或按 ➕ 记一笔新账！` : `Tap ◀ to view previous months or ➕ to log your first expense!`;
    }
    return;
  }
  if(empty) empty.classList.add('hidden');
  sorted.slice(0, 15).forEach(tx=>list.appendChild(makeTxEl(tx)));
}

let currentDetailTxId = null;

function openTxDetailModal(txId){
  const tx = S.transactions.find(t => t.id === txId);
  if(!tx) return;
  currentDetailTxId = txId;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const presentation = transactionPresentation(tx, isZh);
  const cat = presentation.category;
  const isTransfer = isInternalTransfer(tx);
  const acc = S.accounts.find(a => a.id === tx.accountId);
  const accIco = acc ? getAccIcon(acc) : '💳';
  const payM = tx.paymentMethod || (isZh ? '现金' : 'Cash');
  const dStr = normalizeDateStr(tx.date);
  const dObj = new Date(dStr + 'T00:00:00');
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  const dFull = dObj.toLocaleDateString(localeStr, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  if(el('tx-det-title')) el('tx-det-title').textContent = isZh ? '账单明细' : 'Transaction Details';
  if(el('tx-det-icon')) el('tx-det-icon').textContent = cat.icon;
  if(el('tx-det-desc')) el('tx-det-desc').textContent = tx.desc || cat.name;
  if(el('tx-det-amt')){
    el('tx-det-amt').textContent = `${presentation.amountPrefix}${fmt(tx.amount)}`;
    el('tx-det-amt').style.color = presentation.amountColor;
  }

  const badgeContainer = el('tx-det-badges');
  if(badgeContainer){
    badgeContainer.innerHTML = '';
    const typeBadge = document.createElement('span');
    typeBadge.className = 'chip';
    typeBadge.style.cssText = `font-size:11px;font-weight:800;background:${isTransfer ? 'rgba(6,182,212,.18)' : (tx.type === 'income' ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.18)')};color:${presentation.amountColor}`;
    typeBadge.textContent = presentation.typeLabel;
    badgeContainer.appendChild(typeBadge);

    const catBadge = document.createElement('span');
    catBadge.className = 'chip';
    catBadge.style.cssText = 'font-size:11px;font-weight:800;background:rgba(255,179,0,.15);color:var(--text)';
    catBadge.textContent = `${cat.icon} ${cat.name}`;
    badgeContainer.appendChild(catBadge);

    const sub = getSubCatInfo(tx.subCategory);
    if(sub){
      const subBadge = document.createElement('span');
      subBadge.className = 'chip';
      subBadge.style.cssText = 'font-size:11px;font-weight:800;background:rgba(6,182,212,.13);color:var(--text)';
      subBadge.textContent = `${sub.icon} ${sub.name}`;
      badgeContainer.appendChild(subBadge);
    }

    const isAdvBadge = Boolean(tx.isAdvance || tx.advance);
    if(isAdvBadge){
      const isReimb = (tx.advanceStatus === 'reimbursed' || tx.advanceReimbursed);
      const advBadge = document.createElement('span');
      advBadge.className = 'chip';
      advBadge.style.cssText = `font-size:11px;font-weight:800;background:${isReimb ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.15)'};color:${isReimb ? 'var(--green)' : 'var(--red)'}`;
      advBadge.textContent = isReimb ? (isZh ? '✅ 已报销' : '✅ Reimbursed') : (isZh ? '⏳ 待报销垫付' : '⏳ Advance');
      badgeContainer.appendChild(advBadge);
    }

    if(Array.isArray(tx.tags) && tx.tags.length > 0){
      tx.tags.forEach(tg => {
        const tagBadge = document.createElement('span');
        tagBadge.className = 'chip';
        tagBadge.style.cssText = 'font-size:11px;font-weight:800;background:rgba(245,158,11,.18);color:var(--amber);border:1px solid rgba(245,158,11,.35)';
        tagBadge.textContent = `#${tg}`;
        badgeContainer.appendChild(tagBadge);
      });
    }
  }

  if(el('tx-det-datetime')){
    el('tx-det-datetime').textContent = tx.time ? `${dFull} · ${tx.time}` : dFull;
  }
  if(el('tx-det-account')){
    el('tx-det-account').textContent = acc ? `${accIco} ${acc.name}` : (isZh ? '未指定账户' : 'Unassigned Account');
  }
  if(el('tx-det-method')){
    el('tx-det-method').textContent = payM;
  }

  const locRow = el('tx-det-loc-row');
  const locVal = el('tx-det-location');
  if(locRow && locVal){
    if(tx.location){
      locRow.classList.remove('hidden');
      locVal.textContent = tx.location;
    } else {
      locRow.classList.add('hidden');
    }
  }

  const taxRow = el('tx-det-tax-row');
  const taxVal = el('tx-det-tax');
  if(taxRow){
    if(tx.taxReliefCat || (tx.category && ['health', 'education', 'sports', 'lifestyle', 'insurance'].includes(tx.category))){
      taxRow.classList.remove('hidden');
      if(taxVal) taxVal.textContent = tx.taxReliefCat ? `Eligible (${tx.taxReliefCat.toUpperCase()})` : (isZh ? '可报税减免' : 'Eligible');
    } else if(tx.sstAmount > 0 || tx.serviceChargeAmount > 0 || tx.taxesCollectedSummary){
      taxRow.classList.remove('hidden');
      if(taxVal) taxVal.textContent = tx.taxesCollectedSummary || (tx.sstAmount ? `SST (${tx.sstPct||6}%): RM ${tx.sstAmount.toFixed(2)}` : (isZh ? '已含消费税' : 'Tax Included'));
    } else {
      taxRow.classList.add('hidden');
    }
  }

  const itemsBox = el('tx-det-items-box');
  const itemsContent = el('tx-det-items-content');
  if(itemsBox && itemsContent){
    const items = extractTxReceiptItems(tx);
    const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';
    const totalTxCal = getTxCalories(tx);
    const totalTxProt = getTxProtein(tx);

    if(items.length > 0 || cleanNote || totalTxCal > 0 || totalTxProt > 0){
      itemsBox.classList.remove('hidden');
      let htmlContent = '';
      if(totalTxCal > 0 || totalTxProt > 0){
        htmlContent += `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)">
            <span style="font-size:11.5px;font-weight:800;color:var(--text)">🥗 ${isZh ? '菜品明细与营养' : 'Items & Nutrition Breakdown'}</span>
            <div style="display:flex;align-items:center;gap:4px">
              ${totalTxCal > 0 ? `<span style="font-size:11px;font-weight:900;color:#10b981;background:rgba(16,185,129,.14);padding:2px 7px;border-radius:6px;border:1px solid rgba(16,185,129,.28)">🔥 ${totalTxCal} kcal</span>` : ''}
              ${totalTxProt > 0 ? `<span style="font-size:11px;font-weight:900;color:var(--cyan);background:rgba(6,182,212,.14);padding:2px 7px;border-radius:6px;border:1px solid rgba(6,182,212,.28)">🥩 ${totalTxProt}g</span>` : ''}
            </div>
          </div>
        `;
      }
      if(items.length > 0){
        htmlContent += `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:8px">`;
        items.forEach(it => {
          const calInfo = (it.calories && parseInt(it.calories) > 0) ? `<span style="font-size:9.5px;color:#10b981;margin-left:4px;font-weight:700;background:rgba(16,185,129,0.12);padding:1px 4px;border-radius:4px;border:1px solid rgba(16,185,129,0.25)">🔥 ${it.calories * (it.qty || 1)} kcal</span>` : '';
          const protInfo = (it.protein && parseInt(it.protein) > 0) ? `<span style="font-size:9.5px;color:var(--cyan);margin-left:4px;font-weight:700;background:rgba(6,182,212,0.12);padding:1px 4px;border-radius:4px;border:1px solid rgba(6,182,212,0.25)">🥩 ${it.protein * (it.qty || 1)}g</span>` : '';
          htmlContent += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px">
              <span style="display:flex;align-items:center;flex-wrap:wrap">${it.qty > 1 ? `<span style="color:var(--cyan);margin-right:4px">${it.qty}x</span> ` : ''}${esc(it.name)}${calInfo}${protInfo}</span>
              <strong style="color:var(--text)">${it.price > 0 ? fmt(it.price * (it.qty || 1)) : ''}</strong>
            </div>
          `;
        });
        htmlContent += `</div>`;
      }
      if(cleanNote && cleanNote !== tx.desc && !items.length){
        htmlContent += `<div style="font-size:11.5px;color:var(--muted);background:rgba(255,255,255,.03);padding:8px;border-radius:8px">📝 ${esc(cleanNote)}</div>`;
      }
      itemsContent.innerHTML = htmlContent || `<div style="color:var(--muted)">${isZh ? '无单品备注' : 'No extra notes'}</div>`;
    } else {
      itemsBox.classList.add('hidden');
    }
  }

  // 🇲🇾 Receipt Inflation & Price vs Market Benchmark Detail
  const infBox = el('tx-det-inflation-box');
  const infSummary = el('tx-det-inflation-summary-badge');
  const infItemsList = el('tx-det-inflation-items-list');

  if(infBox && infItemsList){
    const txItems = extractTxReceiptItems(tx);
    if(tx.type === 'expense' && txItems && txItems.length > 0){
      infBox.classList.remove('hidden');
      let totalPaid = 0;
      let totalMarket = 0;
      infItemsList.innerHTML = '';

      txItems.forEach(it => {
        const unitPrice = it.price / (it.qty || 1);
        const match = findMarketBenchmarkMatch(it.name, tx.category, unitPrice);
        if(match){
          const marketAvg = match.marketAvg;
          const diff = unitPrice - marketAvg;
          const pct = marketAvg > 0 ? Math.round((diff / marketAvg) * 100) : 0;
          totalPaid += it.price;
          totalMarket += marketAvg * (it.qty || 1);

          const isHike = pct > 15;
          const isFair = pct >= -10 && pct <= 15;
          const badgeBg = isHike ? 'rgba(239,68,68,.18)' : (isFair ? 'rgba(59,130,246,.15)' : 'rgba(16,185,129,.18)');
          const badgeColor = isHike ? 'var(--red)' : (isFair ? '#3b82f6' : 'var(--green)');
          const badgeIcon = isHike ? '🚨' : (isFair ? '⚖️' : '✨');
          const statusText = isHike ? (isZh ? `贵过市面 +${pct}%` : `+${pct}% Over Avg`) : (isFair ? (isZh ? `市面均价` : `Fair Market`) : (isZh ? `实惠好价 ${pct}%` : `Good Deal ${pct}%`));

          const row = document.createElement('div');
          row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px';
          row.innerHTML = `
            <div style="min-width:0;flex:1">
              <div style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${match.icon || '🧾'} ${esc(it.name)} ${it.qty > 1 ? `x${it.qty}` : ''}
              </div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px">
                ${isZh ? '实付' : 'Paid'}: <strong>${fmt(unitPrice)}</strong> ➔ ${isZh ? '大马市价' : 'Market Avg'}: <span style="color:var(--cyan)">${fmt(marketAvg)}</span>
              </div>
            </div>
            <div style="text-align:right;white-space:nowrap">
              <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;background:${badgeBg};color:${badgeColor}">
                ${statusText} ${badgeIcon}
              </span>
            </div>
          `;
          infItemsList.appendChild(row);
        }
      });

      if(infSummary && totalMarket > 0){
        const overallDiff = totalPaid - totalMarket;
        const overallPct = Math.round((overallDiff / totalMarket) * 100);
        const isOverallHike = overallPct > 10;
        const isOverallFair = overallPct >= -10 && overallPct <= 10;

        infSummary.style.background = isOverallHike ? 'rgba(239,68,68,.18)' : (isOverallFair ? 'rgba(59,130,246,.15)' : 'rgba(16,185,129,.18)');
        infSummary.style.color = isOverallHike ? 'var(--red)' : (isOverallFair ? '#3b82f6' : 'var(--green)');
        infSummary.textContent = isOverallHike 
          ? (isZh ? `整体高出市价 +${overallPct}% 🚨` : `+${overallPct}% Above Market Avg 🚨`)
          : (isOverallFair 
            ? (isZh ? `整体符合市价 ⚖️` : `Fair Market Value ⚖️`)
            : (isZh ? `省下 ${Math.abs(overallPct)}% 实惠 ✨` : `Good Deal ✨ (${overallPct}%)`));
      }
    } else {
      infBox.classList.add('hidden');
    }
  }

  // Advance Box & Conversion Button
  const isAdv = Boolean(tx.isAdvance || tx.advance);
  const isReimbursed = (tx.advanceStatus === 'reimbursed' || tx.advanceReimbursed);
  const debtorName = tx.advancePerson || tx.advanceDebtor || (isZh ? '公司报销' : 'Company');

  const advBox = el('tx-det-advance-box');
  const makeAdvBtn = el('tx-det-make-adv-btn');
  if(advBox){
    if(isAdv){
      advBox.classList.remove('hidden');
      if(makeAdvBtn) makeAdvBtn.classList.add('hidden');
      const badgeEl = el('tx-det-adv-status-badge') || el('tx-det-advance-status-badge');
      if(badgeEl){
        badgeEl.textContent = isReimbursed ? (isZh ? '✅ 已报销结清' : '✅ Reimbursed') : (isZh ? '⏳ 待报销' : '⏳ Pending');
        badgeEl.style.background = isReimbursed ? 'rgba(16,185,129,.18)' : 'rgba(255,179,0,.2)';
        badgeEl.style.color = isReimbursed ? 'var(--green)' : 'var(--amber)';
      }
      const personEl = el('tx-det-adv-person') || el('tx-det-advance-debtor-txt');
      if(personEl){
        personEl.textContent = (isZh ? '报销/还款对象: ' : 'Debtor: ') + debtorName;
      }
      const rBtn = el('tx-det-reimburse-btn');
      if(rBtn){
        rBtn.style.display = isReimbursed ? 'none' : 'block';
        rBtn.textContent = isZh ? '✓ 标记已到账 (Mark Reimbursed)' : '✓ Mark as Reimbursed';
      }
    } else {
      advBox.classList.add('hidden');
      if(makeAdvBtn) makeAdvBtn.classList.remove('hidden');
    }
  }

  const editBtn = el('tx-det-edit-btn');
  const repeatBtn = el('tx-det-repeat-btn');
  const splitBtn = el('tx-det-split-btn');
  if(editBtn) editBtn.style.display = isTransfer ? 'none' : '';
  if(repeatBtn) repeatBtn.style.display = isTransfer ? 'none' : '';
  if(splitBtn) splitBtn.style.display = isTransfer ? 'none' : '';

  openModal('tx-detail-modal');
}

function reimburseAdvanceTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  // Mark advance transaction as reimbursed
  tx.advanceStatus = 'reimbursed';
  tx.advanceReimbursed = true;

  // Automatically create corresponding Income transaction
  const incTx = {
    id: uid('item'),
    type: 'income',
    amount: Number(tx.amount) || 0,
    desc: (isZh ? '💰 报销/垫付还款到账: ' : '💰 Reimbursement received: ') + (tx.desc || ''),
    category: 'other',
    date: today(),
    time: currentTimeStr(),
    accountId: tx.accountId || getActiveAccountId(),
    paymentMethod: 'Direct Deposit',
    location: tx.location || null,
    note: (isZh ? '关联原垫付账单: ' : 'Reimbursement for advance expense: ') + (tx.desc || ''),
    photo: null,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(incTx);
  save();
  renderAll();
  renderCalendar();
  openTxDetailModal(tx.id);
  toast(isZh ? `🎉 已收到报销款 ${fmt(tx.amount)}，收入账单已自动入账！` : `🎉 Reimbursed ${fmt(tx.amount)}! Income record created.`);
}

function toggleDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const defaultPerson = isZh ? '公司报销' : 'Company Claim';
  const person = prompt(isZh ? '请输入还款/报销来源 (例如：公司、朋友名字)：' : 'Enter reimbursement source / debtor (e.g. Company, Friend name):', defaultPerson);
  if(person === null) return;

  const chosenPerson = person.trim() || defaultPerson;
  tx.isAdvance = true;
  tx.advance = true;
  tx.advancePerson = chosenPerson;
  tx.advanceDebtor = chosenPerson;
  tx.advanceStatus = 'pending';
  tx.advanceReimbursed = false;

  save();
  renderAll();
  renderCalendar();
  openTxDetailModal(tx.id);
  toast(isZh ? `📌 已设为待报销垫付 (${chosenPerson})` : `📌 Marked as pending advance (${chosenPerson})`);
}

function editDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const curPerson = tx.advancePerson || tx.advanceDebtor || (isZh ? '公司报销' : 'Company Claim');
  const newPerson = prompt(isZh ? '修改还款/报销来源 (例如：公司、同事名字)：' : 'Edit reimbursement source / debtor:', curPerson);
  if(newPerson === null) return;

  tx.advancePerson = newPerson.trim() || curPerson;
  tx.advanceDebtor = tx.advancePerson;
  save();
  renderAll();
  openTxDetailModal(tx.id);
  toast(isZh ? `✅ 垫付信息已更新: ${tx.advancePerson}` : `✅ Advance details updated: ${tx.advancePerson}`);
}

function unmarkDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!confirm(isZh ? '确定取消此账单的垫付标记，恢复为普通个人消费？' : 'Remove advance/reimbursement tag from this bill?')) return;

  tx.isAdvance = false;
  tx.advance = false;
  tx.advancePerson = null;
  tx.advanceDebtor = null;
  tx.advanceStatus = null;
  tx.advanceReimbursed = false;

  save();
  renderAll();
  openTxDetailModal(tx.id);
  toast(isZh ? '👌 已取消垫付标记，恢复为普通账单' : '👌 Reverted to normal expense');
}

function handleDetailPhotoUpload(input){
  if(input) input.value = '';
}

function removeDetailTxPhoto(){}

function splitDetailTx(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(isInternalTransfer(tx)){
    toast(isZh ? '内部转账无法分摊。' : 'Internal transfers cannot be split.');
    return;
  }

  const amt = Number(tx.amount) || 0;
  if(amt <= 0){
    toast(isZh ? '账单金额无效' : 'Invalid transaction amount');
    return;
  }

  const txItems = extractTxReceiptItems(tx);

  activeSplitContext = {
    source: 'tx_detail',
    originalTxId: tx.id,
    merchant: tx.desc || 'Bill',
    amount: amt,
    category: tx.category || 'food',
    subCategory: tx.subCategory || null,
    date: tx.date || today(),
    paymentMethod: tx.paymentMethod || 'Cash',
    accountId: tx.accountId || '',
    note: tx.note || '',
    photo: null,
    items: txItems || []
  };

  closeModal('tx-detail-modal');
  openSplitterModal(amt);

  if(tx.desc && el('split-place-inp')) el('split-place-inp').value = tx.desc;
  if(el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);

  if(txItems && txItems.length > 0){
    switchSplitMode('itemized');
    splitFriends = txItems.map((it, idx) => ({
      name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
      amount: Math.abs(parseFloat(it.price)) || 0
    }));
    renderSplitFriendsList();
  }

  calcBillSplit();
  updateSplitterContextBanner();

  toast(isZh ? `🍕 已载入账单: ${tx.desc} (RM ${amt.toFixed(2)}) 到分摊器！` : `🍕 Loaded ${tx.desc} (RM ${amt.toFixed(2)}) into Splitter!`);
}

function splitCurrentTxModal(){
  const amt = Math.abs(parseFloat(el('tx-amount')?.value)) || 0;
  const desc = (el('tx-desc')?.value || '').trim();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(amt <= 0){
    toast(isZh ? '⚠️ 请先输入账单金额' : '⚠️ Enter an amount first');
    el('tx-amount')?.focus();
    return;
  }

  activeSplitContext = {
    source: editingTxId ? 'edit_tx' : 'new_tx',
    originalTxId: editingTxId || null,
    merchant: desc || 'Bill',
    amount: amt,
    category: selCat || 'food',
    subCategory: selSubCat || null,
    date: el('tx-date')?.value || today(),
    paymentMethod: el('tx-paymethod-val')?.value || 'Cash',
    accountId: el('tx-acc-select')?.value || '',
    note: el('tx-note')?.value || '',
    photo: null,
    items: (currentOcrItems && currentOcrItems.length > 0) ? JSON.parse(JSON.stringify(currentOcrItems)) : []
  };

  closeModal('tx-modal');
  openSplitterModal(amt);

  if(desc && el('split-place-inp')) el('split-place-inp').value = desc;
  if(el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);

  if(activeSplitContext.items.length > 0){
    switchSplitMode('itemized');
    splitFriends = activeSplitContext.items.map((it, idx) => ({
      name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
      amount: Math.abs(parseFloat(it.price)) || 0
    }));
    renderSplitFriendsList();
  }

  calcBillSplit();
  updateSplitterContextBanner();

  toast(isZh ? `🍕 已将此账单带入分摊器: ${desc || '账单'} (RM ${amt.toFixed(2)})` : `🍕 Splitting ${desc || 'Bill'} (RM ${amt.toFixed(2)})!`);
}

function openFullPhotoView(){}

function openEditTxModal(txId){
  currentDetailTxId = txId;
  editTxFromDetail();
}

function editTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  if(isInternalTransfer(tx)){
    toast(S.lang === 'zh' ? '内部转账请删除后重新建立，以保持两边账户余额正确。' : 'Delete and recreate an internal transfer to keep both account balances correct.');
    return;
  }
  closeModal('tx-detail-modal');

  openTxModal(tx.type);
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  el('tx-modal-title').textContent = tx.type === 'income'
    ? (isZh ? '✏️ 修改收入 (Edit Income)' : '✏️ Edit Income')
    : (isZh ? '✏️ 修改支出 (Edit Expense)' : '✏️ Edit Expense');

  el('tx-amount').value = (Number(tx.amount) || 0).toFixed(2);
  el('tx-desc').value = tx.desc || '';
  el('tx-date').value = normalizeDateStr(tx.date) || today();
  if(el('tx-time')) el('tx-time').value = tx.time || '';
  if(el('tx-location')) el('tx-location').value = tx.location || '';
  if(el('tx-note')) el('tx-note').value = tx.note || '';

  selCat = tx.category;
  selSubCat = tx.subCategory || null;
  showAllTxSubCats = false;
  if(el('tx-cats')) buildCats('tx-cats', tx.type, id => selCat = id);
  if(tx.accountId) setTxAccount(tx.accountId);
  if(tx.paymentMethod) selectPaymentMethod(tx.paymentMethod);
  photoData = null;

  // Preserve extracted OCR items so editing doesn't lose them!
  const txItems = extractTxReceiptItems(tx);
  if(txItems && txItems.length > 0){
    currentOcrItems = JSON.parse(JSON.stringify(txItems));
  }

  const isAdv = Boolean(tx.isAdvance || tx.advance);
  if(isAdv){
    toggleTxMoreDetails(true);
    const chk = el('tx-is-advance'); if(chk) chk.checked = true;
    const det = el('tx-advance-details'); if(det) det.classList.remove('hidden');
    const inp = el('tx-advance-person'); if(inp) inp.value = tx.advancePerson || tx.advanceDebtor || '';
    const st = el('tx-advance-status'); if(st) st.value = tx.advanceStatus || (tx.advanceReimbursed ? 'reimbursed' : 'pending');
  }

  // Load existing tags
  currentTxTags = Array.isArray(tx.tags) ? [...tx.tags] : [];
  if(typeof renderTxTagChips === 'function') renderTxTagChips();
  if(currentTxTags.length > 0) toggleTxMoreDetails(true);

  // Store the editing ID — the old transaction is updated when saveTx() runs
  editingTxId = currentDetailTxId;
}

function repeatTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  if(isInternalTransfer(tx)){
    toast(S.lang === 'zh' ? '内部转账不能单独复制。' : 'An internal transfer cannot be duplicated by itself.');
    return;
  }
  const newTx = {
    ...JSON.parse(JSON.stringify(tx)),
    id: uid('item'),
    date: today(),
    time: currentTimeStr(),
    createdAt: new Date().toISOString()
  };
  S.transactions.unshift(newTx);
  save();
  renderAll();
  renderCalendar();
  closeModal('tx-detail-modal');
  toast(`🔁 Duplicated: ${tx.desc} · ${fmt(tx.amount)}`);
}

function deleteTxFromDetail(){
  if(!currentDetailTxId) return;
  deleteTx(currentDetailTxId);
  closeModal('tx-detail-modal');
}

function makeTxEl(tx){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const presentation = transactionPresentation(tx, isZh);
  const cat=presentation.category;
  const subCat = getSubCatInfo(tx.subCategory);
  const col=presentation.color;
  const acc=S.accounts.find(a=>a.id===tx.accountId);
  const accIco = acc ? getAccIcon(acc) : '💳';
  const payM = tx.paymentMethod || '';
  const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';
  const txCal = getTxCalories(tx);
  const txProt = getTxProtein(tx);

  const div=document.createElement('div');
  div.className='tx-item';
  div.dataset.id=tx.id;

  div.innerHTML=`
    <div class="tx-item-inner" style="cursor:pointer">
      <div class="tx-cat-icon" style="background:${col}22;overflow:hidden">
        ${cat.icon}
      </div>
      <div class="tx-info">
        <div class="tx-desc" style="display:flex;align-items:center;gap:6px">
          <span>${esc(tx.desc)}</span>
        </div>
        <div class="tx-sub">
          <span>${subCat ? `${subCat.icon} ${esc(subCat.name)}` : esc(cat.name)}</span>
          ${txCal > 0 ? `<span class="tx-badge" style="background:rgba(16,185,129,.14);color:#10b981;font-weight:800;border:1px solid rgba(16,185,129,.3);padding:1px 5px">🔥 ${txCal} kcal${txProt > 0 ? ` · 🥩 ${txProt}g` : ''}</span>` : ''}
          ${tx.isAdvance ? `<span class="tx-badge" style="background:${tx.advanceStatus==='reimbursed'?'rgba(74,222,128,.16)':'rgba(255,179,0,.16)'};color:${tx.advanceStatus==='reimbursed'?'var(--green)':'var(--amber)'};font-weight:700">📌 ${tx.advanceStatus==='reimbursed'? (isZh?'已报销':'Reimbursed') : (isZh?'待报销':'Claimable')}</span>` : ''}
          ${tx.time ? `<span class="tx-badge" style="background:rgba(255,255,255,0.05);color:var(--dim)">⏰ ${tx.time}</span>` : ''}
          ${payM ? `<span class="tx-badge tx-badge-method">⚡ ${esc(payM)}</span>` : ''}
          ${tx.location ? `<span class="tx-badge tx-badge-loc">📍 ${esc(tx.location)}</span>` : ''}
          ${cleanNote ? `<span style="color:var(--text)">· ${esc(cleanNote)}</span>` : ''}
          ${(Array.isArray(tx.tags) && tx.tags.length > 0) ? tx.tags.map(tg => `<span class="tx-badge" style="background:rgba(245,158,11,.14);color:var(--amber);font-weight:700">#${esc(tg)}</span>`).join('') : ''}
        </div>
      </div>
      <div class="tx-amt ${tx.type}" style="color:${presentation.amountColor}">${presentation.amountPrefix}${fmt(tx.amount)}</div>
    </div>
    <button class="tx-item-delete-btn" type="button" title="Delete">🗑️</button>
  `;

  const inner = div.querySelector('.tx-item-inner');
  const delBtn = div.querySelector('.tx-item-delete-btn');

  // Direct swipe-to-delete button
  if(delBtn){
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTx(tx.id, true);
    };
  }

  // Ultra-Smooth Touch Swipe Gesture
  if(inner){
    let startX = 0, startY = 0, currentDx = 0;
    let isHorizontal = null;
    let isDragging = false;

    inner.addEventListener('touchstart', e => {
    if(e.touches.length > 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentDx = 0;
    isHorizontal = null;
    isDragging = false;
    inner.style.transition = 'none';

    // Close other swiped items
    document.querySelectorAll('.tx-item.swiped').forEach(other => {
      if(other !== div) other.classList.remove('swiped');
    });
  }, { passive: true });

  inner.addEventListener('touchmove', e => {
    if(e.touches.length > 1) return;
    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;
    const dx = moveX - startX;
    const dy = moveY - startY;

    if(isHorizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)){
      isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if(isHorizontal){
      isDragging = true;
      const isAlreadySwiped = div.classList.contains('swiped');
      const baseOffset = isAlreadySwiped ? -76 : 0;
      let targetX = baseOffset + dx;

      if(targetX > 0) targetX = targetX * 0.2;
      if(targetX < -95) targetX = -95 + (targetX + 95) * 0.2;

      currentDx = targetX;
      inner.style.transform = `translateX(${targetX}px)`;
    }
  }, { passive: true });

  const finishSwipe = () => {
    inner.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
    const isAlreadySwiped = div.classList.contains('swiped');

    if(isDragging){
      if(isAlreadySwiped){
        if(currentDx > -45){
          div.classList.remove('swiped');
        } else {
          div.classList.add('swiped');
        }
      } else {
        if(currentDx < -35){
          div.classList.add('swiped');
        } else {
          div.classList.remove('swiped');
        }
      }
    }
    inner.style.transform = '';
    setTimeout(() => { isDragging = false; }, 60);
  };

  inner.addEventListener('touchend', finishSwipe, { passive: true });
  inner.addEventListener('touchcancel', finishSwipe, { passive: true });

  // Tap opens the rich Transaction Details Sheet if not dragging
  inner.onclick = (e) => {
    if(isDragging) return;
    if(div.classList.contains('swiped')){
      div.classList.remove('swiped');
      return;
    }
    openTxDetailModal(tx.id);
  };
  }

  return div;
}

function deleteTx(id, skipConfirm = false){
  const tx=S.transactions.find(t=>t.id===id); if(!tx) return;
  const isTransfer = isInternalTransfer(tx);
  const cat=transactionPresentation(tx, S.lang === 'zh').category;
  const confirmation = isTransfer
    ? (S.lang === 'zh' ? '删除这笔内部转账？\n\n两个账户的对应转账记录都会移除。' : 'Delete this internal transfer?\n\nThe matching entry in the other account will also be removed.')
    : 'Delete this transaction?\n\n'+cat.icon+' '+tx.desc+'\n'+fmt(tx.amount)+' · '+tx.date;
  if(skipConfirm || confirm(confirmation)){
    S.transactions = S.transactions.filter(t => isTransfer ? (t.transferId !== tx.transferId) : (t.id !== tx.id));
    save();renderAll();toast(isTransfer ? (S.lang === 'zh' ? '🗑️ 内部转账已删除' : '🗑️ Internal transfer deleted') : '🗑️ Transaction deleted');
    return true;
  }
  return false;
}
