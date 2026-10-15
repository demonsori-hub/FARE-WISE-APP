import React from 'react';
import { ShieldCheck, Zap, Percent, Clock } from 'lucide-react';

export const ValuePledgeBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm overflow-hidden relative">
      {/* Background glow subtle decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Miro Strategy Implementation · Team 6
          </p>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
            Singapore's 4-in-1 Real-Time Ride & Taxi Aggregator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Compare live fares across Grab, Gojek, TADA, and LTA Street Taxis (DataMall API) simultaneously. Zero markups, regulated meter transparency, and travel cashback.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">0% Extra Cost</p>
              <p className="text-slate-400 text-[11px]">Direct app deep links</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Percent className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">ShopBack Rebates</p>
              <p className="text-slate-400 text-[11px]">3.5% - 5.0% back</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Live Surge Sync</p>
              <p className="text-slate-400 text-[11px]">Real-time driver feed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
