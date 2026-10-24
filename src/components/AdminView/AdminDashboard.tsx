import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Bike,
  Store,
  Star,
  Users,
  Percent,
  Calendar,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Download,
  Zap,
  Activity,
  AlertTriangle,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/pricing';
import { MandaoLogo } from '../MandaoLogo';
import { AdminAuthPanel } from './AdminAuthPanel';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    drivers,
    restaurants,
    bankConfig,
    triggerSampleDispatchOrder,
    setActiveRole,
    openDeveloperWhatsApp,
    developerWhatsApp,
    adminAccount,
    isAdminLoggedIn,
    logoutAdmin,
    setIsAdminAuthModalOpen,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'HOY' | '7DIAS' | 'MES'>('HOY');
  const [searchTerm, setSearchTerm] = useState('');

  // If not logged in as Admin, show the Web Admin Registration & Login Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-3xl p-4 text-xs text-amber-900 flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="block text-sm font-bold text-amber-950">
              Acceso Administrativo Web Protegido
            </strong>
            <span>
              Para visualizar las métricas clave de Mandao, pedidos en vivo, comisiones del 2% y
              calificaciones, regístrate o inicia sesión con tu cuenta de administrador.
            </span>
          </div>
        </div>
        <AdminAuthPanel />
      </div>
    );
  }

  // 1. Total daily orders calculations
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'ENTREGADO');
  const inTransitOrders = orders.filter((o) => o.status === 'EN_CAMINO');
  const inKitchenOrders = orders.filter((o) => ['EN_COCINA', 'LISTO_PARA_RECOGER'].includes(o.status));
  const activeDispatchOrders = orders.filter((o) => o.status === 'BUSCANDO_REPARTIDOR');

  // 2. Net Income (2% Platform Commission) calculations
  const totalGMVFood = orders.reduce((sum, o) => sum + o.calculations.foodSubtotal, 0);
  const totalDeliveryFees = orders.reduce((sum, o) => sum + o.calculations.deliverySubtotal, 0);
  const totalTips10Percent = orders.reduce((sum, o) => sum + o.calculations.mandatoryRiderTip, 0);
  // Net 2% commission earned by Mandao
  const totalNetMandaoCommission = orders.reduce((sum, o) => sum + o.calculations.appFee, 0);
  const totalGrossVolume = orders.reduce((sum, o) => sum + o.calculations.totalAmount, 0);

  // 3. Average ratings calculations
  const avgDriverRating =
    drivers.length > 0
      ? Math.round((drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length) * 100) / 100
      : 5.0;

  const avgRestaurantRating =
    restaurants.length > 0
      ? Math.round((restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length) * 100) / 100
      : 5.0;

  const totalReviewsCount = restaurants.reduce((sum, r) => sum + r.totalReviews, 0);
  const compliantDrivers = drivers.filter(
    (d) => d.soat.status === 'VIGENTE' && d.tecnomecanica.status === 'VIGENTE'
  );

  // Filtered orders table
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.driverName && o.driverName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Fecha,Restaurante,Cliente,Repartidor,SubtotalComida,Envio,Propina10,ComisionMandao2,Total,Estado\n';
    const rows = orders
      .map(
        (o) =>
          `${o.id},${o.createdAt.split('T')[0]},"${o.restaurantName}","${o.customerName}","${o.driverName || 'Sin asignar'}",${o.calculations.netFoodTotal},${o.calculations.deliverySubtotal},${o.calculations.mandatoryRiderTip},${o.calculations.appFee},${o.calculations.totalAmount},${o.status}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mandao_informe_financiero_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Verified Admin Identity Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20">
              👑
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
              title="Sesión Web Activa"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900">{adminAccount?.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                Super Administrador Mandao
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Acceso Web Autorizado
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {adminAccount?.email} • Tel: {adminAccount?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            title="Cambiar o actualizar cuenta de administrador"
          >
            Gestionar Perfil Admin
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
              PANEL ADMINISTRATIVO & BI
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Telemetría en Vivo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Control Financiero & Operativo • <span className="text-orange-500">Mandao</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitoreo en tiempo real de pedidos diarios, liquidación neta de comisiones (2%),
            reputación de repartidores y aliados gastronómicos.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs">
            {(['HOY', '7DIAS', 'MES'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  timeFilter === filter
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'HOY' && 'Hoy'}
                {filter === '7DIAS' && '7 Días'}
                {filter === 'MES' && 'Este Mes'}
              </button>
            ))}
          </div>

          <button
            onClick={triggerSampleDispatchOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all active:scale-95"
            title="Simular pedido para ver métricas en vivo"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">+ Simular Pedido</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="Exportar informe en CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 Metrics Cards requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pedidos Totales Diarios */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Pedidos Totales Hoy</span>
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
              <span>{totalOrdersCount}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% éxito
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-1">
              {completedOrders.length} entregados • {inTransitOrders.length} en camino
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tiempo promedio:</span>
            <strong className="text-slate-800 font-bold">24 min</strong>
          </div>
        </div>

        {/* Metric 2: Ingresos Netos Mandao (2% de comisión) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold">
              <span>Ingresos Netos Mandao (2%)</span>
              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-200" />
              </div>
            </div>

            <div className="text-3xl font-black mt-2">
              {formatCurrency(totalNetMandaoCommission)}
            </div>

            <p className="text-[11px] text-emerald-100 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Directo a tu cuenta bancaria
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs">
            <span className="text-emerald-100">En banco disponible:</span>
            <button
              onClick={() => setActiveRole('FINANZAS_APP')}
              className="font-bold underline hover:text-amber-200"
            >
              {formatCurrency(bankConfig.accumulatedBalance)}
            </button>
          </div>
        </div>

        {/* Metric 3: Calificación Promedio de Repartidores */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Calificación Repartidores</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 mt-2 flex items-center gap-1.5">
              <span>{avgDriverRating}</span>
              <div className="flex items-center text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>

            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {compliantDrivers.length} de {drivers.length} con SOAT al día
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Flota registrada:</span>
            <strong className="text-slate-800 font-bold">{drivers.length} conductores</strong>
          </div>
        </div>

        {/* Metric 4: Calificación Promedio de Restaurantes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Calificación Restaurantes</span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 mt-2 flex items-center gap-1.5">
              <span>{avgRestaurantRating}</span>
              <div className="flex items-center text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-1">
              Basado en {totalReviewsCount} reseñas verificadas
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aliados activos:</span>
            <strong className="text-slate-800 font-bold">{restaurants.length} restaurantes</strong>
          </div>
        </div>
      </div>

      {/* Secondary Financial Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transparent Financial Flow Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Flujo Financiero Transparente
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Métricas Hoy</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Volumen Bruto Transaccionado (GMV)</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(totalGrossVolume)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal Facturado en Alimentos</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalGMVFood)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Tarifas Totales de Domicilio</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalDeliveryFees)}</span>
            </div>

            {/* Rider 10% Mandatory Tip */}
            <div className="flex justify-between items-center p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
              <span className="font-bold flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" /> Propinas 10% (Repartidores)
              </span>
              <span className="font-black text-amber-700">{formatCurrency(totalTips10Percent)}</span>
            </div>

            {/* Mandao 2% Commission */}
            <div className="flex justify-between items-center p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
              <span className="font-bold flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Comisión Neta Mandao (2%)
              </span>
              <span className="font-black text-emerald-700">
                {formatCurrency(totalNetMandaoCommission)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveRole('FINANZAS_APP')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Administrar Cuenta Bancaria & Retiros</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Repartidores Performance Ranking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-500" />
              Desempeño de la Flota
            </h3>
            <button
              onClick={() => setActiveRole('SEGURIDAD_REPARTIDORES')}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Verificar SOAT
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {drivers.map((drv) => (
              <div key={drv.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={drv.avatar}
                    alt={drv.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900">{drv.name}</h5>
                    <p className="text-[10px] text-slate-500">
                      {drv.vehicle} • {drv.totalDeliveries} entregas
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{drv.rating}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      drv.soat.status === 'VIGENTE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    SOAT {drv.soat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurantes Performance Ranking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-500" />
              Restaurantes Aliados
            </h3>
            <button
              onClick={() => setActiveRole('RESTAURANTE')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Gestionar Menús
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {restaurants.map((rest) => (
              <div key={rest.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 truncate max-w-[140px]">{rest.name}</h5>
                    <p className="text-[10px] text-slate-500">{rest.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rest.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rest.totalReviews} opiniones
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Orders Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Auditoría y Registro de Pedidos Diarios ({filteredOrders.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seguimiento detallado de ingresos brutos, comisión del 2%, propina del 10% y estados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por ID, cliente, local o repartidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold">
                <th className="py-3 px-3">ID Pedido</th>
                <th className="py-3 px-3">Restaurante</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Repartidor</th>
                <th className="py-3 px-3">Comida Neta</th>
                <th className="py-3 px-3">10% Propina</th>
                <th className="py-3 px-3 text-emerald-700 bg-emerald-50/50">2% Mandao</th>
                <th className="py-3 px-3">Total Cobrado</th>
                <th className="py-3 px-3">Pago</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.id}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{ord.restaurantName}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    <div>{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {ord.driverName ? (
                      <span className="font-semibold text-slate-800">{ord.driverName}</span>
                    ) : (
                      <span className="text-amber-600 italic">Asignando...</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {formatCurrency(ord.calculations.netFoodTotal)}
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-700">
                    +{formatCurrency(ord.calculations.mandatoryRiderTip)}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-700 bg-emerald-50/30">
                    +{formatCurrency(ord.calculations.appFee)}
                  </td>
                  <td className="py-3 px-3 font-black text-slate-900">
                    {formatCurrency(ord.calculations.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.paymentMethod === 'DIGITAL'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        ord.status === 'ENTREGADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'EN_CAMINO'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
