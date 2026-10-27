/**
 * PDF Statement Generator
 * Modularized from Pocket Winnie Core
 */

// ── 📄 PDF MONTHLY STATEMENT GENERATOR (JSPDF + AUTOTABLE) ──
function exportMonthlyPDF(){
  if(!window.jspdf || !window.jspdf.jsPDF){
    toast('⚠️ PDF generator library loading, please try again');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const isZh = (typeof S !== 'undefined' && S && S.lang === 'zh');
  const cur = (typeof S !== 'undefined' && S && S.currency) ? S.currency : 'RM';

  const mNames = isZh ? MONTH_NAMES_ZH : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  const monthName = isZh ? `${now.getFullYear()}年 ${mNames[now.getMonth()]}` : `${mNames[now.getMonth()]} ${now.getFullYear()}`;

  const txs = (S.transactions || []).filter(t => inMonth(t, now.getMonth(), now.getFullYear()));
  const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) || 0, 0);
  const net = inc - exp;

  // Honey Theme Header
  doc.setFillColor(255, 179, 0);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(78, 52, 46);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("POCKET WINNIE", 14, 16);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Financial Statement - ${monthName}`, 14, 23);
  doc.text(`User: ${S.userName || 'Finance User'}`, 140, 23);

  // Summary Metrics
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Monthly Overview", 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income: ${cur} ${inc.toFixed(2)}`, 14, 48);
  doc.text(`Total Expenses: ${cur} ${exp.toFixed(2)}`, 75, 48);
  doc.text(`Net Savings: ${cur} ${net.toFixed(2)}`, 140, 48);

  const tableRows = txs.map(t => {
    const acc = S.accounts ? S.accounts.find(a => a.id === t.accountId) : null;
    const cat = catInfo(t.type, t.category);
    return [
      t.date || '',
      t.desc || '',
      cat ? cat.name : (t.category || ''),
      acc ? acc.name : 'Wallet',
      t.paymentMethod || '',
      (t.type === 'income' ? `+ ${cur} ` : `- ${cur} `) + parseFloat(t.amount || 0).toFixed(2)
    ];
  });

  if(doc.autoTable){
    doc.autoTable({
      startY: 55,
      head: [['Date', 'Description', 'Category', 'Account', 'Payment Method', 'Amount']],
      body: tableRows.length > 0 ? tableRows : [['-', 'No transactions logged this month', '-', '-', '-', `${cur} 0.00`]],
      headStyles: { fillColor: [255, 179, 0], textColor: [78, 52, 46], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.8 },
      alternateRowStyles: { fillColor: [253, 247, 227] }
    });
  }

  const fileName = `Statement_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
  doc.save(fileName);
  toast(isZh ? '📄 PDF 月度账单已导出下载！' : '📄 PDF Statement downloaded!');
}