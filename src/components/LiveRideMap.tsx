import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint, NearbyDriver, RideProvider } from '../types/ride';
import { generateRoutePoints } from '../data/singaporeLocations';
import { Layers, Navigation, RefreshCw, Car } from 'lucide-react';

interface LiveRideMapProps {
  origin: LocationPoint;
  destination: LocationPoint;
  drivers: NearbyDriver[];
  selectedProviderFilter: RideProvider | 'all';
  onSelectProviderFilter: (filter: RideProvider | 'all') => void;
}

export const LiveRideMap: React.FC<LiveRideMapProps> = ({
  origin,
  destination,
  drivers,
  selectedProviderFilter,
  onSelectProviderFilter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeDriver, setActiveDriver] = useState<NearbyDriver | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.32, 103.85],
        zoom: 12,
        zoomControl: false,
      });

      // Add high quality OpenStreetMap carto tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CartoDB',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    // Clear previous markers & route
    markersLayerRef.current.clearLayers();
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    // 1. Add Pickup Marker (Origin)
    const pickupIcon = L.divIcon({
      className: 'custom-car-marker',
      html: `
        <div class="flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
            A
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([origin.lat, origin.lng], { icon: pickupIcon })
      .bindPopup(`<strong class="text-xs font-semibold text-emerald-700">Pick-up:</strong><br><span class="text-xs">${origin.name}</span>`)
      .addTo(markersLayerRef.current);

    // 2. Add Drop-off Marker (Destination)
    const destIcon = L.divIcon({
      className: 'custom-car-marker',
      html: `
        <div class="flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
            B
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindPopup(`<strong class="text-xs font-semibold text-rose-700">Drop-off:</strong><br><span class="text-xs">${destination.name}</span>`)
      .addTo(markersLayerRef.current);

    // 3. Add Route Polyline
    const routeCoordinates = generateRoutePoints(origin, destination);
    const routeLine = L.polyline(routeCoordinates, {
      color: '#10b981',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);
    routeLayerRef.current = routeLine;

    // Fit map bounds to encompass pickup, dropoff, and route
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    // 4. Add Nearby Driver Markers
    const filteredDrivers =
      selectedProviderFilter === 'all'
        ? drivers
        : drivers.filter((d) => d.provider === selectedProviderFilter);

    filteredDrivers.forEach((driver) => {
      const isGrab = driver.provider === 'grab';
      const isGojek = driver.provider === 'gojek';
      const isTada = driver.provider === 'tada';
      const isTaxi = driver.provider === 'taxi';
      const bgColor = isGrab ? '#00B14F' : isGojek ? '#101820' : isTada ? '#0052CC' : '#EAB308';
      const textColor = isTaxi ? '#0f172a' : '#ffffff';
      const label = isGrab ? 'G' : isGojek ? 'Go' : isTada ? 'T' : 'TX';

      const driverIcon = L.divIcon({
        className: 'custom-car-marker animate-car',
        html: `
          <div style="background-color: ${bgColor}; color: ${textColor}" class="w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white font-extrabold text-[10px] cursor-pointer">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const driverMarker = L.marker([driver.lat, driver.lng], { icon: driverIcon }).addTo(markersLayerRef.current!);

      driverMarker.on('click', () => {
        setActiveDriver(driver);
      });
    });

    return () => {
      // Cleanup
    };
  }, [origin, destination, drivers, selectedProviderFilter]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mb-6">
      {/* Map Header Toolbar */}
      <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900">Live Vehicle Positions</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">Singapore Network (Inc. LTA DataMall)</span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs">
            <button
              onClick={() => onSelectProviderFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedProviderFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (4)
            </button>
            <button
              onClick={() => onSelectProviderFilter('grab')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedProviderFilter === 'grab'
                  ? 'bg-[#00B14F] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grab
            </button>
            <button
              onClick={() => onSelectProviderFilter('gojek')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedProviderFilter === 'gojek'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gojek
            </button>
            <button
              onClick={() => onSelectProviderFilter('tada')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedProviderFilter === 'tada'
                  ? 'bg-[#0052CC] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TADA
            </button>
            <button
              onClick={() => onSelectProviderFilter('taxi')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedProviderFilter === 'taxi'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LTA Taxi
            </button>
          </div>

          <button
            onClick={handleRecenter}
            title="Recenter route"
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-xs transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Driver floating card */}
        {activeDriver && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-200 shadow-xl text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                {activeDriver.provider === 'taxi' ? 'LTA Street Taxi' : `${activeDriver.provider} Driver`}
              </span>
              <button
                onClick={() => setActiveDriver(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="font-semibold text-slate-900 text-sm">{activeDriver.driverName}</p>
            <p className="text-slate-500">{activeDriver.carModel} · {activeDriver.plate}</p>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
              <span>Rating: <strong className="text-slate-900 font-mono">{activeDriver.rating}★</strong></span>
              <span>ETA: <strong className="text-emerald-700 font-mono">{activeDriver.etaMins} mins</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Origin Pick-up
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Destination
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B14F]" /> Grab
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#101820]" /> Gojek
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" /> TADA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> LTA Taxis (DataMall)
          </span>
        </div>
        <span>Click vehicle icons for driver & taxi details</span>
      </div>
    </div>
  );
};
