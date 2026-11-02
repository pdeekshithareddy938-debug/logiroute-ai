import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Download, 
  ChevronRight, 
  X, 
  Bike, 
  Calendar, 
  BatteryCharging, 
  Navigation, 
  RefreshCw,
  Zap,
  Radio
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import dispatchAPI from '../services/api';

const createHistoryPin = (label, color = '#06b6d4') => {
  return L.divIcon({
    className: 'history-stop-pin',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #090e17;
        color: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 800;
        font-size: 10px;
        border: 2px solid ${color};
        box-shadow: 0 0 12px ${color}80;
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

export default function HistoryPage() {
  const [historyTrips, setHistoryTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await dispatchAPI.getHistory();
      setHistoryTrips(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Export CSV handler
  const handleExportCSV = () => {
    if (!historyTrips || historyTrips.length === 0) return;

    const headers = ['Trip ID', 'Wave Name', 'Corridor', 'Assigned Courier', 'Total Stops', 'Duration', 'Distance Km', 'Distance Saved', 'Completed Time'];
    const rows = historyTrips.map(trip => [
      `"${trip.id}"`,
      `"${trip.waveName}"`,
      `"${trip.corridor}"`,
      `"${trip.courier?.name || 'EV Courier'}"`,
      trip.totalStops,
      `"${trip.durationMinutes}"`,
      `"${trip.distanceKm} km"`,
      `"${trip.distanceSavedKm} km (${trip.distanceSavedPct})"`,
      `"${trip.completedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `logiroute_completed_routes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      type: 'success',
      message: 'HISTORICAL LOGS EXPORTED // CSV downloaded successfully.'
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-950/95 text-slate-100 px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] border border-cyan-500/50 flex items-center gap-3 backdrop-blur-xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header — Midnight Cyberpunk Cockpit Card with Emerald Top Accent */}
      <div className="bg-[#0b1220]/90 backdrop-blur-xl border border-slate-800/80 border-t-2 border-t-emerald-500/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-black text-white tracking-wide">ROUTE AUDIT & EXECUTION LOGS</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SLA VERIFIED
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Chronological audit log of completed dark store wave dispatches and 2-Opt distance savings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-pointer shadow-md"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* 'Export CSV' Button with Slate Border & Hover Cyan Glow */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-500/80 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* History Master Table with Dark Rows & Top Cyan Accent */}
      <div className="bg-[#0b1220]/90 backdrop-blur-xl rounded-2xl border border-slate-800/80 border-t-2 border-t-cyan-500/80 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800/80 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Trip ID</th>
                <th className="py-3.5 px-4">Wave Name & Corridor</th>
                <th className="py-3.5 px-4">Courier</th>
                <th className="py-3.5 px-4">Stops</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Distance Saved</th>
                <th className="py-3.5 px-4">Completed At</th>
                <th className="py-3.5 px-4 text-right">Route Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="font-mono text-cyan-400 font-bold">Querying historical ledger...</span>
                  </td>
                </tr>
              ) : historyTrips.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-slate-300">NO COMPLETED TRIPS RECORDED</p>
                  </td>
                </tr>
              ) : (
                historyTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="bg-slate-900/60 hover:bg-slate-800/60 border-b border-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      #{trip.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm font-sans">{trip.waveName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{trip.corridor}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={trip.courier?.avatar}
                          alt={trip.courier?.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-xs"
                        />
                        <div>
                          <span className="font-bold text-slate-200 text-xs block font-sans">{trip.courier?.name}</span>
                          <span className="text-[10px] text-slate-400 block">{trip.courier?.vehicle}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-300">
                      {trip.totalStops} stops
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{trip.durationMinutes}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                        <TrendingDown className="w-3 h-3 text-emerald-400" />
                        <span>{trip.distanceSavedKm} km ({trip.distanceSavedPct})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {trip.completedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrip(trip);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/40 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Replay</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Replay Modal with Midnight Obsidian Styling & Neon Glow */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTrip(null)}
          />

          <div className="relative bg-[#070d19] rounded-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.95)] w-full max-w-2xl overflow-hidden animate-fadeIn text-slate-100 font-mono">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                    #{selectedTrip.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                    FULFILLED ON-TIME
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 font-sans">
                  {selectedTrip.waveName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTrip(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Map Polyline Trace Preview */}
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <MapContainer
                  center={[selectedTrip.waypoints[0].lat, selectedTrip.waypoints[0].lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />

                  {/* Route Polyline */}
                  <Polyline
                    positions={selectedTrip.waypoints.map(w => [w.lat, w.lng])}
                    pathOptions={{
                      color: selectedTrip.waveId === 'wave-alpha' ? '#10b981' : selectedTrip.waveId === 'wave-beta' ? '#06b6d4' : '#f59e0b',
                      weight: 4,
                      opacity: 0.9,
                      lineJoin: 'round',
                      lineCap: 'round'
                    }}
                  />

                  {/* Waypoint Markers */}
                  {selectedTrip.waypoints.map((wp, idx) => (
                    <Marker
                      key={idx}
                      position={[wp.lat, wp.lng]}
                      icon={createHistoryPin(idx === 0 ? 'H' : idx, idx === 0 ? '#2563eb' : '#10b981')}
                    >
                      <Popup>
                        <div className="p-1 font-mono text-xs">
                          <span className="font-bold text-white block">{wp.name}</span>
                          {wp.customer && <span className="text-slate-400 block">Customer: {wp.customer}</span>}
                          <span className="text-emerald-400 font-bold block mt-0.5">Delivered: {wp.time}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Waypoint Chronological Timestamps Breakdown */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Chronological Stop Trace
                </h4>
                <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 overflow-hidden text-xs bg-slate-950/60">
                  {selectedTrip.waypoints.map((wp, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full text-white font-mono font-bold text-[10px] flex items-center justify-center ${
                          idx === 0 ? 'bg-blue-600 shadow-[0_0_6px_#2563eb]' : 'bg-emerald-600 shadow-[0_0_6px_#10b981]'
                        }`}>
                          {idx === 0 ? 'H' : idx}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block font-sans">{wp.name}</span>
                          {wp.customer && <span className="text-slate-500 text-[11px]">{wp.customer}</span>}
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/50">
                        {wp.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Distance</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{selectedTrip.distanceKm} km</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Distance Saved</span>
                  <span className="font-bold text-emerald-400 text-sm mt-0.5 block">⚡ {selectedTrip.distanceSavedKm} km</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Battery Consumed</span>
                  <span className="font-bold text-cyan-400 text-sm mt-0.5 block">{selectedTrip.batteryUsedPct}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
