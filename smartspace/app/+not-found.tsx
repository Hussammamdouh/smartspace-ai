import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();

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

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.title, textStyle]}>This screen doesn't exist.</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          The page you are looking for could not be found.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Go to home screen!
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
