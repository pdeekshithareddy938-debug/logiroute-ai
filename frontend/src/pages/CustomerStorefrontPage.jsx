import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dispatchAPI } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Interactive3DDeliveryCanvas from '../components/Interactive3DDeliveryCanvas';
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
  Volume2,
  Maximize2,
  Minimize2,
  Box,
  Layers3
} from 'lucide-react';

// Fix Leaflet Default Icon
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

// Simulated Corridor Coordinates
const CORRIDOR_POINTS = [
  [37.7885, -122.4015], // Hub-01
  [37.7845, -122.4072],
  [37.7812, -122.4118], // Courier
  [37.7778, -122.4160],
  [37.7745, -122.4195], // Doorstep
];

// Interactive 3D Tilt Card Wrapper Component
function TiltCard3D({ children, className = '' }) {
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

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(`perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.16
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
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
      {/* 3D Specular Light Sheen */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(56,189,248,${glare.opacity}), transparent 65%)`,
          mixBlendMode: 'screen'
        }}
      />
      {children}
    </div>
  );
}

// Culinary Catalog
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

  // Scroll Container Ref for Scroll-Driven 3D Interpolation
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Layout mode: 'cinema' (Widescreen 3D Studio for Laptop) | 'mobile' (Artboard Preview)
  const [layoutMode, setLayoutMode] = useState('cinema');

  // Interactive "Track Order" State Handling
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Active Thermal State for 3D Lighting & Shaders
  const [activeThermalState, setActiveThermalState] = useState('CHILLED');

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

  // Scroll-Driven Animation Event Listener
  const handleScroll = (e) => {
    const el = e.target;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) {
      const progress = Math.max(0, Math.min(1, el.scrollTop / max));
      setScrollProgress(progress);
    }
  };

  // Jump smoothly to scroll checkpoints
  const jumpToCheckpoint = (fraction) => {
    if (scrollContainerRef.current) {
      const max = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
      scrollContainerRef.current.scrollTo({
        top: max * fraction,
        behavior: 'smooth'
      });
    }
  };

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
    setActiveThermalState(product.thermalState || 'CHILLED');
    triggerToast(`Added ${product.name} to 3D Cold-Chain cart`);
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
      triggerToast(next ? 'Saved to 3D wishlist' : 'Removed from wishlist');
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
    <div className="min-h-screen bg-[#040811] text-slate-100 flex flex-col items-center justify-start p-0 sm:py-4 sm:px-4 font-sans selection:bg-[#38bdf8]/30 selection:text-white relative overflow-x-hidden">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-[#0b192c]/95 border border-[#38bdf8]/60 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-[0_0_25px_rgba(56,189,248,0.5)] flex items-center gap-2 backdrop-blur-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Cybernetic Nav Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between z-40 bg-[#070e1a]/85 backdrop-blur-md border-b border-cyan-950/80 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#d4af37] p-[1px] shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <div className="w-full h-full bg-[#0b192c] rounded-[11px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">LogiRoute</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40">
                3D AI ENGINE
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#38bdf8]" />
              <span>100 Market St · Financial Pod SF</span>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                ● 8 MIN SLA
              </span>
            </div>
          </div>
        </div>

        {/* Center Checkpoint Quick-Jump Jumpers (Scroll Trigger Bar) */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0b192c]/90 border border-cyan-900/60 rounded-full p-1 text-[11px] font-mono">
          {[
            { label: '01 3D Drone', frac: 0.05 },
            { label: '02 Highway', frac: 0.35 },
            { label: '03 Catalog', frac: 0.65 },
            { label: '04 Doorstep', frac: 0.95 }
          ].map((cp) => (
            <button
              key={cp.label}
              onClick={() => jumpToCheckpoint(cp.frac)}
              className="px-3 py-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
            >
              {cp.label}
            </button>
          ))}
        </div>

        {/* Right Action Icons: Layout Mode Switcher, Cart & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Laptop 3D Cinema vs Mobile Artboard Switcher */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'cinema' ? 'mobile' : 'cinema')}
            title={layoutMode === 'cinema' ? 'Switch to Compact Mobile View' : 'Switch to Widescreen 3D Cinema'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e2238] border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            {layoutMode === 'cinema' ? <Layers3 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-[#f3c969]" />}
            <span className="hidden sm:inline">
              {layoutMode === 'cinema' ? '3D Studio' : 'Mobile HUD'}
            </span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-[#0e2238] border border-cyan-900/60 text-slate-300 hover:text-white hover:border-[#38bdf8]/60 transition-all shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#38bdf8]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2.5 rounded-xl bg-[#0e2238] border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN LAYOUT WRAPPER (Adapts between Cinema Widescreen & Mobile Frame)  */}
      {/* ==================================================================== */}
      <div
        className={`w-full transition-all duration-500 mt-2 ${
          layoutMode === 'cinema'
            ? 'max-w-7xl px-2 sm:px-6'
            : 'max-w-[440px] px-0 sm:px-2'
        }`}
      >
        <div
          className={`bg-[#070e1a] border border-cyan-950/80 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.85),0_0_0_1px_rgba(56,189,248,0.12)] flex flex-col relative overflow-hidden ${
            layoutMode === 'cinema' ? 'min-h-[92vh]' : 'h-[890px] max-h-[96vh]'
          }`}
        >
          
          {/* Scrollable Container with Scroll-Driven Event Handler */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col"
          >
            
            {/* ============================================================== */}
            {/* SECTION 1: INTERACTIVE 3D WEBGL HERO CANVAS (Scroll Stage 0 - 0.3) */}
            {/* ============================================================== */}
            <section className="relative w-full h-[420px] sm:h-[480px] bg-gradient-to-b from-[#070e1a] via-[#091527] to-[#070e1a] shrink-0 border-b border-cyan-950/60 overflow-hidden">
              <Interactive3DDeliveryCanvas
                scrollProgress={scrollProgress}
                activeThermalState={activeThermalState}
              />

              {/* Floating Headline & Quick Dispatch Callout */}
              <div className="absolute bottom-5 left-4 sm:left-8 right-4 sm:right-8 z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-none">
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-[#f3c969]" />
                    <span>Scroll to Pilot AI Dispatch Flight</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                    Hyper-Realistic 3D Cold-Chain <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-[#f3c969] bg-clip-text text-transparent">
                      Direct to Your Doorstep
                    </span>
                  </h2>
                </div>

                <button
                  onClick={() => setIsTrackingActive(!isTrackingActive)}
                  className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                  <span>{isTrackingActive ? 'Show 3D Catalog Feed' : 'Launch 3D Live Tracker'}</span>
                </button>
              </div>
            </section>

            {/* ============================================================== */}
            {/* SECTION 2: LIVE TRACKING OVERLAY OR PRODUCT FEED                */}
            {/* ============================================================== */}
            {isTrackingActive ? (
              /* LIVE 3D TRACKING VIEW */
              <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 animate-fadeIn bg-[#070e1a]">
                
                {/* Status Bar */}
                <div className="bg-[#0e2238] rounded-2xl border border-cyan-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                      <Bike className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">STAGE 3 // RIDER DISPATCHED</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          3.8°C CRYOPATH
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        Arriving in {formattedCountdown}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTrackingActive(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer self-stretch sm:self-auto text-center"
                  >
                    ← Return to Marketplace
                  </button>
                </div>

                {/* Leaflet GPS Radar & 3D Flight Synchronization */}
                <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-cyan-900/80 relative shadow-2xl">
                  <MapContainer
                    center={[37.7812, -122.4118]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Polyline
                      positions={CORRIDOR_POINTS}
                      pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.85, dashArray: '8, 8' }}
                    />
                    <Marker position={CORRIDOR_POINTS[0]} icon={depotIcon}>
                      <Popup>Hub-01 Dispatch Center</Popup>
                    </Marker>
                    <Marker position={CORRIDOR_POINTS[2]} icon={courierIcon}>
                      <Popup>Ather 450X EV Pod #DP-402</Popup>
                    </Marker>
                    <Marker position={CORRIDOR_POINTS[4]} icon={destIcon}>
                      <Popup>Delivery Doorstep</Popup>
                    </Marker>
                  </MapContainer>

                  {/* Overlaid HUD Pill */}
                  <div className="absolute bottom-3 left-3 z-[1000] bg-[#070e1a]/90 border border-cyan-500/50 rounded-xl px-3 py-1.5 backdrop-blur-md text-[10px] font-mono text-cyan-300">
                    GPS TRACK: SF MARKET ST CORRIDOR · 92% BATTERY
                  </div>
                </div>

                {/* 4-Stage Progress Pipeline */}
                <div className="bg-[#0e2238] rounded-2xl border border-cyan-900/60 p-4 shadow-lg space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Automated Dispatch Pipeline</span>
                    <span className="text-cyan-400 font-mono text-[11px]">PHASE 3 / 4</span>
                  </div>

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
                                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                                : isCurrent
                                ? 'bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse'
                                : 'bg-slate-800'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold leading-tight ${
                              isCurrent
                                ? 'text-cyan-300'
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
              </div>
            ) : (
              /* STANDARD 3D MARKETPLACE FEED WITH SCROLL-DRIVEN TILT CARDS */
              <div className="p-4 sm:p-6 space-y-5 pb-24">
                
                {/* Quick Live Tracking Banner (Toggles 3D Tracking) */}
                <div
                  onClick={() => setIsTrackingActive(true)}
                  className="bg-gradient-to-r from-[#062038] via-[#0b2848] to-[#081e35] rounded-2xl border border-cyan-500/50 p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative overflow-hidden cursor-pointer group active:scale-[0.99] transition-all"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#06b6d4]/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38bdf8]"></span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#38bdf8] tracking-wider uppercase">
                        Live Cold-Chain Dispatch
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f3c969] text-[10px] font-mono font-bold">
                      ORDER #LR-8821
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                        <span>Arriving in {formattedCountdown}</span>
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
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artisanal groceries, cold-chain items & hot eats..."
                    className="w-full bg-[#0e2238] border border-cyan-900/60 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
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

                {/* Horizontal Category Pill Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.45)]'
                            : 'bg-[#0e2238] border border-cyan-900/50 text-slate-300 hover:border-cyan-700/60'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Catalog Grid Header */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
                    <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Artisanal 3D Culinary Vault
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredProducts.length} ITEMS // SCROLL TILT ACTIVE
                  </span>
                </div>

                {/* 3D TILT PRODUCT CARD GRID */}
                <div
                  className={`grid gap-4 ${
                    layoutMode === 'cinema'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-2'
                  }`}
                >
                  {filteredProducts.map((prod) => {
                    const qty = cart[prod.id] || 0;
                    const isSaved = !!wishlist[prod.id];

                    return (
                      <TiltCard3D key={prod.id}>
                        <div className="bg-[#0e2238]/90 border border-cyan-900/60 hover:border-cyan-400/60 rounded-2xl p-3 flex flex-col justify-between shadow-xl transition-all group backdrop-blur-md h-full">
                          
                          {/* Thermal State & Wishlist */}
                          <div className="flex items-start justify-between z-10 mb-2 gap-1">
                            {prod.thermalState === 'HOT' && (
                              <div className="bg-gradient-to-r from-amber-950/90 to-rose-950/90 border border-orange-500/60 text-orange-400 font-bold px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_10px_rgba(249,115,22,0.4)] flex items-center gap-1 backdrop-blur-md">
                                <Flame className="w-3 h-3 text-orange-400 fill-orange-400 animate-pulse" />
                                <span>Hot & Fresh</span>
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

                            <button
                              onClick={(e) => handleToggleWishlist(prod.id, e)}
                              className="w-6 h-6 rounded-full bg-slate-900/70 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>

                          {/* Image with 3D Depth Frame */}
                          <div className="h-32 w-full rounded-xl overflow-hidden relative bg-slate-900/60 mb-2">
                            <img
                              src={prod.img}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e2238] via-transparent to-transparent opacity-75" />
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono font-bold text-slate-300 border border-white/10">
                              {prod.weight}
                            </div>
                          </div>

                          {/* Title & Desc */}
                          <div className="space-y-1 mb-2">
                            <h5 className="font-extrabold text-white text-xs sm:text-sm leading-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                              {prod.name}
                            </h5>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>

                          {/* Pricing & Add Stepper */}
                          <div className="pt-2 border-t border-cyan-950/80 flex items-center justify-between">
                            <div>
                              <div className="text-sm sm:text-base font-extrabold text-[#f3c969] font-mono leading-none">
                                ${prod.price.toFixed(2)}
                              </div>
                              <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
                                ⚡ {prod.eta}
                              </div>
                            </div>

                            {qty > 0 ? (
                              <div className="flex items-center gap-1 bg-[#062038] border border-cyan-500/50 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                                <button
                                  onClick={(e) => handleDecreaseQuantity(prod.id, e)}
                                  className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs hover:bg-slate-700 active:scale-90 transition-transform cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-[11px] font-extrabold text-white px-1 font-mono">{qty}</span>
                                <button
                                  onClick={(e) => handleAddToCart(prod, e)}
                                  className="w-4 h-4 rounded-full bg-[#38bdf8] text-slate-950 flex items-center justify-center font-bold text-xs hover:bg-[#0284c7] active:scale-90 transition-transform cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => handleAddToCart(prod, e)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:brightness-110 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(212,175,55,0.35)] active:scale-90 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>ADD</span>
                              </button>
                            )}
                          </div>

                        </div>
                      </TiltCard3D>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

          {/* Sticky Bottom Cart Bar */}
          {!isTrackingActive && cartItemCount > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-30 animate-fadeIn">
              <div className="bg-[#0e2238]/95 border border-[#d4af37]/60 rounded-2xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-between backdrop-blur-md max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d4af37] text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-sm">
                    {cartItemCount}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cart Total: ${cartSubtotal.toFixed(2)}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">3D Cold-Chain SLA Locked</div>
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

        </div>
      </div>

      {/* Shopping Cart Slide-Over Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#0b192c] border-t border-[#38bdf8]/40 rounded-t-3xl max-w-xl w-full mx-auto max-h-[85%] flex flex-col justify-between shadow-2xl p-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#38bdf8]" />
                <span className="font-extrabold text-white text-sm">
                  3D Cold-Chain Order ({cartItemCount} items)
                </span>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#0e2238] border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item list */}
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
                          className="text-xs text-white px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono text-cyan-300 px-0.5">{qty}</span>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="text-xs text-white px-1 cursor-pointer"
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
                  <span>3D Autonomous Flight Courier</span>
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
                  triggerToast('Order Dispatched! Switched to 3D Cold-Chain Tracker.');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3c969] to-[#d4af37] text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch 3D Dispatch Flight</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
