import React, { useState, useEffect } from 'react';
import { RideOption, LocationPoint, RideHistoryItem } from '../types/ride';
import { X, CheckCircle2, Car, Phone, Navigation, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

interface BookingConfirmModalProps {
  option: RideOption | null;
  origin: LocationPoint;
  destination: LocationPoint;
  onClose: () => void;
  onTripCompleted: (historyItem: RideHistoryItem) => void;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  option,
  origin,
  destination,
  onClose,
  onTripCompleted,
}) => {
  if (!option) return null;

  const [status, setStatus] = useState<'matching' | 'confirmed' | 'arriving'>('matching');
  const [etaRemainingSeconds, setEtaRemainingSeconds] = useState(option.pickupEtaMins * 60);

  // Simulated driver details
  const driverProfiles = {
    grab: { name: 'Tan Wei Ming', car: 'Toyota Prius Hybrid (White)', plate: 'SNA 4921 B', rating: 4.93 },
    gojek: { name: 'Leslie Wong', car: 'Honda Vezel (Silver)', plate: 'SKL 7309 K', rating: 4.95 },
    tada: { name: 'Marcus Lim', car: 'BYD Atto 3 EV (Blue)', plate: 'SME 6219 M', rating: 4.97 },
    taxi: { name: 'Khoo Boon Teck (ComfortDelGro)', car: 'Hyundai Ioniq Hybrid Taxi (Blue)', plate: 'SHA 1928 L', rating: 4.90 },
  };

  const driver = driverProfiles[option.provider];

  useEffect(() => {
    // Simulate driver matching in 2.2 seconds
    const timer1 = setTimeout(() => {
      setStatus('confirmed');
    }, 2200);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (status !== 'confirmed') return;
    const interval = setInterval(() => {
      setEtaRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleCompleteRide = () => {
    const historyItem: RideHistoryItem = {
      id: `trip_${Date.now()}`,
      timestamp: Date.now(),
      origin: origin.name,
      destination: destination.name,
      distanceKm: option.distanceKm,
      provider: option.provider,
      providerName: option.providerName,
      serviceName: option.serviceName,
      category: option.category,
      finalFare: option.netFare,
      cashbackSaved: option.shopbackCashbackAmount,
      driverName: driver.name,
      vehicleModel: driver.car,
      licensePlate: driver.plate,
    };
    onTripCompleted(historyItem);
  };

  const minutesLeft = Math.floor(etaRemainingSeconds / 60);
  const secondsLeft = etaRemainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                option.provider === 'grab'
                  ? 'bg-[#00B14F]'
                  : option.provider === 'gojek'
                  ? 'bg-[#101820]'
                  : option.provider === 'tada'
                  ? 'bg-[#0052CC]'
                  : 'bg-amber-500'
              }`}
            />
            <h3 className="font-bold text-slate-900 text-sm">
              {status === 'matching' ? `Dispatching ${option.providerName}...` : `${option.providerName} Driver Confirmed`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs space-y-4">
          {status === 'matching' ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Finding Nearest Available Driver</h4>
              <p className="text-slate-500 max-w-xs mx-auto">
                Connecting with {option.driverCountNearby} nearby {option.providerName} cars around {origin.name}...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ETA Display */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">Driver Arriving In</p>
                  <p className="text-2xl font-extrabold text-emerald-950 font-mono tabular-nums">
                    {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              {/* Driver Details Card */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{driver.name}</p>
                    <p className="text-slate-500 text-[11px]">{driver.car}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-xs">{driver.plate}</span>
                    <p className="text-amber-600 font-bold text-[11px]">{driver.rating} ★</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Vehicle: {option.categoryLabel}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    +${option.shopbackCashbackAmount.toFixed(2)} ShopBack
                  </span>
                </div>
              </div>

              {/* Trip summary */}
              <div className="space-y-1.5 text-slate-600 border-l-2 border-slate-200 pl-3">
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-slate-900 shrink-0">From:</span>
                  <span className="truncate">{origin.name}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-slate-900 shrink-0">To:</span>
                  <span className="truncate">{destination.name}</span>
                </div>
                <div className="flex items-start gap-1.5 pt-1">
                  <span className="font-semibold text-slate-900 shrink-0">Net Total:</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums">${option.netFare.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          {status === 'matching' ? (
            <button
              onClick={onClose}
              className="w-full py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
            >
              Cancel Request
            </button>
          ) : (
            <>
              <button
                onClick={handleCompleteRide}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Trip Completion & Review</span>
              </button>

              <a
                href={option.deepLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>Launch {option.providerName} App</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
