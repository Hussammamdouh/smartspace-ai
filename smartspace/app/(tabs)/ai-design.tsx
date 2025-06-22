import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import AIDesignCard from '../../components/AIDesignCard';

interface Design {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  roomType: string;
  createdAt: string;
}

const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Dining Room',
  'Office',
  'Study',
  'Garden',
];

const DESIGN_STYLES = [
  'Modern',
  'Minimalist',
  'Scandinavian',
  'Industrial',
  'Bohemian',
  'Traditional',
  'Contemporary',
  'Art Deco',
  'Rustic',
  'Coastal',
];

export default function AIDesignScreen() {
  const { isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadDesigns();
    }
  }, [isAuthenticated]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDesigns();
      if (response.success && response.data) {
        setDesigns(response.data as Design[]);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      Alert.alert('Error', 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDesign = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to generate designs');
      return;
    }

    if (!selectedRoomType || !selectedStyle || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    try {
      setGenerating(true);
      const response = await apiService.generateDesign({
        roomType: selectedRoomType,
        style: selectedStyle,
        description: description.trim(),
      });

      if (response.success && response.data) {
        Alert.alert('Success', 'Design generated successfully!');
        setShowGenerateModal(false);
        resetForm();
        loadDesigns(); // Reload designs to show the new one
      } else {
        Alert.alert('Error', response.error || 'Failed to generate design');
      }
    } catch (error) {
      console.error('Error generating design:', error);
      Alert.alert('Error', 'Failed to generate design');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (designId: string) => {
    Alert.alert('Download', 'Download functionality will be implemented');
  };

  const handleShare = async (designId: string) => {
    Alert.alert('Share', 'Share functionality will be implemented');
  };

  const handleEditDesign = async (designId: string) => {
    Alert.alert('Edit Design', 'Edit functionality will be implemented');
  };

  const resetForm = () => {
    setSelectedRoomType('');
    setSelectedStyle('');
    setDescription('');
  };

  const renderDesign = ({ item }: { item: Design }) => (
    <AIDesignCard
      design={item}
      onPress={() => handleEditDesign(item._id)}
      onDownload={() => handleDownload(item._id)}
      onShare={() => handleShare(item._id)}
    />
  );

  const renderRoomType = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selectedRoomType === item && styles.selectedOption,
      ]}
      onPress={() => setSelectedRoomType(item)}
    >
      <Text
        style={[
          styles.optionText,
          selectedRoomType === item && styles.selectedOptionText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderStyle = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selectedStyle === item && styles.selectedOption,
      ]}
      onPress={() => setSelectedStyle(item)}
    >
      <Text
        style={[
          styles.optionText,
          selectedStyle === item && styles.selectedOptionText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Design Studio</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FCF3E8" />
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {!isAuthenticated ? (
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={64} color="#666" />
          <Text style={styles.authText}>Login to access AI Design features</Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A58077" />
          <Text style={styles.loadingText}>Loading designs...</Text>
        </View>
      ) : (
        <FlatList
          data={designs}
          renderItem={renderDesign}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.designsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No designs yet</Text>
              <Text style={styles.emptySubtext}>
                Generate your first AI design to get started
              </Text>
            </View>
          }
        />
      )}

      {/* Generate Design Modal */}
      <Modal
        visible={showGenerateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate New Design</Text>
            <TouchableOpacity
              onPress={() => setShowGenerateModal(false)}
              disabled={generating}
            >
              <Ionicons name="close" size={24} color="#E5CBBE" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Room Type Selection */}
            <Text style={styles.sectionTitle}>Room Type</Text>
            <FlatList
              data={ROOM_TYPES}
              renderItem={renderRoomType}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />

            {/* Style Selection */}
            <Text style={styles.sectionTitle}>Design Style</Text>
            <FlatList
              data={DESIGN_STYLES}
              renderItem={renderStyle}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your ideal room design..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.submitButton, generating && styles.disabledButton]}
              onPress={handleGenerateDesign}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FCF3E8" />
              ) : (
                <Ionicons name="sparkles" size={20} color="#FCF3E8" />
              )}
              <Text style={styles.submitButtonText}>
                {generating ? 'Generating...' : 'Generate Design'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5CBBE',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A58077',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonText: {
    color: '#FCF3E8',
    fontWeight: '600',
    marginLeft: 4,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E5CBBE',
    marginTop: 16,
    fontSize: 16,
  },
  designsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2C',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E5CBBE',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5CBBE',
    marginBottom: 12,
    marginTop: 16,
  },
  optionsList: {
    paddingBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedOption: {
    backgroundColor: '#A58077',
    borderColor: '#A58077',
  },
  optionText: {
    color: '#E5CBBE',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FCF3E8',
  },
  descriptionInput: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 16,
    color: '#E5CBBE',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A58077',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#FCF3E8',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 