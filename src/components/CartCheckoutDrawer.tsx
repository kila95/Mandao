import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  MapPin,
  Clock,
  Navigation,
  Banknote,
  CreditCard,
  Percent,
  Receipt,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm, calculateOrderPrice, formatCurrency, TIER_CONFIG } from '../utils/pricing';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartRestaurant,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    user,
    selectedAddressId,
    setSelectedAddressId,
    checkoutOrder,
    setActiveRole,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'DIGITAL' | 'EFECTIVO'>('DIGITAL');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentAddress =
    user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];

  const foodSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // If empty cart
  if (!cartRestaurant || cart.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
        <div className="w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg">Tu Canasta Mandao</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕ Cerrar
            </button>
          </div>

          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Tu canasta está vacía</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Agrega deliciosos platillos de nuestros restaurantes aliados para continuar con el
              pedido.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs hover:bg-slate-800"
          >
            Explorar Restaurantes
          </button>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const distanceKm = calculateDistanceKm(cartRestaurant.coords, currentAddress.coords);
  const activePromo = cartRestaurant.promotions.find(
    (p) => p.active && foodSubtotal >= p.minSpend
  );
  const promoPercent = activePromo ? activePromo.discountPercent : 0;

  const calculations = calculateOrderPrice({
    foodSubtotal,
    promoDiscountPercent: promoPercent,
    userTier: user.tier,
    distanceKm,
    restaurantPrepMinutes: cartRestaurant.averagePrepMinutes,
  });

  const tierInfo = TIER_CONFIG[user.tier];

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    try {
      checkoutOrder(paymentMethod, deliveryNotes);
      onClose();
      // Switch view to live map tracking so user immediately sees real-time dispatch!
      setActiveRole('MAPA_VIVO');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Resumen y Pago del Pedido
              </h3>
            </div>
            <p className="text-xs text-orange-600 font-bold mt-0.5">
              Restaurante: {cartRestaurant.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Items & Calculations */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Platos Seleccionados ({cart.length})
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Vaciar
              </button>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-1">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <h5 className="font-bold text-slate-900">{item.menuItem.name}</h5>
                    <span className="text-slate-500 font-medium">
                      {formatCurrency(item.menuItem.price)} c/u
                    </span>
                    {item.itemNotes && (
                      <p className="text-[11px] text-amber-700 italic">"{item.itemNotes}"</p>
                    )}
                  </div>

                  {/* Quantity adjuster */}
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                      className="text-slate-600 font-bold hover:text-slate-900 px-1"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                      className="text-slate-600 font-bold hover:text-slate-900 px-1"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-extrabold text-slate-900 text-right ml-3 w-16">
                    {formatCurrency(item.menuItem.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Selector */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Dirección de Entrega
            </span>
            <div className="grid grid-cols-2 gap-2">
              {user.addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-orange-500 bg-white ring-2 ring-orange-200 font-bold'
                      : 'border-slate-200 bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  <span className="block text-slate-900 font-bold truncate">{addr.label}</span>
                  <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                    {addr.address}
                  </span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Instrucciones adicionales (ej. Dejar en portería)..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Método de Pago Integrado
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('DIGITAL')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'DIGITAL'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span>Pago Digital</span>
                  <span className="text-[10px] text-slate-500 font-normal block">
                    Tarjeta / Billetera
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-600" />
                <div className="text-left">
                  <span>Efectivo</span>
                  <span className="text-[10px] text-slate-500 font-normal block">
                    Contra entrega
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Transparent Calculation Breakdown */}
          <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 rounded-2xl border border-orange-200/80 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-orange-200/60">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-orange-600" />
                Cálculo Transparente del Domicilio
              </span>
              <span className="text-[10px] text-slate-500">
                {distanceKm} km • ~{cartRestaurant.averagePrepMinutes} min espera
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal de Comida</span>
              <span>{formatCurrency(calculations.foodSubtotal)}</span>
            </div>

            {calculations.promotionDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento Promoción ({activePromo?.code})</span>
                <span>-{formatCurrency(calculations.promotionDiscount)}</span>
              </div>
            )}

            {calculations.loyaltyDiscount > 0 && (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Descuento Club VIP ({tierInfo.discountPercent}% Nivel {tierInfo.name.split(' ')[0]})</span>
                <span>-{formatCurrency(calculations.loyaltyDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>
                Tarifa de Envío ({distanceKm} km + tiempo en restaurante)
              </span>
              <span>{formatCurrency(calculations.deliverySubtotal)}</span>
            </div>

            {/* Mandatory 10% Rider tip */}
            <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100/70 p-2 rounded-xl">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-700" />
                10% Propina Obligatoria Repartidor
              </span>
              <span>+{formatCurrency(calculations.mandatoryRiderTip)}</span>
            </div>

            {/* 2% Platform Commission */}
            <div className="flex justify-between text-slate-500 text-[11px] px-1">
              <span>Comisión de Plataforma Mandao (2%)</span>
              <span>+{formatCurrency(calculations.appFee)}</span>
            </div>

            <div className="pt-2 border-t border-orange-200 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Total Final a Pagar</span>
              <span className="text-xl text-orange-600">
                {formatCurrency(calculations.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer / Confirm Button */}
        <div className="p-5 border-t border-slate-200 bg-white space-y-2">
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black rounded-2xl shadow-xl shadow-orange-600/25 transition-all active:scale-98 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Confirmar Pedido y Despachar al Repartidor</span>
          </button>
          <p className="text-[11px] text-center text-slate-400">
            Despacho automático con notificación push al repartidor más cercano
          </p>
        </div>
      </div>
    </div>
  );
};
