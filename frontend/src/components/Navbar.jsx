import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, MapPin, Radio, Shield } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isDarkTheme = true }) {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.full_name || 'Deekshitha';
  const displayRole = user?.role ? user.role.toUpperCase() : 'ADMIN';
  const roleTitle = displayRole === 'ADMIN' ? 'Deekshitha · Dark Store Lead (Hub-01)' : displayName;

  return (
    <header className={`h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200 border-b ${
      isDarkTheme 
        ? 'bg-slate-950/90 backdrop-blur-xl border-slate-800/80 text-slate-100' 
        : 'bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-800 shadow-xs'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDarkTheme 
              ? 'text-slate-400 hover:text-white hover:bg-slate-900' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className={`hidden sm:flex items-center gap-2 text-xs font-mono font-medium px-3.5 py-1.5 rounded-full border shadow-xs ${
          isDarkTheme
            ? 'text-slate-300 bg-slate-900/90 border-slate-800'
            : 'text-slate-700 bg-slate-100 border-slate-200/90'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-bold">HUB-01 COCKPIT</span>
          <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>|</span>
          <span className={isDarkTheme ? 'text-slate-400' : 'text-slate-500'}>100 Market St, San Francisco</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shadow-xs ${
              isDarkTheme
                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left text-xs font-mono">
              <span className={`font-bold block tracking-tight ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>
                {roleTitle}
              </span>
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                displayRole === 'ADMIN' ? 'text-cyan-400' : displayRole === 'RIDER' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <Shield className="w-3 h-3 inline" />
                {displayRole === 'ADMIN' ? 'Control Tower Lead' : displayRole}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
            isDarkTheme
              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border-slate-800 hover:border-rose-900/50'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
