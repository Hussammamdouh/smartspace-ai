import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all stored data from AsyncStorage
 * Call this function to completely clear all app data
 */
export const clearAllCache = async () => {
  try {
    console.log('🧹 Clearing all stored data...');
    
    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Found keys:', allKeys);
    
    if (allKeys.length > 0) {
      // Remove all keys
      await AsyncStorage.multiRemove(allKeys);
      console.log('✅ All stored data cleared successfully!');
    } else {
      console.log('📭 No stored data found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear specific user and cart data
 */
export const clearUserAndCartData = async () => {
  try {
    console.log('🧹 Clearing user and cart data...');
    
    const keysToRemove = [
      'token',
      'user',
      'authToken',
      'refreshToken',
      'cart',
      'cached_cart',
      'cached_user_profile',
      'cached_orders',
      'cached_wishlist',
      'offline_actions'
    ];
    
    for (const key of keysToRemove) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      } catch (error) {
        console.log(`⚠️ Could not remove ${key}`);
      }
    }
    
    console.log('✅ User and cart data cleared!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing user and cart data:', error);
    return false;
  }
};

export default clearAllCache; 