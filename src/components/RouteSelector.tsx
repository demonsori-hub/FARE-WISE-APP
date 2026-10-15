import React, { useState, useEffect } from 'react';
import { ArrowUpDown, MapPin, Navigation, Car, Users, Sparkles, Zap, Shield, BatteryCharging, Check, Search, Globe } from 'lucide-react';
import { LocationPoint, VehicleCategory } from '../types/ride';
import { SINGAPORE_LOCATIONS } from '../data/singaporeLocations';
import { searchOneMap, convertOneMapToLocation } from '../services/onemapService';
import { OneMapCleanResult } from '../../api/onemap';

interface RouteSelectorProps {
  origin: LocationPoint;
  destination: LocationPoint;
  onSelectOrigin: (loc: LocationPoint) => void;
  onSelectDestination: (loc: LocationPoint) => void;
  onSwapLocations: () => void;
  category: VehicleCategory;
  onSelectCategory: (cat: VehicleCategory) => void;
  priorityQueue: boolean;
  onTogglePriorityQueue: () => void;
  distanceKm: number;
  estDurationMins: number;
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onSwapLocations,
  category,
  onSelectCategory,
  priorityQueue,
  onTogglePriorityQueue,
  distanceKm,
  estDurationMins,
  lastUpdated,
  onRefresh,
  isRefreshing,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) => {
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Live OneMap keyless search state
  const [oneMapOriginResults, setOneMapOriginResults] = useState<OneMapCleanResult[]>([]);
  const [oneMapDestResults, setOneMapDestResults] = useState<OneMapCleanResult[]>([]);
  const [isSearchingOneMap, setIsSearchingOneMap] = useState(false);

  // Debounced OneMap search for Origin
  useEffect(() => {
    if (!originSearch.trim() || originSearch.trim().length < 2) {
      setOneMapOriginResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOneMap(true);
      const results = await searchOneMap(originSearch);
      setOneMapOriginResults(results);
      setIsSearchingOneMap(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [originSearch]);

  // Debounced OneMap search for Destination
  useEffect(() => {
    if (!destSearch.trim() || destSearch.trim().length < 2) {
      setOneMapDestResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOneMap(true);
      const results = await searchOneMap(destSearch);
      setOneMapDestResults(results);
      setIsSearchingOneMap(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [destSearch]);

  const filteredOrigins = SINGAPORE_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(originSearch.toLowerCase()) ||
      loc.address.toLowerCase().includes(originSearch.toLowerCase()) ||
      loc.area.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDests = SINGAPORE_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(destSearch.toLowerCase()) ||
      loc.address.toLowerCase().includes(destSearch.toLowerCase()) ||
      loc.area.toLowerCase().includes(destSearch.toLowerCase())
  );

  const categories: { id: VehicleCategory; label: string; icon: React.ReactNode; capacity: string }[] = [
    { id: 'standard', label: 'Standard 4-Seater', icon: <Car className="w-3.5 h-3.5" />, capacity: '4 pax' },
    { id: 'xl', label: '6-Seater XL', icon: <Users className="w-3.5 h-3.5" />, capacity: '6 pax' },
    { id: 'premium', label: 'Premium Exec', icon: <Sparkles className="w-3.5 h-3.5" />, capacity: '4 pax' },
    { id: 'taxi', label: 'Metered Taxi', icon: <Shield className="w-3.5 h-3.5" />, capacity: '4 pax' },
    { id: 'green', label: 'Electric EV', icon: <BatteryCharging className="w-3.5 h-3.5" />, capacity: '4 pax' },
  ];

  const quickRoutes = [
    { name: '178903 (SMU Stamford) → MBS', origId: 'smu_178903', destId: 'mbs' },
    { name: 'Changi → Marina Bay', origId: 'changi_t3', destId: 'mbs' },
    { name: 'Orchard → Raffles Place', origId: 'orchard_ion', destId: 'raffles_place' },
    { name: 'Clarke Quay → Sentosa', origId: 'clarke_quay', destId: 'sentosa_rws' },
    { name: 'Jurong East → Bugis', origId: 'jurong_east', destId: 'bugis_junction' },
  ];

  const handleQuickRoute = (origId: string, destId: string) => {
    const o = SINGAPORE_LOCATIONS.find((l) => l.id === origId);
    const d = SINGAPORE_LOCATIONS.find((l) => l.id === destId);
    if (o && d) {
      onSelectOrigin(o);
      onSelectDestination(d);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      {/* Route Inputs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Origin Selector */}
        <div className="relative lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Pick-up Location (Singapore)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">OneMap Keyless Geocoding</span>
          </label>
          <div
            onClick={() => {
              setShowOriginDropdown(!showOriginDropdown);
              setShowDestDropdown(false);
            }}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{origin.name}</p>
              <p className="text-xs text-slate-500 truncate">{origin.address}</p>
            </div>
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Origin Dropdown */}
          {showOriginDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto p-2">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search address or 6-digit postal (e.g. 178903)..."
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* OneMap Live Results */}
              {oneMapOriginResults.length > 0 && (
                <div className="mb-3">
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/80 rounded-md mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      OneMap Keyless Search Results ({oneMapOriginResults.length})
                    </span>
                    <span className="text-[9px] text-emerald-600">Postal Verified</span>
                  </div>
                  <div className="space-y-1">
                    {oneMapOriginResults.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => {
                          onSelectOrigin(convertOneMapToLocation(res));
                          setShowOriginDropdown(false);
                          setOriginSearch('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-emerald-50/60 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-emerald-200"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 truncate">{res.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{res.address}</p>
                        </div>
                        {res.postal && (
                          <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                            {res.postal}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotspots / Pre-saved Locations */}
              <div>
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Popular Hotspots
                </p>
                <div className="space-y-1">
                  {filteredOrigins.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectOrigin(loc);
                        setShowOriginDropdown(false);
                        setOriginSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        loc.id === origin.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium truncate">{loc.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{loc.area} · {loc.address}</p>
                      </div>
                      {loc.id === origin.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
          <button
            onClick={onSwapLocations}
            title="Swap pickup and drop-off"
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-xs"
            aria-label="Swap locations"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="relative lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Drop-off Destination
            </span>
            <span className="text-[10px] text-slate-400 font-normal">OneMap Keyless Geocoding</span>
          </label>
          <div
            onClick={() => {
              setShowDestDropdown(!showDestDropdown);
              setShowOriginDropdown(false);
            }}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{destination.name}</p>
              <p className="text-xs text-slate-500 truncate">{destination.address}</p>
            </div>
            <Navigation className="w-4 h-4 text-rose-500 shrink-0" />
          </div>

          {/* Destination Dropdown */}
          {showDestDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto p-2">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search address or 6-digit postal (e.g. 178903)..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              {/* OneMap Live Results */}
              {oneMapDestResults.length > 0 && (
                <div className="mb-3">
                  <div className="px-2 py-1 text-[10px] font-bold text-rose-800 bg-rose-50/80 rounded-md mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-rose-600" />
                      OneMap Keyless Search Results ({oneMapDestResults.length})
                    </span>
                    <span className="text-[9px] text-rose-600">Postal Verified</span>
                  </div>
                  <div className="space-y-1">
                    {oneMapDestResults.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => {
                          onSelectDestination(convertOneMapToLocation(res));
                          setShowDestDropdown(false);
                          setDestSearch('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-rose-50/60 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-rose-200"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 truncate">{res.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{res.address}</p>
                        </div>
                        {res.postal && (
                          <span className="text-[10px] font-mono font-semibold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded shrink-0">
                            {res.postal}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotspots / Pre-saved Locations */}
              <div>
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Popular Hotspots
                </p>
                <div className="space-y-1">
                  {filteredDests.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectDestination(loc);
                        setShowDestDropdown(false);
                        setDestSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        loc.id === destination.id ? 'bg-rose-50 text-rose-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium truncate">{loc.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{loc.area} · {loc.address}</p>
                      </div>
                      {loc.id === destination.id && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Singapore Quick Routes */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Quick Routes:</span>
        {quickRoutes.map((qr) => (
          <button
            key={qr.name}
            onClick={() => handleQuickRoute(qr.origId, qr.destId)}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            {qr.name}
          </button>
        ))}
      </div>

      {/* Vehicle Category & Priority Queue Selector */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Buttons (Functional Interactive Filter Controls) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                category === cat.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className="text-[10px] text-slate-400">({cat.capacity})</span>
            </button>
          ))}
        </div>

        {/* Priority Queue Toggle (Miro Feature) & Live Sync Control */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={priorityQueue}
              onChange={onTogglePriorityQueue}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Priority Queue (+$2.00)
            </span>
          </label>

          <span className="text-slate-300">|</span>

          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-2 text-slate-500">
            <span>{distanceKm} km</span>
            <span aria-hidden="true">·</span>
            <span>Est. {estDurationMins} mins</span>
          </div>

          <span className="text-slate-300">|</span>

          <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={onToggleAutoRefresh}
              className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 cursor-pointer"
            />
            <span className="text-[11px]">Live Sync (10s)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
