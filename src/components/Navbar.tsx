import React, { useState } from 'react';
import {
  ShoppingBag,
  Bike,
  Store,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Award,
  ShieldCheck,
  Landmark,
  Bot,
  MessageSquare,
  Phone,
  BarChart3,
} from 'lucide-react';
import { useApp, RoleType } from '../context/AppContext';
import { TIER_CONFIG, formatCurrency } from '../utils/pricing';

import { MandaoLogo } from './MandaoLogo';
import { Bell, BellOff } from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenLoyalty: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenLoyalty }) => {
  const {
    activeRole,
    setActiveRole,
    cart,
    user,
    currentDriver,
    activeOrder,
    isAudioEnabled,
    setIsAudioEnabled,
    triggerSampleDispatchOrder,
    setIsAIAssistantOpen,
    setIsChatOpen,
    startInternalCall,
    openDeveloperWhatsApp,
    developerWhatsApp,
    bankConfig,
    browserNotificationPermission,
    requestNotificationPermission,
    adminAccount,
    isAdminLoggedIn,
    openAdminPanelDirectly,
    setIsAdminAuthModalOpen,
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tierInfo = TIER_CONFIG[user.tier];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Official Mandao Logo & Brand */}
          <div
            onClick={() => setActiveRole('CLIENTE')}
            className="flex items-center cursor-pointer"
          >
            <MandaoLogo size="md" />
          </div>

          {/* Role Navigation Switcher */}
          <nav className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveRole('CLIENTE')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'CLIENTE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span className="hidden md:inline">Cliente</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[11px] flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('REPARTIDOR')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'REPARTIDOR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Bike className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">Repartidor</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  currentDriver.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </button>

            <button
              onClick={() => setActiveRole('RESTAURANTE')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'RESTAURANTE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Store className="w-4 h-4 text-blue-500" />
              <span className="hidden md:inline">Restaurantes</span>
            </button>

            <button
              onClick={() => setActiveRole('MAPA_VIVO')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'MAPA_VIVO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="hidden md:inline">Mapa en Vivo</span>
              {activeOrder && activeOrder.status === 'EN_CAMINO' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('SEGURIDAD_REPARTIDORES')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'SEGURIDAD_REPARTIDORES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Control de SOAT, Tecnomecánica y Licencia de conducción"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">Seguridad SOAT</span>
            </button>

            <button
              onClick={openAdminPanelDirectly}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'ADMIN_DASHBOARD'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Panel Administrativo Web: Métricas clave, 2% comisión e informes"
            >
              <BarChart3 className="w-4 h-4 text-rose-500" />
              <span className="hidden md:inline">Dashboard Admin</span>
              {isAdminLoggedIn ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Sesión Admin Activa" />
              ) : (
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded font-bold">Web</span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('FINANZAS_APP')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeRole === 'FINANZAS_APP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Ganancias de la app (2%) directo a cuenta bancaria"
            >
              <Landmark className="w-4 h-4 text-teal-600" />
              <span className="hidden lg:inline">Mi Banco (2%)</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* AI Support Button */}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
              title="Asistente de Inteligencia Artificial para problemas de entrega"
            >
              <Bot className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">IA Soporte</span>
            </button>

            {/* In-app Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs"
              title="Chat interno cliente - repartidor"
            >
              <MessageSquare className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* In-app Call Button */}
            <button
              onClick={() => startInternalCall('REPARTIDOR')}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors shadow-2xs"
              title="Llamada telefónica interna en la app"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Direct WhatsApp Tech Support Button */}
            {/* Browser Push Notifications Permission Trigger */}
            <button
              onClick={() => requestNotificationPermission()}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                browserNotificationPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
              }`}
              title={
                browserNotificationPermission === 'granted'
                  ? 'Notificaciones de pedidos en segundo plano activas'
                  : 'Clic para permitir notificaciones del navegador en segundo plano'
              }
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {browserNotificationPermission === 'granted' ? 'Push Activo' : 'Activar Push'}
              </span>
            </button>

            {/* Direct WhatsApp Tech Support Button */}
            <button
              onClick={() =>
                openDeveloperWhatsApp('Hola desarrollador Esteban, solicito soporte técnico en Mandao.')
              }
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              title={`Soporte WhatsApp Desarrollador: ${developerWhatsApp}`}
            >
              <span>WhatsApp Dev</span>
            </button>

            {/* Web Admin Account Quick Action */}
            {isAdminLoggedIn ? (
              <button
                onClick={() => setActiveRole('ADMIN_DASHBOARD')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs hover:bg-amber-100 transition-colors"
                title={`Sesión de Administrador activa: ${adminAccount?.name}`}
              >
                <span>👑</span>
                <span className="truncate max-w-[80px]">{adminAccount?.name.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
                title="Ingresar o Registrarse como Administrador Web"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Web</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              title={isAudioEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* User Loyalty Level Button */}
            <button
              onClick={onOpenLoyalty}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50/50 transition-all text-xs font-medium"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <div className="text-left hidden lg:block">
                <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
                  Nivel Club
                </span>
                <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[100px]">
                  {tierInfo.name.split(' ')[0]} ({tierInfo.discountPercent}% OFF)
                </span>
              </div>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-transform active:scale-95 shadow-md shadow-orange-500/20"
              title="Ver mi carrito y checkout"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
