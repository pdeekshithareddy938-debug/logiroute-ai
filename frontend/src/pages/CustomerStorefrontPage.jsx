import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Sparkles,
  Plus,
  Minus,
  Bike,
  LogOut,
  ArrowRight,
  X,
  Heart,
  ShoppingCart,
  Zap,
  Phone,
  ThermometerSnowflake,
  Lock,
  Navigation
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
      <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(141, 255, 208, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); border: 2px solid #ffffff; box-shadow: 0 0 15px #10b981; display: flex; align-items: center; justify-content: center; color: white;">
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
    <div style="position: relative; width: 32px; height: 32px; border-radius: 10px; background: #064e3b; border: 2px solid #34d399; box-shadow: 0 0 12px #34d399; display: flex; align-items: center; justify-content: center; color: #34d399;">
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
    <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #92400e; border: 2px solid #FFC928; box-shadow: 0 0 14px #FFC928; display: flex; align-items: center; justify-content: center; color: #FFD52A;">
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

// High-End Culinary Catalog Matching Reference Image
const CULINARY_CATALOG = [
  {
    id: 'prod-wagyu-burger',
    name: 'Wagyu Smash Truffle Burger & Brioche',
    displayName: 'Wagyu Smash Truffle...',
    category: 'Gourmet Hot Eats',
    thermalState: 'HOT',
    badgeText: '🔥 Hot & Fresh !!',
    badgeGradient: 'from-[#FF3800] to-[#FF6B00]',
    weight: '380g',
    price: 14.50,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    description: 'Double A5 Wagyu patties, melted cave-aged Gruyère, black winter...',
  },
  {
    id: 'prod-cold-brew',
    name: 'Artisan Cold Brew Nitrogen Coffee',
    displayName: 'Artisan Cold Brew Nitroge...',
    category: 'Beverages',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled 4°C',
    badgeGradient: 'from-[#0284C7] to-[#38BDF8]',
    weight: '350ml',
    price: 5.20,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    description: 'Single-origin Ethiopian Yirgacheffe steeped 24 hours with velvety...',
  },
  {
    id: 'prod-power-bowl',
    name: 'Mediterranean Power Bowl',
    displayName: 'Mediterranean Power Bowl',
    category: 'Gourmet Hot Eats',
    thermalState: 'FRESH',
    badgeText: '🥗 Fresh & Healthy',
    badgeGradient: 'from-[#16A34A] to-[#22C55E]',
    weight: '320g',
    price: 12.99,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    description: 'Quinoa, roasted vegetables, feta, and herb dressing...',
  },
  {
    id: 'prod-lava-cake',
    name: 'Chocolate Lava Cake',
    displayName: 'Chocolate Lava Cake',
    category: 'Snacks & More',
    thermalState: 'SWEET',
    badgeText: '🍰 Sweet Treat',
    badgeGradient: 'from-[#9333EA] to-[#C084FC]',
    weight: '250g',
    price: 8.75,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Warm chocolate cake with molten center...',
  },
  {
    id: 'prod-burrata-pizza',
    name: 'Woodfired Burrata & Prosciutto Pizza',
    displayName: 'Woodfired Burrata Pizza',
    category: 'Gourmet Hot Eats',
    thermalState: 'HOT',
    badgeText: '🔥 Hot & Fresh !!',
    badgeGradient: 'from-[#FF3800] to-[#FF6B00]',
    weight: '450g',
    price: 16.80,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    description: '48-hour fermented leopard crust, San Marzano tomato coulis, molten burrata.',
  },
  {
    id: 'prod-farm-milk',
    name: 'Organic Farm Fresh Whole Milk & Cream',
    displayName: 'Organic Farm Whole Milk',
    category: 'Cold Chain & Dairy',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled 4°C',
    badgeGradient: 'from-[#0284C7] to-[#38BDF8]',
    weight: '1 Litre',
    price: 3.90,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Non-homogenized pasture-raised organic whole milk with heavy cream top.',
  },
  {
    id: 'prod-sesame-gelato',
    name: 'Hokkaido Roasted Black Sesame Gelato',
    displayName: 'Hokkaido Sesame Gelato',
    category: 'Frozen Foods',
    thermalState: 'FROZEN',
    badgeText: '❄️ Frozen -18°C',
    badgeGradient: 'from-[#0284C7] to-[#38BDF8]',
    weight: '500g',
    price: 7.90,
    eta: '10 mins',
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80',
    description: 'Slow-churned Hokkaido milk with stone-ground toasted black sesame.',
  },
  {
    id: 'prod-matcha-latte',
    name: 'Uji Ceremonial Matcha',
    displayName: 'Uji Ceremonial Matcha',
    category: 'Beverages',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled 4°C',
    badgeGradient: 'from-[#0284C7] to-[#38BDF8]',
    weight: '320ml',
    price: 5.80,
    eta: '8 mins',
    img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    description: 'First-harvest Kyoto ceremonial green tea whisked over cold oat milk.',
  },
];

const CATEGORIES = [
  'All Items',
  'Gourmet Hot Eats',
  'Cold Chain & Dairy',
  'Frozen Foods',
  'Beverages',
  'Snacks & More',
];

// 4 Distinct Balanced Frosted Glass Tints (Olive Green, Subtle Teal, Fresh Emerald, Champagne Gold)
// Truly transparent with visible natural background scenery, diagonal glare sheen, and floor reflections
const CARD_TINT_STYLES = [
  // 0: Warm Olive Green Glass
  {
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(45, 90, 55, 0.42) 0%, rgba(35, 75, 45, 0.24) 45%, rgba(55, 100, 65, 0.36) 100%)',
      backdropFilter: 'blur(16px) saturate(170%)',
      WebkitBackdropFilter: 'blur(16px) saturate(170%)',
      border: '1.5px solid rgba(255, 255, 255, 0.65)',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.38), 0 0 20px rgba(46, 213, 115, 0.25), inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px rgba(30, 70, 40, 0.28)',
    },
    underglow: 'linear-gradient(180deg, rgba(46, 213, 115, 0.35) 0%, transparent 100%)',
  },
  // 1: Subtle Teal Glass
  {
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(20, 95, 90, 0.42) 0%, rgba(15, 75, 75, 0.24) 45%, rgba(25, 105, 100, 0.36) 100%)',
      backdropFilter: 'blur(16px) saturate(170%)',
      WebkitBackdropFilter: 'blur(16px) saturate(170%)',
      border: '1.5px solid rgba(255, 255, 255, 0.65)',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.38), 0 0 20px rgba(141, 255, 208, 0.30), inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px rgba(15, 75, 75, 0.28)',
    },
    underglow: 'linear-gradient(180deg, rgba(141, 255, 208, 0.38) 0%, transparent 100%)',
  },
  // 2: Fresh Emerald Glass
  {
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(30, 105, 60, 0.42) 0%, rgba(20, 85, 50, 0.24) 45%, rgba(35, 115, 70, 0.36) 100%)',
      backdropFilter: 'blur(16px) saturate(170%)',
      WebkitBackdropFilter: 'blur(16px) saturate(170%)',
      border: '1.5px solid rgba(255, 255, 255, 0.65)',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.38), 0 0 20px rgba(74, 222, 128, 0.25), inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px rgba(20, 85, 50, 0.28)',
    },
    underglow: 'linear-gradient(180deg, rgba(74, 222, 128, 0.35) 0%, transparent 100%)',
  },
  // 3: Champagne Gold / Warm Amber Glass
  {
    cardStyle: {
      background: 'linear-gradient(145deg, rgba(145, 100, 35, 0.42) 0%, rgba(120, 80, 25, 0.24) 45%, rgba(155, 110, 45, 0.36) 100%)',
      backdropFilter: 'blur(16px) saturate(170%)',
      WebkitBackdropFilter: 'blur(16px) saturate(170%)',
      border: '1.5px solid rgba(255, 255, 255, 0.65)',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.38), 0 0 20px rgba(255, 201, 40, 0.28), inset 0 2px 3px rgba(255, 255, 255, 0.85), inset 0 -1.5px 2px rgba(120, 80, 25, 0.28)',
    },
    underglow: 'linear-gradient(180deg, rgba(255, 201, 40, 0.38) 0%, transparent 100%)',
  },
];

export default function CustomerStorefrontPage() {
  const { logout } = useAuth();

  // Interactive Live Cold-Chain Tracker State
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Shopping Cart & Wishlist States (Initial matches $19.70 / 2 items in reference image)
  const [cart, setCart] = useState({
    'prod-wagyu-burger': 1,
    'prod-cold-brew': 1,
  });
  const [wishlist, setWishlist] = useState({ 'prod-wagyu-burger': true });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filtering
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // Active Live Order Telemetry State
  const [secondsRemaining, setSecondsRemaining] = useState(480); // 8 minutes countdown

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
    triggerToast(`Added ${product.displayName || product.name} to cart`);
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

  // View All: Show all available food products (Separate from Live Tracker)
  const handleViewAll = () => {
    setIsTrackingActive(false);
    setSelectedCategory('All Items');
    triggerToast('Showing all available food products');
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
      return (
        selectedCategory === 'All Items' ||
        item.category === selectedCategory ||
        (selectedCategory === 'Snacks & More' && (item.category === 'Frozen Foods' || item.category === 'Gourmet Hot Eats'))
      );
    });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full relative flex flex-col font-sans overflow-x-hidden selection:bg-[#FFC928]/30 selection:text-[#FFC928]">
      
      {/* ==================================================================== */}
      {/* 100% FIXED STATIONARY 3D OUTDOOR GROCERY MARKET BACKGROUND           */}
      {/* ==================================================================== */}
      <div 
        aria-hidden="true"
        className="fixed top-0 left-0 w-full h-screen h-[100dvh] z-0 pointer-events-none select-none overflow-hidden"
        style={{
          backgroundImage: `url('/assets/storefront_bg_3d.jpg'), url('/assets/storefront_reference.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1E3B29',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Subtle Atmospheric Daylight & Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#143B25]/95 border border-[#8DFFD0]/60 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(141,255,208,0.4)] flex items-center gap-2 backdrop-blur-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOP BRAND & TELEMETRY HEADER (Matching Reference Image)              */}
      {/* ==================================================================== */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between">
        
        {/* Brand Left Section */}
        <div className="flex items-center gap-3">
          {/* Luminous Emerald Squircle Logo (48-52px, never stretched) */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.95) 0%, rgba(16, 120, 68, 0.95) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 0 20px rgba(46, 213, 115, 0.65), inset 0 2px 2px rgba(255, 255, 255, 0.85)',
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          >
            <Zap className="w-6 h-6 text-white fill-white drop-shadow-sm object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl text-white tracking-tight drop-shadow-md">
                LogiRoute
              </span>
              <span 
                style={{
                  background: '#FFC928',
                  color: '#1A1A1A',
                  boxShadow: '0 2px 8px rgba(255, 201, 40, 0.4)',
                }}
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs"
              >
                AI MARKET
              </span>
            </div>
            <div className="text-xs font-semibold text-white/95 flex items-center gap-1.5 mt-0.5 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#8DFFD0] shrink-0" />
              <span>100 Market St, Financial Pod</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Live Tracker, Frosted Glass Cart Button & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Live Tracker Navbar Button */}
          <button
            onClick={() => setIsTrackingActive((prev) => !prev)}
            style={{
              background: isTrackingActive
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.75), rgba(5, 150, 105, 0.85))'
                : 'rgba(25, 75, 45, 0.48)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isTrackingActive ? '1.5px solid #8DFFD0' : '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: isTrackingActive
                ? '0 0 20px rgba(141, 255, 208, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.85)'
                : '0 6px 18px rgba(0, 0, 0, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.70)',
            }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:border-[#8DFFD0] transition-all cursor-pointer shadow-md group"
            title="Live Tracker: Assigned Rider Location, Route, ETA & Status"
          >
            <Navigation className="w-5 h-5 text-[#8DFFD0] group-hover:scale-110 transition-transform" />
            
            {/* Live pulsing beacon */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DFFD0] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#8DFFD0] border-2 border-[#163323]"></span>
            </span>
          </button>

          {/* View Cart Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            style={{
              background: 'rgba(25, 75, 45, 0.48)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.70)',
            }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:border-[#8DFFD0] transition-all cursor-pointer shadow-md"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartItemCount > 0 && (
              <span 
                style={{
                  background: '#FFC928',
                  color: '#1A1A1A',
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shadow-md border border-white/60"
              >
                {cartItemCount}
              </span>
            )}
          </button>
          
          {/* Sign Out Button */}
          <button
            onClick={logout}
            style={{
              background: 'rgba(25, 75, 45, 0.48)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.70)',
            }}
            title="Sign Out"
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:text-rose-300 transition-colors cursor-pointer shadow-md"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* CONDITIONAL RENDERING: LIVE TRACKING VIEW vs MARKETPLACE FEED        */}
      {/* ==================================================================== */}
      {isTrackingActive ? (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fadeIn">
          
          {/* Frosted Glass Container for Live Cold-Chain Tracker */}
          <div 
            style={{
              background: 'rgba(16, 52, 32, 0.82)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1.5px 2px rgba(255, 255, 255, 0.65)',
            }}
            className="rounded-[32px] overflow-hidden p-6 sm:p-8"
          >
            {/* Top Tracker Header Strip */}
            <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DFFD0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8DFFD0]"></span>
                </span>
                <span className="text-sm font-mono font-bold tracking-wider text-[#8DFFD0] uppercase">
                  MISSION: CORRIDOR ALPHA-402 · LIVE TELEMETRY
                </span>
              </div>

              <button
                onClick={() => setIsTrackingActive(false)}
                className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-[#FFC928]/80 text-[#FFD52A] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Close Tracker</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive 3D Map Canvas */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/30 shadow-2xl mb-6">
              <MapContainer
                center={[37.7812, -122.4118]}
                zoom={14}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                className="w-full h-full"
                style={{ background: '#0a1d13' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />

                {/* Glowing Active Route Polyline */}
                <Polyline
                  positions={CORRIDOR_POINTS}
                  pathOptions={{
                    color: '#8DFFD0',
                    weight: 5,
                    opacity: 0.95,
                    lineCap: 'round',
                  }}
                />

                {/* Hub Depot Marker */}
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
              <div className="absolute top-4 left-4 z-[1000] bg-[#143B25]/90 border border-white/40 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg flex items-center gap-3 text-xs font-mono text-white">
                <div className="flex items-center gap-1.5 text-[#8DFFD0]">
                  <Bike className="w-4 h-4" />
                  <span>34 km/h</span>
                </div>
                <div className="h-3.5 w-px bg-white/30" />
                <div className="flex items-center gap-1.5 text-[#FFD52A]">
                  <ThermometerSnowflake className="w-4 h-4" />
                  <span>3.8°C Cold-Chain Sealed</span>
                </div>
              </div>
            </div>

            {/* Live ETA Stats & Delivery Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 flex flex-col justify-between">
                <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Estimated Arrival</span>
                <span className="text-3xl font-black text-[#FFD52A] font-mono tracking-tight mt-1">
                  {formattedCountdown}
                </span>
                <span className="text-xs text-[#8DFFD0] font-semibold mt-1">
                  ✓ Sub-10 Min SLA Guaranteed
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 flex flex-col justify-between">
                <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Courier Partner</span>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <div className="text-sm font-extrabold text-white">Ravi Kumar (#DP-402)</div>
                    <div className="text-xs text-white/70 font-mono">Ather 450X · 92% EV</div>
                  </div>
                  <button 
                    onClick={() => triggerToast('Connecting dispatch line to courier...')}
                    className="p-2 rounded-xl bg-[#8DFFD0]/20 border border-[#8DFFD0]/50 text-[#8DFFD0] hover:bg-[#8DFFD0]/30 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-emerald-300 font-semibold mt-1">
                  ✓ Thermal Lock Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 flex flex-col justify-between">
                <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Status Stage</span>
                <span className="text-base font-extrabold text-[#8DFFD0] font-mono mt-1">
                  STAGE 3: In-Transit Corridor
                </span>
                <span className="text-xs text-white/80 font-mono">
                  GPS 2-Opt Locked · Order #LR-8821
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsTrackingActive(false)}
              style={{
                background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 100%)',
                color: '#1A1A1A',
                boxShadow: '0 10px 25px rgba(255, 201, 40, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.8)',
              }}
              className="w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Return to Culinary Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* STANDARD MARKETPLACE PRODUCT FEED (Matching Reference Image)       */
        /* ================================================================== */
        <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-48 sm:pb-52">
          
          {/* ================================================================ */}
          {/* CATEGORY NAVIGATION PILLS (Translucent Green Glass + Gold Active) */}
          {/* ================================================================ */}
          <div className="py-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar max-w-6xl mx-auto">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 100%)',
                          color: '#1A1A1A',
                          boxShadow: '0 4px 18px rgba(255, 201, 40, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.85)',
                          border: '1.5px solid rgba(255, 255, 255, 0.90)',
                        }
                      : {
                          background: 'rgba(25, 75, 45, 0.45)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          color: '#FFFFFF',
                          border: '1.5px solid rgba(255, 255, 255, 0.45)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15), inset 0 1px 1.5px rgba(255, 255, 255, 0.55)',
                        }
                  }
                  className={`shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                    isSelected ? 'scale-[1.02]' : 'hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* ================================================================ */}
          {/* SECTION HEADER: "Artisanal Cold-Chain & Hot Picks" + 8 ITEMS     */}
          {/* ================================================================ */}
          <div className="pt-4 pb-3 flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FFC928] shadow-[0_0_12px_#FFC928]" />
              <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-white tracking-tight drop-shadow-md">
                Artisanal Cold-Chain & Hot Picks
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white/85 tracking-wider drop-shadow-xs">
                {filteredProducts.length} ITEMS
              </span>
              <button
                onClick={handleViewAll}
                style={{
                  background: 'rgba(25, 75, 45, 0.45)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.45)',
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/20 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="View all available food products"
              >
                <span>View All</span>
                <span className="text-[#FFD52A]">→</span>
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 4-COLUMN DESKTOP PRODUCT GRID (Standardized Dimensions, 20px Gap) */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {filteredProducts.map((prod, index) => {
              const qty = cart[prod.id] || 0;
              const isSaved = !!wishlist[prod.id];
              const tint = CARD_TINT_STYLES[index % CARD_TINT_STYLES.length];

              return (
                <div key={prod.id} className="relative flex flex-col h-full group">
                  
                  {/* Floating Transparent 3D Glass Product Card (Standardized Dimensions) */}
                  <div
                    style={tint.cardStyle}
                    className="rounded-[22px] p-3.5 sm:p-4 flex flex-col justify-between h-full min-h-[355px] sm:min-h-[365px] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] relative z-10 overflow-hidden"
                  >
                    {/* Glossy Diagonal Specular Glare Reflection */}
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-[22px]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.10) 35%, transparent 65%)',
                      }}
                    />

                    {/* Top Row: Thermal State Badge & Wishlist Heart */}
                    <div className="relative z-10 flex items-center justify-between mb-2.5">
                      <span className={`bg-gradient-to-r ${prod.badgeGradient} text-white font-black px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] shadow-sm flex items-center gap-1 select-none`}>
                        {prod.badgeText}
                      </span>

                      <button
                        onClick={(e) => handleToggleWishlist(prod.id, e)}
                        className="w-7 h-7 rounded-full bg-black/25 backdrop-blur-md border border-white/50 flex items-center justify-center text-white hover:bg-black/45 transition-colors shrink-0 cursor-pointer shadow-xs"
                        title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} 
                        />
                      </button>
                    </div>

                    {/* Food Image Asset (Rounded corner container with weight overlay tag in bottom-left) */}
                    <div className="relative z-10 h-32 sm:h-36 w-full rounded-xl overflow-hidden mb-2.5 bg-black/20 shrink-0">
                      <img
                        src={prod.img}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                        className="w-full h-full object-cover object-center select-none"
                        loading="lazy"
                      />
                      {/* Subtle bottom gradient overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
                      
                      {/* Weight badge pill overlay in bottom-left corner */}
                      <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 shadow-sm">
                        {prod.weight}
                      </div>
                    </div>

                    {/* Product Title & Description */}
                    <div className="relative z-10 mb-2.5 space-y-1">
                      <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug tracking-tight line-clamp-1 drop-shadow-xs">
                        {prod.displayName || prod.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 leading-relaxed font-normal min-h-[2rem] sm:min-h-[2.25rem]">
                        {prod.description}
                      </p>
                    </div>

                    {/* Price, SLA Telemetry & Stepper / Add Button */}
                    <div className="relative z-10 pt-2.5 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <div className="text-base sm:text-lg font-black text-[#FFD52A] font-mono leading-none tracking-tight drop-shadow-xs">
                          ${prod.price.toFixed(2)}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-[#8DFFD0] font-mono mt-0.5 flex items-center gap-1 drop-shadow-xs">
                          <Zap className="w-2.5 h-2.5 fill-[#8DFFD0]" />
                          <span>{prod.eta}</span>
                        </div>
                      </div>

                      {/* Explicit "+ ADD" Button or Quantity Stepper ("- 1 +") */}
                      {qty > 0 ? (
                        <div 
                          style={{
                            background: 'rgba(0, 0, 0, 0.45)',
                            backdropFilter: 'blur(12px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.65)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full shadow-md"
                        >
                          <button
                            onClick={(e) => handleDecreaseQuantity(prod.id, e)}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs hover:text-[#8DFFD0] active:scale-90 transition-transform cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-white px-1 font-mono">{qty}</span>
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[#8DFFD0] font-bold text-xs hover:brightness-125 active:scale-90 transition-transform cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          style={{
                            background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 100%)',
                            color: '#1A1A1A',
                            boxShadow: '0 3px 12px rgba(255, 201, 40, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.8)',
                          }}
                          className="px-3.5 py-1.5 rounded-full font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer select-none"
                          aria-label="+ ADD"
                        >
                          <span className="font-black text-xs tracking-wide">+ ADD</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Soft Realistic Ambient Floor Underglow Reflection */}
                  <div
                    className="w-[84%] h-4.5 mx-auto -mt-2 rounded-b-[20px] blur-[5px] opacity-35 pointer-events-none select-none hidden sm:block"
                    style={{ background: tint.underglow }}
                  />
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* FLOATING DARK EMERALD GLASS CART PANEL (With Subtle Gold Edges)      */}
      {/* ==================================================================== */}
      {!isTrackingActive && cartItemCount > 0 && (
        <div className="fixed bottom-5 inset-x-4 sm:inset-x-6 md:inset-x-8 max-w-7xl mx-auto z-40 animate-fadeIn pointer-events-none">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(16, 52, 32, 0.82) 0%, rgba(10, 40, 24, 0.85) 100%)',
              backdropFilter: 'blur(22px) saturate(190%)',
              WebkitBackdropFilter: 'blur(22px) saturate(190%)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 25px rgba(255, 201, 40, 0.20), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -1.5px 2px rgba(255, 201, 40, 0.35)',
            }}
            className="rounded-[24px] p-3 sm:p-4 flex items-center justify-between pointer-events-auto shadow-2xl"
          >
            {/* Left: Golden Count Pill & Cart Total Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                style={{
                  background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 100%)',
                  color: '#1A1A1A',
                  boxShadow: '0 4px 12px rgba(255, 201, 40, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-md"
              >
                {cartItemCount}
              </div>

              <div>
                <div className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>Cart Total:</span>
                  <span className="text-[#FFD52A] font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-[#8DFFD0] font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#8DFFD0]" />
                  <span>Cold-Chain SLA Locked</span>
                </div>
              </div>
            </div>

            {/* Right: Glossy 3D Gold View Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 60%, #E5A500 100%)',
                color: '#1A1A1A',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 25px rgba(255, 201, 40, 0.50), inset 0 2px 2px rgba(255, 255, 255, 0.90), inset 0 -2px 2px rgba(180, 130, 0, 0.35)',
              }}
              className="px-6 sm:px-8 py-2.5 rounded-full font-black text-xs sm:text-sm tracking-wide flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-lg relative overflow-hidden group"
            >
              {/* Top Specular Sheen */}
              <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-full" />
              <ShoppingCart className="w-4 h-4 text-[#1A1A1A] z-10" />
              <span className="z-10">View Cart →</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SHOPPING CART SLIDE-OVER DRAWER                                      */}
      {/* ==================================================================== */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-fadeIn">
          <div 
            style={{
              background: 'rgba(16, 50, 32, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -1.5px 2px rgba(255, 201, 40, 0.3)',
            }}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col justify-between shadow-2xl p-6"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#8DFFD0]" />
                <span className="font-extrabold text-white text-base">
                  Cold-Chain Order Summary ({cartItemCount} items)
                </span>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/30 text-white hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-80 no-scrollbar">
              {Object.entries(cart).map(([pId, qty]) => {
                const prod = CULINARY_CATALOG.find((p) => p.id === pId);
                if (!prod) return null;
                return (
                  <div
                    key={pId}
                    className="p-3 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center p-1 overflow-hidden shrink-0 border border-white/20">
                        <img src={prod.img} alt={prod.name} style={{ objectFit: 'contain', objectPosition: 'center' }} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white line-clamp-1">{prod.name}</div>
                        <div className="text-[11px] text-[#8DFFD0] font-mono">
                          {prod.weight} · {prod.badgeText}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono font-black text-[#FFD52A]">
                        ${(prod.price * qty).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/50 border border-white/30 px-2 py-0.5 rounded-full">
                        <button
                          onClick={() => handleDecreaseQuantity(prod.id)}
                          className="text-xs text-white hover:text-[#8DFFD0] px-1 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-black text-[#8DFFD0] px-1">{qty}</span>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="text-xs text-white hover:text-[#8DFFD0] px-1 font-bold cursor-pointer"
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
            <div className="pt-4 border-t border-white/20 space-y-3.5">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8DFFD0] font-bold">
                  <span>Thermal Courier Enclosure</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-[#FFD52A]">${cartSubtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setIsTrackingActive(true);
                  triggerToast('Order Dispatched! Switched to Live Cold-Chain Tracker.');
                }}
                style={{
                  background: 'linear-gradient(135deg, #FFD52A 0%, #FFC928 100%)',
                  color: '#1A1A1A',
                  boxShadow: '0 10px 25px rgba(255, 201, 40, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.85)',
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm & Launch Dispatch Corridor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}