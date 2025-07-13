import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  console.log('CartScreen: Component rendering');
  
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    loading,
    errors,
    loadCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  } = useEcommerce();

  console.log('CartScreen: User:', user ? 'Logged in' : 'Not logged in');
  console.log('CartScreen: Cart items:', cartItems?.length || 0);
  console.log('CartScreen: Loading:', loading.cart);
  console.log('CartScreen: Errors:', errors.cart);

  // Load cart when component mounts
  useEffect(() => {
    console.log('CartScreen: Loading cart on mount');
    loadCart().catch(error => {
      console.error('CartScreen: Failed to load cart on mount:', error);
    });
  }, [loadCart]);

  // Add error boundary for cart screen
  if (!colors) {
    console.error('CartScreen: Theme colors not available');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Theme Error</Text>
        <Text style={{ color: '#ccc', fontSize: 14, marginTop: 8 }}>Please restart the app</Text>
      </View>
    );
  }

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const subtitleStyle = {
    color: colors.textSecondary,
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await updateCartItemQuantity(itemId, quantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId);
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your entire cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  const handleForceClearCart = async () => {
    Alert.alert(
      'Force Clear Cart',
      'This will clear all cart data from storage and memory. Use this if cart is stuck.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all possible cart storage
              await AsyncStorage.removeItem('cart');
              await AsyncStorage.removeItem('cached_cart');
              
              // Reload cart to clear memory state
              await loadCart();
              
              Alert.alert('Success', 'Cart forcefully cleared');
            } catch (error) {
              console.error('Force clear error:', error);
              Alert.alert('Error', 'Failed to force clear cart');
            }
          },
        },
      ]
    );
  };

  const handleNuclearClear = async () => {
    Alert.alert(
      '🧨 Nuclear Clear - Clear ALL Data',
      'This will clear EVERYTHING from storage:\n\n• All user data\n• All cart data\n• All cached data\n• All app preferences\n\nYou will need to login again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🧨 Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🧨 Starting nuclear clear...');
              
              // Get all keys and remove them
              const allKeys = await AsyncStorage.getAllKeys();
              console.log('📋 Keys to clear:', allKeys);
              
              if (allKeys.length > 0) {
                await AsyncStorage.multiRemove(allKeys);
                console.log('✅ All data cleared');
              }
              
              // Force reload cart to clear memory state
              await loadCart();
              
              Alert.alert(
                '✅ Success', 
                'All data cleared! The app will now start fresh.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Nuclear clear error:', error);
              Alert.alert('❌ Error', 'Failed to clear all data');
            }
          },
        },
      ]
    );
  };

  const handleDebugCart = async () => {
    try {
      // Debug cart storage
      const allKeys = await AsyncStorage.getAllKeys();
      const cartKeys = allKeys.filter(key => key.toLowerCase().includes('cart'));
      console.log('Cart-related storage keys:', cartKeys);
      
      for (const key of cartKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`Key: ${key}, Value:`, value);
      }
      
      Alert.alert('Debug Info', `Found ${cartKeys.length} cart-related storage keys. Check console for details.`);
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Debug Error', 'Failed to debug cart storage');
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Stored Data',
      'This will clear ALL stored data including user login, cart, and any cached data. You will need to login again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              const allKeys = await AsyncStorage.getAllKeys();
              if (allKeys.length > 0) {
                await AsyncStorage.multiRemove(allKeys);
              }
              Alert.alert('Success', 'All stored data cleared. Please restart the app.');
            } catch (error) {
              console.error('Clear all data error:', error);
              Alert.alert('Error', 'Failed to clear all data');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/explore');
  };

  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          Please log in to view your cart
        </Text>
        <View style={styles.authButtons}>
          <Button
            title="Login"
            onPress={() => router.push('/auth/login')}
            style={styles.emptyButton}
          />
          <Button
            title="Register"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            style={styles.emptyButton}
          />
        </View>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/(tabs)')}
          variant="ghost"
          style={styles.continueButton}
        />
      </View>
    );
  }

  if (loading.cart) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading cart...</Text>
      </View>
    );
  }

  if (errors.cart) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Error Loading Cart</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          {errors.cart}
        </Text>
        <Button
          title="Try Again"
          onPress={() => router.push('/cart')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>Shopping Cart</Text>
                  <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => loadCart()} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDebugCart} style={styles.debugButton}>
              <Ionicons name="bug-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNuclearClear} style={styles.debugButton}>
              <Ionicons name="trash" size={20} color="#dc3545" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAllData} style={styles.debugButton}>
              <Ionicons name="person-remove-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {cartItems && cartItems.length > 0 && (
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={[styles.clearButton, { color: colors.primary }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>
      </View>

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={[styles.debugText, subtitleStyle]}>
          Cart Items: {cartItems?.length || 0}
        </Text>
        <Text style={[styles.debugText, subtitleStyle]}>
          Cart Total: ${(cartTotal || 0).toFixed(2)}
        </Text>
        <Text style={[styles.debugText, subtitleStyle]}>
          Item Count: {cartItemCount || 0}
        </Text>
        <Text style={[styles.debugText, subtitleStyle]}>
          Loading: {loading.cart ? 'Yes' : 'No'}
        </Text>
        {errors.cart && (
          <Text style={[styles.debugText, { color: 'red' }]}>
            Error: {errors.cart}
          </Text>
        )}
      </View>

      {!cartItems || cartItems.length === 0 ? (
        <View style={[styles.centerContainer, { flex: 1 }]}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, textStyle]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, subtitleStyle]}>
            Add some products to get started
          </Text>
          <Button
            title="Continue Shopping"
            onPress={handleContinueShopping}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.cartList}>
            {cartItems.map((item) => (
              <View
                key={item._id}
                style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                {/* Product Image */}
                <View style={[styles.productImage, { backgroundColor: colors.border }]}>
                  {(item.product?.imageUrl || item.imageUrl || item.image) ? (
                    <Image
                      source={{ uri: item.product?.imageUrl || item.imageUrl || item.image }}
                      style={styles.productImageContent}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                    </View>
                  )}
                </View>

                {/* Product Details */}
                <View style={styles.productDetails}>
                  <Text style={[styles.productName, textStyle]} numberOfLines={2}>
                    {item.product?.name || item.name || 'Unknown Product'}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    ${((item.product?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                  
                  {/* Quantity Controls */}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: colors.border }]}
                      onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={item.quantity <= 1 ? colors.textSecondary : colors.text}
                      />
                    </TouchableOpacity>
                    
                    <Text style={[styles.quantityText, textStyle]}>
                      {item.quantity}
                    </Text>
                    
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: colors.border }]}
                      onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item._id)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Cart Summary */}
          <View style={[styles.cartSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, subtitleStyle]}>Items ({cartItemCount})</Text>
              <Text style={[styles.summaryValue, textStyle]}>
                ${(cartTotal || 0).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, subtitleStyle]}>Shipping</Text>
              <Text style={[styles.summaryValue, textStyle]}>Free</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, textStyle]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${(cartTotal || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Button
              title={`Proceed to Checkout - $${(cartTotal || 0).toFixed(2)}`}
              onPress={handleCheckout}
              style={styles.checkoutButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  debugButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 120,
  },
  continueButton: {
    minWidth: 200,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  productImageContent: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  cartSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutButton: {
    width: '100%',
  },
  debugContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
  },
}); 