import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export default function CartScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.getCart();
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setUpdating(itemId);
      const response = await api.updateCartItem(itemId, quantity);
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
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
              const response = await api.removeFromCart(itemId);
              if (response.success && response.data) {
                setCart(response.data);
              } else {
                Alert.alert('Error', response.error || 'Failed to remove item');
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const clearCart = async () => {
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
              const response = await api.clearCart();
              if (response.success && response.data) {
                setCart(response.data);
              } else {
                Alert.alert('Error', response.error || 'Failed to clear cart');
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
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

  if (loading) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>Shopping Cart</Text>
        {cart && cart.items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!cart || cart.items.length === 0 ? (
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
          {/* Cart Items */}
          <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
            {cart.items.map((item) => (
              <View
                key={item._id}
                style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.itemImage, { backgroundColor: colors.border }]}>
                  <Text style={[styles.itemImageText, subtitleStyle]}>
                    {item.productId.name}
                  </Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, textStyle]} numberOfLines={2}>
                    {item.productId.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    ${(item.price || 0).toFixed(2)}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={updating === item._id}
                    >
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={[styles.quantityText, textStyle]}>
                      {updating === item._id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        item.quantity
                      )}
                    </Text>

                    <TouchableOpacity
                      style={[styles.quantityButton, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={updating === item._id}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.itemTotal, { color: colors.primary }]}>
                    Total: ${((item.price || 0) * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item._id)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Cart Summary */}
          <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, subtitleStyle]}>Subtotal</Text>
              <Text style={[styles.summaryValue, textStyle]}>
                ${((cart.total || 0).toFixed(2))}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, subtitleStyle]}>Shipping</Text>
              <Text style={[styles.summaryValue, textStyle]}>Free</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotal, textStyle]}>Total</Text>
              <Text style={[styles.summaryTotalValue, { color: colors.primary }]}>
                ${(cart.total || 0).toFixed(2)}
              </Text>
            </View>

            <Button
              title="Proceed to Checkout"
              onPress={handleCheckout}
              style={styles.checkoutButton}
            />

            <Button
              title="Continue Shopping"
              onPress={handleContinueShopping}
              variant="outline"
              style={styles.continueButton}
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
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
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
  emptyButton: {
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    padding: 24,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 16,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 20,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
}); 