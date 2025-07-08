import React, { useState } from 'react';
import {
  Image as RNImage,
  ImageStyle,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import imageService from '../../services/imageService';

interface ImageProps {
  source: string | null;
  style?: ImageStyle;
  width?: number;
  height?: number;
  borderRadius?: number;
  placeholder?: string;
  onPress?: () => void;
  onError?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showPlaceholder?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  source,
  style,
  width = 100,
  height = 100,
  borderRadius = 8,
  placeholder = 'Image',
  onPress,
  onError,
  resizeMode = 'cover',
  showPlaceholder = true,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const containerStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  const imageStyle = {
    width,
    height,
    borderRadius,
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const renderContent = () => {
    if (error || !source) {
      return (
        <View style={[styles.placeholder, containerStyle]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
          {showPlaceholder && (
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {placeholder}
            </Text>
          )}
        </View>
      );
    }

    return (
      <RNImage
        source={{ uri: source }}
        style={[imageStyle, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    );
  };

  const content = (
    <View style={[styles.container, containerStyle]}>
      {renderContent()}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 