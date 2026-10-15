import React, { useState } from 'react';
import { LocationPoint, PriceAlert, RideProvider } from '../types/ride';
import { Bell, Plus, Trash2, X, CheckCircle, Zap } from 'lucide-react';
import { SINGAPORE_LOCATIONS } from '../data/singaporeLocations';

interface PriceAlertModalProps {
  alerts: PriceAlert[];
  currentOrigin: LocationPoint;
  currentDestination: LocationPoint;
  currentCheapest: number;
  onAddAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  onDeleteAlert: (id: string) => void;
  onSimulateTrigger: (id: string) => void;
  onClose?: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  alerts,
  currentOrigin,
  currentDestination,
  currentCheapest,
  onAddAlert,
  onDeleteAlert,
  onSimulateTrigger,
  onClose,
}) => {
  const [targetFare, setTargetFare] = useState<number>(Math.max(10, Math.floor(currentCheapest - 2)));
  const [selectedProvider, setSelectedProvider] = useState<RideProvider | 'any'>('any');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlert({
      originName: currentOrigin.name,
      destinationName: currentDestination.name,
      targetFare: Number(targetFare),
      provider: selectedProvider,
      currentCheapestFare: currentCheapest,
      active: true,
    });
    setSuccessMsg('Price alert activated! You will receive live alerts when rates drop.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Fare & Surge Price Alerts</h2>
            <p className="text-xs text-slate-500">Miro Proposition: Automated alerts for price drops & off-peak windows</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        {/* Left: Create Alert Form */}
        <div className="md:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            Set Alert For Current Route
          </h3>

          <div className="text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
            <p className="truncate"><strong className="text-slate-900">From:</strong> {currentOrigin.name}</p>
            <p className="truncate"><strong className="text-slate-900">To:</strong> {currentDestination.name}</p>
            <p className="text-emerald-700 font-semibold pt-1">
              Current lowest rate: <span className="font-mono tabular-nums">${currentCheapest.toFixed(2)}</span>
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Notify me when fare drops below:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.50"
                  min="5"
                  max="100"
                  value={targetFare}
                  onChange={(e) => setTargetFare(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Service Preference</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as RideProvider | 'any')}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="any">Any Provider (Grab, Gojek, TADA, or Taxi)</option>
                <option value="grab">Grab only</option>
                <option value="gojek">Gojek only</option>
                <option value="tada">TADA only</option>
                <option value="taxi">LTA Taxis only</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Set Price Alert
            </button>

            {successMsg && (
              <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}
          </form>
        </div>

        {/* Right: Active Alerts List */}
        <div className="md:col-span-7 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Active Commuter Alerts ({alerts.length})</h3>

          {alerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-medium text-slate-600">No active price alerts</p>
              <p className="text-[11px] text-slate-400">Set an alert on the left to receive surge drop notifications.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold truncate">
                      <span>{alert.originName}</span>
                      <span className="text-slate-400">→</span>
                      <span>{alert.destinationName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Target: <strong className="text-emerald-700 font-mono">${alert.targetFare.toFixed(2)}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{alert.provider}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSimulateTrigger(alert.id)}
                      title="Test simulated notification"
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Test Push</span>
                    </button>
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
