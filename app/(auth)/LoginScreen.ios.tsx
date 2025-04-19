import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  // Create a reference for the password input
  const passwordInputRef = useRef<TextInput>(null);

  // Check for an active session when the component mounts.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/DashboardScreen');
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push('/DashboardScreen');
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  // Google authentication is commented out for now.
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Google login error:', error.message);
    }
  };

  const handleGoToRegister = () => {
    router.push('/RegisterScreen');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
      />

      <Text style={styles.header}>Login</Text>
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <TextInput
        style={[styles.input, { color: '#333' }]}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
      />

      <TextInput
        ref={passwordInputRef}
        style={[styles.input, { color: '#333' }]}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        returnKeyType="done"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGoToRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Image
          source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
          style={styles.googleLogo}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 250,
    marginBottom: 20,        
    resizeMode: 'contain',
  },
  header: {
    fontSize: 28,
    color: '#333',
    marginBottom: 20,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    // "color" is set via inline style to ensure the text is visible
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#444',
    fontWeight: 'bold',
  },
});