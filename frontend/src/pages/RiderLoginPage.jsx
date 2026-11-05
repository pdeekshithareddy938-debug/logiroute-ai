import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  X,
  Bike,
  Building2,
  ShoppingBag,
  ExternalLink,
  Zap
} from 'lucide-react';

function ScooterLogo3D({ className = "w-16 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="riderScooterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="50%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#E63900" />
        </linearGradient>
        <linearGradient id="riderBoxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <filter id="riderLogoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#FF5722" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Speed lines */}
      <line x1="8" y1="18" x2="22" y2="18" stroke="#FF7A45" strokeWidth="3" strokeLinecap="round" />
      <line x1="2" y1="26" x2="18" y2="26" stroke="#FF5722" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="34" x2="24" y2="34" stroke="#E63900" strokeWidth="3" strokeLinecap="round" />
      {/* Scooter Body & Wheels */}
      <g filter="url(#riderLogoShadow)">
        <circle cx="34" cy="38" r="8" stroke="#FF451A" strokeWidth="4.5" fill="#FFFFFF" />
        <circle cx="34" cy="38" r="3" fill="#FF451A" />
        <circle cx="64" cy="38" r="8" stroke="#FF451A" strokeWidth="4.5" fill="#FFFFFF" />
        <circle cx="64" cy="38" r="3" fill="#FF451A" />
        <path d="M 28,26 C 28,20 34,16 42,16 L 50,16 C 54,16 56,22 56,28 L 56,34 L 40,34 C 34,34 28,30 28,26 Z" fill="url(#riderScooterGrad)" />
        <path d="M 52,24 L 62,12 L 66,12" stroke="url(#riderScooterGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="64" cy="14" r="3.5" fill="#FFE57F" />
        <rect x="22" y="10" width="14" height="12" rx="2" fill="url(#riderBoxGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export default function RiderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotToast, setForgotToast] = useState(false);
  const [applyModal, setApplyModal] = useState(false);

  const { login, enableDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = () => {
    enableDemoMode('RIDER');
    navigate('/rider');
  };

  // Quick-fill verified fleet partner credentials
  const handleQuickFill = () => {
    setEmail('rider@logiroute.ai');
    setPassword('rider123');
    setErrorBanner('');
  };

  // Submit and authenticate delivery partner
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorBanner('Please enter your Rider ID / Email and Password');
      return;
    }
    setErrorBanner('');
    setIsLoading(true);

    try {
      // Map plain ID "DP-402" to verified email if entered
      const authIdentity = email.trim().toLowerCase() === 'dp-402' ? 'rider@logiroute.ai' : email.trim();
      await login(authIdentity, password, 'RIDER');
      navigate('/rider');
    } catch (err) {
      setErrorBanner(
        err.message || 'Access Denied: Partner ID not found in active courier fleet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Track as Guest
  const handleGuestTrack = async () => {
    setIsLoading(true);
    setErrorBanner('');
    try {
      await login('rider@logiroute.ai', 'rider123', 'RIDER');
      navigate('/rider');
    } catch (err) {
      navigate('/rider');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth simulation
  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    setErrorBanner('');
    try {
      await login('rider@logiroute.ai', 'rider123', 'RIDER');
      navigate('/rider');
    } catch (err) {
      navigate('/rider');
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
          backgroundImage: `url('/assets/rider_bg_3d.png'), url('/assets/rider_reference.jpg')`,
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
        {/* Soft Volumetric Sunset Lighting & Atmosphere Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/15 via-transparent to-stone-900/30 pointer-events-none" />
      </div>

      {/* ==================================================================== */}
      {/* CENTRAL FLOATING 3D GLASS CARD (Crystal Transparent Glassmorphism)  */}
      {/* ==================================================================== */}
      <div className="relative z-20 w-full max-w-[390px] sm:max-w-[420px] my-auto">
        
        {/* Contact Shadow & Mirror Reflection under Card */}
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
            <ScooterLogo3D className="w-16 h-11 mb-1 text-[#FF5722]" />
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
              Rider Login
            </h2>
            <p className="text-[13px] text-[#EA580C] mt-0.5 font-bold">
              Deliver more. Earn more.
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
            
            {/* Rider ID / Email Input (Pill Shaped Transparent Glass) */}
            <div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Rider ID or Email"
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

            {/* Keep Signed In & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 pb-1">
              <button
                type="button"
                onClick={() => setKeepSignedIn(!keepSignedIn)}
                className="flex items-center gap-2 select-none group text-left cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all ${
                    keepSignedIn
                      ? 'bg-[#FF5722] border-[#FF5722] text-white shadow-xs'
                      : 'border border-white/80 bg-white/40 group-hover:border-white'
                  }`}
                >
                  {keepSignedIn && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Keep me signed in
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForgotToast(true)}
                className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Action Buttons: Log In & Quick Demo Access */}
            <div className="pt-1 space-y-2.5">
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
                  <span>Log In →</span>
                )}
              </button>

              {/* Prominent Quick Demo Access Button (Bypass Backend) */}
              <button
                type="button"
                onClick={handleDemoAccess}
                style={{
                  height: '48px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                  boxShadow: '0 8px 20px -2px rgba(16, 185, 129, 0.40), inset 0 1.5px 2px rgba(255, 255, 255, 0.55)',
                }}
                className="w-full text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>Quick Demo Access (Bypass Backend)</span>
              </button>
            </div>
          </form>

          {/* Toast Notification */}
          {forgotToast && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-800 animate-fadeIn">
              <span>Password reset instructions sent to registered courier contact.</span>
              <button
                type="button"
                onClick={() => setForgotToast(false)}
                className="text-amber-500 hover:text-amber-700 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex py-3.5 items-center">
            <div className="flex-grow border-t border-white/50"></div>
            <span className="flex-shrink mx-3 text-slate-800 text-xs font-semibold">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-white/50"></div>
          </div>

          {/* Dual Social Logins: Google & Apple (Pill Shaped Glass) */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
              className="w-full py-2.5 px-3 rounded-full hover:bg-white/80 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth('Apple')}
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
              className="w-full py-2.5 px-3 rounded-full hover:bg-white/80 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.83.93-2.89-.91.04-2.02.61-2.66 1.36-.57.65-1.07 1.73-.93 2.76 1.02.08 2.04-.51 2.66-1.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Footer Registration & Guest Links */}
          <div className="space-y-1.5 text-center pt-1 border-t border-white/40">
            <p className="text-xs text-slate-800 font-semibold">
              New Rider?{' '}
              <button
                type="button"
                onClick={() => setApplyModal(true)}
                className="font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors ml-0.5 cursor-pointer"
              >
                Register Here
              </button>
            </p>

            {/* Quick Switch Links matching reference image */}
            <div className="pt-1 flex items-center justify-center gap-3 text-[11px] text-slate-700 font-semibold">
              <Link to="/customer/login" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
                <span>Customer Store</span>
              </Link>
              <span>•</span>
              <Link to="/admin/login" className="hover:text-cyan-700 transition-colors flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Dark Store Lead</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Rider Fleet Registration */}
      {applyModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-100 text-center relative animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#FF5722] flex items-center justify-center mx-auto mb-3">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Join LogiRoute Courier Fleet</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Earn high-velocity payouts with AI-optimized 10-minute delivery batches and guaranteed minimum hourly earnings.
            </p>
            <button
              type="button"
              onClick={() => {
                handleQuickFill();
                setApplyModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs shadow-md shadow-[#FF5722]/30 transition-all mb-2 cursor-pointer"
            >
              Instant Test: Use rider@logiroute.ai
            </button>
            <button
              type="button"
              onClick={() => setApplyModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
