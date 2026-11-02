import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Radio,
  ShoppingBag,
  Bike,
  Eye,
  EyeOff,
  Cpu
} from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setEmail('admin@logiroute.ai');
    setPassword('admin123');
    setErrorBanner('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');
    setIsLoading(true);

    try {
      await login(email, password, 'ADMIN');
      navigate('/admin');
    } catch (err) {
      setErrorBanner(
        err.message || 'Access Denied: Authorized Dark Store Hub Personnel Only.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Hub Operations Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>HUB-01 CONTROL TOWER · SF POD</span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <Building2 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>LogiRoute AI</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Control Tower
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Dark Store Operations Console — Authorized Personnel Only
          </p>
        </div>

        {/* High-Visibility Error Banner */}
        {errorBanner && (
          <div className="mb-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 shadow-xl shadow-rose-950/40 animate-shake">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200 font-mono font-medium leading-relaxed">
                {errorBanner}
              </div>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-[#0b1220]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/50" />

          {/* Demo Quick-Fill Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>🏢 Sign in as Deekshitha (Hub Lead)</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-mono tracking-wider">
              Operator Credentials
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Operations Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@logiroute.ai"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 font-mono transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 font-mono"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Hub Operations Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Cross-App Navigation Links */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-2 text-[11px] text-slate-500 text-center font-mono">
            <span>Customer or Partner Portal?</span>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/customer/login"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shopper App</span>
              </Link>
              <span>•</span>
              <Link
                to="/rider/login"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Partner HUD</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
