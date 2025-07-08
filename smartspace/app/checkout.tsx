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
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { router } from 'expo-router';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

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

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
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
      } else {
        Alert.alert('Error', 'Failed to load cart');
        router.back();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'address', 'city', 'postalCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      return false;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return false;
    }

    // Validate card if payment method is card
    if (paymentMethod === 'card') {
      const cardValid = validateCard();
      if (!cardValid) {
        Alert.alert('Card Information', 'Please check your card information');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);

      const orderData = {
        products: cart!.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cart!.total,
        paymentMethod,
        shippingAddress,
      };

      const response = await api.createOrder(orderData);
      
      if (response.success) {
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
        Alert.alert('Error', response.error || 'Failed to place order');
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

  const updateCardData = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        const month = parseInt(formattedValue.slice(0, 2));
        if (month > 12) return;
      }
    }
    
    // Format CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));
    
    // Clear error when user starts typing
    if (cardErrors[field]) {
      setCardErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateCard = (): boolean => {
    const newErrors: Partial<CardData> = {};
    
    if (paymentMethod === 'card') {
      if (!cardData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = "Card number is required";
      } else if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }
      
      if (!cardData.cardHolder.trim()) {
        newErrors.cardHolder = "Card holder name is required";
      }
      
      if (!cardData.expiry) {
        newErrors.expiry = "Expiry date is required";
      } else if (cardData.expiry.length !== 4) {
        newErrors.expiry = "Expiry date must be MMYY format";
      }
      
      if (!cardData.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (cardData.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    }
    
    setCardErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  if (loading) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading checkout...</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
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
          {cart.items.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemName, textStyle]} numberOfLines={2}>
                  {item.productId.name}
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
              ${(cart.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Shipping Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={shippingAddress.name}
              onChangeText={(value) => updateShippingAddress('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={shippingAddress.address}
              onChangeText={(value) => updateShippingAddress('address', value)}
              placeholder="Enter your address"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={shippingAddress.city}
                onChangeText={(value) => updateShippingAddress('city', value)}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, subtitleStyle]}>Postal Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={shippingAddress.postalCode}
                onChangeText={(value) => updateShippingAddress('postalCode', value)}
                placeholder="Postal Code"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Country</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={shippingAddress.country}
              onChangeText={(value) => updateShippingAddress('country', value)}
              placeholder="Country"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, subtitleStyle]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={shippingAddress.phone}
              onChangeText={(value) => updateShippingAddress('phone', value)}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'card' ? colors.primary : colors.border }
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionContent}>
              <Ionicons
                name="card-outline"
                size={24}
                color={paymentMethod === 'card' ? colors.primary : colors.text}
              />
              <View style={styles.paymentOptionText}>
                <Text style={[styles.paymentOptionTitle, textStyle]}>Credit/Debit Card</Text>
                <Text style={[styles.paymentOptionSubtitle, subtitleStyle]}>
                  Pay securely with your card
                </Text>
              </View>
            </View>
            <Ionicons
              name={paymentMethod === 'card' ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={paymentMethod === 'card' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'cash-on-delivery' ? colors.primary : colors.border }
            ]}
            onPress={() => setPaymentMethod('cash-on-delivery')}
          >
            <View style={styles.paymentOptionContent}>
              <Ionicons
                name="cash-outline"
                size={24}
                color={paymentMethod === 'cash-on-delivery' ? colors.primary : colors.text}
              />
              <View style={styles.paymentOptionText}>
                <Text style={[styles.paymentOptionTitle, textStyle]}>Cash on Delivery</Text>
                <Text style={[styles.paymentOptionSubtitle, subtitleStyle]}>
                  Pay when you receive your order
                </Text>
              </View>
            </View>
            <Ionicons
              name={paymentMethod === 'cash-on-delivery' ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={paymentMethod === 'cash-on-delivery' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Credit Card Form */}
          {paymentMethod === 'card' && (
            <View style={[styles.cardFormSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {/* Credit Card Display */}
              <CreditCard cardData={cardData} isFlipped={isCardFlipped} />
              
              {/* Card Input Fields */}
              <View style={styles.cardInputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, subtitleStyle]}>Card Number</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: cardErrors.cardNumber ? '#ef4444' : colors.border }]}
                    value={cardData.cardNumber}
                    onChangeText={(value) => updateCardData('cardNumber', value)}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={19}
                    keyboardType="numeric"
                  />
                  {cardErrors.cardNumber && (
                    <Text style={styles.errorText}>{cardErrors.cardNumber}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, subtitleStyle]}>Card Holder Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: cardErrors.cardHolder ? '#ef4444' : colors.border }]}
                    value={cardData.cardHolder}
                    onChangeText={(value) => updateCardData('cardHolder', value)}
                    placeholder="JOHN DOE"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                  {cardErrors.cardHolder && (
                    <Text style={styles.errorText}>{cardErrors.cardHolder}</Text>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, subtitleStyle]}>Expiry Date</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: cardErrors.expiry ? '#ef4444' : colors.border }]}
                      value={cardData.expiry}
                      onChangeText={(value) => updateCardData('expiry', value)}
                      placeholder="MMYY"
                      placeholderTextColor={colors.textSecondary}
                      maxLength={4}
                      keyboardType="numeric"
                    />
                    {cardErrors.expiry && (
                      <Text style={styles.errorText}>{cardErrors.expiry}</Text>
                    )}
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.inputLabel, subtitleStyle]}>CVV</Text>
                    <View style={styles.cvvInputContainer}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: cardErrors.cvv ? '#ef4444' : colors.border, paddingRight: 40 }]}
                        value={cardData.cvv}
                        onChangeText={(value) => updateCardData('cvv', value)}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        placeholder="123"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={3}
                        keyboardType="numeric"
                        secureTextEntry={!showCvv}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowCvv(!showCvv)}
                      >
                        <Ionicons
                          name={showCvv ? 'eye-off' : 'eye'}
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    {cardErrors.cvv && (
                      <Text style={styles.errorText}>{cardErrors.cvv}</Text>
                    )}
                  </View>
                </View>

                {/* Security Info */}
                <View style={styles.securityInfo}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                  <Text style={[styles.securityText, subtitleStyle]}>
                    Your payment information is secure and encrypted
                  </Text>
                  <Ionicons name="lock-closed" size={16} color={colors.primary} />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Button
          title={processing ? 'Processing...' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={processing}
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
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  placeOrderButton: {
    marginBottom: 20,
  },
  creditCardContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  creditCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 12,
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
    padding: 12,
  },
  cardChip: {
    width: 32,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  cardNumberContainer: {
    marginTop: 12,
  },
  cardDetails: {
    marginTop: 12,
  },
  cardMagneticStripe: {
    width: '100%',
    height: 40,
    backgroundColor: 'black',
    marginTop: 12,
  },
  cardCvvContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cardCvvBox: {
    width: 40,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTypeText: {
    fontSize: 12,
    opacity: 0.8,
    color: 'white',
  },
  cardBrandText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cardNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  cardLabelText: {
    fontSize: 12,
    opacity: 0.8,
    color: 'white',
    marginBottom: 4,
  },
  cardValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  cardCvvText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  cardCvvLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  cardFormSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardInputContainer: {
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  cvvInputContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  securityText: {
    fontSize: 12,
    marginHorizontal: 8,
    textAlign: 'center',
  },
}); 