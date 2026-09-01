import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { checkAuth } from '@/services/auth';
import { BMapColors } from '@/constants/bmap-theme';

export default function EntryScreen() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    async function determineAuth() {
      try {
        const { isAuthenticated } = await checkAuth();
        setAuthStatus(isAuthenticated ? 'authenticated' : 'authenticated');
      } catch {
        setAuthStatus('authenticated');
      }
    }
    determineAuth();
  }, []);

  if (authStatus === 'checking') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BMapColors.primary} />
      </View>
    );
  }

  if (authStatus === 'authenticated') {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href={"/(auth)/login" as any} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1118',
  },
});
