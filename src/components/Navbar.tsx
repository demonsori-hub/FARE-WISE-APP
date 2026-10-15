import React from 'react';
import { RefreshCw, Clock, Bell, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'compare' | 'map' | 'alerts' | 'history';
  setActiveTab: (tab: 'compare' | 'map' | 'alerts' | 'history') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  historyCount: number;
  alertCount: number;
  onOpenShopBackModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  historyCount,
  alertCount,
  onOpenShopBackModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('compare')}
              className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                  FW
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
                  FARE WISE
                </span>
              </div>
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium whitespace-nowrap">
              Grab · Gojek · TADA · LTA Taxis
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('compare')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                activeTab === 'compare'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Compare Fares
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                activeTab === 'map'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Live Driver Map
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer relative ${
                activeTab === 'alerts'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Price Alerts
              {alertCount > 0 && (
                <span className="ml-1.5 text-xs text-emerald-600 font-mono">
                  ({alertCount})
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer relative ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Trip History
              {historyCount > 0 && (
                <span className="ml-1.5 text-xs text-slate-500 font-mono">
                  ({historyCount})
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefresh}
              title="Refresh live rates"
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Refresh fares"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              onClick={onOpenShopBackModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ShopBack 5% Bonus</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
