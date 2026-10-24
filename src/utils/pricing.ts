import { OrderCalculations, UserTier } from '../types';

/**
 * Calculates the great circle distance in km between two [latitude, longitude] pairs.
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.max(0.8, Math.round(d * 10) / 10);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const TIER_CONFIG: Record<
  UserTier,
  {
    name: string;
    minOrders: number;
    discountPercent: number;
    color: string;
    badgeBg: string;
    benefits: string[];
  }
> = {
  BRONZE: {
    name: 'Bronce Inicial',
    minOrders: 0,
    discountPercent: 0,
    color: 'text-amber-700 border-amber-300 bg-amber-50',
    badgeBg: 'bg-amber-100 text-amber-800',
    benefits: ['Acceso a promociones estándar', 'Calificación de perfil visible'],
  },
  SILVER: {
    name: 'Plata Frecuente',
    minOrders: 5,
    discountPercent: 5,
    color: 'text-slate-600 border-slate-300 bg-slate-50',
    badgeBg: 'bg-slate-200 text-slate-800',
    benefits: ['5% OFF exclusivo en todos los pedidos', 'Soporte prioritario', 'Insignia de Cliente de Confianza'],
  },
  GOLD: {
    name: 'Oro Gourmet',
    minOrders: 15,
    discountPercent: 10,
    color: 'text-amber-600 border-amber-400 bg-amber-50',
    badgeBg: 'bg-amber-400 text-amber-950',
    benefits: ['10% OFF en todos los restaurantes', 'Despacho prioritario al repartidor más cercano', 'Cupones 2x1 sorpresa'],
  },
  DIAMOND: {
    name: 'Diamante VIP',
    minOrders: 30,
    discountPercent: 15,
    color: 'text-purple-600 border-purple-400 bg-purple-50',
    badgeBg: 'bg-purple-600 text-white',
    benefits: ['15% OFF ilimitado', 'Tarifa de domicilio reducida', 'Atención ejecutiva 24/7', 'Eventos de degustación'],
  },
};

/**
 * Calculates complete pricing breakdown based on:
 * - Food subtotal and active discounts
 * - Distance traveled (km)
 * - Waiting time at restaurant (minutes) and travel time
 * - 10% Mandatory driver tip ("los repartidores van a ganar el 10% de propinas obligatorias por domicilio")
 * - 2% Platform commission ("la app se queda con el 2% de ganancias de cada domicilio")
 */
export function calculateOrderPrice(params: {
  foodSubtotal: number;
  promoDiscountPercent: number;
  userTier: UserTier;
  distanceKm: number;
  restaurantPrepMinutes: number;
}): OrderCalculations {
  const { foodSubtotal, promoDiscountPercent, userTier, distanceKm, restaurantPrepMinutes } = params;

  // 1. Discounts
  const promotionDiscount = Math.round(foodSubtotal * (promoDiscountPercent / 100));
  const loyaltyDiscountPercent = TIER_CONFIG[userTier].discountPercent;
  const loyaltyDiscount = Math.round((foodSubtotal - promotionDiscount) * (loyaltyDiscountPercent / 100));
  const netFoodTotal = Math.max(0, foodSubtotal - promotionDiscount - loyaltyDiscount);

  // 2. Base distance pricing formula:
  // Base fixed flag-drop: $2,500 COP (or 2.50 USD equivalent, formatted with standard currency)
  // Distance rate: $1,200 per km
  // Time wait rate at restaurant: $120 per minute of estimated wait
  const baseFare = 2800;
  const distanceFare = Math.round(distanceKm * 1400);
  const waitTimeFare = Math.round(restaurantPrepMinutes * 110);
  const deliverySubtotal = baseFare + distanceFare + waitTimeFare;

  // 3. Mandatory 10% driver tip on the delivery service
  const mandatoryRiderTip = Math.round(deliverySubtotal * 0.10);

  // 4. Platform 2% commission from the delivery fee
  const appFee = Math.round(deliverySubtotal * 0.02);

  // Total customer payment
  const totalAmount = netFoodTotal + deliverySubtotal + mandatoryRiderTip + appFee;

  // Driver net earnings: delivery fare + 100% of the 10% mandatory tip
  const driverEarnings = deliverySubtotal + mandatoryRiderTip;

  return {
    foodSubtotal,
    promotionDiscount,
    loyaltyDiscount,
    netFoodTotal,
    distanceKm,
    distanceFare,
    waitTimeFare,
    deliverySubtotal,
    mandatoryRiderTip,
    appFee,
    totalAmount,
    driverEarnings,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
