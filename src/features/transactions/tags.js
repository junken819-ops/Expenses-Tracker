/**
 * Transaction Tags & Labels System (#tags)
 * Modularized from Pocket Winnie Core
 */

// FEATURE 3: TRANSACTION TAGS & LABELS SYSTEM (#tags)
// ═══════════════════════════════════════════════════════════════════
let currentTxTags = [];
let activeTxTagFilter = 'all';

function renderTxTagChips(){
  const container = el('tx-selected-tags');
  if(!container) return;
  container.innerHTML = '';
  if(!currentTxTags || !currentTxTags.length){
    container.innerHTML = '<span style="font-size:11px;color:var(--muted);font-style:italic">No tags added yet</span>';
    return;
  }
  currentTxTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tx-tag-chip';
    chip.innerHTML = `#${esc(tag)} <span class="tag-del" onclick="removeTxTag('${esc(tag)}')" title="Remove tag">✕</span>`;
    container.appendChild(chip);
  });
  // Update quick tag pills active state
  document.querySelectorAll('.quick-tag-pill').forEach(pill => {
    const t = pill.textContent.replace(/^[^\w#]+/, '').replace('#', '').trim();
    if(currentTxTags.includes(t)) pill.classList.add('on');
    else pill.classList.remove('on');
  });
}

function addCustomTxTag(tagStr){
  const inp = el('tx-tag-inp');
  const raw = tagStr || (inp ? inp.value : '');
  const clean = String(raw).replace(/[#,\s]/g, '').trim().toLowerCase();
  if(!clean) return;
  if(!currentTxTags.includes(clean)){
    currentTxTags.push(clean);
    renderTxTagChips();
  }
  if(inp) inp.value = '';
}

function removeTxTag(tagStr){
  currentTxTags = currentTxTags.filter(t => t !== tagStr);
  renderTxTagChips();
}

function toggleQuickTag(tagStr){
  const clean = String(tagStr).replace(/[#,\s]/g, '').trim().toLowerCase();
  if(currentTxTags.includes(clean)){
    removeTxTag(clean);
  } else {
    addCustomTxTag(clean);
  }
}

function handleTxTagKeyDown(e){
  if(e.key === 'Enter' || e.key === ','){
    e.preventDefault();
    addCustomTxTag();
  }
}

function renderTxTagFilterBar(){
  const bar = el('tx-tag-filter-bar');
  if(!bar) return;
  // Collect all unique tags in S.transactions
  const tagSet = new Set();
  (S.transactions || []).forEach(t => {
    if(Array.isArray(t.tags)){
      t.tags.forEach(tg => { if(tg) tagSet.add(tg.toLowerCase().trim()); });
    }
  });

  if(!tagSet.size){
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }

  bar.style.display = 'flex';
  bar.innerHTML = '';

  // "All Tags" pill
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `chip ${activeTxTagFilter === 'all' ? 'on' : ''}`;
  allBtn.style.cssText = 'font-size:11px;padding:4px 10px;cursor:pointer';
  allBtn.textContent = '🏷️ All Tags';
  allBtn.onclick = () => setTxTagFilter('all');
  bar.appendChild(allBtn);

  // Each unique tag
  Array.from(tagSet).sort().forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip ${activeTxTagFilter === tag ? 'on' : ''}`;
    btn.style.cssText = 'font-size:11px;padding:4px 10px;cursor:pointer';
    btn.textContent = `#${tag}`;
    btn.onclick = () => setTxTagFilter(tag);
    bar.appendChild(btn);
  });
}

function setTxTagFilter(tag){
  activeTxTagFilter = tag;
  renderFullTx();
}

window.toggleQuickTag = toggleQuickTag;
window.addCustomTxTag = addCustomTxTag;
window.removeTxTag = removeTxTag;
window.handleTxTagKeyDown = handleTxTagKeyDown;
window.setTxTagFilter = setTxTagFilter;
window.renderTxTagChips = renderTxTagChips;
window.renderTxTagFilterBar = renderTxTagFilterBar;

// ═══════════════════════════════════════════════════════════════════