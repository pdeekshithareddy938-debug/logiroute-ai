import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  X,
  Bike,
  Building2,
  ShoppingBag,
  Cpu
} from 'lucide-react';

function AdminShieldLogo3D({ className = "w-16 h-14" }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="adminShieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFA040" />
          <stop offset="40%" stopColor="#FF6F22" />
          <stop offset="100%" stopColor="#E63900" />
        </linearGradient>
        <filter id="adminShieldShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF5722" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#adminShieldShadow)">
        {/* Shield shape */}
        <path
          d="M 30,6 C 42,6 50,12 50,18 C 50,34 38,48 30,54 C 22,48 10,34 10,18 C 10,12 18,6 30,6 Z"
          fill="url(#adminShieldGrad)"
        />
        {/* Inner highlight line */}
        <path
          d="M 30,9 C 40,9 47,14 47,19 C 47,32 37,45 30,50 C 23,45 13,32 13,19 C 13,14 20,9 30,9 Z"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Padlock */}
        <rect x="23" y="27" width="14" height="11" rx="2.5" fill="#FFFFFF" />
        <path d="M 26,27 L 26,23 C 26,20.8 27.8,19 30,19 C 32.2,19 34,20.8 34,23 L 34,27" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="32" r="1.5" fill="#FF5722" />
        <line x1="30" y1="33" x2="30" y2="35.5" stroke="#FF5722" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

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
    if (!email || !password) {
      setErrorBanner('Please enter your Admin Email / Username and Password');
      return;
    }
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
    <div className="min-h-screen min-h-[100dvh] w-full relative flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      
      {/* ==================================================================== */}
      {/* 100% STATIONARY FIXED 3D BACKGROUND (Zero Mobile Touch Shift)        */}
      {/* ==================================================================== */}
      <div 
        aria-hidden="true"
        className="fixed top-0 left-0 w-full h-screen h-[100dvh] z-0 pointer-events-none select-none overflow-hidden"
        style={{
          backgroundImage: `url('/assets/admin_bg_3d.png'), url('/assets/admin_reference.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#FDEEE6',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Ambient Warm Warehouse & Volumetric Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/15 via-transparent to-stone-900/30 pointer-events-none" />
      </div>

      {/* ==================================================================== */}
      {/* CENTRAL FLOATING 3D GLASS CARD (Crystal Transparent Glassmorphism)  */}
      {/* ==================================================================== */}
      <div className="relative z-20 w-full max-w-[390px] sm:max-w-[420px] my-auto">
        
        {/* Contact Shadow on Polished Industrial Floor */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-stone-950/25 blur-xl rounded-full pointer-events-none" />

        {/* The Card Body */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.70)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 30px rgba(255, 255, 255, 0.35), inset 0 1.5px 3px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.15)',
          }}
          className="w-full rounded-[38px] p-6 sm:p-7 flex flex-col relative transition-all duration-300"
        >
          
          {/* Top Action Bar inside Card matching reference image */}
          <div className="flex items-center justify-between mb-3 w-full">
            <Link
              to="/login"
              aria-label="Back to Portals"
              className="px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
              <span>Back to Portals</span>
            </Link>

            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/90 text-[#FF5722] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Demo Fill</span>
            </button>
          </div>

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <AdminShieldLogo3D className="w-14 h-14 mb-1 text-[#FF5722]" />
            <h1 className="text-[24px] sm:text-[26px] font-black text-[#1E1B4B] tracking-tight leading-tight">
              LogiRoute AI
            </h1>
            <p className="text-[12px] font-semibold text-[#4338CA] tracking-wide mt-0.5">
              Smart 10-Minute Delivery
            </p>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-4">
            <h2 className="text-[22px] font-black text-[#1E1B4B] tracking-tight">
              Admin Login
            </h2>
            <p className="text-[13px] text-[#EA580C] mt-0.5 font-bold">
              Manage. Monitor. Grow.
            </p>
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="mb-4 bg-rose-50/95 border border-rose-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn shadow-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorBanner}</div>
              <button
                type="button"
                onClick={() => setErrorBanner('')}
                className="text-rose-400 hover:text-rose-600 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Admin Email or Username Input (Pill Shaped Transparent Glass) */}
            <div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email or Username"
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.26)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.72)',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.04)',
                  }}
                  className="w-full rounded-full pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-600 font-medium transition-all outline-none focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 focus:bg-white/40"
                />
              </div>
            </div>

            {/* Password Input (Pill Shaped Transparent Glass) */}
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.26)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.72)',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.04)',
                  }}
                  className="w-full rounded-full pl-11 pr-11 py-3.5 text-sm text-slate-900 placeholder:text-slate-600 font-medium transition-all outline-none focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 focus:bg-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Operational Info Badge */}
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-800 font-semibold">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                HUB-01 Control Tower
              </span>
              <span className="text-[#EA580C] font-bold">
                Personnel Only
              </span>
            </div>

            {/* Primary Action Button: 🛡️ Secure Login → */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  height: '52px',
                  borderRadius: '26px',
                  background: 'linear-gradient(135deg, #FF6A00 0%, #FF3D00 100%)',
                  boxShadow: '0 10px 25px rgba(255, 61, 0, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.55), inset 0 -2px 2px rgba(180, 20, 0, 0.25)',
                }}
                className="w-full text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 fill-white/20" />
                    <span>Secure Login →</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Switch Links matching reference image */}
          <div className="mt-5 pt-3 border-t border-white/40 flex items-center justify-center gap-3 text-[11px] text-slate-700 font-semibold">
            <Link to="/customer/login" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              <span>Customer Store</span>
            </Link>
            <span>•</span>
            <Link to="/rider/login" className="hover:text-amber-600 transition-colors flex items-center gap-1">
              <Bike className="w-3 h-3" />
              <span>Partner HUD</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
