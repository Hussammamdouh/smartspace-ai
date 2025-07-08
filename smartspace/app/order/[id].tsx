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
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface OrderItem {
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

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'cash-on-delivery';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt-outline' },
  { key: 'processing', label: 'Processing', icon: 'settings-outline' },
  { key: 'shipped', label: 'Shipped', icon: 'car-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.getOrder(id as string);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        Alert.alert('Error', 'Order not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#4CAF50';
      case 'shipped':
        return '#2196F3';
      case 'processing':
        return '#FF9800';
      case 'pending':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReorder = () => {
    if (!order) return;
    
    Alert.alert(
      'Reorder',
      'Would you like to reorder these items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reorder',
          onPress: () => {
            // Add items to cart
            order.products.forEach(item => {
              api.addToCart(item.productId._id, item.quantity);
            });
            Alert.alert('Success', 'Items added to cart!');
            router.push('/cart');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact will be implemented soon');
  };

  if (loading) {
    return (
      <View style={[containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[containerStyle, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, textStyle]}>Order Not Found</Text>
        <Text style={[styles.errorSubtitle, subtitleStyle]}>
          The order you're looking for doesn't exist
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, textStyle]}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.orderHeader}>
            <Text style={[styles.orderNumber, textStyle]}>Order #{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.orderDate, subtitleStyle]}>
            Placed on {formatDate(order.createdAt)}
          </Text>
          <Text style={[styles.orderTotal, { color: colors.primary }]}>
            Total: ${(order.total || 0).toFixed(2)}
          </Text>
        </View>

        {/* Order Status */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Order Status</Text>
          <View style={styles.statusTimeline}>
            {statusSteps.map((step, index) => (
              <View key={step.key} style={styles.statusStep}>
                <View style={styles.statusStepContent}>
                  <View
                    style={[
                      styles.statusIcon,
                      {
                        backgroundColor: index <= currentStepIndex ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={index <= currentStepIndex ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statusStepLabel,
                      index <= currentStepIndex ? textStyle : subtitleStyle,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {index < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.statusLine,
                      {
                        backgroundColor: index < currentStepIndex ? colors.primary : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
          <Text style={[styles.statusText, { color: colors.primary }]}>
            Your order is being processed
          </Text>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Order Items</Text>
          {order.products.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View style={[styles.itemImage, { backgroundColor: colors.border }]}>
                <Text style={[styles.itemImageText, subtitleStyle]}>
                  {item.productId.name}
                </Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, textStyle]} numberOfLines={2}>
                  {item.productId.name}
                </Text>
                <Text style={[styles.itemPrice, textStyle]}>
                  ${(item.price || 0).toFixed(2)} x {item.quantity}
                </Text>
                <Text style={[styles.itemTotal, { color: colors.primary }]}>
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Shipping Address</Text>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressName, textStyle]}>{order.shippingAddress.name}</Text>
            <Text style={[styles.addressText, subtitleStyle]}>{order.shippingAddress.address}</Text>
            <Text style={[styles.addressText, subtitleStyle]}>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </Text>
            <Text style={[styles.addressText, subtitleStyle]}>{order.shippingAddress.country}</Text>
            <Text style={[styles.addressText, subtitleStyle]}>{order.shippingAddress.phone}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Payment Information</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, subtitleStyle]}>Payment Method</Text>
              <Text style={[styles.paymentValue, textStyle]}>
                {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, subtitleStyle]}>Payment Status</Text>
              <Text style={[styles.paymentValue, { color: order.isPaid ? '#4CAF50' : '#FF9800' }]}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </Text>
            </View>
            {order.paidAt && (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, subtitleStyle]}>Paid On</Text>
                <Text style={[styles.paymentValue, textStyle]}>{formatDate(order.paidAt)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Button
          title="Reorder"
          onPress={handleReorder}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Contact Support"
          onPress={handleContactSupport}
          style={styles.actionButton}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusTimeline: {
    gap: 16,
  },
  statusStep: {
    alignItems: 'center',
  },
  statusStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusStepLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusLine: {
    width: 2,
    height: 20,
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImageText: {
    fontSize: 10,
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
    fontSize: 14,
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressInfo: {
    gap: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentInfo: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
}); 