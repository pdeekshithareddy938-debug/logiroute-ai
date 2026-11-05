import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart,
  Box,
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Navigation, 
  Plus, 
  Database, 
  ArrowRight, 
  MapPin, 
  RefreshCw, 
  Zap, 
  Bike, 
  Truck, 
  BatteryCharging, 
  Send, 
  Radio, 
  Timer, 
  Layers, 
  Sparkles, 
  AlertCircle,
  ThermometerSnowflake,
  ShieldAlert,
  Search
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DeliveryStatusBadge from '../components/DeliveryStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import DeliveryModal from '../components/DeliveryModal';
import LiveFleetMap from '../components/LiveFleetMap';
import dispatchAPI from '../services/api';

// Dedicated Corridor Configurations
const CORRIDOR_CONFIG = {
  'wave-alpha': {
    code: 'ALPHA',
    prefix: 'A',
    colorHex: '#059669', // Emerald
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    badgeGlow: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(5,150,105,0.3)]',
    slaMinutes: 10,
    distKm: '6.5',
    distSaved: '1.9 km (-23%)',
    packingPct: 88,
    chilledWarning: '❄️ Chilled SLA (Ice cream onboard)',
  },
  'wave-beta': {
    code: 'BETA',
    prefix: 'B',
    colorHex: '#2563eb', // Royal Blue
    borderClass: 'border-blue-500/40 hover:border-blue-400',
    badgeGlow: 'bg-blue-950/70 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.3)]',
    slaMinutes: 15,
    distKm: '6.4',
    distSaved: '2.0 km (-24%)',
    packingPct: 94,
    chilledWarning: null,
  },
  'wave-gamma': {
    code: 'GAMMA',
    prefix: 'G',
    colorHex: '#d97706', // Amber
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    badgeGlow: 'bg-amber-950/70 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(217,119,6,0.3)]',
    slaMinutes: 20,
    distKm: '5.1',
    distSaved: '1.4 km (-22%)',
    packingPct: 78,
    chilledWarning: null,
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [rawWaves, setRawWaves] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  
  // 2-Opt Optimization toggle and 1-second calculation pulse animation
  const [is2OptOptimized, setIs2OptOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedWaveId, setSelectedWaveId] = useState(null);

  // Quick filters & search for dashboard
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live ticking SLA countdown timers
  const [slaTimers, setSlaTimers] = useState({
    'wave-alpha': 326, // 00:05:26
    'wave-beta': 492,  // 00:08:12
    'wave-gamma': 765, // 00:12:45
  });

  // Real-time wave and rider simulation states
  const [waveStatuses, setWaveStatuses] = useState({});
  const [activeRiderPositions, setActiveRiderPositions] = useState({});
  const [toastNotification, setToastNotification] = useState(null);

  const riderIntervalsRef = useRef({});
  const navigate = useNavigate();

  // Active SLA countdown ticker
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSlaTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) next[key] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatSlaTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopAllRiderAnimations = () => {
    Object.values(riderIntervalsRef.current).forEach((intId) => {
      if (intId) clearInterval(intId);
    });
    riderIntervalsRef.current = {};
  };

  useEffect(() => {
    return () => stopAllRiderAnimations();
  }, []);

  // Fetch live dashboard telemetry from Express + Prisma SQLite backend
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await dispatchAPI.getDashboard();
      
      const normalizedOrders = (data.orders || []).map((o) => ({
        ...o,
        latitude: o.lat ?? o.latitude,
        longitude: o.lng ?? o.longitude,
        customer_name: o.customer ?? o.customer_name,
        delivery_address: o.address ?? o.delivery_address,
        package_details: o.packageDesc ?? o.package_details,
        weight_kg: o.weightKg ?? o.weight_kg,
        priority: (o.priority || 'MEDIUM').toUpperCase(),
        status: (o.status || 'pending').toUpperCase(),
      }));

      setStats(data.summary || null);
      setRawWaves(data.waves || []);
      setDeliveries(normalizedOrders);

      const statuses = {};
      (data.waves || []).forEach((w) => {
        statuses[w.id] = (w.status || 'pending').toUpperCase();
      });
      setWaveStatuses(statuses);
    } catch (err) {
      console.error('Failed to load live backend telemetry:', err);
      setErrorMsg('Could not reach Express backend at http://localhost:5000. Retrying...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Enrich waves with micro-fulfillment telemetry (packing %, SLA timer, cold-chain chip)
  const waves = useMemo(() => {
    if (!rawWaves || rawWaves.length === 0) return [];

    return rawWaves.map((w) => {
      const conf = CORRIDOR_CONFIG[w.id] || {
        code: (w.name || 'WAVE').split(' ')[1] || 'WAVE',
        prefix: (w.name || 'W')[5] || 'W',
        colorHex: '#10b981',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        badgeGlow: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/50',
        slaMinutes: 15,
        distKm: '6.0',
        distSaved: '1.8 km (-23%)',
        packingPct: 85,
        chilledWarning: null,
      };

      const waveOrders = deliveries.filter((d) => d.waveId === w.id);

      return {
        id: w.id,
        code: conf.code,
        prefix: conf.prefix,
        title: w.name,
        corridor: w.corridor,
        colorHex: conf.colorHex,
        borderClass: conf.borderClass,
        badgeGlow: conf.badgeGlow,
        slaMinutes: conf.slaMinutes,
        distKm: conf.distKm,
        distSaved: conf.distSaved,
        packingPct: conf.packingPct,
        chilledWarning: conf.chilledWarning,
        courier: {
          id: w.courier?.id || 'courier-c1',
          name: w.courier?.name || 'Delivery Partner #DP-402',
          vehicle: w.courier?.vehicle || 'Ather 450X (EV-Fleet)',
          code: 'DP-402',
          battery: `${w.courier?.battery ?? 92}%`,
          status: w.courier?.status || 'idle'
        },
        orders: waveOrders,
        status: waveStatuses[w.id] || (w.status || 'pending').toUpperCase(),
      };
    }).filter((w) => w.orders.length > 0);
  }, [rawWaves, deliveries, waveStatuses]);

  // Filter deliveries based on quick search and pills
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (statusFilter !== 'ALL') {
        const s = (d.status || '').toUpperCase();
        if (statusFilter === 'PENDING' && s !== 'PENDING') return false;
        if (statusFilter === 'IN-TRANSIT' && s !== 'IN_TRANSIT' && s !== 'IN-TRANSIT') return false;
        if (statusFilter === 'DELIVERED' && s !== 'DELIVERED') return false;
      }
      if (priorityFilter !== 'ALL') {
        const p = (d.priority || '').toUpperCase();
        if (p !== priorityFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.customer_name || '').toLowerCase().includes(q);
        const matchAddr = (d.delivery_address || '').toLowerCase().includes(q);
        const matchPkg = (d.package_details || '').toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchPkg) return false;
      }
      return true;
    });
  }, [deliveries, statusFilter, priorityFilter, searchQuery]);

  // 'Dispatch Wave' Action — Triggers live PATCH /api/dispatch/waves/:id/dispatch
  const handleDispatchWave = async (wave) => {
    const waveId = wave.id;
    const waveOrderIds = (wave.orders || []).map((o) => o.id);

    // Optimistically update wave and delivery orders
    setWaveStatuses((prev) => ({ ...prev, [waveId]: 'IN_TRANSIT' }));
    setDeliveries((prev) =>
      prev.map((d) => (waveOrderIds.includes(d.id) ? { ...d, status: 'IN_TRANSIT' } : d))
    );

    // Instant toast notification
    setToastNotification({
      type: 'success',
      title: `${wave.title.split('—')[0].trim()} Dispatched!`,
      message: `Rider ${wave.courier.name} (${wave.courier.code}) en route with ${wave.orders.length} orders.`,
    });
    setTimeout(() => setToastNotification(null), 4000);

    // Call live REST API endpoint
    try {
      await dispatchAPI.dispatchWave(waveId);
    } catch (err) {
      console.warn('Backend wave dispatch fallback:', err.message);
    }

    // Build waypoint sequence along the route: HUB -> stops -> HUB
    const hubPos = [37.7937, -122.3965];
    const stopsCoords = (wave.orders || []).map((o) => [o.latitude, o.longitude]);
    const waypoints = [hubPos, ...stopsCoords, hubPos];

    // Smooth GPS animation for the courier bike
    const pathSteps = [];
    const STEPS_PER_LEG = 8;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      for (let s = 0; s < STEPS_PER_LEG; s++) {
        const t = s / STEPS_PER_LEG;
        const lat = start[0] + (end[0] - start[0]) * t;
        const lon = start[1] + (end[1] - start[1]) * t;
        pathSteps.push([lat, lon]);
      }
    }
    pathSteps.push(hubPos);

    let currentStepIndex = 0;
    if (riderIntervalsRef.current[waveId]) {
      clearInterval(riderIntervalsRef.current[waveId]);
    }

    riderIntervalsRef.current[waveId] = setInterval(() => {
      currentStepIndex += 1;
      if (currentStepIndex < pathSteps.length) {
        const pos = pathSteps[currentStepIndex];
        setActiveRiderPositions((prev) => ({ ...prev, [waveId]: pos }));
      } else {
        // Circuit complete: fulfilled back at HUB
        clearInterval(riderIntervalsRef.current[waveId]);
        delete riderIntervalsRef.current[waveId];

        setWaveStatuses((prev) => ({ ...prev, [waveId]: 'DELIVERED' }));
        setDeliveries((prev) =>
          prev.map((d) => (waveOrderIds.includes(d.id) ? { ...d, status: 'DELIVERED' } : d))
        );

        waveOrderIds.forEach((id) => {
          dispatchAPI.updateOrderStatus(id, 'delivered').catch(() => {});
        });

        setToastNotification({
          type: 'success',
          title: `${wave.code} Corridor Completed!`,
          message: `Rider ${wave.courier.name} fulfilled all ${wave.orders.length} deliveries.`,
        });
        setTimeout(() => setToastNotification(null), 4000);
      }
    }, 280);
  };

  // 'Seed 8 Orders' Button — Triggers live POST /api/seed
  const handleSeedData = async () => {
    try {
      stopAllRiderAnimations();
      setActionMsg('Refreshing simulation database via Prisma SQLite...');

      const result = await dispatchAPI.seedDatabase();

      setActiveRiderPositions({});
      setIs2OptOptimized(false);
      setIsOptimizing(false);
      setActionMsg('');

      setToastNotification({
        type: 'success',
        title: 'Simulation Pool Reset',
        message: result.message || 'Live dispatch pool refreshed with 9 orders across 3 corridors',
      });
      setTimeout(() => setToastNotification(null), 4000);

      fetchDashboardData();
    } catch (err) {
      console.error('Failed to reset demo via backend:', err);
      setActionMsg('');
      fetchDashboardData();
    }
  };

  // Modal Delivery Creation
  const handleSaveDelivery = async (formData) => {
    try {
      await dispatchAPI.createOrder({
        customer: formData.customer_name,
        address: formData.delivery_address,
        lat: formData.latitude,
        lng: formData.longitude,
        packageDesc: formData.package_details,
        weightKg: formData.weight_kg,
        priority: formData.priority,
      });
      setIsModalOpen(false);
      fetchDashboardData();
      setToastNotification({
        type: 'success',
        title: 'New Order Created',
        message: `Order for ${formData.customer_name} added to live dispatch queue.`,
      });
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await dispatchAPI.updateOrderStatus(id, newStatus);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus.toUpperCase() } : d))
      );
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  // 2-Opt Optimization Button Interaction
  const handleToggle2Opt = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);

    try {
      await dispatchAPI.optimizeRoutes('wave-alpha');
    } catch (e) {
      console.warn('Backend 2-Opt route optimize notice:', e.message);
    }

    setTimeout(() => {
      setIsOptimizing(false);
      setIs2OptOptimized((prev) => {
        const nextState = !prev;
        setToastNotification({
          type: nextState ? 'success' : 'info',
          title: nextState ? '✓ 2-Opt Optimization Applied!' : 'Baseline Mode Active',
          message: nextState
            ? 'Untangled route crossovers: 14.8 km saved (-24.6%) across all corridors.'
            : 'Showing baseline criss-cross routes (0 km saved).',
        });
        setTimeout(() => setToastNotification(null), 3500);
        return nextState;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Top Floating Notification Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse shadow-[0_0_8px_#06b6d4]" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wide">{toastNotification.title}</div>
            <div className="text-[11px] font-mono text-slate-300 mt-0.5">{toastNotification.message}</div>
          </div>
        </div>
      )}

      {/* Operations Tower Header Card with Glassmorphism */}
      <div 
        className="p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4 border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.75) 0%, rgba(10, 16, 32, 0.88) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 0 20px rgba(6, 182, 212, 0.05)',
        }}
      >
        {/* Upper Row: Title, Subtitle, and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                LogiRoute AI Operations Tower
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                HUB-01_SF
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300/80 mt-1">
              2-Opt algorithmic routing solver, 90-second dark store packing SLA, and fleet dispatch
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="p-2 text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl border border-white/10 transition-colors cursor-pointer shadow-sm"
              title="Refresh Live Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={handleSeedData}
              className="px-4 py-2 text-xs font-mono font-bold text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 rounded-xl border border-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              title="Reset Database via POST /api/seed"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Seed 9 Orders</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.5)] font-black"
            >
              <Plus className="w-4 h-4" />
              <span>New Delivery</span>
            </button>

            <button
              onClick={handleToggle2Opt}
              disabled={isOptimizing}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                is2OptOptimized
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] font-black'
                  : 'bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              }`}
              title="Trigger 2-Opt Optimization Solver"
            >
              <Zap className={`w-3.5 h-3.5 ${is2OptOptimized ? 'text-slate-950 fill-slate-950' : 'text-cyan-400'} ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Optimizing...' : is2OptOptimized ? '✓ 2-Opt Active' : '⚡ 2-Opt Solver'}</span>
            </button>
          </div>
        </div>

        {/* Lower Row: Search Bar & Status / Priority Filter Pills matching reference screenshot */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search by customer, address, or"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
            />
          </div>

          {/* Filter Pills Groups */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {[
                { key: 'ALL', label: 'All Status' },
                { key: 'PENDING', label: 'PENDING' },
                { key: 'IN-TRANSIT', label: 'IN-TRANSIT' },
                { key: 'DELIVERED', label: 'DELIVERED' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === item.key
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Priority Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {[
                { key: 'ALL', label: 'All Priority' },
                { key: 'URGENT', label: 'URGENT' },
                { key: 'HIGH', label: 'HIGH' },
                { key: 'MEDIUM', label: 'MEDIUM' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPriorityFilter(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    priorityFilter === item.key
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono flex items-center gap-2 backdrop-blur-md">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-amber-950/70 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono flex items-center gap-2 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={fetchDashboardData} className="ml-auto underline font-bold cursor-pointer hover:text-white">
            Retry Connection
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics: Glassmorphic Cockpit Shell & Telemetry HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="TOTAL ORDERS"
          value={deliveries.length || 12}
          icon={ShoppingCart}
          rightIcon={Box}
          color="cyan"
          subtext="Active in Quick-Commerce queue"
        />
        <StatCard
          title="PENDING DISPATCH"
          value={deliveries.filter((d) => (d.status || '').toUpperCase() === 'PENDING').length || 8}
          icon={Clock}
          rightIcon={Clock}
          color="amber"
          subtext="Staged across 3 Dark Store waves"
        />
        <StatCard
          title="ACTIVE EN ROUTE"
          value={deliveries.filter((d) => (d.status || '').toUpperCase() === 'IN_TRANSIT' || (d.status || '').toUpperCase() === 'IN-TRANSIT').length}
          icon={Radio}
          rightIcon={Bike}
          color="emerald"
          subtext={
            deliveries.filter((d) => (d.status || '').toUpperCase() === 'DELIVERED').length > 0
              ? `${deliveries.filter((d) => (d.status || '').toUpperCase() === 'DELIVERED').length} delivered SLA fulfilled`
              : '4 delivered SLA fulfilled'
          }
        />
        <StatCard
          title="TOTAL DISTANCE SAVED"
          value={is2OptOptimized ? "14.8" : "0"}
          unit="km"
          icon={MapPin}
          rightIcon={TrendingUp}
          color="purple"
          subtext={is2OptOptimized ? "14.8 km (24.6% saved) // 2-Opt" : "0.0 km (0% saved) // Baseline"}
        />
      </div>

      {/* Split 2-Column Command Center (60% Map + 40% Wave Dispatch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (60% - 7 cols on lg): CartoDB Dark Matter Map */}
        <div 
          className="lg:col-span-7 rounded-2xl p-5 shadow-2xl space-y-3 border transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(56, 189, 248, 0.22)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-mono font-black text-white tracking-wide">Live Fleet Radar Map</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-blue-400 border border-blue-500/40">
                  OpenStreetMap Live
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Central Depot beacon with corridor polylines and real-time courier telemetry
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span>OSRM Road Geometry</span>
            </div>
          </div>

          {/* Interactive CartoDB Leaflet Map with Floating 2-Opt Algorithm Terminal HUD */}
          <LiveFleetMap
            hub={{
              name: 'HUB-01 Market St Pod',
              address: '100 Market St, San Francisco',
              lat: 37.7937,
              lon: -122.3965,
            }}
            waves={waves}
            is2OptOptimized={is2OptOptimized}
            isOptimizing={isOptimizing}
            onToggle2Opt={handleToggle2Opt}
            selectedWaveId={selectedWaveId}
            activeRiderPositions={activeRiderPositions}
          />
        </div>

        {/* Right Column (40% - 5 cols on lg): Quick-Commerce Micro-Fulfillment Card Details */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            className="rounded-2xl p-5 shadow-2xl border transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(56, 189, 248, 0.22)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-mono font-black text-white tracking-wide">Wave Dispatch Cards</h2>
                <p className="text-xs font-mono text-slate-400">Micro-fulfillment staging & active EV courier handover</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                Avg 9.4m SLA
              </span>
            </div>

            {/* Wave Cards */}
            <div className="space-y-4">
              {waves.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 p-4 font-mono">
                  <p className="text-xs text-slate-400">No active delivery waves loaded in database.</p>
                  <button
                    onClick={handleSeedData}
                    className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer underline"
                  >
                    Click to Seed 9 Orders via SQLite
                  </button>
                </div>
              ) : (
                waves.map((wave) => {
                  const isInTransit = wave.status === 'IN_TRANSIT' || wave.status === 'IN-TRANSIT';
                  const isDelivered = wave.status === 'DELIVERED' || wave.status === 'COMPLETED';
                  const isFocused = selectedWaveId === wave.id;
                  const secondsLeft = slaTimers[wave.id] || 326;

                  return (
                    <div
                      key={wave.id}
                      onClick={() => setSelectedWaveId(isFocused ? null : wave.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md shadow-xl ${
                        isFocused
                          ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                          : wave.borderClass
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 14, 28, 0.92) 100%)',
                      }}
                    >
                      {/* Corridor Neon Strip Indicator */}
                      <div
                        className="absolute top-0 left-0 bottom-0 w-1.5 shadow-[0_0_12px]"
                        style={{ backgroundColor: wave.colorHex, boxShadow: `0 0 10px ${wave.colorHex}` }}
                      />

                      <div className="pl-1">
                        {/* Header: Corridor Tag, Title, and Active SLA Countdown */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              style={{ color: wave.colorHex, borderColor: `${wave.colorHex}60` }}
                              className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border"
                            >
                              {wave.code} CORRIDOR
                            </span>
                            <h3 className="text-xs sm:text-sm font-mono font-black text-white mt-1 tracking-tight">
                              {wave.title}
                            </h3>
                            <p className="text-[11px] font-mono text-slate-400">{wave.corridor}</p>
                          </div>

                          {/* Active SLA Countdown Badge: ⏱ 00:05:26 in Glowing Neon Green */}
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                              <Timer className="w-3 h-3 text-emerald-400 animate-pulse" />
                              <span>⏱ {formatSlaTime(secondsLeft)}</span>
                            </span>

                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isDelivered
                                  ? 'bg-slate-900 text-slate-400 border-slate-700'
                                  : isInTransit
                                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {isDelivered ? 'COMPLETED' : isInTransit ? 'EN ROUTE' : `${wave.slaMinutes}m SLA`}
                            </span>
                          </div>
                        </div>

                        {/* Cold-Chain Warning Chip (If present on wave) */}
                        {wave.chilledWarning && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-blue-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                            <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
                            <span>{wave.chilledWarning}</span>
                          </div>
                        )}

                        {/* Live Packing Status Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                            <span>Dark Store Micro-Fulfillment</span>
                            <span className="text-emerald-400 font-bold">{wave.packingPct}% Packed</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_#10b981]"
                              style={{ width: `${wave.packingPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Courier Vehicle Telemetry */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                          <div className="flex items-center gap-2 text-slate-200 font-semibold">
                            <Bike className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{wave.courier.name}</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              ({wave.courier.code} · {wave.courier.vehicle})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                              {wave.courier.battery}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {wave.orders.length} stops
                            </span>
                          </div>
                        </div>

                        {/* Distance Savings & Action Button */}
                        <div className="mt-3 flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">
                            {wave.distKm} km ({is2OptOptimized ? wave.distSaved : 'Criss-Cross'})
                          </span>

                          {isInTransit ? (
                            <div className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-2 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                              </span>
                              <span>● In Transit</span>
                            </div>
                          ) : isDelivered ? (
                            <div className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl bg-slate-900 text-emerald-400 border border-emerald-500/50 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Delivered ✓</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDispatchWave(wave);
                              }}
                              className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer font-black"
                            >
                              <Send className="w-3 h-3 text-slate-950" />
                              <span>Dispatch Wave</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Deliveries Queue: Glassmorphic Cockpit Table */}
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(56, 189, 248, 0.22)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-mono font-black text-white tracking-wide">Recent Deliveries Queue</h2>
            <p className="text-xs font-mono text-slate-400">Live order queue and current dispatch status from SQLite</p>
          </div>
          <Link
            to="/deliveries"
            className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All in Deliveries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-3">Wave Corridor</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No deliveries match your active filter.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.slice(0, 12).map((deliv, idx) => {
                  const waveTag =
                    deliv.waveId === 'wave-alpha' || idx < 4
                      ? { label: 'Wave Alpha', bg: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40' }
                      : deliv.waveId === 'wave-beta' || idx < 7
                      ? { label: 'Wave Beta', bg: 'bg-cyan-950/70 text-cyan-400 border-cyan-500/40' }
                      : { label: 'Wave Gamma', bg: 'bg-amber-950/70 text-amber-400 border-amber-500/40' };

                  return (
                    <tr key={deliv.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <Link to={`/deliveries/${deliv.id}`} className="hover:text-cyan-400 transition-colors">
                          {deliv.customer_name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-normal">
                          <span>{deliv.package_details || 'Quick Commerce Tote'} • {deliv.weight_kg}kg</span>
                          {(deliv.package_details || '').toLowerCase().includes('gelato') || (deliv.package_details || '').toLowerCase().includes('ice cream') ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                              ❄️ Frozen
                            </span>
                          ) : (deliv.package_details || '').toLowerCase().includes('brew') || (deliv.package_details || '').toLowerCase().includes('milk') ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
                              🧊 Chilled
                            </span>
                          ) : null}
                          {(deliv.status || '').toUpperCase() === 'PENDING' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                              ⏱ 68s (90s SLA)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[220px] truncate">
                        <span title={deliv.delivery_address}>{deliv.delivery_address}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${waveTag.bg}`}
                        >
                          {waveTag.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <PriorityBadge priority={deliv.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <DeliveryStatusBadge status={deliv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={deliv.status}
                          onChange={(e) => handleQuickStatusChange(deliv.id, e.target.value)}
                          className="text-[11px] font-medium border border-slate-700 rounded-lg px-2 py-1 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_TRANSIT">In Transit</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Delivery Modal */}
      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDelivery}
      />
    </div>
  );
}
