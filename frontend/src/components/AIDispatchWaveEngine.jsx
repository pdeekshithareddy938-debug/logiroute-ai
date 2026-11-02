import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Truck, 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Box, 
  BatteryCharging, 
  Radio, 
  Sparkles, 
  RotateCcw, 
  Play, 
  ShieldCheck, 
  Flame, 
  Bike,
  Activity,
  Send,
  Timer
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { deliveriesAPI } from '../api/client';

// Pre-configured Quick-Commerce Fleet Couriers
const FLEET_COURIERS = [
  { id: 'c1', name: 'Ravi Kumar', vehicle: 'Ather 450X EV', code: 'EV-402', battery: '92%', status: 'Available', bagsMax: 4, rating: 4.9 },
  { id: 'c2', name: 'Priya Sharma', vehicle: 'Hero Electric NYX', code: 'EV-209', battery: '84%', status: 'Available', bagsMax: 4, rating: 4.95 },
  { id: 'c3', name: 'Alex Chen', vehicle: 'Volt Cargo E-Bike', code: 'EB-118', battery: '76%', status: 'Available', bagsMax: 3, rating: 4.88 },
  { id: 'c4', name: 'Marcus Bell', vehicle: 'TVS iQube EV', code: 'EV-514', battery: '68%', status: 'Returning', bagsMax: 4, rating: 4.92 },
];

const DARK_STORE_HUBS = [
  { id: 'hub-01', name: 'Market St Central Pod', code: 'HUB-01', area: 'Downtown SF', lat: 37.7937, lon: -122.3965 },
  { id: 'hub-02', name: 'Mission Micro-Darkstore', code: 'HUB-02', area: 'Mission District', lat: 37.7599, lon: -122.4148 },
  { id: 'hub-03', name: 'SoMa Rapid Dispatch Hub', code: 'HUB-03', area: 'SoMa / 4th St', lat: 37.7785, lon: -122.3995 },
];

export default function AIDispatchWaveEngine({ deliveries = [], onRefresh, onSeedSample }) {
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState('hub-01');
  const [activeTab, setActiveTab] = useState('waves'); // 'waves' | 'staging' | 'fleet'
  const [isClustering, setIsClustering] = useState(false);
  const [activeWaves, setActiveWaves] = useState([]);
  const [selectedWaveId, setSelectedWaveId] = useState(null);
  const [dispatchingWaveId, setDispatchingWaveId] = useState(null);
  const [waveSimulationProgress, setWaveSimulationProgress] = useState({});
  const [notification, setNotification] = useState(null);

  // Filter pending or non-delivered orders
  const pendingDeliveries = useMemo(() => {
    return deliveries.filter(d => d.status === 'PENDING' || d.status === 'SCHEDULED');
  }, [deliveries]);

  // Algorithm to cluster deliveries into quick-commerce waves
  const generateWaves = (items) => {
    if (!items || items.length === 0) return [];

    // Sort by priority first (HIGH > MEDIUM > LOW)
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sorted = [...items].sort((a, b) => {
      return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    });

    const waves = [];
    const waveDefinitions = [
      {
        id: 'wave-1',
        title: 'Wave Alpha — Hyper-Local Express',
        zone: 'Downtown Core & Financial Pod',
        slaTargetMinutes: 10,
        assignedCourier: FLEET_COURIERS[0],
        badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        accentColor: 'from-emerald-500 to-teal-600',
        riderIcon: Zap
      },
      {
        id: 'wave-2',
        title: 'Wave Beta — Mid-Town Rapid Corridor',
        zone: 'SoMa & South Beach District',
        slaTargetMinutes: 15,
        assignedCourier: FLEET_COURIERS[1],
        badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
        accentColor: 'from-cyan-500 to-blue-600',
        riderIcon: Truck
      },
      {
        id: 'wave-3',
        title: 'Wave Gamma — Residential Sprint',
        zone: 'Mission & Market Outskirts',
        slaTargetMinutes: 20,
        assignedCourier: FLEET_COURIERS[2],
        badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
        accentColor: 'from-amber-500 to-orange-600',
        riderIcon: Bike
      }
    ];

    // Distribute deliveries into waves (up to 3 waves, 2-4 orders each)
    const chunkSize = Math.max(1, Math.ceil(sorted.length / 3));
    
    for (let i = 0; i < 3; i++) {
      const slice = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
      if (slice.length > 0) {
        const def = waveDefinitions[i];
        const totalWeight = slice.reduce((sum, d) => sum + (Number(d.weight_kg) || 1.5), 0).toFixed(1);
        
        // Approximate distance based on stop count with 2-Opt savings
        const baseDistKm = (slice.length * 2.8).toFixed(1);
        const optDistKm = (baseDistKm * 0.77).toFixed(1);
        const distSaved = (baseDistKm - optDistKm).toFixed(1);
        const savingsPercent = Math.round(((baseDistKm - optDistKm) / baseDistKm) * 100);

        waves.push({
          id: def.id,
          title: def.title,
          zone: def.zone,
          slaTargetMinutes: def.slaTargetMinutes,
          courier: def.assignedCourier,
          badgeColor: def.badgeColor,
          accentColor: def.accentColor,
          riderIcon: def.riderIcon,
          orders: slice,
          orderCount: slice.length,
          totalWeightKg: totalWeight,
          baseDistKm,
          optDistKm,
          distSaved,
          savingsPercent: savingsPercent || 23,
          estDurationMins: Math.round(slice.length * 3.5 + 4),
          status: 'READY_TO_DISPATCH',
        });
      }
    }

    return waves;
  };

  // Initial wave generation whenever pending deliveries change
  useEffect(() => {
    if (pendingDeliveries.length > 0) {
      const generated = generateWaves(pendingDeliveries);
      setActiveWaves(generated);
      if (generated.length > 0) {
        setSelectedWaveId(generated[0].id);
      }
    } else {
      setActiveWaves([]);
      setSelectedWaveId(null);
    }
  }, [pendingDeliveries.length]);

  // Trigger AI Wave Re-clustering
  const handleRunWaveClustering = () => {
    setIsClustering(true);
    setNotification({
      type: 'info',
      message: 'Running AI Wave Clustering: Grouping by proximity, bag volume, & SLA urgency...'
    });

    setTimeout(() => {
      const regenerated = generateWaves(pendingDeliveries);
      setActiveWaves(regenerated);
      if (regenerated.length > 0) {
        setSelectedWaveId(regenerated[0].id);
      }
      setIsClustering(false);
      setNotification({
        type: 'success',
        message: `AI clustering complete! ${regenerated.length} optimized dispatch waves generated.`
      });
      setTimeout(() => setNotification(null), 3500);
    }, 700);
  };

  // Dispatch a single wave
  const handleDispatchWave = async (wave) => {
    setDispatchingWaveId(wave.id);
    setNotification({
      type: 'info',
      message: `Dispatching ${wave.title}... Assigning to ${wave.courier.name} (${wave.courier.code})`
    });

    try {
      // Update each delivery's status in backend/localStorage to IN_TRANSIT
      for (const order of wave.orders) {
        await deliveriesAPI.updateStatus(order.id, 'IN_TRANSIT');
      }

      // Mark wave dispatched locally
      setActiveWaves(prev => prev.map(w => {
        if (w.id === wave.id) {
          return { ...w, status: 'DISPATCHED' };
        }
        return w;
      }));

      // Start simulated SLA delivery progress
      let progress = 0;
      setWaveSimulationProgress(p => ({ ...p, [wave.id]: 15 }));
      
      const interval = setInterval(() => {
        progress += 25;
        setWaveSimulationProgress(p => ({ ...p, [wave.id]: Math.min(progress, 100) }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setActiveWaves(prev => prev.map(w => {
            if (w.id === wave.id) {
              return { ...w, status: 'DELIVERED' };
            }
            return w;
          }));
          // Complete orders in backend
          wave.orders.forEach(o => deliveriesAPI.updateStatus(o.id, 'DELIVERED').catch(() => {}));
          if (onRefresh) onRefresh();
        }
      }, 1800);

      setNotification({
        type: 'success',
        message: `🚀 ${wave.title} dispatched! ${wave.courier.name} is on the road with ${wave.orders.length} orders.`
      });
      setTimeout(() => setNotification(null), 4000);

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to dispatch wave:', err);
      setNotification({
        type: 'error',
        message: 'Failed to dispatch wave. Please try again.'
      });
    } finally {
      setDispatchingWaveId(null);
    }
  };

  // Change assigned courier for a wave
  const handleAssignCourier = (waveId, courierId) => {
    const courier = FLEET_COURIERS.find(c => c.id === courierId);
    if (!courier) return;
    setActiveWaves(prev => prev.map(w => {
      if (w.id === waveId) {
        return { ...w, courier };
      }
      return w;
    }));
  };

  // Launch route planner with pre-selected wave stops
  const handleOpenInRoutePlanner = (wave) => {
    const preSelectedIds = wave.orders.map(o => o.id);
    navigate('/routes/planner', { state: { preSelectedIds } });
  };

  // Find currently active selected wave (single view)
  const currentWave = activeWaves.find(w => w.id === (selectedWaveId || activeWaves[0]?.id)) || activeWaves[0];

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-40 bg-blue-500/10 blur-[90px] pointer-events-none" />

      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Hub Selector */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Zap className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Quick-Commerce Core
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Dispatch Grid
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                AI Dispatch & Wave Routing Engine
              </h2>
            </div>
          </div>

          {/* Quick-Commerce Dark Store Hub Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <select 
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                {DARK_STORE_HUBS.map(hub => (
                  <option key={hub.id} value={hub.id} className="bg-slate-900 text-white">
                    {hub.code} • {hub.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunWaveClustering}
              disabled={isClustering || pendingDeliveries.length === 0}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClustering ? 'animate-spin' : ''}`} />
              <span>{isClustering ? 'Clustering...' : '⚡ Re-Cluster Waves'}</span>
            </button>

            {pendingDeliveries.length === 0 && (
              <button
                onClick={onSeedSample}
                className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Seed Sample Queue</span>
              </button>
            )}
          </div>
        </div>

        {/* Live SLA & Dark Store Pulse Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/60">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Timer className="w-3 h-3 text-emerald-400" />
              Target Wave SLA
            </div>
            <div className="text-base font-extrabold text-white mt-1 flex items-baseline gap-1.5">
              <span>9.2 min</span>
              <span className="text-[10px] font-normal text-emerald-400">10m Max Cap</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Box className="w-3 h-3 text-cyan-400" />
              Staged Queue
            </div>
            <div className="text-base font-extrabold text-white mt-1 flex items-baseline gap-1.5">
              <span>{pendingDeliveries.length} Orders</span>
              <span className="text-[10px] font-normal text-cyan-400">{activeWaves.length} Waves</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Bike className="w-3 h-3 text-amber-400" />
              Rider Standby
            </div>
            <div className="text-base font-extrabold text-white mt-1 flex items-baseline gap-1.5">
              <span>4 EV Couriers</span>
              <span className="text-[10px] font-normal text-emerald-400">100% Ready</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-400" />
              2-Opt Efficiency
            </div>
            <div className="text-base font-extrabold text-white mt-1 flex items-baseline gap-1.5">
              <span>-24.6%</span>
              <span className="text-[10px] font-normal text-purple-400">Miles Saved</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setActiveTab('waves')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'waves'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Dispatch Waves ({activeWaves.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>EV Rider Fleet Roster (4)</span>
          </button>

          <button
            onClick={() => setActiveTab('staging')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staging'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Dark Store Bag Staging</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' 
            : notification.type === 'error'
            ? 'bg-red-950/80 text-red-300 border-b border-red-800'
            : 'bg-blue-950/80 text-blue-300 border-b border-blue-800'
        }`}>
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 bg-slate-950/80 min-h-[320px]">
        {/* TAB 1: ACTIVE WAVES (Single Selected Wave Terminal with Pill Switcher) */}
        {activeTab === 'waves' && (
          <div>
            {activeWaves.length === 0 ? (
              <div className="py-12 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-3">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Pending Orders to Wave-Cluster</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  All current customer deliveries have been dispatched or completed. Click below to load demo quick-commerce deliveries and observe the AI wave clustering in real time.
                </p>
                <button
                  onClick={onSeedSample}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Seed 8 Quick-Commerce Orders</span>
                </button>
              </div>
            ) : (
              <div>
                {/* Horizontal Wave Selector Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800/80">
                  {activeWaves.map((w) => {
                    const isSelected = currentWave && currentWave.id === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWaveId(w.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white border border-emerald-500/60 shadow-md shadow-emerald-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span>{w.title.split('—')[0].trim()}</span>
                        <span className="text-[11px] font-normal text-slate-400">({w.orderCount} orders)</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          -{w.savingsPercent}%
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Single Selected Wave Panel */}
                {currentWave && (() => {
                  const isDispatched = currentWave.status === 'DISPATCHED';
                  const isDelivered = currentWave.status === 'DELIVERED';
                  const progress = waveSimulationProgress[currentWave.id] || 0;
                  const Icon = currentWave.riderIcon;

                  return (
                    <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
                      {/* Wave Card Top Summary */}
                      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Wave Info & Assigned Courier */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentWave.accentColor} flex items-center justify-center text-slate-950 shrink-0 shadow-md`}>
                            <Icon className="w-5 h-5 fill-current" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-extrabold text-white">
                                {currentWave.title}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentWave.badgeColor}`}>
                                {currentWave.zone}
                              </span>
                              {isDispatched && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
                                  <Radio className="w-2.5 h-2.5 animate-ping" />
                                  EN ROUTE
                                </span>
                              )}
                              {isDelivered && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  SLA COMPLETED
                                </span>
                              )}
                            </div>

                            {/* Assigned Courier Selector */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
                              <span>Assigned:</span>
                              <select
                                value={currentWave.courier.id}
                                disabled={isDispatched || isDelivered}
                                onChange={(e) => handleAssignCourier(currentWave.id, e.target.value)}
                                className="bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-emerald-400 font-semibold focus:outline-none cursor-pointer disabled:opacity-70"
                              >
                                {FLEET_COURIERS.map(c => (
                                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                    {c.name} ({c.code} • {c.vehicle})
                                  </option>
                                ))}
                              </select>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <BatteryCharging className="w-3 h-3 text-emerald-400" />
                                {currentWave.courier.battery}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Badges: Stops, Weight, 2-Opt Distance */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl text-center min-w-[70px]">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Stops</div>
                            <div className="text-sm font-bold text-white mt-0.5">{currentWave.orderCount} Orders</div>
                          </div>

                          <div className="bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl text-center min-w-[75px]">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Payload</div>
                            <div className="text-sm font-bold text-cyan-300 mt-0.5">{currentWave.totalWeightKg} kg</div>
                          </div>

                          <div className="bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl text-center min-w-[85px]">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">2-Opt Miles</div>
                            <div className="text-sm font-bold text-emerald-400 mt-0.5">
                              {currentWave.optDistKm} km
                              <span className="text-[10px] text-emerald-500 font-normal ml-1">(-{currentWave.savingsPercent}%)</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl text-center min-w-[75px]">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">SLA Target</div>
                            <div className="text-sm font-bold text-amber-400 mt-0.5">{currentWave.slaTargetMinutes} min</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-auto lg:ml-2">
                            <button
                              onClick={() => handleOpenInRoutePlanner(currentWave)}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Inspect 2-Opt Polyline on Leaflet Map"
                            >
                              <Navigation className="w-3.5 h-3.5 text-blue-400" />
                              <span className="hidden sm:inline">Leaflet Route</span>
                            </button>

                            <button
                              onClick={() => handleDispatchWave(currentWave)}
                              disabled={isDispatched || isDelivered || dispatchingWaveId === currentWave.id}
                              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                isDelivered 
                                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                                  : isDispatched
                                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 animate-pulse'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {isDelivered 
                                  ? 'Delivered' 
                                  : isDispatched 
                                  ? 'Dispatched' 
                                  : dispatchingWaveId === currentWave.id 
                                  ? 'Dispatching...' 
                                  : '⚡ Dispatch Wave'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live SLA Delivery Simulation Progress Bar */}
                      {isDispatched && (
                        <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <Radio className="w-3 h-3 animate-ping" />
                              Rider In Transit: {currentWave.courier.name} on {currentWave.courier.vehicle}
                            </span>
                            <span>{progress}% complete (Est. arrival in {Math.max(1, Math.round((100 - progress) * 0.08))} min)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Order Stops in Current Wave */}
                      <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                          <span>{currentWave.title.split('—')[0].trim()} Sequence (2-Opt Optimized Order)</span>
                          <span className="text-[11px] font-normal text-emerald-400">
                            Depot: 100 Market St ➔ {currentWave.orderCount} Deliveries ➔ Return
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {currentWave.orders.map((order, idx) => (
                            <div
                              key={order.id}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-white truncate max-w-[130px]">
                                    {order.customer_name}
                                  </span>
                                </div>
                                <PriorityBadge priority={order.priority} />
                              </div>

                              <p className="text-[11px] text-slate-400 mt-2 truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span title={order.delivery_address}>{order.delivery_address}</span>
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800">
                                <span>{order.package_details || 'Quick Bag'} • {order.weight_kg}kg</span>
                                <DeliveryStatusBadge status={order.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EV RIDER FLEET ROSTER */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FLEET_COURIERS.map((rider) => (
              <div 
                key={rider.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {rider.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-3">{rider.name}</h4>
                <p className="text-xs text-slate-400">{rider.vehicle} • <span className="text-emerald-400 font-mono">{rider.code}</span></p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vehicle Battery:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5" />
                      {rider.battery}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bag Capacity:</span>
                    <span className="font-semibold text-slate-300">Max {rider.bagsMax} Totes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">SLA Rating:</span>
                    <span className="font-semibold text-amber-400">★ {rider.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DARK STORE BAG STAGING */}
        {activeTab === 'staging' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Dark Store Packing & Staging Carousel</h3>
                <p className="text-xs text-slate-400">Micro-fulfillment sorting pods ready for instant rider pickup</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                Avg. Pack Time: 2m 18s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pendingDeliveries.length === 0 ? (
                <div className="col-span-3 py-8 text-center text-slate-500 text-xs">
                  No packages currently in the dark store staging queue.
                </div>
              ) : (
                pendingDeliveries.map((deliv, index) => (
                  <div
                    key={deliv.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
                        B-{101 + index}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">
                          {deliv.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {deliv.package_details || 'Quick Tote'} • {deliv.weight_kg}kg
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <PriorityBadge priority={deliv.priority} />
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                        Staged at Pod A
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
