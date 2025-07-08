import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
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

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description: string;
  };
  addedAt: string;
}

interface Wishlist {
  _id: string;
  userId: string;
  products: WishlistItem[];
}

export default function WishlistScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

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
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.getWishlist();
      if (response.success && response.data) {
        setWishlist(response.data);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemoving(productId);
      const response = await api.removeFromWishlist(productId);
      if (response.success && response.data) {
        setWishlist(response.data);
        Alert.alert('Success', 'Removed from wishlist');
      } else {
        Alert.alert('Error', response.error || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      // First remove from wishlist
      const wishlistResponse = await api.removeFromWishlist(productId);
      if (wishlistResponse.success) {
        setWishlist(wishlistResponse.data);
        
        // Then add to cart
        const cartResponse = await api.addToCart(productId, 1);
        if (cartResponse.success) {
          Alert.alert('Success', 'Moved to cart!');
          router.push('/cart');
        } else {
          Alert.alert('Error', 'Failed to add to cart');
        }
      } else {
        Alert.alert('Error', 'Failed to move to cart');
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      Alert.alert('Error', 'Failed to move to cart');
    }
  };

  const handleClearWishlist = async () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to clear your entire wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.clearWishlist();
              if (response.success && response.data) {
                setWishlist(response.data);
                Alert.alert('Success', 'Wishlist cleared');
              } else {
                Alert.alert('Error', response.error || 'Failed to clear wishlist');
              }
            } catch (error) {
              console.error('Error clearing wishlist:', error);
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderWishlistItem = useCallback(({ item }: { item: WishlistItem }) => (
    <View style={[styles.wishlistItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() => handleProductPress(item.productId._id)}
      >
        <Image
          source={item.productId.image || null}
          width={80}
          height={80}
          borderRadius={8}
          placeholder={item.productId.name}
        />
        <View style={styles.productDetails}>
          <Text style={[styles.productName, textStyle]} numberOfLines={2}>
            {item.productId.name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            ${(item.productId.price || 0).toFixed(2)}
          </Text>
          <Text style={[styles.addedDate, subtitleStyle]}>
            Added {formatDate(item.addedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button
          title="Move to Cart"
          onPress={() => handleMoveToCart(item.productId._id)}
          size="small"
          style={styles.actionButton}
        />
        <TouchableOpacity
          style={[styles.removeButton, { borderColor: colors.border }]}
          onPress={() => handleRemoveFromWishlist(item.productId._id)}
          disabled={removing === item.productId._id}
        >
          {removing === item.productId._id ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [colors, textStyle, subtitleStyle, removing, handleProductPress, handleMoveToCart, handleRemoveFromWishlist]);

  // Optionally, add getItemLayout for FlatList for performance
  const getWishlistItemLayout = useCallback((data: any, index: number) => ({
    length: 120 + 16, // item height + margin
    offset: (120 + 16) * index,
    index,
  }), []);

  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, textStyle]}>Login Required</Text>
        <Text style={[styles.emptySubtitle, subtitleStyle]}>
          Please log in to view your wishlist
        </Text>
        <View style={styles.authButtons}>
          <Button
            title="Login"
            onPress={() => router.push('/auth/login')}
            style={styles.emptyButton}
          />
          <Button
            title="Register"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            style={styles.emptyButton}
          />
        </View>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/(tabs)')}
          variant="ghost"
          style={styles.continueButton}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={styles.header}>
          <Text style={[styles.title, textStyle]}>My Wishlist</Text>
        </View>
        <ScrollView style={styles.skeletonContainer}>
          {[1, 2, 3].map((item) => (
            <LoadingSkeleton
              key={item}
              width={350}
              height={120}
              borderRadius={12}
              style={styles.skeletonItem}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>My Wishlist</Text>
        {wishlist && wishlist.products.length > 0 && (
          <TouchableOpacity onPress={handleClearWishlist}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!wishlist || wishlist.products.length === 0 ? (
        <View style={[styles.centerContainer, { flex: 1 }]}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, textStyle]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, subtitleStyle]}>
            Start adding products you love
          </Text>
          <Button
            title="Explore Products"
            onPress={() => router.push('/explore')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={wishlist.products}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          getItemLayout={getWishlistItemLayout}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={[styles.footerText, subtitleStyle]}>
                {wishlist.products.length} item{wishlist.products.length !== 1 ? 's' : ''} in your wishlist
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '600',
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
  skeletonContainer: {
    padding: 24,
  },
  skeletonItem: {
    marginBottom: 16,
  },
  listContainer: {
    padding: 24,
  },
  wishlistItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actionButton: {
    marginBottom: 8,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  continueButton: {
    marginTop: 16,
  },
}); 