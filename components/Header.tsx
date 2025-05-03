// components/Header.ios.tsx
import React from 'react'; // Import React for creating the component and using JSX
import { View, Text, StyleSheet } from 'react-native'; // Import core React Native components and StyleSheet for styling
import { useSegments } from 'expo-router'; // Import the hook to access navigation segments from the expo-router

// Define a functional component called Header using React.FC for type checking
const Header: React.FC = () => {
  // Retrieve the current navigation segments which represent parts of the URL route
  const segments = useSegments();
  
  // Use the last segment as the base title.
  // If no segments exist (i.e., undefined or empty), default to "Cover to Cover".
  let title = segments[segments.length - 1] || 'Cover to Cover';

  // Remove the word "Screen" (case-insensitive) if it's at the end of the title.
  title = title.replace(/screen$/i, '');

  // Render the header using a View container and a Text component for the title.
  return (
    <View style={styles.header}>
      {/* Display the computed title in the styled Text component */}
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

// Create a StyleSheet for the Header component to define its appearance
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#333',       // Set a dark background color for the header
    height: 100,                   // Define a fixed height for the header component
    alignItems: 'baseline',        // Align children along the baseline (useful for text alignment)
    justifyContent: 'center',      // Center children vertically within the container
    borderBottomWidth: 2,          // Add a bottom border with a width of 2 pixels
    borderBottomColor: 'black',    // Set the color of the bottom border to black
    paddingTop: 40,                // Add top padding to provide space from the status bar or top edge
    paddingLeft: 20,               // Add left padding to space the content away from the left edge
  },
  headerText: {
    color: 'white',                // Set the text color to white for contrast against the dark background
    fontSize: 24,                  // Increase font size for the header title
    fontWeight: 'bold',            // Use bold font weight to emphasize the header text
  },
});

// Export the Header component to make it available for import in other parts of the app
export default Header;
