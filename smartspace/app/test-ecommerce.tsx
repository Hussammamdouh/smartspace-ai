import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useEcommerce } from '../contexts/EcommerceContext';
import { Button } from '../components/ui/Button';
import EcommerceTest from '../components/EcommerceTest';

export default function TestEcommerceScreen() {
  const { colors } = useTheme();
  const { cartItemCount } = useEcommerce();

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  return (
    <View style={containerStyle}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, textStyle]}>E-commerce System Test</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Cart Items: {cartItemCount}
        </Text>
        
        <EcommerceTest />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
}); 