// app/_layout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../components/Header.ios';
import FooterNav from '../components/FooterNav.ios';

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* Global Header */}
      <Header title="Cover to Cover" />
      
      {/* Route Content */}
      <View style={styles.content}>
        <Stack />
      </View>

      {/* Global Footer */}
      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});