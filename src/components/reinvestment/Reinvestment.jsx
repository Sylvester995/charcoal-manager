import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LRD, batchCost, batchRevenue, batchSold, WS_PRICE, RT_PRICE } from '../../data/store';
import { TrendingUp, PiggyBank, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const Reinvestment = () => {
  const { batches, sales } = useApp();

  // Global reinvestment slider
  const [reinvestPct, setReinvestPct] = useState(50);
  const [expandedBatch, setExpandedBatch] = useState(null);
  // Per-batch custom percentages
  const [batchPcts, setBatchPcts] = useState({});

  // Overall totals
  const totals = useMemo(() => {
    const totalRevenue = sales.reduce(
      (s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0
    );
    const totalCost   = batches.reduce((s, b) => s + batchCost(b), 0);
    const totalProfit = totalRevenue - totalCost;
    return { totalRevenue, totalCost, totalProfit };
  }, [batches, sales]);

  // Batch level stats
  const batchStats = useMemo(() =>
    batches.map(b => {
      const cost    = batchCost(b);
      const rev     = batchRevenue(sales, b.id);
      const sold    = batchSold(sales, b.id);
      const left    = Number(b.bags_after_burn) - sold;
      const profit  = rev - cost;
      const potentialRev = left * WS_PRICE;
      const fullProfit   = profit + potentialRev - cost;
      return { ...b, cost, rev, sold, left, profit, potentialRev };
    }),
    [batches, sales]
  );

  // Global reinvestment calculations
  const globalCalc = useMemo(() => {
    const { totalProfit } = totals;
    const reinvest = totalProfit > 0 ? (totalProfit * reinvestPct) / 100 : 0;
    const save     = totalProfit > 0 ? totalProfit - reinvest : 0;

    // Projected next batch profit if reinvested
    const avgCost  = batches.length > 0
      ? totals.totalCost / batches.length
      : 0;
    const avgBags  = batches.length > 0
      ? batches.reduce((s, b) => s + Number(b.bags_after_burn || 0), 0) / batches.length
      : 0;
    const extraBags     = avgCost > 0 ? (reinvest / avgCost) * avgBags : 0;
    const projExtraRev  = extraBags * WS_PRICE;
    const projExtraProfit = projExtraRev - reinvest;

    return { reinvest, save, extraBags, projExtraRev, projExtraProfit };
  }, [totals, reinvestPct, batches]);

  // Per-batch reinvestment calc
  const getBatchCalc = (b, pct) => {
    const reinvest      = b.profit > 0 ? (b.profit * pct) / 100 : 0;
    const save          = b.profit > 0 ? b.profit - reinvest : 0;
    const avgCPB        = b.bags_after_burn > 0 ? b.cost / b.bags_after_burn : 0;
    const extraBags     = avgCPB > 0 ? reinvest / avgCPB : 0;
    const projExtraRev  = extraBags * WS_PRICE;
    const projProfit    = projExtraRev - reinvest;
    return { reinvest, save, extraBags, projExtraRev, projProfit };
  };

  const getPct = (batchId) =>
    batchPcts[batchId] !== undefined ? batchPcts[batchId] : reinvestPct;

  const setPct = (batchId, val) =>
    setBatchPcts(p => ({ ...p, [batchId]: Number(val) }));

  // Color for profit
  const profitColor = (n) =>
    n >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Reinvestment Planner
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Decide how much profit to reinvest vs save after each batch
        </p>
      </div>

      {/* No data */}
      {batches.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64
          bg-[#161410] border border-[#302b22] rounded-xl text-stone-600">
          <PiggyBank className="w-12 h-12 mb-4" />
          <p className="text-white font-bold text-lg">No batch data yet</p>
          <p className="text-sm mt-1">Record a batch and sales to use this planner</p>
        </div>
      )}

      {batches.length > 0 && <>

        {/* ── OVERALL SUMMARY ── */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
            Overall Business Summary
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Revenue', value: LRD(totals.totalRevenue), color: 'text-green-400',  bar: 'from-green-700 to-green-500'   },
              { label: 'Total Costs',   value: LRD(totals.totalCost),    color: 'text-red-400',    bar: 'from-red-700 to-red-500'       },
              { label: 'Total Profit',  value: LRD(totals.totalProfit),  color: profitColor(totals.totalProfit), bar: 'from-orange-700 to-orange-500' },
            ].map(x => (
              <div key={x.label}
                className="bg-[#1e1b16] border border-[#302b22] rounded-xl p-4
                  relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[2px]
                  bg-gradient-to-r ${x.bar}`} />
                <div className="text-[9px] uppercase tracking-widest
                  text-stone-600 mb-2">
                  {x.label}
                </div>
                <div className={`font-mono font-bold text-lg md:text-xl ${x.color}`}>
                  {x.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GLOBAL REINVESTMENT SLIDER ── */}
        <div className="bg-[#161410] border border-orange-700/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-orange-400" />
            <h3 className="text-orange-400 text-xs font-bold uppercase tracking-widest">
              Global Reinvestment Rate
            </h3>
          </div>
          <p className="text-stone-500 text-xs mb-6">
            Set a default reinvestment percentage. This applies to all batches
            unless you override individually below.
          </p>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-stone-400 text-sm">Reinvest</span>
              <span className="font-mono font-black text-3xl text-orange-400">
                {reinvestPct}%
              </span>
              <span className="text-stone-400 text-sm">Save</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={reinvestPct}
              onChange={e => setReinvestPct(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer
                bg-[#302b22] accent-orange-500"
            />

            <div className="flex justify-between text-xs text-stone-600">
              <span>0% (Save all)</span>
              <span>50%</span>
              <span>100% (Reinvest all)</span>
            </div>
          </div>

          {/* Global result cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              {
                label: '💰 Amount to Reinvest',
                value: LRD(globalCalc.reinvest),
                color: 'text-orange-400',
                sub:   `${reinvestPct}% of profit`,
              },
              {
                label: '🏦 Amount to Save',
                value: LRD(globalCalc.save),
                color: 'text-blue-400',
                sub:   `${100 - reinvestPct}% of profit`,
              },
              {
                label: '📦 Est. Extra Bags',
                value: globalCalc.extraBags.toFixed(0),
                color: 'text-white',
                sub:   'from reinvestment',
              },
              {
                label: '📈 Proj. Extra Profit',
                value: LRD(globalCalc.projExtraProfit),
                color: profitColor(globalCalc.projExtraProfit),
                sub:   'if all extra bags sold WS',
              },
            ].map(x => (
              <div key={x.label}
                className="bg-[#1e1b16] border border-[#302b22] rounded-xl p-4">
                <div className="text-[9px] uppercase tracking-widest
                  text-stone-600 mb-2 leading-tight">
                  {x.label}
                </div>
                <div className={`font-mono font-bold text-lg ${x.color}`}>
                  {x.value}
                </div>
                <div className="text-[10px] text-stone-600 mt-1">{x.sub}</div>
              </div>
            ))}
          </div>

          {/* Visual split bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-stone-500 mb-2">
              <span>Reinvest — {LRD(globalCalc.reinvest)}</span>
              <span>Save — {LRD(globalCalc.save)}</span>
            </div>
            <div className="h-4 bg-[#302b22] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400
                  transition-all duration-300 rounded-l-full"
                style={{ width: `${reinvestPct}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-blue-500
                  transition-all duration-300 rounded-r-full"
                style={{ width: `${100 - reinvestPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-orange-400">{reinvestPct}% reinvested</span>
              <span className="text-blue-400">{100 - reinvestPct}% saved</span>
            </div>
          </div>
        </div>

        {/* ── PER BATCH BREAKDOWN ── */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-orange-400" />
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              Per Batch Reinvestment
            </h3>
          </div>
          <p className="text-stone-500 text-xs mb-5">
            Tap a batch to set a custom reinvestment rate and see detailed projections.
          </p>

          <div className="space-y-3">
            {batchStats.map(b => {
              const pct  = getPct(b.id);
              const calc = getBatchCalc(b, pct);
              const isExpanded = expandedBatch === b.id;

              return (
                <div key={b.id}
                  className="border border-[#302b22] rounded-xl overflow-hidden">

                  {/* Batch header — always visible */}
                  <button
                    onClick={() =>
                      setExpandedBatch(isExpanded ? null : b.id)
                    }
                    className="w-full flex items-center justify-between
                      px-5 py-4 bg-[#1e1b16] hover:bg-[#252118]
                      transition-colors text-left"
                  >
                    <div>
                      <div className="text-white font-bold text-sm">
                        {b.note || `Batch #${b.id}`}
                      </div>
                      <div className="text-stone-500 text-xs mt-0.5">
                        Profit so far:{' '}
                        <span className={`font-mono font-bold ${profitColor(b.profit)}`}>
                          {LRD(b.profit)}
                        </span>
                        {' · '}{b.left} bags unsold
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-orange-400 font-bold text-sm">
                        {pct}%
                      </span>
                      {isExpanded
                        ? <ChevronUp   className="w-4 h-4 text-stone-500" />
                        : <ChevronDown className="w-4 h-4 text-stone-500" />
                      }
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 py-5 bg-[#161410] space-y-5">

                      {/* Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400 text-xs">
                            Reinvest from this batch
                          </span>
                          <span className="font-mono font-black text-2xl
                            text-orange-400">
                            {pct}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={e => setPct(b.id, e.target.value)}
                          className="w-full h-2 rounded-full appearance-none
                            cursor-pointer bg-[#302b22] accent-orange-500"
                        />
                        <div className="flex justify-between text-[10px]
                          text-stone-600">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Result grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          {
                            label: 'Current Profit',
                            value: LRD(b.profit),
                            color: profitColor(b.profit),
                            sub:   'from sales so far',
                          },
                          {
                            label: 'Reinvest',
                            value: LRD(calc.reinvest),
                            color: 'text-orange-400',
                            sub:   `${pct}% of profit`,
                          },
                          {
                            label: 'Save',
                            value: LRD(calc.save),
                            color: 'text-blue-400',
                            sub:   `${100 - pct}% of profit`,
                          },
                          {
                            label: 'Est. Extra Bags',
                            value: calc.extraBags.toFixed(1),
                            color: 'text-white',
                            sub:   'next batch boost',
                          },
                          {
                            label: 'Proj. Extra Revenue',
                            value: LRD(calc.projExtraRev),
                            color: 'text-green-400',
                            sub:   'if all extra bags sold',
                          },
                          {
                            label: 'Proj. Extra Profit',
                            value: LRD(calc.projProfit),
                            color: profitColor(calc.projProfit),
                            sub:   'after reinvestment cost',
                          },
                        ].map(x => (
                          <div key={x.label}
                            className="bg-[#1e1b16] border border-[#302b22]
                              rounded-lg p-3">
                            <div className="text-[9px] uppercase tracking-widest
                              text-stone-600 mb-1 leading-tight">
                              {x.label}
                            </div>
                            <div className={`font-mono font-bold text-base
                              ${x.color}`}>
                              {x.value}
                            </div>
                            <div className="text-[10px] text-stone-600 mt-0.5">
                              {x.sub}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Split bar */}
                      <div>
                        <div className="h-3 bg-[#302b22] rounded-full
                          overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r
                              from-orange-600 to-orange-400 transition-all
                              duration-300"
                            style={{ width: `${pct}%` }}
                          />
                          <div
                            className="h-full bg-gradient-to-r
                              from-blue-700 to-blue-500 transition-all
                              duration-300"
                            style={{ width: `${100 - pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className="text-orange-400">
                            {pct}% reinvested
                          </span>
                          <span className="text-blue-400">
                            {100 - pct}% saved
                          </span>
                        </div>
                      </div>

                      {/* Unsold bags note */}
                      {b.left > 0 && (
                        <div className="bg-yellow-950/20 border
                          border-yellow-700/25 rounded-lg px-4 py-3 text-xs
                          text-yellow-300">
                          ⚠️ This batch still has{' '}
                          <strong>{b.left} unsold bags</strong> worth{' '}
                          <strong>{LRD(b.left * WS_PRICE)}</strong> at
                          wholesale. Selling them will increase your profit
                          available to reinvest.
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── REINVESTMENT TIPS ── */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h3 className="text-stone-400 text-xs font-bold uppercase
              tracking-widest">
              Reinvestment Strategy Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                pct:   '25%',
                title: 'Conservative',
                color: 'border-blue-700/30 bg-blue-950/10',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                desc:  'Reinvest 25% — keep most profit as savings. Good for stability and covering personal expenses while slowly growing.',
              },
              {
                pct:   '50%',
                title: 'Balanced',
                color: 'border-orange-700/30 bg-orange-950/10',
                badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                desc:  'Reinvest 50% — split evenly between growth and savings. The most common strategy for steady business growth.',
              },
              {
                pct:   '75%',
                title: 'Aggressive',
                color: 'border-green-700/30 bg-green-950/10',
                badge: 'bg-green-500/10 text-green-400 border-green-500/20',
                desc:  'Reinvest 75% — maximize business growth. Best when demand is high and you want to scale production quickly.',
              },
            ].map(t => (
              <div key={t.title}
                className={`border rounded-xl p-4 ${t.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider
                    px-2 py-1 rounded-full border ${t.badge}`}>
                    {t.pct}
                  </span>
                  <span className="text-white font-bold text-sm">{t.title}</span>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">{t.desc}</p>
                <button
                  onClick={() => setReinvestPct(parseInt(t.pct))}
                  className="mt-3 text-[10px] text-stone-500 hover:text-white
                    transition-colors underline underline-offset-2"
                >
                  Apply this rate globally →
                </button>
              </div>
            ))}
          </div>
        </div>

      </>}
    </div>
  );
};

export default Reinvestment;