import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Zap, 
  BatteryCharging, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  Award, 
  RefreshCw, 
  Radio,
  Flame,
  Gauge
} from 'lucide-react';
import dispatchAPI from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await dispatchAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="py-24 text-center text-slate-400 font-mono">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Aggregating Dark Store Telemetry & TSP Curves...
        </p>
      </div>
    );
  }

  const { summary, dailyVolumes, hourlyDistribution, corridorBreakdown, courierLeaderboard } = analytics;

  const maxDayTotal = Math.max(...dailyVolumes.map(d => d.total), 120);

  return (
    <div className="space-y-6">
      {/* Page Header — Midnight Cyberpunk Cockpit Card with Blue/Cyan Top Accent */}
      <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-cyan-500/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-black text-white tracking-wide">
              FLEET INTELLIGENCE // ANALYTICS HUD
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              LIVE TELEMETRY STREAM
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Executive cockpit overview of 10-minute dark store SLAs, cumulative 2-Opt savings, and EV fleet battery curves
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 text-xs font-mono font-bold shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH TELEMETRY</span>
        </button>
      </div>

      {/* Top 4 KPI Executive Metric Cards with Top Accent Lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 10-Min SLA Adherence (Green/Emerald Accent) */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-emerald-500/80 rounded-2xl p-5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              10-Min SLA Adherence
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {summary.slaAdherencePct}%
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 inline-flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {summary.slaAdherenceDelta}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500">Target: ≥92% threshold</p>
        </div>

        {/* Card 2: Cumulative TSP Savings (Blue/Cyan Accent) */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-cyan-500/80 rounded-2xl p-5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Cumulative TSP Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-950/70 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {summary.totalDistanceSavedKm} <span className="text-lg font-bold text-slate-400">km</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 inline-flex items-center">
              -{summary.distanceSavedPct}% cut
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500">2-Opt heuristic edge reduction</p>
        </div>

        {/* Card 3: EV Fleet Battery Efficiency (Orange/Amber Accent) */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-amber-500/80 rounded-2xl p-5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              EV Battery Efficiency
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/70 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {summary.fleetBatteryEfficiency}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {summary.fleetBatteryHealthPct}% health
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500">Discharge rate per corridor km</p>
        </div>

        {/* Card 4: CO2 Offset (Violet/Purple Accent) */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-indigo-500/80 rounded-2xl p-5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              CO2 Carbon Offset
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.3)]">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {summary.carbonOffsetKg} <span className="text-lg font-bold text-slate-400">kg</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Zero Direct Emiss.
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500">~{summary.treesEquivalent} urban trees offset equiv</p>
        </div>
      </div>

      {/* Styled Dark-Theme Charts Grid (Neon Gradients & Glowing Gridlines) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Delivery Volume Bar Chart with Blue/Cyan Top Accent */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-cyan-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">DAILY DELIVERY VOLUME</h2>
              <p className="text-xs text-slate-400 mt-0.5">Dispatched packages vs on-time SLA fulfilled over past 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_#06b6d4]" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#10b981]" /> On-Time
              </span>
            </div>
          </div>

          {/* SVG Bar Chart Visualization with Glow Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {dailyVolumes.map((item, idx) => {
              const totalHeightPct = (item.total / maxDayTotal) * 100;
              const onTimeHeightPct = (item.onTime / maxDayTotal) * 100;
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-slate-950 text-slate-100 text-[11px] font-mono py-1 px-2.5 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap">
                      <span>{item.day}: {item.onTime}/{item.total} on-time ({Math.round((item.onTime / item.total) * 100)}%)</span>
                    </div>
                  )}

                  {/* Bars Container */}
                  <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-full">
                    {/* Dispatched Total Bar */}
                    <div
                      style={{ height: `${totalHeightPct}%` }}
                      className="w-1/2 bg-cyan-500/70 hover:bg-cyan-400 rounded-t-md transition-all shadow-[0_0_10px_rgba(6,182,212,0.35)]"
                    />
                    {/* On-Time Fulfilled Bar */}
                    <div
                      style={{ height: `${onTimeHeightPct}%` }}
                      className="w-1/2 bg-emerald-500/70 hover:bg-emerald-400 rounded-t-md transition-all shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-xs font-mono font-bold text-slate-300 mt-2 block">
                    {item.day}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    {item.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Hourly Order Distribution Peak Graph with Emerald Top Accent */}
        <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-emerald-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">HOURLY SURGE DISTRIBUTION</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick-commerce peak analysis: Lunch Sprint & Evening Dinner Rush</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/70 text-amber-400 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
              PEAK: 18:00 (86 NODES)
            </span>
          </div>

          {/* Curved SVG Area Graph with Neon Cyan/Emerald Gradients & Glowing Guidelines */}
          <div className="h-64 flex flex-col justify-between pt-2">
            <div className="relative flex-1 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="#10b981" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Glowing Grid Guidelines */}
                <line x1="0" y1="45" x2="500" y2="45" stroke="#1e293b" strokeDasharray="4,4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#1e293b" strokeDasharray="4,4" />
                <line x1="0" y1="135" x2="500" y2="135" stroke="#1e293b" strokeDasharray="4,4" />

                {/* Shaded Area under Curve */}
                <path
                  d="M 0 160 
                     C 40 150, 60 130, 80 135 
                     C 120 140, 140 60, 160 62 
                     C 200 64, 220 100, 240 102 
                     C 280 104, 300 115, 320 110 
                     C 360 105, 380 10, 400 15 
                     C 430 20, 450 40, 470 50 
                     C 485 70, 500 120, 500 130 
                     L 500 180 L 0 180 Z"
                  fill="url(#cyberAreaGradient)"
                />

                {/* Glowing Primary Line */}
                <path
                  d="M 0 160 
                     C 40 150, 60 130, 80 135 
                     C 120 140, 140 60, 160 62 
                     C 200 64, 220 100, 240 102 
                     C 280 104, 300 115, 320 110 
                     C 360 105, 380 10, 400 15 
                     C 430 20, 450 40, 470 50 
                     C 485 70, 500 120, 500 130"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }}
                />

                {/* High Peak Markers with Glow */}
                <circle cx="160" cy="62" r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }} />
                <circle cx="400" cy="15" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 8px #f59e0b)' }} />
              </svg>
            </div>

            {/* X-Axis Hour Labels */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
              {hourlyDistribution.map(h => (
                <div key={h.hour} className="text-center">
                  <span className="block font-bold text-slate-300">{h.hour}</span>
                  <span className="block text-[10px] text-cyan-400">{h.orders}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corridor Breakdown & Courier Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Corridor Volume & SLA Performance (5 cols) with Amber Top Accent */}
        <div className="lg:col-span-5 bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800/80 pb-3 font-mono">
            <h3 className="text-base font-bold text-white tracking-wide">CORRIDOR SLA BREAKDOWN</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fulfillment telemetry divided by micro-hub sector</p>
          </div>

          <div className="space-y-3 font-mono">
            {corridorBreakdown.map((item) => (
              <div key={item.corridor} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span className="font-bold text-white text-sm font-sans">{item.corridor}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {item.slaPct}% SLA
                  </span>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{
                      width: `${item.slaPct}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}`
                    }}
                    className="h-full rounded-full transition-all"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Vol: {item.volume} packages</span>
                  <span className="text-cyan-400">Avg Transit: {item.avgTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courier Performance Leaderboard (7 cols) with Purple Top Accent */}
        <div className="lg:col-span-7 bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-indigo-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800/80 pb-3 font-mono">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-wide">COURIER FLEET LEADERBOARD</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by on-time fulfillment, customer rating, and EV battery conservation</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-bold">
                  <th className="py-2.5 px-3">Rider</th>
                  <th className="py-2.5 px-3">EV Vehicle</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Trips Today</th>
                  <th className="py-2.5 px-3">Battery %</th>
                  <th className="py-2.5 px-3 text-right">On-Time %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {courierLeaderboard.map((c, i) => (
                  <tr key={c.name} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 font-bold text-white font-sans text-xs">
                        <span className="w-5 h-5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 font-mono font-bold flex items-center justify-center text-[10px] shadow-[0_0_6px_rgba(6,182,212,0.3)]">
                          {i + 1}
                        </span>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{c.vehicle}</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">★ {c.rating}</td>
                    <td className="py-3 px-3 text-slate-300">{c.trips}</td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <Zap className="w-3 h-3 text-emerald-400" /> {c.batteryPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {c.onTimePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
