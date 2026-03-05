// import React, { useMemo } from 'react';
// import { useApp } from '../../context/AppContext';
// import { computeAnalytics, LRD, fmtDT, WS_PRICE } from '../../data/store';
// import StatCard from './StatCard';
// import { TrendingUp, Package, AlertTriangle } from 'lucide-react';

// const Dashboard = () => {
//   const { batches, sales } = useApp();
//   const A = useMemo(() => computeAnalytics(batches, sales), [batches, sales]);

//   const recentSales = useMemo(() =>
//     [...sales]
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 6),
//     [sales]
//   );

//   return (
//     <div className="space-y-6">

//       {/* Page header */}
//       <div>
//         <h2 className="text-3xl font-black text-white tracking-tight">Dashboard</h2>
//         <p className="text-stone-500 text-sm mt-1">
//           Full business overview — {new Date().toLocaleDateString('en-GB', {
//             weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
//           })}
//         </p>
//       </div>

//       {/* Unsold stock alert */}
//       {A.totalLeft > 0 && (
//         <div className="flex items-start gap-3 bg-yellow-950/30 border border-yellow-700/30 rounded-xl px-5 py-4">
//           <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
//           <p className="text-yellow-400 text-sm">
//             You have <strong>{A.totalLeft} unsold bags</strong> across all batches.
//             &nbsp;Potential wholesale revenue:&nbsp;
//             <strong>{LRD(A.totalLeft * WS_PRICE)}</strong>
//           </p>
//         </div>
//       )}

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//         <StatCard
//           label="Total Revenue"
//           value={LRD(A.totalRev)}
//           sub="All-time sales"
//           accent="orange"
//         />
//         <StatCard
//           label="Total Costs"
//           value={LRD(A.totalCost)}
//           sub="All batch expenses"
//           accent="red"
//         />
//         <StatCard
//           label="Net Profit"
//           value={LRD(A.totalProfit)}
//           sub={`${A.margin.toFixed(1)}% margin`}
//           accent={A.totalProfit >= 0 ? 'green' : 'red'}
//         />
//         <StatCard
//           label="Bags Status"
//           value={A.totalProd}
//           sub={`${A.totalSold} sold · ${A.totalLeft} left`}
//           accent="blue"
//         />
//         <StatCard
//           label="Weekly Revenue"
//           value={LRD(A.weekRev)}
//           sub="Last 7 days"
//           accent="orange"
//         />
//         <StatCard
//           label="Monthly Revenue"
//           value={LRD(A.monthRev)}
//           sub="Last 30 days"
//           accent="gold"
//         />
//       </div>

//       {/* Two column section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* Cost Breakdown */}
//         <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//           <div className="flex justify-between items-center mb-5">
//             <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
//               Where Money Was Spent
//             </h3>
//             <span className="text-stone-600 text-xs">All batches</span>
//           </div>

//           <div className="space-y-4">
//             {A.costBreakdown.map(f => {
//               const pct = A.totalCost > 0 ? (f.total / A.totalCost) * 100 : 0;
//               return (
//                 <div key={f.key}>
//                   <div className="flex justify-between text-xs mb-1.5">
//                     <span className="text-stone-400">
//                       {f.icon} {f.label}
//                     </span>
//                     <span className="font-mono text-orange-400">
//                       {LRD(f.total)}
//                     </span>
//                   </div>
//                   <div className="h-1.5 bg-[#302b22] rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
//                       style={{ width: `${pct}%` }}
//                     />
//                   </div>
//                   <div className="text-[9px] text-stone-600 mt-1">
//                     {pct.toFixed(1)}% of total cost
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Total */}
//           <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#302b22]">
//             <span className="text-white font-bold text-sm">Total Production Cost</span>
//             <span className="font-mono text-red-400 text-lg">{LRD(A.totalCost)}</span>
//           </div>
//         </div>

//         {/* Batch Performance */}
//         <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//           <div className="flex justify-between items-center mb-5">
//             <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
//               Batch Performance
//             </h3>
//             <Package className="w-4 h-4 text-stone-600" />
//           </div>

//           {A.batchStats.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-40 text-stone-600">
//               <span className="text-4xl mb-3">🔥</span>
//               <p className="text-sm">No batches recorded yet</p>
//             </div>
//           ) : (
//             <div className="space-y-5">
//               {A.batchStats.map(b => {
//                 const soldPct = b.bags_after_burn > 0
//                   ? (b.sold / b.bags_after_burn) * 100
//                   : 0;
//                 return (
//                   <div key={b.id}>
//                     <div className="flex justify-between items-start mb-1">
//                       <div>
//                         <div className="text-white font-bold text-sm">
//                           {b.note || `Batch #${b.id}`}
//                         </div>
//                         <div className="text-stone-500 text-xs mt-0.5">
//                           {b.bags_after_burn} bags after burn · {LRD(b.cpb)}/bag cost
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className={`font-mono text-sm font-bold ${b.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                           {b.profit >= 0 ? '+' : ''}{LRD(b.profit)}
//                         </div>
//                         <div className="text-stone-600 text-[10px]">profit so far</div>
//                       </div>
//                     </div>
//                     <div className="flex gap-4 text-xs mb-2">
//                       <span className="text-stone-500">
//                         Cost: <span className="font-mono text-orange-400">{LRD(b.cost)}</span>
//                       </span>
//                       <span className="text-stone-500">
//                         Rev: <span className="font-mono text-green-400">{LRD(b.rev)}</span>
//                       </span>
//                       <span className="text-stone-500">
//                         {b.sold}/{b.bags_after_burn} sold
//                       </span>
//                     </div>
//                     <div className="h-1.5 bg-[#302b22] rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-gradient-to-r from-green-700 to-green-500 rounded-full transition-all duration-500"
//                         style={{ width: `${soldPct}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Sales Table */}
//       <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//         <div className="flex justify-between items-center mb-5">
//           <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
//             Recent Sales
//           </h3>
//           <TrendingUp className="w-4 h-4 text-stone-600" />
//         </div>

//         {sales.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-32 text-stone-600">
//             <span className="text-4xl mb-3">💰</span>
//             <p className="text-sm">No sales recorded yet</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-[#302b22]">
//                   {['Date & Time','Batch','Bags','Type','Price/Bag','Revenue','Note'].map(h => (
//                     <th key={h} className="text-left text-[9px] uppercase tracking-widest text-stone-600 pb-3 pr-4 whitespace-nowrap">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentSales.map(s => {
//                   const price = s.type === 'retail' ? 900 : 650;
//                   const batch = batches.find(b => b.id === s.batch_id);
//                   return (
//                     <tr key={s.id} className="border-b border-[#302b22]/50 hover:bg-orange-500/5 transition-colors">
//                       <td className="py-3 pr-4 font-mono text-xs text-stone-400 whitespace-nowrap">
//                         {fmtDT(s.date)}
//                       </td>
//                       <td className="py-3 pr-4 text-stone-400 text-xs whitespace-nowrap">
//                         {batch?.note || `Batch #${s.batch_id}`}
//                       </td>
//                       <td className="py-3 pr-4 font-mono font-bold text-white">
//                         {s.bags}
//                       </td>
//                       <td className="py-3 pr-4">
//                         <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
//                           s.type === 'retail'
//                             ? 'bg-green-500/10 text-green-400 border-green-500/25'
//                             : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
//                         }`}>
//                           {s.type}
//                         </span>
//                       </td>
//                       <td className="py-3 pr-4 font-mono text-stone-300 whitespace-nowrap">
//                         {LRD(price)}
//                       </td>
//                       <td className="py-3 pr-4 font-mono font-bold text-green-400 whitespace-nowrap">
//                         {LRD(s.bags * price)}
//                       </td>
//                       <td className="py-3 text-stone-500 text-xs">
//                         {s.note}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default Dashboard;

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { computeAnalytics, LRD, fmtDT, WS_PRICE, batchCost } from '../../data/store';
import StatCard from './StatCard';
import { TrendingUp, Package, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

// ── Custom Tooltip ──────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3
      shadow-xl text-xs">
      {label && (
        <div className="text-stone-400 mb-2 font-semibold">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
            style={{ background: p.color }} />
          <span className="text-stone-400">{p.name}:</span>
          <span className="text-white font-mono font-bold">
            {typeof p.value === 'number' && p.value > 1000
              ? LRD(p.value)
              : p.value
            }
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Pie custom label ─────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
      dominantBaseline="central" fontSize={10} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PIE_COLORS = [
  '#e8621a', '#f5932a', '#d4a017', '#c0392b',
  '#8e44ad', '#2980b9', '#27ae60', '#16a085',
];

const Dashboard = () => {
  const { batches, sales } = useApp();
  const A = useMemo(() => computeAnalytics(batches, sales), [batches, sales]);

  const recentSales = useMemo(() =>
    [...sales]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6),
    [sales]
  );

  // ── Chart data ──────────────────────────────────────────────────

  // 1. Revenue vs Cost vs Profit per batch
  const batchBarData = useMemo(() =>
    A.batchStats.map(b => ({
      name:    b.note ? b.note.split(' ')[0] + ' ' + (b.note.split(' ')[1] || '') : `Batch ${b.id}`,
      Revenue: b.rev,
      Cost:    b.cost,
      Profit:  b.profit,
    })),
    [A.batchStats]
  );

  // 2. Cost breakdown pie
  const costPieData = useMemo(() =>
    A.costBreakdown
      .filter(f => f.total > 0)
      .map(f => ({ name: f.label, value: f.total })),
    [A.costBreakdown]
  );

  // 3. Sales over time (cumulative daily)
  const salesLineData = useMemo(() => {
    if (!sales.length) return [];
    const sorted = [...sales].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let cumRev = 0;
    return sorted.map(s => {
      const rev = s.bags * (s.type === 'retail' ? 900 : 650);
      cumRev += rev;
      return {
        date: new Date(s.date).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short'
        }),
        Revenue: rev,
        'Cumulative': cumRev,
      };
    });
  }, [sales]);

  // 4. Bags sold per batch
  const bagsBatchData = useMemo(() =>
    A.batchStats.map(b => ({
      name: b.note
        ? b.note.split(' ')[0] + ' ' + (b.note.split(' ')[1] || '')
        : `Batch ${b.id}`,
      Sold: b.sold,
      Remaining: b.left,
    })),
    [A.batchStats]
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Dashboard
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Full business overview —{' '}
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric',
            month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Unsold alert */}
      {A.totalLeft > 0 && (
        <div className="flex items-start gap-3 bg-yellow-950/30
          border border-yellow-700/30 rounded-xl px-5 py-4">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-sm">
            You have <strong>{A.totalLeft} unsold bags</strong> across all
            batches. Potential wholesale revenue:{' '}
            <strong>{LRD(A.totalLeft * WS_PRICE)}</strong>
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Revenue"  value={LRD(A.totalRev)}    sub="All-time sales"       accent="orange" />
        <StatCard label="Total Costs"    value={LRD(A.totalCost)}   sub="All batch expenses"   accent="red"    />
        <StatCard label="Net Profit"     value={LRD(A.totalProfit)} sub={`${A.margin.toFixed(1)}% margin`} accent={A.totalProfit >= 0 ? 'green' : 'red'} />
        <StatCard label="Bags Status"    value={A.totalProd}        sub={`${A.totalSold} sold · ${A.totalLeft} left`} accent="blue" />
        <StatCard label="Weekly Revenue" value={LRD(A.weekRev)}     sub="Last 7 days"          accent="orange" />
        <StatCard label="Monthly Revenue"value={LRD(A.monthRev)}    sub="Last 30 days"         accent="gold"   />
      </div>

      {/* ── ROW 1: Revenue/Cost/Profit Bar + Cost Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar chart */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase
            tracking-widest mb-5">
            Revenue vs Cost vs Profit by Batch
          </h3>
          {batchBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-stone-600">
              No batch data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={batchBarData} barGap={4}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#302b22" />
                <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `L$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                <Bar dataKey="Revenue" fill="#27ae60" radius={[4,4,0,0]} />
                <Bar dataKey="Cost"    fill="#c0392b" radius={[4,4,0,0]} />
                <Bar dataKey="Profit"  fill="#e8621a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase
            tracking-widest mb-5">
            Cost Breakdown
          </h3>
          {costPieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-stone-600">
              No cost data yet
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {costPieData.map((_, i) => (
                      <Cell key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 min-w-max">
                {costPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-stone-400 text-[10px] leading-tight">
                      {d.name.length > 22
                        ? d.name.slice(0, 22) + '…'
                        : d.name}
                    </span>
                    <span className="text-stone-500 text-[10px] font-mono ml-auto pl-2">
                      {LRD(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: Cumulative Revenue Line + Bags Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line chart */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase
            tracking-widest mb-5">
            Sales Revenue Over Time
          </h3>
          {salesLineData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-stone-600">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesLineData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#302b22" />
                <XAxis dataKey="date"
                  tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `L$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                <Line
                  type="monotone" dataKey="Revenue"
                  stroke="#e8621a" strokeWidth={2}
                  dot={{ fill: '#e8621a', r: 4 }}
                  activeDot={{ r: 6 }} />
                <Line
                  type="monotone" dataKey="Cumulative"
                  stroke="#27ae60" strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#27ae60', r: 3 }}
                  activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bags stacked bar */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase
            tracking-widest mb-5">
            Bags Sold vs Remaining by Batch
          </h3>
          {bagsBatchData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-stone-600">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bagsBatchData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#302b22" />
                <XAxis dataKey="name"
                  tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 10 }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#78716c' }} />
                <Bar dataKey="Sold"      stackId="a"
                  fill="#27ae60" radius={[0,0,0,0]} />
                <Bar dataKey="Remaining" stackId="a"
                  fill="#302b22" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Batch Performance + Recent Sales ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Batch performance */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-stone-400 text-xs font-bold uppercase
              tracking-widest">
              Batch Performance
            </h3>
            <Package className="w-4 h-4 text-stone-600" />
          </div>
          {A.batchStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40
              text-stone-600">
              <span className="text-4xl mb-3">🔥</span>
              <p className="text-sm">No batches recorded yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {A.batchStats.map(b => {
                const soldPct = b.bags_after_burn > 0
                  ? (b.sold / b.bags_after_burn) * 100 : 0;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-white font-bold text-sm">
                          {b.note || `Batch #${b.id}`}
                        </div>
                        <div className="text-stone-500 text-xs mt-0.5">
                          {b.bags_after_burn} bags · {LRD(b.cpb)}/bag cost
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono text-sm font-bold ${
                          b.profit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {b.profit >= 0 ? '+' : ''}{LRD(b.profit)}
                        </div>
                        <div className="text-stone-600 text-[10px]">
                          profit so far
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs mb-2">
                      <span className="text-stone-500">
                        Cost:{' '}
                        <span className="font-mono text-orange-400">
                          {LRD(b.cost)}
                        </span>
                      </span>
                      <span className="text-stone-500">
                        Rev:{' '}
                        <span className="font-mono text-green-400">
                          {LRD(b.rev)}
                        </span>
                      </span>
                      <span className="text-stone-500">
                        {b.sold}/{b.bags_after_burn} sold
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#302b22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-700
                          to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-stone-400 text-xs font-bold uppercase
              tracking-widest">
              Recent Sales
            </h3>
            <TrendingUp className="w-4 h-4 text-stone-600" />
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32
              text-stone-600">
              <span className="text-4xl mb-3">💰</span>
              <p className="text-sm">No sales recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#302b22]">
                    {['Date','Batch','Bags','Type','Revenue'].map(h => (
                      <th key={h}
                        className="text-left text-[9px] uppercase tracking-widest
                          text-stone-600 pb-3 pr-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => {
                    const price = s.type === 'retail' ? 900 : 650;
                    const batch = batches.find(b => b.id === s.batch_id);
                    return (
                      <tr key={s.id}
                        className="border-b border-[#302b22]/50
                          hover:bg-orange-500/5 transition-colors">
                        <td className="py-2 pr-3 font-mono text-xs
                          text-stone-400 whitespace-nowrap">
                          {fmtDT(s.date)}
                        </td>
                        <td className="py-2 pr-3 text-stone-400 text-xs
                          whitespace-nowrap">
                          {batch?.note || `Batch #${s.batch_id}`}
                        </td>
                        <td className="py-2 pr-3 font-mono font-bold text-white">
                          {s.bags}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`text-[9px] font-bold uppercase
                            tracking-wider px-2 py-1 rounded-full border ${
                            s.type === 'retail'
                              ? 'bg-green-500/10 text-green-400 border-green-500/25'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="py-2 font-mono font-bold text-green-400
                          whitespace-nowrap">
                          {LRD(s.bags * price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;