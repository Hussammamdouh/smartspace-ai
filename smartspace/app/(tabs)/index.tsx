import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const features = [
    {
      id: 1,
      title: 'AI Design Generator',
      description: 'Create stunning interior designs with AI',
      icon: 'sparkles-outline',
      color: '#A58077',
    },
    {
      id: 2,
      title: 'Product Catalog',
      description: 'Browse furniture and decor items',
      icon: 'grid-outline',
      color: '#E5CBBE',
    },
    {
      id: 3,
      title: 'Design History',
      description: 'View your saved designs',
      icon: 'time-outline',
      color: '#FCF3E8',
    },
    {
      id: 4,
      title: 'Chat Assistant',
      description: 'Get design advice from AI',
      icon: 'chatbubble-outline',
      color: '#A58077',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#181818', '#2C2C2C', '#181818']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#A58077" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Transform Your Space</Text>
            <Text style={styles.heroSubtitle}>
              Create beautiful interior designs with the power of AI
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start Designing</Text>
              <Ionicons name="arrow-forward" size={20} color="#181818" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What you can do</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity key={feature.id} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="#181818" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Designs Created</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Products Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Chat Sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#A58077',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5CBBE',
  },
  logoutButton: {
    padding: 8,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroContent: {
    backgroundColor: 'rgba(165, 128, 119, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#A58077',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#A58077',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A58077',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A58077',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#A58077',
    lineHeight: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A58077',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A58077',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E5CBBE',
    textAlign: 'center',
  },
});
