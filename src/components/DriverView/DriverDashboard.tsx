import React from 'react';
import {
  Bike,
  DollarSign,
  TrendingUp,
  Star,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Banknote,
  CreditCard,
  Percent,
  Navigation,
  Power,
  Zap,
  User,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Bell,
  BellRing,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, TIER_CONFIG } from '../../utils/pricing';

export const DriverDashboard: React.FC = () => {
  const {
    currentDriver,
    drivers,
    selectActiveDriver,
    toggleDriverOnline,
    orders,
    activeOrder,
    updateOrderStatus,
    triggerSampleDispatchOrder,
    setActiveRole,
    browserNotificationPermission,
    requestNotificationPermission,
  } = useApp();

  const driverOrders = orders.filter((o) => o.assignedDriverId === currentDriver.id);
  const currentAssignedOrder = orders.find(
    (o) => o.assignedDriverId === currentDriver.id && o.status !== 'ENTREGADO' && o.status !== 'CANCELADO'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Driver Profile Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentDriver.avatar}
              alt={currentDriver.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                currentDriver.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">{currentDriver.name}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {currentDriver.rating}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {currentDriver.vehicle} • {currentDriver.plate}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tablero de Control del Repartidor • {currentDriver.totalDeliveries} domicilios
              realizados
            </p>
          </div>
        </div>

        {/* Availability Toggle & Switch Driver */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Driver profile select */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            {drivers.map((drv) => (
              <button
                key={drv.id}
                onClick={() => selectActiveDriver(drv.id)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                  drv.id === currentDriver.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {drv.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Online Toggle Button */}
          <button
            onClick={() => toggleDriverOnline(currentDriver.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shadow-xs ${
              currentDriver.isAvailable
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{currentDriver.isAvailable ? 'EN LÍNEA (RECIBIENDO)' : 'DESCONECTADO'}</span>
          </button>

          {/* Trigger Dispatch simulation */}
          <button
            onClick={triggerSampleDispatchOrder}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-500/20"
            title="Simular pedido entrante para probar el sistema de aceptación y rechazo"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Simular Pedido</span>
          </button>
        </div>
      </div>

      {/* Browser Push Notifications Banner for Background Tab Alerts */}
      <div
        className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          browserNotificationPermission === 'granted'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              browserNotificationPermission === 'granted'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-200 text-amber-800'
            }`}
          >
            {browserNotificationPermission === 'granted' ? (
              <BellRing className="w-5 h-5 animate-bounce" />
            ) : (
              <Bell className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm">
                {browserNotificationPermission === 'granted'
                  ? 'Notificaciones de Pedidos en Segundo Plano: ACTIVAS ✓'
                  : 'Activa las Notificaciones Push para Alertas en Segundo Plano'}
              </h4>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {browserNotificationPermission === 'granted'
                ? 'Recibirás avisos sonoros e interactivos en tu pantalla aunque tengas la app en otra pestaña o minimizada.'
                : 'Permite que el navegador te avise con sonido y ventana emergente inmediata cada vez que entre un nuevo pedido.'}
            </p>
          </div>
        </div>

        {browserNotificationPermission !== 'granted' && (
          <button
            onClick={() => requestNotificationPermission()}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 whitespace-nowrap transition-transform active:scale-95"
          >
            Permitir Notificaciones Ahora
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ganancias de Hoy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(currentDriver.earningsToday)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Pago garantizado en tu cuenta
          </p>
        </div>

        {/* Mandatory Tips (10% guaranteed) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Propinas 10% Obligatorias</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {formatCurrency(currentDriver.tipsEarnedToday)}
          </div>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">
            100% de la propina es tuya
          </p>
        </div>

        {/* Deliveries Today */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Entregas Completadas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {currentDriver.totalDeliveries}
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            99.4% entregados a tiempo
          </p>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tu Calificación Promedio</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-2 flex items-center gap-1.5">
            <span>{currentDriver.rating}</span>
            <span className="text-sm text-slate-400 font-bold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            Nivel Repartidor Élite Mandao
          </p>
        </div>
      </div>

      {/* Active Service In Progress Card */}
      {currentAssignedOrder ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white">
                  SERVICIO EN CURSO
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {currentAssignedOrder.id}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">
                {currentAssignedOrder.status === 'EN_COCINA'
                  ? 'Esperando preparación en restaurante'
                  : 'En trayecto hacia el destino'}
              </h3>
            </div>

            {/* Price to earn & payment method */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Tu ganancia neta
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatCurrency(currentAssignedOrder.calculations.driverEarnings)}
                </span>
              </div>

              <div
                className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                  currentAssignedOrder.paymentMethod === 'EFECTIVO'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-slate-700 text-emerald-300'
                }`}
              >
                {currentAssignedOrder.paymentMethod === 'EFECTIVO' ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Cobrar: {formatCurrency(currentAssignedOrder.calculations.totalAmount)}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pago Digital (No Cobrar)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase">
                <MapPin className="w-4 h-4" /> 1. Recogida (Restaurante)
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                {currentAssignedOrder.restaurantName}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentAssignedOrder.restaurantAddress}
              </p>
              <div className="mt-2 text-xs text-slate-400">
                Espera aproximada: <strong>~{currentAssignedOrder.restaurantPrepMinutes} min</strong>
              </div>
            </div>

            {/* Dropoff */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                <Navigation className="w-4 h-4" /> 2. Entrega (Cliente)
              </div>
              <div className="flex items-center justify-between mt-1">
                <h4 className="text-base font-bold text-white">
                  {currentAssignedOrder.customerName}
                </h4>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {currentAssignedOrder.customerRating.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentAssignedOrder.customerAddress}
              </p>
              {currentAssignedOrder.customerNotes && (
                <p className="text-xs text-amber-200 bg-amber-950/40 border border-amber-800/50 p-2 rounded-xl mt-2">
                  📌 {currentAssignedOrder.customerNotes}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Progression Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setActiveRole('MAPA_VIVO')}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-purple-400" />
              <span>Ver Navegación GPS en Mapa</span>
            </button>

            <div className="flex items-center gap-2">
              {currentAssignedOrder.status === 'EN_COCINA' && (
                <button
                  onClick={() => updateOrderStatus(currentAssignedOrder.id, 'EN_CAMINO')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-transform active:scale-95"
                >
                  Pedido Recogido • Ir a Destino
                </button>
              )}

              {currentAssignedOrder.status === 'EN_CAMINO' && (
                <button
                  onClick={() => updateOrderStatus(currentAssignedOrder.id, 'ENTREGADO')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completar Entrega al Cliente</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Bike className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {currentDriver.isAvailable
              ? 'Esperando el siguiente servicio...'
              : 'Estás Desconectado'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {currentDriver.isAvailable
              ? 'Cuando un cliente confirme un pedido cercano, recibirás una alerta push instantánea con la ganancia neta, propina del 10% y puntos de recogida.'
              : 'Activa tu estado "En Línea" para empezar a recibir alertas de domicilios cercanos.'}
          </p>
          <div className="pt-2">
            <button
              onClick={triggerSampleDispatchOrder}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md shadow-orange-600/20"
            >
              Simular Pedido de Prueba Ahora
            </button>
          </div>
        </div>
      )}

      {/* Driver Deliveries History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Historial de Servicios Recientes
        </h3>

        {driverOrders.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Aún no has completado servicios hoy.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {driverOrders.map((ord) => (
              <div
                key={ord.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{ord.restaurantName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'ENTREGADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Cliente: <strong>{ord.customerName}</strong> • {ord.customerAddress}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Ganado</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {formatCurrency(ord.calculations.driverEarnings)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Propina (10%)
                    </span>
                    <span className="font-bold text-amber-600">
                      {formatCurrency(ord.calculations.mandatoryRiderTip)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
