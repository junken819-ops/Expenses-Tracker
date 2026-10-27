/**
 * Calorie Estimation System
 * Modularized from Pocket Winnie Core
 */

// ── 🔥 CALORIE ESTIMATION SYSTEM ───────────────────────────
// Built-in calorie lookup for common Malaysian food items (per serving)
const CALORIE_DB = {
  // Rice & Noodles
  'nasi lemak': 400, 'nasi goreng': 450, 'nasi ayam': 480, 'nasi kandar': 550,
  'nasi kerabu': 380, 'nasi dagang': 420, 'nasi briyani': 520, 'nasi campur': 500,
  'mee goreng': 430, 'mee rebus': 350, 'mee bandung': 370, 'mee kari': 400,
  'mee hoon goreng': 380, 'mee hoon soup': 280, 'char kuey teow': 520,
  'kuey teow goreng': 480, 'kuey teow soup': 300, 'wan tan mee': 420,
  'pan mee': 380, 'loh mee': 450, 'curry mee': 500, 'laksa': 480,
  'asam laksa': 350, 'bihun goreng': 370, 'bihun soup': 250,
  'maggi goreng': 500, 'indomie': 350,
  // Chicken
  'ayam goreng': 300, 'chicken rice': 480, 'chicken chop': 550,
  'ayam penyet': 450, 'ayam bakar': 350, 'satay ayam': 250,
  'fried chicken': 350, 'chicken wing': 200, 'nugget': 280,
  'kfc': 450, 'mcchicken': 400,
  // Roti & Bread
  'roti canai': 300, 'roti telur': 380, 'roti bom': 450, 'roti tisu': 250,
  'roti jala': 200, 'chapati': 180, 'naan': 280, 'tosai': 150,
  'roti bakar': 250,
  // Drinks
  'teh tarik': 120, 'teh o': 40, 'teh ais': 80, 'kopi': 100,
  'kopi o': 40, 'kopi ais': 90, 'milo': 150, 'milo ais': 180,
  'milo dinosaur': 250, 'sirap bandung': 160, 'air bandung': 160,
  'teh c': 100, 'cham': 110, 'neslo': 120, 'horlick': 130,
  'barli': 80, 'limau ais': 100, 'air kelapa': 60,
  'americano': 15, 'latte': 180, 'cappuccino': 120, 'mocha': 250,
  'espresso': 10, 'flat white': 150, 'matcha latte': 200,
  'boba': 350, 'bubble tea': 350, 'milk tea': 300,
  'iced coffee': 120, 'frappe': 350, 'smoothie': 250,
  'juice': 150, 'orange juice': 120, 'apple juice': 120,
  'coke': 140, 'coca cola': 140, 'pepsi': 150, 'sprite': 130,
  '100 plus': 120, 'mineral water': 0, 'plain water': 0,
  // Soup
  'sup kambing': 350, 'sup tulang': 400, 'bak kut teh': 450,
  'tom yam': 300, 'soup': 200,
  // Seafood
  'ikan bakar': 300, 'udang goreng': 280, 'sotong goreng': 250,
  'fish and chips': 500, 'sushi': 200,
  // Mamak / Indian
  'tandoori': 350, 'briyani': 520, 'murtabak': 500,
  'thosai': 150, 'idli': 120, 'vadai': 180,
  // Chinese
  'char siu': 350, 'roast duck': 400, 'dim sum': 300,
  'wonton': 250, 'dumpling': 280, 'spring roll': 200,
  'fried rice': 450, 'chow mein': 400, 'congee': 200, 'porridge': 200,
  // Snacks & Desserts
  'pisang goreng': 200, 'keropok': 150, 'kuih': 180,
  'cendol': 300, 'ais kacang': 350, 'ais cream': 250,
  'cake': 350, 'pastry': 300, 'donut': 280, 'waffle': 350,
  'pancake': 300, 'toast': 200, 'croissant': 280,
  // Fast Food
  'burger': 450, 'big mac': 550, 'cheeseburger': 500,
  'fries': 350, 'french fries': 350, 'mcnugget': 280,
  'pizza': 300, 'hotdog': 300, 'sandwich': 350, 'wrap': 380,
  'kebab': 400, 'shawarma': 450, 'subway': 350,
  // Groceries (per item/serving)
  'egg': 70, 'bread': 80, 'milk': 120, 'cheese': 100,
  'rice': 200, 'instant noodle': 350, 'biscuit': 150
};

// Built-in protein lookup for common Malaysian food items (grams per serving)
const PROTEIN_DB = {
  // Rice & Noodles
  'nasi lemak': 12, 'nasi goreng': 14, 'nasi ayam': 26, 'nasi kandar': 28,
  'nasi kerabu': 18, 'nasi dagang': 20, 'nasi briyani': 22, 'nasi campur': 25,
  'mee goreng': 12, 'mee rebus': 14, 'mee bandung': 15, 'mee kari': 16,
  'mee hoon goreng': 10, 'mee hoon soup': 12, 'char kuey teow': 16,
  'kuey teow goreng': 14, 'kuey teow soup': 12, 'wan tan mee': 18,
  'pan mee': 18, 'loh mee': 16, 'curry mee': 16, 'laksa': 18,
  'asam laksa': 15, 'bihun goreng': 10, 'bihun soup': 10,
  'maggi goreng': 10, 'indomie': 9, 'braised pork noodle': 30, 'braised pork loin': 35,
  'braised pork': 28, 'pork loin': 32, 'pork meat': 26, 'pork': 24, 'beef': 26, 'mutton': 25,
  // Chicken
  'ayam goreng': 24, 'chicken rice': 26, 'chicken chop': 32,
  'ayam penyet': 28, 'ayam bakar': 26, 'satay ayam': 20,
  'fried chicken': 25, 'chicken wing': 16, 'nugget': 12, 'chicken': 25,
  'kfc': 26, 'mcchicken': 16,
  // Roti & Bread
  'roti canai': 6, 'roti telur': 12, 'roti bom': 6, 'roti tisu': 4,
  'roti jala': 5, 'chapati': 6, 'naan': 9, 'tosai': 5,
  'roti bakar': 6,
  // Drinks
  'teh tarik': 3, 'teh o': 0, 'teh ais': 2, 'kopi': 2,
  'kopi o': 0, 'kopi ais': 2, 'milo': 5, 'milo ais': 6,
  'milo dinosaur': 8, 'sirap bandung': 2, 'air bandung': 2,
  'teh c': 3, 'cham': 3, 'neslo': 4, 'horlick': 5,
  'barli': 1, 'limau ais': 0, 'air kelapa': 1,
  'americano': 1, 'latte': 8, 'cappuccino': 7, 'mocha': 8,
  'espresso': 1, 'flat white': 8, 'matcha latte': 6,
  'boba': 2, 'bubble tea': 2, 'milk tea': 3,
  'iced coffee': 2, 'frappe': 4, 'smoothie': 3,
  'juice': 1, 'orange juice': 1, 'apple juice': 1,
  'coke': 0, 'coca cola': 0, 'pepsi': 0, 'sprite': 0,
  '100 plus': 0, 'mineral water': 0, 'plain water': 0,
  'soy milk': 8, 'soya': 8, 'protein shake': 25, 'whey': 25,
  // Soup
  'sup kambing': 25, 'sup tulang': 28, 'bak kut teh': 32,
  'tom yam': 18, 'soup': 8,
  // Seafood
  'ikan bakar': 28, 'udang goreng': 22, 'sotong goreng': 20,
  'fish and chips': 24, 'sushi': 9, 'salmon': 25, 'tuna': 28, 'fish': 22, 'prawn': 20,
  // Mamak / Indian
  'tandoori': 34, 'briyani': 24, 'murtabak': 26,
  'thosai': 5, 'idli': 4, 'vadai': 6, 'dhal': 9,
  // Chinese
  'char siu': 28, 'roast duck': 26, 'dim sum': 15,
  'wonton': 12, 'dumpling': 14, 'spring roll': 5,
  'fried rice': 14, 'chow mein': 14, 'congee': 8, 'porridge': 8,
  // Snacks & Desserts
  'pisang goreng': 2, 'keropok': 4, 'kuih': 2,
  'cendol': 3, 'ais kacang': 4, 'ais cream': 4,
  'cake': 4, 'pastry': 5, 'donut': 4, 'waffle': 6,
  'pancake': 6, 'toast': 4, 'croissant': 5, 'taro ball': 3, 'sweet potato': 3,
  // Fast Food
  'burger': 22, 'big mac': 26, 'cheeseburger': 24,
  'fries': 4, 'french fries': 4, 'mcnugget': 14,
  'pizza': 14, 'hotdog': 12, 'sandwich': 16, 'wrap': 18,
  'kebab': 26, 'shawarma': 28, 'subway': 22,
  // Groceries (per item/serving)
  'egg': 6, 'eggs': 12, 'braised egg': 6, 'bread': 4, 'milk': 8, 'cheese': 7,
  'rice': 4, 'instant noodle': 8, 'biscuit': 2, 'tofu': 10, 'tauhu': 10
};

function estimateCaloriesFromName(itemName){
  if(!itemName) return -1;
  const lower = itemName.toLowerCase().trim();
  
  // Exact match first
  if(CALORIE_DB[lower] !== undefined) return CALORIE_DB[lower];
  
  // Partial match — find the best (longest) keyword match
  let bestMatch = null;
  let bestLen = 0;
  for(const key of Object.keys(CALORIE_DB)){
    if(lower.includes(key) && key.length > bestLen){
      bestMatch = key;
      bestLen = key.length;
    }
  }
  if(bestMatch !== null) return CALORIE_DB[bestMatch];
  
  return -1; // Not found in DB
}

function estimateProteinFromName(itemName){
  if(!itemName) return -1;
  const lower = itemName.toLowerCase().trim();
  
  // Exact match first
  if(PROTEIN_DB[lower] !== undefined) return PROTEIN_DB[lower];
  
  // Partial match — find the best (longest) keyword match
  let bestMatch = null;
  let bestLen = 0;
  for(const key of Object.keys(PROTEIN_DB)){
    if(lower.includes(key) && key.length > bestLen){
      bestMatch = key;
      bestLen = key.length;
    }
  }
  if(bestMatch !== null) return PROTEIN_DB[bestMatch];
  
  return -1; // Not found in DB
}

// Enriches items array with calorie & protein estimates using built-in DB + optional AI fallback
async function enrichItemsWithCalories(items){
  if(!items || !Array.isArray(items) || items.length === 0) return;
  
  const unknownItems = [];
  
  // Step 1: Try built-in lookup for each item
  items.forEach((it, idx) => {
    // Calorie lookup
    if(!it.calories || parseInt(it.calories) <= 0){
      const cal = estimateCaloriesFromName(it.name);
      if(cal >= 0) it.calories = cal;
    }
    // Protein lookup
    if(!it.protein || parseInt(it.protein) <= 0){
      const prot = estimateProteinFromName(it.name);
      if(prot >= 0){
        it.protein = prot;
      } else if(it.calories && parseInt(it.calories) > 0){
        it.protein = Math.max(1, Math.round(parseInt(it.calories) * 0.04));
      }
    }
    if(!it.calories || it.calories < 0){
      unknownItems.push({ idx, name: it.name });
    }
  });
  
  // Step 2: For items not in DB, use Gemini to estimate both calories and protein
  if(unknownItems.length > 0){
    const apiKey = (typeof S !== 'undefined' && S) ? S.geminiApiKey : null;
    if(apiKey){
      try {
        const itemNames = unknownItems.map(u => u.name).join(', ');
        const prompt = `Estimate calories (kcal) and protein (grams) per serving for these food/drink items. Return ONLY a raw JSON array of objects with integer properties "calories" and "protein" in the same order, e.g. [{"calories":450,"protein":25}]. If not food, return {"calories":0,"protein":0}. Items: ${itemNames}`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        const gen = await generateGeminiContent(apiKey, payload);
        if(gen.data){
          const parts = gen.data.candidates?.[0]?.content?.parts || [];
          const rawText = parts.map(p => p.text || '').join('');
          const jsonStr = rawText.match(/\[[\s\S]*?\]/);
          if(jsonStr){
            const parsed = JSON.parse(jsonStr[0]);
            unknownItems.forEach((u, i) => {
              if(parsed[i]){
                if(parsed[i].calories && parseInt(parsed[i].calories) > 0){
                  items[u.idx].calories = parseInt(parsed[i].calories);
                }
                if(parsed[i].protein !== undefined){
                  items[u.idx].protein = parseInt(parsed[i].protein) || 0;
                } else if(items[u.idx].calories > 0){
                  items[u.idx].protein = Math.max(1, Math.round(items[u.idx].calories * 0.04));
                }
              }
            });
          }
        }
      } catch(e){
        console.log('Calorie & Protein AI estimation fallback error:', e);
      }
    }
  }
}

// Helper to group and calculate calories & protein across all dates
function getDatesWithCalories(){
  const dateMap = {};
  (S.transactions || []).forEach(tx => {
    if(tx.type === 'expense' && tx.date){
      const c = getTxCalories(tx);
      const p = getTxProtein(tx);
      if(c > 0 || p > 0){
        if(!dateMap[tx.date]) dateMap[tx.date] = { totalKcal: 0, totalProtein: 0, itemCount: 0, txs: [] };
        dateMap[tx.date].totalKcal += c;
        dateMap[tx.date].totalProtein += p;
        dateMap[tx.date].txs.push(tx);
        const items = extractTxReceiptItems(tx);
        items.forEach(it => {
          if((parseInt(it.calories) || 0) > 0 || (parseInt(it.protein) || 0) > 0){
            dateMap[tx.date].itemCount += (parseInt(it.qty) || 1);
          }
        });
      }
    }
  });
  return dateMap;
}

function renderCalorieWidget(){
  const card = el('calorie-card');
  if(!card) return;
  const numEl = el('cal-intake-num');
  const titleEl = el('cal-intake-title');
  const subEl = el('cal-intake-sub');
  if(!numEl) return;
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const dStr = today();
  const dateMap = getDatesWithCalories();

  let targetDate = dStr;
  let isToday = true;
  let totalKcal = 0;
  let totalProtein = 0;
  let itemCount = 0;

  if(dateMap[dStr] && (dateMap[dStr].totalKcal > 0 || (dateMap[dStr].totalProtein && dateMap[dStr].totalProtein > 0))){
    totalKcal = dateMap[dStr].totalKcal;
    totalProtein = dateMap[dStr].totalProtein || 0;
    itemCount = dateMap[dStr].itemCount;
  } else {
    // If today has 0, check for the most recent day with calories/protein
    const sortedDates = Object.keys(dateMap).sort().reverse();
    if(sortedDates.length > 0){
      targetDate = sortedDates[0];
      isToday = false;
      totalKcal = dateMap[targetDate].totalKcal;
      totalProtein = dateMap[targetDate].totalProtein || 0;
      itemCount = dateMap[targetDate].itemCount;
    }
  }

  numEl.textContent = totalKcal.toLocaleString();

  // Protein badge
  const protPill = el('cal-protein-pill');
  const protNum = el('cal-protein-num');
  if(protPill && protNum){
    if(totalProtein > 0){
      protNum.textContent = totalProtein;
      protPill.style.display = 'block';
    } else {
      protPill.style.display = 'none';
    }
  }

  if(titleEl){
    if(totalKcal === 0 && totalProtein === 0){
      titleEl.textContent = isZh ? '今日卡路里与营养' : "Today's Intake";
    } else if(isToday){
      if(totalKcal < 1500) titleEl.textContent = isZh ? '🥗 饮食清淡' : '🥗 Light Day';
      else if(totalKcal < 2200) titleEl.textContent = isZh ? '✅ 摄入达标' : '✅ On Track';
      else titleEl.textContent = isZh ? '⚠️ 热量偏高' : '⚠️ High Intake';
    } else {
      const parts = targetDate.split('-');
      const moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const moStr = moNames[parseInt(parts[1], 10) - 1] || parts[1];
      const dDisplay = isZh ? `${parseInt(parts[1],10)}月${parseInt(parts[2],10)}日` : `${parseInt(parts[2],10)} ${moStr}`;
      titleEl.textContent = isZh ? `🍽️ 最近记录 (${dDisplay})` : `🍽️ Latest (${dDisplay})`;
    }
  }

  if(subEl){
    if(totalKcal === 0 && totalProtein === 0){
      subEl.textContent = isZh ? '扫描餐饮小票自动记录热量与蛋白质 · 点击详情 ›' : 'Scan a food receipt to track calories & protein · Tap details ›';
    } else if(isToday){
      const protStr = totalProtein > 0 ? (isZh ? ` · 🥩 ${totalProtein}g 蛋白质` : ` · 🥩 ${totalProtein}g protein`) : '';
      subEl.textContent = isZh ? `今日已记录 ${itemCount} 样食物${protStr} · 点击查看详情 ›` : `${itemCount} item${itemCount !== 1 ? 's' : ''} tracked${protStr} · Tap for details ›`;
    } else {
      const protStr = totalProtein > 0 ? ` · 🥩 ${totalProtein}g` : '';
      subEl.textContent = isZh ? `今日 0 kcal (记录: ${totalKcal} kcal${protStr}) · 点击查看历史 ›` : `Today: 0 kcal (${totalKcal} kcal${protStr}) · Tap for details ›`;
    }
  }
}

let calorieModalActiveDate = null;

function openCalorieModal(preferredDate){
  const dateMap = getDatesWithCalories();
  const dStr = today();
  if(preferredDate){
    calorieModalActiveDate = preferredDate;
  } else if(dateMap[dStr] && (dateMap[dStr].totalKcal > 0 || (dateMap[dStr].totalProtein && dateMap[dStr].totalProtein > 0))){
    calorieModalActiveDate = dStr;
  } else {
    const sortedDates = Object.keys(dateMap).sort().reverse();
    calorieModalActiveDate = sortedDates.length > 0 ? sortedDates[0] : dStr;
  }
  renderCalorieModalContent(calorieModalActiveDate);
  openModal('calorie-modal');
}
window.openCalorieModal = openCalorieModal;

function renderCalorieModalContent(targetDate){
  const container = el('calorie-modal-content');
  if(!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const dStr = today();
  const dateMap = getDatesWithCalories();
  const sortedDates = Object.keys(dateMap).sort().reverse();

  const viewDate = targetDate || calorieModalActiveDate || (sortedDates.length > 0 ? sortedDates[0] : dStr);
  calorieModalActiveDate = viewDate;

  const txs = (S.transactions || []).filter(t => t.date === viewDate && t.type === 'expense');

  let totalKcal = 0;
  let totalProtein = 0;
  const trackedItems = [];

  txs.forEach(tx => {
    const items = extractTxReceiptItems(tx);
    if(items && Array.isArray(items)){
      items.forEach(it => {
        const cal = parseInt(it.calories) || 0;
        let prot = parseInt(it.protein) || 0;
        if(prot <= 0 && it.name){
          prot = estimateProteinFromName(it.name);
        }
        if(prot <= 0 && cal > 0){
          prot = Math.max(1, Math.round(cal * 0.04));
        }
        const qty = parseInt(it.qty) || 1;
        if(cal > 0 || prot > 0){
          totalKcal += (cal * qty);
          totalProtein += (prot * qty);
          trackedItems.push({
            name: it.name || 'Dish',
            price: it.price || 0,
            qty: qty,
            calories: cal,
            protein: prot,
            merchant: tx.desc || ''
          });
        }
      });
    }
  });

  const dailyGoal = 2000;
  const proteinGoal = 60; // 60g daily recommended protein benchmark
  const pct = Math.min(100, Math.round((totalKcal / dailyGoal) * 100));
  const protPct = Math.min(100, Math.round((totalProtein / proteinGoal) * 100));
  const barColor = totalKcal <= 1800 ? '#10b981' : (totalKcal <= 2300 ? '#f59e0b' : '#ef4444');

  // Format date display
  const parts = viewDate.split('-');
  const moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const moStr = moNames[parseInt(parts[1], 10) - 1] || parts[1];
  const formattedDateTitle = isZh ? `${parts[0]}年${parseInt(parts[1],10)}月${parseInt(parts[2],10)}日` : `${parseInt(parts[2],10)} ${moStr} ${parts[0]}`;

  let html = `
    <!-- Date Navigation Header -->
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:8px 10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:12px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px">
        <span>📅</span>
        <span>${formattedDateTitle}</span>
        ${viewDate === dStr ? `<span style="font-size:9.5px;background:rgba(16,185,129,.18);color:#10b981;padding:1px 6px;border-radius:4px;font-weight:700">${isZh ? '今天' : 'Today'}</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:5px">
        <input type="date" value="${viewDate}" onchange="renderCalorieModalContent(this.value)" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);font-size:11px;padding:3px 6px;border-radius:6px"/>
        ${viewDate !== dStr ? `<button type="button" onclick="renderCalorieModalContent('${dStr}')" style="font-size:10.5px;font-weight:700;color:#10b981;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);padding:3px 8px;border-radius:6px;cursor:pointer">${isZh ? '回今天' : 'Today'}</button>` : ''}
      </div>
    </div>
  `;

  // Quick Date Chips if other days exist
  if(sortedDates.length > 1){
    html += `
      <div style="display:flex;align-items:center;gap:5px;overflow-x:auto;padding-bottom:8px;margin-bottom:6px">
        <span style="font-size:10px;color:var(--muted);white-space:nowrap">${isZh ? '有记录日期:' : 'Tracked Days:'}</span>
        ${sortedDates.slice(0, 5).map(dt => {
          const isAct = (dt === viewDate);
          const p = dt.split('-');
          const label = isZh ? `${parseInt(p[1],10)}月${parseInt(p[2],10)}日` : `${parseInt(p[2],10)} ${moNames[parseInt(p[1],10)-1]||p[1]}`;
          const protTag = (dateMap[dt].totalProtein && dateMap[dt].totalProtein > 0) ? ` · ${dateMap[dt].totalProtein}g` : '';
          return `
            <button type="button" onclick="renderCalorieModalContent('${dt}')" style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;cursor:pointer;white-space:nowrap;${isAct ? 'background:#10b981;color:#fff;border:none;' : 'background:var(--bg3);color:var(--muted);border:1px solid var(--border);'}">
              ${label} (${dateMap[dt].totalKcal} kcal${protTag})
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // Nutrition summary boxes for this day (Calories & Protein side-by-side)
  html += `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <!-- Calorie Box -->
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:12px 10px;text-align:center">
        <div style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">
          🔥 ${isZh ? '总热量摄入' : "Calorie Intake"}
        </div>
        <div style="font-size:24px;font-weight:900;color:${barColor};margin:4px 0">
          ${totalKcal.toLocaleString()} <span style="font-size:11px;font-weight:700">kcal</span>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:6px">
          ${isZh ? `参考：${dailyGoal} kcal · 达 ${pct}%` : `Ref: ${dailyGoal} kcal · ${pct}%`}
        </div>
        <div style="background:var(--bg2);height:6px;border-radius:4px;overflow:hidden">
          <div style="background:${barColor};height:100%;width:${pct}%;transition:width .3s"></div>
        </div>
      </div>

      <!-- Protein Box -->
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:12px 10px;text-align:center">
        <div style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">
          🥩 ${isZh ? '总蛋白质摄入' : "Protein Intake"}
        </div>
        <div style="font-size:24px;font-weight:900;color:var(--cyan);margin:4px 0">
          ${totalProtein} <span style="font-size:11px;font-weight:700">g</span>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:6px">
          ${isZh ? `参考：${proteinGoal}g · 达 ${protPct}%` : `Ref: ${proteinGoal}g · ${protPct}%`}
        </div>
        <div style="background:var(--bg2);height:6px;border-radius:4px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#06b6d4,#0ea5e9);height:100%;width:${protPct}%;transition:width .3s"></div>
        </div>
      </div>
    </div>
  `;

  if(trackedItems.length === 0){
    html += `
      <div style="text-align:center;padding:20px 12px;color:var(--muted)">
        <div style="font-size:32px;margin-bottom:8px">🥗</div>
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">
          ${isZh ? '该日期尚未记录食物营养' : 'No food calories logged for this date'}
        </div>
        <div style="font-size:11px;line-height:1.4;margin-bottom:14px">
          ${isZh ? '用相机扫描餐饮发票，AI 将自动识别菜品并计算卡路里与蛋白质！' : 'Scan a food receipt to have AI automatically estimate calories & protein.'}
        </div>
        <button type="button" class="btn" onclick="closeModal('calorie-modal');openUniversalUpload('expense');" style="width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff">
          📸 ${isZh ? '扫描餐饮小票' : 'Scan Food Receipt'}
        </button>
      </div>
    `;
  } else {
    html += `
      <div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px;display:flex;justify-content:space-between">
        <span>${isZh ? `食物明细 (${trackedItems.length} 样)` : `Food Breakdown (${trackedItems.length} items)`}</span>
        <span style="color:var(--muted)">${isZh ? '热量 / 蛋白质' : 'Calories & Protein'}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;padding-right:2px">
    `;
    trackedItems.forEach(item => {
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px 10px">
          <div style="flex:1;overflow:hidden">
            <div style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${item.qty > 1 ? `<span style="color:var(--cyan);font-weight:800;margin-right:2px">${item.qty}x</span> ` : ''}${esc(item.name)}
            </div>
            ${item.merchant ? `<div style="font-size:10px;color:var(--muted)">📍 ${esc(item.merchant)}</div>` : ''}
          </div>
          <div style="text-align:right;margin-left:8px;flex-shrink:0">
            <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end">
              <span style="font-size:11px;font-weight:900;color:#10b981;background:rgba(16,185,129,.14);padding:2px 5px;border-radius:5px">🔥 ${item.calories * item.qty} kcal</span>
              ${item.protein > 0 ? `<span style="font-size:10.5px;font-weight:900;color:var(--cyan);background:rgba(6,182,212,.14);padding:2px 5px;border-radius:5px">🥩 ${item.protein * item.qty}g</span>` : ''}
            </div>
            ${item.price > 0 ? `<div style="font-size:10px;color:var(--muted);margin-top:2px">${fmt(item.price * item.qty)}</div>` : ''}
          </div>
        </div>
      `;
    });
    html += `
      </div>
      <button type="button" class="ghost-btn" onclick="closeModal('calorie-modal');openUniversalUpload('expense');" style="width:100%;margin-top:12px;color:#10b981;border-color:rgba(16,185,129,.3)">
        📸 ${isZh ? '扫描更多餐饮小票' : 'Scan Another Receipt'}
      </button>
    `;
  }

  container.innerHTML = html;
}

function renderStreakCard(){
  updateStreaks();
  const card = el('streak-card');
  if(!card) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  const current = S.streaks.noSpendCurrent || 0;
  const best = S.streaks.noSpendBest || 0;
  
  const emojiEl = el('streak-emoji');
  const titleEl = el('streak-title');
  const subEl = el('streak-sub');
  const numEl = el('streak-num');
  
  let emoji = '🔥';
  if(current >= 7) emoji = '🏆';
  else if(current >= 3) emoji = '⭐';
  else if(current >= 1) emoji = '🔥';
  else emoji = '💪';
  
  if(emojiEl) emojiEl.textContent = emoji;
  if(titleEl) {
    if(isZh){
      titleEl.textContent = current > 0 ? `已连续 ${current} 天无消费！` : '无消费自律打卡';
    } else {
      titleEl.textContent = current > 0 ? `${current}-Day No-Spend Streak!` : 'No-Spend Streak';
    }
  }
  if(subEl) {
    if(isZh){
      subEl.textContent = `当前: ${current} 天 · 历史最佳: ${best} 天 · 点击查看挑战 ›`;
    } else {
      subEl.textContent = `Current: ${current} day${current!==1?'s':''} · Best: ${best} day${best!==1?'s':''} · Tap for challenges ›`;
    }
  }
  if(numEl) numEl.textContent = current;
}

function openChallengesModal(){
  renderChallengesContent();
  openModal('challenges-modal');
}

function renderChallengesContent(){
  const container = el('challenges-content');
  if(!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  const todayStr = today();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const txs = S.transactions;
  const monthExpenses = txs.filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= todayStr);
  const dayOfMonth = now.getDate();
  
  const foodTotal = monthExpenses.filter(t => t.category === 'food').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const foodPerDay = dayOfMonth > 0 ? foodTotal / dayOfMonth : 0;
  
  const totalSpent = monthExpenses.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const noSpendDays = (() => {
    let count = 0;
    for(let d = 1; d <= dayOfMonth; d++){
      const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      if(!txs.some(t => t.type === 'expense' && t.date === ds)) count++;
    }
    return count;
  })();
  
  const challenges = [
    {
      icon: '🚫', 
      name: isZh ? '连续无消费打卡挑战' : 'No-Spend Day Streak',
      desc: isZh ? '挑战连续不产生任何非必要支出。' : 'Go as many consecutive days as possible without spending.',
      current: S.streaks.noSpendCurrent || 0, best: S.streaks.noSpendBest || 0,
      unit: isZh ? '天' : 'days', target: 7,
      badge: (S.streaks.noSpendCurrent || 0) >= 7 ? (isZh ? '🏆 自律王者!' : '🏆 Champion!') : (S.streaks.noSpendCurrent || 0) >= 3 ? (isZh ? '⭐ 状态火热!' : '⭐ On Fire!') : (isZh ? '💪 继续加油' : '💪 Keep Going')
    },
    {
      icon: '🍳', 
      name: isZh ? '自煮达人 / 每日餐饮节约' : 'Meal Prep Master',
      desc: isZh ? '将整月每日平均餐饮支出控制在 RM 15 以内。' : 'Keep daily food spending under RM 15 for the whole month.',
      current: foodPerDay, best: null,
      unit: 'RM/' + (isZh ? '天' : 'day'), target: 15,
      badge: foodPerDay <= 15 ? (isZh ? '✅ 达标中!' : '✅ On Track!') : (isZh ? '⚠️ 超出 RM 15/天' : '⚠️ Over RM 15/day')
    },
    {
      icon: '📅', 
      name: isZh ? '本月零支出天数' : 'No-Spend Days This Month',
      desc: isZh ? '本月累计达到多少个 RM 0 消费日？' : 'How many days this month did you spend RM 0?',
      current: noSpendDays, best: null,
      unit: isZh ? '天' : 'days', target: 8,
      badge: noSpendDays >= 8 ? (isZh ? '🏆 卓越表现!' : '🏆 Amazing!') : noSpendDays >= 4 ? (isZh ? '👍 进度良好' : '👍 Good Progress') : (isZh ? '💪 努力冲刺' : '💪 Keep Trying')
    }
  ];
  
  container.innerHTML = challenges.map(ch => {
    const pct = ch.target > 0 ? Math.min(100, (ch.current / ch.target) * 100) : 0;
    const isUnder = ch.name.includes('Meal') || ch.name.includes('餐饮') ? ch.current <= ch.target : ch.current >= ch.target;
    return `
      <div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:24px">${ch.icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:800;color:var(--text)">${ch.name}</div>
            <div style="font-size:11px;color:var(--muted)">${ch.desc}</div>
          </div>
          <span style="font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:8px;background:${isUnder?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'};color:${isUnder?'var(--green)':'var(--red)'}">${ch.badge}</span>
        </div>
        <div style="background:var(--bg3);border-radius:8px;height:8px;overflow:hidden;margin-bottom:6px">
          <div style="height:100%;border-radius:8px;background:${isUnder?'var(--green)':'var(--amber)'};width:${Math.min(100, (ch.name.includes('Meal')||ch.name.includes('餐饮')) ? (ch.target > 0 ? ((ch.target - Math.max(0, ch.current - ch.target)) / ch.target) * 100 : 0) : pct)}%;transition:width .3s"></div>
        </div>
        <div style="font-size:11px;color:var(--muted);display:flex;justify-content:space-between">
          <span>${isZh ? '当前: ' : 'Current: '}<strong>${typeof ch.current === 'number' && ch.unit.includes('RM') ? 'RM '+ch.current.toFixed(2) : ch.current}</strong> ${!ch.unit.includes('RM') ? ch.unit : ''}</span>
          <span>${isZh ? '目标: ' : 'Target: '}<strong>${ch.unit.includes('RM') ? '≤ RM '+ch.target : ch.target}</strong> ${!ch.unit.includes('RM') ? ch.unit : ''}</span>
        </div>
        ${ch.best !== null ? `<div style="font-size:10px;color:var(--dim);margin-top:3px">🏅 ${isZh ? '个人最佳: ' : 'Personal Best: '}${ch.best} ${ch.unit}</div>` : ''}
      </div>
    `;
  }).join('');
}
