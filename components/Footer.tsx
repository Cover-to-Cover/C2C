// FooterNav.ios.tsx
// This file defines a footer navigation component for iOS using Expo.
// The component displays navigation options with icons and labels, and navigates to different screens using the Expo router.

import React from 'react'; // Import React for component creation and JSX support.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; // Import core components from React Native.
import { useRouter, usePathname } from 'expo-router'; // Import hooks for navigation and getting the current path from Expo Router.
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons for visual cues in the navigation.

// Define and export the FooterNav functional component.
export default function Footer() {
  // useRouter returns the router object for handling navigation.
  const router = useRouter();

  // usePathname returns the current route's pathname.
  const pathname = usePathname();

  // The navigate function checks if the current pathname differs from the target path.
  // If it does, it pushes the new path onto the navigation stack.
  const navigate = (path: string) => {
    if (pathname === path) {
      return; // If the user is already on the desired route, do nothing.
    }
    router.push(path); // Otherwise, navigate to the specified path.
  };

  // Render the footer navigation container with multiple touchable navigation items.
  return (
    // The container View applies flex styles to arrange child items horizontally.
    <View style={styles.navContainer}>
      {/* Navigation item: Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/DashboardScreen')} // Navigate to DashboardScreen when pressed.
      >
        {/* Home icon using FontAwesome */}
        <FontAwesome name="home" size={24} color="#fff" />
        {/* Home label */}
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>

      {/* Navigation item: Liked */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/LikedScreen')} // Navigate to LikedScreen when pressed.
      >
        {/* Liked icon using FontAwesome */}
        <FontAwesome name="heart" size={24} color="#fff" />
        {/* Liked label */}
        <Text style={styles.navLabel}>Liked</Text>
      </TouchableOpacity>

      {/* Navigation item: Awards */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/AwardsScreen')} // Navigate to AwardsScreen when pressed.
      >
        {/* Awards icon using FontAwesome */}
        <FontAwesome name="trophy" size={24} color="#fff" />
        {/* Awards label */}
        <Text style={styles.navLabel}>Awards</Text>
      </TouchableOpacity>

      {/* Navigation item: Profile */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate('/ProfileScreen')} // Navigate to ProfileScreen when pressed.
      >
        {/* Profile icon using FontAwesome */}
        <FontAwesome name="user" size={24} color="#fff" />
        {/* Profile label */}
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

// Create a StyleSheet for styling the FooterNav component.
const styles = StyleSheet.create({
  // Style for the navigation container.
  navContainer: {
    flexDirection: 'row',         // Arrange children in a horizontal row.
    justifyContent: 'space-around', // Evenly space out the navigation items.
    alignItems: 'center',         // Align the items vertically at the center.
    backgroundColor: '#333',      // Dark background for the footer.
    height: 70,                   // Fixed height for the footer.
    paddingBottom: 10,            // Bottom padding to create space for items.
    borderTopWidth: 1,            // Add a top border.
    borderTopColor: 'black',      // Top border color.
    width: '100%',                // Full width of the device screen.
  },
  // Style for each individual navigation item.
  navItem: {
    alignItems: 'center',         // Center icon and label horizontally.
  },
  // Style for the text labels under each icon.
  navLabel: {
    color: '#fff',                // White text color for readability.
    fontSize: 12,                 // Smaller font size for the labels.
    marginTop: 4,                 // Small top margin to add spacing between the icon and label.
  },
});