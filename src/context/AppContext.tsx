import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Restaurant,
  Driver,
  UserProfile,
  Order,
  OrderItem,
  OrderStatus,
  MenuItem,
  Promotion,
  UserTier,
  ChatMessage,
  InternalCallState,
  AppOwnerBankConfig,
  DocumentVerification,
  AdminAccount,
  PushSubscriptionPreferences,
  InAppToastNotification,
} from '../types';
import {
  INITIAL_DRIVERS,
  INITIAL_RESTAURANTS,
  INITIAL_USER,
  INITIAL_ACTIVE_ORDER,
  INITIAL_ORDERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_APP_BANK_CONFIG,
  INITIAL_ADMIN_ACCOUNT,
} from '../data/mockData';
import { calculateOrderPrice, calculateDistanceKm } from '../utils/pricing';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserDispatchNotification,
  sendOrderStatusPushNotification,
  sendTestPushNotification,
  DEFAULT_PUSH_PREFERENCES,
} from '../utils/browserNotifications';

export type RoleType =
  | 'CLIENTE'
  | 'REPARTIDOR'
  | 'RESTAURANTE'
  | 'MAPA_VIVO'
  | 'SEGURIDAD_REPARTIDORES'
  | 'FINANZAS_APP'
  | 'ADMIN_DASHBOARD';

interface AppContextType {
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  user: UserProfile;
  restaurants: Restaurant[];
  drivers: Driver[];
  currentDriver: Driver;
  orders: Order[];
  activeOrder: Order | null;
  incomingDispatch: Order | null;
  cart: OrderItem[];
  cartRestaurant: Restaurant | null;
  selectedAddressId: string;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;

  // Cart operations
  addToCart: (item: MenuItem, restaurant: Restaurant, quantity?: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  setSelectedAddressId: (addrId: string) => void;

  // Checkout & Dispatch
  checkoutOrder: (paymentMethod: 'EFECTIVO' | 'DIGITAL', notes?: string) => Order;
  acceptDispatchService: (orderId: string) => void;
  rejectDispatchService: (orderId: string) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  submitOrderReview: (orderId: string, restaurantScore: number, driverScore: number, comment?: string) => void;

  // Restaurant Partner Operations
  registerRestaurant: (newRest: Omit<Restaurant, 'id' | 'rating' | 'totalReviews' | 'promotions' | 'menu'>) => void;
  addMenuItem: (restaurantId: string, item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (restaurantId: string, itemId: string) => void;
  toggleMenuItemAvailability: (restaurantId: string, itemId: string) => void;
  addPromotion: (restaurantId: string, promo: Omit<Promotion, 'id'>) => void;
  togglePromotion: (restaurantId: string, promoId: string) => void;

  // Driver Operations & Security Verification
  toggleDriverOnline: (driverId: string) => void;
  selectActiveDriver: (driverId: string) => void;
  triggerSampleDispatchOrder: () => void;
  registerNewDriver: (driverData: Omit<Driver, 'id' | 'rating' | 'totalDeliveries' | 'earningsToday' | 'tipsEarnedToday' | 'isAvailable' | 'currentCoords' | 'isVerified'> & {
    soat: DocumentVerification;
    tecnomecanica: DocumentVerification;
    driverLicense: DocumentVerification;
  }) => void;
  verifyDriverDocuments: (driverId: string) => void;

  // In-app Internal Chat between Customer and Driver
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  sendChatMessage: (text: string, senderRole?: 'CLIENTE' | 'REPARTIDOR') => void;

  // In-app Internal Call System
  callState: InternalCallState;
  startInternalCall: (targetRole: 'CLIENTE' | 'REPARTIDOR') => void;
  endInternalCall: () => void;
  toggleMuteCall: () => void;
  toggleSpeakerCall: () => void;

  // AI Support Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  askSupportAI: (prompt: string) => Promise<{ reply: string; suggestedAction?: string }>;

  // Developer WhatsApp Tech Support
  developerWhatsApp: string;
  openDeveloperWhatsApp: (contextMsg?: string) => void;

  // Browser Notifications & Personalized Push Subscription Service
  browserNotificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  pushPreferences: PushSubscriptionPreferences;
  updatePushPreferences: (prefs: Partial<PushSubscriptionPreferences>) => void;
  togglePushSubscription: (forceEnable?: boolean) => Promise<boolean>;
  isPushModalOpen: boolean;
  setIsPushModalOpen: (open: boolean) => void;
  inAppToasts: InAppToastNotification[];
  dismissToast: (id: string) => void;
  sendTestPush: (type: 'PREPARADO' | 'ENTREGADO' | 'EN_CAMINO') => void;

  // App Owner Bank Earnings & 2% Direct Transfer
  bankConfig: AppOwnerBankConfig;
  updateBankConfig: (config: Partial<AppOwnerBankConfig>) => void;
  transferEarningsToBankAccount: (amount: number) => { success: boolean; reference: string };

  // Administrator Web Account & Gatekeeper
  adminAccount: AdminAccount | null;
  isAdminLoggedIn: boolean;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  registerAdmin: (data: { name: string; email: string; phone: string; pin?: string }) => void;
  loginAdmin: (email: string, pin?: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  openAdminPanelDirectly: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio API phone tone synthesizers
function playRingtone() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    // Classic dual-tone US/Latam ringback (440Hz + 480Hz)
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(480, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 1.2);
    osc2.stop(audioCtx.currentTime + 1.2);
  } catch {
    // restricted before user interaction
  }
}

function playDispatchChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.25); // D6

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.55);
  } catch {
    //
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<RoleType>('CLIENTE');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fastbite_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('fastbite_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('fastbite_drivers_v2');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [currentDriverId, setCurrentDriverId] = useState<string>('drv_carlos_1');

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fastbite_orders_v3');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [activeOrderId, setActiveOrderId] = useState<string | null>(INITIAL_ACTIVE_ORDER.id);
  const [incomingDispatch, setIncomingDispatch] = useState<Order | null>(null);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr_1');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fastbite_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Internal Call state
  const [callState, setCallState] = useState<InternalCallState>({
    isOpen: false,
    status: 'ENDED',
    durationSeconds: 0,
    isMuted: false,
    isSpeaker: false,
    callerName: '',
    callerPhone: '',
    callerRole: 'REPARTIDOR',
  });

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // App Owner Bank Config
  const [bankConfig, setBankConfig] = useState<AppOwnerBankConfig>(() => {
    const saved = localStorage.getItem('fastbite_bank_config');
    return saved ? JSON.parse(saved) : INITIAL_APP_BANK_CONFIG;
  });

  // Browser Notifications Permission State
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>(() => {
    return getBrowserNotificationPermission();
  });

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserNotificationPermission(perm);
    return perm;
  };

  // Push Subscription Preferences for Order Tracking (e.g. "Pedido preparado", "Entregado")
  const [pushPreferences, setPushPreferences] = useState<PushSubscriptionPreferences>(() => {
    try {
      const saved = localStorage.getItem('mandao_push_subscription_preferences');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PUSH_PREFERENCES;
  });

  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [inAppToasts, setInAppToasts] = useState<InAppToastNotification[]>([]);

  // Sync push preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mandao_push_subscription_preferences', JSON.stringify(pushPreferences));
    } catch (e) {
      console.error('Error saving push preferences:', e);
    }
  }, [pushPreferences]);

  const updatePushPreferences = (prefs: Partial<PushSubscriptionPreferences>) => {
    setPushPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const togglePushSubscription = async (forceEnable?: boolean): Promise<boolean> => {
    const targetState = forceEnable !== undefined ? forceEnable : !pushPreferences.enabled;
    if (targetState) {
      // Request permission if not already granted
      const perm = await requestBrowserNotificationPermission();
      setBrowserNotificationPermission(perm);
      setPushPreferences((prev) => ({
        ...prev,
        enabled: true,
        subscribedAt: new Date().toISOString(),
      }));
      return perm === 'granted';
    } else {
      setPushPreferences((prev) => ({
        ...prev,
        enabled: false,
      }));
      return false;
    }
  };

  const dismissToast = (id: string) => {
    setInAppToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addInAppToast = (
    title: string,
    message: string,
    status: OrderStatus,
    orderId: string,
    iconType: 'prepared' | 'delivered' | 'ontheway' | 'driver' | 'kitchen'
  ) => {
    const newToast: InAppToastNotification = {
      id: `toast_${Date.now()}_${Math.random()}`,
      title,
      message,
      status,
      orderId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      iconType,
    };

    setInAppToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto-dismiss after 6.5 seconds
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 6500);
  };

  const sendTestPush = (type: 'PREPARADO' | 'ENTREGADO' | 'EN_CAMINO') => {
    if (browserNotificationPermission !== 'granted') {
      requestNotificationPermission().then((perm) => {
        if (perm === 'granted') {
          sendTestPushNotification(type, pushPreferences, () => setActiveRole('MAPA_VIVO'));
        }
      });
    } else {
      sendTestPushNotification(type, pushPreferences, () => setActiveRole('MAPA_VIVO'));
    }

    if (type === 'PREPARADO') {
      addInAppToast(
        '👨‍🍳 ¡Tu pedido está preparado! [Prueba]',
        'Prueba de notificación push: La orden ya fue cocinada y empaquetada lista para ser entregada.',
        'LISTO_PARA_RECOGER',
        'ORD-TEST',
        'prepared'
      );
    } else if (type === 'ENTREGADO') {
      addInAppToast(
        '🎉 ¡Pedido entregado! [Prueba]',
        'Prueba de notificación push: Tu comida llegó caliente y fresca a tu dirección. ¡Buen provecho!',
        'ENTREGADO',
        'ORD-TEST',
        'delivered'
      );
    } else {
      addInAppToast(
        '🛵 ¡Tu pedido va en camino! [Prueba]',
        'Prueba de notificación push: El repartidor Carlos Restrepo va en trayecto.',
        'EN_CAMINO',
        'ORD-TEST',
        'ontheway'
      );
    }
  };

  const developerWhatsApp = '+573103056071';

  // Administrator Account State & Web Gatekeeper
  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(() => {
    const saved = localStorage.getItem('mandao_admin_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  useEffect(() => {
    if (adminAccount) {
      localStorage.setItem('mandao_admin_account', JSON.stringify(adminAccount));
    } else {
      localStorage.removeItem('mandao_admin_account');
    }
  }, [adminAccount]);

  const isAdminLoggedIn = Boolean(adminAccount);

  const registerAdmin = (data: { name: string; email: string; phone: string; pin?: string }) => {
    const newAdmin: AdminAccount = {
      id: `admin_${Date.now()}`,
      name: data.name.trim() || 'Esteban Ochoa Mesa',
      email: data.email.trim().toLowerCase() || 'estebanochoamesa@gmail.com',
      phone: data.phone.trim() || '+57 310 305 6071',
      role: 'SUPER_ADMIN',
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isVerifiedWebSession: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      secretPin: data.pin || '1234',
    };
    setAdminAccount(newAdmin);
    setIsAdminAuthModalOpen(false);
    setActiveRole('ADMIN_DASHBOARD');
  };

  const loginAdmin = (email: string, pin?: string): { success: boolean; message: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const isMasterEmail = normalizedEmail === 'estebanochoamesa@gmail.com';
    const isMatched = isMasterEmail || (adminAccount && adminAccount.email.toLowerCase() === normalizedEmail);

    if (isMatched) {
      const activeAdmin: AdminAccount = adminAccount || {
        ...INITIAL_ADMIN_ACCOUNT,
        lastLoginAt: new Date().toISOString(),
      };
      setAdminAccount(activeAdmin);
      setIsAdminAuthModalOpen(false);
      setActiveRole('ADMIN_DASHBOARD');
      return { success: true, message: 'Autenticación exitosa como Administrador de Mandao.' };
    }

    return {
      success: false,
      message: 'Correo no autorizado como administrador. Regístrate o utiliza la cuenta autorizada de Esteban Ochoa Mesa.',
    };
  };

  const logoutAdmin = () => {
    setAdminAccount(null);
    localStorage.removeItem('mandao_admin_account');
    if (activeRole === 'ADMIN_DASHBOARD') {
      setActiveRole('CLIENTE');
    }
  };

  const openAdminPanelDirectly = () => {
    if (isAdminLoggedIn) {
      setActiveRole('ADMIN_DASHBOARD');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('fastbite_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fastbite_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('fastbite_drivers_v2', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('fastbite_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fastbite_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('fastbite_bank_config', JSON.stringify(bankConfig));
  }, [bankConfig]);

  const currentDriver = drivers.find((d) => d.id === currentDriverId) || drivers[0];
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || null;

  // Real-time animation ticker for active order rider movement
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'EN_CAMINO') return;

    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== activeOrder.id || ord.status !== 'EN_CAMINO') return ord;

          const current = ord.driverCoords || ord.restaurantCoords;
          const target = ord.customerCoords;

          const latDiff = target[0] - current[0];
          const lngDiff = target[1] - current[1];

          if (Math.abs(latDiff) < 0.0003 && Math.abs(lngDiff) < 0.0003) {
            // Add 2% commission to app bank balance upon successful delivery
            setBankConfig((b) => ({
              ...b,
              accumulatedBalance: b.accumulatedBalance + ord.calculations.appFee,
            }));

            return {
              ...ord,
              driverCoords: target,
              status: 'ENTREGADO',
            };
          }

          const newLat = current[0] + latDiff * 0.12;
          const newLng = current[1] + lngDiff * 0.12;

          return {
            ...ord,
            driverCoords: [newLat, newLng],
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status]);

  // Call timer simulation
  useEffect(() => {
    if (!callState.isOpen || callState.status !== 'CONNECTED') return;

    const timer = setInterval(() => {
      setCallState((prev) => ({
        ...prev,
        durationSeconds: prev.durationSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [callState.isOpen, callState.status]);

  // Cart operations
  const addToCart = (item: MenuItem, restaurant: Restaurant, quantity = 1, instructions = '') => {
    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      if (
        !window.confirm(
          `Tu canasta contiene platos de "${cartRestaurant.name}". ¿Deseas vaciarla para pedir en "${restaurant.name}"?`
        )
      ) {
        return;
      }
      setCart([{ menuItem: item, quantity, itemNotes: instructions }]);
      setCartRestaurant(restaurant);
      return;
    }

    setCartRestaurant(restaurant);
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + quantity, itemNotes: instructions || i.itemNotes }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity, itemNotes: instructions }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.menuItem.id !== itemId);
      if (next.length === 0) setCartRestaurant(null);
      return next;
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItem.id === itemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is OrderItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurant(null);
  };

  // Checkout order
  const checkoutOrder = (paymentMethod: 'EFECTIVO' | 'DIGITAL', notes?: string): Order => {
    if (!cartRestaurant || cart.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const selectedAddr =
      user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];

    const distanceKm = calculateDistanceKm(cartRestaurant.coords, selectedAddr.coords);
    const foodSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

    const activePromo = cartRestaurant.promotions.find((p) => p.active && foodSubtotal >= p.minSpend);
    const promoPercent = activePromo ? activePromo.discountPercent : 0;

    const calculations = calculateOrderPrice({
      foodSubtotal,
      promoDiscountPercent: promoPercent,
      userTier: user.tier,
      distanceKm,
      restaurantPrepMinutes: cartRestaurant.averagePrepMinutes,
    });

    const travelMinutes = Math.max(5, Math.round(distanceKm * 3.5));
    const totalEstMinutes = cartRestaurant.averagePrepMinutes + travelMinutes;

    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'BUSCANDO_REPARTIDOR',
      restaurantId: cartRestaurant.id,
      restaurantName: cartRestaurant.name,
      restaurantAddress: cartRestaurant.address,
      restaurantCoords: cartRestaurant.coords,
      restaurantPrepMinutes: cartRestaurant.averagePrepMinutes,

      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      customerRating: user.rating,
      customerTier: user.tier,
      customerOrdersCount: user.totalOrders,
      customerAddress: selectedAddr.address,
      customerCoords: selectedAddr.coords,
      customerNotes: notes || selectedAddr.details,

      items: [...cart],
      paymentMethod,
      paymentBrand:
        paymentMethod === 'DIGITAL'
          ? 'Billetera Digital / Tarjeta Aprobada'
          : 'Efectivo contra entrega',

      calculations,
      estimatedWaitMinutes: cartRestaurant.averagePrepMinutes,
      estimatedTravelMinutes: travelMinutes,
      totalEstimatedMinutes: totalEstMinutes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();

    // Reset chat with welcome notice
    setChatMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        orderId: newOrder.id,
        senderRole: 'IA_SOPORTE',
        senderName: 'Asistente Mandao IA',
        text: `¡Mandao #${newOrder.id} creado con éxito! Puedes usar este chat o la llamada interna para coordinar cualquier detalle con tu repartidor asignado.`,
        timestamp: 'Ahora',
      },
    ]);

    setTimeout(() => {
      setIncomingDispatch(newOrder);
      if (isAudioEnabled) playDispatchChime();

      // Trigger native browser notification that displays even if tab is in background!
      sendBrowserDispatchNotification(
        {
          orderId: newOrder.id,
          restaurantName: newOrder.restaurantName,
          customerName: newOrder.customerName,
          customerAddress: newOrder.customerAddress,
          driverEarnings: newOrder.calculations.driverEarnings,
          mandatoryTip: newOrder.calculations.mandatoryRiderTip,
          paymentMethod: newOrder.paymentMethod,
        },
        () => {
          setActiveRole('REPARTIDOR');
          setIncomingDispatch(newOrder);
        }
      );
    }, 1200);

    return newOrder;
  };

  const acceptDispatchService = (orderId: string) => {
    const driver = currentDriver;

    // Check security status: SOAT or Tecnomecanica expired cannot take services!
    if (driver.soat.status === 'VENCIDO' || driver.tecnomecanica.status === 'VENCIDO') {
      alert(
        `Alerta de Seguridad: No puedes aceptar servicios porque tu vehículo tiene documentos vencidos (${
          driver.soat.status === 'VENCIDO' ? 'SOAT' : 'Tecnomecánica'
        }). Por favor renuévalos en el módulo de Seguridad.`
      );
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'EN_CAMINO',
            assignedDriverId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            driverAvatar: driver.avatar,
            driverVehicle: driver.vehicle,
            driverPlate: driver.plate,
            driverRating: driver.rating,
            driverCoords: [
              o.restaurantCoords[0] + 0.0008,
              o.restaurantCoords[1] + 0.0008,
            ],
          };
        }
        return o;
      })
    );

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driver.id) {
          const ord = orders.find((o) => o.id === orderId) || incomingDispatch;
          const tip = ord ? ord.calculations.mandatoryRiderTip : 800;
          const earnings = ord ? ord.calculations.driverEarnings : 7500;
          return {
            ...d,
            earningsToday: d.earningsToday + earnings,
            tipsEarnedToday: d.tipsEarnedToday + tip,
            totalDeliveries: d.totalDeliveries + 1,
          };
        }
        return d;
      })
    );

    setIncomingDispatch(null);
  };

  const rejectDispatchService = (orderId: string) => {
    setIncomingDispatch(null);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let targetOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          // If status becomes ENTREGADO, credit 2% commission to app bank
          if (newStatus === 'ENTREGADO' && o.status !== 'ENTREGADO') {
            setBankConfig((b) => ({
              ...b,
              accumulatedBalance: b.accumulatedBalance + o.calculations.appFee,
            }));
          }

          const updated: Order = {
            ...o,
            status: newStatus,
          };
          targetOrder = updated;
          return updated;
        }
        return o;
      })
    );

    // If order was found, trigger personalized push notification & in-app toast
    if (targetOrder) {
      const order = targetOrder;
      
      // 1. Send native browser push notification (displays even in background tab)
      sendOrderStatusPushNotification(order, newStatus, pushPreferences, () => {
        setActiveRole('MAPA_VIVO');
      });

      // 2. Dispatch real-time in-app visual toast
      if (newStatus === 'LISTO_PARA_RECOGER') {
        addInAppToast(
          `👨‍🍳 ¡Tu pedido está preparado!`,
          `En ${order.restaurantName} ya empacaron tu pedido #${order.id}. ¡Comida lista para ser despachada!`,
          newStatus,
          order.id,
          'prepared'
        );
      } else if (newStatus === 'ENTREGADO') {
        addInAppToast(
          `🎉 ¡Tu pedido ha sido entregado!`,
          `¡Buen provecho! Tu orden de ${order.restaurantName} llegó a ${order.customerAddress}.`,
          newStatus,
          order.id,
          'delivered'
        );
      } else if (newStatus === 'EN_CAMINO') {
        addInAppToast(
          `🛵 ¡Tu pedido va en camino!`,
          `${order.driverName || 'Tu repartidor'} va en trayecto hacia tu ubicación (~${order.estimatedTravelMinutes} min).`,
          newStatus,
          order.id,
          'ontheway'
        );
      } else if (newStatus === 'REPARTIDOR_ASIGNADO') {
        addInAppToast(
          `🏍️ Repartidor Asignado`,
          `${order.driverName || 'Un repartidor'} se dirige a ${order.restaurantName} para tu orden #${order.id}.`,
          newStatus,
          order.id,
          'driver'
        );
      } else if (newStatus === 'EN_COCINA') {
        addInAppToast(
          `🍳 En Preparación`,
          `${order.restaurantName} ha comenzado a preparar tu orden #${order.id}.`,
          newStatus,
          order.id,
          'kitchen'
        );
      }
    }
  };

  const submitOrderReview = (
    orderId: string,
    restaurantScore: number,
    driverScore: number,
    comment?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, reviewSubmitted: true } : o))
    );

    setUser((prev) => {
      const nextCount = prev.totalOrders + 1;
      const nextPoints = prev.points + 50;

      let nextTier: UserTier = 'BRONZE';
      let nextDiscount = 0;
      if (nextCount >= 30) {
        nextTier = 'DIAMOND';
        nextDiscount = 15;
      } else if (nextCount >= 15) {
        nextTier = 'GOLD';
        nextDiscount = 10;
      } else if (nextCount >= 5) {
        nextTier = 'SILVER';
        nextDiscount = 5;
      }

      return {
        ...prev,
        totalOrders: nextCount,
        points: nextPoints,
        tier: nextTier,
        discountPercentage: nextDiscount,
        rating: Math.min(5, Math.round(((prev.rating * prev.totalOrders + 5.0) / (prev.totalOrders + 1)) * 100) / 100),
      };
    });
  };

  // In-app Chat
  const sendChatMessage = (text: string, senderRole: 'CLIENTE' | 'REPARTIDOR' = 'CLIENTE') => {
    const senderName =
      senderRole === 'CLIENTE'
        ? user.name
        : activeOrder?.driverName || currentDriver.name;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      orderId: activeOrder?.id || 'ORD-GEN',
      senderRole,
      senderName,
      text,
      timestamp: 'Justo ahora',
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated automated smart reply from driver or customer
    if (senderRole === 'CLIENTE') {
      setTimeout(() => {
        const responses = [
          '¡Listo, recibido! Ya casi llego a tu ubicación.',
          'Entendido, ya lo tengo presente para la entrega.',
          'Perfecto, te timbro cuando esté en la puerta.',
        ];
        const randomResp = responses[Math.floor(Math.random() * responses.length)];
        const replyMsg: ChatMessage = {
          id: `msg_rep_${Date.now()}`,
          orderId: activeOrder?.id || 'ORD-GEN',
          senderRole: 'REPARTIDOR',
          senderName: activeOrder?.driverName || 'Carlos Mario (Repartidor)',
          text: randomResp,
          timestamp: 'Justo ahora',
        };
        setChatMessages((prev) => [...prev, replyMsg]);
      }, 1500);
    }
  };

  // Internal In-app Call System
  const startInternalCall = (targetRole: 'CLIENTE' | 'REPARTIDOR') => {
    if (isAudioEnabled) playRingtone();

    const isCustomerCalling = targetRole === 'REPARTIDOR';
    const targetName = isCustomerCalling
      ? activeOrder?.driverName || 'Carlos Mario Restrepo (Repartidor)'
      : activeOrder?.customerName || user.name;
    const targetPhone = isCustomerCalling
      ? activeOrder?.driverPhone || '+573015559210'
      : activeOrder?.customerPhone || user.phone;

    setCallState({
      isOpen: true,
      status: 'CALLING',
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
      callerName: targetName,
      callerPhone: targetPhone,
      callerRole: targetRole,
    });

    // Simulate answering after 2.5 seconds
    setTimeout(() => {
      setCallState((prev) => ({
        ...prev,
        status: 'CONNECTED',
      }));
    }, 2500);
  };

  const endInternalCall = () => {
    setCallState((prev) => ({
      ...prev,
      status: 'ENDED',
      isOpen: false,
      durationSeconds: 0,
    }));
  };

  const toggleMuteCall = () => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleSpeakerCall = () => {
    setCallState((prev) => ({ ...prev, isSpeaker: !prev.isSpeaker }));
  };

  // AI Support Assistant calling /api/support/ai
  const askSupportAI = async (prompt: string): Promise<{ reply: string; suggestedAction?: string }> => {
    try {
      const res = await fetch('/api/support/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuePrompt: prompt,
          orderInfo: activeOrder,
          userRole: activeRole,
        }),
      });
      const data = await res.json();
      return {
        reply: data.reply || 'Tu consulta ha sido procesada.',
        suggestedAction: data.suggestedAction,
      };
    } catch {
      return {
        reply: `He registrado tu solicitud: "${prompt}". Te recomendamos iniciar el chat o llamada interna con tu repartidor (${activeOrder?.driverName || 'asignado'}) para resolverlo de inmediato.`,
        suggestedAction: 'OPEN_CHAT',
      };
    }
  };

  // WhatsApp Tech Support redirect
  const openDeveloperWhatsApp = (contextMsg = 'Hola, requiero soporte técnico en la app FastBite.') => {
    const cleanNumber = developerWhatsApp.replace('+', '').trim();
    const encoded = encodeURIComponent(contextMsg);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Driver Security & Documents
  const registerNewDriver = (
    driverData: Omit<Driver, 'id' | 'rating' | 'totalDeliveries' | 'earningsToday' | 'tipsEarnedToday' | 'isAvailable' | 'currentCoords' | 'isVerified'> & {
      soat: DocumentVerification;
      tecnomecanica: DocumentVerification;
      driverLicense: DocumentVerification;
    }
  ) => {
    const isSoatValid = driverData.soat.status === 'VIGENTE';
    const isTechValid = driverData.tecnomecanica.status === 'VIGENTE';
    const isLicValid = driverData.driverLicense.status === 'VIGENTE';

    const newDriver: Driver = {
      ...driverData,
      id: `drv_${Date.now()}`,
      rating: 5.0,
      totalDeliveries: 0,
      earningsToday: 0,
      tipsEarnedToday: 0,
      isAvailable: isSoatValid && isTechValid && isLicValid,
      currentCoords: [6.209 + (Math.random() - 0.5) * 0.01, -75.568 + (Math.random() - 0.5) * 0.01],
      isVerified: isSoatValid && isTechValid && isLicValid,
    };

    setDrivers((prev) => [newDriver, ...prev]);
    setCurrentDriverId(newDriver.id);
  };

  const verifyDriverDocuments = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            isVerified: true,
            soat: { ...d.soat, status: 'VIGENTE', verifiedAt: new Date().toISOString() },
            tecnomecanica: { ...d.tecnomecanica, status: 'VIGENTE', verifiedAt: new Date().toISOString() },
            driverLicense: { ...d.driverLicense, status: 'VIGENTE', verifiedAt: new Date().toISOString() },
          };
        }
        return d;
      })
    );
  };

  // App Owner Bank Earnings & 2% Direct Transfer
  const updateBankConfig = (newConfig: Partial<AppOwnerBankConfig>) => {
    setBankConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const transferEarningsToBankAccount = (amount: number) => {
    if (amount <= 0 || amount > bankConfig.accumulatedBalance) {
      return { success: false, reference: '' };
    }

    const ref = `SPEI-ACH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPayout = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      bankReference: ref,
      status: 'TRANSFERIDO_EXITOSO' as const,
    };

    setBankConfig((prev) => ({
      ...prev,
      accumulatedBalance: prev.accumulatedBalance - amount,
      totalPaidOut: prev.totalPaidOut + amount,
      payoutHistory: [newPayout, ...prev.payoutHistory],
    }));

    return { success: true, reference: ref };
  };

  // Demo helpers
  const triggerSampleDispatchOrder = () => {
    const sampleRestaurant = restaurants[0];
    const customerAddr = user.addresses[0];
    const distanceKm = 2.4;
    const calculations = calculateOrderPrice({
      foodSubtotal: 39900,
      promoDiscountPercent: 15,
      userTier: user.tier,
      distanceKm,
      restaurantPrepMinutes: sampleRestaurant.averagePrepMinutes,
    });

    const demoOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'BUSCANDO_REPARTIDOR',
      restaurantId: sampleRestaurant.id,
      restaurantName: sampleRestaurant.name,
      restaurantAddress: sampleRestaurant.address,
      restaurantCoords: sampleRestaurant.coords,
      restaurantPrepMinutes: sampleRestaurant.averagePrepMinutes,

      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      customerRating: user.rating,
      customerTier: user.tier,
      customerOrdersCount: user.totalOrders,
      customerAddress: customerAddr.address,
      customerCoords: customerAddr.coords,
      customerNotes: 'Timbre 402, dejar en portería por favor.',

      items: [
        {
          menuItem: sampleRestaurant.menu[0],
          quantity: 1,
          itemNotes: 'Papas bien doradas',
        },
      ],
      paymentMethod: Math.random() > 0.5 ? 'DIGITAL' : 'EFECTIVO',
      paymentBrand: 'Efectivo contra entrega ($50.000)',
      calculations,
      estimatedWaitMinutes: 18,
      estimatedTravelMinutes: 8,
      totalEstimatedMinutes: 26,
    };

    setOrders((prev) => [demoOrder, ...prev]);
    setActiveOrderId(demoOrder.id);
    setIncomingDispatch(demoOrder);
    if (isAudioEnabled) playDispatchChime();

    // Trigger browser notification for background tab
    sendBrowserDispatchNotification(
      {
        orderId: demoOrder.id,
        restaurantName: demoOrder.restaurantName,
        customerName: demoOrder.customerName,
        customerAddress: demoOrder.customerAddress,
        driverEarnings: demoOrder.calculations.driverEarnings,
        mandatoryTip: demoOrder.calculations.mandatoryRiderTip,
        paymentMethod: demoOrder.paymentMethod,
      },
      () => {
        setActiveRole('REPARTIDOR');
        setIncomingDispatch(demoOrder);
      }
    );
  };

  const registerRestaurant = (
    newRestData: Omit<Restaurant, 'id' | 'rating' | 'totalReviews' | 'promotions' | 'menu'>
  ) => {
    const newRest: Restaurant = {
      ...newRestData,
      id: `rest_${Date.now()}`,
      rating: 5.0,
      totalReviews: 1,
      promotions: [],
      menu: [
        {
          id: `m_${Date.now()}_1`,
          name: 'Plato Especial de la Casa',
          description: 'Nuestra receta insignia preparada con los mejores ingredientes locales.',
          price: 26000,
          category: 'Especialidades',
          image:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
          isAvailable: true,
          preparationMinutes: 18,
          popular: true,
        },
      ],
    };
    setRestaurants((prev) => [newRest, ...prev]);
  };

  const addMenuItem = (restaurantId: string, itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `m_${Date.now()}`,
    };
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, menu: [...r.menu, newItem] } : r))
    );
  };

  const deleteMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, menu: r.menu.filter((m) => m.id !== itemId) } : r))
    );
  };

  const toggleMenuItemAvailability = (restaurantId: string, itemId: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? { ...r, menu: r.menu.map((m) => (m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m)) }
          : r
      )
    );
  };

  const addPromotion = (restaurantId: string, promoData: Omit<Promotion, 'id'>) => {
    const newPromo: Promotion = {
      ...promoData,
      id: `promo_${Date.now()}`,
    };
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, promotions: [...r.promotions, newPromo] } : r))
    );
  };

  const togglePromotion = (restaurantId: string, promoId: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? { ...r, promotions: r.promotions.map((p) => (p.id === promoId ? { ...p, active: !p.active } : p)) }
          : r
      )
    );
  };

  const toggleDriverOnline = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  const selectActiveDriver = (driverId: string) => {
    setCurrentDriverId(driverId);
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        user,
        restaurants,
        drivers,
        currentDriver,
        orders,
        activeOrder,
        incomingDispatch,
        cart,
        cartRestaurant,
        selectedAddressId,
        isAudioEnabled,
        setIsAudioEnabled,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setSelectedAddressId,
        checkoutOrder,
        acceptDispatchService,
        rejectDispatchService,
        updateOrderStatus,
        submitOrderReview,
        registerRestaurant,
        addMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        addPromotion,
        togglePromotion,
        toggleDriverOnline,
        selectActiveDriver,
        triggerSampleDispatchOrder,
        registerNewDriver,
        verifyDriverDocuments,
        chatMessages,
        isChatOpen,
        setIsChatOpen,
        sendChatMessage,
        callState,
        startInternalCall,
        endInternalCall,
        toggleMuteCall,
        toggleSpeakerCall,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        askSupportAI,
        developerWhatsApp,
        openDeveloperWhatsApp,
        bankConfig,
        updateBankConfig,
        transferEarningsToBankAccount,
        browserNotificationPermission,
        requestNotificationPermission,
        pushPreferences,
        updatePushPreferences,
        togglePushSubscription,
        isPushModalOpen,
        setIsPushModalOpen,
        inAppToasts,
        dismissToast,
        sendTestPush,
        adminAccount,
        isAdminLoggedIn,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        registerAdmin,
        loginAdmin,
        logoutAdmin,
        openAdminPanelDirectly,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
