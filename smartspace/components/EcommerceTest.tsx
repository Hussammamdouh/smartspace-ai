import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from './ui/Button';

export default function EcommerceTest() {
  const { colors } = useTheme();
  const {
    products,
    categories,
    featuredProducts,
    cartItems,
    cartTotal,
    cartItemCount,
    orders,
    loading,
    errors,
    loadProducts,
    loadCategories,
    loadFeaturedProducts,
    loadCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadOrders,
    createOrder,
    refreshAll,
    clearErrors,
  } = useEcommerce();

  const containerStyle = {
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const subtitleStyle = {
    color: colors.textSecondary,
  };

  const handleTestAddToCart = async () => {
    if (products.length > 0) {
      try {
        await addToCart(products[0]._id, 1);
        console.log('Test: Added product to cart');
      } catch (error) {
        console.error('Test: Failed to add to cart:', error);
      }
    }
  };

  const handleTestRefresh = async () => {
    try {
      await refreshAll();
      console.log('Test: Refreshed all data');
    } catch (error) {
      console.error('Test: Failed to refresh:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, containerStyle]}>
      <Text style={[styles.title, textStyle]}>E-commerce System Test</Text>
      
      {/* Status */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, textStyle]}>System Status</Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Products: {products.length} | Categories: {categories.length} | Featured: {featuredProducts.length}
        </Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Cart Items: {cartItemCount} | Cart Total: ${(cartTotal || 0).toFixed(2)} | Orders: {orders.length}
        </Text>
      </View>

      {/* Loading States */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, textStyle]}>Loading States</Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Products: {loading.products ? 'Loading...' : 'Ready'}
        </Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Cart: {loading.cart ? 'Loading...' : 'Ready'}
        </Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Orders: {loading.orders ? 'Loading...' : 'Ready'}
        </Text>
        <Text style={[styles.statusText, subtitleStyle]}>
          Checkout: {loading.checkout ? 'Processing...' : 'Ready'}
        </Text>
      </View>

      {/* Errors */}
      {(errors.products || errors.cart || errors.orders || errors.checkout) && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Errors</Text>
          {errors.products && (
            <Text style={[styles.errorText, { color: 'red' }]}>Products: {errors.products}</Text>
          )}
          {errors.cart && (
            <Text style={[styles.errorText, { color: 'red' }]}>Cart: {errors.cart}</Text>
          )}
          {errors.orders && (
            <Text style={[styles.errorText, { color: 'red' }]}>Orders: {errors.orders}</Text>
          )}
          {errors.checkout && (
            <Text style={[styles.errorText, { color: 'red' }]}>Checkout: {errors.checkout}</Text>
          )}
        </View>
      )}

      {/* Test Actions */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, textStyle]}>Test Actions</Text>
        
        <View style={styles.buttonRow}>
          <Button
            title="Load Products"
            onPress={loadProducts}
            size="small"
            style={styles.testButton}
          />
          <Button
            title="Load Categories"
            onPress={loadCategories}
            size="small"
            style={styles.testButton}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Load Featured"
            onPress={loadFeaturedProducts}
            size="small"
            style={styles.testButton}
          />
          <Button
            title="Load Cart"
            onPress={loadCart}
            size="small"
            style={styles.testButton}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Load Orders"
            onPress={loadOrders}
            size="small"
            style={styles.testButton}
          />
          <Button
            title="Refresh All"
            onPress={handleTestRefresh}
            size="small"
            style={styles.testButton}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Test Add to Cart"
            onPress={handleTestAddToCart}
            size="small"
            style={styles.testButton}
            disabled={products.length === 0}
          />
          <Button
            title="Clear Errors"
            onPress={clearErrors}
            size="small"
            style={styles.testButton}
          />
        </View>
      </View>

      {/* Sample Data */}
      {products.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Sample Products</Text>
          {products.slice(0, 3).map((product) => (
            <View key={product._id} style={styles.productItem}>
              <Text style={[styles.productName, textStyle]}>{product.name}</Text>
              <Text style={[styles.productPrice, subtitleStyle]}>${(product.price || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {cartItems.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Cart Items</Text>
          {cartItems.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <Text style={[styles.cartItemName, textStyle]}>{item.product.name}</Text>
              <Text style={[styles.cartItemQuantity, subtitleStyle]}>Qty: {item.quantity}</Text>
              <Text style={[styles.cartItemPrice, subtitleStyle]}>${(item.price || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  testButton: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  cartItemQuantity: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 