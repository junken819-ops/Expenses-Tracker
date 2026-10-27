/**
 * Reactive State Store (STATE & S)
 * Modularized from Pocket Winnie Core
 */

/* ═══════════════════════════════════════════════════════════════════
   MAIN STATE STORE (STATE & BACKWARD-COMPATIBLE S ALIAS)
   ═══════════════════════════════════════════════════════════════════ */
// Unified reactive data store holding persistent user data and active UI state.
const STATE = {
  transactions:[],budgets:[],goals:[],reminders:[],debts:[],recurring:[],
  monthlyBudget: 0,
  accounts: JSON.parse(JSON.stringify(DEFAULT_MY_ACCOUNTS)),
  quickPresets: JSON.parse(JSON.stringify(DEFAULT_QUICK_PRESETS)),
  expCategories: JSON.parse(JSON.stringify(DEFAULT_EXP_CATS)),
  incCategories: JSON.parse(JSON.stringify(DEFAULT_INC_CATS)),
  quickLogTitle:'⚡ Quick Log',
  lang: 'en',
  userName:'Pocket Winnie',currency:'RM',theme:'dark',period:'month',selAcc:'all',
  lastUsedAccId:'',gsheetUrl:'',lastSync:'',
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
  geminiApiKey: '',
  geminiModel: 'auto',
  geminiActiveModel: 'gemini-2.0-flash',
  geminiDiscoveredModels: []
};

// ── S: GLOBAL BACKWARD-COMPATIBLE STATE ALIAS ──
let S = STATE;
if(typeof window !== 'undefined'){
  window.STATE = STATE;
  window.S = S;
}

// ── TEMP STATE ─────────────────────────────────────────
let txType='expense', selCat=null, selSubCat=null, selBudCat=null, selRemCat=null, selRecCat=null, selQpCat='food';
let showAllTxSubCats = false;
let selRecType='expense', selDebtDir='owe', selGoalIcon=GOAL_ICONS[0];
let txFilter='all', photoData=null, currentOcrItems=[], currentPresetTab='banks', anaBreakdownMode='category';
let editingTxId = null;
