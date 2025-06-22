import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ProductCard from '../../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
}

interface Category {
  _id: string;
  name: string;
}

export default function ExploreScreen() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadWishlist(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 10,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await apiService.getProducts(params);
      
      if (response.success && response.data) {
        // Handle different response structures
        const responseData = response.data as any;
        const newProducts = Array.isArray(responseData) ? responseData : 
                          responseData.products || responseData.items || [];
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        setHasMore(newProducts.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        const categoriesData = response.data as any;
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
                              categoriesData.categories || categoriesData.items || [];
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiService.getWishlist();
      if (response.success && response.data) {
        const wishlistData = response.data as any;
        const wishlistArray = Array.isArray(wishlistData) ? wishlistData : 
                            wishlistData.items || wishlistData.products || [];
        const wishlistIds = wishlistArray.map((item: any) => item.productId || item._id);
        setWishlist(wishlistIds);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts(1, false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setPage(1);
    loadProducts(1, false);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add items to cart');
      return;
    }

    try {
      const response = await apiService.addToCart(productId);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleWishlistToggle = async (productId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to manage wishlist');
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);
      const response = isInWishlist
        ? await apiService.removeFromWishlist(productId)
        : await apiService.addToWishlist(productId);

      if (response.success) {
        setWishlist(prev =>
          isInWishlist
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadProducts(page + 1, true);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => {
        // Navigate to product detail
        Alert.alert('Product Detail', `Viewing ${item.name}`);
      }}
      onAddToCart={() => handleAddToCart(item._id)}
      onAddToWishlist={() => handleWishlistToggle(item._id)}
      isInWishlist={wishlist.includes(item._id)}
    />
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item._id && styles.selectedCategory,
      ]}
      onPress={() => handleCategorySelect(item._id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item._id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A58077" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#A58077" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#A58077" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
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
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  loadingText: {
    color: '#E5CBBE',
    marginTop: 16,
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#2C2C2C',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#E5CBBE',
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 16,
    backgroundColor: '#2C2C2C',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#181818',
  },
  selectedCategory: {
    backgroundColor: '#A58077',
  },
  categoryText: {
    color: '#E5CBBE',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FCF3E8',
  },
  productsList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});
