import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const { verifyEmail, loading } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    } else {
      setError('Invalid verification link');
    }
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) return;

    setVerifying(true);
    try {
      await verifyEmail(token);
      setVerified(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const headerStyle = {
    color: colors.text,
  };

  const subtitleStyle = {
    color: colors.textSecondary,
  };

  if (verifying) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, subtitleStyle]}>Verifying your email...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={64} color="#EF4444" />
        </View>
        <Text style={[styles.title, headerStyle]}>Verification Failed</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{error}</Text>
        <Button
          title="Back to Login"
          onPress={() => router.replace('/auth/login')}
          style={styles.button}
        />
      </View>
    );
  }

  if (verified) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, headerStyle]}>Email Verified!</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Your email has been verified successfully. You can now log in to your account.
        </Text>
        <Button
          title="Continue to Login"
          onPress={() => router.replace('/auth/login')}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.centerContainer]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, subtitleStyle]}>Processing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  button: {
    minWidth: 200,
  },
}); 