import { Order, OrderStatus, PushSubscriptionPreferences } from '../types';
import { formatCurrency } from './pricing';

export const MANDAO_LOGO_URL = '/src/assets/images/mandao_logo_1792810017576.jpg';

export const DEFAULT_PUSH_PREFERENCES: PushSubscriptionPreferences = {
  enabled: true,
  notifyOrderPrepared: true,    // 'Pedido preparado'
  notifyOrderDelivered: true,   // 'Entregado'
  notifyOrderOnTheWay: true,    // 'En camino'
  notifyDriverAssigned: true,   // 'Repartidor asignado'
  notifyOrderInKitchen: false,  // 'En cocina' (opcional)
  soundEnabled: true,
  vibrateEnabled: true,
  subscribedAt: new Date().toISOString(),
  deviceToken: `mandao_push_${Math.random().toString(36).substring(2, 10)}`,
};

export interface DispatchNotificationPayload {
  orderId: string;
  restaurantName: string;
  customerName: string;
  customerAddress: string;
  driverEarnings: number;
  mandatoryTip: number;
  paymentMethod: 'EFECTIVO' | 'DIGITAL';
}

/**
 * Checks if browser supports Notifications API
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission status
 */
export function getBrowserNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Prompts user to grant notification permissions
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return 'denied';
  }
}

/**
 * Synthesizes an audio chime using Web Audio API when an order is prepared
 */
export function playPreparedAudioChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Cheerful warm harmonic chime (E5 -> G#5 -> B5)
    const freqs = [659.25, 830.61, 987.77];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.75);
    });
  } catch {
    // Audio context may fail if user hasn't interacted yet
  }
}

/**
 * Synthesizes a celebratory chime when an order is delivered
 */
export function playDeliveredAudioChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Celebratory victory fanfare (C5 -> E5 -> G5 -> C6)
    const notes = [
      { freq: 523.25, delay: 0.0, dur: 0.3 },
      { freq: 659.25, delay: 0.12, dur: 0.3 },
      { freq: 783.99, delay: 0.24, dur: 0.35 },
      { freq: 1046.5, delay: 0.38, dur: 0.8 },
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  } catch {
    // Audio context may fail if user hasn't interacted yet
  }
}

/**
 * Synthesizes a subtle notification chime for other order updates
 */
export function playStatusUpdateChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Silently handle
  }
}

/**
 * Triggers hardware vibration on supported mobile devices
 */
function triggerVibration(pattern: number[] = [200, 100, 200]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently ignore
  }
}

/**
 * Dispatches a personalized browser push notification to the customer
 * when an order status changes (e.g. "Pedido preparado", "Entregado", etc.).
 */
export function sendOrderStatusPushNotification(
  order: Order,
  newStatus: OrderStatus,
  prefs: PushSubscriptionPreferences,
  onClickCallback?: () => void
): Notification | null {
  // Check if push notifications are enabled and permitted
  if (!prefs.enabled) return null;
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return null;

  let title = '';
  let body = '';
  let shouldNotify = false;
  let audioType: 'prepared' | 'delivered' | 'update' | 'none' = 'none';

  switch (newStatus) {
    case 'LISTO_PARA_RECOGER':
      shouldNotify = prefs.notifyOrderPrepared;
      title = `👨‍🍳 ¡Tu pedido está preparado! - ${order.restaurantName}`;
      body = `¡Buenas noticias! Tu orden #${order.id} ya salió de cocina y está empaquetada lista para ser entregada. ¡Tu comida está calientita!`;
      audioType = 'prepared';
      break;

    case 'ENTREGADO':
      shouldNotify = prefs.notifyOrderDelivered;
      title = `🎉 ¡Tu pedido ha sido entregado! - Mandao`;
      body = `¡Buen provecho! Tu pedido #${order.id} de ${order.restaurantName} llegó a ${order.customerAddress}. ¡Gracias por confiar en Mandao!`;
      audioType = 'delivered';
      break;

    case 'EN_CAMINO':
      shouldNotify = prefs.notifyOrderOnTheWay;
      title = `🛵 ¡Tu pedido va en camino! - Mandao`;
      body = `${order.driverName || 'Tu repartidor'} va en trayecto hacia ${order.customerAddress}. Tiempo estimado: ~${order.estimatedTravelMinutes} min.`;
      audioType = 'update';
      break;

    case 'REPARTIDOR_ASIGNADO':
      shouldNotify = prefs.notifyDriverAssigned;
      title = `🏍️ Repartidor asignado a tu pedido`;
      body = `${order.driverName || 'Un repartidor Mandao'} (${order.driverVehicle || 'Vehículo'}, placa ${order.driverPlate || '---'}) recogerá tu orden #${order.id}.`;
      audioType = 'update';
      break;

    case 'EN_COCINA':
      shouldNotify = prefs.notifyOrderInKitchen;
      title = `🍳 ${order.restaurantName} está cocinando tu orden`;
      body = `Los chefs están preparando tus platos con ingredientes frescos. Espera estimada: ~${order.restaurantPrepMinutes} min.`;
      audioType = 'update';
      break;

    default:
      shouldNotify = false;
  }

  if (!shouldNotify) return null;

  // Sound playback according to user preference
  if (prefs.soundEnabled) {
    if (audioType === 'prepared') playPreparedAudioChime();
    else if (audioType === 'delivered') playDeliveredAudioChime();
    else if (audioType === 'update') playStatusUpdateChime();
  }

  // Vibration on mobile
  if (prefs.vibrateEnabled) {
    if (newStatus === 'ENTREGADO') {
      triggerVibration([300, 100, 300, 100, 500]);
    } else if (newStatus === 'LISTO_PARA_RECOGER') {
      triggerVibration([200, 100, 200, 100, 250]);
    } else {
      triggerVibration([150, 80, 150]);
    }
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: MANDAO_LOGO_URL,
      badge: MANDAO_LOGO_URL,
      tag: `mandao-status-${order.id}-${newStatus}`,
      requireInteraction: newStatus === 'ENTREGADO' || newStatus === 'LISTO_PARA_RECOGER',
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      if (onClickCallback) {
        onClickCallback();
      }
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error al emitir notificación push de pedido:', error);
    return null;
  }
}

/**
 * Sends an interactive test push notification to verify the browser notification works
 */
export function sendTestPushNotification(
  type: 'PREPARADO' | 'ENTREGADO' | 'EN_CAMINO',
  prefs: PushSubscriptionPreferences,
  onClickCallback?: () => void
): Notification | null {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return null;

  let title = '';
  let body = '';

  if (type === 'PREPARADO') {
    title = `👨‍🍳 [Prueba] ¡Tu pedido está preparado! - Mandao`;
    body = `Prueba de notificación push personalizada: Tu orden de 'La Fogata Gourmet' está lista y calientita en cocina.`;
    if (prefs.soundEnabled) playPreparedAudioChime();
    if (prefs.vibrateEnabled) triggerVibration([200, 100, 200]);
  } else if (type === 'ENTREGADO') {
    title = `🎉 [Prueba] ¡Pedido entregado! - Mandao`;
    body = `Prueba de notificación push personalizada: Tu pedido ha llegado a Cra 43A # 1-50. ¡Buen provecho!`;
    if (prefs.soundEnabled) playDeliveredAudioChime();
    if (prefs.vibrateEnabled) triggerVibration([300, 100, 300, 100, 500]);
  } else {
    title = `🛵 [Prueba] ¡Pedido en camino! - Mandao`;
    body = `Prueba de notificación push personalizada: El repartidor Carlos Restrepo va en camino hacia tu ubicación.`;
    if (prefs.soundEnabled) playStatusUpdateChime();
    if (prefs.vibrateEnabled) triggerVibration([150, 80, 150]);
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: MANDAO_LOGO_URL,
      badge: MANDAO_LOGO_URL,
      tag: `mandao-test-${Date.now()}`,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      if (onClickCallback) onClickCallback();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    return null;
  }
}

/**
 * Displays a real browser-level notification for incoming dispatch to riders
 */
export function sendBrowserDispatchNotification(
  payload: DispatchNotificationPayload,
  onClickCallback?: () => void
): Notification | null {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  const paymentText =
    payload.paymentMethod === 'EFECTIVO' ? 'Efectivo (Cobrar al entregar)' : 'Pago Digital en App';

  const title = `🛵 ¡Nuevo Mandao Entrante! Ganarás ${formatCurrency(payload.driverEarnings)}`;
  const body = `📍 Recoger en: ${payload.restaurantName}\n🏠 Entregar a: ${payload.customerName} (${payload.customerAddress})\n⭐ Incluye 10% Propina Obligatoria (${formatCurrency(payload.mandatoryTip)})\n💳 Método: ${paymentText}`;

  try {
    triggerVibration([250, 100, 250, 100, 400]);

    const notification = new Notification(title, {
      body,
      icon: MANDAO_LOGO_URL,
      badge: MANDAO_LOGO_URL,
      tag: `mandao-order-${payload.orderId}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      if (onClickCallback) {
        onClickCallback();
      }
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error al mostrar notificación de navegador:', error);
    return null;
  }
}
