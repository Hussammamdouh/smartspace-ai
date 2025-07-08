import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ visible, message, type = 'info', onHide, duration = 2500 }: ToastProps) {
  const translateY = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, translateY]);

  if (!visible) return null;

  let backgroundColor = '#333';
  if (type === 'success') backgroundColor = '#4BB543';
  if (type === 'error') backgroundColor = '#D7263D';
  if (type === 'info') backgroundColor = '#2C2C2C';

  return (
    <Animated.View style={[styles.toast, { backgroundColor, transform: [{ translateY }], width: width - 40 }]}> 
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    zIndex: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 