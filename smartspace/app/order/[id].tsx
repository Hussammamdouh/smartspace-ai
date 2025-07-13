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
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEcommerce } from '../../contexts/EcommerceContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
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

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { addToCart } = useEcommerce();
  const { id } = useLocalSearchParams<{ id: string }>();
  
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
      const response = await api.getOrder(id);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        Alert.alert('Error', 'Failed to load order');
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

  const handleReorder = async () => {
    if (!order) return;

    try {
      // Add all products from the order to cart
      for (const item of order.products) {
        await addToCart(item.productId, item.quantity);
      }
      
      Alert.alert('Success', 'Order items added to cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to add items to cart');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.cancelOrder(order._id);
              if (response.success) {
                Alert.alert('Success', 'Order cancelled successfully');
                loadOrder(); // Reload order to update status
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel order');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'construct-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  };

  if (loading) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
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
            <View>
              <Text style={[styles.orderNumber, textStyle]}>#{order.orderNumber}</Text>
              <Text style={[styles.orderDate, subtitleStyle]}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons name={getStatusIcon(order.status)} size={16} color="white" />
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Order Items</Text>
          {order.products.map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, textStyle]}>{item.name}</Text>
                <Text style={[styles.itemQuantity, subtitleStyle]}>
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
              ${(order.total || 0).toFixed(2)}
            </Text>
          </View>
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
            <Text style={[styles.paymentMethod, textStyle]}>
              Payment Method: {order.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}
            </Text>
            <Text style={[styles.paymentStatus, { color: order.isPaid ? colors.primary : colors.textSecondary }]}>
              Status: {order.isPaid ? 'Paid' : 'Pending'}
            </Text>
            {order.paidAt && (
              <Text style={[styles.paymentDate, subtitleStyle]}>
                Paid on: {new Date(order.paidAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Button
          title="Reorder"
          onPress={handleReorder}
          style={styles.reorderButton}
        />
        
        {order.status === 'pending' && (
          <Button
            title="Cancel Order"
            onPress={handleCancelOrder}
            variant="outline"
            style={styles.cancelButton}
          />
        )}
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    marginRight: 16,
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
    gap: 4,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentDate: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  reorderButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
}); 