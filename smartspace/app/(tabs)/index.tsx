import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ApiTest } from '../../components/ApiTest';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const stats = [
    { number: '10K+', label: 'Happy Clients' },
    { number: '50K+', label: 'Designs Created' },
    { number: '4.9★', label: 'User Rating' },
  ];

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



  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
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
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <View style={styles.statsGrid}>
          {(stats || []).map((item, index) => (
            <View
              key={`stat-${index}`}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{item.number}</Text>
              <Text style={[styles.statLabel, subtitleStyle]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* AI Design Section */}
      <View style={styles.aiSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>AI-Powered Design</Text>
          <Text style={[styles.sectionSubtitle, subtitleStyle]}>
            Let our AI create the perfect design for your space
          </Text>
        </View>

                  <TouchableOpacity
            style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/ai-design')}
          >
          <View style={styles.aiCardContent}>
            <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.aiText}>
              <Text style={[styles.aiTitle, textStyle]}>Generate Your Dream Space</Text>
              <Text style={[styles.aiDescription, subtitleStyle]}>
                Describe your room and let AI create stunning designs in seconds
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Featured Products */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>Featured Products</Text>
                     <TouchableOpacity onPress={() => router.push('/explore')}>
             <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
           </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
          {[1, 2, 3].map((item) => (
                         <TouchableOpacity
               key={item}
               style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
               onPress={() => router.push('/explore')}
             >
              <View style={[styles.productImage, { backgroundColor: colors.border }]}>
                <Text style={[styles.productImageText, subtitleStyle]}>Product {item}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, textStyle]}>Modern Chair</Text>
                <Text style={[styles.productPrice, { color: colors.primary }]}>$299</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* API Test Section */}
      <View style={styles.apiTestSection}>
        <ApiTest />
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: colors.primary }]}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Space?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of users who have already created their dream interiors
        </Text>
                 <Button
           title="Get Started Now"
           onPress={() => router.push('/ai-design')}
           variant="secondary"
           style={styles.ctaButton}
         />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  aiSection: {
    padding: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
  },
  aiCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  productsSection: {
    padding: 24,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  productsScroll: {
    marginLeft: -24,
    paddingLeft: 24,
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
  productImageText: {
    fontSize: 14,
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
  ctaSection: {
    margin: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    minWidth: 200,
  },
  apiTestSection: {
    margin: 24,
  },
});
