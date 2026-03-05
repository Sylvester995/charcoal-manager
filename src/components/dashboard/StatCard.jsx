import React from 'react';

const StatCard = ({ label, value, sub, accent = 'orange' }) => {
  const accents = {
    orange: 'from-orange-600 to-orange-400',
    green:  'from-green-700 to-green-500',
    red:    'from-red-700 to-red-500',
    gold:   'from-yellow-700 to-yellow-500',
    blue:   'from-blue-700 to-blue-500',
  };

  return (
    <div className="bg-[#161410] border border-[#302b22] rounded-xl p-5 relative overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accents[accent]}`} />

      <div className="text-[9px] uppercase tracking-[2px] text-stone-500 mb-3">
        {label}
      </div>
      <div className="font-mono text-2xl text-white leading-none">
        {value}
      </div>
      {sub && (
        <div className="text-xs text-stone-500 mt-2">{sub}</div>
      )}
    </div>
  );
};

export default StatCard;