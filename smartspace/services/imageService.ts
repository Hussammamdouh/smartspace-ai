import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import api from './api';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImagePickerOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
}

class ImageService {
  private readonly DEFAULT_OPTIONS: ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    allowsMultipleSelection: false,
    selectionLimit: 1,
  };

  async requestPermissions(): Promise<boolean> {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Request media library permissions
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert(
          'Media Library Permission Required',
          'Please grant media library permission to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async pickImage(options: Partial<ImagePickerOptions> = {}): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const pickerOptions = { ...this.DEFAULT_OPTIONS, ...options };
      
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  async takePhoto(options: Partial<ImagePickerOptions> = {}): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const pickerOptions = { 
        ...this.DEFAULT_OPTIONS, 
        ...options,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };
      
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  async pickMultipleImages(limit: number = 5): Promise<string[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: limit,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets) {
        return result.assets.map(asset => asset.uri);
      }
      
      return [];
    } catch (error) {
      console.error('Error picking multiple images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
      return [];
    }
  }

  async uploadImage(imageUri: string, type: 'profile' | 'design' = 'profile'): Promise<ImageUploadResult> {
    try {
      const result = await api.uploadImage(imageUri, type);
      
      if (result.success && result.data?.url) {
        return {
          success: true,
          url: result.data.url,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed',
        };
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: 'Upload failed. Please try again.',
      };
    }
  }

  async uploadMultipleImages(imageUris: string[], type: 'design' = 'design'): Promise<ImageUploadResult[]> {
    try {
      const uploadPromises = imageUris.map(uri => this.uploadImage(uri, type));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      return imageUris.map(() => ({
        success: false,
        error: 'Upload failed',
      }));
    }
  }

  async saveToGallery(imageUri: string): Promise<boolean> {
    try {
      const hasPermission = await MediaLibrary.requestPermissionsAsync();
      if (!hasPermission.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your gallery.',
          [{ text: 'OK' }]
        );
        return false;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Success', 'Image saved to gallery!');
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save image to gallery.');
      return false;
    }
  }

  async getImageInfo(imageUri: string): Promise<{ width: number; height: number; size: number } | null> {
    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      return {
        width: asset.width,
        height: asset.height,
        size: 0, // MediaLibrary Asset doesn't have fileSize property
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  async compressImage(imageUri: string, quality: number = 0.8): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
        base64: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return imageUri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return imageUri;
    }
  }

  async validateImage(imageUri: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const info = await this.getImageInfo(imageUri);
      if (!info) {
        return { valid: false, error: 'Invalid image file' };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (info.size > maxSize) {
        return { valid: false, error: 'Image size too large. Maximum size is 10MB.' };
      }

      // Check dimensions (min 100x100, max 4000x4000)
      const minDimension = 100;
      const maxDimension = 4000;
      
      if (info.width < minDimension || info.height < minDimension) {
        return { valid: false, error: 'Image too small. Minimum size is 100x100 pixels.' };
      }
      
      if (info.width > maxDimension || info.height > maxDimension) {
        return { valid: false, error: 'Image too large. Maximum size is 4000x4000 pixels.' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating image:', error);
      return { valid: false, error: 'Failed to validate image' };
    }
  }

  async processImageForUpload(imageUri: string): Promise<string | null> {
    try {
      // Validate image
      const validation = await this.validateImage(imageUri);
      if (!validation.valid) {
        Alert.alert('Invalid Image', validation.error || 'Image validation failed');
        return null;
      }

      // Compress if needed
      const info = await this.getImageInfo(imageUri);
      if (info && info.size > 5 * 1024 * 1024) { // 5MB
        const compressedUri = await this.compressImage(imageUri, 0.7);
        return compressedUri;
      }

      return imageUri;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  // Utility methods
  getImageUrl(url: string, width: number = 300, height: number = 300): string {
    // This would typically use a CDN or image service
    // For now, return the original URL
    return url;
  }

  getPlaceholderUrl(width: number = 300, height: number = 300): string {
    return `https://via.placeholder.com/${width}x${height}/f0f0f0/999999?text=Image`;
  }
}

export const imageService = new ImageService();
export default imageService; 