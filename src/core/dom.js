/**
 * Global DOM Helper & Resilient ID Resolver
 * Modularized from Pocket Winnie Core
 */

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
    'wallpaper-presets-grid': 'wp-preset-grid',
    'wp-dropdown-arrow': 'wp-custom-chevron',
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
