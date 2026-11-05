import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Bike,
  Building2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';

const APPS = [
  {
    id: 'customer',
    title: 'Customer Storefront',
    subtitle: 'Shop Smart. Get Fast.',
    role: 'CUSTOMER',
    path: '/customer/login',
    buttonText: 'Customer Login →',
    icon: ShoppingBag,
    badge: 'Grocery & 3D Catalog',
    accentColor: '#FF6F43',
    bgPreview: '/assets/customer_bg_3d.png',
    accountInfo: 'Demo: customer@gmail.com',
    desc: 'Browse instant quick-commerce grocery catalog, temperature badges, and real-time live 3D order tracking.'
  },
  {
    id: 'rider',
    title: 'Delivery Partner HUD',
    subtitle: 'Deliver more. Earn more.',
    role: 'RIDER',
    path: '/rider/login',
    buttonText: 'Rider Login →',
    icon: Bike,
    badge: 'Fleet Partner',
    accentColor: '#FF5722',
    bgPreview: '/assets/rider_bg_3d.png',
    accountInfo: 'Demo: rider@logiroute.ai',
    desc: 'Turn-by-turn routing navigation, cold-chain SLA telemetry, dispatch wave acceptance, and shift manager.'
  },
  {
    id: 'admin',
    title: 'Control Tower Console',
    subtitle: 'Manage. Monitor. Grow.',
    role: 'ADMIN',
    path: '/admin/login',
    buttonText: 'Admin Login →',
    icon: Building2,
    badge: 'Hub Operations',
    accentColor: '#E64A19',
    bgPreview: '/assets/admin_bg_3d.png',
    accountInfo: 'Demo: admin@logiroute.ai',
    desc: 'GIS live fleet radar, multi-order wave dispatching, TSP route optimization, and dark store inventory sync.'
  }
];

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans overflow-x-hidden selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      
      {/* 3D Pastel Sky & Volumetric Lighting Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/rider_bg_3d.png')`,
          backgroundColor: '#FDEEE6',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/40 via-peach-100/30 to-stone-900/40 backdrop-blur-[6px]" />
      </div>

      <div className="max-w-5xl w-full z-10 py-6 my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/90 text-xs font-semibold text-[#FF451A] mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6F43] animate-pulse" />
            <span>SMART 10-MINUTE QUICK-COMMERCE ECOSYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight flex items-center justify-center gap-2.5">
            <span>LogiRoute</span>
            <span className="bg-gradient-to-r from-[#FF7A45] via-[#FF5722] to-[#E63900] bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto font-medium">
            Select your portal to experience the 3D customer marketplace, rider navigation HUD, or fulfillment control tower.
          </p>
        </div>

        {/* 3 Frosted Glass App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {APPS.map((app) => {
            const Icon = app.icon;

            return (
              <div
                key={app.id}
                className="bg-white/85 hover:bg-white/95 border border-white/95 rounded-[32px] p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(255,87,34,0.18),0_10px_25px_-5px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF3EC] to-[#FFE2D1] border border-[#FF5722]/30 flex items-center justify-center text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 border border-slate-200/90 text-slate-700 shadow-2xs">
                      {app.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#111827] tracking-tight mb-0.5">
                    {app.title}
                  </h2>
                  <div className="text-xs font-semibold text-[#FF5722] mb-3">
                    {app.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {app.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100/90 space-y-3">
                  <div className="text-[11px] font-mono font-medium text-slate-500 bg-slate-50/90 rounded-xl px-3 py-2 border border-slate-200/70 truncate">
                    {app.accountInfo}
                  </div>

                  <Link
                    to={app.path}
                    style={{
                      background: 'linear-gradient(135deg, #FF6F43 0%, #FF451A 100%)',
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs text-white shadow-lg shadow-[#FF5722]/30 hover:shadow-[#FF5722]/45 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{app.buttonText}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
          <span>Role-Based Secure Access · LogiRoute AI Quick-Commerce Platform</span>
        </div>

      </div>
    </div>
  );
}
