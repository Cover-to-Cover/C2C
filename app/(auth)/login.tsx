// app/login.tsx (or app/(auth)/login.tsx if that’s where it lives)
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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabaseClient'; // or '../lib/...' if file moved

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);

  const { height: screenHeight } = useWindowDimensions();

  // If we already have a session, go straight to dashboard
  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/dashboard');
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');

    // Where Supabase should send the user back AFTER Google login
    const redirectTo =
      Platform.OS === 'web'
        ? window.location.origin // e.g. https://covertocoverapp.com
        : makeRedirectUri({ scheme: 'cover-to-cover' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // can also add scopes here if needed
      },
    });

    if (error) {
      console.error('Google login error:', error.message);
      setErrorMessage(error.message);
      return;
    }

    if (data?.url) {
      if (Platform.OS === 'web') {
        // full-page redirect so Supabase can finish OAuth in this tab
        window.location.href = data.url;
      } else {
        // native: open external browser for OAuth
        await WebBrowser.openBrowserAsync(data.url);
      }
    }
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
          {/* Logo */}
          <View style={[styles.logoContainer, { height: screenHeight * 0.5 }]}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
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
