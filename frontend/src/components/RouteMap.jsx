import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Component to dynamically fit map viewport bounds around stops
function MapBoundsUpdater({ stops, polylineCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points = [];
    if (stops && stops.length > 0) {
      stops.forEach((s) => {
        if (s.latitude && s.longitude) {
          points.push([s.latitude, s.longitude]);
        }
      });
    }

    if (polylineCoords && polylineCoords.length > 0) {
      polylineCoords.forEach((p) => points.push(p));
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, stops, polylineCoords]);

  return null;
}

// Custom DivIcon generator for numbered stop markers
const createStopIcon = (number, isWarehouse = false) => {
  if (isWarehouse) {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        ">
          HUB
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 13px;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
};

export default function RouteMap({ 
  stops = [], 
  geometry = null, 
  warehouse = null, 
  center = [37.7937, -122.3965], 
  zoom = 13,
  height = '480px'
}) {
  // Extract polyline points
  let polylineCoords = [];

  if (geometry && geometry.coordinates && Array.isArray(geometry.coordinates)) {
    // GeoJSON format is [longitude, latitude] -> convert to Leaflet [latitude, longitude]
    polylineCoords = geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  } else if (stops && stops.length > 1) {
    // Fallback: Connect stops sequentially with straight lines
    polylineCoords = stops
      .filter((s) => s.latitude && s.longitude)
      .map((s) => [s.latitude, s.longitude]);
  }

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Viewport Bounds Auto-fit */}
        <MapBoundsUpdater stops={stops} polylineCoords={polylineCoords} />

        {/* Planned Route Polyline */}
        {polylineCoords.length > 0 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#2563eb',
              weight: 4,
              opacity: 0.85,
              lineJoin: 'round',
            }}
          />
        )}

        {/* Render Warehouse Hub Marker if isolated */}
        {warehouse && (!stops || stops.length === 0) && (
          <Marker
            position={[warehouse.lat || warehouse.latitude, warehouse.lon || warehouse.longitude]}
            icon={createStopIcon('HUB', true)}
          >
            <Popup>
              <div className="p-1">
                <span className="font-bold text-slate-800 text-sm block">
                  {warehouse.name || 'Central Distribution Hub'}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {warehouse.address || '100 Market St'}
                </span>
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800">
                  Primary Depot
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Stops in Sequence */}
        {stops.map((stop, idx) => {
          const isWh = stop.is_warehouse === 1 || stop.delivery_id === null;
          const stopNumber = isWh ? 'H' : (stop.sequence_order || idx);
          const icon = createStopIcon(stopNumber, isWh);

          return (
            <Marker
              key={`stop-${stop.id || idx}-${stop.latitude}-${stop.longitude}`}
              position={[stop.latitude, stop.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isWh ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isWh ? 'WAREHOUSE DEPOT' : `STOP #${stop.sequence_order || idx}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stop.location_name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{stop.address}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] space-y-0.5 text-slate-500">
                    {stop.distance_from_prev_km !== undefined && (
                      <div className="flex justify-between">
                        <span>Leg Distance:</span>
                        <span className="font-semibold text-slate-800">{stop.distance_from_prev_km} km</span>
                      </div>
                    )}
                    {stop.cumulative_distance_km !== undefined && (
                      <div className="flex justify-between">
                        <span>Total So Far:</span>
                        <span className="font-semibold text-slate-800">{stop.cumulative_distance_km} km</span>
                      </div>
                    )}
                    {stop.cumulative_duration_min !== undefined && (
                      <div className="flex justify-between">
                        <span>Est. Elapsed:</span>
                        <span className="font-semibold text-slate-800">{stop.cumulative_duration_min} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
