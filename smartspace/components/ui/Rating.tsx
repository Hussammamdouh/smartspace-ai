import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showText?: boolean;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  showText = false,
  readonly = true,
  onRatingChange,
  showCount = false,
  count = 0,
}) => {
  const { colors } = useTheme();

  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isHalf = i === Math.ceil(rating) && rating % 1 !== 0;
      
      let iconName = 'star-outline';
      if (isFilled) {
        iconName = 'star';
      } else if (isHalf) {
        iconName = 'star-half';
      }

      const starComponent = (
        <Ionicons
          key={i}
          name={iconName as any}
          size={size}
          color={isFilled || isHalf ? '#FFD700' : colors.textSecondary}
        />
      );

      if (readonly) {
        stars.push(starComponent);
      } else {
        stars.push(
          <TouchableOpacity
            key={i}
            onPress={() => handleStarPress(i)}
            activeOpacity={0.7}
          >
            {starComponent}
          </TouchableOpacity>
        );
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showText && (
        <Text style={[styles.ratingText, { color: colors.text }]}>
          {(rating || 0).toFixed(1)}
        </Text>
      )}
      {showCount && count > 0 && (
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          ({count})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  countText: {
    fontSize: 12,
    marginLeft: 4,
  },
}); 