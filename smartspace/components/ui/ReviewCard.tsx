import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Rating } from './Rating';
import { Image } from './Image';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  helpful?: number;
}

interface ReviewCardProps {
  review: Review;
  showHelpful?: boolean;
  onHelpfulPress?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showHelpful = true,
  onHelpfulPress,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const containerStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  const textStyle = {
    color: colors.text,
  };

  const subtitleStyle = {
    color: colors.textSecondary,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={review.userAvatar}
            width={40}
            height={40}
            borderRadius={20}
            placeholder={review.userName.charAt(0)}
            showPlaceholder={false}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, textStyle]}>{review.userName}</Text>
            <Text style={[styles.reviewDate, subtitleStyle]}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        <Rating rating={review.rating} size={14} readonly />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {review.title && (
          <Text style={[styles.reviewTitle, textStyle]}>{review.title}</Text>
        )}
        <Text style={[styles.reviewComment, textStyle]}>{review.comment}</Text>
      </View>

      {/* Footer */}
      {showHelpful && (
        <View style={styles.footer}>
          <Text style={[styles.helpfulText, subtitleStyle]}>
            Was this review helpful?
          </Text>
          <Text style={[styles.helpfulCount, subtitleStyle]}>
            {review.helpful || 0} found this helpful
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  content: {
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  helpfulText: {
    fontSize: 12,
  },
  helpfulCount: {
    fontSize: 12,
  },
}); 