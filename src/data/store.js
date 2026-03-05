// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const WS_PRICE = 650;  // Wholesale price per bag (L$)
export const RT_PRICE = 900;  // Retail price per bag (L$)

export const COST_FIELDS = [
  { key: 'personal_transportation', label: 'Transportation (travel to purchase site)', icon: '🚐' },
  { key: 'forest_rent',        label: 'Forest Rent / Purchase',                   icon: '🌳' },
  { key: 'gasoline',           label: 'Gasoline for Chainsaws',                   icon: '⛽' },
  { key: 'chainsaw_workers',   label: 'Chainsaw Operator Payments',               icon: '⚙️'  },
  { key: 'wood_packers',            label: 'Wood Packers Payment',                     icon: '👷' },
  { key: 'shelter',            label: 'Shelter (overnight monitoring)',           icon: '🏕️'  },
  { key: 'feeding',            label: 'Feeding Cost for Workers',                 icon: '🍽️'  },
  { key: 'charcoal_transportation', label: 'Transportation of Charcoal',               icon: '🚛' },
];

export const EMPTY_BATCH = {
  date:                new Date().toISOString().slice(0, 10),
  note:                '',
  bags_produced:       '',
  bags_after_burn:     '',
  personal_transportation:  '',
  forest_rent:         '',
  gasoline:            '',
  chainsaw_workers:    '',
  wood_packers:             '',
  shelter:             '',
  feeding:             '',
  charcoal_transportation:  '',
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
export const SEED_BATCHES = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    note: 'Batch #1 — Bong County',
    bags_produced:      80,
    bags_after_burn:    75,
    personal_transportation: 2500,
    forest_rent:        8000,
    gasoline:           3200,
    chainsaw_workers:   6000,
    wood_packers:            4000,
    shelter:            1500,
    feeding:            2800,
    charcoal_transportation: 3500,
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    note: 'Batch #2 — Margibi',
    bags_produced:      100,
    bags_after_burn:    94,
    personal_transportation: 3000,
    forest_rent:        9000,
    gasoline:           3500,
    chainsaw_workers:   7000,
    wood_packers:            4500,
    shelter:            1800,
    feeding:            3200,
    charcoal_transportation: 4000,
  },
];

export const SEED_SALES = [
  {
    id: 1,
    date:     new Date(Date.now() - 86400000 * 11).toISOString(),
    batch_id: 1,
    bags:     40,
    type:     'wholesale',
    note:     'Buyer A — site',
  },
  {
    id: 2,
    date:     new Date(Date.now() - 86400000 * 4).toISOString(),
    batch_id: 2,
    bags:     60,
    type:     'wholesale',
    note:     'Buyer B — site',
  },
  {
    id: 3,
    date:     new Date(Date.now() - 86400000 * 2).toISOString(),
    batch_id: 2,
    bags:     20,
    type:     'wholesale',
    note:     'Buyer C',
  },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

// Format number as Liberian Dollar
export const LRD = (n) =>
  `L$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits:  0,
    maximumFractionDigits:  0,
  })}`;

// Format date + time
export const fmtDT = (d) =>
  new Date(d).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });

// Format date only
export const fmtD = (d) =>
  new Date(d).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });

// Total production cost for a batch
export const batchCost = (batch) =>
  COST_FIELDS.reduce((sum, f) => sum + Number(batch[f.key] || 0), 0);

// Total revenue from sales for a specific batch
export const batchRevenue = (sales, batchId) =>
  sales
    .filter(s => s.batch_id === batchId)
    .reduce((sum, s) => sum + s.bags * (s.type === 'retail' ? RT_PRICE : WS_PRICE), 0);

// Total bags sold from a specific batch
export const batchSold = (sales, batchId) =>
  sales
    .filter(s => s.batch_id === batchId)
    .reduce((sum, s) => sum + s.bags, 0);

// Full analytics computed from batches + sales
export const computeAnalytics = (batches, sales) => {
  const totalCost    = batches.reduce((s, b) => s + batchCost(b), 0);
  const totalRev     = sales.reduce((s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0);
  const totalProfit  = totalRev - totalCost;
  const totalProd    = batches.reduce((s, b) => s + Number(b.bags_after_burn || 0), 0);
  const totalSold    = sales.reduce((s, x) => s + x.bags, 0);
  const totalLeft    = totalProd - totalSold;
  const margin       = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

  const now          = Date.now();
  const weekRev      = sales
    .filter(s => now - new Date(s.date) < 86400000 * 7)
    .reduce((s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0);
  const monthRev     = sales
    .filter(s => now - new Date(s.date) < 86400000 * 30)
    .reduce((s, x) => s + x.bags * (x.type === 'retail' ? RT_PRICE : WS_PRICE), 0);

  const costBreakdown = COST_FIELDS.map(f => ({
    ...f,
    total: batches.reduce((s, b) => s + Number(b[f.key] || 0), 0),
  }));

  const batchStats = batches.map(b => {
    const cost   = batchCost(b);
    const rev    = batchRevenue(sales, b.id);
    const sold   = batchSold(sales, b.id);
    const left   = Number(b.bags_after_burn || 0) - sold;
    const profit = rev - cost;
    const cpb    = b.bags_after_burn > 0 ? cost / b.bags_after_burn : 0;
    return { ...b, cost, rev, profit, sold, left, cpb };
  });

  return {
    totalCost,
    totalRev,
    totalProfit,
    totalProd,
    totalSold,
    totalLeft,
    margin,
    weekRev,
    monthRev,
    costBreakdown,
    batchStats,
    projMonthly: (weekRev / 7) * 30,
    projAnnual:  (weekRev / 7) * 365,
  };
};