import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export default function EditDesignScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [design, setDesign] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [roomType, setRoomType] = useState('');

  useEffect(() => {
    if (id) {
      fetchDesign();
    }
  }, [id]);

  const fetchDesign = async () => {
    setLoading(true);
    try {
      const response = await api.getDesignForEdit(id as string);
      if (response.success && response.data) {
        setDesign(response.data);
        setTitle(response.data.title || '');
        setDescription(response.data.description || '');
        setStyle(response.data.style || '');
        setRoomType(response.data.roomType || '');
      } else {
        Alert.alert('Error', response.error || 'Failed to load design');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load design');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use the edit design preferences endpoint
      const response = await api.saveEditDesignPreferences(id as string, {
        stylePreferences: { style },
        notes: description
      });
      
      if (response.success) {
        Alert.alert('Success', 'Design preferences saved successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to save design preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save design preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading design...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Edit Design</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Design Title"
        placeholderTextColor={colors.textSecondary}
        editable={false} // Title is not editable for now
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Style</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        value={style}
        onChangeText={setStyle}
        placeholder="Style"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Room Type</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        value={roomType}
        onChangeText={setRoomType}
        placeholder="Room Type"
        placeholderTextColor={colors.textSecondary}
        editable={false} // Room type is not editable for now
      />
      <Button
        title={saving ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        disabled={saving}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 32,
  },
}); 