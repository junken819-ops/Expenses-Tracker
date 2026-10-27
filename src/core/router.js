/**
 * Router (go) & FAB Speed Dial
 * Modularized from Pocket Winnie Core
 */

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
  if(page==='passport') renderPassportPage();
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
