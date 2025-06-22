import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy will be implemented');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service will be implemented');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Contact support will be implemented');
  };

  const handleRateApp = async () => {
    try {
      // This would open the app store for rating
      Alert.alert('Rate App', 'Rate app functionality will be implemented');
    } catch (error) {
      console.error('Error opening app store:', error);
    }
  };

  const handleShareApp = () => {
    Alert.alert('Share App', 'Share app functionality will be implemented');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'Cache cleared successfully');
        }},
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deletion', 'Account deletion will be implemented');
        }},
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#A58077" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E5CBBE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSettingItem(
            'notifications-outline',
            'Push Notifications',
            'Receive notifications about orders and updates',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#444', true: '#A58077' }}
              thumbColor={notificationsEnabled ? '#FCF3E8' : '#666'}
            />
          )}

          {renderSettingItem(
            'moon-outline',
            'Dark Mode',
            'Use dark theme throughout the app',
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#444', true: '#A58077' }}
              thumbColor={darkModeEnabled ? '#FCF3E8' : '#666'}
            />
          )}

          {renderSettingItem(
            'finger-print-outline',
            'Biometric Login',
            'Use fingerprint or face ID to login',
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#444', true: '#A58077' }}
              thumbColor={biometricEnabled ? '#FCF3E8' : '#666'}
            />
          )}

          {renderSettingItem(
            'save-outline',
            'Auto Save',
            'Automatically save your designs',
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: '#444', true: '#A58077' }}
              thumbColor={autoSaveEnabled ? '#FCF3E8' : '#666'}
            />
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          {renderSettingItem(
            'help-circle-outline',
            'Help & FAQ',
            'Get help and find answers',
            undefined,
            handleContactSupport
          )}

          {renderSettingItem(
            'star-outline',
            'Rate App',
            'Rate us on the app store',
            undefined,
            handleRateApp
          )}

          {renderSettingItem(
            'share-outline',
            'Share App',
            'Share with friends and family',
            undefined,
            handleShareApp
          )}
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          {renderSettingItem(
            'shield-checkmark-outline',
            'Privacy Policy',
            'Read our privacy policy',
            undefined,
            handlePrivacyPolicy
          )}

          {renderSettingItem(
            'document-text-outline',
            'Terms of Service',
            'Read our terms of service',
            undefined,
            handleTermsOfService
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          {renderSettingItem(
            'trash-outline',
            'Clear Cache',
            'Clear app cache and temporary files',
            undefined,
            handleClearCache
          )}

          {renderSettingItem(
            'download-outline',
            'Export Data',
            'Export your data and designs',
            undefined,
            () => Alert.alert('Export Data', 'Export functionality will be implemented')
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {renderSettingItem(
            'person-outline',
            'Edit Profile',
            'Update your profile information',
            undefined,
            () => Alert.alert('Edit Profile', 'Edit profile will be implemented')
          )}

          {renderSettingItem(
            'lock-closed-outline',
            'Change Password',
            'Update your password',
            undefined,
            () => Alert.alert('Change Password', 'Change password will be implemented')
          )}

          {renderSettingItem(
            'log-out-outline',
            'Logout',
            'Sign out of your account',
            undefined,
            () => Alert.alert('Logout', 'Logout functionality will be implemented')
          )}

          {renderSettingItem(
            'warning-outline',
            'Delete Account',
            'Permanently delete your account',
            undefined,
            handleDeleteAccount
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>SmartSpace v1.0.0</Text>
          <Text style={styles.appDescription}>
            AI-Powered Interior Design Platform
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5CBBE',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(165, 128, 119, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#E5CBBE',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 16,
    color: '#A58077',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 