import React from 'react';
import {
  Award,
  Star,
  Gift,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TIER_CONFIG } from '../utils/pricing';
import { UserTier } from '../types';

interface LoyaltyClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyClubModal: React.FC<LoyaltyClubModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();

  if (!isOpen) return null;

  const currentTier: UserTier = user.tier;
  const currentTierInfo = TIER_CONFIG[currentTier];

  const tiers: UserTier[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

  const getNextTier = (tier: UserTier): { next: UserTier | null; ordersNeeded: number } => {
    if (tier === 'BRONZE') return { next: 'SILVER', ordersNeeded: Math.max(0, 5 - user.totalOrders) };
    if (tier === 'SILVER') return { next: 'GOLD', ordersNeeded: Math.max(0, 15 - user.totalOrders) };
    if (tier === 'GOLD') return { next: 'DIAMOND', ordersNeeded: Math.max(0, 30 - user.totalOrders) };
    return { next: null, ordersNeeded: 0 };
  };

  const nextTierData: { next: UserTier | null; ordersNeeded: number } = getNextTier(currentTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with background decoration */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider">
                Club de Beneficios y Lealtad
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Mandao VIP Rewards
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5">
          {/* User Score Card */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-100">Nivel Actual</span>
                <h4 className="text-2xl font-black">{currentTierInfo.name}</h4>
                <p className="text-xs text-amber-100 mt-0.5">
                  Descuento actual:{' '}
                  <strong className="text-white underline">
                    {currentTierInfo.discountPercent}% OFF en cada pedido
                  </strong>
                </p>
              </div>

              {/* Customer Rating */}
              <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">
                  Calificación Cliente
                </span>
                <div className="flex items-center justify-center gap-1 text-lg font-black mt-0.5">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{user.rating.toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-amber-100 font-medium">Excelente</span>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs font-bold text-amber-100 mb-1.5">
                <span>Total de pedidos realizados: {user.totalOrders}</span>
                {nextTierData.next ? (
                  <span>
                    Faltan {nextTierData.ordersNeeded} pedidos para{' '}
                    {TIER_CONFIG[nextTierData.next].name.split(' ')[0]}
                  </span>
                ) : (
                  <span>¡Has alcanzado el nivel máximo VIP!</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (user.totalOrders / (nextTierData.next ? TIER_CONFIG[nextTierData.next].minOrders : 30)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* How it works explanation */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-1.5">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              ¿Cómo funciona el Sistema de Calificación y Lealtad?
            </h5>
            <p className="text-slate-600 leading-relaxed">
              Entre más pedidos realizas y mejor calificación recibes por parte de los repartidores
              (por puntualidad y trato amable), subes de nivel y desbloqueas descuentos automáticos
              del <strong>5%, 10% y hasta el 15% OFF</strong> que se aplican automáticamente en tu
              canasta.
            </p>
          </div>

          {/* Tiers List */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Niveles y Beneficios Exclusivos
            </h5>

            <div className="space-y-2">
              {tiers.map((t: UserTier) => {
                const info = TIER_CONFIG[t];
                const isCurrent = t === currentTier;

                return (
                  <div
                    key={t}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-black ${info.badgeBg}`}>
                          {info.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Tu Nivel Actual
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black text-slate-900">
                        {info.discountPercent > 0 ? `${info.discountPercent}% OFF` : 'Acceso Estándar'}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {info.benefits.map((b: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-slate-600 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
          >
            Entendido, seguir disfrutando de mis beneficios
          </button>
        </div>
      </div>
    </div>
  );
};
