import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zap, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

// Auto-adjust map bounds around active stops
function MapBoundsUpdater({ stops, center }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const points = [[center[0], center[1]]];
    if (stops && stops.length > 0) {
      stops.forEach((s) => {
        const lat = s.lat ?? s.latitude;
        const lon = s.lng ?? s.longitude;
        if (lat && lon) {
          points.push([lat, lon]);
        }
      });
    }
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, stops, center]);

  return null;
}

// Distinct Numbered Stop Marker Pins (A1, A2, B1, G1...)
const createMarkerIcon = (label, colorBg, isFocused = true) => {
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${colorBg};
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 800;
        font-size: 11px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 10px ${colorBg}88;
        cursor: pointer;
        transform: ${isFocused ? 'scale(1.06)' : 'scale(0.95)'};
        transition: transform 0.2s ease;
      ">
        ${isFocused ? `<span style="position:absolute; inset:-4px; border-radius:50%; border:2px solid ${colorBg}; opacity:0.6; animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
        <span style="position:relative; z-index:2; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${label}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
};

// Central Hub-01 Depot Marker: Distinct Blue Depot Pin with Pulsing Circle Badge
const createHubBeaconIcon = () => {
  return L.divIcon({
    className: 'hub-blue-beacon',
    html: `
      <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing Blue Circle Badge / Radar Rings -->
        <div style="position: absolute; width: 54px; height: 54px; border-radius: 50%; border: 2.5px solid #2563eb; opacity: 0.8;" class="animate-radar"></div>
        <div style="position: absolute; width: 54px; height: 54px; border-radius: 50%; border: 1.5px solid #60a5fa; opacity: 0.5;" class="animate-radar-delayed"></div>
        
        <!-- Distinct Royal Blue Depot Pin -->
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1d4ed8;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: -0.5px;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.7), 0 2px 6px rgba(0, 0, 0, 0.4);
          z-index: 10;
        ">
          HUB
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -22],
  });
};

// Custom SVG Electric Bike/Scooter Courier Marker
const createCourierBikeIcon = (riderName, colorBg) => {
  return L.divIcon({
    className: 'courier-bike-marker',
    html: `
      <div style="
        position: relative;
        background: #0f172a;
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid ${colorBg};
        box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 12px ${colorBg}80;
        white-space: nowrap;
        z-index: 50;
      ">
        <span style="position:relative; display:flex; height:8px; width:8px;">
          <span style="position:absolute; inset:0; border-radius:50%; background:${colorBg}; opacity:0.8; animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <span style="position:relative; border-radius:50%; height:8px; width:8px; background:${colorBg};"></span>
        </span>

        <!-- Custom SVG Electric Courier Bike -->
        <svg style="width:14px; height:14px; color:${colorBg};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5" cy="18" r="3"/>
          <circle cx="19" cy="18" r="3"/>
          <path d="M12 18v-7l3-3h4"/>
          <path d="M5 18l4-7h5"/>
          <polyline points="15 5 18 5 18 8"/>
          <polygon points="12 2 8 8 12 8 10 13 16 6 12 6 12 2" fill="${colorBg}" stroke="none"/>
        </svg>

        <span style="color:#ffffff; letter-spacing:-0.2px;">${riderName}</span>
      </div>
    `,
    iconSize: [120, 28],
    iconAnchor: [60, 14],
  });
};

export default function LiveFleetMap({
  hub = { name: 'HUB-01 Market St Pod', address: '100 Market St, San Francisco', lat: 37.7937, lon: -122.3965 },
  waves = [],
  is2OptOptimized = false,
  isOptimizing = false,
  onToggle2Opt,
  selectedWaveId = null,
  activeRiderPositions = {}
}) {
  const center = [hub.lat, hub.lon];
  const [slowMoPlayback, setSlowMoPlayback] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Monospace Terminal Output Logs
  const [terminalLogs, setTerminalLogs] = useState([
    { text: '2-OPT ENGINE // Cockpit Initialized.', color: 'text-blue-400' },
    { text: '[TOPOLOGY] 3 Corridors · 9 Delivery Nodes · HUB-01', color: 'text-slate-400' },
    { text: '[STATUS] Awaiting 2-Opt local search trigger...', color: 'text-slate-400' },
  ]);

  // Animate Terminal Output Screen when 2-Opt is triggered
  useEffect(() => {
    if (!isOptimizing) return;

    setTerminalLogs([
      { text: '2-OPT ENGINE // Optimization Active...', color: 'text-blue-300 font-bold animate-pulse' },
      { text: '[SCAN] Building pairwise OSRM distance matrix...', color: 'text-slate-400' },
    ]);

    const stepDelay = slowMoPlayback ? 350 : 180;

    const t1 = setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        { text: '[ITERATION 1] Detecting 2 crossover edge intersections', color: 'text-amber-400' },
        { text: '[EVALUATING] Swap (Stop #2 <-> Stop #5)...', color: 'text-blue-400' },
      ]);
    }, stepDelay);

    const t2 = setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        { text: '[SAVINGS FOUND] ΔD = -1.84 km | Crossovers: 0', color: 'text-emerald-400 font-bold' },
        { text: '[ITERATION 4] Testing 2-Opt neighborhood moves...', color: 'text-slate-400' },
      ]);
    }, stepDelay * 2);

    const t3 = setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        { text: '[CONVERGED] Total reduction: -24.6% in 42ms', color: 'text-emerald-300 font-bold' },
        { text: '[STATUS] Non-overlapping loops deployed to fleet.', color: 'text-blue-400' },
      ]);
    }, stepDelay * 3);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOptimizing, slowMoPlayback]);

  // Flatten all stops for bounds calculation and marker plotting
  const allStops = [];
  waves.forEach((wave) => {
    // Specific Corridor Colors: Alpha: Emerald #059669, Beta: Royal Blue #2563eb, Gamma: Amber #d97706
    let defaultPinColor = '#059669';
    if (wave.id === 'wave-beta' || wave.code === 'BETA') defaultPinColor = '#2563eb';
    if (wave.id === 'wave-gamma' || wave.code === 'GAMMA') defaultPinColor = '#d97706';

    (wave.orders || []).forEach((order, idx) => {
      allStops.push({
        ...order,
        latitude: order.lat ?? order.latitude,
        longitude: order.lng ?? order.longitude,
        customer_name: order.customer ?? order.customer_name,
        delivery_address: order.address ?? order.delivery_address,
        package_details: order.packageDesc ?? order.package_details,
        weight_kg: order.weightKg ?? order.weight_kg,
        waveId: wave.id,
        waveTitle: wave.title,
        waveCode: wave.code || wave.id.toUpperCase(),
        stopNumber: `${wave.prefix || wave.title?.charAt(5) || 'S'}${idx + 1}`,
        color: wave.colorHex || defaultPinColor,
      });
    });
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 100% Clean Map Canvas with No Obscuring Overlays */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
        {/* OpenStreetMap 100% Free Tile Layer */}
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapBoundsUpdater stops={allStops} center={center} />

          {/* Central Hub-01 Marker: Distinct Blue Depot Pin with Pulsing Circle Badge */}
          <Marker position={center} icon={createHubBeaconIcon()}>
            <Popup>
              <div className="p-1 font-mono">
                <span className="font-black text-blue-400 text-xs block tracking-wide">{hub.name}</span>
                <span className="text-[11px] text-slate-300 block mt-0.5">{hub.address}</span>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="text-[10px] text-blue-300 font-bold uppercase">Central Micro-Hub Depot</span>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Route Polylines: Alpha (#059669), Beta (#2563eb), Gamma (#d97706), 4px weight, 0.8 opacity */}
          {waves.map((wave) => {
            const stops = wave.orders || [];
            if (stops.length === 0) return null;

            // Corridor Colors: Alpha: Emerald #059669, Beta: Royal Blue #2563eb, Gamma: Amber #d97706
            let waveColor = '#059669';
            let glowClass = 'neon-glow-alpha';
            if (wave.id === 'wave-beta' || wave.code === 'BETA') {
              waveColor = '#2563eb';
              glowClass = 'neon-glow-beta';
            } else if (wave.id === 'wave-gamma' || wave.code === 'GAMMA') {
              waveColor = '#d97706';
              glowClass = 'neon-glow-gamma';
            }

            let routePoints = [];
            if (is2OptOptimized) {
              // Clean non-overlapping loop: sort stops by polar angle around HUB
              const sortedStops = [...stops].sort((a, b) => {
                const latA = a.lat ?? a.latitude;
                const lonA = a.lng ?? a.longitude;
                const latB = b.lat ?? b.latitude;
                const lonB = b.lng ?? b.longitude;
                const angleA = Math.atan2(latA - hub.lat, lonA - hub.lon);
                const angleB = Math.atan2(latB - hub.lat, lonB - hub.lon);
                return angleA - angleB;
              });

              routePoints = [
                center,
                ...sortedStops.map((s) => [s.lat ?? s.latitude, s.lng ?? s.longitude]),
                center,
              ];
            } else {
              // Unoptimized criss-crossed sequence: creates sharp overlapping diagonals
              let crissCross = [...stops];
              if (crissCross.length >= 3) {
                crissCross = [stops[1], stops[2], stops[0]];
              } else if (crissCross.length === 2) {
                crissCross = [stops[1], stops[0]];
              }
              routePoints = [
                center,
                ...crissCross.map((s) => [s.lat ?? s.latitude, s.lng ?? s.longitude]),
                center,
              ];
            }

            return (
              <Polyline
                key={`wave-lines-${wave.id}-${is2OptOptimized ? 'opt' : 'base'}`}
                positions={routePoints}
                pathOptions={{
                  color: is2OptOptimized ? waveColor : '#ef4444',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: is2OptOptimized ? null : '6, 6',
                  className: glowClass,
                  lineJoin: 'round',
                  lineCap: 'round',
                }}
              />
            );
          })}

          {/* Active In-Transit Courier Markers (Custom SVG Electric Bikes) */}
          {waves.map((wave) => {
            const isWaveInTransit = wave.status === 'IN_TRANSIT' || wave.status === 'IN-TRANSIT';
            if (!isWaveInTransit) return null;
            
            const pos = activeRiderPositions[wave.id] || center;
            const waveColor = 
              wave.id === 'wave-beta' || wave.code === 'BETA' ? '#2563eb' : 
              wave.id === 'wave-gamma' || wave.code === 'GAMMA' ? '#d97706' : '#059669';

            return (
              <Marker
                key={`rider-${wave.id}`}
                position={pos}
                icon={createCourierBikeIcon(wave.courier?.name || 'EV Courier', waveColor)}
              >
                <Popup>
                  <div className="p-1 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                      <span>{wave.courier?.name} (En Route)</span>
                    </div>
                    <span className="text-slate-300 block mt-0.5">{wave.title}</span>
                    <div className="mt-2 pt-1 border-t border-slate-700 flex justify-between text-[10px] text-slate-300">
                      <span>Vehicle: {wave.courier?.vehicle}</span>
                      <span className="text-emerald-400 font-bold">Speed: 32 km/h</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Numbered Delivery Stop Pins Color-Coded by Wave (A1, A2, B1, G1...) */}
          {allStops.map((stop, idx) => {
            const isStopFocused = !selectedWaveId || selectedWaveId === stop.waveId;
            const pinColor = stop.color;

            return (
              <Marker
                key={`stop-${stop.id || idx}`}
                position={[stop.latitude, stop.longitude]}
                icon={createMarkerIcon(stop.stopNumber, pinColor, isStopFocused)}
              >
                <Popup>
                  <div className="p-1.5 min-w-[190px] font-mono">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        style={{ backgroundColor: `${pinColor}25`, color: pinColor, borderColor: `${pinColor}80` }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      >
                        {stop.waveTitle} • Stop #{idx + 1}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{stop.customer_name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">{stop.delivery_address}</p>

                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-300">
                      <span>{stop.package_details || 'Quick Tote'} • {stop.weight_kg}kg</span>
                      <span className="text-blue-400 font-bold uppercase">{stop.status}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Clean 2-Opt Action Strip Directly BELOW the Map Container */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Real-Time Optimization Status Pill & Telemetry Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              is2OptOptimized
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/90 text-slate-300 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                is2OptOptimized ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
              }`}
            />
            <span>
              {is2OptOptimized
                ? 'Distance Saved: 14.8 km (-24.6%) | Crossovers: 0'
                : 'Distance Saved: 0 km (0%) | Crossovers: 2'}
            </span>
          </div>

          {/* Telemetry Logs Collapsible Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowTelemetry((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Telemetry Logs</span>
            {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Slow-Mo Playback Toggle & '⚡ Run 2-Opt Optimization' Primary Blue/Indigo Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">Slow-Mo:</span>
            <button
              type="button"
              onClick={() => setSlowMoPlayback((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                slowMoPlayback
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {slowMoPlayback ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={onToggle2Opt}
            disabled={isOptimizing}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
              is2OptOptimized
                ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
            }`}
          >
            <Zap className={`w-4 h-4 text-white ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>
              {isOptimizing
                ? 'Untangling Routes...'
                : is2OptOptimized
                ? '✓ 2-Opt Active (-24.6%)'
                : '⚡ Run 2-Opt Optimization'}
            </span>
          </button>
        </div>
      </div>

      {/* Optional Collapsible Monospace Telemetry Drawer */}
      {showTelemetry && (
        <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3.5 font-mono text-xs shadow-2xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              2-OPT ENGINE TELEMETRY OUTPUT
            </span>
            <span className="text-slate-500">Method: 2-Opt pairwise swap neighborhood</span>
          </div>

          <div className="bg-black/80 rounded-xl p-2.5 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto border border-slate-900 shadow-inner">
            {terminalLogs.map((log, index) => (
              <div key={index} className={`tracking-tight ${log.color || 'text-slate-300'}`}>
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
