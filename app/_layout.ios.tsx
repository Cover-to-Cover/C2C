// app/_layout.ios.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import Header from '../components/Header.ios';
import FooterNav from '../components/FooterNav.ios';

export default function Layout() {
  const pathname = usePathname();
  // Define the list of auth routes (adjust these as needed)
  const authRoutes = ['/LoginScreen', '/RegisterScreen'];
  // Check if the current pathname is one of the auth screens
  const isAuthScreen = authRoutes.includes(pathname);

  return (
    <View style={styles.container}>
      {/* Only render Header if not on an auth screen */}
      {!isAuthScreen && <Header />}
      
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </View>
      
      {/* Only render Footer if not on an auth screen */}
      {!isAuthScreen && <FooterNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
