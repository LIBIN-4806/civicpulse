import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, AlertTriangle, Flame, AlertOctagon, 
  Home, HeartPulse, Shield, LifeBuoy, Radio, Wind, Droplets, Thermometer 
} from 'lucide-react';
import RiskBadge from './RiskBadge';

// Helper to create HTML SVG Icons for Leaflet Markers
const createCustomIcon = (color, type = 'hazard', count = '') => {
  let iconSvg = '';
  if (type === 'shelter') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  } else if (type === 'hospital') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
  } else if (type === 'user') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${iconSvg}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const getHazardColor = (category) => {
  if (category === 'CRITICAL') return '#ef4444';
  if (category === 'HIGH') return '#f97316';
  if (category === 'MODERATE') return '#f59e0b';
  return '#10b981';
};

// Component to dynamically recenter map
function MapCenterController({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export const LiveMap = ({ 
  locations = [], 
  shelters = [], 
  services = [], 
  userCoords = null,
  selectedLocation = null,
  onSelectLocation = null 
}) => {
  // Center defaults to South India / Munnar or Selected Location
  const defaultCenter = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : userCoords 
      ? [userCoords.latitude, userCoords.longitude]
      : [10.0889, 77.0595];

  const [activeLayers, setActiveLayers] = useState({
    riskZones: true,
    shelters: true,
    hospitals: true,
    safeZones: true
  });

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs shadow-xl flex flex-col gap-2">
        <span className="font-bold text-slate-300 tracking-wider uppercase text-[10px]">Layer Filters</span>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
          <input 
            type="checkbox" 
            checked={activeLayers.riskZones} 
            onChange={(e) => setActiveLayers({...activeLayers, riskZones: e.target.checked})}
            className="rounded text-sky-500 bg-slate-800 border-slate-700" 
          />
          <span>🚨 Hazard Risk Zones</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
          <input 
            type="checkbox" 
            checked={activeLayers.shelters} 
            onChange={(e) => setActiveLayers({...activeLayers, shelters: e.target.checked})}
            className="rounded text-emerald-500 bg-slate-800 border-slate-700" 
          />
          <span>🏠 Emergency Shelters</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
          <input 
            type="checkbox" 
            checked={activeLayers.hospitals} 
            onChange={(e) => setActiveLayers({...activeLayers, hospitals: e.target.checked})}
            className="rounded text-rose-500 bg-slate-800 border-slate-700" 
          />
          <span>🏥 Hospitals & Trauma Centers</span>
        </label>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={selectedLocation ? 10 : 7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {selectedLocation && (
          <MapCenterController center={[selectedLocation.latitude, selectedLocation.longitude]} />
        )}

        {/* User Location Marker */}
        {userCoords && (
          <Marker
            position={[userCoords.latitude, userCoords.longitude]}
            icon={createCustomIcon('#38bdf8', 'user')}
          >
            <Popup>
              <div className="p-1">
                <strong className="text-sky-400 font-semibold block text-sm">📍 Your Current GPS Location</strong>
                <p className="text-xs text-slate-300 mt-1">Live telemetry and nearest shelters are synchronized to this position.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Regional Hazard Risk Markers & Geofence Circles */}
        {activeLayers.riskZones && locations.map((loc) => {
          const color = getHazardColor(loc.risk_category);
          const radiusMeters = loc.risk_category === 'CRITICAL' ? 35000 : loc.risk_category === 'HIGH' ? 25000 : 15000;

          return (
            <React.Fragment key={`loc-${loc.location_id || loc.id}`}>
              {/* Colored Impact Geofence Circle */}
              <Circle
                center={[loc.latitude, loc.longitude]}
                radius={radiusMeters}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: loc.risk_category === 'CRITICAL' ? 0.25 : loc.risk_category === 'HIGH' ? 0.18 : 0.1,
                  weight: 2,
                  dashArray: loc.risk_category === 'CRITICAL' ? '4, 4' : null,
                }}
              />

              {/* Marker Pin */}
              <Marker
                position={[loc.latitude, loc.longitude]}
                icon={createCustomIcon(color, 'hazard')}
                eventHandlers={{
                  click: () => onSelectLocation && onSelectLocation(loc),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[220px]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-white">{loc.name}, {loc.state}</h4>
                      <RiskBadge category={loc.risk_category} score={loc.risk_score} size="sm" />
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-xs space-y-1 my-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-sky-400" /> 24h Rain:</span>
                        <strong className="text-white font-mono">{loc.latest_reading?.rainfall_24h || 0} mm</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-amber-400" /> Temp:</span>
                        <strong className="text-white font-mono">{loc.latest_reading?.temperature || 28}°C</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-teal-400" /> Wind:</span>
                        <strong className="text-white font-mono">{loc.latest_reading?.wind_speed || 12} km/h</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>River Water:</span>
                        <strong className="text-white font-mono">{loc.latest_reading?.river_water_level || 1.8}m / {loc.latest_reading?.river_danger_level || 4.5}m</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic border-l-2 border-sky-500 pl-2 my-2">
                      "{loc.recommended_action || 'Monitor routine advisories.'}"
                    </p>

                    {onSelectLocation && (
                      <button
                        onClick={() => onSelectLocation(loc)}
                        className="w-full mt-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Inspect Risk Telemetry
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Shelter Markers */}
        {activeLayers.shelters && shelters.map((sh) => (
          <Marker
            key={`sh-${sh.id}`}
            position={[sh.latitude, sh.longitude]}
            icon={createCustomIcon('#10b981', 'shelter')}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                  <Home className="w-3.5 h-3.5" /> Relief Shelter
                </div>
                <h4 className="font-bold text-sm text-white">{sh.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{sh.address}</p>
                <div className="mt-2 text-xs text-slate-400">
                  <span>Occupancy: <strong className="text-white font-mono">{sh.current_occupancy} / {sh.capacity}</strong></span>
                  {sh.distance_km && <span className="block mt-0.5 text-sky-400 font-medium">📍 {sh.distance_km} km away</span>}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-medium">{sh.is_open ? '🟢 Open' : '🔴 Closed'}</span>
                  <a href={`tel:${sh.contact_phone}`} className="text-sky-400 hover:underline font-medium">
                    {sh.contact_phone}
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hospitals & Medical Services */}
        {activeLayers.hospitals && services.filter(s => s.service_type === 'HOSPITAL').map((serv) => (
          <Marker
            key={`serv-${serv.id}`}
            position={[serv.latitude, serv.longitude]}
            icon={createCustomIcon('#f43f5e', 'hospital')}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                  <HeartPulse className="w-3.5 h-3.5" /> Hospital & Trauma Center
                </div>
                <h4 className="font-bold text-sm text-white">{serv.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{serv.address}</p>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="text-rose-400 font-bold">Hotline: {serv.emergency_hotline}</span>
                  {serv.distance_km && <span className="block mt-0.5 text-sky-400 font-medium">📍 {serv.distance_km} km away</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
