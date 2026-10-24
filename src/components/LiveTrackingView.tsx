import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Bike,
  Store,
  Clock,
  Navigation,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Award,
  ChevronRight,
  TrendingUp,
  Receipt,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, TIER_CONFIG } from '../utils/pricing';

export const LiveTrackingView: React.FC = () => {
  const {
    activeOrder,
    updateOrderStatus,
    submitOrderReview,
    user,
    setActiveRole,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    rider?: L.Marker;
    restaurant?: L.Marker;
    customer?: L.Marker;
    routeLine?: L.Polyline;
  }>({});

  // Review states
  const [restRating, setRestRating] = useState<number>(5);
  const [driverRating, setDriverRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = activeOrder
        ? (activeOrder.driverCoords || activeOrder.restaurantCoords)
        : [6.209, -75.568];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Render Markers & Route if we have an active order
    if (activeOrder) {
      const restCoords = activeOrder.restaurantCoords;
      const custCoords = activeOrder.customerCoords;
      const riderCoords = activeOrder.driverCoords || restCoords;

      // Custom Restaurant Icon
      const restIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background: #ea580c; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(234,88,12,0.4); border: 2.5px solid white;">
            <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m-6 14V10m0 0V7m-6 4v10m12-10v10"></path>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Custom Customer Icon
      const custIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background: #10b981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.4); border: 2.5px solid white;">
            <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Custom Rider Icon with animated pulse
      const riderIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="position: relative;">
            <div style="position: absolute; top:-6px; left:-6px; width: 52px; height: 52px; border-radius: 50%; background: rgba(59, 130, 246, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #2563eb; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(37,99,235,0.5); border: 3px solid white; position: relative; z-index: 2;">
              <svg style="width: 22px; height: 22px; color: white;" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <circle cx="5.5" cy="17.5" r="3.5"></circle>
                <circle cx="18.5" cy="17.5" r="3.5"></circle>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h4"></path>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Clear previous markers
      if (markersRef.current.restaurant) markersRef.current.restaurant.remove();
      if (markersRef.current.customer) markersRef.current.customer.remove();
      if (markersRef.current.rider) markersRef.current.rider.remove();
      if (markersRef.current.routeLine) markersRef.current.routeLine.remove();

      // Add Restaurant Marker
      const restMarker = L.marker(restCoords, { icon: restIcon })
        .addTo(map)
        .bindPopup(`<strong>${activeOrder.restaurantName}</strong><br/>Recogida de pedido`);

      // Add Customer Marker
      const custMarker = L.marker(custCoords, { icon: custIcon })
        .addTo(map)
        .bindPopup(`<strong>Punto de Entrega</strong><br/>${activeOrder.customerAddress}`);

      // Add Rider Marker
      const riderMarker = L.marker(riderCoords, { icon: riderIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${activeOrder.driverName || 'Repartidor'}</strong><br/>En camino a entrega`
        );

      // Route line
      const routePoints: L.LatLngExpression[] = [restCoords, riderCoords, custCoords];
      const routeLine = L.polyline(routePoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      markersRef.current = {
        restaurant: restMarker,
        customer: custMarker,
        rider: riderMarker,
        routeLine,
      };

      // Fit bounds nicely
      const group = L.featureGroup([restMarker, custMarker, riderMarker]);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      // Don't destroy map on every render, just let leaflet keep DOM intact
    };
  }, [
    activeOrder?.id,
    activeOrder?.status,
    activeOrder?.driverCoords?.[0],
    activeOrder?.driverCoords?.[1],
  ]);

  // Handle Confetti celebration when delivered
  useEffect(() => {
    if (activeOrder?.status === 'ENTREGADO' && !hasCelebrated) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setHasCelebrated(true);
    }
  }, [activeOrder?.status, hasCelebrated]);

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
          <Navigation className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No hay ningún envío activo en curso</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
          Explora los restaurantes disponibles, agrega tus platillos favoritos y realiza un pedido
          para ver la ruta y el repartidor en tiempo real.
        </p>
        <button
          onClick={() => setActiveRole('CLIENTE')}
          className="mt-6 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20"
        >
          Ir al Menú de Restaurantes
        </button>
      </div>
    );
  }

  const isDelivered = activeOrder.status === 'ENTREGADO';
  const calculations = activeOrder.calculations;
  const tierInfo = TIER_CONFIG[user.tier];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden bg-slate-100">
      {/* Interactive Map View */}
      <div className="flex-1 h-1/2 md:h-full relative w-full">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Map Status Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isDelivered ? 'bg-emerald-400' : 'bg-blue-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isDelivered ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
            />
          </span>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estado del Envío en Vivo
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
              {activeOrder.status === 'BUSCANDO_REPARTIDOR' && 'Buscando repartidor cercano...'}
              {activeOrder.status === 'REPARTIDOR_ASIGNADO' && 'Repartidor asignado al pedido'}
              {activeOrder.status === 'EN_COCINA' && 'Restaurante preparando tu comida'}
              {activeOrder.status === 'LISTO_PARA_RECOGER' && 'Pedido listo en restaurante'}
              {activeOrder.status === 'EN_CAMINO' && 'Repartidor en camino a tu dirección'}
              {activeOrder.status === 'ENTREGADO' && '¡Pedido entregado con éxito!'}
            </span>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-6 left-4 z-20 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Restaurante
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Repartidor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tu Dirección
          </span>
        </div>
      </div>

      {/* Side Details & Telemetry Drawer */}
      <div className="w-full md:w-[440px] lg:w-[480px] h-1/2 md:h-full bg-white border-t md:border-t-0 md:border-l border-slate-200 z-20 flex flex-col overflow-y-auto shadow-xl">
        {/* Header Telemetry */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Pedido {activeOrder.id}</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Entrega Garantizada
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Tiempo Estimado de Llegada (ETA)
              </span>
              <div className="text-3xl font-black text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-400" />
                {isDelivered ? '¡Entregado!' : `${activeOrder.totalEstimatedMinutes} minutos`}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Distancia Total
              </span>
              <div className="text-xl font-bold text-amber-300">
                {calculations.distanceKm} km
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
            <div
              className={`py-1 rounded-md transition-all ${
                activeOrder.status !== 'BUSCANDO_REPARTIDOR'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-300 animate-pulse'
              }`}
            >
              Confirmado
            </div>
            <div
              className={`py-1 rounded-md transition-all ${
                ['EN_COCINA', 'LISTO_PARA_RECOGER', 'EN_CAMINO', 'ENTREGADO'].includes(
                  activeOrder.status
                )
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              En Cocina
            </div>
            <div
              className={`py-1 rounded-md transition-all ${
                ['EN_CAMINO', 'ENTREGADO'].includes(activeOrder.status)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              En Camino
            </div>
            <div
              className={`py-1 rounded-md transition-all ${
                activeOrder.status === 'ENTREGADO'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              Entregado
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 flex-1">
          {/* Driver Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={
                  activeOrder.driverAvatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt="Repartidor"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {activeOrder.driverName || 'Carlos Restrepo'}
                  </h4>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {activeOrder.driverRating || 4.96}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {activeOrder.driverVehicle || 'Moto Yamaha FZ'} • Placa{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {activeOrder.driverPlate || 'KLU-42F'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeOrder.driverPhone || '+573015559210'}`}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 shadow-xs transition-colors"
                title="Llamar al repartidor"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Restaurant & Destination Details */}
          <div className="space-y-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Store className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">{activeOrder.restaurantName}</span>
                <span className="text-slate-500">{activeOrder.restaurantAddress}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 my-1" />
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">{activeOrder.customerAddress}</span>
                {activeOrder.customerNotes && (
                  <span className="text-slate-500 italic">"{activeOrder.customerNotes}"</span>
                )}
              </div>
            </div>
          </div>

          {/* Items in order */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Platos del Pedido
            </h5>
            <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl p-3">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-orange-600">{item.quantity}x</span>
                    <span className="font-medium text-slate-800">{item.menuItem.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.menuItem.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Financial Pricing Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700 pb-1.5 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-500" />
                Desglose Financiero Transparente
              </span>
              <span className="text-slate-500 uppercase text-[10px]">
                Pago: {activeOrder.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal de Comida</span>
              <span>{formatCurrency(calculations.foodSubtotal)}</span>
            </div>

            {calculations.promotionDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento Promoción Restaurante</span>
                <span>-{formatCurrency(calculations.promotionDiscount)}</span>
              </div>
            )}

            {calculations.loyaltyDiscount > 0 && (
              <div className="flex justify-between text-purple-600 font-semibold">
                <span>Descuento Club ({tierInfo.name.split(' ')[0]})</span>
                <span>-{formatCurrency(calculations.loyaltyDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>
                Tarifa de Envío ({calculations.distanceKm} km + espera)
              </span>
              <span>{formatCurrency(calculations.deliverySubtotal)}</span>
            </div>

            {/* The 10% mandatory tip required by prompt */}
            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">
                ⭐ 10% Propina Obligatoria Repartidor
              </span>
              <span>+{formatCurrency(calculations.mandatoryRiderTip)}</span>
            </div>

            {/* The 2% app fee required by prompt */}
            <div className="flex justify-between text-slate-500 bg-slate-100/70 px-2 py-1 rounded-lg text-[11px]">
              <span>Comisión de Plataforma Mandao (2%)</span>
              <span>+{formatCurrency(calculations.appFee)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Pagado</span>
              <span className="text-orange-600">{formatCurrency(calculations.totalAmount)}</span>
            </div>
          </div>

          {/* Quick Simulation Controls to advance stages */}
          {!isDelivered && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                ⚡ Control Rápido de Simulación
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeOrder.status === 'EN_CAMINO' ? (
                  <button
                    onClick={() => updateOrderStatus(activeOrder.id, 'ENTREGADO')}
                    className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Marcar como Entregado Ahora
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'EN_COCINA')}
                      className="py-1.5 px-2 bg-white border border-amber-300 font-semibold text-slate-700 rounded-lg"
                    >
                      En Cocina
                    </button>
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'EN_CAMINO')}
                      className="py-1.5 px-2 bg-blue-600 text-white font-bold rounded-lg"
                    >
                      En Camino
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Rating Modal / Box once Delivered */}
          {isDelivered && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="text-center">
                <span className="text-3xl">🎉</span>
                <h4 className="font-extrabold text-slate-900 text-lg mt-1">
                  ¡Tu pedido ha llegado!
                </h4>
                <p className="text-xs text-slate-600">
                  Califica tu experiencia para ganar puntos de lealtad y subir a tu siguiente nivel
                  VIP.
                </p>
              </div>

              {/* Rate Restaurant */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Comida & Restaurante ({activeOrder.restaurantName})
                  </span>
                  <span className="text-xs font-black text-amber-500">{restRating} ★</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRestRating(star)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= restRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Driver */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Servicio del Repartidor ({activeOrder.driverName || 'Carlos'})
                  </span>
                  <span className="text-xs font-black text-amber-500">{driverRating} ★</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDriverRating(star)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= driverRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {activeOrder.reviewSubmitted ? (
                <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ¡Calificación guardada! Ganaste +50 puntos en tu Club VIP.
                </div>
              ) : (
                <button
                  onClick={() => {
                    submitOrderReview(activeOrder.id, restRating, driverRating, reviewComment);
                    confetti({ particleCount: 50 });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-98 text-sm"
                >
                  Enviar Calificación y Sumar Puntos
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
