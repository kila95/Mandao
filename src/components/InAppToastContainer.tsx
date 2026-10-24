import React from 'react';
import { ChefHat, PackageCheck, Bike, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InAppToastContainer: React.FC = () => {
  const { inAppToasts, dismissToast, setActiveRole } = useApp();

  if (inAppToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {inAppToasts.map((toast) => {
        const isPrepared = toast.iconType === 'prepared';
        const isDelivered = toast.iconType === 'delivered';
        const isWay = toast.iconType === 'ontheway';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 flex items-start gap-3.5 ${
              isPrepared
                ? 'bg-orange-950/95 text-white border-orange-500/50 shadow-orange-900/30'
                : isDelivered
                ? 'bg-emerald-950/95 text-white border-emerald-500/50 shadow-emerald-900/30'
                : isWay
                ? 'bg-blue-950/95 text-white border-blue-500/50 shadow-blue-900/30'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-900/30'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isPrepared
                  ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white'
                  : isDelivered
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                  : isWay
                  ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {isPrepared && <ChefHat className="w-5 h-5 animate-bounce" />}
              {isDelivered && <PackageCheck className="w-5 h-5 animate-pulse" />}
              {isWay && <Bike className="w-5 h-5" />}
              {!isPrepared && !isDelivered && !isWay && <Sparkles className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-300">
                  Mandao Push Alert • {toast.timestamp}
                </span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-sm font-black text-white mt-0.5 leading-snug">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>

              <button
                onClick={() => {
                  setActiveRole('MAPA_VIVO');
                  dismissToast(toast.id);
                }}
                className="mt-2 text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
              >
                <span>Ver seguimiento en mapa en vivo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
