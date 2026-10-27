/**
 * Pocket Winnie Wrapped / Year-in-Review
 * Modularized from Pocket Winnie Core
 */

// FEATURE 2: YEAR-IN-REVIEW / POCKET WINNIE WRAPPED
// ═══════════════════════════════════════════════════════════════════
let wrappedActiveSlide = 0;
const WRAPPED_TOTAL_SLIDES = 5;

function buildYearlyWrappedData(year = 2026){
  const yStr = String(year);
  const yearTxs = (S.transactions || []).filter(t => t.date && t.date.startsWith(yStr));
  const expTxs = yearTxs.filter(t => t.type === 'expense');
  const incTxs = yearTxs.filter(t => t.type === 'income');

  const totalExp = expTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalInc = incTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const savingsRate = totalInc > 0 ? Math.max(0, Math.round(((totalInc - totalExp) / totalInc) * 100)) : 0;
  
  const today = new Date();
  const dayOfYear = (year === today.getFullYear()) 
    ? Math.max(1, Math.floor((today - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)))
    : 365;
  const dailyAvg = totalExp / dayOfYear;

  const catMap = {};
  expTxs.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, amt]) => {
      const cat = getCatInfo(catId);
      const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
      return { id: catId, name: cat.name, icon: cat.icon, amount: amt, pct };
    });

  let biggest = null;
  expTxs.forEach(t => {
    const amt = Number(t.amount) || 0;
    if(!biggest || amt > biggest.amount){
      biggest = { amount: amt, desc: t.desc, date: t.date };
    }
  });

  const foodSpend = expTxs
    .filter(t => ['food', 'drinks', 'groceries'].includes(t.category))
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  
  const restRecords = S.restaurantRecords || [];
  const visitedRests = restRecords.filter(r => r.status === 'visited');
  const countryFlags = [...new Set(visitedRests.map(r => r.flag || '🇲🇾'))].join(' ');

  const merchantCount = {};
  expTxs.forEach(t => {
    if(t.desc){
      const name = t.desc.trim();
      merchantCount[name] = (merchantCount[name] || 0) + 1;
    }
  });
  const topMerchant = Object.entries(merchantCount).sort((a,b)=>b[1]-a[1])[0] || ['Various Stores', 0];

  const dailyExp = {};
  expTxs.forEach(t => { dailyExp[t.date] = (dailyExp[t.date] || 0) + (Number(t.amount) || 0); });
  let zeroSpendDays = 0;
  for(let i = 0; i < dayOfYear; i++){
    const d = new Date(year, 0, 1 + i);
    const dStr = d.toISOString().slice(0, 10);
    if(!dailyExp[dStr]) zeroSpendDays++;
  }

  let personaTitle = '🍯 Sovereign of the Honey Vault';
  let personaIcon = '🍯';
  let personaDesc = 'You take immense care in gathering and protecting your honey. Your savings rate is admirable and your honey pot is secure!';

  if(foodSpend > totalExp * 0.45){
    personaTitle = '🍜 Master Gourmet Explorer';
    personaIcon = '🍜';
    personaDesc = 'Your heart and wallet belong to delicious food adventures! You believe life is best savored one exquisite bite at a time.';
  } else if(zeroSpendDays > dayOfYear * 0.4){
    personaTitle = '🌿 Serene Honey Monk';
    personaIcon = '🧘‍♂️';
    personaDesc = 'Master of self-discipline! With so many zero-spend days, you have mastered the art of mindful living without unnecessary honey leaks.';
  } else if(topCats[0] && ['shopping', 'beauty'].includes(topCats[0].id)){
    personaTitle = '✨ Hundred Acre Trendsetter';
    personaIcon = '🛍️';
    personaDesc = 'You know what you like and you treat yourself well. You keep the forest stylish and vibrant!';
  }

  return {
    year,
    totalExp,
    totalInc,
    totalTxs: yearTxs.length,
    savingsRate,
    dailyAvg,
    topCats,
    biggest,
    foodSpend,
    restaurantCount: visitedRests.length,
    countryFlags: countryFlags || '🇲🇾',
    bestStreak: S.streaks?.noSpendBest || 0,
    zeroSpendDays,
    topMerchant: topMerchant[0],
    topMerchantVisits: topMerchant[1],
    personaTitle,
    personaIcon,
    personaDesc
  };
}

function openWrappedModal(year = 2026){
  const data = buildYearlyWrappedData(year);
  
  if(el('wrap-year-title')) el('wrap-year-title').textContent = `Your ${year} Financial Journey`;
  if(el('wrap-tot-exp')) el('wrap-tot-exp').textContent = fmt(data.totalExp);
  if(el('wrap-tot-txs')) el('wrap-tot-txs').textContent = `Across ${data.totalTxs} transactions logged`;
  if(el('wrap-save-rate')) el('wrap-save-rate').textContent = `${data.savingsRate}%`;
  if(el('wrap-daily-avg')) el('wrap-daily-avg').textContent = `${fmt(data.dailyAvg)}/day`;

  const catList = el('wrap-top-cats-list');
  if(catList){
    catList.innerHTML = data.topCats.map(c => `
      <div style="background:var(--bg);border-radius:12px;padding:8px 12px;border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700">
          <span>${c.icon} ${esc(c.name)}</span>
          <span style="color:var(--amber)">${fmt(c.amount)} (${c.pct}%)</span>
        </div>
        <div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:5px;overflow:hidden">
          <div style="width:${c.pct}%;height:100%;background:var(--amber);border-radius:2px"></div>
        </div>
      </div>
    `).join('') || '<div style="font-size:11px;color:var(--muted)">No categories tracked yet</div>';
  }
  if(el('wrap-biggest-purchase')){
    el('wrap-biggest-purchase').textContent = data.biggest ? `${esc(data.biggest.desc)} · ${fmt(data.biggest.amount)} (${data.biggest.date})` : 'No purchases yet';
  }

  if(el('wrap-food-rest-count')) el('wrap-food-rest-count').textContent = data.restaurantCount;
  if(el('wrap-food-countries')) el('wrap-food-countries').textContent = data.countryFlags;
  if(el('wrap-food-total-spent')) el('wrap-food-total-spent').textContent = fmt(data.foodSpend);

  if(el('wrap-best-streak')) el('wrap-best-streak').textContent = `${data.bestStreak} days 🔥`;
  if(el('wrap-zero-spend-days')) el('wrap-zero-spend-days').textContent = `${data.zeroSpendDays} days`;
  if(el('wrap-top-merchant')) el('wrap-top-merchant').textContent = `${esc(data.topMerchant)} (${data.topMerchantVisits} visits)`;

  if(el('wrap-persona-icon')) el('wrap-persona-icon').textContent = data.personaIcon;
  if(el('wrap-persona-title')) el('wrap-persona-title').textContent = data.personaTitle;
  if(el('wrap-persona-desc')) el('wrap-persona-desc').textContent = data.personaDesc;

  wrappedActiveSlide = 0;
  updateWrappedSlideUI();
  openModal('wrapped-modal');
}

function stepWrappedSlide(delta){
  wrappedActiveSlide += delta;
  if(wrappedActiveSlide < 0) wrappedActiveSlide = 0;
  if(wrappedActiveSlide >= WRAPPED_TOTAL_SLIDES) wrappedActiveSlide = WRAPPED_TOTAL_SLIDES - 1;
  updateWrappedSlideUI();
}

function updateWrappedSlideUI(){
  for(let i = 0; i < WRAPPED_TOTAL_SLIDES; i++){
    const slide = el(`wrapped-slide-${i}`);
    if(slide) slide.classList.toggle('active', i === wrappedActiveSlide);

    const bar = el(`wsb-${i}`);
    if(bar){
      if(i < wrappedActiveSlide) bar.style.width = '100%';
      else if(i === wrappedActiveSlide) bar.style.width = '100%';
      else bar.style.width = '0%';
    }
  }

  if(el('wrap-slide-indicator')) el('wrap-slide-indicator').textContent = `${wrappedActiveSlide + 1} / ${WRAPPED_TOTAL_SLIDES}`;
  if(el('wrap-prev-btn')) el('wrap-prev-btn').style.visibility = wrappedActiveSlide === 0 ? 'hidden' : 'visible';
  if(el('wrap-next-btn')) el('wrap-next-btn').textContent = wrappedActiveSlide === WRAPPED_TOTAL_SLIDES - 1 ? 'Finish 🍯' : 'Next ›';
}

function copyWrappedSummaryText(){
  const data = buildYearlyWrappedData(2026);
  const text = `🍯 My Pocket Winnie 2026 Wrapped 🍯\n` +
    `💰 Total Spent: ${fmt(data.totalExp)}\n` +
    `📈 Savings Rate: ${data.savingsRate}%\n` +
    `🍜 Food & Dining: ${fmt(data.foodSpend)} across ${data.restaurantCount} restaurants (${data.countryFlags})\n` +
    `🏆 Best Streak: ${data.bestStreak} No-Spend Days\n` +
    `👑 Persona: ${data.personaIcon} ${data.personaTitle}\n` +
    `Tracked with Pocket Winnie — Hundred Acre Wood Expense Companion 🐝`;
  
  navigator.clipboard.writeText(text).then(() => {
    toast('📋 Summary copied to clipboard!');
  }).catch(() => {
    toast('Summary text ready');
  });
}

function shareWrappedWhatsApp(){
  const data = buildYearlyWrappedData(2026);
  const text = encodeURIComponent(`🍯 My Pocket Winnie 2026 Wrapped 🍯\n` +
    `💰 Total Spent: ${fmt(data.totalExp)}\n` +
    `📈 Savings Rate: ${data.savingsRate}%\n` +
    `👑 My Persona: ${data.personaIcon} ${data.personaTitle}\n` +
    `Tracked with Pocket Winnie!`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

window.openWrappedModal = openWrappedModal;
window.stepWrappedSlide = stepWrappedSlide;
window.copyWrappedSummaryText = copyWrappedSummaryText;
window.shareWrappedWhatsApp = shareWrappedWhatsApp;

// ═══════════════════════════════════════════════════════════════════