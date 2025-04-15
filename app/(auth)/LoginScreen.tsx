// src/features/login/Login.tsx
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/DashboardScreen');
    }
  };

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
    <div className="login-container">
      <h1 className="login-header">Login</h1>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="button-container">
          <button type="submit" className="login-button">Login</button>
          <button type="button" onClick={handleGoToRegister} className="register-button">
            Register
          </button>
        </div>
      </form>

      <button onClick={handleGoogleLogin} className="google-login-button">
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          style={{ width: 20, marginRight: 10 }}
        />
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;