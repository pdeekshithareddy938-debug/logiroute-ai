import React from 'react';

const PRIORITY_CONFIG = {
  LOW: { bg: 'bg-slate-900/80 text-slate-400 border border-slate-800', label: 'Low' },
  MEDIUM: { bg: 'bg-blue-950/70 text-blue-300 border border-blue-800/50', label: 'Medium' },
  HIGH: { bg: 'bg-amber-950/70 text-amber-300 border border-amber-700/50', label: 'High' },
  URGENT: { bg: 'bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]', label: 'Urgent' },
};

export default function PriorityBadge({ priority }) {
  const norm = (priority || 'MEDIUM').toUpperCase();
  const config = PRIORITY_CONFIG[norm] || PRIORITY_CONFIG.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
