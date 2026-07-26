// Excel Generator Service using SheetJS (XLSX)

import * as XLSX from 'xlsx';

export const exportVouchersToExcel = (vouchers, cashAdvances = [], title = 'IMS Petty Cash Expenditures Report') => {
  if ((!vouchers || vouchers.length === 0) && (!cashAdvances || cashAdvances.length === 0)) {
    alert('No voucher or cash advance data available to export.');
    return;
  }

  // Create new Workbook
  const wb = XLSX.utils.book_new();

  // 1. Prepare Summary Topsheet Data
  const projectTotals = {};
  const categoryTotals = {};
  let grandTotalSpent = 0;

  vouchers.forEach((v) => {
    const proj = v.project || 'IMS Head Office';
    const cat = v.category || 'Office Others';
    const amt = parseFloat(v.amount) || 0;

    projectTotals[proj] = (projectTotals[proj] || 0) + amt;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    grandTotalSpent += amt;
  });

  const totalReceived = cashAdvances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
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

  const wsSummary = XLSX.utils.aoa_to_sheet(topsheetRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Topsheet Summary');

  // 2. Prepare Cash Advance Receipts Sheet
  if (cashAdvances.length > 0) {
    const advanceRows = cashAdvances.map((a, idx) => ({
      'SL No': idx + 1,
      'Ref / ID': a.id,
      'Date Received': a.date,
      'Received From': a.receivedFrom,
      'Payment Method': a.paymentMethod,
      'Approved By': a.approvedBy,
      'Description / Remarks': a.description,
      'Amount Received (TK)': parseFloat(a.amount) || 0
    }));

    const wsAdvances = XLSX.utils.json_to_sheet(advanceRows);
    XLSX.utils.book_append_sheet(wb, wsAdvances, 'Cash Advances Received');
  }

  // 3. Prepare Detailed Voucher List Sheet
  const voucherRows = vouchers.map((v, idx) => ({
    'SL No': idx + 1,
    'Voucher No': v.id,
    'Date': v.date,
    'Project': v.project,
    'Category': v.category,
    'Requested By': v.requestedBy,
    'Description / Particulars': v.description,
    'Transport Mode': v.transportMode || '-',
    'Approved By': v.approvedBy || 'Management',
    'Amount (TK)': parseFloat(v.amount) || 0
  }));

  const wsVouchers = XLSX.utils.json_to_sheet(voucherRows);
  XLSX.utils.book_append_sheet(wb, wsVouchers, 'All Vouchers Data');

  // 4. Monthwise Expenditure Breakdown Sheet
  const monthMap = {};
  vouchers.forEach((v) => {
    const month = v.date ? v.date.substring(0, 7) : 'Unknown';
    monthMap[month] = (monthMap[month] || 0) + (parseFloat(v.amount) || 0);
  });

  const monthRows = [
    ['MONTHWISE EXPENDITURE REPORT'],
    [''],
    ['Month (YYYY-MM)', 'Total Expenditure (TK)']
  ];

  Object.keys(monthMap).sort().forEach((m) => {
    monthRows.push([m, monthMap[m]]);
  });
  monthRows.push(['GRAND TOTAL', grandTotalSpent]);

  const wsMonths = XLSX.utils.aoa_to_sheet(monthRows);
  XLSX.utils.book_append_sheet(wb, wsMonths, 'Monthly Expenditure');

  // Save File
  const filename = `IMS_Petty_Cash_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};
