import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Image } from '../components/ui/Image';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { router } from 'expo-router';

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
}

interface FilterOptions {
  category: string;
  style: string;
  color: string;
  minPrice: number;
  maxPrice: number;
  available: boolean;
  sortBy: 'name' | 'price_low' | 'price_high' | 'newest';
}

const categories = [
  { id: '', name: 'All Categories' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'living-room', name: 'Living Room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'dining', name: 'Dining' },
];

const styleOptions = [
  { id: '', name: 'All Styles' },
  { id: 'modern', name: 'Modern' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'industrial', name: 'Industrial' },
];

const colors = [
  { id: '', name: 'All Colors' },
  { id: 'white', name: 'White' },
  { id: 'black', name: 'Black' },
  { id: 'brown', name: 'Brown' },
  { id: 'gray', name: 'Gray' },
  { id: 'blue', name: 'Blue' },
  { id: 'green', name: 'Green' },
];

const sortOptions = [
  { id: 'name', name: 'Name A-Z' },
  { id: 'price_low', name: 'Price: Low to High' },
  { id: 'price_high', name: 'Price: High to Low' },
  { id: 'newest', name: 'Newest First' },
];

export default function SearchScreen() {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    style: '',
    color: '',
    minPrice: 0,
    maxPrice: 10000,
    available: false,
    sortBy: 'name',
  });

  const containerStyle = {
    flex: 1,
    backgroundColor: themeColors.background,
  };

  const textStyle = {
    color: themeColors.text,
  };

  const subtitleStyle = {
    color: themeColors.textSecondary,
  };

  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => v !== '' && v !== 0 && v !== false)) {
      searchProducts();
    }
  }, [searchQuery, filters]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        search: searchQuery,
        page: 1,
        limit: 50,
      };

      if (filters.category) params.category = filters.category;
      if (filters.style) params.style = filters.style;
      if (filters.color) params.color = filters.color;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 10000) params.maxPrice = filters.maxPrice;
      if (filters.available) params.available = true;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const response = await api.getProducts(params);
      if (response.success && response.data) {
        // Backend returns data directly as array
        setProducts(response.data as Product[]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
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
        Alert.alert('Success', 'Added to cart!');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
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
        Alert.alert('Success', 'Added to wishlist!');
      } else {
        Alert.alert('Error', response.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add to wishlist');
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      style: '',
      color: '',
      minPrice: 0,
      maxPrice: 10000,
      available: false,
      sortBy: 'name',
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={() => router.push({
        pathname: '/product/[id]',
        params: { id: item._id }
      })}
    >
      <Image
        source={item.image || null}
        width={(width - 72) / 2}
        height={120}
        borderRadius={8}
        placeholder={item.name}
      />
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, textStyle]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productDescription, subtitleStyle]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.productPrice, { color: themeColors.primary }]}>
          ${(item.price || 0).toFixed(2)}
        </Text>
        
        <View style={styles.productActions}>
          <Button
            title="Add to Cart"
            onPress={() => handleAddToCart(item._id)}
            size="small"
            style={styles.actionButton}
          />
          <TouchableOpacity
            style={[styles.wishlistButton, { borderColor: themeColors.border }]}
            onPress={() => handleAddToWishlist(item._id)}
          >
            <Ionicons name="heart-outline" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOption = (
    options: { id: string; name: string }[],
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterTitle, textStyle]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                selectedValue === option.id && { backgroundColor: themeColors.primary }
              ]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={[
                styles.filterOptionText,
                textStyle,
                selectedValue === option.id && { color: '#FFFFFF' }
              ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, textStyle]}
            placeholder="Search products..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: showFilters ? themeColors.primary : themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={showFilters ? '#FFFFFF' : themeColors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
          {renderFilterOption(categories, filters.category, (value) => updateFilter('category', value), 'Category')}
          {renderFilterOption(styleOptions, filters.style, (value) => updateFilter('style', value), 'Style')}
          {renderFilterOption(colors, filters.color, (value) => updateFilter('color', value), 'Color')}
          {renderFilterOption(sortOptions, filters.sortBy, (value) => updateFilter('sortBy', value as any), 'Sort By')}
          
          <View style={styles.priceFilter}>
            <Text style={[styles.filterTitle, textStyle]}>Price Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={[styles.priceInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                placeholder="Min"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="numeric"
                value={filters.minPrice.toString()}
                onChangeText={(value) => updateFilter('minPrice', parseFloat(value) || 0)}
              />
              <Text style={[styles.priceSeparator, subtitleStyle]}>-</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
                placeholder="Max"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="numeric"
                value={filters.maxPrice.toString()}
                onChangeText={(value) => updateFilter('maxPrice', parseFloat(value) || 10000)}
              />
            </View>
          </View>

          <View style={styles.filterActions}>
            <Button
              title="Clear Filters"
              onPress={clearFilters}
              variant="outline"
              style={styles.clearButton}
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              style={styles.applyButton}
            />
          </View>
        </ScrollView>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={[styles.loadingText, subtitleStyle]}>Searching products...</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, textStyle]}>
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            
            {products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={themeColors.textSecondary} />
                <Text style={[styles.emptyTitle, textStyle]}>No products found</Text>
                <Text style={[styles.emptySubtitle, subtitleStyle]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceFilter: {
    marginBottom: 20,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 16,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  productsList: {
    padding: 16,
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
}); 