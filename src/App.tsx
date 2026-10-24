import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ClientCatalog } from './components/ClientView/ClientCatalog';
import { DriverDashboard } from './components/DriverView/DriverDashboard';
import { RestaurantDashboard } from './components/RestaurantView/RestaurantDashboard';
import { LiveTrackingView } from './components/LiveTrackingView';
import { DriverRegistrationSecurityModal } from './components/DriverRegistrationSecurityModal';
import { BankPayoutModal } from './components/BankPayoutModal';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { AdminAuthModal } from './components/AdminView/AdminAuthModal';
import { IncomingDispatchModal } from './components/IncomingDispatchModal';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { LoyaltyClubModal } from './components/LoyaltyClubModal';
import { SupportAIModal } from './components/SupportAIModal';
import { InternalChatModal } from './components/InternalChatModal';
import { InternalCallModal } from './components/InternalCallModal';
import { PushSubscriptionModal } from './components/PushSubscriptionModal';
import { InAppToastContainer } from './components/InAppToastContainer';
import { Navigation, Bike, Clock, ChevronRight, MessageSquare, Phone, Bot } from 'lucide-react';
import { formatCurrency } from './utils/pricing';

const AppContent: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    activeOrder,
    setIsChatOpen,
    startInternalCall,
    setIsAIAssistantOpen,
    openDeveloperWhatsApp,
    developerWhatsApp,
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Main Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeRole === 'CLIENTE' && (
          <ClientCatalog onOpenCart={() => setIsCartOpen(true)} />
        )}

        {activeRole === 'REPARTIDOR' && <DriverDashboard />}

        {activeRole === 'RESTAURANTE' && <RestaurantDashboard />}

        {activeRole === 'MAPA_VIVO' && <LiveTrackingView />}

        {activeRole === 'SEGURIDAD_REPARTIDORES' && <DriverRegistrationSecurityModal />}

        {activeRole === 'FINANZAS_APP' && <BankPayoutModal />}

        {activeRole === 'ADMIN_DASHBOARD' && <AdminDashboard />}
      </main>

      {/* Floating Bottom Quick Tracker Bar if active order in transit */}
      {activeOrder &&
        activeRole !== 'MAPA_VIVO' &&
        activeOrder.status === 'EN_CAMINO' && (
          <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-30 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-3">
              <div
                onClick={() => setActiveRole('MAPA_VIVO')}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 px-2 py-0.5 rounded-full">
                      En Camino
                    </span>
                    <span className="text-xs text-slate-300 font-semibold truncate max-w-[130px]">
                      {activeOrder.driverName || 'Repartidor'}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white mt-0.5 truncate max-w-[180px]">
                    {activeOrder.restaurantName} • ETA ~{activeOrder.totalEstimatedMinutes} min
                  </h5>
                </div>
              </div>

              {/* Direct Quick Chat & Call buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 transition-colors"
                  title="Abrir Chat con el Repartidor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startInternalCall('REPARTIDOR')}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  title="Llamada Telefónica Interna"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveRole('MAPA_VIVO')}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Floating Bottom Right WhatsApp Tech Support Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2">
        <button
          onClick={() =>
            openDeveloperWhatsApp(
              'Hola desarrollador Esteban (+57 310 305 6071), requiero soporte técnico para la app Mandao.'
            )
          }
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-transform active:scale-95 group"
          title={`Soporte Técnico en WhatsApp: ${developerWhatsApp}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
          <span className="hidden sm:inline">WhatsApp Soporte Técnico:</span>
          <span className="font-mono font-black">{developerWhatsApp}</span>
        </button>
      </div>

      {/* Incoming Dispatch Offer Modal for Driver */}
      <IncomingDispatchModal />

      {/* Shopping Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Loyalty & Tier Perks Modal */}
      <LoyaltyClubModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
      />

      {/* AI Dispute & Problem Solving Modal */}
      <SupportAIModal />

      {/* Internal In-app Chat Modal */}
      <InternalChatModal />

      {/* Internal In-app Phone Call Modal */}
      <InternalCallModal />

      {/* Web Administrator Registration & Authentication Modal */}
      <AdminAuthModal />

      {/* Personalized Push Notification Subscription Modal */}
      <PushSubscriptionModal />

      {/* Real-time In-App Floating Toasts */}
      <InAppToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
