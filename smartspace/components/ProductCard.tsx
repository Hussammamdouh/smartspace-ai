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

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    inStock: boolean;
  };
  onPress: () => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  isInWishlist?: boolean;
}

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={onAddToWishlist}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={20}
            color={isInWishlist ? '#A58077' : '#E5CBBE'}
          />
        </TouchableOpacity>
        {!product.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price}</Text>
          <TouchableOpacity
            style={[styles.addButton, !product.inStock && styles.disabledButton]}
            onPress={onAddToCart}
            disabled={!product.inStock}
          >
            <Ionicons name="add" size={20} color="#E5CBBE" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2,
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
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  outOfStock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#E5CBBE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E5CBBE',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#A58077',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FCF3E8',
  },
  addButton: {
    backgroundColor: '#A58077',
    borderRadius: 20,
    padding: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
}); 