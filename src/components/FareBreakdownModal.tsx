import React from 'react';
import { RideOption } from '../types/ride';
import { X, ShieldCheck, Sparkles, ExternalLink, Database } from 'lucide-react';

interface FareBreakdownModalProps {
  option: RideOption | null;
  onClose: () => void;
  onProceedBooking: (option: RideOption) => void;
}

export const FareBreakdownModal: React.FC<FareBreakdownModalProps> = ({
  option,
  onClose,
  onProceedBooking,
}) => {
  if (!option) return null;

  const isGrab = option.provider === 'grab';
  const isGojek = option.provider === 'gojek';
  const isTada = option.provider === 'tada';
  const isTaxi = option.provider === 'taxi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shadow-xs ${
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
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{option.providerName} Fare Breakdown</h3>
              <p className="text-xs text-slate-500">{option.serviceName} · {option.categoryLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* LTA DataMall Source Banner if Taxi */}
          {isTaxi && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-amber-700" />
                <span>LTA DataMall Real-Time Feed Active</span>
              </div>
              <p className="text-[11px] text-amber-800 font-mono">
                Source: https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability
              </p>
              <p className="text-[10px] text-amber-700">
                Returns coordinates of available taxis currently for hire across ComfortDelGro, Strides Premier, Trans-Cab & Prime.
              </p>
            </div>
          )}

          {/* Transparent Itemized Receipt */}
          <div className="space-y-2.5 text-slate-700">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>{isTaxi ? 'PTC Standard Flag-Down Meter' : 'Base Flag-down Fare'}</span>
                {isTaxi && <span className="text-[10px] text-slate-400 block">First 1.0 km included</span>}
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${option.baseFare.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>Distance Rate</span>
                <span className="text-[11px] text-slate-400 block">
                  {option.distanceKm} km {isTaxi ? '($0.26 / 400m regulated)' : ''}
                </span>
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${option.distanceFare.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>Estimated Time / Traffic Rate</span>
                <span className="text-[11px] text-slate-400 block">~{option.tripDurationMins} minutes</span>
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${option.timeFare.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>Demand Surge Multiplier</span>
                <span className="text-[11px] text-slate-400 block">
                  {isTaxi ? 'Regulated meter (No Surge Pricing)' : option.surgeMultiplier > 1 ? `${option.surgeMultiplier}x Peak Traffic` : 'Standard Off-Peak (1.0x)'}
                </span>
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {isTaxi ? '0% Surge' : option.surgeMultiplier > 1 ? `${option.surgeMultiplier}x` : '1.0x'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>Singapore ERP Tolls (Estimated)</span>
                <span className="text-[11px] text-slate-400 block">Expressway / Downtown gantries</span>
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${option.erpFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <div>
                <span>{isTaxi ? 'LTA Regulatory Levy' : 'Platform & Safety Fee'}</span>
                <span className="text-[11px] text-slate-400 block">{isTaxi ? 'Zero platform commission' : 'Safety & insurance levy'}</span>
              </div>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${option.platformFee.toFixed(2)}
              </span>
            </div>

            {/* Gross Fare Subtotal */}
            <div className="flex justify-between items-center pt-1 font-semibold text-slate-900">
              <span>Gross Fare</span>
              <span className="font-mono tabular-nums text-sm">
                ${option.grossFare.toFixed(2)}
              </span>
            </div>

            {/* ShopBack Deduction */}
            <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg text-emerald-800 font-medium border border-emerald-100">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ShopBack {(option.shopbackCashbackRate * 100).toFixed(1)}% Travel Rebate
              </span>
              <span className="font-mono tabular-nums font-bold">
                -${option.shopbackCashbackAmount.toFixed(2)}
              </span>
            </div>

            {/* Net Total Payable */}
            <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900">
              <div>
                <span className="text-sm font-bold text-slate-900">Effective Net Price</span>
                <p className="text-[11px] text-slate-400">After ShopBack automatic cashback</p>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                ${option.netFare.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transparency Pledge */}
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700">Zero Added Commission:</strong> FARE WISE connects directly to {option.providerName}. No additional booking fee is added to your ride.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-xl font-medium text-slate-700 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onProceedBooking(option);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isGrab
                ? 'bg-[#00B14F] hover:bg-[#009b45] text-white'
                : isGojek
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : isTada
                ? 'bg-[#0052CC] hover:bg-[#0047b3] text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
            }`}
          >
            <span>{isTaxi ? 'Hail / Book LTA Taxi' : 'Confirm & Book'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
