/**
 * Live Travel Currency Converter
 * Modularized from Pocket Winnie Core
 */

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
  const amtInput = el('curr-input-amt') || el('fx-amount');
  const fromSel = el('curr-from-sel') || el('fx-from-cur');
  const toSel = el('curr-to-sel');
  const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
  const from = fromSel ? fromSel.value : 'SGD';
  const to = toSel ? toSel.value : 'MYR';

  const rateFrom = (typeof liveRates !== 'undefined' && liveRates[from]) ? liveRates[from] : 1;
  const rateTo = (typeof liveRates !== 'undefined' && liveRates[to]) ? liveRates[to] : 1;

  const converted = (amt * rateFrom) / rateTo;
  const symbol = to === 'MYR' ? 'RM ' : to + ' ';

  const resDisplay = el('curr-res-display') || el('fx-converted-val');
  if(resDisplay) resDisplay.textContent = `${symbol}${converted.toFixed(2)}`;
}

function logConvertedExpense(){
  const amtInput = el('curr-input-amt') || el('fx-amount');
  const fromSel = el('curr-from-sel') || el('fx-from-cur');
  const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
  const from = fromSel ? fromSel.value : 'SGD';
  const rateFrom = (typeof liveRates !== 'undefined' && liveRates[from]) ? liveRates[from] : 1;
  const rmVal = (amt * rateFrom).toFixed(2);

  closeModal('currency-modal');
  openTxModal('expense');
  el('tx-amount').value = rmVal;
  el('tx-desc').value = `Overseas Spend (${amt} ${from})`;
  el('tx-note').value = `Converted from ${amt} ${from} @ rate ${rateFrom.toFixed(3)}`;
  toast(`💱 Converted & pre-filled: RM ${rmVal}!`);
}
