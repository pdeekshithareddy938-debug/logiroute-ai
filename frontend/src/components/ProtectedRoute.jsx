import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, LogOut, Lock } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070d19] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Verifying RBAC Authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Isolated application login redirects
    if (location.pathname.startsWith('/rider')) {
      return <Navigate to="/rider/login" replace />;
    }
    if (
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/deliveries') ||
      location.pathname.startsWith('/route-planner') ||
      location.pathname.startsWith('/route-history') ||
      location.pathname.startsWith('/analytics')
    ) {
      return <Navigate to="/admin/login" replace />;
    }
    if (location.pathname.startsWith('/customer')) {
      return <Navigate to="/customer/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const allowedUpper = allowedRoles ? allowedRoles.map((r) => r.toUpperCase()) : [];

  if (allowedRoles && !allowedUpper.includes(userRole)) {
    const designatedPath = getRoleDefaultPath(userRole);
    const portalName =
      userRole === 'ADMIN'
        ? '🏢 Dark Store Operations Console (/admin)'
        : userRole === 'RIDER'
        ? '🛵 Delivery Partner HUD (/rider)'
        : '🛒 Shopper Consumer App (/customer)';

    return (
      <div className="min-h-screen bg-[#070d19] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0b1220]/95 backdrop-blur-xl border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
          
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 mx-auto text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              403 FORBIDDEN — RBAC ISOLATION
            </span>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account (<span className="text-slate-200 font-medium">{user.email}</span>) is registered as{' '}
              <span className="text-rose-400 font-bold font-mono">[{user.role}]</span> and is isolated to its dedicated application. Cross-app access is prohibited.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-6 text-left">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Authorized Roles for this URL:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {allowedRoles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              to={designatedPath}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Switch to {portalName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Switch Application</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
