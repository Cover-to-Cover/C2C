// app/login.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabaseClient';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);

  // hooks for dynamic layout
  const { height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace('/dashboard');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) router.replace('/dashboard');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
  };

  const handleGoogleLogin = async () => {
    const redirectUri = makeRedirectUri({ scheme: 'cover-to-cover' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://www.covertocoverapp.com/dashboard' }
    });
    if (error) console.error(error.message);
    else if (data.url) await WebBrowser.openBrowserAsync(data.url);
  };

  const handleGoToRegister = () => router.push('/register');

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo occupies remaining space above controls */}
          <View style={[styles.logoContainer, { height: screenHeight * 0.5 }]}> 
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <Text style={styles.header}>Login</Text>
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleGoToRegister}>
                <Text style={styles.btnText}>Register</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleLogo}
              />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
  },
  controlsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
});