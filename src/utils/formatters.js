/**
 * Formatting & Calculation Utilities
 * Modularized from Pocket Winnie Core
 */

/* ═══════════════════════════════════════════════════════════════════
   5. UTILITIES (FORMATTERS, CALCULATORS, AI PARSING, I18N)
   ═══════════════════════════════════════════════════════════════════ */
// i18n localization engine (t/applyLanguage), Currency & Date formatters (fmt, today),
// BNM 5-sen rounding engine, Restaurant Bill Splitter & WhatsApp message generator,
// Multi-modal Google Gemini Vision OCR parser, and Live Malaysian Market Rates fetchers.
const fmt = n => {
  const num = Number(n) || 0;
  if(num < 0){
    return `-${S.currency} ${Math.abs(num).toFixed(2)}`;
  }
  return `${S.currency} ${num.toFixed(2)}`;
};
// Reliable local date string (YYYY-MM-DD in user's timezone)
const today = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const normalizeDateStr = (rawDate, enforceCurrentYearIfPast = false) => {
  if(!rawDate) return today();
  let s = String(rawDate).trim();
  if(s.includes('T')) s = s.split('T')[0];
  // Strip trailing time e.g. "14:19:38", "2:19 PM", "2:19"
  s = s.replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*[ap]m)?$/i, '').trim();

  let y = '', m = '', d = '';

  // 1. Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  let match = s.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
  if(match){
    y = match[1]; m = match[2]; d = match[3];
  } else {
    // 2. Check DD/MM/YYYY or MM/DD/YYYY with 4-digit year at end
    match = s.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})$/);
    if(match){
      const p1 = parseInt(match[1], 10);
      const p2 = parseInt(match[2], 10);
      y = match[3];
      if(p2 > 12){
        m = String(p1); d = String(p2);
      } else {
        d = String(p1); m = String(p2);
      }
    } else {
      // 3. Check DD/MM/YY (Malaysian standard 2-digit year at end e.g. "20/08/26")
      match = s.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{2})$/);
      if(match){
        const p1 = parseInt(match[1], 10);
        const p2 = parseInt(match[2], 10);
        const p3 = parseInt(match[3], 10);
        
        const fullYear = p3 < 70 ? 2000 + p3 : 1900 + p3;
        y = String(fullYear);

        if(p2 > 12){
          m = String(p1); d = String(p2);
        } else {
          d = String(p1); m = String(p2);
        }
      } else {
        // 4. Text month formats (e.g. "20 Aug 2026", "20-AUG-26", "Aug 20, 2026")
        const monthNames = {
          jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
          jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
          january: 1, february: 2, march: 3, april: 4, june: 6,
          july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
        };
        const textMatch = s.match(/^(\d{1,2})[-\/\s]?([a-zA-Z]{3,9})[-\/\s,]?(\d{2,4})$/);
        if(textMatch){
          d = textMatch[1];
          const mKey = textMatch[2].toLowerCase();
          m = String(monthNames[mKey] || 1);
          let yr = textMatch[3];
          if(yr.length === 2) yr = String(parseInt(yr, 10) < 70 ? 2000 + parseInt(yr, 10) : 1900 + parseInt(yr, 10));
          y = yr;
        } else {
          const textMatchRev = s.match(/^([a-zA-Z]{3,9})[-\/\s]?(\d{1,2})[-\/\s,]?(\d{2,4})$/);
          if(textMatchRev){
            const mKey = textMatchRev[1].toLowerCase();
            m = String(monthNames[mKey] || 1);
            d = textMatchRev[2];
            let yr = textMatchRev[3];
            if(yr.length === 2) yr = String(parseInt(yr, 10) < 70 ? 2000 + parseInt(yr, 10) : 1900 + parseInt(yr, 10));
            y = yr;
          } else {
            const parsed = new Date(s);
            if(!isNaN(parsed.getTime())){
              y = String(parsed.getFullYear());
              m = String(parsed.getMonth() + 1);
              d = String(parsed.getDate());
            }
          }
        }
      }
    }
  }

  if(y && m && d){
    const curYear = new Date().getFullYear();
    const parsedY = parseInt(y, 10);
    const parsedM = parseInt(m, 10);
    const parsedD = parseInt(d, 10);
    if(parsedM >= 1 && parsedM <= 12 && parsedD >= 1 && parsedD <= 31){
      if(enforceCurrentYearIfPast && parsedY < curYear){
        y = String(curYear);
      }
      return `${y}-${String(parsedM).padStart(2, '0')}-${String(parsedD).padStart(2, '0')}`;
    }
  }
  return today();
};

function formatItemsSummary(data){
  if(!data) return '';
  if(typeof data === 'string' && data.trim() && !data.includes('[object')) {
    return data.trim();
  }
  const items = data.items || data.dishes;
  if(Array.isArray(items) && items.length > 0){
    return items.map(it => {
      if(typeof it === 'string') return it;
      if(typeof it === 'object' && it !== null){
        const name = it.name || it.desc || it.title || '';
        const price = it.price ? ` (${fmt(it.price)})` : '';
        const qty = (it.qty && it.qty > 1) ? ` x${it.qty}` : '';
        const cal = (it.calories && parseInt(it.calories) > 0) ? ` [${it.calories}kcal]` : '';
        const prot = (it.protein && parseInt(it.protein) > 0) ? ` [${it.protein}g protein]` : '';
        return `${name}${qty}${price}${cal}${prot}`.trim();
      }
      return String(it);
    }).filter(Boolean).join(', ');
  }
  if(Array.isArray(data.itemsSummary)){
    return data.itemsSummary.map(it => typeof it === 'object' && it ? (it.name || JSON.stringify(it)) : String(it)).filter(Boolean).join(', ');
  }
  if(typeof data.itemsSummary === 'string' && data.itemsSummary.trim() && !data.itemsSummary.includes('[object')) {
    return data.itemsSummary.trim();
  }
  return '';
}

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function markedParse(text){
  if(!text) return '';
  let str = String(text);
  // Code blocks
  str = str.replace(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g, (m, code) => `<pre style="background:var(--bg2);padding:8px 10px;border-radius:8px;overflow-x:auto;font-size:11px;margin:6px 0"><code>${esc(code.trim())}</code></pre>`);
  // Inline code
  str = str.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:4px;font-size:11px">$1</code>');
  // Bold
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  str = str.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Headers (h3, h2, h1)
  str = str.replace(/^###\s*(.*)$/gm, '<h4 style="margin:8px 0 4px;font-size:12.5px;color:var(--text);font-weight:700">$1</h4>');
  str = str.replace(/^##\s*(.*)$/gm, '<h3 style="margin:10px 0 4px;font-size:13px;color:var(--text);font-weight:700">$1</h3>');
  str = str.replace(/^#\s*(.*)$/gm, '<h2 style="margin:12px 0 6px;font-size:14px;color:var(--text);font-weight:800">$1</h2>');
  // Bullet lists
  str = str.replace(/^\s*[-*•]\s*(.*)$/gm, '<div style="display:flex;gap:6px;margin:3px 0 3px 6px"><span>•</span><span>$1</span></div>');
  // Numbered lists
  str = str.replace(/^\s*(\d+)\.\s*(.*)$/gm, '<div style="display:flex;gap:6px;margin:3px 0 3px 6px"><span style="font-weight:700">$1.</span><span>$2</span></div>');
  // Line breaks
  str = str.replace(/\n\n/g, '<br><br>');
  str = str.replace(/\n/g, '<br>');
  return str;
}



function parseNumericAmount(val){
  if(val === null || val === undefined) return 0;
  if(typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/[^0-9.-]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function normalizeGeminiReceiptOutput(data){
  if(!data || typeof data !== 'object') return null;
  
  // 1. Merchant / Store name
  const merchant = String(
    data.merchant || data.store || data.merchantName || data.storeName ||
    data.vendor || data.shop || data.payee || data.recipient || data.name || data.desc || ''
  ).trim();

  // 2. Amount
  const rawAmt = data.amount !== undefined ? data.amount : (data.total !== undefined ? data.total : (data.grandTotal !== undefined ? data.grandTotal : data.subtotal));
  const amount = parseNumericAmount(rawAmt);

  // 3. Category
  let category = String(data.category || data.cat || 'food').toLowerCase().trim();

  // 4. Date (YYYY-MM-DD)
  let date = String(data.date || data.transactionDate || '').trim();
  if(date) date = normalizeDateStr(date, true);

  // 5. Time (HH:MM)
  let time = String(data.time || data.transactionTime || '').trim();
  if(time && time.length > 5) time = time.substring(0, 5);

  // 6. Items array normalization
  const rawItems = data.items || data.dishes || data.lineItems || data.products || data.item_list || [];
  const items = [];
  if(Array.isArray(rawItems)){
    rawItems.forEach(it => {
      if(!it) return;
      if(typeof it === 'string' && it.trim()){
        items.push({ name: it.trim(), price: 0, qty: 1 });
      } else if(typeof it === 'object'){
        const itemName = String(it.name || it.item || it.desc || it.description || it.dish || it.product || it.title || '').trim();
        const itemPrice = parseNumericAmount(it.price !== undefined ? it.price : (it.amount !== undefined ? it.amount : (it.total !== undefined ? it.total : it.cost)));
        const itemQty = parseInt(it.qty !== undefined ? it.qty : (it.quantity !== undefined ? it.quantity : 1), 10) || 1;
        if(itemName || itemPrice > 0){
          items.push({
            name: itemName || 'Item',
            price: itemPrice,
            qty: itemQty,
            calories: it.calories ? parseInt(it.calories) : 0,
            protein: it.protein ? parseInt(it.protein) : 0,
            subCategory: it.subCategory || null,
            tags: it.tags || []
          });
        }
      }
    });
  }

  // 7. Location
  const location = String(data.location || data.branch || data.mall || data.city || data.address || '').trim();

  // 8. Payment Method
  const paymentMethod = String(data.paymentMethod || data.payMethod || data.payment || '').trim();

  // 9. Taxes & Charges (SST, Service Charge, Rounding, Tax Relief)
  const sstPct = parseNumericAmount(data.sstPct !== undefined ? data.sstPct : (data.sstRate !== undefined ? data.sstRate : 0));
  const sstAmount = parseNumericAmount(data.sstAmount !== undefined ? data.sstAmount : data.taxAmount);
  const serviceChargePct = parseNumericAmount(data.serviceChargePct !== undefined ? data.serviceChargePct : (data.serviceChargeRate !== undefined ? data.serviceChargeRate : 0));
  const serviceChargeAmount = parseNumericAmount(data.serviceChargeAmount !== undefined ? data.serviceChargeAmount : data.serviceFee);
  const roundingAmount = parseNumericAmount(data.roundingAmount !== undefined ? data.roundingAmount : data.rounding);
  const subtotal = parseNumericAmount(data.subtotal !== undefined ? data.subtotal : (amount - sstAmount - serviceChargeAmount));
  
  let taxesCollectedSummary = String(data.taxesCollectedSummary || data.taxSummary || '').trim();
  if(!taxesCollectedSummary){
    const taxParts = [];
    if(sstAmount > 0 || sstPct > 0) taxParts.push(`SST (${sstPct || 6}%): RM ${sstAmount > 0 ? sstAmount.toFixed(2) : (amount * 0.06).toFixed(2)}`);
    if(serviceChargeAmount > 0 || serviceChargePct > 0) taxParts.push(`Svc Charge (${serviceChargePct || 10}%): RM ${serviceChargeAmount > 0 ? serviceChargeAmount.toFixed(2) : (amount * 0.10).toFixed(2)}`);
    if(roundingAmount !== 0) taxParts.push(`Rounding: RM ${roundingAmount.toFixed(2)}`);
    taxesCollectedSummary = taxParts.join(' · ');
  }

  const taxReliefCat = String(data.taxReliefCat || data.taxCategory || '').toLowerCase().trim();
  const taxReliefAmount = parseNumericAmount(data.taxReliefAmount || amount);
  const taxReliefReason = String(data.taxReliefReason || data.taxReason || '').trim();

  // ── SST Reconciliation: prevent double-counting ──
  // If amount already includes taxes (common on Malaysian receipts where grand total = subtotal + SST + svc + rounding),
  // mark taxes as "included in amount" so analytics won't add them again.
  const itemsTotal = items.reduce((s, it) => s + ((Number(it.price) || 0) * (it.qty || 1)), 0);
  const taxesSum = sstAmount + serviceChargeAmount + roundingAmount;
  let taxIncludedInAmount = false;
  if(amount > 0 && taxesSum > 0){
    const withTaxes = itemsTotal + taxesSum;
    const diffWithTax = Math.abs(withTaxes - amount);
    const diffWithoutTax = Math.abs(itemsTotal - amount);
    // If amount ≈ items sum (not items+taxes), then amount is the subtotal and taxes are extra → no issue
    // If amount ≈ items+taxes (or amount < items+taxes), then amount already includes tax → flag it
    if(diffWithoutTax > 0.10 && diffWithTax > diffWithoutTax){
      // amount already includes taxes — mark so analytics won't double-count
      taxIncludedInAmount = true;
    }
  }

  return {
    ...data,
    detectedType: data.detectedType || 'receipt',
    merchant: merchant || 'Receipt',
    amount: amount,
    subtotal: subtotal,
    category: category || 'food',
    date: date || today(),
    time: time || currentTimeStr(),
    location: location,
    paymentMethod: paymentMethod,
    items: items,
    sstPct: sstPct,
    sstAmount: sstAmount,
    serviceChargePct: serviceChargePct,
    serviceChargeAmount: serviceChargeAmount,
    roundingAmount: roundingAmount,
    taxIncludedInAmount: taxIncludedInAmount,
    taxesCollectedSummary: taxesCollectedSummary,
    taxReliefCat: taxReliefCat,
    taxReliefAmount: taxReliefAmount,
    taxReliefReason: taxReliefReason
  };
}

function getReceiptCategoryId(value){
  const raw = String(value || '').toLowerCase().trim().replace(/[\s/&-]+/g, '_');
  const aliases = {
    restaurant: 'food', dining: 'food', meal: 'food', meals: 'food',
    cafe: 'drinks', coffee: 'drinks', beverage: 'drinks',
    supermarket: 'groceries', grocery: 'groceries', market: 'groceries',
    parking: 'toll_parking', toll: 'toll_parking', ride: 'transport'
  };
  const candidate = aliases[raw] || raw;
  return getCategories('expense').some(cat => cat.id === candidate) ? candidate : '';
}

function getReceiptCategoryEvidence(receipt){
  const merchant = String(receipt?.merchant || receipt?.store || '').toLowerCase();
  const items = formatItemsSummary(receipt).toLowerCase();
  const text = `${merchant} ${items}`;
  const mealMatches = text.match(/restaurant|food\s*court|kopitiam|mamak|hawker|dine|dining|noodle|mee|rice|nasi|ramen|udon|dim\s*sum|dumpling|braised|roast|grill|chicken\s*rice|bak\s*kut\s*teh|laksa|curry|soup|satay|burger|pizza|pasta|breakfast|lunch|dinner|supper|dish|套餐|面|饭|餐|烧|炒|汤|肉骨茶|点心|火锅|小吃|午餐|晚餐/g) || [];
  const groceryMatches = text.match(/supermarket|hypermarket|grocery|groceries|fresh\s*market|pasar|lotus|tesco|aeon\s*big|jaya\s*grocer|village\s*grocer|giant|econsave|nsk|99\s*speedmart|familymart|7-?eleven|kk\s*mart|donki|vegetable|fruit|raw\s*meat|fresh\s*produce|超市|菜市|生鲜|蔬菜|水果|便利店/g) || [];
  const mealScore = Math.min(4, mealMatches.length) + (Number(receipt?.serviceChargeAmount || 0) > 0 || Number(receipt?.serviceChargePct || 0) > 0 ? 2 : 0);
  const groceryScore = Math.min(4, groceryMatches.length);

  if(mealScore >= 2 && mealScore > groceryScore){
    return {
      category: 'food',
      subCategory: /mamak|hawker|kopitiam|nasi\s*lemak|roti\s*canai/i.test(text) ? 'food_hawker_mamak' : 'food_restaurant',
      confidence: mealScore >= 3 ? 'high' : 'medium',
      reason: 'Prepared dishes or restaurant signals found'
    };
  }
  if(groceryScore >= 2 && groceryScore > mealScore){
    return { category: 'groceries', subCategory: 'groc_supermarket', confidence: 'high', reason: 'Supermarket or raw-grocery signals found' };
  }

  const smart = smartAutoDetectCategoryAndPayment(text);
  if(smart?.detectedCat && getReceiptCategoryId(smart.detectedCat)){
    return { category: smart.detectedCat, subCategory: smart.detectedSubCat || null, confidence: 'medium', reason: 'Merchant and item pattern matched' };
  }
  return null;
}

async function verifyReceiptCategoryWithGemini(receipt, apiKey){
  if(!receipt || !apiKey) return receipt;
  const proposedCategory = getReceiptCategoryId(receipt.category) || 'food';
  const local = getReceiptCategoryEvidence(receipt);
  const needsSecondOpinion = Boolean(local && local.category !== proposedCategory);

  // A high-confidence local signal is immediately safer than a clearly wrong
  // OCR category. The Gemini check below can confirm it but cannot undo it
  // unless the local evidence was weak.
  if(needsSecondOpinion && local){
    receipt.category = local.category;
    receipt.subCategory = local.subCategory || receipt.subCategory || null;
    receipt.categoryVerification = {
      source: 'receipt evidence',
      confidence: local.confidence,
      message: `${local.reason} → ${catInfo('expense', local.category).name}`
    };
  }
  if(!needsSecondOpinion) return receipt;

  const allowedCategories = getCategories('expense').map(cat => cat.id).join(', ');
  const verificationPrompt = `You are a strict receipt category verifier. Decide the purchase type from the merchant and item names, not from isolated ingredient words. Prepared dishes at a restaurant, hawker, cafe, or food court are "food"; raw goods from a supermarket or convenience store are "groceries". Return only JSON: {"category":"one allowed category","subCategory":"optional subcategory id","confidence":"high|medium|low"}. Allowed categories: ${allowedCategories}. Merchant: ${receipt.merchant || 'unknown'}. Items: ${formatItemsSummary(receipt) || 'none'}. Initial OCR category: ${proposedCategory}.`;

  try {
    const generation = await generateGeminiContent(apiKey, {
      contents: [{ parts: [{ text: verificationPrompt }] }],
      generationConfig: { temperature: 0 }
    });
    const text = generation.data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
    const result = extractJsonFromText(text);
    const verifiedCategory = getReceiptCategoryId(result?.category);
    const verifiedConfidence = String(result?.confidence || '').toLowerCase();
    if(verifiedCategory){
      const agreesWithLocal = !local || verifiedCategory === local.category;
      const mayOverride = !local || local.confidence !== 'high' || agreesWithLocal;
      if(mayOverride){
        receipt.category = verifiedCategory;
        if(result?.subCategory) receipt.subCategory = String(result.subCategory);
      }
      receipt.categoryVerification = {
        source: agreesWithLocal ? 'AI + receipt evidence' : 'receipt evidence protected',
        confidence: verifiedConfidence || local?.confidence || 'medium',
        message: agreesWithLocal
          ? `AI verification confirmed ${catInfo('expense', receipt.category).name}`
          : `${local?.reason || 'Receipt evidence'} → ${catInfo('expense', receipt.category).name}`
      };
    }
  } catch(err){
    console.warn('Gemini category verification unavailable; using receipt evidence.', err);
  }
  return receipt;
}

function extractJsonFromText(rawText){
  if(!rawText || typeof rawText !== 'string') return null;

  // -- Strip common Gemini wrappers (```json ... ``` fences) --
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // -- Lenient parse: also strips trailing commas (common Gemini output quirk) --
  function lenientParse(str){
    try { return JSON.parse(str); } catch(e){}
    try { return JSON.parse(str.replace(/,\s*([}\]])/g, '$1')); } catch(e){ return null; }
  }

  // 1. Try the whole cleaned string first
  const direct = lenientParse(clean);
  if(direct) return direct;

  // 2. Extract first { ... } block (handles preamble/explanation before the JSON)
  const firstBrace = clean.indexOf('{');
  const lastBrace  = clean.lastIndexOf('}');
  if(firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace){
    const extracted = lenientParse(clean.substring(firstBrace, lastBrace + 1));
    if(extracted) return extracted;
  }

  // 3. Try a ```json ... ``` block that survived the initial strip
  const jsonBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if(jsonBlock){
    const blockExtracted = lenientParse(jsonBlock[1].trim());
    if(blockExtracted) return blockExtracted;
  }

  console.warn('extractJsonFromText: could not parse Gemini response. First 200 chars:', rawText.substring(0, 200));
  return null;
}
function uid(prefix = ''){
  if(typeof crypto !== 'undefined' && crypto.randomUUID){
    return (prefix ? prefix + '_' : '') + crypto.randomUUID();
  }
  return (prefix ? prefix + '_' : '') + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

function getCategories(type = 'expense'){
  if(type === 'income'){
    return (S.incCategories && S.incCategories.length) ? S.incCategories : DEFAULT_INC_CATS;
  }
  return (S.expCategories && S.expCategories.length) ? S.expCategories : DEFAULT_EXP_CATS;
}

const catInfo = (type, id) => {
  const list = getCategories(type);
  const found = list.find(c => c.id === id || c.name === id);
  const lang = (typeof S !== 'undefined' && S && S.lang) ? S.lang : 'en';
  if(found){
    const transKey = 'cat_' + found.id;
    const translatedName = (I18N[lang] && I18N[lang][transKey]) || found.name;
    return { ...found, name: translatedName };
  }
  const otherList = getCategories(type === 'income' ? 'expense' : 'income');
  const foundOther = otherList.find(c => c.id === id || c.name === id);
  if(foundOther){
    const transKey = 'cat_' + foundOther.id;
    const translatedName = (I18N[lang] && I18N[lang][transKey]) || foundOther.name;
    return { ...foundOther, name: translatedName };
  }
  return { id: id || 'other', name: id === 'other' ? t('cat_other', 'Other') : (id || 'Other'), icon: '📦' };
};
