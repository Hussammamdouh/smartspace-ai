import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBackend = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      console.log('Checking backend status...');
      const response = await api.healthCheck();
      console.log('Backend health check response:', response);
      
      if (response.success) {
        setStatus('online');
        setLastCheck(new Date());
      } else {
        setStatus('offline');
        setError(response.error || 'Backend returned error');
      }
    } catch (error) {
      console.error('Backend check failed:', error);
      setStatus('offline');
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'checking': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Status</Text>
      
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {lastCheck && (
        <Text style={styles.lastCheck}>
          Last check: {lastCheck.toLocaleTimeString()}
        </Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={checkBackend}>
        <Text style={styles.buttonText}>Check Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastCheck: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 