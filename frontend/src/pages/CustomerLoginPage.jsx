import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  X,
  CheckCircle2,
  Bike,
  Building2
} from 'lucide-react';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotToast, setForgotToast] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-fill demo shopper credentials
  const handleQuickFill = () => {
    setEmail('customer@gmail.com');
    setPassword('cust123');
    setErrorBanner('');
  };

  // Submit form and authenticate customer
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorBanner('Please enter your email and password');
      return;
    }
    setErrorBanner('');
    setIsLoading(true);

    try {
      await login(email, password, 'CUSTOMER');
      navigate('/customer');
    } catch (err) {
      setErrorBanner(
        err.message || 'Account not found. Please verify your credentials or use the Demo Quick-Fill.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Guest Browse
  const handleGuestBrowse = async () => {
    setIsLoading(true);
    setErrorBanner('');
    try {
      await login('customer@gmail.com', 'cust123', 'CUSTOMER');
      navigate('/customer');
    } catch (err) {
      navigate('/customer');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth simulation
  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    setErrorBanner('');
    try {
      // Authenticate with verified customer account
      await login('customer@gmail.com', 'cust123', 'CUSTOMER');
      navigate('/customer');
    } catch (err) {
      navigate('/customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center items-center py-0 sm:py-6 sm:px-4 font-sans selection:bg-[#FF6F43]/20 selection:text-[#FF451A]">
      {/* Target Device Viewport (Mobile Frame 390px - 430px) */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[860px] sm:max-h-[92vh] bg-white sm:rounded-[40px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] sm:border sm:border-stone-200/90 flex flex-col relative overflow-hidden">
        
        {/* ==================================================================== */}
        {/* SECTION 1: TOP HERO SECTION (Warm-Beige 3D Delivery Illustration)   */}
        {/* ==================================================================== */}
        <div className="relative bg-[#FBF7F2] pt-3 pb-8 px-5 flex flex-col justify-between overflow-hidden shrink-0 h-[38%] min-h-[260px] max-h-[310px]">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute -top-16 -right-12 w-64 h-64 bg-[#FFE8D6]/80 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-16 w-48 h-48 bg-[#FED7AA]/50 rounded-full blur-2xl pointer-events-none" />

          {/* Top Mobile Bar & Navigation */}
          <div className="relative z-20 flex items-center justify-between w-full pt-1">
            <Link
              to="/login"
              aria-label="Back to Portal Gateway"
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-stone-200/70 text-slate-700 flex items-center justify-center transition-all shadow-xs hover:shadow active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Quick Demo Pre-Fill Chip */}
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1 rounded-full bg-white/90 hover:bg-white border border-[#FF6F43]/30 text-[#FF451A] text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6F43]" />
              <span>Demo Fill</span>
            </button>
          </div>

          {/* Immersive 3D Delivery Themed Illustration */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center -mt-2">
            <svg
              viewBox="0 0 400 220"
              className="w-full h-full max-h-[220px] select-none pointer-events-none drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Skin Tone Gradient */}
                <linearGradient id="courierSkin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDE3CE" />
                  <stop offset="100%" stopColor="#E6B491" />
                </linearGradient>

                {/* 3D Coral Cap Gradient */}
                <linearGradient id="capGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF7A50" />
                  <stop offset="60%" stopColor="#FF5722" />
                  <stop offset="100%" stopColor="#E63900" />
                </linearGradient>

                {/* 3D Hoodie Gradient */}
                <linearGradient id="hoodieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6F43" />
                  <stop offset="100%" stopColor="#E03A10" />
                </linearGradient>

                {/* 3D Parcel Box Gradients */}
                <linearGradient id="boxFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E4AC74" />
                  <stop offset="100%" stopColor="#BD854E" />
                </linearGradient>
                <linearGradient id="boxTop" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F5C695" />
                  <stop offset="100%" stopColor="#E9B37E" />
                </linearGradient>
                <linearGradient id="boxSide" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A8723C" />
                  <stop offset="100%" stopColor="#8C5B28" />
                </linearGradient>

                {/* Paper Tape */}
                <linearGradient id="tapeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F9E2BE" />
                  <stop offset="100%" stopColor="#D9B784" />
                </linearGradient>

                {/* Mini Floating Box Gradients */}
                <linearGradient id="miniBox1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF9E80" />
                  <stop offset="100%" stopColor="#FF5722" />
                </linearGradient>
                <linearGradient id="miniBox2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                {/* Drop Shadows */}
                <filter id="courierShadow" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#D97706" floodOpacity="0.16" />
                </filter>
                <filter id="floatShadow" x="-20%" y="-20%" width="150%" height="160%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.10" />
                </filter>
              </defs>

              {/* Dynamic Transit Speed Curves & Particles */}
              <g opacity="0.45">
                <path
                  d="M 20,170 C 60,170 80,120 150,135"
                  fill="none"
                  stroke="#FF8A65"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                <path
                  d="M 270,140 C 330,120 350,165 385,155"
                  fill="none"
                  stroke="#FFAB91"
                  strokeWidth="2"
                  strokeDasharray="4 5"
                  strokeLinecap="round"
                />
                {/* Wind swooshes */}
                <line x1="60" y1="80" x2="95" y2="80" stroke="#FFAB91" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <line x1="45" y1="92" x2="75" y2="92" stroke="#FFCCBC" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <line x1="310" y1="75" x2="345" y2="75" stroke="#FFCCBC" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </g>

              {/* Floating Sparkle Stars */}
              <g fill="#F59E0B">
                <path d="M 72,52 Q 72,62 82,62 Q 72,62 72,72 Q 72,62 62,62 Q 72,62 72,52 Z" />
                <path d="M 338,48 Q 338,55 345,55 Q 338,55 338,62 Q 338,55 331,55 Q 338,55 338,48 Z" opacity="0.85" />
                <circle cx="95" cy="115" r="2.5" fill="#FF8A65" />
                <circle cx="315" cy="110" r="3" fill="#F59E0B" />
              </g>

              {/* Floating Accent 1: Mini 3D Parcel (Left) */}
              <g transform="translate(48, 100) rotate(-14)" filter="url(#floatShadow)">
                {/* Isometric Top */}
                <polygon points="20,0 36,8 18,16 2,8" fill="#F5C695" />
                {/* Isometric Left */}
                <polygon points="2,8 18,16 18,34 2,26" fill="#BD854E" />
                {/* Isometric Right */}
                <polygon points="18,16 36,8 36,26 18,34" fill="#A8723C" />
                {/* Mini Ribbon */}
                <path d="M 10,4 L 28,12 M 10,12 L 10,30" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Floating Accent 2: Mini 3D Parcel with Gift Ribbon (Right) */}
              <g transform="translate(320, 85) rotate(16)" filter="url(#floatShadow)">
                <polygon points="18,0 32,7 16,14 2,7" fill="#FDE68A" />
                <polygon points="2,7 16,14 16,30 2,23" fill="#F59E0B" />
                <polygon points="16,14 32,7 32,23 16,30" fill="#D97706" />
                <path d="M 9,3.5 L 25,10.5 M 9,10.5 L 9,26.5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Floating Accent 3: 3D Express ETA Pill Badge */}
              <g transform="translate(268, 38)" filter="url(#floatShadow)">
                <rect x="0" y="0" width="88" height="30" rx="15" fill="#FFFFFF" />
                <circle cx="16" cy="15" r="9" fill="#FFF2EB" />
                <path d="M 16,9 L 13,15 L 16,15 L 15,21 L 19,14 L 16,14 Z" fill="#FF5722" />
                <text x="31" y="19" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="#1E293B">
                  10 min
                </text>
              </g>

              {/* Central Courier Character (3D Friendly Character) */}
              <g filter="url(#courierShadow)">
                {/* Ground Shadow */}
                <ellipse cx="200" cy="208" rx="80" ry="12" fill="#D4A373" opacity="0.35" />

                {/* Courier Torso / Delivery Hoodie */}
                <path
                  d="M 148,212 C 148,168 162,154 200,154 C 238,154 252,168 252,212 Z"
                  fill="url(#hoodieGradient)"
                />
                {/* White Zipper Accent */}
                <path d="M 200,165 L 200,212" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

                {/* Courier Neck */}
                <rect x="190" y="138" width="20" height="22" rx="6" fill="url(#courierSkin)" />

                {/* Friendly 3D Face */}
                <ellipse cx="200" cy="118" rx="27" ry="30" fill="url(#courierSkin)" />
                {/* Cheerful Eyes */}
                <ellipse cx="190" cy="116" rx="3.2" ry="4" fill="#2E1C10" />
                <ellipse cx="210" cy="116" rx="3.2" ry="4" fill="#2E1C10" />
                {/* Eye highlights */}
                <circle cx="191" cy="114" r="1.2" fill="#FFFFFF" />
                <circle cx="211" cy="114" r="1.2" fill="#FFFFFF" />
                {/* Friendly Smile */}
                <path d="M 194,128 Q 200,135 206,128" fill="none" stroke="#A75A38" strokeWidth="2.4" strokeLinecap="round" />
                {/* Rosy Cheeks */}
                <ellipse cx="184" cy="125" rx="4.5" ry="2.5" fill="#FF8A65" opacity="0.5" />
                <ellipse cx="216" cy="125" rx="4.5" ry="2.5" fill="#FF8A65" opacity="0.5" />

                {/* Stylish Delivery Cap (3D Beveled) */}
                <path
                  d="M 172,108 C 172,86 184,78 200,78 C 216,78 228,86 228,108 Z"
                  fill="url(#capGradient)"
                />
                {/* Cap Visor with Curved Brim */}
                <path
                  d="M 170,105 Q 200,98 234,105 Q 238,111 230,113 Q 200,109 168,113 Z"
                  fill="#D83905"
                />
                {/* Cap Emblem */}
                <circle cx="200" cy="94" r="5" fill="#FFFFFF" opacity="0.9" />
                <circle cx="200" cy="94" r="3" fill="#FF5722" />

                {/* 3D Main Delivery Parcel Box Held by Courier */}
                <g transform="translate(142, 148)" filter="url(#floatShadow)">
                  {/* Top Face */}
                  <polygon points="58,0 116,20 58,40 0,20" fill="url(#boxTop)" />
                  {/* Front Left Face */}
                  <polygon points="0,20 58,40 58,98 0,78" fill="url(#boxFront)" />
                  {/* Front Right Face */}
                  <polygon points="58,40 116,20 116,78 58,98" fill="url(#boxSide)" />

                  {/* Packaging Tape */}
                  <polygon points="52,2 64,6 64,96 52,94" fill="url(#tapeGrad)" opacity="0.95" />
                  <polygon points="26,29 88,9 94,13 32,33" fill="url(#tapeGrad)" opacity="0.85" />

                  {/* Shipping Label with Barcode */}
                  <g transform="translate(14, 42) rotate(19) skewY(-8)">
                    <rect x="0" y="0" width="30" height="20" rx="2" fill="#FFFFFF" />
                    <line x1="4" y1="4" x2="26" y2="4" stroke="#000" strokeWidth="1.5" />
                    <line x1="4" y1="8" x2="26" y2="8" stroke="#000" strokeWidth="1" />
                    <line x1="4" y1="12" x2="20" y2="12" stroke="#FF5722" strokeWidth="1.5" />
                    {/* Barcode lines */}
                    <line x1="5" y1="15" x2="5" y2="18" stroke="#000" strokeWidth="1" />
                    <line x1="8" y1="15" x2="8" y2="18" stroke="#000" strokeWidth="1.5" />
                    <line x1="12" y1="15" x2="12" y2="18" stroke="#000" strokeWidth="1" />
                    <line x1="15" y1="15" x2="15" y2="18" stroke="#000" strokeWidth="2" />
                    <line x1="20" y1="15" x2="20" y2="18" stroke="#000" strokeWidth="1" />
                  </g>
                </g>

                {/* Courier Hands Holding the Box */}
                {/* Left Hand */}
                <ellipse cx="140" cy="188" rx="10" ry="12" fill="url(#courierSkin)" />
                {/* Right Hand */}
                <ellipse cx="260" cy="188" rx="10" ry="12" fill="url(#courierSkin)" />
              </g>
            </svg>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 2: OVERLAPPING CARD SHEET (Border Radius 32px)              */}
        {/* ==================================================================== */}
        <div className="relative z-30 bg-white rounded-t-[32px] -mt-8 flex-1 flex flex-col px-6 sm:px-7 pt-6 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.07)] overflow-y-auto">
          
          {/* Header */}
          <div className="mb-5 text-left">
            <h1 className="text-[24px] font-bold text-[#1E293B] tracking-tight leading-tight">
              Welcome Back
            </h1>
            <p className="text-[13px] text-[#94A3B8] mt-1 font-normal">
              Sign in and pick up where you left off
            </p>
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="mb-4 bg-rose-50 border border-rose-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
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
            {/* Email Input Field */}
            <div>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Utility Row: Keep Me Signed In & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 pb-1">
              <button
                type="button"
                onClick={() => setKeepSignedIn(!keepSignedIn)}
                className="flex items-center gap-2 select-none group text-left cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    keepSignedIn
                      ? 'bg-[#FF5722] border-[#FF5722] text-white shadow-2xs'
                      : 'border border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {keepSignedIn && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                  Keep me signed in
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForgotToast(true)}
                className="text-xs font-semibold text-[#FF5722] hover:text-[#E64A19] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary CTA Button: Wide Rounded Height 52px, Radius 28px */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  height: '52px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, #FF6F43 0%, #FF451A 100%)',
                }}
                className="w-full text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#FF5722]/30 hover:shadow-[#FF5722]/45 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </div>
          </form>

          {/* Toast for Forgot Password */}
          {forgotToast && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-800">
              <span>A password reset link has been queued for customer@gmail.com</span>
              <button
                type="button"
                onClick={() => setForgotToast(false)}
                className="text-amber-500 hover:text-amber-700 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 4: SOCIAL AUTH & FOOTER                                      */}
          {/* ==================================================================== */}
          
          {/* Subtle "Or continue with" divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs font-normal">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Social Login Row: Google & Apple */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Apple')}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.83.93-2.89-.91.04-2.02.61-2.66 1.36-.57.65-1.07 1.73-.93 2.76 1.02.08 2.04-.51 2.66-1.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Bottom Links */}
          <div className="space-y-2.5 text-center mt-auto pt-1">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setSignUpModal(true)}
                className="font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors ml-0.5"
              >
                Sign Up
              </button>
            </p>

            <div>
              <button
                type="button"
                onClick={handleGuestBrowse}
                className="font-bold text-sm text-[#FF5722] hover:text-[#E64A19] transition-all inline-flex items-center gap-1 active:scale-95 group"
              >
                <span>Browse as Guest</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>

            {/* Quick Switch to Partner / Admin */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <Link to="/rider/login" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                <Bike className="w-3 h-3" />
                <span>Partner HUD</span>
              </Link>
              <span>•</span>
              <Link to="/admin/login" className="hover:text-cyan-600 transition-colors flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Dark Store Lead</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modal for Sign Up Demo */}
        {signUpModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF2EB] text-[#FF5722] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Instant Account Access</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                LogiRoute provides a pre-configured verified customer account for instant evaluation.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleQuickFill();
                  setSignUpModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs transition-all mb-2"
              >
                Use customer@gmail.com
              </button>
              <button
                type="button"
                onClick={() => setSignUpModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
