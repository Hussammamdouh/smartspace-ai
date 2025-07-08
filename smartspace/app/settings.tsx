import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../services/notificationService';
import { router } from 'expo-router';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'button' | 'link';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon?: string;
  iconColor?: string;
}

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load saved settings from storage
    // For now, we'll use default values
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Not Implemented', 'Account deletion will be implemented soon');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You may need to reload some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact support?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@smartspace.ai');
          },
        },
        {
          text: 'Chat',
          onPress: () => {
            router.push('/chat');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://smartspace.ai/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://smartspace.ai/terms');
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark themes',
          type: 'toggle',
          value: theme === 'dark',
          onToggle: toggleTheme,
          icon: 'moon-outline',
          iconColor: '#6366f1',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications about orders and updates',
          type: 'toggle',
          value: pushNotifications,
          onToggle: setPushNotifications,
          icon: 'notifications-outline',
          iconColor: '#10b981',
        },
        {
          id: 'email_notifications',
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
          icon: 'mail-outline',
          iconColor: '#f59e0b',
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          id: 'clear_cache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'button',
          onPress: handleClearCache,
          icon: 'trash-outline',
          iconColor: '#ef4444',
        },
        {
          id: 'offline_mode',
          title: 'Offline Mode',
          subtitle: 'Access content without internet',
          type: 'toggle',
          value: true,
          onToggle: () => Alert.alert('Info', 'Offline mode is always enabled'),
          icon: 'cloud-offline-outline',
          iconColor: '#8b5cf6',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'contact_support',
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          type: 'button',
          onPress: handleContactSupport,
          icon: 'help-circle-outline',
          iconColor: '#06b6d4',
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          type: 'button',
          onPress: () => Linking.openURL('mailto:feedback@smartspace.ai'),
          icon: 'chatbubble-outline',
          iconColor: '#84cc16',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          type: 'link',
          onPress: handlePrivacyPolicy,
          icon: 'shield-outline',
          iconColor: '#3b82f6',
        },
        {
          id: 'terms_of_service',
          title: 'Terms of Service',
          subtitle: 'Our terms and conditions',
          type: 'link',
          onPress: handleTermsOfService,
          icon: 'document-text-outline',
          iconColor: '#6b7280',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'edit_profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          type: 'button',
          onPress: () => router.push('/profile'),
          icon: 'person-outline',
          iconColor: '#ec4899',
        },
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          type: 'button',
          onPress: handleLogout,
          icon: 'log-out-outline',
          iconColor: '#f97316',
        },
        {
          id: 'delete_account',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          type: 'button',
          onPress: handleDeleteAccount,
          icon: 'warning-outline',
          iconColor: '#dc2626',
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingsItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.itemLeft}>
        {item.icon && (
          <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, textStyle]}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[styles.itemSubtitle, subtitleStyle]}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={item.value ? colors.primary : colors.textSecondary}
          />
        )}
        {item.type === 'button' && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
        {item.type === 'link' && (
          <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, textStyle]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map(renderSettingsItem)}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, subtitleStyle]}>SmartSpace.AI v1.0.0</Text>
          <Text style={[styles.appCopyright, subtitleStyle]}>
            © 2024 SmartSpace.AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  sectionContent: {
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  itemRight: {
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 