/**
 * Category Picker & Manager Logic
 * Modularized from Pocket Winnie Core
 */

// ── CATEGORY PICKER & MANAGER LOGIC ───────────────────
let curCatMgrType = 'expense';
let curCatEditIcon = '🍜';

function autoFillCategoryDesc(containerId, type, catId){
  let inp = null;
  if(containerId === 'tx-cats') inp = el('tx-desc');
  else if(containerId === 'rec-cats') inp = el('rec-desc-inp');
  else if(containerId === 'rem-cats') inp = el('rem-name-inp');
  else if(containerId === 'qp-cats') inp = el('qp-name-inp');

  if(!inp) return;

  const info = catInfo(type, catId);
  if(!info || !info.name) return;

  const curVal = (inp.value || '').trim();
  if(!curVal){
    inp.value = info.name;
    return;
  }

  // If current value matches ANY known category name or id, auto-update it to the new selected category
  const allCats = [...getCategories('expense'), ...getCategories('income')];
  const matchesKnownCategory = allCats.some(c => {
    const cInfExp = catInfo('expense', c.id);
    const cInfInc = catInfo('income', c.id);
    const curLower = curVal.toLowerCase();
    return curLower === (c.name || '').toLowerCase() ||
           curLower === (cInfExp?.name || '').toLowerCase() ||
           curLower === (cInfInc?.name || '').toLowerCase() ||
           curLower === (c.id || '').toLowerCase() ||
           (c.nameZh && curLower === c.nameZh.toLowerCase()) ||
           (c.nameEn && curLower === c.nameEn.toLowerCase());
  });

  if(matchesKnownCategory){
    inp.value = info.name;
  }
}

function getSubCategoryRegistry(type){
  return type === 'income' ? MASTER_INC_SUB_CATEGORIES : MASTER_SUB_CATEGORIES;
}

function getSelectableSubCategories(type){
  const registry = getSubCategoryRegistry(type);
  return Object.entries(registry).map(([id, item]) => ({ id, ...item }));
}

function autoFillTxSubCategoryDesc(subId){
  const inp = el('tx-desc');
  const sub = getSubCatInfo(subId);
  if(!inp || !sub) return;
  const parent = catInfo(txType, sub.parent);
  const current = (inp.value || '').trim().toLowerCase();
  const parentName = (parent?.name || '').toLowerCase();
  if(!current || current === parentName || current === sub.parent.toLowerCase()){
    inp.value = sub.name;
  }
}

function renderTxSubCategoryPicker(){
  const picker = el('tx-subcat-picker');
  if(!picker) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const count = getSelectableSubCategories(txType).length;
  const currentSub = selSubCat ? getSubCatInfo(selSubCat) : null;
  const catSubCats = getSelectableSubCategories(txType).filter(item => item.parent === selCat);

  // If this category has no subcategories and user is not searching all, hide cleanly
  if(!showAllTxSubCats && !catSubCats.length && !selSubCat){
    picker.innerHTML = '';
    return;
  }

  const selectedLabel = currentSub
    ? `${currentSub.icon} ${esc(currentSub.name)}`
    : '';

  picker.innerHTML = `
    <div class="subcat-picker-clean" style="margin-top:4px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.025);border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div style="font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;gap:6px">
          <span>${isZh ? '细分类 (可选)' : 'Subcategory (optional)'}</span>
          ${selectedLabel ? `<span style="color:var(--cyan);font-weight:800;background:rgba(6,182,212,.12);padding:1px 7px;border-radius:6px">${selectedLabel}</span>` : ''}
        </div>
        <button type="button" class="subcat-show-all" id="tx-subcat-scope" style="background:none;border:none;color:var(--amber);font-size:10.5px;font-weight:700;cursor:pointer;padding:2px 4px">
          ${showAllTxSubCats ? (isZh ? '收起 ▴' : 'Less ▴') : (isZh ? `🔍 搜索全部 (${count}) ▾` : `🔍 Search all (${count}) ▾`)}
        </button>
      </div>
      ${showAllTxSubCats ? `
        <input type="search" id="tx-subcat-search" class="subcat-search" style="padding:6px 10px;font-size:11.5px;margin-bottom:6px" autocomplete="off" placeholder="${isZh ? '搜索细分类：咖啡、诊所、路税…' : 'Search subcategories: coffee, clinic…'}" aria-label="${isZh ? '搜索细分类' : 'Search specific categories'}" />
      ` : ''}
      <div class="subcat-list" id="tx-subcat-list"></div>
    </div>
  `;

  const search = el('tx-subcat-search');
  if(search) search.addEventListener('input', () => filterTxSubCategories(search.value));
  const scope = el('tx-subcat-scope');
  if(scope) scope.addEventListener('click', () => {
    showAllTxSubCats = !showAllTxSubCats;
    renderTxSubCategoryPicker();
  });
  filterTxSubCategories(search ? search.value : '');
}

function filterTxSubCategories(query = ''){
  const list = el('tx-subcat-list');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const needle = String(query || '').trim().toLocaleLowerCase();
  const options = getSelectableSubCategories(txType);
  const matching = options
    .filter(item => {
      const parent = catInfo(txType, item.parent) || {};
      if(needle){
        return [item.id, item.name, item.nameZh, item.parent, parent.name, parent.nameZh]
          .filter(Boolean)
          .some(value => String(value).toLocaleLowerCase().includes(needle));
      }
      return showAllTxSubCats || item.parent === selCat;
    })
    .sort((a, b) => {
      const aCurrent = a.parent === selCat ? 0 : 1;
      const bCurrent = b.parent === selCat ? 0 : 1;
      return aCurrent - bCurrent || a.name.localeCompare(b.name);
    });

  list.innerHTML = '';
  if(!matching.length){
    list.innerHTML = `<div class="subcat-empty">${isZh ? '没有相符分类。试试英文或中文关键字。' : 'No matching category. Try a different keyword.'}</div>`;
    return;
  }

  matching.forEach(item => {
    const info = getSubCatInfo(item.id);
    const parent = catInfo(txType, item.parent) || { name: item.parent };
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subcat-chip' + (selSubCat === item.id ? ' on' : '');
    button.innerHTML = `<span>${info.icon} ${esc(info.name)}</span>${(needle || showAllTxSubCats) ? `<span class="subcat-parent">${esc(parent.name)}</span>` : ''}`;
    button.title = `${parent.name} › ${info.name}`;
    button.addEventListener('click', () => selectTxSubCategory(item.id));
    list.appendChild(button);
  });
}

function selectTxSubCategory(subId){
  const item = getSubCategoryRegistry(txType)[subId];
  if(!item) return;

  if(selSubCat === subId){
    selSubCat = null;
  } else {
    selSubCat = subId;
    selCat = item.parent;
  }
  buildCats('tx-cats', txType, id => selCat = id);
  if(selSubCat) autoFillTxSubCategoryDesc(selSubCat);
}

function buildCats(containerId, type, onSel){
  const allCats = getCategories(type);
  const wrap = el(containerId); if(!wrap) return;
  wrap.innerHTML = '';

  if(wrap.tagName === 'SELECT'){
    allCats.forEach(c => {
      const info = catInfo(type, c.id);
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${info.icon} ${info.name}`;
      wrap.appendChild(opt);
    });
    if(containerId === 'bud-cats' || containerId === 'bud-cat'){
      if(selBudCat) wrap.value = selBudCat;
      else if(allCats[0]) { selBudCat = allCats[0].id; wrap.value = selBudCat; }
    }
    wrap.onchange = () => {
      if(containerId === 'bud-cats' || containerId === 'bud-cat') selBudCat = wrap.value;
      if(typeof onSel === 'function') onSel(wrap.value);
    };
    if(typeof onSel === 'function' && wrap.value) onSel(wrap.value);
    return;
  }

  let currentSelected = null;
  if(containerId === 'tx-cats') currentSelected = selCat;
  else if(containerId === 'bud-cats') currentSelected = selBudCat;
  else if(containerId === 'rem-cats') currentSelected = selRemCat;
  else if(containerId === 'rec-cats') currentSelected = selRecCat;
  else if(containerId === 'qp-cats') currentSelected = selQpCat;

  if(!currentSelected && allCats.length > 0){
    currentSelected = allCats[0].id;
    if(containerId === 'tx-cats') selCat = currentSelected;
    onSel(currentSelected);
    autoFillCategoryDesc(containerId, type, currentSelected);
  } else if(currentSelected){
    autoFillCategoryDesc(containerId, type, currentSelected);
  }

  if(containerId === 'tx-cats' && selSubCat){
    const sub = getSubCatInfo(selSubCat);
    if(!sub || sub.parent !== currentSelected) selSubCat = null;
  }

  allCats.forEach((c) => {
    const info = catInfo(type, c.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = c.id === currentSelected;
    btn.className = 'cat-chip' + (isSelected ? ' on' : '');
    btn.dataset.id = c.id;
    btn.innerHTML = `<span class="cat-chip-icon">${info.icon}</span><span class="cat-chip-name">${esc(info.name)}</span>`;
    btn.onclick = () => {
      wrap.querySelectorAll('.cat-chip').forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      if(containerId === 'tx-cats'){
        selCat = c.id;
        selSubCat = null;
      }
      else if(containerId === 'bud-cats') selBudCat = c.id;
      else if(containerId === 'rem-cats') selRemCat = c.id;
      else if(containerId === 'rec-cats') selRecCat = c.id;
      else if(containerId === 'qp-cats') selQpCat = c.id;
      autoFillCategoryDesc(containerId, type, c.id);
      onSel(c.id);
    };
    wrap.appendChild(btn);
  });

  // Trailing "+ Manage" button chip
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'cat-chip cat-chip-add';
  addBtn.innerHTML = `<span class="cat-chip-icon">⚙️</span><span class="cat-chip-name">${S.lang === 'zh' ? '管理分类' : 'Edit Categories'}</span>`;
  addBtn.onclick = () => openCategoryManager(type);
  wrap.appendChild(addBtn);

  // Scroll active element into center view
  const activeBtn = wrap.querySelector('.cat-chip.on');
  if(activeBtn){
    setTimeout(() => {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 60);
  }

  if(containerId === 'tx-cats') renderTxSubCategoryPicker();
}

let catMgrCallerModal = null;

function openCategoryManager(type = 'expense'){
  if(el('tx-modal') && !el('tx-modal').classList.contains('hidden')){
    catMgrCallerModal = 'tx-modal';
  } else if(el('universal-upload-modal') && !el('universal-upload-modal').classList.contains('hidden')){
    catMgrCallerModal = 'universal-upload-modal';
  } else {
    catMgrCallerModal = null;
  }
  curCatMgrType = type === 'income' ? 'income' : 'expense';
  switchCatMgrTab(curCatMgrType);
  cancelCatEditForm();
  openModal('cat-manage-modal');
}

function handleCatMgrBack(){
  closeModal('cat-manage-modal');
  if(catMgrCallerModal === 'tx-modal'){
    if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
    openModal('tx-modal');
  } else if(catMgrCallerModal === 'universal-upload-modal'){
    openModal('universal-upload-modal');
    renderUniversalPreview();
  }
}

function switchCatMgrTab(type){
  curCatMgrType = type;
  if(el('cm-tab-exp')) el('cm-tab-exp').classList.toggle('on', type === 'expense');
  if(el('cm-tab-inc')) el('cm-tab-inc').classList.toggle('on', type === 'income');
  cancelCatEditForm();
  renderCatMgrList();
}

function renderCatMgrList(){
  const list = el('cat-mgr-list');
  if(!list) return;
  list.innerHTML = '';
  
  const cats = getCategories(curCatMgrType);
  if(!cats.length){
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No categories found. Click Add below!</div>';
    return;
  }

  cats.forEach(c => {
    const item = document.createElement('div');
    item.className = 'cat-mgr-item';
    item.innerHTML = `
      <div class="cat-mgr-item-left">
        <div class="cat-mgr-item-icon">${c.icon}</div>
        <div class="cat-mgr-item-name">${esc(c.name)}</div>
      </div>
      <div class="cat-mgr-item-actions">
        <button type="button" class="cat-mgr-btn" onclick="openAddCategoryForm('${c.id}')">✏️ Edit</button>
        <button type="button" class="cat-mgr-btn del" onclick="deleteCategory('${c.id}')">✕</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function openAddCategoryForm(editId = null){
  const form = el('cat-edit-form-wrap');
  const addBtn = el('cm-add-btn');
  if(!form) return;
  
  form.classList.remove('hidden');
  if(addBtn) addBtn.classList.add('hidden');

  const titleEl = el('cat-form-title');
  const nameInp = el('cm-name-inp');
  const editIdInp = el('cm-edit-id');
  
  if(editId){
    const cats = getCategories(curCatMgrType);
    const existing = cats.find(c => c.id === editId);
    if(existing){
      if(titleEl) titleEl.textContent = `Edit Category: ${existing.name}`;
      if(nameInp) nameInp.value = existing.name;
      if(editIdInp) editIdInp.value = existing.id;
      curCatEditIcon = existing.icon || '🍜';
    }
  } else {
    if(titleEl) titleEl.textContent = `Add New ${curCatMgrType === 'income' ? 'Income' : 'Expense'} Category`;
    if(nameInp) nameInp.value = '';
    if(editIdInp) editIdInp.value = '';
    curCatEditIcon = curCatMgrType === 'income' ? '💼' : '🍜';
  }

  renderCatIconPicker();
  if(nameInp) setTimeout(() => nameInp.focus(), 80);
}

function cancelCatEditForm(){
  const form = el('cat-edit-form-wrap');
  const addBtn = el('cm-add-btn');
  if(form) form.classList.add('hidden');
  if(addBtn) addBtn.classList.remove('hidden');
}

function renderCatIconPicker(){
  const picker = el('cm-icon-picker');
  if(!picker) return;
  picker.innerHTML = '';
  AVAILABLE_CAT_ICONS.forEach(icon => {
    const opt = document.createElement('div');
    opt.className = 'icon-opt' + (icon === curCatEditIcon ? ' on' : '');
    opt.textContent = icon;
    opt.onclick = () => {
      picker.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('on'));
      opt.classList.add('on');
      curCatEditIcon = icon;
    };
    picker.appendChild(opt);
  });
}

function saveCategoryFromMgr(){
  const nameInp = el('cm-name-inp');
  const editIdInp = el('cm-edit-id');
  const name = nameInp ? nameInp.value.trim() : '';
  const editId = editIdInp ? editIdInp.value.trim() : '';

  if(!name){
    toast('⚠️ Please enter a category name');
    return;
  }

  const key = curCatMgrType === 'income' ? 'incCategories' : 'expCategories';
  if(!S[key]) S[key] = JSON.parse(JSON.stringify(curCatMgrType === 'income' ? DEFAULT_INC_CATS : DEFAULT_EXP_CATS));

  if(editId){
    // Update existing category
    const cat = S[key].find(c => c.id === editId);
    if(cat){
      cat.name = name;
      cat.icon = curCatEditIcon;
      toast(`✅ Updated category: ${name}`);
    }
  } else {
    // Add new category
    const newId = 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2,5);
    S[key].push({
      id: newId,
      name: name,
      icon: curCatEditIcon
    });
    toast(`✅ Added category: ${name}`);
  }

  save();
  cancelCatEditForm();
  renderCatMgrList();
  refreshAllCategoryPickers();
}

function deleteCategory(id){
  const key = curCatMgrType === 'income' ? 'incCategories' : 'expCategories';
  if(!S[key]) S[key] = JSON.parse(JSON.stringify(curCatMgrType === 'income' ? DEFAULT_INC_CATS : DEFAULT_EXP_CATS));

  if(S[key].length <= 1){
    toast('⚠️ Cannot delete the only category');
    return;
  }

  const cat = S[key].find(c => c.id === id);
  const catName = cat ? cat.name : 'category';

  if(confirm(`Delete category "${catName}"? Existing transactions will keep their history.`)){
    S[key] = S[key].filter(c => c.id !== id);
    save();
    renderCatMgrList();
    refreshAllCategoryPickers();
    toast(`Category "${catName}" deleted`);
  }
}

function resetCategoriesToDefault(){
  if(confirm('Reset all categories back to default Malaysian finance categories?')){
    S.expCategories = JSON.parse(JSON.stringify(DEFAULT_EXP_CATS));
    S.incCategories = JSON.parse(JSON.stringify(DEFAULT_INC_CATS));
    save();
    renderCatMgrList();
    refreshAllCategoryPickers();
    toast('🔄 Categories reset to defaults!');
  }
}

function refreshAllCategoryPickers(){
  if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
  if(el('bud-cats')) buildCats('bud-cats', 'expense', id => selBudCat = id);
  if(el('rem-cats')) buildCats('rem-cats', 'expense', id => selRemCat = id);
  if(el('rec-cats')) buildCats('rec-cats', selRecType, id => selRecCat = id);
  if(el('qp-cats')) buildCats('qp-cats', 'expense', id => selQpCat = id);
  renderRecentTx();
  renderBudgets();
  renderReminders();
  renderRecurring();
}
