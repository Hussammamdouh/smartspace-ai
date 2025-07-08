import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

function ErrorFallback({ error, errorInfo, onReset }: { 
  error?: Error; 
  errorInfo?: ErrorInfo; 
  onReset: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={64} color={colors.primary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
        </Text>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={onReset}
        >
          <Text style={styles.resetButtonText}>Try Again</Text>
        </TouchableOpacity>

        {__DEV__ && error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Error Details (Development):</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error.toString()}
            </Text>
            {errorInfo && (
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {errorInfo.componentStack}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resetButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
}); 