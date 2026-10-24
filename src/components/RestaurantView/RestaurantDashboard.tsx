import React, { useState } from 'react';
import {
  Store,
  PlusCircle,
  Tag,
  UtensilsCrossed,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Trash2,
  Image,
  Star,
  Building2,
  Edit,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem, Promotion } from '../../types';
import { formatCurrency } from '../../utils/pricing';

export const RestaurantDashboard: React.FC = () => {
  const {
    restaurants,
    orders,
    addMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    addPromotion,
    togglePromotion,
    registerRestaurant,
    updateOrderStatus,
  } = useApp();

  const [selectedRestId, setSelectedRestId] = useState<string>(restaurants[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'PEDIDOS' | 'MENU' | 'PROMOS' | 'NUEVO_RESTAURANTE'>('PEDIDOS');

  // Form states for new menu item
  const [showAddMenuModal, setShowAddMenuModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(24000);
  const [newItemCategory, setNewItemCategory] = useState<string>('Platos Fuertes');
  const [newItemPrepTime, setNewItemPrepTime] = useState<number>(15);
  const [newItemImage, setNewItemImage] = useState<string>(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  );

  // Form states for new promotion
  const [showAddPromoModal, setShowAddPromoModal] = useState<boolean>(false);
  const [newPromoTitle, setNewPromoTitle] = useState<string>('');
  const [newPromoDesc, setNewPromoDesc] = useState<string>('');
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(15);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState<number>(25000);

  // Form states for registering a new restaurant
  const [regName, setRegName] = useState<string>('');
  const [regCategory, setRegCategory] = useState<string>('Parrilla & Carnes');
  const [regCuisine, setRegCuisine] = useState<string>('Artesanal');
  const [regAddress, setRegAddress] = useState<string>('Cra 38 # 10-20, Medellín');
  const [regPrepMin, setRegPrepMin] = useState<number>(20);
  const [regPhone, setRegPhone] = useState<string>('+57 4 320 0000');
  const [regImage, setRegImage] = useState<string>(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  );
  const [regBanner, setRegBanner] = useState<string>(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
  );
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  const currentRestaurant =
    restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const restaurantOrders = orders.filter((o) => o.restaurantId === currentRestaurant?.id);
  const activeKitchenOrders = restaurantOrders.filter(
    (o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO'
  );

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !currentRestaurant) return;

    addMenuItem(currentRestaurant.id, {
      name: newItemName,
      description: newItemDesc || 'Preparación especial con ingredientes frescos del día.',
      price: Number(newItemPrice),
      category: newItemCategory,
      image: newItemImage,
      isAvailable: true,
      preparationMinutes: Number(newItemPrepTime),
      popular: false,
    });

    setNewItemName('');
    setNewItemDesc('');
    setShowAddMenuModal(false);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoTitle || !currentRestaurant) return;

    addPromotion(currentRestaurant.id, {
      title: newPromoTitle,
      description: newPromoDesc || `Aprovecha ${newPromoDiscount}% OFF en tus pedidos favoritos.`,
      code: (newPromoCode || 'OFERTA' + newPromoDiscount).toUpperCase(),
      discountPercent: Number(newPromoDiscount),
      minSpend: Number(newPromoMinSpend),
      active: true,
      tag: `${newPromoDiscount}% OFF`,
    });

    setNewPromoTitle('');
    setNewPromoDesc('');
    setShowAddPromoModal(false);
  };

  const handleRegisterNewRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) return;

    registerRestaurant({
      name: regName,
      category: regCategory,
      cuisine: regCuisine,
      image: regImage,
      banner: regBanner,
      address: regAddress,
      coords: [6.208 + (Math.random() - 0.5) * 0.01, -75.568 + (Math.random() - 0.5) * 0.01],
      averagePrepMinutes: Number(regPrepMin),
      minOrder: 15000,
      baseDeliveryFee: 3000,
      isOpen: true,
      phone: regPhone,
    });

    setRegistrationSuccess(true);
    setRegName('');
    setTimeout(() => {
      setRegistrationSuccess(false);
      setActiveTab('MENU');
    }, 1800);
  };

  if (!currentRestaurant) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Restaurant Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentRestaurant.image}
            alt={currentRestaurant.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">{currentRestaurant.name}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {currentRestaurant.rating} ({currentRestaurant.totalReviews} reseñas)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentRestaurant.category} • {currentRestaurant.address} • Espera promedio:{' '}
              {currentRestaurant.averagePrepMinutes} min
            </p>
          </div>
        </div>

        {/* Change restaurant dropdown & Add new restaurant button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            {restaurants.map((rest) => (
              <button
                key={rest.id}
                onClick={() => setSelectedRestId(rest.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all truncate max-w-[130px] ${
                  rest.id === currentRestaurant.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rest.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('NUEVO_RESTAURANTE')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-md shadow-orange-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inscribir Restaurante</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PEDIDOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'PEDIDOS'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Cocina & Pedidos Activos</span>
          {activeKitchenOrders.length > 0 && (
            <span className="w-5 h-5 bg-white text-orange-600 rounded-full text-xs font-black flex items-center justify-center">
              {activeKitchenOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MENU')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'MENU'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Gestión de Menú ({currentRestaurant.menu.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROMOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'PROMOS'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promociones y Descuentos ({currentRestaurant.promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NUEVO_RESTAURANTE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'NUEVO_RESTAURANTE'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Inscribir Aliado</span>
        </button>
      </div>

      {/* Tab 1: KITCHEN & ACTIVE ORDERS */}
      {activeTab === 'PEDIDOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Comandas en Cocina ({currentRestaurant.name})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Actualización automática de estado
            </span>
          </div>

          {activeKitchenOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700">Sin comandas pendientes en este momento</h4>
              <p className="text-xs text-slate-400 mt-1">
                Los nuevos pedidos realizados por clientes aparecerán aquí de inmediato.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeKitchenOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {ord.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {ord.customerName}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                        {ord.status}
                      </span>
                    </div>

                    {/* Dish list */}
                    <div className="py-3 space-y-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex items-start justify-between">
                          <div>
                            <span className="font-bold text-orange-600">{item.quantity}x</span>{' '}
                            <span className="font-semibold text-slate-800">
                              {item.menuItem.name}
                            </span>
                            {item.itemNotes && (
                              <p className="text-[11px] text-amber-700 italic pl-5">
                                • {item.itemNotes}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-slate-500">
                            {formatCurrency(item.menuItem.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kitchen Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Total venta:</span>
                      <strong className="text-slate-900 font-black">
                        {formatCurrency(ord.calculations.netFoodTotal)}
                      </strong>
                    </div>

                    {ord.status === 'EN_COCINA' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'EN_CAMINO')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        ✓ Marcar Listo para Repartidor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: MENU MANAGEMENT */}
      {activeTab === 'MENU' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Carta y Platos de {currentRestaurant.name}
              </h3>
              <p className="text-xs text-slate-500">
                Agrega nuevos platos, actualiza precios y activa o desactiva disponibilidad en tiempo real.
              </p>
            </div>
            <button
              onClick={() => setShowAddMenuModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Plato</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRestaurant.menu.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                        {dish.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{dish.name}</h4>
                      <span className="font-black text-slate-900 text-sm">
                        {formatCurrency(dish.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Prep: ~{dish.preparationMinutes} min
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between">
                  {/* Availability switch */}
                  <button
                    onClick={() => toggleMenuItemAvailability(currentRestaurant.id, dish.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      dish.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {dish.isAvailable ? '✓ Disponible' : '✕ Agotado'}
                  </button>

                  <button
                    onClick={() => deleteMenuItem(currentRestaurant.id, dish.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Eliminar plato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: PROMOTIONS MANAGEMENT */}
      {activeTab === 'PROMOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Promociones y Descuentos ({currentRestaurant.name})
              </h3>
              <p className="text-xs text-slate-500">
                Crea cupones automáticos para impulsar las ventas de tu negocio.
              </p>
            </div>
            <button
              onClick={() => setShowAddPromoModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Promoción</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRestaurant.promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
                      {promo.tag}
                    </span>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {promo.code}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{promo.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {promo.description}
                  </p>
                  <p className="text-xs text-slate-700 font-semibold mt-2">
                    Gasto mínimo: {formatCurrency(promo.minSpend)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Estado:{' '}
                    <strong className={promo.active ? 'text-emerald-600' : 'text-slate-400'}>
                      {promo.active ? 'Activa' : 'Pausada'}
                    </strong>
                  </span>

                  <button
                    onClick={() => togglePromotion(currentRestaurant.id, promo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      promo.active
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {promo.active ? 'Pausar' : 'Activar Promo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: REGISTER NEW RESTAURANT PARTNER */}
      {activeTab === 'NUEVO_RESTAURANTE' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Inscribe tu Restaurante a Mandao
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Únete a la red de aliados gastronómicos con la comisión más competitiva (2%) y despacho
              inmediato a repartidores cercanos.
            </p>
          </div>

          {registrationSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ¡Restaurante inscrito exitosamente! Ya está disponible en la plataforma.
            </div>
          )}

          <form onSubmit={handleRegisterNewRestaurant} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre del Restaurante / Negocio
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Tacos El Pastor Auténtico"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                >
                  <option value="Hamburguesas">Hamburguesas</option>
                  <option value="Pizzas & Pastas">Pizzas & Pastas</option>
                  <option value="Sushi & Asiática">Sushi & Asiática</option>
                  <option value="Mexicana">Mexicana</option>
                  <option value="Parrilla & Carnes">Parrilla & Carnes</option>
                  <option value="Saludable & Bowls">Saludable & Bowls</option>
                  <option value="Postres & Café">Postres & Café</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tiempo de Cocina Promedio (min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={regPrepMin}
                  onChange={(e) => setRegPrepMin(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Dirección Física del Local
              </label>
              <input
                type="text"
                required
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  URL Foto Logo / Fachada
                </label>
                <input
                  type="url"
                  value={regImage}
                  onChange={(e) => setRegImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-md transition-all active:scale-98 text-sm mt-2"
            >
              Completar Inscripción de Restaurante
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add Menu Item */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                Nuevo Plato para {currentRestaurant.name}
              </h4>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hamburguesa Doble Queso"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Ingredientes, preparación y detalles..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tiempo Prep (min)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={newItemPrepTime}
                    onChange={(e) => setNewItemPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Promotion */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Crear Nueva Promoción</h4>
              <button
                onClick={() => setShowAddPromoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Título de la Promoción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fin de Semana 15% OFF"
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newPromoDiscount}
                    onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Código Cupón
                  </label>
                  <input
                    type="text"
                    placeholder="FAST15"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Monto Mínimo de Pedido (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={newPromoMinSpend}
                  onChange={(e) => setNewPromoMinSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPromoModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
                >
                  Publicar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
