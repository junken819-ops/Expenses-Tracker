/**
 * Expense & Income Categories Taxonomy
 * Modularized from Pocket Winnie Core
 */

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
