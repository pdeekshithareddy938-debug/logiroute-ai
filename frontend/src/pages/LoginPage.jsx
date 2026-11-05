import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Interactive3DBackground from '../components/Interactive3DBackground';
import {
  ShoppingBag,
  Bike,
  Building2,
  ArrowRight,
  ShieldCheck,
  Radio,
  Lock,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';

const APPS = [
  {
    id: 'customer',
    title: 'Shopper Consumer App',
    subtitle: 'Groceries in 8–10 Minutes',
    role: 'CUSTOMER',
    path: '/customer/login',
    buttonText: 'Open Customer Login',
    icon: ShoppingBag,
    color: 'emerald',
    badge: '3D AI Market',
    themeBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500',
    accountInfo: 'Verified Account: customer@logiroute.ai',
    desc: 'Browse 3D dark store inventory with scroll-driven flight path, live 8-minute SLA countdown, and 4-stage doorstep tracking.'
  },
  {
    id: 'rider',
    title: 'Delivery Partner HUD',
    subtitle: 'Fleet Logistics Companion',
    role: 'RIDER',
    path: '/rider/login',
    buttonText: 'Open Partner Login',
    icon: Bike,
    color: 'amber',
    badge: 'Zepto Rider Style',
    themeBg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-400',
    accountInfo: 'Fleet ID: rider@logiroute.ai (#DP-402)',
    desc: 'Order acceptance pings, Staging Bay B-02 bag handover, turn-by-turn road navigation, and cold-chain proof of delivery.'
  },
  {
    id: 'admin',
    title: 'Dark Store Operations Console',
    subtitle: 'Internal Control Tower',
    role: 'ADMIN',
    path: '/admin/login',
    buttonText: 'Open Hub Manager Login',
    icon: Building2,
    color: 'cyan',
    badge: 'Control Tower',
    themeBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    btnBg: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40',
    accountInfo: 'Lead Operator: admin@logiroute.ai (Deekshitha)',
    desc: 'GIS fleet radar, 2-Opt TSP route untangling, wave dispatching, and 90-second dark store packing SLA.'
  }
];

function TiltPortalCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransform(`perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.12s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative group ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(56,189,248,${glare.opacity}), transparent 60%)`,
          mixBlendMode: 'screen'
        }}
      />
      {children}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#040811] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 3D WebGL Background Scene with Scroll-Driven Depth */}
      <Interactive3DBackground />

      {/* Cybernetic Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full z-10 py-6">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b192c]/90 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#f3c969] animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D WEBGL ENGINE // SCROLL-DRIVEN DISPATCH SIMULATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span>LogiRoute</span>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-[#f3c969] bg-clip-text text-transparent">
              3D AI Platform
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
            Unified Last-Mile Dispatch, 3D Quick-Commerce & Thermal Cold-Chain Fleet
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Explore 3D Customer Storefront →</span>
            </Link>
          </div>
        </div>

        {/* 3 Interactive 3D Tilt App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {APPS.map((app) => {
            const Icon = app.icon;

            return (
              <TiltPortalCard key={app.id}>
                <div className="bg-[#0b1424]/90 border border-cyan-900/60 hover:border-cyan-400/70 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between transition-all h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.themeBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900/80 border border-slate-800 text-cyan-300">
                        {app.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white mb-1">
                      {app.title}
                    </h3>
                    <div className="text-xs font-mono text-cyan-400 font-semibold mb-3">
                      {app.subtitle}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {app.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900/70 rounded-xl px-2.5 py-1.5 border border-slate-800/80 truncate">
                      {app.accountInfo}
                    </div>

                    <Link
                      to={app.path}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${app.btnBg}`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span className="font-mono">{app.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </TiltPortalCard>
            );
          })}
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict RBAC Active · 3D WebGL Flight Paths Accelerated by Three.js</span>
        </div>

      </div>
    </div>
  );
}
