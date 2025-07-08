import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = 'onboardingCompleted';

const slides = [
  {
    key: 'explore',
    title: 'Explore Products',
    description: 'Browse beautiful furniture and decor for your space.',
    emoji: '🛋️',
  },
  {
    key: 'ai-design',
    title: 'AI Design Studio',
    description: 'Generate stunning room designs with AI and customize them to your taste.',
    emoji: '🤖',
  },
  {
    key: 'chat',
    title: 'AI Chat Assistant',
    description: 'Get expert advice on interior design, color schemes, and more.',
    emoji: '💬',
  },
  {
    key: 'wishlist',
    title: 'Wishlist & Cart',
    description: 'Save your favorite products and manage your shopping cart easily.',
    emoji: '❤️',
  },
  {
    key: 'orders',
    title: 'Order Management',
    description: 'Track your orders and manage your profile securely.',
    emoji: '📦',
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const [current, setCurrent] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  };

  const handleNext = async () => {
    if (current === slides.length - 1) {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onDone();
    } else {
      setCurrent(current + 1);
    }
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]}> 
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        extraData={current}
        contentOffset={{ x: current * width, y: 0 }}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === current ? colors.primary : colors.border }]} />
          ))}
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { backgroundColor: colors.primary }]}> 
            <Text style={styles.nextText}>{current === slides.length - 1 ? 'Done' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    marginRight: 24,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 