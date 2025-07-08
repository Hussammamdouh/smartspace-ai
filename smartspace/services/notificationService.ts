import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'order_update' | 'design_complete' | 'promotion' | 'general';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get push token (only for development builds, not Expo Go)
      if (Device.isDevice && !__DEV__) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PROJECT_ID || 'your-project-id',
          });
          this.expoPushToken = token.data;
          
          // Save token to storage
          await AsyncStorage.setItem('expoPushToken', token.data);
          
          // Send token to backend
          await this.registerToken(token.data);
        } catch (error) {
          console.log('Push notifications not available in Expo Go. Use development build for full functionality.');
        }
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async registerToken(token: string) {
    try {
      // This would typically send the token to your backend
      // For now, we'll just store it locally
      console.log('Push token registered:', token);
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  private setupNotificationListeners() {
    // Handle notification received while app is running
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    switch (data?.type) {
      case 'order_update':
        // Navigate to order details
        // router.push(`/order/${data.orderId}`);
        break;
      case 'design_complete':
        // Navigate to design details
        // router.push(`/design/${data.designId}`);
        break;
      case 'promotion':
        // Navigate to promotion or product
        // router.push(`/product/${data.productId}`);
        break;
      default:
        // Handle general notifications
        break;
    }
  }

  async scheduleLocalNotification(notification: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async scheduleOrderUpdateNotification(orderId: string, status: string) {
    const statusMessages = {
      'processing': 'Your order is being processed',
      'shipped': 'Your order has been shipped!',
      'delivered': 'Your order has been delivered!',
      'cancelled': 'Your order has been cancelled',
    };

    await this.scheduleLocalNotification({
      type: 'order_update',
      title: 'Order Update',
      body: statusMessages[status as keyof typeof statusMessages] || 'Order status updated',
      data: { orderId, status },
    });
  }

  async scheduleDesignCompleteNotification(designId: string, title: string) {
    await this.scheduleLocalNotification({
      type: 'design_complete',
      title: 'Design Complete!',
      body: `Your design "${title}" is ready to view`,
      data: { designId },
    });
  }

  async schedulePromotionNotification(title: string, body: string, productId?: string) {
    await this.scheduleLocalNotification({
      type: 'promotion',
      title,
      body,
      data: { productId },
    });
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
export default notificationService; 