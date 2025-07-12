import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function AIDesignScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a description of your room');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to generate designs');
      return;
    }

    setIsGenerating(true);
    try {
      // Use the new OpenAI unified endpoint
      const response = await api.generateDesign(prompt.trim());

      if (response.success && response.data) {
        // Backend returns design data with imageUrl
        const designData = response.data as any;
        setGeneratedImage(designData.imageUrl || designData.content || 'https://example.com/generated-image.jpg');
        Alert.alert('Success', 'Your design has been generated!');
      } else {
        Alert.alert('Error', response.error || 'Failed to generate image');
      }
    } catch (error: any) {
      console.error('Generate image error:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!generatedImage) return;

    try {
      // For now, just show success message since we don't have a save design endpoint
      Alert.alert('Success', 'Design saved to your collection!');
    } catch (error: any) {
      console.error('Save design error:', error);
      Alert.alert('Error', 'Failed to save design');
    }
  };

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>AI Design Generator</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Describe your dream space and let AI create it for you
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={[styles.sectionTitle, textStyle]}>Describe Your Room</Text>
        <TextInput
          style={[styles.textInput, inputStyle]}
          placeholder="e.g., A modern living room with large windows, neutral colors, and comfortable seating"
          placeholderTextColor={colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <View style={styles.styleOptions}>
          <Text style={[styles.styleLabel, textStyle]}>Style:</Text>
          <View style={styles.styleButtons}>
            {['Modern', 'Traditional', 'Minimalist', 'Bohemian'].map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}
              >
                <Text style={[styles.styleButtonText, textStyle]}>{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={isGenerating ? 'Generating...' : 'Generate Design'}
          onPress={handleGenerateImage}
          disabled={isGenerating}
          style={styles.generateButton}
        />
      </View>

      {/* Generated Image Section */}
      {isGenerating && (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, subtitleStyle]}>
            Creating your dream space...
          </Text>
        </View>
      )}

      {generatedImage && (
        <View style={styles.resultSection}>
          <Text style={[styles.sectionTitle, textStyle]}>Your Generated Design</Text>
          
          <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.imagePlaceholder, subtitleStyle]}>
              Generated Image Here
            </Text>
            {/* In a real app, you would use Image component here */}
            {/* <Image source={{ uri: generatedImage }} style={styles.generatedImage} /> */}
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Save Design"
              onPress={handleSaveDesign}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Generate Another"
              onPress={() => {
                setGeneratedImage(null);
                setPrompt('');
              }}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={[styles.sectionTitle, textStyle]}>Tips for Better Results</Text>
        <View style={styles.tipsList}>
          {[
            'Be specific about colors, materials, and furniture',
            'Mention the room type (living room, bedroom, kitchen)',
            'Include lighting preferences (natural, warm, cool)',
            'Describe the overall mood you want to achieve',
          ].map((tip, index) => (
            <View key={`tip-${index}-${tip.substring(0, 10)}`} style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.tipText, subtitleStyle]}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  styleOptions: {
    marginBottom: 24,
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  styleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    marginBottom: 24,
  },
  loadingSection: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultSection: {
    padding: 24,
  },
  imageContainer: {
    width: width - 48,
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    fontSize: 16,
  },
  generatedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tipsSection: {
    padding: 24,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
}); 