function mergeDefaultCategories(saved, defaults){
  if(!Array.isArray(saved) || !saved.length) return JSON.parse(JSON.stringify(defaults));
  const res = [...saved];
  const existingIds = new Set(res.map(c => c.id));
  for(const d of defaults){
    if(!existingIds.has(d.id)){
      res.push({ ...d });
    }
  }
  return res;
}
/* ═══════════════════════════════════════════════════════════════════
   🍯 POCKET WINNIE — CORE APPLICATION JAVASCRIPT
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   0. DOM HELPER & DOMAIN REFERENCE CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

// ── GLOBAL DOM HELPER & RESILIENT ID RESOLVER ───────────
function el(id){
  if(!id) return null;
  let elem = document.getElementById(id);
  if(elem) return elem;

  const idMap = {
    'goal-name-inp': 'goal-name',
    'goal-target-inp': 'goal-target',
    'goal-deadline-inp': 'goal-date',
    'dep-goal-id': 'deposit-goal-id',
    'dep-amount': 'deposit-amt',
    'bud-amount': 'bud-limit',
    'bud-cats': 'bud-cat',
    'rem-name-inp': 'rem-name',
    'rem-amount-inp': 'rem-amt',
    'rem-date-inp': 'rem-date',
    'rec-desc-inp': 'rec-desc',
    'rec-amount-inp': 'rec-amount',
    'rec-start-inp': 'rec-date',
    'rec-freq-sel': 'rec-freq',
    'debt-person-inp': 'debt-person',
    'debt-amount-inp': 'debt-amt',
    'debt-note-inp': 'debt-note',
    'debt-due-inp': 'debt-due',
    'debt-owe-btn': 'debt-dir-owe',
    'debt-lent-btn': 'debt-dir-lent',
    'payday-day-inp': 'payday-date-inp',
    'payday-salary-inp': 'payday-amount-inp',
    'cat-mgr-list': 'cat-manage-list',
    'custom-wallpaper-url': 'wp-online-url-inp',
    'curr-input-amt': 'fx-amount',
    'curr-from-sel': 'fx-from-cur',
    'curr-res-display': 'fx-converted-val',
    'cpi-national-val': 'ana-cpi-national-val',
    'cpi-user-val': 'ana-cpi-user-val',
    'cpi-verdict-text': 'ana-cpi-verdict-text',
    'cpi-headline-rate': 'ana-cpi-national-val',
    'petrol-liters-inp': 'petrol-liters-val',
    'partner-name-inp': 'partner-name-val'
  };

  if(idMap[id]){
    elem = document.getElementById(idMap[id]);
    if(elem) return elem;
  }

  if(id.endsWith('-inp')){
    elem = document.getElementById(id.slice(0, -4));
    if(elem) return elem;
  } else {
    elem = document.getElementById(id + '-inp');
    if(elem) return elem;
  }

  if(id.startsWith('ana-')){
    elem = document.getElementById(id.slice(4));
    if(elem) return elem;
  } else {
    elem = document.getElementById('ana-' + id);
    if(elem) return elem;
  }

  return null;
}

// ── PAYMENT METHODS ───────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'mae_scan', name: 'Maybank (MAE / QR)', icon: '🐯', bank: 'Maybank' },
  { id: 'tng_qr', name: 'Touch \'n Go eWallet', icon: '💙', bank: 'TNG' },
  { id: 'grabpay', name: 'GrabPay', icon: '🟢', bank: 'Grab' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🛍️', bank: 'Shopee' },
  { id: 'cimb', name: 'CIMB Bank (Octo)', icon: '🔴', bank: 'CIMB' },
  { id: 'public_bank', name: 'Public Bank (PBe)', icon: '🏛️', bank: 'Public Bank' },
  { id: 'rhb', name: 'RHB Bank', icon: '🔵', bank: 'RHB' },
  { id: 'hlb', name: 'Hong Leong Bank', icon: '🏢', bank: 'Hong Leong' },
  { id: 'ambank', name: 'AmBank', icon: '🟡', bank: 'AmBank' },
  { id: 'bank_islam', name: 'Bank Islam', icon: '🕌', bank: 'Bank Islam' },
  { id: 'bank_rakyat', name: 'Bank Rakyat', icon: '🔷', bank: 'Bank Rakyat' },
  { id: 'bsn', name: 'BSN Bank', icon: '🟦', bank: 'BSN' },
  { id: 'gxbank', name: 'GXBank (Digital)', icon: '🟣', bank: 'GXBank' },
  { id: 'boost_bank', name: 'Boost Bank / eWallet', icon: '🚀', bank: 'Boost' },
  { id: 'aeon_bank', name: 'AEON Bank', icon: '🛍️', bank: 'AEON' },
  { id: 'affin', name: 'Affin Bank', icon: '🔴', bank: 'Affin' },
  { id: 'alliance', name: 'Alliance Bank', icon: '🔵', bank: 'Alliance' },
  { id: 'uob', name: 'UOB Malaysia', icon: '🌐', bank: 'UOB' },
  { id: 'ocbc', name: 'OCBC Malaysia', icon: '⛵', bank: 'OCBC' },
  { id: 'hsbc', name: 'HSBC Malaysia', icon: '🔺', bank: 'HSBC' },
  { id: 'scb', name: 'Standard Chartered', icon: '🌿', bank: 'Standard Chartered' },
  { id: 'bigpay', name: 'BigPay', icon: '💳', bank: 'BigPay' },
  { id: 'setel', name: 'Setel (Petronas)', icon: '⛽', bank: 'Setel' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳', bank: 'Card' },
  { id: 'debit_card', name: 'Debit Card', icon: '💳', bank: 'Card' },
  { id: 'fpx', name: 'Online Banking (FPX / DuitNow)', icon: '🌐', bank: 'FPX' },
  { id: 'cash', name: 'Cash (现金)', icon: '💵', bank: 'Cash' },
  { id: 'bnpl', name: 'SPayLater / Atome / BNPL', icon: '⏱️', bank: 'BNPL' }
];

// ── MALAYSIAN PRESETS (COMMERCIAL BANKS & WALLETS) ────
const MY_BANKS = [
  { name: 'Maybank (MAE)', icon: '🐯', color: '#ffc800', type: 'bank' },
  { name: 'CIMB Bank', icon: '🔴', color: '#dc2626', type: 'bank' },
  { name: 'Public Bank', icon: '🏛️', color: '#b91c1c', type: 'bank' },
  { name: 'RHB Bank', icon: '🔵', color: '#0284c7', type: 'bank' },
  { name: 'Hong Leong Bank', icon: '🏢', color: '#be123c', type: 'bank' },
  { name: 'AmBank', icon: '🟡', color: '#e11d48', type: 'bank' },
  { name: 'Bank Rakyat', icon: '🔷', color: '#1d4ed8', type: 'bank' },
  { name: 'BSN Bank', icon: '🟦', color: '#0d9488', type: 'bank' },
  { name: 'GXBank (Digital)', icon: '🟣', color: '#7c3aed', type: 'bank' },
  { name: 'Boost Bank', icon: '🚀', color: '#f43f5e', type: 'bank' },
  { name: 'AEON Bank', icon: '🛍️', color: '#a21caf', type: 'bank' },
  { name: 'Affin Bank', icon: '🔴', color: '#1e3a8a', type: 'bank' },
  { name: 'Alliance Bank', icon: '🔵', color: '#2563eb', type: 'bank' },
  { name: 'UOB Malaysia', icon: '🌐', color: '#1e40af', type: 'bank' },
  { name: 'OCBC Malaysia', icon: '⛵', color: '#ef4444', type: 'bank' },
  { name: 'HSBC Malaysia', icon: '🔺', color: '#e11d48', type: 'bank' },
  { name: 'Standard Chartered', icon: '🌿', color: '#059669', type: 'bank' },
  { name: 'Agrobank', icon: '🌾', color: '#16a34a', type: 'bank' }
];

const MY_EWALLETS = [
  { name: "Touch 'n Go eWallet", icon: '💙', color: '#0284c7', type: 'ewallet' },
  { name: 'GrabPay', icon: '🟢', color: '#10b981', type: 'ewallet' },
  { name: 'ShopeePay', icon: '🟠', color: '#ea580c', type: 'ewallet' },
  { name: 'Boost eWallet', icon: '🔴', color: '#e11d48', type: 'ewallet' },
  { name: 'MAE by Maybank', icon: '🟡', color: '#f59e0b', type: 'ewallet' },
  { name: 'BigPay', icon: '💳', color: '#06b6d4', type: 'ewallet' },
  { name: 'Setel (Petronas)', icon: '⛽', color: '#3b82f6', type: 'ewallet' },
  { name: 'FavePay', icon: '💖', color: '#ec4899', type: 'ewallet' },
  { name: 'Merchantrade Money', icon: '💱', color: '#8b5cf6', type: 'ewallet' },
  { name: 'Lazada Wallet', icon: '💜', color: '#6366f1', type: 'ewallet' }
];

const MY_CUSTOM = [
  { name: 'Cash Wallet', icon: '💵', color: '#10b981', type: 'cash' },
  { name: 'Credit Card', icon: '💳', color: '#6366f1', type: 'credit' },
  { name: 'Fixed Deposit / Savings', icon: '🏦', color: '#059669', type: 'savings' },
  { name: 'Emergency Fund', icon: '🛡️', color: '#f59e0b', type: 'savings' }
];

// ── DATA: CATEGORIES ───────────────────────────────────
const DEFAULT_EXP_CATS = [
  { id: 'food', name: 'Food & Dining', icon: '🍜' },
  { id: 'drinks', name: 'Drinks & Coffee', icon: '🧋' },
  { id: 'groceries', name: 'Groceries & Market', icon: '🛒' },
  { id: 'period_care', name: 'Period Care & Hygiene', icon: '🌸' },
  { id: 'fuel', name: 'Petrol & Fuel', icon: '⛽' },
  { id: 'toll_parking', name: 'Toll & Parking', icon: '🚗' },
  { id: 'transport', name: 'Public Transit & Grab', icon: '🚕' },
  { id: 'shopping', name: 'Shopping & Retail', icon: '🛍️' },
  { id: 'beauty', name: 'Beauty & Skincare', icon: '💄' },
  { id: 'bills', name: 'Bills & Utilities', icon: '⚡' },
  { id: 'rent_housing', name: 'Rent & Housing', icon: '🏠' },
  { id: 'health', name: 'Healthcare & Medical', icon: '💊' },
  { id: 'entertainment', name: 'Entertainment & Fun', icon: '🎬' },
  { id: 'education', name: 'Education & Books', icon: '📚' },
  { id: 'pets', name: 'Pet Care', icon: '🐾' },
  { id: 'donation', name: 'Charity & Gifts', icon: '💖' },
  { id: 'other', name: 'General / Other', icon: '📦' }
];

const DEFAULT_INC_CATS = [
  {id:'salary',name:'Monthly Salary',icon:'💼'},
  {id:'freelance',name:'Freelance & Gigs',icon:'💻'},
  {id:'business',name:'Business & Sales',icon:'🏢'},
  {id:'investment',name:'Investments & Dividends',icon:'📈'},
  {id:'gift',name:'Gifts & Allowance',icon:'🎁'},
  {id:'cashback',name:'Cashback & Rewards',icon:'💧'},
  {id:'other',name:'Other Income',icon:'🤝'}
];

const EXP_CATS = DEFAULT_EXP_CATS;
const INC_CATS = DEFAULT_INC_CATS;

// ── 🏷️ COMPREHENSIVE SUB-CATEGORY & TAXONOMY REGISTRY (40+ CATEGORIES) ──
const MASTER_SUB_CATEGORIES = {
  // Drinks & Beverages (drinks)
  drinks_coffee_cafe: { parent: 'drinks', name: 'Cafe & Coffee', nameZh: '咖啡馆与手冲咖啡', icon: '☕' },
  drinks_boba_tea: { parent: 'drinks', name: 'Boba & Milk Tea', nameZh: '珍珠奶茶与手摇饮', icon: '🧋' },
  drinks_juice_smoothie: { parent: 'drinks', name: 'Juice & Smoothies', nameZh: '鲜榨果汁与果昔', icon: '🥤' },
  drinks_tea_teh: { parent: 'drinks', name: 'Traditional Tea / Teh Tarik', nameZh: '传统饮品与拉茶', icon: '🍵' },
  drinks_alcohol_bar: { parent: 'drinks', name: 'Bar, Beer & Alcohol', nameZh: '酒吧与精酿啤酒', icon: '🍻' },

  // Food & Dining (food)
  food_restaurant: { parent: 'food', name: 'Restaurant & Dining', nameZh: '餐厅堂食', icon: '🍽️' },
  food_hawker_mamak: { parent: 'food', name: 'Hawker & Mamak', nameZh: '档口与嘛嘛档', icon: '🍜' },
  food_fastfood: { parent: 'food', name: 'Fast Food', nameZh: '汉堡快餐', icon: '🍔' },
  food_bakery_pastry: { parent: 'food', name: 'Bakery & Pastry', nameZh: '面包店与糕点', icon: '🥐' },
  food_dessert_snack: { parent: 'food', name: 'Desserts & Snacks', nameZh: '甜品与小吃', icon: '🍰' },
  food_delivery: { parent: 'food', name: 'Food Delivery', nameZh: '外卖送餐', icon: '🛵' },

  // Period Care & Hygiene (period_care)
  period_sanitary_pads: { parent: 'period_care', name: 'Sanitary Pads & Liners', nameZh: '卫生棉与护垫', icon: '🌸' },
  period_tampons_cup: { parent: 'period_care', name: 'Tampons & Menstrual Cup', nameZh: '卫生棉条与月经碟片', icon: '🩸' },
  period_pain_relief: { parent: 'period_care', name: 'Cramp Relief & Warm Patch', nameZh: '经期止痛与暖宫贴', icon: '🩹' },
  period_intimate_care: { parent: 'period_care', name: 'Feminine Wash & Care', nameZh: '女性私密洗护', icon: '🧴' },

  // Groceries & Market (groceries)
  groc_supermarket: { parent: 'groceries', name: 'Supermarket & Hypermarket', nameZh: '大型超市与量贩', icon: '🛒' },
  groc_convenience: { parent: 'groceries', name: 'Convenience Store (7-11/FamilyMart)', nameZh: '便利店', icon: '🏪' },
  groc_fresh_produce: { parent: 'groceries', name: 'Fresh Vegetables & Fruit', nameZh: '新鲜蔬菜水果', icon: '🥬' },
  groc_meat_seafood: { parent: 'groceries', name: 'Meat & Seafood', nameZh: '生鲜肉类水产', icon: '🥩' },
  groc_dairy_eggs: { parent: 'groceries', name: 'Dairy & Eggs', nameZh: '蛋奶制品', icon: '🥛' },
  groc_pantry_staples: { parent: 'groceries', name: 'Pantry & Cooking Staples', nameZh: '粮油米面调味', icon: '🌾' },
  groc_snacks_sweets: { parent: 'groceries', name: 'Snacks & Confectionery', nameZh: '零食与糖果', icon: '🍪' },
  groc_household_cleaning: { parent: 'groceries', name: 'Household & Cleaning', nameZh: '日用清洁耗材', icon: '🧻' },

  // Transportation (fuel / toll_parking / transport)
  trans_petrol_fuel: { parent: 'fuel', name: 'Petrol & Fuel (RON95/97)', nameZh: '汽车加油 (RON95/97)', icon: '⛽' },
  trans_toll_rfid: { parent: 'toll_parking', name: 'Highway Toll & TnG RFID', nameZh: '大道过路费 (RFID)', icon: '🛣️' },
  trans_parking: { parent: 'toll_parking', name: 'Parking Fees & Autopay', nameZh: '停车费与泊车', icon: '🅿️' },
  trans_ridehailing: { parent: 'transport', name: 'Grab & E-Hailing', nameZh: 'Grab与电召车', icon: '🚕' },
  trans_public_transit: { parent: 'transport', name: 'LRT / MRT / Bus / KTM', nameZh: '公共交通 (LRT/MRT)', icon: '🚆' },
  trans_flights_trips: { parent: 'transport', name: 'Flight & Long Distance Travel', nameZh: '飞机票与长途出行', icon: '✈️' },
  trans_car_maintenance: { parent: 'fuel', name: 'Car Service & Repairs', nameZh: '汽车保养维修洗车', icon: '🔧' },

  // Shopping & Retail (shopping)
  shop_clothing_apparel: { parent: 'shopping', name: 'Clothing & Apparel', nameZh: '服装与鞋履', icon: '👗' },
  shop_electronics_tech: { parent: 'shopping', name: 'Electronics & Gadgets', nameZh: '数码科技与手机', icon: '💻' },
  shop_online_marketplace: { parent: 'shopping', name: 'Shopee & Lazada Online', nameZh: '电商平台网购', icon: '📦' },
  shop_home_furniture: { parent: 'shopping', name: 'Home & Kitchenware (IKEA/MR.DIY)', nameZh: '家居与五金工具', icon: '🛋️' },

  // Beauty & Personal Care (beauty)
  beauty_skincare_cosmetics: { parent: 'beauty', name: 'Skincare & Makeup', nameZh: '护肤品与彩妆', icon: '💄' },
  beauty_hair_salon: { parent: 'beauty', name: 'Hair Salon & Barber', nameZh: '美发理发沙龙', icon: '💇' },
  beauty_spa_nails: { parent: 'beauty', name: 'Spa, Massage & Nails', nameZh: '美甲与水疗按摩', icon: '💅' },

  // Bills & Utilities (bills)
  bill_electricity_water: { parent: 'bills', name: 'Electricity & Water (TNB/Air)', nameZh: '水电费 (TNB/水务局)', icon: '💡' },
  bill_mobile_telco: { parent: 'bills', name: 'Mobile Phone & Telco', nameZh: '手机话费流量 (Maxis/Digi)', icon: '📞' },
  bill_home_wifi: { parent: 'bills', name: 'Home Broadband & WiFi', nameZh: '家庭光纤宽带 (Unifi/TIME)', icon: '📶' },
  bill_subscriptions: { parent: 'bills', name: 'Digital Subscriptions', nameZh: '流媒体订阅 (Netflix/Spotify)', icon: '📺' },
  bill_insurance: { parent: 'bills', name: 'Insurance Premiums', nameZh: '医疗与人寿车险保费', icon: '🛡️' },

  // Healthcare & Wellness (health)
  health_pharmacy_rx: { parent: 'health', name: 'Pharmacy & Medicine', nameZh: '药房与处方药 (Watsons/Guardian)', icon: '💊' },
  health_clinic_doctor: { parent: 'health', name: 'Clinic & Doctor Consult', nameZh: '诊所门诊与看诊', icon: '🩺' },
  health_dental_vision: { parent: 'health', name: 'Dental & Optical', nameZh: '牙科与配镜验光', icon: '👓' },
  health_vitamins_supp: { parent: 'health', name: 'Vitamins & Supplements', nameZh: '维生素与营养品', icon: '🧪' },
  health_gym_fitness: { parent: 'health', name: 'Gym & Fitness', nameZh: '健身房与运动', icon: '🏋️' },

  // Education & Books (education)
  edu_books_reading: { parent: 'education', name: 'Books & Stationery (Popular)', nameZh: '书籍阅读与文具', icon: '📚' },
  edu_courses_tuition: { parent: 'education', name: 'Courses, Tuition & Exams', nameZh: '补习辅导与进修考试', icon: '🎓' },

  // Entertainment & Fun (entertainment)
  ent_movies_cinema: { parent: 'entertainment', name: 'Cinema & Movie Tickets', nameZh: '电影票 (GSC/TGV)', icon: '🎬' },
  ent_gaming_hobbies: { parent: 'entertainment', name: 'Games & Hobbies (Steam/PS5)', nameZh: '游戏与手办娱乐', icon: '🎮' },
  ent_events_concerts: { parent: 'entertainment', name: 'Concerts & Events', nameZh: '演唱会与展览活动', icon: '🎟️' },
  ent_sports_activities: { parent: 'entertainment', name: 'Sports & Recreation', nameZh: '羽毛球馆与运动娱乐', icon: '🏸' },

  // Pet Care (pets)
  pet_food_supplies: { parent: 'pets', name: 'Pet Food & Supplies', nameZh: '宠物主粮零食用品', icon: '🐾' },
  pet_vet_care: { parent: 'pets', name: 'Pet Vet & Grooming', nameZh: '宠物医疗驱虫洗澡', icon: '🐱' },

  // Gifts & Donations (donation)
  gift_presents_angpao: { parent: 'donation', name: 'Gifts & Ang Pao', nameZh: '礼物红包送礼', icon: '🎁' },
  gift_charity_ngo: { parent: 'donation', name: 'Charity & Donation', nameZh: '慈善捐赠与助人', icon: '💖' },

  // Rent & Housing (rent_housing)
  home_rent: { parent: 'rent_housing', name: 'Rent', nameZh: '房租', icon: '🏠' },
  home_mortgage: { parent: 'rent_housing', name: 'Mortgage / Home Loan', nameZh: '房贷', icon: '🏡' },
  home_condo_fees: { parent: 'rent_housing', name: 'Condo Maintenance & Management', nameZh: '管理费与维护', icon: '🏢' },
  home_repairs: { parent: 'rent_housing', name: 'Home Repairs & Cleaning', nameZh: '家政清洁与维修', icon: '🛠️' },

  // General Other (other)
  other_bank_fees: { parent: 'other', name: 'Bank & Card Fees', nameZh: '银行手续费', icon: '🏦' },
  other_government_tax: { parent: 'other', name: 'Government Fees & Tax', nameZh: '政府费用与税款', icon: '🏛️' },
  other_misc: { parent: 'other', name: 'Miscellaneous', nameZh: '其他杂项支出', icon: '📦' }
};


// Detailed income choices use the existing seven headline categories, so reports
// remain easy to read while entries can still be as specific as needed.
const MASTER_INC_SUB_CATEGORIES = {
  inc_salary_base: { parent: 'salary', name: 'Basic Salary', nameZh: '基本薪资', icon: '💼' },
  inc_salary_bonus: { parent: 'salary', name: 'Bonus & Performance Pay', nameZh: '奖金与绩效', icon: '🏆' },
  inc_salary_overtime: { parent: 'salary', name: 'Overtime & Allowance', nameZh: '加班费与津贴', icon: '⏱️' },
  inc_salary_commission: { parent: 'salary', name: 'Commission', nameZh: '佣金', icon: '🤝' },
  inc_salary_reimbursement: { parent: 'salary', name: 'Work Reimbursement', nameZh: '工作报销', icon: '🧾' },
  inc_freelance_service: { parent: 'freelance', name: 'Client Service', nameZh: '客户服务收入', icon: '🧑‍💻' },
  inc_freelance_design: { parent: 'freelance', name: 'Design & Creative Work', nameZh: '设计与创作收入', icon: '🎨' },
  inc_freelance_content: { parent: 'freelance', name: 'Content & Creator Income', nameZh: '内容创作收入', icon: '🎥' },
  inc_freelance_tuition: { parent: 'freelance', name: 'Tutoring & Coaching', nameZh: '补习与辅导收入', icon: '👩‍🏫' },
  inc_business_sales: { parent: 'business', name: 'Product Sales', nameZh: '商品销售', icon: '🛍️' },
  inc_business_service: { parent: 'business', name: 'Business Service', nameZh: '商业服务收入', icon: '🏢' },
  inc_business_online: { parent: 'business', name: 'Online Store / Marketplace', nameZh: '网店与平台销售', icon: '🛒' },
  inc_business_rental: { parent: 'business', name: 'Rental Income', nameZh: '租金收入', icon: '🏘️' },
  inc_invest_dividend: { parent: 'investment', name: 'Dividends', nameZh: '股息', icon: '📈' },
  inc_invest_interest: { parent: 'investment', name: 'Bank Interest', nameZh: '银行利息', icon: '🏦' },
  inc_invest_capital_gain: { parent: 'investment', name: 'Capital Gain', nameZh: '资本收益', icon: '📊' },
  inc_invest_crypto: { parent: 'investment', name: 'Crypto / Digital Assets', nameZh: '加密货币与数字资产', icon: '🪙' },
  inc_gift_family: { parent: 'gift', name: 'Family Allowance', nameZh: '家人补贴', icon: '👪' },
  inc_gift_angpao: { parent: 'gift', name: 'Gift & Ang Pao', nameZh: '礼物与红包', icon: '🧧' },
  inc_gift_refund: { parent: 'gift', name: 'Refund Received', nameZh: '收到退款', icon: '↩️' },
  inc_cashback_card: { parent: 'cashback', name: 'Credit Card Cashback', nameZh: '信用卡回扣', icon: '💳' },
  inc_cashback_reward: { parent: 'cashback', name: 'Rewards & Points', nameZh: '奖励与积分兑换', icon: '🎯' },
  inc_other_sale: { parent: 'other', name: 'Sell Used Items', nameZh: '出售二手物品', icon: '📦' },
  inc_other_prize: { parent: 'other', name: 'Prize & Contest', nameZh: '奖金与比赛获奖', icon: '🎉' },
  inc_other_tax_refund: { parent: 'other', name: 'Tax Refund', nameZh: '退税', icon: '🏛️' },
  inc_other_misc: { parent: 'other', name: 'Other Income', nameZh: '其他收入', icon: '🤝' }
};

function getSubCatInfo(subId){
  if(!subId) return null;
  const found = MASTER_SUB_CATEGORIES[subId] || MASTER_INC_SUB_CATEGORIES[subId];
  if(!found) return null;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  return {
    id: subId,
    parent: found.parent,
    name: isZh ? found.nameZh : found.name,
    icon: found.icon
  };
}

const AVAILABLE_CAT_ICONS = [
  '🍜','🍲','🍔','🍕','☕','🧋','🛒','🥩','🥐','⛽','🚗','🚕','🚌','🚆','✈️',
  '⚡','💡','💧','📶','🏠','🏢','🛋️','🛍️','👗','👟','💄','🎬','🎮','🎟️','🎳',
  '💊','🏥','🩹','🏋️','🧴','📚','🎓','💻','📱','💖','🎁','🐾','👶','💼','📈',
  '💰','💵','🏦','🪙','🤝','✨','📦','🛡️','🌴','🏖️','🍯','🪵','🌳','🎈'
];

const CAT_COLOR={
  food:'#f59e0b',groceries:'#10b981',fuel:'#ef4444',toll_parking:'#3b82f6',
  bills:'#f97316',rent_housing:'#8b5cf6',shopping:'#ec4899',entertainment:'#6366f1',
  health:'#06b6d4',education:'#14b8a6',donation:'#ec4899',other:'#6b7280',
  salary:'#10b981',freelance:'#7c3aed',business:'#f59e0b',investment:'#3b82f6',
  affiliate:'#ea580c',gift:'#ec4899',cashback:'#06b6d4'
};

const ACC_ICON={bank:'🏦',cash:'💵',ewallet:'📱',credit:'💳',savings:'🐷'};
const GOAL_ICONS=['🏠','✈️','🚗','📱','💻','🎓','💍','🏖️','🎮','🐷','🌟','🎯'];
const CURRENCIES=['RM','$','€','£','¥','₹'];

// ── DEFAULT MALAYSIAN ACCOUNTS ─────────────────────────
const DEFAULT_MY_ACCOUNTS = [
  {id:'acc_maybank',name:'Maybank (MAE)',type:'bank',icon:'🐯',color:'#ffc800',openingBalance:0},
  {id:'acc_cimb',name:'CIMB Bank',type:'bank',icon:'🔴',color:'#dc2626',openingBalance:0},
  {id:'acc_tng',name:"Touch 'n Go eWallet",type:'ewallet',icon:'💙',color:'#0284c7',openingBalance:0},
  {id:'acc_grabpay',name:'GrabPay',type:'ewallet',icon:'🟢',color:'#10b981',openingBalance:0},
  {id:'acc_cash',name:'Cash Wallet',type:'cash',icon:'💵',color:'#10b981',openingBalance:0}
];

const DEFAULT_QUICK_PRESETS = [
  {icon:'🍜', name:'Mamak', amount:10, category:'food'},
  {icon:'☕', name:'Coffee', amount:7, category:'food'},
  {icon:'⛽', name:'Petrol', amount:50, category:'fuel'},
  {icon:'🚗', name:'Grab', amount:15, category:'toll_parking'},
  {icon:'🛒', name:'Groceries', amount:30, category:'groceries'},
  {icon:'🅿️', name:'Parking', amount:5, category:'toll_parking'}
];

// ── 🌐 MULTI-LANGUAGE (i18n) TRANSLATION DICTIONARY ──
const MONTH_NAMES_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

// ── 🌐 MULTI-LANGUAGE (i18n) TRANSLATION DICTIONARY ──
const I18N = {
  "en": {
    "app_title": "🍯 Pocket Winnie 🍯",
    "track_honey": "Let's track your Honey Pot 🐝",
    "total_balance": "Honey Pot Balance 🍯",
    "income": "Income",
    "expense": "Spent",
    "sec_accounts": "🏦 Accounts & E-Wallets",
    "btn_manage_acc": "⚙️ Manage ➔",
    "recent_activity": "Recent Activity",
    "view_all": "See all",
    "nav_home": "Home",
    "nav_activity": "Transactions",
    "nav_analytics": "Analytics",
    "nav_period": "Period Care",
    "nav_more": "More Hubs",
    "nav_profile": "Profile",
    "cal_view": "Calendar",
    "list_view": "List",
    "today": "Today",
    "month_spent": "Spent this Month",
    "month_income": "Income this Month",
    "net_balance": "Net Balance",
    "w_sun": "S",
    "w_mon": "M",
    "w_tue": "T",
    "w_wed": "W",
    "w_thu": "T",
    "w_fri": "F",
    "w_sat": "S",
    "selected_date": "Selected Date",
    "cal_hint": "Tap any day to inspect breakdown, log expenses, or upload receipts",
    "upload_receipt": "📸 Upload Receipt",
    "add_tx": "➕ Add Transaction",
    "no_tx_date": "No transactions on this date",
    "no_tx_date_sub": "Tap buttons above to record an entry",
    "filter_all": "All",
    "no_tx_found": "No matching transactions",
    "daily_trend": "Daily Trend",
    "hl_top_cat": "Top Category",
    "hl_max_tx": "Largest Expense",
    "hl_peak_day": "Peak Spending Day",
    "hl_tx_count": "Transactions",
    "export_pdf_btn": "📄 Export PDF",
    "exp_breakdown": "Expense Breakdown",
    "by_cat": "Category",
    "by_method": "Method",
    "by_acc": "Account",
    "ana_inflation_title": "🇲🇾 Malaysian Inflation & Benchmark",
    "more_title": "Feature Hubs & Malaysian Toolkit",
    "ai_coach_title": "AI Financial Coach",
    "ai_coach_sub": "Ask questions, get advice & smart spending diagnosis",
    "ai_coach_btn": "Chat ›",
    "hub_sec_title": "🌟 5 Combined All-in-One Hubs",
    "hub1_title": "Shared Bills & IOU Center",
    "hub1_sub": "Meal Splitter · Friends Pay Later · Debt Tracker",
    "hub2_title": "Budget & Wealth Center",
    "hub2_sub": "50/30/20 Budgets · Savings Goals · Weekly Grades · Streaks",
    "hub3_title": "Smart Subscriptions & Bills",
    "hub3_sub": "Recurring Subscriptions · Bill Reminders · Payday Tracker",
    "hub4_title": "Malaysian Market Toolkit",
    "hub4_sub": "Live Petrol Rates · Currency FX · Inflation Calculator",
    "hub5_title": "Receipts, Tax & Statements",
    "hub5_sub": "Receipt Gallery · LHDN Tax Relief · PDF Statements",
    "acc_sec_title": "⚙️ Accounts & Settings",
    "row_banks": "Banks & e-Wallets",
    "row_banks_sub": "Maybank, CIMB, TNG, GrabPay & 28+ accounts",
    "row_family": "Family & Shared Partner Wallet",
    "row_family_sub": "Joint household budget & two-way sync",
    "row_wallpaper": "Cute Wallpaper Studio",
    "row_wallpaper_sub": "Hundred Acre Wood backgrounds & custom wallpapers",
    "row_settings": "Profile & Settings",
    "row_settings_sub": "Theme, Currency, Payday, Data Backup",
    "tab_budgets": "Budgets",
    "tab_goals": "Goals",
    "tab_weekly_grade": "Weekly Grade",
    "tab_streaks": "Streaks",
    "ai_autotune": "🎯 AI Auto-Tune",
    "no_budgets": "No budgets set yet",
    "no_budgets_sub": "Tap ➕ above to set monthly category spending limits!",
    "no_goals": "No savings goals yet",
    "no_goals_sub": "Tap ➕ above to create a new dream savings goal!",
    "tab_recurring": "Recurring",
    "tab_reminders": "Reminders",
    "tab_debts": "Debts",
    "no_reminders": "No bill reminders yet",
    "no_reminders_sub": "Tap ➕ above to track recurring utility bills & rent!",
    "no_recurring": "No recurring subscriptions",
    "no_recurring_sub": "Tap ➕ above to log Netflix, Spotify, or telco plans!",
    "no_debts": "No debts recorded yet",
    "profile_title": "Profile & Preferences",
    "profile_sub": "Personalize your Honey Pot tracker",
    "sec_lang": "🌐 Language / 语言",
    "language": "Display Language",
    "sec_personal": "👤 Personal Information",
    "lbl_name": "Your Name",
    "lbl_currency": "Currency Symbol",
    "lbl_theme": "App Theme",
    "sec_payday": "🌙 Salary & Payday Settings",
    "lbl_payday_date": "Payday Day of Month (1 - 31)",
    "lbl_payday_amt": "Monthly Expected Salary",
    "lbl_manage_exp_cats": "Expense Categories",
    "btn_configure": "Configure",
    "lbl_manage_inc_cats": "Income Categories",
    "sec_ai": "🤖 Google AI (Gemini Vision)",
    "lbl_gemini": "Google Gemini API Key",
    "lbl_gps": "📍 Location-Based Auto-Suggestions",
    "sec_backup": "☁️ Cloud Backup & Data Portability",
    "lbl_backup_json": "Export Full JSON Backup",
    "btn_backup_now": "Export Backup",
    "lbl_restore_json": "Import JSON Backup",
    "btn_restore_now": "Restore Data",
    "lbl_export_csv": "Export Transactions (CSV)",
    "btn_export_now": "Export CSV",
    "lbl_clear_data": "Reset All Data",
    "btn_reset_now": "Reset All Data",
    "btn_income": "Income",
    "btn_expense": "Expense",
    "btn_receipt": "AI Receipt",
    "btn_dup": "Duplicate",
    "btn_transfer": "Transfer",
    "btn_period_tracker": "Girl Period Tracker",
    "row_period_tracker": "Girl Period & Health Care Tracker",
    "row_period_tracker_sub": "Cycle countdown · Ovulation forecast · Partner care guide & sanitary expenses",
    "period_modal_title": "Girl Period & Health Care Tracker",
    "period_cycle_settings": "Cycle Settings",
    "period_next_period": "Next Period",
    "period_ovulation": "Fertile Window",
    "period_status": "Cycle Status",
    "period_calendar_hint": "Tap a day to inspect · double-tap to record health details",
    "period_day_details": "Day Details",
    "period_recorded_health": "Recorded Health",
    "period_flow": "Flow",
    "period_pain": "Pain",
    "period_symptoms": "Symptoms",
    "period_no_health_log": "No health log for this day",
    "period_care_only_note": "Period Care amount only · AI marks foods/drinks that may affect your period",
    "period_care_expense_summary": "Period Care Expenses",
    "period_ai_analysis": "AI Period-Impact Analysis",
    "period_analyze_day": "Analyze with AI",
    "period_analyzing": "Analyzing your health & food data…",
    "period_ai_disclosure": "Uses this day’s saved health details and food flags.",
    "period_start": "Period Start",
    "period_end": "Period End",
    "period_expense_label": "Period Care Expense",
    "period_expense_item": "What did you buy or eat?",
    "period_expense_item_ph": "e.g. sanitary pads, coffee, lunch…",
    "period_expense_kind": "Entry type",
    "period_expense_kind_care": "Period Care",
    "period_expense_kind_food": "Food / Drink",
    "period_expense_desc_required": "Add an item or food description first",
    "period_food_logged": "Food Logged",
    "period_no_day_items": "No period care or food entries for this day.",
    "period_record_day": "Record This Day",
    "period_save_health": "Save Health Details",
    "period_close": "Close",
    "period_flow_light": "Light",
    "period_flow_medium": "Medium",
    "period_flow_heavy": "Heavy",
    "period_pain_none": "None",
    "period_pain_mild": "Mild",
    "period_pain_moderate": "Moderate",
    "period_symptom_cramps": "Cramps",
    "period_symptom_headache": "Headache",
    "period_symptom_bloating": "Bloating",
    "period_symptom_acne": "Acne",
    "period_symptom_cravings": "Cravings",
    "cancel": "Cancel",
    "save": "Save",
    "more": "More",
    "now": "Now",
    "modal_add_tx": "Add Transaction",
    "btn_ai_upload": "📸 Smart AI Upload (Auto-Fill)",
    "lbl_desc": "Description",
    "lbl_category": "Category",
    "btn_edit_cats": "⚙️ Edit Categories",
    "lbl_account": "Account",
    "btn_add_acc": "➕ Add Account",
    "lbl_paymethod": "Payment Method",
    "lbl_more_options": "More details (Time, Location, Tax, Reimburse, Photo)",
    "lbl_date": "Date",
    "lbl_time": "Time",
    "lbl_location": "Location / Merchant",
    "tx_det_loc_lbl": "📍 Location",
    "btn_detect_gps": "📍 Detect GPS",
    "lbl_note": "Note / Items",
    "tx_advance_title": "Advance / Reimbursement",
    "tx_advance_sub": "Mark this as paid on behalf of company or friend",
    "tx_advance_debtor": "Reimbursement Source / Person",
    "tx_advance_status": "Status",
    "lbl_receipt_photo": "📷 Receipt Photo",
    "ph_receipt_photo": "Tap to attach receipt photo",
    "btn_save_tx": "Save Transaction",
    "modal_add_acc": "Add Malaysian Bank / Wallet",
    "lbl_select_preset": "🇲🇾 Choose Bank / E-Wallet Preset",
    "lbl_amount": "Amount",
    "btn_save_acc": "Save Account",
    "modal_transfer": "Transfer / Reload",
    "lbl_from_acc": "From Account",
    "lbl_to_acc": "To Account",
    "btn_transfer_submit": "Transfer",
    "modal_set_budget": "Set Budget",
    "lbl_monthly_limit": "Monthly Limit",
    "btn_save_budget": "Save Budget",
    "modal_new_goal": "New Savings Goal",
    "lbl_goal_name": "Goal Name",
    "lbl_target_amt": "Target Amount",
    "lbl_deadline": "Deadline (optional)",
    "btn_create_goal": "Create Goal",
    "modal_deposit": "Add to Goal",
    "btn_add_deposit": "Add Deposit",
    "modal_add_rem": "Add Bill Reminder",
    "lbl_bill_name": "Bill Name",
    "btn_save_rem": "Save Reminder",
    "modal_add_rec": "Add Recurring Entry",
    "lbl_frequency": "Frequency",
    "lbl_start_date": "Start Date",
    "btn_save_rec": "Save Recurring",
    "modal_log_debt": "Log Debt",
    "lbl_debt_dir": "Direction",
    "lbl_i_owe": "I Owe",
    "lbl_owed_me": "Owed to Me",
    "lbl_person": "Person / Lender",
    "btn_log_debt": "Log Debt",
    "modal_edit_name": "Edit Name",
    "modal_toolkit": "🇲🇾 Malaysian Market Toolkit",
    "tx_info_title": "📋 Transaction Info",
    "tx_det_datetime_lbl": "📅 Date & Time",
    "tx_det_account_lbl": "💳 Account",
    "tx_det_method_lbl": "⚡ Payment Method",
    "tx_det_tax_lbl": "🏷️ LHDN Tax Relief",
    "tx_det_items_title": "🛒 Itemized Breakdown & Notes",
    "tx_det_inflation_title": "🇲🇾 Receipt Items vs Market Benchmark",
    "tx_det_photo_title": "📷 Attached Receipt Photo",
    "tx_det_tap_zoom": "Tap to Zoom",
    "wallpaper_modal_intro": "Personalize your Honey Pot with high-resolution cute wallpapers.",
    "wp_opacity_lbl": "✨ Wallpaper Visibility (Opacity)",
    "custom_wp_dropdown": "Custom URL or Photo Upload",
    "upload_phone_wp": "Upload from Phone Album",
    "custom_wp_link": "🔗 Paste Online Image Link",
    "btn_apply": "Apply",
    "wp_privacy_note": "All wallpaper settings are stored locally on your device.",
    "btn_done": "Done",
    "cat_food": "Food & Dining",
    "cat_drinks": "Drinks & Coffee",
    "cat_period_care": "Period Care & Sanitary",
    "cat_beauty": "Beauty & Skincare",
    "cat_pets": "Pet Care",
    "cat_groceries": "Groceries",
    "cat_transport": "Transport",
    "cat_fuel": "Petrol / Fuel",
    "cat_toll_parking": "Toll & Parking",
    "cat_bills": "Bills & Utilities",
    "cat_shopping": "Shopping",
    "cat_entertainment": "Entertainment",
    "cat_health": "Health & Pharmacy",
    "cat_education": "Education",
    "cat_sports": "Sports & Fitness",
    "cat_lifestyle": "Lifestyle & Hobbies",
    "cat_insurance": "Insurance & Medical",
    "cat_housing": "Rent & Housing",
    "cat_personal": "Personal Care",
    "cat_travel": "Travel & Holidays",
    "cat_family": "Family & Kids",
    "cat_other": "Other Expenses",
    "cat_salary": "Salary & Wages",
    "cat_freelance": "Freelance & Side Income",
    "cat_business": "Business & Sales",
    "cat_investment": "Investments & Dividends",
    "cat_rental_inc": "Rental Income",
    "cat_gift_inc": "Gift & Angpow",
    "cat_refund": "Refund & Cashbacks",
    "cat_other_inc": "Other Income",
    "total_expenses": "Total Expenses Tracked 🍯",
    "this_month": "This Month",
    "period_care": "Period Care",
    "daily_avg": "Daily Average",
    "total_entries": "Total Entries",
    "period_week": "Weekly",
    "period_month": "Monthly",
    "period_year": "Yearly",
    "period_all": "All Time",
    "annual_spending_title": "Annual & By-Year Spending",
    "year_total_spend": "Year Total Spent",
    "monthly_avg": "Monthly Average",
    "month_breakdown_title": "12 Months Breakdown",
    "by_year_title": "By-Year Spending History",
    "ana_tx_count": "Transactions",
    "ana_expenses": "Expenses",
    "ana_net": "Net Savings",
    "ana_daily_avg": "Daily Average",
    "ana_tab_overview": "📊 Overview",
    "ana_tab_breakdown": "🍩 Breakdown",
    "ana_tab_ai": "🤖 AI Insights",
    "ana_503020_title": "💰 50/30/20 Financial Health Matrix",
    "ana_needs": "🏠 Needs (50%)",
    "ana_wants": "🎉 Wants (30%)",
    "ana_savings": "💎 Savings (20%)",
    "ai_price_compare_title": "AI Restaurant & Brand Price Comparison",
    "ai_price_compare_desc": "Compare item and dish prices across Malaysian dining tiers (Kopitiam / Mamak / ZUS / Starbucks / Mixed Rice / Fast Food / Supermarkets) to discover smart, affordable dupes!",
    "modal_bill_rem": "⏰ Bill Reminders",
    "weekly_report_title": "📊 Weekly Financial Grade & Review",
    "btn_close": "Close",
    "payday_modal_title": "🌙 Payday & Salary Settings",
    "payday_modal_sub": "Set your monthly payday date and expected salary to track pay countdowns and daily budgets automatically!",
    "lbl_payday_suffix": "th (e.g. 25th of month)",
    "btn_save_payday": "Save Payday Settings",
    "ph_desc": "e.g. Lunch, Boba drink, Groceries, Shell Petrol, Grab.",
    "ph_location": "e.g. Mid Valley Megamall, Shell Bangsar.",
    "ph_note": "e.g. Split bill with friends.",
    "lbl_limit": "Monthly Limit",
    "btn_save_goal": "Save Goal",
    "modal_add_savings": "Add to Savings",
    "btn_save": "Save",
    "lbl_due_date": "Due Date",
    "btn_save_reminder": "Save Reminder",
    "modal_new_sub": "New Subscription / Recurring",
    "lbl_first_due": "Next / First Due Date",
    "btn_save_sub": "Save Subscription",
    "modal_new_debt": "New IOU / Debt Record",
    "lbl_person_name": "Person's Name",
    "modal_your_name": "Your Name",
    "modal_cur_converter": "💱 Live Currency Exchange & Converter",
    "modal_manage_cats": "⚙️ Manage Categories & Subcategories",
    "period_set_start": "Set Period Start",
    "period_set_end": "Set Period End",
    "period_record_care_expense": "Record Care Expense / Food for this Day:",
    "period_expense_desc_ph": "e.g. Sanitary Pads, Hot Chocolate, Bento...",
    "wp_modal_title": "🎨 Cute Wallpaper Studio",
    "wp_modal_sub": "Customize background wallpaper with Winnie the Pooh themes or custom photos.",
    "wp_custom_options": "🖼️ Custom Photo Upload or Online Image URL",
    "wp_upload_device": "📷 Upload Photo from Device",
    "wp_tap_to_upload": "Tap to Choose Image File",
    "wp_online_url": "🌐 Or Paste Direct Online Image URL"
  },
  "zh": {
    "app_title": "🍯 小熊记账 🍯",
    "track_honey": "随手记账，守护你的小金库 🐝",
    "total_balance": "小金库总资产 🍯",
    "income": "收入",
    "expense": "支出",
    "sec_accounts": "🏦 账户与电子钱包",
    "btn_manage_acc": "⚙️ 管理 ➔",
    "recent_activity": "最近明细",
    "view_all": "查看全部",
    "nav_home": "首页",
    "nav_activity": "账单明细",
    "nav_analytics": "消费分析",
    "nav_period": "经期关怀",
    "nav_more": "功能中心",
    "nav_profile": "我的",
    "cal_view": "日历视图",
    "list_view": "列表视图",
    "today": "今天",
    "month_spent": "本月支出",
    "month_income": "本月收入",
    "net_balance": "本月结余",
    "w_sun": "日",
    "w_mon": "一",
    "w_tue": "二",
    "w_wed": "三",
    "w_thu": "四",
    "w_fri": "五",
    "w_sat": "六",
    "selected_date": "所选日期",
    "cal_hint": "点击任意日期查看当天开销明细、快捷记账或扫描小票",
    "upload_receipt": "📸 拍照扫小票",
    "add_tx": "➕ 记一笔",
    "no_tx_date": "当天暂无账单记录",
    "no_tx_date_sub": "点击上方按钮即可快捷记账",
    "filter_all": "全部",
    "no_tx_found": "未找到匹配账单",
    "daily_trend": "每日消费走势",
    "hl_top_cat": "支出最高分类",
    "hl_max_tx": "单笔最高支出",
    "hl_peak_day": "支出最高单日",
    "hl_tx_count": "总计交易笔数",
    "export_pdf_btn": "📄 导出对账单 (PDF)",
    "exp_breakdown": "消费结构拆解",
    "by_cat": "按分类",
    "by_method": "按支付方式",
    "by_acc": "按账户",
    "ana_inflation_title": "🇲🇾 大马通胀率与物价基准比对",
    "more_title": "更多功能中心与大马实用工具",
    "ai_coach_title": "AI 理财智能教练",
    "ai_coach_sub": "随时提问，获取个性化省钱建议与消费诊断",
    "ai_coach_btn": "立即对话 ›",
    "hub_sec_title": "🌟 5 大多功能合一中心",
    "hub1_title": "多人分账与借还中心",
    "hub1_sub": "聚餐 AA 分账 · 好友待付记账 · 人情借贷追踪",
    "hub2_title": "资产与预算中心",
    "hub2_sub": "50/30/20 黄金预算 · 存钱心愿目标 · 周度自律评分 · 连续打卡",
    "hub3_title": "周期订阅与账单",
    "hub3_sub": "周期性订阅服务 · 水电房租提醒 · 发薪日倒计时",
    "hub4_title": "大马本土实用工具箱",
    "hub4_sub": "实时油价查询 · 实时汇率换算 · 大马通胀计算器",
    "hub5_title": "小票凭证与税务导出",
    "hub5_sub": "小票相册画廊 · LHDN 个人税减免 · 月度 PDF 对账单",
    "acc_sec_title": "⚙️ 账户与基础设置",
    "row_banks": "银行账户与电子钱包",
    "row_banks_sub": "Maybank、CIMB、TNG、GrabPay 及 28+ 种本地账户",
    "row_family": "情侣 / 家庭共享账本",
    "row_family_sub": "家庭共同开销管理与离线双向数据同步",
    "row_wallpaper": "小金库壁纸工坊",
    "row_wallpaper_sub": "百亩森林萌系背景与自定义网络壁纸",
    "row_settings": "个人偏好与设置",
    "row_settings_sub": "深浅主题、货币符号、发薪日、数据云备份",
    "tab_budgets": "分类预算",
    "tab_goals": "存钱目标",
    "tab_weekly_grade": "周度评分",
    "tab_streaks": "自律打卡",
    "ai_autotune": "🎯 AI 智能调优",
    "no_budgets": "尚未设置分类预算",
    "no_budgets_sub": "点击上方 ➕ 设定每月各项开销限额吧！",
    "no_goals": "尚未建立存钱目标",
    "no_goals_sub": "点击上方 ➕ 开启你的第一个心愿存钱罐！",
    "tab_recurring": "周期扣款",
    "tab_reminders": "账单提醒",
    "tab_debts": "人情借还",
    "no_reminders": "暂无账单还款提醒",
    "no_reminders_sub": "点击上方 ➕ 添加水电房租到期提醒！",
    "no_recurring": "暂无周期性固定开销",
    "no_recurring_sub": "点击上方 ➕ 记录 Netflix、Spotify 或电话账单！",
    "no_debts": "暂无人情借贷记录",
    "profile_title": "个人偏好与设置",
    "profile_sub": "定制你的专属小金库记账体验",
    "sec_lang": "🌐 界面语言 (Language)",
    "language": "选择显示语言",
    "sec_personal": "👤 个人信息",
    "lbl_name": "你的昵称",
    "lbl_currency": "货币符号",
    "lbl_theme": "界面主题",
    "sec_payday": "🌙 发薪日与薪资周期",
    "lbl_payday_date": "每月发薪日 (1 - 31日)",
    "lbl_payday_amt": "每月税后预计薪资",
    "lbl_manage_exp_cats": "支出分类管理",
    "btn_configure": "管理分类",
    "lbl_manage_inc_cats": "收入分类管理",
    "sec_ai": "🤖 Google AI (Gemini Vision) 识图配置",
    "lbl_gemini": "Google Gemini API 密钥",
    "lbl_gps": "📍 GPS 消费地点自动建议",
    "sec_backup": "☁️ 云端备份与数据导出",
    "lbl_backup_json": "导出全量数据备份 (JSON)",
    "btn_backup_now": "立即导出备份",
    "lbl_restore_json": "导入全量数据恢复 (JSON)",
    "btn_restore_now": "恢复数据",
    "lbl_export_csv": "导出流水明细 (CSV)",
    "btn_export_now": "导出 CSV",
    "lbl_clear_data": "清空并重置所有数据",
    "btn_reset_now": "重置所有数据",
    "btn_income": "记收入",
    "btn_expense": "记支出",
    "btn_receipt": "AI 扫小票",
    "btn_dup": "再记一笔",
    "btn_transfer": "转账/充值",
    "btn_period_tracker": "女生经期关怀",
    "row_period_tracker": "🌸 女生经期与贴心关怀助手",
    "row_period_tracker_sub": "经期倒计时 · 生理期/排卵预测 · 伴侣体贴提示 · 卫生用品开销",
    "period_modal_title": "女生经期与贴心关怀助手",
    "period_cycle_settings": "周期设置",
    "period_next_period": "下次月经",
    "period_ovulation": "排卵/易孕期",
    "period_status": "当前周期状态",
    "period_calendar_hint": "点击日期查看 · 双击记录健康详情",
    "period_day_details": "当天明细",
    "period_recorded_health": "已记录的健康数据",
    "period_flow": "流量",
    "period_pain": "痛感",
    "period_symptoms": "症状",
    "period_no_health_log": "当天暂无健康记录",
    "period_care_only_note": "仅统计经期用品金额 · AI 标记可能影响经期的饮食",
    "period_care_expense_summary": "经期用品开销",
    "period_ai_analysis": "AI 经期影响分析",
    "period_analyze_day": "AI 分析本日",
    "period_analyzing": "正在分析健康与饮食数据…",
    "period_ai_disclosure": "仅使用本日已保存的健康详情与饮食标记。",
    "period_start": "经期开始日",
    "period_end": "经期结束日",
    "period_expense_label": "经期用品开销",
    "period_expense_item": "买了什么或吃了什么？",
    "period_expense_item_ph": "例如：卫生巾、咖啡、午餐…",
    "period_expense_kind": "记录类型",
    "period_expense_kind_care": "经期用品",
    "period_expense_kind_food": "食物 / 饮品",
    "period_expense_desc_required": "请先填写用品、食物或饮品名称",
    "period_food_logged": "饮食记录",
    "period_no_day_items": "当天暂无经期用品或饮食记录。",
    "period_record_day": "记入该日",
    "period_save_health": "保存健康详情",
    "period_close": "关闭",
    "period_flow_light": "少量",
    "period_flow_medium": "中等",
    "period_flow_heavy": "多量",
    "period_pain_none": "无痛",
    "period_pain_mild": "轻微",
    "period_pain_moderate": "中度",
    "period_symptom_cramps": "腹痛",
    "period_symptom_headache": "头痛",
    "period_symptom_bloating": "腹胀",
    "period_symptom_acne": "长痘",
    "period_symptom_cravings": "嗜甜",
    "cancel": "取消",
    "save": "保存",
    "more": "更多",
    "now": "现在",
    "modal_add_tx": "记录账单",
    "btn_ai_upload": "📸 智能 AI 扫描 (自动填单)",
    "lbl_desc": "商家 / 账单描述",
    "lbl_category": "消费分类",
    "btn_edit_cats": "⚙️ 编辑分类",
    "lbl_account": "支付账户",
    "btn_add_acc": "➕ 添加账户",
    "lbl_paymethod": "支付方式",
    "lbl_more_options": "更多明细 (时间、地点、税项、垫付报销、照片)",
    "lbl_date": "交易日期",
    "lbl_time": "交易时间",
    "lbl_location": "消费地点 / 商场",
    "tx_det_loc_lbl": "📍 消费地点",
    "btn_detect_gps": "📍 GPS 定位",
    "lbl_note": "备注 / 单品明细",
    "tx_advance_title": "垫付款 / 待报销",
    "tx_advance_sub": "帮公司或朋友先行垫付，方便后续一键核销",
    "tx_advance_debtor": "报销来源 / 垫付对象",
    "tx_advance_status": "报销状态",
    "lbl_receipt_photo": "📷 小票 / 账单照片",
    "ph_receipt_photo": "点击拍摄或上传小票照片",
    "btn_save_tx": "保存账单",
    "modal_add_acc": "添加马来西亚银行 / 电子钱包",
    "lbl_select_preset": "🇲🇾 选择银行 / 电子钱包预设",
    "lbl_amount": "金额",
    "btn_save_acc": "保存账户",
    "modal_transfer": "内部转账 / 钱包充值",
    "lbl_from_acc": "转出账户",
    "lbl_to_acc": "转入账户",
    "btn_transfer_submit": "确认转账",
    "modal_set_budget": "设定每月预算",
    "lbl_monthly_limit": "每月限额",
    "btn_save_budget": "保存预算",
    "modal_new_goal": "建立存钱目标",
    "lbl_goal_name": "目标名称",
    "lbl_target_amt": "目标金额",
    "lbl_deadline": "截止日期 (选填)",
    "btn_create_goal": "开启目标",
    "modal_deposit": "存入心愿存钱罐",
    "btn_add_deposit": "确认存入",
    "modal_add_rem": "添加账单还款提醒",
    "lbl_bill_name": "账单名称",
    "btn_save_rem": "保存提醒",
    "modal_add_rec": "添加周期性扣款",
    "lbl_frequency": "扣款频次",
    "lbl_start_date": "起始扣款日",
    "btn_save_rec": "保存周期项",
    "modal_log_debt": "记录人情借还",
    "lbl_debt_dir": "借还方向",
    "lbl_i_owe": "我欠别人 (应还)",
    "lbl_owed_me": "别人欠我 (应收)",
    "lbl_person": "对方姓名 / 机构",
    "btn_log_debt": "保存借还单",
    "modal_edit_name": "修改昵称",
    "modal_toolkit": "🇲🇾 马来西亚本土实用工具箱",
    "tx_info_title": "📋 交易详细信息",
    "tx_det_datetime_lbl": "📅 交易日期与时间",
    "tx_det_account_lbl": "💳 支付账户",
    "tx_det_method_lbl": "⚡ 支付方式",
    "tx_det_tax_lbl": "🏷️ LHDN 个人所得税减免",
    "tx_det_items_title": "🛒 单品明细与备注",
    "tx_det_inflation_title": "🇲🇾 小票单品 vs 大马市面均价",
    "tx_det_photo_title": "📷 附带小票照片",
    "tx_det_tap_zoom": "点击放大预览",
    "wallpaper_modal_intro": "使用可爱的高清百亩森林插画装扮你的记账空间。",
    "wp_opacity_lbl": "✨ 壁纸清晰度 (透明度调节)",
    "custom_wp_dropdown": "自定义链接或手机相册上传",
    "upload_phone_wp": "从手机相册选择照片 (Upload from Phone)",
    "custom_wp_link": "🔗 粘贴网络图片链接 (支持 Google/Pinterest 链接)",
    "btn_apply": "应用壁纸",
    "wp_privacy_note": "所有壁纸设置仅保存在你的手机本地，完全私密，不会对外传输。",
    "btn_done": "完成",
    "cat_food": "餐饮堂食",
    "cat_drinks": "饮料与咖啡奶茶",
    "cat_period_care": "女生经期护理",
    "cat_beauty": "美妆与护肤",
    "cat_pets": "宠物开销",
    "cat_groceries": "生鲜超市",
    "cat_transport": "交通出行",
    "cat_fuel": "汽油车费",
    "cat_toll_parking": "过路费与停车",
    "cat_bills": "水电网账单",
    "cat_shopping": "日常购物",
    "cat_entertainment": "休闲娱乐",
    "cat_health": "医疗健康",
    "cat_education": "学习进修",
    "cat_sports": "运动健身",
    "cat_lifestyle": "生活爱好",
    "cat_insurance": "保险医疗",
    "cat_housing": "房租房贷",
    "cat_personal": "个人护理",
    "cat_travel": "旅游度假",
    "cat_family": "家庭育儿",
    "cat_other": "其他开销",
    "cat_salary": "工资收入",
    "cat_freelance": "兼职副业",
    "cat_business": "生意营业额",
    "cat_investment": "投资与股息",
    "cat_rental_inc": "租金收入",
    "cat_gift_inc": "礼金红包",
    "cat_refund": "退款与回扣",
    "cat_other_inc": "其他收入",
    "total_expenses": "小金库累计支出 🍯",
    "this_month": "本月",
    "period_care": "经期关怀",
    "daily_avg": "日均开销",
    "total_entries": "记录笔数",
    "period_week": "按周",
    "period_month": "按月",
    "period_year": "按年",
    "period_all": "全部历史",
    "annual_spending_title": "年度与历年支出明细",
    "year_total_spend": "全年总支出",
    "monthly_avg": "月均支出",
    "month_breakdown_title": "全年 12 个月支出明细",
    "by_year_title": "历年消费总览与对比",
    "ana_tx_count": "记账笔数",
    "ana_expenses": "总支出",
    "ana_net": "净储蓄",
    "ana_daily_avg": "日均支出",
    "ana_tab_overview": "📊 收支概览",
    "ana_tab_breakdown": "🍩 消费拆解",
    "ana_tab_ai": "🤖 AI 智能洞察",
    "ana_503020_title": "💰 50/30/20 财务健康法则",
    "ana_needs": "🏠 必要开支 (50%)",
    "ana_wants": "🎉 欲望享受 (30%)",
    "ana_savings": "💎 储蓄投资 (20%)",
    "ai_price_compare_title": "AI 餐厅与品牌物价横向比价",
    "ai_price_compare_desc": "横向对比不同餐厅与品牌（Kopitiam / Mamak / ZUS / 星巴克 / 杂饭 / 麦当劳 / Lotus's / 99 Speedmart）的菜品与日用品价格，发现更省钱的同质平替！",
    "modal_bill_rem": "⏰ 账单提醒",
    "weekly_report_title": "📊 每周财务评分与复盘",
    "btn_close": "关闭",
    "payday_modal_title": "🌙 发薪日与月薪设置",
    "payday_modal_sub": "设定你的每月发薪日期和预估月薪，Pocket Winnie 将为你自动计算距离发薪倒计时、发薪日自动记账并规划每日可用预算！",
    "lbl_payday_suffix": "号 (例如每月 25 号)",
    "btn_save_payday": "保存发薪设置",
    "ph_desc": "例如：午餐、奶茶、买菜、Shell 加油、Grab 叫车",
    "ph_location": "例如：Mid Valley Megamall、Shell Bangsar",
    "ph_note": "例如：和朋友AA制聚餐",
    "lbl_limit": "月度限额",
    "btn_save_goal": "保存目标",
    "modal_add_savings": "存入小金库",
    "btn_save": "保存",
    "lbl_due_date": "到期日",
    "btn_save_reminder": "保存提醒",
    "modal_new_sub": "新增周期扣款 / 订阅",
    "lbl_first_due": "下次 / 首次扣款日",
    "btn_save_sub": "保存订阅",
    "modal_new_debt": "新增借还 / 人情往来",
    "lbl_person_name": "对方姓名",
    "modal_your_name": "你的姓名",
    "modal_cur_converter": "💱 实时汇率换算器",
    "modal_manage_cats": "⚙️ 管理收支分类与二级子分类",
    "period_set_start": "设为经期开始日",
    "period_set_end": "设为经期结束日",
    "period_record_care_expense": "记录当天的关怀消费 / 饮食：",
    "period_expense_desc_ph": "例如：安睡裤、热可可、便当…",
    "wp_modal_title": "🎨 萌系小金库壁纸工坊",
    "wp_modal_sub": "自定义个性化背景壁纸，支持小熊维尼主题或上传私人相册照片。",
    "wp_custom_options": "🖼️ 上传照片或在线网络图片",
    "wp_upload_device": "📷 从本机设备上传照片",
    "wp_tap_to_upload": "点击选择本地图片",
    "wp_online_url": "🌐 或直接粘贴在线图片 URL"
  }
};

function t(key, fallback = ''){
  const lang = (typeof S !== 'undefined' && S && S.lang) ? S.lang : 'en';
  if(I18N[lang] && I18N[lang][key]) return I18N[lang][key];
  if(I18N.en && I18N.en[key]) return I18N.en[key];
  if(I18N.zh && I18N.zh[key]) return I18N.zh[key];
  return fallback || '';
}

function setLanguage(lang){
  if(!lang) return;
  S.lang = lang;
  save();
  applyLanguage();
  renderAll();
  renderCalendar();
  renderFullTx();
  toast(lang === 'zh' ? '🌐 语言已切换为：简体中文' : '🌐 Language switched to: English');
}

function toggleLanguage(){
  const nextLang = (S && S.lang === 'zh') ? 'en' : 'zh';
  setLanguage(nextLang);
}

function applyLanguage(){
  const lang = (S && S.lang) ? S.lang : 'en';
  const isZh = lang === 'zh';
  
  // Highlight active lang pill
  ['en', 'zh'].forEach(l => {
    const btn = el('lang-btn-' + l);
    if(btn) btn.classList.toggle('on', l === lang);
  });

  const topLangBtn = el('top-lang-btn');
  if(topLangBtn){
    topLangBtn.textContent = isZh ? '中' : 'EN';
    topLangBtn.title = isZh ? '切换为英文 (Switch to English)' : '切换为简体中文 (Switch to Chinese)';
  }

  // Apply to all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    const txt = t(key);
    if(txt) node.textContent = txt;
  });

  // Apply to all data-i18n-ph placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(node => {
    const key = node.getAttribute('data-i18n-ph');
    const txt = t(key);
    if(txt) node.placeholder = txt;
  });

  // Localize Header & Greetings
  const hdrTitle = el('hdr-title');
  if(hdrTitle) hdrTitle.textContent = isZh ? '🍯 小熊记账 🍯' : '🍯 Pocket Winnie 🍯';
  const greetingTxt = el('greeting-txt');
  if(greetingTxt) greetingTxt.textContent = greeting();

  // Localize Payday Hero
  const paydayHeroTag = el('payday-hero-tag');
  if(paydayHeroTag) paydayHeroTag.textContent = isZh ? '🌙 发薪倒计时' : '🌙 Payday Countdown';

  // Localize Analytics Tabs
  const tabOv = el('ana-view-tab-overview');
  if(tabOv) tabOv.innerHTML = `<span>${isZh ? '📊 收支概览' : '📊 Overview'}</span>`;
  const tabBd = el('ana-view-tab-breakdown');
  if(tabBd) tabBd.innerHTML = `<span>${isZh ? '🍩 消费拆解' : '🍩 Breakdown'}</span>`;
  const tabAi = el('ana-view-tab-ai');
  if(tabAi) tabAi.innerHTML = `<span>${isZh ? '🤖 AI 智能洞察' : '🤖 AI Insights'}</span>`;

  // Localize Analytics Breakdown Select
  const anaBreakdownSel = el('ana-breakdown-sel');
  if(anaBreakdownSel && anaBreakdownSel.options && anaBreakdownSel.options.length >= 6){
    anaBreakdownSel.options[0].textContent = isZh ? '🏷️ 按消费分类 (Category)' : '🏷️ By Category';
    anaBreakdownSel.options[1].textContent = isZh ? '🏆 Top 5 单品排行榜 (Top 5 Items)' : '🏆 Top 5 Dishes & Items';
    anaBreakdownSel.options[2].textContent = isZh ? '🍲 餐饮分群 (主食/饮料/小吃)' : '🍲 Dishes by Type (Mains, Drinks, Snacks)';
    anaBreakdownSel.options[3].textContent = isZh ? '🏪 商家与餐厅 (Stores)' : '🏪 Stores & Places';
    anaBreakdownSel.options[4].textContent = isZh ? '🧾 SST与服务费明细 (Taxes)' : '🧾 SST & Svc Tax';
    anaBreakdownSel.options[5].textContent = isZh ? '💳 支付方式 (Method)' : '💳 Payment Method';
  }

  // Localize Analytics Period Select
  const anaPeriodSel = el('ana-period-select');
  if(anaPeriodSel && anaPeriodSel.options && anaPeriodSel.options.length >= 4){
    anaPeriodSel.options[0].textContent = isZh ? '按周 (Weekly)' : 'Weekly';
    anaPeriodSel.options[1].textContent = isZh ? '按月 (Monthly)' : 'Monthly';
    anaPeriodSel.options[2].textContent = isZh ? '按年 (Yearly)' : 'Yearly';
    anaPeriodSel.options[3].textContent = isZh ? '全部历史 (All)' : 'All Time';
  }

  

  // Localize Recurring Frequency Select
  const recFreqSel = el('rec-freq-sel');
  if(recFreqSel && recFreqSel.options && recFreqSel.options.length >= 4){
    recFreqSel.options[0].textContent = isZh ? '每天' : 'Daily';
    recFreqSel.options[1].textContent = isZh ? '每周' : 'Weekly';
    recFreqSel.options[2].textContent = isZh ? '每月' : 'Monthly';
    recFreqSel.options[3].textContent = isZh ? '每年' : 'Yearly';
  }

  updateGeminiStatusUI();
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN STATE STORE (STATE & BACKWARD-COMPATIBLE S ALIAS)
   ═══════════════════════════════════════════════════════════════════ */
// Unified reactive data store holding persistent user data and active UI state.
const STATE = {
  transactions:[],budgets:[],goals:[],reminders:[],recurring:[],debts:[],
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

// ── S: GLOBAL BACKWARD-COMPATIBLE STATE ALIAS ──
let S = STATE;

// ── TEMP STATE ─────────────────────────────────────────
let txType='expense', selCat=null, selSubCat=null, selBudCat=null, selRemCat=null, selRecCat=null, selQpCat='food';
let showAllTxSubCats = false;
let selRecType='expense', selDebtDir='owe', selGoalIcon=GOAL_ICONS[0];
let txFilter='all', photoData=null, currentOcrItems=[], currentPresetTab='banks', anaBreakdownMode='category';
let editingTxId = null;

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
      if(enforceCurrentYearIfPast && parsedY < 2000){
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
        return `${name}${qty}${price}`.trim();
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
            qty: itemQty
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
  const clean = rawText.trim();
  try { return JSON.parse(clean); } catch(e){}
  const jsonBlock = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if(jsonBlock){
    try { return JSON.parse(jsonBlock[1].trim()); } catch(e){}
  }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if(firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace){
    try { return JSON.parse(clean.substring(firstBrace, lastBrace + 1)); } catch(e){}
  }
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

// The companion Node server provides /api/state only when the app is run on
// this computer. Netlify deploys this project as a static site, so calling the
// endpoint there would produce a 404 on every save. Keep the browser copy as
// the source of truth on hosted builds.
function canUseLocalStateApi(){
  if(typeof window === 'undefined' || !window.location) return false;
  const { protocol, hostname, port } = window.location;
  return (protocol === 'http:' || protocol === 'https:') &&
    port === '3000' &&
    (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]');
}

function save(){
  try {
    const serialized = JSON.stringify(S);
    localStorage.setItem('ff2', serialized);
  } catch(e){
    console.warn('LocalStorage quota exceeded or write error:', e);
    // If local storage is full due to photos, alert user gently
    if(e && e.name === 'QuotaExceededError'){
      toast('⚠️ 本地存储空间已满，请及时在设置中清理小票相册缓存或同步至云端！');
    }
  }

  // Host-side persistence is available only from the local companion server.
  if(canUseLocalStateApi()){
    fetch('/api/state', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(S)
    }).then(r => {
      if(!r.ok) console.warn('/api/state returned HTTP ' + r.status);
    }).catch(err => {
      console.warn('Host-side state sync failed (offline or static host):', err.message);
    });
  }
}

function load(){
  try{
    const r = localStorage.getItem('ff2');
    if(r){
      applyStateObject(JSON.parse(r));
    }
  }catch(e){
    console.error('Error reading localStorage:', e);
  }

  // A Netlify deployment is static and intentionally has no /api/state route.
  if(canUseLocalStateApi()){
    fetch('/api/state')
      .then(r => r.ok ? r.json() : null)
      .then(remoteState => {
        if(remoteState && remoteState.transactions && remoteState.transactions.length > 0){
          const localR = localStorage.getItem('ff2');
          const localCount = (localR ? (JSON.parse(localR).transactions || []).length : 0);
          // If remote has data and local was empty or older, apply remote data
          if(localCount === 0 || remoteState.transactions.length >= localCount){
            applyStateObject(remoteState);
            try { localStorage.setItem('ff2', JSON.stringify(S)); } catch(e){}
            if(typeof renderAll === 'function') renderAll();
          }
        }
      })
      .catch(()=>{});
  }

  applyAppBackground();
}

function applyStateObject(p){
  if(!p || typeof p !== 'object') return;
  let loadedAccounts = p.accounts || [];
  if(!loadedAccounts.length || (loadedAccounts.length === 1 && loadedAccounts[0].id === 'acc1')){
    loadedAccounts = JSON.parse(JSON.stringify(DEFAULT_MY_ACCOUNTS));
  }

  let loadedTx = p.transactions || [];
  if(Array.isArray(loadedTx)){
    loadedTx.forEach(t => {
      if(t.date) t.date = normalizeDateStr(t.date, true);
      if(t.note && typeof t.note === 'string' && t.note.includes('[object Object]')){
        t.note = t.note.replace(/\[object Object\],?\s*/g, '').trim();
      }
    });
  }
  const migratedInternalTransfers = migrateLegacyInternalTransfers(loadedTx);

  S = {
    ...S,
    ...p,
    transactions: loadedTx,
    budgets: p.budgets || [],
    goals: p.goals || [],
    reminders: p.reminders || [],
    recurring: p.recurring || [],
    debts: p.debts || [],
    accounts: loadedAccounts,
    quickPresets: (p.quickPresets && p.quickPresets.length) ? p.quickPresets : JSON.parse(JSON.stringify(DEFAULT_QUICK_PRESETS)),
    expCategories: mergeDefaultCategories(p.expCategories, DEFAULT_EXP_CATS),
    incCategories: (p.incCategories && p.incCategories.length) ? p.incCategories : JSON.parse(JSON.stringify(DEFAULT_INC_CATS)),
    quickLogTitle: p.quickLogTitle || '⚡ Quick Log',
    lang: p.lang || 'en',
    lastUsedAccId: p.lastUsedAccId || '',
    gsheetUrl: p.gsheetUrl || '',
    lastSync: p.lastSync || '',
    biometricLock: p.biometricLock || false,
    pendingMeals: p.pendingMeals || [],
    paydayDate: p.paydayDate || 25,
    paydayAmount: p.paydayAmount || 0,
    challenges: p.challenges || [],
    streaks: p.streaks || { noSpendBest: 0, noSpendCurrent: 0, lastCheckedDate: '' },
    roundUpJar: p.roundUpJar || 0,
    partnerData: p.partnerData || null,
    partnerName: p.partnerName || '',
    familyMode: p.familyMode || false,
    weeklyReportLastShown: p.weeklyReportLastShown || '',
    locationSuggestEnabled: p.locationSuggestEnabled !== false,
    wallpaperUrl: p.wallpaperUrl !== undefined ? p.wallpaperUrl : 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg',
    wallpaperOpacity: p.wallpaperOpacity !== undefined ? p.wallpaperOpacity : 35,
    geminiApiKey: p.geminiApiKey || ''
  };

  // Keep converted legacy transfers on this device without requiring a server.
  if(migratedInternalTransfers){
    try { localStorage.setItem('ff2', JSON.stringify(S)); } catch(e){}
  }
}

function toast(msg,ms=2400){
  const t=el('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.add('hidden'),ms);
}

// ── THEME (WINNIE THE POOH & HUNDRED ACRE WOOD) ────────
function applyTheme(){
  const theme = S.theme || 'light';
  document.getElementById('html-root').setAttribute('data-theme', theme);
  const btn = el('theme-btn');
  if(btn){
    if(theme === 'light') btn.textContent = '🍯';
    else if(theme === 'dark') btn.textContent = '🌙';
    else if(theme === 'sakura') btn.textContent = '🌸';
    else btn.textContent = '🍯';
  }
  const st = el('sval-theme');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(st){
    if(theme === 'light') st.textContent = isZh ? '🍯 维尼蜜糖暖金 (Winnie Honey)' : '🍯 Winnie\'s Honey Pot (Light)';
    else if(theme === 'dark') st.textContent = isZh ? '🌙 百亩森林星空夜 (Pooh Midnight)' : '🌙 Pooh\'s Midnight Woods (Dark)';
    else if(theme === 'sakura') st.textContent = isZh ? '🌸 小猪草莓粉樱 (Piglet Sakura)' : '🌸 Piglet\'s Sweet Sakura';
    else st.textContent = isZh ? '🍯 维尼蜜糖暖金 (Winnie Honey)' : '🍯 Winnie\'s Honey Pot (Light)';
  }
}

function toggleTheme(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(S.theme === 'light'){
    S.theme = 'dark';
    toast(isZh ? '🌙 已切换至【百亩森林星空夜】主题' : '🌙 Switched to Pooh\'s Midnight Woods');
  } else if(S.theme === 'dark'){
    S.theme = 'sakura';
    toast(isZh ? '🌸 已切换至【小猪草莓粉樱】主题' : '🌸 Switched to Piglet\'s Sweet Sakura');
  } else {
    S.theme = 'light';
    toast(isZh ? '🍯 已切换至【维尼蜜糖暖金】主题' : '🍯 Switched to Winnie\'s Honey Pot');
  }
  applyTheme();
  save();
}

// ── 🎨 CUTE ONLINE WALLPAPER & BACKGROUND STUDIO ──────
const CUTE_WALLPAPERS = [
  {
    id: 'wp_pooh_balloon',
    name: '🎈 维尼气球百亩森林',
    nameEn: '🎈 Pooh Forest & Balloon',
    url: 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg',
    thumb: 'https://i.pinimg.com/736x/d4/f4/44/d4f4446eec7e530e612f30f10db39d77.jpg'
  },
  {
    id: 'wp_pooh_floral',
    name: '🌸 维尼水彩花束',
    nameEn: '🌸 Pooh Floral Bouquets',
    url: 'https://thumbs.dreamstime.com/b/watercolor-winnie-pooh-floral-bouquets-405094895.jpg',
    thumb: 'https://thumbs.dreamstime.com/b/watercolor-winnie-pooh-floral-bouquets-405094895.jpg'
  },
  {
    id: 'wp_pooh_pattern',
    name: '🍯 维尼与好友萌趣印花',
    nameEn: '🍯 Pooh Friends Pattern',
    url: 'https://www.springscreative.com/cdn/shop/files/tiled_preview_square_20250828_145533_a1531b07-841f-4ae4-b0ea-5295a909f986.png?v=1774231993&width=2048',
    thumb: 'https://www.springscreative.com/cdn/shop/files/tiled_preview_square_20250828_145533_a1531b07-841f-4ae4-b0ea-5295a909f986.png?v=1774231993&width=2048'
  },
  {
    id: 'wp_pooh_vintage',
    name: '🧸 复古童话维尼绘本',
    nameEn: '🧸 Vintage Classic Pooh',
    url: 'https://i.etsystatic.com/60775807/r/il/e1db25/7143513889/il_fullxfull.7143513889_gt7m.jpg',
    thumb: 'https://i.etsystatic.com/60775807/r/il/e1db25/7143513889/il_fullxfull.7143513889_gt7m.jpg'
  },
  {
    id: 'wp_pooh_classic',
    name: '🌳 经典百亩森林插画',
    nameEn: '🌳 Classic Hundred Acre Wood',
    url: 'https://cdn.wallpapersafari.com/75/4/BV0XRo.jpg',
    thumb: 'https://cdn.wallpapersafari.com/75/4/BV0XRo.jpg'
  },
  {
    id: 'wp_none',
    name: '🚫 纯净极简',
    nameEn: '🚫 Minimal Clean',
    url: '',
    thumb: ''
  }
];

function applyAppBackground(){
  const bg = el('app-bg-layer');
  if(!bg) return;
  if(!S.wallpaperUrl){
    bg.style.backgroundImage = 'none';
    bg.style.opacity = '0';
  } else {
    bg.style.backgroundImage = `url("${S.wallpaperUrl}")`;
    const op = (S.wallpaperOpacity !== undefined ? S.wallpaperOpacity : 35) / 100;
    bg.style.opacity = String(op);
  }
}

function openWallpaperModal(){
  renderWallpaperPresets();
  const inp = el('custom-wallpaper-url');
  if(inp) inp.value = (S.wallpaperUrl && !CUTE_WALLPAPERS.some(w => w.url === S.wallpaperUrl)) ? S.wallpaperUrl : '';
  const slider = el('wallpaper-opacity-slider');
  if(slider) slider.value = S.wallpaperOpacity !== undefined ? S.wallpaperOpacity : 35;
  const valTxt = el('wallpaper-opacity-val');
  if(valTxt) valTxt.textContent = `${slider ? slider.value : 35}%`;
  openModal('wallpaper-modal');
}

function renderWallpaperPresets(){
  const grid = el('wallpaper-presets-grid');
  if(!grid) return;
  grid.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  CUTE_WALLPAPERS.forEach(wp => {
    const card = document.createElement('div');
    const isSelected = (wp.url === '' && !S.wallpaperUrl) || (wp.url && S.wallpaperUrl === wp.url);
    card.className = 'wp-preset-card' + (isSelected ? ' on' : '');
    
    if(wp.url){
      card.innerHTML = `
        <img src="${wp.thumb}" alt="${wp.nameEn}" loading="lazy"/>
        <div class="wp-preset-label">${isZh ? wp.name : wp.nameEn}</div>
      `;
    } else {
      card.innerHTML = `
        <div style="font-size:24px">🚫</div>
        <div class="wp-preset-label">${isZh ? wp.name : wp.nameEn}</div>
      `;
    }

    card.onclick = () => {
      selectWallpaper(wp.url);
    };

    grid.appendChild(card);
  });
}

function selectWallpaper(url){
  S.wallpaperUrl = url;
  save();
  applyAppBackground();
  renderWallpaperPresets();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '🎨 壁纸已更新！' : '🎨 Wallpaper updated!');
}

function parseImageUrl(rawUrl){
  if(!rawUrl) return '';
  let url = rawUrl.trim();
  // Decode Google Image search result links
  if(url.includes('imgurl=')){
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/i);
      if(match && match[1]){
        return decodeURIComponent(match[1]);
      }
    } catch(e){}
  }
  // Strip quotes if wrapped
  url = url.replace(/^['"]+|['"]+$/g, '');
  return url;
}

function applyCustomWallpaper(){
  const inp = el('custom-wallpaper-url');
  const raw = (inp ? inp.value : '').trim();
  if(!raw){
    selectWallpaper('');
    return;
  }
  const cleanUrl = parseImageUrl(raw);
  if(inp) inp.value = cleanUrl;
  selectWallpaper(cleanUrl);
}

function handleWallpaperFileUpload(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '⏳ 正在加载照片...' : '⏳ Loading photo...');
  
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      // Compress to max 1280px to save storage cleanly
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let w = img.width, h = img.height;
      if(w > maxDim || h > maxDim){
        if(w > h){ h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      selectWallpaper(dataUrl);
      toast(isZh ? '🖼️ 照片已成功设为本地壁纸！' : '🖼️ Photo set as local wallpaper!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateWallpaperOpacity(val){
  const num = parseInt(val) || 35;
  S.wallpaperOpacity = num;
  const valTxt = el('wallpaper-opacity-val');
  if(valTxt) valTxt.textContent = `${num}%`;
  applyAppBackground();
  save();
}

function toggleCustomWpDropdown(){
  const panel = el('wp-custom-panel');
  const arrow = el('wp-dropdown-arrow');
  if(!panel) return;
  const isHidden = panel.classList.contains('hidden');
  if(isHidden){
    panel.classList.remove('hidden');
    if(arrow) arrow.textContent = '▲';
  } else {
    panel.classList.add('hidden');
    if(arrow) arrow.textContent = '▼';
  }
}

/* ═══════════════════════════════════════════════════════════════════
   4. EVENT HANDLERS (USER ACTIONS, MODALS, GESTURES)
   ═══════════════════════════════════════════════════════════════════ */
// Page view routing (go), Modal Dialog Manager (openModal/closeModal), Speed dial FAB,
// Form submissions, File/Photo upload handlers, Super-Hub routers, and Swipe gestures.
function go(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('on'));
  const target = el('page-'+page);
  if(target) target.classList.add('active');
  const nb=document.querySelector('.nav-btn[data-p="'+page+'"]');
  if(nb) nb.classList.add('on');
  const homePeriodNav = el('home-period-nav');
  if(homePeriodNav){
    const onPeriod = page === 'period';
    homePeriodNav.classList.toggle('on', page === 'home' || onPeriod);
    const navIcon = el('home-period-nav-icon');
    const navLabel = el('home-period-nav-label');
    if(navIcon) navIcon.innerHTML = `<span class="nav-dual-icon"><span>${onPeriod ? '🌸' : '⌂'}</span><span>${onPeriod ? '⌂' : '🌸'}</span></span>`;
    if(navIcon) navIcon.textContent = onPeriod ? '🌸' : '⌂';
    if(navLabel) navLabel.textContent = onPeriod ? 'Period Care' : (S.lang === 'zh' ? '首页' : 'Home');
  }
  closeFab();
  applyLanguage();
  if(page==='home'){
    initFloatingAiAlerts(true);
  }
  if(page==='profile') renderProfile();
  if(page==='transactions'){
    if(txViewMode==='calendar') renderCalendar();
    else renderFullTx();
  }
  if(page==='period') renderPeriodTrackerUI();
  if(page==='analytics') renderAnalytics();
  if(page==='tax') renderTaxRelief();
  if(page==='budgets') renderBudgets();
  if(page==='goals') renderGoals();
  if(page==='reminders') renderReminders();
  if(page==='recurring') renderRecurring();
  if(page==='debts') renderDebts();
  if(page==='accounts'){ go('more'); return; }
}

// ── FAB ────────────────────────────────────────────────
let fabOpen=false;
function toggleFab(){ fabOpen=!fabOpen; el('overlay').classList.toggle('on',fabOpen); el('fab-menu').classList.toggle('on',fabOpen); }
function closeFab(){ fabOpen=false; el('overlay').classList.remove('on'); el('fab-menu').classList.remove('on'); }

// ── MODALS ─────────────────────────────────────────────
function openModal(id){ const m = el(id); if(m) m.classList.remove('hidden'); applyLanguage(); }
function closeModal(id){
  const m = el(id);
  if(m) m.classList.add('hidden');
  const locChip = el('loc-suggest-chip');
  if(locChip) locChip.style.display = 'none';
  if(id === 'tx-modal' && el('tx-from-upload-bar')){
    el('tx-from-upload-bar').classList.add('hidden');
  }
  if(id === 'splitter-modal' && el('splitter-back-to-upload')){
    el('splitter-back-to-upload').classList.add('hidden');
  }
}
function closeModalIf(e,id){ if(e.target===el(id)) closeModal(id); }

// ── PERIOD & MONTH ─────────────────────────────────────
function inPeriod(tx, period){
  if(!tx || !tx.date) return false;
  const dStr = normalizeDateStr(tx.date);
  const parts = dStr.split('-');
  if(parts.length < 3) return true;
  
  const txYear = parseInt(parts[0], 10);
  const txMonth = parseInt(parts[1], 10) - 1;
  const txDay = parseInt(parts[2], 10);
  const d = new Date(txYear, txMonth, txDay);
  const now = new Date();

  if(period === 'week'){
    const s = new Date(now);
    s.setDate(now.getDate() - now.getDay());
    s.setHours(0,0,0,0);
    return d >= s;
  }
  if(period === 'month') return txMonth === now.getMonth() && txYear === now.getFullYear();
  if(period === 'year')  return txYear === now.getFullYear();
  return true;
}

function inMonth(tx, m, y){
  if(!tx || !tx.date) return false;
  const dStr = normalizeDateStr(tx.date);
  const parts = dStr.split('-');
  if(parts.length < 3) return false;
  const txYear = parseInt(parts[0], 10);
  const txMonth = parseInt(parts[1], 10) - 1;
  return txMonth === m && txYear === y;
}

// ── ACCOUNTS & BALANCES ────────────────────────────────
// Transfers are movements between the user's own accounts. They affect the
// two account balances, but are never income or spending.
function isInternalTransfer(tx){
  return Boolean(tx && (tx.type === 'transfer' || tx.isInternalTransfer === true));
}

function isTransferIncoming(tx){
  return isInternalTransfer(tx) && tx.transferDirection === 'in';
}

function migrateLegacyInternalTransfers(txs){
  if(!Array.isArray(txs)) return false;
  const byId = new Map(txs.filter(t => t && t.id).map(t => [String(t.id), t]));
  let migrated = false;

  txs.forEach(outTx => {
    if(!outTx || outTx.type !== 'expense') return;
    const outId = String(outTx.id || '');
    if(!outId.startsWith('out')) return;

    const transferId = outId.slice(3);
    const inTx = byId.get('in' + transferId);
    const isLegacyPair = inTx &&
      inTx.type === 'income' &&
      outTx.paymentMethod === 'Transfer' &&
      inTx.paymentMethod === 'Transfer' &&
      Number(outTx.amount) === Number(inTx.amount) &&
      outTx.date === inTx.date;

    if(!isLegacyPair) return;

    Object.assign(outTx, { type: 'transfer', isInternalTransfer: true, transferDirection: 'out', transferId });
    Object.assign(inTx, { type: 'transfer', isInternalTransfer: true, transferDirection: 'in', transferId });
    migrated = true;
  });

  return migrated;
}

function accBal(id){ return 0; }

function checkAndPromptAccountOverdraft(accId, amt){
  // Accounts are strictly for record-keeping and tagging payment sources, not enforcing deductions or overdrafts
  return;
}

function totalBal(){
  const txs = S.transactions.filter(t => !isTransferIncoming(t) && t.type !== 'transfer');
  const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) || 0, 0);
  return inc - exp;
}
function filteredTx(){
  return S.transactions.filter(t => !isTransferIncoming(t) && t.type !== 'transfer');
}

function transactionPresentation(tx, isZh = false){
  return {
    category: catInfo('expense', tx.category || 'food'),
    color: CAT_COLOR[tx.category] || '#ef4444',
    amountPrefix: '-',
    amountColor: 'var(--red)',
    typeLabel: isZh ? '📉 支出' : '📉 Expense'
  };
}

function getAccIcon(acc){
  if(acc && acc.icon) return acc.icon;
  return ACC_ICON[acc ? acc.type : 'bank']||'💼';
}

function getDefaultAccountId(){
  return S.accounts.length > 0 ? S.accounts[0].id : '';
}

function getActiveAccountId(){
  if(S.selAcc !== 'all' && S.accounts.some(a=>a.id===S.selAcc)){
    return S.selAcc;
  }
  if(S.lastUsedAccId && S.accounts.some(a=>a.id===S.lastUsedAccId)){
    return S.lastUsedAccId;
  }
  return getDefaultAccountId();
}

// ── RECURRING ──────────────────────────────────────────
function nextDue(from,freq){
  const d=new Date(from+'T00:00:00');
  if(freq==='daily') d.setDate(d.getDate()+1);
  else if(freq==='weekly') d.setDate(d.getDate()+7);
  else if(freq==='monthly') d.setMonth(d.getMonth()+1);
  else if(freq==='yearly') d.setFullYear(d.getFullYear()+1);
  return d.toISOString().split('T')[0];
}
function applyRecurring(){
  // Ensure all recurring entries have a valid nextDue date
  const t = today();
  S.recurring.forEach(r => {
    if(!r.nextDue) r.nextDue = t;
  });
  save();
}

function confirmRecurring(recId){
  const r = S.recurring.find(x => x.id === recId);
  if(!r) return;

  const defaultAccId = getActiveAccountId();
  const txDate = r.nextDue || today();

  const newTx = {
    id: uid('rec') + '_' + Math.random().toString(36).substring(2,6),
    type: r.type,
    amount: Number(r.amount) || 0,
    desc: r.desc,
    category: r.category,
    date: txDate,
    paymentMethod: r.paymentMethod || (r.type === 'income' ? 'Direct Deposit' : 'Auto-Debit'),
    note: `Recurring (${r.freq})`,
    accountId: defaultAccId,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(newTx);
  // Advance nextDue date for the next cycle until it is in the future
  let d = new Date((r.nextDue || today()) + 'T00:00:00');
  const tStr = today();
  while(d.toISOString().split('T')[0] <= tStr) {
    if(r.freq==='daily') d.setDate(d.getDate()+1);
    else if(r.freq==='weekly') d.setDate(d.getDate()+7);
    else if(r.freq==='monthly') d.setMonth(d.getMonth()+1);
    else if(r.freq==='yearly') d.setFullYear(d.getFullYear()+1);
    else break;
  }
  r.nextDue = d.toISOString().split('T')[0];
  
  save();
  renderAll();
  toast(`✅ Recorded ${r.type === 'income' ? 'Income' : 'Expense'}: ${r.desc} (${fmt(r.amount)})!`);
}

// ── HEALTH SCORE ───────────────────────────────────────
function calcHealth(){
  const now=new Date(), m=now.getMonth(), y=now.getFullYear();
  const mtx=S.transactions.filter(t=>inMonth(t,m,y));
  const inc=mtx.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount)||0,0);
  const exp=mtx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount)||0,0);
  let score=50, tips=[];
  if(inc>0){
    const rate=(inc-exp)/inc;
    if(rate>=.3){score+=30;tips.push({icon:'💰',txt:'Great savings rate (30%+)',tag:'tip'});}
    else if(rate>=.1){score+=15;tips.push({icon:'📊',txt:'Aim for 20%+ savings rate',tag:'warn'});}
    else if(rate<0){score-=20;tips.push({icon:'🚨',txt:'Spending exceeds income!',tag:'alert'});}
    else{score+=5;tips.push({icon:'⚠️',txt:'Low savings rate this month',tag:'warn'});}
  }
  let over=0;
  S.budgets.forEach(b=>{
    const sp=mtx.filter(t=>t.type==='expense'&&t.category===b.category).reduce((s,t)=>s+Number(t.amount)||0,0);
    if(sp>Number(b.limit)) over++;
  });
  if(S.budgets.length>0){
    if(over===0){score+=20;tips.push({icon:'✅',txt:'All budgets on track!',tag:'tip'});}
    else{score-=over*5;tips.push({icon:'⚠️',txt:over+' budget(s) exceeded',tag:'alert'});}
  }
  const owed=S.debts.filter(d=>d.dir==='owe'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  if(owed>0&&inc>0&&owed/inc>0.5){score-=10;tips.push({icon:'💸',txt:'High debt-to-income ratio',tag:'alert'});}
  if(mtx.length>=10){score+=10;tips.push({icon:'🔥',txt:'Great tracking consistency!',tag:'tip'});}
  if(inc===0) tips.push({icon:'💡',txt:'Log your salary or income for full insights',tag:'tip'});
  if(S.recurring.length>0) tips.push({icon:'🔁',txt:S.recurring.length+' recurring entries active',tag:'tip'});
  if(!tips.length) tips.push({icon:'✨',txt:'No issues detected. Keep it up!',tag:'tip'});
  score=Math.max(0,Math.min(100,score));
  const grade=score>=90?'A+':score>=80?'A':score>=70?'B':score>=60?'C':score>=50?'D':'F';
  return{score,grade,tips};
}

// ── INSIGHTS ───────────────────────────────────────────
// ── AI SMART ALERTS & HABIT DETECTION ENGINE ───────────
function buildInsights(){
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const tStr = today();
  const thisMonthTx = S.transactions.filter(t => inMonth(t, m, y));
  const tExp = thisMonthTx.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const tInc = thisMonthTx.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  // Last 7 days transactions
  const last7DaysTx = S.transactions.filter(t => {
    const diff = (now - new Date(t.date + 'T00:00:00')) / (1000 * 86400);
    return diff >= 0 && diff <= 7;
  });
  
  // Today's transactions
  const todayTx = S.transactions.filter(t => t.date === tStr);
  const todayExp = todayTx.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);

  const ins = [];
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  // 0. 🔁 RECURRING DUE NOTIFICATION ALERTS (Confirm to Record)
  S.recurring.forEach(r => {
    if(r.nextDue && r.nextDue <= tStr){
      const isPast = r.nextDue < tStr;
      ins.push({
        icon: '🔁',
        title: isZh ? `周期性账单待确认: ${r.desc}` : `Recurring Due: ${r.desc}`,
        text: isZh 
          ? `${fmt(r.amount)} ${isPast ? '已于 ' + r.nextDue + ' 到期' : '今日到期'} (${r.freq === 'monthly' ? '每月' : r.freq})。点击完成以快速记账。`
          : `${fmt(r.amount)} is due ${isPast ? 'since ' + r.nextDue : 'today'} (${r.freq}). Click Complete to record.`,
        tag: 'alert',
        action: {
          label: isZh ? '完成记账 ✓' : 'Complete ✓',
          onClick: `confirmRecurring('${r.id}')`
        }
      });
    }
  });

  // 1. 🧋 MILK TEA & BOBA DETECTOR (User specific request)
  const bobaRegex = /(boba|bubble\s*tea|milk\s*tea|tealive|chagee|koi|gong\s*cha|xing\s*fu\s*tang|machi|heytea|tiger\s*sugar|cup\s*of\s*tea|cha\s*time|yomie)/i;
  const bobaList = last7DaysTx.filter(t => t.type === 'expense' && bobaRegex.test(t.desc || ''));
  const bobaSpent = bobaList.reduce((s,t) => s + (Number(t.amount)||0), 0);
  if(bobaList.length >= 2 || bobaSpent >= 25){
    ins.push({
      icon: '🧋',
      title: isZh ? '本周奶茶摄入偏多！' : 'Too Many Milk Teas This Week!',
      text: isZh 
        ? `本周已记录 ${bobaList.length} 杯奶茶甜饮（共消费 ${fmt(bobaSpent)}）。小金库提醒：奶茶好喝，也要注意控糖控开销哦 🍯`
        : `You've had ${bobaList.length} milk tea / boba orders this week (${fmt(bobaSpent)} spent). Pooh says: honey is sweet, but let's pace the sugar!`,
      tag: 'warn'
    });
  }

  // 2. 🍽️ EXPENSIVE FOOD TODAY (User specific request)
  const todayFoodTx = todayTx.filter(t => t.type === 'expense' && t.category === 'food');
  const todayFoodSpent = todayFoodTx.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const expensiveMeal = todayFoodTx.find(t => Number(t.amount) >= 35);
  
  if(todayFoodSpent >= 45){
    ins.push({
      icon: '🍽️',
      title: isZh ? '今日餐饮消费偏高' : 'High Dining Spend Today',
      text: isZh 
        ? `今天在餐饮上已花费 ${fmt(todayFoodSpent)}（共 ${todayFoodTx.length} 顿）。晚餐可以考虑吃清淡点或自己动手做饭 🍯`
        : `You've spent ${fmt(todayFoodSpent)} on food today across ${todayFoodTx.length} meals. Consider cooking at home or eating lighter for dinner!`,
      tag: 'warn'
    });
  } else if(expensiveMeal){
    ins.push({
      icon: '🥩',
      title: isZh ? '今日记录了一顿大餐' : 'Expensive Meal Logged Today',
      text: isZh 
        ? `记录了单笔 ${fmt(expensiveMeal.amount)} 的大餐（"${expensiveMeal.desc}"）。好好犒劳自己，明天适当平衡一下预算哦！`
        : `Logged a ${fmt(expensiveMeal.amount)} meal ("${expensiveMeal.desc}"). Treat yourself, but balance out tomorrow!`,
      tag: 'tip'
    });
  }

  // 3. ☕ COFFEE & CAFE HABIT PATROL
  const coffeeRegex = /(coffee|latte|cappuccino|americano|zus|starbucks|richiamo|gigi\s*coffee|kopi|espresso|flat\s*white|kenangan)/i;
  const coffeeList = last7DaysTx.filter(t => t.type === 'expense' && coffeeRegex.test(t.desc || ''));
  const coffeeSpent = coffeeList.reduce((s,t) => s + (Number(t.amount)||0), 0);
  if(coffeeList.length >= 3){
    ins.push({
      icon: '☕',
      title: isZh ? '咖啡打卡提醒' : 'Coffee Habit Patrol',
      text: isZh 
        ? `本周已记录 ${coffeeList.length} 杯咖啡（共 ${fmt(coffeeSpent)}）。自己手冲或自带咖啡每周可省约 ~${S.currency} ${(coffeeSpent*0.7).toFixed(0)}。`
        : `${coffeeList.length} coffees logged this week (${fmt(coffeeSpent)}). Brewing at home could save ~${S.currency} ${(coffeeSpent*0.7).toFixed(0)}/week.`,
      tag: 'warn'
    });
  }

  // 4. 🛍️ ONLINE SHOPPING SPREE (Shopee / Lazada / TikTok)
  const shopRegex = /(shopee|lazada|tiktok\s*shop|shein|zalora|taobao|amazon|parcel|unboxing)/i;
  const shopList = last7DaysTx.filter(t => t.type === 'expense' && (t.category === 'shopping' || shopRegex.test(t.desc || '')));
  const shopSpent = shopList.reduce((s,t) => s + (Number(t.amount)||0), 0);
  if(shopList.length >= 3 || shopSpent >= 120){
    ins.push({
      icon: '🛍️',
      title: isZh ? '网购包裹提醒' : 'Online Shopping Spree',
      text: isZh 
        ? `过去7天有 ${shopList.length} 笔网购/购物记录（共 ${fmt(shopSpent)}）。注意克制冲动网购哦 🍯`
        : `${shopList.length} shopping orders in the last 7 days (${fmt(shopSpent)}). Watch out for online impulse purchases!`,
      tag: 'warn'
    });
  }

  // 5. ⚡ DAILY SPENDING SPIKE (Velocity)
  const past30DaysTx = S.transactions.filter(t => {
    const diff = (now - new Date(t.date + 'T00:00:00')) / (1000 * 86400);
    return diff > 0 && diff <= 30 && t.type === 'expense';
  });
  const avgDaily = past30DaysTx.length > 0 ? (past30DaysTx.reduce((s,t)=>s+(Number(t.amount)||0),0) / 30) : 30;
  if(todayExp >= 1.8 * avgDaily && todayExp >= 50){
    ins.push({
      icon: '⚡',
      title: isZh ? '今日开销飙升预警' : 'Daily Spending Surge',
      text: isZh 
        ? `今日支出 (${fmt(todayExp)}) 已达过去30天日均 (${fmt(avgDaily)}) 的近两倍。今日请适当放缓开支！`
        : `Today's total (${fmt(todayExp)}) is double your 30-day daily average (${fmt(avgDaily)}). Slow down spending pace today!`,
      tag: 'alert'
    });
  }

  // 6. 🍔 FAST FOOD & MAMAK STREAK
  const fastFoodRegex = /(mcd|mcdonald|kfc|texas\s*chicken|marrybrown|burger\s*king|pizza\s*hut|domino|subway|mamak|roti\s*canai|nasi\s*kandar|kayu)/i;
  const fastFoodList = last7DaysTx.filter(t => t.type === 'expense' && fastFoodRegex.test(t.desc || ''));
  const fastFoodSpent = fastFoodList.reduce((s,t) => s + (Number(t.amount)||0), 0);
  if(fastFoodList.length >= 3){
    ins.push({
      icon: '🍔',
      title: isZh ? '快餐与嘛嘛档打卡频繁' : 'Fast Food & Mamak Streak',
      text: isZh 
        ? `本周已光顾快餐或嘛嘛档 ${fastFoodList.length} 次（共 ${fmt(fastFoodSpent)}）。均衡饮食既保健康又省钱 🍯`
        : `Visited fast food/mamak ${fastFoodList.length} times this week (${fmt(fastFoodSpent)}). Healthier home meals save health & honey!`,
      tag: 'warn'
    });
  }


  // 8. 🚨 BUDGET THRESHOLDS
  S.budgets.forEach(b => {
    const sp = thisMonthTx.filter(t => t.type === 'expense' && t.category === b.category).reduce((s,t) => s + (Number(t.amount)||0), 0);
    const pct = sp / Number(b.limit);
    const c = catInfo('expense', b.category);
    if(pct >= 1.0){
      ins.push({
        icon: '🚨',
        title: isZh ? `${c.name} 预算已超支！` : `${c.name} Over Budget!`,
        text: isZh 
          ? `已超出限额 ${fmt(sp - Number(b.limit))}（已支出 ${fmt(sp)} / 预算 ${fmt(b.limit)}）。建议暂停非必要 ${c.name} 开支！`
          : `Exceeded by ${fmt(sp - Number(b.limit))} (Spent ${fmt(sp)} of ${fmt(b.limit)}). Freeze non-essential ${c.name} spending!`,
        tag: 'alert'
      });
    } else if(pct >= 0.8){
      ins.push({
        icon: '⚠️',
        title: isZh ? `${c.name} 预算接近上限 (${(pct*100).toFixed(0)}%)` : `${c.name} Near Limit (${(pct*100).toFixed(0)}%)`,
        text: isZh 
          ? `本月剩余可用预算仅剩 ${fmt(Number(b.limit) - sp)}。`
          : `Only ${fmt(Number(b.limit) - sp)} left for the rest of the month.`,
        tag: 'warn'
      });
    }
  });

  // 9. ⛽ HIGH TRAVEL & PETROL ALERT
  const travelList = last7DaysTx.filter(t => t.type === 'expense' && (t.category === 'fuel' || t.category === 'toll_parking'));
  const travelSpent = travelList.reduce((s,t) => s + (Number(t.amount)||0), 0);
  if(travelSpent >= 80){
    ins.push({
      icon: '⛽',
      title: isZh ? '出行油费开销偏高' : 'High Fuel & Transport Spend',
      text: isZh 
        ? `本周在加油、过路费与交通上共支出 ${fmt(travelSpent)}（共 ${travelList.length} 笔）。`
        : `${fmt(travelSpent)} spent on fuel, tolls & rides this week across ${travelList.length} trips.`,
      tag: 'tip'
    });
  }

  // 10. 🌙 LATE NIGHT TRANSACTIONS
  const lateTx = S.transactions.find(t => {
    if(t.type !== 'expense' || !t.time) return false;
    const hour = parseInt(t.time.split(':')[0], 10);
    const diff = (now - new Date(t.date + 'T00:00:00')) / (1000 * 86400);
    return diff <= 2 && (hour >= 23 || hour <= 4);
  });
  if(lateTx){
    ins.push({
      icon: '🌙',
      title: isZh ? '记录了深夜消费' : 'Midnight Expense Logged',
      text: isZh 
        ? `"${lateTx.desc}" (${fmt(lateTx.amount)}) 记录于 ${lateTx.time}。注意深夜宵夜开销哦！`
        : `"${lateTx.desc}" (${fmt(lateTx.amount)}) was logged at ${lateTx.time}. Watch out for late night cravings!`,
      tag: 'tip'
    });
  }

  // 11. 🍯 HONEY POT PRAISE & SAVINGS MOTIVATION
  if(todayTx.length === 0 || todayExp === 0){
    ins.push({
      icon: '🍯',
      title: 'No-Spend Day Streak!',
      text: 'Zero expenses recorded so far today! Your honey pot is safe, full, and thriving.',
      tag: 'tip'
    });
  } else if(tInc > 0){
    const rate = (tInc - tExp) / tInc;
    if(rate >= 0.25){
      ins.push({
        icon: '🌟',
        title: 'Super Saver Status!',
        text: `You are saving ${(rate*100).toFixed(0)}% of your monthly honey (${fmt(tInc - tExp)} net savings). Wonderful job!`,
        tag: 'tip'
      });
    }
  }

  if(tInc === 0 && thisMonthTx.length > 3){
    ins.push({
      icon: '💼',
      title: 'Add Monthly Income',
      text: 'Log your salary or income deposit to unlock savings rate analysis and health scores.',
      tag: 'tip'
    });
  }

  return ins;
}

// ── CATEGORY PICKER & MANAGER LOGIC ───────────────────
let curCatMgrType = 'expense';
let curCatEditIcon = '🍜';

function autoFillCategoryDesc(containerId, type, catId){
  let inp = null;
  if(containerId === 'tx-cats') inp = el('tx-desc');
  else if(containerId === 'rec-cats') inp = el('rec-desc-inp');
  else if(containerId === 'rem-cats') inp = el('rem-name-inp');
  else if(containerId === 'qp-cats') inp = el('qp-name-inp');

  if(!inp) return;

  const info = catInfo(type, catId);
  if(!info || !info.name) return;

  const curVal = (inp.value || '').trim();
  if(!curVal){
    inp.value = info.name;
    return;
  }

  // If current value matches ANY known category name or id, auto-update it to the new selected category
  const allCats = [...getCategories('expense'), ...getCategories('income')];
  const matchesKnownCategory = allCats.some(c => {
    const cInfExp = catInfo('expense', c.id);
    const cInfInc = catInfo('income', c.id);
    const curLower = curVal.toLowerCase();
    return curLower === (c.name || '').toLowerCase() ||
           curLower === (cInfExp?.name || '').toLowerCase() ||
           curLower === (cInfInc?.name || '').toLowerCase() ||
           curLower === (c.id || '').toLowerCase() ||
           (c.nameZh && curLower === c.nameZh.toLowerCase()) ||
           (c.nameEn && curLower === c.nameEn.toLowerCase());
  });

  if(matchesKnownCategory){
    inp.value = info.name;
  }
}

function getSubCategoryRegistry(type){
  return type === 'income' ? MASTER_INC_SUB_CATEGORIES : MASTER_SUB_CATEGORIES;
}

function getSelectableSubCategories(type){
  const registry = getSubCategoryRegistry(type);
  return Object.entries(registry).map(([id, item]) => ({ id, ...item }));
}

function autoFillTxSubCategoryDesc(subId){
  const inp = el('tx-desc');
  const sub = getSubCatInfo(subId);
  if(!inp || !sub) return;
  const parent = catInfo(txType, sub.parent);
  const current = (inp.value || '').trim().toLowerCase();
  const parentName = (parent?.name || '').toLowerCase();
  if(!current || current === parentName || current === sub.parent.toLowerCase()){
    inp.value = sub.name;
  }
}

function renderTxSubCategoryPicker(){
  const picker = el('tx-subcat-picker');
  if(!picker) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const count = getSelectableSubCategories(txType).length;
  const currentSub = selSubCat ? getSubCatInfo(selSubCat) : null;
  const selectedLabel = currentSub
    ? `${currentSub.icon} ${esc(currentSub.name)}`
    : (isZh ? '未选择' : 'None selected');
  const scopeLabel = showAllTxSubCats
    ? (isZh ? '只看当前分类' : 'Current category')
    : (isZh ? `浏览全部 ${count} 项` : `Browse all ${count}`);

  picker.innerHTML = `
    <div class="subcat-picker">
      <div class="subcat-picker-head">
        <div>
          <div class="subcat-picker-title">${isZh ? '细分类（可选）' : 'Specific category (optional)'}</div>
          <div class="subcat-picker-hint">${isZh ? `已选：${selectedLabel}。搜索可查看所有 ${count} 个选项。` : `Selected: ${selectedLabel}. Search across all ${count} options.`}</div>
        </div>
        <button type="button" class="subcat-show-all" id="tx-subcat-scope">${scopeLabel}</button>
      </div>
      <input type="search" id="tx-subcat-search" class="subcat-search" autocomplete="off" placeholder="${isZh ? '搜索：咖啡、诊所、路税、奖金…' : 'Search: coffee, clinic, road tax, bonus…'}" aria-label="${isZh ? '搜索细分类' : 'Search specific categories'}" />
      <div class="subcat-list" id="tx-subcat-list"></div>
    </div>
  `;

  const search = el('tx-subcat-search');
  if(search) search.addEventListener('input', () => filterTxSubCategories(search.value));
  const scope = el('tx-subcat-scope');
  if(scope) scope.addEventListener('click', () => {
    showAllTxSubCats = !showAllTxSubCats;
    renderTxSubCategoryPicker();
  });
  filterTxSubCategories('');
}

function filterTxSubCategories(query = ''){
  const list = el('tx-subcat-list');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const needle = String(query || '').trim().toLocaleLowerCase();
  const options = getSelectableSubCategories(txType);
  const matching = options
    .filter(item => {
      const parent = catInfo(txType, item.parent) || {};
      if(needle){
        return [item.id, item.name, item.nameZh, item.parent, parent.name, parent.nameZh]
          .filter(Boolean)
          .some(value => String(value).toLocaleLowerCase().includes(needle));
      }
      return showAllTxSubCats || item.parent === selCat;
    })
    .sort((a, b) => {
      const aCurrent = a.parent === selCat ? 0 : 1;
      const bCurrent = b.parent === selCat ? 0 : 1;
      return aCurrent - bCurrent || a.name.localeCompare(b.name);
    });

  list.innerHTML = '';
  if(!matching.length){
    list.innerHTML = `<div class="subcat-empty">${isZh ? '没有相符分类。试试英文或中文关键字。' : 'No matching category. Try a different keyword.'}</div>`;
    return;
  }

  matching.forEach(item => {
    const info = getSubCatInfo(item.id);
    const parent = catInfo(txType, item.parent) || { name: item.parent };
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subcat-chip' + (selSubCat === item.id ? ' on' : '');
    button.innerHTML = `<span>${info.icon} ${esc(info.name)}</span>${(needle || showAllTxSubCats) ? `<span class="subcat-parent">${esc(parent.name)}</span>` : ''}`;
    button.title = `${parent.name} › ${info.name}`;
    button.addEventListener('click', () => selectTxSubCategory(item.id));
    list.appendChild(button);
  });
}

function selectTxSubCategory(subId){
  const item = getSubCategoryRegistry(txType)[subId];
  if(!item) return;

  if(selSubCat === subId){
    selSubCat = null;
  } else {
    selSubCat = subId;
    selCat = item.parent;
  }
  buildCats('tx-cats', txType, id => selCat = id);
  if(selSubCat) autoFillTxSubCategoryDesc(selSubCat);
}

function buildCats(containerId, type, onSel){
  const allCats = getCategories(type);
  const wrap = el(containerId); if(!wrap) return;
  wrap.innerHTML = '';

  if(wrap.tagName === 'SELECT'){
    allCats.forEach(c => {
      const info = catInfo(type, c.id);
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${info.icon} ${info.name}`;
      wrap.appendChild(opt);
    });
    if(containerId === 'bud-cats' || containerId === 'bud-cat'){
      if(selBudCat) wrap.value = selBudCat;
      else if(allCats[0]) { selBudCat = allCats[0].id; wrap.value = selBudCat; }
    }
    wrap.onchange = () => {
      if(containerId === 'bud-cats' || containerId === 'bud-cat') selBudCat = wrap.value;
      if(typeof onSel === 'function') onSel(wrap.value);
    };
    if(typeof onSel === 'function' && wrap.value) onSel(wrap.value);
    return;
  }

  let currentSelected = null;
  if(containerId === 'tx-cats') currentSelected = selCat;
  else if(containerId === 'bud-cats') currentSelected = selBudCat;
  else if(containerId === 'rem-cats') currentSelected = selRemCat;
  else if(containerId === 'rec-cats') currentSelected = selRecCat;
  else if(containerId === 'qp-cats') currentSelected = selQpCat;

  if(!currentSelected && allCats.length > 0){
    currentSelected = allCats[0].id;
    if(containerId === 'tx-cats') selCat = currentSelected;
    onSel(currentSelected);
    autoFillCategoryDesc(containerId, type, currentSelected);
  } else if(currentSelected){
    autoFillCategoryDesc(containerId, type, currentSelected);
  }

  if(containerId === 'tx-cats' && selSubCat){
    const sub = getSubCatInfo(selSubCat);
    if(!sub || sub.parent !== currentSelected) selSubCat = null;
  }

  allCats.forEach((c) => {
    const info = catInfo(type, c.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = c.id === currentSelected;
    btn.className = 'cat-chip' + (isSelected ? ' on' : '');
    btn.dataset.id = c.id;
    btn.innerHTML = `<span class="cat-chip-icon">${info.icon}</span><span class="cat-chip-name">${esc(info.name)}</span>`;
    btn.onclick = () => {
      wrap.querySelectorAll('.cat-chip').forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      if(containerId === 'tx-cats'){
        selCat = c.id;
        selSubCat = null;
      }
      else if(containerId === 'bud-cats') selBudCat = c.id;
      else if(containerId === 'rem-cats') selRemCat = c.id;
      else if(containerId === 'rec-cats') selRecCat = c.id;
      else if(containerId === 'qp-cats') selQpCat = c.id;
      autoFillCategoryDesc(containerId, type, c.id);
      onSel(c.id);
    };
    wrap.appendChild(btn);
  });

  // Trailing "+ Manage" button chip
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'cat-chip cat-chip-add';
  addBtn.innerHTML = `<span class="cat-chip-icon">⚙️</span><span class="cat-chip-name">${S.lang === 'zh' ? '管理分类' : 'Edit Categories'}</span>`;
  addBtn.onclick = () => openCategoryManager(type);
  wrap.appendChild(addBtn);

  // Scroll active element into center view
  const activeBtn = wrap.querySelector('.cat-chip.on');
  if(activeBtn){
    setTimeout(() => {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 60);
  }

  if(containerId === 'tx-cats') renderTxSubCategoryPicker();
}

let catMgrCallerModal = null;

function openCategoryManager(type = 'expense'){
  if(el('tx-modal') && !el('tx-modal').classList.contains('hidden')){
    catMgrCallerModal = 'tx-modal';
  } else if(el('universal-upload-modal') && !el('universal-upload-modal').classList.contains('hidden')){
    catMgrCallerModal = 'universal-upload-modal';
  } else {
    catMgrCallerModal = null;
  }
  curCatMgrType = type === 'income' ? 'income' : 'expense';
  switchCatMgrTab(curCatMgrType);
  cancelCatEditForm();
  openModal('cat-manage-modal');
}

function handleCatMgrBack(){
  closeModal('cat-manage-modal');
  if(catMgrCallerModal === 'tx-modal'){
    if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
    openModal('tx-modal');
  } else if(catMgrCallerModal === 'universal-upload-modal'){
    openModal('universal-upload-modal');
    renderUniversalPreview();
  }
}

function switchCatMgrTab(type){
  curCatMgrType = type;
  if(el('cm-tab-exp')) el('cm-tab-exp').classList.toggle('on', type === 'expense');
  if(el('cm-tab-inc')) el('cm-tab-inc').classList.toggle('on', type === 'income');
  cancelCatEditForm();
  renderCatMgrList();
}

function renderCatMgrList(){
  const list = el('cat-mgr-list');
  if(!list) return;
  list.innerHTML = '';
  
  const cats = getCategories(curCatMgrType);
  if(!cats.length){
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No categories found. Click Add below!</div>';
    return;
  }

  cats.forEach(c => {
    const item = document.createElement('div');
    item.className = 'cat-mgr-item';
    item.innerHTML = `
      <div class="cat-mgr-item-left">
        <div class="cat-mgr-item-icon">${c.icon}</div>
        <div class="cat-mgr-item-name">${esc(c.name)}</div>
      </div>
      <div class="cat-mgr-item-actions">
        <button type="button" class="cat-mgr-btn" onclick="openAddCategoryForm('${c.id}')">✏️ Edit</button>
        <button type="button" class="cat-mgr-btn del" onclick="deleteCategory('${c.id}')">✕</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function openAddCategoryForm(editId = null){
  const form = el('cat-edit-form-wrap');
  const addBtn = el('cm-add-btn');
  if(!form) return;
  
  form.classList.remove('hidden');
  if(addBtn) addBtn.classList.add('hidden');

  const titleEl = el('cat-form-title');
  const nameInp = el('cm-name-inp');
  const editIdInp = el('cm-edit-id');
  
  if(editId){
    const cats = getCategories(curCatMgrType);
    const existing = cats.find(c => c.id === editId);
    if(existing){
      if(titleEl) titleEl.textContent = `Edit Category: ${existing.name}`;
      if(nameInp) nameInp.value = existing.name;
      if(editIdInp) editIdInp.value = existing.id;
      curCatEditIcon = existing.icon || '🍜';
    }
  } else {
    if(titleEl) titleEl.textContent = `Add New ${curCatMgrType === 'income' ? 'Income' : 'Expense'} Category`;
    if(nameInp) nameInp.value = '';
    if(editIdInp) editIdInp.value = '';
    curCatEditIcon = curCatMgrType === 'income' ? '💼' : '🍜';
  }

  renderCatIconPicker();
  if(nameInp) setTimeout(() => nameInp.focus(), 80);
}

function cancelCatEditForm(){
  const form = el('cat-edit-form-wrap');
  const addBtn = el('cm-add-btn');
  if(form) form.classList.add('hidden');
  if(addBtn) addBtn.classList.remove('hidden');
}

function renderCatIconPicker(){
  const picker = el('cm-icon-picker');
  if(!picker) return;
  picker.innerHTML = '';
  AVAILABLE_CAT_ICONS.forEach(icon => {
    const opt = document.createElement('div');
    opt.className = 'icon-opt' + (icon === curCatEditIcon ? ' on' : '');
    opt.textContent = icon;
    opt.onclick = () => {
      picker.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('on'));
      opt.classList.add('on');
      curCatEditIcon = icon;
    };
    picker.appendChild(opt);
  });
}

function saveCategoryFromMgr(){
  const nameInp = el('cm-name-inp');
  const editIdInp = el('cm-edit-id');
  const name = nameInp ? nameInp.value.trim() : '';
  const editId = editIdInp ? editIdInp.value.trim() : '';

  if(!name){
    toast('⚠️ Please enter a category name');
    return;
  }

  const key = curCatMgrType === 'income' ? 'incCategories' : 'expCategories';
  if(!S[key]) S[key] = JSON.parse(JSON.stringify(curCatMgrType === 'income' ? DEFAULT_INC_CATS : DEFAULT_EXP_CATS));

  if(editId){
    // Update existing category
    const cat = S[key].find(c => c.id === editId);
    if(cat){
      cat.name = name;
      cat.icon = curCatEditIcon;
      toast(`✅ Updated category: ${name}`);
    }
  } else {
    // Add new category
    const newId = 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2,5);
    S[key].push({
      id: newId,
      name: name,
      icon: curCatEditIcon
    });
    toast(`✅ Added category: ${name}`);
  }

  save();
  cancelCatEditForm();
  renderCatMgrList();
  refreshAllCategoryPickers();
}

function deleteCategory(id){
  const key = curCatMgrType === 'income' ? 'incCategories' : 'expCategories';
  if(!S[key]) S[key] = JSON.parse(JSON.stringify(curCatMgrType === 'income' ? DEFAULT_INC_CATS : DEFAULT_EXP_CATS));

  if(S[key].length <= 1){
    toast('⚠️ Cannot delete the only category');
    return;
  }

  const cat = S[key].find(c => c.id === id);
  const catName = cat ? cat.name : 'category';

  if(confirm(`Delete category "${catName}"? Existing transactions will keep their history.`)){
    S[key] = S[key].filter(c => c.id !== id);
    save();
    renderCatMgrList();
    refreshAllCategoryPickers();
    toast(`Category "${catName}" deleted`);
  }
}

function resetCategoriesToDefault(){
  if(confirm('Reset all categories back to default Malaysian finance categories?')){
    S.expCategories = JSON.parse(JSON.stringify(DEFAULT_EXP_CATS));
    S.incCategories = JSON.parse(JSON.stringify(DEFAULT_INC_CATS));
    save();
    renderCatMgrList();
    refreshAllCategoryPickers();
    toast('🔄 Categories reset to defaults!');
  }
}

function refreshAllCategoryPickers(){
  if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
  if(el('bud-cats')) buildCats('bud-cats', 'expense', id => selBudCat = id);
  if(el('rem-cats')) buildCats('rem-cats', 'expense', id => selRemCat = id);
  if(el('rec-cats')) buildCats('rec-cats', selRecType, id => selRecCat = id);
  if(el('qp-cats')) buildCats('qp-cats', 'expense', id => selQpCat = id);
  renderRecentTx();
  renderBudgets();
  renderReminders();
  renderRecurring();
}

// ── RENDER: BALANCE & MONTHLY NAVIGATION ───────────────
let homeActiveYear = new Date().getFullYear();
let homeActiveMonth = new Date().getMonth(); // 0 = Jan, 8 = Sep

function getHomeActiveMonthKey(){
  return `${homeActiveYear}-${String(homeActiveMonth + 1).padStart(2, '0')}`;
}

function stepHomeMonth(delta){
  homeActiveMonth += delta;
  if(homeActiveMonth < 0){
    homeActiveMonth = 11;
    homeActiveYear--;
  } else if(homeActiveMonth > 11){
    homeActiveMonth = 0;
    homeActiveYear++;
  }
  renderBalance();
  renderRecentTx();
}

function jumpHomeCurrentMonth(){
  const now = new Date();
  homeActiveYear = now.getFullYear();
  homeActiveMonth = now.getMonth();
  renderBalance();
  renderRecentTx();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? `📅 已返回当前月份 (${homeActiveYear}年${MONTH_NAMES_ZH[homeActiveMonth]})` : `📅 Jumped to current month (${MONTH_NAMES[homeActiveMonth]} ${homeActiveYear})`);
}

function renderBalance(){
  const txs = filteredTx();
  const now = new Date();
  const isCurMonth = (homeActiveYear === now.getFullYear() && homeActiveMonth === now.getMonth());
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  // 1. Month Header Label
  const monthName = isZh ? MONTH_NAMES_ZH[homeActiveMonth] : MONTH_NAMES[homeActiveMonth];
  const monthLabel = el('home-month-label');
  if(monthLabel){
    monthLabel.textContent = isZh
      ? `${homeActiveYear}年 ${monthName}支出 🍯`
      : `${monthName} ${homeActiveYear} Spending 🍯`;
  }

  // 2. Today / Current Month jump button
  const todayBtn = el('home-today-month-btn');
  if(todayBtn){
    todayBtn.style.display = isCurMonth ? 'none' : 'inline-block';
  }

  // 3. Active Month's Expenses -> Displayed in #bal-display
  // Starts at RM 0.00 for a new month with no expenses!
  const monthTxs = txs.filter(t => t.type === 'expense' && inMonth(t, homeActiveMonth, homeActiveYear));
  const mExp = monthTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const balEl = el('bal-display');
  if(balEl) balEl.textContent = fmt(mExp);

  // 4. Year Total Spending -> Displayed in #tot-exp
  const yearStr = String(homeActiveYear);
  const yearTxs = txs.filter(t => t.type === 'expense' && (t.date || '').startsWith(yearStr));
  const yExp = yearTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expEl = el('tot-exp');
  if(expEl) expEl.textContent = fmt(yExp);

  const yearLbl = el('home-year-total-label');
  if(yearLbl){
    yearLbl.textContent = isZh ? `${homeActiveYear}年 全年总支出` : `${homeActiveYear} Year Total`;
  }

  // 5. Period Care Expenses (in active month)
  const pExp = monthTxs.filter(t => isPeriodCareExpense(t)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const periodEl = el('tot-period-exp');
  if(periodEl) periodEl.textContent = fmt(pExp);

  const incEl = el('tot-inc');
  if(incEl) incEl.textContent = fmt(0);
}
// ── ACCOUNTS (REMOVED) ──
function openAccountActionSheet(){}
function accSheetAction(){}
function toggleAccLayoutMode(){}
function openAllAccountsModal(){}
function renderAccRow(){}

// ── RENDER & MANAGE: QUICK PRESETS (HOME) ─────────────
const PRESET_ICONS = ['🍜','☕','⛽','🚗','🛒','🅿️','🍔','🎬','💊','🥪','🧋','🏸','🎮','📚','🧺','👕','✈️','⚡','🎁','🍿','🍕','🍣','🥤','🐱','🐾'];

function editQuickLogSectionTitle(){
  const cur = S.quickLogTitle || '⚡ Quick Log';
  const next = prompt('Rename Section Title:', cur);
  if(next !== null && next.trim()){
    S.quickLogTitle = next.trim();
    save();
    renderQuickPresets();
    toast('✅ Title updated: ' + S.quickLogTitle);
  }
}

function openQuickPresetModal(idx){
  el('qp-edit-idx').value = idx;
  const isNew = idx === -1 || idx === undefined;
  el('qp-modal-title').textContent = isNew ? 'Add Quick Shortcut' : 'Edit Shortcut';
  el('qp-del-btn').style.display = isNew ? 'none' : 'block';

  let p = isNew ? {icon:'🍜', name:'', amount:'', category:'food'} : S.quickPresets[idx];
  if(!p) p = {icon:'🍜', name:'', amount:'', category:'food'};

  el('qp-name-inp').value = p.name || '';
  el('qp-amount-inp').value = p.amount ? p.amount : '';
  el('qp-icon-val').value = p.icon || '🍜';
  el('qp-cat-val').value = p.category || 'food';

  // Render Icon Picker
  const picker = el('qp-icon-picker');
  picker.innerHTML = '';
  PRESET_ICONS.forEach(ico => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-opt' + (ico === (p.icon||'🍜') ? ' on' : '');
    btn.textContent = ico;
    btn.onclick = () => {
      picker.querySelectorAll('.icon-opt').forEach(x=>x.classList.remove('on'));
      btn.classList.add('on');
      el('qp-icon-val').value = ico;
    };
    picker.appendChild(btn);
  });

  // Render Category Picker
  buildCats('qp-cats', 'expense', id => {
    el('qp-cat-val').value = id;
  });
  
  setTimeout(()=>{
    const wrap = el('qp-cats');
    if(wrap){
      wrap.querySelectorAll('.cat-chip').forEach(c=>{
        c.classList.toggle('on', c.dataset.id === (p.category||'food'));
      });
    }
  }, 50);

  openModal('quick-preset-modal');
  setTimeout(()=>el('qp-name-inp').focus(), 150);
}

function saveQuickPreset(){
  const idx = parseInt(el('qp-edit-idx').value);
  const name = el('qp-name-inp').value.trim();
  const amount = parseFloat(el('qp-amount-inp').value);
  const icon = el('qp-icon-val').value || '🍜';
  const category = el('qp-cat-val').value || 'food';

  if(!name){ toast('⚠️ Please enter a shortcut name'); return; }
  if(!amount || amount <= 0){ toast('⚠️ Please enter a valid amount'); return; }

  const presetObj = { icon, name, amount, category };

  if(idx >= 0 && idx < S.quickPresets.length){
    S.quickPresets[idx] = presetObj;
  } else {
    S.quickPresets.push(presetObj);
  }

  save();
  renderQuickPresets();
  closeModal('quick-preset-modal');
  toast(`✅ Shortcut "${name}" saved!`);
}

function deleteQuickPreset(){
  const idx = parseInt(el('qp-edit-idx').value);
  if(idx >= 0 && idx < S.quickPresets.length){
    const name = S.quickPresets[idx].name;
    S.quickPresets.splice(idx, 1);
    save();
    renderQuickPresets();
    closeModal('quick-preset-modal');
    toast(`🗑️ Shortcut "${name}" removed`);
  }
}

function renderQuickPresets(){
  const titleEl = el('quick-log-title');
  if(titleEl) titleEl.textContent = S.quickLogTitle || '⚡ Quick Log';

  const row=el('quick-preset-row'); if(!row) return;
  row.innerHTML='';

  if(!S.quickPresets.length){
    row.innerHTML = `<div style="font-size:12px;color:var(--dim);padding:10px 4px">No shortcuts. Tap <strong>＋ Add</strong> to create one!</div>`;
    return;
  }

  S.quickPresets.forEach((p, idx)=>{
    const card=document.createElement('div');
    card.className='quick-preset-card';
    card.innerHTML=`<div class="qp-ico">${p.icon}</div><div class="qp-name">${esc(p.name)}</div><div class="qp-amt">RM ${Number(p.amount).toFixed(0)}</div>`;
    
    // Single click: quick log; Double click / 2 times: edit preset
    let qpClicks = 0;
    let qpTimer = null;
    card.onclick = () => {
      qpClicks++;
      if(qpClicks === 1){
        qpTimer = setTimeout(() => {
          qpClicks = 0;
          quickLogExpense(idx);
        }, 280);
      } else if(qpClicks >= 2){
        clearTimeout(qpTimer);
        qpClicks = 0;
        if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
        openQuickPresetModal(idx);
      }
    };
    card.ondblclick = (e) => {
      e.preventDefault();
      if(qpTimer) clearTimeout(qpTimer);
      qpClicks = 0;
      if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
      openQuickPresetModal(idx);
    };
    
    row.appendChild(card);
  });
}

function quickLogExpense(index){
  const p = S.quickPresets[index];
  if(!p) return;
  const accId = getActiveAccountId();
  if(!accId){
    toast('⚠️ Please create a bank or wallet first');
    return;
  }
  const acc = S.accounts.find(a=>a.id===accId);
  const accName = acc ? acc.name : 'Wallet';

  const tx = {
    id: uid('item'),
    type: 'expense',
    amount: Number(p.amount),
    desc: p.name,
    category: p.category || 'food',
    date: today(),
    accountId: accId,
    paymentMethod: 'Cash',
    note: '1-Tap Quick Log',
    photo: null,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(tx);
  S.lastUsedAccId = accId;
  save();
  renderAll();
  toast(`⚡ Logged RM ${Number(p.amount).toFixed(2)} for ${p.name} (${accName})`);

  checkAndPromptAccountOverdraft(tx.accountId, tx.amount);

  const aiAlert = getTxInstantAiAlert(tx);
  if(aiAlert){
    setTimeout(() => toast(aiAlert, 4200), 1200);
  }
}

// ── RENDER: HEALTH ─────────────────────────────────────
function renderHealth(){
  const hNum = el('h-score-num');
  if(!hNum) return;
  const {score,grade,tips}=calcHealth();
  const circ=2*Math.PI*23, dash=(score/100)*circ;
  const ring=el('h-ring-fill');
  if(ring){
    ring.setAttribute('stroke-dasharray',dash+' '+(circ-dash));
    ring.setAttribute('stroke',score>=70?'#10b981':score>=50?'#f59e0b':'#ef4444');
  }
  hNum.textContent=score;
  if(el('h-grade')) el('h-grade').textContent=grade;
  const tip=tips.find(t=>t.tag==='tip')||tips[0];
  if(el('h-tip')) el('h-tip').textContent=tip?tip.txt:'';
}

// ── RENDER: AI INSIGHTS & HABIT ALERTS ─────────────────
function renderInsights(){
  const list = el('insights-list'); if(!list) return;
  list.innerHTML = '';
  const alerts = buildInsights();
  
  const badge = el('ai-alert-count-badge');
  if(badge){
    const warnCount = alerts.filter(a => a.tag === 'alert' || a.tag === 'warn').length;
    if(warnCount > 0){
      badge.textContent = `${warnCount} Alert${warnCount > 1 ? 's' : ''}`;
      badge.style.background = 'rgba(229,57,53,0.18)';
      badge.style.color = 'var(--red)';
    } else {
      badge.textContent = 'All Healthy ✨';
      badge.style.background = 'rgba(102,187,106,0.18)';
      badge.style.color = '#2e7d32';
    }
  }

  if(!alerts.length){
    list.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 4px">No alerts right now. Your honey pot is well-balanced! 🍯</div>';
    return;
  }

  alerts.slice(0, 6).forEach(ins => {
    const d = document.createElement('div');
    d.className = 'insight ins-' + (ins.tag || 'tip');
    d.innerHTML = `
      <div class="ins-icon">${ins.icon}</div>
      <div class="ins-body">
        <h4><span>${esc(ins.title)}</span> <span class="ins-tag tag-${ins.tag}">${ins.tag.toUpperCase()}</span></h4>
        <p>${esc(ins.text)}</p>
      </div>
    `;
    list.appendChild(d);
  });
}

function getTxInstantAiAlert(tx){
  if(!tx || tx.type !== 'expense') return null;
  const descLower = (tx.desc||'').toLowerCase();
  
  // Boba / Milk tea alert
  if(/(boba|bubble\s*tea|milk\s*tea|tealive|chagee|koi|gong\s*cha|xing\s*fu\s*tang|machi|heytea|tiger\s*sugar)/i.test(descLower)){
    const bobaTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && /(boba|bubble\s*tea|milk\s*tea|tealive|chagee|koi|gong\s*cha|xing\s*fu\s*tang|machi|heytea|tiger\s*sugar)/i.test(t.desc));
    if(bobaTxs.length >= 2){
      return `🧋 AI Alert: ${bobaTxs.length} milk teas this week! Watch the sugar & honey pot 🍯`;
    }
  }

  // Coffee alert
  if(/(coffee|latte|cappuccino|zus|starbucks|richiamo|gigi\s*coffee|kopi|espresso)/i.test(descLower)){
    const coffeeTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && /(coffee|latte|cappuccino|zus|starbucks|richiamo|gigi\s*coffee|kopi|espresso)/i.test(t.desc));
    if(coffeeTxs.length >= 3){
      return `☕ AI Alert: ${coffeeTxs.length} coffees logged this week! Brew at home to save 🍯`;
    }
  }

  // Expensive Food alert
  if(tx.category === 'food'){
    const todayFood = S.transactions.filter(t => t.type==='expense' && t.date === today() && t.category==='food').reduce((s,t)=>s+(Number(t.amount)||0),0);
    if(todayFood >= 45){
      return `🍽️ AI Alert: RM ${todayFood.toFixed(0)} spent on food today! Try a lighter dinner 🍯`;
    }
    if(tx.amount >= 35){
      return `🥩 AI Note: Big meal (${fmt(tx.amount)})! Balance it out tomorrow 🍯`;
    }
  }

  // Online shopping
  if(tx.category === 'shopping' || /(shopee|lazada|tiktok\s*shop|shein|zalora|taobao)/i.test(descLower)){
    const shopTxs = S.transactions.filter(t => t.type==='expense' && (new Date() - new Date(t.date+'T00:00:00'))/(1000*86400) <= 7 && (t.category==='shopping' || /(shopee|lazada|tiktok\s*shop|shein|zalora|taobao)/i.test(t.desc)));
    if(shopTxs.length >= 3){
      return `🛍️ AI Alert: ${shopTxs.length} online shopping orders this week! 🍯`;
    }
  }

  return null;
}

// ── FLOATING AI WARNING BANNER QUEUE (WITH TOUCH SWIPE) ─────────────────
let activeAiAlerts = [];
let currentAiAlertIdx = 0;
let dismissedAlertTitles = new Set();
let aiBannerSwipeBound = false;

function initFloatingAiAlerts(resetDismissed = false){
  if(resetDismissed){
    dismissedAlertTitles.clear();
  }
  const allAlerts = buildInsights().filter(a => a.tag === 'alert' || a.tag === 'warn' || a.tag === 'tip');
  
  // Filter out any dismissed alerts for current session
  activeAiAlerts = allAlerts.filter(a => !dismissedAlertTitles.has(a.title));
  renderFloatingAiAlert();
}

function dismissAiAlert(title){
  dismissedAlertTitles.add(title);
  activeAiAlerts = activeAiAlerts.filter(a => a.title !== title);
  if(!activeAiAlerts.length){
    const container = el('ai-floating-alert-container');
    if(container) container.classList.add('hidden');
    toast(S.lang === 'zh' ? '所有提醒已全部忽略 🍯' : 'All active alerts dismissed for now! 🍯');
  } else {
    toast(S.lang === 'zh' ? '已忽略此条提醒' : 'Alert dismissed.');
    renderFloatingAiAlert();
  }
}

function renderFloatingAiAlert(){
  const container = el('ai-floating-alert-container');
  if(!container) return;
  
  if(!activeAiAlerts.length){
    container.classList.add('hidden');
    return;
  }
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  container.classList.remove('hidden');
  container.innerHTML = '';
  
  activeAiAlerts.forEach((alert, idx) => {
    const levelText = alert.tag === 'alert' 
      ? (isZh ? '🚨 风险预警' : '🚨 ALERT') 
      : alert.tag === 'warn' 
        ? (isZh ? '⚠️ 关注提醒' : '⚠️ WARNING') 
        : (isZh ? '💡 记账贴士' : '💡 TIP');
    
    const div = document.createElement('div');
    div.className = `ai-floating-alert alert-level-${alert.tag || 'warn'}`;
    
    let actionHtml = '';
    if (alert.action) {
      actionHtml = `<div class="ai-float-action"><button type="button" class="ai-float-btn" onclick="${alert.action.onClick.replace(/"/g, '&quot;')}"><span>${alert.action.label}</span></button></div>`;
    }
    
    const countBadge = isZh ? `第 ${idx + 1} / ${activeAiAlerts.length} 条` : `${idx + 1} of ${activeAiAlerts.length}`;
    const swipeHint = activeAiAlerts.length > 1 ? `<div class="ai-swipe-hint">${isZh ? '↔ 滑动查看' : '↔ Swipe'}</div>` : '';
    const dismissTitle = isZh ? '忽略此条 (✕)' : 'Dismiss Alert (✕)';

    div.innerHTML = `
      <div class="ai-float-badge-row">
        <div class="ai-float-badge">${levelText} · ${countBadge}</div>
        <div class="ai-float-controls">
          ${swipeHint}
          <button type="button" class="ai-float-close-btn" onclick="dismissAiAlert('${alert.title.replace(/'/g, "\\'")}')" title="${dismissTitle}">✕</button>
        </div>
      </div>
      <div class="ai-float-content">
        <div class="ai-float-icon">${alert.icon || '🤖'}</div>
        <div class="ai-float-info">
          <div class="ai-float-title">${alert.title || (isZh ? 'AI 开销提醒' : 'AI Spending Alert')}</div>
          <div class="ai-float-desc">${alert.text || ''}</div>
          ${actionHtml}
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// ── RENDER: DUE SOON ───────────────────────────────────
function renderDueSoon(){
  const now=new Date(), t=today();
  const soon=S.reminders.filter(r=>{
    if(r.paid) return false;
    const diff=(new Date(r.date+'T00:00:00')-now)/86400000;
    return diff<=7;
  }).sort((a,b)=>a.date.localeCompare(b.date));

  // Pending meals due within 7 days
  const mealsDue = (S.pendingMeals||[]).filter(m=>{
    if(m.paid) return false;
    const diff=(new Date(m.dueDate+'T00:00:00')-new Date(t+'T00:00:00'))/86400000;
    return diff<=7;
  }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));

  const sec=el('due-section'), list=el('due-list');
  if(!sec||!list) return;
  list.innerHTML='';
  if(!soon.length && !mealsDue.length){sec.classList.add('hidden');return;}
  sec.classList.remove('hidden');

  // Reminders
  soon.forEach(r=>{
    const d=new Date(r.date+'T00:00:00');
    const diff=Math.round((d-new Date(t+'T00:00:00'))/86400000);
    const lbl=diff===0?'Due today':diff<0?Math.abs(diff)+'d overdue':'Due in '+diff+'d';
    const c=catInfo('expense',r.category||'bills');
    const div=document.createElement('div'); div.className='due-item';
    div.innerHTML='<div class="due-icon">'+c.icon+'</div><div class="due-info"><div class="due-name">'+esc(r.name)+'</div><div class="due-date">'+lbl+'</div></div><div><div class="due-amt">'+fmt(r.amount)+'</div></div>';
    const payBtn=document.createElement('button');
    payBtn.className='pay-btn';
    payBtn.textContent='Pay ✓';
    payBtn.onclick=()=>payReminder(r.id);
    div.appendChild(payBtn);
    list.appendChild(div);
  });

  // Pending meals
  mealsDue.forEach(m=>{
    const diff=Math.round((new Date(m.dueDate+'T00:00:00')-new Date(t+'T00:00:00'))/86400000);
    const lbl=diff===0?'Due today':diff<0?Math.abs(diff)+'d overdue':'Due in '+diff+'d';
    const div=document.createElement('div'); div.className='due-item';
    div.innerHTML=`<div class="due-icon">🍽️</div><div class="due-info"><div class="due-name">${esc(m.desc||'Pending Meal')}</div><div class="due-date">🕐 ${lbl}${m.payTo?' · 👤 '+esc(m.payTo):''}</div></div><div><div class="due-amt">${fmt(m.amount)}</div></div>`;
    const payBtn=document.createElement('button');
    payBtn.className='pay-btn';
    payBtn.textContent='Pay ✓';
    payBtn.onclick=()=>markMealPaid(m.id);
    div.appendChild(payBtn);
    list.appendChild(div);
  });
}

// ── RENDER: RECENT TX (WITH SWIPE TO DELETE) ───────────
function renderRecentTx(){
  const list=el('recent-list'), empty=el('empty-home');
  if(!list) return;
  list.innerHTML='';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const monthName = isZh ? MONTH_NAMES_ZH[homeActiveMonth] : MONTH_NAMES[homeActiveMonth];
  const allTx = filteredTx();
  const monthTxs = allTx.filter(t => inMonth(t, homeActiveMonth, homeActiveYear));
  const sorted = [...monthTxs].sort((a,b)=>b.date.localeCompare(a.date));

  if(!sorted.length){
    if(empty){
      empty.classList.remove('hidden');
      const p = empty.querySelector('p');
      const small = empty.querySelector('small');
      if(p) p.textContent = isZh ? `${homeActiveYear}年${monthName} 暂无支出记录 (RM 0.00)` : `No transactions in ${monthName} ${homeActiveYear} yet (RM 0.00)`;
      if(small) small.textContent = isZh ? `轻点 ◀ 查看过往月份记录，或按 ➕ 记一笔新账！` : `Tap ◀ to view previous months or ➕ to log your first expense!`;
    }
    return;
  }
  if(empty) empty.classList.add('hidden');
  sorted.slice(0, 15).forEach(tx=>list.appendChild(makeTxEl(tx)));
}

let currentDetailTxId = null;

function openTxDetailModal(txId){
  const tx = S.transactions.find(t => t.id === txId);
  if(!tx) return;
  currentDetailTxId = txId;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const presentation = transactionPresentation(tx, isZh);
  const cat = presentation.category;
  const isTransfer = isInternalTransfer(tx);
  const acc = S.accounts.find(a => a.id === tx.accountId);
  const accIco = acc ? getAccIcon(acc) : '💳';
  const payM = tx.paymentMethod || (isZh ? '现金' : 'Cash');
  const dStr = normalizeDateStr(tx.date);
  const dObj = new Date(dStr + 'T00:00:00');
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  const dFull = dObj.toLocaleDateString(localeStr, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  if(el('tx-det-title')) el('tx-det-title').textContent = isZh ? '账单明细' : 'Transaction Details';
  if(el('tx-det-icon')) el('tx-det-icon').textContent = cat.icon;
  if(el('tx-det-desc')) el('tx-det-desc').textContent = tx.desc || cat.name;
  if(el('tx-det-amt')){
    el('tx-det-amt').textContent = `${presentation.amountPrefix}${fmt(tx.amount)}`;
    el('tx-det-amt').style.color = presentation.amountColor;
  }

  const badgeContainer = el('tx-det-badges');
  if(badgeContainer){
    badgeContainer.innerHTML = '';
    const typeBadge = document.createElement('span');
    typeBadge.className = 'chip';
    typeBadge.style.cssText = `font-size:11px;font-weight:800;background:${isTransfer ? 'rgba(6,182,212,.18)' : (tx.type === 'income' ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.18)')};color:${presentation.amountColor}`;
    typeBadge.textContent = presentation.typeLabel;
    badgeContainer.appendChild(typeBadge);

    const catBadge = document.createElement('span');
    catBadge.className = 'chip';
    catBadge.style.cssText = 'font-size:11px;font-weight:800;background:rgba(255,179,0,.15);color:var(--text)';
    catBadge.textContent = `${cat.icon} ${cat.name}`;
    badgeContainer.appendChild(catBadge);

    const sub = getSubCatInfo(tx.subCategory);
    if(sub){
      const subBadge = document.createElement('span');
      subBadge.className = 'chip';
      subBadge.style.cssText = 'font-size:11px;font-weight:800;background:rgba(6,182,212,.13);color:var(--text)';
      subBadge.textContent = `${sub.icon} ${sub.name}`;
      badgeContainer.appendChild(subBadge);
    }

    const isAdvBadge = Boolean(tx.isAdvance || tx.advance);
    if(isAdvBadge){
      const isReimb = (tx.advanceStatus === 'reimbursed' || tx.advanceReimbursed);
      const advBadge = document.createElement('span');
      advBadge.className = 'chip';
      advBadge.style.cssText = `font-size:11px;font-weight:800;background:${isReimb ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.15)'};color:${isReimb ? 'var(--green)' : 'var(--red)'}`;
      advBadge.textContent = isReimb ? (isZh ? '✅ 已报销' : '✅ Reimbursed') : (isZh ? '⏳ 待报销垫付' : '⏳ Advance');
      badgeContainer.appendChild(advBadge);
    }
  }

  if(el('tx-det-datetime')){
    el('tx-det-datetime').textContent = tx.time ? `${dFull} · ${tx.time}` : dFull;
  }
  if(el('tx-det-account')){
    el('tx-det-account').textContent = acc ? `${accIco} ${acc.name}` : (isZh ? '未指定账户' : 'Unassigned Account');
  }
  if(el('tx-det-method')){
    el('tx-det-method').textContent = payM;
  }

  const locRow = el('tx-det-loc-row');
  const locVal = el('tx-det-location');
  if(locRow && locVal){
    if(tx.location){
      locRow.classList.remove('hidden');
      locVal.textContent = tx.location;
    } else {
      locRow.classList.add('hidden');
    }
  }

  const taxRow = el('tx-det-tax-row');
  const taxVal = el('tx-det-tax');
  if(taxRow){
    if(tx.taxReliefCat || (tx.category && ['health', 'education', 'sports', 'lifestyle', 'insurance'].includes(tx.category))){
      taxRow.classList.remove('hidden');
      if(taxVal) taxVal.textContent = tx.taxReliefCat ? `Eligible (${tx.taxReliefCat.toUpperCase()})` : (isZh ? '可报税减免' : 'Eligible');
    } else if(tx.sstAmount > 0 || tx.serviceChargeAmount > 0 || tx.taxesCollectedSummary){
      taxRow.classList.remove('hidden');
      if(taxVal) taxVal.textContent = tx.taxesCollectedSummary || (tx.sstAmount ? `SST (${tx.sstPct||6}%): RM ${tx.sstAmount.toFixed(2)}` : (isZh ? '已含消费税' : 'Tax Included'));
    } else {
      taxRow.classList.add('hidden');
    }
  }

  const itemsBox = el('tx-det-items-box');
  const itemsContent = el('tx-det-items-content');
  if(itemsBox && itemsContent){
    const items = extractTxReceiptItems(tx);
    const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';

    if(items.length > 0 || cleanNote){
      itemsBox.classList.remove('hidden');
      let htmlContent = '';
      if(items.length > 0 && (items.length > 1 || items[0].name !== tx.desc)){
        htmlContent += `<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:8px">`;
        items.forEach(it => {
          htmlContent += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px">
              <span>${it.qty > 1 ? `${it.qty}x ` : ''}${esc(it.name)}</span>
              <strong style="color:var(--text)">${fmt(it.price)}</strong>
            </div>
          `;
        });
        htmlContent += `</div>`;
      }
      if(cleanNote && cleanNote !== tx.desc){
        htmlContent += `<div style="font-size:11.5px;color:var(--muted);background:rgba(255,255,255,.03);padding:8px;border-radius:8px">📝 ${esc(cleanNote)}</div>`;
      }
      itemsContent.innerHTML = htmlContent || `<div style="color:var(--muted)">${isZh ? '无单品备注' : 'No extra notes'}</div>`;
    } else {
      itemsBox.classList.add('hidden');
    }
  }

  // 🇲🇾 Receipt Inflation & Price vs Market Benchmark Detail
  const infBox = el('tx-det-inflation-box');
  const infSummary = el('tx-det-inflation-summary-badge');
  const infItemsList = el('tx-det-inflation-items-list');

  if(infBox && infItemsList){
    const txItems = extractTxReceiptItems(tx);
    if(tx.type === 'expense' && txItems && txItems.length > 0){
      infBox.classList.remove('hidden');
      let totalPaid = 0;
      let totalMarket = 0;
      infItemsList.innerHTML = '';

      txItems.forEach(it => {
        const unitPrice = it.price / (it.qty || 1);
        const match = findMarketBenchmarkMatch(it.name, tx.category, unitPrice);
        if(match){
          const marketAvg = match.marketAvg;
          const diff = unitPrice - marketAvg;
          const pct = marketAvg > 0 ? Math.round((diff / marketAvg) * 100) : 0;
          totalPaid += it.price;
          totalMarket += marketAvg * (it.qty || 1);

          const isHike = pct > 15;
          const isFair = pct >= -10 && pct <= 15;
          const badgeBg = isHike ? 'rgba(239,68,68,.18)' : (isFair ? 'rgba(59,130,246,.15)' : 'rgba(16,185,129,.18)');
          const badgeColor = isHike ? 'var(--red)' : (isFair ? '#3b82f6' : 'var(--green)');
          const badgeIcon = isHike ? '🚨' : (isFair ? '⚖️' : '✨');
          const statusText = isHike ? (isZh ? `贵过市面 +${pct}%` : `+${pct}% Over Avg`) : (isFair ? (isZh ? `市面均价` : `Fair Market`) : (isZh ? `实惠好价 ${pct}%` : `Good Deal ${pct}%`));

          const row = document.createElement('div');
          row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px';
          row.innerHTML = `
            <div style="min-width:0;flex:1">
              <div style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${match.icon || '🧾'} ${esc(it.name)} ${it.qty > 1 ? `x${it.qty}` : ''}
              </div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px">
                ${isZh ? '实付' : 'Paid'}: <strong>${fmt(unitPrice)}</strong> ➔ ${isZh ? '大马市价' : 'Market Avg'}: <span style="color:var(--cyan)">${fmt(marketAvg)}</span>
              </div>
            </div>
            <div style="text-align:right;white-space:nowrap">
              <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;background:${badgeBg};color:${badgeColor}">
                ${statusText} ${badgeIcon}
              </span>
            </div>
          `;
          infItemsList.appendChild(row);
        }
      });

      if(infSummary && totalMarket > 0){
        const overallDiff = totalPaid - totalMarket;
        const overallPct = Math.round((overallDiff / totalMarket) * 100);
        const isOverallHike = overallPct > 10;
        const isOverallFair = overallPct >= -10 && overallPct <= 10;

        infSummary.style.background = isOverallHike ? 'rgba(239,68,68,.18)' : (isOverallFair ? 'rgba(59,130,246,.15)' : 'rgba(16,185,129,.18)');
        infSummary.style.color = isOverallHike ? 'var(--red)' : (isOverallFair ? '#3b82f6' : 'var(--green)');
        infSummary.textContent = isOverallHike 
          ? (isZh ? `整体高出市价 +${overallPct}% 🚨` : `+${overallPct}% Above Market Avg 🚨`)
          : (isOverallFair 
            ? (isZh ? `整体符合市价 ⚖️` : `Fair Market Value ⚖️`)
            : (isZh ? `省下 ${Math.abs(overallPct)}% 实惠 ✨` : `Good Deal ✨ (${overallPct}%)`));
      }
    } else {
      infBox.classList.add('hidden');
    }
  }

  // Photo
  const photoBox = el('tx-det-photo-box');
  const photoImg = el('tx-det-photo-img');
  const noPhotoBox = el('tx-det-no-photo-box');
  if(photoBox && photoImg){
    if(tx.photo){
      photoBox.classList.remove('hidden');
      photoImg.src = tx.photo;
      if(noPhotoBox) noPhotoBox.classList.add('hidden');
    } else {
      photoBox.classList.add('hidden');
      photoImg.src = '';
      if(noPhotoBox) noPhotoBox.classList.remove('hidden');
    }
  }

  // Advance Box & Conversion Button
  const isAdv = Boolean(tx.isAdvance || tx.advance);
  const isReimbursed = (tx.advanceStatus === 'reimbursed' || tx.advanceReimbursed);
  const debtorName = tx.advancePerson || tx.advanceDebtor || (isZh ? '公司报销' : 'Company');

  const advBox = el('tx-det-advance-box');
  const makeAdvBtn = el('tx-det-make-adv-btn');
  if(advBox){
    if(isAdv){
      advBox.classList.remove('hidden');
      if(makeAdvBtn) makeAdvBtn.classList.add('hidden');
      const badgeEl = el('tx-det-adv-status-badge') || el('tx-det-advance-status-badge');
      if(badgeEl){
        badgeEl.textContent = isReimbursed ? (isZh ? '✅ 已报销结清' : '✅ Reimbursed') : (isZh ? '⏳ 待报销' : '⏳ Pending');
        badgeEl.style.background = isReimbursed ? 'rgba(16,185,129,.18)' : 'rgba(255,179,0,.2)';
        badgeEl.style.color = isReimbursed ? 'var(--green)' : 'var(--amber)';
      }
      const personEl = el('tx-det-adv-person') || el('tx-det-advance-debtor-txt');
      if(personEl){
        personEl.textContent = (isZh ? '报销/还款对象: ' : 'Debtor: ') + debtorName;
      }
      const rBtn = el('tx-det-reimburse-btn');
      if(rBtn){
        rBtn.style.display = isReimbursed ? 'none' : 'block';
        rBtn.textContent = isZh ? '✓ 标记已到账 (Mark Reimbursed)' : '✓ Mark as Reimbursed';
      }
    } else {
      advBox.classList.add('hidden');
      if(makeAdvBtn) makeAdvBtn.classList.remove('hidden');
    }
  }

  const editBtn = el('tx-det-edit-btn');
  const repeatBtn = el('tx-det-repeat-btn');
  const splitBtn = el('tx-det-split-btn');
  if(editBtn) editBtn.style.display = isTransfer ? 'none' : '';
  if(repeatBtn) repeatBtn.style.display = isTransfer ? 'none' : '';
  if(splitBtn) splitBtn.style.display = isTransfer ? 'none' : '';

  openModal('tx-detail-modal');
}

function reimburseAdvanceTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  // Mark advance transaction as reimbursed
  tx.advanceStatus = 'reimbursed';
  tx.advanceReimbursed = true;

  // Automatically create corresponding Income transaction
  const incTx = {
    id: uid('item'),
    type: 'income',
    amount: Number(tx.amount) || 0,
    desc: (isZh ? '💰 报销/垫付还款到账: ' : '💰 Reimbursement received: ') + (tx.desc || ''),
    category: 'other',
    date: today(),
    time: currentTimeStr(),
    accountId: tx.accountId || getActiveAccountId(),
    paymentMethod: 'Direct Deposit',
    location: tx.location || null,
    note: (isZh ? '关联原垫付账单: ' : 'Reimbursement for advance expense: ') + (tx.desc || ''),
    photo: null,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(incTx);
  save();
  renderAll();
  renderCalendar();
  openTxDetailModal(tx.id);
  toast(isZh ? `🎉 已收到报销款 ${fmt(tx.amount)}，收入账单已自动入账！` : `🎉 Reimbursed ${fmt(tx.amount)}! Income record created.`);
}

function toggleDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const defaultPerson = isZh ? '公司报销' : 'Company Claim';
  const person = prompt(isZh ? '请输入还款/报销来源 (例如：公司、朋友名字)：' : 'Enter reimbursement source / debtor (e.g. Company, Friend name):', defaultPerson);
  if(person === null) return;

  const chosenPerson = person.trim() || defaultPerson;
  tx.isAdvance = true;
  tx.advance = true;
  tx.advancePerson = chosenPerson;
  tx.advanceDebtor = chosenPerson;
  tx.advanceStatus = 'pending';
  tx.advanceReimbursed = false;

  save();
  renderAll();
  renderCalendar();
  openTxDetailModal(tx.id);
  toast(isZh ? `📌 已设为待报销垫付 (${chosenPerson})` : `📌 Marked as pending advance (${chosenPerson})`);
}

function editDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const curPerson = tx.advancePerson || tx.advanceDebtor || (isZh ? '公司报销' : 'Company Claim');
  const newPerson = prompt(isZh ? '修改还款/报销来源 (例如：公司、同事名字)：' : 'Edit reimbursement source / debtor:', curPerson);
  if(newPerson === null) return;

  tx.advancePerson = newPerson.trim() || curPerson;
  tx.advanceDebtor = tx.advancePerson;
  save();
  renderAll();
  openTxDetailModal(tx.id);
  toast(isZh ? `✅ 垫付信息已更新: ${tx.advancePerson}` : `✅ Advance details updated: ${tx.advancePerson}`);
}

function unmarkDetailTxAdvance(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!confirm(isZh ? '确定取消此账单的垫付标记，恢复为普通个人消费？' : 'Remove advance/reimbursement tag from this bill?')) return;

  tx.isAdvance = false;
  tx.advance = false;
  tx.advancePerson = null;
  tx.advanceDebtor = null;
  tx.advanceStatus = null;
  tx.advanceReimbursed = false;

  save();
  renderAll();
  openTxDetailModal(tx.id);
  toast(isZh ? '👌 已取消垫付标记，恢复为普通账单' : '👌 Reverted to normal expense');
}

function handleDetailPhotoUpload(input){
  const file = input?.files?.[0];
  if(!file) return;
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const reader = new FileReader();
  reader.onload = (e) => {
    tx.photo = e.target.result;
    save();
    renderAll();
    openTxDetailModal(tx.id);
    toast(isZh ? '📸 小票图片已成功上传并关联此账单！' : '📸 Receipt photo attached to transaction!');
    input.value = '';
  };
  reader.readAsDataURL(file);
}

function removeDetailTxPhoto(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!confirm(isZh ? '确定删除此发票收据照片？' : 'Delete attached receipt photo?')) return;

  tx.photo = null;
  save();
  renderAll();
  openTxDetailModal(tx.id);
  toast(isZh ? '🗑️ 已移除发票小票照片' : '🗑️ Receipt photo removed');
}

function splitDetailTx(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(isInternalTransfer(tx)){
    toast(isZh ? '内部转账无法分摊。' : 'Internal transfers cannot be split.');
    return;
  }

  const amt = Number(tx.amount) || 0;
  if(amt <= 0){
    toast(isZh ? '账单金额无效' : 'Invalid transaction amount');
    return;
  }

  const txItems = extractTxReceiptItems(tx);

  activeSplitContext = {
    source: 'tx_detail',
    originalTxId: tx.id,
    merchant: tx.desc || 'Bill',
    amount: amt,
    category: tx.category || 'food',
    subCategory: tx.subCategory || null,
    date: tx.date || today(),
    paymentMethod: tx.paymentMethod || 'Cash',
    accountId: tx.accountId || '',
    note: tx.note || '',
    photo: tx.photo || null,
    items: txItems || []
  };

  closeModal('tx-detail-modal');
  openSplitterModal(amt);

  if(tx.desc && el('split-place-inp')) el('split-place-inp').value = tx.desc;
  if(el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);

  if(txItems && txItems.length > 0){
    switchSplitMode('itemized');
    splitFriends = txItems.map((it, idx) => ({
      name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
      amount: Math.abs(parseFloat(it.price)) || 0
    }));
    renderSplitFriendsList();
  }

  calcBillSplit();
  updateSplitterContextBanner();

  toast(isZh ? `🍕 已载入账单: ${tx.desc} (RM ${amt.toFixed(2)}) 到分摊器！` : `🍕 Loaded ${tx.desc} (RM ${amt.toFixed(2)}) into Splitter!`);
}

function splitCurrentTxModal(){
  const amt = Math.abs(parseFloat(el('tx-amount')?.value)) || 0;
  const desc = (el('tx-desc')?.value || '').trim();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(amt <= 0){
    toast(isZh ? '⚠️ 请先输入账单金额' : '⚠️ Enter an amount first');
    el('tx-amount')?.focus();
    return;
  }

  activeSplitContext = {
    source: editingTxId ? 'edit_tx' : 'new_tx',
    originalTxId: editingTxId || null,
    merchant: desc || 'Bill',
    amount: amt,
    category: selCat || 'food',
    subCategory: selSubCat || null,
    date: el('tx-date')?.value || today(),
    paymentMethod: el('tx-paymethod-val')?.value || 'Cash',
    accountId: el('tx-acc-select')?.value || '',
    note: el('tx-note')?.value || '',
    photo: photoData || null,
    items: (currentOcrItems && currentOcrItems.length > 0) ? JSON.parse(JSON.stringify(currentOcrItems)) : []
  };

  closeModal('tx-modal');
  openSplitterModal(amt);

  if(desc && el('split-place-inp')) el('split-place-inp').value = desc;
  if(el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);

  if(activeSplitContext.items.length > 0){
    switchSplitMode('itemized');
    splitFriends = activeSplitContext.items.map((it, idx) => ({
      name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
      amount: Math.abs(parseFloat(it.price)) || 0
    }));
    renderSplitFriendsList();
  }

  calcBillSplit();
  updateSplitterContextBanner();

  toast(isZh ? `🍕 已将此账单带入分摊器: ${desc || '账单'} (RM ${amt.toFixed(2)})` : `🍕 Splitting ${desc || 'Bill'} (RM ${amt.toFixed(2)})!`);
}

function openFullPhotoView(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx || !tx.photo) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:18px;cursor:pointer;animation:fadeIn .2s';
  overlay.innerHTML = `
    <img src="${tx.photo}" style="max-width:100%;max-height:82vh;border-radius:14px;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.8)"/>
    <div style="color:#fff;margin-top:14px;text-align:center">
      <div style="font-size:15px;font-weight:800">${esc(tx.desc)}</div>
      <div style="font-size:12px;opacity:.8">${fmt(tx.amount)} · ${tx.date} · ${catInfo(tx.type, tx.category).name}</div>
    </div>
    <div style="color:rgba(255,255,255,.5);font-size:11px;margin-top:10px">Tap anywhere to close preview</div>
  `;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

function openEditTxModal(txId){
  currentDetailTxId = txId;
  editTxFromDetail();
}

function editTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  if(isInternalTransfer(tx)){
    toast(S.lang === 'zh' ? '内部转账请删除后重新建立，以保持两边账户余额正确。' : 'Delete and recreate an internal transfer to keep both account balances correct.');
    return;
  }
  closeModal('tx-detail-modal');

  openTxModal(tx.type);
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  el('tx-modal-title').textContent = tx.type === 'income'
    ? (isZh ? '✏️ 修改收入 (Edit Income)' : '✏️ Edit Income')
    : (isZh ? '✏️ 修改支出 (Edit Expense)' : '✏️ Edit Expense');

  el('tx-amount').value = (Number(tx.amount) || 0).toFixed(2);
  el('tx-desc').value = tx.desc || '';
  el('tx-date').value = normalizeDateStr(tx.date) || today();
  if(el('tx-time')) el('tx-time').value = tx.time || '';
  if(el('tx-location')) el('tx-location').value = tx.location || '';
  if(el('tx-note')) el('tx-note').value = tx.note || '';

  selCat = tx.category;
  selSubCat = tx.subCategory || null;
  showAllTxSubCats = false;
  if(el('tx-cats')) buildCats('tx-cats', tx.type, id => selCat = id);
  if(tx.accountId) setTxAccount(tx.accountId);
  if(tx.paymentMethod) selectPaymentMethod(tx.paymentMethod);

  if(tx.photo){
    photoData = tx.photo;
    const prevEl = el('photo-prev');
    const phEl = el('photo-ph');
    if(prevEl){
      prevEl.src = photoData;
      prevEl.classList.remove('hidden');
    }
    if(phEl) phEl.classList.add('hidden');
  }

  // Preserve extracted OCR items so editing doesn't lose them!
  const txItems = extractTxReceiptItems(tx);
  if(txItems && txItems.length > 0){
    currentOcrItems = JSON.parse(JSON.stringify(txItems));
  }

  const isAdv = Boolean(tx.isAdvance || tx.advance);
  if(isAdv){
    toggleTxMoreDetails(true);
    const chk = el('tx-is-advance'); if(chk) chk.checked = true;
    const det = el('tx-advance-details'); if(det) det.classList.remove('hidden');
    const inp = el('tx-advance-person'); if(inp) inp.value = tx.advancePerson || tx.advanceDebtor || '';
    const st = el('tx-advance-status'); if(st) st.value = tx.advanceStatus || (tx.advanceReimbursed ? 'reimbursed' : 'pending');
  }

  // Store the editing ID — the old transaction is updated when saveTx() runs
  editingTxId = currentDetailTxId;
}

function repeatTxFromDetail(){
  const tx = S.transactions.find(t => t.id === currentDetailTxId);
  if(!tx) return;
  if(isInternalTransfer(tx)){
    toast(S.lang === 'zh' ? '内部转账不能单独复制。' : 'An internal transfer cannot be duplicated by itself.');
    return;
  }
  const newTx = {
    ...JSON.parse(JSON.stringify(tx)),
    id: uid('item'),
    date: today(),
    time: currentTimeStr(),
    createdAt: new Date().toISOString()
  };
  S.transactions.unshift(newTx);
  save();
  renderAll();
  renderCalendar();
  closeModal('tx-detail-modal');
  toast(`🔁 Duplicated: ${tx.desc} · ${fmt(tx.amount)}`);
}

function deleteTxFromDetail(){
  if(!currentDetailTxId) return;
  deleteTx(currentDetailTxId);
  closeModal('tx-detail-modal');
}

function makeTxEl(tx){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const presentation = transactionPresentation(tx, isZh);
  const cat=presentation.category;
  const subCat = getSubCatInfo(tx.subCategory);
  const col=presentation.color;
  const acc=S.accounts.find(a=>a.id===tx.accountId);
  const accIco = acc ? getAccIcon(acc) : '💳';
  const payM = tx.paymentMethod || '';
  const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';

  const div=document.createElement('div');
  div.className='tx-item';
  div.dataset.id=tx.id;

  div.innerHTML=`
    <div class="tx-item-inner" style="cursor:pointer">
      <div class="tx-cat-icon" style="background:${col}22;overflow:hidden">
        ${tx.photo ? `<img src="${tx.photo}" alt="Receipt" style="width:100%;height:100%;object-fit:cover"/>` : cat.icon}
      </div>
      <div class="tx-info">
        <div class="tx-desc" style="display:flex;align-items:center;gap:6px">
          <span>${esc(tx.desc)}</span>
          ${tx.photo ? '<span style="font-size:11px;color:var(--cyan);font-weight:700">📷</span>' : ''}
        </div>
        <div class="tx-sub">
          <span>${subCat ? `${subCat.icon} ${esc(subCat.name)}` : esc(cat.name)}</span>
          ${tx.isAdvance ? `<span class="tx-badge" style="background:${tx.advanceStatus==='reimbursed'?'rgba(74,222,128,.16)':'rgba(255,179,0,.16)'};color:${tx.advanceStatus==='reimbursed'?'var(--green)':'var(--amber)'};font-weight:700">📌 ${tx.advanceStatus==='reimbursed'? (isZh?'已报销':'Reimbursed') : (isZh?'待报销':'Claimable')}</span>` : ''}
          ${tx.time ? `<span class="tx-badge" style="background:rgba(255,255,255,0.05);color:var(--dim)">⏰ ${tx.time}</span>` : ''}
          ${acc ? `<span class="tx-badge tx-badge-bank">${accIco} ${esc(acc.name)}</span>` : ''}
          ${payM ? `<span class="tx-badge tx-badge-method">⚡ ${esc(payM)}</span>` : ''}
          ${tx.location ? `<span class="tx-badge tx-badge-loc">📍 ${esc(tx.location)}</span>` : ''}
          ${cleanNote ? `<span style="color:var(--text)">· ${esc(cleanNote)}</span>` : ''}
        </div>
      </div>
      <div class="tx-amt ${tx.type}" style="color:${presentation.amountColor}">${presentation.amountPrefix}${fmt(tx.amount)}</div>
    </div>
    <button class="tx-item-delete-btn" type="button" title="Delete">🗑️</button>
  `;

  const inner = div.querySelector('.tx-item-inner');
  const delBtn = div.querySelector('.tx-item-delete-btn');

  // Direct swipe-to-delete button
  if(delBtn){
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTx(tx.id, true);
    };
  }

  // Ultra-Smooth Touch Swipe Gesture
  if(inner){
    let startX = 0, startY = 0, currentDx = 0;
    let isHorizontal = null;
    let isDragging = false;

    inner.addEventListener('touchstart', e => {
    if(e.touches.length > 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentDx = 0;
    isHorizontal = null;
    isDragging = false;
    inner.style.transition = 'none';

    // Close other swiped items
    document.querySelectorAll('.tx-item.swiped').forEach(other => {
      if(other !== div) other.classList.remove('swiped');
    });
  }, { passive: true });

  inner.addEventListener('touchmove', e => {
    if(e.touches.length > 1) return;
    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;
    const dx = moveX - startX;
    const dy = moveY - startY;

    if(isHorizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)){
      isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if(isHorizontal){
      isDragging = true;
      const isAlreadySwiped = div.classList.contains('swiped');
      const baseOffset = isAlreadySwiped ? -76 : 0;
      let targetX = baseOffset + dx;

      if(targetX > 0) targetX = targetX * 0.2;
      if(targetX < -95) targetX = -95 + (targetX + 95) * 0.2;

      currentDx = targetX;
      inner.style.transform = `translateX(${targetX}px)`;
    }
  }, { passive: true });

  const finishSwipe = () => {
    inner.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
    const isAlreadySwiped = div.classList.contains('swiped');

    if(isDragging){
      if(isAlreadySwiped){
        if(currentDx > -45){
          div.classList.remove('swiped');
        } else {
          div.classList.add('swiped');
        }
      } else {
        if(currentDx < -35){
          div.classList.add('swiped');
        } else {
          div.classList.remove('swiped');
        }
      }
    }
    inner.style.transform = '';
    setTimeout(() => { isDragging = false; }, 60);
  };

  inner.addEventListener('touchend', finishSwipe, { passive: true });
  inner.addEventListener('touchcancel', finishSwipe, { passive: true });

  // Tap opens the rich Transaction Details Sheet if not dragging
  inner.onclick = (e) => {
    if(isDragging) return;
    if(div.classList.contains('swiped')){
      div.classList.remove('swiped');
      return;
    }
    openTxDetailModal(tx.id);
  };
  }

  return div;
}

function deleteTx(id, skipConfirm = false){
  const tx=S.transactions.find(t=>t.id===id); if(!tx) return;
  const isTransfer = isInternalTransfer(tx);
  const cat=transactionPresentation(tx, S.lang === 'zh').category;
  const confirmation = isTransfer
    ? (S.lang === 'zh' ? '删除这笔内部转账？\n\n两个账户的对应转账记录都会移除。' : 'Delete this internal transfer?\n\nThe matching entry in the other account will also be removed.')
    : 'Delete this transaction?\n\n'+cat.icon+' '+tx.desc+'\n'+fmt(tx.amount)+' · '+tx.date;
  if(skipConfirm || confirm(confirmation)){
    S.transactions=S.transactions.filter(t=>!isTransfer || t.transferId !== tx.transferId);
    save();renderAll();toast(isTransfer ? (S.lang === 'zh' ? '🗑️ 内部转账已删除' : '🗑️ Internal transfer deleted') : '🗑️ Transaction deleted');
    return true;
  }
  return false;
}

// ── CALENDAR & ACTIVITY STATE ─────────────────────────
let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();
let calSelectedDateStr = today();
let txViewMode = 'calendar';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function switchTxViewMode(mode){
  txViewMode = mode;
  const calBtn = el('view-mode-cal'), listBtn = el('view-mode-list');
  const calCont = el('tx-cal-container'), listCont = el('tx-list-container');
  if(calBtn) calBtn.classList.toggle('on', mode === 'calendar');
  if(listBtn) listBtn.classList.toggle('on', mode === 'list');
  if(calCont) calCont.classList.toggle('hidden', mode !== 'calendar');
  if(listCont) listCont.classList.toggle('hidden', mode !== 'list');

  if(mode === 'calendar'){
    renderCalendar();
  } else {
    renderFullTx();
  }
}

function prevCalMonth(){
  calCurrentMonth--;
  if(calCurrentMonth < 0){
    calCurrentMonth = 11;
    calCurrentYear--;
  }
  renderCalendar();
}

function nextCalMonth(){
  calCurrentMonth++;
  if(calCurrentMonth > 11){
    calCurrentMonth = 0;
    calCurrentYear++;
  }
  renderCalendar();
}

function jumpCalToday(){
  const now = new Date();
  calCurrentYear = now.getFullYear();
  calCurrentMonth = now.getMonth();
  calSelectedDateStr = today();
  renderCalendar();
}

function addTxOnSelectedCalDate(){
  openTxModal('expense');
  el('tx-date').value = calSelectedDateStr || today();
}

function uploadReceiptOnSelectedCalDate(){
  openTxModal('expense');
  el('tx-date').value = calSelectedDateStr || today();
  setTimeout(()=>{
    startOCR();
  }, 350);
}

function renderCalendar(){
  const monthLbl = el('cal-month-label');
  if(monthLbl){
    const lang = (S && S.lang) ? S.lang : 'en';
    if(lang === 'zh'){
      monthLbl.textContent = `${calCurrentYear}年 ${MONTH_NAMES_ZH[calCurrentMonth]}`;
    } else {
      monthLbl.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;
    }
  }

  // 1. Calculate Month-Wide Stats
  const txsInMonth = filteredTx().filter(t => inMonth(t, calCurrentMonth, calCurrentYear));
  const mSpent = txsInMonth.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const mIncome = txsInMonth.length > 0 ? (mSpent / (new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate())) : 0;
  const mNet = mIncome - mSpent;

  if(el('cal-m-spent')) el('cal-m-spent').textContent = fmt(mSpent);
  if(el('cal-m-income')) el('cal-m-income').textContent = fmt(mIncome);
  if(el('cal-m-net')) el('cal-m-net').textContent = (mNet >= 0 ? '+' : '') + fmt(mNet);

  // 2. Build 7-Column Grid
  const grid = el('cal-days-grid');
  if(!grid) return;
  grid.innerHTML = '';

  const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 = Sun
  const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calCurrentYear, calCurrentMonth, 0).getDate();

  // Padding days from previous month
  for(let i = firstDayIndex - 1; i >= 0; i--){
    const pDay = prevMonthTotalDays - i;
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.innerHTML = `<span class="cal-day-num">${pDay}</span>`;
    grid.appendChild(box);
  }

  // Current month days
  const todayStr = today();
  for(let d = 1; d <= totalDays; d++){
    const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTxs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
    const daySpent = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const dayInc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const box = document.createElement('div');
    box.className = 'cal-day-box';
    if(dateStr === todayStr) box.classList.add('today');
    if(dateStr === calSelectedDateStr) box.classList.add('selected');
    if(daySpent > 0) box.classList.add('has-spend');

    const spentFmt = daySpent > 0 ? (daySpent >= 1000 ? (daySpent/1000).toFixed(1)+'k' : daySpent.toFixed(0)) : '';
    const incFmt = dayInc > 0 ? (dayInc >= 1000 ? (dayInc/1000).toFixed(1)+'k' : dayInc.toFixed(0)) : '';

    // Pending meals due on this date
    const pendingOnDay = (S.pendingMeals || []).filter(m => !m.paid && m.dueDate === dateStr);
    const pendingDotHtml = pendingOnDay.length > 0 ?
      `<div style="display:flex;justify-content:center;gap:1px;margin-top:1px">${pendingOnDay.map(m => `<span class="cal-day-pending-dot${m.dueDate < todayStr ? ' overdue' : ''}"></span>`).join('')}</div>` : '';

    box.innerHTML = `
      <span class="cal-day-num">${d}</span>
      ${daySpent > 0 ? `<span class="cal-day-spent">-${spentFmt}</span>` : ''}
      ${dayInc > 0 ? `<span class="cal-day-inc">+${incFmt}</span>` : ''}
      ${pendingDotHtml}
    `;

    // Single click: select date; Double click / 2 times: open day detail modal
    let dayClicks = 0;
    let dayTimer = null;
    box.onclick = (e) => {
      dayClicks++;
      if(dayClicks === 1){
        dayTimer = setTimeout(() => {
          dayClicks = 0;
          selectCalDate(dateStr, box);
        }, 280);
      } else if(dayClicks >= 2){
        clearTimeout(dayTimer);
        dayClicks = 0;
        if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
        openCalDayDetailModal(dateStr);
      }
    };
    box.ondblclick = (e) => {
      e.preventDefault();
      if(dayTimer) clearTimeout(dayTimer);
      dayClicks = 0;
      if(navigator.vibrate) { try{ navigator.vibrate(40); }catch(err){} }
      openCalDayDetailModal(dateStr);
    };

    grid.appendChild(box);
  }

  // Padding days for next month to complete row
  const totalCells = firstDayIndex + totalDays;
  const remaining = (7 - (totalCells % 7)) % 7;
  for(let n = 1; n <= remaining; n++){
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.innerHTML = `<span class="cal-day-num">${n}</span>`;
    grid.appendChild(box);
  }

  renderCalDayTransactions();
}

function renderCalDayTransactions(){
  const list = el('cal-day-tx-list'), empty = el('cal-day-empty');
  const titleEl = el('cal-day-selected-title'), subEl = el('cal-day-selected-sub');
  if(!list) return;
  list.innerHTML = '';

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === calSelectedDateStr);
  const dObj = new Date(calSelectedDateStr + 'T00:00:00');
  const lang = (S && S.lang) ? S.lang : 'en';
  const dNice = lang === 'zh'
    ? `${dObj.getFullYear()}年${dObj.getMonth()+1}月${dObj.getDate()}日 (星期${['日','一','二','三','四','五','六'][dObj.getDay()]})`
    : dObj.toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isTod = calSelectedDateStr === today();

  const daySpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const locs = [...new Set(txs.map(t => t.location).filter(Boolean))];
  const locSummary = locs.length > 0 ? ` · 📍 ${locs.slice(0,2).join(', ')}${locs.length>2?` +${locs.length-2} more`:''}` : '';

  const catTotals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0);
  });
  const catPills = Object.entries(catTotals).map(([cat, amt]) => {
    const c = catInfo('expense', cat);
    return `<span class="chip" style="font-size:10.5px;padding:2px 8px;background:var(--bg3);border:1px solid var(--border);pointer-events:none">${c.icon} ${c.name}: <strong>${fmt(amt)}</strong></span>`;
  }).join(' ');

  if(titleEl){
    titleEl.textContent = `${isTod ? (lang === 'zh' ? '⭐ 今天 · ' : '⭐ Today · ') : ''}${dNice}`;
  }
  if(subEl){
    const spentLbl = lang === 'zh' ? '支出' : 'Spent';
    const incLbl = lang === 'zh' ? '收入' : 'Income';
    const entryLbl = lang === 'zh' ? '笔账单' : (txs.length === 1 ? 'entry' : 'entries');
    subEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
        <div>${spentLbl}: <strong style="color:var(--red)">${fmt(daySpent)}</strong> · ${incLbl}: <strong style="color:var(--green)">${fmt(dayIncome)}</strong> (${txs.length} ${entryLbl})${locSummary}</div>
      </div>
      ${catPills ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${catPills}</div>` : ''}
    `;
  }

  if(!txs.length){
    if(empty) empty.classList.remove('hidden');
  } else {
    if(empty) empty.classList.add('hidden');
  }

  txs.forEach(tx => list.appendChild(makeTxEl(tx)));

  // Show pending meals due on this date
  const pendingOnDay = (S.pendingMeals || []).filter(m => !m.paid && m.dueDate === calSelectedDateStr);
  if(pendingOnDay.length > 0){
    if(empty) empty.classList.add('hidden');
    const pendingHdr = document.createElement('div');
    pendingHdr.style.cssText = 'font-size:11.5px;font-weight:800;color:var(--amber);margin:10px 0 6px;display:flex;align-items:center;gap:6px';
    pendingHdr.innerHTML = '🕐 Pending Meals Due';
    list.appendChild(pendingHdr);

    const todayStr = today();
    pendingOnDay.forEach(meal => {
      const isOverdue = meal.dueDate < todayStr;
      const div = document.createElement('div');
      div.className = `pending-meal-item${isOverdue ? ' overdue' : ''}`;
      div.style.cssText = 'padding:10px;margin-bottom:6px';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:var(--text)">🍽️ ${esc(meal.desc || 'Meal')}</div>
            ${meal.payTo ? `<div style="font-size:10.5px;color:var(--muted)">👤 ${esc(meal.payTo)}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:800;color:var(--amber)">${fmt(meal.amount)}</div>
            <span class="pending-meal-badge ${isOverdue ? 'overdue' : 'pending'}">${isOverdue ? '⚠️ Overdue' : '🕐 Pending'}</span>
          </div>
        </div>
        <div style="margin-top:6px;display:flex;gap:6px">
          <button type="button" class="primary-btn" style="padding:5px 12px;font-size:11px;border-radius:10px;flex:1" onclick="markMealPaid('${meal.id}')">✅ Pay Now</button>
          <button type="button" class="ghost-btn" style="padding:5px 10px;font-size:11px;border-radius:10px" onclick="openPendingMealsModal()">View All</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

// ── 📅 CALENDAR DAY MANAGEMENT & AUTOMATION ────────────
let calModalDateStr = today();

function selectCalDate(dateStr, boxEl){
  calSelectedDateStr = dateStr;
  const grid = el('cal-days-grid');
  if(grid) grid.querySelectorAll('.cal-day-box').forEach(b => b.classList.remove('selected'));
  if(boxEl) boxEl.classList.add('selected');
  renderCalDayTransactions();
}

function openCalDayDetailModal(dateStr){
  calModalDateStr = dateStr;
  calSelectedDateStr = dateStr;
  
  const dObj = new Date(dateStr + 'T00:00:00');
  const dFull = dObj.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const dayNum = dObj.getDate();

  if(el('cal-day-modal-title')) el('cal-day-modal-title').textContent = `📅 Day Management: ${dayNum} ${dObj.toLocaleDateString('en-MY', { month: 'short' })}`;
  if(el('cal-day-modal-date')) el('cal-day-modal-date').textContent = dFull;

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
  const daySpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

  if(el('cal-day-modal-summary')){
    el('cal-day-modal-summary').innerHTML = `Spent: <strong style="color:var(--red)">${fmt(daySpent)}</strong> · Income: <strong style="color:var(--green)">${fmt(dayIncome)}</strong> (${txs.length} ${txs.length===1?'entry':'entries'})`;
  }

  // Update Dynamic Labels
  updateCalSameDaysLabel();
  if(el('cal-payday-sub')){
    el('cal-payday-sub').textContent = `Make the ${dayNum}${getOrdinalSuffix(dayNum)} of every month your payday`;
  }

  // Reset inputs & close collapsible sections by default
  if(el('cal-rec-desc')) el('cal-rec-desc').value = '';
  if(el('cal-rec-amt')) el('cal-rec-amt').value = '';
  if(el('cal-apply-all-same-days')) el('cal-apply-all-same-days').checked = false;

  const recPanel = el('cal-rec-collapse-panel');
  const paydayPanel = el('cal-payday-collapse-panel');
  const recBtn = el('cal-rec-toggle-btn');
  const paydayBtn = el('cal-payday-toggle-btn');
  const recArrow = el('cal-rec-arrow');
  const paydayArrow = el('cal-payday-arrow');

  if(recPanel) recPanel.classList.add('hidden');
  if(paydayPanel) paydayPanel.classList.add('hidden');
  if(recBtn) recBtn.classList.remove('on');
  if(paydayBtn) paydayBtn.classList.remove('on');
  if(recArrow) recArrow.style.transform = 'rotate(0deg)';
  if(paydayArrow) paydayArrow.style.transform = 'rotate(0deg)';

  // Render transactions on this day inside modal
  renderCalModalTxList(dateStr);

  openModal('cal-day-modal');
}

function toggleCalDaySection(section){
  const recPanel = el('cal-rec-collapse-panel');
  const paydayPanel = el('cal-payday-collapse-panel');
  const recBtn = el('cal-rec-toggle-btn');
  const paydayBtn = el('cal-payday-toggle-btn');
  const recArrow = el('cal-rec-arrow');
  const paydayArrow = el('cal-payday-arrow');

  if(section === 'rec'){
    if(recPanel){
      const isHidden = recPanel.classList.toggle('hidden');
      if(recBtn) recBtn.classList.toggle('on', !isHidden);
      if(recArrow) recArrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      if(!isHidden && paydayPanel){
        paydayPanel.classList.add('hidden');
        if(paydayBtn) paydayBtn.classList.remove('on');
        if(paydayArrow) paydayArrow.style.transform = 'rotate(0deg)';
      }
    }
  } else if(section === 'payday'){
    if(paydayPanel){
      const isHidden = paydayPanel.classList.toggle('hidden');
      if(paydayBtn) paydayBtn.classList.toggle('on', !isHidden);
      if(paydayArrow) paydayArrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      if(!isHidden && recPanel){
        recPanel.classList.add('hidden');
        if(recBtn) recBtn.classList.remove('on');
        if(recArrow) recArrow.style.transform = 'rotate(0deg)';
      }
    }
  }
}

function getOrdinalSuffix(i){
  const j = i % 10, k = i % 100;
  if(j === 1 && k !== 11) return 'st';
  if(j === 2 && k !== 12) return 'nd';
  if(j === 3 && k !== 13) return 'rd';
  return 'th';
}

function updateCalSameDaysLabel(){
  const dObj = new Date(calModalDateStr + 'T00:00:00');
  const weekdayName = dObj.toLocaleDateString('en-MY', { weekday: 'long' });
  const monthName = dObj.toLocaleDateString('en-MY', { month: 'long' });
  const dayNum = dObj.getDate();
  const freq = el('cal-rec-freq')?.value || 'monthly';

  const lbl = el('cal-apply-same-label');
  const sub = el('cal-apply-same-sub');
  if(lbl && sub){
    if(freq === 'weekly'){
      lbl.textContent = `☑️ Apply to all ${weekdayName}s in ${monthName}`;
      sub.textContent = `Create entries for every ${weekdayName} in the current month.`;
    } else if(freq === 'monthly'){
      lbl.textContent = `☑️ Apply to every ${dayNum}${getOrdinalSuffix(dayNum)} of the month`;
      sub.textContent = `Automates on the ${dayNum}${getOrdinalSuffix(dayNum)} of every upcoming month.`;
    } else {
      lbl.textContent = `☑️ Apply yearly on this date`;
      sub.textContent = `Recurs annually on ${dObj.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}.`;
    }
  }
}

function renderCalModalTxList(dateStr){
  const list = el('cal-day-modal-tx-list');
  if(!list) return;
  list.innerHTML = '';

  const txs = filteredTx().filter(t => normalizeDateStr(t.date) === dateStr);
  if(!txs.length){
    list.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted)">No transactions recorded on this day.</div>`;
    return;
  }

  txs.forEach(tx => {
    const isZh = (S.lang === 'zh');
    const presentation = transactionPresentation(tx, isZh);
    const c = presentation.category;
    const subCat = getSubCatInfo(tx.subCategory);
    const col = presentation.color;
    const acc = S.accounts.find(a => a.id === tx.accountId);
    const accIco = acc ? getAccIcon(acc) : '💳';
    const cleanNote = tx.note ? String(tx.note).replace(/\[object Object\],?\s*/g, '').trim() : '';

    const div = document.createElement('div');
    div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all .15s';
    div.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;overflow:hidden">
          <div style="width:36px;height:36px;border-radius:10px;background:${col}22;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden">
            ${tx.photo ? `<img src="${tx.photo}" alt="Receipt" style="width:100%;height:100%;object-fit:cover"/>` : c.icon}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px">
              <strong style="font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(tx.desc || c.name)}</strong>
              ${tx.photo ? '<span style="font-size:11px;color:var(--cyan)">📷</span>' : ''}
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">
              <span>${subCat ? `${subCat.icon} ${esc(subCat.name)}` : esc(c.name)}</span>
              ${tx.time ? `<span>· ⏰ ${tx.time}</span>` : ''}
              ${acc ? `<span>· ${accIco} ${esc(acc.name)}</span>` : ''}
              ${tx.paymentMethod ? `<span>· ⚡ ${esc(tx.paymentMethod)}</span>` : ''}
              ${tx.location ? `<span>· 📍 ${esc(tx.location)}</span>` : ''}
            </div>
            ${cleanNote ? `
              <div style="font-size:11px;color:var(--text);background:var(--bg2);padding:5px 8px;border-radius:8px;margin-top:6px;border:1px solid var(--border);line-height:1.4">
                🛒 <strong>Items:</strong> ${esc(cleanNote)}
              </div>
            ` : ''}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div style="font-size:14px;font-weight:900;color:${presentation.amountColor}">
            ${presentation.amountPrefix}${fmt(tx.amount)}
          </div>
          <button type="button" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:2px 4px;border-radius:6px" onclick="event.stopPropagation(); deleteTxFromCalModal('${tx.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;

    div.onclick = () => {
      openTxDetailModal(tx.id);
    };

    list.appendChild(div);
  });
}

function deleteTxFromCalModal(txId){
  if(deleteTx(txId)){
    renderCalendar();
    renderCalModalTxList(calModalDateStr);
  }
}

function calDayAddTx(type){
  closeModal('cal-day-modal');
  openTxModal(type);
  el('tx-date').value = calModalDateStr;
}

function calDayUploadReceipt(){
  closeModal('cal-day-modal');
  openUniversalUpload('expense', calModalDateStr);
}

function setCalDayAsPayday(){
  const dayNum = parseInt(calModalDateStr.split('-')[2], 10);
  S.paydayDate = dayNum;
  save();
  renderPaydayCountdown();
  renderProfile();
  closeModal('cal-day-modal');
  toast(`🎉 Payday set to ${dayNum}${getOrdinalSuffix(dayNum)} of every month!`);
}

function saveCalDayAutomation(){
  const desc = (el('cal-rec-desc')?.value || '').trim();
  const amt = parseFloat(el('cal-rec-amt')?.value) || 0;
  const type = el('cal-rec-type')?.value || 'expense';
  const freq = el('cal-rec-freq')?.value || 'monthly';
  const applyAllSame = el('cal-apply-all-same-days')?.checked || false;

  if(!desc){
    toast('⚠️ Please enter a description');
    return;
  }
  if(amt <= 0){
    toast('⚠️ Please enter an amount');
    return;
  }

  // 1. Add to Recurring Engine
  const newRec = {
    id: uid('rec'),
    type: type,
    desc: desc,
    amount: amt,
    category: type === 'income' ? 'salary' : 'bills',
    freq: freq,
    nextDue: calModalDateStr,
    paymentMethod: 'Cash',
    createdAt: new Date().toISOString()
  };

  S.recurring.push(newRec);

  // 2. If 'Apply to all same days in this month' is checked
  if(applyAllSame && freq === 'weekly'){
    const targetDateObj = new Date(calModalDateStr + 'T00:00:00');
    const targetWeekday = targetDateObj.getDay();
    const [yStr, mStr] = calModalDateStr.split('-');
    const y = parseInt(yStr), m = parseInt(mStr);
    const daysInMonth = new Date(y, m, 0).getDate();

    let createdCount = 0;
    for(let d = 1; d <= daysInMonth; d++){
      const curDate = new Date(y, m - 1, d);
      if(curDate.getDay() === targetWeekday){
        const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        S.transactions.push({
          id: 'tx_auto_' + Date.now() + '_' + d,
          type: type,
          amount: amt,
          desc: desc,
          category: type === 'income' ? 'salary' : 'bills',
          date: ds,
          time: '10:00',
          accountId: getActiveAccountId(),
          paymentMethod: 'Cash',
          note: `Auto-applied for all ${targetDateObj.toLocaleDateString('en-MY', { weekday: 'long' })}s`,
          createdAt: new Date().toISOString()
        });
        createdCount++;
      }
    }
    toast(`🔁 Recurring rule created & applied to ${createdCount} days in this month!`);
  } else {
    toast(`🔁 Recurring ${type} saved for ${freq} schedule!`);
  }

  save();
  renderAll();
  renderCalendar();
  closeModal('cal-day-modal');
}

// ── RENDER: FULL TX ────────────────────────────────────
function setFilter(btn, f){
  document.querySelectorAll('#tx-list-container .chips .chip').forEach(c => c.classList.remove('on'));
  if(btn) btn.classList.add('on');
  txFilter = f;
  renderFullTx();
}

function resetTxMonthFilter(){
  const f = el('tx-month-filter');
  if(f) f.value = 'all';
  renderFullTx();
}

function syncTxMonthFilterOptions(){
  const filterEl = el('tx-month-filter');
  if(!filterEl) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const currentVal = filterEl.value || 'all';

  // Get distinct months
  const allTx = filteredTx();
  const monthSet = new Set();
  const curM = new Date().toISOString().slice(0, 7);
  monthSet.add(curM);
  allTx.forEach(t => {
    const m = (t.date || '').slice(0, 7);
    if(m && m.length === 7) monthSet.add(m);
  });
  const sortedMonths = [...monthSet].sort((a,b) => b.localeCompare(a));

  let html = `<option value="all">${isZh ? '📅 全部月份与年份 (All Time)' : '📅 All Months & Years'}</option>`;
  sortedMonths.forEach(mStr => {
    const [y, mNum] = mStr.split('-');
    const mIdx = parseInt(mNum, 10) - 1;
    const mName = isZh ? `${y}年${MONTH_NAMES_ZH[mIdx]}` : `${MONTH_NAMES[mIdx]} ${y}`;
    const count = allTx.filter(t => (t.date || '').startsWith(mStr)).length;
    html += `<option value="${mStr}">${mName} (${count} ${isZh ? '笔' : 'txs'})</option>`;
  });

  filterEl.innerHTML = html;
  if(sortedMonths.includes(currentVal) || currentVal === 'all'){
    filterEl.value = currentVal;
  }
}

function renderFullTx(){
  syncTxMonthFilterOptions();
  const filterEl = el('tx-month-filter');
  const selectedMonth = (filterEl ? filterEl.value : 'all') || 'all';
  const summaryBar = el('tx-month-summary-bar');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const srch=(el('tx-search')?el('tx-search').value||'':'').toLowerCase();
  let txs=[...filteredTx()].sort((a,b)=>b.date.localeCompare(a.date));

  // Month filter
  if(selectedMonth !== 'all'){
    txs = txs.filter(t => (t.date || '').startsWith(selectedMonth));
    if(summaryBar){
      summaryBar.classList.remove('hidden');
      const [y, mNum] = selectedMonth.split('-');
      const mIdx = parseInt(mNum, 10) - 1;
      const mName = isZh ? `${y}年${MONTH_NAMES_ZH[mIdx]}` : `${MONTH_NAMES[mIdx]} ${y}`;
      const mSpent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      summaryBar.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
          <span>📅</span>
          <strong>${mName}</strong>
          <span style="color:var(--muted)">(${txs.length} ${isZh ? '笔明细' : (txs.length === 1 ? 'entry' : 'entries')})</span>
        </div>
        <div>
          ${isZh ? '支出' : 'Spent'}: <strong style="color:var(--red);font-size:13px">${fmt(mSpent)}</strong>
        </div>
      `;
    }
  } else {
    if(summaryBar) summaryBar.classList.add('hidden');
  }

  if(txFilter!=='all') txs=txs.filter(t=>t.type===txFilter);
  if(srch) txs=txs.filter(t=>{
    const acc=S.accounts.find(a=>a.id===t.accountId);
    const accName=acc?acc.name.toLowerCase():'';
    const subCat = t.subCategory ? getSubCatInfo(t.subCategory) : null;
    const subCatName = subCat ? subCat.name.toLowerCase() : '';
    const tagStr = (t.tags && Array.isArray(t.tags)) ? t.tags.join(' ').toLowerCase() : '';
    const itemNames = (t.items && Array.isArray(t.items)) ? t.items.map(i=>i.name).join(' ').toLowerCase() : '';
    const pm = (t.paymentMethod || '').toLowerCase();
    return (t.desc && t.desc.toLowerCase().includes(srch)) || 
           (t.category && t.category.toLowerCase().includes(srch)) || 
           (t.note && t.note.toLowerCase().includes(srch)) || 
           subCatName.includes(srch) ||
           tagStr.includes(srch) ||
           itemNames.includes(srch) ||
           accName.includes(srch) || 
           pm.includes(srch);
  });
  const list=el('tx-full-list'), empty=el('empty-tx');
  if(!list) return;
  list.innerHTML='';
  if(!txs.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const groups={};
  txs.forEach(tx=>{groups[tx.date]=groups[tx.date]||[];groups[tx.date].push(tx);});
  Object.keys(groups).sort((a,b)=>b.localeCompare(a)).forEach(date=>{
    const lbl=document.createElement('div'); lbl.className='date-group'; lbl.textContent=fmtDate(date); list.appendChild(lbl);
    groups[date].forEach(tx=>list.appendChild(makeTxEl(tx)));
  });
}

// ── 📊 ANNUAL & BY-YEAR SPENDING SYSTEM ───────────────
let annualInspectedYear = new Date().getFullYear();

function openAnnualSpendingModal(year){
  if(year !== undefined && !isNaN(year)){
    annualInspectedYear = Number(year);
  } else {
    annualInspectedYear = homeActiveYear;
  }
  renderAnnualSpendingModal();
  openModal('annual-spending-modal');
}

function stepAnnualYear(delta){
  annualInspectedYear += delta;
  renderAnnualSpendingModal();
}

function jumpAnnualCurrentYear(){
  annualInspectedYear = new Date().getFullYear();
  renderAnnualSpendingModal();
}

function renderAnnualSpendingModal(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const allTx = filteredTx();
  const yearStr = String(annualInspectedYear);

  // 1. Year Header & Button
  const titleEl = el('annual-year-title');
  const subEl = el('annual-year-subtitle');
  const curYearBtn = el('annual-current-year-btn');
  if(titleEl) titleEl.textContent = isZh ? `${annualInspectedYear}年 消费总览` : `${annualInspectedYear} Annual Spending`;
  if(subEl) subEl.textContent = isZh ? '按月查账 · 历年消费总览与明细' : 'Month-by-month & By-year breakdown';
  if(curYearBtn) curYearBtn.style.display = (annualInspectedYear === curYear) ? 'none' : 'inline-block';

  // 2. Year Statistics
  const yearTxs = allTx.filter(t => t.type === 'expense' && (t.date || '').startsWith(yearStr));
  const totalSpend = yearTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalCount = yearTxs.length;

  // Calculate spending per month for this year
  const monthData = [];
  let peakMonthIdx = -1;
  let peakMonthSpend = -1;
  let activeMonthCount = 0;

  for(let m = 0; m < 12; m++){
    const mTxs = yearTxs.filter(t => inMonth(t, m, annualInspectedYear));
    const mSpend = mTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const mCount = mTxs.length;
    if(mCount > 0){
      activeMonthCount++;
      if(mSpend > peakMonthSpend){
        peakMonthSpend = mSpend;
        peakMonthIdx = m;
      }
    }
    monthData.push({ month: m, spend: mSpend, count: mCount });
  }

  const avgSpend = activeMonthCount > 0 ? (totalSpend / activeMonthCount) : 0;
  const peakMonthName = peakMonthIdx >= 0 ? (isZh ? MONTH_NAMES_ZH[peakMonthIdx] : MONTH_NAMES[peakMonthIdx]) : '—';

  if(el('annual-total-spent')) el('annual-total-spent').textContent = fmt(totalSpend);
  if(el('annual-total-tx-count')) el('annual-total-tx-count').textContent = isZh ? `${totalCount} 笔消费记录` : `${totalCount} entries`;
  if(el('annual-monthly-avg')) el('annual-monthly-avg').textContent = fmt(avgSpend);
  if(el('annual-peak-month')) el('annual-peak-month').textContent = isZh ? `最高: ${peakMonthName} (${fmt(peakMonthSpend > 0 ? peakMonthSpend : 0)})` : `Peak: ${peakMonthName} (${fmt(peakMonthSpend > 0 ? peakMonthSpend : 0)})`;
  if(el('annual-active-months-count')) el('annual-active-months-count').textContent = isZh ? `${activeMonthCount} 个记账月份` : `${activeMonthCount} active months`;

  // 3. 12 Months Breakdown Cards
  const grid = el('annual-months-grid');
  if(grid){
    grid.innerHTML = '';
    monthData.forEach(md => {
      const m = md.month;
      const mName = isZh ? MONTH_NAMES_ZH[m] : MONTH_NAMES[m];
      const isCur = (annualInspectedYear === curYear && m === curMonth);
      const isHomeActive = (annualInspectedYear === homeActiveYear && m === homeActiveMonth);
      const isPeak = (m === peakMonthIdx && md.spend > 0);
      const pct = totalSpend > 0 ? Math.min(100, Math.round((md.spend / totalSpend) * 100)) : 0;

      const card = document.createElement('div');
      card.style.cssText = `background:var(--card);border:1.5px solid ${isHomeActive ? 'var(--amber)' : 'var(--border)'};border-radius:14px;padding:10px 12px;cursor:pointer;transition:all .15s`;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:13px;color:var(--text)">${mName}</strong>
            ${isCur ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(59,130,246,.18);color:#3b82f6;font-weight:700">${isZh ? '本月' : 'Current'}</span>` : ''}
            ${isHomeActive ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(245,158,11,.2);color:var(--amber);font-weight:800">${isZh ? '当前查看' : 'Viewing'}</span>` : ''}
            ${isPeak ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:rgba(239,68,68,.15);color:var(--red);font-weight:700">🔥 ${isZh ? '最高支出' : 'Peak'}</span>` : ''}
          </div>
          <div style="text-align:right">
            <span style="font-size:14px;font-weight:900;color:${md.spend > 0 ? 'var(--red)' : 'var(--muted)'}">${fmt(md.spend)}</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:6px;background:var(--bg2);border-radius:6px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${isPeak ? 'var(--red)' : 'var(--amber)'};border-radius:6px"></div>
          </div>
          <div style="font-size:10.5px;color:var(--muted);white-space:nowrap;min-width:65px;text-align:right">
            ${md.count} ${isZh ? '笔' : (md.count === 1 ? 'tx' : 'txs')} (${pct}%)
          </div>
          <button type="button" class="chip" style="font-size:10.5px;padding:3px 8px;font-weight:800;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;cursor:pointer" onclick="event.stopPropagation(); inspectMonthFromAnnual(${annualInspectedYear}, ${m})">
            ${isZh ? '查账 🔍' : 'Inspect 🔍'}
          </button>
        </div>
      `;

      card.onclick = () => {
        inspectMonthFromAnnual(annualInspectedYear, m);
      };

      grid.appendChild(card);
    });
  }

  // 4. By-Year Historical Comparison Table
  renderByYearHistoryTable();
}

function inspectMonthFromAnnual(year, month){
  homeActiveYear = year;
  homeActiveMonth = month;
  closeModal('annual-spending-modal');

  // Update Home view
  renderBalance();
  renderRecentTx();

  // Also sync Calendar view
  calCurrentYear = year;
  calCurrentMonth = month;
  renderCalendar();

  // Also sync Activity list view filter if open
  const mKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const filterEl = el('tx-month-filter');
  if(filterEl){
    filterEl.value = mKey;
    renderFullTx();
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const mName = isZh ? MONTH_NAMES_ZH[month] : MONTH_NAMES[month];
  toast(isZh ? `📅 已切换至 ${year}年${mName}` : `📅 Switched to ${mName} ${year}`);
}

function renderByYearHistoryTable(){
  const container = el('annual-by-year-table');
  if(!container) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const allTx = filteredTx().filter(t => t.type === 'expense');

  // Group by Year
  const yearsMap = {};
  allTx.forEach(t => {
    const y = (t.date || '').slice(0, 4);
    if(y && y.length === 4){
      if(!yearsMap[y]){
        yearsMap[y] = { year: Number(y), total: 0, count: 0, months: new Set() };
      }
      yearsMap[y].total += (Number(t.amount) || 0);
      yearsMap[y].count++;
      const m = (t.date || '').slice(0, 7);
      if(m) yearsMap[y].months.add(m);
    }
  });

  // Include current inspected year even if 0 transactions
  const inspectedYStr = String(annualInspectedYear);
  if(!yearsMap[inspectedYStr]){
    yearsMap[inspectedYStr] = { year: annualInspectedYear, total: 0, count: 0, months: new Set() };
  }

  const sortedYears = Object.values(yearsMap).sort((a,b) => b.year - a.year);

  let rowsHtml = sortedYears.map(yr => {
    const isCurrentInspected = yr.year === annualInspectedYear;
    const activeMonths = Math.max(1, yr.months.size);
    const monthlyAvg = yr.total / activeMonths;

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer;background:${isCurrentInspected ? 'rgba(245,158,11,.1)' : 'transparent'};transition:all .15s" onclick="annualInspectedYear = ${yr.year}; renderAnnualSpendingModal()">
        <div>
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:13px;color:var(--text)">${yr.year}</strong>
            ${isCurrentInspected ? `<span class="chip" style="font-size:9.5px;padding:1px 6px;background:var(--amber);color:#000;font-weight:800">${isZh ? '正在查看' : 'Selected'}</span>` : ''}
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px">
            ${yr.count} ${isZh ? '笔记录' : 'entries'} · ${activeMonths} ${isZh ? '个记账月份' : 'active mo'} (${fmt(monthlyAvg)}/mo)
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:900;color:var(--red)">${fmt(yr.total)}</div>
          <div style="font-size:10px;color:var(--cyan);margin-top:1px">${isZh ? '点此查看 ›' : 'Tap to inspect ›'}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = rowsHtml || `<div style="padding:12px;text-align:center;color:var(--muted);font-size:11.5px">No yearly data recorded yet.</div>`;
}

function fmtDate(str){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const d=new Date(str+'T00:00:00'), t=new Date(); t.setHours(0,0,0,0);
  const y=new Date(t); y.setDate(y.getDate()-1);
  if(d.getTime()===t.getTime()) return isZh ? '今天 (TODAY)' : 'Today';
  if(d.getTime()===y.getTime()) return isZh ? '昨天 (YESTERDAY)' : 'Yesterday';
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  return d.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── RENDER: BUDGET PREVIEW ─────────────────────────────
function renderBudPreview(){
  const wrap=el('bud-preview'); if(!wrap) return;
  wrap.innerHTML='';
  if(!S.budgets.length){wrap.innerHTML='<p style="font-size:12px;color:var(--dim);text-align:center;padding:8px">No budgets set</p>';return;}
  const now=new Date();
  S.budgets.slice(0,3).forEach(b=>{
    const cat=catInfo('expense',b.category);
    const sp=S.transactions.filter(t=>t.type==='expense'&&t.category===b.category&&inMonth(t,now.getMonth(),now.getFullYear())).reduce((s,t)=>s+Number(t.amount)||0,0);
    const limit=Number(b.limit)||1;
    const pct=Math.min((sp/limit)*100,100);
    const col=pct>=100?'#ef4444':pct>=80?'#f59e0b':'#10b981';
    const d=document.createElement('div'); d.className='bud-item';
    d.innerHTML='<div class="bud-hdr"><div class="bud-name"><span>'+cat.icon+'</span>'+cat.name+'</div><div class="bud-amts">'+fmt(sp)+' / <strong>'+fmt(b.limit)+'</strong></div></div><div class="track"><div class="fill" style="width:'+pct+'%;background:'+col+'"></div></div>';
    wrap.appendChild(d);
  });
}

// ── RENDER: BUDGETS PAGE ───────────────────────────────
function renderBudgets(){
  const list=el('budgets-list'), empty=el('empty-budgets');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.budgets.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const now=new Date(), m=now.getMonth(), y=now.getFullYear();
  const txs=filteredTx().filter(t=>t.type==='expense'&&inMonth(t,m,y));
  S.budgets.forEach(b=>{
    const cat=catInfo('expense',b.category);
    const spent=txs.filter(t=>t.category===b.category).reduce((s,t)=>s+Number(t.amount)||0,0);
    const pct=Math.min(Math.round((spent/b.limit)*100),100);
    const over=spent>b.limit;
    const div=document.createElement('div'); div.className='bud-card';
    div.innerHTML=`
      <div class="bud-top">
        <div class="bud-cat"><span class="bud-cat-icon">${cat.icon}</span><span class="bud-cat-name">${esc(cat.name)}</span></div>
        <div class="bud-amounts">${fmt(spent)} <span style="font-size:11px;color:var(--muted)">${isZh ? '/' : 'of'} ${fmt(b.limit)}</span></div>
      </div>
      <div class="progress-bar"><div class="progress-fill ${over?'danger':pct>75?'warn':''}" style="width:${pct}%"></div></div>
      <div class="bud-sub ${over?'over':''}">
        <span>${over ? (isZh ? `⚠️ 超支 ${fmt(spent-b.limit)}` : `Over budget by ${fmt(spent-b.limit)}`) : (isZh ? `剩余 ${fmt(b.limit-spent)}` : `${fmt(b.limit-spent)} left`)}</span>
        <span>${pct}%</span>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:8px">
        <button class="del-btn" style="font-size:11px;color:var(--red);background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:3px 8px;cursor:pointer" onclick="delBudget('${b.category}')">🗑 ${isZh ? '删除' : 'Delete'}</button>
      </div>
    `;
    list.appendChild(div);
  });
}
function delBudget(cat){
  if(confirm('Delete budget?')){S.budgets=S.budgets.filter(b=>b.category!==cat);save();renderBudgets();renderBudPreview();toast('Budget removed');}
}

// ── RENDER: GOALS ──────────────────────────────────────
function renderGoals(){
  const list=el('goals-list'), empty=el('empty-goals');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.goals.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  S.goals.forEach(g=>{
    const pct=Math.min(Math.round(((g.saved||0)/g.target)*100),100);
    const div=document.createElement('div'); div.className='goal-card';
    div.innerHTML=`
      <div class="goal-top">
        <div class="goal-ico">${g.icon}</div>
        <div class="goal-info">
          <div class="goal-name">${esc(g.name)}</div>
          <div class="goal-target">${isZh ? '已存' : 'Saved'} ${fmt(g.saved||0)} ${isZh ? '/' : 'of'} ${fmt(g.target)}${g.deadline ? (isZh ? ` · 截止: ${g.deadline}` : ` · Due: ${g.deadline}`) : ''}</div>
        </div>
        <div class="goal-pct">${pct}%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-actions">
        <button class="goal-btn" onclick="openDepositModal('${g.id}')">➕ ${isZh ? '存入' : 'Deposit'}</button>
        <button class="del-btn" style="padding:6px 10px;border-radius:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:var(--red);font-size:12px;cursor:pointer" onclick="delGoal('${g.id}')">🗑</button>
      </div>
    `;
    list.appendChild(div);
  });
}
function delGoal(id){
  if(confirm('Delete goal?')){S.goals=S.goals.filter(g=>g.id!==id);save();renderGoals();toast('Goal deleted');}
}

// ── RENDER: REMINDERS ──────────────────────────────────
function renderReminders(){
  const list=el('reminders-list'), empty=el('empty-reminders');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.reminders.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const active=S.reminders.filter(r=>!r.paid).sort((a,b)=>a.date.localeCompare(b.date));
  const paid=S.reminders.filter(r=>r.paid);
  if(active.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '待支付提醒 (UPCOMING)' : 'UPCOMING';list.appendChild(h);
    active.forEach(r=>list.appendChild(makeRemEl(r)));
  }
  if(paid.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '已完成支付 (PAID)' : 'PAID';list.appendChild(h);
    paid.forEach(r=>list.appendChild(makeRemEl(r)));
  }
}
function makeRemEl(r){
  const cat=catInfo('expense',r.category||'bills');
  const d=new Date(r.date+'T00:00:00');
  const overdue=!r.paid&&d<new Date();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  const div=document.createElement('div'); div.className='rem-item'; div.style.opacity=r.paid?'0.55':'1';
  div.innerHTML=`
    <div class="rem-icon" style="background:${overdue?'rgba(239,68,68,.12)':'rgba(245,158,11,.1)'}">${cat.icon}</div>
    <div class="rem-info" style="flex:1">
      <div class="rem-name">${esc(r.name)}</div>
      <div class="rem-date" style="color:${overdue?'#ef4444':'var(--muted)'}">
        ${overdue ? (isZh ? '⚠️ 已逾期 — ' : '⚠️ Overdue — ') : ''}${d.toLocaleDateString(localeStr,{month:'short',day:'numeric',year:'numeric'})}
      </div>
      ${!r.paid ? `<div class="rem-actions"><button class="paid-btn" type="button">✓ ${isZh ? '标记已付' : 'Mark Paid'}</button><button class="del-btn" type="button">🗑</button></div>` : `<span style="font-size:11px;color:var(--green)">✓ ${isZh ? '已支付' : 'Paid'}</span>`}
    </div>
    <div class="rem-amt">${fmt(r.amount)}</div>
  `;
  const pBtn=div.querySelector('.paid-btn');
  if(pBtn) pBtn.onclick=()=>payReminder(r.id);
  const dBtn=div.querySelector('.del-btn');
  if(dBtn) dBtn.onclick=()=>delReminder(r.id);
  return div;
}
function payReminder(id){
  const r=S.reminders.find(x=>x.id===id); if(!r) return;
  r.paid=true;
  S.transactions.unshift({
    id: uid('paid'),
    type:'expense',
    amount:Number(r.amount)||0,
    desc:r.name,
    category:r.category||'bills',
    date:today(),
    paymentMethod:'Online Banking (FPX)',
    note:'From reminder',
    accountId:'default',
    createdAt:new Date().toISOString()
  });
  save();renderAll();toast('✅ '+r.name+' marked as paid');
}
function delReminder(id){S.reminders=S.reminders.filter(r=>r.id!==id);save();renderReminders();renderDueSoon();toast('Reminder removed');}

// ── RENDER: RECURRING ──────────────────────────────────
function renderRecurring(){
  const list=el('rec-list'), empty=el('empty-recurring');
  if(!list) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  list.innerHTML='';
  if(!S.recurring.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const tStr = today();
  S.recurring.forEach(r=>{
    const cat=catInfo(r.type,r.category);
    const isDue = r.nextDue && r.nextDue <= tStr;
    const freqLabels = {
      daily: isZh ? '每天' : 'Daily',
      weekly: isZh ? '每周' : 'Weekly',
      monthly: isZh ? '每月' : 'Monthly',
      yearly: isZh ? '每年' : 'Yearly'
    };
    const freqTxt = freqLabels[r.freq] || r.freq;
    const div=document.createElement('div'); div.className='rec-item';
    div.innerHTML=`
      <div class="rec-icon" style="background:${r.type==='income'?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'}">${cat.icon}</div>
      <div class="rec-info" style="flex:1">
        <div class="rec-name">${esc(r.desc)}</div>
        <div class="rec-sub">${freqTxt}${r.nextDue ? (isZh ? ` · 下次: ${r.nextDue}` : ` · Next: ${r.nextDue}`) : ''} ${isDue ? (isZh ? '· <span style="color:#ef4444;font-weight:700">待扣款</span>' : '· <span style="color:#ef4444;font-weight:700">DUE</span>') : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        ${isDue ? `<button class="settle-btn rec-complete-btn" type="button" style="padding:5px 10px;font-size:11px;background:var(--amber);color:#4e342e;font-weight:800;border-radius:12px">${isZh ? '入账 ✓' : 'Complete ✓'}</button>` : ''}
        <div class="rec-amt ${r.type}">${r.type==='income'?'+':'-'}${fmt(r.amount)}</div>
        <button class="del-btn" type="button">🗑</button>
      </div>
    `;
    const compBtn = div.querySelector('.rec-complete-btn');
    if(compBtn) compBtn.onclick = () => confirmRecurring(r.id);
    div.querySelector('.del-btn').onclick=()=>delRec(r.id);
    list.appendChild(div);
  });
}
function delRec(id){S.recurring=S.recurring.filter(r=>r.id!==id);save();renderRecurring();toast('Recurring removed');}

// ── RENDER: DEBTS ──────────────────────────────────────
function renderDebts(){
  const list=el('debts-list'), empty=el('empty-debts');
  const sumEl=el('debt-summary');
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tOwe=S.debts.filter(d=>d.dir==='owe'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  const tLent=S.debts.filter(d=>d.dir==='lent'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  if(sumEl) {
    sumEl.innerHTML=`<div class="ds-card ds-owe"><div class="ds-label">${isZh ? '我欠别人 (应还)' : 'I Owe'}</div><div class="ds-val">${fmt(tOwe)}</div></div><div class="ds-card ds-lent"><div class="ds-label">${isZh ? '别人欠我 (应收)' : 'Owed to Me'}</div><div class="ds-val">${fmt(tLent)}</div></div>`;
  }
  if(!list) return;
  list.innerHTML='';
  if(!S.debts.length){if(empty) empty.classList.remove('hidden');return;}
  if(empty) empty.classList.add('hidden');
  const active=S.debts.filter(d=>!d.settled).sort((a,b)=>(a.due||'z').localeCompare(b.due||'z'));
  const settled=S.debts.filter(d=>d.settled);
  if(active.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '待结清 (ACTIVE)' : 'ACTIVE';list.appendChild(h);
    active.forEach(d=>list.appendChild(makeDebtEl(d)));
  }
  if(settled.length){
    const h=document.createElement('div');h.className='date-group';h.textContent=isZh ? '已结清 (SETTLED)' : 'SETTLED';list.appendChild(h);
    settled.forEach(d=>list.appendChild(makeDebtEl(d)));
  }
}
function makeDebtEl(d){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const div=document.createElement('div'); div.className='debt-item'; div.style.opacity=d.settled?'0.55':'1';
  const tagLabel = d.dir==='owe' ? (isZh ? '我欠别人' : 'I Owe') : (isZh ? '别人欠我' : 'Owed to Me');
  div.innerHTML=`
    <div class="debt-tag ${d.dir==='owe'?'owe-tag':'lent-tag'}">${tagLabel}</div>
    <div class="debt-info">
      <div class="debt-person">${esc(d.person)}</div>
      ${d.note ? `<div class="debt-note">${esc(d.note)}</div>` : ''}
      ${d.due ? `<div class="debt-due">${isZh ? '应还日期: ' : 'Due: '}${d.due}</div>` : ''}
    </div>
    <div class="debt-right">
      <div class="debt-amt" style="color:${d.dir==='owe'?'#ef4444':'#10b981'}">${fmt(d.remaining)}</div>
      <div style="display:flex;gap:4px;margin-top:4px">
        ${!d.settled ? `<button class="settle-btn" type="button">${isZh ? '结清 ✓' : 'Settle ✓'}</button>` : `<span style="font-size:11px;color:var(--green)">✓ ${isZh ? '已结清' : 'Settled'}</span>`}
      </div>
      <button class="del-btn" type="button" style="margin-top:4px;display:block">✕</button>
    </div>
  `;
  const sBtn=div.querySelector('.settle-btn');
  if(sBtn) sBtn.onclick=()=>settleDebt(d.id);
  const dBtn=div.querySelector('.del-btn');
  if(dBtn) dBtn.onclick=()=>delDebt(d.id);
  return div;
}
function settleDebt(id){const d=S.debts.find(x=>x.id===id);if(d){d.settled=true;d.remaining=0;save();renderDebts();toast('Debt settled! 🎉');}}
function delDebt(id){if(confirm('Remove debt?')){S.debts=S.debts.filter(x=>x.id!==id);save();renderDebts();toast('Debt removed');}}

// ── RENDER: ACCOUNTS PAGE (MALAYSIAN BANKS & WALLETS) ──
function renderAccounts(){}

function addQuickAmt(delta){
  const inp=el('tx-amount');
  const val = (parseFloat(inp.value)||0) + delta;
  inp.value = val.toFixed(2);
}

function updateTimeSuggestions(){
  const hr = new Date().getHours();
  const inp = el('tx-desc');
  if(!inp) return;
  if(txType === 'income'){
    inp.placeholder = 'e.g. Monthly Salary, Freelance project, Investment dividend…';
  } else {
    if(hr < 11) inp.placeholder = "e.g. Breakfast, Kopi & Toast, Roti Canai…";
    else if(hr < 14) inp.placeholder = "e.g. Lunch, Nasi Lemak, Mixed Rice, Mamak…";
    else if(hr < 17) inp.placeholder = "e.g. Tea break, Coffee, GrabCar, Snack…";
    else inp.placeholder = "e.g. Dinner, Groceries, Shell Petrol, Shopee…";
  }
}

function setTxAccount(accId){
  const sel = el('tx-acc-select');
  if(sel) sel.value = accId;
  
  const wrap = el('tx-acc-visual');
  if(wrap){
    wrap.querySelectorAll('.acc-v-card').forEach(c=>{
      c.classList.toggle('on', c.dataset.accId === accId);
    });
  }

  const acc = S.accounts.find(a=>a.id===accId);
  if(acc){
    const lower = acc.name.toLowerCase();
    if(lower.includes('touch') || lower.includes('tng')){
      selectPaymentMethod("Touch 'n Go eWallet");
    } else if(lower.includes('maybank') || lower.includes('mae')){
      selectPaymentMethod('Maybank (MAE / QR)');
    } else if(lower.includes('grab')){
      selectPaymentMethod('GrabPay');
    } else if(lower.includes('shopee')){
      selectPaymentMethod('ShopeePay');
    } else if(acc.type === 'cash'){
      selectPaymentMethod('Cash');
    }
  }
}

function onTxAccSelectChange(accId){
  setTxAccount(accId);
}

function renderTxAccountVisual(){}

function renderPaymentMethods(){
  const grid = el('pay-methods-grid'); if(!grid) return;
  grid.innerHTML = '';
  const current = el('tx-paymethod-val')?.value || 'Cash (现金)';

  const PRIMARY_NAMES = [
    'Maybank (MAE / QR)',
    'Touch \'n Go eWallet',
    'GrabPay',
    'ShopeePay',
    'CIMB Bank (Octo)',
    'Public Bank (PBe)',
    'RHB Bank',
    'Hong Leong Bank',
    'Cash (现金)',
    'Credit Card',
    'Debit Card',
    'Online Banking (FPX / DuitNow)',
    'SPayLater / Atome / BNPL'
  ];

  const listToRender = showAllPayMethods ? PAYMENT_METHODS : PAYMENT_METHODS.filter(pm => PRIMARY_NAMES.includes(pm.name) || pm.name === current);

  listToRender.forEach(pm => {
    const isSel = (pm.name === current || (current.startsWith('Cash') && pm.name.startsWith('Cash')));
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'pay-method-pill' + (isSel ? ' on' : '');
    card.innerHTML = `<span class="pay-method-ico">${pm.icon}</span><span>${pm.name}</span>`;
    card.onclick = () => selectPaymentMethod(pm.name);
    grid.appendChild(card);
  });

  const moreBtn = el('pay-method-more-btn');
  if(moreBtn){
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    moreBtn.textContent = showAllPayMethods ? (isZh ? '收起 ▴' : 'Less ▴') : (isZh ? '更多银行 ▾' : 'All Banks ▾');
  }
}

function toggleAllPayMethods(){
  showAllPayMethods = !showAllPayMethods;
  renderPaymentMethods();
}

function selectPaymentMethod(name){
  // Normalize partial names to canonical PAYMENT_METHODS names
  const match = PAYMENT_METHODS.find(pm => pm.name === name || pm.name.startsWith(name) || pm.id === name);
  const canonical = match ? match.name : name;
  if(el('tx-paymethod-val')) el('tx-paymethod-val').value = canonical;
  renderPaymentMethods();
}

// ── ADD TRANSACTION (INCOME / EXPENSE) ─────────────────
const currentTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

function setTxCurrentTime(){
  if(el('tx-time')) el('tx-time').value = currentTimeStr();
}

function toggleTxAdvanceMode(){
  const chk = el('tx-is-advance');
  if(chk){
    chk.checked = !chk.checked;
    updateTxAdvanceVisibility();
  }
}

function updateTxAdvanceVisibility(){
  const chk = el('tx-is-advance');
  const det = el('tx-advance-details');
  if(!chk || !det) return;
  if(chk.checked){
    det.classList.remove('hidden');
    const inp = el('tx-advance-person');
    if(inp && !inp.value) inp.value = (typeof S !== 'undefined' && S && S.lang === 'zh') ? '公司报销' : 'Company Claim';
  } else {
    det.classList.add('hidden');
  }
}

function openTxModal(type = 'expense'){
  txType = type; selCat = null; selSubCat = null; showAllTxSubCats = false; photoData = null; currentOcrItems = [];
  editingTxId = null;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  el('tx-modal-title').textContent = type === 'income'
    ? (isZh ? '记录收入 (Add Income)' : 'Add Income')
    : (isZh ? '记录支出 (Add Expense)' : 'Add Expense');
  el('tx-amount').value = ''; el('tx-desc').value = ''; el('tx-note').value = ''; el('tx-date').value = today();
  if(el('tx-time')) el('tx-time').value = currentTimeStr();
  if(el('tx-location')) el('tx-location').value = '';
  el('photo-prev').classList.add('hidden'); el('photo-ph').classList.remove('hidden');
  
  if(!isEditingFromUpload){
    const hBack = el('tx-modal-header-back-btn');
    if(hBack) hBack.classList.add('hidden');
    if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.add('hidden');
  }

  // Reset advance state
  const advChk = el('tx-is-advance'); if(advChk) advChk.checked = false;
  const advDet = el('tx-advance-details'); if(advDet) advDet.classList.add('hidden');
  const advPerson = el('tx-advance-person'); if(advPerson) advPerson.value = '';
  const advStatus = el('tx-advance-status'); if(advStatus) advStatus.value = 'pending';

  txMoreOpen = false;
  showAllPayMethods = false;
  showAllCats = false;
  const panel = el('tx-more-panel'); if(panel) panel.classList.add('hidden');
  const chevron = el('tx-more-chevron'); if(chevron) chevron.textContent = '▾';
  const moreBtn = el('pay-method-more-btn'); if(moreBtn) moreBtn.textContent = 'More ▾';
  const catMoreBtn = el('cat-more-btn'); if(catMoreBtn) catMoreBtn.textContent = 'More ▾';

  el('tx-desc-label').textContent = isZh
    ? (type === 'income' ? '收入来源' : '消费名称 / 商户')
    : (type === 'income' ? 'Income Source' : 'Description');
  if(el('tx-paymethod-row')){
    if(type === 'income') el('tx-paymethod-row').classList.add('hidden');
    else el('tx-paymethod-row').classList.remove('hidden');
  }
  if(el('ocr-scan-btn')) el('ocr-scan-btn').classList.remove('hidden');

  updateTimeSuggestions();
  buildCats('tx-cats', type, id => selCat = id);
  renderPaymentMethods();

  openModal('tx-modal');
  setTimeout(() => el('tx-amount').focus(), 200);
  tryLocationSuggest();
}

function saveTx(){
  const amount = parseFloat(el('tx-amount').value);
  const desc = el('tx-desc').value.trim();
  const date = el('tx-date').value;
  const time = el('tx-time') ? el('tx-time').value : '';
  const payMethod = txType === 'income' ? 'Direct Deposit' : (el('tx-paymethod-val')?.value || 'Cash');
  const location = el('tx-location') ? el('tx-location').value.trim() : '';

  const isAdvance = (txType === 'expense' && el('tx-is-advance')) ? el('tx-is-advance').checked : false;
  const advancePerson = el('tx-advance-person') ? el('tx-advance-person').value.trim() : '';
  const advanceStatus = el('tx-advance-status') ? el('tx-advance-status').value : 'pending';

  if(!amount || amount <= 0){ toast('⚠️ Enter a valid amount'); return; }
  if(!desc){ toast('⚠️ Add a description'); return; }
  if(!selCat){ toast('⚠️ Pick a category'); return; }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const existingTx = editingTxId ? S.transactions.find(t => t.id === editingTxId) : null;
  const selectedAccId = (el('tx-acc-select')?.value) || existingTx?.accountId || S.lastUsedAccId || (S.accounts[0]?.id) || 'default';

  const newTx = {
    id: editingTxId || uid('item'),
    type: txType,
    amount,
    desc,
    category: selCat,
    subCategory: selSubCat || existingTx?.subCategory || null,
    date,
    time: time || null,
    accountId: selectedAccId,
    paymentMethod: payMethod,
    location: location || null,
    note: el('tx-note') ? el('tx-note').value.trim() : '',
    photo: photoData || existingTx?.photo || null,
    items: (currentOcrItems && currentOcrItems.length > 0) ? JSON.parse(JSON.stringify(currentOcrItems)) : (existingTx?.items || []),
    taxReliefCat: existingTx?.taxReliefCat || null,
    taxReliefAmount: existingTx?.taxReliefAmount || null,
    taxReliefReason: existingTx?.taxReliefReason || null,
    isAdvance: isAdvance || false,
    advance: isAdvance || false,
    advancePerson: isAdvance ? (advancePerson || (isZh ? '公司报销' : 'Company Claim')) : null,
    advanceDebtor: isAdvance ? (advancePerson || (isZh ? '公司报销' : 'Company Claim')) : null,
    advanceStatus: isAdvance ? advanceStatus : null,
    advanceReimbursed: isAdvance ? (advanceStatus === 'reimbursed') : false,
    createdAt: existingTx?.createdAt || new Date().toISOString()
  };

  if(isPeriodCareExpense(newTx)){
    newTx.subCategory = 'health_period_care';
  }

  // If editing, update in place; otherwise insert at beginning
  if(editingTxId){
    const idx = S.transactions.findIndex(t => t.id === editingTxId);
    if(idx !== -1){
      S.transactions[idx] = newTx;
    } else {
      S.transactions.unshift(newTx);
    }
    editingTxId = null;
  } else {
    S.transactions.unshift(newTx);
  }
  if(isEditingFromUpload){
    uniParsedData = null;
    uniImageDataUrl = null;
    isEditingFromUpload = false;
    if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.add('hidden');
  }
  if(date && date.length >= 7){
    const [tY, tM] = date.split('-');
    const parsedY = parseInt(tY, 10);
    const parsedM = parseInt(tM, 10) - 1;
    if(!isNaN(parsedY) && !isNaN(parsedM)){
      homeActiveYear = parsedY;
      homeActiveMonth = parsedM;
    }
  }
  save();
  renderAll();
  closeModal('tx-modal');
  toast(isZh ? `✅ ${txType==='income'?'收入已记录':'支出已记录'}: ${desc} (${fmt(amount)})` : `✅ ${txType==='income'?'Income':'Expense'} saved: ${desc} (${fmt(amount)})`);
  detectRecurringPattern(newTx);

  const aiAlert = getTxInstantAiAlert(newTx);
  if(aiAlert){
    setTimeout(() => toast(aiAlert, 4200), 1200);
  }
}

let aiScanInterval = null;
const AI_SCAN_MESSAGES = [
  { step: '🤖 Connecting to Google Gemini Vision AI', sub: 'Uploading encrypted image to multimodal neural engine' },
  { step: '🔍 Detecting Merchant, Store & Payee', sub: 'Recognizing brand logos and receipt headers' },
  { step: '💵 Reading Total Amount, SST & Rounding', sub: 'Analyzing payable total, 6% SST & 5-sen BNM rounding' },
  { step: '🛒 Extracting Itemized Dishes & Goods', sub: 'Categorizing expenses and formatting receipt items' },
  { step: '🇲🇾 Verifying LHDN Tax Relief Eligibility', sub: 'Checking lifestyle, medical, sports & education claim categories' }
];

function startAiScanAnimation(context = 'universal'){
  stopAiScanAnimation();
  let stepIdx = 0;

  if(context === 'universal'){
    const progBox = el('uni-progress-box');
    const laser = el('uni-scan-laser');
    const grid = el('uni-scan-grid');
    if(progBox) progBox.classList.remove('hidden');
    if(laser) laser.classList.remove('hidden');
    if(grid) grid.classList.remove('hidden');

    const updateUniversalScanUI = () => {
      const msg = AI_SCAN_MESSAGES[stepIdx % AI_SCAN_MESSAGES.length];
      const stepEl = el('uni-progress-step');
      const subEl = el('uni-progress-sub');
      if(stepEl) stepEl.innerHTML = `${msg.step}<span class="ai-dots"></span>`;
      if(subEl) subEl.textContent = msg.sub;
      stepIdx++;
    };
    updateUniversalScanUI();
    aiScanInterval = setInterval(updateUniversalScanUI, 900);
  } else if(context === 'tx'){
    const progBox = el('ocr-progress');
    const laser = el('tx-scan-laser');
    const grid = el('tx-scan-grid');
    if(progBox) progBox.classList.remove('hidden');
    if(laser) laser.classList.remove('hidden');
    if(grid) grid.classList.remove('hidden');

    const updateUI = () => {
      const msg = AI_SCAN_MESSAGES[stepIdx % AI_SCAN_MESSAGES.length];
      const stepEl = el('ocr-progress-step');
      const subEl = el('ocr-progress-sub');
      if(stepEl) stepEl.innerHTML = `${msg.step}<span class="ai-dots"></span>`;
      if(subEl) subEl.textContent = msg.sub;
      stepIdx++;
    };
    updateUI();
    aiScanInterval = setInterval(updateUI, 900);
  }
}

function stopAiScanAnimation(){
  if(aiScanInterval){
    clearInterval(aiScanInterval);
    aiScanInterval = null;
  }
  ['uni-progress-box', 'uni-scan-laser', 'uni-scan-grid', 'ocr-progress', 'tx-scan-laser', 'tx-scan-grid', 'splitter-ocr-progress', 'xfr-ocr-progress'].forEach(id => {
    const item = el(id);
    if(item) item.classList.add('hidden');
  });
}

async function handlePhoto(inp){
  const file = inp.files[0]; if(!file) return;
  const scanBtn = el('ocr-scan-btn');
  if(scanBtn) scanBtn.style.display = 'none';

  startAiScanAnimation('tx');

  try {
    const rawDataUrl = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.readAsDataURL(file);
    });

    const compressed = await compressReceiptForStorage(rawDataUrl);
    photoData = compressed;
    const prevEl = el('photo-prev');
    const phEl = el('photo-ph');
    if(prevEl){
      prevEl.src = photoData;
      prevEl.classList.remove('hidden');
    }
    if(phEl) phEl.classList.add('hidden');
    toggleTxMoreDetails(true);

    const result = await analyzeUnifiedUploadWithGemini(compressed);
    if(result && (result.amount > 0 || result.merchant)){
      applyReceiptStructuredData(result, 'AI');
      toast(`🤖 Auto-filled from receipt: ${result.merchant || 'Store'} · ${fmt(result.amount)}`);
    } else {
      toast('📷 Photo attached! Please check amount.');
    }
  } catch(err){
    console.warn('Photo handle notice:', err);
    toast('📷 Photo attached!');
  } finally {
    stopAiScanAnimation();
    if(scanBtn) scanBtn.style.display = 'flex';
  }
}

// ── 🤖 GOOGLE GEMINI VISION AI RECEIPT ANALYZER ───────
// Google retires and renames Gemini models regularly.  Do not rely on one
// hard-coded model: ask the API which models this particular key can use.
const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];
const geminiModelCache = new Map();

function geminiModelScore(name){
  const model = String(name || '').toLowerCase();
  let score = 0;
  if(model.includes('flash')) score += 60;
  if(model.includes('latest')) score += 20;
  if(model.includes('pro')) score += 12;
  if(model.includes('preview')) score -= 6;
  if(model.includes('exp') || model.includes('experimental')) score -= 10;
  if(/image|tts|live|transcribe|embedding|robotics|audio/.test(model)) score -= 80;
  const version = model.match(/gemini-(\d+)(?:\.(\d+))?/);
  if(version) score += Number(version[1]) * 10 + Number(version[2] || 0);
  return score;
}

async function getGeminiModelCandidates(apiKey){
  const key = String(apiKey || '').trim();
  if(!key || key.length < 8) return GEMINI_MODEL_FALLBACKS;

  const now = Date.now();
  const cached = geminiModelCache.get(key);
  if(cached && cached.expiresAt > now) return cached.models;

  let discovered = [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`, {
      headers: { 'x-goog-api-key': key }
    });
    if(res.ok){
      const body = await res.json();
      discovered = (body.models || [])
        .filter(model => {
          const actions = model.supportedGenerationMethods || model.supportedActions || [];
          return Array.isArray(actions) && actions.includes('generateContent');
        })
        .map(model => String(model.name || '').replace(/^models\//, ''))
        .filter(name => /^gemini-/i.test(name));
    }
  } catch(err){
    console.warn('Could not refresh Gemini model list; using safe fallbacks.', err);
  }

  // Prefer capable Flash models, but retain every discovered compatible model
  // as a fallback. This lets a newly released model work without an app update.
  const models = [...new Set([...discovered.sort((a,b) => geminiModelScore(b) - geminiModelScore(a)), ...GEMINI_MODEL_FALLBACKS])];
  geminiModelCache.set(key, { models, expiresAt: now + (discovered.length ? 60 * 60 * 1000 : 5 * 60 * 1000) });
  return models;
}

async function generateGeminiContent(apiKey, payload){
  const key = String(apiKey || '').trim();
  if(!key || key.length < 8){
    return { data: null, model: null, lastError: 'API key not configured' };
  }
  const models = await getGeminiModelCandidates(key);
  let lastError = '';
  for(const modelName of models){
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload)
      });
      if(res.ok) return { data: await res.json(), model: modelName, lastError: '' };
      const errBody = await res.json().catch(() => ({}));
      lastError = errBody?.error?.message || `HTTP ${res.status}`;
      // Only stop for an authentication failure. A 400/404 can simply mean a
      // model changed capabilities, in which case another discovered model may work.
      if(res.status === 401 || res.status === 403 || /api.?key.*(invalid|not valid)|invalid.*api.?key/i.test(lastError)) break;
    } catch(err){
      lastError = err?.message || String(err);
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
    statusBox.innerHTML = `<div style="color:var(--amber);font-size:12px;font-weight:700">⚡ ${isZh ? '正在连接 Google AI 进行测试…' : 'Connecting to Google AI…'}</div>`;
    statusBox.classList.remove('hidden');
  }

  geminiModelCache.delete(key);
  const probe = await generateGeminiContent(key, {
    contents: [{ parts: [{ text: 'Respond with OK' }] }]
  });
  const verifiedModel = probe.model;
  const lastErrorMsg = probe.lastError;

  if(verifiedModel){
    S.geminiApiKey = key;
    save();
    updateGeminiStatusUI();

    if(statusBox){
      statusBox.innerHTML = `<div style="color:var(--green);font-size:12.5px;font-weight:800">✅ ${isZh ? `连接成功！(已激活 ${verifiedModel})` : `Connection Successful! (Active: ${verifiedModel})`}</div>`;
    }
    toast(isZh ? '✅ Google Gemini API Key 验证并保存成功！' : '✅ Google Gemini API Key Verified & Saved!');
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
  if(key){
    toast(isZh ? '🤖 Google AI (Gemini Vision) API Key 已保存！' : '🤖 Google AI (Gemini Vision) connected successfully!');
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

  // Profile settings badge
  const svalBadge = el('gemini-status-badge');
  if(svalBadge){
    svalBadge.textContent = hasKey ? (isZh ? '已配置 ✓ ›' : 'Configured ✓ ›') : (isZh ? '未配置 ›' : 'Not Configured ›');
    svalBadge.style.color = hasKey ? 'var(--green)' : 'var(--amber)';
  }

  // More/Studio settings row
  const sval = el('sval-gemini');
  if(sval){
    sval.textContent = hasKey ? (isZh ? '已连接 ⚡ ›' : 'Connected ⚡ ›') : (isZh ? '点击配置 ⚡ ›' : 'Setup ⚡ ›');
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
      uniTxt.innerHTML = `<span style="color:var(--green)">${isZh ? 'Google AI 就绪' : 'Google AI Ready'}</span> <span style="font-size:10px;color:var(--muted)">(${masked})</span>`;
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
    }
  } catch(e){
    stopAiScanAnimation();
  }
}

// ── 📸 UNIVERSAL UNIFIED AI UPLOAD & EXPENSES HUB ───────
let uniCurrentMode = 'expense'; // 'expense' | 'splitter' | 'transfer' | 'tax' | 'recurring'
let uniCustomDate = '';
let uniParsedData = null;
let uniImageDataUrl = null;
let isEditingFromUpload = false;

function handleUniversalUploadBack(){
  if(uniParsedData || uniImageDataUrl){
    uniParsedData = null;
    uniImageDataUrl = null;
    photoData = null;
    isEditingFromUpload = false;

    // Reset Dropzone & Preview UI
    const fileInp = el('uni-file-inp');
    if(fileInp) fileInp.value = '';
    const imgPrev = el('uni-img-preview');
    if(imgPrev){ imgPrev.src = ''; imgPrev.classList.add('hidden'); }
    const placeholder = el('uni-upload-placeholder');
    if(placeholder) placeholder.classList.remove('hidden');
    const badgeWrap = el('uni-detected-badge-wrap');
    if(badgeWrap) badgeWrap.classList.add('hidden');
    const actionBtns = el('uni-action-btns');
    if(actionBtns) actionBtns.classList.add('hidden');
    const hBack = el('uni-header-back-btn');
    if(hBack) hBack.classList.add('hidden');

    renderUniversalPreview();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? '📸 请选择新小票照片' : '📸 Ready to upload new receipt photo');
  } else {
    closeModal('universal-upload-modal');
  }
}

function openUniversalUpload(preferredMode = 'auto', customDate = '', forceNew = false){
  uniCurrentMode = preferredMode === 'auto' ? 'expense' : preferredMode;
  if(customDate) uniCustomDate = customDate;

  // If we already have parsed receipt data and user didn't ask for a forced re-scan, show it!
  if(!forceNew && uniParsedData){
    renderUniversalPreview();
    openModal('universal-upload-modal');
    if(el('uni-action-btns')) el('uni-action-btns').classList.remove('hidden');
    if(el('uni-detected-badge-wrap')) el('uni-detected-badge-wrap').classList.remove('hidden');
    if(el('uni-header-back-btn')) el('uni-header-back-btn').classList.remove('hidden');
    const imgPrev = el('uni-img-preview');
    if(imgPrev && uniImageDataUrl){
      imgPrev.src = uniImageDataUrl;
      imgPrev.classList.remove('hidden');
    }
    if(el('uni-upload-placeholder')) el('uni-upload-placeholder').classList.add('hidden');
    return;
  }

  uniParsedData = null;
  uniImageDataUrl = null;

  // Reset UI
  if(el('uni-file-inp')) el('uni-file-inp').value = '';
  if(el('uni-upload-placeholder')) el('uni-upload-placeholder').classList.remove('hidden');
  const imgPrev = el('uni-img-preview');
  if(imgPrev){
    imgPrev.src = '';
    imgPrev.classList.add('hidden');
  }
  stopAiScanAnimation();
  if(el('uni-detected-badge-wrap')) el('uni-detected-badge-wrap').classList.add('hidden');
  if(el('uni-action-btns')) el('uni-action-btns').classList.add('hidden');
  if(el('uni-header-back-btn')) el('uni-header-back-btn').classList.add('hidden');

  setUniversalMode(uniCurrentMode, false);
  renderUniversalPreview();

  openModal('universal-upload-modal');

  // Trigger file picker after a tiny delay for immediate convenience
  setTimeout(() => {
    if(!uniImageDataUrl && el('uni-file-inp')){
      el('uni-file-inp').click();
    }
  }, 250);
}

function setUniversalMode(mode, reRender = true){
  uniCurrentMode = (mode === 'splitter') ? 'splitter' : 'expense';
  ['expense', 'splitter'].forEach(m => {
    const btn = el(`uni-mode-${m}-btn`);
    if(btn){
      if(m === uniCurrentMode) btn.classList.add('on');
      else btn.classList.remove('on');
    }
  });

  const confirmBtn = el('uni-confirm-btn');
  if(confirmBtn){
    if(uniCurrentMode === 'splitter'){
      confirmBtn.innerHTML = `<span>👥 Apply to Meal Splitter</span>`;
    } else {
      confirmBtn.innerHTML = `<span>✅ Confirm & Save Expense</span>`;
    }
  }

  if(reRender) renderUniversalPreview();
}


// ── 🧠 SMART AI AUTO-DETECTION ENGINE (CATEGORIES & MALAYSIAN BANKS) ──
function smartAutoDetectCategoryAndPayment(text){
  if(!text || typeof text !== 'string') return null;
  const s = text.toLowerCase();
  
  let detectedCat = null;
  let detectedSubCat = null;
  let detectedPayment = null;
  let confidence = 'high';

  // 1. PET CARE (Prioritized before food so 'cat food' / 'dog food' isn't misclassified)
  if(/\b(pet|pets|cat|dog|kitten|puppy|vet|veterinary)\b|pet\s*shop|pet\s*food|cat\s*food|dog\s*food|royal\s*canin|whiskas|smartheart|pet\s*grooming|cat\s*litter|pet\s*supplies|猫粮|狗粮|宠物|兽医|猫砂|宠物洗澡/i.test(s)){
    detectedCat = 'pets';
    if(/vet|veterinary|grooming|兽医|洗澡/i.test(s)) detectedSubCat = 'pet_vet_care';
    else detectedSubCat = 'pet_food_supplies';
  }

  // 2. PERIOD CARE & FEMININE HYGIENE
  else if(/laurier|kotex|sofy|whisper|carefree|sanitary\s*pad|tampon|menstrual|panty\s*liner|pantyliner|midol|panadol\s*menstrual|cramp\s*patch|warm\s*patch|heating\s*pad|period\s*care|feminine\s*wash|lactacyd|betadine\s*feminine|卫生棉|卫生巾|经期|暖宫贴|月经|护垫|女性护理/i.test(s)){
    detectedCat = 'period_care';
    if(/pad|pantyliner|liner|卫生棉|卫生巾|护垫/i.test(s)) detectedSubCat = 'period_sanitary_pads';
    else if(/tampon|menstrual\s*cup|棉条/i.test(s)) detectedSubCat = 'period_tampons_cup';
    else if(/midol|panadol|cramp|warm\s*patch|heating|暖宫|止痛/i.test(s)) detectedSubCat = 'period_pain_relief';
    else detectedSubCat = 'period_intimate_care';
  }

  // 3. DRINKS & COFFEE / BOBA / BEVERAGES
  else if(/starbucks|zus\s*coffee|\bzus\b|gigi\s*coffee|chagee|tealive|mixue|\bkoi\b|the\s*alley|chatime|gong\s*cha|boba|bubble\s*tea|coffee|\bkopi\b|teh\s*tarik|teh\s*o|teh\s*c|\bteh\b|latte|cappuccino|americano|espresso|matcha|mocha|liho|richiamo|san\s*francisco\s*coffee|kenangan|luckin|tiger\s*sugar|xing\s*fu\s*tang|boost\s*juice|coconut\s*shake|smoothie|juice|milo|horlicks|sirap|coke|pepsi|100plus|beer|wine|whiskey|\bbar\b|\bpub\b|\bdrink\b|\bdrinks\b|beverage|奶茶|咖啡|星巴克|霸王茶姬|蜜雪冰城|饮料|果汁|喜茶|茶救星球|生椰拿铁|美式|拿铁|珍珠奶茶|可乐|啤酒|红酒/i.test(s)){
    detectedCat = 'drinks';
    if(/coffee|kopi|latte|cappuccino|americano|espresso|mocha|starbucks|zus|gigi|richiamo|kenangan|咖啡|美式|拿铁/i.test(s)){
      detectedSubCat = 'drinks_coffee_cafe';
    } else if(/boba|bubble\s*tea|chagee|tealive|mixue|koi|the\s*alley|chatime|gong\s*cha|liho|tiger\s*sugar|xing\s*fu\s*tang|奶茶|喜茶|珍珠奶茶|手摇/i.test(s)){
      detectedSubCat = 'drinks_boba_tea';
    } else if(/juice|smoothie|boost\s*juice|coconut\s*shake|果汁|果昔/i.test(s)){
      detectedSubCat = 'drinks_juice_smoothie';
    } else if(/beer|wine|whiskey|\bbar\b|\bpub\b|alcohol|啤酒|红酒|酒吧/i.test(s)){
      detectedSubCat = 'drinks_alcohol_bar';
    } else {
      detectedSubCat = 'drinks_tea_teh';
    }
  }

  // 4. PETROL & FUEL
  else if(/petronas|shell|caltex|bhppetrol|\bbhp\b|petron|ron95|ron97|diesel|petrol|\bfuel\b|gasoline|setel|minyak|汽油|加油|柴油/i.test(s)){
    detectedCat = 'fuel';
    detectedSubCat = 'trans_petrol_fuel';
  }

  // 5. TOLL & PARKING
  else if(/\btoll\b|\brfid\b|tng\s*rfid|plus\s*highway|ldp|smart\s*tunnel|mex\s*highway|kesas|\bduke\b|sprint|parking|valet|autopay|touch\s*'?n\s*go\s*card|过路费|停車費|停车费|泊车/i.test(s)){
    detectedCat = 'toll_parking';
    if(/parking|valet|autopay|停车|泊车/i.test(s)) detectedSubCat = 'trans_parking';
    else detectedSubCat = 'trans_toll_rfid';
  }

  // 6. PUBLIC TRANSIT & E-HAILING
  else if(/\bgrab\b|grab\s*car|grabcar|grab\s*ride|airasia\s*ride|indrive|maxim|taxi|\bcab\b|lrt|mrt|monorail|rapid\s*kl|rapidkl|ktm|ktmb|ets|\bbus\b|\bbas\b|flight|airasia|malaysia\s*airlines|\bmas\b|scoot|batik\s*air|klia\s*ekspres|打车|电召车|地铁|轻快铁|巴士|飞机票|机票/i.test(s)){
    detectedCat = 'transport';
    if(/grab|airasia\s*ride|indrive|maxim|taxi|打车|电召车/i.test(s)) detectedSubCat = 'trans_ridehailing';
    else if(/flight|airasia|malaysia\s*airlines|mas|scoot|batik|飞机|机票/i.test(s)) detectedSubCat = 'trans_flights_trips';
    else detectedSubCat = 'trans_public_transit';
  }

  // 7. GROCERIES & SUPERMARKET / CONVENIENCE
  else if(/lotus|tesco|99\s*speedmart|speedmart|jaya\s*grocer|village\s*grocer|giant|econsave|nsk|hero\s*market|heromarket|aeon\s*big|aeon\s*supermarket|don\s*don\s*donki|donki|supermarket|hypermarket|grocery|groceries|pasar|fresh\s*market|vegetable|fruit|meat|egg|eggs|milk|familymart|family\s*mart|7-eleven|7\s*eleven|7-11|kk\s*mart|cu\s*mart|emart24|mynews|超市|菜市|生鲜|蔬菜|水果|鸡蛋|牛奶|全家|711|便利店/i.test(s)){
    detectedCat = 'groceries';
    if(/familymart|7-eleven|7\s*eleven|7-11|kk\s*mart|cu\s*mart|emart24|mynews|便利店|全家/i.test(s)){
      detectedSubCat = 'groc_convenience';
    } else if(/vegetable|fruit|meat|pasar|生鲜|蔬菜|水果/i.test(s)){
      detectedSubCat = 'groc_fresh_produce';
    } else {
      detectedSubCat = 'groc_supermarket';
    }
  }

  // 8. FOOD & DINING
  else if(/mcdonald|\bmcd\b|\bkfc\b|texas\s*chicken|marrybrown|burger\s*king|a&w|subway|pizza\s*hut|domino|haidilao|din\s*tai\s*fung|sushi|nasi\s*lemak|roti\s*canai|mamak|hawker|kopitiam|restaurant|food\s*court|lunch|dinner|breakfast|supper|brunch|noodle|rice|bakery|bread|rotiboy|lavender|komugi|breadtalk|paris\s*baguette|toast\s*box|oriental\s*kopi|pappa\s*rich|oldtown|foodpanda|grabfood|shopeefood|ramen|udon|dim\s*sum|hotpot|bbq|steak|chicken\s*rice|char\s*kway\s*teow|laksa|curry\s*mee|mee\s*goreng|nasi\s*goreng|wan\s*tan\s*mee|pan\s*mee|bak\s*kut\s*teh|satay|durian|dessert|waffle|ice\s*cream|baskin\s*robbins|inside\s*scoop|llaollao|meal|snack|burger|午餐|晚餐|早餐|夜宵|饭|面|餐厅|小吃|麦当劳|肯德基|海底捞|鼎泰丰|寿司|火锅|面包|烘焙|甜品|冰淇淋|肉骨茶|炒粿条|点心|烧烤|外卖/i.test(s)){
    detectedCat = 'food';
    if(/mcdonald|mcd|kfc|texas|marrybrown|burger|a&w|subway|pizza|domino|快餐|汉堡/i.test(s)){
      detectedSubCat = 'food_fastfood';
    } else if(/mamak|hawker|kopitiam|nasi\s*lemak|roti\s*canai|档口|嘛嘛档|茶餐室/i.test(s)){
      detectedSubCat = 'food_hawker_mamak';
    } else if(/bakery|bread|rotiboy|lavender|komugi|breadtalk|paris\s*baguette|面包|烘焙/i.test(s)){
      detectedSubCat = 'food_bakery_pastry';
    } else if(/foodpanda|grabfood|shopeefood|外卖/i.test(s)){
      detectedSubCat = 'food_delivery';
    } else if(/dessert|waffle|ice\s*cream|baskin|inside\s*scoop|llaollao|甜品|冰淇淋/i.test(s)){
      detectedSubCat = 'food_dessert_snack';
    } else {
      detectedSubCat = 'food_restaurant';
    }
  }

  // 9. BEAUTY & SKINCARE
  else if(/sephora|innisfree|laneige|the\s*ordinary|skincare|cosmetics|makeup|lipstick|sunscreen|serum|facial|hair\s*salon|haircut|barber|manicure|pedicure|nail\s*salon|spa|massage|护肤品|化妆品|美发|理发|剪发|美甲|按摩|水疗|口红|防晒霜|面膜/i.test(s)){
    detectedCat = 'beauty';
    if(/hair|barber|salon|理发|美发|剪发/i.test(s)) detectedSubCat = 'beauty_hair_salon';
    else if(/nail|spa|massage|美甲|按摩|水疗/i.test(s)) detectedSubCat = 'beauty_spa_nails';
    else detectedSubCat = 'beauty_skincare_cosmetics';
  }

  // 10. HEALTHCARE & PHARMACY
  else if(/watsons|guardian|caring\s*pharmacy|big\s*pharmacy|alpro|aa\s*pharmacy|pharmacy|clinic|klinik|poliklinik|doctor|hospital|dental|dentist|teeth|optical|focus\s*point|owndays|woosh|mog|glasses|contact\s*lens|panadol|medicine|supplement|vitamin|blackmores|swisse|gym|fitness\s*first|celebrity\s*fitness|anytime\s*fitness|药房|诊所|医生|医院|看病|牙医|配眼镜|隐形眼镜|维生素|保健品|健身房/i.test(s)){
    detectedCat = 'health';
    if(/watsons|guardian|caring|big\s*pharmacy|alpro|pharmacy|medicine|panadol|药房|药/i.test(s)) detectedSubCat = 'health_pharmacy_rx';
    else if(/clinic|klinik|doctor|hospital|诊所|医院|看病/i.test(s)) detectedSubCat = 'health_clinic_doctor';
    else if(/dental|dentist|teeth|optical|glasses|lens|牙医|眼镜/i.test(s)) detectedSubCat = 'health_dental_vision';
    else if(/vitamin|supplement|blackmores|swisse|维生素|保健品/i.test(s)) detectedSubCat = 'health_vitamins_supp';
    else detectedSubCat = 'health_gym_fitness';
  }

  // 11. BILLS & UTILITIES
  else if(/tnb|tenaga\s*nasional|air\s*selangor|\bsaj\b|\bpba\b|maxis|celcom|\bdigi\b|celcomdigi|u\s*mobile|umobile|yes\s*5g|hotlink|unifi|time\s*dotcom|time\s*internet|astro|indah\s*water|iwk|netflix|spotify|youtube\s*premium|icloud|chatgpt|electric\s*bill|water\s*bill|wifi\s*bill|telco\s*bill|insurance|great\s*eastern|prudential|allianz|aia|etiqa|zurich|电费|水费|话费|宽带|保费|保险|账单|订阅/i.test(s)){
    detectedCat = 'bills';
    if(/tnb|tenaga|air\s*selangor|saj|pba|电费|水费/i.test(s)) detectedSubCat = 'bill_electricity_water';
    else if(/maxis|celcom|digi|u\s*mobile|hotlink|话费/i.test(s)) detectedSubCat = 'bill_mobile_telco';
    else if(/unifi|time\s*dotcom|time\s*internet|astro|宽带/i.test(s)) detectedSubCat = 'bill_home_wifi';
    else if(/netflix|spotify|youtube|icloud|chatgpt|订阅/i.test(s)) detectedSubCat = 'bill_subscriptions';
    else detectedSubCat = 'bill_insurance';
  }

  // 12. SHOPPING & RETAIL
  else if(/shopee|lazada|tiktok\s*shop|taobao|uniqlo|zara|h&m|cotton\s*on|padini|brands\s*outlet|jd\s*sports|foot\s*locker|nike|adidas|puma|charles\s*&\s*keith|apple\s*store|switch|machines|samsung|xiaomi|harvey\s*norman|senheng|ikea|nitori|mr\s*diy|mr\.diy|kaison|daiso|muji|clothes|shirt|pants|shoes|bag|gadget|phone|laptop|furniture|淘宝|优衣库|买衣服|网购|鞋子|包包|手机|电脑|宜家/i.test(s)){
    detectedCat = 'shopping';
    if(/uniqlo|zara|h&m|padini|cotton\s*on|nike|adidas|puma|clothes|shirt|pants|shoes|bag|衣服|鞋/i.test(s)) detectedSubCat = 'shop_clothing_apparel';
    else if(/apple|switch|machines|samsung|xiaomi|phone|laptop|gadget|手机|电脑|数码/i.test(s)) detectedSubCat = 'shop_electronics_tech';
    else if(/ikea|nitori|mr\s*diy|mr\.diy|kaison|daiso|furniture|宜家|家居/i.test(s)) detectedSubCat = 'shop_home_furniture';
    else detectedSubCat = 'shop_online_marketplace';
  }

  // 13. EDUCATION & BOOKS
  else if(/tuition|school\s*fee|university|college|course|udemy|coursera|exam|stationery|book|books|popular\s*bookstore|kinokuniya|mph|学费|补习|考卷|文具|书本|课程/i.test(s)){
    detectedCat = 'education';
    if(/tuition|course|udemy|coursera|exam|学费|补习|课程/i.test(s)) detectedSubCat = 'edu_courses_tuition';
    else detectedSubCat = 'edu_books_reading';
  }

  // 14. ENTERTAINMENT & CINEMA
  else if(/cinema|movie|gsc|tgv|mbo|dadi\s*cinema|concert|ticket|ktv|karaoke|steam|playstation|ps5|nintendo|switch\s*game|genshin|boardgame|badminton|futsal|theme\s*park|sunway\s*lagoon|genting|电影|演唱会|唱歌|游戏|羽毛球|游乐园/i.test(s)){
    detectedCat = 'entertainment';
    if(/cinema|movie|gsc|tgv|mbo|dadi|电影/i.test(s)) detectedSubCat = 'ent_movies_cinema';
    else if(/steam|playstation|ps5|nintendo|game|游戏/i.test(s)) detectedSubCat = 'ent_gaming_hobbies';
    else if(/concert|ticket|event|演唱会|展览/i.test(s)) detectedSubCat = 'ent_events_concerts';
    else detectedSubCat = 'ent_sports_activities';
  }

  // 15. RENT & HOUSING
  else if(/rent|rental|sewa|mortgage|housing\s*loan|maintenance\s*fee|condo\s*fee|cukai\s*tanah|cukai\s*pintu|renovation|plumber|aircond\s*service|房租|房贷|物业费|管理费|房屋装修/i.test(s)){
    detectedCat = 'rent_housing';
    if(/rent|sewa|房租/i.test(s)) detectedSubCat = 'home_rent';
    else if(/mortgage|loan|房贷/i.test(s)) detectedSubCat = 'home_mortgage';
    else if(/maintenance|condo|物业|管理费/i.test(s)) detectedSubCat = 'home_condo_fees';
    else detectedSubCat = 'home_repairs';
  }

  // 16. GIFTS & DONATIONS
  else if(/gift|present|birthday\s*gift|ang\s*pao|angpao|red\s*packet|duit\s*raya|flower|florist|donation|charity|derma|sedekah|红包|礼物|鲜花|捐款|慈善/i.test(s)){
    detectedCat = 'donation';
    if(/charity|donation|derma|sedekah|捐款|慈善/i.test(s)) detectedSubCat = 'gift_charity_ngo';
    else detectedSubCat = 'gift_presents_angpao';
  }

  // ── MALAYSIAN BANK & PAYMENT METHOD AUTO-DETECTION ──
  if(/maybank|mae|mbb|qrpay|maybank2u|m2u/i.test(s)){
    detectedPayment = 'Maybank (MAE / QR)';
  } else if(/tng|touch\s*'?n\s*go|tng\s*ewallet|tng\s*qr|touch\s*n\s*go\s*ewallet|\brfid\b/i.test(s)){
    detectedPayment = "Touch 'n Go eWallet";
  } else if(/grabpay|grab\s*pay|grab\s*wallet|\bgrab\b/i.test(s)){
    detectedPayment = 'GrabPay';
  } else if(/shopeepay|shopee\s*pay/i.test(s)){
    detectedPayment = 'ShopeePay';
  } else if(/cimb|cimb\s*clicks|octo/i.test(s)){
    detectedPayment = 'CIMB Bank (Octo)';
  } else if(/public\s*bank|\bpbe\b|\bpbb\b|pb\s*engage/i.test(s)){
    detectedPayment = 'Public Bank (PBe)';
  } else if(/\brhb\b|rhb\s*now/i.test(s)){
    detectedPayment = 'RHB Bank';
  } else if(/hong\s*leong|\bhlb\b|hlb\s*connect/i.test(s)){
    detectedPayment = 'Hong Leong Bank';
  } else if(/ambank|amonline/i.test(s)){
    detectedPayment = 'AmBank';
  } else if(/bank\s*islam|bimb/i.test(s)){
    detectedPayment = 'Bank Islam';
  } else if(/bank\s*rakyat|irakyat/i.test(s)){
    detectedPayment = 'Bank Rakyat';
  } else if(/\bbsn\b|bank\s*simpanan/i.test(s)){
    detectedPayment = 'BSN Bank';
  } else if(/gxbank|gx\s*bank|gx\s*card/i.test(s)){
    detectedPayment = 'GXBank (Digital)';
  } else if(/boost\s*bank|boost\s*ewallet|\bboost\b(?!\s*juice)/i.test(s)){
    detectedPayment = 'Boost Bank / eWallet';
  } else if(/aeon\s*bank|aeon\s*wallet/i.test(s)){
    detectedPayment = 'AEON Bank';
  } else if(/affin|affinonline/i.test(s)){
    detectedPayment = 'Affin Bank';
  } else if(/alliance|allianceonline/i.test(s)){
    detectedPayment = 'Alliance Bank';
  } else if(/\buob\b|tmrw/i.test(s)){
    detectedPayment = 'UOB Malaysia';
  } else if(/\bocbc\b/i.test(s)){
    detectedPayment = 'OCBC Malaysia';
  } else if(/\bhsbc\b/i.test(s)){
    detectedPayment = 'HSBC Malaysia';
  } else if(/standard\s*chartered|\bscb\b/i.test(s)){
    detectedPayment = 'Standard Chartered';
  } else if(/bigpay|big\s*pay/i.test(s)){
    detectedPayment = 'BigPay';
  } else if(/setel/i.test(s)){
    detectedPayment = 'Setel (Petronas)';
  } else if(/spaylater|spay\s*later|atome|bnpl|paylater/i.test(s)){
    detectedPayment = 'SPayLater / Atome / BNPL';
  } else if(/credit\s*card|visa|mastercard|amex|american\s*express|信用卡/i.test(s)){
    detectedPayment = 'Credit Card';
  } else if(/debit\s*card|mydebit|debit|借记卡/i.test(s)){
    detectedPayment = 'Debit Card';
  } else if(/fpx|duitnow|duitnow\s*qr|online\s*banking|转账/i.test(s)){
    detectedPayment = 'Online Banking (FPX / DuitNow)';
  } else if(/\bcash\b|tunai|wang\s*tunai|change|baki|现金/i.test(s)){
    detectedPayment = 'Cash (现金)';
  }

  if(!detectedCat && !detectedPayment) return null;
  return { detectedCat, detectedSubCat, detectedPayment, confidence };
}

// Live typing handler on tx-desc input
function handleTxDescAutoDetect(){
  const inp = el('tx-desc');
  const badge = el('tx-ai-detect-badge');
  if(!inp) return;
  const val = inp.value.trim();
  if(!val || val.length < 2){
    if(badge) badge.classList.add('hidden');
    return;
  }

  const result = smartAutoDetectCategoryAndPayment(val);
  if(!result){
    if(badge) badge.classList.add('hidden');
    return;
  }

  let labels = [];

  if(result.detectedCat){
    const cats = getCategories('expense');
    const matched = cats.find(c => c.id === result.detectedCat);
    if(matched){
      selCat = matched.id;
      if(result.detectedSubCat) selSubCat = result.detectedSubCat;
      buildCats('tx-cats', 'expense', id => selCat = id);
      labels.push(`Category: ${matched.icon} ${matched.name}`);
    }
  }

  if(result.detectedPayment){
    selectPaymentMethod(result.detectedPayment);
    labels.push(`Paid via: ${result.detectedPayment}`);
  }

  if(badge && labels.length > 0){
    badge.innerHTML = `<span>✨ AI Auto-Detected:</span> <strong>${labels.join(' · ')}</strong>`;
    badge.classList.remove('hidden');
  }
}

async function handleUniversalFile(inputOrFile){

  let file = null;
  if(inputOrFile instanceof File) file = inputOrFile;
  else if(inputOrFile?.files?.[0]) file = inputOrFile.files[0];
  if(!file) return;

  const placeholder = el('uni-upload-placeholder');
  const imgPrev = el('uni-img-preview');
  const badgeWrap = el('uni-detected-badge-wrap');
  const actionBtns = el('uni-action-btns');

  if(placeholder) placeholder.classList.add('hidden');
  startAiScanAnimation('universal');

  try {
    const rawDataUrl = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.readAsDataURL(file);
    });

    const compressed = await compressReceiptForStorage(rawDataUrl);
    uniImageDataUrl = compressed;
    photoData = compressed;

    if(imgPrev){
      imgPrev.src = compressed;
      imgPrev.classList.remove('hidden');
    }

    const result = await analyzeUnifiedUploadWithGemini(compressed);
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
      const isZh = (S.lang === 'zh');
      toast(isZh ? '🤖 AI 识别小票成功！' : '🤖 AI analyzed receipt successfully!');
    } else {
      uniParsedData = {
        detectedType: 'receipt',
        merchant: '',
        amount: 0,
        category: uniCurrentMode === 'transfer' ? 'other' : 'food',
        date: uniCustomDate || today(),
        time: currentTimeStr(),
        items: []
      };
      if(actionBtns) actionBtns.classList.remove('hidden');
      if(badgeWrap) badgeWrap.classList.add('hidden');
      renderUniversalPreview();
      const isZh = (S.lang === 'zh');
      if(S.geminiApiKey && S.geminiApiKey.length > 7){
        toast(isZh ? '⚠️ 未能自动提取数据，您可以手动填写' : '⚠️ Could not extract data. You can enter details manually.');
      }
    }
  } catch(err){
    console.warn('Universal upload notice:', err);
    stopAiScanAnimation();
    const isZh = (S.lang === 'zh');
    toast(isZh ? '⚠️ 扫描遇到问题，请手动输入明细' : '⚠️ Could not complete AI scan. You can enter details manually.');
    renderUniversalPreview();
  }
}

async function analyzeUnifiedUploadWithGemini(base64DataUrl){
  let apiKey = (S.geminiApiKey || '').trim();
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  const isZh = (S.lang === 'zh');

  if(!apiKey || apiKey.length < 8){
    toast(isZh ? '🔑 请先填入 Google Gemini API Key 并测试连接' : '🔑 Please configure your Google Gemini API Key first');
    openGeminiModal();
    return null;
  }

  if(!base64DataUrl || typeof base64DataUrl !== 'string' || !base64DataUrl.includes('base64')){
    console.error('Invalid image data URL provided to Gemini OCR');
    toast(isZh ? '⚠️ 无法读取图片数据，请重新选择照片' : '⚠️ Could not read image data. Please select again.');
    return null;
  }
  
  const mimeMatch = base64DataUrl.match(/^data:([^;]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const base64Data = base64DataUrl.replace(/^data:[^;]+;base64,/, '').trim();

  const prompt = `You are an expert Malaysian receipt, SST, dining bill, e-wallet, and cash OCR parser.
Analyze this Malaysian store receipt, restaurant dining bill, supermarket invoice, or retail slip.
Extract ALL information accurately into a single raw JSON object matching this schema:
{
  "detectedType": "receipt",
  "merchant": "Exact Restaurant or Store Name",
  "currency": "MYR",
  "originalAmount": 84.45,
  "amount": 84.45,
  "subtotal": 72.80,
  "category": "food",
  "subCategory": "food_restaurant",
  "tags": ["noodles", "pork", "lunch"],
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "paymentMethod": "Cash",
  "location": "Mall / Street / Area",
  "items": [
    { "name": "Item or Dish Name", "price": 19.80, "qty": 1, "subCategory": "food_restaurant", "tags": ["noodle"] }
  ],
  "itemsSummary": "Dish 1, Dish 2, Dish 3...",
  "serviceChargePct": 10,
  "serviceChargeAmount": 7.28,
  "sstPct": 6,
  "sstAmount": 4.37,
  "roundingAmount": 0.00,
  "taxesCollectedSummary": "SST (6%): RM 4.37 · Service Charge (10%): RM 7.28",
  "taxReliefCat": "",
  "taxReliefAmount": 0.00,
  "taxReliefReason": ""
}

CRITICAL RULES:
1. "merchant": The official restaurant, cafe, supermarket, or shop brand name (e.g. "Tai Ho Jiak", "Lotus's", "Uniqlo", "Popular", "Watsons", "7-Eleven", "Donki").
2. "currency": Detect the foreign or local currency code of the receipt: "MYR", "SGD", "THB", "JPY", "USD", "CNY", "TWD", "KRW", "EUR", "GBP", "AUD", "IDR", "VND", "PHP". Inspect currency symbols (S$, $, ฿, ¥, 円, €, £, NT$, ₩, Rp, ₫, ₱, RM) or country. Default to "MYR" for Malaysian receipts.
3. "originalAmount" & "amount": The final total payable in the receipt's native currency as a floating number.
4. "subtotal": The subtotal before taxes/service charge.
5. "category": Choose the main category: "drinks" (coffee, boba, tea, juice, bar), "food" (restaurant, hawker, fast food, bakery), "groceries" (supermarket, convenience 7-11/FamilyMart, fresh produce), "period_care" (sanitary pads, tampon, cramp relief, Midol), "fuel" (Petronas, Shell, Caltex, BHP, Petron), "toll_parking" (Toll, RFID, Parking), "transport" (Grab, LRT/MRT, flights), "shopping" (clothing, electronics, Shopee, IKEA), "beauty" (skincare, haircut, salon, spa), "bills" (TNB electric, water, telco, wifi, Netflix), "rent_housing", "health" (pharmacy Watsons/Guardian, clinic, doctor, dental, vitamins), "entertainment" (cinema GSC/TGV, gaming, outings), "education" (books, tuition, courses), "pets" (pet food, vet), "donation", "other".
5. "subCategory": Accurately assign one of the 40+ granular sub-categories:
   - Food: "food_restaurant", "food_cafe_coffee", "food_drinks_boba", "food_fastfood", "food_hawker_mamak", "food_dessert_snack", "food_delivery", "food_bar_alcohol"
   - Groceries: "groc_fresh_produce", "groc_meat_seafood", "groc_dairy_eggs", "groc_pantry_staples", "groc_snacks_sweets", "groc_household_cleaning", "groc_personal_care"
   - Shopping: "shop_clothing_apparel", "shop_shoes_footwear", "shop_electronics_tech", "shop_beauty_skincare", "shop_home_furniture", "shop_hardware_tools"
   - Transport: "trans_petrol_fuel", "trans_toll_rfid", "trans_parking", "trans_ridehailing", "trans_public_transit", "trans_car_maintenance", "trans_flights_trips"
   - Bills: "bill_electricity_water", "bill_mobile_telco", "bill_home_wifi", "bill_subscriptions", "bill_insurance"
   - Health: "health_pharmacy_rx", "health_clinic_doctor", "health_dental_vision", "health_vitamins_supp", "health_gym_fitness"
   - Education: "edu_books_reading", "edu_stationery_supplies", "edu_courses_tuition"
   - Entertainment: "ent_movies_cinema", "ent_gaming_hobbies", "ent_events_concerts", "ent_sports_activities"
   - Pets: "pet_food_supplies", "pet_vet_care"
   - Kids: "kids_baby_essentials"
   - Gifts: "gift_presents_angpao", "gift_charity_ngo"
6. "tags": 3-5 relevant keyword tags (e.g. ["coffee", "breakfast", "starbucks"]).
7. "date": The transaction date in "YYYY-MM-DD" format (convert "23/08/2026" or "23-08-2026" to "2026-08-23").
8. "time": The transaction time in 24-hour "HH:MM" format (e.g. "13:45").
9. "paymentMethod": Look for payment tender: "Cash" (Cash/Tunai/Change), "Credit Card", "Debit Card", "Touch 'n Go eWallet", "GrabPay", "ShopeePay", "Maybank (MAE / QR)", "Online Banking (FPX / DuitNow)".
10. "items": Extract EVERY single individual item, dish, beverage, book, piece of clothing, or grocery product with its name, quantity, line price in RM, and specific subCategory.
11. "sstAmount" & "sstPct": Extract Malaysian SST / Service Tax rate (6% or 8%) and exact SST tax amount.
12. "serviceChargeAmount" & "serviceChargePct": Extract restaurant Service Charge (e.g. 10% or 5%) if present.
13. "roundingAmount": Extract rounding adjustment (e.g. 0.00 or -0.02) if listed.
14. "taxReliefCat": if purchase qualifies for Malaysian LHDN tax relief (e.g. lifestyle for books/reading materials, computer/phone, sports equipment; medical for pharmacy/clinic; childcare), tag it and set taxReliefAmount.
15. Output ONLY pure raw JSON without markdown backticks.`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]
    }]
  };

  const generation = await generateGeminiContent(apiKey, payload);
  const geminiRes = generation.data;
  const lastErrorMsg = generation.lastError;
  if(generation.model) console.log(`✅ Gemini OCR successfully processed receipt using model: ${generation.model}`);

  let parsed = null;
  if(geminiRes){
    const parts = geminiRes.candidates?.[0]?.content?.parts || [];
    const rawText = parts.map(p => p.text || '').filter(Boolean).join('\n');
    console.log('Gemini raw response text length:', rawText.length);
    if(rawText){
      const rawJson = extractJsonFromText(rawText);
      if(rawJson){
        parsed = normalizeGeminiReceiptOutput(rawJson);
        parsed = await verifyReceiptCategoryWithGemini(parsed, apiKey);
        console.log('Successfully parsed receipt data:', parsed);
      }
    }
  }

  if(!parsed && lastErrorMsg){
    console.error('All Gemini OCR model attempts failed:', lastErrorMsg);
    if(lastErrorMsg.includes('API_KEY_INVALID') || lastErrorMsg.includes('API key not valid') || lastErrorMsg.includes('PERMISSION_DENIED')){
      toast(isZh ? '❌ Google API Key 无效，请在设置中重新配置' : '❌ Invalid Google API Key. Please check settings.');
      openGeminiModal();
    } else if(lastErrorMsg.includes('RESOURCE_EXHAUSTED') || lastErrorMsg.includes('Quota exceeded') || lastErrorMsg.includes('429')){
      toast(isZh ? '⚠️ Google API 免费配额暂时超限，请稍候再试' : '⚠️ Google API quota reached. Please try again in a moment.');
    } else {
      toast((isZh ? '⚠️ AI 扫描失败: ' : '⚠️ AI scan failed: ') + lastErrorMsg.substring(0, 50));
    }
  }

  return parsed;
}

// Backward compatible aliases
async function analyzeReceiptWithGemini(base64DataUrl){ return analyzeUnifiedUploadWithGemini(base64DataUrl); }
async function startSplitterReceiptAI(){
  openUniversalUpload('splitter');
}
async function startTransferSlipAI(){
  openUniversalUpload('transfer');
}

function renderUniversalPreview(){
  const container = el('uni-preview-content');
  if(!container) return;

  if(!uniParsedData){
    container.innerHTML = `
      <div style="text-align:center;padding:16px 0;color:var(--muted);font-size:12px">
        <div style="font-size:28px;margin-bottom:6px">📸</div>
        <div style="font-weight:700;color:var(--text);margin-bottom:2px">Upload or take a receipt photo above</div>
        <div style="font-size:11px">Google AI will extract merchant, total, date & itemized breakdown</div>
      </div>
    `;
    return;
  }

  const d = uniParsedData;
  const rawAmt = Math.abs(parseFloat(d.amount)) || 0;
  const rawMerchant = (d.merchant || d.recipient || d.store || 'Store').trim();
  const rawDate = normalizeDateStr(uniCustomDate || d.date || today(), true);

  // Foreign Currency Auto-Conversion
  const detectedCurr = (d.currency || 'MYR').toUpperCase();
  const isForeign = (detectedCurr !== 'MYR' && detectedCurr !== (S.currency || 'RM'));
  const origAmt = Math.abs(parseFloat(d.originalAmount !== undefined ? d.originalAmount : d.amount)) || 0;
  const rate = liveRates[detectedCurr] || 1;
  const convertedTotal = isForeign ? (origAmt * rate) : (d.convertedAmount || origAmt || rawAmt);

  if(isForeign && d.convertedAmount === undefined){
    d.convertedAmount = convertedTotal;
    d.amount = convertedTotal;
  }
  const displayAmt = isForeign ? convertedTotal : rawAmt;

  let itemsText = formatItemsSummary(d);
  if(isForeign && !itemsText.includes(`Converted from ${detectedCurr}`)){
    itemsText = `[Converted from ${origAmt.toFixed(2)} ${detectedCurr} @ rate ${rate.toFixed(3)}] ${itemsText}`.trim();
  }

  // Available categories
  const cats = getCategories('expense');
  let matchedCatId = 'food';
  
  // First check AI parsed category
  if(d.category){
    const cLower = String(d.category).toLowerCase().trim();
    const found = cats.find(c => c.id === cLower || c.name.toLowerCase().includes(cLower) || cLower.includes(c.id));
    if(found) matchedCatId = found.id;
  }
  
  // Then run smartAutoDetectCategoryAndPayment on merchant + items to guarantee accurate matching (e.g. drinks, boba, coffee, petrol, pads, groceries)
  const smartDetect = smartAutoDetectCategoryAndPayment(rawMerchant + ' ' + (itemsText || ''));
  if(smartDetect && smartDetect.detectedCat && d.categoryVerification?.confidence !== 'high'){
    const smartFound = cats.find(c => c.id === smartDetect.detectedCat);
    if(smartFound) matchedCatId = smartFound.id;
    if(smartDetect.detectedPayment && (!d.paymentMethod || d.paymentMethod === 'Cash')){
      d.paymentMethod = smartDetect.detectedPayment;
    }
  }

  // Match Payment Method & Linked Account from AI detection
  const pmRaw = String(d.paymentMethod || d.payMethod || d.payment || '').toLowerCase();
  const merchLower = rawMerchant.toLowerCase();

  let matchedMethodName = 'Cash (现金)';
  let matchedAccId = '';

  if(/tng|touch\s*'?n\s*go|rfid/i.test(pmRaw)){
    matchedMethodName = "Touch 'n Go eWallet";
    const acc = S.accounts.find(a => /tng|touch\s*'?n\s*go/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/grab/i.test(pmRaw)){
    matchedMethodName = 'GrabPay';
    const acc = S.accounts.find(a => /grab/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/shopee/i.test(pmRaw)){
    matchedMethodName = 'ShopeePay';
    const acc = S.accounts.find(a => /shopee/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/mae|maybank/i.test(pmRaw) || /mae/i.test(merchLower)){
    matchedMethodName = 'Maybank (MAE / QR)';
    const acc = S.accounts.find(a => /maybank|mae/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/cimb/i.test(pmRaw)){
    matchedMethodName = 'CIMB Bank (Octo)';
    const acc = S.accounts.find(a => /cimb/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/public/i.test(pmRaw)){
    matchedMethodName = 'Public Bank (PBe)';
    const acc = S.accounts.find(a => /public/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/credit|visa|master|amex/i.test(pmRaw)){
    matchedMethodName = 'Credit Card';
    const acc = S.accounts.find(a => a.type === 'credit' || /credit/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  } else if(/debit|mydebit/i.test(pmRaw)){
    matchedMethodName = 'Debit Card';
    const acc = S.accounts.find(a => a.type === 'bank');
    if(acc) matchedAccId = acc.id;
  } else if(/fpx|online banking|duitnow/i.test(pmRaw)){
    matchedMethodName = 'Online Banking (FPX / DuitNow)';
  } else if(/cash|tunai/i.test(pmRaw)){
    matchedMethodName = 'Cash (现金)';
    const acc = S.accounts.find(a => a.type === 'cash' || /cash|tunai/i.test(a.name));
    if(acc) matchedAccId = acc.id;
  }

  // Fallback account: if no specific tender account matched, use 1st/default account (S.accounts[0])
  if(!matchedAccId){
    matchedAccId = S.lastUsedAccId || (S.accounts.length > 0 ? S.accounts[0].id : '');
  }

  // Available accounts
  const accOptions = S.accounts.map(a => `<option value="${a.id}" ${a.id === matchedAccId ? 'selected' : ''}>${getAccIcon(a)} ${esc(a.name)}</option>`).join('');

  // Payment methods
  const methodOptions = PAYMENT_METHODS.map(p => `<option value="${esc(p.name)}" ${p.name === matchedMethodName ? 'selected' : ''}>${p.icon} ${esc(p.name)}</option>`).join('');

  if(uniCurrentMode === 'expense'){
    container.innerHTML = `
      <div style="font-size:11px;font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
        <span>✨ Review & Edit Before Saving</span>
        <span style="font-size:10px;background:rgba(16,185,129,.15);padding:2px 6px;border-radius:6px">Editable</span>
      </div>

      <!-- 💱 Foreign Travel Currency Conversion Banner -->
      ${isForeign ? `
        <div style="background:linear-gradient(135deg,rgba(6,182,212,.14),rgba(59,130,246,.08));border:1.5px solid var(--cyan);border-radius:14px;padding:10px 12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:11.5px;font-weight:800;color:var(--cyan);display:flex;align-items:center;gap:5px">
              <span>💱</span> Foreign Currency Auto-Converted
            </span>
            <span style="font-size:10px;font-weight:700;background:rgba(6,182,212,.22);color:var(--cyan);padding:2px 7px;border-radius:8px">
              1 ${detectedCurr} = RM ${rate.toFixed(4)}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);padding:8px 12px;border-radius:10px;border:1px solid var(--border)">
            <div>
              <div style="font-size:14px;font-weight:900;color:var(--text)">${detectedCurr} ${origAmt.toFixed(2)}</div>
              <div style="font-size:10px;color:var(--muted)">Original Foreign Receipt</div>
            </div>
            <div style="font-size:16px;color:var(--cyan);font-weight:900">➔</div>
            <div style="text-align:right">
              <div style="font-size:16px;font-weight:900;color:var(--green)">RM ${convertedTotal.toFixed(2)}</div>
              <div style="font-size:10px;color:var(--muted)">Logged into Ringgit (RM)</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Merchant & Amount Row -->
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:8px;margin-bottom:8px">
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Store / Merchant</label>
          <input type="text" id="uni-edit-merchant" class="form-input" value="${esc(rawMerchant)}" style="padding:8px 10px;font-size:12px;font-weight:700" placeholder="Merchant Name"/>
        </div>
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Total (${isForeign ? 'RM' : S.currency || 'RM'})</label>
          <input type="number" step="0.01" id="uni-edit-amount" class="form-input" value="${displayAmt > 0 ? displayAmt.toFixed(2) : ''}" style="padding:8px 10px;font-size:13px;font-weight:900;color:var(--text)" placeholder="0.00"/>
        </div>
      </div>

      <!-- Date & Category Row -->
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:8px;margin-bottom:6px">
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Date</label>
          <input type="date" id="uni-edit-date" class="form-input" value="${rawDate}" style="padding:7px 8px;font-size:11.5px"/>
        </div>
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Category</label>
          <select id="uni-edit-category" class="form-input" style="padding:7px 8px;font-size:11.5px" onchange="handleUniCategoryChange(this.value)">
            ${cats.map(c => `<option value="${c.id}" ${c.id === matchedCatId ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Quick Category Pills for 1-Tap Switching -->
      <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px" id="uni-cat-quick-pills">
        ${[
          { id: 'food', icon: '🍽️', name: 'Food' },
          { id: 'drinks', icon: '🧋', name: 'Drinks' },
          { id: 'groceries', icon: '🛒', name: 'Groceries' },
          { id: 'fuel', icon: '⛽', name: 'Fuel' },
          { id: 'shopping', icon: '🛍️', name: 'Shopping' },
          { id: 'bills', icon: '⚡', name: 'Bills' },
          { id: 'health', icon: '💊', name: 'Health' },
          { id: 'transport', icon: '🚗', name: 'Transport' }
        ].map(p => `
          <button type="button" class="promo-chip ${p.id === matchedCatId ? 'on' : ''}" onclick="selectUniCategory('${p.id}')" style="padding:4px 9px;font-size:11px;flex-shrink:0" id="uni-cat-chip-${p.id}">
            <span>${p.icon}</span> <span>${p.name}</span>
          </button>
        `).join('')}
      </div>

      ${d.categoryVerification ? `
        <div style="display:flex;align-items:flex-start;gap:6px;margin:-1px 0 9px;padding:7px 9px;border-radius:9px;background:rgba(6,182,212,.10);border:1px solid rgba(6,182,212,.26);color:var(--text);font-size:10.5px;line-height:1.35">
          <span style="flex-shrink:0">🧠</span>
          <span><strong>Category checked:</strong> ${esc(d.categoryVerification.message || 'Verified before saving')}</span>
        </div>
      ` : ''}

      <!-- Payment Method / Bank & Account Row -->
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-bottom:6px">
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Payment Method (付款方式)</label>
          <select id="uni-edit-payment" class="form-input" style="padding:7px 8px;font-size:11.5px;font-weight:700" onchange="handleUniPaymentSelectChange(this.value)">
            ${methodOptions}
          </select>
        </div>
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Record Under Account (记账账户 / 支付记录)</label>
          <select id="uni-edit-account" class="form-input" style="padding:7px 8px;font-size:11.5px;font-weight:700">
            ${accOptions}
          </select>
        </div>
      </div>

      <!-- Quick Payment Pills for 1-Tap Switching -->
      <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px" id="uni-pay-quick-pills">
        ${[
          { name: 'Cash (现金)', icon: '💵', label: 'Cash' },
          { name: "Touch 'n Go eWallet", icon: '📱', label: 'TNG' },
          { name: 'Maybank (MAE / QR)', icon: '🟡', label: 'MAE' },
          { name: 'GrabPay', icon: '💚', label: 'Grab' },
          { name: 'Credit Card', icon: '💳', label: 'Credit Card' },
          { name: 'Debit Card', icon: '💳', label: 'Debit Card' },
          { name: 'Online Banking (FPX / DuitNow)', icon: '🏛️', label: 'FPX Bank' }
        ].map(pm => {
          const isSel = (pm.name === matchedMethodName);
          return `
            <button type="button" class="promo-chip ${isSel ? 'on' : ''}" onclick="selectUniPayment('${esc(pm.name)}')" style="padding:4px 9px;font-size:11px;flex-shrink:0" data-uni-pay="${esc(pm.name)}">
              <span>${pm.icon}</span> <span>${pm.label}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Items & Note -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:8px 10px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <label class="form-label" style="font-size:11px;font-weight:800;margin-bottom:0">
            <span>🛒 Extracted Items / Dishes (<span id="uni-items-count">${(d.items || []).length}</span>)</span>
          </label>
          <button type="button" class="see-all" onclick="addUniPreviewItem()" style="font-size:10.5px;color:var(--amber);font-weight:800;background:none;border:none;cursor:pointer">
            ➕ Add Item
          </button>
        </div>
        <div id="uni-items-editor-list" style="display:flex;flex-direction:column;gap:5px;max-height:130px;overflow-y:auto;padding-right:2px">
        </div>
      </div>

      <div style="margin-bottom:4px">
        <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Summary Note</label>
        <input type="text" id="uni-edit-note" class="form-input" value="${esc(itemsText)}" placeholder="e.g. Meatballs, Fish & Chips..." style="padding:6px 10px;font-size:11.5px"/>
      </div>

      <!-- 🧾 AI Tax Breakdown Card -->
      <div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:12px;padding:8px 10px;margin-top:6px">
        <div style="font-size:11px;font-weight:800;color:var(--text);display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="display:flex;align-items:center;gap:5px"><span>🧾</span> <span>Taxes & Charges Collected</span></span>
          <span style="font-size:10px;color:var(--cyan);font-weight:700">Auto-Detected by AI</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
          ${(d.sstAmount > 0 || d.sstPct > 0) ? `
            <span style="font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,.15);color:var(--cyan);border:1px solid rgba(59,130,246,.3)">
              🏛️ SST (${d.sstPct || 6}%): RM ${(d.sstAmount || (rawAmt * 0.06)).toFixed(2)}
            </span>
          ` : `
            <span style="font-size:10.5px;color:var(--muted);padding:3px 6px">No SST collected (0%)</span>
          `}
          ${(d.serviceChargeAmount > 0 || d.serviceChargePct > 0) ? `
            <span style="font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(245,158,11,.15);color:var(--amber);border:1px solid rgba(245,158,11,.3)">
              🛎️ Svc (${d.serviceChargePct || 10}%): RM ${(d.serviceChargeAmount || (rawAmt * 0.10)).toFixed(2)}
            </span>
          ` : ''}
          ${(d.roundingAmount !== undefined && d.roundingAmount !== 0) ? `
            <span style="font-size:10.5px;color:var(--muted);padding:3px 6px">
              🪙 Rounding: RM ${Number(d.roundingAmount).toFixed(2)}
            </span>
          ` : ''}
        </div>
        ${d.taxReliefCat ? `
          <div style="font-size:10.5px;color:var(--green);background:rgba(16,185,129,.12);border:1px solid var(--green);padding:5px 8px;border-radius:8px;margin-top:6px;display:flex;align-items:center;gap:5px">
            <span>🏷️</span>
            <span><strong>LHDN Relief:</strong> ${esc(d.taxReliefCat.toUpperCase())} · Claimable: ${fmt(d.taxReliefAmount || rawAmt)} (${esc(d.taxReliefReason || 'Deductible')})</span>
          </div>
        ` : `
          <div style="font-size:10px;color:var(--muted);margin-top:4px">
            💡 ${esc(d.taxReliefReason || 'Standard Malaysian consumer receipt')}
          </div>
        `}
      </div>
    `;
    renderUniPreviewItemsList();
  } else if(uniCurrentMode === 'splitter'){
    const items = d.items || [];
    let itemsHtml = items.map(it => `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="font-weight:600">${esc(it.name)} ${it.qty > 1 ? `<span style="font-size:10.5px;color:var(--muted)">x${it.qty}</span>` : ''}</span>
        <strong style="color:var(--text)">${fmt(it.price)}</strong>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">🍽️ ${esc(rawMerchant)}</div>
          <div style="font-size:11px;color:var(--muted)">${items.length} Itemized Dishes · 📅 ${rawDate}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:18px;font-weight:900;color:var(--amber)">${fmt(rawAmt)}</div>
          <div style="font-size:10px;color:var(--muted)">SST: ${d.sstPct||6}% · Svc: ${d.serviceChargePct||10}%</div>
        </div>
      </div>
      <div style="max-height:180px;overflow-y:auto;background:var(--bg2);padding:8px 12px;border-radius:12px;border:1px solid var(--border)">
        ${itemsHtml || '<div style="font-size:11px;color:var(--muted);text-align:center;padding:12px 0">No dish breakdown detected</div>'}
      </div>
      <div style="margin-top:10px;font-size:11.5px;color:var(--muted);display:flex;align-items:center;gap:6px;background:rgba(255,179,0,.1);border:1px solid rgba(255,179,0,.25);padding:8px 12px;border-radius:10px">
        <span>💡</span>
        <span>Click <strong>Apply to Meal Splitter</strong> below to calculate and split individual shares with friends!</span>
      </div>
    `;
  }
}

function selectUniCategory(catId){
  const sel = el('uni-edit-category');
  if(sel) sel.value = catId;
  document.querySelectorAll('#uni-cat-quick-pills .promo-chip').forEach(btn => {
    btn.classList.toggle('on', btn.id === `uni-cat-chip-${catId}`);
  });
  if(uniParsedData) uniParsedData.category = catId;
}

function handleUniCategoryChange(newCatId){
  const merchInp = el('uni-edit-merchant');
  if(!merchInp) return;
  const curVal = merchInp.value.trim();
  const info = catInfo('expense', newCatId);
  if(!info || !info.name) return;

  if(!curVal || curVal.toLowerCase() === 'store' || curVal === '商家' || curVal === 'Store'){
    merchInp.value = info.name;
  }
  document.querySelectorAll('#uni-cat-quick-pills .promo-chip').forEach(btn => {
    btn.classList.toggle('on', btn.id === `uni-cat-chip-${newCatId}`);
  });
  if(uniParsedData) uniParsedData.category = newCatId;
}

function selectUniPayment(name){
  const sel = el('uni-edit-payment');
  if(sel){
    const opt = Array.from(sel.options).find(o => o.value === name || o.value.startsWith(name) || name.startsWith(o.value));
    if(opt) sel.value = opt.value;
  }
  document.querySelectorAll('#uni-pay-quick-pills [data-uni-pay]').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.uniPay === name);
  });
  if(uniParsedData) uniParsedData.paymentMethod = name;

  // Auto-sync corresponding wallet/bank account
  const lower = name.toLowerCase();
  const matchedAcc = S.accounts.find(a => {
    const aLower = a.name.toLowerCase();
    if(lower.includes('touch') || lower.includes('tng')) return aLower.includes('touch') || aLower.includes('tng');
    if(lower.includes('maybank') || lower.includes('mae')) return aLower.includes('maybank') || aLower.includes('mae');
    if(lower.includes('grab')) return aLower.includes('grab');
    if(lower.includes('shopee')) return aLower.includes('shopee');
    if(lower.includes('cash')) return a.type === 'cash' || aLower.includes('cash');
    if(lower.includes('card') || lower.includes('credit')) return a.type === 'credit' || a.type === 'bank';
    return false;
  });
  if(matchedAcc && el('uni-edit-account')){
    el('uni-edit-account').value = matchedAcc.id;
  }
}

function handleUniPaymentSelectChange(val){
  selectUniPayment(val);
}

function renderUniPreviewItemsList(){
  const list = el('uni-items-editor-list');
  const countEl = el('uni-items-count');
  if(!list) return;
  list.innerHTML = '';
  if(!uniParsedData) uniParsedData = {};
  if(!uniParsedData.items) uniParsedData.items = [];

  if(countEl) countEl.textContent = uniParsedData.items.length;

  if(uniParsedData.items.length === 0){
    list.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:6px 0">No individual dishes detected. Tap "+ Add Item" above to add!</div>`;
    return;
  }

  uniParsedData.items.forEach((it, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;background:var(--bg3);padding:4px 6px;border-radius:8px;border:1px solid var(--border)';
    row.innerHTML = `
      <input type="text" class="form-input" value="${esc(it.name || '')}" placeholder="Item name" style="flex:1;padding:4px 6px;font-size:11px;background:transparent;border:none" oninput="updateUniPreviewItem(${idx}, 'name', this.value)"/>
      <div style="display:flex;align-items:center;width:75px">
        <span style="font-size:10px;color:var(--muted);margin-right:2px">RM</span>
        <input type="number" step="0.01" class="form-input" value="${it.price !== undefined ? it.price : ''}" placeholder="0.00" style="padding:4px 4px;font-size:11px;font-weight:700;background:transparent;border:none;color:var(--text)" oninput="updateUniPreviewItem(${idx}, 'price', this.value)"/>
      </div>
      <button type="button" onclick="removeUniPreviewItem(${idx})" style="background:rgba(239,68,68,.15);border:none;color:var(--red);border-radius:6px;width:20px;height:20px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center">✕</button>
    `;
    list.appendChild(row);
  });
}

function addUniPreviewItem(){
  if(!uniParsedData) uniParsedData = {};
  if(!uniParsedData.items) uniParsedData.items = [];
  uniParsedData.items.push({ name: '', price: 0, qty: 1 });
  renderUniPreviewItemsList();
}

function removeUniPreviewItem(idx){
  if(!uniParsedData || !uniParsedData.items) return;
  uniParsedData.items.splice(idx, 1);
  renderUniPreviewItemsList();
  if(el('uni-edit-note')){
    el('uni-edit-note').value = formatItemsSummary(uniParsedData);
  }
}

function updateUniPreviewItem(idx, field, val){
  if(!uniParsedData || !uniParsedData.items || !uniParsedData.items[idx]) return;
  if(field === 'price'){
    uniParsedData.items[idx].price = parseFloat(val) || 0;
  } else {
    uniParsedData.items[idx][field] = val;
  }
  if(el('uni-edit-note')){
    el('uni-edit-note').value = formatItemsSummary(uniParsedData);
  }
}

function confirmUniversalUpload(openFormToEdit = false){
  if(!uniParsedData){
    toast('⚠️ Please upload a receipt or screenshot first');
    return;
  }

  // Read live values from the review inputs if available, falling back to uniParsedData
  const merchantInp = el('uni-edit-merchant');
  const amountInp = el('uni-edit-amount');
  const dateInp = el('uni-edit-date');
  const catInp = el('uni-edit-category');
  const accInp = el('uni-edit-account');
  const payInp = el('uni-edit-payment');
  const noteInp = el('uni-edit-note');

  const merchant = (merchantInp?.value || uniParsedData.merchant || uniParsedData.recipient || 'Store').trim();
  const amt = Math.abs(parseFloat(amountInp?.value !== undefined && amountInp.value !== '' ? amountInp.value : uniParsedData.amount)) || 0;
  const rawDate = dateInp?.value || uniCustomDate || uniParsedData.date || today();
  const dateStr = normalizeDateStr(rawDate, true);
  const selectedCat = catInp?.value || uniParsedData.category || 'food';
  const selectedAcc = accInp?.value || S.lastUsedAccId || S.accounts[0]?.id || 'acc_1';
  const selectedPay = payInp?.value || uniParsedData.paymentMethod || 'Cash';
  const formattedNote = (noteInp?.value !== undefined ? noteInp.value : formatItemsSummary(uniParsedData)).trim();
  const photoToSave = uniImageDataUrl || photoData || null;

  closeModal('universal-upload-modal');
  closeModal('tx-modal');
  closeModal('splitter-modal');
  closeModal('transfer-modal');

  if(uniCurrentMode === 'expense'){
    if(openFormToEdit){
      openTxModal('expense');
      isEditingFromUpload = true;
      if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.remove('hidden');
      const hBack = el('tx-modal-header-back-btn');
      if(hBack) hBack.classList.remove('hidden');
      el('tx-desc').value = merchant;
      el('tx-amount').value = amt > 0 ? amt.toFixed(2) : '';
      el('tx-date').value = dateStr;
      selCat = selectedCat;
      buildCats('tx-cats', 'expense', id => selCat = id);
      setTxAccount(selectedAcc);
      selectPaymentMethod(selectedPay);
      if(formattedNote && el('tx-note')) el('tx-note').value = formattedNote;
      photoData = photoToSave;
      const prevEl = el('photo-prev');
      const phEl = el('photo-ph');
      if(prevEl && photoData){
        prevEl.src = photoData;
        prevEl.classList.remove('hidden');
      }
      if(phEl && photoData) phEl.classList.add('hidden');
      toast(`✏️ Reviewing: ${merchant} · ${fmt(amt)}`);
    } else {
      const detCurr = (uniParsedData.currency || 'MYR').toUpperCase();
      const newTx = {
        id: uid('item'),
        type: 'expense',
        amount: amt,
        desc: merchant,
        category: selectedCat,
        subCategory: uniParsedData.subCategory || null,
        tags: (uniParsedData.tags && Array.isArray(uniParsedData.tags)) ? uniParsedData.tags : [],
        originalCurrency: detCurr,
        originalAmount: uniParsedData.originalAmount !== undefined ? uniParsedData.originalAmount : amt,
        exchangeRate: liveRates[detCurr] || 1,
        date: dateStr,
        time: uniParsedData.time || currentTimeStr(),
        accountId: selectedAcc,
        paymentMethod: selectedPay,
        location: uniParsedData.location || null,
        note: formattedNote,
        photo: photoToSave,
        items: (uniParsedData.items && Array.isArray(uniParsedData.items)) ? JSON.parse(JSON.stringify(uniParsedData.items)) : [],
        sstPct: uniParsedData.sstPct || 0,
        sstAmount: uniParsedData.sstAmount || 0,
        serviceChargePct: uniParsedData.serviceChargePct || 0,
        serviceChargeAmount: uniParsedData.serviceChargeAmount || 0,
        roundingAmount: uniParsedData.roundingAmount || 0,
        taxesCollectedSummary: uniParsedData.taxesCollectedSummary || null,
        taxReliefCat: uniParsedData.taxReliefCat || null,
        taxReliefAmount: uniParsedData.taxReliefAmount || (uniParsedData.taxReliefCat ? amt : 0),
        taxReliefReason: uniParsedData.taxReliefReason || null,
        createdAt: new Date().toISOString()
      };

      S.transactions.unshift(newTx);
      S.lastUsedAccId = selectedAcc;

      // Jump Calendar directly to this transaction's date and month
      const [tYear, tMonth] = dateStr.split('-');
      calCurrentYear = parseInt(tYear, 10);
      calCurrentMonth = parseInt(tMonth, 10) - 1;
      calSelectedDateStr = dateStr;
      homeActiveYear = calCurrentYear;
      homeActiveMonth = calCurrentMonth;

      uniParsedData = null;
      uniImageDataUrl = null;
      isEditingFromUpload = false;

      save();
      renderAll();
      renderCalendar();
      renderFullTx();
      if(typeof renderTaxRelief === 'function') renderTaxRelief();
      if(el('cal-day-modal') && !el('cal-day-modal').classList.contains('hidden')){
        renderCalModalTxList(dateStr);
      }
      toast(`✅ Saved: ${merchant} · RM ${amt.toFixed(2)}`);
      checkAndPromptAccountOverdraft(newTx.accountId, newTx.amount);
    }
  } else if(uniCurrentMode === 'tax'){
    const taxNote = `[LHDN ${uniParsedData.taxReliefCat ? uniParsedData.taxReliefCat.toUpperCase() : 'LIFESTYLE'}] ${uniParsedData.taxReliefReason || 'Qualified tax relief receipt'}${formattedNote ? ' · ' + formattedNote : ''}`;
    const newTx = {
      id: uid('item'),
      type: 'expense',
      amount: amt,
      desc: merchant,
      category: selectedCat || 'shopping',
      date: dateStr,
      time: uniParsedData.time || currentTimeStr(),
      accountId: selectedAcc,
      paymentMethod: selectedPay,
      location: uniParsedData.location || null,
      note: taxNote,
      photo: photoToSave,
      createdAt: new Date().toISOString()
    };
    S.transactions.unshift(newTx);
    S.lastUsedAccId = selectedAcc;

    const [tYear, tMonth] = dateStr.split('-');
    calCurrentYear = parseInt(tYear, 10);
    calCurrentMonth = parseInt(tMonth, 10) - 1;
    calSelectedDateStr = dateStr;

    uniParsedData = null;
    uniImageDataUrl = null;
    isEditingFromUpload = false;

    save();
    renderAll();
    renderCalendar();
    renderFullTx();
    if(typeof renderTaxRelief === 'function') renderTaxRelief();
    if(el('cal-day-modal') && !el('cal-day-modal').classList.contains('hidden')){
      renderCalModalTxList(dateStr);
    }
    toast(`🏷️ LHDN Claim Saved: ${merchant} · RM ${amt.toFixed(2)}`);
    checkAndPromptAccountOverdraft(newTx.accountId, newTx.amount);
  } else if(uniCurrentMode === 'splitter'){
    const chosenCat = selectedCat || uniParsedData.category || 'food';
    const chosenDate = dateStr || today();
    const chosenPay = selectedPay || 'Cash';
    const chosenAcc = selectedAcc || '';

    activeSplitContext = {
      source: 'upload',
      originalTxId: null,
      merchant: merchant,
      amount: amt,
      category: chosenCat,
      subCategory: uniParsedData.subCategory || null,
      date: chosenDate,
      paymentMethod: chosenPay,
      accountId: chosenAcc,
      note: formattedNote || '',
      photo: photoToSave,
      items: (uniParsedData.items && Array.isArray(uniParsedData.items)) ? JSON.parse(JSON.stringify(uniParsedData.items)) : []
    };
    updateSplitterContextBanner();

    openSplitterModal();
    if(merchant && el('split-place-inp')) el('split-place-inp').value = merchant;
    if(uniParsedData.serviceChargePct !== undefined) setSplitSvc(uniParsedData.serviceChargePct);
    if(uniParsedData.sstPct !== undefined) setSplitSst(uniParsedData.sstPct);
    if(uniParsedData.discount && el('split-disc-inp')) el('split-disc-inp').value = uniParsedData.discount;
    if(uniParsedData.takeawayFee && el('split-pack-inp')) el('split-pack-inp').value = uniParsedData.takeawayFee;

    if(uniParsedData.items && Array.isArray(uniParsedData.items) && uniParsedData.items.length > 0){
      switchSplitMode('itemized');
      splitFriends = uniParsedData.items.map((it, idx) => ({
        name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
        amount: parseFloat(it.price) || 0
      }));
      renderSplitFriendsList();
    } else if(amt > 0){
      if(el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);
    }
    calcBillSplit();
    toast(`🍽️ Populated dishes into Meal Splitter!`);
  } else if(uniCurrentMode === 'recurring'){
    S.recurring.push({
      id: uid('rec'),
      type: 'expense',
      desc: merchant,
      amount: amt,
      category: selectedCat,
      freq: 'monthly',
      nextDue: dateStr,
      paymentMethod: selectedPay,
      createdAt: new Date().toISOString()
    });
    uniParsedData = null;
    uniImageDataUrl = null;
    isEditingFromUpload = false;
    save();
    renderAll();
    renderCalendar();
    toast(`🔁 Added recurring rule: ${merchant} · RM ${amt.toFixed(2)}/mo`);
  }
}

let activeSplitContext = null;

function updateSplitterContextBanner(){
  const banner = el('splitter-context-banner');
  const descEl = el('splitter-context-desc');
  const badgeEl = el('splitter-context-cat-badge');
  if(!banner) return;
  if(!activeSplitContext){
    banner.classList.add('hidden');
    return;
  }
  banner.classList.remove('hidden');
  const cat = catInfo('expense', activeSplitContext.category || 'food');
  const catName = cat ? `${cat.icon} ${cat.name}` : (activeSplitContext.category || 'Expense');
  if(badgeEl){
    badgeEl.textContent = catName;
  }
  if(descEl){
    if(activeSplitContext.originalTxId){
      descEl.innerHTML = `Splitting Logged Bill: <strong>${esc(activeSplitContext.merchant)}</strong> · Total: RM ${(activeSplitContext.amount||0).toFixed(2)}`;
    } else {
      descEl.innerHTML = `Splitting Receipt: <strong>${esc(activeSplitContext.merchant)}</strong> · Total: RM ${(activeSplitContext.amount||0).toFixed(2)}`;
    }
  }
}

function applyUploadToSplitterAndPromo(){
  if(!uniParsedData){
    toast('⚠️ Please upload a receipt first');
    return;
  }
  const d = uniParsedData;
  const merchantInp = el('uni-edit-merchant');
  const amountInp = el('uni-edit-amount');
  const catInp = el('uni-edit-category');
  const dateInp = el('uni-edit-date');
  const payInp = el('uni-edit-payment');
  const accInp = el('uni-edit-account');
  const noteInp = el('uni-edit-note');

  const merchant = (merchantInp?.value || d.merchant || d.store || 'Restaurant').trim();
  const amt = Math.abs(parseFloat(amountInp?.value !== undefined && amountInp.value !== '' ? amountInp.value : d.amount)) || 0;
  const chosenCat = catInp?.value || d.category || 'food';
  const chosenDate = dateInp?.value || d.date || today();
  const chosenPay = payInp?.value || d.paymentMethod || 'Cash';
  const chosenAcc = accInp?.value || d.accountId || S.lastUsedAccId || '';
  const chosenNote = (noteInp?.value !== undefined ? noteInp.value : formatItemsSummary(d)).trim();
  const photoToSave = uniImageDataUrl || photoData || null;

  activeSplitContext = {
    source: 'upload',
    originalTxId: null,
    merchant,
    amount: amt,
    category: chosenCat,
    subCategory: d.subCategory || null,
    date: chosenDate,
    paymentMethod: chosenPay,
    accountId: chosenAcc,
    note: chosenNote,
    photo: photoToSave,
    items: (d.items && Array.isArray(d.items)) ? JSON.parse(JSON.stringify(d.items)) : []
  };
  updateSplitterContextBanner();

  closeModal('universal-upload-modal');
  openSplitterModal(amt);

  if(merchant && el('split-place-inp')) el('split-place-inp').value = merchant;
  if(amt > 0 && el('split-bill-inp')) el('split-bill-inp').value = amt.toFixed(2);

  if(d.serviceChargePct !== undefined && d.serviceChargePct !== null) setSplitSvc(Number(d.serviceChargePct) || 0);
  if(d.sstPct !== undefined && d.sstPct !== null) setSplitSst(Number(d.sstPct) || 0);
  if(d.discount && el('split-disc-inp')) el('split-disc-inp').value = d.discount;
  if(d.takeawayFee && el('split-pack-inp')) el('split-pack-inp').value = d.takeawayFee;

  if(d.items && Array.isArray(d.items) && d.items.length > 0){
    switchSplitMode('itemized');
    splitFriends = d.items.map((it, idx) => ({
      name: it.name || (idx === 0 ? 'You (Me)' : `Friend ${idx}`),
      amount: Math.abs(parseFloat(it.price)) || 0
    }));
    renderSplitFriendsList();

    // If receipt has 2+ items, prefill B1F1 and 50% discount inputs
    if(d.items.length >= 2){
      const p1 = Math.abs(parseFloat(d.items[0].price)) || 0;
      const p2 = Math.abs(parseFloat(d.items[1].price)) || 0;
      if(el('b1f1-p1')) el('b1f1-p1').value = p1.toFixed(2);
      if(el('b1f1-p2')) el('b1f1-p2').value = p2.toFixed(2);
      if(el('p50-p1')) el('p50-p1').value = Math.max(p1, p2).toFixed(2);
      if(el('p50-p2')) el('p50-p2').value = Math.min(p1, p2).toFixed(2);
    }
  }

  calcBillSplit();

  isEditingFromUpload = true;
  splitterOpenedFromUpload = true;
  const backBtn = el('splitter-back-to-upload');
  if(backBtn) backBtn.classList.remove('hidden');
  const hBack = el('splitter-header-back-btn');
  if(hBack) hBack.classList.remove('hidden');

  const catObj = catInfo('expense', chosenCat);
  toast(`🍕 Loaded ${merchant} (${catObj?.name || chosenCat}) into Splitter!`);
}

let splitterOpenedFromUpload = false;

function backToUniversalUploadPreview(){
  closeModal('tx-modal');
  closeModal('splitter-modal');
  openModal('universal-upload-modal');
  renderUniversalPreview();
  if(el('tx-from-upload-bar')) el('tx-from-upload-bar').classList.add('hidden');
  const backBtn = el('splitter-back-to-upload');
  if(backBtn) backBtn.classList.add('hidden');
  const hBack = el('splitter-header-back-btn');
  if(hBack) hBack.classList.add('hidden');
  const txHBack = el('tx-modal-header-back-btn');
  if(txHBack) txHBack.classList.add('hidden');
  isEditingFromUpload = false;
  splitterOpenedFromUpload = false;
  activeSplitContext = null;
  updateSplitterContextBanner();
}

function handleTxModalBack(){
  if(isEditingFromUpload && uniParsedData){
    // Pull any values amended by user in tx-modal form so they are preserved
    const merchantVal = el('tx-desc')?.value?.trim();
    const amountVal = Math.abs(parseFloat(el('tx-amount')?.value));
    const dateVal = el('tx-date')?.value;
    const timeVal = el('tx-time')?.value;
    const noteVal = el('tx-note')?.value?.trim();
    const locVal = el('tx-location')?.value?.trim();
    const payVal = el('tx-paymethod-val')?.value;

    if(merchantVal) uniParsedData.merchant = merchantVal;
    if(!isNaN(amountVal) && amountVal > 0) uniParsedData.amount = amountVal;
    if(dateVal) uniParsedData.date = dateVal;
    if(timeVal) uniParsedData.time = timeVal;
    if(selCat) uniParsedData.category = selCat;
    if(selSubCat) uniParsedData.subCategory = selSubCat;
    if(noteVal !== undefined) uniParsedData.note = noteVal;
    if(locVal !== undefined) uniParsedData.location = locVal;
    if(payVal) uniParsedData.paymentMethod = payVal;
    if(photoData) uniImageDataUrl = photoData;

    backToUniversalUploadPreview();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? '‹ 已返回小票预览 (修改已同步保留)' : '‹ Back to receipt preview (amendments preserved)');
  } else {
    closeModal('tx-modal');
  }
}

function handleTxModalClose(){
  if(isEditingFromUpload){
    handleTxModalBack();
  } else {
    closeModal('tx-modal');
  }
}

function handleSplitterModalBack(){
  backToUniversalUploadPreview();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '‹ 已返回小票预览' : '‹ Back to receipt preview');
}

function handleSplitterModalClose(){
  if(splitterOpenedFromUpload){
    handleSplitterModalBack();
  } else {
    closeModal('splitter-modal');
  }
}

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
  const lower = String(methodKeyOrName).toLowerCase().trim();
  
  let targetName = 'Cash';
  let targetAccountType = '';
  
  if(lower.includes('tng') || lower.includes('touch') || lower.includes('rfid')){
    targetName = "Touch 'n Go eWallet";
    targetAccountType = 'tng';
  } else if(lower.includes('mae') || lower.includes('maybank')){
    targetName = 'Maybank (MAE / QR)';
    targetAccountType = 'maybank';
  } else if(lower.includes('grab')){
    targetName = 'GrabPay';
    targetAccountType = 'grab';
  } else if(lower.includes('shopee')){
    targetName = 'ShopeePay';
    targetAccountType = 'shopee';
  } else if(lower.includes('debit')){
    targetName = 'Debit Card';
    targetAccountType = 'bank';
  } else if(lower.includes('credit') || lower.includes('visa') || lower.includes('master')){
    targetName = 'Credit Card';
    targetAccountType = 'bank';
  } else if(lower.includes('cash') || lower.includes('tunai')){
    targetName = 'Cash';
    targetAccountType = 'cash';
  } else {
    const found = PAYMENT_METHODS.find(p => p.id === methodKeyOrName || p.name.toLowerCase() === lower);
    if(found) targetName = found.name;
  }
  
  selectPaymentMethod(targetName);

  // Auto-select corresponding bank/wallet account
  if(targetAccountType){
    const matchedAcc = S.accounts.find(a => {
      const aLower = a.name.toLowerCase();
      if(targetAccountType === 'tng') return aLower.includes('touch') || aLower.includes('tng');
      if(targetAccountType === 'maybank') return aLower.includes('maybank') || aLower.includes('mae');
      if(targetAccountType === 'grab') return aLower.includes('grab');
      if(targetAccountType === 'shopee') return aLower.includes('shopee');
      if(targetAccountType === 'cash') return a.type === 'cash' || aLower.includes('cash');
      if(targetAccountType === 'bank') return a.type === 'bank';
      return false;
    });
    if(matchedAcc){
      setTxAccount(matchedAcc.id);
    }
  }
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

  // 4. Payment Method & Account Mapping
  if(data.paymentMethod || data.payMethod || merchant){
    mapAndSetPaymentMethod(data.paymentMethod || data.payMethod || merchant);
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

  // 9. Attach & Display Receipt Photo Preview
  if(photoData){
    const prevEl = el('photo-prev');
    const phEl = el('photo-ph');
    if(prevEl){
      prevEl.src = photoData;
      prevEl.classList.remove('hidden');
    }
    if(phEl) phEl.classList.add('hidden');
  }

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

// ── 📁 SMART RECEIPT UPLOADER ──────────────────────────
async function startOCR(){
  openUniversalUpload('expense');
}

function compressReceiptForStorage(dataUrl){
  return new Promise((resolve) => {
    if(!dataUrl || !dataUrl.startsWith('data:image')) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      const maxDim = 1800; // Crisp resolution for AI OCR and receipt reading
      let w = img.width, h = img.height;
      if(w > maxDim || h > maxDim){
        if(w > h){
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function detectGPSLocation(){
  if(!navigator.geolocation){
    toast('⚠️ GPS not supported on this browser');
    return;
  }
  toast('📍 Detecting location…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);
      if(res.ok){
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.suburb || data.address.state_district || data.address.state || 'Malaysia';
        const area = data.address.suburb || data.address.neighbourhood || data.address.road || '';
        const locStr = area ? `${area}, ${city}` : city;
        if(el('tx-location')) el('tx-location').value = locStr;
        toggleTxMoreDetails(true);
        toast(`📍 Location detected: ${locStr}`);
        return;
      }
    } catch(e){}
    if(el('tx-location')) el('tx-location').value = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    toggleTxMoreDetails(true);
    toast('📍 Coordinates tagged');
  }, () => {
    toast('⚠️ Location permission denied or unavailable');
  }, { timeout: 8000 });
}



// ── 📋 DUPLICATE LAST TRANSACTION ─────────────────────
function duplicateLastTx(){
  if(!S.transactions.length){
    toast('⚠️ No previous transaction found to duplicate');
    return;
  }
  // The newest transaction is the first in chronological unshifted array
  const last = S.transactions[0];
  const duplicated = {
    ...last,
    id: uid('item'),
    date: today(),
    note: (last.note ? last.note + ' (Copy)' : 'Copy'),
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(duplicated);
  save();
  renderAll();
  toast(`📋 Duplicated: "${duplicated.desc}" (${fmt(duplicated.amount)})`);
}

// ── 📊 GOOGLE SHEETS CLOUD BACKUP (APPS SCRIPT) ───────
function openGSheetModal(){
  el('gsheet-url-inp').value = S.gsheetUrl || '';
  openModal('gsheet-modal');
}

function saveGSheetUrl(){
  const url = el('gsheet-url-inp').value.trim();
  S.gsheetUrl = url;
  save();
  closeModal('gsheet-modal');
  renderProfile();
  toast(url ? '✅ Google Sheets URL configured' : 'ℹ️ Google Sheets URL cleared');
}

async function syncGSheet(){
  if(!S.gsheetUrl){
    toast('⚠️ Please configure your Google Sheets URL first');
    openGSheetModal();
    return;
  }

  const syncBtn = el('sync-now-btn');
  if(syncBtn) syncBtn.style.opacity = '0.5';
  toast('☁️ Syncing to Google Sheets…');

  const exportPayload = {
    transactions: S.transactions.map(t=>{
      const cat = catInfo(t.type, t.category);
      const acc = S.accounts.find(a=>a.id===t.accountId);
      return {
        id: t.id,
        date: t.date,
        time: t.time || '',
        type: t.type,
        category: cat.name,
        desc: t.desc,
        amount: Number(t.amount)||0,
        accountName: acc ? acc.name : 'Unknown Account',
        paymentMethod: t.paymentMethod || '',
        location: t.location || '',
        note: t.note || ''
      };
    })
  };

  try {
    const res = await fetch(S.gsheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportPayload)
    });

    const nowStr = new Date().toLocaleTimeString('en-MY', {hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'});
    S.lastSync = nowStr;
    save();
    renderProfile();
    toast(`✅ Synced ${S.transactions.length} entries to Google Sheets!`);
  } catch(err){
    console.error('Google Sheets sync error:', err);
    toast('⚠️ Could not sync. Please check your Apps Script URL');
  } finally {
    if(syncBtn) syncBtn.style.opacity = '1';
  }
}

// ── BUDGET ─────────────────────────────────────────────
function openBudgetModal(){selBudCat=null;el('bud-amount').value='';buildCats('bud-cats','expense',id=>selBudCat=id);openModal('budget-modal');}
function saveBudget(){
  const amount=parseFloat(el('bud-amount').value);
  if(!selBudCat){toast('⚠️ Pick a category');return;}
  if(!amount||amount<=0){toast('⚠️ Enter a limit');return;}
  const idx=S.budgets.findIndex(b=>b.category===selBudCat);
  if(idx>=0) S.budgets[idx].limit=amount; else S.budgets.push({category:selBudCat,limit:amount});
  save();renderAll();closeModal('budget-modal');toast('✅ Budget saved!');
}

// ── GOALS ──────────────────────────────────────────────
function openGoalModal(){
  selGoalIcon=GOAL_ICONS[0];
  el('goal-name-inp').value=''; el('goal-target-inp').value=''; el('goal-deadline-inp').value='';
  const picker=el('goal-icon-picker'); picker.innerHTML='';
  GOAL_ICONS.forEach(ico=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='icon-opt'+(ico===selGoalIcon?' on':'');
    btn.textContent=ico;
    btn.onclick=()=>{picker.querySelectorAll('.icon-opt').forEach(x=>x.classList.remove('on'));btn.classList.add('on');selGoalIcon=ico;};
    picker.appendChild(btn);
  });
  openModal('goal-modal');
}
function saveGoal(){
  const name=el('goal-name-inp').value.trim(), target=parseFloat(el('goal-target-inp').value);
  if(!name){toast('⚠️ Enter a goal name');return;}
  if(!target||target<=0){toast('⚠️ Enter a target amount');return;}
  S.goals.push({id: uid('item'),name,icon:selGoalIcon,target,saved:0,deadline:el('goal-deadline-inp').value||null,createdAt:new Date().toISOString()});
  save();renderGoals();closeModal('goal-modal');toast('🎯 Goal created!');
}

function openDepositModal(id){
  el('dep-goal-id').value=id; el('dep-amount').value='';
  openModal('deposit-modal');
  setTimeout(()=>el('dep-amount').focus(),200);
}
function saveDeposit(){
  const id=el('dep-goal-id').value, amount=parseFloat(el('dep-amount').value);
  if(!amount||amount<=0){toast('⚠️ Enter an amount');return;}
  const g=S.goals.find(x=>x.id===id); if(!g) return;
  g.saved=Math.min(Number(g.saved||0)+amount,Number(g.target));
  save();renderGoals();closeModal('deposit-modal');toast('✅ '+fmt(amount)+' added!');
  if(g.saved>=g.target) setTimeout(()=>toast('🎉 Goal "'+g.name+'" reached!'),600);
}

// ── REMINDERS ──────────────────────────────────────────
function openReminderModal(){selRemCat=null;el('rem-name-inp').value='';el('rem-amount-inp').value='';el('rem-date-inp').value='';buildCats('rem-cats','expense',id=>selRemCat=id);openModal('reminder-modal');}
function saveReminder(){
  const name=el('rem-name-inp').value.trim(), amount=parseFloat(el('rem-amount-inp').value), date=el('rem-date-inp').value;
  if(!name){toast('⚠️ Enter a name');return;}
  if(!amount||amount<=0){toast('⚠️ Enter an amount');return;}
  if(!date){toast('⚠️ Pick a due date');return;}
  S.reminders.push({id: uid('item'),name,amount,date,category:selRemCat||'bills',paid:false,createdAt:new Date().toISOString()});
  save();renderReminders();renderDueSoon();closeModal('reminder-modal');toast('🔔 Reminder set!');
}

// ── RECURRING ──────────────────────────────────────────
function openRecModal(){selRecType='expense';selRecCat=null;el('rec-desc-inp').value='';el('rec-amount-inp').value='';el('rec-start-inp').value=today();el('rec-freq-sel').value='monthly';setRecType('expense');openModal('rec-modal');}
function setRecType(type){selRecType=type;el('rec-type-exp').classList.toggle('on',type==='expense');el('rec-type-inc').classList.toggle('on',type==='income');buildCats('rec-cats',type,id=>selRecCat=id);}
function saveRecurring(){
  const desc=el('rec-desc-inp').value.trim(), amount=parseFloat(el('rec-amount-inp').value), start=el('rec-start-inp').value;
  if(!desc){toast('⚠️ Enter a description');return;}
  if(!amount||amount<=0){toast('⚠️ Enter an amount');return;}
  if(!selRecCat){toast('⚠️ Pick a category');return;}
  S.recurring.push({id: uid('item'),type:selRecType,desc,amount,category:selRecCat,freq:el('rec-freq-sel').value,nextDue:start,paymentMethod:'Auto-Debit',createdAt:new Date().toISOString()});
  applyRecurring();renderAll();closeModal('rec-modal');toast('🔁 Recurring saved!');
}

// ── DEBTS ──────────────────────────────────────────────
function openDebtModal(){selDebtDir='owe';el('debt-person-inp').value='';el('debt-amount-inp').value='';el('debt-note-inp').value='';el('debt-due-inp').value='';setDebtDir('owe');openModal('debt-modal');}
function setDebtDir(dir){selDebtDir=dir;el('debt-owe-btn').classList.toggle('on',dir==='owe');el('debt-lent-btn').classList.toggle('on',dir==='lent');}
function saveDebt(){
  const person=el('debt-person-inp').value.trim(), amount=parseFloat(el('debt-amount-inp').value);
  if(!person){toast('⚠️ Enter a name');return;}
  if(!amount||amount<=0){toast('⚠️ Enter an amount');return;}
  S.debts.push({id: uid('item'),dir:selDebtDir,person,amount,remaining:amount,note:el('debt-note-inp').value.trim(),due:el('debt-due-inp').value||null,settled:false,createdAt:new Date().toISOString()});
  save();renderDebts();closeModal('debt-modal');toast('💸 Debt logged!');
}

// ── TRANSFERS & BALANCING (REMOVED) ───

// ── 🌸 GIRL PERIOD & HEALTH CARE TRACKER ENGINE ───────────
// Items bought related to period (sanitary, pain relief, warming supplies).
function isPeriodCareExpense(t){
  if(!t) return false;
  if(t.subCategory === 'health_period_care') return true;
  const desc = (t.desc || '').toLowerCase();
  const note = (t.note || '').toLowerCase();
  const cat = t.category || '';
  const kw = [
    '卫生巾', '暖宫贴', '暖宝宝', '卫生棉', '红糖', '止痛药', 'panadol menstrual', 'midol',
    'sanitary', 'pad', 'tampon', 'period', '经期', '月经', 'menstrual', 'pantyliner', '护垫',
    '月经杯', '安睡裤', '暖宫', '姜茶', 'ginger tea', 'brown sugar', 'kotex', 'laurier', 'sofy', 'whisper'
  ];
  return (cat === 'health' || cat === 'shopping' || cat === 'personal' || cat === 'other' || cat === 'groceries' || cat === 'food') && 
    kw.some(k => desc.includes(k) || note.includes(k));
}

let homePeriodNavClickTimer = null;
function handleHomePeriodNavClick(ev){
  if(ev) ev.stopPropagation();
  clearTimeout(homePeriodNavClickTimer);
  homePeriodNavClickTimer = setTimeout(() => go('home'), 260);
}

function updateHomePeriodNavAppearance(onPeriod){
  const navIcon = el('home-period-nav-icon');
  const navLabel = el('home-period-nav-label');
  if(navIcon) navIcon.innerHTML = `<span class="nav-dual-icon"><span>${onPeriod ? '🌸' : '⌂'}</span><span>${onPeriod ? '⌂' : '🌸'}</span></span>`;
  if(navLabel) navLabel.textContent = onPeriod ? 'Period Care' : (S.lang === 'zh' ? '首页' : 'Home');
}

function toggleHomePeriodNav(ev){
  if(ev){
    ev.preventDefault();
    ev.stopPropagation();
  }
  clearTimeout(homePeriodNavClickTimer);
  const onPeriod = el('page-period')?.classList.contains('active');
  go(onPeriod ? 'home' : 'period');
}

// 2. Items eaten and drank that affect period (Cold/iced drinks, caffeine, spicy food, warming teas, dark chocolate)
function isPeriodDietAffectingTx(t){
  if(!t) return false;
  const desc = (t.desc || '').toLowerCase();
  const note = (t.note || '').toLowerCase();
  const cat = t.category || '';
  
  const dietKeywords = [
    // Cold & Iced items (worsens cramps / uterine vasoconstriction)
    '冰', '冷', '奶茶', '水冷', '雪糕', '冰淇淋', '沙拉', '刺身', '生鱼片', '生冷', 'ice', 'iced', 'cold', 'boba', 'bubble tea', 'frappe', 'slush', 'gelato', 'sundae', 'smoothie', 'salad', 'sashimi', 'frap', 'chill', 'cooler', 'starbucks', 'chagee', 'mixue', 'tealive', 'gong cha', 'koi', 'boost juice',
    // Spicy & Inflammatory items
    '麻辣', '火锅', '辣', '冬阴功', '辣椒', 'spicy', 'chili', 'hotpot', 'curry', 'mala', 'tomyam', 'sambal', 'kimchi', 'ramen',
    // Caffeine items
    '咖啡', '美式', '拿铁', '浓缩', 'espresso', 'latte', 'coffee', 'caffeine', 'cappuccino', 'mocha', 'kopi', 'zus', 'richiamo',
    // Helpful soothing items
    '黑巧', '黑巧克力', 'dark chocolate', 'chocolate', '热汤', '汤', 'soup', 'herbal', 'tea', '茶', '姜', 'ginger', '豆浆', 'soy milk', 'warm'
  ];

  if(cat === 'food' || cat === 'groceries' || cat === 'shopping' || cat === 'other'){
    if(dietKeywords.some(k => desc.includes(k) || note.includes(k))) return true;
    if(t.items && Array.isArray(t.items)){
      return t.items.some(it => {
        const iname = (it.name || '').toLowerCase();
        return dietKeywords.some(k => iname.includes(k));
      });
    }
  }
  return false;
}

// 3. Combined filter: Only items bought related to period OR food/drinks that affect period
function isPeriodRelevantTx(t){
  return isPeriodCareExpense(t) || isPeriodDietAffectingTx(t);
}

function initPeriodTrackerState(){
  if(!S.periodTracker){
    S.periodTracker = {
      lastPeriodDate: null,
      hasSetFirstDate: false,
      periodLength: 5,
      cycleLength: 28,
      history: []
    };
  }
}

function getPeriodPhaseInfo(){
  initPeriodTrackerState();
  const pt = S.periodTracker;
  if(!pt.lastPeriodDate || !pt.hasSetFirstDate){
    return {
      isConfigured: false,
      pt,
      diffDays: 0,
      currentCycleDay: 0,
      cycleDays: pt.cycleLength || 28,
      periodDays: pt.periodLength || 5,
      nextPeriodDate: new Date(),
      daysToNext: 0,
      phase: 'unconfigured'
    };
  }

  const lastD = new Date(pt.lastPeriodDate + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - lastD) / (1000 * 60 * 60 * 24));

  const cycleDays = pt.cycleLength || 28;
  const periodDays = pt.periodLength || 5;

  const currentCycleDay = (diffDays % cycleDays) + 1;
  const nextPeriodDate = new Date(lastD);
  nextPeriodDate.setDate(lastD.getDate() + Math.ceil(diffDays / cycleDays) * cycleDays);
  if(nextPeriodDate <= now){
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleDays);
  }

  const daysToNext = Math.max(0, Math.ceil((nextPeriodDate - now) / (1000 * 60 * 60 * 24)));

  // Phase logic
  let phase = 'safe';
  if(currentCycleDay <= periodDays){
    phase = 'period';
  } else if(currentCycleDay >= (cycleDays - 16) && currentCycleDay <= (cycleDays - 10)){
    phase = 'ovulation';
  } else if(daysToNext <= 5){
    phase = 'pms';
  }

  return {
    isConfigured: true,
    pt,
    diffDays,
    currentCycleDay,
    cycleDays,
    periodDays,
    nextPeriodDate,
    daysToNext,
    phase
  };
}

function saveInitialPeriodFirstDay(){
  initPeriodTrackerState();
  const inp = el('period-first-day-input');
  if(!inp) return;
  const val = inp.value;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(!val){
    toast(isZh ? '⚠️ 请选择有效的月经第一天日期' : '⚠️ Select a valid date');
    return;
  }
  S.periodTracker.lastPeriodDate = val;
  S.periodTracker.hasSetFirstDate = true;
  S.periodTracker.history.unshift({ startDate: val, endDate: null, note: isZh ? '初始设置月经开潮日' : 'Initial Period Start Date' });
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '🎉 已成功设定开潮日！智能推算已开启。后续修改可在【⚙️ 设置】或双击日历。' : '🎉 Saved period start date! Predictions enabled.');
}

function openPeriodTrackerModal(){
  go('period');
}

function renderPeriodTrackerUI(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const info = getPeriodPhaseInfo();

  const setupBar = el('period-first-day-setup-bar');
  const phaseBadge = el('period-phase-badge');
  const daysNum = el('period-days-num');
  const nextDateTxt = el('period-next-date-txt');
  const ovulationTxt = el('period-ovulation-txt');
  const cycleLenTxt = el('period-cycle-len-txt');
  const tipBody = el('period-partner-tip-body');

  if(cycleLenTxt) cycleLenTxt.textContent = `${info.cycleDays} ${isZh ? '天周期' : 'd cycle'} / ${info.periodDays} ${isZh ? '天经期' : 'd period'}`;

  if(!info.isConfigured){
    // 🌸 First date NOT set yet!
    if(setupBar){
      setupBar.classList.remove('hidden');
      const firstInp = el('period-first-day-input');
      if(firstInp && !firstInp.value) firstInp.value = today();
    }
    if(phaseBadge){
      phaseBadge.textContent = isZh ? `🌸 尚未设置开潮日` : `🌸 First Date Not Set`;
      phaseBadge.style.background = '#6b7280';
    }
    if(daysNum) daysNum.textContent = '--';
    if(nextDateTxt) nextDateTxt.textContent = isZh ? `请先在上方输入上一次月经第一天` : `Enter last period start date above`;
    if(ovulationTxt) ovulationTxt.textContent = '--';
    if(tipBody) tipBody.innerHTML = isZh ? 
      '🌸 <strong>欢迎使用生理期预测</strong>：在上方输入月经第一天，即可解锁精确开潮倒计时与排卵期推算！' : 
      '🌸 <strong>Welcome</strong>: Set your period start date above to enable cycle predictions!';
  } else {
    // 🩸 Active period tracker configured!
    if(setupBar) setupBar.classList.add('hidden');

    const npDateStr = fmtDate(info.nextPeriodDate.toISOString().split('T')[0]);
    if(nextDateTxt) nextDateTxt.textContent = isZh ? `预计下一次开潮日: ${npDateStr}` : `Expected Next Period: ${npDateStr}`;

    const ovStart = new Date(info.nextPeriodDate);
    ovStart.setDate(info.nextPeriodDate.getDate() - 14);
    const ovStr = fmtDate(ovStart.toISOString().split('T')[0]);
    if(ovulationTxt) ovulationTxt.textContent = ovStr;

    if(info.phase === 'period'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `经期第 ${info.currentCycleDay} 天` : `Period Day ${info.currentCycleDay}`;
        phaseBadge.style.background = '#ec4899';
      }
      if(daysNum) daysNum.textContent = isZh ? `第 ${info.currentCycleDay} 天` : `DAY ${info.currentCycleDay}`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '☕ <strong>准备热红糖水与暖宫贴</strong>：生理期体温偏低，避免冷饮生食，主动为她准备热敷包与红糖姜茶。' : 
        '☕ <strong>Prepare warm brown sugar water & heating pad</strong>: Avoid cold drinks, be extra gentle!';
    } else if(info.phase === 'pms'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `经前倒计时` : `PMS Warning`;
        phaseBadge.style.background = '#f59e0b';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '🍫 <strong>经前情绪较敏感，准备甜食小惊喜</strong>：月经即将来临，多包容体谅，提前备齐卫生用品。' : 
        '🍫 <strong>PMS Notice</strong>: Be extra patient, prepare dark chocolate and ensure sanitary supplies are stocked up!';
    } else if(info.phase === 'ovulation'){
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `排卵期 / 易孕期` : `Fertile Window`;
        phaseBadge.style.background = '#8b5cf6';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '🌸 <strong>排卵期精力充沛，心情愉快</strong>：适合一起户外散步运动、约会，保持充足睡眠与健康饮食。' : 
        '🌸 <strong>Fertile Window</strong>: Great energy levels for outdoor activities and romantic dates!';
    } else {
      if(phaseBadge){
        phaseBadge.textContent = isZh ? `安全期` : `Safe Period`;
        phaseBadge.style.background = '#10b981';
      }
      if(daysNum) daysNum.textContent = `${info.daysToNext} DAYS`;
      if(tipBody) tipBody.innerHTML = isZh ? 
        '✨ <strong>身体状态处于平静期</strong>：维持规律作息，关心对方日常生活，保持好心情！' : 
        '✨ <strong>Stable Phase</strong>: Maintain balanced lifestyle, adequate rest, and good vibes!';
    }
  }

  // Render Auto-Grouped Period Expenses List
  const periodTxs = S.transactions.filter(t => t.type === 'expense' && isPeriodCareExpense(t));
  const periodTotal = periodTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const expTotalEl = el('period-month-expense-total');
  const expListEl = el('period-month-expense-list');

  if(expTotalEl) expTotalEl.textContent = fmt(periodTotal);
  if(expListEl){
    expListEl.innerHTML = '';
    if(!periodTxs.length){
      expListEl.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:8px">${isZh ? '暂无自动归类的经期用品开销' : 'No period care expenses logged yet.'}</div>`;
    } else {
      periodTxs.slice(0, 6).forEach(t => {
        const row = document.createElement('div');
        row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px">
            <span>🌸</span>
            <div>
              <div style="font-weight:700;color:var(--text)">${esc(t.desc)}</div>
              <div style="font-size:9.5px;color:var(--muted)">${fmtDate(t.date)} · ${esc(t.paymentMethod||'Cash')}</div>
            </div>
          </div>
          <div style="font-weight:800;color:var(--red)">${fmt(t.amount)}</div>
        `;
        expListEl.appendChild(row);
      });
    }
  }

  if(el('period-history-list')) renderPeriodHistoryList();
  if(el('period-future-predictions-list')) renderAiPeriodForecastTable();
  renderPeriodCalendarGrid();
}

function renderPeriodHistoryList(){
  const list = el('period-history-list');
  const countEl = el('period-history-count');
  if(!list) return;
  list.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const history = (S.periodTracker && S.periodTracker.history) ? S.periodTracker.history : [];
  if(countEl) countEl.textContent = isZh ? `已记录 ${history.length} 次` : `${history.length} recorded`;

  if(!history.length){
    list.innerHTML = `<div style="font-size:11px;color:var(--muted);text-align:center;padding:10px">${isZh ? '暂无经期历史记录，点击上方按钮添加' : 'No cycle records yet. Tap buttons above to log.'}</div>`;
    return;
  }

  history.slice(0, 5).forEach((h, idx) => {
    const item = document.createElement('div');
    item.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
    const startDateStr = fmtDate(h.startDate);
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px">🩸</span>
        <div>
          <div style="font-weight:800;color:var(--text)">${startDateStr}</div>
          <div style="font-size:10px;color:var(--muted)">${h.note || (isZh ? '月经来潮' : 'Period Start')}</div>
        </div>
      </div>
      <button type="button" class="del-btn" style="font-size:11px" onclick="deletePeriodHistoryRecord(${idx})">🗑</button>
    `;
    list.appendChild(item);
  });
}

function logPeriodStartToday(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tStr = today();
  S.periodTracker.lastPeriodDate = tStr;
  S.periodTracker.history.unshift({ startDate: tStr, endDate: null, note: isZh ? '月经来潮' : 'Period Started' });
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '🩸 已记录今天月经来潮！' : '🩸 Logged period start date today!');
}

function logPeriodEndToday(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  if(S.periodTracker.history.length > 0){
    S.periodTracker.history[0].endDate = today();
  }
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '✅ 已记录经期结束！' : '✅ Logged period end date today!');
}

function deletePeriodHistoryRecord(idx){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  S.periodTracker.history.splice(idx, 1);
  save();
  renderPeriodTrackerUI();
  toast(isZh ? '已删除该次经期记录' : 'Deleted cycle record');
}

function openPeriodSettingsModal(){
  initPeriodTrackerState();
  const pt = S.periodTracker;
  const dateInp = el('period-settings-last-date');
  const cycleInp = el('period-settings-cycle-length');
  const periodInp = el('period-settings-period-length');

  if(dateInp) dateInp.value = /^\d{4}-\d{2}-\d{2}$/.test(pt.lastPeriodDate || '') ? pt.lastPeriodDate : today();
  if(cycleInp) cycleInp.value = pt.cycleLength || 28;
  if(periodInp) periodInp.value = pt.periodLength || 5;

  openModal('period-cycle-settings-modal');
}

function savePeriodSettings(){
  initPeriodTrackerState();
  const dateInp = el('period-settings-last-date');
  const cycleInp = el('period-settings-cycle-length');
  const periodInp = el('period-settings-period-length');
  const dateValue = dateInp ? dateInp.value : '';
  const cycleLength = cycleInp ? Number(cycleInp.value) : NaN;
  const periodLength = periodInp ? Number(periodInp.value) : NaN;

  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)){
    toast(isZh ? '⚠️ 请选择有效的月经第一天日期' : '⚠️ Select a valid last period start date');
    return;
  }
  if(!Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 90){
    toast(isZh ? '⚠️ 周期天数必须是 21 至 90 天' : '⚠️ Cycle length must be between 21 and 90 days');
    return;
  }
  if(!Number.isInteger(periodLength) || periodLength < 1 || periodLength > 14 || periodLength >= cycleLength){
    toast(isZh ? '⚠️ 经期天数必须是 1 至 14 天，且少于周期天数' : '⚠️ Period length must be 1–14 days and shorter than the cycle');
    return;
  }

  const pt = S.periodTracker;
  const dateChanged = pt.lastPeriodDate !== dateValue;
  pt.lastPeriodDate = dateValue;
  pt.cycleLength = cycleLength;
  pt.periodLength = periodLength;
  pt.hasSetFirstDate = true;
  if(!Array.isArray(pt.history)) pt.history = [];
  if(dateChanged || !pt.history.some(h => h && h.startDate === dateValue)){
    pt.history.unshift({
      startDate: dateValue,
      endDate: null,
      note: isZh ? '周期设置更新' : 'Cycle settings updated'
    });
  }

  save();
  closeModal('period-cycle-settings-modal');
  renderPeriodTrackerUI();
  toast(isZh ? '✅ 周期设置已保存！' : '✅ Cycle settings saved!');
}

function quickLogPeriodExpense(){
  closeModal('period-tracker-modal');
  openTxModal('expense');
  el('tx-desc').value = (typeof S !== 'undefined' && S && S.lang === 'zh') ? '卫生巾 / 暖宫贴' : 'Sanitary Pads / Heating Pad';
  selCat = 'health';
  buildCats('tx-cats', 'expense', id => selCat = id);
  toast(typeof S !== 'undefined' && S && S.lang === 'zh' ? '🛒 已快捷预填卫生用品开销' : '🛒 Pre-filled Sanitary Expense');
}

async function runAiPeriodDiagnosis(){
  const resultBox = el('period-ai-diagnosis-result');
  const contentEl = el('period-ai-result-content');
  if(!resultBox || !contentEl) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  resultBox.classList.remove('hidden');
  contentEl.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:6px 0"><div class="ai-scan-spinner" style="width:16px;height:16px"></div><span>${isZh ? '正在召唤 Google Gemini AI 分析生理周期与开销数据…' : 'Gemini AI is analyzing cycle data and care tips…'}</span></div>`;

  const info = getPeriodPhaseInfo();
  const npDateStr = fmtDate(info.nextPeriodDate.toISOString().split('T')[0]);

  const sanitaryTxs = S.transactions.filter(t => t.category === 'health' || (t.desc && (t.desc.includes('卫生') || t.desc.includes('暖宫') || t.desc.includes('Pad') || t.desc.includes('Care'))));
  const totalSanitaryExp = sanitaryTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);

  // Include the user's recorded flow, pain, and symptoms so AI advice reflects their actual logs.
  const recentPeriodLogs = (info.pt.history || []).slice(0, 8).map(h => {
    const symptoms = Array.isArray(h.symptoms) && h.symptoms.length ? h.symptoms.join(', ') : 'none';
    return `${h.startDate || 'unknown date'}: flow=${h.flow || 'unknown'}, pain=${h.pain || 'unknown'}, symptoms=${symptoms}`;
  });
  const aiDietItems = S.transactions
    .filter(t => t.type === 'expense' && isPeriodDietAffectingTx(t) && !isPeriodCareExpense(t))
    .slice(0, 10)
    .map(t => `${t.date}: ${t.desc} (RM ${Number(t.amount || 0).toFixed(2)})`);
  const recentLogText = recentPeriodLogs.length ? recentPeriodLogs.join(' | ') : 'No symptom logs yet';
  const aiDietText = aiDietItems.length ? aiDietItems.join(' | ') : 'No AI-flagged food or drink items yet';

  const promptText = `User Cycle Data:
- Current Phase: ${info.phase} (Cycle Day ${info.currentCycleDay} of ${info.cycleDays})
- Period Duration: ${info.periodDays} days
- Last Period Start Date: ${info.pt.lastPeriodDate}
- Next Period Estimated: ${npDateStr}
- Days to Next: ${info.daysToNext}
- Total Sanitary/Care Expenses Logged: RM ${totalSanitaryExp.toFixed(2)}
- Recent user symptom logs (use these details): ${recentLogText}
- AI-flagged period-impacting food/drink items: ${aiDietText}

Please provide a warm, professional, caring health summary and partner care advice in ${isZh ? 'Chinese' : 'English'}. Include 3 sections:
1. 🌸 Health Status & Cycle Analysis
2. 🍵 Nutrition, Warm Diet & Pain Relief Tips
3. 💖 Practical Partner Action Guide for Today`;

  if(S.geminiApiKey){
    try {
      const generation = await generateGeminiContent(S.geminiApiKey, {
        contents: [{ parts: [{ text: promptText }] }]
      });
      const data = generation.data;
      if(data?.candidates?.[0]?.content){
        const txt = data.candidates[0].content.parts[0].text;
        contentEl.innerHTML = `<div style="white-space:pre-line;line-height:1.6">${esc(txt)}</div>`;
        return;
      }
    } catch(e) {
      console.warn('Gemini API call error:', e);
    }
  }

  // Smart On-Device AI Diagnosis Fallback if API Key not present or offline
  const recordedInsightHtml = recentPeriodLogs.length ?
    `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.25);border-radius:10px;padding:8px;margin-bottom:10px;font-size:11px"><strong>🧾 Recorded details used:</strong><br>${esc(recentLogText)}</div>` : '';
  setTimeout(() => {
    let html = '';
    if(info.phase === 'period'){
      html = isZh ? `
        <strong>🌸 1. 经期状态与生理分析：</strong><br>
        当前处于月经期第 ${info.currentCycleDay} 天。体温稍有降低，属于子宫内膜剥落充血期，可能伴随轻微腹痛或疲惫。<br><br>
        <strong>🍵 2. 营养暖宫与止痛建议：</strong><br>
        • 多喝温热水或红糖姜茶，促进血气循环。<br>
        • 补充富含铁质与蛋白质食物（如菠菜、红枣、瘦肉）。<br>
        • 避免生冷冰饮、咖啡因及辣刺激性食物。<br><br>
        <strong>💖 3. 给伴侣的贴心行动指南：</strong><br>
        • 主动为她贴好暖宫贴或准备热水袋。<br>
        • 陪伴休息，承担家务，避免让她受凉。
      ` : `
        <strong>🌸 1. Period Health Diagnosis:</strong><br>
        Currently on Day ${info.currentCycleDay} of menstruation. Body temperature is lower and energy may be subdued.<br><br>
        <strong>🍵 2. Warm Diet & Relief Recommendations:</strong><br>
        • Drink warm ginger brown sugar tea or warm water.<br>
        • Consume iron-rich foods (spinach, dates, lean meats).<br>
        • Avoid raw/cold drinks and excessive caffeine.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Prepare a warm heating pad or water bottle.<br>
        • Help out with daily tasks and ensure she gets adequate rest.
      `;
    } else if(info.phase === 'pms'){
      html = isZh ? `
        <strong>🌸 1. 经前状态分析：</strong><br>
        距离下一次月经预估还有 ${info.daysToNext} 天。属于黄体期末期，体内激素波动，可能出现情绪敏感、易怒或水肿。<br><br>
        <strong>🍵 2. 情绪纾解与调理：</strong><br>
        • 适当吃黑巧克力（含镁量高，缓解紧张情绪）。<br>
        • 避免熬夜，保持充足睡眠。<br><br>
        <strong>💖 3. 伴侣贴心关怀：</strong><br>
        • 多给予情绪安抚与关怀，提前备齐卫生用品。
      ` : `
        <strong>🌸 1. PMS Phase Diagnosis:</strong><br>
        ${info.daysToNext} days to next period. Hormones fluctuate, causing potential mood sensitivity or bloating.<br><br>
        <strong>🍵 2. Relief Tips:</strong><br>
        • Enjoy dark chocolate rich in magnesium.<br>
        • Ensure 8+ hours of restful sleep.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Be patient, gentle, and ensure care supplies are ready.
      `;
    } else {
      html = isZh ? `
        <strong>🌸 1. 生理状态分析：</strong><br>
        处于平静期/安全期，气血恢复良好，精力充沛。<br><br>
        <strong>🍵 2. 养生建议：</strong><br>
        • 维持规律作息与适度运动。<br>
        • 多摄取新鲜水果蔬菜与水分。<br><br>
        <strong>💖 3. 伴侣关怀：</strong><br>
        • 适合一起安排户外散步或愉快约会！
      ` : `
        <strong>🌸 1. General Phase Diagnosis:</strong><br>
        Stable phase with high energy and balanced body vitality.<br><br>
        <strong>🍵 2. Wellness Tips:</strong><br>
        • Maintain active lifestyle and drink plenty of water.<br><br>
        <strong>💖 3. Partner Care Guide:</strong><br>
        • Great time for outdoor activities and romantic dates!
      `;
    }
    contentEl.innerHTML = recordedInsightHtml + html;
  }, 400);
}

let currentSelectedFlow = 'medium';
let currentSelectedPain = 'none';
let currentSelectedSymptoms = [];

function selectPeriodFlow(flow){
  currentSelectedFlow = flow;
  document.querySelectorAll('.period-flow-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.flow === flow);
  });
}

function selectPeriodPain(pain){
  currentSelectedPain = pain;
  document.querySelectorAll('.period-pain-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.pain === pain);
  });
}

function togglePeriodSymptom(sym){
  const idx = currentSelectedSymptoms.indexOf(sym);
  if(idx === -1) currentSelectedSymptoms.push(sym);
  else currentSelectedSymptoms.splice(idx, 1);

  document.querySelectorAll('.period-sym-btn').forEach(btn => {
    if(btn.dataset.sym === sym){
      btn.classList.toggle('on', currentSelectedSymptoms.includes(sym));
    }
  });
}

function savePeriodSymptomLog(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const tStr = selectedPeriodInspectorDateStr || today();
  const existing = S.periodTracker.history.find(h => h.startDate === tStr);
  const symText = currentSelectedSymptoms.length > 0 ? currentSelectedSymptoms.join(', ') : 'No symptoms';

  if(existing){
    existing.flow = currentSelectedFlow;
    existing.pain = currentSelectedPain;
    existing.symptoms = [...currentSelectedSymptoms];
    existing.note = `Flow: ${currentSelectedFlow}, Pain: ${currentSelectedPain}, Symptoms: ${symText}`;
  } else {
    S.periodTracker.history.unshift({
      startDate: tStr,
      endDate: null,
      flow: currentSelectedFlow,
      pain: currentSelectedPain,
      symptoms: [...currentSelectedSymptoms],
      note: `Flow: ${currentSelectedFlow}, Pain: ${currentSelectedPain}, Symptoms: ${symText}`
    });
  }

  save();
  renderPeriodTrackerUI();
  closeModal('period-date-care-modal');
  toast(isZh ? `💾 已保存 ${fmtDate(tStr)} 的生理症状与痛感记录！` : `💾 Saved period flow & symptom log for ${fmtDate(tStr)}!`);
}

function renderAiPeriodForecastTable(){
  const container = el('period-future-predictions-list');
  if(!container) return;
  container.innerHTML = '';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const info = getPeriodPhaseInfo();

  let baseDate = new Date(info.nextPeriodDate);

  for(let i = 1; i <= 3; i++){
    const cycleStart = new Date(baseDate);
    if(i > 1) cycleStart.setDate(baseDate.getDate() + (i - 1) * info.cycleDays);

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + info.periodDays - 1);

    const ovStart = new Date(cycleStart);
    ovStart.setDate(cycleStart.getDate() - 14);
    const ovEnd = new Date(ovStart);
    ovEnd.setDate(ovStart.getDate() + 5);

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px';
    const periodRange = `${fmtDate(cycleStart.toISOString().split('T')[0])} - ${fmtDate(cycleEnd.toISOString().split('T')[0])}`;
    const ovRange = `${fmtDate(ovStart.toISOString().split('T')[0])} - ${fmtDate(ovEnd.toISOString().split('T')[0])}`;

    card.innerHTML = `
      <div>
        <div style="font-weight:800;color:var(--text)">${isZh ? `第 ${i} 个预测周期` : `Predicted Cycle +${i}`}</div>
        <div style="font-size:10.5px;color:#ec4899;margin-top:2px">🩸 ${isZh ? '预估月经开潮' : 'Period'}: <strong>${periodRange}</strong></div>
        <div style="font-size:10.5px;color:#c084fc;margin-top:2px">🥚 ${isZh ? '预估排卵/易孕期' : 'Fertile Window'}: <strong>${ovRange}</strong></div>
      </div>
      <span class="chip" style="font-size:9.5px;padding:2px 6px;background:rgba(236,72,153,.15);color:#ec4899">AI 概率 95%</span>
    `;
    container.appendChild(card);
  }
}

async function executeAiAutonomousTrack(){
  const inp = el('period-ai-track-input');
  if(!inp) return;
  const rawText = inp.value.trim();
  if(!rawText){
    toast(typeof S !== 'undefined' && S && S.lang === 'zh' ? '⚠️ 请输入文字或小票内容' : '⚠️ Please enter text or receipt details');
    return;
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  toast(isZh ? '🤖 AI 正在自主解析、更新周期并记录开销…' : '🤖 AI is auto-parsing, updating cycle and expenses…');

  initPeriodTrackerState();

  // Smart AI Extraction Rule Engine
  let isStart = rawText.includes('来') || rawText.includes('第一天') || rawText.includes('开始') || rawText.includes('start') || rawText.includes('period');
  let flow = 'medium';
  if(rawText.includes('多') || rawText.includes('大') || rawText.includes('heavy')) flow = 'heavy';
  else if(rawText.includes('少') || rawText.includes('小') || rawText.includes('light')) flow = 'light';

  let pain = 'mild';
  if(rawText.includes('剧') || rawText.includes('重') || rawText.includes('痛死') || rawText.includes('severe')) pain = 'severe';
  else if(rawText.includes('中') || rawText.includes('痛') || rawText.includes('cramps')) pain = 'moderate';
  else if(rawText.includes('不痛') || rawText.includes('无痛') || rawText.includes('fine')) pain = 'none';

  // Extract expense amount if user mentioned numbers like "RM 25", "25元", "买包暖宝宝25"
  let expenseAmt = 0;
  const amtMatch = rawText.match(/(?:RM|rm|\$|￥|¥|块|元)?\s*(\d+(?:\.\d{1,2})?)/);
  if(amtMatch && (rawText.includes('买') || rawText.includes('RM') || rawText.includes('块') || rawText.includes('元') || rawText.includes('花'))){
    expenseAmt = parseFloat(amtMatch[1]);
  }

  if(isStart){
    S.periodTracker.lastPeriodDate = today();
  }

  const noteStr = `AI Auto-Tracked: "${rawText}" | Flow: ${flow}, Pain: ${pain}`;
  S.periodTracker.history.unshift({
    startDate: today(),
    endDate: null,
    flow: flow,
    pain: pain,
    symptoms: ['AI Auto-Parsed'],
    note: noteStr
  });

  // If AI detected expense amount, auto-create expense transaction in app!
  if(expenseAmt > 0){
    const accId = getActiveAccountId();
    const newTx = {
      id: uid('item'),
      type: 'expense',
      amount: expenseAmt,
      desc: isZh ? 'AI 自动记账：卫生/暖宫用品' : 'AI Tracked Sanitary Supplies',
      category: 'health',
      date: today(),
      accountId: accId,
      paymentMethod: 'Cash',
      note: `AI Autonomous Tracked from text: "${rawText}"`,
      createdAt: new Date().toISOString()
    };
    S.transactions.unshift(newTx);
  }

  save();
  renderAll();
  renderPeriodTrackerUI();
  inp.value = '';
  toast(isZh ? `🎉 AI 自主追踪完成！已更新周期状态${expenseAmt > 0 ? '并记一笔 RM '+expenseAmt.toFixed(2)+' 开销' : ''}` : `🎉 AI Auto-tracked! Cycle updated${expenseAmt > 0 ? ' & logged RM '+expenseAmt.toFixed(2) : ''}`);
}

// ── 📅 PERIOD CALENDAR METHOD GRID ENGINE ───────────────
let periodCalInspectedDate = new Date();
let selectedPeriodInspectorDateStr = today();
let periodAiInspectDateStr = today();

function shiftPeriodCalMonth(delta){
  periodCalInspectedDate.setMonth(periodCalInspectedDate.getMonth() + delta);
  renderPeriodCalendarGrid();
}

function jumpPeriodCalToday(){
  periodCalInspectedDate = new Date();
  selectedPeriodInspectorDateStr = today();
  renderPeriodCalendarGrid();
}

function renderPeriodCalendarGrid(){
  initPeriodTrackerState();
  const grid = el('period-cal-days-grid');
  const titleEl = el('period-cal-month-title');
  if(!grid) return;
  grid.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const yr = periodCalInspectedDate.getFullYear();
  const mo = periodCalInspectedDate.getMonth();

  const monthNamesZh = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  if(titleEl){
    titleEl.textContent = isZh ? `${yr}年 ${monthNamesZh[mo]}` : `${monthNamesEn[mo]} ${yr}`;
  }

  const firstDayIndex = new Date(yr, mo, 1).getDay();
  const totalDays = new Date(yr, mo + 1, 0).getDate();

  // Get info & predicted cycles
  const info = getPeriodPhaseInfo();
  const pt = S.periodTracker;
  const lastD = new Date(pt.lastPeriodDate + 'T00:00:00');
  const cycleDays = pt.cycleLength || 28;
  const periodDays = pt.periodLength || 5;

  const todayStr = today();
  const prevMonthTotalDays = new Date(yr, mo, 0).getDate();

  // 1. Padding days from previous month (.other-month)
  for(let i = firstDayIndex - 1; i >= 0; i--){
    const pDay = prevMonthTotalDays - i;
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.style.cssText = 'min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 2px;opacity:0.25';
    box.innerHTML = `<span class="cal-day-num" style="font-size:12.5px;font-weight:700">${pDay}</span>`;
    grid.appendChild(box);
  }

  // 2. Current month days
  for(let d = 1; d <= totalDays; d++){
    const dateStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const currD = new Date(dateStr + 'T00:00:00');
    const diff = Math.floor((currD - lastD) / (1000 * 60 * 60 * 24));
    const cycleDay = diff >= 0 ? ((diff % cycleDays) + 1) : (cycleDays + ((diff % cycleDays) + 1));

    // Phase determination for each day using clean wording tags (NO emoji symbols)
    let cellBg = 'rgba(255,255,255,.08)';
    let cellColor = '#111827';
    let borderStyle = '1px solid transparent';
    let phaseTagHtml = '';
    let boxShadow = 'none';

    if(cycleDay <= periodDays){
      cellBg = 'rgba(236,72,153,.72)';
      cellColor = '#111827';
      borderStyle = '1.5px solid #ec4899';
      phaseTagHtml = `<span class="period-cell-tag period-tag-flow">${isZh ? '经期' : 'Period'}</span>`;
    } else if(cycleDay >= (cycleDays - 16) && cycleDay <= (cycleDays - 10)){
      cellBg = 'rgba(139,92,246,.72)';
      cellColor = '#111827';
      borderStyle = '1.5px solid #a78bfa';
      phaseTagHtml = `<span class="period-cell-tag period-tag-ovul">${isZh ? '排卵' : 'Fertile'}</span>`;
    } else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0){
      cellBg = 'rgba(245,158,11,.68)';
      cellColor = '#111827';
      borderStyle = '1.5px dashed #fbbf24';
      phaseTagHtml = `<span class="period-cell-tag period-tag-pms">${isZh ? '经前' : 'PMS'}</span>`;
    } else {
      cellBg = 'rgba(16,185,129,.62)';
      cellColor = '#111827';
      borderStyle = '1px solid rgba(16,185,129,.35)';
      phaseTagHtml = `<span class="period-cell-tag period-tag-safe">${isZh ? '安全' : 'Safe'}</span>`;
    }

    const box = document.createElement('div');
    box.className = 'cal-day-box';
    box.id = `period-day-${dateStr}`;
    box.style.cssText = `min-height:64px;background:${cellBg};border:${borderStyle};border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:6px 3px;cursor:pointer;position:relative;transition:all .15s ease;box-shadow:${boxShadow};touch-action:manipulation;`;

    const isToday = (dateStr === todayStr);
    if(isToday){
      box.style.borderColor = 'var(--amber)';
      box.style.boxShadow = '0 0 8px rgba(255,179,0,.5)';
    }

    const isSelected = (dateStr === selectedPeriodInspectorDateStr);
    if(isSelected){
      box.style.borderColor = '#ec4899';
      box.style.background = 'linear-gradient(135deg,rgba(236,72,153,.88),rgba(139,92,246,.88))';
      box.style.boxShadow = '0 0 12px rgba(236,72,153,.6)';
    }

    // Period calendar keeps spending separate from AI dietary reference items.
    const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
    const dayFoodTxs = S.transactions.filter(t => {
      if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
      const cat = String(t.category || '').toLowerCase();
      return (cat === 'food' || cat === 'groceries') && !isPeriodCareExpense(t);
    });
    const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t));
    const daySpent = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const spentFmt = daySpent > 0 ? (daySpent >= 1000 ? (daySpent/1000).toFixed(1)+'k' : daySpent.toFixed(0)) : '';
    const dayHealthLog = (S.periodTracker.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
    const healthBits = [];
    if(dayHealthLog){
      if(dayHealthLog.flow) healthBits.push(`${isZh ? '流量' : 'Flow'}: ${dayHealthLog.flow}`);
      if(dayHealthLog.pain) healthBits.push(`${isZh ? '痛感' : 'Pain'}: ${dayHealthLog.pain}`);
      if(Array.isArray(dayHealthLog.symptoms) && dayHealthLog.symptoms.length) healthBits.push(`${isZh ? '症状' : 'Symptoms'}: ${dayHealthLog.symptoms.join(', ')}`);
    }
    const healthTagLabel = dayHealthLog ? (dayHealthLog.pain && dayHealthLog.pain !== 'none' ? (isZh ? '痛感' : 'Pain') : (Array.isArray(dayHealthLog.symptoms) && dayHealthLog.symptoms.length ? (isZh ? '症状' : 'Symptoms') : (isZh ? '记录' : 'Log'))) : '';
    const healthTagHtml = dayHealthLog ? `<span class="period-health-day-tag" title="${esc(healthBits.join(' · '))}">🩺 ${healthTagLabel}</span>` : '';
    const aiTagHtml = dayAiTxs.length > 0 ? `<span class="period-ai-day-tag" title="${isZh ? 'AI 标记可能影响经期的饮食' : 'AI flagged a food or drink that may affect your period'}">🤖 AI</span>` : '';
    const foodTagHtml = dayFoodTxs.length > 0 && dayAiTxs.length === 0 ? `<span class="period-food-day-tag" title="${isZh ? '当天有饮食记录' : 'Food or drink logged this day'}">🍽 ${isZh ? '饮食' : 'Food'}</span>` : '';

    box.innerHTML = `
      <span class="cal-day-num" style="font-size:13px;font-weight:800;color:${cellColor}">${d}</span>
      ${phaseTagHtml ? `${phaseTagHtml}` : ''}
      ${daySpent > 0 ? `<span style="font-size:9.5px;font-weight:800;color:var(--red);line-height:1">🛒 -${spentFmt}</span>` : ''}
      ${healthTagHtml}
      ${aiTagHtml}
      ${foodTagHtml}
    `;

    // ⚡ 100% RELIABLE DUAL-MODE TAP & DOUBLE-TAP HANDLER (Touch & Desktop)
    let lastTapTimestamp = 0;
    let singleTapTimeout = null;

    const triggerDoubleTap = (ev) => {
      if(ev){
        if(ev.stopPropagation) ev.stopPropagation();
        if(ev.preventDefault) ev.preventDefault();
      }
      if(singleTapTimeout){
        clearTimeout(singleTapTimeout);
        singleTapTimeout = null;
      }
      lastTapTimestamp = 0;
      selectPeriodCalDay(dateStr, cycleDay, periodDays, cycleDays, true);
    };

    const triggerSingleTap = () => {
      openDailyExpensesAndAiDietaryInspector(dateStr);
    };

    box.onclick = (e) => {
      const now = Date.now();
      const timeSinceLast = now - lastTapTimestamp;

      if(timeSinceLast > 0 && timeSinceLast < 480){
        // Double-tap detected (< 480ms)
        triggerDoubleTap(e);
      } else {
        // First tap
        lastTapTimestamp = now;
        if(singleTapTimeout) clearTimeout(singleTapTimeout);
        singleTapTimeout = setTimeout(() => {
          triggerSingleTap();
          lastTapTimestamp = 0;
          singleTapTimeout = null;
        }, 400);
      }
    };

    box.ondblclick = (e) => {
      triggerDoubleTap(e);
    };

    grid.appendChild(box);
  }

  // 3. Padding days for next month to complete the row
  const totalCellsSoFar = firstDayIndex + totalDays;
  const nextPaddingNeeded = (7 - (totalCellsSoFar % 7)) % 7;
  for(let n = 1; n <= nextPaddingNeeded; n++){
    const box = document.createElement('div');
    box.className = 'cal-day-box other-month';
    box.style.cssText = 'min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 2px;opacity:0.25';
    box.innerHTML = `<span class="cal-day-num" style="font-size:12.5px;font-weight:700">${n}</span>`;
    grid.appendChild(box);
  }
}

function periodHealthValueLabel(value, kind, isZh){
  const key = String(value || '').toLowerCase();
  const labels = {
    flow: {
      light: isZh ? '少量' : 'Light', medium: isZh ? '中等' : 'Medium', heavy: isZh ? '多量' : 'Heavy'
    },
    pain: {
      none: isZh ? '无痛' : 'None', mild: isZh ? '轻微' : 'Mild', moderate: isZh ? '中度' : 'Moderate', severe: isZh ? '严重' : 'Severe'
    },
    symptom: {
      cramps: isZh ? '腹痛' : 'Cramps', headache: isZh ? '头痛' : 'Headache', bloating: isZh ? '腹胀' : 'Bloating', acne: isZh ? '长痘' : 'Acne', cravings: isZh ? '嗜甜' : 'Cravings', 'ai auto-parsed': isZh ? 'AI 自动解析' : 'AI auto-parsed'
    }
  };
  return (labels[kind] && labels[kind][key]) || value || '—';
}

function openDailyExpensesAndAiDietaryInspector(dateStr){
  // Hide full inspector card if open
  const fullCard = el('period-day-inspector-card');
  if(fullCard) fullCard.classList.add('hidden');

  const singleCard = el('period-single-tap-inspector-card');
  const dateStrEl = el('period-singletap-date-str');
  const totalBadgeEl = el('period-singletap-total-badge');
  const txListEl = el('period-singletap-tx-list');
  const aiInsightEl = el('period-singletap-ai-insight');

  if(!singleCard) return;
  singleCard.classList.remove('hidden');
  periodAiInspectDateStr = dateStr;
  selectedPeriodInspectorDateStr = dateStr;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const aiBtn = el('period-singletap-ai-btn');
  if(aiBtn){
    aiBtn.disabled = false;
    aiBtn.style.opacity = '1';
    aiBtn.textContent = t('period_analyze_day', isZh ? 'AI 分析本日' : 'Analyze with AI');
  }
  if(dateStrEl) dateStrEl.textContent = fmtDate(dateStr);

  // Keep care spending as the total; show AI dietary flags separately for reference.
  const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
  const dayFoodTxs = S.transactions.filter(t => {
    if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
    const cat = String(t.category || '').toLowerCase();
    return (cat === 'food' || cat === 'groceries') && !isPeriodCareExpense(t);
  });
  const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t));
  const dayTxs = [...dayCareTxs, ...dayFoodTxs];
  const dayCareTotal = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const dayHealthLog = (S.periodTracker.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
  const healthSymptoms = dayHealthLog && Array.isArray(dayHealthLog.symptoms) ? dayHealthLog.symptoms.filter(Boolean).map(s => periodHealthValueLabel(s, 'symptom', isZh)) : [];
  const healthFlow = dayHealthLog ? periodHealthValueLabel(dayHealthLog.flow, 'flow', isZh) : '—';
  const healthPain = dayHealthLog ? periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh) : '—';
  const healthDetailsHtml = dayHealthLog ? `
    <div style="background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.38);border-radius:9px;padding:7px 8px;margin-bottom:4px">
      <div style="font-size:10px;font-weight:900;color:#fbbf24;margin-bottom:3px">🩺 ${isZh ? '已记录的健康数据' : 'Recorded Health'}</div>
      <div style="font-size:10px;color:var(--text);line-height:1.45">${isZh ? '流量' : 'Flow'}: <strong>${esc(healthFlow)}</strong> · ${isZh ? '痛感' : 'Pain'}: <strong>${esc(healthPain)}</strong></div>
      <div style="font-size:10px;color:var(--text);line-height:1.45">${isZh ? '症状' : 'Symptoms'}: <strong>${esc(healthSymptoms.length ? healthSymptoms.join(', ') : '—')}</strong></div>
    </div>` : `<div style="font-size:10px;color:var(--muted);text-align:center;padding:4px 6px;border:1px dashed var(--border);border-radius:8px;margin-bottom:4px">${isZh ? '当天暂无健康记录' : 'No health log for this day'}</div>`;

  if(totalBadgeEl) totalBadgeEl.textContent = isZh ? `经期用品: ${fmt(dayCareTotal)} · 饮食: ${dayFoodTxs.length}项 · AI标记: ${dayAiTxs.length}项` : `Period Care: ${fmt(dayCareTotal)} · Food: ${dayFoodTxs.length} · AI flags: ${dayAiTxs.length}`;

  if(txListEl){
    txListEl.innerHTML = healthDetailsHtml;
    if(!dayTxs.length){
      txListEl.insertAdjacentHTML('beforeend', `<div style="font-size:10px;color:var(--muted);text-align:center;padding:6px">${t('period_no_day_items')}</div>`);
    } else {
      dayTxs.forEach(t => {
        const row = document.createElement('div');
        row.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:5px 8px;display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:2px';
        const isCare = isPeriodCareExpense(t);
        const isAiDiet = !isCare && isPeriodDietAffectingTx(t);
        const typeTag = isCare ? (isZh ? '【经期用品】' : '[Care Product]') : (isAiDiet ? (isZh ? '【AI饮食提示】' : '[AI Diet Flag]') : (isZh ? '【饮食记录】' : '[Food Logged]'));
        const tagColor = isCare ? '#ec4899' : '#06b6d4';
        
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:4px;min-width:0;flex:1">
            <span style="font-size:10px;color:${tagColor};font-weight:800;flex-shrink:0">${typeTag}</span>
            <span style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.desc)}</span>
          </div>
          <span style="font-weight:800;color:var(--red);flex-shrink:0;margin-left:6px">${fmt(t.amount)}</span>
        `;
        txListEl.appendChild(row);
      });
    }
  }

  // 🤖 AI Dietary Period Pain Correlation Analysis Algorithm
  if(aiInsightEl){
    const coldKeywords = ['冰', '奶茶', '水冷', '雪糕', '冰淇淋', '沙拉', '刺身', '生鱼片', '生冷', 'ice', 'boba', 'slush', 'cold', 'salad', 'sashimi', 'gelato', 'tealive', 'chagee', 'mixue'];
    const spicyKeywords = ['麻辣', '火锅', '辣', '冬阴功', '辣椒', 'spicy', 'chili', 'hotpot', 'curry', 'mala', 'tomyam', 'sambal'];
    const caffeineKeywords = ['咖啡', '美式', '拿铁', '浓缩', 'espresso', 'latte', 'coffee', 'caffeine', 'zus'];
    const careKeywords = ['卫生巾', '暖宫贴', '暖宝宝', '卫生棉', '红糖', '止痛药', 'pad', 'tampon', 'sanitary'];

    let foundCold = [];
    let foundSpicy = [];
    let foundCaffeine = [];
    let foundCare = [];

    dayTxs.forEach(t => {
      const text = `${t.desc} ${t.note || ''}`.toLowerCase();
      coldKeywords.forEach(k => { if(text.includes(k) && !foundCold.includes(t.desc)) foundCold.push(t.desc); });
      spicyKeywords.forEach(k => { if(text.includes(k) && !foundSpicy.includes(t.desc)) foundSpicy.push(t.desc); });
      caffeineKeywords.forEach(k => { if(text.includes(k) && !foundCaffeine.includes(t.desc)) foundCaffeine.push(t.desc); });
      careKeywords.forEach(k => { if(text.includes(k) && !foundCare.includes(t.desc)) foundCare.push(t.desc); });
    });

    let insightHtml = '';
    if(foundCold.length > 0){
      insightHtml = isZh ? 
        `🚨 <strong>生冷饮品/食物提醒 (Cold Food Alert)</strong>: 记录了「${foundCold.join(', ')}」。生冷食物易刺激子宫收缩并加重痛经，建议多喝温热水或红糖姜茶。` : 
        `🚨 <strong>Cold Food Alert</strong>: Logged "${foundCold.join(', ')}". Cold drinks can cause vasoconstriction and intensify menstrual cramps.`;
    } else if(foundSpicy.length > 0){
      insightHtml = isZh ? 
        `🌶️ <strong>辛辣刺激饮食提醒 (Spicy Food Alert)</strong>: 记录了「${foundSpicy.join(', ')}」。辛辣可能加剧肠胃蠕动和腹部痉挛，建议经期维持温和清淡饮食。` : 
        `🌶️ <strong>Spicy Food Alert</strong>: Logged "${foundSpicy.join(', ')}". Spicy dishes may aggravate bloating and cramps.`;
    } else if(foundCaffeine.length > 0){
      insightHtml = isZh ? 
        `☕ <strong>咖啡因饮品提醒 (Caffeine Alert)</strong>: 记录了「${foundCaffeine.join(', ')}」。咖啡因可能会促进血管收缩并使经前情绪敏感，建议控制摄入。` : 
        `☕ <strong>High Caffeine Alert</strong>: Logged "${foundCaffeine.join(', ')}". Excessive caffeine can heighten PMS tension.`;
    } else if(foundCare.length > 0){
      insightHtml = isZh ? 
        `🌸 <strong>经期护理用品已记录</strong>: 记录了「${foundCare.join(', ')}」。及时备齐用品有助于安心度过生理期！` : 
        `🌸 <strong>Period Supplies Ready</strong>: Logged "${foundCare.join(', ')}". Good preparation ensures a comfortable cycle!`;
    } else if(dayTxs.length > 0){
      insightHtml = isZh ? 
        `✨ <strong>饮食评估良好</strong>: 当天未发现高风险生冷/烈辣项目。维持温热饮食有助于舒适度过生理期！` : 
        `✨ <strong>Balanced Diet</strong>: No high-risk cold or spicy items detected. Keep up the warm, nourishing meals!`;
    } else {
      insightHtml = isZh ? 
        `💡 <strong>暂无特殊饮食与用品</strong>: 记下当天所喝冷热饮品或卫生用品，AI 将自动分析饮食与经期痛感关联！` : 
        `💡 <strong>No Items Logged</strong>: Record what you drank, ate, or bought to let AI analyze dietary cramp triggers!`;
    }

    const recordedHealthHtml = dayHealthLog ? `
      <div style="background:rgba(251,191,36,.11);border-radius:8px;padding:6px 8px;margin-bottom:7px;font-size:10px;line-height:1.45;color:var(--text)">
        🩺 <strong>${isZh ? '本日健康记录已纳入分析' : 'Today’s health log is included'}</strong><br>
        ${isZh ? '痛感' : 'Pain'}: ${esc(healthPain)} · ${isZh ? '症状' : 'Symptoms'}: ${esc(healthSymptoms.length ? healthSymptoms.join(', ') : '—')}
      </div>` : '';
    aiInsightEl.innerHTML = recordedHealthHtml + insightHtml;
  }

  setTimeout(() => {
    singleCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
}

async function analyzeSelectedPeriodDayWithAi(){
  const insightEl = el('period-singletap-ai-insight');
  const btn = el('period-singletap-ai-btn');
  const dateStr = periodAiInspectDateStr || selectedPeriodInspectorDateStr || today();
  if(!insightEl) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const pt = S.periodTracker || {};
  const dayHealthLog = (pt.history || []).find(h => h && normalizeDateStr(h.startDate) === dateStr);
  const symptoms = dayHealthLog && Array.isArray(dayHealthLog.symptoms) ? dayHealthLog.symptoms.filter(Boolean) : [];
  const displaySymptoms = symptoms.map(s => periodHealthValueLabel(s, 'symptom', isZh));
  const dayCareTxs = S.transactions.filter(t => normalizeDateStr(t.date) === dateStr && t.type === 'expense' && isPeriodCareExpense(t));
  const dayFoodTxs = S.transactions.filter(t => {
    if(normalizeDateStr(t.date) !== dateStr || t.type !== 'expense') return false;
    const cat = String(t.category || '').toLowerCase();
    return cat === 'food' || cat === 'groceries';
  });
  const dayAiTxs = dayFoodTxs.filter(t => isPeriodDietAffectingTx(t) && !isPeriodCareExpense(t));
  const careTotal = dayCareTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const foodItems = dayFoodTxs.map(t => `${t.desc || 'Food/drink'} (${fmt(t.amount)})`);
  const flaggedItems = dayAiTxs.map(t => t.desc || 'Food/drink');

  const lastD = new Date((pt.lastPeriodDate || today()) + 'T00:00:00');
  const currD = new Date(dateStr + 'T00:00:00');
  const cycleDays = Number(pt.cycleLength) || 28;
  const periodDays = Number(pt.periodLength) || 5;
  const diffDays = Math.floor((currD - lastD) / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays >= 0 ? ((diffDays % cycleDays) + 1) : (cycleDays + ((diffDays % cycleDays) + 1));
  let phase = 'safe';
  if(cycleDay <= periodDays) phase = 'period';
  else if(cycleDay >= cycleDays - 16 && cycleDay <= cycleDays - 10) phase = 'ovulation';
  else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0) phase = 'pms';
  const phaseLabel = isZh ? ({period:'经期',ovulation:'排卵/易孕期',pms:'经前期',safe:'安全期'}[phase]) : ({period:'Period',ovulation:'Fertile window',pms:'PMS',safe:'Stable phase'}[phase]);
  const healthText = dayHealthLog ? `${isZh ? '流量' : 'Flow'}=${periodHealthValueLabel(dayHealthLog.flow, 'flow', isZh)}, ${isZh ? '痛感' : 'Pain'}=${periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh)}, ${isZh ? '症状' : 'Symptoms'}=${displaySymptoms.length ? displaySymptoms.join(', ') : '—'}` : (isZh ? '当天没有保存健康记录' : 'No saved health log for this day');
  const foodText = foodItems.length ? foodItems.join(' | ') : (isZh ? '当天没有记录食物或饮品' : 'No food or drink entries for this day');
  const flaggedText = flaggedItems.length ? [...new Set(flaggedItems)].join(', ') : (isZh ? '没有 AI 标记饮食' : 'No AI-flagged food or drinks');

  if(btn){
    btn.disabled = true;
    btn.style.opacity = '.7';
    btn.textContent = t('period_analyzing', isZh ? '正在分析健康与饮食数据…' : 'Analyzing your health & food data…');
  }
  insightEl.innerHTML = `<div style="display:flex;align-items:center;gap:7px;color:var(--muted)"><span class="ai-scan-spinner" style="width:14px;height:14px"></span><span>${esc(t('period_analyzing', isZh ? '正在分析健康与饮食数据…' : 'Analyzing your health & food data…'))}</span></div>`;

  const promptText = `Daily Period Care Review\nDate: ${dateStr}\nCycle phase: ${phaseLabel}, cycle day ${cycleDay} of ${cycleDays}\nSaved health log: ${healthText}\nFood and drinks recorded: ${foodText}\nAI-flagged food/drinks for possible period impact: ${flaggedText}\nPeriod-care expenses: ${fmt(careTotal)}\n\nGive a concise, supportive status update. Explain possible connections between the logged symptoms and food/drinks without claiming a diagnosis or definite cause. Provide three practical actions for today and mention when to seek medical care. Reply in ${isZh ? 'Chinese' : 'English'}.`;

  let aiText = '';
  if(S.geminiApiKey){
    try {
      const generation = await generateGeminiContent(S.geminiApiKey, {
        contents: [{ parts: [{ text: promptText }] }]
      });
      const data = generation.data;
      if(data?.candidates?.[0]?.content){
        aiText = data.candidates[0].content.parts.map(part => part.text || '').join('').trim();
      }
    } catch(e) {
      console.warn('Daily Gemini analysis unavailable:', e);
    }
  }

  if(aiText){
    insightEl.innerHTML = `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.28);border-radius:9px;padding:8px;line-height:1.55"><strong style="color:#0891b2">✨ ${isZh ? 'AI 本日分析' : 'AI Daily Analysis'}</strong><div style="margin-top:5px;white-space:normal">${esc(aiText).replace(/\n/g, '<br>')}</div></div>`;
  } else {
    const textBlob = `${foodItems.join(' ')} ${flaggedItems.join(' ')}`.toLowerCase();
    const cold = ['ice','iced','cold','boba','slush','奶茶','冰','雪糕','冰淇淋','沙拉','刺身','生冷'].some(k => textBlob.includes(k));
    const spicy = ['spicy','chili','hotpot','mala','curry','tomyam','sambal','辣','麻辣','火锅','冬阴功'].some(k => textBlob.includes(k));
    const caffeine = ['coffee','caffeine','espresso','latte','美式','咖啡','拿铁','浓缩'].some(k => textBlob.includes(k));
    const foodFlags = [];
    if(cold) foodFlags.push(isZh ? '生冷饮品/食物' : 'cold food or drinks');
    if(spicy) foodFlags.push(isZh ? '辛辣食物' : 'spicy food');
    if(caffeine) foodFlags.push(isZh ? '咖啡因饮品' : 'caffeinated drinks');
    const painText = dayHealthLog ? periodHealthValueLabel(dayHealthLog.pain, 'pain', isZh) : (isZh ? '未记录' : 'not logged');
    const symptomText = displaySymptoms.length ? displaySymptoms.join(', ') : (isZh ? '未记录' : 'none logged');
    const statusLine = isZh
      ? `你在 ${dateStr} 处于${phaseLabel}（周期第 ${cycleDay} 天）。痛感为 ${painText}，症状：${symptomText}。`
      : `On ${dateStr}, you are in the ${phaseLabel} (cycle day ${cycleDay}). Pain: ${painText}; symptoms: ${symptomText}.`;
    const foodLine = foodItems.length
      ? (isZh ? `当天记录的食物/饮品：${foodText}。` : `Food/drinks recorded: ${foodText}.`)
      : (isZh ? '当天还没有记录食物或饮品。' : 'No food or drinks were recorded for this day.');
    const flagLine = foodFlags.length
      ? (isZh ? `可留意${foodFlags.join('、')}与不适是否同时出现；这只是可能的关联，不代表确定原因。` : `Notice whether ${foodFlags.join(', ')} appear alongside discomfort; this is only a possible association, not a confirmed cause.`)
      : (isZh ? '目前没有发现明显的饮食标记。' : 'No obvious dietary flags were detected.');
    const advice = isZh
      ? '建议：补充水分并休息；记录痛感变化与饮食；若疼痛剧烈、持续或伴随异常出血，请咨询医生。'
      : 'Suggestions: hydrate and rest; keep logging pain and food; seek medical advice for severe, persistent pain or unusual bleeding.';
    insightEl.innerHTML = `<div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.28);border-radius:9px;padding:8px;line-height:1.55"><strong style="color:#0891b2">✨ ${isZh ? '本地 AI 本日分析' : 'On-device AI Daily Analysis'}</strong><div style="margin-top:5px">${esc(statusLine)}<br>${esc(foodLine)}<br>${esc(flagLine)}<br><br>💡 ${esc(advice)}<br><span style="font-size:9.5px;color:var(--muted)">${isZh ? '参考经期记录与消费数据生成，仅供一般信息参考。' : 'Based on your period log and spending data; for general information only.'}</span></div></div>`;
  }

  if(btn){
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.textContent = t('period_analyze_day', isZh ? 'AI 分析本日' : 'Analyze with AI');
  }
}

function selectPeriodCalDay(dateStr, cycleDay, periodDays, cycleDays, openInspector = false){
  // Hide single-tap card if double-tapped
  const singleCard = el('period-single-tap-inspector-card');
  if(singleCard) singleCard.classList.add('hidden');

  selectedPeriodInspectorDateStr = dateStr;
  const dateStrEl = el('period-inspector-date-str');
  const badgeEl = el('period-inspector-phase-badge');

  if(dateStrEl) dateStrEl.textContent = fmtDate(dateStr);

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(badgeEl){
    if(cycleDay <= periodDays){
      badgeEl.textContent = isZh ? `经期第 ${cycleDay} 天` : `Period Day ${cycleDay}`;
      badgeEl.style.background = '#ec4899';
    } else if(cycleDay >= (cycleDays - 16) && cycleDay <= (cycleDays - 10)){
      badgeEl.textContent = isZh ? `排卵期 / 易孕期` : `Fertile Window`;
      badgeEl.style.background = '#8b5cf6';
    } else if((cycleDays - cycleDay) <= 5 && (cycleDays - cycleDay) >= 0){
      badgeEl.textContent = isZh ? `经前倒计时` : `PMS Warning`;
      badgeEl.style.background = '#f59e0b';
    } else {
      badgeEl.textContent = isZh ? `安全期` : `Safe Period`;
      badgeEl.style.background = '#10b981';
    }
  }

  // Start each date editor with a clean expense entry for the newly selected day.
  const expenseAmtInp = el('cal-inspector-expense-amt');
  const expenseDescInp = el('cal-inspector-expense-desc');
  const expenseKindInp = el('cal-inspector-expense-kind');
  if(expenseAmtInp) expenseAmtInp.value = '';
  if(expenseDescInp) expenseDescInp.value = '';
  if(expenseKindInp) expenseKindInp.value = 'care';

  // Pre-load saved symptoms for this date if existing!
  const existingLog = S.periodTracker && S.periodTracker.history ? S.periodTracker.history.find(h => h.startDate === dateStr) : null;
  if(existingLog){
    selectPeriodFlow(existingLog.flow || 'medium');
    selectPeriodPain(existingLog.pain || 'none');
    currentSelectedSymptoms = Array.isArray(existingLog.symptoms) ? [...existingLog.symptoms] : [];
    document.querySelectorAll('.period-sym-btn').forEach(btn => {
      btn.classList.toggle('on', currentSelectedSymptoms.includes(btn.dataset.sym));
    });
  } else {
    selectPeriodFlow('medium');
    selectPeriodPain('none');
    currentSelectedSymptoms = [];
    document.querySelectorAll('.period-sym-btn').forEach(btn => {
      btn.classList.remove('on');
    });
  }

  if(openInspector){
    openModal('period-date-care-modal');
  }
}

function setPeriodStartForSelectedDate(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const selDate = selectedPeriodInspectorDateStr || today();
  S.periodTracker.lastPeriodDate = selDate;
  S.periodTracker.hasSetFirstDate = true;
  S.periodTracker.history.unshift({ startDate: selDate, endDate: null, note: isZh ? '手动设定开潮日' : 'Manual Period Start' });
  save();
  renderPeriodTrackerUI();
  closeModal('period-date-care-modal');
  toast(isZh ? `🩸 已将 ${fmtDate(selDate)} 设为经期第一天！` : `🩸 Set ${fmtDate(selDate)} as Period Start!`);
}

function setPeriodEndForSelectedDate(){
  initPeriodTrackerState();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const selDate = selectedPeriodInspectorDateStr || today();
  if(S.periodTracker.history.length > 0){
    S.periodTracker.history[0].endDate = selDate;
  }
  save();
  renderPeriodTrackerUI();
  closeModal('period-date-care-modal');
  toast(isZh ? `✅ 已将 ${fmtDate(selDate)} 设为经期结束日！` : `✅ Set ${fmtDate(selDate)} as Period End!`);
}

function savePeriodExpenseForSelectedDate(){
  const amtInp = el('cal-inspector-expense-amt');
  const descInp = el('cal-inspector-expense-desc');
  const kindInp = el('cal-inspector-expense-kind');
  if(!amtInp) return;
  const amt = parseFloat(amtInp.value);
  const desc = descInp ? descInp.value.trim() : '';
  const entryKind = kindInp && kindInp.value === 'food' ? 'food' : 'care';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!amt || amt <= 0){
    toast(isZh ? '⚠️ 请输入有效金额' : '⚠️ Enter a valid amount');
    return;
  }

  if(!desc){
    if(descInp) descInp.focus();
    toast(isZh ? '⚠️ 请先填写用品、食物或饮品名称' : '⚠️ Add an item or food description first');
    return;
  }

  const selDate = selectedPeriodInspectorDateStr || today();
  const accId = getActiveAccountId();

  // If the app has no wallet yet, hand the user to the normal expense form
  // instead of creating a record that cannot be attached to an account.
  if(!accId){
    closeModal('period-date-care-modal');
    openTxModal('expense');
    if(el('tx-date')) el('tx-date').value = selDate;
    if(el('tx-amount')) el('tx-amount').value = amt.toFixed(2);
    if(el('tx-desc')) el('tx-desc').value = desc;
    selCat = entryKind === 'food' ? 'food' : 'health';
    buildCats('tx-cats', 'expense', id => selCat = id);
    toast(isZh ? '请先选择一个账户，再保存这笔记录' : 'Choose an account, then save this entry');
    return;
  }

  const newTx = {
    id: uid('item'),
    type: 'expense',
    amount: amt,
    desc,
    category: entryKind === 'food' ? 'food' : 'health',
    subCategory: entryKind === 'food' ? 'period_diet_reference' : 'health_period_care',
    date: selDate,
    accountId: accId,
    paymentMethod: 'Cash',
    note: `${entryKind === 'food' ? 'Food/drink' : 'Period care'} logged via Calendar Inspector for ${selDate}`,
    createdAt: new Date().toISOString()
  };

  S.transactions.unshift(newTx);
  S.lastUsedAccId = accId;
  save();
  amtInp.value = '';
  closeModal('period-date-care-modal');
  toast(isZh ? `✅ 已记入 ${fmtDate(selDate)}：${desc} · RM ${amt.toFixed(2)}！` : `✅ Logged ${desc} · ${fmt(amt)} for ${fmtDate(selDate)}!`);
  // Close and confirm first so a rendering issue cannot make a successful save
  // look like a failed button press.
  try {
    renderAll();
    renderPeriodTrackerUI();
  } catch(e) {
    console.warn('Period expense saved but UI refresh failed:', e);
  }
}

// ── ANALYTICS ENGINE (COMPREHENSIVE & MULTI-DIMENSIONAL) ──
let anaInspectedDate = new Date();
let anaPeriod = 'month';
let currentAnaViewTab = 'overview';

function switchAnaViewTab(tab){
  currentAnaViewTab = tab;
  ['overview', 'breakdown', 'ai'].forEach(t => {
    const btn = el('ana-view-tab-' + t);
    const pane = el('ana-pane-' + t);
    if(btn) btn.classList.toggle('on', t === tab);
    if(pane) pane.style.display = t === tab ? 'block' : 'none';
  });
}

function setAnaPeriod(p){
  anaPeriod = p;
  S.period = p;
  const sel = el('ana-period-select');
  if(sel) sel.value = p;
  renderAnalytics();
}

function stepAnaPeriod(delta){
  if(anaPeriod === 'week'){
    anaInspectedDate.setDate(anaInspectedDate.getDate() + delta * 7);
  } else if(anaPeriod === 'year'){
    anaInspectedDate.setFullYear(anaInspectedDate.getFullYear() + delta);
  } else if(anaPeriod === 'month'){
    anaInspectedDate.setMonth(anaInspectedDate.getMonth() + delta);
  }
  renderAnalytics();
}

function switchAnaBreakdown(mode){
  anaBreakdownMode = mode;
  const sel = el('ana-breakdown-sel');
  if(sel && sel.value !== mode) sel.value = mode;
  renderAnalytics();
}

function renderAnalytics(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const d = anaInspectedDate;
  const curYear = d.getFullYear();
  const curMonth = d.getMonth(); // 0-11
  
  // Format Stepper Title
  const stepperTitle = el('ana-stepper-title');
  const stepperBox = el('ana-stepper-box');
  if(stepperBox) stepperBox.style.display = anaPeriod === 'all' ? 'none' : 'flex';

  if(stepperTitle){
    if(anaPeriod === 'week'){
      const wStart = new Date(d);
      wStart.setDate(d.getDate() - d.getDay());
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      const f = dt => `${dt.getDate()} ${dt.toLocaleString('en-MY', {month:'short'})}`;
      stepperTitle.textContent = `${f(wStart)} – ${f(wEnd)}, ${wEnd.getFullYear()}`;
    } else if(anaPeriod === 'year'){
      stepperTitle.textContent = `${curYear}`;
    } else if(anaPeriod === 'month'){
      stepperTitle.textContent = d.toLocaleDateString(isZh ? 'zh-CN' : 'en-MY', { month: 'long', year: 'numeric' });
    }
  }

  // Filter transactions for current period
  const allTxs = filteredTx();
  let txs = [];
  let prevTxs = [];

  if(anaPeriod === 'all'){
    txs = allTxs;
  } else if(anaPeriod === 'year'){
    txs = allTxs.filter(t => {
      const dt = new Date(t.date + 'T00:00:00');
      return dt.getFullYear() === curYear;
    });
    prevTxs = allTxs.filter(t => {
      const dt = new Date(t.date + 'T00:00:00');
      return dt.getFullYear() === curYear - 1;
    });
  } else if(anaPeriod === 'week'){
    const wStart = new Date(d);
    wStart.setDate(d.getDate() - d.getDay());
    const wStartStr = `${wStart.getFullYear()}-${String(wStart.getMonth()+1).padStart(2,'0')}-${String(wStart.getDate()).padStart(2,'0')}`;
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    const wEndStr = `${wEnd.getFullYear()}-${String(wEnd.getMonth()+1).padStart(2,'0')}-${String(wEnd.getDate()).padStart(2,'0')}`;
    
    const pwStart = new Date(wStart);
    pwStart.setDate(pwStart.getDate() - 7);
    const pwStartStr = `${pwStart.getFullYear()}-${String(pwStart.getMonth()+1).padStart(2,'0')}-${String(pwStart.getDate()).padStart(2,'0')}`;
    const pwEnd = new Date(pwStart);
    pwEnd.setDate(pwStart.getDate() + 6);
    const pwEndStr = `${pwEnd.getFullYear()}-${String(pwEnd.getMonth()+1).padStart(2,'0')}-${String(pwEnd.getDate()).padStart(2,'0')}`;

    txs = allTxs.filter(t => t.date >= wStartStr && t.date <= wEndStr);
    prevTxs = allTxs.filter(t => t.date >= pwStartStr && t.date <= pwEndStr);
  } else {
    // Month
    txs = allTxs.filter(t => inMonth(t, curMonth, curYear));
    const pMonth = curMonth === 0 ? 11 : curMonth - 1;
    const pYear = curMonth === 0 ? curYear - 1 : curYear;
    prevTxs = allTxs.filter(t => inMonth(t, pMonth, pYear));
  }

  // Calculate Core Metrics
  const inc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const net = inc - exp;

  const prevInc = prevTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const prevExp = prevTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);

  if(el('ana-inc')) el('ana-inc').textContent = String(txs.length);
  if(el('ana-exp')) el('ana-exp').textContent = fmt(exp);
  if(el('ana-net')) {
    el('ana-net').textContent = (net >= 0 ? '+' : '-') + fmt(Math.abs(net));
    el('ana-net').style.color = net >= 0 ? 'var(--green)' : 'var(--red)';
  }

  // Deltas
  const incDeltaEl = el('ana-inc-sub');
  if(incDeltaEl){
    if(prevInc > 0){
      const diff = inc - prevInc;
      const pct = Math.round((diff / prevInc) * 100);
      incDeltaEl.textContent = `${diff >= 0 ? '▲ +' : '▼ '}${pct}% vs ${isZh ? '上期' : 'prev'}`;
      incDeltaEl.style.color = diff >= 0 ? 'var(--green)' : 'var(--muted)';
    } else {
      incDeltaEl.textContent = isZh ? '暂无上期对比' : 'No prior data';
      incDeltaEl.style.color = 'var(--muted)';
    }
  }

  const expDeltaEl = el('ana-exp-sub');
  if(expDeltaEl){
    if(prevExp > 0){
      const diff = exp - prevExp;
      const pct = Math.round((diff / prevExp) * 100);
      expDeltaEl.textContent = `${diff <= 0 ? '▼ ' : '▲ +'}${pct}% vs ${isZh ? '上期' : 'prev'}`;
      expDeltaEl.style.color = diff <= 0 ? 'var(--green)' : 'var(--red)';
    } else {
      expDeltaEl.textContent = isZh ? '暂无上期对比' : 'No prior data';
      expDeltaEl.style.color = 'var(--muted)';
    }
  }

  // Net Savings Rate & Daily Avg
  const netSub = el('ana-net-sub');
  if(netSub){
    const rate = inc > 0 ? Math.round((Math.max(0, net) / inc) * 100) : 0;
    netSub.textContent = isZh ? `储蓄率: ${rate}%` : `Savings Rate: ${rate}%`;
  }

  const activeDays = new Set(txs.filter(t => t.type === 'expense').map(t => t.date)).size;
  const daysInPeriod = anaPeriod === 'week' ? 7 : (anaPeriod === 'year' ? 365 : new Date(curYear, curMonth + 1, 0).getDate());
  const dailyAvg = exp / (anaPeriod === 'all' ? Math.max(1, activeDays) : daysInPeriod);
  
  if(el('ana-avg')) el('ana-avg').textContent = fmt(dailyAvg);
  if(el('ana-avg-sub')) el('ana-avg-sub').textContent = isZh ? `${activeDays} 个消费日` : `${activeDays} active days`;

  // Calculate Smart Highlights
  const exps = txs.filter(t => t.type === 'expense');
  
  // 1. Top Category
  const catTotals = {};
  exps.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0); });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
  if(el('ana-hl-top-cat')){
    if(sortedCats.length){
      const topC = catInfo('expense', sortedCats[0][0]);
      const pct = exp > 0 ? Math.round((sortedCats[0][1] / exp) * 100) : 0;
      el('ana-hl-top-cat').textContent = `${topC.icon} ${topC.name}`;
      if(el('ana-hl-top-cat-sub')) el('ana-hl-top-cat-sub').textContent = `${fmt(sortedCats[0][1])} (${pct}%)`;
    } else {
      el('ana-hl-top-cat').textContent = '—';
      if(el('ana-hl-top-cat-sub')) el('ana-hl-top-cat-sub').textContent = isZh ? '暂无支出' : '0% of spending';
    }
  }

  // 2. Largest Expense
  if(el('ana-hl-max-tx')){
    if(exps.length){
      const maxTx = exps.reduce((m, t) => (Number(t.amount) > Number(m.amount) ? t : m), exps[0]);
      el('ana-hl-max-tx').textContent = fmt(maxTx.amount);
      const descName = maxTx.desc ? esc(maxTx.desc) : catInfo('expense', maxTx.category).name;
      if(el('ana-hl-max-tx-sub')) el('ana-hl-max-tx-sub').textContent = `${descName} · ${fmtDate(maxTx.date)}`;
    } else {
      el('ana-hl-max-tx').textContent = '—';
      if(el('ana-hl-max-tx-sub')) el('ana-hl-max-tx-sub').textContent = isZh ? '暂无记录' : 'No transactions';
    }
  }

  // 3. Peak Spending Day
  const dayTotals = {};
  exps.forEach(t => { dayTotals[t.date] = (dayTotals[t.date] || 0) + (Number(t.amount) || 0); });
  const sortedDays = Object.entries(dayTotals).sort((a,b) => b[1] - a[1]);
  if(el('ana-hl-peak-day')){
    if(sortedDays.length){
      el('ana-hl-peak-day').textContent = fmt(sortedDays[0][1]);
      if(el('ana-hl-peak-day-sub')) el('ana-hl-peak-day-sub').textContent = fmtDate(sortedDays[0][0]);
    } else {
      el('ana-hl-peak-day').textContent = '—';
      if(el('ana-hl-peak-day-sub')) el('ana-hl-peak-day-sub').textContent = isZh ? '暂无峰值' : '0 days tracked';
    }
  }

  // 4. Tx Count & Avg
  if(el('ana-hl-tx-count')) el('ana-hl-tx-count').textContent = isZh ? `${txs.length} 笔` : `${txs.length} txs`;
  if(el('ana-hl-tx-avg')) {
    const avgVal = exps.length ? (exp / exps.length) : 0;
    el('ana-hl-tx-avg').textContent = isZh ? `平均每笔: ${fmt(avgVal)}` : `Avg: ${fmt(avgVal)}/tx`;
  }

  // Render Charts & Breakdown Lists
  renderEnhancedBarChart(txs, anaPeriod, d);
  renderEnhancedDonutAndList(txs, exp);
  renderAiPatternTracker(txs, inc, exp);
  renderAnaInflationBenchmark(txs, prevTxs, inc, exp);
  render50_30_20Matrix(txs, inc, exp);
}

function renderEnhancedBarChart(txs, period, baseDate){
  const chart = el('bar-chart');
  const tip = el('bar-chart-tooltip');
  if(!chart) return;
  chart.innerHTML = '';
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  let labels = [];
  const curYear = baseDate.getFullYear();
  const curMonth = baseDate.getMonth();

  if(period === 'week'){
    const wStart = new Date(baseDate);
    wStart.setDate(baseDate.getDate() - baseDate.getDay());
    const dayNames = isZh ? ['周日','周一','周二','周三','周四','周五','周六'] : ['Su','Mo','Tu','We','Th','Fr','Sa'];
    for(let i = 0; i < 7; i++){
      const dt = new Date(wStart);
      dt.setDate(wStart.getDate() + i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
      labels.push({ label: dayNames[i], date: ds, title: `${dayNames[i]} (${ds})` });
    }
  } else if(period === 'year'){
    const monthNames = isZh ? ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(let m = 0; m < 12; m++){
      labels.push({ label: monthNames[m], month: m, year: curYear, title: isZh ? `${curYear}年${m+1}月` : `${monthNames[m]} ${curYear}` });
    }
  } else {
    // Month (6 clean 5-day intervals)
    const dim = new Date(curYear, curMonth + 1, 0).getDate();
    const bucketCount = 6;
    const bucketSize = Math.ceil(dim / bucketCount);
    for(let b = 0; b < bucketCount; b++){
      const s = b * bucketSize + 1;
      const e = Math.min((b + 1) * bucketSize, dim);
      labels.push({
        label: `${s}-${e}`,
        start: s,
        end: e,
        month: curMonth,
        year: curYear,
        title: isZh ? `${curMonth+1}月${s}日 - ${e}日` : `${s}-${e} ${baseDate.toLocaleString('en-MY', {month:'short'})}`
      });
    }
  }

  const totals = labels.map(l => {
    let exp = 0;
    txs.forEach(tx => {
      const dt = new Date(tx.date + 'T00:00:00');
      let match = false;
      if(period === 'week') match = tx.date === l.date;
      else if(period === 'year') match = dt.getFullYear() === l.year && dt.getMonth() === l.month;
      else {
        const day = dt.getDate();
        match = dt.getFullYear() === l.year && dt.getMonth() === l.month && day >= l.start && day <= l.end;
      }
      if(match){
        exp += Number(tx.amount) || 0;
      }
    });
    return { exp, label: l.label, title: l.title };
  });

  // SVG Geometry
  const W = 360;
  const H = 130;
  const padLeft = 24;
  const padRight = 24;
  const padTop = 16;
  const padBottom = 26;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom; // 88px

  const maxVal = Math.max(...totals.map(t => t.exp), 1) * 1.2;
  const N = totals.length;

  const points = totals.map((t, idx) => {
    const x = N > 1 ? padLeft + (idx / (N - 1)) * chartW : W / 2;
    const yExp = padTop + chartH - (t.exp / maxVal) * chartH;
    return { ...t, x, yExp };
  });

  function buildSmoothPath(pts, yProp){
    if(!pts.length) return '';
    if(pts.length === 1) return `M ${pts[0].x},${pts[0][yProp]}`;
    let d = `M ${pts[0].x},${pts[0][yProp]}`;
    for(let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i];
      const p1 = pts[i+1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx},${p0[yProp]} ${mx},${p1[yProp]} ${p1.x},${p1[yProp]}`;
    }
    return d;
  }

  const expLinePath = buildSmoothPath(points, 'yExp');
  const baseY = padTop + chartH;
  const expAreaPath = `${expLinePath} L ${points[points.length-1].x},${baseY} L ${points[0].x},${baseY} Z`;

  // Construct SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'trend-line-chart-svg');

  svg.innerHTML = `
    <defs>
      <linearGradient id="expTrendGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--red)" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="var(--red)" stop-opacity="0.0"/>
      </linearGradient>
    </defs>

    <!-- Grid Lines -->
    <line x1="${padLeft}" y1="${padTop}" x2="${W - padRight}" y2="${padTop}" class="trend-grid-line"/>
    <line x1="${padLeft}" y1="${padTop + chartH * 0.5}" x2="${W - padRight}" y2="${padTop + chartH * 0.5}" class="trend-grid-line"/>
    <line x1="${padLeft}" y1="${baseY}" x2="${W - padRight}" y2="${baseY}" stroke="rgba(255,255,255,.12)" stroke-width="1"/>

    <!-- Active Indicator Guideline -->
    <line id="trend-hover-guide" x1="-100" y1="${padTop}" x2="-100" y2="${baseY}" stroke="var(--amber)" stroke-dasharray="3,3" stroke-width="1.5" style="transition:all .12s ease"/>

    <!-- Area Fill -->
    <path d="${expAreaPath}" fill="url(#expTrendGrad)"/>

    <!-- Stroke Line -->
    <path d="${expLinePath}" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Data Points & X-Axis Labels -->
    ${points.map((p, idx) => `
      <g class="trend-point-group" data-idx="${idx}">
        <!-- Expense Dot -->
        ${p.exp > 0 ? `<circle cx="${p.x}" cy="${p.yExp}" r="3.5" fill="var(--red)" stroke="var(--bg2)" stroke-width="1.8" class="trend-dot"/>` : `<circle cx="${p.x}" cy="${baseY}" r="2" fill="var(--dim)"/>`}
        <!-- X-Axis Label -->
        <text x="${p.x}" y="${baseY + 16}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--dim)">${p.label}</text>
        <!-- Invisible Touch Target -->
        <rect x="${p.x - chartW / (N * 2)}" y="0" width="${chartW / N}" height="${H}" fill="transparent" style="cursor:pointer"/>
      </g>
    `).join('')}
  `;

  chart.appendChild(svg);

  // Set default tooltip to latest active bucket
  const activeBucket = points.slice().reverse().find(p => p.exp > 0) || points[points.length - 1];
  if(activeBucket && tip){
    tip.innerHTML = `<strong>${activeBucket.title}</strong> · ${isZh ? '支出' : 'Expense'}: <span style="color:var(--red)">${fmt(activeBucket.exp)}</span>`;
  }

  // Bind interactive touch / hover events
  const groups = svg.querySelectorAll('.trend-point-group');
  groups.forEach(g => {
    const idx = parseInt(g.getAttribute('data-idx'), 10);
    const p = points[idx];
    const selectPoint = () => {
      const guide = svg.querySelector('#trend-hover-guide');
      if(guide){
        guide.setAttribute('x1', p.x);
        guide.setAttribute('x2', p.x);
      }
      if(tip){
        tip.innerHTML = `<strong>${p.title}</strong> · ${isZh ? '支出' : 'Expense'}: <span style="color:var(--red)">${fmt(p.exp)}</span>`;
      }
    };
    g.addEventListener('mouseenter', selectPoint);
    g.addEventListener('click', selectPoint);
    g.addEventListener('touchstart', selectPoint, { passive: true });
  });
}
function getFoodItemSubGroup(name){
  const n = (name || '').toLowerCase();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  // 1. Drinks & Beverages
  if(/\b(tea|teh|kopi|coffee|latte|cappuccino|mocha|americano|espresso|drink|juice|boba|water|beverage|cola|coke|sprite|beer|wine|soda|lemonade|matcha|chocolate|milo)\b|冰|茶|咖啡|奶茶|果汁|饮料|水|啤酒/i.test(n)){
    return { id: 'drinks', name: isZh ? '饮料与咖啡 (Drinks)' : 'Drinks & Beverages', icon: '🧋', col: '#06b6d4' };
  }
  // 2. Main Meals (Noodles, Rice, Meat, Pasta, Burgers)
  if(/\b(rice|nasi|noodle|noodles|mee|bihun|kway teow|kuay teow|pasta|spaghetti|burger|pizza|chicken|pork|beef|duck|fish|soup|curry|bento|steak|chop|lamb|ramen|laksa|porridge)\b|饭|面|粉|鸡|肉|猪|牛|羊|鱼|饭盒|便当|汤|咖喱|拉面|粥/i.test(n)){
    return { id: 'mains', name: isZh ? '正餐与主食 (Mains)' : 'Main Meals & Staples', icon: '🍲', col: '#f59e0b' };
  }
  // 3. Snacks, Sides, Bakery & Desserts
  if(/\b(snack|fries|potato|dim sum|dumpling|cake|bread|toast|roti|dessert|ice cream|waffle|pastry|pie|croissant|bun|egg|tart|biscuit|cookie|sweet)\b|小吃|点心|炸|薯|面包|蛋糕|甜品|冰淇淋|饼|蛋挞|包/i.test(n)){
    return { id: 'snacks', name: isZh ? '小吃与烘焙 (Snacks)' : 'Sides, Snacks & Bakery', icon: '🍢', col: '#ec4899' };
  }
  // 4. Groceries & Fresh Produce
  if(/\b(grocery|vegetable|fruit|apple|banana|milk|oil|sugar|salt|tissue|soap|cleaner|market)\b|菜|蔬菜|水果|牛奶|生鲜|杂货/i.test(n)){
    return { id: 'groceries', name: isZh ? '生鲜与杂货 (Market)' : 'Groceries & Fresh Market', icon: '🛒', col: '#10b981' };
  }
  // 5. General / Other Items
  return { id: 'general', name: isZh ? '其他商品与零售 (Other)' : 'Other Items & Retail', icon: '📦', col: '#8b5cf6' };
}

function renderEnhancedDonutAndList(txs, totalExp){
  const svg = el('donut-svg'), leg = el('donut-legend'), rankList = el('ana-rank-list');
  if(!svg || !leg) return;
  svg.innerHTML = ''; leg.innerHTML = '';
  if(rankList) rankList.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const exps = txs.filter(t => t.type === 'expense');
  if(!exps.length || totalExp <= 0){
    if(el('donut-center')) el('donut-center').innerHTML = '<div style="font-size:11px;color:var(--dim)">No data</div>';
    if(rankList) rankList.innerHTML = `<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px">${isZh ? '本周期暂无支出数据' : 'No expense records in this period'}</div>`;
    return;
  }

  const breakdown = {};
  let totalCalculatedAmount = totalExp;

  if(anaBreakdownMode === 'top_items' || anaBreakdownMode === 'items'){
    // Top 5 Dishes & Items Leaderboard (Never long or overwhelming!)
    const allItems = [];
    let totalItemsAmt = 0;
    exps.forEach(tx => {
      if(tx.items && Array.isArray(tx.items) && tx.items.length > 0){
        tx.items.forEach(it => {
          const name = String(it.name || 'Item').trim();
          const p = Number(it.price) || 0;
          const q = parseInt(it.qty, 10) || 1;
          const lineTotal = p * q;
          if(!name && lineTotal <= 0) return;
          allItems.push({ name, price: lineTotal, qty: q, store: tx.desc || '' });
          totalItemsAmt += lineTotal;
        });
      } else {
        const name = (tx.desc || catInfo('expense', tx.category).name || 'Expense').trim();
        const amt = Number(tx.amount) || 0;
        allItems.push({ name, price: amt, qty: 1, store: tx.desc || '' });
        totalItemsAmt += amt;
      }
    });

    // Group duplicate names
    const itemMap = {};
    allItems.forEach(it => {
      const k = it.name.toLowerCase();
      if(!itemMap[k]){
        itemMap[k] = { name: it.name, amount: 0, count: 0, store: it.store };
      }
      itemMap[k].amount += it.price;
      itemMap[k].count += it.qty;
    });

    const sortedItems = Object.values(itemMap).sort((a,b) => b.amount - a.amount);
    const top5 = sortedItems.slice(0, 5);
    const rest = sortedItems.slice(5);

    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    top5.forEach((it, idx) => {
      breakdown[`top_${idx}`] = {
        amount: it.amount,
        count: it.count,
        label: `${rankMedals[idx]} ${it.name}`,
        icon: '🍽️',
        col: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'][idx],
        store: it.store
      };
    });

    if(rest.length > 0){
      const restTotal = rest.reduce((s,i) => s + i.amount, 0);
      const restCount = rest.reduce((s,i) => s + i.count, 0);
      breakdown['other_items'] = {
        amount: restTotal,
        count: restCount,
        label: isZh ? `📦 其他单品 (共 ${rest.length} 样)` : `📦 Other Items (${rest.length} items)`,
        icon: '📦',
        col: '#9ca3af',
        subItems: rest
      };
    }
    totalCalculatedAmount = totalItemsAmt > 0 ? totalItemsAmt : totalExp;
  } else if(anaBreakdownMode === 'food_types'){
    // Group all dishes into clean high-level food types: Mains, Drinks, Snacks, Groceries, Other
    let totalItemsAmt = 0;
    exps.forEach(tx => {
      if(tx.items && Array.isArray(tx.items) && tx.items.length > 0){
        tx.items.forEach(it => {
          const name = String(it.name || 'Item').trim();
          const p = Number(it.price) || 0;
          const q = parseInt(it.qty, 10) || 1;
          const lineTotal = p * q;
          if(!name && lineTotal <= 0) return;
          const grp = getFoodItemSubGroup(name);
          if(!breakdown[grp.id]){
            breakdown[grp.id] = { amount: 0, count: 0, label: grp.name, icon: grp.icon, col: grp.col, itemsList: [] };
          }
          breakdown[grp.id].amount += lineTotal;
          breakdown[grp.id].count += q;
          breakdown[grp.id].itemsList.push({ name, price: lineTotal, qty: q, store: tx.desc || '' });
          totalItemsAmt += lineTotal;
        });
      } else {
        const name = (tx.desc || catInfo('expense', tx.category).name || 'Expense').trim();
        const amt = Number(tx.amount) || 0;
        const grp = getFoodItemSubGroup(name);
        if(!breakdown[grp.id]){
          breakdown[grp.id] = { amount: 0, count: 0, label: grp.name, icon: grp.icon, col: grp.col, itemsList: [] };
        }
        breakdown[grp.id].amount += amt;
        breakdown[grp.id].count += 1;
        breakdown[grp.id].itemsList.push({ name, price: amt, qty: 1, store: tx.desc || '' });
        totalItemsAmt += amt;
      }
    });
    totalCalculatedAmount = totalItemsAmt > 0 ? totalItemsAmt : totalExp;
  } else if(anaBreakdownMode === 'merchant'){
    exps.forEach(tx => {
      const key = (tx.desc || tx.location || (isZh ? '其他商户' : 'General Merchant')).trim();
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label: key, icon: '🏪', col: '#f59e0b', cat: tx.category };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else if(anaBreakdownMode === 'tax'){
    let totSst = 0, totSvc = 0, totRounding = 0, totBase = 0;
    exps.forEach(tx => {
      const a = Number(tx.amount) || 0;
      const sst = Number(tx.sstAmount) || (tx.sstPct ? (a * (tx.sstPct / (100 + tx.sstPct))) : 0);
      const svc = Number(tx.serviceChargeAmount) || (tx.serviceChargePct ? (a * (tx.serviceChargePct / (100 + tx.serviceChargePct))) : 0);
      const rnd = Number(tx.roundingAmount) || 0;
      const base = Math.max(0, a - sst - svc - rnd);

      totSst += sst;
      totSvc += svc;
      totRounding += rnd;
      totBase += base;
    });

    if(totBase > 0){
      breakdown['base'] = { amount: totBase, count: exps.length, label: isZh ? '商品与餐饮基础金额 (Base Net)' : 'Base Purchases / Food Net', icon: '🛒', col: '#10b981' };
    }
    if(totSst > 0){
      breakdown['sst'] = { amount: totSst, count: exps.filter(t=>t.sstAmount>0||t.sstPct>0).length, label: isZh ? '消费与服务税 (SST 6%/8%)' : 'Malaysian SST (6%/8% Tax)', icon: '🏛️', col: '#3b82f6' };
    }
    if(totSvc > 0){
      breakdown['svc'] = { amount: totSvc, count: exps.filter(t=>t.serviceChargeAmount>0||t.serviceChargePct>0).length, label: isZh ? '餐厅服务费 (Service 10%)' : 'Restaurant Service (10%)', icon: '🛎️', col: '#f59e0b' };
    }
    if(totRounding !== 0){
      breakdown['rnd'] = { amount: Math.abs(totRounding), count: exps.filter(t=>t.roundingAmount).length, label: isZh ? '分位取整 (Rounding)' : 'Rounding Adjustment', icon: '🪙', col: '#9ca3af' };
    }
  } else if(anaBreakdownMode === 'method'){
    exps.forEach(tx => {
      const key = tx.paymentMethod || (isZh ? '现金支付' : 'Cash');
      const pm = PAYMENT_METHODS.find(p => p.name === key);
      const icon = pm ? pm.icon : '💳';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label: key, icon, col: '#06b6d4' };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else if(anaBreakdownMode === 'account'){
    exps.forEach(tx => {
      const acc = S.accounts.find(a => a.id === tx.accountId);
      const key = acc ? acc.id : 'unknown';
      const label = acc ? acc.name : (isZh ? '未指定账户' : 'Unknown Account');
      const icon = acc ? getAccIcon(acc) : '🏦';
      const col = acc && acc.color ? acc.color : '#7c3aed';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label, icon, col };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
    });
  } else {
    // Category (Default)
    exps.forEach(tx => {
      const key = tx.category;
      const c = catInfo('expense', key);
      const label = c.name;
      const icon = c.icon;
      const col = CAT_COLOR[key] || '#6b7280';
      if(!breakdown[key]){
        breakdown[key] = { amount: 0, count: 0, label, icon, col, catId: key, txs: [] };
      }
      breakdown[key].amount += Number(tx.amount) || 0;
      breakdown[key].count += 1;
      if(breakdown[key].txs) breakdown[key].txs.push(tx);
    });
  }

  if(el('donut-center')){
    el('donut-center').innerHTML = `
      <div style="font-size:9.5px;font-weight:700;color:var(--dim)">TOTAL</div>
      <div style="font-size:13px;font-weight:900;color:var(--text)">${fmt(totalCalculatedAmount)}</div>
    `;
  }

  const cx = 80, cy = 80, r = 56, sw = 18, circ = 2 * Math.PI * r;
  const items = Object.values(breakdown).sort((a,b) => b.amount - a.amount);
  let offset = -circ * 0.25;

  const fallbackColors = ['#f59e0b','#3b82f6','#ec4899','#10b981','#8b5cf6','#ef4444','#06b6d4','#14b8a6','#84cc16','#6366f1','#d97706','#0284c7'];

  // Add Mode Explanation Subtitle in Rank List
  if(rankList){
    const headerTitle = {
      top_items: isZh ? '🏆 Top 5 最常消费单品 (精简榜单)' : '🏆 Top 5 Dishes & Items Leaderboard',
      items: isZh ? '🏆 Top 5 最常消费单品 (精简榜单)' : '🏆 Top 5 Dishes & Items Leaderboard',
      food_types: isZh ? '🍲 餐饮与单品分群 (点击可展开内部菜品)' : '🍲 Dishes by Type (Tap group for dish details)',
      merchant: isZh ? '🏪 最常光顾商家与餐厅消费排行' : '🏪 Top Stores & Dining Outlets',
      tax: isZh ? '🧾 消费税 (SST) 与餐饮服务费穿透分析' : '🧾 Malaysian SST & Surcharge Breakdown',
      method: isZh ? '💳 支付方式分布明细' : '💳 Payment Method Distribution',
      account: isZh ? '🏦 各银行与钱包资金支出占比' : '🏦 Bank & Wallet Spend Ratio',
      category: isZh ? '🏷️ 消费分类明细 (点击可展开具体单品)' : '🏷️ Category Ranking (Tap for Item Details)'
    }[anaBreakdownMode] || '';

    rankList.innerHTML = `<div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:8px;padding-left:2px">${headerTitle}</div>`;
  }

  items.forEach((item, idx) => {
    const pct = totalCalculatedAmount > 0 ? (item.amount / totalCalculatedAmount) : 0;
    const pctInt = Math.round(pct * 100);
    const dashLen = pct * circ;
    const color = item.col && item.col !== '#7c3aed' ? item.col : fallbackColors[idx % fallbackColors.length];

    // SVG Ring
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none'); circle.setAttribute('stroke', color); circle.setAttribute('stroke-width', sw);
    circle.setAttribute('stroke-dasharray', dashLen + ' ' + Math.max(0, circ - dashLen));
    circle.setAttribute('stroke-dashoffset', -offset);
    svg.appendChild(circle);
    offset += dashLen;

    // Legend Top 4 Items
    if(idx < 4){
      const li = document.createElement('div');
      li.className = 'leg-item';
      li.innerHTML = `
        <div class="leg-dot" style="background:${color}"></div>
        <span class="leg-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(item.label)}">${item.icon} ${esc(item.label)}</span>
        <span class="leg-pct">${pctInt}%</span>
      `;
      leg.appendChild(li);
    }

    // Detailed Itemized Ranking List
    if(rankList){
      const rankRow = document.createElement('div');
      rankRow.className = 'rank-item';
      const hasSubList = (item.txs && item.txs.length > 0) || (item.itemsList && item.itemsList.length > 0) || (item.subItems && item.subItems.length > 0);
      rankRow.style.cursor = hasSubList ? 'pointer' : 'default';

      let countLabel = `(${item.count}${isZh ? '笔' : 'x'})`;
      if(anaBreakdownMode === 'top_items' || anaBreakdownMode === 'items' || anaBreakdownMode === 'food_types'){
        countLabel = `<span style="font-size:10px;color:var(--cyan);font-weight:700">×${item.count}</span>`;
      }

      const storeSubtitle = item.store ? `<div style="font-size:10.5px;color:var(--muted);margin-top:2px">🏪 ${esc(item.store)}</div>` : '';
      const expandHint = hasSubList ? `<span style="font-size:9.5px;color:var(--dim);margin-left:4px">▾</span>` : '';

      rankRow.innerHTML = `
        <div class="rank-item-top">
          <span style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;padding-right:8px">
            <span style="font-size:15px;flex-shrink:0">${item.icon}</span>
            <span style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(item.label)} ${expandHint}</span>
            <span style="font-size:10.5px;color:var(--dim);font-weight:600;flex-shrink:0">${countLabel}</span>
          </span>
          <span style="font-weight:800;flex-shrink:0">${fmt(item.amount)} <span style="font-size:10.5px;color:var(--muted)">(${pctInt}%)</span></span>
        </div>
        ${storeSubtitle}
        <div class="rank-track" style="margin-top:6px">
          <div class="rank-bar" style="width:${pctInt}%;background:${color}"></div>
        </div>
        <div class="rank-sub-drawer hidden" id="drawer_ana_${idx}" style="margin-top:8px;padding:8px 10px;background:var(--bg3);border-radius:10px;font-size:11px;display:none"></div>
      `;

      // Expandable drawer handler for Category, Food Types, or Other Items!
      if(hasSubList){
        rankRow.onclick = () => {
          const drawer = rankRow.querySelector(`#drawer_ana_${idx}`);
          if(!drawer) return;
          if(drawer.style.display === 'none' || drawer.classList.contains('hidden')){
            drawer.style.display = 'block';
            drawer.classList.remove('hidden');
            let drawerHtml = '';

            if(item.itemsList && item.itemsList.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${item.label} · ${isZh ? '包含菜品' : 'Included Dishes'}:</div>`;
              item.itemsList.forEach(d => {
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <span style="font-weight:700;color:var(--text)">${esc(d.name)}</span>
                      <span style="font-size:10px;color:var(--cyan)"> (×${d.qty})</span>
                      ${d.store ? `<span style="font-size:9.5px;color:var(--muted)"> · ${esc(d.store)}</span>` : ''}
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(d.price)}</strong>
                  </div>
                `;
              });
            } else if(item.subItems && item.subItems.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${isZh ? '其他单品明细' : 'Other Dishes Breakdown'}:</div>`;
              item.subItems.forEach(d => {
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <span style="font-weight:700;color:var(--text)">${esc(d.name)}</span>
                      <span style="font-size:10px;color:var(--cyan)"> (×${d.count})</span>
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(d.amount)}</strong>
                  </div>
                `;
              });
            } else if(item.txs && item.txs.length > 0){
              drawerHtml = `<div style="font-weight:800;color:var(--text);margin-bottom:6px">📋 ${item.label} · ${isZh ? '包含账单明细' : 'Receipt Details'}:</div>`;
              item.txs.forEach(t => {
                const noteText = t.note || (t.items && t.items.length ? t.items.map(i=>`${i.name} (RM ${i.price})`).join(', ') : '');
                drawerHtml += `
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                    <div>
                      <div style="font-weight:700;color:var(--text)">${esc(t.desc || 'Store')} <span style="font-size:10px;color:var(--muted)">(${t.date})</span></div>
                      ${noteText ? `<div style="font-size:10px;color:var(--muted)">🛒 ${esc(noteText)}</div>` : ''}
                    </div>
                    <strong style="color:var(--amber);margin-left:8px">${fmt(t.amount)}</strong>
                  </div>
                `;
              });
            }
            drawer.innerHTML = drawerHtml;
          } else {
            drawer.style.display = 'none';
            drawer.classList.add('hidden');
          }
        };
      }

      rankList.appendChild(rankRow);
    }
  });
}

function renderAiPatternTracker(txs, inc, exp){
  const grid = el('ana-ai-pattern-grid');
  const badge = el('ana-ai-persona-badge');
  if(!grid) return;
  grid.innerHTML = '';

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const exps = txs.filter(t => t.type === 'expense');

  if(!exps.length){
    if(badge) badge.textContent = isZh ? '待积累数据' : 'Awaiting Data';
    grid.innerHTML = `<div style="grid-column:span 2;font-size:11.5px;color:var(--muted);text-align:center;padding:8px 0">${isZh ? '本周期暂无消费记录，记录账单即可激活 AI 行为画像分析 🍯' : 'No expenses in this period. Log expenses to activate AI spending insights 🍯'}</div>`;
    return;
  }

  // 1. Weekend vs Weekday analysis
  let weekendSpent = 0, weekdaySpent = 0;
  exps.forEach(t => {
    const day = new Date(t.date + 'T00:00:00').getDay();
    if(day === 0 || day === 6) weekendSpent += Number(t.amount) || 0;
    else weekdaySpent += Number(t.amount) || 0;
  });
  const weekendPct = exp > 0 ? Math.round((weekendSpent / exp) * 100) : 0;

  // 2. Dining vs Groceries Ratio
  const foodSpent = exps.filter(t => t.category === 'food').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const grocerySpent = exps.filter(t => t.category === 'groceries').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalFoodGroup = foodSpent + grocerySpent;
  const diningPct = totalFoodGroup > 0 ? Math.round((foodSpent / totalFoodGroup) * 100) : 0;

  // 3. Micro-transaction leakage (< RM 20)
  const microTxs = exps.filter(t => Number(t.amount) > 0 && Number(t.amount) <= 20);
  const microSpent = microTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const microPct = exp > 0 ? Math.round((microSpent / exp) * 100) : 0;

  // 4. Frequent Daily Habits (Coffee, Tea, Delivery, Transport)
  const habitTxs = exps.filter(t => {
    const d = (t.desc || '').toLowerCase();
    return /(coffee|latte|kopi|zus|starbucks|tealive|grab|foodpanda|shopee|lazada)/i.test(d);
  });
  const habitSpent = habitTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);

  // Persona Determination
  let persona = isZh ? '⚖️ 理性规划师' : '⚖️ Balanced Planner';
  const savingsRate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
  if(savingsRate >= 40){
    persona = isZh ? '🛡️ 储蓄大师' : '🛡️ Prudent Builder';
  } else if(weekendPct >= 55){
    persona = isZh ? '🏄‍♂️ 周末享乐派' : '🏄‍♂️ Weekend Splurger';
  } else if(diningPct >= 75 && foodSpent > 150){
    persona = isZh ? '🍜 美食探索家' : '🍜 Foodie Connoisseur';
  } else if(microPct >= 35){
    persona = isZh ? '⚡ 零散微开销型' : '⚡ Micro-Spender';
  }
  if(badge) badge.textContent = persona;

  // Patterns to display
  const patterns = [
    {
      icon: weekendPct >= 50 ? '🏖️' : '💼',
      title: isZh ? '周末消费偏好' : 'Weekend Spending',
      desc: isZh ? `周末占 ${weekendPct}% (${fmt(weekendSpent)})` : `Weekend: ${weekendPct}% (${fmt(weekendSpent)})`,
      status: weekendPct >= 55 ? 'warn' : 'good'
    },
    {
      icon: diningPct >= 65 ? '🍽️' : '🛒',
      title: isZh ? '餐饮 vs 买菜' : 'Dining vs Groceries',
      desc: totalFoodGroup > 0 ? (isZh ? `外食 ${diningPct}% · 买菜 ${100 - diningPct}%` : `Dine-out ${diningPct}% · Market ${100 - diningPct}%`) : (isZh ? '暂无记录' : 'No food data'),
      status: diningPct >= 75 ? 'warn' : 'good'
    },
    {
      icon: '💧',
      title: isZh ? '小额微支出漏斗' : 'Micro-Spend Leaks',
      desc: microTxs.length > 0 ? (isZh ? `${microTxs.length}笔小额共 ${fmt(microSpent)} (${microPct}%)` : `${microTxs.length} txs ≤RM20: ${fmt(microSpent)} (${microPct}%)`) : (isZh ? '控制极佳' : 'Minimal leaks'),
      status: microPct >= 30 ? 'warn' : 'good'
    },
    {
      icon: '⚡',
      title: isZh ? '高频日常习惯' : 'Habit Triggers',
      desc: habitTxs.length > 0 ? (isZh ? `外卖/咖啡/网购 ${habitTxs.length}笔 (${fmt(habitSpent)})` : `Delivery/Coffee/Apps: ${habitTxs.length} txs (${fmt(habitSpent)})`) : (isZh ? '无明显高频消费' : 'No habit spikes'),
      status: habitTxs.length >= 5 ? 'warn' : 'good'
    }
  ];

  patterns.forEach(p => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:9px 10px';
    card.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:5px;margin-bottom:2px">
        <span>${p.icon}</span> <span>${p.title}</span>
      </div>
      <div style="font-size:10px;color:${p.status==='warn'?'var(--amber)':'var(--muted)'};font-weight:600;line-height:1.35">${p.desc}</div>
    `;
    grid.appendChild(card);
  });
}

async function generateAiPeriodAudit(){
  const resultBox = el('ana-gemini-audit-result');
  const btn = el('ana-ai-audit-btn');
  if(!resultBox) return;

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  if(!S.geminiApiKey){
    resultBox.innerHTML = `
      <div>
        <span>${isZh 
          ? '⚠️ 尚未配置 Google Gemini API 密钥。本应用采用 100% 用户直连，零硬编码密钥保护您的隐私。请填入您的免费 Google AI 密钥：'
          : '⚠️ Google Gemini API Key not configured. Zero hardcoded keys are used — 100% direct browser connection. Please enter your free Google AI key:'}</span>
        <div style="margin-top:8px">
          <button type="button" class="primary-btn" onclick="openGeminiModal()" style="font-size:11.5px;padding:6px 14px;width:auto">🔑 ${isZh ? '立即配置 Google Gemini 密钥' : 'Configure Google Gemini Key'}</button>
        </div>
      </div>`;
    return;
  }

  const d = anaInspectedDate;
  const curYear = d.getFullYear();
  const curMonth = d.getMonth();
  const allTxs = filteredTx();
  let txs = [];

  if(anaPeriod === 'all') txs = allTxs;
  else if(anaPeriod === 'year') txs = allTxs.filter(t => new Date(t.date+'T00:00:00').getFullYear() === curYear);
  else if(anaPeriod === 'week'){
    const wStart = new Date(d); wStart.setDate(d.getDate() - d.getDay());
    const wStartStr = `${wStart.getFullYear()}-${String(wStart.getMonth()+1).padStart(2,'0')}-${String(wStart.getDate()).padStart(2,'0')}`;
    const wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 6);
    const wEndStr = `${wEnd.getFullYear()}-${String(wEnd.getMonth()+1).padStart(2,'0')}-${String(wEnd.getDate()).padStart(2,'0')}`;
    txs = allTxs.filter(t => t.date >= wStartStr && t.date <= wEndStr);
  } else {
    txs = allTxs.filter(t => inMonth(t, curMonth, curYear));
  }

  const exps = txs.filter(t => t.type === 'expense');
  const inc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const exp = exps.reduce((s,t) => s + (Number(t.amount)||0), 0);

  if(!exps.length && inc <= 0){
    resultBox.innerHTML = isZh ? '⚠️ 当前周期尚无足够的收支数据，无法生成深度审计报告。' : '⚠️ Not enough transactions in this period to generate an audit.';
    return;
  }

  // Category totals
  const catTotals = {};
  exps.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0); });

  const summaryData = {
    period: anaPeriod,
    date: d.toISOString().split('T')[0],
    totalIncome: inc,
    totalExpenses: exp,
    netSavings: inc - exp,
    savingsRate: inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0,
    categories: catTotals,
    transactionCount: txs.length,
    topMerchants: exps.slice(0, 10).map(t => `${t.desc || t.category}: RM${t.amount}`)
  };

  if(btn){
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
  resultBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;color:var(--purple2);font-weight:700">
      <span style="display:inline-block">⏳</span>
      <span>${isZh ? '正在召唤 Google Gemini AI 全面深度透视消费数据…' : 'Google Gemini AI is analyzing your spending patterns…'}</span>
    </div>
  `;

  try {
    const prompt = `You are a world-class certified Malaysian personal financial advisor AI for 🍯 Pocket Winnie 🍯.
Analyze the user's spending data for the selected period:
${JSON.stringify(summaryData, null, 2)}

Provide a concise, sharp, highly actionable financial deep-dive audit in ${isZh ? 'Simplified Chinese (简体中文)' : 'English'}.
Structure your output with these sections:
1. 🎯 **Health Score (0-100) & Verdict** (one bold sentence)
2. 🔍 **Key Findings & Spending Leaks** (2-3 bullet points identifying specific risks e.g. food delivery, dining out, weekend spikes)
3. 💡 **3 Specific Ringgit-Saving Actions for Next Month** (e.g. "Save ~RM 150 by...")
4. 🇲🇾 **Malaysian Context Tip** (e.g. EPF voluntary self-contribution, LHDN tax relief, Touch 'n Go reload management)

Keep the tone encouraging, professional, and ultra-practical. Max 250 words.`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: { temperature: 0.3 }
    };

    const generation = await generateGeminiContent(S.geminiApiKey, payload);
    const geminiRes = generation.data;

    const reply = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if(reply){
      let formatted = esc(reply)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      resultBox.innerHTML = formatted;
    } else {
      resultBox.innerHTML = isZh 
        ? '⚠️ AI 生成失败，请检查网络连接或 API Key 是否有效。' 
        : '⚠️ Could not generate audit. Please check your Gemini API key.';
    }
  } catch(err){
    resultBox.innerHTML = isZh ? '⚠️ 连接 Google AI 失败，请稍后重试。' : '⚠️ Error communicating with Google AI.';
  } finally {
    if(btn){
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}

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
  renderHealth();
  renderBudgets();
  renderGoals();
  renderReminders();
  renderRecurring();
  renderDebts();
  renderAnalytics();
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

  dismissedAlertTitles.clear();
  activeAiAlerts = [];
  save();
  applyLanguage();
  renderAll();
  go('home');
  toast(isZh ? '✨ 应用已完全重置为出厂全新状态！' : '✨ App completely reset to brand new state!');
}

function exportCSV(){
  if(!S.transactions.length){toast('No transactions to export');return;}
  const rows=['Date,Time,Type,Account,Payment Method,Location,Category,Description,Amount,Note'];
  S.transactions.sort((a,b)=>a.date.localeCompare(b.date)).forEach(tx=>{
    const cat=catInfo(tx.type,tx.category), acc=S.accounts.find(a=>a.id===tx.accountId);
    rows.push('"'+tx.date+'","'+(tx.time||'')+'","'+tx.type+'","'+(acc?acc.name:'')+'","'+(tx.paymentMethod||'')+'","'+(tx.location||'')+'","'+cat.name+'","'+tx.desc+'","'+tx.amount+'","'+(tx.note||'')+'"');
  });
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pocket_winnie_'+today()+'.csv';a.click();
  toast('📤 Export complete!');
}

function exportFullBackupJSON(){
  const backup = {
    app: '🍯 Pocket Winnie 🍯',
    version: '2.5',
    backupDate: new Date().toISOString(),
    state: S
  };
  const str = JSON.stringify(backup, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PocketWinnie_FullBackup_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Full Backup downloaded! Keep this file safe.');
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
          S = { ...S, ...newState };
          save();
          renderAll();
          renderCalendar();
          toast(`✅ Restored ${S.transactions.length} transactions successfully!`);
        } else {
          toast('⚠️ Invalid backup file format');
        }
      } catch(err){
        toast('⚠️ Could not parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function purgePhotoCache(){
  const photoCount = S.transactions.filter(t => t.photo).length;
  if(!photoCount){
    toast('ℹ️ No receipt photos currently taking up storage.');
    return;
  }
  if(confirm(`Clean photo storage for ${photoCount} receipts?\n\n✅ ALL transactions, numbers, dates, locations, and dish notes will be 100% PRESERVED.\n\nOnly the raw image files will be freed to save storage space.`)){
    S.transactions.forEach(t => {
      t.photo = null;
    });
    save();
    renderAll();
    renderCalendar();
    toast('🧹 Photo storage cleaned! All transaction records preserved.');
  }
}

// ── 📄 PDF MONTHLY STATEMENT GENERATOR (JSPDF + AUTOTABLE) ──
function exportMonthlyPDF(){
  if(!window.jspdf || !window.jspdf.jsPDF){
    toast('⚠️ PDF generator library loading, please try again');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  const monthName = mNames[now.getMonth()] + ' ' + now.getFullYear();

  const txs = S.transactions.filter(t => inMonth(t, now.getMonth(), now.getFullYear()));
  const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const net = inc - exp;

  // Honey Theme Header
  doc.setFillColor(255, 179, 0);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(78, 52, 46);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("🍯 POCKET WINNIE 🍯", 14, 16);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Financial Statement — ${monthName}`, 14, 23);
  doc.text(`User: ${S.userName || 'Finance User'}`, 140, 23);

  // Summary Metrics
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Monthly Overview", 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income: RM ${inc.toFixed(2)}`, 14, 48);
  doc.text(`Total Expenses: RM ${exp.toFixed(2)}`, 75, 48);
  doc.text(`Net Savings: RM ${net.toFixed(2)}`, 140, 48);

  const tableRows = txs.map(t => {
    const acc = S.accounts.find(a => a.id === t.accountId);
    const cat = (t.type === 'income' ? INC_CATS : EXP_CATS).find(c => c.id === t.category);
    return [
      t.date || '',
      t.desc || '',
      cat ? cat.name : (t.category || ''),
      acc ? acc.name : '',
      t.paymentMethod || '',
      (t.type === 'income' ? '+ RM ' : '- RM ') + parseFloat(t.amount).toFixed(2)
    ];
  });

  if(doc.autoTable){
    doc.autoTable({
      startY: 55,
      head: [['Date', 'Description', 'Category', 'Bank / Wallet', 'Payment Method', 'Amount']],
      body: tableRows.length > 0 ? tableRows : [['-', 'No transactions logged this month', '-', '-', '-', 'RM 0.00']],
      headStyles: { fillColor: [255, 179, 0], textColor: [78, 52, 46], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.8 },
      alternateRowStyles: { fillColor: [253, 247, 227] }
    });
  }

  const fileName = `Statement_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
  doc.save(fileName);
  toast('📄 PDF Statement downloaded!');
}

// ── ⚖️ 50 / 30 / 20 FINANCIAL HEALTH MATRIX ─────────────
const NEEDS_CAT_IDS = ['rent_housing', 'bills', 'groceries', 'fuel', 'toll_parking', 'health', 'education'];
const WANTS_CAT_IDS = ['food', 'shopping', 'entertainment', 'donation', 'other'];

function render50_30_20Matrix(txs, totalInc, totalExp){
  const card = el('matrix-503020-card');
  if(!card) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');

  const exps = txs.filter(t => t.type === 'expense');
  let needsSpent = 0;
  let wantsSpent = 0;

  exps.forEach(t => {
    if(NEEDS_CAT_IDS.includes(t.category)){
      needsSpent += Number(t.amount) || 0;
    } else {
      wantsSpent += Number(t.amount) || 0;
    }
  });

  const base = totalInc > 0 ? totalInc : (totalExp > 0 ? totalExp : 1);
  const savings = Math.max(0, totalInc - totalExp);

  const needsPct = Math.round((needsSpent / base) * 100);
  const wantsPct = Math.round((wantsSpent / base) * 100);
  const savingsPct = totalInc > 0 ? Math.round((savings / totalInc) * 100) : 0;

  if(el('matrix-needs-val')) el('matrix-needs-val').textContent = `${fmt(needsSpent)} (${needsPct}%)`;
  if(el('matrix-wants-val')) el('matrix-wants-val').textContent = `${fmt(wantsSpent)} (${wantsPct}%)`;
  if(el('matrix-savings-val')) el('matrix-savings-val').textContent = `${fmt(savings)} (${savingsPct}%)`;

  if(el('matrix-needs-bar')) el('matrix-needs-bar').style.width = `${Math.min(100, (needsPct / 50) * 100)}%`;
  if(el('matrix-wants-bar')) el('matrix-wants-bar').style.width = `${Math.min(100, (wantsPct / 30) * 100)}%`;
  if(el('matrix-savings-bar')) el('matrix-savings-bar').style.width = `${Math.min(100, (savingsPct / 20) * 100)}%`;

  const gradeEl = el('matrix-health-grade');
  const verdictText = el('matrix-verdict-text');

  if(totalInc <= 0 && totalExp <= 0){
    if(gradeEl) gradeEl.textContent = isZh ? '等待数据' : 'Awaiting Data';
    if(verdictText) verdictText.textContent = isZh ? '记录当月收入与支出后，即可解锁 50/30/20 黄金财务分配诊断！' : 'Log your monthly income and expenses to unlock your 50/30/20 financial diagnosis!';
    return;
  }

  let grade = isZh ? '🏆 优秀自律' : '🏆 Excellent';
  let advice = isZh ? '你的收支分配非常健康，完美契合 50/30/20 黄金理财法则！' : 'Your spending is perfectly aligned with the golden 50/30/20 financial rule!';

  if(needsPct > 65){
    grade = isZh ? '⚠️ 刚需偏高' : '⚠️ High Needs';
    advice = isZh ? `必要刚需支出 (${needsPct}%) 超出 50% 基准。建议审视房租账单或固定支出。`: `Essential needs (${needsPct}%) exceed the 50% target. Look for ways to lower utility bills or fixed housing costs.`;
  } else if(wantsPct > 40){
    grade = isZh ? '🚨 享乐超标' : '🚨 High Wants';
    advice = isZh ? `享受型弹性支出 (${wantsPct}%) 超过 30% 上限。建议适当节制咖啡餐饮、网购与娱乐。` : `Discretionary spending (${wantsPct}%) is over the 30% limit. Trim cafe dining, online shopping, or entertainment.`;
  } else if(savingsPct < 10){
    grade = isZh ? '⚠️ 储蓄不足' : '⚠️ Low Savings';
    advice = isZh ? `储蓄率 (${savingsPct}%) 低于 20% 目标。建议在发薪日立即自动存入应急基金。` : `Savings rate (${savingsPct}%) is below the 20% target. Automate savings on salary day to build your emergency fund.`;
  }

  if(gradeEl) gradeEl.textContent = grade;
  if(verdictText) verdictText.textContent = advice;
}

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
    return tx.items.map(it => ({
      name: it.name || it.desc || 'Item',
      price: Number(it.price || it.amount) || 0,
      qty: Number(it.qty) || 1
    }));
  }

  // If note contains itemized breakdown (e.g. "Item A (RM 10.00), Item B (RM 5.00)" or lines)
  if(tx.note && typeof tx.note === 'string'){
    const lines = tx.note.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    const parsed = [];
    const itemRegex = /(?:(\d+)\s*x\s*)?(.+?)\s*(?:[-–:]|\bRM\b|\$)?\s*(?:RM|\$)?\s*([0-9]+(?:\.[0-9]{1,2})?)$/i;

    lines.forEach(l => {
      const m = l.match(itemRegex);
      if(m && m[2] && m[3]){
        parsed.push({
          qty: parseInt(m[1]) || 1,
          name: m[2].trim(),
          price: parseFloat(m[3]) || 0
        });
      }
    });

    if(parsed.length > 0) return parsed;
  }

  // Fallback: Use description as a single item entry if amount > 0
  if(tx.desc && Number(tx.amount) > 0){
    return [{
      name: tx.desc,
      price: Number(tx.amount),
      qty: 1
    }];
  }

  return [];
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
  fetchLivePetrolPrices();
  renderCarPresets();
  const inp = el('petrol-liters-inp');
  if(inp && !inp.value) inp.value = 36;
  calcPetrolCost();
  openModal('petrol-modal');
}

function renderCarPresets(){
  const wrap = el('car-preset-chips');
  if(!wrap) return;
  wrap.innerHTML = '';
  CAR_TANK_PRESETS.forEach((preset, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'car-chip' + (idx === 0 ? ' on' : '');
    chip.innerHTML = `<span>🚗</span><span>${preset.name}</span>`;
    chip.onclick = () => {
      wrap.querySelectorAll('.car-chip').forEach(c => c.classList.remove('on'));
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
  ['ron95', 'ron97', 'diesel'].forEach(t => {
    const card = el(`pt-card-${t}`);
    if(card) card.classList.toggle('on', t === type);
  });
  calcPetrolCost();
}

function calcPetrolCost(){
  const liters = parseFloat(el('petrol-liters-inp').value) || 0;
  const rate = petrolPrices[currentFuelType] || 2.05;
  const total = liters * rate;
  
  const fuelName = currentFuelType === 'ron95' ? 'RON 95' : currentFuelType === 'ron97' ? 'RON 97' : 'Diesel';
  if(el('petrol-total-cost')) el('petrol-total-cost').textContent = fmt(total);
  if(el('petrol-calc-sub')) el('petrol-calc-sub').textContent = `${liters.toFixed(1)} Litres of ${fuelName} @ RM ${rate.toFixed(2)}/L`;
}

function logPetrolExpense(){
  const liters = parseFloat(el('petrol-liters-inp').value) || 0;
  const rate = petrolPrices[currentFuelType] || 2.05;
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
  if(el('tx-cats')) buildCats('tx-cats', 'expense', id => selCat = id);
  toast(`⛽ Pre-filled ${liters}L ${fuelName} (RM ${total})!`);
}

// ── 🧾 AUTHENTIC MALAYSIAN RECEIPT MEAL SPLITTER ────────
let splitMode = 'equal';
let splitSvcRate = 10; // 10% or 5% or 0%
let splitSstRate = 6;  // 6% or 0%
let splitRoundingMode = 'bnm'; // 'bnm' (5 sen) | '10sen' | 'none'
let splitFriends = [
  { name: 'You (Me)', amount: 25 },
  { name: 'Friend 1', amount: 35 },
  { name: 'Friend 2', amount: 28 }
];

let curPromoDeal = 'none'; // 'none' | 'b1f1' | '50pct' | 'combo' | 'pct'
let b1f1SplitRule = 'fair'; // 'fair' | '5050' | 'buyer'
let p50SplitRule = 'fair';  // 'fair' | '5050' | 'buyer'

function selectPromoDeal(type){
  curPromoDeal = type;
  ['none', 'b1f1', '50pct', 'combo', 'pct'].forEach(t => {
    const chip = el(`promo-chip-${t}`);
    if(chip) chip.classList.toggle('on', t === type);
  });

  const b1f1Form = el('promo-b1f1-form');
  const p50Form = el('promo-50pct-form');
  const comboForm = el('promo-combo-form');
  const pctForm = el('promo-pct-form');
  const summary = el('promo-deal-summary');

  if(b1f1Form) b1f1Form.classList.toggle('hidden', type !== 'b1f1');
  if(p50Form) p50Form.classList.toggle('hidden', type !== '50pct');
  if(comboForm) comboForm.classList.toggle('hidden', type !== 'combo');
  if(pctForm) pctForm.classList.toggle('hidden', type !== 'pct');

  if(type === 'none'){
    if(summary) summary.style.display = 'none';
    const discInp = el('split-disc-inp');
    if(discInp) discInp.value = '';
    calcBillSplit();
  } else {
    applyPromoCalculation();
  }
}

function setB1f1SplitRule(rule){
  b1f1SplitRule = rule;
  ['fair', '5050', 'buyer'].forEach(r => {
    const btn = el(`b1f1-split-${r}`);
    if(btn) btn.classList.toggle('on', r === rule);
  });
  applyPromoCalculation();
}

function setP50SplitRule(rule){
  p50SplitRule = rule;
  ['fair', '5050', 'buyer'].forEach(r => {
    const btn = el(`p50-split-${r}`);
    if(btn) btn.classList.toggle('on', r === rule);
  });
  applyPromoCalculation();
}

function applyPromoCalculation(){
  const summary = el('promo-deal-summary');
  if(!summary) return;

  if(curPromoDeal === 'b1f1'){
    const p1 = parseFloat(el('b1f1-p1').value) || 0;
    const p2 = parseFloat(el('b1f1-p2').value) || 0;

    if(p1 > 0 || p2 > 0){
      const freeItem = Math.min(p1, p2);
      const paidItem = Math.max(p1, p2);
      const subtotal = p1 + p2;
      const discount = freeItem;

      let share1 = 0, share2 = 0;
      if(b1f1SplitRule === 'fair' && subtotal > 0){
        share1 = (p1 / subtotal) * paidItem;
        share2 = (p2 / subtotal) * paidItem;
      } else if(b1f1SplitRule === '5050'){
        share1 = paidItem / 2;
        share2 = paidItem / 2;
      } else { // buyer
        share1 = p1 >= p2 ? paidItem : 0;
        share2 = p1 < p2 ? paidItem : 0;
      }

      // Net amount after B1F1 discount — discount is already reflected in shares
      switchSplitMode('itemized');
      el('split-bill-inp').value = paidItem.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = 2;

      splitFriends = [
        { name: `Person 1 (RM ${p1.toFixed(2)})`, amount: parseFloat(share1.toFixed(2)) },
        { name: `Person 2 (RM ${p2.toFixed(2)})`, amount: parseFloat(share2.toFixed(2)) }
      ];
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `🎁 <strong>B1F1 Deal:</strong> Free item of ${fmt(freeItem)} applied! Net food bill: <strong>${fmt(paidItem)}</strong>. Person 1: ${fmt(share1)}, Person 2: ${fmt(share2)}.`;
    }
  } else if(curPromoDeal === '50pct'){
    const p1 = parseFloat(el('p50-p1').value) || 0;
    const p2 = parseFloat(el('p50-p2').value) || 0;

    if(p1 > 0 || p2 > 0){
      const fullItem = Math.max(p1, p2);
      const halfItem = Math.min(p1, p2);
      const discount = halfItem * 0.5;
      const subtotal = p1 + p2;
      const netFood = subtotal - discount;

      let share1 = 0, share2 = 0;
      if(p50SplitRule === 'fair' && subtotal > 0){
        share1 = (p1 / subtotal) * netFood;
        share2 = (p2 / subtotal) * netFood;
      } else if(p50SplitRule === '5050'){
        share1 = netFood / 2;
        share2 = netFood / 2;
      } else { // buyer
        share1 = p1 >= p2 ? fullItem : (halfItem * 0.5);
        share2 = p1 < p2 ? fullItem : (halfItem * 0.5);
      }

      // Net amount after 50% discount — discount is already reflected in shares
      switchSplitMode('itemized');
      el('split-bill-inp').value = netFood.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = 2;

      splitFriends = [
        { name: `Person 1 (RM ${p1.toFixed(2)})`, amount: parseFloat(share1.toFixed(2)) },
        { name: `Person 2 (RM ${p2.toFixed(2)})`, amount: parseFloat(share2.toFixed(2)) }
      ];
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `🏷️ <strong>2nd @ 50% Deal:</strong> Saved ${fmt(discount)}! Net food: <strong>${fmt(netFood)}</strong>. Person 1: ${fmt(share1)}, Person 2: ${fmt(share2)}.`;
    }
  } else if(curPromoDeal === 'combo'){
    const price = parseFloat(el('combo-price').value) || 0;
    const count = parseInt(el('combo-count').value) || 2;

    if(price > 0){
      el('split-bill-inp').value = price.toFixed(2);
      el('split-disc-inp').value = '0';
      el('split-pax-inp').value = count;

      splitFriends = [];
      const perItem = price / count;
      for(let i = 1; i <= count; i++){
        splitFriends.push({ name: `Friend ${i}`, amount: parseFloat(perItem.toFixed(2)) });
      }
      renderSplitFriendsList();

      summary.style.display = 'block';
      summary.innerHTML = `☕ <strong>Combo Deal:</strong> ${fmt(price)} for ${count} items (<strong>${fmt(perItem)}</strong> each).`;
    }
  } else if(curPromoDeal === 'pct'){
    const pct = parseFloat(el('card-disc-pct').value) || 0;
    const name = (el('card-disc-name').value || 'Card Promo').trim();
    const bill = parseFloat(el('split-bill-inp').value) || 0;

    if(pct > 0 && bill > 0){
      const discount = bill * (pct / 100);
      el('split-disc-inp').value = discount.toFixed(2);

      summary.style.display = 'block';
      summary.innerHTML = `💳 <strong>${name}:</strong> ${pct}% off saves <strong>${fmt(discount)}</strong> on ${fmt(bill)}!`;
    }
  }

  calcBillSplit();
}

function openSplitterModal(defaultAmt = 0){
  const billInp = el('split-bill-inp');
  if(billInp) billInp.value = defaultAmt > 0 ? defaultAmt : '';
  renderSplitFriendsList();
  calcBillSplit();
  openModal('splitter-modal');
  if(billInp && !defaultAmt) setTimeout(() => billInp.focus(), 150);
}

function switchSplitMode(mode){
  splitMode = mode;
  const eqBtn = el('split-mode-equal-btn');
  const itemBtn = el('split-mode-item-btn');
  const eqSec = el('split-equal-section');
  const itemSec = el('split-itemized-section');

  if(eqBtn) eqBtn.classList.toggle('on', mode === 'equal');
  if(itemBtn) itemBtn.classList.toggle('on', mode === 'itemized');
  if(eqSec) eqSec.classList.toggle('hidden', mode !== 'equal');
  if(itemSec) itemSec.classList.toggle('hidden', mode !== 'itemized');

  if(mode === 'itemized'){
    renderSplitFriendsList();
  }
  calcBillSplit();
}

function setSplitSvc(rate){
  splitSvcRate = rate;
  [10, 5, 0].forEach(r => {
    const btn = el(`split-svc-${r}`);
    if(btn) btn.classList.toggle('on', r === rate);
  });
  calcBillSplit();
}

function setSplitSst(rate){
  splitSstRate = rate;
  [8, 6, 0].forEach(r => {
    const btn = el(`split-sst-${r}`);
    if(btn) btn.classList.toggle('on', r === rate);
  });
  calcBillSplit();
}

function setSplitRounding(mode){
  splitRoundingMode = mode;
  ['bnm', '10sen', 'none'].forEach(m => {
    const btn = el(`split-round-${m === '10sen' ? '10' : m}`);
    if(btn) btn.classList.toggle('on', m === mode);
  });
  calcBillSplit();
}

function renderSplitFriendsList(){
  const list = el('split-friends-list');
  if(!list) return;
  list.innerHTML = '';

  splitFriends.forEach((fr, idx) => {
    const card = document.createElement('div');
    card.className = 'item-split-card';
    card.style.cssText = 'background:var(--bg2);border:1.5px solid var(--border);border-radius:14px;padding:10px 12px;margin-bottom:8px';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <input type="text" class="form-input" style="flex:2;padding:8px 10px;font-size:12.5px;font-weight:700" value="${esc(fr.name)}" placeholder="${idx === 0 ? 'You (Me)' : 'Friend ' + (idx + 1)}" oninput="splitFriends[${idx}].name=this.value;calcBillSplit()"/>
        <div class="amt-wrap" style="flex:1.5;margin-bottom:0">
          <span class="cur-sym" style="font-size:11px">RM</span>
          <input type="number" class="amt-input" style="font-size:13px;padding:8px 6px" value="${fr.amount !== undefined && fr.amount !== null ? fr.amount : ''}" placeholder="0.00" inputmode="decimal" oninput="splitFriends[${idx}].amount=parseFloat(this.value)||0;calcBillSplit()"/>
        </div>
        ${splitFriends.length > 1 ? `<button type="button" onclick="removeSplitFriendRow(${idx})" title="Remove" style="background:rgba(239,68,68,.15);border:none;color:var(--red);border-radius:8px;width:28px;height:28px;cursor:pointer;font-weight:800;font-size:14px">✕</button>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;padding-top:4px;border-top:1px dashed var(--border)">
        <span style="color:var(--muted)">👤 ${idx === 0 ? 'Your Total (with tax & svc):' : (esc(fr.name || 'Friend ' + (idx + 1)) + ' pays:')}</span>
        <strong id="split-friend-final-${idx}" style="color:var(--green);font-size:13px">RM 0.00</strong>
      </div>
    `;
    list.appendChild(card);
  });
}

function resetSplitFriendsEqual(){
  const subtotal = splitFriends.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  if(subtotal > 0 && splitFriends.length > 0){
    const equalPart = parseFloat((subtotal / splitFriends.length).toFixed(2));
    splitFriends.forEach(f => f.amount = equalPart);
    renderSplitFriendsList();
    calcBillSplit();
    toast(`👥 Equalized: RM ${equalPart.toFixed(2)} each`);
  }
}

function addSplitFriendRow(){
  splitFriends.push({
    name: `Friend ${splitFriends.length + 1}`,
    amount: 0
  });
  renderSplitFriendsList();
  calcBillSplit();
}

function removeSplitFriendRow(idx){
  if(splitFriends.length <= 1) return;
  splitFriends.splice(idx, 1);
  renderSplitFriendsList();
  calcBillSplit();
}

// Exact Bank Negara Malaysia (BNM) 5-Sen Rounding Mechanism
function calcBnm5SenRounding(amount){
  const totalCents = Math.round(amount * 100);
  const lastDigit = totalCents % 10;
  let roundedCents = totalCents;
  
  if (lastDigit === 1 || lastDigit === 2) {
    roundedCents = totalCents - lastDigit;
  } else if (lastDigit === 3 || lastDigit === 4) {
    roundedCents = totalCents + (5 - lastDigit);
  } else if (lastDigit === 6 || lastDigit === 7) {
    roundedCents = totalCents - (lastDigit - 5);
  } else if (lastDigit === 8 || lastDigit === 9) {
    roundedCents = totalCents + (10 - lastDigit);
  }
  
  const rounded = roundedCents / 100;
  return { rounded, diff: rounded - amount };
}

function calcBillSplit(){
  let subtotal = 0;
  let pax = 1;

  if(splitMode === 'itemized'){
    subtotal = splitFriends.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    pax = Math.max(1, splitFriends.length);
  } else {
    subtotal = parseFloat(el('split-bill-inp').value) || 0;
    pax = Math.max(1, parseInt(el('split-pax-inp').value) || 1);
  }

  const place = (el('split-place-inp').value || '').trim() || 'MALAYSIAN MEAL RECEIPT';
  const discount = Math.max(0, parseFloat(el('split-disc-inp').value) || 0);
  const packaging = Math.max(0, parseFloat(el('split-pack-inp').value) || 0);

  const netSubtotal = Math.max(0, subtotal - discount);
  const serviceCharge = netSubtotal * (splitSvcRate / 100);
  const taxableAmount = netSubtotal + serviceCharge;
  const sstAmount = taxableAmount * (splitSstRate / 100);
  const totalBeforeRounding = taxableAmount + sstAmount + packaging;

  let grandTotal = totalBeforeRounding;
  let roundingDiff = 0;

  if(splitRoundingMode === 'bnm'){
    const bnm = calcBnm5SenRounding(totalBeforeRounding);
    grandTotal = bnm.rounded;
    roundingDiff = bnm.diff;
  } else if(splitRoundingMode === '10sen'){
    grandTotal = Math.ceil(totalBeforeRounding * 10) / 10;
    roundingDiff = grandTotal - totalBeforeRounding;
  }

  const perPersonEqual = grandTotal / pax;

  // Update Thermal Receipt Header & Rows
  if(el('rcpt-merchant-name')) el('rcpt-merchant-name').textContent = place.toUpperCase();
  if(el('rcpt-subtotal')) el('rcpt-subtotal').textContent = fmt(subtotal);

  const discRow = el('rcpt-disc-row');
  if(discRow){
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    if(el('rcpt-disc')) el('rcpt-disc').textContent = `- ${fmt(discount)}`;
  }

  const netRow = el('rcpt-net-row');
  if(netRow){
    netRow.style.display = discount > 0 ? 'flex' : 'none';
    if(el('rcpt-net')) el('rcpt-net').textContent = fmt(netSubtotal);
  }

  const svcRow = el('rcpt-svc-row');
  if(svcRow){
    svcRow.style.display = splitSvcRate > 0 ? 'flex' : 'none';
    if(el('rcpt-svc-label')) el('rcpt-svc-label').textContent = `Service Charge (${splitSvcRate}%)`;
    if(el('rcpt-svc')) el('rcpt-svc').textContent = fmt(serviceCharge);
  }

  const sstRow = el('rcpt-sst-row');
  if(sstRow){
    sstRow.style.display = splitSstRate > 0 ? 'flex' : 'none';
    if(el('rcpt-sst-label')) el('rcpt-sst-label').textContent = `Service Tax / SST (${splitSstRate}%)`;
    if(el('rcpt-sst')) el('rcpt-sst').textContent = fmt(sstAmount);
  }

  const packRow = el('rcpt-pack-row');
  if(packRow){
    packRow.style.display = packaging > 0 ? 'flex' : 'none';
    if(el('rcpt-pack')) el('rcpt-pack').textContent = fmt(packaging);
  }

  const roundRow = el('rcpt-round-row');
  if(roundRow){
    roundRow.style.display = splitRoundingMode !== 'none' ? 'flex' : 'none';
    if(el('rcpt-round-label')) el('rcpt-round-label').textContent = splitRoundingMode === 'bnm' ? 'BNM Rounding (5 sen)' : 'Rounding (10 sen)';
    const sign = roundingDiff >= 0 ? '+' : '-';
    if(el('rcpt-round')) el('rcpt-round').textContent = `${sign} RM ${Math.abs(roundingDiff).toFixed(2)}`;
  }

  if(el('rcpt-grand-total')) el('rcpt-grand-total').textContent = fmt(grandTotal);

  // Render Itemized vs Equal Breakdown in Receipt & Live Badges
  const itemBreakdownList = el('rcpt-itemized-breakdown-list');
  const heroBox = el('rcpt-split-hero-box');

  let myShare = perPersonEqual;

  if(splitMode === 'itemized'){
    const taxMultiplier = subtotal > 0 ? (grandTotal / subtotal) : 1;
    let computedShares = [];
    let allocatedTotal = 0;

    splitFriends.forEach((fr, idx) => {
      const rawShare = (Number(fr.amount) || 0) * taxMultiplier;
      const roundedShare = parseFloat(rawShare.toFixed(2));
      computedShares.push(roundedShare);
      allocatedTotal += roundedShare;
    });

    // Reconcile 1-cent rounding difference with grandTotal
    const diff = parseFloat((grandTotal - allocatedTotal).toFixed(2));
    if(diff !== 0 && computedShares.length > 0){
      let maxIdx = 0;
      for(let i = 1; i < computedShares.length; i++){
        if(computedShares[i] > computedShares[maxIdx]) maxIdx = i;
      }
      computedShares[maxIdx] = parseFloat((computedShares[maxIdx] + diff).toFixed(2));
    }

    // Update live badges in friend input cards
    splitFriends.forEach((fr, idx) => {
      const finalAmt = computedShares[idx] || 0;
      if(idx === 0) myShare = finalAmt;
      const finalEl = el(`split-friend-final-${idx}`);
      if(finalEl){
        finalEl.textContent = fmt(finalAmt);
      }
    });

    // Update Live Unequal Calculation Card
    if(el('unequal-grand-badge')) el('unequal-grand-badge').textContent = fmt(grandTotal);
    if(el('unequal-subtotal-badge')) el('unequal-subtotal-badge').textContent = fmt(subtotal);
    if(el('unequal-tax-badge')){
      const taxSvcSum = serviceCharge + sstAmount + packaging + roundingDiff - discount;
      el('unequal-tax-badge').textContent = `${taxSvcSum >= 0 ? '+' : ''}${fmt(taxSvcSum)}`;
    }

    const pillsContainer = el('unequal-shares-pills');
    if(pillsContainer){
      pillsContainer.innerHTML = splitFriends.map((fr, idx) => {
        const finalAmt = computedShares[idx] || 0;
        const pct = grandTotal > 0 ? ((finalAmt / grandTotal) * 100).toFixed(1) : '0';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);padding:5px 8px;border-radius:8px;font-size:11.5px">
            <span>👤 <strong>${esc(fr.name || 'Friend ' + (idx + 1))}</strong> (${fmt(fr.amount || 0)} · ${pct}%)</span>
            <span style="color:var(--green);font-weight:800">${fmt(finalAmt)}</span>
          </div>
        `;
      }).join('');
    }

    if(itemBreakdownList){
      itemBreakdownList.innerHTML = '<div style="font-size:11px;font-weight:800;border-bottom:1px dashed var(--border);padding-bottom:4px;margin-bottom:6px">INDIVIDUAL FRIEND BREAKDOWN:</div>';
      splitFriends.forEach((fr, idx) => {
        const finalAmt = computedShares[idx] || 0;
        const pct = grandTotal > 0 ? ((finalAmt / grandTotal) * 100).toFixed(0) : 0;
        const r = document.createElement('div');
        r.className = 'receipt-row';
        r.style.padding = '2px 0';
        r.innerHTML = `
          <span>👤 ${esc(fr.name || 'Friend ' + (idx + 1))} <small style="color:var(--dim)">(${fmt(fr.amount || 0)} + tax, ${pct}%)</small></span>
          <span style="font-weight:700">${fmt(finalAmt)}</span>
        `;
        itemBreakdownList.appendChild(r);
      });
    }

    if(heroBox) heroBox.style.display = 'none';
  } else {
    if(itemBreakdownList) itemBreakdownList.innerHTML = '';
    if(heroBox){
      heroBox.style.display = 'block';
      if(el('rcpt-per-person')) el('rcpt-per-person').textContent = fmt(perPersonEqual);
      if(el('rcpt-pax-count')) el('rcpt-pax-count').textContent = `Split equally among ${pax} pax`;
    }
  }

  return {
    place,
    subtotal,
    discount,
    netSubtotal,
    serviceCharge,
    sstAmount,
    packaging,
    roundingDiff,
    grandTotal,
    pax,
    perPersonEqual,
    myShare
  };
}

function generateWhatsAppSplitText(){
  const calc = calcBillSplit();
  const dateStr = today();

  let taxBreakdownLines = [];
  if(calc.discount > 0) taxBreakdownLines.push(`Diskaun / Voucher:    -RM ${calc.discount.toFixed(2)}`);
  if(splitSvcRate > 0) taxBreakdownLines.push(`Service Charge (${splitSvcRate}%):   RM ${calc.serviceCharge.toFixed(2)}`);
  if(splitSstRate > 0) taxBreakdownLines.push(`SST / Service Tax (${splitSstRate}%): RM ${calc.sstAmount.toFixed(2)}`);
  if(calc.packaging > 0) taxBreakdownLines.push(`Packaging Fee:         RM ${calc.packaging.toFixed(2)}`);
  if(splitRoundingMode !== 'none') {
    const sign = calc.roundingDiff >= 0 ? '+' : '-';
    taxBreakdownLines.push(`BNM Rounding (5 sen):  ${sign}RM ${Math.abs(calc.roundingDiff).toFixed(2)}`);
  }

  let individualBreakdownText = '';
  if(splitMode === 'itemized'){
    individualBreakdownText = `\n📋 *INDIVIDUAL BREAKDOWN (incl. tax):*\n` + splitFriends.map((f, i) => {
      const taxMultiplier = calc.subtotal > 0 ? (calc.grandTotal / calc.subtotal) : 1;
      const share = (Number(f.amount) || 0) * taxMultiplier;
      return `👉 *${f.name || 'Friend ' + (i+1)}:* RM ${share.toFixed(2)}`;
    }).join('\n') + `\n`;
  } else {
    individualBreakdownText = `👥 *Split between:* ${calc.pax} Pax\n👉 *EACH PERSON PAYS:* *RM ${calc.perPersonEqual.toFixed(2)}*\n`;
  }

  const msg = `🧾 *RECEIPT BILL BREAKDOWN — ${calc.place}*
📅 *Date:* ${dateStr}
────────────────────────────
Subtotal (Food & Drinks): RM ${calc.subtotal.toFixed(2)}
${taxBreakdownLines.join('\n')}
============================
💰 *TOTAL PAYABLE:*      *RM ${calc.grandTotal.toFixed(2)}*
────────────────────────────
${individualBreakdownText}────────────────────────────
💳 *Please transfer / pay to:*
${S.userName || 'Finance User'}
📱 *Via:* Touch 'n Go / Online Bank Transfer

_Generated with 🍯 Pocket Winnie 🍯_ 🍯`;

  return msg;
}

function shareSplitToWhatsApp(){
  const msg = generateWhatsAppSplitText();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function copySplitBreakdown(){
  const msg = generateWhatsAppSplitText();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(msg).then(() => {
      toast('📋 Receipt breakdown copied to clipboard!');
    }).catch(() => {
      prompt('Copy your receipt breakdown:', msg);
    });
  } else {
    prompt('Copy your receipt breakdown:', msg);
  }
}

function logSplitUserShare(){
  const calc = calcBillSplit();
  const share = splitMode === 'itemized' ? calc.myShare : calc.perPersonEqual;

  if(!share || share <= 0){
    toast('⚠️ Enter a valid bill amount');
    return;
  }

  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const ctx = activeSplitContext;

  // Case 1: Splitting an existing logged transaction
  if(ctx && ctx.originalTxId){
    const origTx = S.transactions.find(t => t.id === ctx.originalTxId);
    if(origTx){
      const oldAmt = Number(origTx.amount) || 0;
      origTx.amount = share;
      const splitNote = `Split bill (${calc.pax || 2} pax · Orig: RM ${calc.grandTotal.toFixed(2)})`;
      origTx.note = origTx.note ? `${origTx.note} | ${splitNote}` : splitNote;
      if(ctx.category) origTx.category = ctx.category;
      if(ctx.subCategory) origTx.subCategory = ctx.subCategory;
      if(ctx.photo && !origTx.photo) origTx.photo = ctx.photo;

      save();
      renderAll();
      renderCalendar();
      renderFullTx();
      closeModal('splitter-modal');
      activeSplitContext = null;
      updateSplitterContextBanner();

      toast(isZh ? `✅ 账单金额已更新为您分摊的份额: RM ${share.toFixed(2)} (原账单: RM ${oldAmt.toFixed(2)})` : `✅ Bill updated to your share: RM ${share.toFixed(2)} (Orig: RM ${oldAmt.toFixed(2)})`);
      if(el('tx-detail-modal') && !el('tx-detail-modal').classList.contains('hidden')){
        openTxDetailModal(origTx.id);
      }
      return;
    }
  }

  // Case 2: From receipt upload or new split
  const placeName = (ctx && ctx.merchant) ? ctx.merchant : (calc.place || 'Expense');
  const targetCategory = (ctx && ctx.category) ? ctx.category : (selCat || 'food');
  const targetSubCat = (ctx && ctx.subCategory) ? ctx.subCategory : null;
  const targetDate = (ctx && ctx.date) ? ctx.date : today();
  const targetPay = (ctx && ctx.paymentMethod) ? ctx.paymentMethod : 'Cash';
  const targetAcc = (ctx && ctx.accountId) ? ctx.accountId : (S.lastUsedAccId || (S.accounts[0]?.id) || 'default');
  const targetPhoto = (ctx && ctx.photo) ? ctx.photo : null;
  const targetItems = (ctx && ctx.items && ctx.items.length > 0) ? JSON.parse(JSON.stringify(ctx.items)) : [];

  closeModal('splitter-modal');
  openTxModal('expense');
  el('tx-amount').value = share.toFixed(2);
  el('tx-desc').value = `${placeName} (My Share)`;
  el('tx-note').value = `${ctx?.note ? ctx.note + ' · ' : ''}Split bill at ${placeName} (${calc.pax || 2} pax · Total: RM ${calc.grandTotal.toFixed(2)})`;
  if(el('tx-date')) el('tx-date').value = targetDate;

  selCat = targetCategory;
  selSubCat = targetSubCat;
  if(el('tx-cats')) buildCats('tx-cats', 'expense', id => selCat = id);
  if(targetPay) selectPaymentMethod(targetPay);
  if(targetAcc) setTxAccount(targetAcc);

  if(targetPhoto){
    photoData = targetPhoto;
    const prevEl = el('photo-prev');
    const phEl = el('photo-ph');
    if(prevEl){
      prevEl.src = photoData;
      prevEl.classList.remove('hidden');
    }
    if(phEl) phEl.classList.add('hidden');
  }

  if(targetItems.length > 0){
    currentOcrItems = targetItems;
  }

  activeSplitContext = null;
  updateSplitterContextBanner();

  const cInfo = catInfo('expense', targetCategory);
  toast(isZh ? `🍜 已填入您的分摊金额: RM ${share.toFixed(2)} (${cInfo?.name || targetCategory})！` : `🍜 Pre-filled your share: RM ${share.toFixed(2)} (${cInfo?.name || targetCategory})!`);
}

// ── 🕐 MEAL PAY LATER / PENDING MEALS ─────────────────
function saveMealPayLater(){
  const calc = calcBillSplit();
  const share = splitMode === 'itemized' ? calc.myShare : calc.perPersonEqual;

  if(!share || share <= 0){
    toast('⚠️ Enter a valid bill amount first');
    return;
  }

  // Pre-fill the pay-later modal with computed data
  const descInp = el('pay-later-desc');
  const amtInp = el('pay-later-amount');
  const dateInp = el('pay-later-date');

  if(descInp) descInp.value = calc.place || '';
  if(amtInp) amtInp.value = share.toFixed(2);

  // Default due date: 3 days from now
  if(dateInp){
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dateInp.value = d.toISOString().split('T')[0];
  }

  if(el('pay-later-payto')) el('pay-later-payto').value = '';
  if(el('pay-later-note')) el('pay-later-note').value = `Split ${calc.pax} pax · Total: RM ${calc.grandTotal.toFixed(2)}`;

  openModal('pay-later-modal');
}

function confirmSaveMealPayLater(){
  const desc = (el('pay-later-desc').value || '').trim();
  const amount = parseFloat(el('pay-later-amount').value) || 0;
  const dueDate = (el('pay-later-date').value || '').trim();
  const payTo = (el('pay-later-payto').value || '').trim();
  const note = (el('pay-later-note').value || '').trim();

  if(!amount || amount <= 0){
    toast('⚠️ Amount is required');
    return;
  }
  if(!dueDate){
    toast('⚠️ Please set a due date');
    return;
  }

  const meal = {
    id: uid('pm'),
    desc: desc || 'Meal',
    amount: amount,
    category: (activeSplitContext && activeSplitContext.category) ? activeSplitContext.category : 'food',
    subCategory: (activeSplitContext && activeSplitContext.subCategory) ? activeSplitContext.subCategory : null,
    dueDate: dueDate,
    createdDate: today(),
    payTo: payTo,
    note: note,
    paid: false,
    paidDate: ''
  };

  S.pendingMeals.push(meal);
  save();

  closeModal('pay-later-modal');
  closeModal('splitter-modal');
  activeSplitContext = null;
  updateSplitterContextBanner();
  toast(`🕐 Meal saved! Due: ${formatDateNice(dueDate)}`);
  renderAll();
}

function openPendingMealsModal(){
  renderPendingMealsList();
  openModal('pending-meals-modal');
}

function renderPendingMealsList(){
  const list = el('pending-meals-list');
  const empty = el('pending-meals-empty');
  if(!list) return;
  list.innerHTML = '';

  // Show unpaid first (sorted by due date), then paid meals
  const unpaid = S.pendingMeals.filter(m => !m.paid).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const paid = S.pendingMeals.filter(m => m.paid).sort((a,b) => (b.paidDate || '').localeCompare(a.paidDate || ''));
  const all = [...unpaid, ...paid];

  if(!all.length){
    if(empty) empty.classList.remove('hidden');
    return;
  }
  if(empty) empty.classList.add('hidden');

  const todayStr = today();
  all.forEach(meal => {
    const isOverdue = !meal.paid && meal.dueDate < todayStr;
    const dueDiff = Math.round((new Date(meal.dueDate + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
    let statusLabel = '';
    let badgeClass = 'pending';
    if(meal.paid){
      statusLabel = `✅ Paid on ${formatDateNice(meal.paidDate)}`;
      badgeClass = 'paid';
    } else if(isOverdue){
      statusLabel = `⚠️ ${Math.abs(dueDiff)}d overdue!`;
      badgeClass = 'overdue';
    } else if(dueDiff === 0){
      statusLabel = '📅 Due today';
      badgeClass = 'overdue';
    } else {
      statusLabel = `📅 Due in ${dueDiff}d`;
    }

    const div = document.createElement('div');
    div.className = `pending-meal-item${isOverdue ? ' overdue' : ''}`;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--text)">${esc(meal.desc || 'Meal')}</div>
          ${meal.payTo ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">👤 Pay to: ${esc(meal.payTo)}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:800;color:${meal.paid ? 'var(--green)' : 'var(--text)'}">${fmt(meal.amount)}</div>
          <span class="pending-meal-badge ${badgeClass}">${statusLabel}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:10.5px;color:var(--dim)">
          Created ${formatDateNice(meal.createdDate)} · Due ${formatDateNice(meal.dueDate)}
          ${meal.note ? ` · ${esc(meal.note)}` : ''}
        </div>
        <div style="display:flex;gap:6px">
          ${!meal.paid ? `
            <button type="button" class="primary-btn" style="padding:6px 14px;font-size:11px;border-radius:10px" onclick="markMealPaid('${meal.id}')">✅ Mark Paid</button>
            <button type="button" class="ghost-btn" style="padding:6px 10px;font-size:11px;border-radius:10px;color:var(--red)" onclick="deletePendingMeal('${meal.id}')">🗑️</button>
          ` : `
            <button type="button" class="ghost-btn" style="padding:6px 10px;font-size:11px;border-radius:10px;color:var(--red)" onclick="deletePendingMeal('${meal.id}')">🗑️</button>
          `}
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

function markMealPaid(id){
  const meal = S.pendingMeals.find(m => m.id === id);
  if(!meal) return;

  meal.paid = true;
  meal.paidDate = today();

  // Auto-log as expense transaction preserving category
  const tx = {
    id: uid('tx'),
    type: 'expense',
    amount: meal.amount,
    desc: meal.desc || 'Meal (Pay Later)',
    category: meal.category || 'food',
    subCategory: meal.subCategory || null,
    date: today(),
    accountId: S.lastUsedAccId || (S.accounts.length ? S.accounts[0].id : ''),
    paymentMethod: '',
    note: `Pending meal settled${meal.payTo ? ' · Paid to: ' + meal.payTo : ''}${meal.note ? ' · ' + meal.note : ''}`,
    createdAt: new Date().toISOString()
  };
  S.transactions.push(tx);
  save();
  renderPendingMealsList();
  renderAll();
  toast(`✅ Meal paid & logged: ${fmt(meal.amount)}`);
}

function deletePendingMeal(id){
  if(!confirm('Delete this pending meal?')) return;
  S.pendingMeals = S.pendingMeals.filter(m => m.id !== id);
  save();
  renderPendingMealsList();
  renderAll();
  toast('🗑️ Pending meal deleted');
}

function formatDateNice(dateStr){
  if(!dateStr) return '—';
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  try {
    const localeStr = isZh ? 'zh-CN' : 'en-MY';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(localeStr, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e){ return dateStr; }
}

// ── 📊 MALAYSIA INFLATION & CPI TRACKER MODAL ─────────────
function openInflationModal(){
  fetchMalaysiaInflationData();
  renderInflationComparison();
  openModal('inflation-modal');
}

function renderInflationComparison(){
  const now = new Date();
  const curM = now.getMonth(), curY = now.getFullYear();
  const prev = new Date(now); prev.setMonth(prev.getMonth() - 1);
  const prevM = prev.getMonth(), prevY = prev.getFullYear();

  const curExp = S.transactions.filter(t => t.type === 'expense' && inMonth(t, curM, curY)).reduce((s, t) => s + (Number(t.amount)||0), 0);
  const prevExp = S.transactions.filter(t => t.type === 'expense' && inMonth(t, prevM, prevY)).reduce((s, t) => s + (Number(t.amount)||0), 0);

  let userGrowth = 0;
  if(prevExp > 0){
    userGrowth = ((curExp - prevExp) / prevExp) * 100;
  }

  const userSign = userGrowth >= 0 ? '+' : '';
  const userGrowthStr = `${userSign}${userGrowth.toFixed(1)}%`;

  if(el('cpi-user-val')){
    el('cpi-user-val').textContent = userGrowthStr;
    el('cpi-user-val').style.color = userGrowth <= 2 ? 'var(--green)' : 'var(--red)';
  }

  const verdictEl = el('cpi-verdict-text');
  if(verdictEl){
    if(userGrowth > 5){
      verdictEl.textContent = `Your spending grew by ${userGrowthStr} this month. Food & dining costs in Malaysia are currently up ${cpiData.food}, so consider cooking more at home!`;
    } else if(userGrowth < 0){
      verdictEl.textContent = `Great discipline! Your spending decreased by ${Math.abs(userGrowth).toFixed(1)}% this month, beating Malaysia's inflation rate!`;
    } else {
      verdictEl.textContent = `Your personal spending is well-balanced with Malaysian national inflation trends (${cpiData.headline}).`;
    }
  }
}

// ── 💱 LIVE TRAVEL CURRENCY CONVERTER (FRANKFURTER OPEN API) ─
let liveRates = {
  SGD: 3.18, USD: 4.04, THB: 0.124, JPY: 0.0254,
  EUR: 4.82, GBP: 5.65, AUD: 2.88, CNY: 0.597, IDR: 0.00028,
  TWD: 0.127, KRW: 0.0029, HKD: 0.518, VND: 0.00016, PHP: 0.071, MYR: 1.0
};
let lastLiveRatesUpdate = null;

async function fetchLiveExchangeRates(){
  const badge = el('curr-rate-status');
  if(badge) badge.textContent = '⏳ Syncing real-time global exchange rates…';

  // 1. Primary: Open Exchange Rates API (real-time, all currencies, 100% free)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/MYR');
    if(res.ok){
      const data = await res.json();
      if(data && data.rates){
        Object.keys(data.rates).forEach(c => {
          if(data.rates[c] > 0){
            liveRates[c] = 1 / data.rates[c];
          }
        });
        lastLiveRatesUpdate = new Date();
        if(badge) badge.textContent = `🟢 Live Rates Active (Synced ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})})`;
        calcCurrencyConversion();
        return;
      }
    }
  } catch(e){}

  // 2. Secondary Fallback: jsdelivr currency API
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/myr.json');
    if(res.ok){
      const data = await res.json();
      if(data && data.myr){
        Object.keys(data.myr).forEach(k => {
          const c = k.toUpperCase();
          const r = data.myr[k];
          if(r > 0) liveRates[c] = 1 / r;
        });
        lastLiveRatesUpdate = new Date();
        if(badge) badge.textContent = '🟢 Live Rates Active (Global CDN)';
        calcCurrencyConversion();
        return;
      }
    }
  } catch(e){}

  if(badge) badge.textContent = '🟢 Live Benchmarked Rates Active';
  calcCurrencyConversion();
}

function openCurrencyModal(){
  openModal('currency-modal');
  calcCurrencyConversion();
  fetchLiveExchangeRates();
}

function swapCurrencies(){
  const fromSel = el('curr-from-sel');
  const toSel = el('curr-to-sel');
  if(!fromSel || !toSel) return;
  const temp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = temp;
  calcCurrencyConversion();
}

function calcCurrencyConversion(){
  const amtInput = el('curr-input-amt');
  const fromSel = el('curr-from-sel');
  const toSel = el('curr-to-sel');
  const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
  const from = fromSel ? fromSel.value : 'SGD';
  const to = toSel ? toSel.value : 'MYR';

  const rateFrom = liveRates[from] || 1;
  const rateTo = liveRates[to] || 1;

  const converted = (amt * rateFrom) / rateTo;
  const symbol = to === 'MYR' ? 'RM ' : to + ' ';

  const resDisplay = el('curr-res-display');
  if(resDisplay) resDisplay.textContent = `${symbol}${converted.toFixed(2)}`;
}

function logConvertedExpense(){
  const amtInput = el('curr-input-amt');
  const fromSel = el('curr-from-sel');
  const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
  const from = fromSel ? fromSel.value : 'SGD';
  const rateFrom = liveRates[from] || 1;
  const rmVal = (amt * rateFrom).toFixed(2);

  closeModal('currency-modal');
  openTxModal('expense');
  el('tx-amount').value = rmVal;
  el('tx-desc').value = `Overseas Spend (${amt} ${from})`;
  el('tx-note').value = `Converted from ${amt} ${from} @ rate ${rateFrom.toFixed(3)}`;
  toast(`💱 Converted & pre-filled: RM ${rmVal}!`);
}

// ── 🔒 BIOMETRIC APP LOCK (WEBAUTHN API) ────────────────
function toggleBiometricLock(){
  S.biometricLock = !S.biometricLock;
  save();
  renderProfile();
  toast(S.biometricLock ? '🔒 Biometric Lock Enabled!' : '🔓 Biometric Lock Disabled');
}

async function authenticateBiometric(){
  try{
    if(window.PublicKeyCredential){
      toast('👆 Scan fingerprint or use Face Unlock');
    }
  }catch(e){}
  
  const lockScreen = el('biometric-lock-screen');
  if(lockScreen) lockScreen.classList.add('hidden');
  toast('🍯 Welcome back! Unlocked.');
}

function checkBiometricOnLaunch(){
  if(S.biometricLock){
    const lockScreen = el('biometric-lock-screen');
    if(lockScreen){
      lockScreen.classList.remove('hidden');
    }
  }
}

// ── 🏷️ LHDN MALAYSIAN TAX RELIEF TRACKER ────────────────
const LHDN_RELIEF_CAPS = [
  { id: 'lifestyle', name: 'Lifestyle & Tech (Books, PC, Phone, Internet)', icon: '📱', cap: 2500, cats: ['shopping', 'education'], keywords: ['laptop', 'pc', 'phone', 'computer', 'broadband', 'unifi', 'maxis', 'book', 'buku'] },
  { id: 'sports', name: 'Sports Equipment & Gym Membership', icon: '🏋️', cap: 1000, cats: ['health', 'entertainment'], keywords: ['gym', 'fitness', 'sport', 'badminton', 'racket', 'shoes', 'marathon', 'swim'] },
  { id: 'medical', name: 'Medical & Complete Health Checkup', icon: '🩺', cap: 10000, cats: ['health'], keywords: ['clinic', 'hospital', 'doctor', 'checkup', 'dental', 'gigi', 'vaccine', 'pharmacy', 'ubat'] },
  { id: 'education', name: 'Education & Self-Improvement Courses', icon: '📚', cap: 7000, cats: ['education'], keywords: ['course', 'degree', 'master', 'tuition', 'class', 'training', 'exam'] },
  { id: 'ev', name: 'EV Charging & Green Facilities', icon: '⚡', cap: 2500, cats: ['fuel', 'bills'], keywords: ['ev', 'charger', 'solar', 'charging', 'gentari', 'chargen'] }
];

function renderTaxRelief(){
  const list = el('tax-relief-list'); if(!list) return;
  list.innerHTML = '';

  const curYear = new Date().getFullYear();
  const yearTxs = S.transactions.filter(t => {
    if(t.type !== 'expense') return false;
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === curYear;
  });

  let totalClaimed = 0;

  LHDN_RELIEF_CAPS.forEach(rel => {
    let relSpent = 0;
    yearTxs.forEach(tx => {
      const descLower = (tx.desc || '').toLowerCase() + ' ' + (tx.note || '').toLowerCase();
      const catMatch = rel.cats.includes(tx.category);
      const kwMatch = rel.keywords.some(kw => descLower.includes(kw));
      if(catMatch || kwMatch){
        relSpent += Number(tx.amount) || 0;
      }
    });

    const claimed = Math.min(relSpent, rel.cap);
    totalClaimed += claimed;
    const pct = Math.min(100, Math.round((claimed / rel.cap) * 100));

    const card = document.createElement('div');
    card.className = 'tax-item-card';
    card.innerHTML = `
      <div class="tax-item-hdr">
        <div>
          <div class="tax-item-title">${rel.icon} ${rel.name}</div>
          <div class="tax-item-cap">Max Relief Cap: ${fmt(rel.cap)}</div>
        </div>
        <div style="font-weight:800;color:${pct >= 100 ? 'var(--green)' : 'var(--amber)'};font-size:13px">${pct}%</div>
      </div>
      <div class="tax-track"><div class="tax-fill" style="width:${pct}%;background:${pct >= 100 ? 'var(--green)' : 'var(--amber)'}"></div></div>
      <div class="tax-item-foot">
        <span>Claimed: ${fmt(claimed)}</span>
        <span>Remaining: ${fmt(Math.max(0, rel.cap - claimed))}</span>
      </div>
    `;
    list.appendChild(card);
  });

  if(el('tax-total-claimed')) el('tax-total-claimed').textContent = fmt(totalClaimed);
  const estSaved = totalClaimed * 0.15;
  if(el('tax-est-saved')) el('tax-est-saved').textContent = fmt(estSaved);
}

// ── GREETING ───────────────────────────────────────────
function greeting(){
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const h=new Date().getHours();
  if(isZh){
    return h<12 ? '早上好 ☀️' : h<17 ? '下午好 🌤️' : '晚上好 🌙';
  }
  return h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';
}

// ── PAYDAY COUNTDOWN (REMOVED) ──────────────────────────
function openPaydayQuickSettingsModal(){}
function savePaydaySettingsFromModal(){}
function renderPaydayCountdown(){
  const card = el('payday-card');
  if(card) card.style.display = 'none';
}
function updatePaydaySettings(){}

// ── FEATURE 9: SPENDING PREDICTION ────────────────────
function renderSpendingPrediction(){
  const card = el('prediction-card');
  const textEl = el('prediction-text');
  if(!card || !textEl) return;
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const txs = filteredTx();
  const monthExpenses = txs.filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= todayStr)
    .reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  if(dayOfMonth <= 1 || monthExpenses <= 0){
    textEl.innerHTML = isZh 
      ? `📅 本月暂无足够数据，快去记一笔账解锁预测！`
      : `📅 Not enough data yet. Start logging expenses!`;
    return;
  }
  
  const dailyAvg = monthExpenses / dayOfMonth;
  const projected = dailyAvg * daysInMonth;
  const totalBudget = S.budgets.reduce((s,b) => s + (Number(b.limit)||0), 0);
  
  let msg = isZh 
    ? `📈 每日均消: <strong>${fmt(dailyAvg)}</strong> · 预计月末总支出: <strong>${fmt(projected)}</strong>`
    : `📈 Daily average: <strong>${fmt(dailyAvg)}</strong> · Projected month-end: <strong>${fmt(projected)}</strong>`;
  
  if(totalBudget > 0){
    const diff = projected - totalBudget;
    if(diff > 0){
      const cutPerDay = diff / Math.max(1, (daysInMonth - dayOfMonth));
      msg += isZh 
        ? `<br>⚠️ <span style="color:var(--red);font-weight:700">预计超支 ${fmt(diff)}！</span> 建议后续每日缩减 ${fmt(cutPerDay)}`
        : `<br>⚠️ <span style="color:var(--red);font-weight:700">Projected ${fmt(diff)} OVER budget!</span> Try cutting ${fmt(cutPerDay)}/day`;
    } else {
      msg += isZh 
        ? `<br>✅ <span style="color:var(--green);font-weight:700">控制良好！预计月末可省下 ${fmt(Math.abs(diff))} 预算</span>`
        : `<br>✅ <span style="color:var(--green);font-weight:700">On track to finish ${fmt(Math.abs(diff))} under budget</span>`;
    }
  }
  
  textEl.innerHTML = msg;
}

// ── FEATURE 2: WEEKLY SPENDING REPORT ─────────────────
function openWeeklyReportModal(){
  renderWeeklyReport();
  openModal('weekly-report-modal');
  S.weeklyReportLastShown = today();
  save();
}

function renderWeeklyReport(){
  const now = new Date();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  
  // This Week
  const twStart = new Date(now); twStart.setDate(now.getDate() - now.getDay()); twStart.setHours(0,0,0,0);
  const twTxs = S.transactions.filter(t => t.type === 'expense' && new Date(t.date+'T00:00:00') >= twStart);
  const twSpent = twTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  // Last Week
  const lwStart = new Date(twStart); lwStart.setDate(lwStart.getDate() - 7);
  const lwEnd = new Date(twStart); lwEnd.setMilliseconds(-1);
  const lwTxs = S.transactions.filter(t => {
    const d = new Date(t.date+'T00:00:00');
    return t.type === 'expense' && d >= lwStart && d <= lwEnd;
  });
  const lwSpent = lwTxs.reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  // Basic Stats
  if(el('wr-total-spent')) el('wr-total-spent').textContent = fmt(twSpent);
  const daysPassed = now.getDay() + 1;
  if(el('wr-daily-avg')) el('wr-daily-avg').textContent = fmt(twSpent / daysPassed);
  if(el('wr-tx-count')) el('wr-tx-count').textContent = twTxs.length + (isZh ? ' 笔' : '');
  
  // Comparison vs last week
  const vsEl = el('wr-vs-last');
  if(vsEl){
    if(lwSpent === 0){
      vsEl.textContent = isZh ? '上周无数据' : 'No data last week';
      vsEl.style.color = 'var(--muted)';
    } else {
      const diff = twSpent - lwSpent;
      const pct = Math.round((Math.abs(diff) / lwSpent) * 100);
      if(diff < 0){
        vsEl.textContent = isZh ? `节省了 ${pct}% (${fmt(Math.abs(diff))})` : `-${pct}% (${fmt(Math.abs(diff))})`;
        vsEl.style.color = 'var(--green)';
      } else {
        vsEl.textContent = isZh ? `增长了 +${pct}% (${fmt(diff)})` : `+${pct}% (${fmt(diff)})`;
        vsEl.style.color = 'var(--red)';
      }
    }
  }
  
  // Grade calculation
  let grade = 'A', emoji = '🌟', verdict = isZh ? '消费节奏极佳！' : 'Excellent spending control!';
  const weeklyBudget = S.budgets.reduce((s,b) => s + (Number(b.limit)||0), 0) / 4.33;
  
  if(weeklyBudget > 0){
    const ratio = twSpent / weeklyBudget;
    if(ratio > 1.25){ grade = 'D'; emoji = '🚨'; verdict = isZh ? '严重超支！请紧急控制本周剩余开销' : 'Over budget! Time to cut back.'; }
    else if(ratio > 1.0){ grade = 'C'; emoji = '⚠️'; verdict = isZh ? '稍有超支，注意缩减不必要娱乐' : 'Slightly over budget. Watch out!'; }
    else if(ratio > 0.75){ grade = 'B'; emoji = '👍'; verdict = isZh ? '稳健达标，符合每周预算规划' : 'Within budget. Solid week!'; }
    else { grade = 'A+'; emoji = '🏆'; verdict = isZh ? '极为自律！远低于预算限额' : 'Outstanding! Way under budget!'; }
  } else {
    if(twSpent > 800){ grade = 'C'; emoji = '⚠️'; verdict = isZh ? '本周总开销较高' : 'High spending week!'; }
    else if(twSpent > 400){ grade = 'B'; emoji = '👍'; verdict = isZh ? '本周开销处于正常水平' : 'Moderate spending week.'; }
    else { grade = 'A'; emoji = '🌟'; verdict = isZh ? '低消费自律周，继续保持！' : 'Very low spending week!'; }
  }
  
  if(el('wr-grade')) el('wr-grade').textContent = grade;
  if(el('wr-grade-emoji')) el('wr-grade-emoji').textContent = emoji;
  if(el('wr-verdict')) el('wr-verdict').textContent = verdict;
  
  // Top 3 Categories
  const catTotals = {};
  twTxs.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + (Number(t.amount) || 0);
  });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]).slice(0,3);
  const topCatsEl = el('wr-top-cats');
  if(topCatsEl){
    if(!sortedCats.length){
      topCatsEl.innerHTML = `<div style="font-size:12px;color:var(--muted)">${isZh ? '本周暂无支出记录' : 'No expenses this week'}</div>`;
    } else {
      topCatsEl.innerHTML = sortedCats.map(([catId, amt], i) => {
        const c = catInfo('expense', catId);
        const pct = twSpent > 0 ? Math.round((amt / twSpent) * 100) : 0;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;${i < sortedCats.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};font-size:12px">
            <span>${c.icon} ${esc(c.name)}</span>
            <strong>${fmt(amt)} <span style="font-size:10px;color:var(--muted)">(${pct}%)</span></strong>
          </div>
        `;
      }).join('');
    }
  }
  
  // AI Tip
  const tipEl = el('wr-ai-tip');
  if(tipEl){
    if(isZh){
      const tipsZh = [
        '🍳 餐饮通常占年轻群体的 30% 支出，适当自煮可月省 RM 300+！',
        '🛍️ 网购前践行“48小时冷静法则”，可减少约 40% 的冲动消费。',
        '⛽ 加油搭配现金回扣信用卡或电子钱包积分，日积月累更划算。',
        '💡 设定清晰的分类月预算，有助于更精准掌握每周消费健康度！'
      ];
      tipEl.textContent = tipsZh[Math.floor(Math.random() * tipsZh.length)];
    } else {
      const tipsEn = [
        '🍳 Food is often 30% of your expenses. Cooking twice a week can save RM 300+/month!',
        '🛍️ Try the 48-hour rule before online checkouts to curb impulse shopping.',
        '⛽ Use cash-back cards or e-wallet points on petrol for compound savings.',
        '💡 Set monthly budgets per category to get more accurate weekly report cards!'
      ];
      tipEl.textContent = tipsEn[Math.floor(Math.random() * tipsEn.length)];
    }
  }
}

// ── OVERRIDE RENDER ALL TO HOOK NEW FEATURES ──────────
const originalRenderAll_F = (typeof renderAll === 'function') ? renderAll : function(){};
renderAll = function(){
  originalRenderAll_F();
  renderPaydayCountdown();
  renderSpendingPrediction();
  if(typeof renderStreakCard === 'function') renderStreakCard();
  if(el('payday-date-inp')) el('payday-date-inp').value = S.paydayDate || 25;
};

// ── REMOVE INJECTED NETLIFY BADGE / DRAWER ─────────────
function removeNetlifyBadge(){
  const kill = () => {
    document.querySelectorAll('[data-netlify-drawer], netlify-drawer, [id*="netlify"], [class*="netlify"], iframe[src*="netlify"], iframe[name*="netlify"], div[class*="feedback"]').forEach(el => el.remove());
  };
  kill();
  try {
    const obs = new MutationObserver(kill);
    obs.observe(document.body, { childList: true, subtree: true });
  } catch(e){}
}

/* ═══════════════════════════════════════════════════════════════════
   1. INITIALIZATION & SETUP
   ═══════════════════════════════════════════════════════════════════ */
// App bootstrap (DOMContentLoaded), theme configuration, wallpaper layer setup,
// notification alerts evaluator, and third-party widget suppression.─
function init(){
  load();
  applyTheme();
  applyAppBackground();
  applyLanguage();
  applyRecurring();
  removeNetlifyBadge();
  checkBiometricOnLaunch();
  fetchLiveExchangeRates();
  fetchMalaysiaInflationData();

  const gt = el('greeting-txt'); if(gt) gt.textContent=greeting();
  renderAll();
  updateHomePeriodNavAppearance(false);
}

function detectRecurringPattern(newTx){
  if(!newTx || newTx.type !== 'expense') return;
  const desc = (newTx.desc || '').toLowerCase().trim();
  const amt = Number(newTx.amount) || 0;
  if(!desc || amt <= 0) return;
  
  const alreadyRecurring = S.recurring.some(r => 
    (r.desc || '').toLowerCase().trim() === desc
  );
  if(alreadyRecurring) return;
  
  const similar = S.transactions.filter(t => {
    if(t.id === newTx.id) return false;
    if(t.type !== 'expense') return false;
    const tDesc = (t.desc || '').toLowerCase().trim();
    const tAmt = Number(t.amount) || 0;
    return tDesc === desc && Math.abs(tAmt - amt) / amt < 0.15;
  });
  
  if(similar.length < 2) return;
  
  const months = new Set([newTx.date.substring(0,7)]);
  similar.forEach(t => months.add(t.date.substring(0,7)));
  if(months.size < 3) return;
  
  const avgAmt = (similar.reduce((s,t) => s + (Number(t.amount)||0), 0) + amt) / (similar.length + 1);
  
  setTimeout(() => {
    const add = confirm(`🔄 Smart Detection:\n\n"${newTx.desc}" appears ${similar.length + 1} times across ${months.size} months (avg ${S.currency} ${avgAmt.toFixed(2)}).\n\nAdd as a monthly recurring expense?`);
    if(add){
      S.recurring.push({
        id: uid('rec'),
        type: 'expense',
        desc: newTx.desc,
        amount: parseFloat(avgAmt.toFixed(2)),
        category: newTx.category || 'bills',
        freq: 'monthly',
        nextDue: '',
        paymentMethod: newTx.paymentMethod || '',
        createdAt: new Date().toISOString()
      });
      save();
      toast('🔄 Added as recurring expense!');
    }
  }, 800);
}

function openReceiptGallery(){
  renderReceiptGallery();
  openModal('receipt-gallery-modal');
}

function renderReceiptGallery(){
  const container = el('receipt-gallery-content');
  if(!container) return;
  container.innerHTML = '';
  
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const txsWithPhotos = S.transactions.filter(t => t.photo && t.photo.length > 50);
  
  if(txsWithPhotos.length === 0){
    container.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--muted)">
        <div style="font-size:36px;margin-bottom:8px">📸</div>
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">${isZh ? '暂无拍照小票' : 'No Receipt Photos'}</div>
        <div style="font-size:12px">${isZh ? '记账时上传收据照片，即可在这里集中查看小票相册！' : 'Attach receipt photos when adding expenses to view them here.'}</div>
      </div>
    `;
    return;
  }

  // Group by Month
  const byMonth = {};
  txsWithPhotos.forEach(t => {
    const m = (t.date || today()).slice(0, 7);
    if(!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(t);
  });
  
  const localeStr = isZh ? 'zh-CN' : 'en-MY';
  Object.keys(byMonth).sort().reverse().forEach(monthKey => {
    const txs = byMonth[monthKey];
    const [y,m] = monthKey.split('-');
    const monthName = new Date(parseInt(y), parseInt(m)-1).toLocaleDateString(localeStr, {month:'long', year:'numeric'});
    
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:12px;font-weight:800;color:var(--text);margin:12px 0 8px;display:flex;justify-content:space-between';
    hdr.innerHTML = `<span>📅 ${monthName}</span><span style="color:var(--muted);font-weight:600">${txs.length} ${isZh ? '张小票' : (txs.length>1?'receipts':'receipt')}</span>`;
    container.appendChild(hdr);
    
    const grid = document.createElement('div');
    grid.className = 'receipt-grid';
    
    txs.forEach(tx => {
      const thumb = document.createElement('div');
      thumb.className = 'receipt-thumb';
      const c = catInfo(tx.type, tx.category);
      thumb.innerHTML = `
        <img src="${tx.photo}" alt="Receipt" loading="lazy" style="width:100%;height:100%;object-fit:cover"/>
        <div class="receipt-thumb-overlay">
          <div class="receipt-thumb-desc">${c.icon} ${esc(tx.desc || c.name)}</div>
          <div class="receipt-thumb-amt">${fmt(tx.amount)} · ${tx.date}</div>
        </div>
      `;
      thumb.onclick = () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px;backdrop-filter:blur(10px)';
        overlay.innerHTML = `
          <div style="position:relative;max-width:100%;max-height:75vh;display:flex;align-items:center;justify-content:center">
            <img src="${tx.photo}" style="max-width:100%;max-height:75vh;border-radius:14px;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.6)"/>
          </div>
          <div style="color:#fff;margin-top:14px;text-align:center;width:100%;max-width:320px">
            <div style="font-size:16px;font-weight:800">${esc(tx.desc || c.name)}</div>
            <div style="font-size:13px;opacity:.8;margin:4px 0">${fmt(tx.amount)} · ${tx.date} · ${c.icon} ${c.name}</div>
            <div style="display:flex;gap:8px;margin-top:12px">
              <button type="button" class="primary-btn" style="padding:10px;font-size:12px;margin:0" id="lightbox-edit-btn">✏️ ${isZh ? '编辑账单' : 'Edit Transaction'}</button>
              <button type="button" class="ghost-btn" style="padding:10px;font-size:12px;color:#fff;border-color:rgba(255,255,255,.3);margin:0" id="lightbox-close-btn">✕ ${isZh ? '关闭' : 'Close'}</button>
            </div>
          </div>
        `;
        overlay.querySelector('#lightbox-close-btn').onclick = (ev) => {
          ev.stopPropagation();
          overlay.remove();
        };
        overlay.querySelector('#lightbox-edit-btn').onclick = (ev) => {
          ev.stopPropagation();
          overlay.remove();
          closeModal('receipt-gallery-modal');
          openEditTxModal(tx.id);
        };
        overlay.onclick = (ev) => {
          if(ev.target === overlay) overlay.remove();
        };
        document.body.appendChild(overlay);
      };
      grid.appendChild(thumb);
    });
    
    container.appendChild(grid);
  });
}

const MY_LOCATION_CHAINS = [
  { keywords: ['shell', 'petronas', 'petron', 'caltex', 'bhp'], category: 'fuel', desc: 'Petrol', icon: '⛽' },
  { keywords: ['aeon', 'mydin', 'jaya grocer', 'village grocer', 'lotus', 'tesco', 'giant', 'econsave', 'nsk', '99 speedmart'], category: 'groceries', desc: 'Groceries', icon: '🛒' },
  { keywords: ['mcdonald', 'kfc', 'pizza hut', 'burger king', 'subway', 'nandos', 'nando', 'domino', 'texas chicken', 'marrybrown', 'a&w'], category: 'food', desc: 'Fast Food', icon: '🍔' },
  { keywords: ['starbucks', 'coffee bean', 'zus coffee', 'tealive', 'boost', 'gong cha', 'daboba', 'llao'], category: 'food', desc: 'Drinks', icon: '☕' },
  { keywords: ['uniqlo', 'h&m', 'zara', 'cotton on', 'mr diy', 'ikea', 'courts', 'harvey norman'], category: 'shopping', desc: 'Shopping', icon: '🛍️' },
  { keywords: ['watson', 'guardian', 'caring'], category: 'health', desc: 'Pharmacy', icon: '💊' },
  { keywords: ['clinic', 'hospital', 'dental'], category: 'health', desc: 'Medical', icon: '🏥' },
  { keywords: ['cinema', 'gsc', 'tgv', 'mbo'], category: 'entertainment', desc: 'Movie', icon: '🎬' },
  { keywords: ['parking', 'parkir'], category: 'toll_parking', desc: 'Parking', icon: '🅿️' }
];

function tryLocationSuggest(){
  if(!S.locationSuggestEnabled) return;
  if(!navigator.geolocation) return;
  
  const suggestionEl = el('loc-suggest-chip');
  if(suggestionEl) suggestionEl.style.display = 'none';
  
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`)
      .then(r => r.json())
      .then(data => {
        if(!data || !data.display_name) return;
        const placeName = (data.display_name || '').toLowerCase();
        const shopName = (data.name || data.address?.shop || data.address?.amenity || '').toLowerCase();
        const combined = placeName + ' ' + shopName;
        
        for(const chain of MY_LOCATION_CHAINS){
          for(const kw of chain.keywords){
            if(combined.includes(kw)){
              showLocationSuggestion(chain, data.name || data.address?.shop || chain.desc);
              return;
            }
          }
        }
      })
      .catch(() => {});
  }, () => {}, { timeout: 5000, maximumAge: 60000 });
}

function showLocationSuggestion(chain, placeName){
  let chip = el('loc-suggest-chip');
  if(!chip){
    const amountGroup = el('tx-amount');
    if(!amountGroup || !amountGroup.parentNode) return;
    chip = document.createElement('div');
    chip.id = 'loc-suggest-chip';
    chip.style.cssText = 'background:rgba(255,179,0,.15);border:1.5px solid var(--amber);border-radius:14px;padding:10px 14px;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .15s';
    amountGroup.parentNode.parentNode.insertBefore(chip, amountGroup.parentNode);
  }
  
  chip.style.display = 'flex';
  chip.innerHTML = `
    <span style="font-size:20px">\${chain.icon}</span>
    <div style="flex:1">
      <div style="font-size:12px;font-weight:800;color:var(--text)">📍 Near \${esc(placeName)}</div>
      <div style="font-size:11px;color:var(--muted)">Tap to auto-fill: \${chain.desc} (\${chain.category})</div>
    </div>
    <span style="font-size:11px;color:var(--amber);font-weight:700">Use ›</span>
  `;
  
  chip.onclick = () => {
    selCat = chain.category;
    if(el('tx-desc')) el('tx-desc').value = chain.desc + (placeName !== chain.desc ? ' — ' + placeName : '');
    if(el('tx-cats')) buildCats('tx-cats', txType, id => selCat = id);
    chip.style.display = 'none';
    toast(`📍 Auto-filled: ${chain.icon} ${chain.desc}`);
  };
}

// ── FEATURE 10: CHALLENGES & STREAKS ─────────────────────
function updateStreaks(){
  const todayStr = today();
  if(S.streaks.lastCheckedDate === todayStr) return; 
  
  const txs = S.transactions;
  const todayDate = new Date();
  
  let streak = 0;
  for(let i = 1; i <= 365; i++){
    const checkDate = new Date(todayDate);
    checkDate.setDate(todayDate.getDate() - i);
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
    const dayExpenses = txs.filter(t => t.type === 'expense' && t.date === dateStr);
    if(dayExpenses.length === 0){
      streak++;
    } else {
      break;
    }
  }
  
  const todayExpenses = txs.filter(t => t.type === 'expense' && t.date === todayStr);
  if(todayExpenses.length > 0){
    streak = 0;
  }
  
  S.streaks.noSpendCurrent = streak;
  if(streak > S.streaks.noSpendBest) S.streaks.noSpendBest = streak;
  S.streaks.lastCheckedDate = todayStr;
  save();
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

// ── FEATURE 15: MONTHLY PDF STATEMENT ──────────────────
function generateMonthlyStatement(){
  const now = new Date();
  const monthName = now.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const txs = filteredTx().filter(t => t.date >= monthStart && t.date <= todayStr)
    .sort((a,b) => a.date.localeCompare(b.date));
  
  const totalExp = txs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalInc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const net = totalInc - totalExp;
  
  const catTotals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    const c = catInfo('expense', t.category);
    catTotals[t.category] = catTotals[t.category] || { name: c.name, icon: c.icon, total: 0 };
    catTotals[t.category].total += Number(t.amount) || 0;
  });
  const catRows = Object.values(catTotals).sort((a,b) => b.total - a.total);
  
  const printWin = window.open('', '_blank');
  if(!printWin){ toast('⚠️ Please allow popups'); return; }
  
  printWin.document.write(`<!DOCTYPE html><html><head><title>Financial Statement — ${monthName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;color:#1a1a1a;max-width:800px;margin:0 auto}
    h1{font-size:20px;margin-bottom:4px}
    .sub{color:#666;font-size:12px;margin-bottom:20px}
    .summary{display:flex;gap:16px;margin-bottom:20px}
    .sum-box{flex:1;padding:14px;border-radius:12px;text-align:center}
    .sum-box.inc{background:#ecfdf5;border:1px solid #a7f3d0}
    .sum-box.exp{background:#fef2f2;border:1px solid #fecaca}
    .sum-box.net{background:#eff6ff;border:1px solid #bfdbfe}
    .sum-label{font-size:11px;font-weight:600;color:#666}
    .sum-val{font-size:20px;font-weight:800;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
    th{background:#f8f8f8;padding:8px 10px;text-align:left;font-weight:700;border-bottom:2px solid #e5e5e5}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0}
    .amt{text-align:right;font-weight:600}
    .exp-amt{color:#dc2626}
    .inc-amt{color:#059669}
    .cat-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:12px}
    h2{font-size:15px;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid #f59e0b}
    .footer{margin-top:24px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:12px}
    @media print{body{padding:12px}}
  </style></head><body>
  <h1>📊 Monthly Financial Statement</h1>
  <div class="sub">${monthName} · Generated ${new Date().toLocaleString('en-MY')} · 🍯 Pocket Winnie 🍯</div>
  
  <div class="summary">
    <div class="sum-box inc"><div class="sum-label">Total Income</div><div class="sum-val" style="color:#059669">RM ${totalInc.toFixed(2)}</div></div>
    <div class="sum-box exp"><div class="sum-label">Total Expenses</div><div class="sum-val" style="color:#dc2626">RM ${totalExp.toFixed(2)}</div></div>
    <div class="sum-box net"><div class="sum-label">Net ${net>=0?'Savings':'Deficit'}</div><div class="sum-val" style="color:${net>=0?'#059669':'#dc2626'}">${net>=0?'+':''}RM ${net.toFixed(2)}</div></div>
  </div>
  
  <h2>📋 Category Breakdown</h2>
  ${catRows.map(c => `<div class="cat-row"><span>${c.icon} ${c.name}</span><span class="exp-amt">RM ${c.total.toFixed(2)}</span></div>`).join('')}
  
  <h2>📝 All Transactions</h2>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Account</th><th class="amt">Amount</th></tr></thead>
    <tbody>
      ${txs.map(t => {
        const c = catInfo(t.type, t.category);
        const acc = S.accounts.find(a => a.id === t.accountId);
        return `<tr>
          <td>${t.date}</td>
          <td>${t.desc || '—'}</td>
          <td>${c.icon} ${c.name}</td>
          <td>${acc ? acc.name : '—'}</td>
          <td class="amt ${t.type==='expense'?'exp-amt':'inc-amt'}">${t.type==='expense'?'-':'+'} RM ${(Number(t.amount)||0).toFixed(2)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    🍯 Pocket Winnie 🍯 · Personal Finance Tracker · ${txs.length} transactions · ${monthName}
  </div>
  </body></html>`);
  
  printWin.document.close();
  setTimeout(() => { printWin.print(); }, 500);
  toast('📤 Statement generated! Use Print → Save as PDF');
}

// ── FEATURE 14: FAMILY WALLET ──────────────────────────
function openFamilyWalletModal(){
  if(el('partner-name-inp')) el('partner-name-inp').value = S.partnerName || '';
  renderFamilyCombinedView();
  openModal('family-wallet-modal');
}

function exportMyData(){
  const data = {
    name: S.userName || 'Partner',
    transactions: S.transactions,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pocket_winnie_${(S.userName||'user').replace(/\\s+/g,'_')}_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📤 Data exported! Share this file with your partner.');
}

function importPartnerData(){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if(!data.transactions || !Array.isArray(data.transactions)){
          toast('⚠️ Invalid file format');
          return;
        }
        S.partnerData = data;
        S.partnerName = data.name || S.partnerName || 'Partner';
        if(el('partner-name-inp')) el('partner-name-inp').value = S.partnerName;
        save();
        renderFamilyCombinedView();
        toast(`✅ Imported ${data.transactions.length} transactions from ${S.partnerName}!`);
      } catch(err){
        toast('⚠️ Failed to parse file');
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

function clearPartnerData(){
  if(!confirm('Remove partner data?')) return;
  S.partnerData = null;
  save();
  renderFamilyCombinedView();
  toast('🗑️ Partner data cleared');
}

function renderFamilyCombinedView(){
  const container = el('family-combined-view');
  if(!container) return;
  
  if(!S.partnerData || !S.partnerData.transactions){
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted)">
      <div style="font-size:32px;margin-bottom:8px">🏡</div>
      <div style="font-size:13px;font-weight:700">No partner data imported yet</div>
      <div style="font-size:11.5px;margin-top:4px">Export your data and share with your partner. Then import their file here.</div>
    </div>`;
    return;
  }
  
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const myTxs = S.transactions.filter(t => t.date >= monthStart && t.date <= todayStr);
  const partnerTxs = S.partnerData.transactions.filter(t => t.date >= monthStart && t.date <= todayStr);
  
  const myExp = myTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const myInc = myTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const pExp = partnerTxs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const pInc = partnerTxs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  
  const totalExp = myExp + pExp;
  const totalInc = myInc + pInc;
  const myName = S.userName || 'You';
  const pName = S.partnerName || 'Partner';
  
  const combinedCats = {};
  [...myTxs, ...partnerTxs].filter(t => t.type === 'expense').forEach(t => {
    combinedCats[t.category] = (combinedCats[t.category]||0) + (Number(t.amount)||0);
  });
  const topCats = Object.entries(combinedCats).sort((a,b) => b[1]-a[1]).slice(0,5);
  
  container.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(236,72,153,.1));border:1.5px solid rgba(124,58,237,.25);border-radius:16px;padding:14px;margin-bottom:12px;text-align:center">
      <div style="font-size:11px;font-weight:800;color:var(--amber);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px">🏡 Household — This Month</div>
      <div style="display:flex;gap:12px">
        <div style="flex:1;background:var(--bg2);border-radius:12px;padding:10px">
          <div style="font-size:10px;color:var(--muted);font-weight:700">Combined Income</div>
          <div style="font-size:16px;font-weight:800;color:var(--green)">${fmt(totalInc)}</div>
        </div>
        <div style="flex:1;background:var(--bg2);border-radius:12px;padding:10px">
          <div style="font-size:10px;color:var(--muted);font-weight:700">Combined Expenses</div>
          <div style="font-size:16px;font-weight:800;color:var(--red)">${fmt(totalExp)}</div>
        </div>
      </div>
    </div>
    
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px">👤 Who Spent More?</div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <div style="flex:${myExp || 1};background:var(--amber);border-radius:8px;padding:6px;text-align:center;font-size:11px;font-weight:700;color:#000">${myName}: ${fmt(myExp)}</div>
        <div style="flex:${pExp || 1};background:#7c3aed;border-radius:8px;padding:6px;text-align:center;font-size:11px;font-weight:700;color:#fff">${pName}: ${fmt(pExp)}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);text-align:center">
        ${myExp > pExp ? `${myName} spent ${fmt(myExp - pExp)} more` : myExp < pExp ? `${pName} spent ${fmt(pExp - myExp)} more` : 'Equal spending! 🤝'}
      </div>
    </div>
    
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px">🏆 Top Household Categories</div>
      ${topCats.map(([cat, amt]) => {
        const c = catInfo('expense', cat);
        const pct = totalExp > 0 ? ((amt/totalExp)*100).toFixed(0) : 0;
        return `<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)">
          <span>${c.icon} ${c.name}</span>
          <span style="font-weight:700">${fmt(amt)} <span style="color:var(--muted);font-size:10px">(${pct}%)</span></span>
        </div>`;
      }).join('')}
    </div>
    
    <div style="font-size:10.5px;color:var(--dim);text-align:center;margin-bottom:12px">Partner data imported: ${S.partnerData.exportDate ? new Date(S.partnerData.exportDate).toLocaleString('en-MY') : 'Unknown'}</div>
  `;
}

// ── CONSOLIDATED HUB REDIRECTS ──
function openSharedBillsHub(){ go('more'); }
function openWealthHub(){ go('budgets'); }
function openSubscriptionsHub(){ go('more'); }
function openMarketToolkitHub(){ openCurrencyModal(); }
function openDocTaxHub(initialTab = 'gallery'){
  if(initialTab === 'statements'){
    exportMonthlyPDF();
  } else {
    openReceiptGallery();
  }
}

// ── 🛠️ RESILIENCE & COMPATIBILITY LAYER FOR HTML HANDLERS ──
let txMoreOpen = false;
function toggleTxMoreDetails(forceOpen){
  txMoreOpen = (forceOpen !== undefined) ? forceOpen : !txMoreOpen;
  const panel = el('tx-more-panel');
  const chevron = el('tx-more-chevron');
  if(panel){
    if(txMoreOpen) panel.classList.remove('hidden');
    else panel.classList.add('hidden');
  }
  if(chevron){
    chevron.textContent = txMoreOpen ? '▴' : '▾';
  }
}
window.toggleTxMoreDetails = toggleTxMoreDetails;

// Aliases for HTML buttons
window.delQuickPreset = typeof deleteQuickPreset === 'function' ? deleteQuickPreset : function(){};
window.savePaydayQuickSettings = typeof savePaydaySettingsFromModal === 'function' ? savePaydaySettingsFromModal : function(){};
window.recalcFxConversion = typeof calcCurrencyConversion === 'function' ? calcCurrencyConversion : function(){};
window.confirmPayLaterDebt = typeof confirmSaveMealPayLater === 'function' ? confirmSaveMealPayLater : function(){};
window.shareWhatsAppPaymentReminder = typeof shareSplitToWhatsApp === 'function' ? shareSplitToWhatsApp : function(){};
window.applyAiBudgets = typeof applyAiGeneratedBudgets === 'function' ? applyAiGeneratedBudgets : function(){};
window.openPhotoViewer = function(src){
  if(src){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:18px;cursor:pointer;animation:fadeIn .2s';
    overlay.innerHTML = `<img src="${src}" style="max-width:100%;max-height:85vh;border-radius:14px;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.8)"/><div style="color:rgba(255,255,255,.6);font-size:12px;margin-top:10px">Tap anywhere to close</div>`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  } else if(typeof openFullPhotoView === 'function'){
    openFullPhotoView();
  }
};
window.toggleTxReimbursement = typeof reimburseAdvanceTxFromDetail === 'function' ? reimburseAdvanceTxFromDetail : function(){};
window.toggleDetailTxAdvance = typeof toggleDetailTxAdvance === 'function' ? toggleDetailTxAdvance : function(){};
window.editDetailTxAdvance = typeof editDetailTxAdvance === 'function' ? editDetailTxAdvance : function(){};
window.unmarkDetailTxAdvance = typeof unmarkDetailTxAdvance === 'function' ? unmarkDetailTxAdvance : function(){};
window.splitDetailTx = typeof splitDetailTx === 'function' ? splitDetailTx : function(){};
window.splitCurrentTxModal = typeof splitCurrentTxModal === 'function' ? splitCurrentTxModal : function(){};
window.handleDetailPhotoUpload = typeof handleDetailPhotoUpload === 'function' ? handleDetailPhotoUpload : function(){};
window.removeDetailTxPhoto = typeof removeDetailTxPhoto === 'function' ? removeDetailTxPhoto : function(){};
window.editDetailTx = typeof editTxFromDetail === 'function' ? editTxFromDetail : function(){};
window.duplicateDetailTx = typeof repeatTxFromDetail === 'function' ? repeatTxFromDetail : function(){};
window.delDetailTx = typeof deleteTxFromDetail === 'function' ? deleteTxFromDetail : function(){};
window.toggleWallpaperCustomOptions = typeof toggleCustomWpDropdown === 'function' ? toggleCustomWpDropdown : function(){};
window.handleCustomWallpaperFile = function(inp){
  if(inp && inp.files && inp.files[0] && typeof handleWallpaperFileUpload === 'function'){
    handleWallpaperFileUpload({ target: inp });
  }
};
window.applyOnlineWallpaperUrl = function(){
  const inp = el('wp-online-url-inp') || el('custom-wallpaper-url');
  const raw = (inp ? inp.value : '').trim();
  if(!raw){
    if(typeof selectWallpaper === 'function') selectWallpaper('');
    toast('Wallpaper reset');
    return;
  }
  const cleanUrl = (typeof parseImageUrl === 'function') ? parseImageUrl(raw) : raw;
  if(inp) inp.value = cleanUrl;
  if(typeof selectWallpaper === 'function') selectWallpaper(cleanUrl);
  toast('🖼️ Online wallpaper applied!');
};
window.openNewCategoryModal = function(){
  if(typeof openAddCategoryForm === 'function'){
    openAddCategoryForm();
  }
};

// Petrol modal dynamic render fallback
const _origOpenPetrolModal = (typeof openPetrolModal === 'function') ? openPetrolModal : null;
if(_origOpenPetrolModal){
  window.openPetrolModal = function(){
    const content = el('petrol-rates-content');
    if(content && !content.children.length){
      const p95 = (typeof petrolPrices !== 'undefined' && petrolPrices.ron95) ? petrolPrices.ron95 : 2.05;
      const p97 = (typeof petrolPrices !== 'undefined' && petrolPrices.ron97) ? petrolPrices.ron97 : 3.19;
      const pD = (typeof petrolPrices !== 'undefined' && petrolPrices.diesel) ? petrolPrices.diesel : 2.95;
      content.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:10px;text-align:center">
            <div style="font-size:11px;color:var(--muted);font-weight:700">RON95</div>
            <div id="pt-price-ron95" style="font-size:17px;font-weight:900;color:var(--amber);margin:4px 0">RM ${p95.toFixed(2)}</div>
            <div style="font-size:9.5px;color:var(--muted)">per liter</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:10px;text-align:center">
            <div style="font-size:11px;color:var(--muted);font-weight:700">RON97</div>
            <div id="pt-price-ron97" style="font-size:17px;font-weight:900;color:var(--green);margin:4px 0">RM ${p97.toFixed(2)}</div>
            <div style="font-size:9.5px;color:var(--muted)">per liter</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:10px;text-align:center">
            <div style="font-size:11px;color:var(--muted);font-weight:700">Diesel</div>
            <div id="pt-price-diesel" style="font-size:17px;font-weight:900;color:#3b82f6;margin:4px 0">RM ${pD.toFixed(2)}</div>
            <div style="font-size:9.5px;color:var(--muted)">per liter</div>
          </div>
        </div>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:12px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:800;color:var(--text);margin-bottom:8px">🚗 Tank Refill Estimator</div>
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <button type="button" class="chip on" style="flex:1" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));this.classList.add('on');document.getElementById('pt-calc-est').textContent='RM ' + (${p95}*36).toFixed(2)">Myvi / Axia (36L)</button>
            <button type="button" class="chip" style="flex:1" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));this.classList.add('on');document.getElementById('pt-calc-est').textContent='RM ' + (${p95}*43).toFixed(2)">City / Vios (43L)</button>
            <button type="button" class="chip" style="flex:1" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));this.classList.add('on');document.getElementById('pt-calc-est').textContent='RM ' + (${p95}*50).toFixed(2)">Sedan / SUV (50L)</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:12px;padding:10px 14px">
            <span style="font-size:12px;font-weight:700">Estimated Full Tank:</span>
            <strong id="pt-calc-est" style="font-size:18px;font-weight:900;color:var(--amber)">RM ${(p95*36).toFixed(2)}</strong>
          </div>
        </div>
      `;
    }
    _origOpenPetrolModal();
  };
}

// Weekly report modal dynamic render fallback
const _origRenderWeeklyReport = (typeof renderWeeklyReport === 'function') ? renderWeeklyReport : null;
if(_origRenderWeeklyReport){
  window.renderWeeklyReport = function(){
    const content = el('weekly-report-content');
    if(content && !content.children.length){
      content.innerHTML = `
        <div style="background:linear-gradient(135deg,rgba(255,179,0,.15),rgba(245,158,11,.08));border:1.5px solid var(--amber);border-radius:18px;padding:16px;text-align:center;margin-bottom:14px">
          <div id="wr-grade-emoji" style="font-size:40px;margin-bottom:4px">🌟</div>
          <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">Weekly Financial Grade</div>
          <div id="wr-grade" style="font-size:36px;font-weight:900;color:var(--amber);margin:2px 0">A</div>
          <div id="wr-verdict" style="font-size:13px;font-weight:700;color:var(--text)">Great spending control this week!</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Total Spent</div>
            <div id="wr-total-spent" style="font-size:15px;font-weight:900;color:var(--red);margin-top:2px">RM 0.00</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Daily Average</div>
            <div id="wr-daily-avg" style="font-size:15px;font-weight:900;color:var(--text);margin-top:2px">RM 0.00</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:700">Tx Count</div>
            <div id="wr-tx-count" style="font-size:15px;font-weight:900;color:var(--amber);margin-top:2px">0</div>
          </div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:12px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:800;margin-bottom:8px">🏆 Top Spending Categories</div>
          <div id="wr-top-cats" style="display:flex;flex-direction:column;gap:6px"></div>
        </div>
      `;
    }
    _origRenderWeeklyReport();
  };
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
