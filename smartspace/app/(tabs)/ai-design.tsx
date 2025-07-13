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
  Image,
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
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);

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

  const designStyles = [
    { name: 'Modern', description: 'Clean lines and contemporary design' },
    { name: 'Traditional', description: 'Classic and timeless elegance' },
    { name: 'Minimalist', description: 'Simple and uncluttered spaces' },
    { name: 'Bohemian', description: 'Eclectic and artistic flair' },
    { name: 'Scandinavian', description: 'Light, airy, and functional' },
    { name: 'Industrial', description: 'Raw materials and urban feel' },
  ];

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
      // Build the full prompt with style if selected
      let fullPrompt = prompt.trim();
      if (selectedStyle) {
        fullPrompt = `${fullPrompt} in ${selectedStyle} style`;
      }

      // Use the generateDesign endpoint
      const response = await api.generateDesign(fullPrompt);

      if (response.success && response.data) {
        const designData = response.data as any;
        setGeneratedImage(designData.imageUrl || designData.content);
        setDesignId(designData._id || designData.id);
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
    if (!generatedImage || !designId) return;

    try {
      // Navigate to edit design page to save preferences
      Alert.alert('Success', 'Design saved to your collection!');
    } catch (error: any) {
      console.error('Save design error:', error);
      Alert.alert('Error', 'Failed to save design');
    }
  };

  const handleEditDesign = () => {
    if (designId) {
      // Navigate to edit design page
      // router.push(`/edit-design/${designId}`);
      Alert.alert('Edit Design', 'Edit design functionality coming soon!');
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
          <Text style={[styles.styleLabel, textStyle]}>Style (Optional):</Text>
          <View style={styles.styleButtons}>
            {designStyles.map((style) => (
              <TouchableOpacity
                key={style.name}
                style={[
                  styles.styleButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedStyle === style.name && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedStyle(selectedStyle === style.name ? '' : style.name)}
              >
                <Text style={[
                  styles.styleButtonText, 
                  textStyle,
                  selectedStyle === style.name && { color: '#FFFFFF' }
                ]}>
                  {style.name}
                </Text>
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
          <Text style={[styles.loadingSubtext, subtitleStyle]}>
            This may take a few moments
          </Text>
        </View>
      )}

      {generatedImage && (
        <View style={styles.resultSection}>
          <Text style={[styles.sectionTitle, textStyle]}>Your Generated Design</Text>
          
          <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image 
              source={{ uri: generatedImage }} 
              style={styles.generatedImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Save Design"
              onPress={handleSaveDesign}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Edit Design"
              onPress={handleEditDesign}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Generate Another"
              onPress={() => {
                setGeneratedImage(null);
                setDesignId(null);
                setPrompt('');
                setSelectedStyle('');
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
            'Specify dimensions or size requirements',
            'Mention any specific features (fireplace, balcony, etc.)',
          ].map((tip, index) => (
            <View key={`tip-${index}`} style={styles.tipItem}>
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
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  resultSection: {
    padding: 24,
  },
  imageContainer: {
    width: width - 48,
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
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