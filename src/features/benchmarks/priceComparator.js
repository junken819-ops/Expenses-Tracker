/**
 * AI Restaurant & Brand Price Comparator
 * Modularized from Pocket Winnie Core
 */

// ── 🏷️ AI RESTAURANT & BRAND PRICE COMPARATOR ───────────────
function openAiPriceCompareModal(){
  openModal('ai-price-compare-modal');
}

function fillPriceCompareForm(item, price, merchant){
  const itInp = el('ai-compare-item');
  const prInp = el('ai-compare-price');
  const mrInp = el('ai-compare-merchant');
  if(itInp) itInp.value = item || '';
  if(prInp) prInp.value = (price !== undefined && price !== null && price > 0) ? price : '';
  if(mrInp) mrInp.value = merchant || '';
}

function openAiPriceCompareForCurrentTx(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx){
    openAiPriceCompareModal();
    return;
  }
  closeModal('tx-detail-modal');
  openAiPriceCompareModal();
  
  const txItems = extractTxReceiptItems(tx);
  let mainItemName = tx.desc || 'Meal / Item';
  let mainPrice = Number(tx.amount) || 0;
  if(txItems && txItems.length > 0){
    mainItemName = txItems[0].name;
    mainPrice = txItems[0].price / (txItems[0].qty || 1);
  }
  
  fillPriceCompareForm(mainItemName, mainPrice, tx.location || tx.desc || '');
  executeAiPriceCompareModal();
}

function quickAiPriceCompare(item, price, merchant){
  const itInp = el('ana-compare-item-input');
  if(itInp) itInp.value = item;
  const resBox = el('ana-price-compare-result');
  const btn = el('ana-compare-submit-btn');
  performAiPriceCompare({ item, price, merchant, targetResultEl: resBox, btnEl: btn });
}

function runAiPriceCompareFromInput(){
  const itInp = el('ana-compare-item-input');
  const item = itInp ? itInp.value.trim() : '';
  if(!item){
    toast('请输入想比价的菜品、商品或品牌');
    return;
  }
  const resBox = el('ana-price-compare-result');
  const btn = el('ana-compare-submit-btn');
  performAiPriceCompare({ item, price: null, merchant: '', targetResultEl: resBox, btnEl: btn });
}

function executeAiPriceCompareModal(){
  const item = (el('ai-compare-item')?.value || '').trim();
  const price = parseFloat(el('ai-compare-price')?.value) || null;
  const merchant = (el('ai-compare-merchant')?.value || '').trim();
  if(!item){
    toast('请输入菜品或商品名称');
    return;
  }
  const resBox = el('ai-compare-modal-result');
  const btn = el('ai-compare-modal-btn');
  performAiPriceCompare({ item, price, merchant, targetResultEl: resBox, btnEl: btn });
}

async function performAiPriceCompare({ item, price, merchant, targetResultEl, btnEl }){
  if(!targetResultEl) return;
  targetResultEl.classList.remove('hidden');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  if(btnEl){
    btnEl.disabled = true;
    btnEl.style.opacity = '0.6';
  }

  targetResultEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;color:var(--cyan);font-weight:700">
      <div class="ai-scan-spinner" style="width:16px;height:16px;border-width:2px"></div>
      <span>${isZh ? `Google Gemini AI 正在对比大马各餐厅与连锁品牌「${item}」的价格数据…` : `AI is scanning Malaysian brand & restaurant prices for "${item}"…`}</span>
    </div>
  `;

  // Check built-in market benchmark match
  const match = findMarketBenchmarkMatch(item, 'food', price || 5.0);
  const benchmarkAvg = match ? match.marketAvg : null;

  const payload = {
    searchItem: item,
    paidPrice: price ? `RM ${price.toFixed(2)}` : 'Not specified',
    merchantOrBrand: merchant || 'General / Not specified',
    nationalBenchmarkAvg: benchmarkAvg ? `RM ${benchmarkAvg.toFixed(2)} (${match.name})` : 'RM 8.00 - RM 14.00'
  };

  try {
    const prompt = `You are an expert on Malaysian dining, groceries, and consumer prices (Klang Valley, Penang, Johor, National Malaysia).
The user wants to compare the price of this item/dish against other Malaysian restaurants, chains, or supermarket brands:
${JSON.stringify(payload, null, 2)}

Provide a structured, beautifully formatted comparison in ${isZh ? 'Simplified Chinese (简体中文)' : 'English'}:
1. 🏪 **Brand & Tier Price Comparison (大马各大品牌/档口价格梯度表)**:
   Compare typical prices across 3-4 Malaysian tiers/competitors (e.g. Mamak / Kopitiam stall vs Local Chain like ZUS/OldTown/Marrybrown vs Fast Food like McDonald's/KFC vs Mall Cafe/Specialty like Starbucks/Chagee vs Supermarkets Lotus's/99 Speedmart/Jaya Grocer). Include realistic RM price ranges.
2. ⚖️ **Price Verdict (价格定位与溢价评估)**:
   If price was provided (${payload.paidPrice}), state if it is a Good Value (实惠), Fair Market (市面均价), or Premium/Overpriced (偏贵/品牌溢价) with estimated percentage difference.
3. 💡 **Top 2-3 High-Value Alternatives (高性价比平替推荐)**:
   Specific, real Malaysian brands or spots where they can get similar quality for less money.
Keep concise (under 200 words), practical, and easy to read.`;

    const apiKey = S.geminiApiKey || '';
    if(apiKey){
      const generation = await generateGeminiContent(apiKey, { contents: [{ parts: [{ text: prompt }] }] });

      if(generation.data){
        const data = generation.data;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if(text){
          targetResultEl.innerHTML = markedParse(text);
          return;
        }
      }
    }

    // High-quality local Malaysian price database fallback
    const itemLower = item.toLowerCase();
    let compTable = [];
    let dupeTips = [];
    let diffVerdict = '';

    if(itemLower.includes('coffee') || itemLower.includes('kopi') || itemLower.includes('latte') || itemLower.includes('cappuccino') || itemLower.includes('zus') || itemLower.includes('starbucks')){
      compTable = [
        { tier: isZh ? '传统茶餐室 / Mamak (Kopi/Kopi O)' : 'Kopitiam / Mamak', range: 'RM 2.40 - RM 3.50', icon: '☕' },
        { tier: isZh ? '华阳茶室 / 传统连锁 (Oriental/OldTown)' : 'Traditional Cafe (Oriental/OldTown)', range: 'RM 7.50 - RM 9.90', icon: '🧈' },
        { tier: isZh ? '本土精品快取 (ZUS / Gigi / Kopi Kenangan)' : 'Local Fast Coffee (ZUS / Gigi)', range: 'RM 9.90 - RM 13.50', icon: '🥤' },
        { tier: isZh ? '国际高端连锁 (Starbucks / The Coffee Bean)' : 'International Chain (Starbucks/CBTL)', range: 'RM 16.00 - RM 22.00', icon: '👑' }
      ];
      dupeTips = [
        isZh ? '💡 **平替推荐**：ZUS 咖啡使用 App 优惠券经常只需 RM 7.90-9.90，性价比远高于星巴克 (RM 18+)。' : '💡 **Smart Dupe**: ZUS Coffee App vouchers often drop lattes to RM 7.90-9.90 vs Starbucks RM 18+.',
        isZh ? '💡 **省钱绝招**：茶餐室/华阳白咖啡浓郁度不输西式拿铁，日常饮用可每月省下 RM 150+！' : '💡 **Saving Tip**: Traditional Kopitiam White Coffee (RM 3-8) satisfies caffeine fix at a fraction of commercial espresso cost.'
      ];
    } else if(itemLower.includes('chicken rice') || itemLower.includes('鸡饭') || itemLower.includes('nasi ayam')){
      compTable = [
        { tier: isZh ? '小贩中心 / 档口 (Hawker Centre)' : 'Hawker Stall', range: 'RM 7.50 - RM 9.50', icon: '🍗' },
        { tier: isZh ? '冷气茶室 / 专卖店 (Shop Lot Kopitiam)' : 'Air-con Kopitiam', range: 'RM 10.50 - RM 14.00', icon: '🥢' },
        { tier: isZh ? '商场连锁 (The Chicken Rice Shop / Mall)' : 'Mall Chain (TCRS / Food Court)', range: 'RM 14.50 - RM 21.00', icon: '🏬' }
      ];
      dupeTips = [
        isZh ? '💡 **平替推荐**：邻里老字号档口（RM 8.00 附汤与油饭）相比商场连锁套餐（RM 18+）每份立省 50% 以上！' : '💡 **Smart Dupe**: Neighbourhood hawker chicken rice (RM 8) delivers identical portion and soup vs mall chain (RM 18+).'
      ];
    } else if(itemLower.includes('nasi lemak') || itemLower.includes('椰浆饭')){
      compTable = [
        { tier: isZh ? '路边档 / 传统香蕉叶 (Warung Bungkus)' : 'Roadside / Warung Stall', range: 'RM 2.50 - RM 4.50', icon: '🍃' },
        { tier: isZh ? 'Mamak 档加炸鸡 (Mamak + Ayam Goreng)' : 'Mamak Stall + Fried Chicken', range: 'RM 8.50 - RM 11.50', icon: '🍛' },
        { tier: isZh ? '名店/商场 (Village Park / Oriental / Mall)' : 'Famous Specialty / Mall Cafe', range: 'RM 13.50 - RM 19.50', icon: '👑' }
      ];
      dupeTips = [
        isZh ? '💡 **平替推荐**：Mamak 档自选现炸鸡椰浆饭仅约 RM 9.00，口感香脆且份量十足。' : '💡 **Smart Dupe**: Mamak fried chicken nasi lemak (RM 9) offers great portion vs high-end cafes (RM 16+).'
      ];
    } else if(itemLower.includes('egg') || itemLower.includes('蛋') || itemLower.includes('milk') || itemLower.includes('奶') || itemLower.includes('grocer') || itemLower.includes('rice') || itemLower.includes('米')){
      compTable = [
        { tier: isZh ? '社区平价超市 (99 Speedmart / Econsave)' : 'Budget Mart (99 Speedmart / Econsave)', range: '市价基准 (最实惠)', icon: '🛒' },
        { tier: isZh ? '大型量贩超市 (Lotus\'s / Giant / Mydin)' : 'Hypermarket (Lotus\'s / Giant)', range: '经常有满减与自有品牌', icon: '🏬' },
        { tier: isZh ? '高端精品超市 (Jaya Grocer / Village Grocer)' : 'Premium Grocer (Jaya / Village Grocer)', range: '溢价 +20% 至 +40%', icon: '✨' }
      ];
      dupeTips = [
        isZh ? '💡 **超市比价**：99 Speedmart 和 Lotus\'s 的生鲜奶类、鸡蛋及白糖食油常年保持政府控价或最低价，比高端超市省 25% 以上！' : '💡 **Grocer Tip**: 99 Speedmart and Lotus\'s consistently offer lowest tier pricing for dairy and eggs vs premium grocers.'
      ];
    } else {
      compTable = [
        { tier: isZh ? '档口 / 街边 (Hawker / Street)' : 'Hawker / Street Stall', range: 'RM 6.00 - RM 9.00', icon: '🥣' },
        { tier: isZh ? '连锁便餐 / 咖啡店 (Local Chain Cafe)' : 'Local Chain Cafe', range: 'RM 11.00 - RM 16.00', icon: '🍽️' },
        { tier: isZh ? '商场餐厅 / 高端 (Mall / Specialty Dining)' : 'Mall / Specialty Dining', range: 'RM 18.00 - RM 32.00', icon: '🏢' }
      ];
      dupeTips = [
        isZh ? '💡 **省钱小贴士**：外食选择 Kopitiam 或熟食中心代替商场餐厅，避开 10% 服务费与 6-8% SST！' : '💡 **Saving Tip**: Dining at local coffeeshops avoids 10% service charge and SST compared to shopping mall outlets.'
      ];
    }

    if(price > 0 && benchmarkAvg > 0){
      const diff = price - benchmarkAvg;
      const pct = Math.round((diff / benchmarkAvg) * 100);
      if(pct > 20){
        diffVerdict = isZh ? `⚠️ **价格评估**：你支付的 RM ${price.toFixed(2)} 高于大马大众市场均价 (RM ${benchmarkAvg.toFixed(2)}) 约 +${pct}%，属于品牌/商场溢价消费。` : `⚠️ **Price Assessment**: RM ${price.toFixed(2)} is +${pct}% above market average (RM ${benchmarkAvg.toFixed(2)}), reflecting a commercial brand premium.`;
      } else if(pct < -10){
        diffVerdict = isZh ? `🎉 **价格评估**：你支付的 RM ${price.toFixed(2)} 比大马市均价 (RM ${benchmarkAvg.toFixed(2)}) 便宜了 ${Math.abs(pct)}%，非常实惠划算！` : `🎉 **Price Assessment**: RM ${price.toFixed(2)} is ${Math.abs(pct)}% below average (RM ${benchmarkAvg.toFixed(2)}), great bargain!`;
      } else {
        diffVerdict = isZh ? `⚖️ **价格评估**：RM ${price.toFixed(2)} 符合大马市面标准合理价格区间。` : `⚖️ **Price Assessment**: RM ${price.toFixed(2)} matches typical Malaysian market fair value.`;
      }
    }

    let html = `
      <div style="font-size:13px;font-weight:800;color:var(--cyan);margin-bottom:8px">
        📊 「${esc(item)}」大马品牌物价梯度横向对比
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
        ${compTable.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg3);border:1px solid var(--border);padding:7px 10px;border-radius:10px">
            <span style="font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px"><span>${c.icon}</span> <span>${c.tier}</span></span>
            <strong style="color:var(--amber);font-size:12px">${c.range}</strong>
          </div>
        `).join('')}
      </div>
      ${diffVerdict ? `<div style="background:rgba(255,179,0,.1);border:1px solid rgba(255,179,0,.3);border-radius:10px;padding:8px 10px;margin-bottom:8px;font-size:11.5px;line-height:1.45">${diffVerdict}</div>` : ''}
      <div style="font-size:11.5px;color:var(--text);line-height:1.5">
        ${dupeTips.map(t => `<div style="margin-bottom:4px">${t}</div>`).join('')}
      </div>
    `;

    targetResultEl.innerHTML = html;
  } catch(e){
    targetResultEl.innerHTML = `<div style="color:var(--muted)">比价查询遇到问题，请重试。</div>`;
  } finally {
    if(btnEl){
      btnEl.disabled = false;
      btnEl.style.opacity = '1';
    }
  }
}
