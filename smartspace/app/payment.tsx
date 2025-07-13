import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { router } from 'expo-router';

interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

// Credit Card Component
const CreditCard = ({ cardData, isFlipped }: { cardData: CardData; isFlipped: boolean }) => {
  const { colors } = useTheme();
  
  const formatCardNumber = (number: string) => {
    if (!number) return "•••• •••• •••• ••••";
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (exp: string) => {
    if (!exp) return "MM/YY";
    return exp.replace(/(\d{2})(\d{2})/, '$1/$2');
  };

  return (
    <View style={styles.creditCardContainer}>
      {/* Front of card */}
      <View style={[
        styles.creditCard,
        styles.creditCardFront,
        { backgroundColor: colors.primary },
        isFlipped && styles.creditCardFlipped
      ]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTypeText}>Credit Card</Text>
            <Text style={styles.cardBrandText}>VISA</Text>
          </View>
          <View style={styles.cardChip} />
        </View>
        
        <View style={styles.cardNumberContainer}>
          <Text style={styles.cardNumberText}>
            {formatCardNumber(cardData.cardNumber)}
          </Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View>
            <Text style={styles.cardLabelText}>Card Holder</Text>
            <Text style={styles.cardValueText}>
              {cardData.cardHolder || "YOUR NAME"}
            </Text>
          </View>
          <View>
            <Text style={styles.cardLabelText}>Expires</Text>
            <Text style={styles.cardValueText}>
              {formatExpiry(cardData.expiry)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Back of card */}
      <View style={[
        styles.creditCard,
        styles.creditCardBack,
        { backgroundColor: colors.primary },
        !isFlipped && styles.creditCardFlipped
      ]}>
        <View style={styles.cardMagneticStripe} />
        <View style={styles.cardCvvContainer}>
          <View style={styles.cardCvvBox}>
            <Text style={styles.cardCvvText}>
              {cardData.cvv || "•••"}
            </Text>
          </View>
          <Text style={styles.cardCvvLabel}>CVV</Text>
        </View>
      </View>
    </View>
  );
};

export default function PaymentScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { cartItems, cartTotal, loading } = useEcommerce();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash-on-delivery'>('cash-on-delivery');
  
  // Credit card state
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardErrors, setCardErrors] = useState<Partial<CardData>>({});

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

  const validateCard = (): boolean => {
    const errors: Partial<CardData> = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
      errors.cardHolder = 'Please enter card holder name';
    }
    
    if (!cardData.expiry || cardData.expiry.length < 4) {
      errors.expiry = 'Please enter expiry date (MMYY)';
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.cvv = 'Please enter CVV';
    }
    
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateCardData = (field: keyof CardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (cardErrors[field]) {
      setCardErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card' && !validateCard()) {
      Alert.alert('Card Information', 'Please check your card information');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    try {
      setProcessing(true);
      
      // Here you would integrate with your payment processor
      // For now, we'll simulate a successful payment
      
      // Create order data
      const orderData = {
        products: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cartTotal,
        paymentMethod,
        shippingAddress: {
          name: user?.name || '',
          address: '123 Main St',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
          phone: user?.phone || '',
        },
      };

      // Create order
      const response = await api.createOrder(orderData);
      
      if (response.success) {
        Alert.alert(
          'Payment Successful!',
          'Your order has been placed successfully.',
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
        Alert.alert('Error', response.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          Please log in to proceed with payment
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
        <Text style={[styles.loadingText, subtitleStyle]}>Loading payment...</Text>
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
        <Text style={[styles.title, textStyle]}>Payment</Text>
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
              ${cartTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
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

        {/* Credit Card Form */}
        {paymentMethod === 'card' && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, textStyle]}>Card Information</Text>
            
            <CreditCard cardData={cardData} isFlipped={isCardFlipped} />
            
            <View style={styles.cardForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, subtitleStyle]}>Card Number</Text>
                <TextInput
                  style={[styles.input, inputStyle, cardErrors.cardNumber && styles.inputError]}
                  value={cardData.cardNumber}
                  onChangeText={(value) => updateCardData('cardNumber', value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                {cardErrors.cardNumber && (
                  <Text style={styles.errorText}>{cardErrors.cardNumber}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, subtitleStyle]}>Card Holder</Text>
                  <TextInput
                    style={[styles.input, inputStyle, cardErrors.cardHolder && styles.inputError]}
                    value={cardData.cardHolder}
                    onChangeText={(value) => updateCardData('cardHolder', value.toUpperCase())}
                    placeholder="JOHN DOE"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {cardErrors.cardHolder && (
                    <Text style={styles.errorText}>{cardErrors.cardHolder}</Text>
                  )}
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, subtitleStyle]}>Expiry (MMYY)</Text>
                  <TextInput
                    style={[styles.input, inputStyle, cardErrors.expiry && styles.inputError]}
                    value={cardData.expiry}
                    onChangeText={(value) => updateCardData('expiry', value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1225"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                  {cardErrors.expiry && (
                    <Text style={styles.errorText}>{cardErrors.expiry}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, subtitleStyle]}>CVV</Text>
                <TextInput
                  style={[styles.input, inputStyle, cardErrors.cvv && styles.inputError]}
                  value={cardData.cvv}
                  onChangeText={(value) => updateCardData('cvv', value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  secureTextEntry={!showCvv}
                  onFocus={() => setIsCardFlipped(true)}
                  onBlur={() => setIsCardFlipped(false)}
                />
                <TouchableOpacity
                  style={styles.showCvvButton}
                  onPress={() => setShowCvv(!showCvv)}
                >
                  <Ionicons name={showCvv ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {cardErrors.cvv && (
                  <Text style={styles.errorText}>{cardErrors.cvv}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Button
          title={processing ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
          onPress={handlePayment}
          disabled={processing}
          loading={processing}
          style={styles.paymentButton}
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
  creditCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creditCard: {
    width: 300,
    height: 180,
    borderRadius: 12,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  creditCardFront: {
    transform: [{ rotateY: '0deg' }],
  },
  creditCardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  creditCardFlipped: {
    transform: [{ rotateY: '180deg' }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTypeText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  cardBrandText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  cardNumberContainer: {
    marginBottom: 20,
  },
  cardNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabelText: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardValueText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardMagneticStripe: {
    height: 40,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  cardCvvContainer: {
    alignItems: 'flex-end',
  },
  cardCvvBox: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  cardCvvText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardCvvLabel: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
  cardForm: {
    marginTop: 20,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  showCvvButton: {
    position: 'absolute',
    right: 12,
    top: 40,
    padding: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  paymentButton: {
    width: '100%',
  },
}); 