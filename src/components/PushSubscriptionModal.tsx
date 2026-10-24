import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  ChefHat,
  PackageCheck,
  Bike,
  Sparkles,
  ShieldCheck,
  Info,
  Radio,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MandaoLogo } from './MandaoLogo';

export const PushSubscriptionModal: React.FC = () => {
  const {
    isPushModalOpen,
    setIsPushModalOpen,
    pushPreferences,
    updatePushPreferences,
    togglePushSubscription,
    browserNotificationPermission,
    requestNotificationPermission,
    sendTestPush,
  } = useApp();

  const [testSent, setTestSent] = useState<string | null>(null);

  if (!isPushModalOpen) return null;

  const handleTest = (type: 'PREPARADO' | 'ENTREGADO' | 'EN_CAMINO') => {
    sendTestPush(type);
    setTestSent(type);
    setTimeout(() => setTestSent(null), 3000);
  };

  const isSubscribed = pushPreferences.enabled && browserNotificationPermission === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Mandao Branding */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white p-5 sm:p-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-2.5 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BellRing className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400">
                  Servicio de Notificaciones Push
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Alertas Personalizadas en Vivo
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsPushModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 max-w-md">
            Recibe avisos al instante en tu navegador cuando tu pedido cambie de estado, incluso si la pestaña está en segundo plano o el celular bloqueado.
          </p>

          {/* Subscription Status Chip */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isSubscribed
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              }`}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Suscripción Push Activa</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-ping" />
                  <span>Push Inactivo o Requiere Permiso</span>
                </>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              Permiso navegador: <strong className="text-white uppercase">{browserNotificationPermission}</strong>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Master Switch Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-extrabold text-slate-900 block">
                Activar Suscripción a Notificaciones Push
              </span>
              <p className="text-xs text-slate-500">
                Habilita el envío de notificaciones del sistema operativo en este dispositivo.
              </p>
            </div>

            <button
              onClick={() => togglePushSubscription()}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                pushPreferences.enabled ? 'bg-orange-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  pushPreferences.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {browserNotificationPermission !== 'granted' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <span className="font-bold block">Tu navegador necesita tu autorización</span>
                  <span>Debes presionar "Permitir" en la ventana de tu navegador para recibir los avisos.</span>
                </div>
              </div>

              <button
                onClick={() => requestNotificationPermission()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 text-center"
              >
                Solicitar Permiso Push
              </button>
            </div>
          )}

          {/* Granular Preferences per Order Stage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Personalizar Alertas por Estado del Pedido
              </h4>
              <span className="text-[11px] font-bold text-orange-600">Elige cuándo avisarte</span>
            </div>

            <div className="space-y-2.5">
              {/* Pedido Preparado (Highlighted) */}
              <div
                onClick={() =>
                  updatePushPreferences({ notifyOrderPrepared: !pushPreferences.notifyOrderPrepared })
                }
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  pushPreferences.notifyOrderPrepared
                    ? 'bg-orange-50/70 border-orange-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        Pedido preparado
                      </span>
                      <span className="text-[10px] bg-orange-600 text-white font-black px-1.5 py-0.2 rounded-md">
                        DESTACADO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Alerta al instante cuando la cocina finaliza y empaca tu comida.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={pushPreferences.notifyOrderPrepared}
                  onChange={() => {}}
                  className="w-4 h-4 text-orange-600 rounded-md border-slate-300 focus:ring-orange-500 pointer-events-none"
                />
              </div>

              {/* Pedido Entregado (Highlighted) */}
              <div
                onClick={() =>
                  updatePushPreferences({ notifyOrderDelivered: !pushPreferences.notifyOrderDelivered })
                }
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  pushPreferences.notifyOrderDelivered
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        Pedido entregado
                      </span>
                      <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-md">
                        DESTACADO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Confirmación cuando el repartidor entrega la orden en tu puerta.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={pushPreferences.notifyOrderDelivered}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 pointer-events-none"
                />
              </div>

              {/* Pedido En Camino */}
              <div
                onClick={() =>
                  updatePushPreferences({ notifyOrderOnTheWay: !pushPreferences.notifyOrderOnTheWay })
                }
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  pushPreferences.notifyOrderOnTheWay
                    ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      Pedido en camino
                    </span>
                    <p className="text-xs text-slate-500">
                      Aviso de salida con el nombre del repartidor y tiempo estimado de llegada.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={pushPreferences.notifyOrderOnTheWay}
                  onChange={() => {}}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 pointer-events-none"
                />
              </div>

              {/* Repartidor Asignado */}
              <div
                onClick={() =>
                  updatePushPreferences({ notifyDriverAssigned: !pushPreferences.notifyDriverAssigned })
                }
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  pushPreferences.notifyDriverAssigned
                    ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      Repartidor asignado
                    </span>
                    <p className="text-xs text-slate-500">
                      Aviso con el vehículo, placa y calificación del domiciliario.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={pushPreferences.notifyDriverAssigned}
                  onChange={() => {}}
                  className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Sound & Haptic Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => updatePushPreferences({ soundEnabled: !pushPreferences.soundEnabled })}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                pushPreferences.soundEnabled ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {pushPreferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-orange-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Sonido de timbre</span>
                  <span className="text-[11px] text-slate-500">Tonos acordes armónicos</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushPreferences.soundEnabled}
                onChange={() => {}}
                className="w-4 h-4 text-orange-600 rounded pointer-events-none"
              />
            </div>

            <div
              onClick={() => updatePushPreferences({ vibrateEnabled: !pushPreferences.vibrateEnabled })}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                pushPreferences.vibrateEnabled ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Vibración táctil</span>
                  <span className="text-[11px] text-slate-500">Patrones hápticos en móvil</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushPreferences.vibrateEnabled}
                onChange={() => {}}
                className="w-4 h-4 text-emerald-600 rounded pointer-events-none"
              />
            </div>
          </div>

          {/* Interactive Test Notifications Simulator */}
          <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400" /> Probar Alertas Push en Vivo
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Haz clic para emitir una notificación real del sistema en tu navegador.
                </p>
              </div>

              {testSent && (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  ¡Notificación emitida!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleTest('PREPARADO')}
                className="py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Pedido Preparado</span>
              </button>

              <button
                onClick={() => handleTest('ENTREGADO')}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Entregado</span>
              </button>

              <button
                onClick={() => handleTest('EN_CAMINO')}
                className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>En Camino</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sin spam. Solo alertas directas de tus pedidos Mandao.</span>
          </div>

          <button
            onClick={() => setIsPushModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Listo / Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
