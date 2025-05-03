// app/ProfileScreen.ios.tsx
// This screen displays the user's profile, allows them to change their password, and provides a logout option.

import React, { useEffect, useState } from 'react'; // Import React and hooks for state and side effects.
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'; // Import basic React Native components.
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client to handle authentication and database actions.
import { useRouter } from 'expo-router'; // Import the router hook for navigation between screens.

// Define an interface for the user's profile data.
interface UserProfile {
  id: string;
  email: string;
  // additional profile fields as needed can be added here
}

// Define and export the ProfileScreen component.
export default function ProfileScreen() {
  // State to store the current user's profile, initially null before the data is fetched.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // State for storing the value of the new password input field.
  const [newPassword, setNewPassword] = useState('');
  // State for storing the value of the confirm password input field.
  const [confirmPassword, setConfirmPassword] = useState('');
  // State for displaying messages related to password changes (error or success messages).
  const [passwordMessage, setPasswordMessage] = useState('');
  // Access the router object to programmatically navigate to other screens.
  const router = useRouter();

  // useEffect hook runs on component mount (and when router changes)
  // It fetches the current user's session and loads the profile if available.
  useEffect(() => {
    const fetchProfile = async () => {
      // Get the current session from Supabase authentication.
      const { data: { session } } = await supabase.auth.getSession();
      // If a user session exists, update the profile state.
      if (session?.user) {
        setProfile({
          id: session.user.id,
          email: session.user.email ?? '', // Use an empty string if the email is null.
        });
      } else {
        // If no valid session exists, navigate to the login screen.
        router.push('/login');
      }
    };
    fetchProfile();
  }, [router]); // Depend on the router to re-run the effect if it ever changes.

  // Function to handle logging out the user.
  // It calls supabase.auth.signOut and redirects to the LoginScreen.
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    router.push('/LoginScreen');
  };

  // Function to handle password change when the user submits the change password request.
  const handleChangePassword = async () => {
    // Clear any previous password messages.
    setPasswordMessage('');

    // Validate that the new password matches the confirmation password.
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    // Validate that the new password meets a minimum length requirement (6 characters).
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters long.');
      return;
    }

    // Update the user's password via Supabase.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      // If there's an error, log it and show an error message.
      console.error('Error updating password:', error.message);
      setPasswordMessage('Error updating password: ' + error.message);
    } else {
      // On success, show a success message and clear the password fields.
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    // Main container for the profile screen, styled using the profilesContainer style.
    <View style={styles.profilesContainer}>
      {/* Heading for the profile screen */}
      <Text style={styles.heading}>Profile</Text>
      {profile ? (
        // If the profile data has been fetched, display it and render the profile content.
        <View style={styles.profileContent}>
          {/* Display the user's email */}
          <Text style={styles.text}>Email: {profile.email}</Text>

          {/* Section for changing the password */}
          <Text style={styles.subHeading}>Change Password</Text>
          <View style={styles.passwordForm}>
            {/* Input field for new password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword} // Update newPassword state on change.
              />
            </View>
            {/* Input field for confirming the new password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword} // Update confirmPassword state on change.
              />
            </View>
            {/* Button to trigger the password change process */}
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          {/* Display any feedback message regarding the password change */}
          {passwordMessage ? <Text style={styles.passwordMessage}>{passwordMessage}</Text> : null}

          {/* Logout button to sign out the user */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // If the profile data isn't yet loaded, display a loading message.
        <Text style={styles.loadingText}>Loading profile...</Text>
      )}
    </View>
  );
}

// Define styles using React Native's StyleSheet for consistent styling across the component.
const styles = StyleSheet.create({
  profilesContainer: {
    flex: 1,                        // Occupies the entire screen.
    backgroundColor: '#fff',        // White background color.
    alignItems: 'center',           // Center content horizontally.
    justifyContent: 'center',       // Center content vertically.
    padding: 16,                    // Add padding around the container.
  },
  heading: {
    fontSize: 28,                   // Larger font size for the heading.
    fontWeight: 'bold',             // Bold font for emphasis.
    marginBottom: 16,               // Space below the heading.
    textAlign: 'center',            // Center-align the heading text.
    color: '#333',                  // Dark color for the heading.
  },
  profileContent: {
    width: '100%',                  // Occupies full width of the container.
    alignItems: 'center',           // Center content horizontally.
  },
  text: {
    fontSize: 16,                   // Standard font size for text.
    marginBottom: 8,                // Space below the text.
    color: '#333',                  // Dark text color.
    textAlign: 'center',            // Center-align text.
  },
  subHeading: {
    fontSize: 22,                   // Slightly larger font size for subheadings.
    fontWeight: 'bold',             // Bold font for subheadings.
    marginBottom: 8,                // Space below the subheading.
    color: '#333',                  // Dark color for the subheading.
    textAlign: 'center',            // Center-align the subheading.
  },
  passwordForm: {
    marginTop: 16,                  // Space above the password form.
    width: '90%',                   // Form takes up 90% of the container width.
    alignItems: 'center',           // Center form elements horizontally.
  },
  formGroup: {
    marginBottom: 16,               // Space below each form group.
    width: '100%',                  // Each form group occupies full width.
    alignItems: 'center',           // Center content horizontally.
  },
  label: {
    marginBottom: 4,                // Space between the label and the input.
    fontWeight: 'bold',             // Bold text for labels.
    color: '#333',                  // Dark color for labels.
    textAlign: 'center',            // Center-align labels.
  },
  input: {
    width: '100%',                  // Input field occupies full width.
    padding: 8,                     // Padding inside input fields.
    borderWidth: 2,                 // Border width for inputs.
    borderColor: '#ccc',            // Light grey border color.
    borderRadius: 5,                // Rounded corners for inputs.
    textAlign: 'center',            // Center-align text inside inputs.
  },
  changePasswordButton: {
    backgroundColor: '#f44336',     // Red background color for the button.
    paddingVertical: 8,             // Vertical padding for the button.
    paddingHorizontal: 16,          // Horizontal padding for the button.
    borderWidth: 2,                 // Border width for the button.
    borderColor: 'black',           // Black border color.
    borderRadius: 5,                // Rounded corners for the button.
    marginTop: 8,                   // Space above the button.
    alignItems: 'center',           // Center the button content.
  },
  logoutButton: {
    backgroundColor: '#f44336',     // Red background color for the logout button.
    paddingVertical: 8,             // Vertical padding for the logout button.
    paddingHorizontal: 16,          // Horizontal padding for the logout button.
    borderWidth: 2,                 // Border width for the logout button.
    borderColor: 'black',           // Black border color.
    borderRadius: 5,                // Rounded corners for the button.
    marginTop: 16,                  // Space above the logout button.
    alignItems: 'center',           // Center the logout button content.
  },
  buttonText: {
    color: 'white',                 // White text color for buttons.
    fontWeight: 'bold',             // Bold text for buttons.
    fontSize: 16,                   // Standard font size for button text.
  },
  passwordMessage: {
    marginTop: 8,                   // Space above the password message.
    fontWeight: 'bold',             // Bold text for emphasis.
    color: '#333',                  // Dark text color for readability.
    textAlign: 'center',            // Center-align the password message.
  },
  loadingText: {
    fontSize: 16,                   // Standard font size for loading text.
    color: '#333',                  // Dark color for the text.
    textAlign: 'center',            // Center-align loading text.
  },
});