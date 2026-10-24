export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number; // Calificación otorgada por repartidores y restaurantes
  totalOrders: number;
  tier: UserTier;
  points: number;
  discountPercentage: number;
  addresses: Array<{
    id: string;
    label: string;
    address: string;
    details: string;
    coords: [number, number];
  }>;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  preparationMinutes: number;
  discountPercent?: number;
  popular?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number;
  minSpend: number;
  active: boolean;
  tag: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  rating: number;
  totalReviews: number;
  image: string;
  banner: string;
  address: string;
  coords: [number, number];
  averagePrepMinutes: number;
  minOrder: number;
  baseDeliveryFee: number;
  isOpen: boolean;
  phone: string;
  promotions: Promotion[];
  menu: MenuItem[];
}

export interface DocumentVerification {
  number: string;
  entity: string; // e.g. "Seguros SURA", "CDA Metropolitano", "MinTransporte"
  expiresAt: string;
  status: 'VIGENTE' | 'VENCIDO' | 'EN_REVISION';
  verifiedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: 'Moto Yamaha FZ' | 'Bicicleta Eléctrica' | 'Scooter Pro' | 'Moto Honda CB160';
  plate: string;
  rating: number;
  totalDeliveries: number;
  earningsToday: number;
  tipsEarnedToday: number;
  isAvailable: boolean;
  currentCoords: [number, number];
  
  // Security & Document Verification
  isVerified: boolean;
  soat: DocumentVerification;
  tecnomecanica: DocumentVerification;
  driverLicense: DocumentVerification;
}

export type OrderStatus =
  | 'BUSCANDO_REPARTIDOR'
  | 'REPARTIDOR_ASIGNADO'
  | 'EN_COCINA'
  | 'LISTO_PARA_RECOGER'
  | 'EN_CAMINO'
  | 'ENTRIGANDO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  itemNotes?: string;
}

export interface OrderCalculations {
  foodSubtotal: number;
  promotionDiscount: number;
  loyaltyDiscount: number;
  netFoodTotal: number;
  distanceKm: number;
  distanceFare: number;
  waitTimeFare: number;
  deliverySubtotal: number;
  mandatoryRiderTip: number; // 10% obligatorio por domicilio para el repartidor
  appFee: number; // 2% de ganancias de la app
  totalAmount: number;
  driverEarnings: number; // costo domicilio + 10% propina obligatoria
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  
  // Restaurant info
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCoords: [number, number];
  restaurantPrepMinutes: number;

  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  customerTier: UserTier;
  customerOrdersCount: number;
  customerAddress: string;
  customerCoords: [number, number];
  customerNotes?: string;

  // Items
  items: OrderItem[];

  // Payment
  paymentMethod: 'EFECTIVO' | 'DIGITAL';
  paymentBrand?: string;
  cashChangeWith?: number;

  // Pricing details
  calculations: OrderCalculations;

  // Driver
  assignedDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVehicle?: string;
  driverPlate?: string;
  driverRating?: number;
  driverCoords?: [number, number];

  // Timing
  estimatedWaitMinutes: number;
  estimatedTravelMinutes: number;
  totalEstimatedMinutes: number;

  // Reviews
  reviewSubmitted?: boolean;
}

export interface DispatchOffer {
  order: Order;
  expiresInSeconds: number;
}

// In-app Chat Message between Customer, Driver and AI Support
export interface ChatMessage {
  id: string;
  orderId: string;
  senderRole: 'CLIENTE' | 'REPARTIDOR' | 'IA_SOPORTE';
  senderName: string;
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
}

// Internal Call State (In-app VoIP/Phone Simulator)
export interface InternalCallState {
  isOpen: boolean;
  status: 'CALLING' | 'CONNECTED' | 'ENDED';
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
  callerName: string;
  callerPhone: string;
  callerRole: 'CLIENTE' | 'REPARTIDOR';
}

// App Owner Bank & 2% Payout Configuration
export interface AppOwnerBankConfig {
  bankName: string;
  accountType: 'Ahorros' | 'Corriente' | 'Nequi' | 'Daviplata';
  accountNumber: string;
  holderName: string;
  documentId: string;
  autoTransferDaily: boolean;
  accumulatedBalance: number;
  totalPaidOut: number;
  payoutHistory: Array<{
    id: string;
    date: string;
    amount: number;
    bankReference: string;
    status: 'TRANSFERIDO_EXITOSO';
  }>;
}

// Administrator Account (Web-only restricted access)
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'OPERATIONS_ADMIN';
  registeredAt: string;
  lastLoginAt: string;
  isVerifiedWebSession: boolean;
  avatar?: string;
  secretPin?: string;
}

// Push Notification Subscription Preferences for Customers
export interface PushSubscriptionPreferences {
  enabled: boolean;
  notifyOrderPrepared: boolean;      // Pedido preparado (Listo para recoger)
  notifyOrderDelivered: boolean;     // Pedido entregado
  notifyOrderOnTheWay: boolean;      // Pedido en camino
  notifyDriverAssigned: boolean;     // Repartidor asignado
  notifyOrderInKitchen: boolean;     // En preparación en cocina
  soundEnabled: boolean;             // Alertas audibles
  vibrateEnabled: boolean;           // Vibración táctil en móviles
  subscribedAt?: string;
  deviceToken?: string;
}

export interface InAppToastNotification {
  id: string;
  title: string;
  message: string;
  status: OrderStatus;
  orderId: string;
  timestamp: string;
  iconType: 'prepared' | 'delivered' | 'ontheway' | 'driver' | 'kitchen';
}

