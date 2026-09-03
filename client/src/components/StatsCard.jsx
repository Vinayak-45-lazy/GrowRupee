import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'sky', badge }) {
  const colorMap = {
    sky: 'from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30',
    emerald: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color]} border`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}
