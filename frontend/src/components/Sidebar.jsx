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
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Deliveries', path: '/deliveries', icon: Package },
  { name: 'Route Planner', path: '/route-planner', icon: Navigation, badge: 'AI' },
  { name: 'Route History', path: '/route-history', icon: History },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}

      {/* Floating Glassmorphic Sidebar (Matching Reference Image) */}
      <aside 
        className={`
          fixed lg:sticky top-0 lg:top-6 left-0 bottom-0 z-40
          w-64 sm:w-72 lg:w-64 h-full lg:h-[calc(100vh-3rem)]
          flex flex-col justify-between p-4 sm:p-5 rounded-3xl
          transition-transform duration-300 ease-in-out border
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(14, 23, 42, 0.75) 0%, rgba(9, 15, 30, 0.88) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">LogiRoute AI</span>
              <span className="text-[10px] text-orange-300/90 font-medium tracking-wide">Dark Store Cockpit</span>
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
        <nav className="flex-1 px-3.5 py-5 space-y-2 overflow-y-auto">
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
                  flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-mono font-medium transition-all duration-200 border
                  ${isMatch 
                    ? 'text-white font-bold border-orange-400/50' 
                    : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border-transparent hover:border-white/10'
                  }
                `}
                style={isMatch ? {
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                  boxShadow: '0 4px 18px rgba(255, 107, 74, 0.45)',
                } : {}}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isMatch ? 'text-white' : 'text-slate-300'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                    isMatch 
                      ? 'bg-white/20 text-white' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Courier Graphic & Logout in Bottom Sidebar Area */}
        <div className="px-4 pb-4 pt-2 mt-auto flex flex-col items-center">
          {/* Rider Silhouette Graphic */}
          <div className="w-full relative rounded-2xl overflow-hidden border border-white/10 shadow-lg group bg-slate-950/40">
            <img 
              src="/assets/sidebar_rider.png" 
              alt="LogiRoute Courier" 
              className="w-full h-26 object-cover object-top opacity-95 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono font-semibold text-slate-300 pointer-events-none">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Fleet
              </span>
              <span className="text-slate-400">2-Opt Synced</span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all backdrop-blur-md shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-orange-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
