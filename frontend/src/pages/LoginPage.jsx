import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Bike,
  Building2,
  Lock,
  Sparkles,
  Zap,
  BarChart3,
  Mail,
  ShieldCheck
} from 'lucide-react';

// Dedicated SVG Icon for 3D Shopping Bag matching the reference image
function ShoppingBagIcon3D({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bagGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>
      </defs>
      {/* Bag Body */}
      <rect x="6" y="10" width="24" height="21" rx="5" fill="none" stroke="url(#bagGrad)" strokeWidth="3" />
      {/* Bag Handle */}
      <path d="M13 12V7C13 4.8 14.8 3 17 3H19C21.2 3 23 4.8 23 7V12" stroke="url(#bagGrad)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Dedicated SVG Icon for 3D Delivery Scooter matching the reference image
function ScooterIcon3D({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scooterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>
      </defs>
      {/* Motion lines */}
      <line x1="4" y1="14" x2="14" y2="14" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="20" x2="11" y2="20" stroke="#FF7A45" strokeWidth="2" strokeLinecap="round" />
      {/* Scooter Body & Wheels */}
      <circle cx="26" cy="30" r="6" stroke="#FF451A" strokeWidth="3.5" fill="#FFFFFF" />
      <circle cx="26" cy="30" r="2.5" fill="#FF451A" />
      <circle cx="48" cy="30" r="6" stroke="#FF451A" strokeWidth="3.5" fill="#FFFFFF" />
      <circle cx="48" cy="30" r="2.5" fill="#FF451A" />
      <path d="M 22,22 C 22,16 26,14 32,14 L 38,14 C 42,14 43,18 43,23 L 43,27 L 30,27 C 26,27 22,25 22,22 Z" fill="url(#scooterGrad)" />
      <path d="M 40,20 L 47,10 L 51,10" stroke="url(#scooterGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="17" y="10" width="10" height="9" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
    </svg>
  );
}

// Dedicated SVG Icon for 3D Bar Chart matching the reference image
function BarChartIcon3D({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFA040" />
          <stop offset="40%" stopColor="#FF6F22" />
          <stop offset="100%" stopColor="#E63900" />
        </linearGradient>
      </defs>
      {/* Bar 1 (Short) */}
      <rect x="6" y="19" width="6" height="13" rx="3" fill="url(#barGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
      {/* Bar 2 (Medium) */}
      <rect x="15" y="11" width="6" height="21" rx="3" fill="url(#barGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
      {/* Bar 3 (Tall) */}
      <rect x="24" y="4" width="6" height="28" rx="3" fill="url(#barGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
    </svg>
  );
}

// 3 Distinct Transparent 3D Glassmorphism Cards Config
const PORTALS = [
  {
    id: 'customer',
    title: 'Customer Storefront',
    subtitle: 'Shop Smart. Get Fast.',
    role: 'CUSTOMER',
    path: '/customer/login',
    buttonText: 'Customer Login →',
    icon: ShoppingBagIcon3D,
    badgeText: 'Grocery & 3D Catalog',
    badgeIcon: ShoppingBag,
    badgeIconColor: '#FF5722',
    badgeIconDropShadow: 'drop-shadow(0 0 3px rgba(255, 87, 34, 0.40))',
    badgeStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 246, 240, 0.70) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#0F172A',
      border: '1px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.95)',
    },
    accountInfo: 'Demo: customer@gmail.com',
    mailIconColor: '#EF4444',
    subtitleColor: '#EA580C',
    desc: 'Browse instant quick-commerce grocery catalog, temperature badges, and real-time live 3D order tracking.',
    // Luminous Frosted Glass Squircle for Symbol
    luminousGlassStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 240, 230, 0.55) 50%, rgba(255, 220, 205, 0.65) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 8px 20px -4px rgba(255, 120, 80, 0.25), 0 0 16px rgba(255, 255, 255, 0.80), inset 0 2px 3px rgba(255, 255, 255, 0.95)',
    },
    // Luminous Soft Cream & Warm Coral Glassmorphism
    cardStyle: {
      background: 'linear-gradient(168deg, rgba(255, 252, 248, 0.84) 0%, rgba(255, 235, 222, 0.68) 42%, rgba(255, 196, 182, 0.76) 100%)',
      backdropFilter: 'blur(24px) saturate(190%)',
      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.90)',
      boxShadow: '0 25px 50px -12px rgba(255, 120, 80, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(255, 255, 255, 0.40)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 232, 222, 0.45) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.90)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(255, 196, 182, 0.50) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#FF5722] border border-white/90',
  },
  {
    id: 'rider',
    title: 'Delivery Partner HUD',
    subtitle: 'Deliver more. Earn more.',
    role: 'RIDER',
    path: '/rider/login',
    buttonText: 'Rider Login →',
    icon: ScooterIcon3D,
    badgeText: 'Fleet Partner',
    badgeIcon: Bike,
    badgeIconColor: '#3B82F6',
    badgeIconDropShadow: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.40))',
    badgeStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 246, 255, 0.70) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#0F172A',
      border: '1px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.95)',
    },
    accountInfo: 'Demo: rider@logiroute.ai',
    mailIconColor: '#F97316',
    subtitleColor: '#EA580C',
    desc: 'Turn-by-turn routing navigation, cold-chain SLA telemetry, dispatch wave acceptance, and shift manager.',
    // Luminous Frosted Glass Squircle for Symbol
    luminousGlassStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 245, 255, 0.55) 50%, rgba(230, 220, 255, 0.65) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 8px 20px -4px rgba(129, 140, 248, 0.25), 0 0 16px rgba(255, 255, 255, 0.80), inset 0 2px 3px rgba(255, 255, 255, 0.95)',
    },
    // Luminous Icy-Lavender & Pale Purple-Pink Glassmorphism
    cardStyle: {
      background: 'linear-gradient(168deg, rgba(248, 250, 255, 0.84) 0%, rgba(228, 235, 255, 0.68) 42%, rgba(238, 208, 255, 0.76) 100%)',
      backdropFilter: 'blur(24px) saturate(190%)',
      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.90)',
      boxShadow: '0 25px 50px -12px rgba(165, 180, 252, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(255, 255, 255, 0.40)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(235, 225, 255, 0.45) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(165, 180, 252, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.90)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(238, 208, 255, 0.50) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#FF3D00] border border-white/90',
  },
  {
    id: 'admin',
    title: 'Control Tower Console',
    subtitle: 'Manage. Monitor. Grow.',
    role: 'ADMIN',
    path: '/admin/login',
    buttonText: 'Admin Login →',
    icon: BarChartIcon3D,
    badgeText: 'Hub Operations',
    badgeIcon: Building2,
    badgeIconColor: '#EA580C',
    badgeIconDropShadow: 'drop-shadow(0 0 3px rgba(234, 88, 12, 0.40))',
    badgeStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 250, 235, 0.70) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#0F172A',
      border: '1px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.95)',
    },
    accountInfo: 'Demo: admin@logiroute.ai',
    mailIconColor: '#EA580C',
    subtitleColor: '#EA580C',
    desc: 'GIS live fleet radar, multi-order wave dispatching, TSP route optimization, and dark store inventory sync.',
    // Luminous Frosted Glass Squircle for Symbol
    luminousGlassStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 248, 220, 0.55) 50%, rgba(255, 230, 185, 0.65) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.25), 0 0 16px rgba(255, 255, 255, 0.80), inset 0 2px 3px rgba(255, 255, 255, 0.95)',
    },
    // Luminous Sunny Pastel Yellow & Warm Peach Glassmorphism
    cardStyle: {
      background: 'linear-gradient(168deg, rgba(255, 254, 235, 0.88) 0%, rgba(254, 240, 185, 0.72) 42%, rgba(254, 212, 160, 0.78) 100%)',
      backdropFilter: 'blur(24px) saturate(190%)',
      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.90)',
      boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(255, 255, 255, 0.40)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 244, 215, 0.45) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.90)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(254, 212, 160, 0.50) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#EA580C] border border-white/90',
  }
];

export default function LoginPage() {
  const { enableDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoAccess = (role) => {
    enableDemoMode(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RIDER') navigate('/rider');
    else if (role === 'CUSTOMER') navigate('/customer');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full relative flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans overflow-x-hidden selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      
      {/* ==================================================================== */}
      {/* 100% STATIONARY FIXED 3D BACKGROUND (Zero Mobile Touch Shift)        */}
      {/* ==================================================================== */}
      <div 
        aria-hidden="true"
        className="fixed top-0 left-0 w-full h-screen h-[100dvh] z-0 pointer-events-none select-none overflow-hidden"
        style={{
          backgroundImage: `url('/assets/portal_bg_3d.png'), url('/assets/portal_reference.jpg')`,
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
        {/* Subtle Warm Atmospheric Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/10 via-transparent to-stone-900/25 pointer-events-none" />
      </div>

      <div className="max-w-6xl w-full z-10 py-6 sm:py-8 my-auto">
        
        {/* ==================================================================== */}
        {/* HEADER: High-Contrast Modern Typography                              */}
        {/* ==================================================================== */}
        <div className="text-center mb-6 sm:mb-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs font-bold text-[#FF5722] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5722] animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] sm:text-xs">
              Smart 10-Minute Quick-Commerce Ecosystem
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2.5 sm:gap-3 text-[#0F172A] drop-shadow-xs">
            <span>LogiRoute</span>
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FF5722] to-[#FF3D00] bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-800 font-semibold mt-2 max-w-2xl mx-auto leading-relaxed px-2 drop-shadow-2xs">
            Select your portal to experience the 3D customer marketplace, rider navigation HUD, or fulfillment control tower.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 3 TRANSLUCENT 3D GLASSMORPHISM CARDS (With Specular Highlights)      */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 mb-6">
          {PORTALS.map((portal) => {
            const IconComponent = portal.icon;
            const BadgeIconComponent = portal.badgeIcon;

            return (
              <div key={portal.id} className="relative flex flex-col group">
                
                {/* Contact Shadow beneath Card on the Reflective Ground */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-5 bg-stone-900/25 blur-xl rounded-full pointer-events-none" />

                {/* 3D Glass Card Container */}
                <div
                  style={portal.cardStyle}
                  className="rounded-[32px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] relative z-10 min-h-[420px] overflow-hidden"
                >
                  
                  {/* Glossy Specular Diagonal Glass Glare Reflection */}
                  <div 
                    className="absolute inset-0 pointer-events-none rounded-[32px]"
                    style={{
                      background: 'linear-gradient(125deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.10) 35%, transparent 60%)',
                    }}
                  />

                  {/* Luminous Top Bevel Edge Highlight */}
                  <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none" />

                  {/* Content Container (Layered above specular glare) */}
                  <div className="relative z-10">
                    
                    {/* Top Row: Icon & Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      
                      {/* Luminous Glass Symbol Box matching reference image */}
                      <div 
                        style={portal.luminousGlassStyle}
                        className="w-[52px] h-[52px] rounded-[18px] flex items-center justify-center relative overflow-hidden group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-300 select-none shadow-sm"
                      >
                        {/* Specular Diagonal/Top Glass Glare Highlight */}
                        <div 
                          className="absolute top-0 inset-x-0 h-[48%] rounded-t-[18px] pointer-events-none"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 60%, transparent 100%)',
                          }}
                        />
                        
                        {/* The 3D Luminous Symbol */}
                        <div className="relative z-10 flex items-center justify-center">
                          <IconComponent className="w-7 h-7" />
                        </div>
                      </div>

                      {/* Translucent Glass Pill Badge */}
                      <span 
                        style={portal.badgeStyle}
                        className="px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all select-none"
                      >
                        {BadgeIconComponent && (
                          <BadgeIconComponent 
                            className="w-3.5 h-3.5 shrink-0 stroke-[2.4]" 
                            style={{ 
                              color: portal.badgeIconColor,
                              filter: portal.badgeIconDropShadow || `drop-shadow(0 0 3.5px ${portal.badgeIconColor}95)`
                            }} 
                          />
                        )}
                        <span>{portal.badgeText}</span>
                      </span>
                    </div>

                    {/* Portal Title & Subtitle */}
                    <h2 className="text-[20px] font-black text-[#0F172A] tracking-tight mb-1">
                      {portal.title}
                    </h2>
                    <div className="text-[13px] font-bold mb-3 tracking-wide" style={{ color: portal.subtitleColor }}>
                      {portal.subtitle}
                    </div>

                    {/* Description: Highly Readable Dark Slate Text */}
                    <p className="text-[13px] text-slate-800 leading-relaxed font-medium mb-4">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Bottom Actions: Matching Translucent Frosted Glass Demo Pill & Action Buttons */}
                  <div className="relative z-10 pt-4 border-t border-white/45 space-y-2.5">
                    
                    {/* Demo Account Translucent Frosted Glass Pill (Theme-Matched) */}
                    <div 
                      style={portal.demoPillStyle}
                      className="text-[12px] font-semibold text-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: portal.mailIconColor }} />
                      <span className="truncate">{portal.accountInfo}</span>
                    </div>

                    {/* PROMINENT DEMO ACCESS BUTTON (Bypass Backend Directly) */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemoAccess(portal.role)}
                      style={{
                        height: '46px',
                        borderRadius: '23px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                        boxShadow: '0 8px 20px -2px rgba(16, 185, 129, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.55)',
                      }}
                      className="w-full text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group/demobtn"
                    >
                      <Zap className="w-3.5 h-3.5 z-10 text-amber-200 fill-amber-200" />
                      <span className="z-10">Quick Demo</span>
                    </button>

                    {/* 3D Glossy Orange-to-Red Standard Login Button */}
                    <Link
                      to={portal.path}
                      style={{
                        height: '42px',
                        borderRadius: '21px',
                        background: 'linear-gradient(135deg, #FF6F3D 0%, #FF3D00 100%)',
                        boxShadow: '0 8px 20px -3px rgba(255, 61, 0, 0.40), inset 0 1.5px 2px rgba(255, 255, 255, 0.65)',
                      }}
                      className="w-full text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group/btn"
                    >
                      {/* Top Specular Sheen on Button */}
                      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[21px]" />
                      <Lock className="w-3.5 h-3.5 z-10" />
                      <span className="z-10">{portal.buttonText}</span>
                    </Link>
                  </div>
                </div>

                {/* Ground Specular Reflection (Mirroring bottom of Card) */}
                <div
                  className="w-full h-8 mx-auto -mt-1 rounded-b-[28px] blur-[3px] opacity-30 pointer-events-none select-none hidden md:block"
                  style={portal.reflectionStyle}
                />

              </div>
            );
          })}
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 pt-2 drop-shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
          <span>Role-Based Secure Access • LogiRoute AI Quick-Commerce Platform</span>
        </div>

      </div>
    </div>
  );
}
