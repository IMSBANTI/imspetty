import React, { useState } from 'react';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

export default function ExpenditureAnalytics({ vouchers, categories, projects }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Extract unique years from vouchers
  const years = Array.from(new Set(vouchers.map(v => v.date ? v.date.substring(0, 4) : '2026'))).sort().reverse();
  if (years.length === 0) years.push(new Date().getFullYear().toString());

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
    <div className="space-y-8">
      {/* Year Selector Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Monthwise & Yearly Expenditure Calculation
          </h2>
          <p className="text-xs text-slate-400">View matrix breakdown of spending by category and project month-by-month.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Select Year:</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-control font-mono font-bold text-amber-400 text-base py-1.5 w-32"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Year Grand Total KPI */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Year {selectedYear} Grand Total Expenditure</p>
          <h3 className="text-3xl font-bold font-heading text-slate-100 mt-1">
            ৳{yearGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Calculated across all 12 months</p>
        </div>
      </div>

      {/* Category vs Month Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Category-wise Monthly Matrix ({selectedYear})
        </h3>
        <div className="table-container">
          <table className="custom-table text-xs">
            <thead>
              <tr>
                <th>Category</th>
                {monthNames.map(m => <th key={m} className="text-right">{m}</th>)}
                <th className="text-right bg-slate-800 font-bold">Total (TK)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                let rowSum = 0;
                return (
                  <tr key={cat}>
                    <td className="font-semibold text-slate-200">{cat}</td>
                    {months.map(m => {
                      const val = categoryMatrix[cat][m] || 0;
                      rowSum += val;
                      return (
                        <td key={m} className={`text-right font-mono ${val > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                          {val > 0 ? `৳${val.toLocaleString()}` : '-'}
                        </td>
                      );
                    })}
                    <td className="text-right font-mono font-bold text-amber-400 bg-slate-800/50">
                      ৳{rowSum.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800 font-bold font-mono">
                <td className="text-slate-200">MONTHLY TOTAL</td>
                {months.map(m => (
                  <td key={m} className="text-right text-blue-400">
                    ৳{(monthTotals[m] || 0).toLocaleString()}
                  </td>
                ))}
                <td className="text-right text-emerald-400 text-sm">
                  ৳{yearGrandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Project vs Month Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Project-wise Monthly Matrix ({selectedYear})
        </h3>
        <div className="table-container">
          <table className="custom-table text-xs">
            <thead>
              <tr>
                <th>Project Name</th>
                {monthNames.map(m => <th key={m} className="text-right">{m}</th>)}
                <th className="text-right bg-slate-800 font-bold">Total (TK)</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => {
                let rowSum = 0;
                return (
                  <tr key={proj}>
                    <td className="font-semibold text-slate-200">{proj}</td>
                    {months.map(m => {
                      const val = projectMatrix[proj][m] || 0;
                      rowSum += val;
                      return (
                        <td key={m} className={`text-right font-mono ${val > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                          {val > 0 ? `৳${val.toLocaleString()}` : '-'}
                        </td>
                      );
                    })}
                    <td className="text-right font-mono font-bold text-amber-400 bg-slate-800/50">
                      ৳{rowSum.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
