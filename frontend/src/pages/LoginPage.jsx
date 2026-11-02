import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Bike,
  Building2,
  ArrowRight,
  ShieldCheck,
  Radio,
  Lock,
  ExternalLink
} from 'lucide-react';

const APPS = [
  {
    id: 'customer',
    title: 'Shopper Consumer App',
    subtitle: 'Groceries in 8–10 Minutes',
    role: 'CUSTOMER',
    path: '/customer/login',
    buttonText: 'Open Customer Login (/customer/login)',
    icon: ShoppingBag,
    color: 'emerald',
    badge: 'Blinkit / Zepto Style',
    themeBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500',
    accountInfo: 'Verified Account: customer@gmail.com',
    desc: 'Browse instant dark store inventory, live 8-minute SLA countdown, and 4-stage doorstep tracking.'
  },
  {
    id: 'rider',
    title: 'Delivery Partner HUD',
    subtitle: 'Fleet Logistics Companion',
    role: 'RIDER',
    path: '/rider/login',
    buttonText: 'Open Partner Login (/rider/login)',
    icon: Bike,
    color: 'amber',
    badge: 'Zepto Rider Style',
    themeBg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-400',
    accountInfo: 'Verified Fleet ID: rider@logiroute.ai (#DP-402)',
    desc: 'Order acceptance pings, Staging Bay B-02 bag handover, turn-by-turn road navigation, and proof of delivery.'
  },
  {
    id: 'admin',
    title: 'Dark Store Operations Console',
    subtitle: 'Internal Control Tower',
    role: 'ADMIN',
    path: '/admin/login',
    buttonText: 'Open Hub Manager Login (/admin/login)',
    icon: Building2,
    color: 'cyan',
    badge: 'Instamart Hub Lead',
    themeBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    btnBg: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40',
    accountInfo: 'Lead Operator: admin@logiroute.ai (Deekshitha)',
    desc: 'GIS fleet radar, 2-Opt TSP route untangling, wave dispatching, and 90-second dark store packing SLA.'
  }
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300 mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>SF QUICK-COMMERCE ECOSYSTEM // ZERO CROSS-ROLE BLEED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2.5">
            <span>LogiRoute</span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Fast Delivery Platform
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Unified Last-Mile Dispatch & Quick-Commerce Ecosystem
          </p>
        </div>

        {/* 3 Isolated App Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {APPS.map((app) => {
            const Icon = app.icon;

            return (
              <div
                key={app.id}
                className="bg-[#0b1220]/95 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between transition-all hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.themeBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                      {app.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white mb-1">
                    {app.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400 font-semibold mb-3">
                    {app.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {app.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-900/60 rounded-xl px-2.5 py-1.5 border border-slate-800/80 truncate">
                    {app.accountInfo}
                  </div>

                  {/* Primary Link Button: Direct Link to Dedicated Login Screen */}
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
            );
          })}
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-[11px] font-mono text-slate-500">
          Strict RBAC Gate Active · Authenticate with registered credentials to access each application
        </div>
      </div>
    </div>
  );
}
