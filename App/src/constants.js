// constants.js – exported static data
export const PAYMENT_METHODS = [
  { id: 'mae_scan', name: 'Maybank (MAE / QR)', icon: '🐯', bank: 'Maybank' },
  { id: 'tng_qr', name: "Touch 'n Go eWallet", icon: '💙', bank: 'TNG' },
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

export const MY_BANKS = [
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

export const MY_EWALLETS = [
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

export const MY_CUSTOM = [
  { name: 'Cash Wallet', icon: '💵', color: '#10b981', type: 'cash' },
  { name: 'Credit Card', icon: '💳', color: '#6366f1', type: 'credit' },
  { name: 'Fixed Deposit / Savings', icon: '🏦', color: '#059669', type: 'savings' },
  { name: 'Emergency Fund', icon: '🛡️', color: '#f59e0b', type: 'savings' }
];

export const DEFAULT_EXP_CATS = [
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

export const DEFAULT_INC_CATS = [
  { id: 'salary', name: 'Monthly Salary', icon: '💼' },
  { id: 'freelance', name: 'Freelance & Gigs', icon: '💻' },
  { id: 'business', name: 'Business & Sales', icon: '🏢' },
  { id: 'investment', name: 'Investments & Dividends', icon: '📈' },
  { id: 'gift', name: 'Gifts & Allowance', icon: '🎁' },
  { id: 'cashback', name: 'Cashback & Rewards', icon: '💧' },
  { id: 'other', name: 'Other Income', icon: '🤝' }
];

export const EXP_CATS = DEFAULT_EXP_CATS;
export const INC_CATS = DEFAULT_INC_CATS;

export const MASTER_SUB_CATEGORIES = {
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
  edu_courses_tuition: { parent: 'education', name: 'Courses, Tuition & Exams', nameZh: '补习辅导与进修考试', icon: '🎓' }
};
