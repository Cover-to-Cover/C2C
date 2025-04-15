// app/_layout.ios.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Header from '../components/Header.ios';
import FooterNav from '../components/FooterNav.ios';

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* Your custom header */}
      <Header title="Cover to Cover" />

      {/* Stack with the built-in header disabled */}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false, // Hides the default Stack header
          }}
        />
      </View>

      {/* Your custom footer */}
      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
