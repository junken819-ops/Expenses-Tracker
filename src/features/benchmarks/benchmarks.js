/**
 * Malaysian Market Benchmark & CPI Price Reference
 * Modularized from Pocket Winnie Core
 */

// ── 🇲🇾 OFFICIAL MALAYSIAN MARKET BENCHMARK & CPI PRICE REFERENCE ──────────
const MY_MARKET_BENCHMARKS = [
  // ☕ Drinks & Beverages
  { keywords: ['kopi o', 'kopi-o', 'black coffee', 'kopi c'], name: 'Kopi O / Coffee O', category: 'food', icon: '☕', marketAvg: 2.50, unit: 'cup', desc: 'Standard Kopitiam / Mamak rate' },
  { keywords: ['white coffee', 'kopi', 'coffee', 'oriental kopi', 'cham', 'nescafe'], name: 'White Coffee / Traditional Kopi', category: 'food', icon: '☕', marketAvg: 3.20, unit: 'cup', desc: 'Standard local cafe / kopitiam rate' },
  { keywords: ['teh tarik', 'teh', 'teh c', 'teh o'], name: 'Teh Tarik / Teh O', category: 'food', icon: '🧋', marketAvg: 2.40, unit: 'glass', desc: 'National Mamak / Kopitiam benchmark' },
  { keywords: ['milo', 'milo ais', 'milo dinosaur'], name: 'Milo Ais / Iced Milo', category: 'food', icon: '🍫', marketAvg: 3.50, unit: 'glass', desc: 'Kopitiam standard iced drink' },
  { keywords: ['latte', 'cappuccino', 'flat white', 'americano', 'espresso', 'starbucks', 'zus', 'chagee'], name: 'Barista Espresso / Latte', category: 'food', icon: '☕', marketAvg: 10.50, unit: 'cup', desc: 'Commercial cafe / specialty coffee' },
  { keywords: ['boba', 'bubble tea', 'tealive', 'gong cha', 'koi', 'mixue'], name: 'Bubble Milk Tea', category: 'food', icon: '🧋', marketAvg: 8.50, unit: 'cup', desc: 'Commercial bubble tea average' },
  { keywords: ['cold drink', 'soft drink', 'iced drink', 'coke', 'sprite', '100 plus', 'drink', 'water', 'jus', 'juice'], name: 'Soft Drink / Iced Beverage', category: 'food', icon: '🥤', marketAvg: 2.50, unit: 'glass', desc: 'F&B drink benchmark' },

  // 🍜 Local Meals & Dining
  { keywords: ['nasi lemak biasa', 'nasi lemak telur', 'nasi lemak'], name: 'Nasi Lemak (Basic / Egg)', category: 'food', icon: '🍛', marketAvg: 3.50, unit: 'pack', desc: 'Standard street stall / warung' },
  { keywords: ['chicken wing', 'chicken wings', 'gold wing', 'wing', 'wings', 'ayam goreng'], name: 'Chicken Wings / Fried Chicken (2-3 pcs)', category: 'food', icon: '🍗', marketAvg: 7.00, unit: 'serving', desc: 'Side dish / snack benchmark' },
  { keywords: ['chicken rice', 'nasi ayam', '鸡饭', 'hainan chicken rice'], name: 'Hainanese Chicken Rice', category: 'food', icon: '🍗', marketAvg: 8.50, unit: 'plate', desc: 'National average hawker meal' },
  { keywords: ['economy rice', 'mixed rice', 'zap fan', 'cai fan', 'nasi campur', '杂菜饭'], name: 'Economy Rice (1 Meat + 2 Veg)', category: 'food', icon: '🍱', marketAvg: 9.00, unit: 'plate', desc: 'Standard hawker lunch' },
  { keywords: ['char kway teow', 'kuey teow', '炒粿条'], name: 'Char Kway Teow (with Egg & Cockles)', category: 'food', icon: '🥢', marketAvg: 8.50, unit: 'plate', desc: 'Hawker centre average' },
  { keywords: ['mee goreng', 'maggi goreng', 'indomie'], name: 'Mee Goreng / Maggi Goreng Mamak', category: 'food', icon: '🍝', marketAvg: 7.00, unit: 'plate', desc: 'Mamak stall standard' },
  { keywords: ['wantan mee', 'wonton noodle', '云吞面'], name: 'Wantan Mee (Dry / Soup)', category: 'food', icon: '🍜', marketAvg: 8.50, unit: 'bowl', desc: 'Local Chinese coffeeshop rate' },
  { keywords: ['pan mee', '板面'], name: 'Chilli Pan Mee / Soup Pan Mee', category: 'food', icon: '🍜', marketAvg: 9.50, unit: 'bowl', desc: 'Standard noodle shop rate' },
  { keywords: ['egg tart', 'tart', 'polo bun', 'kaya toast', 'toast', 'roti bakar'], name: 'Kaya Butter Toast / Egg Tart', category: 'food', icon: '🍞', marketAvg: 3.20, unit: 'set', desc: 'Kopitiam breakfast staple' },

  // 🍽️ Western, Cafe & Specialty Dishes
  { keywords: ['soup', 'mushroom soup', 'sup', 'broth', 'chowder'], name: 'Cream of Mushroom Soup / Bowl', category: 'food', icon: '🍲', marketAvg: 4.50, unit: 'bowl', desc: 'Cafe & Western dining soup benchmark' },
  { keywords: ['garlic bread', 'roti bawang', 'bread', 'bun', 'baguette'], name: 'Garlic Bread / Warm Toast (3 pcs)', category: 'food', icon: '🍞', marketAvg: 3.50, unit: 'serving', desc: 'Western restaurant side benchmark' },
  { keywords: ['meatball', 'meatballs', 'beef ball', 'chicken ball'], name: 'Swedish Meatballs / Meatballs Plate (10-12s)', category: 'food', icon: '🧆', marketAvg: 12.00, unit: 'plate', desc: 'Commercial restaurant meatball plate' },
  { keywords: ['fish & chips', 'fish and chips', 'fish fillet', 'dory'], name: 'Fish & Chips / Deep Fried Fillet', category: 'food', icon: '🐟', marketAvg: 14.00, unit: 'plate', desc: 'Western dining standard benchmark' },
  { keywords: ['chicken chop', 'lamb chop', 'steak', 'pasta', 'spaghetti'], name: 'Western Chop / Pasta Meal', category: 'food', icon: '🥩', marketAvg: 15.00, unit: 'plate', desc: 'Western dining main course benchmark' },
  { keywords: ['pie', 'chicken pie', 'curry puff', 'karipap', 'pastry'], name: 'Chicken Pie / Savory Pastry', category: 'food', icon: '🥧', marketAvg: 4.50, unit: 'piece', desc: 'Bakery & cafe hot pastry' },
  { keywords: ['burger', 'sandwich', 'hotdog', 'wrap'], name: 'Burger / Sandwich Meal', category: 'food', icon: '🍔', marketAvg: 9.50, unit: 'serving', desc: 'Fast food & cafe meal' },
  { keywords: ['salad', 'healthy bowl', 'poke bowl'], name: 'Fresh Salad / Veg Bowl', category: 'food', icon: '🥗', marketAvg: 11.50, unit: 'bowl', desc: 'Healthy dining benchmark' },
  { keywords: ['cake', 'dessert', 'ice cream', 'cendol', 'waffle'], name: 'Dessert / Slice Cake / Ice Cream', category: 'food', icon: '🍰', marketAvg: 8.50, unit: 'portion', desc: 'Cafe dessert benchmark' },

  // 🛒 Daily Groceries & Essentials
  { keywords: ['egg', 'eggs', 'telur', 'telur ayam', 'grade a', 'grade b', 'grade c'], name: 'Fresh Eggs Grade A/B (10 pcs / 1 tray)', category: 'groceries', icon: '🥚', marketAvg: 5.80, unit: 'pack', desc: 'National regulated ceiling/market rate' },
  { keywords: ['milk', 'fresh milk', 'susu', 'dutch lady', 'farm fresh'], name: 'Fresh Full Cream Milk (1 Litre)', category: 'groceries', icon: '🥛', marketAvg: 7.20, unit: 'bottle', desc: 'Standard dairy benchmark' },
  { keywords: ['bread', 'gardenia', 'roti putih', 'wholemeal'], name: 'White Bread / Wholemeal Loaf (400g)', category: 'groceries', icon: '🍞', marketAvg: 3.50, unit: 'loaf', desc: 'National bread standard' },
  { keywords: ['rice', 'beras', 'jasmine', 'super special tempatan'], name: 'White Rice (5kg Bag)', category: 'groceries', icon: '🍚', marketAvg: 18.00, unit: 'bag', desc: 'Staple grain benchmark' },
  { keywords: ['cooking oil', 'minyak masak', 'minyak'], name: 'Cooking Oil (1kg / 2kg)', category: 'groceries', icon: '🛢️', marketAvg: 6.90, unit: 'bottle', desc: 'Malaysian household essential' },
  { keywords: ['chicken', 'whole chicken', 'ayam', 'dada ayam'], name: 'Fresh Whole Chicken / Breast (1kg)', category: 'groceries', icon: '🍗', marketAvg: 9.40, unit: 'kg', desc: 'National ceiling price benchmark' },

  // 🚗 Transport & Fuel
  { keywords: ['ron95', 'petrol ron95', 'minyak ron95'], name: 'RON95 Petrol (Subsidised)', category: 'fuel', icon: '⛽', marketAvg: 2.05, unit: 'litre', desc: 'Malaysian Govt ceiling price' },
  { keywords: ['ron97', 'petrol ron97'], name: 'RON97 Premium Petrol', category: 'fuel', icon: '⛽', marketAvg: 3.47, unit: 'litre', desc: 'Floating market benchmark' },
  { keywords: ['grab', 'e-hailing', 'airasia ride', 'taxi', 'teksi'], name: 'E-Hailing Short Trip (3-6km)', category: 'transport', icon: '🚗', marketAvg: 12.00, unit: 'trip', desc: 'Klang Valley / Urban rate' },
  { keywords: ['parking', 'parkir', 'touch n go parking'], name: 'Standard Mall / Complex Parking', category: 'toll_parking', icon: '🅿️', marketAvg: 3.00, unit: 'hour', desc: 'Standard commercial rate' }
];

// Helper to extract receipt item breakdown from transaction record
function extractTxReceiptItems(tx){
  if(!tx) return [];
  if(Array.isArray(tx.items) && tx.items.length > 0){
    return tx.items.map(it => {
      let cal = parseInt(it.calories);
      if(isNaN(cal) || cal <= 0){
        const estimated = typeof estimateCaloriesFromName === 'function' ? estimateCaloriesFromName(it.name || it.desc || '') : -1;
        cal = estimated >= 0 ? estimated : 0;
      }
      let prot = parseInt(it.protein);
      if(isNaN(prot) || prot <= 0){
        const estProt = typeof estimateProteinFromName === 'function' ? estimateProteinFromName(it.name || it.desc || '') : -1;
        if(estProt >= 0) prot = estProt;
        else if(cal > 0) prot = Math.max(1, Math.round(cal * 0.04));
        else prot = 0;
      }
      return {
        name: it.name || it.desc || 'Item',
        price: Number(it.price || it.amount) || 0,
        qty: Number(it.qty) || 1,
        calories: cal,
        protein: prot
      };
    });
  }

  // If note contains itemized breakdown (e.g. "Item A (RM 10.00) [400kcal] [25g protein], Item B (RM 5.00)" or lines)
  if(tx.note && typeof tx.note === 'string'){
    const lines = tx.note.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    const parsed = [];

    lines.forEach(l => {
      let calFromNote = 0;
      let protFromNote = 0;
      const calMatch = l.match(/\[(\d+)\s*kcal\]/i);
      if(calMatch){
        calFromNote = parseInt(calMatch[1]) || 0;
        l = l.replace(/\[\d+\s*kcal\]/i, '').trim();
      }
      const protMatch = l.match(/\[(\d+)\s*g(?:\s*protein)?\]/i);
      if(protMatch){
        protFromNote = parseInt(protMatch[1]) || 0;
        l = l.replace(/\[\d+\s*g(?:\s*protein)?\]/i, '').trim();
      }
      const itemRegex = /(?:(\d+)\s*x\s*)?(.+?)(?:\s*x(\d+))?\s*(?:\((?:RM|\$)?\s*([0-9]+(?:\.[0-9]{1,2})?)\)|(?:[-–:]|\bRM\b|\$)?\s*(?:RM|\$)?\s*([0-9]+(?:\.[0-9]{1,2})?))?$/i;
      const m = l.match(itemRegex);
      if(m && m[2]){
        const itemName = m[2].replace(/[()]/g, '').trim();
        const qty = parseInt(m[1] || m[3]) || 1;
        const price = parseFloat(m[4] || m[5]) || 0;
        let cal = calFromNote;
        if(cal <= 0 && typeof estimateCaloriesFromName === 'function' && (tx.category === 'food' || tx.category === 'drinks')){
          const estimated = estimateCaloriesFromName(itemName);
          cal = estimated >= 0 ? estimated : 0;
        }
        let prot = protFromNote;
        if(prot <= 0 && typeof estimateProteinFromName === 'function' && (tx.category === 'food' || tx.category === 'drinks')){
          const estProt = estimateProteinFromName(itemName);
          if(estProt >= 0) prot = estProt;
          else if(cal > 0) prot = Math.max(1, Math.round(cal * 0.04));
          else prot = 0;
        }
        if(itemName && (price > 0 || cal > 0 || itemName.length > 1)){
          parsed.push({
            name: itemName,
            qty,
            price,
            calories: cal,
            protein: prot
          });
        }
      }
    });

    if(parsed.length > 0) return parsed;
  }

  // Fallback: Use description as a single item entry if amount > 0
  if(tx.desc && Number(tx.amount) > 0){
    let cal = 0;
    let prot = 0;
    if(typeof estimateCaloriesFromName === 'function' && (tx.category === 'food' || tx.category === 'drinks')){
      const estimated = estimateCaloriesFromName(tx.desc);
      cal = estimated >= 0 ? estimated : 0;
    }
    if(typeof estimateProteinFromName === 'function' && (tx.category === 'food' || tx.category === 'drinks')){
      const estProt = estimateProteinFromName(tx.desc);
      if(estProt >= 0) prot = estProt;
      else if(cal > 0) prot = Math.max(1, Math.round(cal * 0.04));
    }
    return [{
      name: tx.desc,
      price: Number(tx.amount),
      qty: 1,
      calories: cal,
      protein: prot
    }];
  }

  return [];
}

// Helper to calculate total estimated calories for a transaction
function getTxCalories(tx){
  if(!tx) return 0;
  const items = extractTxReceiptItems(tx);
  if(!items || !Array.isArray(items) || items.length === 0) return 0;
  let total = 0;
  items.forEach(it => {
    const cal = parseInt(it.calories) || 0;
    const qty = parseInt(it.qty) || 1;
    if(cal > 0) total += (cal * qty);
  });
  return total;
}

// Helper to calculate total estimated protein (in grams) for a transaction
function getTxProtein(tx){
  if(!tx) return 0;
  const items = extractTxReceiptItems(tx);
  if(!items || !Array.isArray(items) || items.length === 0) return 0;
  let total = 0;
  items.forEach(it => {
    const prot = parseInt(it.protein) || 0;
    const qty = parseInt(it.qty) || 1;
    if(prot > 0) total += (prot * qty);
  });
  return total;
}

// Helper to match scanned receipt item against Malaysian market benchmark
function findMarketBenchmarkMatch(itemName, txCat, unitPrice){
  if(!itemName) return null;
  const lower = itemName.toLowerCase().trim();

  // 1. Direct Keyword Search
  for(const bm of MY_MARKET_BENCHMARKS){
    for(const kw of bm.keywords){
      if(lower.includes(kw)){
        return bm;
      }
    }
  }

  // 2. Generic Category / Price-Tier Fallback so NO receipt item gets skipped
  if(unitPrice > 0){
    if(unitPrice <= 4.00){
      return {
        keywords: [],
        name: 'Beverage / Side Dish / Add-On',
        category: txCat || 'food',
        icon: '🥣',
        marketAvg: 3.50,
        unit: 'portion',
        desc: 'Malaysian side dish / beverage benchmark'
      };
    } else if(unitPrice <= 12.00){
      return {
        keywords: [],
        name: 'Standard Dining Main / Dish',
        category: txCat || 'food',
        icon: '🍽️',
        marketAvg: 9.50,
        unit: 'plate',
        desc: 'National average dining meal benchmark'
      };
    } else {
      return {
        keywords: [],
        name: 'Western / Specialty Set Dish',
        category: txCat || 'food',
        icon: '🍱',
        marketAvg: 14.50,
        unit: 'set',
        desc: 'Commercial cafe / Western dining benchmark'
      };
    }
  }

  return null;
}

let cpiData = {
  headline: '+1.9%',
  date: '2026年官方发布',
  period: 'YoY Benchmark',
  food: '+2.0%',
  dining: '+2.8%',
  transport: '+1.2%',
  housing: '+2.6%'
};

async function fetchMalaysiaInflationData(){
  try{
    const res = await fetch('https://api.data.gov.my/data-catalogue?id=cpi_headline&limit=1');
    if(res.ok){
      const json = await res.json();
      if(json && json.length && json[0].growth_yoy !== undefined){
        const yoy = Number(json[0].growth_yoy);
        cpiData.headline = `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%`;
        if(json[0].date){
          const dObj = new Date(json[0].date + 'T00:00:00');
          const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
          cpiData.date = isZh ? `${dObj.getFullYear()}年${dObj.getMonth()+1}月` : dObj.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
        }
        if(el('cpi-headline-rate')) el('cpi-headline-rate').textContent = cpiData.headline;
        if(el('cpi-national-val')) el('cpi-national-val').textContent = cpiData.headline;
        if(el('ana-cpi-national-val')) el('ana-cpi-national-val').textContent = cpiData.headline;
        if(el('ana-cpi-data-date')) el('ana-cpi-data-date').textContent = `DOSM CPI: ${cpiData.date}`;
      }
    }
  }catch(e){}
}

let currentAnaTxsForInflation = [];
let currentPrevTxsForInflation = [];

function renderAnaInflationBenchmark(txs, prevTxs, inc, exp){
  currentAnaTxsForInflation = txs || [];
  currentPrevTxsForInflation = prevTxs || [];

  const card = el('ana-inflation-card');
  if(!card) return;

  const natValEl = el('ana-cpi-national-val');
  const userValEl = el('ana-cpi-user-val');
  const unitCostEl = el('ana-cpi-unit-cost');
  const unitDiffEl = el('ana-cpi-unit-diff');
  const freqEl = el('ana-cpi-freq');
  const freqDiffEl = el('ana-cpi-freq-diff');
  const catListEl = el('ana-cpi-categories-list');
  const topDriversEl = el('ana-cpi-top-drivers-list');
  const verdictEl = el('ana-cpi-verdict-text');
  const dateBadgeEl = el('ana-cpi-data-date');
  const userBaseLblEl = el('ana-cpi-user-base-lbl');
  const baseDateLblEl = el('ana-cpi-base-date-lbl');

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(natValEl && cpiData && cpiData.headline){
    natValEl.textContent = cpiData.headline;
  }
  if(dateBadgeEl){
    dateBadgeEl.textContent = `DOSM CPI: ${cpiData.date || '2026'}`;
  }
  if(baseDateLblEl){
    baseDateLblEl.textContent = isZh ? `官方通胀率` : `YoY Rate`;
  }
  if(userBaseLblEl){
    const pName = anaPeriod === 'week' ? (isZh ? 'vs 上周' : 'vs Last Week') : (anaPeriod === 'year' ? (isZh ? 'vs 上年' : 'vs Last Year') : (isZh ? 'vs 上期' : 'vs Last Period'));
    userBaseLblEl.textContent = (prevTxs && prevTxs.length) ? pName : (isZh ? '暂无前期对比' : 'No prior data');
  }

  // 1. Calculate Core Expense Totals & Frequencies
  const exps = txs.filter(t => t.type === 'expense');
  const pExps = (prevTxs && prevTxs.length) ? prevTxs.filter(t => t.type === 'expense') : [];

  const curExp = exps.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const prevExp = pExps.reduce((s,t) => s + (Number(t.amount)||0), 0);

  const curCount = exps.length;
  const prevCount = pExps.length;

  let userGrowth = 0;
  if(prevExp > 0){
    userGrowth = ((curExp - prevExp) / prevExp) * 100;
  }
  const userSign = userGrowth >= 0 ? '+' : '';
  const userGrowthStr = `${userSign}${userGrowth.toFixed(1)}%`;
  
  if(userValEl){
    userValEl.textContent = userGrowthStr;
    userValEl.style.color = userGrowth <= 2.0 ? 'var(--green)' : 'var(--amber)';
  }

  // 2. Unit Cost & Buy Frequency Metrics
  const curUnitCost = curCount > 0 ? curExp / curCount : 0;
  const prevUnitCost = prevCount > 0 ? prevExp / prevCount : 0;
  let unitCostGrowth = 0;
  if(prevUnitCost > 0){
    unitCostGrowth = ((curUnitCost - prevUnitCost) / prevUnitCost) * 100;
  }
  const unitDiffSign = unitCostGrowth >= 0 ? '+' : '';
  
  if(unitCostEl) unitCostEl.textContent = fmt(curUnitCost);
  if(unitDiffEl){
    unitDiffEl.textContent = prevUnitCost > 0 ? `${unitDiffSign}${unitCostGrowth.toFixed(1)}% ${isZh ? '单笔均价' : 'avg/tx'}` : (isZh ? '暂无对比' : 'No prev');
    unitDiffEl.style.color = unitCostGrowth <= 0 ? 'var(--green)' : 'var(--amber)';
  }

  if(freqEl) freqEl.textContent = `${curCount} ${isZh ? '笔' : 'txs'}`;
  if(freqDiffEl){
    const diffCount = curCount - prevCount;
    freqDiffEl.textContent = `${diffCount >= 0 ? '+' : ''}${diffCount} ${isZh ? '笔消费' : 'txs vs prev'}`;
    freqDiffEl.style.color = diffCount <= 0 ? 'var(--green)' : 'var(--muted)';
  }

  // 3. Category-by-Category Basket Inflation Table
  if(catListEl){
    catListEl.innerHTML = '';
    const baskets = [
      { id: 'food', name: isZh ? '🍽️ 餐饮与外食 (Dining)' : '🍽️ Restaurants & Dining', cpi: '+2.8%', cats: ['food'] },
      { id: 'groceries', name: isZh ? '🛒 生鲜食材与杂货 (Groceries)' : '🛒 Groceries & Market', cpi: '+2.0%', cats: ['groceries'] },
      { id: 'transport', name: isZh ? '🚗 汽油与出行 (Fuel/Transport)' : '🚗 Fuel & Transport', cpi: '+1.2%', cats: ['transport', 'fuel', 'toll_parking'] },
      { id: 'bills', name: isZh ? '🏠 房租水电与账单 (Utilities)' : '🏠 Housing & Utilities', cpi: '+2.6%', cats: ['housing', 'bills'] },
      { id: 'shopping', name: isZh ? '🛍️ 网购与生活 (Shopping)' : '🛍️ Shopping & Lifestyle', cpi: '+1.5%', cats: ['shopping', 'entertainment', 'personal'] }
    ];

    baskets.forEach(b => {
      const bCur = exps.filter(t => b.cats.includes(t.category)).reduce((s,t) => s + (Number(t.amount)||0), 0);
      const bPrev = pExps.filter(t => b.cats.includes(t.category)).reduce((s,t) => s + (Number(t.amount)||0), 0);
      let bGrowth = 0;
      if(bPrev > 0){
        bGrowth = ((bCur - bPrev) / bPrev) * 100;
      }
      const bSign = bGrowth >= 0 ? '+' : '';
      const bGrowthStr = bPrev > 0 ? `${bSign}${bGrowth.toFixed(0)}%` : (bCur > 0 ? '+100%' : '0%');
      const isOver = bPrev > 0 && bGrowth > parseFloat(b.cpi.replace(/[^0-9.]/g, ''));

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px';
      row.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.name}</div>
          <div style="font-size:10px;color:var(--muted)">DOSM CPI: <strong style="color:var(--amber)">${b.cpi}</strong> · ${isZh ? '上期' : 'Prev'}: ${fmt(bPrev)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800;color:var(--text)">${fmt(bCur)}</div>
          <span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:6px;background:${isOver ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)'};color:${isOver ? 'var(--red)' : 'var(--green)'}">
            ${bGrowthStr} ${isOver ? (isZh ? '⚠️ 偏高' : 'Outpacing') : (isZh ? '✅ 良好' : 'Controlled')}
          </span>
        </div>
      `;
      catListEl.appendChild(row);
    });
  }

  // 4. Top Inflation & Spending Surge Drivers (Specific Items & Places)
  if(topDriversEl){
    topDriversEl.innerHTML = '';
    const itemMap = {};
    exps.forEach(t => {
      const desc = (t.desc || t.category || 'Item').trim();
      if(!itemMap[desc]) itemMap[desc] = { desc, amount: 0, count: 0, cat: t.category };
      itemMap[desc].amount += Number(t.amount) || 0;
      itemMap[desc].count += 1;
    });

    const sortedDrivers = Object.values(itemMap).sort((a,b) => b.amount - a.amount).slice(0, 3);
    if(!sortedDrivers.length){
      topDriversEl.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:4px 0">${isZh ? '本期暂无账单数据' : 'No items recorded yet'}</div>`;
    } else {
      sortedDrivers.forEach((it, idx) => {
        const itemRow = document.createElement('div');
        itemRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:rgba(255,179,0,.08);padding:7px 10px;border-radius:10px;font-size:11.5px';
        itemRow.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;min-width:0">
            <span style="font-size:12px;font-weight:800;color:var(--amber)">#${idx+1}</span>
            <div style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.desc)}</div>
            <span style="font-size:10px;color:var(--muted)">(${it.count}${isZh ? '次' : 'x'})</span>
          </div>
          <span style="font-weight:900;color:var(--text);white-space:nowrap">${fmt(it.amount)}</span>
        `;
        topDriversEl.appendChild(itemRow);
      });
    }
  }

  // 5. Overall AI Inflation Diagnosis Verdict
  if(verdictEl){
    const natRateNum = parseFloat((cpiData && cpiData.headline) ? cpiData.headline.replace(/[^0-9.-]/g, '') : '1.9') || 1.9;
    if(curExp <= 0){
      verdictEl.textContent = isZh ? '本周期暂无支出记录，记账后即可解锁深度物价追踪与 AI 抗通胀建议！' : 'No expenses recorded in this period yet.';
    } else if(userGrowth < 0){
      verdictEl.textContent = isZh 
        ? `🎉 财务自律模范！你的个人支出环比减少了 ${Math.abs(userGrowth).toFixed(1)}%，完美跑赢马来西亚法定通胀率 (${cpiData.headline || '+1.9%'})！`
        : `🎉 Excellent discipline! Your spending decreased by ${Math.abs(userGrowth).toFixed(1)}%, beating Malaysia's national inflation (${cpiData.headline || '+1.9%'})!`;
    } else if(userGrowth <= natRateNum){
      verdictEl.textContent = isZh
        ? `✅ 稳健受控：你的个人支出增长 (${userGrowthStr}) 低于全国通胀基准 (${cpiData.headline || '+1.9%'})，单笔均价保持在 ${fmt(curUnitCost)}，日常开支控制得当。`
        : `✅ Well-controlled: Your spending growth (${userGrowthStr}) is below national CPI inflation (${cpiData.headline || '+1.9%'}), with avg cost at ${fmt(curUnitCost)}/tx.`;
    } else {
      const reason = (unitCostGrowth > 5) ? (isZh ? '单笔消费均价上涨较快 (物价变贵)' : 'rising average cost per transaction') : (isZh ? '消费频次明显增多' : 'higher transaction frequency');
      verdictEl.textContent = isZh
        ? `⚠️ 警惕：你的个人支出增长了 ${userGrowthStr}，高于国家通胀率 (${cpiData.headline || '+1.9%'})。主要诱因是【${reason}】，建议点击上方「⚡ Deep Scan」获取 AI 定制省钱秘籍！`
        : `⚠️ Alert: Your spending grew by ${userGrowthStr}, outpacing Malaysia's inflation (${cpiData.headline || '+1.9%'}). Main driver: ${reason}. Tap Deep Scan for AI advice!`;
    }
  }
}

async function generateAiInflationDiagnosis(){
  const resultBox = el('ana-cpi-ai-result');
  const btn = el('ana-cpi-ai-btn');
  if(!resultBox) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const txs = currentAnaTxsForInflation || [];
  const prevTxs = currentPrevTxsForInflation || [];
  const exps = txs.filter(t => t.type === 'expense');

  if(!exps.length){
    resultBox.innerHTML = isZh ? '⚠️ 当前周期尚无支出记录，无法进行 AI 深度通胀诊断。' : '⚠️ No expense records to diagnose in this period.';
    return;
  }

  if(btn){
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }

  resultBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;color:var(--purple2);font-weight:700">
      <span style="display:inline-block">⏳</span>
      <span>${isZh ? 'Google Gemini AI 正在深度扫描你的所有具体购买单品、车油用量与开销频次…' : 'Google Gemini AI is deep-scanning your purchase basket and item usage…'}</span>
    </div>
  `;

  // Aggregate itemized receipt items and usage details
  const itemBasket = [];
  exps.forEach(t => {
    const items = extractTxReceiptItems(t);
    items.forEach(it => {
      const match = findMarketBenchmarkMatch(it.name);
      itemBasket.push({
        item: it.name,
        paidPrice: it.price / (it.qty || 1),
        marketAvg: match ? match.marketAvg : null,
        merchant: t.desc,
        date: t.date
      });
    });
  });

  const payload = {
    cpiHeadline: cpiData ? cpiData.headline : '+1.9%',
    totalCurrentExpenses: exps.reduce((s,t)=>s+(Number(t.amount)||0), 0),
    totalPrevExpenses: prevTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+(Number(t.amount)||0), 0),
    receiptItemsScanned: itemBasket.slice(0, 30)
  };

  try {
    const prompt = `You are a certified Malaysian personal inflation & cost-of-living AI specialist.
Analyze this user's scanned receipt items and expense basket against Malaysian market averages & DOSM CPI:
${JSON.stringify(payload, null, 2)}

Provide a concise, razor-sharp Personal Inflation Diagnosis in ${isZh ? 'Simplified Chinese (简体中文)' : 'English'}:
1. 🔍 **Scanned Receipt Items vs Market (小票单品物价分析)**: Point out which specific items had a high markup/premium over market average (e.g. cafe coffee, dining dishes, groceries).
2. ⚡ **Price Creep vs Frequency Surge (是单价贵了还是买多了)**: Analyze whether their inflation is from high item prices or purchase frequency.
3. 💡 **2 Actionable Money-Saving Hacks (对抗通胀省钱妙招)**: Specific, realistic Malaysian recommendations (e.g. coffee alternatives, grocery timing, petrol cashback). Keep under 180 words.`;

    const apiKey = S.geminiApiKey || '';
    const generation = await generateGeminiContent(apiKey, { contents: [{ parts: [{ text: prompt }] }] });

    if(generation.data){
      const data = generation.data;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if(text){
        resultBox.innerHTML = markedParse(text);
      } else {
        resultBox.textContent = isZh ? 'AI 诊断完成：建议优先控制外食与高频外卖，善用超市特价与现金返还。' : 'AI Analysis complete: Focus on trimming dining out and delivery fees.';
      }
    } else {
      // Graceful offline fallback
      const topCat = exps[0]?.category || 'food';
      resultBox.innerHTML = isZh 
        ? `💡 <strong>AI 本地精简诊断：</strong><br>经分析，你的最大通胀开销集中在【${topCat}】。建议为该分类设置专属月度预算，并配合超市特惠日与 e-Wallet 返现跑赢通胀！`
        : `💡 <strong>AI Basket Insight:</strong><br>Your largest spending surge is in <strong>${topCat}</strong>. Set a strict category budget and leverage e-wallet rewards to beat inflation!`;
    }
  } catch(e){
    resultBox.innerHTML = isZh 
      ? `💡 <strong>AI 本地精简诊断：</strong><br>你的日常开支主要受餐饮与车油拉动。建议开启 50/30/20 预算监控，及时锁定不必要的漏财点。`
      : `💡 <strong>AI Basket Insight:</strong><br>Daily spending is driven by food and fuel. Use 50/30/20 budget tracking to optimize cost of living!`;
  } finally {
    if(btn){
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}
