import React from 'react';
import { Link } from 'react-router-dom';
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

// 3 Distinct Transparent 3D Glassmorphism Cards Config
const PORTALS = [
  {
    id: 'customer',
    title: 'Customer Storefront',
    subtitle: 'Shop Smart. Get Fast.',
    role: 'CUSTOMER',
    path: '/customer/login',
    buttonText: 'Customer Login →',
    icon: ShoppingBag,
    badgeText: 'Grocery & 3D Catalog',
    badgeIcon: null,
    accountInfo: 'Demo: customer@gmail.com',
    mailIconColor: '#EF4444',
    subtitleColor: '#C2410C',
    desc: 'Browse instant quick-commerce grocery catalog, temperature badges, and real-time live 3D order tracking.',
    // Premium Translucent Peach/Coral Glass
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(255, 222, 208, 0.46) 0%, rgba(255, 178, 158, 0.28) 45%, rgba(255, 142, 108, 0.40) 100%)',
      backdropFilter: 'blur(20px) saturate(190%)',
      WebkitBackdropFilter: 'blur(20px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.80)',
      boxShadow: '0 25px 60px -15px rgba(255, 87, 34, 0.32), 0 10px 25px -5px rgba(255, 87, 34, 0.18), inset 0 2px 3px rgba(255, 255, 255, 0.92), inset 0 -2px 3px rgba(255, 87, 34, 0.20)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 205, 185, 0.35) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(255, 87, 34, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(255, 170, 145, 0.35) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#FF451A] border border-white/90',
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
    badgeIcon: Zap,
    badgeIconColor: '#2563EB',
    accountInfo: 'Demo: rider@logiroute.ai',
    mailIconColor: '#6366F1',
    subtitleColor: '#BE123C',
    desc: 'Turn-by-turn routing navigation, cold-chain SLA telemetry, dispatch wave acceptance, and shift manager.',
    // Premium Translucent Soft Lavender / Pink Glass
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(236, 226, 255, 0.48) 0%, rgba(212, 198, 255, 0.30) 45%, rgba(198, 218, 255, 0.40) 100%)',
      backdropFilter: 'blur(20px) saturate(190%)',
      WebkitBackdropFilter: 'blur(20px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.82)',
      boxShadow: '0 25px 60px -15px rgba(168, 85, 247, 0.30), 0 10px 25px -5px rgba(147, 51, 234, 0.18), inset 0 2px 3px rgba(255, 255, 255, 0.92), inset 0 -2px 3px rgba(168, 85, 247, 0.20)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.52) 0%, rgba(222, 208, 255, 0.35) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.32) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#FF451A] border border-white/90',
  },
  {
    id: 'admin',
    title: 'Control Tower Console',
    subtitle: 'Manage. Monitor. Grow.',
    role: 'ADMIN',
    path: '/admin/login',
    buttonText: 'Admin Login →',
    icon: BarChart3,
    badgeText: 'Hub Operations',
    badgeIcon: Building2,
    badgeIconColor: '#D97706',
    accountInfo: 'Demo: admin@logiroute.ai',
    mailIconColor: '#EA580C',
    subtitleColor: '#B45309',
    desc: 'GIS live fleet radar, multi-order wave dispatching, TSP route optimization, and dark store inventory sync.',
    // Premium Translucent Warm Amber / Orange Glass
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(255, 242, 208, 0.50) 0%, rgba(255, 218, 155, 0.32) 45%, rgba(255, 178, 115, 0.40) 100%)',
      backdropFilter: 'blur(20px) saturate(190%)',
      WebkitBackdropFilter: 'blur(20px) saturate(190%)',
      border: '1.5px solid rgba(255, 255, 255, 0.80)',
      boxShadow: '0 25px 60px -15px rgba(249, 115, 22, 0.32), 0 10px 25px -5px rgba(234, 88, 12, 0.20), inset 0 2px 3px rgba(255, 255, 255, 0.90), inset 0 -2px 3px rgba(249, 115, 22, 0.20)',
    },
    demoPillStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 228, 165, 0.35) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.14), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.35) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/80 backdrop-blur-md text-[#EA580C] border border-white/90',
  }
];

export default function LoginPage() {
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
        {/* Subtle Warm Atmospheric Glow Overlay (Non-obstructive) */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-200/10 via-transparent to-stone-900/25 pointer-events-none" />
      </div>

      <div className="max-w-6xl w-full z-10 py-6 sm:py-8 my-auto">
        
        {/* ==================================================================== */}
        {/* HEADER: High-Contrast Modern Typography                              */}
        {/* ==================================================================== */}
        <div className="text-center mb-7 sm:mb-10">
          
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
                  className="rounded-[32px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] relative z-10 min-h-[385px] overflow-hidden"
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
                      
                      {/* Rounded Square Icon Box with Soft Inner Depth */}
                      <div className={`w-12 h-12 rounded-2xl ${portal.iconBg} shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {/* Translucent Glass Pill Badge */}
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/75 backdrop-blur-md border border-white/85 text-slate-800 shadow-2xs flex items-center gap-1.5">
                        {BadgeIconComponent && (
                          <BadgeIconComponent className="w-3.5 h-3.5" style={{ color: portal.badgeIconColor }} />
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

                  {/* Bottom Actions: Matching Translucent Frosted Glass Demo Pill & 3D CTA Button */}
                  <div className="relative z-10 pt-4 border-t border-white/45 space-y-3">
                    
                    {/* Demo Account Translucent Frosted Glass Pill (Theme-Matched) */}
                    <div 
                      style={portal.demoPillStyle}
                      className="text-[12px] font-semibold text-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: portal.mailIconColor }} />
                      <span className="truncate">{portal.accountInfo}</span>
                    </div>

                    {/* 3D Glossy Orange-to-Red Action Button */}
                    <Link
                      to={portal.path}
                      style={{
                        height: '50px',
                        borderRadius: '25px',
                        background: 'linear-gradient(135deg, #FF6F3D 0%, #FF3D00 100%)',
                        boxShadow: '0 10px 25px -3px rgba(255, 61, 0, 0.48), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -1.5px 2px rgba(180, 20, 0, 0.25)',
                      }}
                      className="w-full text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_14px_30px_-3px_rgba(255,61,0,0.6)] active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group/btn"
                    >
                      {/* Top Specular Sheen on Button */}
                      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[25px]" />
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
          <span>Role-Based Secure Access · LogiRoute AI Quick-Commerce Platform</span>
        </div>

      </div>
    </div>
  );
}
