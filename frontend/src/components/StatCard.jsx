import React from 'react';
import { ShoppingCart, Package, Box, Clock, Bike, MapPin, TrendingUp, Radio, Network } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  unit = '', 
  subtext, 
  icon: LeftIcon, 
  rightIcon: RightIcon,
  color = 'cyan',
}) {
  const colorMap = {
    cyan: {
      hex: '#06b6d4',
      glowShadow: '0 0 24px rgba(6, 182, 212, 0.28), inset 0 0 16px rgba(6, 182, 212, 0.1)',
      borderColor: 'rgba(6, 182, 212, 0.65)',
      badgeBg: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300',
      circleBg: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
      DefaultRight: Box,
    },
    amber: {
      hex: '#f59e0b',
      glowShadow: '0 0 24px rgba(245, 158, 11, 0.28), inset 0 0 16px rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.65)',
      badgeBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
      circleBg: 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      DefaultRight: Clock,
    },
    emerald: {
      hex: '#10b981',
      glowShadow: '0 0 24px rgba(16, 185, 129, 0.28), inset 0 0 16px rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.65)',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
      circleBg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      DefaultRight: Bike,
    },
    purple: {
      hex: '#a855f7',
      glowShadow: '0 0 24px rgba(168, 85, 247, 0.28), inset 0 0 16px rgba(168, 85, 247, 0.1)',
      borderColor: 'rgba(168, 85, 247, 0.65)',
      badgeBg: 'bg-purple-500/20 border-purple-400/50 text-purple-300',
      circleBg: 'bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
      DefaultRight: TrendingUp,
    },
    blue: {
      hex: '#3b82f6',
      glowShadow: '0 0 24px rgba(59, 130, 246, 0.28), inset 0 0 16px rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.65)',
      badgeBg: 'bg-blue-500/20 border-blue-400/50 text-blue-300',
      circleBg: 'bg-blue-500/15 border-blue-400/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
      DefaultRight: Package,
    }
  };

  const scheme = colorMap[color] || colorMap.cyan;
  const TargetRightIcon = RightIcon || scheme.DefaultRight;

  return (
    <div 
      className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300 group hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.75) 0%, rgba(10, 16, 32, 0.88) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${scheme.borderColor}`,
        boxShadow: scheme.glowShadow,
      }}
    >
      {/* Top Header Row: Left Badge & Right Circular Icon */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {LeftIcon && (
            <div className={`p-1.5 rounded-lg border ${scheme.badgeBg}`}>
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            {title}
          </span>
        </div>

        {TargetRightIcon && (
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${scheme.circleBg}`}>
            <TargetRightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 relative z-10 flex items-baseline gap-1.5">
        <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono font-bold text-slate-300">
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle description */}
      {subtext && (
        <p className="mt-1 text-[11px] font-mono text-slate-300/90 relative z-10 font-medium">
          {subtext}
        </p>
      )}

      {/* Glowing Fluid Wave Graphic at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden h-14 opacity-90">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 280 50" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`wave-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scheme.hex} stopOpacity="0.45" />
              <stop offset="100%" stopColor={scheme.hex} stopOpacity="0.0" />
            </linearGradient>
            <filter id={`wave-glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 0 38 Q 70 48, 140 28 T 280 16 L 280 50 L 0 50 Z"
            fill={`url(#wave-grad-${color})`}
          />
          <path
            d="M 0 38 Q 70 48, 140 28 T 280 16"
            fill="none"
            stroke={scheme.hex}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={`url(#wave-glow-${color})`}
          />
        </svg>
      </div>
    </div>
  );
}
