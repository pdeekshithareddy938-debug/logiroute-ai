import React, { useState, useEffect, useMemo } from 'react';
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
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Check,
  PackageCheck,
  ArrowLeft,
  Phone,
  Calendar,
  RefreshCw
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

// Food Items Catalog matching reference image
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

  // Section Display Navigation State (Dashboard / Browse Menu = Food Menu, Live Tracker, My Orders, Wishlist, Profile)
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filtering State (For Menu)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTempFilter, setSelectedTempFilter] = useState(null); // 'HOT', 'CHILLED', 'FROZEN', 'FRESH'

  // Cart State (Pre-populated with ₹237 total matching reference image)
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

  // Order Progress State (0=Placed, 1=Prep, 2=OutForDelivery, 3=Delivered)
  const [orderStage, setOrderStage] = useState(2);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Active Order ID tracked across tabs and reloads
  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem('active_customer_order_id') || 'LOGI-8492';
  });

  // Active Order Details
  const [activeOrderInfo, setActiveOrderInfo] = useState({
    orderId: '#LOGI-8492',
    placedTime: '10:20 AM',
    estDelivery: '10:45 AM',
    items: ['1x Classic Burger', '1x Cold Coffee', '1x French Fries'],
    amount: 237,
    address: '100 Market St, Financial Pod',
    status: 'Out for Delivery',
    courierName: 'Rahul (Ather 450X)',
    deliveredTime: null,
  });

  // Past Orders History
  const [pastOrders, setPastOrders] = useState([
    {
      id: '#LOGI-7814',
      date: 'Yesterday, 8:15 PM',
      items: '1x Margherita Pizza, 1x Mango Gelato Cup',
      amount: 238,
      status: 'Delivered',
    },
    {
      id: '#LOGI-7102',
      date: '02 Nov 2026, 1:40 PM',
      items: '1x White Sauce Pasta, 1x Veg Sandwich',
      amount: 218,
      status: 'Delivered',
    },
  ]);

  // Sync active order state from backend in real-time
  const syncActiveOrderFromBackend = async () => {
    try {
      const order = await dispatchAPI.getCustomerActiveOrder(activeOrderId);
      if (order && order.id) {
        const orderCleanId = order.id.startsWith('#') ? order.id.slice(1) : order.id;
        setActiveOrderId(orderCleanId);
        localStorage.setItem('active_customer_order_id', orderCleanId);

        const st = (order.status || 'pending').toLowerCase();
        let stage = 0;
        let statusLabel = 'Order Placed';

        if (st === 'delivered') {
          stage = 3;
          statusLabel = 'Delivered';
        } else if (st === 'in-transit' || st === 'packed') {
          stage = 2;
          statusLabel = 'Out for Delivery';
        } else if (st === 'preparing') {
          stage = 1;
          statusLabel = 'Preparing Food';
        } else {
          stage = 0;
          statusLabel = 'Order Placed';
        }

        setOrderStage(stage);

        const parsedItems = order.packageDesc
          ? order.packageDesc.split(',').map((s) => s.trim())
          : ['1x Classic Burger', '1x Cold Coffee', '1x French Fries'];

        const deliveryTimeStr = order.updatedAt
          ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '10:45 AM';

        setActiveOrderInfo((prev) => ({
          ...prev,
          orderId: `#${orderCleanId}`,
          status: statusLabel,
          items: parsedItems.length > 0 ? parsedItems : prev.items,
          address: order.address || prev.address,
          deliveredTime: st === 'delivered' ? (prev.deliveredTime || deliveryTimeStr) : prev.deliveredTime,
          estDelivery: prev.estDelivery || '10:45 AM',
          courierName: order.courier?.name
            ? `${order.courier.name} (${order.courier.vehicle || 'EV'})`
            : 'Rahul (Ather 450X)',
        }));

        // If delivered, append to past orders if not already present
        if (st === 'delivered') {
          setPastOrders((prevPast) => {
            const exists = prevPast.some((p) => p.id === `#${orderCleanId}`);
            if (!exists) {
              return [
                {
                  id: `#${orderCleanId}`,
                  date: 'Today, ' + deliveryTimeStr,
                  items: order.packageDesc || '1x Classic Burger, 1x Cold Coffee, 1x French Fries',
                  amount: 237,
                  status: 'Delivered',
                },
                ...prevPast,
              ];
            }
            return prevPast;
          });
        }
      }
    } catch (e) {
      // Keep existing state if offline or transient network notice
    }
  };

  // Real-time synchronization polling every 2 seconds
  useEffect(() => {
    syncActiveOrderFromBackend();
    const syncInterval = setInterval(syncActiveOrderFromBackend, 2000);
    return () => clearInterval(syncInterval);
  }, [activeOrderId]);

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

  // Wishlist Items
  const wishlistItemsList = useMemo(() => {
    return Object.entries(wishlist)
      .filter(([_, isFav]) => isFav)
      .map(([pId]) => FOOD_CATALOG.find((p) => p.id === pId))
      .filter(Boolean);
  }, [wishlist]);

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
      const newOrderId = `LOGI-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = await dispatchAPI.createOrder({
        id: newOrderId,
        customer: userName,
        address: '100 Market St, Financial Pod',
        packageDesc: desc,
        weightKg: 1.4,
        priority: 'HIGH',
        waveId: 'wave-alpha',
      });

      const cleanId = newOrder?.id || newOrderId;
      setActiveOrderId(cleanId);
      localStorage.setItem('active_customer_order_id', cleanId);

      setActiveOrderInfo({
        orderId: `#${cleanId}`,
        placedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estDelivery: '10:45 AM',
        items: cartItemsList.map((it) => `${it.qty}x ${it.name}`),
        amount: totalCartPrice,
        address: '100 Market St, Financial Pod',
        status: 'Order Placed',
        courierName: 'Rahul (Ather 450X)',
        deliveredTime: null,
      });

      setOrderStage(0);
      triggerToast('🎉 Order placed successfully! Switched to My Orders.');
      setActiveNav('My Orders');
      syncActiveOrderFromBackend();
    } catch (err) {
      console.warn('Backend order notice:', err.message);
      const fallbackId = `LOGI-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveOrderId(fallbackId);
      localStorage.setItem('active_customer_order_id', fallbackId);
      setOrderStage(0);
      setActiveNav('My Orders');
      triggerToast('🎉 Order confirmed! Viewing live order status.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Switch navigation helper
  const navigateTo = (navName) => {
    setActiveNav(navName);
    setIsMobileMenuOpen(false);
  };

  // Reusable Glass Panel Styles
  const glassPanelStyle = {
    background:
      'linear-gradient(180deg, rgba(255, 245, 248, 0.72) 0%, rgba(255, 230, 240, 0.55) 100%)',
    backdropFilter: 'blur(26px)',
    WebkitBackdropFilter: 'blur(26px)',
    border: '1.5px solid rgba(255, 255, 255, 0.75)',
    boxShadow:
      '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
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
        {/* Soft Sunset Peach-Pink Ambience Overlay */}
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
      {/* MAIN COCKPIT CONTAINER (SIDEBAR + ACTIVE SECTION)                    */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex min-h-screen p-3 sm:p-5 lg:p-6 gap-4 sm:gap-6 max-w-[1600px] mx-auto">
        
        {/* ==================================================================== */}
        {/* 2. PERMANENT LEFT SIDEBAR WITH ALL 7 NAVIGATION ITEMS                */}
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
              {/* 1. Dashboard */}
              <button
                onClick={() => navigateTo('Dashboard')}
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
                onClick={() => navigateTo('Browse Menu')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Browse Menu'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Browse Menu'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <UtensilsCrossed className="w-5 h-5 shrink-0" />
                <span>Browse Menu</span>
              </button>

              {/* 3. My Orders */}
              <button
                onClick={() => navigateTo('My Orders')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'My Orders'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'My Orders'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span>My Orders</span>
              </button>

              {/* 4. Live Tracker */}
              <button
                onClick={() => navigateTo('Live Tracker')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Live Tracker'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Live Tracker'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <MapPin className="w-5 h-5 shrink-0" />
                <span>Live Tracker</span>
              </button>

              {/* 5. Wishlist */}
              <button
                onClick={() => navigateTo('Wishlist')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Wishlist'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Wishlist'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <Heart className="w-5 h-5 shrink-0" />
                <span>Wishlist</span>
              </button>

              {/* 6. Profile */}
              <button
                onClick={() => navigateTo('Profile')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Profile'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#4C1D95] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Profile'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        boxShadow: '0 8px 20px rgba(255, 107, 74, 0.4)',
                      }
                    : {}
                }
              >
                <User className="w-5 h-5 shrink-0" />
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

          {/* Bottom Rider on Scooter Silhouette/Card (Visible through glass) */}
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
        {/* MAIN BODY AREA (TOP HEADER + SELECTIVE ACTIVE SECTION)                */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
          
          {/* ==================================================================== */}
          {/* CUSTOMER HEADER (WELCOME, NOTIFICATIONS & PROFILE)                  */}
          {/* ==================================================================== */}
          <header
            className="w-full p-4 sm:px-6 sm:py-4 rounded-3xl flex items-center justify-between shadow-xl transition-all"
            style={glassPanelStyle}
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
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shadow-md shrink-0 cursor-pointer"
                onClick={() => navigateTo('Profile')}
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
                onClick={() => {
                  triggerToast('You have 2 active updates on order #LOGI-8492');
                  navigateTo('My Orders');
                }}
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

              {/* Profile Avatar (Clicks to Profile Section) */}
              <div 
                onClick={() => navigateTo('Profile')}
                className="relative cursor-pointer transition-transform hover:scale-105"
                title="View Customer Profile"
              >
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
          {/* SECTION 1: FOOD MENU & CART (DASHBOARD & BROWSE MENU)                */}
          {/* ==================================================================== */}
          {(activeNav === 'Dashboard' || activeNav === 'Browse Menu') && (
            <div className="flex flex-col gap-4 sm:gap-6 animate-fade-in transition-all duration-300">
              
              {/* Temperature Badges Bar (Hot & Fresh, Chilled, Frozen, Fresh) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Hot & Fresh */}
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
                    style={{ background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)' }}
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

                {/* Chilled */}
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
                    style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)' }}
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

                {/* Frozen */}
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
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
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

                {/* Fresh */}
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
                    style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
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

              {/* Grid: Our Menu (Left 8 Cols) + Your Cart (Right 4 Cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                
                {/* OUR MENU */}
                <section
                  className="lg:col-span-8 p-4 sm:p-6 rounded-3xl flex flex-col gap-5 shadow-2xl transition-all"
                  style={glassPanelStyle}
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
                          {/* Top Action Row */}
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

                          {/* Content */}
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
                    </div>
                  )}
                </section>

                {/* YOUR CART */}
                <section
                  className="lg:col-span-4 p-4 sm:p-5 rounded-3xl flex flex-col gap-4 shadow-2xl transition-all"
                  style={glassPanelStyle}
                >
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
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover shadow-inner shrink-0"
                        />

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

                  {/* Total & Checkout */}
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
                          <span>Place Order</span>
                          <span className="text-sm">➔</span>
                        </>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 2: SEPARATE LIVE RIDER TRACKER PAGE                          */}
          {/* ==================================================================== */}
          {activeNav === 'Live Tracker' && (
            <div className="flex flex-col gap-5 animate-fade-in transition-all duration-300">
              <section className="p-4 sm:p-6 rounded-3xl flex flex-col gap-5 shadow-2xl" style={glassPanelStyle}>
                
                {/* Tracker Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)' }}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#2E1065] tracking-tight">
                        Live Rider Tracker
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Live GPS corridor telemetry for order <strong className="text-[#7C3AED]">{activeOrderInfo.orderId}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Switch Map Layer & Return to Menu Button */}
                  <div className="flex items-center gap-2">
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

                    <button
                      onClick={() => navigateTo('Browse Menu')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-[#2E1065] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      <span>Back to Menu</span>
                    </button>
                  </div>
                </div>

                {/* Main Interactive Map & Telemetry Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* High Resolution Leaflet Map */}
                  <div className="lg:col-span-8 h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/80 shadow-2xl relative z-0">
                    <MapContainer
                      center={[37.7815, -122.4105]}
                      zoom={14}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                      attributionControl={false}
                    >
                      <TileLayer
                        url={
                          mapLayerType === 'satellite'
                            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            : 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }
                        maxZoom={19}
                      />

                      {/* Route Polyline */}
                      <Polyline
                        positions={ROUTE_WAYPOINTS}
                        pathOptions={{
                          color: '#3B82F6',
                          weight: 5,
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
                            <strong>{userName}'s Doorstep</strong>
                            <br />
                            {activeOrderInfo.address}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  {/* Right Telemetry & Rider Profile Panel */}
                  <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                    
                    {/* Rider Info Card */}
                    <div
                      className="p-5 rounded-3xl shadow-lg flex flex-col gap-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.65)',
                        border: '1.5px solid rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                          alt="Rahul"
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-[#FF6B4A] shadow-md shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#2E1065]">
                              Rahul Kumar
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Top Rated
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            On the Way to Your Doorstep
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                            Ather 450X (EV-Fleet #DP-402)
                          </span>
                        </div>
                      </div>

                      {/* Telemetry Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-200/60 font-mono">
                        <div className="p-2.5 rounded-2xl bg-white/70">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase">
                            Distance
                          </span>
                          <span className="text-sm font-black text-[#2E1065]">
                            2.8 km
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white/70">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase">
                            ETA
                          </span>
                          <span className="text-sm font-black text-emerald-600">
                            10:45 AM
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-white/70">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase">
                            Speed
                          </span>
                          <span className="text-sm font-black text-[#7C3AED]">
                            28 km/h
                          </span>
                        </div>
                      </div>

                      {/* Live Call Rider & Security Pin */}
                      <div className="flex items-center gap-2 pt-2">
                        <a
                          href="tel:+14155550199"
                          className="flex-1 py-3 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                          }}
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Rider Rahul</span>
                        </a>

                        <div className="p-3 rounded-2xl bg-white/70 text-center font-mono shrink-0">
                          <span className="text-[9px] text-slate-400 block uppercase font-sans">
                            Delivery PIN
                          </span>
                          <span className="text-xs font-black text-[#FF6B4A]">
                            8492
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Destination Address Pill */}
                    <div
                      className="p-4 rounded-3xl flex items-center gap-3 shadow-md"
                      style={{
                        background: 'rgba(255, 255, 255, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Delivering To Doorstep:
                        </span>
                        <span className="text-xs font-bold text-[#2E1065] block truncate">
                          {activeOrderInfo.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 3: SEPARATE MY ORDERS & ORDER PROGRESS PAGE                  */}
          {/* ==================================================================== */}
          {activeNav === 'My Orders' && (
            <div className="flex flex-col gap-5 animate-fade-in transition-all duration-300">
              
              {/* Active Order with Embedded Progress Stepper */}
              <section className="p-4 sm:p-6 rounded-3xl flex flex-col gap-5 shadow-2xl" style={glassPanelStyle}>
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#2E1065] tracking-tight">
                        Active Order Tracking
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Order ID: <strong className="text-[#FF6B4A]">{activeOrderInfo.orderId}</strong> · Placed at {activeOrderInfo.placedTime}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs ${
                    orderStage >= 3
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : orderStage >= 2
                      ? 'bg-purple-100 text-[#7C3AED] border border-purple-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${orderStage >= 3 ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span>{activeOrderInfo.status}</span>
                  </span>
                </div>

                {/* Order Progress 4-Step Stepper */}
                <div
                  className="p-5 rounded-3xl flex flex-col gap-4 shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1.5px solid rgba(255, 255, 255, 0.85)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Live Delivery Progress
                    </span>
                    <span className="text-xs font-mono font-bold text-[#7C3AED]">
                      {orderStage >= 3
                        ? `Delivered at ${activeOrderInfo.deliveredTime || '10:45 AM'}`
                        : `Est. Arrival ${activeOrderInfo.estDelivery}`}
                    </span>
                  </div>

                  {/* Connected Stepper Line */}
                  <div className="py-2">
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-200 z-0">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            background: orderStage >= 3 ? 'linear-gradient(90deg, #7C3AED, #10B981)' : '#7C3AED',
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
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold"
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
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold"
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
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold ${
                            orderStage === 2 ? 'ring-4 ring-[#7C3AED]/25' : ''
                          }`}
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
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md text-xs font-bold ${
                            orderStage >= 3 ? 'ring-4 ring-emerald-400/30 text-white' : 'text-slate-400'
                          }`}
                          style={{
                            background:
                              orderStage >= 3
                                ? 'linear-gradient(135deg, #10B981, #059669)'
                                : '#E2E8F0',
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Step Labels */}
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div>
                        <span className="text-[11px] font-bold text-[#2E1065] block leading-tight font-sans">
                          Order Placed
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {activeOrderInfo.placedTime || '10:20 AM'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block leading-tight font-sans ${orderStage >= 1 ? 'text-[#2E1065]' : 'text-slate-400'}`}>
                          Preparing Food
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {orderStage >= 1 ? '10:28 AM' : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block leading-tight font-sans ${orderStage === 2 ? 'text-[#7C3AED]' : orderStage > 2 ? 'text-[#2E1065]' : 'text-slate-400'}`}>
                          Out for Delivery
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {orderStage >= 2 ? '10:40 AM' : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold block leading-tight font-sans ${orderStage >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          Delivered
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {orderStage >= 3 ? (activeOrderInfo.deliveredTime || '10:45 AM') : '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                    style={{
                      background: orderStage >= 3 ? 'rgba(236, 253, 245, 0.85)' : 'rgba(255, 255, 255, 0.75)',
                      border: orderStage >= 3 ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className={`w-4 h-4 ${orderStage >= 3 ? 'text-emerald-600' : 'text-[#7C3AED]'}`} />
                      <span className={`text-xs font-bold ${orderStage >= 3 ? 'text-emerald-900' : 'text-[#2E1065]'}`}>
                        {orderStage >= 3
                          ? '🎉 Your order has been delivered! Enjoy your meal.'
                          : 'Your food was packed in an insulated multi-temp thermal seal bag!'}
                      </span>
                    </div>

                    <button
                      onClick={() => navigateTo('Live Tracker')}
                      className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                      }}
                    >
                      <span>Track on Live Map</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>

                {/* Order Itemized Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-3xl flex flex-col gap-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Items Ordered
                    </span>
                    <div className="space-y-1.5">
                      {activeOrderInfo.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold text-[#2E1065]">
                          <span>{it}</span>
                          <span className="font-mono text-emerald-600">Verified</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-sm font-black text-[#2E1065]">
                      <span>Total Paid</span>
                      <span className="font-mono text-[#FF6B4A]">₹{activeOrderInfo.amount}</span>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-3xl flex flex-col justify-between gap-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Delivery Address
                      </span>
                      <p className="text-xs font-bold text-[#2E1065] mt-1">
                        {activeOrderInfo.address}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Handover: Ring doorbell and leave at door
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span>Assigned Rider:</span>
                      <strong className="text-[#2E1065]">{activeOrderInfo.courierName}</strong>
                    </div>
                  </div>
                </div>

                {/* Past Orders History List */}
                <div className="mt-2 pt-4 border-t border-white/50">
                  <h3 className="text-sm font-black text-[#2E1065] uppercase tracking-wider mb-3">
                    Past Orders History
                  </h3>
                  <div className="space-y-2.5">
                    {pastOrders.map((po) => (
                      <div
                        key={po.id}
                        className="p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#2E1065] block leading-tight">
                              {po.items}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {po.id} · {po.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-black text-[#2E1065]">
                            ₹{po.amount}
                          </span>
                          <button
                            onClick={() => {
                              triggerToast(`Reordered ${po.items}`);
                              navigateTo('Browse Menu');
                            }}
                            className="px-3 py-1 rounded-xl bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 4: SEPARATE WISHLIST PAGE                                    */}
          {/* ==================================================================== */}
          {activeNav === 'Wishlist' && (
            <div className="flex flex-col gap-5 animate-fade-in transition-all duration-300">
              <section className="p-4 sm:p-6 rounded-3xl flex flex-col gap-5 shadow-2xl" style={glassPanelStyle}>
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)' }}
                    >
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#2E1065] tracking-tight">
                        My Culinary Wishlist
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {wishlistItemsList.length} saved favorites ready to add to your bag
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('Browse Menu')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-[#2E1065] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>Browse All Items</span>
                  </button>
                </div>

                {/* Wishlist Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {wishlistItemsList.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl p-3 flex flex-col justify-between shadow-md relative"
                      style={{
                        background: 'rgba(255, 255, 255, 0.68)',
                        border: '1.5px solid rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                          {item.badgeText}
                        </span>
                        <button
                          onClick={() => handleToggleWishlist(item.id)}
                          className="p-1 rounded-full text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-full h-32 rounded-2xl overflow-hidden mb-2.5 bg-slate-100">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-black text-[#2E1065] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <span className="text-base font-black text-[#2E1065] font-mono">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          className="px-3.5 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                          }}
                        >
                          <span>Add to Cart</span>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {wishlistItemsList.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-[#FF6B4A]/40 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-[#2E1065]">
                      Your wishlist is empty
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tap the heart icon on any dish in the menu to save it here!
                    </p>
                    <button
                      onClick={() => navigateTo('Browse Menu')}
                      className="mt-3 px-4 py-2 rounded-2xl bg-[#7C3AED] text-white font-bold text-xs shadow-md"
                    >
                      Browse Menu
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 5: SEPARATE PROFILE PAGE (NOT ALL IN ONE)                    */}
          {/* ==================================================================== */}
          {activeNav === 'Profile' && (
            <div className="flex flex-col gap-5 animate-fade-in transition-all duration-300">
              <section className="p-4 sm:p-6 rounded-3xl flex flex-col gap-6 shadow-2xl" style={glassPanelStyle}>
                
                {/* Profile Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
                        alt="Deekshitha"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg ring-4 ring-[#7C3AED]"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#2E1065]">
                          {userName}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30">
                          Gold VIP
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {user?.email || 'customer@gmail.com'} · +1 (415) 555-0199
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ Verified Customer
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          Member since Oct 2026
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('Browse Menu')}
                    className="px-4 py-2 rounded-2xl bg-white/70 hover:bg-white text-[#2E1065] font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-[#FF6B4A]" />
                    <span>Back to Food Menu</span>
                  </button>
                </div>

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Delivery Addresses */}
                  <div
                    className="p-5 rounded-3xl flex flex-col gap-3 shadow-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1.5px solid rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FF6B4A]" />
                        <h3 className="text-sm font-black text-[#2E1065] uppercase tracking-wider">
                          Saved Delivery Addresses
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-[#7C3AED] cursor-pointer">
                        + Add New
                      </span>
                    </div>

                    {/* Address 1 */}
                    <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#2E1065]">
                            Home (Financial Pod)
                          </span>
                          <span className="text-[10px] font-bold bg-[#FF6B4A] text-white px-2 py-0.2 rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          100 Market St, Financial Pod, San Francisco, CA 94105
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#7C3AED] cursor-pointer">Edit</span>
                    </div>

                    {/* Address 2 */}
                    <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-[#2E1065]">
                          Office
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Flat 402, Mission St, San Francisco, CA 94103
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#7C3AED] cursor-pointer">Edit</span>
                    </div>
                  </div>

                  {/* Payment & Loyalty Card */}
                  <div
                    className="p-5 rounded-3xl flex flex-col gap-3 shadow-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1.5px solid rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#7C3AED]" />
                      <h3 className="text-sm font-black text-[#2E1065] uppercase tracking-wider">
                        Payment & LogiRoute Cash
                      </h3>
                    </div>

                    {/* Wallet Balance Pill */}
                    <div
                      className="p-3.5 rounded-2xl text-white flex items-center justify-between shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      }}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/80 block">
                          LogiRoute Cash Balance
                        </span>
                        <span className="text-lg font-black font-mono">₹450.00</span>
                      </div>
                      <button className="px-3 py-1 rounded-xl bg-white text-[#7C3AED] font-bold text-xs shadow-xs">
                        Top Up
                      </button>
                    </div>

                    {/* Saved UPI */}
                    <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-[#2E1065] block">UPI AutoPay</span>
                        <span className="text-slate-500 font-mono">deekshitha@okaxis</span>
                      </div>
                      <span className="text-emerald-600 font-bold">✓ Active</span>
                    </div>
                  </div>

                  {/* Delivery Preferences */}
                  <div
                    className="p-5 rounded-3xl flex flex-col gap-3 shadow-sm md:col-span-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1.5px solid rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-black text-[#2E1065] uppercase tracking-wider">
                        Customer Delivery Preferences
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-white/70 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#2E1065] block">
                            Contactless Delivery
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Leave at doorstep
                          </span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#7C3AED]" />
                      </div>

                      <div className="p-3 rounded-2xl bg-white/70 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#2E1065] block">
                            Thermal Assurance
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Multi-temp sealed
                          </span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#7C3AED]" />
                      </div>

                      <div className="p-3 rounded-2xl bg-white/70 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#2E1065] block">
                            SMS & WhatsApp Alerts
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Live delivery updates
                          </span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#7C3AED]" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
