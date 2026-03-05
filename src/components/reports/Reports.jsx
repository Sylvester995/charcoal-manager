import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LRD, fmtD, WS_PRICE, RT_PRICE,
  batchCost, batchRevenue, batchSold, COST_FIELDS
} from '../../data/store';
import {
  FileText, Download, BarChart2,
  ShoppingBag, Package, PiggyBank
} from 'lucide-react';

// ── PDF helpers ─────────────────────────────────────────────────
const ORANGE = [232, 98, 26];
const DARK   = [22, 20, 16];
const GRAY   = [120, 113, 108];

const addHeader = (doc, title, subtitle) => {
  // Orange header bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 210, 22, 'F');

  // App name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CHARCOAL MANAGER', 14, 10);

  // Subtitle in header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Liberia Business Tracker', 14, 16);

  // Date on right
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })}`,
    196, 16,
    { align: 'right' }
  );

  // Report title
  doc.setTextColor(...DARK);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 35);

  // Report subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(subtitle, 14, 42);

  // Divider
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(14, 46, 196, 46);

  return 52; // y position after header
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Charcoal Manager — Liberia Business Tracker | Page ${i} of ${pageCount}`,
      105, 290,
      { align: 'center' }
    );
    doc.setDrawColor(...GRAY);
    doc.setLineWidth(0.3);
    doc.line(14, 286, 196, 286);
  }
};

const statBox = (doc, x, y, w, label, value, color = ORANGE) => {
  doc.setFillColor(245, 245, 240);
  doc.roundedRect(x, y, w, 18, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text(label.toUpperCase(), x + 4, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...color);
  doc.text(value, x + 4, y + 14);
};

// ── Report generators ────────────────────────────────────────────

const generateSummaryPDF = (batches, sales) => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Business Summary Report', 'Overall revenue, costs and profit analysis');

  // Overall stats
  const totalRev    = sales.reduce((s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0);
  const totalCost   = batches.reduce((s, b) => s + batchCost(b), 0);
  const totalProfit = totalRev - totalCost;
  const totalBags   = batches.reduce((s, b) => s + Number(b.bags_after_burn || 0), 0);
  const totalSold   = sales.reduce((s, x) => s + Number(x.bags), 0);
  const totalLeft   = totalBags - totalSold;
  const margin      = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;

  // Stat boxes row 1
  const bw = 43;
  statBox(doc, 14,  y, bw, 'Total Revenue',  LRD(totalRev),    [39, 174, 96]);
  statBox(doc, 61,  y, bw, 'Total Costs',    LRD(totalCost),   [192, 57, 43]);
  statBox(doc, 108, y, bw, 'Net Profit',     LRD(totalProfit), totalProfit >= 0 ? [39, 174, 96] : [192, 57, 43]);
  statBox(doc, 155, y, bw, 'Profit Margin',  `${margin}%`,     ORANGE);
  y += 24;

  statBox(doc, 14,  y, bw, 'Total Batches',  `${batches.length}`,    DARK);
  statBox(doc, 61,  y, bw, 'Bags Produced',  `${totalBags}`,         DARK);
  statBox(doc, 108, y, bw, 'Bags Sold',      `${totalSold}`,         [39, 174, 96]);
  statBox(doc, 155, y, bw, 'Bags Remaining', `${totalLeft}`,         ORANGE);
  y += 28;

  // Batch performance table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Batch Performance', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Batch', 'Date', 'Bags', 'Cost (L$)', 'Revenue (L$)', 'Profit (L$)', 'Sold %']],
    body: batches.map(b => {
      const cost    = batchCost(b);
      const rev     = batchRevenue(sales, b.id);
      const sold    = batchSold(sales, b.id);
      const profit  = rev - cost;
      const soldPct = b.bags_after_burn > 0
        ? ((sold / b.bags_after_burn) * 100).toFixed(0) + '%'
        : '0%';
      return [
        b.note || `Batch #${b.id}`,
        fmtD(b.date),
        b.bags_after_burn,
        LRD(cost),
        LRD(rev),
        LRD(profit),
        soldPct,
      ];
    }),
    styles:      { fontSize: 9, cellPadding: 3 },
    headStyles:  { fillColor: ORANGE, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Cost breakdown table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Cost Breakdown by Category', 14, y);
  y += 4;

  const costBreakdown = COST_FIELDS.map(f => {
    const total = batches.reduce((s, b) => s + Number(b[f.key] || 0), 0);
    const pct   = totalCost > 0 ? ((total / totalCost) * 100).toFixed(1) + '%' : '0%';
    return [f.label, LRD(total), pct];
  }).filter(r => r[1] !== LRD(0));

  autoTable(doc, {
    startY: y,
    head: [['Cost Category', 'Total Spent (L$)', '% of Total Cost']],
    body: costBreakdown,
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: ORANGE, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  });

  addFooter(doc);
  doc.save('charcoal-business-summary.pdf');
};

const generateBatchPDF = (batch, sales) => {
  const doc  = new jsPDF();
  const cost = batchCost(batch);
  const rev  = batchRevenue(sales, batch.id);
  const sold = batchSold(sales, batch.id);
  const left = Number(batch.bags_after_burn) - sold;
  const profit = rev - cost;
  const cpb    = batch.bags_after_burn > 0 ? cost / batch.bags_after_burn : 0;

  let y = addHeader(
    doc,
    `Batch Report: ${batch.note || `Batch #${batch.id}`}`,
    `Production date: ${fmtD(batch.date)}`
  );

  // Stat boxes
  const bw = 43;
  statBox(doc, 14,  y, bw, 'Total Cost',     LRD(cost),   [192, 57, 43]);
  statBox(doc, 61,  y, bw, 'Revenue So Far', LRD(rev),    [39, 174, 96]);
  statBox(doc, 108, y, bw, 'Profit So Far',  LRD(profit), profit >= 0 ? [39, 174, 96] : [192, 57, 43]);
  statBox(doc, 155, y, bw, 'Cost / Bag',     LRD(cpb),    ORANGE);
  y += 24;

  statBox(doc, 14,  y, bw, 'Bags Produced',  `${batch.bags_produced}`,  DARK);
  statBox(doc, 61,  y, bw, 'Bags After Burn',`${batch.bags_after_burn}`, DARK);
  statBox(doc, 108, y, bw, 'Bags Sold',      `${sold}`,                 [39, 174, 96]);
  statBox(doc, 155, y, bw, 'Bags Remaining', `${left}`,                 ORANGE);
  y += 28;

  // Cost breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Production Cost Breakdown', 14, y);
  y += 4;

  const costRows = COST_FIELDS
    .map(f => {
      const val = Number(batch[f.key] || 0);
      const pct = cost > 0 ? ((val / cost) * 100).toFixed(1) + '%' : '0%';
      return [f.label, LRD(val), pct];
    })
    .filter(r => r[1] !== LRD(0));

  autoTable(doc, {
    startY: y,
    head: [['Cost Category', 'Amount (L$)', '% of Total']],
    body: [
      ...costRows,
      ['TOTAL', LRD(cost), '100%'],
    ],
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: ORANGE, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    bodyStyles: { textColor: DARK },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.row.index === costRows.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 235, 225];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Sales from this batch
  const batchSales = sales.filter(s => s.batch_id === batch.id);
  if (batchSales.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Sales From This Batch', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Bags', 'Type', 'Price/Bag', 'Revenue (L$)', 'Buyer']],
      body: batchSales.map(s => {
        const price = s.type === 'retail' ? RT_PRICE : WS_PRICE;
        return [
          fmtD(s.date),
          s.bags,
          s.type.charAt(0).toUpperCase() + s.type.slice(1),
          LRD(price),
          LRD(s.bags * price),
          s.buyer || '—',
        ];
      }),
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: ORANGE, textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 248, 245] },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    });
  }

  // Unsold note
  if (left > 0) {
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 12;
    doc.setFillColor(255, 248, 220);
    doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 120, 0);
    doc.text(
      `⚠  ${left} bags unsold — potential revenue: ${LRD(left * WS_PRICE)} (WS) / ${LRD(left * RT_PRICE)} (RT)`,
      18, y + 10
    );
  }

  addFooter(doc);
  doc.save(`batch-report-${batch.note || batch.id}.pdf`);
};

const generateSalesPDF = (batches, sales, dateFilter) => {
  const doc = new jsPDF();

  // Filter sales by date
  const now   = new Date();
  let filtered = [...sales];
  let periodLabel = 'All Time';

  if (dateFilter === 'week') {
    const from = new Date(now); from.setDate(now.getDate() - 7);
    filtered = sales.filter(s => new Date(s.date) >= from);
    periodLabel = 'Last 7 Days';
  } else if (dateFilter === 'month') {
    const from = new Date(now); from.setDate(now.getDate() - 30);
    filtered = sales.filter(s => new Date(s.date) >= from);
    periodLabel = 'Last 30 Days';
  }

  let y = addHeader(
    doc,
    'Sales Report',
    `Period: ${periodLabel} — ${filtered.length} transactions`
  );

  // Totals
  const totalBags = filtered.reduce((s, x) => s + Number(x.bags), 0);
  const totalRev  = filtered.reduce(
    (s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0
  );
  const wsRev = filtered
    .filter(x => x.type === 'wholesale')
    .reduce((s, x) => s + x.bags * WS_PRICE, 0);
  const rtRev = filtered
    .filter(x => x.type === 'retail')
    .reduce((s, x) => s + x.bags * RT_PRICE, 0);

  const bw = 43;
  statBox(doc, 14,  y, bw, 'Total Sales',      `${filtered.length}`,  DARK);
  statBox(doc, 61,  y, bw, 'Total Bags Sold',  `${totalBags}`,        DARK);
  statBox(doc, 108, y, bw, 'Total Revenue',    LRD(totalRev),         [39, 174, 96]);
  statBox(doc, 155, y, bw, 'Period',           periodLabel,           ORANGE);
  y += 24;

  statBox(doc, 14,  y, bw, 'Wholesale Revenue', LRD(wsRev), ORANGE);
  statBox(doc, 61,  y, bw, 'Retail Revenue',    LRD(rtRev), [39, 174, 96]);
  y += 28;

  // Sales table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Transaction Log', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Batch', 'Bags', 'Type', 'Price/Bag', 'Revenue (L$)', 'Buyer']],
    body: [...filtered]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(s => {
        const price = s.type === 'retail' ? RT_PRICE : WS_PRICE;
        const batch = batches.find(b => b.id === s.batch_id);
        return [
          fmtD(s.date),
          batch?.note || `Batch #${s.batch_id}`,
          s.bags,
          s.type.charAt(0).toUpperCase() + s.type.slice(1),
          LRD(price),
          LRD(s.bags * price),
          s.buyer || '—',
        ];
      }),
    styles:     { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: ORANGE, textColor: [255,255,255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    foot: [[
      'TOTAL', '', totalBags, '', '',
      LRD(totalRev), ''
    ]],
    footStyles: {
      fillColor: [240, 235, 225],
      textColor: DARK,
      fontStyle: 'bold',
    },
  });

  addFooter(doc);
  doc.save(`sales-report-${dateFilter}.pdf`);
};

// ── Main Reports Component ───────────────────────────────────────
const Reports = () => {
  const { batches, sales } = useApp();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [salesPeriod,   setSalesPeriod]   = useState('all');
  const [generating,    setGenerating]    = useState('');

  const generate = async (type) => {
    setGenerating(type);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (type === 'summary') {
        generateSummaryPDF(batches, sales);
      } else if (type === 'batch') {
        const batch = batches.find(b => b.id === Number(selectedBatch));
        if (batch) generateBatchPDF(batch, sales);
      } else if (type === 'sales') {
        generateSalesPDF(batches, sales, salesPeriod);
      }
    } catch (err) {
      console.error('PDF error:', err);
    }
    setGenerating('');
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Reports
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Export professional PDF reports for your records
        </p>
      </div>

      {/* No data */}
      {batches.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48
          bg-[#161410] border border-[#302b22] rounded-xl text-stone-600">
          <FileText className="w-12 h-12 mb-4" />
          <p className="text-white font-bold">No data yet</p>
          <p className="text-sm mt-1">Record some batches and sales first</p>
        </div>
      )}

      {batches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Business Summary ── */}
          <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6
            flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex
                items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-bold">Business Summary</div>
                <div className="text-stone-500 text-xs">Full overview report</div>
              </div>
            </div>

            <p className="text-stone-500 text-xs leading-relaxed mb-6 flex-1">
              Complete business overview including all batches, total revenue,
              costs, profit margin and cost breakdown by category.
            </p>

            <div className="space-y-2 text-xs text-stone-500 mb-6">
              {['All batch performance', 'Cost breakdown chart',
                'Revenue vs profit', 'Overall margins'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => generate('summary')}
              disabled={generating === 'summary'}
              className="w-full bg-orange-600 hover:bg-orange-500
                disabled:opacity-50 text-white font-bold py-3 rounded-xl
                transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {generating === 'summary' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* ── Batch Report ── */}
          <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6
            flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex
                items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-bold">Batch Report</div>
                <div className="text-stone-500 text-xs">Single batch details</div>
              </div>
            </div>

            <p className="text-stone-500 text-xs leading-relaxed mb-4 flex-1">
              Detailed report for one specific batch including all costs,
              sales made, bags remaining and profit analysis.
            </p>

            <div className="mb-4">
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-3 py-2.5 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                <option value="">-- Choose batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.note || `Batch #${b.id}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => generate('batch')}
              disabled={!selectedBatch || generating === 'batch'}
              className="w-full bg-orange-600 hover:bg-orange-500
                disabled:opacity-50 disabled:cursor-not-allowed text-white
                font-bold py-3 rounded-xl transition-colors flex items-center
                justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {generating === 'batch' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* ── Sales Report ── */}
          <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6
            flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex
                items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-bold">Sales Report</div>
                <div className="text-stone-500 text-xs">Transaction log</div>
              </div>
            </div>

            <p className="text-stone-500 text-xs leading-relaxed mb-4 flex-1">
              Full sales transaction log for a selected time period with
              totals for bags sold, revenue and wholesale vs retail breakdown.
            </p>

            <div className="mb-4">
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Time Period
              </label>
              <select
                value={salesPeriod}
                onChange={e => setSalesPeriod(e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-3 py-2.5 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <button
              onClick={() => generate('sales')}
              disabled={generating === 'sales'}
              className="w-full bg-orange-600 hover:bg-orange-500
                disabled:opacity-50 text-white font-bold py-3 rounded-xl
                transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {generating === 'sales' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

        </div>
      )}

      {/* Preview info */}
      {batches.length > 0 && (
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-orange-400" />
            <h3 className="text-stone-400 text-xs font-bold uppercase
              tracking-widest">
              What's included in each report
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs
            text-stone-500">
            <div>
              <div className="text-orange-400 font-bold mb-2">
                📊 Business Summary
              </div>
              <ul className="space-y-1">
                <li>• Total revenue, costs & profit</li>
                <li>• Profit margin percentage</li>
                <li>• All batches performance table</li>
                <li>• Cost breakdown by category</li>
                <li>• Bags sold vs remaining</li>
              </ul>
            </div>
            <div>
              <div className="text-orange-400 font-bold mb-2">
                📦 Batch Report
              </div>
              <ul className="space-y-1">
                <li>• Full cost breakdown</li>
                <li>• Bags produced vs after burn</li>
                <li>• All sales from that batch</li>
                <li>• Profit analysis</li>
                <li>• Unsold bags value</li>
              </ul>
            </div>
            <div>
              <div className="text-orange-400 font-bold mb-2">
                💰 Sales Report
              </div>
              <ul className="space-y-1">
                <li>• Full transaction log</li>
                <li>• Wholesale vs retail breakdown</li>
                <li>• Total bags & revenue</li>
                <li>• Buyer information</li>
                <li>• Period totals</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;