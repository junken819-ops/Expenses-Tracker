/**
 * Financial Health Score & Habit Alerts
 * Modularized from Pocket Winnie Core
 */

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
  const monthlyLimit = getMonthlyBudgetTotal();
  if(monthlyLimit > 0){
    if(exp <= monthlyLimit){ score += 20; tips.push({icon:'✅', txt:'Monthly spending on track!', tag:'tip'}); }
    else { score -= 15; tips.push({icon:'🚨', txt:'Monthly spending exceeds available budget!', tag:'alert'}); }
  }
  const owed=S.debts.filter(d=>d.dir==='owe'&&!d.settled).reduce((s,d)=>s+Number(d.remaining)||0,0);
  if(owed>0&&inc>0&&owed/inc>0.5){score-=10;tips.push({icon:'💸',txt:'High debt-to-income ratio',tag:'alert'});}
  if(mtx.length>=10){score+=10;tips.push({icon:'🔥',txt:'Great tracking consistency!',tag:'tip'});}
  if(inc===0) tips.push({icon:'💡',txt:'Log your salary or income for full insights',tag:'tip'});
  if(Array.isArray(S.recurring) && S.recurring.length>0) tips.push({icon:'🔁',txt:S.recurring.length+' recurring entries active',tag:'tip'});
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


  // 8. 🚨 MONTHLY SPENDING BUDGET THRESHOLDS (ALL CATEGORIES)
  const monthlyBudgetTotal = getMonthlyBudgetTotal();
  if(monthlyBudgetTotal > 0){
    const totalMonthExp = thisMonthTx.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
    const pct = totalMonthExp / monthlyBudgetTotal;
    if(pct >= 1.0){
      ins.push({
        icon: '🚨',
        title: isZh ? '月度可用预算已超支！' : 'Monthly Spending Budget Exceeded!',
        text: isZh 
          ? `本月总支出 ${fmt(totalMonthExp)} 已超出设定的可用预算 ${fmt(monthlyBudgetTotal)}（超支 ${fmt(totalMonthExp - monthlyBudgetTotal)}）！建议节约后续开支。`
          : `Total monthly spend of ${fmt(totalMonthExp)} exceeded your available pool of ${fmt(monthlyBudgetTotal)} by ${fmt(totalMonthExp - monthlyBudgetTotal)}!`,
        tag: 'alert'
      });
    } else if(pct >= 0.85){
      ins.push({
        icon: '⚠️',
        title: isZh ? `月度可用预算已使用 ${(pct*100).toFixed(0)}%` : `Monthly Budget ${(pct*100).toFixed(0)}% Used`,
        text: isZh 
          ? `本月已花费 ${fmt(totalMonthExp)}，可用资金仅剩 ${fmt(monthlyBudgetTotal - totalMonthExp)}。请留意本月剩余消费节奏。`
          : `You have spent ${fmt(totalMonthExp)} this month. Only ${fmt(monthlyBudgetTotal - totalMonthExp)} available spending remaining!`,
        tag: 'warn'
      });
    }
  }

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
