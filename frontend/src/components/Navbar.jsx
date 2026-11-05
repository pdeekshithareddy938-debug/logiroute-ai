import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, Bell, Shield, Zap } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isDarkTheme = true }) {
  const { user, logout, isDemoMode } = useAuth();
  const displayName = user?.name || user?.full_name || 'Deekshitha';
  const displayRole = user?.role ? user.role.toUpperCase() : 'ADMIN';
  const roleTitle = displayRole === 'ADMIN' ? 'Deekshitha - Dark Store Lead (HUB-01)' : displayName;

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 pt-4 pb-2 space-y-3">
      {/* Top Floating Glass Navigation Pill Bar */}
      <div 
        className="h-14 px-5 rounded-2xl flex items-center justify-between border shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(56, 189, 248, 0.22)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Admin Greeting */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Hello, Admin!</span>
              <span className="text-xl">👋</span>
            </h1>

            {/* Subtle Visual Indicator: Demo Mode Active Badge */}
            {isDemoMode && (
              <div 
                className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 border shadow-sm transition-all select-none"
                style={{
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#FCD34D',
                  borderColor: 'rgba(245, 158, 11, 0.45)',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                }}
                title="Running in offline mock preview mode (Bypassing backend)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>Demo Mode Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons: Notification Bell + Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell with Red Badge 2 */}
          <button 
            className="relative p-2 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              2
            </span>
          </button>

          {/* User Avatar Circle */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full rounded-full bg-[#0c162c] flex items-center justify-center text-cyan-300 font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Header / Dark Store Pod Telemetry Pill Bar */}
      <div 
        className="px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border shadow-md transition-all text-xs font-mono"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.65) 0%, rgba(9, 15, 30, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(56, 189, 248, 0.18)',
        }}
      >
        {/* Left: HUB-01 Status Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-emerald-400 font-bold tracking-wide">HUB-01 COCKPIT</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">100 Market St, San Francisco</span>
          {isDemoMode && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 font-sans">
              Mock Simulation Active
            </span>
          )}
        </div>

        {/* Right: Deekshitha Lead Info & Sign Out Button */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-[10px]">
              D
            </div>
            <span className="text-slate-200 font-semibold">{roleTitle}</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Control Tower Lead
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer shadow-sm"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
