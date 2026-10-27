/**
 * Account Balances & Calculations
 * Modularized from Pocket Winnie Core
 */

// ── ACCOUNTS & BALANCES ────────────────────────────────
// Transfers are movements between the user's own accounts. They affect the
// two account balances, but are never income or spending.
function isInternalTransfer(tx){
  return Boolean(tx && (tx.type === 'transfer' || tx.isInternalTransfer === true));
}

function isTransferIncoming(tx){
  return isInternalTransfer(tx) && tx.transferDirection === 'in';
}

function migrateLegacyInternalTransfers(txs){
  if(!Array.isArray(txs)) return false;
  const byId = new Map(txs.filter(t => t && t.id).map(t => [String(t.id), t]));
  let migrated = false;

  txs.forEach(outTx => {
    if(!outTx || outTx.type !== 'expense') return;
    const outId = String(outTx.id || '');
    if(!outId.startsWith('out')) return;

    const transferId = outId.slice(3);
    const inTx = byId.get('in' + transferId);
    const isLegacyPair = inTx &&
      inTx.type === 'income' &&
      outTx.paymentMethod === 'Transfer' &&
      inTx.paymentMethod === 'Transfer' &&
      Number(outTx.amount) === Number(inTx.amount) &&
      outTx.date === inTx.date;

    if(!isLegacyPair) return;

    Object.assign(outTx, { type: 'transfer', isInternalTransfer: true, transferDirection: 'out', transferId });
    Object.assign(inTx, { type: 'transfer', isInternalTransfer: true, transferDirection: 'in', transferId });
    migrated = true;
  });

  return migrated;
}

function accBal(id){ return 0; }

function checkAndPromptAccountOverdraft(accId, amt){
  // Accounts are strictly for record-keeping and tagging payment sources, not enforcing deductions or overdrafts
  return;
}

function totalBal(){
  const txs = S.transactions.filter(t => !isTransferIncoming(t) && t.type !== 'transfer');
  const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) || 0, 0);
  return inc - exp;
}
function filteredTx(){
  return S.transactions.filter(t => !isTransferIncoming(t) && t.type !== 'transfer');
}

function transactionPresentation(tx, isZh = false){
  return {
    category: catInfo('expense', tx.category || 'food'),
    color: CAT_COLOR[tx.category] || '#ef4444',
    amountPrefix: '-',
    amountColor: 'var(--red)',
    typeLabel: isZh ? '📉 支出' : '📉 Expense'
  };
}

function getAccIcon(acc){
  if(acc && acc.icon) return acc.icon;
  return ACC_ICON[acc ? acc.type : 'bank']||'💼';
}

function getDefaultAccountId(){
  return 'default';
}

function getActiveAccountId(){
  return 'default';
}

function resolveAccountIdFromPayment(paymentStr, fallbackAccId){
  return 'default';
}
