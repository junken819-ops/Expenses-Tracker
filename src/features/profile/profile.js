/**
 * Profile Settings & Backup Engine
 * Modularized from Pocket Winnie Core
 */

// ── RENDER: PROFILE ────────────────────────────────────
function renderProfile(){
  const initials=S.userName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'PW';
  const ab=el('avatar-initials'); if(ab) ab.textContent=initials;
  const pa=el('profile-avatar'); if(pa) pa.textContent=initials;
  const pn=el('profile-name'); if(pn) pn.textContent=S.userName;
  const ht=el('hdr-title'); if(ht) ht.textContent=(S.lang === 'zh' ? '你好，' : 'Hi, ') + S.userName.split(' ')[0];
  const sn=el('sval-name'); if(sn) sn.textContent=S.userName;
  const sc=el('sval-cur'); if(sc) sc.textContent=S.currency;
  const sth=el('sval-theme'); if(sth) sth.textContent=S.theme === 'light' ? (S.lang === 'zh' ? '浅色模式 ☀️' : 'Light') : (S.lang === 'zh' ? '深色模式 🌙' : 'Dark');
  applyTheme();
  
  const sloc=el('sval-locsuggest');
  if(sloc) sloc.textContent = S.locationSuggestEnabled !== false ? (S.lang === 'zh' ? '已开启 ✓' : 'Enabled ✓') : (S.lang === 'zh' ? '已关闭' : 'Disabled');

  const pInp=el('payday-date-inp');
  if(pInp) pInp.value = S.paydayDate || 25;

  const pAmtInp=el('payday-amount-inp');
  if(pAmtInp) pAmtInp.value = (S.paydayAmount && S.paydayAmount > 0) ? S.paydayAmount : '';

  updateGeminiStatusUI();

  document.querySelectorAll('.cur-sym').forEach(s=>s.textContent=S.currency);
}

function toggleLocationSuggest(){
  S.locationSuggestEnabled = !(S.locationSuggestEnabled !== false);
  save();
  renderProfile();
  toast(S.locationSuggestEnabled ? '📍 Location Auto-Suggest enabled' : '📍 Location Auto-Suggest disabled');
}

// ── RENDER ALL ─────────────────────────────────────────
function renderAll(){
  renderBalance();
  renderRecentTx();
  renderDueSoon();
  renderPaydayCountdown();
  renderSpendingPrediction();
  renderStreakCard();
  renderCalorieWidget();
  renderRestaurantPassportWidget();
  renderHealth();
  renderBudgets();
  renderGoals();
  renderReminders();
  renderRecurring();
  renderDebts();
  renderAnalytics();
  if(typeof renderCashFlowForecast === 'function') renderCashFlowForecast();
  if(typeof renderSpendingHeatmap === 'function') renderSpendingHeatmap();
  initFloatingAiAlerts();
}

// ── PROFILE ACTIONS ────────────────────────────────────
function openNameModal(){el('name-inp').value=S.userName;openModal('name-modal');}
function saveName(){const v=el('name-inp').value.trim();if(!v)return;S.userName=v;save();renderProfile();closeModal('name-modal');toast('Name updated!');}

function cycleCurrency(){const idx=CURRENCIES.indexOf(S.currency);S.currency=CURRENCIES[(idx+1)%CURRENCIES.length];save();renderAll();toast('Currency: '+S.currency);}
function clearData(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const msg = isZh 
    ? '⚠️ 危险操作：确定要彻底清空所有账单与数据吗？\n\n该操作将删除全部记账明细、自定义银行与钱包、预算和存钱目标，将应用完全恢复为出厂全新状态（Brand New App）。\n\n此操作不可撤销！'
    : '⚠️ Warning: Reset ALL data to factory defaults?\n\nThis will permanently delete all transactions, custom wallets, budgets, goals and reminders, giving you a completely fresh, brand-new app.\n\nThis action cannot be undone.';
  
  if(!confirm(msg)) return;

  try {
    localStorage.clear();
  } catch(e){}

  const preservedLang = (S && S.lang) ? S.lang : 'en';
  const preservedTheme = (S && S.theme) ? S.theme : 'dark';

  S = {
    transactions: [],
    budgets: [],
    goals: [],
    reminders: [],
    recurring: [],
    debts: [],
    accounts: JSON.parse(JSON.stringify(DEFAULT_MY_ACCOUNTS)),
    quickPresets: JSON.parse(JSON.stringify(DEFAULT_QUICK_PRESETS)),
    expCategories: JSON.parse(JSON.stringify(DEFAULT_EXP_CATS)),
    incCategories: JSON.parse(JSON.stringify(DEFAULT_INC_CATS)),
    quickLogTitle: '⚡ Quick Log',
    lang: preservedLang,
    userName: isZh ? '记账达人' : 'Pocket Winnie User',
    currency: 'RM',
    theme: preservedTheme,
    period: 'month',
    selAcc: 'all',
    lastUsedAccId: '',
    gsheetUrl: '',
    lastSync: '',
    biometricLock: false,
    pendingMeals: [],
    restaurantRecords: [],
    paydayDate: 25,
    paydayAmount: 0,
    challenges: [],
    streaks: { noSpendBest: 0, noSpendCurrent: 0, lastCheckedDate: '' },
    roundUpJar: 0,
    partnerData: null,
    partnerName: '',
    familyMode: false,
    weeklyReportLastShown: '',
    locationSuggestEnabled: true,
    wallpaperUrl: 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg',
    wallpaperOpacity: 35,
    periodTracker: {
      lastPeriodDate: null,
      hasSetFirstDate: false,
      periodLength: 5,
      cycleLength: 28,
      history: []
    },
    geminiApiKey: ''
  };

  if(typeof window !== 'undefined'){
    window.STATE = S;
    window.S = S;
  }

  dismissedAlertTitles.clear();
  activeAiAlerts = [];
  save();
  applyLanguage();
  renderAll();
  go('home');
  toast(isZh ? '✨ 应用已完全重置为出厂全新状态！' : '✨ App completely reset to brand new state!');
}

function exportCSV(){
  if(!S.transactions || !S.transactions.length){
    toast(S.lang === 'zh' ? '暂无账单数据可导出' : 'No transactions to export');
    return;
  }
  const clean = v => `"${String(v !== undefined && v !== null ? v : '').replace(/"/g, '""')}"`;
  const rows = ['Date,Time,Type,Account,Payment Method,Location,Category,Subcategory,Tags,Description,Amount,Note'];
  [...S.transactions].sort((a,b) => (a.date || '').localeCompare(b.date || '')).forEach(tx => {
    const cat = catInfo(tx.type, tx.category);
    const sub = getSubCatInfo(tx.subCategory);
    const acc = S.accounts ? S.accounts.find(a => a.id === tx.accountId) : null;
    const tagStr = (Array.isArray(tx.tags) && tx.tags.length) ? tx.tags.join(';') : '';
    rows.push([
      clean(tx.date),
      clean(tx.time || ''),
      clean(tx.type || 'expense'),
      clean(acc ? acc.name : 'Wallet'),
      clean(tx.paymentMethod || ''),
      clean(tx.location || ''),
      clean(cat ? cat.name : (tx.category || '')),
      clean(sub ? sub.name : ''),
      clean(tagStr),
      clean(tx.desc || ''),
      clean(tx.amount || 0),
      clean(tx.note || '')
    ].join(','));
  });
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pocket_winnie_${today()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(S.lang === 'zh' ? '📤 CSV 导出成功 (支持 Excel)！' : '📤 CSV Export complete (Excel compatible)!');
}

function exportFullBackupJSON(){
  const safeState = { ...S };
  delete safeState.geminiApiKey; // Exclude secret API key from downloadable backups
  const backup = {
    app: '🍯 Pocket Winnie 🍯',
    version: '4.6',
    backupDate: new Date().toISOString(),
    state: safeState
  };
  const str = JSON.stringify(backup, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PocketWinnie_FullBackup_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(S.lang === 'zh' ? '💾 完整备份文件已下载！请妥善保管。' : '💾 Full Backup downloaded! Keep this file safe.');
}

function importFullBackupJSON(){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const newState = parsed.state || parsed;
        if(newState.transactions && Array.isArray(newState.transactions)){
          applyStateObject(newState);
          save();
          renderAll();
          if(typeof renderCalendar === 'function') renderCalendar();
          toast(S.lang === 'zh' ? `✅ 成功恢复 ${S.transactions.length} 笔账单数据！` : `✅ Restored ${S.transactions.length} transactions successfully!`);
        } else {
          toast(S.lang === 'zh' ? '⚠️ 无效的备份文件格式' : '⚠️ Invalid backup file format');
        }
      } catch(err){
        toast(S.lang === 'zh' ? '⚠️ 无法解析备份 JSON 文件' : '⚠️ Could not parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function purgePhotoCache(){
  if(Array.isArray(S.transactions)){
    S.transactions.forEach(t => { if(t.photo) delete t.photo; });
  }
  save();
  toast(S.lang === 'zh' ? '✨ 小票照片已清空，系统不保留收据图片' : '✨ Receipt photos cleared; photos are never stored');
}