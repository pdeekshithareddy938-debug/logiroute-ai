import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
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
  DollarSign
} from 'lucide-react';

const HUB_COORDS = [37.7937, -122.3965]; // HUB-01 Market St Pod

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

// Custom Leaflet Icons
const createDepotIcon = () => {
  return L.divIcon({
    className: 'hub-depot-pin',
    html: `
      <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-family:monospace; font-weight:800; font-size:10px; border:2.5px solid #fff; box-shadow:0 0 12px rgba(37,99,235,0.8);">
        HUB
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });
};

const createCustomerDestinationIcon = () => {
  return L.divIcon({
    className: 'customer-dest-pin',
    html: `
      <div style="position:relative; width:36px; height:36px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; border:2.5px solid #fff; box-shadow:0 0 14px rgba(16,185,129,0.9);">
        <span style="position:absolute; inset:-4px; border-radius:50%; border:2px solid #10b981; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; opacity:0.75;"></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

const createRiderBeaconIcon = (heading = 45) => {
  return L.divIcon({
    className: 'rider-beacon-pin',
    html: `
      <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
        <span style="position:absolute; width:38px; height:38px; border-radius:50%; background:rgba(6,182,212,0.25); border:1.5px solid #06b6d4; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <div style="width:30px; height:30px; border-radius:50%; background:#06b6d4; color:#0f172a; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 0 15px rgba(6,182,212,0.9); transform:rotate(${heading}deg);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
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
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // Note D6

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    // Non-fatal if audio context blocked before first user click
  }
};

export default function RiderPortalPage() {
  const { user, logout } = useAuth();

  // Active Trip & Incoming Broadcast State
  const [activeTrip, setActiveTrip] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [courier, setCourier] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  // Timers & Checklist
  const [acceptTimer, setAcceptTimer] = useState(30);
  const [verifiedItems, setVerifiedItems] = useState({});
  const [isAccepting, setIsAccepting] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [payoutCelebration, setPayoutCelebration] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Simulated GPS Movement along Navigation Route
  const [riderPosition, setRiderPosition] = useState(HUB_COORDS);
  const [routeStepIndex, setRouteStepIndex] = useState(0);
  const simIntervalRef = useRef(null);

  // Generate realistic turn-by-turn road polyline between Hub-01 and Destination
  const destCoords = useMemo(() => {
    if (activeTrip?.lat && activeTrip?.lng) {
      return [activeTrip.lat, activeTrip.lng];
    }
    if (incomingOrder?.lat && incomingOrder?.lng) {
      return [incomingOrder.lat, incomingOrder.lng];
    }
    return [37.7946, -122.4034]; // Default nearby SF stop
  }, [activeTrip, incomingOrder]);

  const navPolyline = useMemo(() => {
    const start = HUB_COORDS;
    const dest = destCoords;

    // Realistic SF Downtown grid points
    const mid1 = [start[0] + (dest[0] - start[0]) * 0.3, start[1] + (dest[1] - start[1]) * 0.1];
    const mid2 = [start[0] + (dest[0] - start[0]) * 0.65, start[1] + (dest[1] - start[1]) * 0.7];
    const mid3 = [start[0] + (dest[0] - start[0]) * 0.85, start[1] + (dest[1] - start[1]) * 0.95];

    return [start, mid1, mid2, mid3, dest];
  }, [destCoords]);

  // Turn-by-Turn Dynamic Directions
  const turnDirections = useMemo(() => {
    const destAddress = activeTrip?.address || incomingOrder?.address || '100 Market St, SF';
    return [
      {
        instruction: 'Head Northeast on Market St toward 1st St',
        distRemaining: '1.4 km',
        etaMinutes: '4 mins',
        inMeters: '150m'
      },
      {
        instruction: 'Turn right onto Montgomery St',
        distRemaining: '0.9 km',
        etaMinutes: '3 mins',
        inMeters: '300m'
      },
      {
        instruction: 'Continue straight through Pine St intersection',
        distRemaining: '0.5 km',
        etaMinutes: '2 mins',
        inMeters: '400m'
      },
      {
        instruction: `Approaching destination on right: ${destAddress}`,
        distRemaining: '0.1 km',
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
        setActiveTrip(data.activeTrip);
        setCompletedCount(data.completedOrdersCount || 0);

        // Check if new incoming order appeared
        if (data.incomingOrder && !data.activeTrip) {
          if (!incomingOrder || incomingOrder.id !== data.incomingOrder.id) {
            setIncomingOrder(data.incomingOrder);
            setAcceptTimer(30);
            playAudiblePing();
          }
        } else if (!data.incomingOrder) {
          setIncomingOrder(null);
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
            handleDeclineOrder(incomingOrder.id);
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
      setRiderPosition(HUB_COORDS);
      setRouteStepIndex(0);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [activeTrip?.status, navPolyline]);

  // Acceptance Action
  const handleAcceptOrder = async (orderId) => {
    setIsAccepting(true);
    try {
      const res = await dispatchAPI.acceptOrder(orderId);
      setActiveTrip(res.order || { ...incomingOrder, status: 'packed' });
      setIncomingOrder(null);
      setToastMsg('Order accepted! Proceed to Dark Store Bay B-02 for bag pickup.');
      setTimeout(() => setToastMsg(''), 4000);
      fetchRiderState();
    } catch (err) {
      console.error('Accept order error:', err);
      // Fallback optimistic update
      setActiveTrip({ ...incomingOrder, status: 'packed' });
      setIncomingOrder(null);
    } finally {
      setIsAccepting(false);
    }
  };

  // Decline Action
  const handleDeclineOrder = async (orderId) => {
    try {
      await dispatchAPI.declineOrder(orderId);
    } catch (err) {
      console.warn('Decline order notice:', err.message);
    }
    setIncomingOrder(null);
    setToastMsg('Order declined and returned to dispatch pool.');
    setTimeout(() => setToastMsg(''), 3000);
    fetchRiderState();
  };

  // Confirm Bag Pickup Action
  const handleConfirmPickup = async () => {
    if (!activeTrip) return;
    setIsPickingUp(true);
    try {
      const res = await dispatchAPI.pickupOrder(activeTrip.id);
      setActiveTrip(res.order || { ...activeTrip, status: 'in-transit' });
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
      const res = await dispatchAPI.deliverOrder(activeTrip.id);
      setPayoutCelebration({
        payout: '+$4.50',
        tipBonus: '+$1.50 Rapid Bonus',
        customer: activeTrip.customer,
        address: activeTrip.address,
        distance: '1.8 km',
        savedPct: '24.6%'
      });
      setActiveTrip(null);
      setIncomingOrder(null);
      setCompletedCount((c) => c + 1);
      fetchRiderState();
    } catch (err) {
      console.error('Deliver error:', err);
      setPayoutCelebration({
        payout: '+$4.50',
        tipBonus: '+$1.50 Rapid Bonus',
        customer: activeTrip.customer,
        address: activeTrip.address,
        distance: '1.8 km',
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
        customer: 'Customer',
        address: 'Flat 402, Mission St, SF',
        packageDesc: '2x Artisan Cold Brew, 1x Madagascar Gelato',
        weightKg: 1.6,
        priority: 'HIGH',
        waveId: 'wave-alpha'
      });
      setIncomingOrder(demoOrder);
      setAcceptTimer(30);
      playAudiblePing();
      setToastMsg('Incoming order broadcast simulated on Corridor Alpha!');
      setTimeout(() => setToastMsg(''), 3500);
      fetchRiderState();
    } catch (err) {
      console.error('Failed to trigger demo order:', err);
    }
  };

  // Parse items from package description for Phase 1 checklist
  const parsedItems = useMemo(() => {
    const desc = activeTrip?.packageDesc || incomingOrder?.packageDesc || '1x Organic Cold Brew, 1x Madagascar Gelato';
    return desc.split(',').map((it, idx) => ({ id: idx, label: it.trim() }));
  }, [activeTrip?.packageDesc, incomingOrder?.packageDesc]);

  const toggleItemVerify = (itemId) => {
    setVerifiedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const isCurrentActive = !!activeTrip;
  const isEnRoute = activeTrip?.status === 'in-transit';
  const isPickupReady = activeTrip?.status === 'packed';

  return (
    <div className="min-h-screen bg-[#060a13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Mobile Phone Mount Telemetry Bar */}
      <header className="sticky top-0 z-40 bg-[#090f1d]/95 backdrop-blur-xl border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <span>Delivery Partner #DP-402</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Ather 450X (EV-Fleet) · Financial Pod
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Shift Payout Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold">
            <span>Shift: $24.50</span>
          </div>

          {/* Battery Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-xs">
            <Battery className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold">{courier?.battery ?? 92}%</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Main Scooter Mount Layout Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-4 pb-20">
        
        {/* ======================================================== */}
        {/* TOP HALF: Embedded Turn-by-Turn Leaflet Route Map */}
        {/* ======================================================== */}
        <div className="w-full relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090f1d]">
          {/* Floating Turn-by-Turn Instruction Strip */}
          {isCurrentActive && (
            <div className="absolute top-3 left-3 right-3 z-[1000] bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-3 shadow-2xl shadow-cyan-950/40">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                    <CornerUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block leading-none">
                      In {currentTurn.inMeters}
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5 leading-tight">
                      {isPickupReady ? 'Head to Staging Bay B-02' : currentTurn.instruction}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destCoords[0]},${destCoords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono flex items-center gap-1.5 border border-slate-700 shrink-0 font-semibold transition-all active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>🧭 Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Progress & ETA Strip */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80 text-slate-300">
                <span>Dist: <strong className="text-white">{currentTurn.distRemaining}</strong></span>
                <span>ETA: <strong className="text-emerald-400">{currentTurn.etaMinutes}</strong></span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>GPS 5G</span>
                </span>
              </div>
            </div>
          )}

          {/* Leaflet Map Canvas */}
          <div className="h-64 sm:h-72 w-full">
            <MapContainer
              center={HUB_COORDS}
              zoom={14}
              scrollWheelZoom={false}
              className="h-full w-full"
              attributionControl={false}
            >
              {/* 100% Free OpenStreetMap Tiles */}
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <NavigationBoundsUpdater riderPos={riderPosition} destPos={destCoords} />

              {/* Hub-01 Pickup Origin Marker */}
              <Marker position={HUB_COORDS} icon={createDepotIcon()}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong>HUB-01 Market St Pod</strong><br />
                    Staging Bay B-02
                  </div>
                </Popup>
              </Marker>

              {/* Destination Pin */}
              {(isCurrentActive || incomingOrder) && (
                <Marker position={destCoords} icon={createCustomerDestinationIcon()}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>{activeTrip?.customer || incomingOrder?.customer || 'Customer Destination'}</strong><br />
                      {activeTrip?.address || incomingOrder?.address}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Animated Live Rider Courier Beacon */}
              <Marker position={riderPosition} icon={createRiderBeaconIcon(routeStepIndex * 60)}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong>Ravi Kumar (Ather 450X)</strong><br />
                    Telemetry Lock Active
                  </div>
                </Popup>
              </Marker>

              {/* Glowing Route Polyline */}
              {(isCurrentActive || incomingOrder) && (
                <Polyline
                  positions={navPolyline}
                  pathOptions={{
                    color: '#10b981',
                    weight: 5,
                    opacity: 0.9,
                    lineJoin: 'round',
                    dashArray: isPickupReady ? '6, 8' : null
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: Real-Time Incoming Order Broadcast Alert Card */}
        {/* ======================================================== */}
        {incomingOrder && !isCurrentActive && (
          <div className="bg-gradient-to-b from-[#141d2e] via-[#0d1626] to-[#070e1c] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-bounce-subtle">
            {/* Top Pulsing Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />

            {/* Countdown Badge & Cold Chain Alert */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>⏱ {acceptTimer}s to accept</span>
              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                ❄️ Chilled SLA Onboard
              </span>
            </div>

            {/* Order Title & Payout */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">
                  Incoming Corridor Order
                </h3>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{incomingOrder.address}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Est. Payout</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  +$4.50
                </span>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 mb-4 text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="font-bold text-white">1.8 km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Weight</span>
                <span className="font-bold text-white">{incomingOrder.weightKg || 1.6} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Items</span>
                <span className="font-bold text-cyan-400">{parsedItems.length} Items</span>
              </div>
            </div>

            {/* Action Buttons: Decline & Accept */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDeclineOrder(incomingOrder.id)}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all active:scale-95"
              >
                Decline
              </button>

              <button
                onClick={() => handleAcceptOrder(incomingOrder.id)}
                disabled={isAccepting}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAccepting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Accept Delivery Run</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: Progressive Commercial Workflow Action Tray */}
        {/* ======================================================== */}
        {isCurrentActive ? (
          <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            
            {/* Phase Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                isPickupReady 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isPickupReady ? 'Phase 1: Dark Store Staging' : 'Phase 2: En Route Delivery'}
              </span>

              <span className="text-xs font-mono text-cyan-400 font-bold">
                Order #{activeTrip.id.slice(0, 8)}
              </span>
            </div>

            {/* PHASE 1: Bag Handover Checklist */}
            {isPickupReady && (
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Proceed to Dark Store Bay B-02 · Collect 2 Sealed Bags
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verify items sealed in insulated chill pack before departure
                  </p>
                </div>

                {/* Item Verification Checklist */}
                <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Parcel Verification:
                  </span>
                  {parsedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemVerify(item.id)}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors"
                    >
                      <span className="text-xs text-slate-200">{item.label}</span>
                      {verifiedItems[item.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Primary Action Button: Confirm Bag Pickup */}
                <button
                  onClick={handleConfirmPickup}
                  disabled={isPickingUp}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isPickingUp ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Slide to Confirm Bag Pickup</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* PHASE 2: En Route Navigation & Doorstep Handover */}
            {isEnRoute && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Delivering to {activeTrip.customer}
                  </h3>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{activeTrip.address}</span>
                  </div>
                </div>

                {/* Quick Actions: Call Customer & Delivery Instructions */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="tel:+14155550199"
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Customer</span>
                  </a>

                  <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gate Code #4492</span>
                  </div>
                </div>

                {/* Delivery Instructions Callout */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-300">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                    Delivery Instructions:
                  </span>
                  <span>Leave at doorstep / Ring bell. Customer confirmed home.</span>
                </div>

                {/* PHASE 3: Large Tap Target Button — Mark Delivered */}
                <button
                  onClick={handleMarkDelivered}
                  disabled={isDelivering}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm tracking-wide shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isDelivering ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>✓ Arrived & Mark Delivered</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* ======================================================== */}
        {/* SECTION 3: Completed Delivery Payout Celebration Screen */}
        {/* ======================================================== */}
        {payoutCelebration && (
          <div className="bg-gradient-to-b from-emerald-950/80 via-[#0b1726] to-[#070e1a] border-2 border-emerald-400 rounded-3xl p-6 shadow-2xl text-center animate-fade-in relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <Sparkles className="w-7 h-7" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider inline-block mb-2">
              Delivery Successful!
            </span>

            <h3 className="text-2xl font-black text-white mb-1">
              Earned {payoutCelebration.payout}
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-5">
              {payoutCelebration.tipBonus} · Doorstep Handover Completed
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Distance</span>
                <span className="text-lg font-bold text-white font-mono">{payoutCelebration.distance}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">2-Opt Saved</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">-{payoutCelebration.savedPct}</span>
              </div>
            </div>

            <button
              onClick={() => setPayoutCelebration(null)}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Radar Mode</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: Idle Radar Mode (Searching for Nearby Orders) */}
        {/* ======================================================== */}
        {!isCurrentActive && !incomingOrder && !payoutCelebration && (
          <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            {/* Spinning Radar Beacon */}
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
              <span className="absolute inset-2 rounded-full border border-emerald-500/40 animate-pulse" />
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Looking for nearby orders...
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
              Stationed at HUB-01 Market St Pod. Real-time broadcast lock active across Downtown Corridor Alpha.
            </p>

            <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-400 mb-5">
              <span>Completed Today: <strong className="text-emerald-400">{completedCount} Orders</strong></span>
              <span>•</span>
              <span>5G Telemetry: <strong className="text-cyan-400">Locked</strong></span>
            </div>

            {/* Fast Demo Trigger Button */}
            <button
              onClick={handleTriggerDemoOrder}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>⚡ Simulate Incoming Customer Order</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
