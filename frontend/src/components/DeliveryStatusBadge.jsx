import React from 'react';

const STATUS_CONFIG = {
  PENDING: { 
    bg: 'bg-amber-950/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]', 
    text: 'text-amber-400', 
    border: 'border-amber-800/60', 
    dot: 'bg-amber-400 animate-pulse', 
    label: 'Pending' 
  },
  SCHEDULED: { 
    bg: 'bg-blue-950/60 shadow-[0_0_8px_rgba(59,130,246,0.25)]', 
    text: 'text-blue-400', 
    border: 'border-blue-800/60', 
    dot: 'bg-blue-400', 
    label: 'Scheduled' 
  },
  IN_TRANSIT: { 
    bg: 'bg-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.35)]', 
    text: 'text-cyan-400', 
    border: 'border-cyan-800/60', 
    dot: 'bg-cyan-400 animate-ping', 
    label: 'In-Transit' 
  },
  'IN-TRANSIT': { 
    bg: 'bg-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.35)]', 
    text: 'text-cyan-400', 
    border: 'border-cyan-800/60', 
    dot: 'bg-cyan-400 animate-ping', 
    label: 'In-Transit' 
  },
  DELIVERED: { 
    bg: 'bg-emerald-950/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]', 
    text: 'text-emerald-400', 
    border: 'border-emerald-800/60', 
    dot: 'bg-emerald-400', 
    label: 'Delivered' 
  },
  CANCELLED: { 
    bg: 'bg-slate-900/60', 
    text: 'text-slate-400', 
    border: 'border-slate-800', 
    dot: 'bg-slate-500', 
    label: 'Cancelled' 
  },
  FAILED: { 
    bg: 'bg-rose-950/60 shadow-[0_0_8px_rgba(244,63,94,0.25)]', 
    text: 'text-rose-400', 
    border: 'border-rose-800/60', 
    dot: 'bg-rose-400', 
    label: 'Failed' 
  },
};

export default function DeliveryStatusBadge({ status }) {
  const norm = (status || 'PENDING').toUpperCase();
  const config = STATUS_CONFIG[norm] || STATUS_CONFIG.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border backdrop-blur-md transition-all ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
