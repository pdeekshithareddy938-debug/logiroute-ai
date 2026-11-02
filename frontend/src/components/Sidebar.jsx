import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Navigation, 
  History, 
  BarChart3, 
  Sparkles,
  Truck,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Deliveries', path: '/deliveries', icon: Package },
  { name: 'Route Planner', path: '/route-planner', icon: Navigation, badge: 'AI' },
  { name: 'Route History', path: '/route-history', icon: History },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090f1d] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">LogiRoute AI</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Dark Store Cockpit</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isMatch = item.path === '/admin' 
              ? (location.pathname === '/admin' || location.pathname === '/')
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all
                  ${isMatch 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 m-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2-Opt Heuristic Core</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Real-time corridor solver & dark store dispatch synchronized.
          </p>
        </div>
      </aside>
    </>
  );
}
