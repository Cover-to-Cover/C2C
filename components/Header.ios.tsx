// components/Header.ios.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const segments = useSegments();
  const defaultTitle = segments[segments.length - 1] || 'Cover to Cover';
  const displayTitle = title || defaultTitle;

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{displayTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#333',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Header;