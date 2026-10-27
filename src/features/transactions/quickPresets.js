/**
 * Quick Presets Management
 * Modularized from Pocket Winnie Core
 */

// ── RENDER & MANAGE: QUICK PRESETS (HOME) ─────────────
const PRESET_ICONS = ['🍜','☕','⛽','🚗','🛒','🅿️','🍔','🎬','💊','🥪','🧋','🏸','🎮','📚','🧺','👕','✈️','⚡','🎁','🍿','🍕','🍣','🥤','🐱','🐾'];

function editQuickLogSectionTitle(){
  const cur = S.quickLogTitle || '⚡ Quick Log';
  const next = prompt('Rename Section Title:', cur);
  if(next !== null && next.trim()){
    S.quickLogTitle = next.trim();
    save();
    renderQuickPresets();
    toast('✅ Title updated: ' + S.quickLogTitle);
  }
}

function openQuickPresetModal(idx){
  el('qp-edit-idx').value = idx;
  const isNew = idx === -1 || idx === undefined;
  el('qp-modal-title').textContent = isNew ? 'Add Quick Shortcut' : 'Edit Shortcut';
  el('qp-del-btn').style.display = isNew ? 'none' : 'block';

  let p = isNew ? {icon:'🍜', name:'', amount:'', category:'food'} : S.quickPresets[idx];
  if(!p) p = {icon:'🍜', name:'', amount:'', category:'food'};

  el('qp-name-inp').value = p.name || '';
  el('qp-amount-inp').value = p.amount ? p.amount : '';
  el('qp-icon-val').value = p.icon || '🍜';
  el('qp-cat-val').value = p.category || 'food';

  // Render Icon Picker
  const picker = el('qp-icon-picker');
  picker.innerHTML = '';
  PRESET_ICONS.forEach(ico => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-opt' + (ico === (p.icon||'🍜') ? ' on' : '');
    btn.textContent = ico;
    btn.onclick = () => {
      picker.querySelectorAll('.icon-opt').forEach(x=>x.classList.remove('on'));
      btn.classList.add('on');
      el('qp-icon-val').value = ico;
    };
    picker.appendChild(btn);
  });

  // Render Category Picker
  buildCats('qp-cats', 'expense', id => {
    el('qp-cat-val').value = id;
  });
  
  setTimeout(()=>{
    const wrap = el('qp-cats');
    if(wrap){
      wrap.querySelectorAll('.cat-chip').forEach(c=>{
        c.classList.toggle('on', c.dataset.id === (p.category||'food'));
      });
    }
  }, 50);

  openModal('quick-preset-modal');
  setTimeout(()=>el('qp-name-inp').focus(), 150);
}

function saveQuickPreset(){
  const idx = parseInt(el('qp-edit-idx').value);
  const name = el('qp-name-inp').value.trim();
  const amount = parseFloat(el('qp-amount-inp').value);
  const icon = el('qp-icon-val').value || '🍜';
  const category = el('qp-cat-val').value || 'food';

  if(!name){ toast('⚠️ Please enter a shortcut name'); return; }
  if(!amount || amount <= 0){ toast('⚠️ Please enter a valid amount'); return; }

  const presetObj = { icon, name, amount, category };

  if(idx >= 0 && idx < S.quickPresets.length){
    S.quickPresets[idx] = presetObj;
  } else {
    S.quickPresets.push(presetObj);
  }

  save();
  renderQuickPresets();
  closeModal('quick-preset-modal');
  toast(`✅ Shortcut "${name}" saved!`);
}

function deleteQuickPreset(){
  const idx = parseInt(el('qp-edit-idx').value);
  if(idx >= 0 && idx < S.quickPresets.length){
    const name = S.quickPresets[idx].name;
    S.quickPresets.splice(idx, 1);
    save();
    renderQuickPresets();
    closeModal('quick-preset-modal');
    toast(`🗑️ Shortcut "${name}" removed`);
  }
}

function renderQuickPresets(){
  const titleEl = el('quick-log-title');
  if(titleEl) titleEl.textContent = S.quickLogTitle || '⚡ Quick Log';

  const row=el('quick-preset-row'); if(!row) return;
  row.innerHTML='';

  if(!S.quickPresets.length){
    row.innerHTML = `<div style="font-size:12px;color:var(--dim);padding:10px 4px">No shortcuts. Tap <strong>＋ Add</strong> to create one!</div>`;
    return;
  }

  S.quickPresets.forEach((p, idx)=>{
    const card=document.createElement('div');
    card.className='quick-preset-card';
    card.innerHTML=`<div class="qp-ico">${p.icon}</div><div class="qp-name">${esc(p.name)}</div><div class="qp-amt">RM ${Number(p.amount).toFixed(0)}</div>`;
    
    // Single click: quick log; Double click / 2 times: edit preset
    let qpClicks = 0;
    let qpTimer = null;
    card.onclick = () => {
      qpClicks++;
      if(qpClicks === 1){
        qpTimer = setTimeout(() => {
          qpClicks = 0;
          quickLogExpense(idx);
        }, 280);
      } else if(qpClicks >= 2){
        clearTimeout(qpTimer);
        qpClicks = 0;
        if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
        openQuickPresetModal(idx);
      }
    };
    card.ondblclick = (e) => {
      e.preventDefault();
      if(qpTimer) clearTimeout(qpTimer);
      qpClicks = 0;
      if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
      openQuickPresetModal(idx);
    };
    
    row.appendChild(card);
  });
}

function quickLogExpense(index){
  const p = S.quickPresets[index];
  if(!p) return;
  const accId = getActiveAccountId();
  if(!accId){
    toast('⚠️ Please create a bank or wallet first');
    return;
  }
  const acc = S.accounts.find(a=>a.id===accId);
  const accName = acc ? acc.name : 'Wallet';

  const tx = {
    id: uid('item'),
    type: 'expense',
    amount: Number(p.amount),
    desc: p.name,
    category: p.category || 'food',
    date: today(),
    accountId: accId,
    paymentMethod: 'Cash',
    note: '1-Tap Quick Log',
    photo: null,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(tx);
  S.lastUsedAccId = accId;
  save();
  renderAll();
  toast(`⚡ Logged RM ${Number(p.amount).toFixed(2)} for ${p.name} (${accName})`);

  checkAndPromptAccountOverdraft(tx.accountId, tx.amount);

  const aiAlert = getTxInstantAiAlert(tx);
  if(aiAlert){
    setTimeout(() => toast(aiAlert, 4200), 1200);
  }
}
