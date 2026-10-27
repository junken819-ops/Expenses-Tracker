/**
 * Smart AI Auto-Detection Engine
 * Modularized from Pocket Winnie Core
 */

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
  else if(/laurier|kotex|sofy|whisper|libresse|carefree|stayfree|tampax|playtex|sanitary\s*pad|tampon|menstrual|panty\s*liner|pantyliner|midol|panadol\s*menstrual|ponstan|ibuprofen|cramp\s*patch|warm\s*patch|heat\s*patch|heating\s*pad|heatpad|period\s*care|period\s*pant|feminine\s*wash|intimate\s*wash|lactacyd|betadine\s*feminine|卫生棉|卫生巾|护垫|夜用|日用|安睡裤|裤型卫生巾|棉条|卫生棉条|月经杯|月经碟|月事|大姨妈|姨妈巾|姨妈|例假|暖宫贴|暖宫|暖宝宝|暖贴|热敷贴|暖腹贴|痛经贴|止痛贴|止痛药|布洛芬|红糖姜茶|女性护理|私密洗液|高洁丝|乐而雅|苏菲|护舒宝|轻曲线/i.test(s) || (/\b(pad|pads|period)\b/i.test(s) && !/ipad|touchpad|mousepad|keypad|launchpad|thinkpad|notepad/i.test(s))){
    detectedCat = 'period_care';
    if(/pad|pantyliner|liner|sanitary|maxi|night|wing|day|安睡裤|卫生棉|卫生巾|护垫|夜用|日用|姨妈巾|姨妈|超熟睡|丝薄|超丝薄|棉柔|极薄/i.test(s) || /libresse|kotex|sofy|whisper|laurier|carefree|stayfree|高洁丝|乐而雅|苏菲|护舒宝|轻曲线/i.test(s)) detectedSubCat = 'period_sanitary_pads';
    else if(/tampon|menstrual\s*cup|棉条|卫生棉条|月经杯|月经碟/i.test(s)) detectedSubCat = 'period_tampons_cup';
    else if(/midol|panadol|ponstan|ibuprofen|cramp|warm\s*patch|heat\s*patch|heating|heatpad|暖宫|暖宝宝|暖贴|热敷|痛经|止痛|布洛芬|红糖姜茶/i.test(s)) detectedSubCat = 'period_pain_relief';
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
  if(isUniversalScanning) return;

  let file = null;
  if(inputOrFile instanceof File) file = inputOrFile;
  else if(inputOrFile?.files?.[0]) file = inputOrFile.files[0];
  if(!file) return;

  isUniversalScanning = true;
  if(uniScanAbortController){
    try { uniScanAbortController.abort(); } catch(e){}
  }
  uniScanAbortController = new AbortController();
  const currentScanSignal = uniScanAbortController.signal;

  const placeholder = el('uni-upload-placeholder');
  const imgPrev = el('uni-img-preview');
  const badgeWrap = el('uni-detected-badge-wrap');
  const actionBtns = el('uni-action-btns');
  const hBack = el('uni-header-back-btn');

  if(placeholder) placeholder.classList.add('hidden');
  if(hBack) hBack.classList.remove('hidden');
  startAiScanAnimation('universal');

  try {
    const rawDataUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.onerror = err => rej(err);
      reader.readAsDataURL(file);
    });

    if(currentScanSignal.aborted) return;

    const compressed = await compressReceiptForStorage(rawDataUrl);
    uniImageDataUrl = compressed;
    photoData = null;

    if(imgPrev){
      imgPrev.src = compressed;
      imgPrev.classList.remove('hidden');
    }

    if(currentScanSignal.aborted) return;

    const result = await analyzeUnifiedUploadWithRetry(compressed, currentScanSignal, 2);
    if(currentScanSignal.aborted) return;

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
      const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
      toast(isZh ? '🤖 AI 识别小票成功！' : '🤖 AI analyzed receipt successfully!');

      // Enrich items with calorie estimates asynchronously without blocking initial render
      if(uniParsedData.items && uniParsedData.items.length > 0){
        enrichItemsWithCalories(uniParsedData.items).then(() => {
          if(!currentScanSignal.aborted && uniParsedData === result){
            renderUniPreviewItemsList();
          }
        }).catch(() => {});
      }
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
      const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
      if(S.geminiApiKey && S.geminiApiKey.length > 7){
        toast(isZh ? '⚠️ 未能自动提取数据，您可以手动填写' : '⚠️ Could not extract data. You can enter details manually.');
      }
    }
  } catch(err){
    if(currentScanSignal.aborted) return;
    console.warn('Universal upload notice:', err);
    stopAiScanAnimation();
    const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
    toast(isZh ? '⚠️ 扫描遇到问题，请手动输入明细' : '⚠️ Could not complete AI scan. You can enter details manually.');
    renderUniversalPreview();
  } finally {
    isUniversalScanning = false;
    stopAiScanAnimation();
  }
}

async function analyzeUnifiedUploadWithGemini(base64DataUrl, signal = null){
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

  // ── OCR-focused prompt ────────────────────────────────────────────────────
  // Kept intentionally small: fewer fields = fewer hallucinations and schema
  // drift. Category / subCategory / tags are resolved locally by
  // smartAutoDetectCategoryAndPayment() after parsing, then verified by a
  // lightweight text-only Gemini call in verifyReceiptCategoryWithGemini().
  const prompt = `You are an expert OCR engine for Malaysian receipts, dining bills, invoices, and e-wallet screenshots.
Extract the following fields from the image and return ONLY a raw JSON object — no markdown, no backticks, no extra text.

Required schema:
{
  "detectedType": "receipt",
  "merchant": "Exact store or restaurant name as printed",
  "currency": "MYR",
  "originalAmount": 0.00,
  "amount": 0.00,
  "subtotal": 0.00,
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "paymentMethod": "Cash",
  "location": "",
  "items": [
    { "name": "Item or dish name", "price": 0.00, "qty": 1, "calories": 0, "protein": 0 }
  ],
  "serviceChargePct": 0,
  "serviceChargeAmount": 0.00,
  "sstPct": 0,
  "sstAmount": 0.00,
  "roundingAmount": 0.00,
  "taxReliefCat": "",
  "taxReliefAmount": 0.00,
  "taxReliefReason": ""
}

RULES:
1. "merchant": The brand/store name printed on the receipt (e.g. "Lotus's", "McDonald's", "Watsons", "7-Eleven").
2. "currency": Detect from symbols — RM/MYR, S$/SGD, $/USD, ¥/JPY, €/EUR, £/GBP, ฿/THB, NT$/TWD, ₩/KRW, Rp/IDR, ₫/VND, ₱/PHP. Default "MYR".
3. "amount": The final grand total as a number. "originalAmount" = same value in native currency.
4. "subtotal": Pre-tax subtotal. If not printed, leave 0.
5. "date": Printed transaction date → YYYY-MM-DD. Convert "23/08/2026" → "2026-08-23".
6. "time": Printed transaction time → 24-hour HH:MM. E.g. "1:45 PM" → "13:45".
7. "paymentMethod": Payment tender printed (Cash, Credit Card, Visa, Mastercard, Touch 'n Go eWallet, GrabPay, ShopeePay, Maybank MAE, Debit Card, Online Banking). Default "Cash" if absent.
8. "items": Every line item / dish / product with name, unit price, qty. Food/drink items: estimate calories (kcal integer) and protein (g integer); non-food set 0.
9. "sstAmount" / "sstPct": Malaysian SST/Service Tax amount and rate (6% or 8%).
10. "serviceChargeAmount" / "serviceChargePct": Restaurant service charge (e.g. 10%).
11. "roundingAmount": Sen rounding (e.g. -0.02 or 0.00).
12. "taxReliefCat": Malaysian LHDN tax relief category if applicable — "lifestyle" (books, sports, devices), "medical" (pharmacy, clinic), "childcare". Leave empty if not applicable.
13. Output ONLY the raw JSON. Do NOT wrap in markdown fences or add any explanation.`;

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

  const generation = await generateGeminiContent(apiKey, payload, 25000, signal);
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

// -- Auto-retry wrapper: up to 2 attempts with exponential back-off ----------
// Silently retries on transient network errors or empty Gemini responses
// without requiring the user to manually tap Scan again.
async function analyzeUnifiedUploadWithRetry(base64DataUrl, signal, maxAttempts){
  maxAttempts = maxAttempts || 2;
  for(var attempt = 1; attempt <= maxAttempts; attempt++){
    if(signal && signal.aborted) return null;
    var result = await analyzeUnifiedUploadWithGemini(base64DataUrl, signal);
    if(result && (result.merchant || result.amount > 0 || (result.items && result.items.length > 0))){
      return result;
    }
    if(signal && signal.aborted) return null;
    if(attempt < maxAttempts){
      var delayMs = 1500 * attempt;
      var isZh2 = (typeof S !== 'undefined' && S && S.lang === 'zh');
      toast(isZh2 ? ('⚠️ 正在重试扫描… (第 ' + (attempt + 1) + ' 次)') : ('⚠️ Retrying scan… (attempt ' + (attempt + 1) + ' of ' + maxAttempts + ')'));
      await new Promise(function(r){ setTimeout(r, delayMs); });
    }
  }
  return null;
}
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
        <div style="font-size:28px;margin-bottom:6px">🔍</div>
        <div style="font-weight:700;color:var(--text);margin-bottom:2px">Upload or scan a receipt above</div>
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

  // Match Payment Method from AI detection
  const pmOriginal = String(d.paymentMethod || d.payMethod || d.payment || '').trim();
  const pmRaw = pmOriginal.toLowerCase();
  const merchLower = rawMerchant.toLowerCase();

  let matchedMethodName = pmOriginal || 'Cash';

  if(/tng|touch\s*'?n\s*go|rfid/i.test(pmRaw)){
    matchedMethodName = "Touch 'n Go eWallet";
  } else if(/shopee/i.test(pmRaw)){
    matchedMethodName = 'ShopeePay';
  } else if(/mae|maybank/i.test(pmRaw) || /mae/i.test(merchLower)){
    matchedMethodName = 'Maybank (MAE / QR)';
  } else if(/cimb/i.test(pmRaw)){
    matchedMethodName = 'CIMB Bank (Octo)';
  } else if(/public/i.test(pmRaw)){
    matchedMethodName = 'Public Bank (PBe)';
  } else if(/credit|visa|master|amex/i.test(pmRaw)){
    matchedMethodName = 'Credit Card';
  } else if(/debit|mydebit/i.test(pmRaw)){
    matchedMethodName = 'Debit Card';
  } else if(/fpx|online banking|duitnow/i.test(pmRaw)){
    matchedMethodName = 'Online Banking (FPX / DuitNow)';
  } else if(/cash|tunai/i.test(pmRaw)){
    matchedMethodName = 'Cash';
  } else if(pmOriginal){
    matchedMethodName = pmOriginal;
  }

  // Filled payment method text for input
  const displayPaymentMethod = matchedMethodName || pmOriginal || 'Cash';
  d.paymentMethod = displayPaymentMethod;
  d.accountId = 'default';

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
          <div style="display:flex;gap:4px;align-items:center">
            <input type="date" id="uni-edit-date" class="form-input" value="${rawDate}" style="padding:7px 8px;font-size:11.5px;flex:1"/>
            <button type="button" onclick="const di=el('uni-edit-date');if(di){di.value=today();toast(S.lang==='zh'?'已设为今天':'Set to today');}" style="padding:6px 7px;font-size:10.5px;font-weight:800;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:var(--green);border-radius:8px;cursor:pointer;white-space:nowrap" title="Set date to Today">📅 Today</button>
          </div>
        </div>
        <div>
          <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Category</label>
          <select id="uni-edit-category" class="form-input" style="padding:7px 8px;font-size:11.5px" onchange="handleUniCategoryChange(this.value)">
            ${cats.map(c => `<option value="${c.id}" ${c.id === matchedCatId ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      ${d.categoryVerification ? `
        <div style="display:flex;align-items:flex-start;gap:6px;margin:2px 0 10px;padding:7px 9px;border-radius:9px;background:rgba(6,182,212,.10);border:1px solid rgba(6,182,212,.26);color:var(--text);font-size:10.5px;line-height:1.35">
          <span style="flex-shrink:0">🧠</span>
          <span><strong>Category checked:</strong> ${esc(d.categoryVerification.message || 'Verified before saving')}</span>
        </div>
      ` : ''}

      <!-- Single Payment Method Input -->
      <div style="margin-bottom:10px">
        <label class="form-label" style="font-size:10.5px;margin-bottom:2px">Payment Method (付款方式)</label>
        <input type="text" id="uni-edit-payment" class="form-input" value="${esc(displayPaymentMethod)}" placeholder="e.g. Cash, Maybank, Touch 'n Go, Credit Card..." list="uni-paymethod-suggestions" style="padding:8px 10px;font-size:12px;font-weight:700" oninput="handleUniPaymentInputChange(this.value)"/>
        <datalist id="uni-paymethod-suggestions">
          <option value="Cash"></option>
          <option value="Maybank (MAE / QR)"></option>
          <option value="Touch 'n Go eWallet"></option>
          <option value="Credit Card"></option>
          <option value="Debit Card"></option>
          <option value="Online Banking (FPX / DuitNow)"></option>
        </datalist>
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
  const inp = el('uni-edit-payment');
  if(!inp || !name) return;
  inp.value = name;
  document.querySelectorAll('#uni-pay-quick-pills [data-uni-pay]').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.uniPay === name);
  });
  if(uniParsedData){
    uniParsedData.paymentMethod = name;
    uniParsedData.accountId = 'default';
  }
}

function handleUniPaymentInputChange(val){
  if(uniParsedData){
    uniParsedData.paymentMethod = val || '';
    uniParsedData.accountId = 'default';
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
      <div style="display:flex;align-items:center;width:55px" title="Estimated Calories (kcal)">
        <span style="font-size:10px;color:var(--muted);margin-right:2px">🔥</span>
        <input type="number" class="form-input" value="${it.calories !== undefined ? it.calories : ''}" placeholder="kcal" style="padding:4px 2px;font-size:11px;font-weight:700;background:transparent;border:none;color:var(--text)" oninput="updateUniPreviewItem(${idx}, 'calories', this.value)"/>
      </div>
      <div style="display:flex;align-items:center;width:55px" title="Estimated Protein (g)">
        <span style="font-size:10px;color:var(--cyan);margin-right:2px">🥩</span>
        <input type="number" class="form-input" value="${it.protein !== undefined ? it.protein : ''}" placeholder="g" style="padding:4px 2px;font-size:11px;font-weight:700;background:transparent;border:none;color:var(--cyan)" oninput="updateUniPreviewItem(${idx}, 'protein', this.value)"/>
      </div>
      <div style="display:flex;align-items:center;width:68px">
        <span style="font-size:10px;color:var(--muted);margin-right:2px">RM</span>
        <input type="number" step="0.01" class="form-input" value="${it.price !== undefined ? it.price : ''}" placeholder="0.00" style="padding:4px 2px;font-size:11px;font-weight:700;background:transparent;border:none;color:var(--text)" oninput="updateUniPreviewItem(${idx}, 'price', this.value)"/>
      </div>
      <button type="button" onclick="removeUniPreviewItem(${idx})" style="background:rgba(239,68,68,.15);border:none;color:var(--red);border-radius:6px;width:20px;height:20px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center">✕</button>
    `;
    list.appendChild(row);
  });
}

function addUniPreviewItem(){
  if(!uniParsedData) uniParsedData = {};
  if(!uniParsedData.items) uniParsedData.items = [];
  uniParsedData.items.push({ name: '', price: 0, qty: 1, calories: 0, protein: 0 });
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
  } else if(field === 'calories'){
    uniParsedData.items[idx].calories = parseInt(val) || 0;
  } else if(field === 'protein'){
    uniParsedData.items[idx].protein = parseInt(val) || 0;
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

  const selectedPay = (payInp?.value !== undefined ? payInp.value.trim() : (uniParsedData?.paymentMethod || 'Cash')) || 'Cash';
  const selectedAcc = 'default';
  const formattedNote = (noteInp?.value !== undefined ? noteInp.value : formatItemsSummary(uniParsedData)).trim();
  const photoToSave = null;

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
      photoData = null;
      // Preserve parsed items (with calories) for saveTx()
      if(uniParsedData.items && Array.isArray(uniParsedData.items) && uniParsedData.items.length > 0){
        currentOcrItems = JSON.parse(JSON.stringify(uniParsedData.items));
      }
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
        photo: null,
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

      // Removed calendar jump logic that confused users when old receipts were scanned

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
      photo: null,
      createdAt: new Date().toISOString()
    };
    S.transactions.unshift(newTx);
    S.lastUsedAccId = selectedAcc;

    // Removed calendar jump logic that confused users when old receipts were scanned

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
      photo: null,
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

  const chosenPay = (payInp?.value !== undefined ? payInp.value.trim() : (d.paymentMethod || 'Cash')) || 'Cash';
  const chosenAcc = 'default';
  const chosenNote = (noteInp?.value !== undefined ? noteInp.value : formatItemsSummary(d)).trim();
  const photoToSave = null;

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
    photo: null,
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
    const payVal = el('tx-paymethod-val')?.value?.trim();

    if(merchantVal) uniParsedData.merchant = merchantVal;
    if(!isNaN(amountVal) && amountVal > 0) uniParsedData.amount = amountVal;
    if(dateVal) uniParsedData.date = dateVal;
    if(timeVal) uniParsedData.time = timeVal;
    if(selCat) uniParsedData.category = selCat;
    if(selSubCat) uniParsedData.subCategory = selSubCat;
    if(noteVal !== undefined) uniParsedData.note = noteVal;
    if(locVal !== undefined) uniParsedData.location = locVal;
    if(payVal) uniParsedData.paymentMethod = payVal;

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
