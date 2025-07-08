import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { router, useLocalSearchParams } from 'expo-router';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: any[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'card-outline',
    description: 'Pay with Visa, Mastercard, or American Express',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'logo-paypal',
    description: 'Pay with your PayPal account',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: 'logo-apple',
    description: 'Pay with Apple Pay',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: 'logo-google',
    description: 'Pay with Google Pay',
  },
];

export default function PaymentScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [processing, setProcessing] = useState(false);

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
    loadOrderSummary();
  }, []);

  const loadOrderSummary = async () => {
    try {
      setLoading(true);
      // In a real app, you'd get this from the order/cart
      const mockSummary: OrderSummary = {
        subtotal: 299.99,
        shipping: 15.00,
        tax: 25.50,
        total: 340.49,
        items: [
          { name: 'Modern Coffee Table', price: 199.99, quantity: 1 },
          { name: 'Accent Chair', price: 100.00, quantity: 1 },
        ],
      };
      setOrderSummary(mockSummary);
    } catch (error) {
      console.error('Error loading order summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to complete payment');
      return;
    }

    if (!orderSummary) {
      Alert.alert('Error', 'Order summary not available');
      return;
    }

    try {
      setProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order
      const orderData = {
        items: orderSummary.items,
        total: orderSummary.total,
        paymentMethod: selectedMethod,
        shippingAddress: {
          // This would come from user's saved address or form
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      };

      const response = await api.createOrder(orderData);
      
      if (response.success && response.data) {
        Alert.alert(
          'Payment Successful!',
          'Your order has been placed successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'View Order',
              onPress: () => router.push({
                pathname: '/order/[id]',
                params: { id: response.data._id }
              }),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/explore'),
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', response.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'An error occurred while processing your payment');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selectedMethod === method.id && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={() => setSelectedMethod(method.id)}
    >
      <View style={styles.methodHeader}>
        <View style={styles.methodIcon}>
          <Ionicons name={method.icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodName, textStyle]}>{method.name}</Text>
          <Text style={[styles.methodDescription, subtitleStyle]}>{method.description}</Text>
        </View>
        <View style={[
          styles.radioButton,
          { borderColor: colors.border },
          selectedMethod === method.id && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}>
          {selectedMethod === method.id && (
            <View style={styles.radioInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderItem = (item: any, index: number) => (
    <View key={index} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, textStyle]}>{item.name}</Text>
        <Text style={[styles.itemQuantity, subtitleStyle]}>Qty: {item.quantity}</Text>
      </View>
      <Text style={[styles.itemPrice, textStyle]}>
        ${(item.price || 0).toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading payment details...</Text>
      </View>
    );
  }

  if (!orderSummary) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, textStyle]}>Order Not Found</Text>
        <Text style={[styles.errorSubtitle, subtitleStyle]}>
          Unable to load order details
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.errorButton}
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
        <Text style={[styles.title, textStyle]}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Order Summary</Text>
          
          {orderSummary.items.map(renderOrderItem)}
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, subtitleStyle]}>Subtotal</Text>
            <Text style={[styles.summaryValue, textStyle]}>
              ${(orderSummary.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, subtitleStyle]}>Shipping</Text>
            <Text style={[styles.summaryValue, textStyle]}>
              ${(orderSummary.shipping || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, subtitleStyle]}>Tax</Text>
            <Text style={[styles.summaryValue, textStyle]}>
              ${(orderSummary.tax || 0).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, textStyle]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${(orderSummary.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, textStyle]}>Secure Payment</Text>
            <Text style={[styles.securityDescription, subtitleStyle]}>
              Your payment information is encrypted and secure. We never store your card details.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Button
          title={processing ? 'Processing Payment...' : `Pay $${(orderSummary.total || 0).toFixed(2)}`}
          onPress={handlePayment}
          disabled={processing}
          loading={processing}
          style={styles.payButton}
        />
        <Text style={[styles.termsText, subtitleStyle]}>
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </Text>
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethod: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  securityNotice: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  payButton: {
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
}); 