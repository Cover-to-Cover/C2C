// app/(auth)/_layout.ios.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}