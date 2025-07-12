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
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  style: string;
  color: string;
  available: boolean;
  stock: number;
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
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
    if (id) {
      loadProduct();
      checkWishlistStatus();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      const response = await api.getProduct(id as string);
      console.log('Product response:', response);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        console.error('Product not found response:', response);
        Alert.alert('Error', response.error || 'Product not found');
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

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const response = await api.getWishlist();
      if (response.success && response.data) {
        const wishlist = response.data;
        const isInWishlist = wishlist.products?.some(
          (item: any) => item.productId._id === id
        );
        setIsInWishlist(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to cart');
      return;
    }

    if (!product || !product.available) {
      Alert.alert('Error', 'Product is not available');
      return;
    }

    if (product.stock < quantity) {
      Alert.alert('Error', `Only ${product.stock} items available`);
      return;
    }

    try {
      setAddingToCart(true);
      const response = await api.addToCart(product._id, quantity);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart!');
        router.push('/cart');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to manage wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        const response = await api.removeFromWishlist(product!._id);
        if (response.success) {
          setIsInWishlist(false);
          Alert.alert('Success', 'Removed from wishlist');
        }
      } else {
        const response = await api.addToWishlist(product!._id);
        if (response.success) {
          setIsInWishlist(true);
          Alert.alert('Success', 'Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} - $${product.price}`,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={[containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[containerStyle, styles.errorContainer]}>
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
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlistToggle} style={styles.actionButton}>
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? '#FF6B6B' : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.imagePlaceholder, subtitleStyle]}>
            {product.name}
          </Text>
          {/* In a real app, you would use Image component here */}
          {/* <Image source={{ uri: product.image }} style={styles.productImage} /> */}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, textStyle]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${(product.price || 0).toFixed(2)}
          </Text>

          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <View style={[styles.availabilityBadge, { backgroundColor: product.available ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.availabilityText}>
                {product.available ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            {product.available && (
              <Text style={[styles.stockText, subtitleStyle]}>
                {product.stock} items available
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>Description</Text>
            <Text style={[styles.description, subtitleStyle]}>
              Experience the perfect blend of style and comfort with this beautifully crafted piece.
            </Text>
          </View>

          {/* Product Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>Product Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, subtitleStyle]}>Category</Text>
                <Text style={[styles.detailValue, textStyle]}>{product.category}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, subtitleStyle]}>Style</Text>
                <Text style={[styles.detailValue, textStyle]}>{product.style}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, subtitleStyle]}>Color</Text>
                <Text style={[styles.detailValue, textStyle]}>{product.color}</Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, textStyle]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={`tag-${index}-${tag}`} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.tagText, textStyle]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          {product.available && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, textStyle]}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.quantityText, textStyle]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => handleQuantityChange(true)}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {product.available && (
        <View style={[styles.actionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Button
            title={addingToCart ? 'Adding...' : 'Add to Cart'}
            onPress={handleAddToCart}
            disabled={addingToCart}
            style={styles.addToCartButton}
          />
          <Button
            title="Buy Now"
            onPress={handleAddToCart}
            variant="secondary"
            style={styles.buyNowButton}
          />
        </View>
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
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
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
  imageContainer: {
    width: width,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  imagePlaceholder: {
    fontSize: 18,
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 14,
  },
  section: {
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
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  quantityContainer: {
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
  actionContainer: {
    padding: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  addToCartButton: {
    marginBottom: 8,
  },
  buyNowButton: {
    marginBottom: 20,
  },
}); 