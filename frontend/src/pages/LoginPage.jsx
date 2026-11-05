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

// 3 Distinct 3D Coloured Cards Config
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
    subtitleColor: '#EA580C',
    desc: 'Browse instant quick-commerce grocery catalog, temperature badges, and real-time live 3D order tracking.',
    // Distinct Coloured Glass Gradient: Beautiful Peach-Pink & Coral-Orange
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(255, 240, 235, 0.88) 0%, rgba(255, 218, 205, 0.78) 45%, rgba(255, 192, 178, 0.82) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 25px 60px -15px rgba(255, 107, 74, 0.38), 0 10px 25px -5px rgba(255, 87, 34, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(255, 107, 74, 0.2)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(255, 192, 178, 0.45) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/85 text-[#FF451A]',
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
    badgeIconColor: '#3B82F6',
    accountInfo: 'Demo: rider@logiroute.ai',
    mailIconColor: '#6366F1',
    subtitleColor: '#E11D48',
    desc: 'Turn-by-turn routing navigation, cold-chain SLA telemetry, dispatch wave acceptance, and shift manager.',
    // Distinct Coloured Glass Gradient: Soft Lavender, Pink and Electric Orange
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(243, 232, 255, 0.88) 0%, rgba(228, 212, 255, 0.75) 35%, rgba(255, 222, 238, 0.80) 70%, rgba(255, 214, 208, 0.80) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 25px 60px -15px rgba(168, 85, 247, 0.35), 0 10px 25px -5px rgba(236, 72, 153, 0.24), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(168, 85, 247, 0.2)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/85 text-[#FF451A]',
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
    badgeIconColor: '#EA580C',
    accountInfo: 'Demo: admin@logiroute.ai',
    mailIconColor: '#EA580C',
    subtitleColor: '#C2410C',
    desc: 'GIS live fleet radar, multi-order wave dispatching, TSP route optimization, and dark store inventory sync.',
    // Distinct Coloured Glass Gradient: Warm Sunset Orange, Rose and Deep Peach
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(255, 244, 215, 0.90) 0%, rgba(255, 220, 170, 0.78) 40%, rgba(255, 192, 155, 0.80) 75%, rgba(255, 170, 150, 0.76) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 25px 60px -15px rgba(249, 115, 22, 0.40), 0 10px 25px -5px rgba(234, 88, 12, 0.26), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(249, 115, 22, 0.2)',
    },
    reflectionStyle: {
      background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.45) 0%, transparent 100%)',
    },
    iconBg: 'bg-white/85 text-[#EA580C]',
  }
];

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans overflow-x-hidden selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      
      {/* ==================================================================== */}
      {/* 3D SCENE BACKGROUND: Blurred City & Logistics Environment            */}
      {/* ==================================================================== */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 transform scale-[1.02]"
        style={{
          backgroundImage: `url('/assets/portal_bg_3d.png'), url('/assets/portal_reference.jpg')`,
          backgroundColor: '#FDEEE6',
        }}
      >
        {/* Soft Volumetric Sunset Atmosphere Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/35 via-transparent to-stone-900/30 pointer-events-none" />
      </div>

      <div className="max-w-6xl w-full z-10 py-6 sm:py-8 my-auto">
        
        {/* ==================================================================== */}
        {/* HEADER: Matching Reference Image                                     */}
        {/* ==================================================================== */}
        <div className="text-center mb-7 sm:mb-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/90 text-xs font-bold text-[#FF5722] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5722] animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] sm:text-xs">
              Smart 10-Minute Quick-Commerce Ecosystem
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2.5 sm:gap-3 text-[#0F172A]">
            <span>LogiRoute</span>
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FF5722] to-[#FF3D00] bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-medium mt-2 max-w-2xl mx-auto leading-relaxed px-2">
            Select your portal to experience the 3D customer marketplace, rider navigation HUD, or fulfillment control tower.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 3 DISTINCT COLOURED 3D GLASSMORPHISM CARDS                           */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 mb-6">
          {PORTALS.map((portal) => {
            const IconComponent = portal.icon;
            const BadgeIconComponent = portal.badgeIcon;

            return (
              <div key={portal.id} className="relative flex flex-col group">
                
                {/* Contact Shadow beneath Card */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-5 bg-stone-900/25 blur-xl rounded-full pointer-events-none" />

                {/* 3D Glassmorphic Card Container */}
                <div
                  style={portal.cardStyle}
                  className="rounded-[32px] p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative z-10 min-h-[380px]"
                >
                  <div>
                    {/* Top Row: Icon & Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      
                      {/* Rounded Square Icon Box */}
                      <div className={`w-12 h-12 rounded-2xl ${portal.iconBg} border border-white/95 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {/* Translucent Pill Badge */}
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 border border-white/95 text-slate-800 shadow-2xs flex items-center gap-1.5">
                        {BadgeIconComponent && (
                          <BadgeIconComponent className="w-3.5 h-3.5" style={{ color: portal.badgeIconColor }} />
                        )}
                        <span>{portal.badgeText}</span>
                      </span>
                    </div>

                    {/* Portal Title & Subtitle */}
                    <h2 className="text-[19px] sm:text-[20px] font-extrabold text-[#0F172A] tracking-tight mb-0.5">
                      {portal.title}
                    </h2>
                    <div className="text-[13px] font-bold mb-3" style={{ color: portal.subtitleColor }}>
                      {portal.subtitle}
                    </div>

                    {/* Description */}
                    <p className="text-[13px] text-slate-700 leading-relaxed font-normal mb-4">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Bottom Actions: Demo Account Pill & Primary CTA Button */}
                  <div className="pt-4 border-t border-white/40 space-y-3">
                    
                    {/* Demo Account Pill */}
                    <div className="text-[12px] font-semibold text-slate-700 bg-white/75 backdrop-blur-xs rounded-xl px-3 py-2 border border-white/85 flex items-center gap-2 shadow-2xs">
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: portal.mailIconColor }} />
                      <span className="truncate">{portal.accountInfo}</span>
                    </div>

                    {/* 3D Glossy Orange-Red Action Button */}
                    <Link
                      to={portal.path}
                      style={{
                        height: '48px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #FF6F43 0%, #FF3D00 100%)',
                        boxShadow: '0 8px 20px -3px rgba(255, 69, 26, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
                      }}
                      className="w-full text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{portal.buttonText}</span>
                    </Link>
                  </div>
                </div>

                {/* Ground Specular Reflection (Mirroring bottom of Card) */}
                <div
                  className="w-full h-8 mx-auto -mt-1 rounded-b-[28px] blur-[3px] opacity-25 pointer-events-none select-none hidden md:block"
                  style={portal.reflectionStyle}
                />

              </div>
            );
          })}
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
          <span>Role-Based Secure Access · LogiRoute AI Quick-Commerce Platform</span>
        </div>

      </div>
    </div>
  );
}
