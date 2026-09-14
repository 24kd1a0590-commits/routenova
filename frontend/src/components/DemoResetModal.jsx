import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { resetDemoDataAsync } from '../services/dataService';

export default function DemoResetModal({ isOpen, onClose, onSuccess }) {
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    setErrorMsg(null);
    try {
      const result = await resetDemoDataAsync();
      setIsResetting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess(result);
        }
      }, 1400);
    } catch (err) {
      console.error("Reset failed:", err);
      setIsResetting(false);
      setErrorMsg("Failed to reset scenario. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isResetting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-emerald-400">Demo Ready ✅</h3>
              <p className="text-sm text-slate-300">
                RouteNova has been successfully restored to the expo demonstration state.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 id="reset-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Reset Demo Data
                </h3>
                <p className="text-xs text-amber-400 font-medium">Expo Presentation Setup</p>
              </div>
            </div>

            {/* Core User Message */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/70 rounded-xl space-y-2">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                This will restore RouteNova to the prepared expo demonstration scenario.
              </p>
              <p className="text-xs text-slate-400 leading-normal">
                Shipments, vehicle assignments, delivery progress, outcomes, and metrics will be restored. User accounts will remain untouched.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center space-x-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-slate-950" />
                    <span>Reset Demo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
