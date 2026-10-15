import React from 'react';
import { RideOption } from '../types/ride';
import { ExternalLink, Info, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';

interface RideComparisonListProps {
  options: RideOption[];
  onSelectOptionForBooking: (option: RideOption) => void;
  onOpenBreakdown: (option: RideOption) => void;
  onSetAlertForOption: (option: RideOption) => void;
  priorityQueue: boolean;
}

export const RideComparisonList: React.FC<RideComparisonListProps> = ({
  options,
  onSelectOptionForBooking,
  onOpenBreakdown,
  onSetAlertForOption,
  priorityQueue,
}) => {
  // Compute savings
  const maxPrice = Math.max(...options.map((o) => o.netFare));
  const minPrice = Math.min(...options.map((o) => o.netFare));
  const maxSavings = Number((maxPrice - minPrice).toFixed(2));

  const fastestOption = options.find((o) => o.isFastest);
  const cheapestOption = options.find((o) => o.isCheapest);

  return (
    <div className="space-y-4">
      {/* Real-time Summary Insights Row */}
      <div className="bg-slate-100/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-700 font-medium">
            Smart Savings: Book <strong className="text-slate-900">{cheapestOption?.providerName}</strong> to save{' '}
            <strong className="text-emerald-700 font-mono tabular-nums">${maxSavings.toFixed(2)}</strong> on this trip.
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>Fastest: <strong className="text-slate-800">{fastestOption?.providerName} ({fastestOption?.pickupEtaMins}m)</strong></span>
          <span aria-hidden="true">·</span>
          <span>Lowest: <strong className="text-slate-800 font-mono tabular-nums">${cheapestOption?.netFare.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* 4 Listed Providers Comparison Grid (Grab, Gojek, TADA, LTA Taxis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => {
          const isGrab = opt.provider === 'grab';
          const isGojek = opt.provider === 'gojek';
          const isTada = opt.provider === 'tada';
          const isTaxi = opt.provider === 'taxi';

          // Provider custom theme styles
          const borderHighlight = opt.isBestValue
            ? 'ring-2 ring-emerald-500/80 border-emerald-400'
            : isTaxi
            ? 'border-amber-200 hover:border-amber-300'
            : 'border-slate-200 hover:border-slate-300';

          return (
            <div
              key={opt.id}
              className={`bg-white rounded-2xl border ${borderHighlight} p-4 sm:p-5 shadow-sm transition-all duration-200 flex flex-col justify-between relative group`}
            >
              {/* Card Header */}
              <div>
                {/* Top Smart Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {/* Provider Brand Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs ${
                        isGrab
                          ? 'bg-[#00B14F]'
                          : isGojek
                          ? 'bg-[#101820] text-emerald-400 border border-emerald-500/30'
                          : isTada
                          ? 'bg-[#0052CC]'
                          : 'bg-amber-500 text-slate-950 font-extrabold border border-amber-600/20'
                      }`}
                    >
                      {isGrab ? 'Grab' : isGojek ? 'Gojek' : isTada ? 'TADA' : 'TAXI'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {opt.providerName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
                        {opt.serviceName}
                      </p>
                    </div>
                  </div>

                  {/* Smart Tag indicator */}
                  <div>
                    {opt.isBestValue && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                        BEST VALUE
                      </span>
                    )}
                    {!opt.isBestValue && opt.isCheapest && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                        CHEAPEST
                      </span>
                    )}
                    {!opt.isBestValue && !opt.isCheapest && opt.isFastest && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                        FASTEST
                      </span>
                    )}
                  </div>
                </div>

                {/* LTA DataMall Badge for Taxi */}
                {isTaxi && (
                  <div className="mb-2.5 py-1 px-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[10px] text-amber-900 flex items-center justify-between">
                    <span className="font-semibold">LTA DataMall Feed</span>
                    <span className="text-amber-700">Regulated Meter</span>
                  </div>
                )}

                {/* Pickup ETA & Driver Availability (Unboxed Metadata) */}
                <div className="py-2.5 border-y border-slate-100 my-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">ETA</span>{' '}
                    <span className="font-bold text-slate-900 text-sm font-mono tabular-nums">
                      {opt.pickupEtaMins} min
                    </span>
                  </div>
                  <div className="text-slate-500 text-right">
                    <span>{opt.driverCountNearby} available</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span>{opt.capacity}pax</span>
                  </div>
                </div>

                {/* Surge Status & Toll Details */}
                <div className="text-xs text-slate-500 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Pricing Model:</span>
                    <span className={`font-medium ${isTaxi ? 'text-amber-700 font-semibold' : opt.surgeMultiplier > 1.2 ? 'text-rose-600 font-semibold' : 'text-slate-700'}`}>
                      {isTaxi ? 'Metered (No Surge)' : opt.surgeMultiplier > 1.0 ? `${opt.surgeMultiplier}x Surge` : 'Normal (1.0x)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ERP Toll + Fees:</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      ${(opt.erpFee + opt.platformFee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      ShopBack {(opt.shopbackCashbackRate * 100).toFixed(0)}%:
                    </span>
                    <span className="font-mono tabular-nums">
                      -${opt.shopbackCashbackAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Display & Actions */}
              <div className="pt-2">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-1.5 font-mono tabular-nums">
                      ${opt.grossFare.toFixed(2)}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                      ${opt.netFare.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenBreakdown(opt)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>Breakdown</span>
                  </button>
                </div>

                {/* Primary Booking Simulation CTA */}
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectOptionForBooking(opt)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      isGrab
                        ? 'bg-[#00B14F] hover:bg-[#009b45] text-white'
                        : isGojek
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : isTada
                        ? 'bg-[#0052CC] hover:bg-[#0047b3] text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                    }`}
                  >
                    <span>{isTaxi ? 'Hail / Book LTA Taxi' : `Book with ${opt.providerName}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <button
                      onClick={() => onSetAlertForOption(opt)}
                      className="hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      Alert if price drops
                    </button>
                    <span>No hidden fees</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
