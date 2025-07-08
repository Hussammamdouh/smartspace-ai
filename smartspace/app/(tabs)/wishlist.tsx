import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Image } from '../../components/ui/Image';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
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

export default function WishlistTab() {
  const { colors } = useTheme();
  const { user } = useAuth();

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

  // Show login screen for unauthenticated users
  if (!user) {
    return (
      <View style={[containerStyle, styles.centerContainer]}>
        <View style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="heart-outline" size={80} color={colors.primary} />
          <Text style={[styles.loginTitle, textStyle]}>Your Wishlist</Text>
          <Text style={[styles.loginSubtitle, subtitleStyle]}>
            Sign in to save your favorite products and create your wishlist
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

  return (
    <View style={[containerStyle, styles.centerContainer]}>
      <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="heart-outline" size={80} color={colors.primary} />
        <Text style={[styles.title, textStyle]}>My Wishlist</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Your wishlist is empty. Start exploring products and add them to your wishlist.
        </Text>
        <Button
          title="Explore Products"
          onPress={() => router.push('/explore')}
          style={styles.exploreButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 300,
  },
  contentCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 300,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    marginBottom: 12,
    width: '100%',
  },
  registerButton: {
    width: '100%',
  },
  exploreButton: {
    width: '100%',
  },
}); 