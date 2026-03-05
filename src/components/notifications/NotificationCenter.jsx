import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LRD, WS_PRICE, batchCost, batchRevenue, batchSold } from '../../data/store';

const NotificationCenter = () => {
  const { batches, sales } = useApp();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    } catch { return []; }
  });

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
  };

  const dismissAll = () => {
    const ids = notifications.map(n => n.id);
    const updated = [...dismissed, ...ids];
    setDismissed(updated);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
    setOpen(false);
  };

  // Generate smart notifications from business data
  const notifications = useMemo(() => {
    const notes = [];

    batches.forEach(b => {
      const sold = batchSold(sales, b.id);
      const left = Number(b.bags_after_burn) - sold;
      const cost = batchCost(b);
      const rev  = batchRevenue(sales, b.id);
      const profit = rev - cost;

      // Unsold bags alert
      if (left > 0) {
        notes.push({
          id:      `unsold-${b.id}`,
          type:    'warning',
          icon:    Package,
          title:   `${left} bags unsold`,
          message: `${b.note || `Batch #${b.id}`} has ${left} unsold bags worth ${LRD(left * WS_PRICE)} at wholesale.`,
          time:    'Ongoing',
        });
      }

      // Profitable batch celebration
      if (profit > 0 && sold > 0) {
        notes.push({
          id:      `profit-${b.id}`,
          type:    'success',
          icon:    TrendingUp,
          title:   'Batch is profitable!',
          message: `${b.note || `Batch #${b.id}`} has generated ${LRD(profit)} profit so far.`,
          time:    fmtAgo(b.date),
        });
      }

      // Batch fully sold
      if (left === 0 && sold > 0) {
        notes.push({
          id:      `sold-out-${b.id}`,
          type:    'success',
          icon:    CheckCircle,
          title:   'Batch fully sold!',
          message: `${b.note || `Batch #${b.id}`} is completely sold out. Final profit: ${LRD(profit)}.`,
          time:    fmtAgo(b.date),
        });
      }

      // Loss alert
      if (profit < 0 && sold > 0) {
        notes.push({
          id:      `loss-${b.id}`,
          type:    'danger',
          icon:    AlertTriangle,
          title:   'Batch running at a loss',
          message: `${b.note || `Batch #${b.id}`} is currently at ${LRD(profit)}. Sell remaining ${left} bags to recover.`,
          time:    fmtAgo(b.date),
        });
      }
    });

    // No batches at all
    if (batches.length === 0) {
      notes.push({
        id:      'no-batches',
        type:    'info',
        icon:    Package,
        title:   'No batches recorded yet',
        message: 'Start by recording your first charcoal production batch.',
        time:    'Now',
      });
    }

    // Recent high sales day
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter(s => s.date?.slice(0, 10) === today);
    if (todaySales.length > 0) {
      const todayRev = todaySales.reduce(
        (s, x) => s + x.bags * (x.type === 'retail' ? 900 : 650), 0
      );
      notes.push({
        id:      `today-${today}`,
        type:    'success',
        icon:    TrendingUp,
        title:   "Today's sales",
        message: `You've recorded ${todaySales.length} sale(s) today totalling ${LRD(todayRev)}.`,
        time:    'Today',
      });
    }

    // Filter out dismissed
    return notes.filter(n => !dismissed.includes(n.id));
  }, [batches, sales, dismissed]);

  const typeStyles = {
    warning: {
      bg:     'bg-yellow-950/30',
      border: 'border-yellow-700/30',
      icon:   'text-yellow-400',
      badge:  'bg-yellow-500',
    },
    success: {
      bg:     'bg-green-950/30',
      border: 'border-green-700/30',
      icon:   'text-green-400',
      badge:  'bg-green-500',
    },
    danger: {
      bg:     'bg-red-950/30',
      border: 'border-red-700/30',
      icon:   'text-red-400',
      badge:  'bg-red-500',
    },
    info: {
      bg:     'bg-blue-950/30',
      border: 'border-blue-700/30',
      icon:   'text-blue-400',
      badge:  'bg-blue-500',
    },
  };

  return (
    <div className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-[#1e1b16] border
          border-[#302b22] flex items-center justify-center
          hover:border-orange-600/50 transition-colors"
      >
        <Bell className="w-4 h-4 text-stone-400" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500
            rounded-full text-[9px] font-bold text-white flex items-center
            justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-80 md:w-96 bg-[#161410]
            border border-[#302b22] rounded-2xl shadow-2xl z-50 overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4
              border-b border-[#302b22]">
              <div>
                <div className="text-white font-bold text-sm">Notifications</div>
                <div className="text-stone-500 text-xs mt-0.5">
                  {notifications.length === 0
                    ? 'All caught up!'
                    : `${notifications.length} active alert${notifications.length > 1 ? 's' : ''}`
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={dismissAll}
                    className="text-[10px] text-stone-500 hover:text-orange-400
                      transition-colors px-2 py-1 rounded-lg
                      hover:bg-orange-500/10"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-stone-600 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center
                  py-12 text-stone-600">
                  <Bell className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium text-stone-500">
                    All caught up!
                  </p>
                  <p className="text-xs mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map(n => {
                    const s = typeStyles[n.type] || typeStyles.info;
                    const Icon = n.icon;
                    return (
                      <div key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-xl
                          border ${s.bg} ${s.border} relative group`}>

                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center
                          justify-center flex-shrink-0 ${s.bg}`}>
                          <Icon className={`w-4 h-4 ${s.icon}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs font-bold
                            leading-tight">
                            {n.title}
                          </div>
                          <div className="text-stone-400 text-[11px] mt-1
                            leading-relaxed">
                            {n.message}
                          </div>
                          <div className="text-stone-600 text-[10px] mt-1.5">
                            {n.time}
                          </div>
                        </div>

                        {/* Dismiss */}
                        <button
                          onClick={() => dismiss(n.id)}
                          className="text-stone-700 hover:text-white
                            transition-colors flex-shrink-0 opacity-0
                            group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#302b22]">
              <p className="text-[10px] text-stone-600 text-center">
                Notifications are based on your live business data
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper — format date as "X days ago"
const fmtAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export default NotificationCenter;