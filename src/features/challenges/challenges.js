/**
 * Challenges & Streaks
 * Modularized from Pocket Winnie Core
 */

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
