import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Note: Use the URL path as it appears in the browser, not the filesystem
  return <Redirect href="/login" />;
}