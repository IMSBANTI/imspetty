// Excel Generator Service using SheetJS (XLSX)

import * as XLSX from 'xlsx';

export const exportVouchersToExcel = (vouchers = [], cashAdvances = [], title = 'IMS Petty Cash Expenditures Report') => {
  // Handle flexible arguments (if 2nd param is string title)
  let actualAdvances = cashAdvances;
  let actualTitle = title;

  if (typeof cashAdvances === 'string') {
    actualTitle = cashAdvances;
    actualAdvances = [];
  }

  if (!Array.isArray(actualAdvances)) {
    actualAdvances = [];
  }

  const vList = Array.isArray(vouchers) ? vouchers : [];

  if (vList.length === 0 && actualAdvances.length === 0) {
    alert('No voucher or cash advance data available to export.');
    return;
  }

  // Create new Workbook
  const wb = XLSX.utils.book_new();

  // 1. Prepare Summary Topsheet Data
  const projectTotals = {};
  const categoryTotals = {};
  let grandTotalSpent = 0;

  vList.forEach((v) => {
    const proj = v.project || 'IMS Head Office';
    const cat = v.category || 'Office Others';
    const amt = parseFloat(v.amount) || 0;

    projectTotals[proj] = (projectTotals[proj] || 0) + amt;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    grandTotalSpent += amt;
  });

  const totalReceived = actualAdvances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const remainingBalance = totalReceived - grandTotalSpent;

  // Topsheet Rows
  const topsheetRows = [
    ['IMS GROUP - PETTY CASH & ACCOUNTS STATEMENT'],
    [`Report Generated: ${new Date().toLocaleDateString()}`],
    [''],
    ['PETTY CASH FUND SUMMARY'],
    ['Total Cash Advance Received from Accounts (TK)', totalReceived],
    ['Total Petty Cash Spent via Vouchers (TK)', grandTotalSpent],
    ['Current Petty Cash Balance in Hand (TK)', remainingBalance],
    [''],
    ['PROJECT EXPENDITURE SUMMARY'],
    ['SL No', 'Project Name', 'Total Amount (TK)']
  ];

  let pSl = 1;
  Object.keys(projectTotals).forEach((proj) => {
    topsheetRows.push([pSl++, proj, projectTotals[proj]]);
  });
  topsheetRows.push(['', 'TOTAL PROJECT EXPENDITURE', grandTotalSpent]);
  topsheetRows.push(['']);
  topsheetRows.push(['CATEGORY EXPENDITURE SUMMARY']);
  topsheetRows.push(['SL No', 'Category Name', 'Total Amount (TK)']);

  let cSl = 1;
  Object.keys(categoryTotals).forEach((cat) => {
    topsheetRows.push([cSl++, cat, categoryTotals[cat]]);
  });
  topsheetRows.push(['', 'TOTAL CATEGORY EXPENDITURE', grandTotalSpent]);

  const topsheetWs = XLSX.utils.aoa_to_sheet(topsheetRows);
  XLSX.utils.book_append_sheet(wb, topsheetWs, 'Topsheet Summary');

  // 2. All Vouchers Sheet
  if (vList.length > 0) {
    const voucherRows = [
      ['Voucher No', 'Date', 'Category', 'Project', 'Requested By', 'Description / Particulars', 'Transport Mode', 'Approved By', 'Amount (TK)']
    ];

    vList.forEach((v) => {
      voucherRows.push([
        v.id,
        v.date,
        v.category,
        v.project,
        v.requestedBy,
        v.description,
        v.transportMode || '-',
        v.approvedBy || 'Management',
        parseFloat(v.amount) || 0
      ]);
    });

    const voucherWs = XLSX.utils.aoa_to_sheet(voucherRows);
    XLSX.utils.book_append_sheet(wb, voucherWs, 'All Vouchers');
  }

  // 3. Cash Advances Received Sheet
  if (actualAdvances.length > 0) {
    const advanceRows = [
      ['Advance Ref #', 'Date Received', 'Received From', 'Payment Method', 'Description / Remarks', 'Authorized By', 'Amount Received (TK)']
    ];

    actualAdvances.forEach((a) => {
      advanceRows.push([
        a.id,
        a.date,
        a.receivedFrom || 'Accounts',
        a.paymentMethod || 'Cash',
        a.description || 'Cash advance',
        a.approvedBy || 'Management',
        parseFloat(a.amount) || 0
      ]);
    });

    const advanceWs = XLSX.utils.aoa_to_sheet(advanceRows);
    XLSX.utils.book_append_sheet(wb, advanceWs, 'Cash Advances');
  }

  // Download formatted Excel workbook
  const safeFilename = (actualTitle.endsWith('.xlsx') ? actualTitle : `${actualTitle}.xlsx`).replace(/[^a-zA-Z0-9_.-]/g, '_');
  XLSX.writeFile(wb, safeFilename);
};
