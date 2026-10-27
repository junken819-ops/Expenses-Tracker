/**
 * Google Gemini Vision AI Receipt Analyzer & Self-Healing Model Engine
 * Modularized from Pocket Winnie Core
 */

// ── 🤖 GOOGLE GEMINI VISION AI RECEIPT ANALYZER ───────
// Google frequently retires, renames, and releases Gemini models.
// Features:
// 1. One-click "Search Available AI Models" to discover & test live models.
// 2. One-click "Set as Default" for any discovered model.
// 3. Dynamic scoring & self-healing auto-failover if Google ever retires a model.

const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];

const MODEL_INFO_MAP = {
  'auto': { title: 'Auto-Detect Working Model', desc: 'Automatically selects fastest active model', tag: '⚡ Recommended' },
  'gemini-2.0-flash': { title: 'Gemini 2.0 Flash', desc: 'Ultra-fast multimodal vision & OCR', tag: '🚀 Fastest' },
  'gemini-2.0-flash-lite': { title: 'Gemini 2.0 Flash-Lite', desc: 'Lightweight & higher rate limits', tag: '⚡ High Quota' },
  'gemini-1.5-flash': { title: 'Gemini 1.5 Flash', desc: 'Reliable long-context vision fallback', tag: '🛡️ Stable' },
  'gemini-1.5-pro': { title: 'Gemini 1.5 Pro', desc: 'Complex reasoning & dense invoices', tag: '🧠 Pro' },
  'gemini-2.5-flash': { title: 'Gemini 2.5 Flash', desc: 'Next-generation multimodal model', tag: '✨ Next-Gen' }
};

const geminiModelCache = new Map();
const geminiDeprecatedModels = new Set();

function geminiModelScore(name){
  const model = String(name || '').toLowerCase();
  let score = 0;
  if(model.includes('flash')) score += 60;
  if(model.includes('latest')) score += 20;
  if(model.includes('pro')) score += 12;
  if(model.includes('preview')) score -= 6;
  if(model.includes('exp') || model.includes('experimental')) score -= 10;
  if(/image|tts|live|transcribe|embedding|robotics|audio|medlm/.test(model)) score -= 80;
  const version = model.match(/gemini-(\d+)(?:\.(\d+))?/);
  if(version) score += Number(version[1]) * 15 + Number(version[2] || 0) * 5;
  return score;
}

async function getGeminiModelCandidates(apiKey, forceRefresh = false){
  const key = String(apiKey || '').trim();
  if(!key || key.length < 8) return GEMINI_MODEL_FALLBACKS;

  

  // Fast path: if not forced refresh and we already have a chosen model or fallbacks, return instantly!
  const now = Date.now();
  const cached = geminiModelCache.get(key);
  if(!forceRefresh && cached && cached.expiresAt > now) {
    return filterDeprecatedModels(cached.models);
  }
  if(!forceRefresh && userChosen && userChosen !== 'auto' && !geminiDeprecatedModels.has(userChosen)){
    return [userChosen, ...filterDeprecatedModels(GEMINI_MODEL_FALLBACKS.filter(m => m !== userChosen))];
  }

  let discovered = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if(res.ok){
      const body = await res.json();
      discovered = (body.models || [])
        .filter(model => {
          const actions = model.supportedGenerationMethods || model.supportedActions || [];
          return Array.isArray(actions) && actions.includes('generateContent');
        })
        .map(model => String(model.name || '').replace(/^models\//, ''))
        .filter(name => /^gemini-/i.test(name) && !geminiDeprecatedModels.has(name));
    }
  } catch(err){
    console.warn('Could not query Gemini model list; using safe ranked fallbacks.', err);
  }

  const rankedDiscovered = discovered.sort((a,b) => geminiModelScore(b) - geminiModelScore(a));
  let combined = [...new Set([...rankedDiscovered, ...GEMINI_MODEL_FALLBACKS])];
  combined = filterDeprecatedModels(combined);

  // If user set a specific default model in Settings, place that model at the top
  const userChosen = (typeof S !== 'undefined' && S) ? (S.geminiModel || 'auto') : 'auto';
  if(userChosen && userChosen !== 'auto'){
    combined = [userChosen, ...combined.filter(m => m !== userChosen)];
  }

  geminiModelCache.set(key, { models: combined, expiresAt: now + (discovered.length ? 60 * 60 * 1000 : 5 * 60 * 1000) });
  if(typeof S !== 'undefined' && S && discovered.length > 0){
    S.geminiDiscoveredModels = rankedDiscovered.slice(0, 15);
  }

  return combined;
}

function filterDeprecatedModels(modelsList){
  return (modelsList || []).filter(name => !geminiDeprecatedModels.has(name));
}

function markGeminiModelDeprecated(modelName, reason = ''){
  if(!modelName) return;
  geminiDeprecatedModels.add(modelName);
  console.warn(`🛡️ Blacklisted retired Gemini model "${modelName}". Reason: ${reason}`);
  for(const [k, v] of geminiModelCache.entries()){
    v.models = filterDeprecatedModels(v.models);
  }
}

async function generateGeminiContent(apiKey, payload, timeoutMs = 25000, signal = null){
  const key = String(apiKey || '').trim();
  if(!key || key.length < 8){
    return { data: null, model: null, lastError: 'API key not configured' };
  }

  const models = await getGeminiModelCandidates(key);
  const candidateModels = models.slice(0, 5); // Try up to 5 models to survive rate-limit & deprecation cascades
  let lastError = '';

  for(const modelName of candidateModels){
    if(signal && signal.aborted) break;

    const fetchController = new AbortController();
    const timeoutId = setTimeout(() => fetchController.abort(), timeoutMs);
    const onParentAbort = () => fetchController.abort();
    if(signal) signal.addEventListener('abort', onParentAbort, { once: true });

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: fetchController.signal
      });
      clearTimeout(timeoutId);
      if(signal) signal.removeEventListener('abort', onParentAbort);

      if(res.ok){
        if(typeof S !== 'undefined' && S && S.geminiActiveModel !== modelName){
          S.geminiActiveModel = modelName;
          save();
          updateGeminiStatusUI();
        }
        return { data: await res.json(), model: modelName, lastError: '' };
      }

      const errBody = await res.json().catch(() => ({}));
      lastError = errBody?.error?.message || `HTTP ${res.status}`;

      const isRetired = res.status === 404 ||
                        /not found|deprecated|retired|not supported|is not supported for api/i.test(lastError);
      if(isRetired){
        markGeminiModelDeprecated(modelName, lastError);
        console.warn(`🔄 Google retired "${modelName}". Auto-falling back to next candidate model...`);
        continue;
      }

      if(res.status === 401 || res.status === 403 || res.status === 429 ||
         /api.?key.*(invalid|not valid)|invalid.*api.?key|resource_exhausted|quota/i.test(lastError)){
        break;
      }
    } catch(err){
      clearTimeout(timeoutId);
      if(signal) signal.removeEventListener('abort', onParentAbort);
      lastError = err?.message || String(err);
      if(signal && signal.aborted) break;
    }
  }

  return { data: null, model: null, lastError };
}

function toggleGeminiKeyVisibility(){
  const inp = el('gemini-key-inp');
  const btn = el('gemini-key-toggle-btn');
  if(!inp) return;
  if(inp.type === 'password'){
    inp.type = 'text';
    if(btn) btn.textContent = '🔒';
  } else {
    inp.type = 'password';
    if(btn) btn.textContent = '👁️';
  }
}

let geminiCallerModal = null;

// ── 🔍 USER FLOW: SEARCH MODELS & SET DEFAULT ───────────

async function searchAndListWorkingGeminiModels(){
  const key = (el('gemini-key-inp')?.value || S.geminiApiKey || '').trim();
  const statusEl = el('gemini-search-status');
  const btn = el('gemini-search-models-btn');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!key || key.length < 8){
    toast(isZh ? '⚠️ 请先输入 API Key 再进行搜索' : '⚠️ Please enter an API key first');
    return;
  }

  if(btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⚡ ${isZh ? '正在从 Google 检索并验证模型…' : 'Querying Google AI & testing models…'}</span>`;
  }
  if(statusEl){
    statusEl.classList.remove('hidden');
    statusEl.innerHTML = `<div style="color:var(--amber);font-weight:700">⚡ ${isZh ? '正在连接 Google AI 获取最新可用模型列表…' : 'Connecting to Google AI to query live vision models for your account…'}</div>`;
  }

  try {
    const candidates = await getGeminiModelCandidates(key, true);
    renderGeminiModelsList(candidates);

    if(statusEl){
      statusEl.innerHTML = `
        <div style="color:var(--green);font-weight:800;margin-bottom:2px">
          ✅ ${isZh ? `成功检索到 ${candidates.length} 个可用模型！` : `Discovered ${candidates.length} active models from Google!`}
        </div>
        <div style="color:var(--text);font-size:11px">
          ${isZh ? '点击下方任意模型的“⭐ 设为默认”即可生效。' : 'Tap "⭐ Set Default" below on the model you want to use.'}
        </div>
      `;
    }
    toast(isZh ? `✅ 找到 ${candidates.length} 个可用模型！` : `✅ Found ${candidates.length} working models!`);
  } catch(err){
    if(statusEl){
      statusEl.innerHTML = `<div style="color:var(--red);font-weight:700">❌ ${isZh ? '搜索失败: ' : 'Search failed: '}${esc(err.message || String(err))}</div>`;
    }
    toast(isZh ? '❌ 模型检索失败，请检查网络或密钥' : '❌ Failed to query Google models');
  } finally {
    if(btn){
      btn.disabled = false;
      btn.innerHTML = `<span>🔍 ${isZh ? '重新搜索 Google 可用模型' : 'Search Available AI Models & Set Default'}</span>`;
    }
  }
}

function setDefaultGeminiModel(modelName){
  if(!modelName) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  S.geminiModel = modelName;
  S.geminiActiveModel = (modelName === 'auto') ? 'gemini-2.0-flash' : modelName;
  save();
  updateGeminiStatusUI();

  // Re-render list to update default badge
  const list = (typeof S !== 'undefined' && S && S.geminiDiscoveredModels && S.geminiDiscoveredModels.length)
    ? S.geminiDiscoveredModels
    : GEMINI_MODEL_FALLBACKS;
  renderGeminiModelsList(list);

  const currentDefaultTag = el('gemini-current-default-tag');
  if(currentDefaultTag){
    currentDefaultTag.textContent = modelName === 'auto' ? '⭐ Default: Auto-Detect' : `⭐ Default: ${modelName}`;
  }

  toast(isZh ? `✅ 已将默认 AI 模型设为: ${modelName}` : `✅ Default AI model set to: ${modelName}`);
}

function renderGeminiModelsList(modelsList = []){
  const container = el('gemini-models-list');
  if(!container) return;

  const currentModel = (typeof S !== 'undefined' && S && S.geminiModel) ? S.geminiModel : 'auto';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  // Build list of models to display: Auto-Detect first, then models
  const uniqueModels = ['auto', ...new Set([...(modelsList || []), ...GEMINI_MODEL_FALLBACKS])].filter(m => !geminiDeprecatedModels.has(m));

  container.innerHTML = uniqueModels.map(m => {
    const isDefault = (m === currentModel);
    const info = MODEL_INFO_MAP[m] || {
      title: m,
      desc: 'Multimodal Vision & Generation',
      tag: '✨ Live Model'
    };

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg2);border:1.5px solid ${isDefault ? 'var(--green)' : 'var(--border)'};border-radius:10px;padding:8px 10px;${isDefault ? 'background:rgba(16,185,129,.07);' : ''}">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <strong style="font-size:12px;color:var(--text)">${esc(info.title)}</strong>
            <span style="font-size:10px;font-weight:700;color:var(--cyan);background:rgba(6,182,212,.15);padding:1px 6px;border-radius:6px">${info.tag}</span>
            ${isDefault ? `<span style="font-size:10px;font-weight:800;color:var(--green);background:rgba(16,185,129,.2);padding:1px 6px;border-radius:6px">★ ${isZh ? '当前默认' : 'Default'}</span>` : ''}
          </div>
          <div style="font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px">
            ${esc(info.desc)} ${m !== 'auto' ? `· <code style="font-size:10px">${m}</code>` : ''}
          </div>
        </div>
        <div style="flex-shrink:0">
          ${isDefault ? `
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--green);padding:4px 9px;border-radius:8px;background:rgba(16,185,129,.18);border:1px solid var(--green)">
              ✓ ${isZh ? '使用中' : 'In Use'}
            </span>
          ` : `
            <button type="button" class="ghost-btn" onclick="setDefaultGeminiModel('${esc(m)}')" style="font-size:11px;padding:5px 10px;margin-bottom:0;width:auto;border-color:var(--cyan);color:var(--cyan);font-weight:700" title="Set ${m} as default model">
              ⭐ ${isZh ? '设为默认' : 'Set Default'}
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function toggleGeminiCustomModelInput(){
  const wrap = el('gemini-custom-model-wrap');
  if(wrap) wrap.classList.toggle('hidden');
}

function applyCustomGeminiModel(){
  const inp = el('gemini-custom-model-inp');
  const val = (inp?.value || '').trim();
  if(!val){
    toast('⚠️ Please type a model name (e.g. gemini-2.0-flash)');
    return;
  }
  setDefaultGeminiModel(val);
  if(el('gemini-custom-model-wrap')) el('gemini-custom-model-wrap').classList.add('hidden');
}

function openGeminiModal(){
  if(el('universal-upload-modal') && !el('universal-upload-modal').classList.contains('hidden')){
    geminiCallerModal = 'universal-upload-modal';
  } else if(el('tx-modal') && !el('tx-modal').classList.contains('hidden')){
    geminiCallerModal = 'tx-modal';
  } else {
    geminiCallerModal = null;
  }

  if(el('gemini-key-inp')) el('gemini-key-inp').value = S.geminiApiKey || '';
  const statusBox = el('gemini-test-status');
  if(statusBox) statusBox.classList.add('hidden');
  const searchStatus = el('gemini-search-status');
  if(searchStatus) searchStatus.classList.add('hidden');

  // Update default tag
  const currentModel = (typeof S !== 'undefined' && S && S.geminiModel) ? S.geminiModel : 'auto';
  const currentDefaultTag = el('gemini-current-default-tag');
  if(currentDefaultTag){
    currentDefaultTag.textContent = currentModel === 'auto' ? '⭐ Default: Auto-Detect' : `⭐ Default: ${currentModel}`;
  }

  // Pre-render list from known/fallback models
  const initialList = (typeof S !== 'undefined' && S && S.geminiDiscoveredModels && S.geminiDiscoveredModels.length)
    ? S.geminiDiscoveredModels
    : GEMINI_MODEL_FALLBACKS;
  renderGeminiModelsList(initialList);

  openModal('gemini-modal');
}

function handleGeminiModalBack(){
  closeModal('gemini-modal');
  if(geminiCallerModal === 'universal-upload-modal'){
    openModal('universal-upload-modal');
  } else if(geminiCallerModal === 'tx-modal'){
    openModal('tx-modal');
  }
}

async function testGeminiKeyConnection(){
  let key = (el('gemini-key-inp')?.value || S.geminiApiKey || '').trim();
  key = key.replace(/^["']|["']$/g, '').trim();

  const isZh = (S.lang === 'zh');
  const statusBox = el('gemini-test-status');
  if(!key || key.length < 8){
    if(statusBox){
      statusBox.innerHTML = `<div style="color:var(--red);font-size:12px;font-weight:700">⚠️ ${isZh ? '请先填入 Google Gemini API Key' : 'Please paste your Google Gemini API key first'}</div>`;
      statusBox.classList.remove('hidden');
    }
    toast(isZh ? '⚠️ 请先输入 API Key' : '⚠️ Please enter an API key to test');
    return;
  }

  if(statusBox){
    statusBox.innerHTML = `<div style="color:var(--amber);font-size:12px;font-weight:700">⚡ ${isZh ? '正在连接 Google AI 测试当前默认模型…' : 'Testing connection with active model…'}</div>`;
    statusBox.classList.remove('hidden');
  }

  const probe = await generateGeminiContent(key, {
    contents: [{ parts: [{ text: 'Respond with OK' }] }]
  });
  const verifiedModel = probe.model;
  const lastErrorMsg = probe.lastError;

  if(verifiedModel){
    S.geminiApiKey = key;
    S.geminiActiveModel = verifiedModel;
    save();
    updateGeminiStatusUI();

    if(statusBox){
      statusBox.innerHTML = `
        <div style="color:var(--green);font-size:12.5px;font-weight:800;margin-bottom:2px">
          ✅ ${isZh ? '连接成功！' : 'Connection Successful!'}
        </div>
        <div style="font-size:11px;color:var(--text)">
          Active Model: <strong style="color:var(--cyan)">${verifiedModel}</strong> · Ready for receipt OCR
        </div>
      `;
    }
    toast(isZh ? `✅ Google Gemini 连接成功！(${verifiedModel})` : `✅ Google Gemini Connected! Active: ${verifiedModel}`);
  } else {
    if(statusBox){
      statusBox.innerHTML = `<div style="color:var(--red);font-size:12px;font-weight:700">❌ ${isZh ? '验证失败: ' : 'Verification Failed: '}${esc(lastErrorMsg || 'Unknown Error')}</div>`;
    }
    toast((isZh ? '❌ 验证失败: ' : '❌ Verification Failed: ') + (lastErrorMsg || '').substring(0, 60));
  }
}

function saveGeminiKey(){
  let key = (el('gemini-key-inp')?.value || '').trim();
  key = key.replace(/^["']|["']$/g, '').trim();

  S.geminiApiKey = key;
  save();
  updateGeminiStatusUI();
  closeModal('gemini-modal');

  const isZh = (S.lang === 'zh');
  const currentModel = S.geminiModel || 'auto';
  if(key){
    toast(isZh ? `🤖 Google AI 已保存！默认模型: ${currentModel}` : `🤖 Google AI saved! Default: ${currentModel}`);
  } else {
    toast(isZh ? 'Google AI key 已清除。' : 'Google AI key cleared.');
  }

  if(geminiCallerModal === 'universal-upload-modal'){
    openModal('universal-upload-modal');
    if(key && key.length > 7 && uniImageDataUrl && (!uniParsedData || !uniParsedData.merchant)){
      toast(isZh ? '✨ 正在使用新配置的密钥识别小票…' : '✨ Re-scanning receipt with your new API key…');
      reScanReceiptWithGemini();
    }
  } else if(geminiCallerModal === 'tx-modal'){
    openModal('tx-modal');
  }
}

function clearGeminiKey(){
  S.geminiApiKey = '';
  S.geminiModel = 'auto';
  if(el('gemini-key-inp')) el('gemini-key-inp').value = '';
  save();
  updateGeminiStatusUI();
  closeModal('gemini-modal');
  const isZh = (S.lang === 'zh');
  toast(isZh ? 'Google AI key 已移除。' : 'Google AI key removed.');

  if(geminiCallerModal === 'universal-upload-modal'){
    openModal('universal-upload-modal');
  } else if(geminiCallerModal === 'tx-modal'){
    openModal('tx-modal');
  }
}

function updateGeminiStatusUI(){
  const hasKey = Boolean(S.geminiApiKey && S.geminiApiKey.length > 7);
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const activeModel = (typeof S !== 'undefined' && S && S.geminiActiveModel) ? S.geminiActiveModel : 'gemini-2.0-flash';
  const defaultSetting = (typeof S !== 'undefined' && S && S.geminiModel) ? S.geminiModel : 'auto';

  // Profile settings badge
  const svalBadge = el('gemini-status-badge');
  if(svalBadge){
    svalBadge.textContent = hasKey ? (isZh ? `已配置 (${defaultSetting}) ›` : `Active (${defaultSetting}) ›`) : (isZh ? '未配置 ›' : 'Not Configured ›');
    svalBadge.style.color = hasKey ? 'var(--green)' : 'var(--amber)';
  }

  // More/Studio settings row
  const sval = el('sval-gemini');
  if(sval){
    sval.textContent = hasKey ? (isZh ? `已连接 ⚡ (${defaultSetting}) ›` : `Connected ⚡ (${defaultSetting}) ›`) : (isZh ? '点击配置 ⚡ ›' : 'Setup ⚡ ›');
    sval.style.color = hasKey ? 'var(--green)' : 'var(--amber)';
  }

  // Tx Modal AI button
  const txBtn = el('tx-gemini-status-btn');
  if(txBtn){
    txBtn.style.background = hasKey ? 'rgba(16,185,129,.18)' : 'rgba(59,130,246,.15)';
    txBtn.style.borderColor = hasKey ? 'var(--green)' : 'var(--cyan)';
    txBtn.innerHTML = hasKey ? `<span>🤖 ${isZh ? 'AI 就绪 ✓' : 'AI Active ✓'}</span>` : '<span>🤖 AI</span>';
  }

  // Universal upload modal banner
  const uniBanner = el('uni-gemini-key-banner');
  const uniTxt = el('uni-gemini-key-txt');
  const uniIcon = el('uni-gemini-key-icon');
  if(uniBanner && uniTxt){
    if(hasKey){
      const masked = S.geminiApiKey.slice(0, 4) + '••••' + S.geminiApiKey.slice(-4);
      if(uniIcon) uniIcon.textContent = '🤖';
      uniTxt.innerHTML = `<span style="color:var(--green)">${isZh ? 'Google AI 就绪' : 'Google AI Ready'}</span> <span style="font-size:10px;color:var(--muted)">(${defaultSetting} · ${masked})</span>`;
      uniBanner.style.borderColor = 'var(--green)';
      uniBanner.style.background = 'rgba(16,185,129,.08)';
    } else {
      if(uniIcon) uniIcon.textContent = '🔑';
      uniTxt.innerHTML = `<span style="color:var(--amber)">${isZh ? '未配置 Google AI 密钥（点击填入）' : 'Google AI Key Not Configured (Tap to enter)'}</span>`;
      uniBanner.style.borderColor = 'var(--amber)';
      uniBanner.style.background = 'rgba(245,158,11,.08)';
    }
  }
}

async function reScanReceiptWithGemini(){
  if(!uniImageDataUrl) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const placeholder = el('uni-upload-placeholder');
  const imgPrev = el('uni-img-preview');
  const badgeWrap = el('uni-detected-badge-wrap');
  const actionBtns = el('uni-action-btns');

  if(placeholder) placeholder.classList.add('hidden');
  startAiScanAnimation('universal');
  if(imgPrev){
    imgPrev.src = uniImageDataUrl;
    imgPrev.classList.remove('hidden');
  }

  try {
    const result = await analyzeUnifiedUploadWithGemini(uniImageDataUrl);
    stopAiScanAnimation();
    if(result && (result.merchant || result.amount > 0 || (result.items && result.items.length > 0))){
      uniParsedData = result;

      if(badgeWrap) badgeWrap.classList.remove('hidden');
      if(actionBtns) actionBtns.classList.remove('hidden');

      const badge = el('uni-detected-badge');
      if(badge){
        const mName = result.merchant || result.recipient || 'Receipt';
        const mAmt = Math.abs(parseFloat(result.amount)) || 0;
        badge.textContent = `🤖 AI Extracted: ${mName} · RM ${mAmt.toFixed(2)}`;
      }

      renderUniversalPreview();
      toast(isZh ? '🤖 AI 识别小票成功！' : '🤖 AI analyzed receipt successfully!');

      if(uniParsedData.items && uniParsedData.items.length > 0){
        enrichItemsWithCalories(uniParsedData.items).then(() => {
          renderUniPreviewItemsList();
        }).catch(() => {});
      }
    } else {
      toast(isZh ? '⚠️ 重新识别失败，请检查密钥或照片' : '⚠️ Re-scan failed. Please check key or image.');
    }
  } catch(e){
    stopAiScanAnimation();
    toast(isZh ? '⚠️ 识别过程出错' : '⚠️ Error during re-scan');
  } finally {
    stopAiScanAnimation();
  }
}
