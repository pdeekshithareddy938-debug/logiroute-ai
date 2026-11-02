import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  unit = '', 
  subtext, 
  icon: Icon, 
  color = 'blue',
  sparkline = false
}) {
  const colorMap = {
    blue: { iconBg: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]' },
    cyan: { iconBg: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]' },
    emerald: { iconBg: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]' },
    amber: { iconBg: 'bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]' },
    purple: { iconBg: 'bg-purple-950/80 text-purple-400 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)]' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all hover:border-slate-700/80 group">
      {/* Subtle top neon accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 opacity-60 ${
        color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
        color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
        color === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' :
        'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
      }`} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">{title}</p>
        <div className={`p-2 rounded-xl ${scheme.iconBg}`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-sm">{value}</span>
          {unit && <span className="text-xs font-mono font-bold text-slate-400">{unit}</span>}
        </div>

        {/* Mini Cyan Sparkline Chart */}
        {sparkline && (
          <div className="w-20 h-7 flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 60 24">
              <defs>
                <linearGradient id="cyanSparkline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points="0,22 10,18 20,20 30,12 40,15 50,7 60,4 60,24 0,24" fill="url(#cyanSparkline)" />
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,22 10,18 20,20 30,12 40,15 50,7 60,4"
              />
              <circle cx="60" cy="4" r="2.5" fill="#22d3ee" className="animate-pulse shadow-[0_0_6px_#22d3ee]" />
            </svg>
          </div>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 border-t border-slate-800/60 pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
