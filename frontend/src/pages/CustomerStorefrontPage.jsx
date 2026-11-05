import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dispatchAPI } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bike,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  MapPin,
  Heart,
  User,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Snowflake,
  Box,
  Leaf,
  Navigation,
  Compass,
  Menu,
  X,
  ChefHat,
  ShoppingCart
} from 'lucide-react';

// Fix Leaflet default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Delivery Rider Scooter Icon for Map (Matching Reference Image)
const riderScooterIcon = L.divIcon({
  className: 'custom-rider-scooter-pin',
  html: `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(255, 107, 74, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #FF6B4A, #FF8C42); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(255, 107, 74, 0.6); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

// Custom Customer Destination Home Icon for Map (Red circle with white house)
const customerHomeIcon = L.divIcon({
  className: 'custom-customer-home-pin',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #EF4444, #DC2626); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Realistic Route Coordinates along SF downtown corridor
const ROUTE_WAYPOINTS = [
  [37.7885, -122.4015], // Origin Hub
  [37.7852, -122.4068],
  [37.7820, -122.4112],
  [37.7785, -122.4158],
  [37.7745, -122.4195], // Customer Doorstep
];

// Completely New, Attractive, Realistic Food Items matching reference image & prompt
const FOOD_CATALOG = [
  {
    id: 'prod-classic-burger',
    name: 'Classic Burger',
    category: 'Burgers',
    thermalState: 'HOT',
    badgeText: '🔥 Hot',
    price: 99,
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Juicy handcrafted grilled patty, melted cheddar, crisp lettuce & house sauce on toasted brioche.',
  },
  {
    id: 'prod-margherita-pizza',
    name: 'Margherita Pizza',
    category: 'Pizza',
    thermalState: 'HOT',
    badgeText: '🔥 Hot',
    price: 149,
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Fresh mozzarella, Italian sweet basil leaves, San Marzano tomato puree on 48-hr fermented crust.',
  },
  {
    id: 'prod-white-sauce-pasta',
    name: 'White Sauce Pasta',
    category: 'Snacks',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled',
    price: 129,
    img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Silky creamy Alfredo penne pasta with roasted garlic, parmesan shavings and Italian herb garnishing.',
  },
  {
    id: 'prod-veg-sandwich',
    name: 'Veg Sandwich',
    category: 'Snacks',
    thermalState: 'FRESH',
    badgeText: '🍃 Fresh',
    price: 89,
    img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Crisp English cucumbers, vine tomatoes, mint chutney and cheese slices in toasted artisan bread.',
  },
  {
    id: 'prod-cold-coffee',
    name: 'Cold Coffee',
    category: 'Drinks',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled',
    price: 79,
    img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Single-origin espresso shaken over ice, fresh whole milk and velvety vanilla microfoam top.',
  },
  {
    id: 'prod-french-fries',
    name: 'French Fries',
    category: 'Snacks',
    thermalState: 'HOT',
    badgeText: '🔥 Hot',
    price: 59,
    img: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Golden, extra-crispy potato fries sprinkled with mineral sea salt and fragrant peri-peri herb blend.',
  },
  {
    id: 'prod-belgian-waffle',
    name: 'Belgian Waffle',
    category: 'Desserts',
    thermalState: 'HOT',
    badgeText: '🔥 Hot',
    price: 119,
    img: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Warm golden honeycomb waffle drizzled with melted Belgian dark chocolate and berry compote.',
  },
  {
    id: 'prod-mango-gelato',
    name: 'Mango Gelato Cup',
    category: 'Desserts',
    thermalState: 'FROZEN',
    badgeText: '🧊 Frozen',
    price: 89,
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Slow-churned frozen Alphonso mango gelato crafted with pure cream and organic cane sugar.',
  },
  {
    id: 'prod-avocado-salad',
    name: 'Greek Avocado Salad',
    category: 'Healthy',
    thermalState: 'FRESH',
    badgeText: '🍃 Fresh',
    price: 139,
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Ripe Hass avocado cubes, Mediterranean olives, feta cheese, crisp greens and lemon vinaigrette.',
  },
  {
    id: 'prod-berry-bowl',
    name: 'Berry Smoothie Bowl',
    category: 'Healthy',
    thermalState: 'CHILLED',
    badgeText: '❄️ Chilled',
    price: 109,
    img: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&h=450&q=80',
    description: 'Chilled wild berry acai smoothie base topped with chia seeds, banana rounds and toasted coconut.',
  },
];

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Snacks', 'Drinks', 'Desserts', 'Healthy'];

export default function CustomerStorefrontPage() {
  const { user, logout } = useAuth();
  const userName = user?.name || 'Deekshitha';

  // Navigation State
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTempFilter, setSelectedTempFilter] = useState(null); // 'HOT', 'CHILLED', 'FROZEN', 'FRESH'

  // Cart State (Pre-populated with ₹237 total matching reference image!)
  const [cart, setCart] = useState({
    'prod-classic-burger': 1,
    'prod-cold-coffee': 1,
    'prod-french-fries': 1,
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState({
    'prod-classic-burger': true,
    'prod-margherita-pizza': true,
  });

  // Map Layer Toggle: 'map' vs 'satellite'
  const [mapLayerType, setMapLayerType] = useState('map');

  // Live Simulated Rider Position along route
  const [riderStepIndex, setRiderStepIndex] = useState(1);
  const riderPosition = ROUTE_WAYPOINTS[riderStepIndex] || ROUTE_WAYPOINTS[1];

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Order Progress State (Order Placed -> Preparing -> Out for Delivery -> Delivered)
  const [orderStage, setOrderStage] = useState(2); // 0=Placed, 1=Prep, 2=OutForDelivery, 3=Delivered
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Animate Rider Movement periodically to simulate live telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setRiderStepIndex((prev) => (prev + 1) % ROUTE_WAYPOINTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filtered Food List based on search, category, and temperature badges
  const filteredProducts = useMemo(() => {
    return FOOD_CATALOG.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTemp = !selectedTempFilter || item.thermalState === selectedTempFilter;
      return matchesSearch && matchesCategory && matchesTemp;
    });
  }, [searchQuery, selectedCategory, selectedTempFilter]);

  // Cart Calculations
  const cartItemsList = useMemo(() => {
    return Object.entries(cart)
      .map(([pId, qty]) => {
        const prod = FOOD_CATALOG.find((p) => p.id === pId);
        return prod ? { ...prod, qty } : null;
      })
      .filter(Boolean);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cartItemsList.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItemsList]);

  // Cart Handlers
  const handleAddToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    const prod = FOOD_CATALOG.find((p) => p.id === productId);
    triggerToast(`Added ${prod?.name || 'item'} to cart`);
  };

  const handleDecreaseQuantity = (productId) => {
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

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    triggerToast('Item removed from cart');
  };

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = !prev[productId];
      triggerToast(next ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
      return { ...prev, [productId]: next };
    });
  };

  // Place Order Action (Connects to backend /dispatch/orders)
  const handlePlaceOrder = async () => {
    if (cartItemsList.length === 0) {
      triggerToast('Your cart is empty! Add food items first.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const desc = cartItemsList.map((it) => `${it.qty}x ${it.name}`).join(', ');
      await dispatchAPI.createOrder({
        customer: userName,
        address: '100 Market St, Financial Pod',
        packageDesc: desc,
        weightKg: 1.4,
        priority: 'HIGH',
        waveId: 'wave-alpha',
      });
      setOrderStage(1);
      triggerToast('🎉 Order placed successfully! Rahul is on the way.');
      setTimeout(() => setOrderStage(2), 2000);
    } catch (err) {
      console.warn('Backend order notice:', err.message);
      setOrderStage(2);
      triggerToast('🎉 Order confirmed! Rider Rahul is en route.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Scroll to section helper
  const scrollToMenu = () => {
    setActiveNav('Browse Menu');
    document.getElementById('our-menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTracker = () => {
    setActiveNav('Live Tracker');
    document.getElementById('live-tracker-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-[#7C3AED]/30 selection:text-[#2E1065] overflow-x-hidden">
      {/* ==================================================================== */}
      {/* 1. FIXED 3D SUNSET CITY BACKGROUND (PEACH, PINK, PURPLE & ORANGE)    */}
      {/* ==================================================================== */}
      <div
        className="fixed inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: 'url(/assets/customer_sunset_bg.jpg), url(/assets/rider_bg_3d.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft Sunset Peach-Pink Ambience Overlay ensuring crisp contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 10%, rgba(255, 170, 140, 0.18) 0%, rgba(255, 230, 240, 0.40) 45%, rgba(245, 215, 230, 0.65) 100%)',
          }}
        />
      </div>

      {/* Floating Dynamic Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#2E1065] flex items-center gap-2 shadow-2xl animate-fade-in backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 235, 245, 0.90))',
              border: '1.5px solid rgba(124, 58, 237, 0.4)',
              boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MAIN COCKPIT CONTAINER (SIDEBAR + MAIN CONTENT AREA)                 */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex min-h-screen p-3 sm:p-5 lg:p-6 gap-4 sm:gap-6 max-w-[1600px] mx-auto">
        
        {/* ==================================================================== */}
        {/* 2. LEFT SIDEBAR (Matching Reference Image)                           */}
        {/* ==================================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-6 left-0 bottom-0 z-40
            w-64 sm:w-72 lg:w-64 h-auto lg:h-[calc(100vh-3rem)]
            flex flex-col justify-between p-5 rounded-3xl
            transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.58) 55%, rgba(255, 220, 235, 0.42) 100%)',
            backdropFilter: 'blur(26px)',
            WebkitBackdropFilter: 'blur(26px)',
            border: '1.5px solid rgba(255, 255, 255, 0.75)',
            boxShadow:
              '0 20px 50px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* Top Brand Logo */}
          <div>
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/40">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                    boxShadow: '0 8px 20px rgba(255, 107, 74, 0.45)',
                  }}
                >
                  <Bike className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2E1065] tracking-tight leading-tight">
                    LogiRoute AI
                  </h2>
                  <p className="text-[10px] font-bold text-[#FF6B4A] tracking-tight">
                    Smart Delivery. Faster You!
                  </p>
                </div>
              </div>

              {/* Close button on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-xl bg-white/60 text-slate-700 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu List */}
            <nav className="flex flex-col gap-1.5">
              {/* 1. Dashboard (Active Orange Pill) */}
              <button
                onClick={() => {
                  setActiveNav('Dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  activeNav === 'Dashboard'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Dashboard'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Dashboard</span>
              </button>

              {/* 2. Browse Menu */}
              <button
                onClick={() => {
                  scrollToMenu();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Browse Menu'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Browse Menu</span>
              </button>

              {/* 3. My Orders */}
              <button
                onClick={() => {
                  setActiveNav('My Orders');
                  setIsMobileMenuOpen(false);
                  triggerToast('Displaying Active Order #LOGI-8492');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'My Orders'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>My Orders</span>
              </button>

              {/* 4. Live Tracker */}
              <button
                onClick={() => {
                  scrollToTracker();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Live Tracker'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
              >
                <MapPin className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Live Tracker</span>
              </button>

              {/* 5. Wishlist */}
              <button
                onClick={() => {
                  setActiveNav('Wishlist');
                  setIsMobileMenuOpen(false);
                  triggerToast(`You have ${Object.keys(wishlist).length} saved items in Wishlist`);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Wishlist'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
              >
                <Heart className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Wishlist</span>
              </button>

              {/* 6. Profile */}
              <button
                onClick={() => {
                  setActiveNav('Profile');
                  setIsMobileMenuOpen(false);
                  triggerToast(`Customer Profile: ${userName} (Financial Pod)`);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Profile'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
              >
                <User className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Profile</span>
              </button>

              {/* 7. Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm text-[#4C1D95] hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <LogOut className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Bottom Rider on Scooter Silhouette/Card (Visible through glass as in reference image) */}
          <div
            className="p-3 rounded-2xl mt-4 flex items-center gap-3"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)',
              }}
            >
              <Bike className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-black text-[#2E1065] block leading-tight truncate">
                Rider Rahul Nearby
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ather 450X · 2.8 km
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* ==================================================================== */}
        {/* MAIN BODY AREA (TOP HEADER + TEMPERATURE CARDS + 2-COLUMN GRID)      */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
          
          {/* ==================================================================== */}
          {/* 3. CUSTOMER HEADER WITH WELCOME, NOTIFICATIONS & PROFILE            */}
          {/* ==================================================================== */}
          <header
            className="w-full p-4 sm:px-6 sm:py-4 rounded-3xl flex items-center justify-between shadow-xl transition-all"
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
              backdropFilter: 'blur(26px)',
              WebkitBackdropFilter: 'blur(26px)',
              border: '1.5px solid rgba(255, 255, 255, 0.75)',
              boxShadow:
                '0 15px 35px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
            }}
          >
            {/* Left: Hamburger (mobile) + User Greeting */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-2xl bg-white/60 text-[#2E1065] hover:bg-white"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shadow-md shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35)',
                }}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div>
                <h1 className="text-base sm:text-xl font-black text-[#2E1065] tracking-tight leading-tight">
                  Welcome, {userName}!
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#4C1D95]/80 flex items-center gap-1.5 mt-0.5">
                  <span>Order delicious food, delivered in minutes</span>
                  <span className="text-rose-500">❤️</span>
                </p>
              </div>
            </div>

            {/* Right: Notification Bell + Profile Avatar */}
            <div className="flex items-center gap-3">
              {/* Notification Bell with Red Badge */}
              <button
                onClick={() => triggerToast('You have 2 delivery updates active')}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#2E1065] transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-[#2E1065]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  2
                </span>
              </button>

              {/* Profile Avatar */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Profile"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md ring-2 ring-[#7C3AED]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
            </div>
          </header>

          {/* ==================================================================== */}
          {/* 4. TEMPERATURE BADGES BAR (HOT & FRESH, CHILLED, FROZEN, FRESH)     */}
          {/* ==================================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Hot & Fresh (≥ 60°C) */}
            <div
              onClick={() =>
                setSelectedTempFilter((prev) => (prev === 'HOT' ? null : 'HOT'))
              }
              className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                selectedTempFilter === 'HOT' ? 'ring-2 ring-orange-500 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 237, 213, 0.85) 0%, rgba(254, 215, 170, 0.65) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 22px rgba(249, 115, 22, 0.16)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)',
                }}
              >
                <Flame className="w-5 h-5 fill-white stroke-[2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-[#7C2D12] block leading-tight">
                  Hot & Fresh
                </span>
                <span className="text-[11px] font-bold text-[#C2410C]">
                  (≥ 60°C)
                </span>
              </div>
            </div>

            {/* Card 2: Chilled (4°C) */}
            <div
              onClick={() =>
                setSelectedTempFilter((prev) => (prev === 'CHILLED' ? null : 'CHILLED'))
              }
              className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                selectedTempFilter === 'CHILLED' ? 'ring-2 ring-sky-500 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(224, 242, 254, 0.85) 0%, rgba(186, 230, 253, 0.65) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 22px rgba(14, 165, 233, 0.16)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
                }}
              >
                <Snowflake className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-[#0369A1] block leading-tight">
                  Chilled
                </span>
                <span className="text-[11px] font-bold text-[#0284C7]">
                  (4°C)
                </span>
              </div>
            </div>

            {/* Card 3: Frozen (-18°C) */}
            <div
              onClick={() =>
                setSelectedTempFilter((prev) => (prev === 'FROZEN' ? null : 'FROZEN'))
              }
              className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                selectedTempFilter === 'FROZEN' ? 'ring-2 ring-purple-500 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(243, 232, 255, 0.85) 0%, rgba(233, 213, 255, 0.65) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 22px rgba(168, 85, 247, 0.16)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                }}
              >
                <Box className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-[#6B21A8] block leading-tight">
                  Frozen
                </span>
                <span className="text-[11px] font-bold text-[#7E22CE]">
                  (-18°C)
                </span>
              </div>
            </div>

            {/* Card 4: Fresh (Natural) */}
            <div
              onClick={() =>
                setSelectedTempFilter((prev) => (prev === 'FRESH' ? null : 'FRESH'))
              }
              className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                selectedTempFilter === 'FRESH' ? 'ring-2 ring-emerald-500 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(236, 253, 245, 0.85) 0%, rgba(209, 250, 229, 0.65) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 22px rgba(34, 197, 94, 0.16)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #34D399)',
                }}
              >
                <Leaf className="w-5 h-5 fill-white stroke-[2]" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-[#14532D] block leading-tight">
                  Fresh
                </span>
                <span className="text-[11px] font-bold text-[#15803D]">
                  (Natural)
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 5. MAIN SECTION: OUR MENU (LEFT) + YOUR CART (RIGHT)                 */}
          {/* ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            
            {/* ================================================================== */}
            {/* OUR MENU (8 COLS ON DESKTOP)                                       */}
            {/* ================================================================== */}
            <section
              id="our-menu-section"
              className="lg:col-span-8 p-4 sm:p-6 rounded-3xl flex flex-col gap-5 shadow-2xl transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              {/* Menu Header with Search and Categories Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <UtensilsCrossed className="w-6 h-6 text-[#FF6B4A]" />
                  <h2 className="text-xl font-black text-[#2E1065] tracking-tight">
                    Our Menu
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 flex-1 sm:flex-initial">
                  {/* Search Food Bar */}
                  <div
                    className="flex-1 sm:w-56 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-inner"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-[#2E1065] placeholder-slate-400 font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Dropdown Pill */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none px-3.5 py-2 pr-8 rounded-2xl text-xs font-bold text-[#2E1065] cursor-pointer outline-none shadow-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#2E1065] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Category Pills Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 duration-200 ${
                        isActive
                          ? 'text-white shadow-md shadow-purple-500/30'
                          : 'text-[#4C1D95] hover:bg-white/60'
                      }`}
                      style={
                        isActive
                          ? {
                              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.55)',
                              border: '1px solid rgba(255, 255, 255, 0.7)',
                            }
                      }
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Food Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredProducts.map((item) => {
                  const inCartQty = cart[item.id] || 0;
                  const isFav = wishlist[item.id];

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl p-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.68)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.9)',
                        boxShadow:
                          '0 10px 25px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                      }}
                    >
                      {/* Top Action Row: Temperature Badge & Wishlist Heart */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => handleToggleWishlist(item.id)}
                          className="p-1.5 rounded-full bg-white/70 text-slate-400 hover:text-rose-500 transition-colors shadow-xs"
                          title="Save to Wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>

                        {/* Temperature Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs ${
                            item.thermalState === 'HOT'
                              ? 'bg-orange-500 text-white shadow-orange-500/30'
                              : item.thermalState === 'CHILLED'
                              ? 'bg-sky-500 text-white shadow-sky-500/30'
                              : item.thermalState === 'FROZEN'
                              ? 'bg-purple-500 text-white shadow-purple-500/30'
                              : 'bg-emerald-500 text-white shadow-emerald-500/30'
                          }`}
                        >
                          {item.badgeText}
                        </span>
                      </div>

                      {/* Food Image Container */}
                      <div className="w-full h-32 rounded-2xl overflow-hidden mb-2.5 bg-slate-100 flex items-center justify-center shadow-inner relative">
                        <img
                          src={item.img}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Content: Title & Short Description */}
                      <div className="mb-3">
                        <h3 className="text-sm font-black text-[#2E1065] leading-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom Row: Price & Add / Quantity Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50">
                        <span className="text-base font-black text-[#2E1065] font-mono">
                          ₹{item.price}
                        </span>

                        {inCartQty === 0 ? (
                          <button
                            onClick={() => handleAddToCart(item.id)}
                            className="px-3.5 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all duration-150 active:scale-95"
                            style={{
                              background:
                                'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                            }}
                          >
                            <span>Add</span>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        ) : (
                          <div
                            className="flex items-center rounded-full p-0.5 shadow-sm text-white text-xs font-bold"
                            style={{
                              background:
                                'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                            }}
                          >
                            <button
                              onClick={() => handleDecreaseQuantity(item.id)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Minus className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span className="px-2 font-mono font-black">
                              {inCartQty}
                            </span>
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-12 h-12 text-[#FF6B4A]/50 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-[#2E1065]">
                    No food items found
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for another dish or reset your category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedTempFilter(null);
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[#7C3AED] text-white text-xs font-bold shadow-md"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>

            {/* ================================================================== */}
            {/* YOUR CART (4 COLS ON DESKTOP)                                      */}
            {/* ================================================================== */}
            <section
              className="lg:col-span-4 p-4 sm:p-5 rounded-3xl flex flex-col gap-4 shadow-2xl transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)',
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#2E1065] tracking-tight">
                    Your Cart
                  </h2>
                </div>

                {cartItemsList.length > 0 && (
                  <button
                    onClick={() => {
                      setCart({});
                      triggerToast('Cart cleared');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                    title="Clear Cart"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {cartItemsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover shadow-inner shrink-0"
                    />

                    {/* Title & Price */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black text-[#2E1065] block truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#FF6B4A]">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Quantity Controls Pill */}
                    <div
                      className="flex items-center rounded-full p-0.5 shadow-sm text-white text-xs font-bold shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      }}
                    >
                      <button
                        onClick={() => handleDecreaseQuantity(item.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                      <span className="px-2 font-mono font-black text-[11px]">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Trash Delete Icon */}
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {cartItemsList.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">
                      Your cart is empty
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Add delicious meals from our menu!
                    </p>
                  </div>
                )}
              </div>

              {/* Total Price & View Cart Action Button */}
              <div className="pt-3 border-t border-white/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block font-semibold">
                    Total
                  </span>
                  <span className="text-xl font-black text-[#2E1065] font-mono leading-tight">
                    ₹{totalCartPrice}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartItemsList.length === 0}
                  className="px-5 py-3 rounded-2xl text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                    boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                  }}
                >
                  {isPlacingOrder ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>View Cart</span>
                      <span className="text-sm">➔</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* ==================================================================== */}
          {/* 6. BOTTOM ROW: LIVE RIDER TRACKER (LEFT) + ORDER PROGRESS (RIGHT)    */}
          {/* ==================================================================== */}
          <div
            id="live-tracker-section"
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch pb-12"
          >
            {/* ================================================================== */}
            {/* LIVE RIDER TRACKER MAP (8 COLS ON DESKTOP)                         */}
            {/* ================================================================== */}
            <div
              className="lg:col-span-8 p-4 sm:p-5 rounded-3xl flex flex-col gap-4 shadow-2xl transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6B4A]" />
                  <h3 className="text-base sm:text-lg font-black text-[#2E1065] tracking-tight">
                    Live Rider Tracker
                  </h3>
                </div>

                {/* Map Type Switcher Pills */}
                <div
                  className="flex items-center p-1 rounded-xl text-xs font-bold shadow-inner"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <button
                    onClick={() => setMapLayerType('map')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mapLayerType === 'map'
                        ? 'bg-white text-[#2E1065] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapLayerType('satellite')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mapLayerType === 'satellite'
                        ? 'bg-white text-[#2E1065] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* Map Canvas + Telemetry Box Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Leaflet Map Canvas */}
                <div className="md:col-span-8 h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/60 shadow-inner relative z-0">
                  <MapContainer
                    center={[37.7815, -122.4105]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    attributionControl={false}
                  >
                    {/* Dynamic Map Tile Layer */}
                    <TileLayer
                      url={
                        mapLayerType === 'satellite'
                          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                          : 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      }
                      maxZoom={19}
                    />

                    {/* Route Corridor Vector Polyline */}
                    <Polyline
                      positions={ROUTE_WAYPOINTS}
                      pathOptions={{
                        color: '#3B82F6',
                        weight: 4,
                        opacity: 0.9,
                        lineJoin: 'round',
                      }}
                    />

                    {/* Animated Delivery Rider Beacon */}
                    <Marker position={riderPosition} icon={riderScooterIcon}>
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong>Rahul (Ather 450X)</strong>
                          <br />
                          Speed: 28 km/h · On the way
                        </div>
                      </Popup>
                    </Marker>

                    {/* Customer Destination Home Marker */}
                    <Marker
                      position={ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1]}
                      icon={customerHomeIcon}
                    >
                      <Popup>
                        <div className="text-xs font-sans">
                          <strong>Your Delivery Location</strong>
                          <br />
                          100 Market St, Financial Pod
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                {/* Rider Telemetry Card */}
                <div
                  className="md:col-span-4 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Rider Rahul"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500 shadow-md shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-black text-[#2E1065] leading-tight">
                        Rahul
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        On the Way
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-200/60 font-mono">
                    <div className="p-2 rounded-xl bg-white/60">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">
                        Distance
                      </span>
                      <span className="text-xs font-black text-[#2E1065]">
                        2.8 km
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/60">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">
                        ETA
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        10:45 AM
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      triggerToast('Live GPS Navigation Synced with Courier Telemetry')
                    }
                    className="w-full py-2.5 px-3 rounded-xl text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    <span>View Live Map</span>
                    <span className="text-sm">➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================================================================== */}
            {/* ORDER PROGRESS TIMELINE (4 COLS ON DESKTOP)                        */}
            {/* ================================================================== */}
            <div
              className="lg:col-span-4 p-4 sm:p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-2xl transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                border: '1.5px solid rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  <h3 className="text-base sm:text-lg font-black text-[#2E1065] tracking-tight">
                    Order Progress
                  </h3>
                </div>

                <button
                  onClick={() => triggerToast('Order #LOGI-8492 is on schedule')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal / Stepper Timeline Bar */}
              <div className="py-2">
                <div className="relative flex items-center justify-between mb-4">
                  {/* Purple Connecting Line */}
                  <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-200 z-0">
                    <div
                      className="h-full bg-[#7C3AED] transition-all duration-500"
                      style={{
                        width:
                          orderStage === 0
                            ? '0%'
                            : orderStage === 1
                            ? '33%'
                            : orderStage === 2
                            ? '66%'
                            : '100%',
                      }}
                    />
                  </div>

                  {/* Step 1: Placed */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold"
                      style={{
                        background:
                          orderStage >= 0
                            ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                            : '#E2E8F0',
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold"
                      style={{
                        background:
                          orderStage >= 1
                            ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                            : '#E2E8F0',
                      }}
                    >
                      <ChefHat className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold ring-2 ring-[#7C3AED]/40"
                      style={{
                        background:
                          orderStage >= 2
                            ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                            : '#E2E8F0',
                      }}
                    >
                      <Bike className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold"
                      style={{
                        background:
                          orderStage >= 3
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : '#E2E8F0',
                        color: orderStage >= 3 ? '#FFFFFF' : '#94A3B8',
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Step Labels Grid */}
                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                  <div>
                    <span className="text-[10px] font-bold text-[#2E1065] block leading-tight font-sans">
                      Order Placed
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      10:20 AM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#2E1065] block leading-tight font-sans">
                      Preparing Your Food
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      10:28 AM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#7C3AED] block leading-tight font-sans">
                      Out for Delivery
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      10:40 AM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block leading-tight font-sans">
                      Delivered
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      --:--
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Message Pill */}
              <div
                className="p-3 rounded-2xl text-center shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                }}
              >
                <p className="text-xs font-black text-[#581C87] flex items-center justify-center gap-1.5">
                  <span>Your order is on the way!</span>
                  <span>🚀</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
