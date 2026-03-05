import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LRD, fmtD, WS_PRICE, RT_PRICE, batchCost, batchSold } from '../../data/store';
import { CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

const RecordSales = () => {
  const { batches, sales, addSale } = useApp();
  const { user } = useAuth();

  const [form, setForm] = useState({
    batch_id: '',
    bags:     '',
    type:     'wholesale',
    buyer:    '',
    date:     new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState(null);

  // Sale preview
  const preview = useMemo(() => {
    if (!form.batch_id || !form.bags) return null;
    const price   = form.type === 'retail' ? RT_PRICE : WS_PRICE;
    const revenue = Number(form.bags) * price;
    const batch   = batches.find(b => b.id === Number(form.batch_id));
    const cpb     = batch
      ? batchCost(batch) / Number(batch.bags_after_burn || 1)
      : 0;
    const profit  = revenue - cpb * Number(form.bags);
    const left    = batch
      ? Number(batch.bags_after_burn) - batchSold(sales, batch.id)
      : 0;
    return { price, revenue, profit, left };
  }, [form, batches, sales]);

  // Block viewer
  if (user?.role === 'viewer') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
        <p className="text-white font-bold text-lg">Access Denied</p>
        <p className="text-sm mt-1">
          You do not have permission to record sales.
        </p>
      </div>
    );
  }

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.batch_id) {
      setMsg({ ok: false, text: 'Please select a batch.' });
      return;
    }
    if (!form.bags || Number(form.bags) <= 0) {
      setMsg({ ok: false, text: 'Please enter a valid number of bags sold.' });
      return;
    }

    const batch = batches.find(b => b.id === Number(form.batch_id));
    if (!batch) {
      setMsg({ ok: false, text: 'Selected batch not found.' });
      return;
    }

    const remaining = Number(batch.bags_after_burn) - batchSold(sales, batch.id);
    if (Number(form.bags) > remaining) {
      setMsg({
        ok: false,
        text: `Only ${remaining} bags remaining in this batch.`
      });
      return;
    }

    setSubmitting(true);
    const result = await addSale({
      batch_id: Number(form.batch_id),
      bags:     Number(form.bags),
      type:     form.type,
      buyer:    form.buyer || '',
      date:     form.date,
    });

    if (result.success) {
      setMsg({ ok: true, text: 'Sale recorded successfully!' });
      setForm(f => ({ ...f, bags: '', buyer: '' }));
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ ok: false, text: result.message || 'Failed to save sale.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Record Sale
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Log bags sold from any batch. Timestamps are recorded automatically.
        </p>
      </div>

      {/* Wholesale notice */}
      <div className="flex items-start gap-3 bg-orange-950/20 border
        border-orange-700/25 rounded-xl px-5 py-4">
        <ShoppingBag className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-orange-300 text-sm">
          <strong>Currently selling wholesale</strong> at{' '}
          <span className="font-mono text-orange-400">L$650/bag</span> at
          production site — avoiding transport to city.
          Retail price{' '}
          <span className="font-mono text-green-400">L$900/bag</span>{' '}
          available when transporting to Monrovia.
        </p>
      </div>

      {/* Message */}
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
            Sale Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Batch selector */}
            <div className="lg:col-span-1">
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Select Batch
              </label>
              <select
                value={form.batch_id}
                onChange={e => update('batch_id', e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                <option value="">-- Choose a batch --</option>
                {batches.map(b => {
                  const left = Number(b.bags_after_burn) - batchSold(sales, b.id);
                  return (
                    <option key={b.id} value={b.id} disabled={left === 0}>
                      {b.note || `Batch #${b.id}`} — {left} bags left
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sale date */}
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Sale Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              />
            </div>

            {/* Bags sold */}
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Bags Sold
              </label>
              <input
                type="number"
                min="1"
                value={form.bags}
                onChange={e => update('bags', e.target.value)}
                placeholder="0"
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm font-mono placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>

            {/* Sale type */}
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Sale Type
              </label>
              <select
                value={form.type}
                onChange={e => update('type', e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                <option value="wholesale">Wholesale — L$650/bag (at site)</option>
                <option value="retail">Retail — L$900/bag (city)</option>
              </select>
            </div>

            {/* Buyer note */}
            <div className="lg:col-span-2">
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Buyer / Note
              </label>
              <input
                type="text"
                value={form.buyer}
                onChange={e => update('buyer', e.target.value)}
                placeholder="Buyer name, company, or any note..."
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sale preview */}
        {preview && (
          <div className="bg-[#161410] border border-green-700/30 rounded-xl p-6">
            <h3 className="text-green-400 text-xs font-bold uppercase
              tracking-widest mb-5">
              Sale Preview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Price / Bag',    value: LRD(preview.price),                        color: 'text-orange-400' },
                { label: 'Total Revenue',  value: LRD(preview.revenue),                      color: 'text-green-400'  },
                { label: 'Est. Profit',    value: LRD(preview.profit),                       color: preview.profit >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Bags Remaining', value: preview.left - Number(form.bags || 0),     color: 'text-blue-400'   },
              ].map(x => (
                <div key={x.label}
                  className="bg-[#1e1b16] border border-[#302b22] rounded-lg p-4">
                  <div className="text-[9px] uppercase tracking-widest
                    text-stone-600 mb-2">
                    {x.label}
                  </div>
                  <div className={`font-mono text-xl font-bold ${x.color}`}>
                    {x.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50
              disabled:cursor-not-allowed text-white font-bold px-8 py-3
              rounded-xl transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Record Sale'}
          </button>
          <button
            type="button"
            onClick={() => { setForm(f => ({ ...f, bags: '', buyer: '' })); setMsg(null); }}
            className="bg-transparent border border-[#302b22] text-stone-500
              hover:text-white hover:border-stone-500 font-medium px-6 py-3
              rounded-xl transition-colors"
          >
            Clear
          </button>
        </div>

      </form>

      {/* Available stock table */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <h3 className="text-stone-400 text-xs font-bold uppercase
          tracking-widest mb-5">
          Available Stock to Sell
        </h3>
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32
            text-stone-600">
            <span className="text-4xl mb-3">📦</span>
            <p className="text-sm">No batches recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#302b22]">
                  {['Batch','Date','After Burn','Sold','Remaining',
                    'WS Revenue','RT Revenue'].map(h => (
                    <th key={h}
                      className="text-left text-[9px] uppercase tracking-widest
                        text-stone-600 pb-3 pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const sold = batchSold(sales, b.id);
                  const left = Number(b.bags_after_burn) - sold;
                  return (
                    <tr key={b.id}
                      className="border-b border-[#302b22]/50
                        hover:bg-orange-500/5 transition-colors">
                      <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">
                        {b.note || `Batch #${b.id}`}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-stone-400 whitespace-nowrap">
                        {fmtD(b.date)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-white">
                        {b.bags_after_burn}
                      </td>
                      <td className="py-3 pr-4 font-mono text-green-400 font-bold">
                        {sold}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`font-mono font-bold ${
                          left > 0 ? 'text-orange-400' : 'text-stone-600'
                        }`}>
                          {left}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-yellow-500 whitespace-nowrap">
                        {LRD(left * WS_PRICE)}
                      </td>
                      <td className="py-3 font-mono text-blue-400 whitespace-nowrap">
                        {LRD(left * RT_PRICE)}
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
  );
};

export default RecordSales;