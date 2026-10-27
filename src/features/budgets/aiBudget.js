/**
 * AI Auto-Budget Generator (50/30/20 Optimizer)
 * Modularized from Pocket Winnie Core
 */

// ── 💬 ASK AI FINANCIAL ADVISOR (REMOVED) ────────────────
function openAiAdvisorModal(){}
function sendAiAdvisorPrompt(){}
function sendAiAdvisorMessage(){}

// ── 🎯 AI AUTO-BUDGET GENERATOR (50/30/20 OPTIMIZER) ──────
let pendingAiBudgets = [];

async function openAiAutoBudgetModal(){
  openModal('ai-budget-modal');
  const container = el('ai-budget-content');
  const actions = el('ai-budget-actions');
  if(actions) actions.classList.add('hidden');
  if(!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:24px 0;color:var(--muted)">
      <div style="font-size:32px;margin-bottom:8px">🤖</div>
      <div style="font-size:13px;font-weight:700">Analyzing Your Past 3 Months Spending…</div>
      <div style="font-size:11px;margin-top:4px">Calculating optimal 50/30/20 category limits.</div>
    </div>
  `;

  if(!S.geminiApiKey){
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    container.innerHTML = `
      <div style="text-align:center;padding:24px 0;color:var(--muted)">
        <div style="font-size:32px;margin-bottom:8px">🔑</div>
        <div style="font-size:13px;font-weight:700">${isZh ? '需要 Google Gemini API 密钥' : 'Google Gemini API Key Required'}</div>
        <div style="font-size:11px;margin-top:4px">${isZh ? '零硬编码密钥，请填入您自己的免费 Google AI Studio API Key 即可解锁智能预算调优。' : 'Zero hardcoded keys. Enter your personal free Google AI Studio API Key to unlock smart 50/30/20 budget tuning.'}</div>
        <button type="button" class="primary-btn" onclick="openGeminiModal()" style="margin-top:14px;font-size:12px;padding:8px 16px;width:auto">🔑 ${isZh ? '立即填入 API Key' : 'Enter API Key'}</button>
      </div>
    `;
    return;
  }

  // Calculate actual spending per category
  const cats = getCategories('expense');
  const catSpending = {};
  cats.forEach(c => catSpending[c.id] = 0);
  S.transactions.filter(t => t.type === 'expense').forEach(t => {
    catSpending[t.category] = (catSpending[t.category] || 0) + (Number(t.amount) || 0);
  });

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const thisMonthInc = S.transactions.filter(t => t.type === 'income' && t.date >= monthStart).reduce((s,t) => s + (Number(t.amount)||0), 0);
  const monthlySalary = (S.paydayAmount && S.paydayAmount > 0) ? S.paydayAmount : (thisMonthInc > 0 ? thisMonthInc : 3500);

  const prompt = `You are a Malaysian personal finance budgeting algorithm.
Calculate optimal monthly budget limits for these expense categories based on the 50/30/20 rule:
Monthly Income: RM ${monthlySalary.toFixed(2)}
Categories and user's historical spend:
${JSON.stringify(catSpending)}

Return ONLY a valid raw JSON object matching this schema:
{
  "budgets": [
    { "category": "food", "limit": 600, "rationale": "50% Needs allocation" },
    { "category": "groceries", "limit": 400, "rationale": "Essential groceries" },
    { "category": "fuel", "limit": 200, "rationale": "Petrol / commute" },
    { "category": "toll_parking", "limit": 100, "rationale": "Toll and parking" },
    { "category": "bills", "limit": 300, "rationale": "Utilities & telco" },
    { "category": "shopping", "limit": 250, "rationale": "30% Wants allocation" },
    { "category": "entertainment", "limit": 150, "rationale": "Leisure & weekend" },
    { "category": "health", "limit": 100, "rationale": "Pharmacy & checkups" },
    { "category": "education", "limit": 100, "rationale": "Books & courses" },
    { "category": "other", "limit": 100, "rationale": "Buffer" }
  ],
  "summary": "This budget allocates 50% to needs, 30% to wants, leaving 20% for your savings!"
}`;

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    };

    const generation = await generateGeminiContent(S.geminiApiKey, payload);
    const geminiRes = generation.data;

    if(geminiRes){
      const rawJson = geminiRes.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = extractJsonFromText(rawJson) || JSON.parse(cleanJson);

      pendingAiBudgets = parsed.budgets || [];

      let tableRows = pendingAiBudgets.map(b => {
        const c = catInfo('expense', b.category);
        const curLimit = S.budgets.find(x => x.category === b.category)?.limit || 0;
        return `
          <tr>
            <td><span style="font-size:14px">${c.icon}</span> <strong>${c.name}</strong></td>
            <td style="color:var(--muted)">${curLimit > 0 ? fmt(curLimit) : '—'}</td>
            <td style="color:var(--green);font-weight:800">${fmt(b.limit)}</td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div style="background:rgba(16,185,129,.12);border:1px solid var(--green);border-radius:14px;padding:10px 12px;margin-bottom:12px;font-size:11.5px;color:var(--text)">
          💡 ${esc(parsed.summary || 'Optimized 50/30/20 budget recommendation.')}
        </div>
        <table class="ai-budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Current</th>
              <th>AI Target</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;

      if(actions) actions.classList.remove('hidden');
    }
  } catch(err){
    console.warn('AI Budget generator notice:', err);
    container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--red)">⚠️ Could not generate budgets. Please check connection.</div>`;
  }
}

function applyAiGeneratedBudgets(){
  if(!pendingAiBudgets.length) return;

  pendingAiBudgets.forEach(aiB => {
    const existing = S.budgets.find(b => b.category === aiB.category);
    if(existing){
      existing.limit = parseFloat(aiB.limit);
    } else {
      S.budgets.push({
        category: aiB.category,
        limit: parseFloat(aiB.limit)
      });
    }
  });

  save();
  renderAll();
  closeModal('ai-budget-modal');
  toast('🎯 AI Budgets applied successfully!');
}

function mapAndSetPaymentMethod(methodKeyOrName){
  if(!methodKeyOrName) return;
  const raw = String(methodKeyOrName).trim();
  const lower = raw.toLowerCase();
  
  let targetName = raw || 'Cash';
  
  if(lower.includes('tng') || lower.includes('touch') || lower.includes('rfid')){
    targetName = "Touch 'n Go eWallet";
  } else if(lower.includes('mae') || lower.includes('maybank')){
    targetName = 'Maybank (MAE / QR)';
  } else if(lower.includes('shopee')){
    targetName = 'ShopeePay';
  } else if(lower.includes('debit')){
    targetName = 'Debit Card';
  } else if(lower.includes('credit') || lower.includes('visa') || lower.includes('master')){
    targetName = 'Credit Card';
  } else if(lower.includes('cash') || lower.includes('tunai') || lower.includes('现金')){
    targetName = 'Cash';
  } else {
    const found = PAYMENT_METHODS.find(p => p.id === methodKeyOrName || p.name.toLowerCase() === lower);
    if(found) targetName = found.name;
  }
  
  selectPaymentMethod(targetName);
}

function applyReceiptStructuredData(rawInput, source = 'AI'){
  const data = normalizeGeminiReceiptOutput(rawInput);
  if(!data) return false;

  // 1. Amount
  const amt = parseNumericAmount(data.amount);
  if(Math.abs(amt) > 0 && el('tx-amount')){
    el('tx-amount').value = Math.abs(amt).toFixed(2);
  }

  // 2. Merchant / Store Name
  const merchant = (data.merchant || data.store || data.desc || '').trim();
  if(merchant && el('tx-desc')){
    el('tx-desc').value = merchant;
  }

  // 3. Category Mapping
  if(data.category){
    const cats = getCategories('expense');
    const catLower = String(data.category).toLowerCase().trim();
    const matched = cats.find(c => c.id === catLower || c.name.toLowerCase() === catLower || c.id.includes(catLower) || catLower.includes(c.id));
    if(matched){
      selCat = matched.id;
    } else {
      selCat = data.category;
    }
    if(el('tx-cats')) buildCats('tx-cats', 'expense', id => selCat = id);
  }

  // 4. Payment Method
  const detectedPayment = (data.paymentMethod || data.payMethod || '').trim();
  if(detectedPayment){
    if(el('tx-paymethod-val')) el('tx-paymethod-val').value = detectedPayment;
    mapAndSetPaymentMethod(detectedPayment);
  } else if(merchant){
    mapAndSetPaymentMethod(merchant);
  }

  // 5. Date (YYYY-MM-DD)
  if(data.date && el('tx-date')){
    const cleanDate = normalizeDateStr(data.date, true);
    el('tx-date').value = cleanDate;
  }

  // 6. Time (HH:MM)
  if(data.time && el('tx-time')){
    const cleanTime = String(data.time).trim();
    if(cleanTime.match(/^\d{1,2}:\d{2}$/)){
      el('tx-time').value = cleanTime.padStart(5, '0');
    }
  }

  // 7. Location (Mall / Branch)
  if(data.location && el('tx-location')){
    el('tx-location').value = String(data.location).trim();
  }

  // 8. Items Breakdown
  if(data.items && Array.isArray(data.items) && data.items.length > 0){
    currentOcrItems = data.items;
  }
  const summaryTxt = formatItemsSummary(data);
  if(summaryTxt && el('tx-note')){
    let noteText = summaryTxt;
    if(data.taxReliefCat){
      noteText = `[🇲🇾 Tax Relief: ${data.taxReliefCat.toUpperCase()}] ` + noteText;
    }
    el('tx-note').value = noteText.trim();
  }

  photoData = null;

  // 10. Automatically Expand More Details Panel so user sees all auto-filled fields
  toggleTxMoreDetails(true);

  // 11. Toast Confirmation
  let msg = `🤖 ${source === 'AI' ? 'Google AI' : 'Smart OCR'}: ${merchant || 'Receipt'} · ${fmt(amt)}`;
  if(data.taxReliefCat){
    msg += ` (🏷️ Tax Deductible: ${data.taxReliefCat})`;
  }
  toast(msg);
  return true;
}
