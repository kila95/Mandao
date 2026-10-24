import React, { useState } from 'react';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Tag,
  Plus,
  Flame,
  Percent,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem } from '../../types';
import { formatCurrency, calculateDistanceKm, TIER_CONFIG } from '../../utils/pricing';

export const ClientCatalog: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { restaurants, addToCart, user, selectedAddressId, setActiveRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [activeRestaurantDetail, setActiveRestaurantDetail] = useState<Restaurant | null>(null);

  // Selected item customizer modal
  const [selectedItemForCart, setSelectedItemForCart] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  const currentAddress =
    user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];

  const categories = [
    'TODOS',
    'Hamburguesas',
    'Pizzas & Pastas',
    'Sushi & Asiática',
    'Mexicana',
    'Saludable & Bowls',
  ];

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.menu.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'TODOS' ||
      r.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleOpenItem = (item: MenuItem, restaurant: Restaurant) => {
    setActiveRestaurantDetail(restaurant);
    setSelectedItemForCart(item);
    setItemQuantity(1);
    setItemNotes('');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedItemForCart || !activeRestaurantDetail) return;
    addToCart(selectedItemForCart, activeRestaurantDetail, itemQuantity, itemNotes);
    setSelectedItemForCart(null);
  };

  const tierInfo = TIER_CONFIG[user.tier];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Loyalty Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase mb-3">
            <span>✨ Club VIP: Nivel {tierInfo.name}</span>
            <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[10px]">
              {tierInfo.discountPercent}% OFF Automático
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Pide tu Mandao a domicilio en minutos
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-2 leading-relaxed max-w-xl">
            Rastreo por GPS en vivo, alertas push inmediatas al repartidor más cercano, menú y
            promociones directas con la tarifa más justa y 10% de propina obligatoria.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-orange-100 flex-wrap">
            <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              Entregar en: {currentAddress.label}
            </span>
            <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
              ⭐ Repartidores con 10% de propina obligatoria garantizada
            </span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar hamburguesas, pizzas, tacos, sushi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant List Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900">
            Restaurantes Disponibles ({filteredRestaurants.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Precios dinámicos calculados según distancia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((rest) => {
            const distance = calculateDistanceKm(rest.coords, currentAddress.coords);
            const activePromo = rest.promotions.find((p) => p.active);

            return (
              <div
                key={rest.id}
                onClick={() => setActiveRestaurantDetail(rest)}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Banner image with overlay badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Promo tag */}
                    {activePromo && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{activePromo.tag}</span>
                      </div>
                    )}

                    {/* Prep time & Distance pill */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        <span>{rest.averagePrepMinutes} min de cocina</span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{distance} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                          {rest.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {rest.cuisine} • {rest.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rest.rating}</span>
                      </div>
                    </div>

                    {/* Featured Dish Preview */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate max-w-[190px]">
                        Plato estrella: <strong>{rest.menu[0]?.name}</strong>
                      </span>
                      <span className="font-black text-slate-900">
                        {formatCurrency(rest.menu[0]?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-orange-500 group-hover:text-white text-slate-800 text-xs font-black transition-colors flex items-center justify-center gap-1.5">
                    <span>Ver Carta y Pedir</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restaurant Detail Full Modal */}
      {activeRestaurantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header with banner */}
            <div className="relative h-48 w-full bg-slate-800 shrink-0">
              <img
                src={activeRestaurantDetail.banner || activeRestaurantDetail.image}
                alt={activeRestaurantDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <button
                onClick={() => setActiveRestaurantDetail(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 text-sm font-bold transition-colors"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white">
                    {activeRestaurantDetail.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    {activeRestaurantDetail.rating} ({activeRestaurantDetail.totalReviews} opiniones)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {activeRestaurantDetail.name}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeRestaurantDetail.address} • Espera aprox:{' '}
                  {activeRestaurantDetail.averagePrepMinutes} min
                </p>
              </div>
            </div>

            {/* Promotions Banner if any */}
            {activeRestaurantDetail.promotions.filter((p) => p.active).length > 0 && (
              <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200/80 flex items-center gap-2 overflow-x-auto text-xs">
                <Tag className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="font-bold text-amber-900">Promociones Activas:</span>
                {activeRestaurantDetail.promotions
                  .filter((p) => p.active)
                  .map((p) => (
                    <span
                      key={p.id}
                      className="bg-white border border-amber-300 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold shrink-0 shadow-2xs"
                    >
                      {p.title} (Cupón: {p.code})
                    </span>
                  ))}
              </div>
            )}

            {/* Menu Items List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Platos y Bebidas Disponibles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeRestaurantDetail.menu.map((dish) => (
                  <div
                    key={dish.id}
                    className="border border-slate-200 rounded-2xl p-3 flex gap-3 hover:border-orange-300 transition-colors bg-white shadow-2xs"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {dish.name}
                          </h4>
                          {dish.popular && (
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.2 rounded-md shrink-0">
                              Top
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-black text-slate-900 text-xs sm:text-sm">
                          {formatCurrency(dish.price)}
                        </span>

                        <button
                          onClick={() => handleOpenItem(dish, activeRestaurantDetail)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer View Cart */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Envío calculado por distancia y tiempo de espera
              </span>
              <button
                onClick={() => {
                  setActiveRestaurantDetail(null);
                  onOpenCart();
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-md"
              >
                Ver Mi Canasta de Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Quantity & Special Notes Modal */}
      {selectedItemForCart && activeRestaurantDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base">{selectedItemForCart.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{selectedItemForCart.description}</p>
            <p className="text-sm font-black text-orange-600 mt-2">
              {formatCurrency(selectedItemForCart.price)}
            </p>

            <div className="my-4 pt-3 border-t border-slate-100 space-y-3">
              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cantidad</span>
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="font-bold text-sm text-slate-600 hover:text-slate-900"
                  >
                    -
                  </button>
                  <span className="font-black text-sm text-slate-900">{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="font-bold text-sm text-slate-600 hover:text-slate-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instrucciones para la cocina (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sin cebolla, salsa aparte..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItemForCart(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
              >
                Agregar • {formatCurrency(selectedItemForCart.price * itemQuantity)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
