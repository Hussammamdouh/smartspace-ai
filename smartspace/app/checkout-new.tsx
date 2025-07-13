import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    cartItems,
    cartTotal,
    loading,
    errors,
    createOrder,
  } = useEcommerce();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash-on-delivery'>('cash-on-delivery');
  const [processing, setProcessing] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

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

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  };

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'address', 'city', 'postalCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      return false;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);

      const orderData = {
        products: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cartTotal,
        paymentMethod,
        shippingAddress,
      };

      const order = await createOrder(orderData);
      
      if (order) {
        Alert.alert(
          'Order Placed Successfully!',
          'Your order has been placed and will be processed soon.',
          [
            {
              text: 'View Orders',
              onPress: () => router.push('/profile'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/explore'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          Please log in to proceed with checkout
        </Text>
        <Button
          title="Login"
          onPress={() => router.push('/auth/login')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  if (loading.cart) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading checkout...</Text>
      </View>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Empty Cart</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          Your cart is empty. Add some items to proceed.
        </Text>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/explore')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, textStyle]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemName, textStyle]} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[styles.orderItemQuantity, subtitleStyle]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, textStyle]}>
                ${((item.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, textStyle]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${(cartTotal || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Shipping Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Full Name</Text>
            <TextInput
              style={[styles.input, inputStyle]}
              value={shippingAddress.name}
              onChangeText={(value) => updateShippingAddress('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Address</Text>
            <TextInput
              style={[styles.input, inputStyle]}
              value={shippingAddress.address}
              onChangeText={(value) => updateShippingAddress('address', value)}
              placeholder="Enter your address"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>City</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                value={shippingAddress.city}
                onChangeText={(value) => updateShippingAddress('city', value)}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>Postal Code</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                value={shippingAddress.postalCode}
                onChangeText={(value) => updateShippingAddress('postalCode', value)}
                placeholder="Postal Code"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>Country</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                value={shippingAddress.country}
                onChangeText={(value) => updateShippingAddress('country', value)}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>Phone</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                value={shippingAddress.phone}
                onChangeText={(value) => updateShippingAddress('phone', value)}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              paymentMethod === 'cash-on-delivery' && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setPaymentMethod('cash-on-delivery')}
          >
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, textStyle]}>Cash on Delivery</Text>
              <Text style={[styles.paymentDescription, subtitleStyle]}>
                Pay when you receive your order
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              { borderColor: colors.border },
              paymentMethod === 'cash-on-delivery' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}>
              {paymentMethod === 'cash-on-delivery' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              paymentMethod === 'card' && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, textStyle]}>Credit/Debit Card</Text>
              <Text style={[styles.paymentDescription, subtitleStyle]}>
                Pay securely with your card
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              { borderColor: colors.border },
              paymentMethod === 'card' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}>
              {paymentMethod === 'card' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Button
          title={processing ? 'Processing...' : `Place Order - $${cartTotal.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={processing}
          loading={processing}
          style={styles.placeOrderButton}
        />
      </View>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  emptyButton: {
    minWidth: 200,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  placeOrderButton: {
    width: '100%',
  },
}); 