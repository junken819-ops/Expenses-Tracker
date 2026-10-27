/**
 * Monthly PDF Statement Export
 * Modularized from Pocket Winnie Core
 */

// ── FEATURE 15: MONTHLY PDF STATEMENT ──────────────────
function generateMonthlyStatement(){
  const now = new Date();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const cur = (typeof S !== 'undefined' && S && S.currency) ? S.currency : 'RM';
  const monthName = now.toLocaleDateString(isZh ? 'zh-CN' : 'en-MY', { month: 'long', year: 'numeric' });
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const todayStr = today();
  
  const txs = (typeof filteredTx === 'function' ? filteredTx() : (S.transactions || []))
    .filter(t => t.date >= monthStart && t.date <= todayStr)
    .sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  
  const totalExp = txs.filter(t => t.type === 'expense').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalInc = txs.filter(t => t.type === 'income').reduce((s,t) => s + (Number(t.amount)||0), 0);
  const net = totalInc - totalExp;
  
  const catTotals = {};
  txs.filter(t => t.type === 'expense').forEach(t => {
    const c = catInfo('expense', t.category);
    catTotals[t.category] = catTotals[t.category] || { name: c.name, icon: c.icon, total: 0 };
    catTotals[t.category].total += Number(t.amount) || 0;
  });
  const catRows = Object.values(catTotals).sort((a,b) => b.total - a.total);
  
  const printWin = window.open('', '_blank');
  if(!printWin){ toast(isZh ? '⚠️ 请允许浏览器弹出窗口以生成账单' : '⚠️ Please allow popups'); return; }
  
  printWin.document.write(`<!DOCTYPE html><html><head><title>${isZh ? '月度财务报告' : 'Financial Statement'} — ${monthName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;padding:24px;color:#1a1a1a;max-width:800px;margin:0 auto}
    h1{font-size:20px;margin-bottom:4px}
    .sub{color:#666;font-size:12px;margin-bottom:20px}
    .summary{display:flex;gap:16px;margin-bottom:20px}
    .sum-box{flex:1;padding:14px;border-radius:12px;text-align:center}
    .sum-box.inc{background:#ecfdf5;border:1px solid #a7f3d0}
    .sum-box.exp{background:#fef2f2;border:1px solid #fecaca}
    .sum-box.net{background:#eff6ff;border:1px solid #bfdbfe}
    .sum-label{font-size:11px;font-weight:600;color:#666}
    .sum-val{font-size:20px;font-weight:800;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
    th{background:#f8f8f8;padding:8px 10px;text-align:left;font-weight:700;border-bottom:2px solid #e5e5e5}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0}
    .amt{text-align:right;font-weight:600}
    .exp-amt{color:#dc2626}
    .inc-amt{color:#059669}
    .cat-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:12px}
    h2{font-size:15px;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid #f59e0b}
    .footer{margin-top:24px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:12px}
    @media print{body{padding:12px}}
  </style></head><body>
  <h1>📊 ${isZh ? '月度财务收支报告' : 'Monthly Financial Statement'}</h1>
  <div class="sub">${monthName} · ${isZh ? '生成时间: ' : 'Generated '}${new Date().toLocaleString(isZh ? 'zh-CN' : 'en-MY')} · 🍯 Pocket Winnie 🍯</div>
  
  <div class="summary">
    <div class="sum-box inc"><div class="sum-label">${isZh ? '本月总收入' : 'Total Income'}</div><div class="sum-val" style="color:#059669">${cur} ${totalInc.toFixed(2)}</div></div>
    <div class="sum-box exp"><div class="sum-label">${isZh ? '本月总支出' : 'Total Expenses'}</div><div class="sum-val" style="color:#dc2626">${cur} ${totalExp.toFixed(2)}</div></div>
    <div class="sum-box net"><div class="sum-label">${isZh ? '净结余 (收支平衡)' : ('Net ' + (net>=0?'Savings':'Deficit'))}</div><div class="sum-val" style="color:${net>=0?'#059669':'#dc2626'}">${net>=0?'+':''}${cur} ${net.toFixed(2)}</div></div>
  </div>
  
  <h2>📋 ${isZh ? '分类开支占比' : 'Category Breakdown'}</h2>
  ${catRows.map(c => `<div class="cat-row"><span>${c.icon} ${c.name}</span><span class="exp-amt">${cur} ${c.total.toFixed(2)}</span></div>`).join('')}
  
  <h2>📝 ${isZh ? '交易明细列表' : 'All Transactions'}</h2>
  <table>
    <thead><tr><th>${isZh ? '日期' : 'Date'}</th><th>${isZh ? '描述' : 'Description'}</th><th>${isZh ? '分类' : 'Category'}</th><th>${isZh ? '账户' : 'Account'}</th><th class="amt">${isZh ? '金额' : 'Amount'}</th></tr></thead>
    <tbody>
      ${txs.map(t => {
        const c = catInfo(t.type, t.category);
        const acc = S.accounts ? S.accounts.find(a => a.id === t.accountId) : null;
        return `<tr>
          <td>${t.date}</td>
          <td>${t.desc || '—'}</td>
          <td>${c.icon} ${c.name}</td>
          <td>${acc ? acc.name : 'Wallet'}</td>
          <td class="amt ${t.type==='expense'?'exp-amt':'inc-amt'}">${t.type==='expense'?'-':'+'} ${cur} ${(Number(t.amount)||0).toFixed(2)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    🍯 Pocket Winnie 🍯 · ${isZh ? '个人收支与经期关爱管家' : 'Personal Finance Tracker'} · ${txs.length} ${isZh ? '笔记录' : 'transactions'} · ${monthName}
  </div>
  </body></html>`);
  
  printWin.document.close();
  setTimeout(() => { printWin.print(); }, 500);
  toast(isZh ? '📤 账单已生成！可选择打印或另存为 PDF' : '📤 Statement generated! Use Print → Save as PDF');
}