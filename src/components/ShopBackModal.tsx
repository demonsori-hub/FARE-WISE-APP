import React from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck, Wallet, ArrowUpRight, Gift } from 'lucide-react';

interface ShopBackModalProps {
  onClose: () => void;
  accumulatedCashback: number;
}

export const ShopBackModal: React.FC<ShopBackModalProps> = ({
  onClose,
  accumulatedCashback,
}) => {
  const [withdrawn, setWithdrawn] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              SB
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ShopBack × FARE WISE Partnership</h3>
              <p className="text-xs text-slate-500">Miro Partner Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-xs space-y-4">
          {/* Cashback Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Accumulated Travel Rebates</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">
                Verified Account
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
                ${(14.80 + accumulatedCashback).toFixed(2)}
              </span>
              <button
                onClick={() => setWithdrawn(true)}
                disabled={withdrawn}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{withdrawn ? 'Transferred' : 'Withdraw'}</span>
              </button>
            </div>
            {withdrawn && (
              <p className="text-[11px] text-emerald-400 mt-2 font-medium bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30">
                ✓ Simulated PayNow transfer initiated! Funds will arrive in 1-2 business days.
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Automatically credited after every verified Grab, Gojek, or TADA ride.
            </p>
          </div>

          {/* Partner Rates Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Live Partner Cashback Rates</h4>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#00B14F] text-white flex items-center justify-center text-[10px] font-bold">G</span>
                  <span className="font-semibold text-slate-800">Grab</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">3.5% Cashback</span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#101820] text-emerald-400 flex items-center justify-center text-[10px] font-bold">Gj</span>
                  <span className="font-semibold text-slate-800">Gojek</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">4.0% Cashback</span>
              </div>

              <div className="p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#0052CC] text-white flex items-center justify-center text-[10px] font-bold">T</span>
                  <div>
                    <span className="font-semibold text-slate-900">TADA (Exclusive Partner)</span>
                    <span className="block text-[10px] text-emerald-700">+1.0% Extra Bonus Rebate</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-sm">5.0% Cashback</span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">TX</span>
                  <div>
                    <span className="font-semibold text-slate-800">LTA Taxis (Comfort / Strides)</span>
                    <span className="block text-[10px] text-slate-400">Street hail & CDG Zig</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700">3.0% Cashback</span>
              </div>
            </div>
          </div>

          {/* Value Hunters guarantee */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Value Hunter Guarantee</span>
            </div>
            <p>
              Fare Wise never inflates fares. The price you see is identical to opening each app directly, with cashback bonuses stacked on top.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
