import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
}

interface Category {
  _id: string;
  name: string;
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    // Reset page and reload products when search or category changes
    setCurrentPage(1);
    setHasMore(true);
    loadProducts(true);
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        // Handle double-wrapped response structure
        let categoriesData: Category[];
        if (Array.isArray(response.data)) {
          categoriesData = response.data as Category[];
        } else if (response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data as Category[];
        } else {
          console.error('Unexpected categories response structure:', response.data);
          categoriesData = [];
        }
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await api.getProducts({
        page: reset ? 1 : currentPage,
        limit: 10,
        category: selectedCategory,
        search: searchQuery,
      });

      if (response.success && response.data) {
        // Handle double-wrapped response structure
        let newProducts: Product[];
        if (Array.isArray(response.data)) {
          // Direct array
          newProducts = response.data as Product[];
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Double-wrapped: { data: { data: [...] } }
          newProducts = response.data.data as Product[];
        } else if (response.data.products && Array.isArray(response.data.products)) {
          // Products property: { data: { products: [...] } }
          newProducts = response.data.products as Product[];
        } else {
          console.error('Unexpected products response structure:', response.data);
          newProducts = [];
        }

        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        setHasMore(newProducts.length === 10);
        if (!reset) {
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to cart');
      return;
    }

    try {
      const response = await api.addToCart(productId, 1);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart!');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to wishlist');
      return;
    }

    try {
      const response = await api.addToWishlist(productId);
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

  // Memoize renderProduct and renderCategory
  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push({
        pathname: '/product/[id]',
        params: { id: item._id }
      })}
    >
      <View style={[styles.productImage, { backgroundColor: colors.border }]}>
        <Text style={[styles.productImageText, subtitleStyle]}>{item.name}</Text>
        {/* In a real app, you would use Image component here */}
        {/* <Image source={{ uri: item.imageUrl }} style={styles.productImage} /> */}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, textStyle]}>{item.name}</Text>
        <Text style={[styles.productDescription, subtitleStyle]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          ${(item.price || 0).toFixed(2)}
        </Text>
        
        <View style={styles.productActions}>
          <Button
            title="Add to Cart"
            onPress={() => handleAddToCart(item._id)}
            style={styles.actionButton}
          />
          <TouchableOpacity
            style={[styles.wishlistButton, { borderColor: colors.border }]}
            onPress={() => handleAddToWishlist(item._id)}
          >
            <Ionicons name="heart-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), [colors, subtitleStyle, textStyle, handleAddToCart, handleAddToWishlist]);

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selectedCategory === item._id && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item._id ? '' : item._id)}
    >
      <Text style={[
        styles.categoryButtonText,
        textStyle,
        selectedCategory === item._id && { color: '#FFFFFF' }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [colors, selectedCategory, setSelectedCategory, textStyle]);

  // Optionally, add getItemLayout for FlatList for performance
  const getProductItemLayout = useCallback((data, index) => ({
    length: (width - 72) / 2 + 16, // card height + margin
    offset: ((width - 72) / 2 + 16) * index,
    index,
  }), []);

  if (loading && products.length === 0) {
    return (
      <View style={[containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>Explore Products</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Discover beautiful furniture and decor for your space
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, inputStyle]}
            placeholder="Search products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, textStyle]}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products */}
      <View style={styles.productsSection}>
        <View style={styles.productsHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>
            {selectedCategory ? 'Filtered Products' : 'All Products'}
          </Text>
          <Text style={[styles.productCount, subtitleStyle]}>
            {products.length} products
          </Text>
        </View>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasMore && loadProducts()}
          onEndReachedThreshold={0.1}
          getItemLayout={getProductItemLayout}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="grid-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, textStyle]}>No products found</Text>
              <Text style={[styles.emptySubtext, subtitleStyle]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesList: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productCount: {
    fontSize: 14,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 72) / 2,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  wishlistButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
