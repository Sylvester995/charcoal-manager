// import React, { useState, useMemo } from 'react';
// import { useApp } from '../../context/AppContext';
// import { useAuth } from '../../context/AuthContext';
// import {
//   COST_FIELDS, EMPTY_BATCH, LRD, WS_PRICE, RT_PRICE
// } from '../../data/store';
// import { CheckCircle, AlertCircle, FlameKindling } from 'lucide-react';

// const RecordBatch = () => {
//   const { addBatch } = useApp();
//   const { user }     = useAuth();
//   const [form, setForm]       = useState(EMPTY_BATCH);
//   const [success, setSuccess] = useState(false);
//   const [error, setError]     = useState('');

//   // Live preview calculations — must be before any early returns
//   const preview = useMemo(() => {
//     const totalCost = COST_FIELDS.reduce(
//       (s, f) => s + Number(form[f.key] || 0), 0
//     );
//     const bags     = Number(form.bags_after_burn || 0);
//     const cpb      = bags > 0 ? totalCost / bags : 0;
//     const profitWS = WS_PRICE - cpb;
//     const profitRT = RT_PRICE - cpb;
//     const revWS    = bags * WS_PRICE;
//     const revRT    = bags * RT_PRICE;
//     return { totalCost, bags, cpb, profitWS, profitRT, revWS, revRT };
//   }, [form]);

//   // Block viewer role — AFTER all hooks
//   if (user?.role === 'viewer') {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-stone-500">
//         <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
//         <p className="text-white font-bold text-lg">Access Denied</p>
//         <p className="text-sm mt-1">
//           You do not have permission to record batches.
//         </p>
//       </div>
//     );
//   }

//   const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     if (!form.bags_produced) {
//       setError('Please enter the number of bags produced.');
//       return;
//     }
//     if (!form.bags_after_burn) {
//       setError('Please enter total bags after burn.');
//       return;
//     }

//     const batch = {
//       ...form,
//       bags_produced:   Number(form.bags_produced),
//       bags_after_burn: Number(form.bags_after_burn),
//       date:            new Date(form.date).toISOString(),
//     };

//     COST_FIELDS.forEach(f => {
//       batch[f.key] = Number(form[f.key] || 0);
//     });

//     addBatch(batch);
//     setForm(EMPTY_BATCH);
//     setSuccess(true);
//     setTimeout(() => setSuccess(false), 3000);
//   };

//   return (
//     <div className="space-y-6 max-w-5xl">

//       {/* Page header */}
//       <div>
//         <h2 className="text-3xl font-black text-white tracking-tight">
//           Record New Batch
//         </h2>
//         <p className="text-stone-500 text-sm mt-1">
//           Enter all production costs for this burn. All amounts in Liberian
//           Dollars (L$). Figures can vary each batch.
//         </p>
//       </div>

//       {/* Success message */}
//       {success && (
//         <div className="flex items-center gap-3 bg-green-950/40 border border-green-700/40 rounded-xl px-5 py-4">
//           <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
//           <p className="text-green-400 font-medium">
//             Batch saved successfully!
//           </p>
//         </div>
//       )}

//       {/* Error message */}
//       {error && (
//         <div className="flex items-center gap-3 bg-red-950/40 border border-red-700/40 rounded-xl px-5 py-4">
//           <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
//           <p className="text-red-400">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">

//         {/* Batch details */}
//         <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//           <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
//             Batch Details
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
//                 Batch Date
//               </label>
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={e => update('date', e.target.value)}
//                 className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-600 transition-colors"
//               />
//             </div>
//             <div>
//               <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
//                 Batch Label / Location
//               </label>
//               <input
//                 type="text"
//                 value={form.note}
//                 onChange={e => update('note', e.target.value)}
//                 placeholder="e.g. Bong County, Batch #3"
//                 className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Production costs */}
//         <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//           <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">
//             Production Costs (L$)
//           </h3>
//           <p className="text-stone-600 text-xs mb-5">
//             Enter the actual amount spent for each category this batch.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {COST_FIELDS.map(f => (
//               <div key={f.key}>
//                 <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
//                   {f.icon} {f.label}
//                 </label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 text-sm font-mono">
//                     L$
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form[f.key]}
//                     onChange={e => update(f.key, e.target.value)}
//                     placeholder="0"
//                     className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg pl-9 pr-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Running total */}
//           <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#302b22]">
//             <span className="text-stone-400 text-sm font-semibold">
//               Total Production Cost
//             </span>
//             <span className="font-mono text-red-400 text-xl font-bold">
//               {LRD(preview.totalCost)}
//             </span>
//           </div>
//         </div>

//         {/* Bag count */}
//         <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
//           <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
//             Bag Count
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
//                 🛄 Bags Produced (Before Burn)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.bags_produced}
//                 onChange={e => update('bags_produced', e.target.value)}
//                 placeholder="0"
//                 className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
//               />
//               <p className="text-[10px] text-stone-600 mt-1">
//                 Total bags of wood packed for burning
//               </p>
//             </div>
//             <div>
//               <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
//                 🔥 Total Bags After Burn
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.bags_after_burn}
//                 onChange={e => update('bags_after_burn', e.target.value)}
//                 placeholder="0"
//                 className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
//               />
//               <p className="text-[10px] text-stone-600 mt-1">
//                 Actual charcoal bags ready to sell
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Live preview */}
//         {preview.bags > 0 && (
//           <div className="bg-[#161410] border border-orange-700/30 rounded-xl p-6">
//             <div className="flex items-center gap-2 mb-5">
//               <FlameKindling className="w-4 h-4 text-orange-400" />
//               <h3 className="text-orange-400 text-xs font-bold uppercase tracking-widest">
//                 Live Cost Preview
//               </h3>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {[
//                 { label: 'Total Cost',             value: LRD(preview.totalCost), color: 'text-red-400'    },
//                 { label: 'Cost / Bag',             value: LRD(preview.cpb),       color: 'text-orange-400' },
//                 { label: 'Profit/Bag (Wholesale)', value: LRD(preview.profitWS),  color: preview.profitWS >= 0 ? 'text-green-400' : 'text-red-400' },
//                 { label: 'Profit/Bag (Retail)',    value: LRD(preview.profitRT),  color: preview.profitRT >= 0 ? 'text-green-400' : 'text-red-400' },
//                 { label: 'Rev if All Sold (WS)',   value: LRD(preview.revWS),     color: 'text-yellow-400' },
//                 { label: 'Rev if All Sold (RT)',   value: LRD(preview.revRT),     color: 'text-blue-400'   },
//               ].map(x => (
//                 <div
//                   key={x.label}
//                   className="bg-[#1e1b16] border border-[#302b22] rounded-lg p-4"
//                 >
//                   <div className="text-[9px] uppercase tracking-widest text-stone-600 mb-2">
//                     {x.label}
//                   </div>
//                   <div className={`font-mono text-lg font-bold ${x.color}`}>
//                     {x.value}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Submit buttons */}
//         <div className="flex items-center gap-4">
//           <button
//             type="submit"
//             className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
//           >
//             <FlameKindling className="w-4 h-4" />
//             Save Batch Record
//           </button>
//           <button
//             type="button"
//             onClick={() => setForm(EMPTY_BATCH)}
//             className="bg-transparent border border-[#302b22] text-stone-500 hover:text-white hover:border-stone-500 font-medium px-6 py-3 rounded-xl transition-colors"
//           >
//             Clear Form
//           </button>
//         </div>

//       </form>
//     </div>
//   );
// };

// export default RecordBatch;

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  COST_FIELDS, EMPTY_BATCH, LRD, WS_PRICE, RT_PRICE
} from '../../data/store';
import { CheckCircle, AlertCircle, FlameKindling } from 'lucide-react';

const RecordBatch = () => {
  const { addBatch } = useApp();
  const { user }     = useAuth();
  const [form, setForm]             = useState(EMPTY_BATCH);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState(null);

  const preview = useMemo(() => {
    const totalCost = COST_FIELDS.reduce(
      (s, f) => s + Number(form[f.key] || 0), 0
    );
    const bags     = Number(form.bags_after_burn || 0);
    const cpb      = bags > 0 ? totalCost / bags : 0;
    const profitWS = WS_PRICE - cpb;
    const profitRT = RT_PRICE - cpb;
    const revWS    = bags * WS_PRICE;
    const revRT    = bags * RT_PRICE;
    return { totalCost, bags, cpb, profitWS, profitRT, revWS, revRT };
  }, [form]);

  if (user?.role === 'viewer') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
        <p className="text-white font-bold text-lg">Access Denied</p>
        <p className="text-sm mt-1">
          You do not have permission to record batches.
        </p>
      </div>
    );
  }

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.bags_produced || !form.bags_after_burn) {
      setMsg({ ok: false, text: 'Please enter bags produced and bags after burn.' });
      return;
    }
    setSubmitting(true);
    const result = await addBatch({
      ...form,
      bags_produced:           Number(form.bags_produced),
      bags_after_burn:         Number(form.bags_after_burn),
      personal_transportation: Number(form.personal_transportation || 0),
      forest_rent:             Number(form.forest_rent        || 0),
      gasoline:                Number(form.gasoline           || 0),
      chainsaw_workers:        Number(form.chainsaw_workers   || 0),
      wood_packers:            Number(form.wood_packers       || 0),
      shelter:                 Number(form.shelter            || 0),
      feeding:                 Number(form.feeding            || 0),
      charcoal_transportation: Number(form.charcoal_transportation || 0),
    });

    if (result.success) {
      setMsg({ ok: true, text: 'Batch saved successfully!' });
      setForm(EMPTY_BATCH);
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ ok: false, text: result.message || 'Failed to save batch.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">

      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Record New Batch
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Enter all production costs for this burn. All amounts in Liberian
          Dollars (L$). Figures can vary each batch.
        </p>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-4 ${
          msg.ok
            ? 'bg-green-950/40 border border-green-700/40'
            : 'bg-red-950/40 border border-red-700/40'
        }`}>
          {msg.ok
            ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          }
          <p className={msg.ok ? 'text-green-400 font-medium' : 'text-red-400'}>
            {msg.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
            Batch Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                Batch Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                Batch Label / Location
              </label>
              <input
                type="text"
                value={form.note}
                onChange={e => update('note', e.target.value)}
                placeholder="e.g. Bong County, Batch #3"
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">
            Production Costs (L$)
          </h3>
          <p className="text-stone-600 text-xs mb-5">
            Enter the actual amount spent for each category this batch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COST_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                  {f.icon} {f.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 text-sm font-mono">
                    L$
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form[f.key]}
                    onChange={e => update(f.key, e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg pl-9 pr-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#302b22]">
            <span className="text-stone-400 text-sm font-semibold">
              Total Production Cost
            </span>
            <span className="font-mono text-red-400 text-xl font-bold">
              {LRD(preview.totalCost)}
            </span>
          </div>
        </div>

        <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
            Bag Count
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                🛄 Bags Produced (Before Burn)
              </label>
              <input
                type="number"
                min="0"
                value={form.bags_produced}
                onChange={e => update('bags_produced', e.target.value)}
                placeholder="0"
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
              />
              <p className="text-[10px] text-stone-600 mt-1">
                Total bags of wood packed for burning
              </p>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                🔥 Total Bags After Burn
              </label>
              <input
                type="number"
                min="0"
                value={form.bags_after_burn}
                onChange={e => update('bags_after_burn', e.target.value)}
                placeholder="0"
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-stone-700 focus:outline-none focus:border-orange-600 transition-colors"
              />
              <p className="text-[10px] text-stone-600 mt-1">
                Actual charcoal bags ready to sell
              </p>
            </div>
          </div>
        </div>

        {preview.bags > 0 && (
          <div className="bg-[#161410] border border-orange-700/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <FlameKindling className="w-4 h-4 text-orange-400" />
              <h3 className="text-orange-400 text-xs font-bold uppercase tracking-widest">
                Live Cost Preview
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Cost',             value: LRD(preview.totalCost), color: 'text-red-400'    },
                { label: 'Cost / Bag',             value: LRD(preview.cpb),       color: 'text-orange-400' },
                { label: 'Profit/Bag (Wholesale)', value: LRD(preview.profitWS),  color: preview.profitWS >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Profit/Bag (Retail)',    value: LRD(preview.profitRT),  color: preview.profitRT >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Rev if All Sold (WS)',   value: LRD(preview.revWS),     color: 'text-yellow-400' },
                { label: 'Rev if All Sold (RT)',   value: LRD(preview.revRT),     color: 'text-blue-400'   },
              ].map(x => (
                <div key={x.label}
                  className="bg-[#1e1b16] border border-[#302b22] rounded-lg p-4">
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
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50
              disabled:cursor-not-allowed text-white font-bold px-8 py-3
              rounded-xl transition-colors flex items-center gap-2"
          >
            <FlameKindling className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Batch Record'}
          </button>
          <button
            type="button"
            onClick={() => { setForm(EMPTY_BATCH); setMsg(null); }}
            className="bg-transparent border border-[#302b22] text-stone-500
              hover:text-white hover:border-stone-500 font-medium px-6 py-3
              rounded-xl transition-colors"
          >
            Clear Form
          </button>
        </div>

      </form>
    </div>
  );
};

export default RecordBatch;