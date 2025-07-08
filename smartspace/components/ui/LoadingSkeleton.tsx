import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useEffect, useRef } from 'react';

interface LoadingSkeletonProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components
export const ProductSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.productSkeleton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <LoadingSkeleton width="100%" height={120} borderRadius={8} />
      <View style={styles.productSkeletonContent}>
        <LoadingSkeleton width="80%" height={16} borderRadius={4} />
        <LoadingSkeleton width="60%" height={12} borderRadius={4} />
        <LoadingSkeleton width="40%" height={16} borderRadius={4} />
      </View>
    </View>
  );
};

export const ReviewSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.reviewSkeleton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewSkeletonHeader}>
        <LoadingSkeleton width={40} height={40} borderRadius={20} />
        <View style={styles.reviewSkeletonUserInfo}>
          <LoadingSkeleton width={100} height={14} borderRadius={4} />
          <LoadingSkeleton width={80} height={12} borderRadius={4} />
        </View>
        <LoadingSkeleton width={80} height={14} borderRadius={4} />
      </View>
      <View style={styles.reviewSkeletonContent}>
        <LoadingSkeleton width="90%" height={16} borderRadius={4} />
        <LoadingSkeleton width="100%" height={12} borderRadius={4} />
        <LoadingSkeleton width="70%" height={12} borderRadius={4} />
      </View>
    </View>
  );
};

export const CartItemSkeleton: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.cartItemSkeleton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <LoadingSkeleton width={80} height={80} borderRadius={8} />
      <View style={styles.cartItemSkeletonContent}>
        <LoadingSkeleton width="70%" height={16} borderRadius={4} />
        <LoadingSkeleton width="50%" height={12} borderRadius={4} />
        <LoadingSkeleton width="30%" height={14} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productSkeleton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  productSkeletonContent: {
    padding: 12,
    gap: 8,
  },
  reviewSkeleton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reviewSkeletonUserInfo: {
    flex: 1,
    gap: 4,
  },
  reviewSkeletonContent: {
    gap: 8,
  },
  cartItemSkeleton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  cartItemSkeletonContent: {
    flex: 1,
    gap: 8,
  },
}); 