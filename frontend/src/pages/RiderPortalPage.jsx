import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { dispatchAPI } from '../services/api';
import {
  Bike,
  Battery,
  MapPin,
  CheckCircle2,
  Package,
  Navigation,
  Clock,
  LogOut,
  Sparkles,
  Phone,
  Compass,
  Check,
  Radio,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Volume2,
  ChevronRight,
  CornerUpRight,
  CheckSquare,
  Square,
  DollarSign,
  Bell,
  User,
  Home,
  ShoppingBag,
  X,
  Menu,
  Box
} from 'lucide-react';

const HUB_COORDS = [37.7937, -122.3965]; // HUB-01 Market St Pod

// Fix Leaflet default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper to auto-fit bounds on active navigation
function NavigationBoundsUpdater({ riderPos, destPos }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !riderPos || !destPos) return;
    const bounds = L.latLngBounds([riderPos, destPos]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [map, riderPos, destPos]);

  return null;
}

// Custom Leaflet Icons Matching Reference Image
// Blue Current Location Beacon Marker
const createCurrentLocationIcon = () => {
  return L.divIcon({
    className: 'current-location-pin',
    html: `
      <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
        <span style="position:absolute; inset:-4px; border-radius:50%; background:rgba(37,99,235,0.3); animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <div style="width:24px; height:24px; border-radius:50%; background:#2563EB; border:3px solid #ffffff; box-shadow:0 0 14px rgba(37,99,235,0.8);"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });
};

// Red Circular Pin with White House Icon (Delivery Destination Marker)
const createDestinationHomeIcon = () => {
  return L.divIcon({
    className: 'destination-home-pin',
    html: `
      <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
        <div style="width:32px; height:32px; border-radius:50%; background:#EF4444; border:2.5px solid #ffffff; box-shadow:0 0 14px rgba(239,68,68,0.7); display:flex; align-items:center; justify-content:center; color:white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Hub Depot Marker
const createDepotIcon = () => {
  return L.divIcon({
    className: 'hub-depot-pin',
    html: `
      <div style="position:relative; width:32px; height:32px; border-radius:10px; background:#1E1B4B; color:#fff; display:flex; align-items:center; justify-content:center; font-family:monospace; font-weight:800; font-size:10px; border:2px solid #FF6B4A; box-shadow:0 0 12px rgba(255,107,74,0.6);">
        HUB
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Audible Chime Synthesizer using Web Audio API
const playAudiblePing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {}
};

// Food Thermal Indicator Identifier for Hot & Fresh, Chilled, Frozen, and Fresh items
const getFoodThermalIndicator = (label = '') => {
  const lower = label.toLowerCase();
  if (
    lower.includes('hot') ||
    lower.includes('pizza') ||
    lower.includes('burger') ||
    lower.includes('bake') ||
    lower.includes('warm') ||
    lower.includes('smash') ||
    lower.includes('toast') ||
    lower.includes('tartine') ||
    lower.includes('fries') ||
    lower.includes('waffle')
  ) {
    return {
      type: 'HOT',
      label: '🔥 Hot & Fresh',
      badgeClass: 'bg-orange-500/15 text-orange-600 border-orange-400/40',
      pillStyle: {
        background: 'rgba(255, 107, 74, 0.15)',
        border: '1px solid rgba(255, 107, 74, 0.4)',
        color: '#EA580C',
      },
    };
  }
  if (
    lower.includes('frozen') ||
    lower.includes('gelato') ||
    lower.includes('ice') ||
    lower.includes('cream') ||
    lower.includes('sorbet') ||
    lower.includes('cone')
  ) {
    return {
      type: 'FROZEN',
      label: '🧊 Frozen (-18°C)',
      badgeClass: 'bg-blue-500/15 text-blue-600 border-blue-400/40',
      pillStyle: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        color: '#2563EB',
      },
    };
  }
  if (
    lower.includes('chilled') ||
    lower.includes('cold') ||
    lower.includes('brew') ||
    lower.includes('coffee') ||
    lower.includes('milk') ||
    lower.includes('sushi') ||
    lower.includes('beverage') ||
    lower.includes('cooler') ||
    lower.includes('kombucha') ||
    lower.includes('soda') ||
    lower.includes('smoothie')
  ) {
    return {
      type: 'CHILLED',
      label: '❄️ Chilled (4°C)',
      badgeClass: 'bg-sky-500/15 text-sky-600 border-sky-400/40',
      pillStyle: {
        background: 'rgba(14, 165, 233, 0.15)',
        border: '1px solid rgba(14, 165, 233, 0.4)',
        color: '#0284C7',
      },
    };
  }
  // Default: Fresh
  return {
    type: 'FRESH',
    label: '🌿 Fresh',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/40',
    pillStyle: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      color: '#059669',
    },
  };
};

export default function RiderPortalPage() {
  const { user, logout } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map Layer Type: 'map' vs 'satellite' (Matching Reference Image)
  const [mapLayerType, setMapLayerType] = useState('map');

  // Active Trip & Incoming Broadcast State
  const [activeTrip, setActiveTrip] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState({
    id: 'ord-broadcast-demo',
    customer: 'Customer Destination',
    address: '100 Market St, Financial Pod',
    lat: 37.7745,
    lng: -122.4195,
    packageDesc: '1x Classic Burger, 1x Cold Coffee, 1x French Fries',
    weightKg: 2.0,
    distanceKm: 3.5,
    itemCount: 3,
    status: 'pending'
  });
  const [courier, setCourier] = useState(null);
  const [completedCount, setCompletedCount] = useState(6);

  // Timers & Checklist
  const [acceptTimer, setAcceptTimer] = useState(30);
  const [verifiedItems, setVerifiedItems] = useState({});
  const [isAccepting, setIsAccepting] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [payoutCelebration, setPayoutCelebration] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Simulated GPS Movement along Navigation Route (Preserving 2-opt sequence)
  const [riderPosition, setRiderPosition] = useState(HUB_COORDS);
  const [routeStepIndex, setRouteStepIndex] = useState(1);
  const simIntervalRef = useRef(null);

  // Generate realistic 2-opt turn-by-turn road polyline between Hub-01 and Destination
  const destCoords = useMemo(() => {
    if (activeTrip?.lat && activeTrip?.lng) {
      return [activeTrip.lat, activeTrip.lng];
    }
    if (incomingOrder?.lat && incomingOrder?.lng) {
      return [incomingOrder.lat, incomingOrder.lng];
    }
    return [37.7745, -122.4195]; // Default Destination
  }, [activeTrip, incomingOrder]);

  const navPolyline = useMemo(() => {
    const start = HUB_COORDS;
    const dest = destCoords;

    // 2-Opt road grid coordinates
    const mid1 = [start[0] + (dest[0] - start[0]) * 0.28, start[1] + (dest[1] - start[1]) * 0.12];
    const mid2 = [start[0] + (dest[0] - start[0]) * 0.55, start[1] + (dest[1] - start[1]) * 0.60];
    const mid3 = [start[0] + (dest[0] - start[0]) * 0.82, start[1] + (dest[1] - start[1]) * 0.88];

    return [start, mid1, mid2, mid3, dest];
  }, [destCoords]);

  // Turn-by-Turn Dynamic Directions
  const turnDirections = useMemo(() => {
    const destAddress = activeTrip?.address || incomingOrder?.address || '100 Market St, SF';
    return [
      {
        instruction: 'Head Northeast on Market St toward 1st St',
        distRemaining: '3.5 km',
        etaMinutes: '8 mins',
        inMeters: '150m'
      },
      {
        instruction: 'Turn right onto Montgomery St',
        distRemaining: '2.4 km',
        etaMinutes: '6 mins',
        inMeters: '300m'
      },
      {
        instruction: 'Continue straight through Pine St intersection',
        distRemaining: '1.2 km',
        etaMinutes: '3 mins',
        inMeters: '400m'
      },
      {
        instruction: `Approaching destination on right: ${destAddress}`,
        distRemaining: '0.2 km',
        etaMinutes: '1 min',
        inMeters: '80m'
      }
    ];
  }, [activeTrip, incomingOrder]);

  const currentTurn = turnDirections[Math.min(routeStepIndex, turnDirections.length - 1)];

  // Polling backend state every 2 seconds
  const fetchRiderState = async () => {
    try {
      const data = await dispatchAPI.getCourierActiveTrip('courier-c1');
      if (data) {
        setCourier(data.courier);
        if (data.activeTrip) {
          setActiveTrip(data.activeTrip);
        }
        if (data.completedOrdersCount) {
          setCompletedCount(data.completedOrdersCount);
        }

        if (data.incomingOrder && !data.activeTrip) {
          if (!incomingOrder || incomingOrder.id !== data.incomingOrder.id) {
            setIncomingOrder(data.incomingOrder);
            setAcceptTimer(30);
            playAudiblePing();
          }
        }
      }
    } catch (err) {
      console.warn('Rider poll notice:', err.message);
    }
  };

  useEffect(() => {
    fetchRiderState();
    const interval = setInterval(fetchRiderState, 2000);
    return () => clearInterval(interval);
  }, [incomingOrder?.id]);

  // Acceptance Countdown Timer for incoming order
  useEffect(() => {
    if (incomingOrder && !activeTrip) {
      const timer = setInterval(() => {
        setAcceptTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [incomingOrder, activeTrip]);

  // Simulated GPS Movement along polyline when in-transit
  useEffect(() => {
    if (activeTrip && activeTrip.status === 'in-transit') {
      simIntervalRef.current = setInterval(() => {
        setRouteStepIndex((prev) => {
          const next = (prev + 1) % navPolyline.length;
          setRiderPosition(navPolyline[next]);
          return next;
        });
      }, 2500);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setRiderPosition(navPolyline[1] || HUB_COORDS);
      setRouteStepIndex(1);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [activeTrip?.status, navPolyline]);

  // Acceptance Action
  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;
    setIsAccepting(true);
    try {
      if (incomingOrder.id !== 'ord-broadcast-demo') {
        const res = await dispatchAPI.acceptOrder(incomingOrder.id);
        setActiveTrip(res.order || { ...incomingOrder, status: 'packed' });
      } else {
        setActiveTrip({ ...incomingOrder, status: 'packed' });
      }
      setToastMsg('Order accepted! Proceed to Dark Store Bay B-02 for bag pickup.');
      setTimeout(() => setToastMsg(''), 4000);
      fetchRiderState();
    } catch (err) {
      console.error('Accept order error:', err);
      setActiveTrip({ ...incomingOrder, status: 'packed' });
    } finally {
      setIsAccepting(false);
    }
  };

  // Decline Action
  const handleDeclineOrder = async () => {
    if (!incomingOrder) return;
    try {
      if (incomingOrder.id !== 'ord-broadcast-demo') {
        await dispatchAPI.declineOrder(incomingOrder.id);
      }
    } catch (err) {
      console.warn('Decline order notice:', err.message);
    }
    setIncomingOrder(null);
    setToastMsg('Order declined and returned to dispatch pool.');
    setTimeout(() => setToastMsg(''), 3000);
    fetchRiderState();
  };

  // OK Button Action (Acknowledge / Confirm Delivery Request)
  const handleOkAction = () => {
    if (incomingOrder && !activeTrip) {
      handleAcceptOrder();
    } else if (activeTrip && isPickupReady) {
      handleConfirmPickup();
    } else if (activeTrip && isEnRoute) {
      handleMarkDelivered();
    } else {
      setToastMsg('Delivery request telemetry acknowledged.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Confirm Bag Pickup Action
  const handleConfirmPickup = async () => {
    if (!activeTrip) return;
    setIsPickingUp(true);
    try {
      if (activeTrip.id !== 'ord-broadcast-demo') {
        const res = await dispatchAPI.pickupOrder(activeTrip.id);
        setActiveTrip(res.order || { ...activeTrip, status: 'in-transit' });
      } else {
        setActiveTrip({ ...activeTrip, status: 'in-transit' });
      }
      setToastMsg('Bag pickup confirmed! Live GPS navigation started.');
      setTimeout(() => setToastMsg(''), 4000);
      fetchRiderState();
    } catch (err) {
      console.error('Pickup error:', err);
      setActiveTrip({ ...activeTrip, status: 'in-transit' });
    } finally {
      setIsPickingUp(false);
    }
  };

  // Mark Delivered Action
  const handleMarkDelivered = async () => {
    if (!activeTrip) return;
    setIsDelivering(true);
    try {
      if (activeTrip.id !== 'ord-broadcast-demo') {
        await dispatchAPI.deliverOrder(activeTrip.id);
      }
      setPayoutCelebration({
        payout: '+$4.50',
        tipBonus: '+$1.50 Rapid Bonus',
        customer: activeTrip.customer,
        address: activeTrip.address,
        distance: '3.5 km',
        savedPct: '24.6%'
      });
      setActiveTrip(null);
      setCompletedCount((c) => c + 1);
      fetchRiderState();
    } catch (err) {
      console.error('Deliver error:', err);
      setPayoutCelebration({
        payout: '+$4.50',
        tipBonus: '+$1.50 Rapid Bonus',
        customer: activeTrip.customer,
        address: activeTrip.address,
        distance: '3.5 km',
        savedPct: '24.6%'
      });
      setActiveTrip(null);
    } finally {
      setIsDelivering(false);
    }
  };

  // Fast Demo Trigger: Seed a sample pending order if pool is empty
  const handleTriggerDemoOrder = async () => {
    try {
      const demoOrder = await dispatchAPI.createOrder({
        customer: 'Customer Destination',
        address: '100 Market St, Financial Pod',
        packageDesc: '1x Classic Burger, 1x Cold Coffee, 1x French Fries',
        weightKg: 2.0,
        priority: 'HIGH',
        waveId: 'wave-alpha'
      });
      setIncomingOrder({
        ...demoOrder,
        distanceKm: 3.5,
        itemCount: 3,
        weightKg: 2.0
      });
      setAcceptTimer(30);
      playAudiblePing();
      setToastMsg('Incoming order broadcast simulated on Corridor Alpha!');
      setTimeout(() => setToastMsg(''), 3500);
      fetchRiderState();
    } catch (err) {
      console.error('Failed to trigger demo order:', err);
      setIncomingOrder({
        id: 'ord-broadcast-demo',
        customer: 'Customer Destination',
        address: '100 Market St, Financial Pod',
        lat: 37.7745,
        lng: -122.4195,
        packageDesc: '1x Classic Burger, 1x Cold Coffee, 1x French Fries',
        weightKg: 2.0,
        distanceKm: 3.5,
        itemCount: 3,
        status: 'pending'
      });
    }
  };

  // Parse items from package description for checklist & food badges
  const parsedItems = useMemo(() => {
    const desc = activeTrip?.packageDesc || incomingOrder?.packageDesc || '1x Classic Burger, 1x Cold Coffee, 1x French Fries';
    return desc.split(',').map((it, idx) => ({ id: idx, label: it.trim() }));
  }, [activeTrip?.packageDesc, incomingOrder?.packageDesc]);

  const toggleItemVerify = (itemId) => {
    setVerifiedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const isCurrentActive = !!activeTrip;
  const isEnRoute = activeTrip?.status === 'in-transit';
  const isPickupReady = activeTrip?.status === 'packed';

  // Transparent Peach/Pink Glassmorphism Panel Style
  const glassPanelStyle = {
    background: 'linear-gradient(180deg, rgba(255, 245, 248, 0.75) 0%, rgba(255, 230, 240, 0.60) 100%)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1.5px solid rgba(255, 255, 255, 0.75)',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
  };

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-[#FF6B4A]/30 selection:text-[#FF6B4A] overflow-x-hidden">
      
      {/* ==================================================================== */}
      {/* 1. FIXED & STATIONARY REALISTIC SUNSET DELIVERY ROAD BACKGROUND       */}
      {/* ==================================================================== */}
      <div 
        className="fixed inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: 'url(/assets/rider_sunset_bg.jpg), url(/assets/customer_sunset_bg.jpg), url(/assets/rider_bg_3d.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft Sunset Peach-Pink Ambience Overlay ensuring crisp contrast */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 12%, rgba(255, 170, 140, 0.18) 0%, rgba(255, 230, 240, 0.38) 45%, rgba(245, 215, 230, 0.62) 100%)',
          }}
        />
      </div>

      {/* Floating Dynamic Feedback Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div 
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#1E1B4B] flex items-center gap-2 shadow-2xl animate-fade-in backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 235, 245, 0.90))',
              border: '1.5px solid rgba(255, 107, 74, 0.4)',
              boxShadow: '0 10px 30px rgba(255, 107, 74, 0.25)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{toastMsg}</span>
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
          style={glassPanelStyle}
        >
          <div>
            {/* Top Brand Logo */}
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
                  <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight leading-tight">
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
                    : 'text-[#1E1B4B] hover:bg-white/50'
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

              {/* 2. My Deliveries */}
              <button
                onClick={() => {
                  setActiveNav('My Deliveries');
                  setIsMobileMenuOpen(false);
                  setToastMsg('Corridor Alpha dispatch route active.');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'My Deliveries'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#1E1B4B] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'My Deliveries'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                      }
                    : {}
                }
              >
                <Box className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>My Deliveries</span>
              </button>

              {/* 3. Earnings */}
              <button
                onClick={() => {
                  setActiveNav('Earnings');
                  setIsMobileMenuOpen(false);
                  setToastMsg('Today’s Shift Earnings: ₹1,850 (6 Deliveries)');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Earnings'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#1E1B4B] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Earnings'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                      }
                    : {}
                }
              >
                <DollarSign className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Earnings</span>
              </button>

              {/* 4. Profile */}
              <button
                onClick={() => {
                  setActiveNav('Profile');
                  setIsMobileMenuOpen(false);
                  setToastMsg('Rider Profile: Ravi Kumar (Ather 450X)');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeNav === 'Profile'
                    ? 'text-white shadow-lg shadow-orange-500/35'
                    : 'text-[#1E1B4B] hover:bg-white/50'
                }`}
                style={
                  activeNav === 'Profile'
                    ? {
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                      }
                    : {}
                }
              >
                <User className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                <span>Profile</span>
              </button>

              {/* 5. Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm text-[#1E1B4B] hover:bg-rose-50 hover:text-rose-600 transition-all"
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
              background: 'rgba(255, 255, 255, 0.50)',
              border: '1px solid rgba(255, 255, 255, 0.65)',
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
              <span className="text-xs font-black text-[#1E1B4B] block leading-tight truncate">
                Ravi Kumar · DP-402
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ather 450X · 92% Battery
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
        {/* MAIN BODY AREA (TOP HEADER + MAP + DELIVERY REQUEST BOX)             */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
          
          {/* ==================================================================== */}
          {/* 3. TOP NAVIGATION BAR (HELLO, RIDER! + NOTIFICATIONS + PROFILE)      */}
          {/* ==================================================================== */}
          <header 
            className="w-full p-4 sm:px-6 sm:py-4 rounded-3xl flex items-center justify-between shadow-xl transition-all"
            style={glassPanelStyle}
          >
            {/* Left: Mobile Menu + Greeting */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-2xl bg-white/60 text-[#1E1B4B] hover:bg-white"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="text-base sm:text-xl font-black text-[#1E1B4B] tracking-tight leading-tight flex items-center gap-1.5">
                <span>Hello, Rider!</span>
                <span>👋</span>
              </h1>
            </div>

            {/* Right: Notification Bell + Profile Avatar */}
            <div className="flex items-center gap-3">
              {/* Fast Simulate Order Button */}
              <button
                onClick={handleTriggerDemoOrder}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-[#FF6B4A] bg-white/60 hover:bg-white border border-[#FF6B4A]/30 transition-all shadow-xs"
                title="Simulate incoming customer order"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF6B4A]" />
                <span>Simulate Order</span>
              </button>

              {/* Notification Bell with Red Badge '2' */}
              <button
                onClick={() => setToastMsg('2 corridor broadcasts available')}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#1E1B4B] transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-[#1E1B4B]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  2
                </span>
              </button>

              {/* Profile Avatar */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Rider Ravi"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md ring-2 ring-[#FF6B4A]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
            </div>
          </header>

          {/* ==================================================================== */}
          {/* 4. PRESERVED MAP CONTAINER (2-OPT ALGORITHM & INTERACTIVE CONTROLS) */}
          {/* ==================================================================== */}
          <div 
            className="w-full rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col gap-3 transition-all"
            style={glassPanelStyle}
          >
            {/* Top Bar inside Map Container: Map / Satellite Controls & Turn Info */}
            <div className="flex items-center justify-between z-10">
              {/* Map / Satellite Toggle Pills (Matching Reference Image) */}
              <div 
                className="flex items-center p-1 rounded-2xl text-xs font-bold shadow-inner"
                style={{
                  background: 'rgba(255, 255, 255, 0.70)',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <button
                  onClick={() => setMapLayerType('map')}
                  className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
                    mapLayerType === 'map'
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={
                    mapLayerType === 'map'
                      ? {
                          background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        }
                      : {}
                  }
                >
                  Map
                </button>
                <button
                  onClick={() => setMapLayerType('satellite')}
                  className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
                    mapLayerType === 'satellite'
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={
                    mapLayerType === 'satellite'
                      ? {
                          background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                        }
                      : {}
                  }
                >
                  Satellite
                </button>
              </div>

              {/* Turn Direction & Google Maps Open Link */}
              <div className="flex items-center gap-2">
                {isCurrentActive && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-white/80 text-xs font-bold text-[#1E1B4B]">
                    <CornerUpRight className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>In {currentTurn.inMeters}: {isPickupReady ? 'Staging Bay B-02' : currentTurn.instruction}</span>
                  </div>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destCoords[0]},${destCoords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-[#1E1B4B] text-xs font-bold flex items-center gap-1.5 border border-white/80 shadow-xs transition-all"
                  title="Open Navigation in Google Maps"
                >
                  <Compass className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span className="hidden sm:inline">Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Leaflet Interactive Map Canvas (Preserving 2-opt route & waypoints) */}
            <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/80 shadow-inner relative z-0">
              <MapContainer
                center={HUB_COORDS}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
                attributionControl={false}
              >
                {/* Free OpenStreetMap / Satellite Tiles */}
                <TileLayer
                  url={
                    mapLayerType === 'satellite'
                      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                      : 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                  maxZoom={19}
                />

                <NavigationBoundsUpdater riderPos={riderPosition} destPos={destCoords} />

                {/* Hub Depot Marker */}
                <Marker position={HUB_COORDS} icon={createDepotIcon()}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>HUB-01 Market St Pod</strong><br />
                      Staging Bay B-02
                    </div>
                  </Popup>
                </Marker>

                {/* Current Location Marker (Blue Circular Beacon matching reference) */}
                <Marker position={riderPosition} icon={createCurrentLocationIcon()}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>Current Rider Location</strong><br />
                      Ather 450X · 28 km/h Telemetry Active
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Home Marker (Red Circle with House Icon matching reference) */}
                <Marker position={destCoords} icon={createDestinationHomeIcon()}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>{activeTrip?.customer || incomingOrder?.customer || 'Customer Destination'}</strong><br />
                      {activeTrip?.address || incomingOrder?.address || '100 Market St, SF'}
                    </div>
                  </Popup>
                </Marker>

                {/* 2-Opt Optimized Route Vector Polyline (Blue Line matching reference) */}
                <Polyline
                  positions={navPolyline}
                  pathOptions={{
                    color: '#2563EB',
                    weight: 5,
                    opacity: 0.95,
                    lineJoin: 'round',
                  }}
                />
              </MapContainer>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 5. DELIVERY REQUEST BOX (MATCHING REFERENCE IMAGE)                   */}
          {/* ==================================================================== */}
          <div 
            className="w-full rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 transition-all"
            style={glassPanelStyle}
          >
            {/* Header: Orange Parcel Icon + New Delivery Request */}
            <div className="flex items-center justify-between pb-3 border-b border-white/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)',
                  }}
                >
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#1E1B4B] tracking-tight leading-tight">
                    New Delivery Request
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Corridor Alpha · Auto-dispatched by 2-Opt Solver
                  </p>
                </div>
              </div>

              {/* Countdown badge if order pending */}
              {incomingOrder && !isCurrentActive && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>⏱ {acceptTimer}s</span>
                </span>
              )}
            </div>

            {/* Main Content: 3 Telemetry Metrics (Distance, Weight, Items) + Action Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
              
              {/* 3 Metric Pills matching reference image */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 flex-1">
                
                {/* Metric 1: Distance */}
                <div 
                  className="p-3.5 rounded-2xl flex items-center gap-3 shadow-xs"
                  style={{
                    background: 'rgba(255, 255, 255, 0.60)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B4A] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase leading-none mb-1">
                      Distance
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#1E1B4B] font-mono leading-none">
                      {incomingOrder?.distanceKm ? `${incomingOrder.distanceKm} km` : '3.5 km'}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Weight */}
                <div 
                  className="p-3.5 rounded-2xl flex items-center gap-3 shadow-xs"
                  style={{
                    background: 'rgba(255, 255, 255, 0.60)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B4A] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase leading-none mb-1">
                      Weight
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#1E1B4B] font-mono leading-none">
                      {incomingOrder?.weightKg ? `${incomingOrder.weightKg.toFixed(1)} kg` : '2.0 kg'}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Items */}
                <div 
                  className="p-3.5 rounded-2xl flex items-center gap-3 shadow-xs"
                  style={{
                    background: 'rgba(255, 255, 255, 0.60)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B4A] shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase leading-none mb-1">
                      Items
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#1E1B4B] font-mono leading-none">
                      {parsedItems.length} items
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Decline (Coral Red), Accept (Fresh Green), OK (Bright Orange) */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Decline Button (Coral Red Glass) */}
                <button
                  onClick={handleDeclineOrder}
                  className="px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  style={{
                    background: 'rgba(255, 82, 82, 0.12)',
                    border: '1.5px solid #FF5252',
                    color: '#E11D48',
                  }}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Decline</span>
                </button>

                {/* Accept Button (Fresh Green Pill) */}
                <button
                  onClick={handleAcceptOrder}
                  disabled={isAccepting}
                  className="px-6 sm:px-7 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {isAccepting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Accept</span>
                    </>
                  )}
                </button>

                {/* OK Button (Bright Orange Pill) */}
                <button
                  onClick={handleOkAction}
                  className="px-6 sm:px-7 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-lg transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                    boxShadow: '0 6px 18px rgba(255, 107, 74, 0.4)',
                  }}
                >
                  <span>OK</span>
                </button>
              </div>
            </div>

            {/* Food Temperature Indicators Showcase Strip */}
            <div 
              className="p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1 shadow-xs"
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.75)',
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-[#1E1B4B]">
                  Food Temperature Indicators:
                </span>
              </div>

              {/* Multi-Temp Badges matching requirements */}
              <div className="flex flex-wrap items-center gap-2">
                {parsedItems.map((item, idx) => {
                  const indicator = getFoodThermalIndicator(item.label);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs"
                      style={indicator.pillStyle}
                    >
                      <span>{indicator.label}</span>
                      <span className="text-slate-600 font-sans font-semibold">· {item.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Active Workflow Actions Tray (When Order Is Accepted) */}
            {isCurrentActive && (
              <div className="pt-3 border-t border-white/50 flex flex-col gap-3">
                {/* Phase 1: Staging Bag Pickup Checklist */}
                {isPickupReady && (
                  <div className="p-4 rounded-2xl bg-white/70 border border-white/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#1E1B4B] uppercase tracking-wide">
                        Phase 1: Collect Sealed Bags at Dark Store Bay B-02
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Pickup Verification
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {parsedItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleItemVerify(item.id)}
                          className="p-2.5 rounded-xl bg-white/90 border border-slate-200 cursor-pointer flex items-center justify-between hover:border-[#FF6B4A] transition-all"
                        >
                          <span className="text-xs font-bold text-[#1E1B4B]">{item.label}</span>
                          {verifiedItems[item.id] ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmPickup}
                      disabled={isPickingUp}
                      className="w-full py-3.5 rounded-xl text-white font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8C42 100%)',
                      }}
                    >
                      {isPickingUp ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Slide to Confirm Bag Pickup</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Phase 2: En Route Delivery Actions */}
                {isEnRoute && (
                  <div className="p-4 rounded-2xl bg-white/70 border border-white/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#1E1B4B] uppercase tracking-wide block">
                          Phase 2: Delivering to {activeTrip.customer || 'Customer'}
                        </span>
                        <span className="text-xs text-slate-500">{activeTrip.address || '100 Market St, SF'}</span>
                      </div>

                      <a
                        href="tel:+14155550199"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-600 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    <button
                      onClick={handleMarkDelivered}
                      disabled={isDelivering}
                      className="w-full py-3.5 rounded-xl text-white font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      }}
                    >
                      {isDelivering ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Arrived & Mark Delivered</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payout Celebration Screen */}
            {payoutCelebration && (
              <div 
                className="p-5 rounded-2xl border border-emerald-400 text-center flex flex-col items-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.85) 0%, rgba(167, 243, 208, 0.70) 100%)',
                }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-emerald-900">
                  Delivery Successful! Earned {payoutCelebration.payout}
                </h3>
                <p className="text-xs font-mono text-emerald-800">
                  {payoutCelebration.tipBonus} · 2-Opt Route Saved {payoutCelebration.savedPct} Distance
                </p>
                <button
                  onClick={() => setPayoutCelebration(null)}
                  className="mt-2 px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
