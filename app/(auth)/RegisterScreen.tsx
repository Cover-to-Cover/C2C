// src/features/register/Register.tsx
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import './Register.css';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Google login error:', error.message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/LoginScreen');
    }
  };

  const handleBackToLogin = () => {
    router.push('/LoginScreen');
  };

  return (
    <div className="register-container">
      <h1 className="register-header">Register</h1>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="button-container">
          <button type="submit" className="register-button">Register</button>
          <button type="button" onClick={handleBackToLogin} className="back-button">Back to Login</button>
        </div>
      </form>

      {/* Google Sign Up Button (no label, just spacing) */}
      <div className="g-signin-wrapper">
        <div className="g-signin-btn" onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="g-logo"
          />
          <span className="g-text">Sign up with Google</span>
        </div>
      </div>
    </div>
  );
};

export default Register;