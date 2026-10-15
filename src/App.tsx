/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ValuePledgeBanner } from './components/ValuePledgeBanner';
import { RouteSelector } from './components/RouteSelector';
import { RideComparisonList } from './components/RideComparisonList';
import { LiveRideMap } from './components/LiveRideMap';
import { FareBreakdownModal } from './components/FareBreakdownModal';
import { BookingConfirmModal } from './components/BookingConfirmModal';
import { FeedbackModal } from './components/FeedbackModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PriceAlertModal } from './components/PriceAlertModal';
import { ShopBackModal } from './components/ShopBackModal';
import { SINGAPORE_LOCATIONS, computeDistanceKm } from './data/singaporeLocations';
import { LocationPoint, NearbyDriver, PriceAlert, RideHistoryItem, RideOption, RideProvider, VehicleCategory } from './types/ride';
import { calculateRideOptions, generateNearbyDrivers } from './services/rideSimulator';
import { Bell, Sparkles, Navigation, Layers, ShieldCheck, Check, Clock, TrendingDown } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'compare' | 'map' | 'alerts' | 'history'>('compare');

  // Route & Vehicle Selection State
  const [origin, setOrigin] = useState<LocationPoint>(SINGAPORE_LOCATIONS[0]); // Changi Airport T3
  const [destination, setDestination] = useState<LocationPoint>(SINGAPORE_LOCATIONS[1]); // Marina Bay Sands
  const [category, setCategory] = useState<VehicleCategory>('standard');
  const [priorityQueue, setPriorityQueue] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data State
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<RideProvider | 'all'>('all');

  // Modals & Drawers
  const [breakdownOption, setBreakdownOption] = useState<RideOption | null>(null);
  const [bookingOption, setBookingOption] = useState<RideOption | null>(null);
  const [feedbackTrip, setFeedbackTrip] = useState<RideHistoryItem | null>(null);
  const [showShopBackModal, setShowShopBackModal] = useState<boolean>(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Seeded History (Miro Activity: Transaction history log for re-ordering)
  const [tripHistory, setTripHistory] = useState<RideHistoryItem[]>([
    {
      id: 'trip_seed_1',
      timestamp: Date.now() - 1000 * 60 * 60 * 26, // yesterday
      origin: 'ION Orchard (Pick-up Point)',
      destination: 'Raffles Place (One Raffles Quay)',
      distanceKm: 5.2,
      provider: 'tada',
      providerName: 'TADA',
      serviceName: 'TADA Standard (Zero-Comm)',
      category: 'standard',
      finalFare: 14.20,
      cashbackSaved: 0.71,
      driverName: 'Marcus Lim',
      vehicleModel: 'BYD Atto 3 EV',
      licensePlate: 'SME 6219 M',
      userRating: 5,
      userFeedback: 'Zero surge during morning peak! Very smooth EV ride.',
    },
    {
      id: 'trip_seed_2',
      timestamp: Date.now() - 1000 * 60 * 60 * 74, // 3 days ago
      origin: 'Changi Airport Terminal 3',
      destination: 'Marina Bay Sands',
      distanceKm: 19.8,
      provider: 'grab',
      providerName: 'Grab',
      serviceName: 'JustGrab',
      category: 'standard',
      finalFare: 26.50,
      cashbackSaved: 0.93,
      driverName: 'Tan Wei Ming',
      vehicleModel: 'Toyota Prius Hybrid',
      licensePlate: 'SNA 4921 B',
      userRating: 4,
      userFeedback: 'Driver arrived in under 3 mins at T3.',
    },
    {
      id: 'trip_seed_3',
      timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
      origin: 'Clarke Quay (River Valley Road)',
      destination: 'Resorts World Sentosa',
      distanceKm: 6.8,
      provider: 'taxi',
      providerName: 'LTA Taxis',
      serviceName: 'Standard Metered Taxi (Comfort/Trans)',
      category: 'standard',
      finalFare: 13.80,
      cashbackSaved: 0.41,
      driverName: 'Khoo Boon Teck (ComfortDelGro)',
      vehicleModel: 'Hyundai Ioniq Hybrid Taxi',
      licensePlate: 'SHA 1928 L',
      userRating: 5,
      userFeedback: 'Beat Grab surge! Regulated meter fare was cheaper during evening rush.',
    },
  ]);

  // Seeded Price Alerts (Miro Proposition: Alerts & push notifications)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert_1',
      originName: 'Changi Airport Terminal 3',
      destinationName: 'Marina Bay Sands',
      targetFare: 22.00,
      provider: 'any',
      currentCheapestFare: 23.50,
      active: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ]);

  // Update rates logic
  const refreshRates = useCallback(() => {
    setIsRefreshing(true);
    const options = calculateRideOptions({
      origin,
      destination,
      category,
      priorityQueue,
    });
    const drivers = generateNearbyDrivers(origin);

    setRideOptions(options);
    setNearbyDrivers(drivers);
    setLastUpdated(new Date());

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [origin, destination, category, priorityQueue]);

  // Initial & Dependency-based computation
  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  // Auto-refresh interval (10s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      refreshRates();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshRates]);

  // Handle location swap
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Re-order ride from history
  const handleReorder = (originName: string, destName: string) => {
    const foundOrigin = SINGAPORE_LOCATIONS.find((l) => l.name === originName) || origin;
    const foundDest = SINGAPORE_LOCATIONS.find((l) => l.name === destName) || destination;
    setOrigin(foundOrigin);
    setDestination(foundDest);
    setActiveTab('compare');
    setNotificationBanner(`Re-ordered route: ${originName} → ${destName}. Live rates refreshed!`);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  // Complete a booking
  const handleTripCompleted = (historyItem: RideHistoryItem) => {
    setBookingOption(null);
    setTripHistory((prev) => [historyItem, ...prev]);
    setFeedbackTrip(historyItem);
  };

  // Submit feedback
  const handleSubmitFeedback = (tripId: string, rating: number, feedback: string) => {
    setTripHistory((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, userRating: rating, userFeedback: feedback } : t))
    );
  };

  // Add a price alert
  const handleAddAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: `alert_${Date.now()}`,
      createdAt: Date.now(),
    };
    setPriceAlerts((prev) => [alert, ...prev]);
  };

  // Delete a price alert
  const handleDeleteAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Simulate alert push trigger
  const handleSimulateTrigger = (id: string) => {
    const target = priceAlerts.find((a) => a.id === id);
    if (!target) return;
    setNotificationBanner(
      `🔔 PRICE DROP ALERT: TADA fare from ${target.originName} dropped to $${(target.targetFare - 1.2).toFixed(2)} (below target $${target.targetFare.toFixed(2)})!`
    );
    setTimeout(() => setNotificationBanner(null), 6000);
  };

  const distanceKm = computeDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const estDurationMins = Math.round(4 + distanceKm * 2.1);
  const cheapestFare = rideOptions.length > 0 ? Math.min(...rideOptions.map((o) => o.netFare)) : 18.0;
  const accumulatedCashback = tripHistory.reduce((acc, t) => acc + (t.cashbackSaved || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Bar Contract (Wordmark, Nav links, Primary action) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={refreshRates}
        isRefreshing={isRefreshing}
        historyCount={tripHistory.length}
        alertCount={priceAlerts.length}
        onOpenShopBackModal={() => setShowShopBackModal(true)}
      />

      {/* Push Notification Banner */}
      {notificationBanner && (
        <div className="bg-emerald-600 text-white text-xs py-2.5 px-4 text-center font-medium shadow-md flex items-center justify-center gap-2 transition-all">
          <Bell className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{notificationBanner}</span>
          <button
            onClick={() => setNotificationBanner(null)}
            className="ml-2 hover:bg-emerald-700 rounded px-1.5 py-0.5 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Banner with Generated Singapore Mobility Image */}
        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-200">
          <div className="h-44 sm:h-52 w-full relative">
            <img
              src="/src/assets/images/singapore_mobility_hero_1792052214937.jpg"
              alt="Singapore expressway with electric vehicles at dusk"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Measured contrast scrim per Section 1.F */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white" />
            
            <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 block">
                  Live Singapore Transit Feed
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white" style={{ textWrap: 'balance' }}>
                  Compare Grab, Gojek, TADA & LTA Taxis in Real Time
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Always find the fastest arrival and lowest fare across Singapore's ride-hailing networks and metered taxi fleets.
                </p>
              </div>

              {/* Live Status indicator */}
              <div className="flex items-center gap-2 text-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 font-medium">LTA Traffic Sync: Active</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Miro Business Model Core Propositions Banner */}
        <ValuePledgeBanner />

        {/* Route Selector Controls */}
        <RouteSelector
          origin={origin}
          destination={destination}
          onSelectOrigin={setOrigin}
          onSelectDestination={setDestination}
          onSwapLocations={handleSwapLocations}
          category={category}
          onSelectCategory={setCategory}
          priorityQueue={priorityQueue}
          onTogglePriorityQueue={() => setPriorityQueue(!priorityQueue)}
          distanceKm={distanceKm}
          estDurationMins={estDurationMins}
          lastUpdated={lastUpdated}
          onRefresh={refreshRates}
          isRefreshing={isRefreshing}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
        />

        {/* View Tab Switcher for Mobile & Desktop */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Rate Cards
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Price Alerts ({priceAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trip History ({tripHistory.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Route: {distanceKm} km</span>
            <span aria-hidden="true">·</span>
            <span>Est. ~{estDurationMins} mins</span>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <RideComparisonList
              options={rideOptions}
              onSelectOptionForBooking={setBookingOption}
              onOpenBreakdown={setBreakdownOption}
              onSetAlertForOption={(opt) => {
                handleAddAlert({
                  originName: origin.name,
                  destinationName: destination.name,
                  targetFare: Math.floor(opt.netFare - 1.5),
                  provider: opt.provider,
                  currentCheapestFare: opt.netFare,
                  active: true,
                });
                setNotificationBanner(`Price alert saved for ${opt.providerName} under $${(opt.netFare - 1.5).toFixed(2)}.`);
                setTimeout(() => setNotificationBanner(null), 3000);
              }}
              priorityQueue={priorityQueue}
            />

            {/* Supplementary Live Map View on Desktop below cards */}
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Live Dispatch Radar</h3>
                <span className="text-xs text-slate-500">Showing vehicles near {origin.name}</span>
              </div>
              <LiveRideMap
                origin={origin}
                destination={destination}
                drivers={nearbyDrivers}
                selectedProviderFilter={selectedProviderFilter}
                onSelectProviderFilter={setSelectedProviderFilter}
              />
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <LiveRideMap
              origin={origin}
              destination={destination}
              drivers={nearbyDrivers}
              selectedProviderFilter={selectedProviderFilter}
              onSelectProviderFilter={setSelectedProviderFilter}
            />
            {/* Quick cards summary beneath map */}
            <RideComparisonList
              options={rideOptions}
              onSelectOptionForBooking={setBookingOption}
              onOpenBreakdown={setBreakdownOption}
              onSetAlertForOption={() => {}}
              priorityQueue={priorityQueue}
            />
          </div>
        )}

        {activeTab === 'alerts' && (
          <PriceAlertModal
            alerts={priceAlerts}
            currentOrigin={origin}
            currentDestination={destination}
            currentCheapest={cheapestFare}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
            onSimulateTrigger={handleSimulateTrigger}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDrawer
            history={tripHistory}
            onReorder={handleReorder}
            onOpenFeedback={setFeedbackTrip}
            onClearHistory={() => setTripHistory([])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-800">FARE WISE</strong>
            <span className="mx-2">·</span>
            <span>Real-time Singapore ride-hailing comparison</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Grab</span>
            <span aria-hidden="true">·</span>
            <span>Gojek</span>
            <span aria-hidden="true">·</span>
            <span>TADA</span>
            <span aria-hidden="true">·</span>
            <span>LTA Taxis</span>
            <span aria-hidden="true">·</span>
            <span>ShopBack Integrated</span>
          </div>

          <p className="text-slate-400 text-[11px]">
            Zero platform commission for drivers and riders. Direct application links.
          </p>
        </div>
      </footer>

      {/* Interactive Modals */}
      <FareBreakdownModal
        option={breakdownOption}
        onClose={() => setBreakdownOption(null)}
        onProceedBooking={(opt) => {
          setBreakdownOption(null);
          setBookingOption(opt);
        }}
      />

      <BookingConfirmModal
        option={bookingOption}
        origin={origin}
        destination={destination}
        onClose={() => setBookingOption(null)}
        onTripCompleted={handleTripCompleted}
      />

      <FeedbackModal
        trip={feedbackTrip}
        onClose={() => setFeedbackTrip(null)}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {showShopBackModal && (
        <ShopBackModal
          onClose={() => setShowShopBackModal(false)}
          accumulatedCashback={accumulatedCashback}
        />
      )}
    </div>
  );
}
