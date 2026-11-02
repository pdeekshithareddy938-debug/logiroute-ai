import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
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
  Package,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function RiderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotToast, setForgotToast] = useState(false);
  const [applyModal, setApplyModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center py-4 sm:py-8 px-2 sm:px-4 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* ==================================================================== */}
      {/* DARK SMARTPHONE MOCKUP FRAME                                         */}
      {/* ==================================================================== */}
      <div className="relative w-full max-w-[420px] min-h-[780px] h-[870px] max-h-[96vh] bg-[#0c121e] rounded-[48px] p-2.5 sm:p-3 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_0_2px_rgba(30,41,59,0.7)] flex flex-col justify-between overflow-hidden">
        
        {/* Device Outer Titanium Edge Highlight */}
        <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-slate-700/40 shadow-inner" />

        {/* Smartphone Screen Canvas */}
        <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col shadow-inner select-none">
          
          {/* ================================================================== */}
          {/* TOP ILLUSTRATION & BRANDING (Top 40%)                              */}
          {/* Minimalist Warm-Cream to Light-Peach Backdrop (#FDEEE6 to #F8D9C8) */}
          {/* ================================================================== */}
          <div
            className="relative h-[40%] min-h-[280px] px-5 pt-3 pb-6 flex flex-col justify-between overflow-hidden shrink-0"
            style={{
              background: 'linear-gradient(180deg, #FDEEE6 0%, #F8D9C8 100%)'
            }}
          >
            {/* Top Phone Sensor Bar / Dynamic Island Mockup */}
            <div className="w-full flex items-center justify-between z-30 pt-0.5 pb-2 text-slate-800 text-[11px] font-semibold">
              <span className="font-mono text-xs pl-1">9:41</span>
              {/* Dynamic Island pill */}
              <div className="w-24 h-4 bg-slate-900/90 rounded-full flex items-center justify-end pr-2.5 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
              </div>
              <div className="flex items-center gap-1.5 pr-1">
                <span className="text-[10px]">5G</span>
                <div className="w-4 h-2.5 border border-slate-800 rounded-[3px] p-[1px] flex items-center">
                  <div className="w-full h-full bg-slate-900 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Top-Left Branding: "LogiRoute Rider" Logo with Tiny Red Motorcycle & Parcel */}
            <div className="relative z-30 flex items-center justify-between w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-orange-200/60 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-xs">
                  <Bike className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs tracking-tight text-slate-900">LogiRoute</span>
                  <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider bg-red-50 px-1 rounded">Rider</span>
                  <Package className="w-3 h-3 text-[#EF4444] ml-0.5" />
                </div>
              </div>

              {/* Quick Demo Pre-fill Pill */}
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-orange-300/80 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>Demo Fill</span>
              </button>
            </div>

            {/* 3D Isometric Illustration: Red Motorcycle with White Box & Roads */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center -mt-2">
              <svg
                viewBox="0 0 400 210"
                className="w-full h-full max-h-[210px] select-none pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Fading Roads Gradient */}
                  <linearGradient id="roadFade1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E2D4CA" stopOpacity="0" />
                    <stop offset="30%" stopColor="#DFD1C7" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#DFD1C7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#E2D4CA" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="roadFade2" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E2D4CA" stopOpacity="0" />
                    <stop offset="35%" stopColor="#D5C4B9" stopOpacity="0.85" />
                    <stop offset="65%" stopColor="#D5C4B9" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#E2D4CA" stopOpacity="0" />
                  </linearGradient>

                  {/* Red Motorcycle Body Gradients */}
                  <linearGradient id="bikeRed" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF4A4A" />
                    <stop offset="60%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#B91C1C" />
                  </linearGradient>

                  {/* Rider Jacket Red */}
                  <linearGradient id="jacketRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>

                  {/* White Box Shading */}
                  <linearGradient id="boxTopFace" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F1F5F9" />
                  </linearGradient>
                  <linearGradient id="boxSideFace" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>

                  {/* Soft Drop Shadows */}
                  <filter id="bikeShadow" x="-20%" y="-20%" width="140%" height="150%">
                    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#A6684F" floodOpacity="0.28" />
                  </filter>
                  <filter id="elementShadow" x="-20%" y="-20%" width="140%" height="150%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8C533C" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Stylized Intersecting Gray Road Paths */}
                <g>
                  {/* Road 1: Diagonal Northwest to Southeast */}
                  <polygon points="10,140 180,60 390,135 220,215" fill="none" />
                  <path
                    d="M 20,60 L 380,180"
                    stroke="url(#roadFade1)"
                    strokeWidth="42"
                    strokeLinecap="round"
                  />
                  {/* Dashed white center road lane */}
                  <path
                    d="M 50,70 L 350,170"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeDasharray="10 10"
                    strokeLinecap="round"
                    opacity="0.85"
                  />

                  {/* Road 2: Cross intersecting diagonal */}
                  <path
                    d="M 360,65 L 40,175"
                    stroke="url(#roadFade2)"
                    strokeWidth="38"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 330,76 L 70,164"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                </g>

                {/* Scattered 3D Element: Mini Green Trees */}
                {/* Tree 1: Left */}
                <g transform="translate(68, 85)" filter="url(#elementShadow)">
                  <ellipse cx="12" cy="24" rx="8" ry="3.5" fill="#C49B85" opacity="0.4" />
                  <rect x="10.5" y="14" width="3" height="10" fill="#78350F" rx="1" />
                  <polygon points="12,0 22,16 2,16" fill="#15803D" />
                  <polygon points="12,0 22,16 12,16" fill="#166534" />
                </g>

                {/* Tree 2: Upper Right */}
                <g transform="translate(325, 45)" filter="url(#elementShadow)">
                  <ellipse cx="10" cy="20" rx="7" ry="3" fill="#C49B85" opacity="0.4" />
                  <rect x="8.5" y="11" width="3" height="9" fill="#78350F" rx="1" />
                  <polygon points="10,0 19,13 1,13" fill="#22C55E" />
                  <polygon points="10,0 19,13 10,13" fill="#15803D" />
                </g>

                {/* Tree 3: Bottom Left Corner */}
                <g transform="translate(42, 175)" filter="url(#elementShadow)">
                  <ellipse cx="8" cy="16" rx="6" ry="2.5" fill="#C49B85" opacity="0.3" />
                  <rect x="7" y="9" width="2" height="7" fill="#78350F" />
                  <polygon points="8,0 15,10 1,10" fill="#16A34A" />
                </g>

                {/* Scattered 3D Element: Mini Parcel Box 1 (Left Roadside) */}
                <g transform="translate(105, 140)" filter="url(#elementShadow)">
                  <polygon points="8,0 16,4 8,8 0,4" fill="#F5C695" />
                  <polygon points="0,4 8,8 8,16 0,12" fill="#BD854E" />
                  <polygon points="8,8 16,4 16,12 8,16" fill="#A8723C" />
                  <path d="M 4,2 L 12,6 M 4,6 L 4,14" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* Scattered 3D Element: Mini Parcel Box 2 (Right Side) */}
                <g transform="translate(305, 148)" filter="url(#elementShadow)">
                  <polygon points="7,0 14,3.5 7,7 0,3.5" fill="#FDE68A" />
                  <polygon points="0,3.5 7,7 7,14 0,10.5" fill="#F59E0B" />
                  <polygon points="7,7 14,3.5 14,10.5 7,14" fill="#D97706" />
                </g>

                {/* Scattered 3D Element: Floating Red Map Pin */}
                <g transform="translate(262, 58)" filter="url(#elementShadow)">
                  <ellipse cx="10" cy="28" rx="6" ry="2.5" fill="#A86C54" opacity="0.45" />
                  <path
                    d="M 10,0 C 4.5,0 0,4.5 0,10 C 0,17 10,28 10,28 C 10,28 20,17 20,10 C 20,4.5 15.5,0 10,0 Z"
                    fill="url(#bikeRed)"
                  />
                  <circle cx="10" cy="10" r="4" fill="#FFFFFF" />
                  <circle cx="10" cy="10" r="2" fill="#EF4444" />
                </g>

                {/* 3D ISOMETRIC RED MOTORCYCLE WITH COURIER & WHITE DELIVERY BOX */}
                <g transform="translate(162, 78)" filter="url(#bikeShadow)">
                  {/* Ground Shadow under Bike */}
                  <ellipse cx="42" cy="74" rx="46" ry="12" fill="#87472A" opacity="0.32" />

                  {/* Rear Wheel */}
                  <g transform="translate(10, 52)">
                    <ellipse cx="12" cy="16" rx="12" ry="7" fill="#1E293B" />
                    <ellipse cx="12" cy="16" rx="7" ry="4" fill="#64748B" />
                    <circle cx="12" cy="16" r="2.5" fill="#CBD5E1" />
                  </g>

                  {/* Front Wheel */}
                  <g transform="translate(62, 60)">
                    <ellipse cx="12" cy="16" rx="12" ry="7" fill="#1E293B" />
                    <ellipse cx="12" cy="16" rx="7" ry="4" fill="#64748B" />
                    <circle cx="12" cy="16" r="2.5" fill="#CBD5E1" />
                  </g>

                  {/* Exhaust Pipe & Engine Block */}
                  <path d="M 24,65 L 48,68 L 44,72 L 20,68 Z" fill="#94A3B8" />
                  <circle cx="40" cy="62" r="5" fill="#475569" />

                  {/* Red Motorcycle Body Chassis */}
                  <path
                    d="M 22,54 L 46,50 L 68,44 L 74,48 L 62,60 L 38,62 Z"
                    fill="url(#bikeRed)"
                  />
                  {/* Front Fork & Windshield Bevel */}
                  <path d="M 64,42 L 72,56" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 65,36 L 73,34 L 71,44 L 63,45 Z" fill="#EF4444" />
                  {/* Headlight Flare */}
                  <polygon points="73,38 88,42 85,46 72,42" fill="#FEF08A" opacity="0.6" />

                  {/* Handlebars */}
                  <line x1="56" y1="36" x2="68" y2="34" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Courier Legs / Riding Pose */}
                  <path d="M 38,48 L 48,58 L 52,64" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Courier Jacket & Torso (Red Jacket) */}
                  <path
                    d="M 34,36 C 34,26 42,22 52,24 C 58,26 58,36 54,46 L 38,46 Z"
                    fill="url(#jacketRed)"
                  />
                  {/* White Zip / Accent Line */}
                  <path d="M 44,26 L 46,42" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                  {/* Courier Arm holding Handlebar */}
                  <path d="M 46,30 L 58,34 L 62,35" stroke="#DC2626" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Dark Glove */}
                  <circle cx="62" cy="35" r="2.5" fill="#1E293B" />

                  {/* Courier Red Helmet with Dark Visor */}
                  <ellipse cx="48" cy="17" rx="10" ry="11" fill="url(#bikeRed)" />
                  {/* Dark Visor with White Glint */}
                  <path d="M 52,14 Q 58,16 57,21 Q 50,22 47,20 Z" fill="#0F172A" />
                  <path d="M 52,15 Q 56,17 56,19" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                  {/* Helmet White Racing Stripe */}
                  <path d="M 40,16 Q 48,10 56,14" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.85" />

                  {/* WHITE DELIVERY BOX (Rear Mounted on Motorcycle) */}
                  <g transform="translate(6, 22)">
                    {/* Top Face */}
                    <polygon points="16,0 34,7 18,14 0,7" fill="url(#boxTopFace)" />
                    {/* Front Face (Left Side Isometric) */}
                    <polygon points="0,7 18,14 18,34 0,27" fill="#FFFFFF" />
                    {/* Right Shaded Face */}
                    <polygon points="18,14 34,7 34,27 18,34" fill="url(#boxSideFace)" />

                    {/* Red LogiRoute Chevron Branding on White Box */}
                    <path
                      d="M 6,17 L 10,21 L 14,15"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Latch */}
                    <rect x="8" y="11" width="3" height="4" fill="#64748B" rx="0.5" />
                  </g>
                </g>

                {/* Motion Wind Lines */}
                <path d="M 145,115 L 125,122" stroke="#FF8A65" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 135,126 L 120,131" stroke="#FF8A65" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* ================================================================== */}
          {/* MAIN CARD OVERLAY (Bottom 60%)                                    */}
          {/* Solid White Card with Rounded Top Corners (border-radius: 32px)   */}
          {/* ================================================================== */}
          <div className="relative z-20 bg-white rounded-t-[32px] -mt-7 flex-1 flex flex-col px-6 sm:px-7 pt-5 pb-5 shadow-[0_-16px_40px_rgba(0,0,0,0.08)] overflow-y-auto">
            
            {/* Header: Bold "Welcome Back" in Dark Charcoal */}
            <div className="mb-4 text-left">
              <h1 className="text-[24px] font-bold text-[#1E293B] tracking-tight leading-tight">
                Welcome Back
              </h1>
              <p className="text-[13px] text-[#94A3B8] mt-1 font-normal">
                Log in to your rider partner terminal
              </p>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="mb-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
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
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Rider ID or Email Field */}
              <div>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Rider ID or Email"
                    required
                    className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-[#F8FAFC] border border-slate-200/90 focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/15 rounded-2xl pl-12 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs"
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
              <div className="flex items-center justify-between pt-0.5 pb-0.5">
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

              {/* Wide Prominent "Log In" Button (Vibrant Orange-to-Coral Gradient) */}
              <div className="pt-1">
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

            {/* Forgot Password Toast */}
            {forgotToast && (
              <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-800">
                <span>Rider fleet reset link dispatched to partner desk.</span>
                <button
                  type="button"
                  onClick={() => setForgotToast(false)}
                  className="text-amber-500 hover:text-amber-700 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Subtle "Or Continue With" Divider */}
            <div className="relative flex py-3.5 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-xs font-normal">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Dual Equal-Width Side-by-Side Outlined Buttons (Google & Apple) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* Bottom Links: Apply as Rider & Quick Track as Guest */}
            <div className="space-y-2 text-center mt-auto pt-1">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setApplyModal(true)}
                  className="font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors ml-0.5"
                >
                  Apply as a Rider
                </button>
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleGuestTrack}
                  className="font-bold text-sm text-[#FF5722] hover:text-[#E64A19] transition-all inline-flex items-center gap-1 active:scale-95 group"
                >
                  <span>Quick Track as Guest</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              {/* Cross-App Navigation */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link to="/customer/login" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <span>Shopper App</span>
                </Link>
                <span>•</span>
                <Link to="/admin/login" className="hover:text-cyan-600 transition-colors flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Operations Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Home Indicator Bar (Mobile Mockup) */}
          <div className="w-full bg-white pb-1.5 pt-0.5 flex justify-center z-30">
            <div className="w-32 h-1 bg-slate-900/40 rounded-full" />
          </div>
        </div>

        {/* Modal: Apply as a Rider */}
        {applyModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#EF4444] flex items-center justify-center mx-auto mb-3">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Join LogiRoute Fleet</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Start delivering in 8–10 minute corridors. For testing and review, use verified Partner #DP-402.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleQuickFill();
                  setApplyModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs transition-all mb-2"
              >
                Sign In as Partner #DP-402
              </button>
              <button
                type="button"
                onClick={() => setApplyModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
