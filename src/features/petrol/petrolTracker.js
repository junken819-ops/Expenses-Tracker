/**
 * Malaysia Live Petrol Tracker & Tank Calculator
 * Modularized from Pocket Winnie Core
 */

// ── ⛽ MALAYSIA LIVE PETROL TRACKER & TANK CALCULATOR ───
let currentFuelType = 'ron95';
let petrolPrices = {
  ron95: 2.05,
  ron97: 3.19,
  diesel: 2.95
};

const CAR_TANK_PRESETS = [
  { name: 'Myvi (36L)', liters: 36, car: 'Perodua Myvi' },
  { name: 'Axia (33L)', liters: 33, car: 'Perodua Axia' },
  { name: 'Bezza (36L)', liters: 36, car: 'Perodua Bezza' },
  { name: 'Saga (40L)', liters: 40, car: 'Proton Saga' },
  { name: 'X50 (45L)', liters: 45, car: 'Proton X50' },
  { name: 'City (40L)', liters: 40, car: 'Honda City' },
  { name: 'Vios (42L)', liters: 42, car: 'Toyota Vios' },
  { name: 'Alza (43L)', liters: 43, car: 'Perodua Alza' },
  { name: 'CX-5 (56L)', liters: 56, car: 'Mazda CX-5' }
];

async function fetchLivePetrolPrices(){
  try{
    const res = await fetch('https://raw.githubusercontent.com/thewh1teagle/malaysia-petrol-prices-api/main/data.json');
    if(res.ok){
      const data = await res.json();
      if(data){
        if(data.ron95) petrolPrices.ron95 = Number(data.ron95) || 2.05;
        if(data.ron97) petrolPrices.ron97 = Number(data.ron97) || 3.19;
        if(data.diesel) petrolPrices.diesel = Number(data.diesel) || 2.95;
      }
    }
  }catch(e){}
  
  if(el('pt-price-ron95')) el('pt-price-ron95').textContent = `RM ${petrolPrices.ron95.toFixed(2)}`;
  if(el('pt-price-ron97')) el('pt-price-ron97').textContent = `RM ${petrolPrices.ron97.toFixed(2)}`;
  if(el('pt-price-diesel')) el('pt-price-diesel').textContent = `RM ${petrolPrices.diesel.toFixed(2)}`;
}

function openPetrolModal(){
  const content = el('petrol-rates-content');
  if(content){
    renderPetrolModalUI(content);
  }
  fetchLivePetrolPrices();
  renderPetrolHistory();
  openModal('petrol-modal');
}

function renderPetrolModalUI(container){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const p95 = petrolPrices.ron95 || 2.05;
  const p97 = petrolPrices.ron97 || 3.19;
  const pD = petrolPrices.diesel || 2.95;

  container.innerHTML = `
    <!-- Fuel Type Selection Grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
      <div id="pt-card-ron95" onclick="selectFuelType('ron95')" style="background:var(--bg2);border:2px solid ${currentFuelType==='ron95'?'var(--amber)':'var(--border)'};border-radius:14px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .15s">
        <div style="font-size:11px;color:var(--muted);font-weight:700">RON95</div>
        <div id="pt-price-ron95" style="font-size:16px;font-weight:900;color:var(--amber);margin:3px 0">RM ${p95.toFixed(2)}</div>
        <div style="font-size:9.5px;color:var(--muted)">per liter</div>
      </div>
      <div id="pt-card-ron97" onclick="selectFuelType('ron97')" style="background:var(--bg2);border:2px solid ${currentFuelType==='ron97'?'var(--green)':'var(--border)'};border-radius:14px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .15s">
        <div style="font-size:11px;color:var(--muted);font-weight:700">RON97</div>
        <div id="pt-price-ron97" style="font-size:16px;font-weight:900;color:var(--green);margin:3px 0">RM ${p97.toFixed(2)}</div>
        <div style="font-size:9.5px;color:var(--muted)">per liter</div>
      </div>
      <div id="pt-card-diesel" onclick="selectFuelType('diesel')" style="background:var(--bg2);border:2px solid ${currentFuelType==='diesel'?'#3b82f6':'var(--border)'};border-radius:14px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .15s">
        <div style="font-size:11px;color:var(--muted);font-weight:700">Diesel</div>
        <div id="pt-price-diesel" style="font-size:16px;font-weight:900;color:#3b82f6;margin:3px 0">RM ${pD.toFixed(2)}</div>
        <div style="font-size:9.5px;color:var(--muted)">per liter</div>
      </div>
    </div>

    <!-- Tank Calculator Box -->
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:800;color:var(--text);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <span>🚗 ${isZh ? '车型油箱预设' : 'Car Tank Presets'}</span>
        <span style="font-size:10.5px;color:var(--muted)">${isZh ? '轻点直接填入' : 'Tap to fill'}</span>
      </div>
      <div id="car-preset-chips" class="chips" style="gap:6px;margin-bottom:12px;flex-wrap:wrap"></div>

      <!-- Liters Input & Quick Increment -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="flex:1">
          <label style="font-size:11px;color:var(--muted);font-weight:700;display:block;margin-bottom:3px">${isZh ? '加油升数 (Liters)' : 'Fuel Liters'}</label>
          <input type="number" id="petrol-liters-inp" class="form-input" value="36" step="0.5" min="1" max="150" oninput="calcPetrolCost()" style="font-size:14px;font-weight:800;padding:8px 12px;border-radius:12px;min-height:38px;background:var(--bg2)"/>
        </div>
        <div style="display:flex;gap:4px;align-self:flex-end">
          <button type="button" class="chip" onclick="adjustPetrolLiters(-5)" style="padding:8px 10px;font-weight:800">-5L</button>
          <button type="button" class="chip" onclick="adjustPetrolLiters(5)" style="padding:8px 10px;font-weight:800">+5L</button>
        </div>
      </div>

      <!-- Cost Display -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:12px;padding:12px 14px;margin-bottom:10px">
        <div>
          <div style="font-size:11px;color:var(--muted);font-weight:700">${isZh ? '预计加油金额' : 'Estimated Cost'}</div>
          <div id="petrol-calc-sub" style="font-size:10.5px;color:var(--muted);margin-top:2px">36.0 Litres of RON 95 @ RM 2.05/L</div>
        </div>
        <strong id="petrol-total-cost" style="font-size:22px;font-weight:900;color:var(--amber)">RM 73.80</strong>
      </div>

      <!-- Action Button: Pre-fill into Transaction -->
      <button type="button" class="primary-btn" onclick="logPetrolExpense()" style="margin-bottom:0;padding:10px 14px;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000">
        <span>⛽</span> <span>${isZh ? '记录这笔加油支出 (Log Expense)' : 'Log Petrol Expense'}</span>
      </button>
    </div>

    <!-- Recent Petrol History Section -->
    <div style="border-top:1px solid var(--border);padding-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px">
          <span>⛽</span> <span>${isZh ? '过往加油账单明细' : 'Recent Petrol Refills'}</span>
        </span>
        <span id="petrol-month-total-badge" style="font-size:11px;font-weight:800;color:var(--amber);background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);padding:2px 8px;border-radius:10px">RM 0.00</span>
      </div>
      <div id="petrol-history-list" class="tx-list" style="max-height:220px;overflow-y:auto;gap:6px"></div>
      <div id="petrol-history-empty" class="empty hidden" style="padding:14px 0">
        <div class="empty-ico" style="font-size:22px">⛽</div>
        <p style="font-size:11.5px">${isZh ? '暂无加油记录' : 'No petrol records yet'}</p>
        <small style="font-size:10px">${isZh ? '扫描油站小票或使用上方按键快速记一笔！' : 'Scan a station receipt or tap Log Petrol above!'}</small>
      </div>
    </div>
  `;

  renderCarPresets();
  calcPetrolCost();
}

function adjustPetrolLiters(delta){
  const inp = el('petrol-liters-inp');
  if(!inp) return;
  let val = (parseFloat(inp.value) || 0) + delta;
  if(val < 1) val = 1;
  inp.value = val;
  calcPetrolCost();
}

function renderCarPresets(){
  const wrap = el('car-preset-chips');
  if(!wrap) return;
  wrap.innerHTML = '';
  CAR_TANK_PRESETS.forEach((preset, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (idx === 0 ? ' on' : '');
    chip.style.cssText = 'font-size:10.5px;padding:3px 8px;cursor:pointer';
    chip.innerHTML = `<span>🚗 ${preset.name}</span>`;
    chip.onclick = () => {
      wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      const inp = el('petrol-liters-inp');
      if(inp) inp.value = preset.liters;
      calcPetrolCost();
    };
    wrap.appendChild(chip);
  });
}

function selectFuelType(type){
  currentFuelType = type;
  const cards = {
    ron95: { id: 'pt-card-ron95', col: 'var(--amber)' },
    ron97: { id: 'pt-card-ron97', col: 'var(--green)' },
    diesel: { id: 'pt-card-diesel', col: '#3b82f6' }
  };
  Object.keys(cards).forEach(t => {
    const c = el(cards[t].id);
    if(c) c.style.borderColor = (t === type) ? cards[t].col : 'var(--border)';
  });
  calcPetrolCost();
}

function calcPetrolCost(){
  const litersInp = el('petrol-liters-inp');
  const liters = parseFloat(litersInp ? litersInp.value : 36) || 0;
  const rate = (petrolPrices && petrolPrices[currentFuelType]) ? petrolPrices[currentFuelType] : 2.05;
  const total = liters * rate;
  
  const fuelName = currentFuelType === 'ron95' ? 'RON 95' : currentFuelType === 'ron97' ? 'RON 97' : 'Diesel';
  if(el('petrol-total-cost')) el('petrol-total-cost').textContent = fmt(total);
  if(el('petrol-calc-sub')) el('petrol-calc-sub').textContent = `${liters.toFixed(1)} Litres of ${fuelName} @ RM ${rate.toFixed(2)}/L`;
}

function logPetrolExpense(){
  const litersInp = el('petrol-liters-inp');
  const liters = parseFloat(litersInp ? litersInp.value : 0) || 0;
  const rate = (petrolPrices && petrolPrices[currentFuelType]) ? petrolPrices[currentFuelType] : 2.05;
  const total = (liters * rate).toFixed(2);
  const fuelName = currentFuelType === 'ron95' ? 'RON 95' : currentFuelType === 'ron97' ? 'RON 97' : 'Diesel';

  if(!total || parseFloat(total) <= 0){
    toast('⚠️ Please enter fuel liters');
    return;
  }

  closeModal('petrol-modal');
  openTxModal('expense');
  el('tx-amount').value = total;
  el('tx-desc').value = `Petrol (${fuelName})`;
  el('tx-note').value = `${liters.toFixed(1)}L ${fuelName} @ RM ${rate.toFixed(2)}/L`;
  selCat = 'fuel';
  selSubCat = 'trans_petrol_fuel';
  currentTxTags = ['petrol', 'fuel', currentFuelType];
  if(typeof renderTxTagChips === 'function') renderTxTagChips();
  if(el('tx-cats')) buildCats('tx-cats', 'expense', id => selCat = id);
  toast(`⛽ Pre-filled ${liters}L ${fuelName} (RM ${total})!`);
}

function renderPetrolHistory(){
  const list = el('petrol-history-list');
  const empty = el('petrol-history-empty');
  const badge = el('petrol-month-total-badge');
  if(!list) return;
  list.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const txs = (S.transactions || []).filter(t => {
    if(t.category === 'fuel') return true;
    if(t.subCategory === 'trans_petrol_fuel') return true;
    if(Array.isArray(t.tags) && t.tags.some(tg => /petrol|fuel|ron95|ron97|diesel|setel|petronas|shell|petron|caltex|bhp/i.test(tg))) return true;
    if(/petrol|fuel|petronas|shell|petron|bhp|caltex/i.test(t.desc || '')) return true;
    return false;
  }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));

  // Calculate current month petrol total
  const now = new Date();
  const curMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthTotal = txs.filter(t => (t.date || '').startsWith(curMonthKey))
                       .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  if(badge){
    badge.textContent = `${isZh ? '本月: ' : 'This month: '}${fmt(monthTotal)}`;
  }

  if(!txs.length){
    if(empty) empty.classList.remove('hidden');
    return;
  }
  if(empty) empty.classList.add('hidden');

  txs.forEach(t => {
    const item = document.createElement('div');
    item.className = 'tx-item';
    item.style.cssText = 'padding:9px 12px;border-radius:12px;background:var(--bg2);cursor:pointer;margin-bottom:4px';
    item.onclick = () => {
      closeModal('petrol-modal');
      if(typeof openTxDetailModal === 'function') openTxDetailModal(t.id);
    };

    const stationIcon = /petronas/i.test(t.desc||'') ? '🟢' : /shell/i.test(t.desc||'') ? '🟡' : '⛽';
    const noteText = t.note || (t.items && t.items[0]?.name) || '';
    const literMatch = noteText.match(/(\d+(?:\.\d+)?)\s*L/i);
    const literStr = literMatch ? `${literMatch[1]}L` : '';

    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <div style="font-size:20px">${stationIcon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12.5px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.desc || 'Petrol')}</span>
            ${literStr ? `<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(245,158,11,.15);color:var(--amber);font-weight:800">${literStr}</span>` : ''}
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px;display:flex;gap:8px">
            <span>${t.date}</span>
            ${t.location ? `<span>· 📍 ${esc(t.location)}</span>` : ''}
            ${t.paymentMethod ? `<span>· 💳 ${esc(t.paymentMethod)}</span>` : ''}
          </div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:13.5px;font-weight:900;color:var(--red)">-${fmt(t.amount)}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

window.openPetrolModal = openPetrolModal;
window.calcPetrolCost = calcPetrolCost;
window.selectFuelType = selectFuelType;
window.adjustPetrolLiters = adjustPetrolLiters;
window.logPetrolExpense = logPetrolExpense;
