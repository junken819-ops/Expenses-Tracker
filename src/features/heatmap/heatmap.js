/**
 * Visual Spending Heatmap
 * Modularized from Pocket Winnie Core
 */

// FEATURE 4: VISUAL SPENDING HEATMAP
// ═══════════════════════════════════════════════════════════════════
let heatmapInspectedYear = new Date().getFullYear();

function getHeatmapLevel(spent){
  if(!spent || spent <= 0) return 0;
  if(spent <= 30) return 1;
  if(spent <= 80) return 2;
  if(spent <= 200) return 3;
  return 4;
}

function calculateHeatmapDailyMap(year){
  const dailyMap = {};
  (S.transactions || []).forEach(t => {
    if(t.type === 'expense' && t.date && t.date.startsWith(String(year))){
      const amt = Number(t.amount) || 0;
      dailyMap[t.date] = (dailyMap[t.date] || 0) + amt;
    }
  });
  return dailyMap;
}

function renderSpendingHeatmap(){
  const year = heatmapInspectedYear;
  const dailyMap = calculateHeatmapDailyMap(year);
  
  let totalSpent = 0;
  let trackedDays = 0;
  let noSpendDays = 0;

  const overviewWrap = el('ana-heatmap-grid-wrap');
  if(overviewWrap){
    overviewWrap.innerHTML = generateHeatmapHtml(16, dailyMap);
  }

  const fullWrap = el('hm-full-grid-wrap');
  if(fullWrap){
    fullWrap.innerHTML = generateHeatmapHtml(52, dailyMap, year);
  }

  const today = new Date();
  const startOfYear = new Date(year, 0, 1);
  const endLimit = (year === today.getFullYear()) ? today : new Date(year, 11, 31);
  
  for(let d = new Date(startOfYear); d <= endLimit; d.setDate(d.getDate() + 1)){
    const dStr = d.toISOString().slice(0, 10);
    const spent = dailyMap[dStr] || 0;
    totalSpent += spent;
    trackedDays++;
    if(spent === 0) noSpendDays++;
  }

  if(el('ana-hm-nospend-stat')) el('ana-hm-nospend-stat').textContent = `🔥 ${noSpendDays} No-Spend Days in ${year}`;
  if(el('hm-stat-nospend')) el('hm-stat-nospend').textContent = noSpendDays;
  if(el('hm-stat-total-spent')) el('hm-stat-total-spent').textContent = `Total: ${fmt(totalSpent)}`;
}

function generateHeatmapHtml(numWeeks, dailyMap, specificYear){
  const today = new Date();
  let endDate = today;
  if(specificYear && specificYear !== today.getFullYear()){
    endDate = new Date(specificYear, 11, 31);
  }

  const totalDays = numWeeks * 7;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  let cellsHtml = '';
  for(let i = 0; i < totalDays; i++){
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dStr = cur.toISOString().slice(0, 10);
    const spent = dailyMap[dStr] || 0;
    const lvl = getHeatmapLevel(spent);
    cellsHtml += `
      <div class="heatmap-cell hm-level-${lvl}" 
           data-date="${dStr}" 
           data-spent="${spent}" 
           title="${dStr}: ${spent > 0 ? fmt(spent) : 'No Spend 🌿'}"
           onclick="inspectHeatmapDay('${dStr}', ${spent})"></div>
    `;
  }

  return `<div class="heatmap-grid" style="grid-template-columns: repeat(${numWeeks}, 13px);">${cellsHtml}</div>`;
}

function inspectHeatmapDay(dateStr, spent){
  if(el('hm-inspect-date')) el('hm-inspect-date').textContent = fmtDate(dateStr);
  if(el('hm-inspect-amt')) el('hm-inspect-amt').textContent = spent > 0 ? fmt(spent) : 'RM 0.00 (No Spend! 🍯)';
  
  const txs = (S.transactions || []).filter(t => t.date === dateStr);
  const txContainer = el('hm-inspect-txs');
  if(txContainer){
    if(!txs.length){
      txContainer.innerHTML = '<div style="font-size:11px;color:#10b981;padding:4px 0">🌿 Zero expenses recorded on this day. Great job saving honey!</div>';
    } else {
      txContainer.innerHTML = txs.map(t => {
        const cat = getCatInfo(t.category);
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:5px 8px;font-size:11px">
            <div style="display:flex;align-items:center;gap:6px">
              <span>${cat.icon || '🧾'}</span>
              <span style="font-weight:700">${esc(t.desc)}</span>
            </div>
            <span style="font-weight:800;color:${t.type==='income'?'var(--green)':'var(--red)'}">${t.type==='income'?'+':'-'}${fmt(t.amount)}</span>
          </div>
        `;
      }).join('');
    }
  }
}

function openHeatmapModal(){
  renderSpendingHeatmap();
  openModal('heatmap-modal');
}

function selectHeatmapYear(year){
  heatmapInspectedYear = Number(year);
  if(el('hm-year-cur')) el('hm-year-cur').classList.toggle('on', year === 2026);
  if(el('hm-year-prev')) el('hm-year-prev').classList.toggle('on', year === 2025);
  renderSpendingHeatmap();
}

window.openHeatmapModal = openHeatmapModal;
window.selectHeatmapYear = selectHeatmapYear;
window.inspectHeatmapDay = inspectHeatmapDay;
window.renderSpendingHeatmap = renderSpendingHeatmap;

// ═══════════════════════════════════════════════════════════════════