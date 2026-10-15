import React from 'react';
import { RideHistoryItem, LocationPoint } from '../types/ride';
import { History, RotateCcw, Star, Calendar, Download, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { SINGAPORE_LOCATIONS } from '../data/singaporeLocations';

interface HistoryDrawerProps {
  history: RideHistoryItem[];
  onReorder: (originName: string, destinationName: string) => void;
  onOpenFeedback: (trip: RideHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onReorder,
  onOpenFeedback,
  onClearHistory,
}) => {
  const totalCashback = history.reduce((acc, item) => acc + (item.cashbackSaved || 0), 0);
  const totalFares = history.reduce((acc, item) => acc + item.finalFare, 0);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-SG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Trip History & Re-ordering Log</h2>
            <p className="text-xs text-slate-500">Miro Activity: 1-click re-ordering for frequent commuter routes</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Trips: <strong className="text-slate-900 font-mono">{history.length}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Spent: <strong className="text-slate-900 font-mono">${totalFares.toFixed(2)}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ShopBack Earned: <strong className="font-mono">${totalCashback.toFixed(2)}</strong></span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear trip history"
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="mt-4">
        {history.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No recorded trips yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Compare rides and confirm a booking above to build your commuter re-ordering log and track ShopBack cashbacks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((trip) => {
              const isGrab = trip.provider === 'grab';
              const isGojek = trip.provider === 'gojek';
              const isTada = trip.provider === 'tada';
              const isTaxi = trip.provider === 'taxi';

              return (
                <div
                  key={trip.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Route and metadata */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isGrab
                            ? 'bg-[#00B14F] text-white'
                            : isGojek
                            ? 'bg-[#101820] text-emerald-400'
                            : isTada
                            ? 'bg-[#0052CC] text-white'
                            : 'bg-amber-500 text-slate-950 font-extrabold'
                        }`}
                      >
                        {isGrab ? 'G' : isGojek ? 'Gj' : isTada ? 'T' : 'TX'}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {trip.serviceName}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 text-xs">{formatDate(trip.timestamp)}</span>
                    </div>

                    {/* Route line */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <span className="truncate max-w-[200px]">{trip.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{trip.destination}</span>
                    </div>

                    {/* Driver & feedback */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Driver: {trip.driverName} ({trip.licensePlate})</span>
                      <span aria-hidden="true">·</span>
                      {trip.userRating ? (
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {trip.userRating}★ {trip.userFeedback ? `(${trip.userFeedback})` : ''}
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenFeedback(trip)}
                          className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Fare & Re-order CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <div className="text-left md:text-right">
                      <div className="font-mono tabular-nums text-base font-extrabold text-slate-900">
                        ${trip.finalFare.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        +${trip.cashbackSaved.toFixed(2)} cashback
                      </div>
                    </div>

                    <button
                      onClick={() => onReorder(trip.origin, trip.destination)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      <span>Re-order Ride</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
