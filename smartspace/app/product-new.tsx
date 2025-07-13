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
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  style?: string;
  color?: string;
  imageUrl?: string;
  inStock: boolean;
  stock: number;
  available: boolean;
}

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { addToCart } = useEcommerce();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params?.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

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
    console.log('Product detail screen - ID from params:', id);
    console.log('All params:', params);
    
    if (id) {
      loadProduct();
    } else {
      console.error('No product ID provided');
      Alert.alert('Error', 'No product ID provided');
      router.back();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      
      const response = await api.getProduct(id);
      console.log('Product API response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure: { data: { data: { product } } }
        let productData = response.data;
        
        // Extract product from nested structure if needed
        if (productData.data && typeof productData.data === 'object') {
          productData = productData.data;
        }
        
        // Ensure price is a number
        if (productData.price !== undefined) {
          productData.price = Number(productData.price);
        }
        
        // Transform product to match frontend interface
        const transformedProduct: Product = {
          _id: productData._id,
          name: productData.name,
          description: productData.description,
          price: productData.price || 0,
          category: productData.category,
          style: productData.style,
          color: productData.color,
          imageUrl: productData.imageUrl || productData.image,
          inStock: productData.available && productData.stock > 0,
          stock: productData.stock || 0,
          available: productData.available || false,
        };
        
        console.log("Setting product:", transformedProduct);
        setProduct(transformedProduct);
      } else {
        console.error('Failed to load product:', response.error);
        Alert.alert('Error', response.error || 'Failed to load product');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to cart');
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      console.log('Adding to cart:', product._id, quantity);
      await addToCart(product._id, quantity);
      Alert.alert('Success', 'Item added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to wishlist');
      return;
    }

    try {
      const response = await api.addToWishlist(id);
      if (response.success) {
        Alert.alert('Success', 'Item added to wishlist!');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      Alert.alert('Error', 'Failed to add to wishlist');
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, textStyle]}>Product Not Found</Text>
        <Text style={[styles.errorSubtitle, subtitleStyle]}>
          The product you&apos;re looking for doesn&apos;t exist
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
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleAddToWishlist} style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.actionButton}>
            <Ionicons name="cart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.imagePlaceholderText, subtitleStyle]}>No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, textStyle]}>{product.name}</Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            ${(product.price || 0).toFixed(2)}
          </Text>
          
          <View style={styles.productMeta}>
            <View style={[styles.metaItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metaLabel, subtitleStyle]}>Category</Text>
              <Text style={[styles.metaValue, textStyle]}>{product.category}</Text>
            </View>
            {product.style && (
              <View style={[styles.metaItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.metaLabel, subtitleStyle]}>Style</Text>
                <Text style={[styles.metaValue, textStyle]}>{product.style}</Text>
              </View>
            )}
            {product.color && (
              <View style={[styles.metaItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.metaLabel, subtitleStyle]}>Color</Text>
                <Text style={[styles.metaValue, textStyle]}>{product.color}</Text>
              </View>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View style={styles.stockInfo}>
              <Ionicons 
                name={product.inStock ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={product.inStock ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.stockText, 
                { color: product.inStock ? colors.primary : colors.textSecondary }
              ]}>
                {product.inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, textStyle]}>Description</Text>
            <Text style={[styles.description, subtitleStyle]}>
              {product.description || 'No description available.'}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.sectionTitle, textStyle]}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
              
              <Text style={[styles.quantityText, textStyle]}>
                {quantity}
              </Text>
              
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => updateQuantity(quantity + 1)}
                disabled={quantity >= (product.stock || 1)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= (product.stock || 1) ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, textStyle]}>Total Price</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>
              ${((product.price || 0) * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Button
          title={addingToCart ? 'Adding...' : 'Add to Cart'}
          onPress={handleAddToCart}
          disabled={!product.inStock || addingToCart}
          loading={addingToCart}
          style={styles.addToCartButton}
        />
        
        <Button
          title="Buy Now"
          onPress={() => {
            handleAddToCart().then(() => {
              router.push('/checkout');
            });
          }}
          disabled={!product.inStock}
          variant="outline"
          style={styles.buyNowButton}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    marginTop: 8,
  },
  productInfo: {
    padding: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockContainer: {
    marginBottom: 20,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  addToCartButton: {
    width: '100%',
  },
  buyNowButton: {
    width: '100%',
  },
}); 