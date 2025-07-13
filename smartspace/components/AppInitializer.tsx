import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const { isInitialized } = useAuth();
  const { colors } = useTheme();

  if (!isInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: colors.textSecondary 
        }}>
          Loading SmartSpace.AI...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
} 