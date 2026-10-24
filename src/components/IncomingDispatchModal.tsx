import React, { useEffect, useState } from 'react';
import {
  Bell,
  MapPin,
  Store,
  User,
  Star,
  Clock,
  DollarSign,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation,
  ShieldCheck,
  Banknote,
  CreditCard,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, TIER_CONFIG } from '../utils/pricing';

export const IncomingDispatchModal: React.FC = () => {
  const {
    incomingDispatch,
    acceptDispatchService,
    rejectDispatchService,
    currentDriver,
  } = useApp();

  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!incomingDispatch) {
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-reject if expires
          rejectDispatchService(incomingDispatch.id);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingDispatch, rejectDispatchService]);

  if (!incomingDispatch) return null;

  const order = incomingDispatch;
  const calculations = order.calculations;
  const isCash = order.paymentMethod === 'EFECTIVO';
  const tierInfo = TIER_CONFIG[order.customerTier || 'BRONZE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Radar / Alert Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 px-6 py-4 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                  🛵 ¡Nuevo Mandao Entrante!
                </span>
                <span className="text-xs font-mono font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  {countdown}s
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight mt-0.5">
                Despacho prioritario al repartidor Mandao
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-orange-200 font-medium block uppercase tracking-wider">
              Repartidor
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[110px] block">
              {currentDriver.name}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Price to Earn Highlight (The most critical information for the driver!) */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Ganancia Total a Ganar
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                {formatCurrency(calculations.driverEarnings)}
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5 flex items-center gap-1.5 font-medium">
                <span className="bg-emerald-400/30 px-1.5 py-0.5 rounded-md font-bold">
                  Tarifa: {formatCurrency(calculations.deliverySubtotal)}
                </span>
                <span>+</span>
                <span className="bg-amber-300 text-amber-950 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5">
                  <Percent className="w-2.5 h-2.5" /> 10% Propina: {formatCurrency(calculations.mandatoryRiderTip)}
                </span>
              </p>
            </div>

            {/* Payment Method Badge */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block mb-1">
                Método de Cobro
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs ${
                  isCash
                    ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                    : 'bg-white text-emerald-800'
                }`}
              >
                {isCash ? (
                  <>
                    <Banknote className="w-4 h-4 text-emerald-800" />
                    <span>EFECTIVO</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>PAGO DIGITAL</span>
                  </>
                )}
              </div>
              {isCash ? (
                <p className="text-[10px] text-amber-100 font-semibold mt-1">
                  Cobrar al cliente: {formatCurrency(calculations.totalAmount)}
                </p>
              ) : (
                <p className="text-[10px] text-emerald-100 font-semibold mt-1">
                  Ya pagado en app (No cobrar)
                </p>
              )}
            </div>
          </div>

          {/* Route Section: Pick up -> Drop off */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-orange-500" /> Distancia:{' '}
                <strong className="text-slate-800">{calculations.distanceKm} km</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Tiempo estimado:{' '}
                <strong className="text-slate-800">{order.totalEstimatedMinutes} min</strong>
              </span>
            </div>

            {/* Step 1: Restaurant Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                    Punto de Recogida (Restaurante)
                  </span>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold">
                    Espera: ~{order.restaurantPrepMinutes} min
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {order.restaurantName}
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {order.restaurantAddress}
                </p>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-4 border-l-2 border-dashed border-slate-300 h-4" />

            {/* Step 2: Customer Delivery */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                  Punto de Entrega (Cliente)
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {order.customerAddress}
                </h4>
                {order.customerNotes && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 p-2 rounded-xl mt-1.5 font-medium">
                    📌 <em>Nota:</em> "{order.customerNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer History & Contact Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Perfil e Historial del Usuario
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {order.customerName}
                    </h5>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tierInfo.badgeBg}`}
                    >
                      {tierInfo.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {order.customerRating.toFixed(2)} / 5.0
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {order.customerOrdersCount} pedidos anteriores
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct phone badge */}
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 shadow-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Llamar</span>
              </a>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cliente verificado con historial de propinas puntuales</span>
            </div>
          </div>
        </div>

        {/* Footer Actions: Big Clear Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
          <button
            onClick={() => rejectDispatchService(order.id)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white hover:bg-red-50 text-red-600 font-bold border border-red-200 hover:border-red-300 transition-all active:scale-98 shadow-xs text-sm"
          >
            <XCircle className="w-5 h-5 text-red-500" />
            <span>Rechazar Servicio</span>
          </button>

          <button
            onClick={() => acceptDispatchService(order.id)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-all active:scale-98 shadow-lg shadow-emerald-600/25 text-sm"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Aceptar Servicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
