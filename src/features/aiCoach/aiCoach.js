/**
 * AI Spending Coach
 * Modularized from Pocket Winnie Core
 */

// FEATURE 5: AI SPENDING COACH (GEMINI WITH WINNIE PERSONA)
// ═══════════════════════════════════════════════════════════════════
let coachMessages = [];

function openAiCoachModal(){
  const keyWarning = el('coach-api-warning');
  if(keyWarning){
    keyWarning.classList.toggle('hidden', Boolean(S.geminiApiKey && S.geminiApiKey.trim()));
  }

  if(!coachMessages.length){
    coachMessages.push({
      role: 'pooh',
      text: `Hello there! 🍯 I'm Winnie, your friendly spending companion.\n\nSometimes numbers can buzz like bees, but don't worry! Ask me how your honey pot is doing, or tap one of the quick questions below!`
    });
  }

  renderCoachMessages();
  openModal('ai-coach-modal');
  setTimeout(() => el('coach-user-input')?.focus(), 250);
}

function renderCoachMessages(){
  const container = el('coach-messages-container');
  if(!container) return;
  container.innerHTML = '';

  coachMessages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `coach-bubble ${msg.role === 'pooh' ? 'pooh' : 'user'}`;
    bubble.innerHTML = msg.role === 'pooh'
      ? `<div style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:var(--amber);margin-bottom:4px">
           <span>🍯</span> <span>Winnie the Pooh</span>
         </div>
         <div>${esc(msg.text).replace(/\n/g, '<br/>')}</div>`
      : `<div>${esc(msg.text).replace(/\n/g, '<br/>')}</div>`;
    container.appendChild(bubble);
  });

  container.scrollTop = container.scrollHeight;
}

async function sendCoachUserMessage(){
  const inp = el('coach-user-input');
  if(!inp) return;
  const text = inp.value.trim();
  if(!text) return;

  inp.value = '';
  coachMessages.push({ role: 'user', text });
  renderCoachMessages();

  await askWinnieCoach(text);
}

function handleCoachInputKeyDown(e){
  if(e.key === 'Enter'){
    e.preventDefault();
    sendCoachUserMessage();
  }
}

async function sendCoachQuickPrompt(type){
  let promptText = '';
  if(type === 'health') promptText = 'How is my honey pot doing this month? Give me a warm health check.';
  else if(type === 'leaks') promptText = 'Where are my money leaks? What can I cut back on without losing happiness?';
  else if(type === 'afford') promptText = 'I am thinking about buying something extra. How can I decide if I can afford it?';
  else if(type === 'save300') promptText = 'Give me 3 realistic, gentle tips to save RM 300 by next month.';

  coachMessages.push({ role: 'user', text: promptText });
  renderCoachMessages();

  await askWinnieCoach(promptText);
}

async function askWinnieCoach(userQuestion){
  coachMessages.push({ role: 'pooh', text: '🍯 Thinking warmly... let me check your honey pot...' });
  renderCoachMessages();

  const today = new Date();
  const monthTxs = (S.transactions || []).filter(t => inMonth(t, today.getMonth(), today.getFullYear()));
  const totalExp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalInc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const streak = S.streaks?.noSpendCurrent || 0;
  const budget = S.monthlyBudget || 0;

  const topCats = Object.entries(
    monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {})
  ).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(([c, a]) => `${c}: RM ${a.toFixed(2)}`).join(', ');

  const prompt = `
You are Winnie the Pooh acting as a kind, gentle, reassuring, but financially prudent coach for the app "Pocket Winnie".
Speak in Winnie the Pooh's warm persona (mention honey, bees, Hundred Acre Wood gently, keep it wholesome and helpful).

User's Financial Context this month:
- Total Spent: RM ${totalExp.toFixed(2)}
- Total Income: RM ${totalInc.toFixed(2)}
- Monthly Budget Limit: RM ${budget > 0 ? budget.toFixed(2) : 'Not set'}
- Top Expense Categories: ${topCats || 'None yet'}
- Current No-Spend Streak: ${streak} days
- Currency: RM (Malaysian Ringgit)

User asks: "${userQuestion}"

Respond with:
1. Warm Winnie greeting or thought
2. Honest, gentle assessment based on their actual numbers
3. 2-3 specific, encouraging action steps
Keep response concise, charming, and easy to read (max 150 words).
  `.trim();

  let answer = '';
  if(S.geminiApiKey && typeof generateGeminiContent === 'function'){
    try {
      const resp = await generateGeminiContent(S.geminiApiKey, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      const aiText = resp?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if(aiText) answer = aiText;
    } catch(err) {
      console.warn('Gemini coach request failed:', err);
    }
  }

  if(!answer){
    if(userQuestion.includes('leaks') || userQuestion.includes('cut')){
      answer = `Oh bother! Let's take a peek at where the honey trickles out. 🍯\n\nYour top spending is in ${topCats || 'food and drinks'}. If you brew your own tea or coffee just twice a week, you'll save around RM 40 a month — that's enough for two whole jars of honey!`;
    } else if(userQuestion.includes('afford')){
      answer = `Pooh always says: If you want something shiny, ask yourself: 'Will this bring as much joy as an afternoon nap in the sun?' ☀️\n\nCheck your remaining budget first (you've spent RM ${totalExp.toFixed(2)} so far). If it leaves enough honey for your rent and bills, then enjoy it! If not, wait 48 hours to be sure.`;
    } else if(userQuestion.includes('save 300') || userQuestion.includes('save300')){
      answer = `Saving RM 300 is like filling a honey pot spoonful by spoonful! 🍯\n\n1. Aim for 2 no-spend days each week (you already have a streak going!).\n2. Swap 3 restaurant meals for home cooking.\n3. Audit your app subscriptions in the More hub. You can do it!`;
    } else {
      answer = `A wonderful day in the Hundred Acre Wood! 🍯\n\nSo far this month you've spent RM ${totalExp.toFixed(2)}${budget > 0 ? ` of your RM ${budget.toFixed(2)} budget` : ''}. Keep logging your daily meals and remember: small savings today make a cozy future tomorrow!`;
    }
  }

  coachMessages[coachMessages.length - 1] = { role: 'pooh', text: answer };
  renderCoachMessages();
}

window.openAiCoachModal = openAiCoachModal;
window.sendCoachQuickPrompt = sendCoachQuickPrompt;
window.sendCoachUserMessage = sendCoachUserMessage;
window.handleCoachInputKeyDown = handleCoachInputKeyDown;
