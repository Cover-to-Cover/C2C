import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  // This function checks if the current pathname is different from the destination path.
  const navigate = (path: string) => {
    if (pathname === path) {
      return; // Already on the desired route; do nothing.
    }
    router.push(path);
  };

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/DashboardScreen')}
      >
        <FontAwesome name="home" size={24} color="#fff" />
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/LikedScreen')}
      >
        <FontAwesome name="heart" size={24} color="#fff" />
        <Text style={styles.navLabel}>Liked</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/AwardsScreen')}
      >
        <FontAwesome name="trophy" size={24} color="#fff" />
        <Text style={styles.navLabel}>Awards</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/ProfileScreen')}
      >
        <FontAwesome name="user" size={24} color="#fff" />
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'black',
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});