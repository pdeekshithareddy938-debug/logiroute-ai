import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dispatchAPI } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Bike,
  Package,
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  Flame,
  Snowflake,
  Heart,
  ShoppingCart,
  Zap,
  Phone,
  Radio,
  SlidersHorizontal,
  Navigation,
  Compass,
  Layers,
  ThermometerSnowflake,
  ShieldAlert,
  Volume2
} from 'lucide-react';

// Fix Leaflet Default Icon in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom 3D Glowing EV Courier Marker for Leaflet
const courierIcon = L.divIcon({
  className: 'custom-courier-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px;">
      <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(6, 182, 212, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #0284c7); border: 2px solid #ffffff; box-shadow: 0 0 15px #06b6d4; display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Custom Depot Marker (HUB-01)
const depotIcon = L.divIcon({
  className: 'custom-depot-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; border-radius: 10px; background: #064e3b; border: 2px solid #10b981; box-shadow: 0 0 12px #10b981; display: flex; align-items: center; justify-content: center; color: #10b981;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom Destination Pin Marker (Customer Doorstep)
const destIcon = L.divIcon({
  className: 'custom-dest-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #92400e; border: 2px solid #f59e0b; box-shadow: 0 0 14px #f59e0b; display: flex; align-items: center; justify-content: center; color: #fef3c7;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

// Simulated Corridor Coordinates (Market St, SF corridor)
const CORRIDOR_POINTS = [
  [37.7885, -122.4015], // Hub-01
  [37.7845, -122.4072],
  [37.7812, -122.4118], // Current Courier location
  [37.7778, -122.4160],
  [37.7745, -122.4195], // Doorstep
];

// High-End Culinary Catalog with Hyper-Realistic Studio Visual Assets & Thermal States
const CULINARY_CATALOG = [
  {
    id: 'prod-wagyu-burger',
    name: 'Wagyu Smash Truffle Burger & Brioche',
    category: 'Gourmet Hot Eats',
    thermalState: 'HOT',
    badgeText: '🔥 Hot & Fresh',
    tempDesc: '68°C Thermally Insulated',
    weight: '380g',
    price: 14.50,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    description: 'Double A5 Wagyu patties, melted cave-aged Gruyère, black winter truffle aioli, toasted artisanal brioche.',
  },
  {
    id: 'prod-cold-brew',
    name: 'Artisan Cold Brew Nitrogen Coffee',
    category: 'Beverages',
    thermalState: 'CHILLED',
    badgeText: '🧊 Chilled (4°C)',
    tempDesc: '3.8°C Active Micro-Chamber',
    weight: '350ml',
    price: 5.20,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    description: 'Single-origin Ethiopian Yirgacheffe steeped 24 hours with velvety cascading nitrogen foam.',
  },
  {
    id: 'prod-sesame-gelato',
    name: 'Hokkaido Roasted Black Sesame Gelato',
    category: 'Frozen Desserts',
    thermalState: 'FROZEN',
    badgeText: '❄️ Frozen (-18°C)',
    tempDesc: '-18.5°C Sub-Zero Cryo Box',
    weight: '500g',
    price: 7.90,
    eta: '10 mins',
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80',
    description: 'Slow-churned Hokkaido milk with stone-ground toasted black sesame and Madagascar Bourbon vanilla.',
  },
  {
    id: 'prod-burrata-pizza',
    name: 'Woodfired Burrata & Prosciutto Pizza',
    category: 'Gourmet Hot Eats',
    thermalState: 'HOT',
    badgeText: '🔥 Hot & Fresh',
    tempDesc: '72°C Hot Stone Enclosure',
    weight: '450g',
    price: 16.80,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    description: '48-hour fermented leopard crust, San Marzano tomato coulis, molten pugliese burrata, aged prosciutto di Parma.',
  },
  {
    id: 'prod-farm-milk',
    name: 'Organic Farm Fresh Whole Milk & Cream',
    category: 'Cold Chain & Dairy',
    thermalState: 'CHILLED',
    badgeText: '🧊 Chilled (4°C)',
    tempDesc: '4.1°C Chilled Vault',
    weight: '1 Litre',
    price: 3.90,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Non-homogenized pasture-raised organic whole milk with heavy cream top from Sonoma County dairy.',
  },
  {
    id: 'prod-blackberry-sorbet',
    name: 'Wild French Blackberry & Mint Sorbet',
    category: 'Frozen Desserts',
    thermalState: 'FROZEN',
    badgeText: '❄️ Frozen (-18°C)',
    tempDesc: '-18.0°C Sub-Zero Seal',
    weight: '480g',
    price: 6.90,
    eta: '10 mins',
    img: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&q=80',
    description: 'Pureed wild French mountain blackberries churned with organic agave nectar and crystallized spearmint.',
  },
  {
    id: 'prod-matcha-latte',
    name: 'Uji Ceremonial Chilled Matcha Latte',
    category: 'Beverages',
    thermalState: 'CHILLED',
    badgeText: '🧊 Chilled (4°C)',
    tempDesc: '3.5°C Chilled Bottle',
    weight: '320ml',
    price: 5.80,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    description: 'First-harvest Kyoto ceremonial green tea whisked over cold oat milk and clover honey.',
  },
  {
    id: 'prod-garlic-focaccia',
    name: 'Rosemary Confit Garlic Butter Focaccia',
    category: 'Artisan Bakery',
    thermalState: 'HOT',
    badgeText: '🔥 Hot & Fresh',
    tempDesc: '65°C Heated Hearth',
    weight: '340g',
    price: 6.20,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Oven-warm bubbly focaccia baked with roasted sweet garlic cloves, Maldon flaked sea salt, and fresh garden rosemary.',
  },
];

const CATEGORIES = [
  'All Items',
  'Gourmet Hot Eats',
  'Cold Chain & Dairy',
  'Frozen Desserts',
  'Beverages',
  'Artisan Bakery',
];

export default function CustomerStorefrontPage() {
  const { user, logout } = useAuth();

  // REQUIRED STATE: Interactive "Track Order" State Handling
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Shopping Cart & Wishlist States
  const [cart, setCart] = useState({
    'prod-wagyu-burger': 1,
    'prod-cold-brew': 1,
  });
  const [wishlist, setWishlist] = useState({ 'prod-wagyu-burger': true });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filtering
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Live Order Telemetry State
  const [secondsRemaining, setSecondsRemaining] = useState(480); // 8 minutes countdown
  const [activeStep, setActiveStep] = useState(3); // 1: Placed, 2: Packing, 3: Dispatched, 4: Arrived

  // Notification Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Live Countdown Timer
  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [secondsRemaining]);

  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }, [secondsRemaining]);

  // Cart operations
  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
    triggerToast(`Added ${product.name} to cart`);
  };

  const handleDecreaseQuantity = (productId, e) => {
    e?.stopPropagation();
    setCart((prev) => {
      const cur = prev[productId] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: cur - 1 };
    });
  };

  const handleToggleWishlist = (productId, e) => {
    e?.stopPropagation();
    setWishlist((prev) => {
      const next = !prev[productId];
      triggerToast(next ? 'Saved to culinary wishlist' : 'Removed from wishlist');
      return { ...prev, [productId]: next };
    });
  };

  // Cart Calculations
  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [pId, qty]) => {
      const prod = CULINARY_CATALOG.find((p) => p.id === pId);
      return sum + (prod ? prod.price * qty : 0);
    }, 0);
  }, [cart]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return CULINARY_CATALOG.filter((item) => {
      const matchCat = selectedCategory === 'All Items' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex items-center justify-center p-0 sm:py-6 sm:px-4 font-sans selection:bg-[#38bdf8]/30 selection:text-white">
      
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-[#0b192c]/95 border border-[#38bdf8]/50 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center gap-2 backdrop-blur-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BORDERLESS, FLAT PORTRAIT MOBILE ARTBOARD (#0B192C)                  */}
      {/* (No physical smartphone bezels or phone casing mockups)              */}
      {/* ==================================================================== */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[890px] sm:max-h-[96vh] bg-[#0b192c] sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(56,189,248,0.15)] flex flex-col relative overflow-hidden">
        
        {/* Subtle Ambient Studio Lighting in Background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================== */}
        {/* TOP BRAND & TELEMETRY HEADER                                       */}
        {/* ================================================================== */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between z-20 border-b border-cyan-950/60 bg-[#0b192c]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] p-[1px] shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              <div className="w-full h-full bg-[#0b192c] rounded-[11px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">LogiRoute</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#f3c969] border border-[#d4af37]/40">
                  AI MARKET
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#38bdf8]" />
                <span>100 Market St, Financial Pod</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-[#0e2238] border border-cyan-900/60 text-slate-300 hover:text-white hover:border-[#38bdf8]/60 transition-all shadow-xs"
            >
              <ShoppingCart className="w-4 h-4 text-[#38bdf8]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {/* User Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#0e2238] border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================================================================== */}
        {/* CONDITIONAL RENDERING: TRACKING VIEW vs MARKETPLACE FEED           */}
        {/* ================================================================== */}
        
        {/* ------------------------------------------------------------------ */}
        {/* CASE A: LIVE TRACKING VIEW (When isTrackingActive === true)         */}
        {/* ------------------------------------------------------------------ */}
        {isTrackingActive ? (
          <div className="flex-1 flex flex-col overflow-y-auto animate-fadeIn relative z-10 bg-[#0b192c]">
            
            {/* Top Tracker Control Strip */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-cyan-900/40 bg-[#0e2238]/60">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06b6d4]"></span>
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-[#38bdf8]">
                  MISSION: CORRIDOR ALPHA-402
                </span>
              </div>

              {/* REQUIRED: [Close Tracker] Button */}
              <button
                onClick={() => setIsTrackingActive(false)}
                className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-[#d4af37]/60 text-[#f3c969] text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>[Close Tracker]</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive 3D Map Canvas */}
            <div className="relative h-64 w-full shrink-0 border-b border-cyan-900/40 overflow-hidden">
              <MapContainer
                center={[37.7812, -122.4118]}
                zoom={14}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                className="w-full h-full"
                style={{ background: '#070f1e' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />

                {/* Glowing Active Route Polyline */}
                <Polyline
                  positions={CORRIDOR_POINTS}
                  pathOptions={{
                    color: '#06b6d4',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round',
                  }}
                />

                {/* Start Depot (HUB-01) */}
                <Marker position={CORRIDOR_POINTS[0]} icon={depotIcon}>
                  <Popup className="custom-dark-popup">
                    <span className="text-xs font-mono font-bold">HUB-01 Market St Pod</span>
                  </Popup>
                </Marker>

                {/* Courier EV Bike Beacon */}
                <Marker position={CORRIDOR_POINTS[2]} icon={courierIcon}>
                  <Popup className="custom-dark-popup">
                    <span className="text-xs font-mono font-bold">Partner #DP-402 (Ather 450X)</span>
                  </Popup>
                </Marker>

                {/* Customer Doorstep Destination */}
                <Marker position={CORRIDOR_POINTS[4]} icon={destIcon}>
                  <Popup className="custom-dark-popup">
                    <span className="text-xs font-mono font-bold">Your Doorstep (100 Market St)</span>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Floating Over-Map Telemetry HUD */}
              <div className="absolute top-3 left-3 z-[1000] bg-[#0b192c]/90 border border-cyan-900/80 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg flex items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1 text-[#38bdf8]">
                  <Bike className="w-3.5 h-3.5" />
                  <span>34 km/h</span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-1 text-emerald-400">
                  <ThermometerSnowflake className="w-3.5 h-3.5" />
                  <span>3.8°C Cold</span>
                </div>
              </div>

              {/* Map Recenter Radar Button */}
              <div className="absolute bottom-3 right-3 z-[1000]">
                <div className="px-2.5 py-1 rounded-md bg-[#0b192c]/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow-md">
                  🛰️ GPS 2-OPT LOCKED
                </div>
              </div>
            </div>

            {/* Live ETA Countdown & Status Header */}
            <div className="p-5 space-y-4">
              <div className="bg-[#0e2238] rounded-2xl border border-cyan-900/60 p-4 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ESTIMATED ARRIVAL
                  </div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#38bdf8] font-mono tracking-tight mt-0.5">
                    {formattedCountdown}
                  </div>
                  <div className="text-xs text-[#d4af37] font-semibold flex items-center gap-1 mt-1">
                    <Zap className="w-3.5 h-3.5 fill-[#d4af37]" />
                    <span>Sub-10 Min SLA Guaranteed</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06b6d4]/20 to-[#38bdf8]/10 border border-[#06b6d4]/40 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[10px] text-slate-400 font-mono">SPEED</span>
                    <span className="text-base font-extrabold text-[#38bdf8] font-mono">34</span>
                    <span className="text-[9px] text-slate-400 font-mono">KM/H</span>
                  </div>
                </div>
              </div>

              {/* REQUIRED: 4-Stage Progress Step Bar */}
              <div className="bg-[#0e2238] rounded-2xl border border-cyan-900/60 p-4 shadow-lg space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Delivery Pipeline</span>
                  <span className="text-[#38bdf8] font-mono text-[11px]">STAGE 3 / 4</span>
                </div>

                {/* Visual Step Bar */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { step: 1, label: 'Order Placed', time: '18:50' },
                    { step: 2, label: 'Hub Packing', time: '18:52' },
                    { step: 3, label: 'Rider Dispatched', time: '18:54' },
                    { step: 4, label: 'Arrived', time: '18:58' },
                  ].map((s) => {
                    const isCompleted = activeStep > s.step;
                    const isCurrent = activeStep === s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center text-center">
                        <div
                          className={`w-full h-1.5 rounded-full mb-2 transition-all ${
                            isCompleted
                              ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]'
                              : isCurrent
                              ? 'bg-[#06b6d4] shadow-[0_0_10px_#06b6d4] animate-pulse'
                              : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold leading-tight ${
                            isCurrent
                              ? 'text-[#38bdf8]'
                              : isCompleted
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">{s.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Partner Profile & Audio Call Link */}
              <div className="bg-[#0e2238] rounded-2xl border border-cyan-900/60 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] p-[1px]">
                    <div className="w-full h-full bg-[#0b192c] rounded-[11px] flex items-center justify-center">
                      <Bike className="w-6 h-6 text-[#38bdf8]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ravi Kumar (#DP-402)</div>
                    <div className="text-[11px] text-slate-400 font-mono">Ather 450X (EV-Fleet) · 92% EV</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      ✓ Thermal Seal Secured
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerToast('Connecting encrypted dispatch voice line to courier...')}
                    className="p-2.5 rounded-xl bg-[#06b6d4]/20 border border-[#06b6d4]/50 text-[#38bdf8] hover:bg-[#06b6d4]/30 transition-colors shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Close Button Action */}
              <div className="pt-2 pb-4">
                <button
                  onClick={() => setIsTrackingActive(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(212,175,55,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Culinary Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* CASE B: STANDARD MARKETPLACE PRODUCT FEED (isTrackingActive false) */
          /* ------------------------------------------------------------------ */
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10 pb-20">
            
            {/* ================================================================ */}
            {/* REQUIRED: TOP "LIVE COLD-CHAIN DELIVERY" TRACKING BANNER CARD     */}
            {/* Click Action: Toggles isTrackingActive to true                   */}
            {/* ================================================================ */}
            <div className="p-4 pb-2">
              <div
                onClick={() => setIsTrackingActive(true)}
                className="bg-gradient-to-r from-[#062038] via-[#0b2848] to-[#081e35] rounded-2xl border border-cyan-500/50 p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative overflow-hidden cursor-pointer group active:scale-[0.99] transition-all"
              >
                {/* Glow Radial Accents */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#06b6d4]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38bdf8]"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#38bdf8] tracking-wider uppercase">
                      Live Cold-Chain Delivery
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f3c969] text-[10px] font-mono font-bold">
                    ORDER #LR-8821
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                      <span>Arriving in 8 mins</span>
                      <Zap className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                      Partner #DP-402 on Ather 450X · 3.8°C Maintained
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Micro Stepper Line */}
                <div className="mt-3 pt-2.5 border-t border-cyan-900/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400">✓ Packed</span>
                  <span className="text-[#38bdf8] font-bold">● In-Transit (Corridor Alpha)</span>
                  <span className="text-slate-500">○ Doorstep</span>
                  <span className="text-[#f3c969] font-bold">Tap to Track Live ➔</span>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artisanal groceries & hot eats..."
                  className="w-full bg-[#0e2238] border border-cyan-900/60 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Category Pill Carousel */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-slate-950 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                          : 'bg-[#0e2238] border border-cyan-900/50 text-slate-300 hover:border-cyan-700/60'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <h4 className="font-extrabold text-sm text-white tracking-tight">
                  Artisanal Cold-Chain & Hot Picks
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {filteredProducts.length} ITEMS
              </span>
            </div>

            {/* Product Card Grid (2-Column Portrait Grid) */}
            <div className="px-4 grid grid-cols-2 gap-3">
              {filteredProducts.map((prod) => {
                const qty = cart[prod.id] || 0;
                const isSaved = !!wishlist[prod.id];

                return (
                  <div
                    key={prod.id}
                    className="bg-[#0e2238]/90 border border-cyan-900/50 hover:border-[#38bdf8]/50 rounded-2xl p-2.5 flex flex-col justify-between shadow-lg transition-all group relative overflow-hidden backdrop-blur-md"
                  >
                    {/* Top Row: Temperature State Badge & Wishlist */}
                    <div className="flex items-start justify-between z-10 mb-1.5 gap-1">
                      {/* Thermal Badge Rendering with Specific Atmospheric Effects */}
                      {prod.thermalState === 'HOT' && (
                        <div className="bg-gradient-to-r from-amber-950/90 to-rose-950/90 border border-orange-500/60 text-orange-400 font-bold px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_10px_rgba(249,115,22,0.4)] flex items-center gap-1 backdrop-blur-md">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-pulse" />
                          <span>Hot & Fresh</span>
                          {/* Rising steam micro-animation */}
                          <div className="flex items-center gap-0.5 ml-0.5">
                            <span className="w-0.5 h-1.5 bg-orange-300/80 rounded-full animate-pulse" />
                            <span className="w-0.5 h-2 bg-rose-300/80 rounded-full animate-bounce" />
                          </div>
                        </div>
                      )}

                      {prod.thermalState === 'CHILLED' && (
                        <div className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-400/60 text-cyan-300 font-bold px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1 backdrop-blur-md">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                          </span>
                          <span>Chilled 4°C</span>
                        </div>
                      )}

                      {prod.thermalState === 'FROZEN' && (
                        <div className="bg-gradient-to-r from-blue-950/90 to-indigo-950/90 border border-blue-400/70 text-blue-200 font-bold px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_12px_rgba(96,165,250,0.5)] flex items-center gap-1 backdrop-blur-md">
                          <Snowflake className="w-3 h-3 text-blue-300 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>Frozen -18°C</span>
                        </div>
                      )}

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => handleToggleWishlist(prod.id, e)}
                        className="w-6 h-6 rounded-full bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Hyper-Realistic 3D / Studio Visual Asset */}
                    <div className="h-28 w-full rounded-xl overflow-hidden my-1 relative bg-slate-900/50">
                      <img
                        src={prod.img}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Depth Gradient Mask */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e2238] via-transparent to-transparent opacity-80" />
                      
                      {/* Weight pill overlay */}
                      <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono font-bold text-slate-300 border border-white/10">
                        {prod.weight}
                      </div>
                    </div>

                    {/* Product Typography */}
                    <div className="mt-1 space-y-0.5">
                      <h5 className="font-extrabold text-white text-xs leading-tight line-clamp-1 group-hover:text-[#38bdf8] transition-colors">
                        {prod.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Price & Instant Micro-Animated [+ ADD] Button */}
                    <div className="mt-2 pt-2 border-t border-cyan-950/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-[#f3c969] font-mono leading-none">
                          ${prod.price.toFixed(2)}
                        </div>
                        <div className="text-[9px] text-[#38bdf8] font-mono mt-0.5">
                          ⚡ {prod.eta}
                        </div>
                      </div>

                      {/* Micro-Animated Add Button / Stepper */}
                      {qty > 0 ? (
                        <div className="flex items-center gap-1 bg-[#062038] border border-[#38bdf8]/50 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                          <button
                            onClick={(e) => handleDecreaseQuantity(prod.id, e)}
                            className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs hover:bg-slate-700 active:scale-90 transition-transform"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-extrabold text-white px-1 font-mono">{qty}</span>
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="w-4 h-4 rounded-full bg-[#38bdf8] text-slate-950 flex items-center justify-center font-bold text-xs hover:bg-[#0284c7] active:scale-90 transition-transform"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:brightness-110 text-slate-950 font-black text-[11px] shadow-[0_0_10px_rgba(212,175,55,0.3)] active:scale-90 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* STICKY BOTTOM FLOATING CART BAR (When in marketplace & cart > 0)   */}
        {/* ================================================================== */}
        {!isTrackingActive && cartItemCount > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-30 animate-fadeIn">
            <div className="bg-[#0e2238]/95 border border-[#d4af37]/60 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37] text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-sm">
                  {cartItemCount}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Cart Total: ${cartSubtotal.toFixed(2)}</div>
                  <div className="text-[10px] text-[#38bdf8] font-mono">Cold-Chain SLA Locked</div>
                </div>
              </div>

              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* SHOPPING CART SLIDE-OVER DRAWER                                    */}
        {/* ================================================================== */}
        {isCartDrawerOpen && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-fadeIn">
            <div className="bg-[#0b192c] border-t border-[#38bdf8]/40 rounded-t-3xl max-h-[85%] flex flex-col justify-between shadow-2xl p-5">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#38bdf8]" />
                  <span className="font-extrabold text-white text-sm">
                    Cold-Chain Order Summary ({cartItemCount} items)
                  </span>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#0e2238] border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List with Thermal Zone Routing */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-72 no-scrollbar">
                {Object.entries(cart).map(([pId, qty]) => {
                  const prod = CULINARY_CATALOG.find((p) => p.id === pId);
                  if (!prod) return null;
                  return (
                    <div
                      key={pId}
                      className="p-2.5 rounded-xl bg-[#0e2238] border border-cyan-900/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={prod.img} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white line-clamp-1">{prod.name}</div>
                          <div className="text-[10px] text-cyan-300 font-mono">
                            {prod.tempDesc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-mono font-bold text-[#f3c969]">
                          ${(prod.price * qty).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 bg-[#062038] border border-cyan-700/60 px-1 rounded-md">
                          <button
                            onClick={() => handleDecreaseQuantity(prod.id)}
                            className="text-xs text-white px-1"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono text-cyan-300 px-0.5">{qty}</span>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="text-xs text-white px-1"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal & Checkout Button */}
              <div className="pt-3 border-t border-cyan-950 space-y-3">
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Thermal Courier Enclosure</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-1">
                    <span>Total Amount</span>
                    <span className="text-[#f3c969]">${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setIsTrackingActive(true);
                    triggerToast('Order Dispatched! Switched to Live Cold-Chain Tracker.');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm & Launch Dispatch Corridor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
