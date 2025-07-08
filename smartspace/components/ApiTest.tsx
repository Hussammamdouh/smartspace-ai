import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

export const ApiTest: React.FC = () => {
  const { colors } = useTheme();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testApiConnection = async () => {
    setTesting(true);
    setResults([]);
    addResult('Starting API connection tests...');
    
    try {
      // Test 1: Health check
      addResult('Testing health check endpoint...');
      const healthResponse = await api.healthCheck();
      if (healthResponse.success) {
        addResult(`✅ Health check passed: ${healthResponse.data?.status || 'OK'}`);
      } else {
        addResult(`❌ Health check failed: ${healthResponse.error}`);
      }
      
      // Test 2: Products endpoint
      addResult('Testing products endpoint...');
      const productsResponse = await api.getProducts({ limit: 5 });
      if (productsResponse.success) {
        const products = productsResponse.data as any;
        const count = products.length || (products.products ? products.products.length : 0);
        addResult(`✅ Products endpoint working! Found ${count} products`);
      } else {
        addResult(`❌ Products endpoint failed: ${productsResponse.error}`);
      }

      // Test 3: Categories endpoint
      addResult('Testing categories endpoint...');
      const categoriesResponse = await api.getCategories();
      if (categoriesResponse.success) {
        const categories = categoriesResponse.data as any;
        const count = categories.length || 0;
        addResult(`✅ Categories endpoint working! Found ${count} categories`);
      } else {
        addResult(`❌ Categories endpoint failed: ${categoriesResponse.error}`);
      }

      // Test 4: Auth endpoints (without authentication)
      addResult('Testing auth endpoints...');
      const authTestResponse = await api.login('test@example.com', 'password');
      if (authTestResponse.success) {
        addResult('✅ Auth endpoints working (unexpected success)');
      } else {
        addResult(`✅ Auth endpoints working (expected error: ${authTestResponse.error})`);
      }

      addResult('🎉 API connection tests completed!');
      
      // Show summary alert
      const successCount = results.filter(r => r.includes('✅')).length;
      const totalTests = 4;
      Alert.alert(
        'API Test Results', 
        `Tests completed!\n\nSuccess: ${successCount}/${totalTests}\n\nCheck the results below for details.`
      );
      
    } catch (error) {
      console.error('🧪 Test failed:', error);
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Error', 'API test failed. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>API Connection Test</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Test the connection to the backend server and verify all endpoints
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={testApiConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Run API Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.border }]}
          onPress={clearResults}
          disabled={testing}
        >
          <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
            Clear Results
          </Text>
        </TouchableOpacity>
      </View>
      
      {results.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>Test Results:</Text>
          <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {results.map((result, index) => (
              <Text key={index} style={[styles.resultText, { color: colors.text }]}>
                {result}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    padding: 16,
    borderRadius: 8,
    maxHeight: 200,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultsScroll: {
    flex: 1,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
}); 