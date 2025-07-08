import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { resetPassword, loading } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.passwordConfirm.trim()) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    try {
      await resetPassword(token, formData.password, formData.passwordConfirm);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error) {
      Alert.alert('Reset Failed', error instanceof Error ? error.message : 'Failed to reset password');
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

  return (
    <KeyboardAvoidingView style={containerStyle} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, headerStyle]}>Reset Password</Text>
            <Text style={[styles.subtitle, subtitleStyle]}>
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Enter your new password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={formData.passwordConfirm}
              onChangeText={(text) => setFormData({ ...formData, passwordConfirm: text })}
              secureTextEntry
              error={errors.passwordConfirm}
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />
          </View>

          {/* Links */}
          <View style={styles.links}>
            <Button
              title="Back to Login"
              onPress={() => router.replace('/auth/login')}
              variant="ghost"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  resetButton: {
    marginTop: 16,
  },
  links: {
    alignItems: 'center',
  },
}); 