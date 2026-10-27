/**
 * Reminder CRUD Operations
 * Modularized from Pocket Winnie Core
 */

// ── REMINDERS ──────────────────────────────────────────
function openReminderModal(){
  selRemCat = null;
  const nameInp = el('rem-name') || el('rem-name-inp'); if(nameInp) nameInp.value = '';
  const amtInp = el('rem-amt') || el('rem-amount-inp'); if(amtInp) amtInp.value = '';
  const dateInp = el('rem-date') || el('rem-date-inp'); if(dateInp) dateInp.value = '';
  if(el('rem-cats')) buildCats('rem-cats', 'expense', id => selRemCat = id);
  openModal('reminder-modal');
}
function saveReminder(){
  const name = (el('rem-name') || el('rem-name-inp'))?.value.trim();
  const amount = parseFloat((el('rem-amt') || el('rem-amount-inp'))?.value);
  const date = (el('rem-date') || el('rem-date-inp'))?.value;
  if(!name){ toast('⚠️ Enter a name'); return; }
  if(!amount || amount <= 0){ toast('⚠️ Enter an amount'); return; }
  if(!date){ toast('⚠️ Pick a due date'); return; }
  S.reminders.push({ id: uid('item'), name, amount, date, category: selRemCat || 'bills', paid: false, createdAt: new Date().toISOString() });
  save(); renderReminders(); renderDueSoon(); closeModal('reminder-modal'); toast('🔔 Reminder set!');
}
