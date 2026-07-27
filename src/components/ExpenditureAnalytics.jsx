import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

export default function ExpenditureAnalytics({ vouchers, categories, projects }) {
  // Extract unique years from vouchers and include current/previous years
  const currentYearStr = new Date().getFullYear().toString();
  const extractedYears = vouchers
    .map(v => v.date ? v.date.substring(0, 4) : null)
    .filter(Boolean);

  const allYearsSet = new Set([...extractedYears, '2025', '2026', currentYearStr]);
  const years = Array.from(allYearsSet).sort().reverse();

  // Default to year with most data or most recent available year
  const [selectedYear, setSelectedYear] = useState(() => {
    return extractedYears.length > 0 ? extractedYears[0] : '2025';
  });

  // Ensure selectedYear is valid if vouchers update
  useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [vouchers]);

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate Category vs Month Matrix
  const categoryMatrix = {};
  categories.forEach(cat => {
    categoryMatrix[cat] = {};
    months.forEach(m => categoryMatrix[cat][m] = 0);
  });

  // Calculate Project vs Month Matrix
  const projectMatrix = {};
  projects.forEach(proj => {
    projectMatrix[proj] = {};
    months.forEach(m => projectMatrix[proj][m] = 0);
  });

  const monthTotals = {};
  months.forEach(m => monthTotals[m] = 0);
  let yearGrandTotal = 0;

  vouchers.forEach(v => {
    if (v.date && v.date.startsWith(selectedYear)) {
      const m = v.date.substring(5, 7);
      const amt = parseFloat(v.amount) || 0;
      const cat = v.category || 'Office Others';
      const proj = v.project || 'IMS Head Office';

      if (categoryMatrix[cat] && categoryMatrix[cat][m] !== undefined) {
        categoryMatrix[cat][m] += amt;
      }
      if (projectMatrix[proj] && projectMatrix[proj][m] !== undefined) {
        projectMatrix[proj][m] += amt;
      }
      if (monthTotals[m] !== undefined) {
        monthTotals[m] += amt;
      }
      yearGrandTotal += amt;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Year Selector Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            Monthwise & Yearly Expenditure Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View matrix breakdown of spending by category and project month-by-month.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Year:</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-control font-mono font-bold text-red-600 dark:text-red-400 text-base py-1.5 w-36"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Year Grand Total KPI */}
      <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Year {selectedYear} Grand Total Expenditure</p>
          <h3 className="text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100 mt-1">
            ৳{yearGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium">Calculated across all 12 months for {selectedYear}</p>
        </div>
      </div>

      {/* 1. Category vs Month Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-500" />
          Category-wise Monthly Matrix ({selectedYear})
        </h3>
        <div className="table-container">
          <table className="custom-table text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <th className="whitespace-nowrap">Category</th>
                {monthNames.map(m => <th key={m} className="text-right whitespace-nowrap">{m}</th>)}
                <th className="text-right bg-slate-200 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Total (TK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {categories.map(cat => {
                let rowSum = 0;
                return (
                  <tr key={cat} className="hover:bg-slate-500/5 transition-colors">
                    <td className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{cat}</td>
                    {months.map(m => {
                      const val = categoryMatrix[cat][m] || 0;
                      rowSum += val;
                      return (
                        <td key={m} className={`text-right font-mono ${val > 0 ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                          {val > 0 ? `৳${val.toLocaleString()}` : '-'}
                        </td>
                      );
                    })}
                    <td className="text-right font-mono font-bold text-red-600 dark:text-red-400 bg-slate-100/70 dark:bg-slate-800/70 whitespace-nowrap">
                      ৳{rowSum.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white font-bold font-mono border-t-2 border-slate-700">
                <td className="text-amber-400 font-extrabold uppercase whitespace-nowrap px-3 py-3">MONTHLY TOTAL</td>
                {months.map(m => (
                  <td key={m} className="text-right text-emerald-400 font-bold px-3 py-3 whitespace-nowrap">
                    ৳{(monthTotals[m] || 0).toLocaleString()}
                  </td>
                ))}
                <td className="text-right text-red-400 font-extrabold text-sm px-3 py-3 whitespace-nowrap bg-slate-950 dark:bg-black">
                  ৳{yearGrandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. Project vs Month Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Project-wise Monthly Matrix ({selectedYear})
        </h3>
        <div className="table-container">
          <table className="custom-table text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <th className="whitespace-nowrap">Project Name</th>
                {monthNames.map(m => <th key={m} className="text-right whitespace-nowrap">{m}</th>)}
                <th className="text-right bg-slate-200 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Total (TK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {projects.map(proj => {
                let rowSum = 0;
                return (
                  <tr key={proj} className="hover:bg-slate-500/5 transition-colors">
                    <td className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{proj}</td>
                    {months.map(m => {
                      const val = projectMatrix[proj][m] || 0;
                      rowSum += val;
                      return (
                        <td key={m} className={`text-right font-mono ${val > 0 ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                          {val > 0 ? `৳${val.toLocaleString()}` : '-'}
                        </td>
                      );
                    })}
                    <td className="text-right font-mono font-bold text-red-600 dark:text-red-400 bg-slate-100/70 dark:bg-slate-800/70 whitespace-nowrap">
                      ৳{rowSum.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 dark:bg-slate-950 text-white font-bold font-mono border-t-2 border-slate-700">
                <td className="text-amber-400 font-extrabold uppercase whitespace-nowrap px-3 py-3">MONTHLY TOTAL</td>
                {months.map(m => (
                  <td key={m} className="text-right text-emerald-400 font-bold px-3 py-3 whitespace-nowrap">
                    ৳{(monthTotals[m] || 0).toLocaleString()}
                  </td>
                ))}
                <td className="text-right text-red-400 font-extrabold text-sm px-3 py-3 whitespace-nowrap bg-slate-950 dark:bg-black">
                  ৳{yearGrandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
