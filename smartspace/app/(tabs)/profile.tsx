import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEcommerce, type Order } from '../../contexts/EcommerceContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');



interface Design {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  roomType: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { orders, loadOrders } = useEcommerce();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOrders(),
        loadDesigns(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const loadDesigns = async () => {
    try {
      console.log('Loading designs...');
      const response = await api.getDesigns();
      console.log('Designs API response:', response);
      
      if (response.success && response.data) {
        // Ensure we always set an array, even if the response is unexpected
        const designsData = Array.isArray(response.data) ? response.data : [];
        console.log('Setting designs data:', designsData);
        setDesigns(designsData);
      } else {
        // If the API call fails, set empty array
        console.log('API call failed, setting empty array');
        setDesigns([]);
        console.error('Failed to load designs:', response.error);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      // Ensure we always have an array even on error
      setDesigns([]);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be implemented soon');
  };

  const handleViewOrder = (order: Order) => {
    router.push({
      pathname: '/order/[id]',
      params: { id: order._id }
    });
  };

  const handleViewDesign = (design: Design) => {
    // Navigate to Edit Design screen
    router.push(`/edit-design/${design._id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  // Show login screen for unauthenticated users
  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <View style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
          <Text style={[styles.loginTitle, textStyle]}>Welcome to SmartSpace.AI</Text>
          <Text style={[styles.loginSubtitle, subtitleStyle]}>
            Sign in to access your profile, orders, and AI design features
          </Text>
          <Button
            title="Login"
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
          <Button
            title="Create Account"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            style={styles.registerButton}
          />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, textStyle]}>{user?.name || 'User'}</Text>
            <Text style={[styles.userEmail, subtitleStyle]}>{user?.email || 'user@example.com'}</Text>
            <Text style={[styles.memberSince, subtitleStyle]}>
              Member since {user?.createdAt ? formatDate(user.createdAt) : '2024'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { borderColor: colors.border }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={[styles.statsGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{Array.isArray(orders) ? orders.length : 0}</Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{Array.isArray(designs) ? designs.length : 0}</Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Designs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, subtitleStyle]}>Wishlist</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, textStyle]}>Settings</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, textStyle]}>Dark Mode</Text>
          </View>
                     <Switch
             value={theme === 'dark'}
             onValueChange={toggleTheme}
             trackColor={{ false: colors.border, true: colors.primary }}
             thumbColor={theme === 'dark' ? '#FFFFFF' : colors.text}
           />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, textStyle]}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : colors.text}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert('Help', 'Help and support will be available soon')}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, textStyle]}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert('Privacy', 'Privacy policy will be available soon')}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, textStyle]}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={styles.ordersSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>Recent Orders</Text>
          <TouchableOpacity onPress={() => Alert.alert('Orders', 'View all orders')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {(orders || []).length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, textStyle]}>No orders yet</Text>
            <Text style={[styles.emptySubtext, subtitleStyle]}>
              Your order history will appear here
            </Text>
          </View>
        ) : (
          (Array.isArray(orders) ? orders : []).slice(0, 3).map((order) => (
            <TouchableOpacity
              key={order._id}
              style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleViewOrder(order)}
            >
              <View style={styles.orderInfo}>
                <Text style={[styles.orderNumber, textStyle]}>#{order.orderNumber}</Text>
                <Text style={[styles.orderDate, subtitleStyle]}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
                <Text style={[styles.orderTotal, textStyle]}>
                  ${(order.total || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Saved Designs */}
      <View style={styles.designsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyle]}>Saved Designs</Text>
          <TouchableOpacity onPress={() => Alert.alert('Designs', 'View all designs')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {(!designs || !Array.isArray(designs) || designs.length === 0) ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, textStyle]}>No designs yet</Text>
            <Text style={[styles.emptySubtext, subtitleStyle]}>
              Your AI-generated designs will appear here
            </Text>
          </View>
        ) : (
          (Array.isArray(designs) ? designs : []).slice(0, 3).map((design) => (
            <TouchableOpacity
              key={design._id}
              style={[styles.designCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleViewDesign(design)}
            >
              <View style={[styles.designImage, { backgroundColor: colors.border }]}>
                <Text style={[styles.designImageText, subtitleStyle]}>{design.title}</Text>
              </View>
              <View style={styles.designInfo}>
                <Text style={[styles.designTitle, textStyle]}>{design.title}</Text>
                <Text style={[styles.designStyle, subtitleStyle]}>{design.style} • {design.roomType}</Text>
                <Text style={[styles.designDate, subtitleStyle]}>{formatDate(design.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statItem: {
    flex: 1,
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
  settingsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  ordersSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
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
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  orderStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  designsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  designCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  designImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  designImageText: {
    fontSize: 10,
    textAlign: 'center',
  },
  designInfo: {
    flex: 1,
  },
  designTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  designStyle: {
    fontSize: 14,
    marginBottom: 4,
  },
  designDate: {
    fontSize: 12,
  },
  logoutSection: {
    padding: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    marginBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  registerButton: {
    marginBottom: 16,
  },
}); 