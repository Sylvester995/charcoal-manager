import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LRD, fmtDT, fmtD, WS_PRICE, RT_PRICE, batchCost, batchRevenue, batchSold
} from '../../data/store';
import { Trash2, ClipboardList } from 'lucide-react';

const TABS = ['All', 'Today', 'Week', 'Month'];

const History = () => {
  const { batches, sales, deleteBatch, deleteSale } = useApp();
  const [activeTab, setActiveTab]   = useState('All');
  const [activeView, setActiveView] = useState('sales');
  const [confirmId, setConfirmId]   = useState(null);
  const [confirmType, setConfirmType] = useState(null);

  // Filter sales by date tab
  const filteredSales = useMemo(() => {
    const now = Date.now();
    const sorted = [...sales].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    if (activeTab === 'Today')
      return sorted.filter(s => now - new Date(s.date) < 86400000);
    if (activeTab === 'Week')
      return sorted.filter(s => now - new Date(s.date) < 86400000 * 7);
    if (activeTab === 'Month')
      return sorted.filter(s => now - new Date(s.date) < 86400000 * 30);
    return sorted;
  }, [sales, activeTab]);

  // Filter batches by date tab
  const filteredBatches = useMemo(() => {
    const now = Date.now();
    const sorted = [...batches].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    if (activeTab === 'Today')
      return sorted.filter(b => now - new Date(b.date) < 86400000);
    if (activeTab === 'Week')
      return sorted.filter(b => now - new Date(b.date) < 86400000 * 7);
    if (activeTab === 'Month')
      return sorted.filter(b => now - new Date(b.date) < 86400000 * 30);
    return sorted;
  }, [batches, activeTab]);

  // Totals for filtered sales
  const salesTotals = useMemo(() => {
    const revenue = filteredSales.reduce(
      (s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0
    );
    const bags = filteredSales.reduce((s, x) => s + x.bags, 0);
    return { revenue, bags };
  }, [filteredSales]);

  const handleDelete = async (id, type) => {
    if (type === 'sale') await deleteSale(id);
    if (type === 'batch') await deleteBatch(id);
    setConfirmId(null);
    setConfirmType(null);
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          History
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          All batches and sales with full timestamps
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-[#1e1b16] border border-[#302b22] rounded-xl p-1 gap-1">
          {['sales', 'batches'].map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                activeView === v
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-500 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date filter tabs */}
        <div className="flex bg-[#1e1b16] border border-[#302b22] rounded-xl p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === t
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Record count */}
        <span className="text-stone-600 text-xs ml-auto">
          {activeView === 'sales'
            ? `${filteredSales.length} records`
            : `${filteredBatches.length} records`}
        </span>
      </div>

      {/* ── SALES VIEW ── */}
      {activeView === 'sales' && (
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              Sales Log
            </h3>
            {filteredSales.length > 0 && (
              <div className="flex gap-6 text-xs">
                <span className="text-stone-500">
                  Total Bags:{' '}
                  <span className="font-mono text-white font-bold">
                    {salesTotals.bags}
                  </span>
                </span>
                <span className="text-stone-500">
                  Total Revenue:{' '}
                  <span className="font-mono text-green-400 font-bold">
                    {LRD(salesTotals.revenue)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-stone-600">
              <ClipboardList className="w-10 h-10 mb-3" />
              <p className="text-sm">No sales in this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#302b22]">
                    {['Date & Time', 'Batch', 'Bags', 'Type',
                      'Price/Bag', 'Revenue', 'Note', ''].map(h => (
                      <th
                        key={h}
                        className="text-left text-[9px] uppercase tracking-widest text-stone-600 pb-3 pr-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(s => {
                    const price = s.type === 'retail' ? RT_PRICE : WS_PRICE;
                    const batch = batches.find(b => b.id === s.batch_id);
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-[#302b22]/50 hover:bg-orange-500/5 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-stone-400 whitespace-nowrap">
                          {fmtDT(s.date)}
                        </td>
                        <td className="py-3 pr-4 text-stone-400 text-xs whitespace-nowrap">
                          {batch?.note || `Batch #${s.batch_id}`}
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold text-white">
                          {s.bags}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                            s.type === 'retail'
                              ? 'bg-green-500/10 text-green-400 border-green-500/25'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-stone-300 whitespace-nowrap">
                          {LRD(price)}
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold text-green-400 whitespace-nowrap">
                          {LRD(s.bags * price)}
                        </td>
                        <td className="py-3 pr-4 text-stone-500 text-xs">
                          {s.note}
                        </td>
                        <td className="py-3">
                          {confirmId === s.id && confirmType === 'sale' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(s.id, 'sale')}
                                className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded font-bold transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setConfirmId(null); setConfirmType(null); }}
                                className="text-[10px] text-stone-500 hover:text-white px-2 py-1 rounded border border-[#302b22] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setConfirmId(s.id); setConfirmType('sale'); }}
                              className="text-stone-700 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── BATCHES VIEW ── */}
      {activeView === 'batches' && (
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              Batch Records
            </h3>
            <span className="text-stone-600 text-xs">
              {filteredBatches.length} batch(es)
            </span>
          </div>

          {filteredBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-stone-600">
              <span className="text-4xl mb-3">🔥</span>
              <p className="text-sm">No batches in this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#302b22]">
                    {['Date', 'Batch', 'Produced', 'After Burn',
                      'Total Cost', 'Cost/Bag', 'Revenue',
                      'Profit', 'Status', ''].map(h => (
                      <th
                        key={h}
                        className="text-left text-[9px] uppercase tracking-widest text-stone-600 pb-3 pr-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map(b => {
                    const cost   = batchCost(b);
                    const rev    = batchRevenue(sales, b.id);
                    const sold   = batchSold(sales, b.id);
                    const left   = Number(b.bags_after_burn) - sold;
                    const profit = rev - cost;
                    const cpb    = b.bags_after_burn > 0
                      ? cost / b.bags_after_burn
                      : 0;
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-[#302b22]/50 hover:bg-orange-500/5 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-stone-400 whitespace-nowrap">
                          {fmtD(b.date)}
                        </td>
                        <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">
                          {b.note || `Batch #${b.id}`}
                        </td>
                        <td className="py-3 pr-4 font-mono text-stone-300">
                          {b.bags_produced}
                        </td>
                        <td className="py-3 pr-4 font-mono text-white font-bold">
                          {b.bags_after_burn}
                        </td>
                        <td className="py-3 pr-4 font-mono text-red-400 whitespace-nowrap">
                          {LRD(cost)}
                        </td>
                        <td className="py-3 pr-4 font-mono text-orange-400 whitespace-nowrap">
                          {LRD(cpb)}
                        </td>
                        <td className="py-3 pr-4 font-mono text-green-400 whitespace-nowrap">
                          {LRD(rev)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span className={`font-mono font-bold ${
                            profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {profit >= 0 ? '+' : ''}{LRD(profit)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                            left === 0
                              ? 'bg-green-500/10 text-green-400 border-green-500/25'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/25'
                          }`}>
                            {left === 0 ? 'Sold Out' : `${left} left`}
                          </span>
                        </td>
                        <td className="py-3">
                          {confirmId === b.id && confirmType === 'batch' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(b.id, 'batch')}
                                className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded font-bold transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setConfirmId(null); setConfirmType(null); }}
                                className="text-[10px] text-stone-500 hover:text-white px-2 py-1 rounded border border-[#302b22] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setConfirmId(b.id); setConfirmType('batch'); }}
                              className="text-stone-700 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default History;