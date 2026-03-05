import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LRD, WS_PRICE, RT_PRICE, computeAnalytics
} from '../../data/store';
import { TrendingUp } from 'lucide-react';

const Projections = () => {
  const { batches, sales } = useApp();
  const A = useMemo(
    () => computeAnalytics(batches, sales),
    [batches, sales]
  );

  // Average cost and bags per batch
  const avgCost = batches.length > 0 ? A.totalCost / batches.length : 0;
  const avgBags = batches.length > 0 ? A.totalProd / batches.length : 0;
  const avgCPB  = A.totalProd > 0 ? A.totalCost / A.totalProd : 0;

  // Profit per bag
  const profitWS = WS_PRICE - avgCPB;
  const profitRT = RT_PRICE - avgCPB;

  // ROI
  const roiWS = avgCPB > 0 ? (profitWS / avgCPB) * 100 : 0;
  const roiRT = avgCPB > 0 ? (profitRT / avgCPB) * 100 : 0;

  // Next batch scenarios
  const scenarios = [
    { label: 'Small Batch (−30%)',        bags: Math.round(avgBags * 0.7), costMult: 0.85 },
    { label: 'Average Batch (current)',   bags: Math.round(avgBags),       costMult: 1.0  },
    { label: 'Large Batch (+30%)',        bags: Math.round(avgBags * 1.3), costMult: 1.2  },
    { label: 'Big Run (+60%)',            bags: Math.round(avgBags * 1.6), costMult: 1.4  },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Projections
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Revenue forecasting and profit analysis based on your actual data
        </p>
      </div>

      {/* No data state */}
      {batches.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64
          bg-[#161410] border border-[#302b22] rounded-xl text-stone-600">
          <TrendingUp className="w-12 h-12 mb-4" />
          <p className="text-white font-bold text-lg">No data yet</p>
          <p className="text-sm mt-1">
            Record at least one batch to see projections
          </p>
        </div>
      )}

      {batches.length > 0 && <>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg Cost / Batch', value: LRD(avgCost),
              sub: `${batches.length} batch(es)`,         color: 'from-red-700 to-red-500'       },
            { label: 'Avg Bags / Batch', value: avgBags.toFixed(0),
              sub: 'bags after burn',                     color: 'from-orange-700 to-orange-500' },
            { label: 'Proj. Monthly Rev', value: LRD(A.projMonthly),
              sub: 'based on weekly avg',                 color: 'from-green-700 to-green-500'   },
            { label: 'Proj. Annual Rev',  value: LRD(A.projAnnual),
              sub: 'extrapolated',                        color: 'from-yellow-700 to-yellow-500' },
          ].map(x => (
            <div
              key={x.label}
              className="bg-[#161410] border border-[#302b22] rounded-xl p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${x.color}`} />
              <div className="text-[9px] uppercase tracking-[2px] text-stone-500 mb-3">
                {x.label}
              </div>
              <div className="font-mono text-2xl text-white leading-none">
                {x.value}
              </div>
              <div className="text-xs text-stone-500 mt-2">{x.sub}</div>
            </div>
          ))}
        </div>

        {/* Per-bag economics */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-6">
            Per-Bag Economics — Average Across All Batches
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: 'Avg Cost/Bag',          value: LRD(avgCPB),          color: 'text-red-400'    },
              { label: 'Wholesale Price/Bag',   value: LRD(WS_PRICE),        color: 'text-blue-400'   },
              { label: 'Retail Price/Bag',      value: LRD(RT_PRICE),        color: 'text-blue-400'   },
              { label: 'Profit/Bag (WS)',        value: LRD(profitWS),        color: profitWS >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Profit/Bag (Retail)',   value: LRD(profitRT),        color: profitRT >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'ROI — Wholesale',       value: `${roiWS.toFixed(1)}%`, color: 'text-yellow-400' },
              { label: 'ROI — Retail',          value: `${roiRT.toFixed(1)}%`, color: 'text-yellow-400' },
            ].map(x => (
              <div
                key={x.label}
                className="bg-[#1e1b16] border border-[#302b22] rounded-lg p-4"
              >
                <div className="text-[9px] uppercase tracking-widest text-stone-600 mb-2">
                  {x.label}
                </div>
                <div className={`font-mono text-lg font-bold ${x.color}`}>
                  {x.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue projection bars */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-6">
            Revenue Projection Scenarios
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Conservative (−20%)', mult: 0.8,  color: 'text-stone-400',  bar: 'from-stone-700 to-stone-500'   },
              { label: 'Base Case (current)', mult: 1.0,  color: 'text-orange-400', bar: 'from-orange-700 to-orange-500' },
              { label: 'Optimistic (+25%)',   mult: 1.25, color: 'text-green-400',  bar: 'from-green-700 to-green-500'   },
              { label: 'Growth (+50%)',        mult: 1.5,  color: 'text-yellow-400', bar: 'from-yellow-700 to-yellow-500' },
            ].map(s => {
              const monthly = A.projMonthly * s.mult;
              const annual  = A.projAnnual  * s.mult;
              const pct     = Math.min(100, s.mult * 60);
              return (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${s.color}`}>
                      {s.label}
                    </span>
                    <div className="flex gap-6 text-xs">
                      <span className="text-stone-500">
                        Monthly:{' '}
                        <span className={`font-mono font-bold ${s.color}`}>
                          {LRD(monthly)}
                        </span>
                      </span>
                      <span className="text-stone-500">
                        Annual:{' '}
                        <span className={`font-mono font-bold ${s.color}`}>
                          {LRD(annual)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#302b22] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${s.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next batch scenarios table */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">
            Next Batch Scenarios
          </h3>
          <p className="text-stone-600 text-xs mb-6">
            Based on your average batch cost of{' '}
            <span className="text-orange-400 font-mono">{LRD(avgCost)}</span> and{' '}
            <span className="text-white font-mono">{avgBags.toFixed(0)}</span> bags
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#302b22]">
                  {['Scenario', 'Est. Bags', 'Est. Cost', 'WS Revenue',
                    'WS Profit', 'RT Revenue', 'RT Profit', 'WS ROI'].map(h => (
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
                {scenarios.map(s => {
                  const cost   = avgCost * s.costMult;
                  const wsRev  = s.bags  * WS_PRICE;
                  const rtRev  = s.bags  * RT_PRICE;
                  const wsProf = wsRev   - cost;
                  const rtProf = rtRev   - cost;
                  const roi    = cost > 0 ? (wsProf / cost) * 100 : 0;
                  return (
                    <tr
                      key={s.label}
                      className="border-b border-[#302b22]/50 hover:bg-orange-500/5 transition-colors"
                    >
                      <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">
                        {s.label}
                      </td>
                      <td className="py-3 pr-4 font-mono text-stone-300">
                        {s.bags}
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-400 whitespace-nowrap">
                        {LRD(cost)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-stone-300 whitespace-nowrap">
                        {LRD(wsRev)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`font-mono font-bold ${
                          wsProf >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {wsProf >= 0 ? '+' : ''}{LRD(wsProf)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-stone-300 whitespace-nowrap">
                        {LRD(rtRev)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`font-mono font-bold ${
                          rtProf >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {rtProf >= 0 ? '+' : ''}{LRD(rtProf)}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-yellow-400 whitespace-nowrap">
                        {roi.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual batch profitability */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-6">
            Individual Batch Profitability
          </h3>
          <div className="space-y-5">
            {A.batchStats.map(b => {
              const margin = b.rev > 0
                ? (b.profit / b.rev) * 100
                : 0;
              const soldPct = b.bags_after_burn > 0
                ? (b.sold / b.bags_after_burn) * 100
                : 0;
              return (
                <div
                  key={b.id}
                  className="bg-[#1e1b16] border border-[#302b22] rounded-xl p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-bold">
                        {b.note || `Batch #${b.id}`}
                      </div>
                      <div className="text-stone-500 text-xs mt-1">
                        {b.bags_after_burn} bags after burn ·{' '}
                        {LRD(b.cpb)}/bag cost
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold text-lg ${
                        b.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {b.profit >= 0 ? '+' : ''}{LRD(b.profit)}
                      </div>
                      <div className="text-stone-600 text-xs">
                        {margin.toFixed(1)}% margin
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Total Cost',    value: LRD(b.cost),  color: 'text-red-400'    },
                      { label: 'Revenue So Far', value: LRD(b.rev),   color: 'text-green-400'  },
                      { label: 'Bags Sold',      value: `${b.sold}/${b.bags_after_burn}`, color: 'text-white' },
                      { label: 'Remaining',      value: b.left,       color: b.left > 0 ? 'text-orange-400' : 'text-stone-600' },
                    ].map(x => (
                      <div key={x.label}>
                        <div className="text-[9px] uppercase tracking-widest text-stone-600 mb-1">
                          {x.label}
                        </div>
                        <div className={`font-mono font-bold ${x.color}`}>
                          {x.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sold progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                      <span>Bags sold</span>
                      <span>{soldPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#302b22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-700 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Potential if remaining sold */}
                  {b.left > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#302b22] text-xs text-stone-500">
                      Sell remaining{' '}
                      <span className="text-orange-400 font-mono font-bold">
                        {b.left} bags
                      </span>{' '}
                      at wholesale for{' '}
                      <span className="text-green-400 font-mono font-bold">
                        {LRD(b.left * WS_PRICE)}
                      </span>{' '}
                      more revenue — total profit would be{' '}
                      <span className="text-green-400 font-mono font-bold">
                        {LRD(b.profit + b.left * WS_PRICE)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </>}
    </div>
  );
};

export default Projections;