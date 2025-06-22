import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AIDesignCardProps {
  design: {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    style: string;
    roomType: string;
    createdAt: string;
  };
  onPress: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function AIDesignCard({
  design,
  onPress,
  onDownload,
  onShare,
}: AIDesignCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: design.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
              <Ionicons name="download-outline" size={20} color="#E5CBBE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Ionicons name="share-outline" size={20} color="#E5CBBE" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {design.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {design.description}
        </Text>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{design.roomType}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{design.style}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(design.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#A58077',
    marginBottom: 12,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#A58077',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#E5CBBE',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
}); 