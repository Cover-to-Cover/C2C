// app/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';

interface UserProfile {
  id: string;
  email: string;
  // additional profile fields as needed
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setProfile({
          id: session.user.id,
          email: session.user.email ?? '',
        });
      } else {
        router.push('/login');
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    router.push('/login');
  };

  const handleChangePassword = async () => {
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters long.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Error updating password:', error.message);
      setPasswordMessage('Error updating password: ' + error.message);
    } else {
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <View style={styles.profilesContainer}>
      <Text style={styles.heading}>Profile</Text>
      {profile ? (
        <View style={styles.profileContent}>
          <Text style={styles.text}>Email: {profile.email}</Text>

          <Text style={styles.subHeading}>Change Password</Text>
          <View style={styles.passwordForm}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          {passwordMessage ? <Text style={styles.passwordMessage}>{passwordMessage}</Text> : null}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading profile...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profilesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',       // Center horizontally
    justifyContent: 'center',   // Center vertically
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  profileContent: {
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  passwordForm: {
    marginTop: 16,
    width: '90%',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
  },
  changePasswordButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 5,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  passwordMessage: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
