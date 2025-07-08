import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineAction {
  id: string;
  type: 'add_to_cart' | 'add_to_wishlist' | 'create_order' | 'update_profile';
  data: any;
  timestamp: number;
}

class OfflineService {
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly OFFLINE_ACTIONS_KEY = 'offline_actions';
  private readonly CACHE_KEYS = {
    PRODUCTS: 'cached_products',
    CART: 'cached_cart',
    WISHLIST: 'cached_wishlist',
    USER_PROFILE: 'cached_user_profile',
    ORDERS: 'cached_orders',
    DESIGNS: 'cached_designs',
  };

  // Cache Management
  async cacheData<T>(key: string, data: T, expiryHours: number = 24): Promise<void> {
    try {
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cachedData: CachedData<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cachedData.expiresAt) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        await AsyncStorage.removeItem(key);
      } else {
        // Clear all cache
        const keys = Object.values(this.CACHE_KEYS);
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Product Cache
  async cacheProducts(products: any[]): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.PRODUCTS, products, 6); // 6 hours
  }

  async getCachedProducts(): Promise<any[] | null> {
    return await this.getCachedData<any[]>(this.CACHE_KEYS.PRODUCTS);
  }

  // Cart Cache
  async cacheCart(cart: any): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.CART, cart, 1); // 1 hour
  }

  async getCachedCart(): Promise<any | null> {
    return await this.getCachedData<any>(this.CACHE_KEYS.CART);
  }

  // Wishlist Cache
  async cacheWishlist(wishlist: any): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.WISHLIST, wishlist, 1); // 1 hour
  }

  async getCachedWishlist(): Promise<any | null> {
    return await this.getCachedData<any>(this.CACHE_KEYS.WISHLIST);
  }

  // User Profile Cache
  async cacheUserProfile(profile: any): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.USER_PROFILE, profile, 12); // 12 hours
  }

  async getCachedUserProfile(): Promise<any | null> {
    return await this.getCachedData<any>(this.CACHE_KEYS.USER_PROFILE);
  }

  // Orders Cache
  async cacheOrders(orders: any[]): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.ORDERS, orders, 2); // 2 hours
  }

  async getCachedOrders(): Promise<any[] | null> {
    return await this.getCachedData<any[]>(this.CACHE_KEYS.ORDERS);
  }

  // Designs Cache
  async cacheDesigns(designs: any[]): Promise<void> {
    await this.cacheData(this.CACHE_KEYS.DESIGNS, designs, 6); // 6 hours
  }

  async getCachedDesigns(): Promise<any[] | null> {
    return await this.getCachedData<any[]>(this.CACHE_KEYS.DESIGNS);
  }

  // Offline Actions Management
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const offlineActions = await this.getOfflineActions();
      const newAction: OfflineAction = {
        ...action,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      
      offlineActions.push(newAction);
      await AsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(offlineActions));
    } catch (error) {
      console.error('Error adding offline action:', error);
    }
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actions = await AsyncStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting offline actions:', error);
      return [];
    }
  }

  async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const filteredActions = actions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(filteredActions));
    } catch (error) {
      console.error('Error removing offline action:', error);
    }
  }

  async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing offline actions:', error);
    }
  }

  // Network Status
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  // Sync Management
  async syncOfflineActions(): Promise<void> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) return;

      const actions = await this.getOfflineActions();
      if (actions.length === 0) return;

      console.log(`Syncing ${actions.length} offline actions...`);

      for (const action of actions) {
        try {
          await this.processOfflineAction(action);
          await this.removeOfflineAction(action.id);
        } catch (error) {
          console.error(`Error processing offline action ${action.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  }

  private async processOfflineAction(action: OfflineAction): Promise<void> {
    // This would typically make API calls to sync the actions
    // For now, we'll just log them
    console.log('Processing offline action:', action);
    
    // Example implementation:
    // switch (action.type) {
    //   case 'add_to_cart':
    //     await api.addToCart(action.data.productId, action.data.quantity);
    //     break;
    //   case 'add_to_wishlist':
    //     await api.addToWishlist(action.data.productId);
    //     break;
    //   // ... other cases
    // }
  }

  // Storage Management
  async getStorageInfo(): Promise<{ used: number; total: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return {
        used: totalSize,
        total: 50 * 1024 * 1024, // Assume 50MB limit
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0 };
    }
  }

  async cleanupOldCache(): Promise<void> {
    try {
      const keys = Object.values(this.CACHE_KEYS);
      for (const key of keys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cachedData = JSON.parse(cached);
          if (Date.now() > cachedData.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old cache:', error);
    }
  }
}

export const offlineService = new OfflineService();
export default offlineService; 