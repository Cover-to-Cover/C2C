// components/Header.ios.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';

const Header: React.FC = () => {
  const segments = useSegments();
  // Use the last segment as the base title; if there’s none, fallback to a default.
  let title = segments[segments.length - 1] || 'Cover to Cover';

  // Remove the word "Screen" (case-insensitive) if it's at the end.
  title = title.replace(/screen$/i, '');

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#333',
    height: 100,
    alignItems: 'baseline',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    paddingTop: 40,
    paddingLeft: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Header;