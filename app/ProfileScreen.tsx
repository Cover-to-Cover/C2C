import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';
import './Profiles.css';
import { navigate } from 'expo-router/build/global-state/routing';

interface UserProfile {
  id: string;
  email: string;
  // add additional profile fields as needed
}

const Profiles: React.FC = () => {
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
        router.push('/LoginScreen');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    router.push('/LoginScreen');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="profiles-container">
      <h1>Profile</h1>
      {profile ? (
        <div className="profile-content">
          <p>Email: {profile.email}</p>

          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="new-password">New Password:</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="change-password-button">
              Change Password
            </button>
          </form>

          {passwordMessage && <p className="password-message">{passwordMessage}</p>}

          {/* Logout button moved to the bottom */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profiles;
