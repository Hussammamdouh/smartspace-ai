import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useEcommerce } from '../../contexts/EcommerceContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Stats {
  totalProducts: number;
  totalDesigns: number;
  averageRating: number;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { featuredProducts, loadFeaturedProducts } = useEcommerce();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalDesigns: 0,
    averageRating: 4.9,
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

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured products using EcommerceContext
      await loadFeaturedProducts();
      
      // For now, use static stats - you can add a stats API later
      setStats({
        totalProducts: 150,
        totalDesigns: 500,
        averageRating: 4.9,
      });
      
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const renderProductCard = (product: any) => (
    <TouchableOpacity
      key={product._id}
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View style={[styles.productImage, { backgroundColor: colors.border }]}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImageContent}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.productImageText, subtitleStyle]}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, textStyle]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          ${product.price?.toFixed(2) || '0.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[subtitleStyle, styles.loadingText]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={containerStyle} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, textStyle]}>
            Transform Your{'\n'}
            <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>
              Living Space
            </Text>
            {'\n'}with SmartSpace.AI
          </Text>
          <Text style={[styles.heroSubtitle, subtitleStyle]}>
            Experience the future of interior design with our cutting-edge AI technology. 
            Create stunning, personalized spaces in minutes, not months.
          </Text>
          
          <View style={styles.heroButtons}>
            <Button
              title="Start Designing"
              onPress={() => router.push('/ai-design')}
              style={styles.primaryButton}
            />
            <Button
              title="Explore Products"
              onPress={() => router.push('/explore')}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/cart')}
            >
              <Ionicons name="bag-outline" size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, textStyle]}>Cart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/wishlist')}
            >
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, textStyle]}>Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, textStyle]}>Our Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {stats.totalProducts}+
            </Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {stats.totalDesigns}+
            </Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Designs Created</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {stats.averageRating}
            </Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Average Rating</Text>
          </View>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredProductsList}
        >
          {featuredProducts && featuredProducts.length > 0 ? (
            featuredProducts.map(renderProductCard)
          ) : (
            <View style={styles.emptyProducts}>
              <Ionicons name="grid-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, textStyle]}>No featured products</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* AI Design Section */}
      <View style={[styles.aiSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.aiContent}>
          <View style={styles.aiTextContent}>
            <Text style={[styles.aiTitle, textStyle]}>
              AI-Powered{'\n'}Interior Design
            </Text>
            <Text style={[styles.aiSubtitle, subtitleStyle]}>
              Let our advanced AI create stunning interior designs tailored to your style, 
              preferences, and space requirements.
            </Text>
            <Button
              title="Try AI Design"
              onPress={() => router.push('/ai-design')}
              style={styles.aiButton}
            />
          </View>
          <View style={styles.aiImageContainer}>
            <Ionicons name="sparkles" size={64} color={colors.primary} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  heroSection: {
    padding: 24,
    paddingTop: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleAccent: {
    fontWeight: 'bold',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    margin: 24,
    borderRadius: 16,
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  aiSection: {
    padding: 24,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTextContent: {
    flex: 1,
    marginRight: 20,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  aiButton: {
    minWidth: 180,
  },
  aiImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredSection: {
    padding: 24,
  },
  featuredProductsList: {
    paddingRight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  productCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageContent: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 14,
    marginTop: 4,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyProducts: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
