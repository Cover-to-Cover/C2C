// app/_layout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import Header from '../components/Header.ios';
import FooterNav from '../components/FooterNav.ios';

export default function Layout() {
  const segments = useSegments();
  // Check if any segment starts with '(' indicating a route group such as auth.
  // Adjust the logic if needed based on your folder structure.
  const isAuthScreen = segments.some(segment => segment.startsWith('('));

  return (
    <View style={styles.container}>
      {/* Only show the header if not an auth screen */}
      {!isAuthScreen && <Header />}
      
      {/* Route Content */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Only show the footer if not an auth screen */}
      {!isAuthScreen && <FooterNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
