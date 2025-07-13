import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ApiTest() {
  const { user } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      addResult('Testing health check...');
      const response = await api.healthCheck();
      addResult(`Health check: ${response.success ? 'SUCCESS' : 'FAILED'} - ${response.error || response.message}`);
    } catch (error) {
      addResult(`Health check ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCart = async () => {
    setLoading(true);
    try {
      addResult('Testing get cart...');
      const response = await api.getCart();
      addResult(`Get cart: ${response.success ? 'SUCCESS' : 'FAILED'} - ${response.error || 'OK'}`);
      if (response.success && response.data) {
        addResult(`Cart items: ${response.data.items?.length || 0}`);
      }
    } catch (error) {
      addResult(`Get cart ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    setLoading(true);
    try {
      addResult('Testing add to cart...');
      const response = await api.addToCart('507f1f77bcf86cd799439011', 1);
      addResult(`Add to cart: ${response.success ? 'SUCCESS' : 'FAILED'} - ${response.error || 'OK'}`);
    } catch (error) {
      addResult(`Add to cart ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetProducts = async () => {
    setLoading(true);
    try {
      addResult('Testing get products...');
      const response = await api.getProducts({ limit: 5 });
      addResult(`Get products: ${response.success ? 'SUCCESS' : 'FAILED'} - ${response.error || 'OK'}`);
      if (response.success && response.data) {
        const products = Array.isArray(response.data) ? response.data : response.data.data || response.data.products || [];
        addResult(`Products count: ${products.length}`);
      }
    } catch (error) {
      addResult(`Get products ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test</Text>
      <Text style={styles.subtitle}>User: {user ? user.email : 'Not logged in'}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testHealthCheck}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Health Check</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testGetProducts}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testGetCart}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testAddToCart}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    maxHeight: 200,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
}); 