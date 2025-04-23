// app/ProfileScreen.tsx
import React, { useEffect, useState } from 'react'; // Import React and hooks for component state and lifecycle management.
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client to interact with authentication and database.
import { useRouter } from 'expo-router'; // Import the Expo Router hook for navigating between screens.
import './Profiles.css'; // Import CSS file for component styling.
import { navigate } from 'expo-router/build/global-state/routing'; // Import navigate (if needed) for navigation global state.
import * as XLSX from 'xlsx'; // Import xlsx for Excel file creation
import { saveAs } from 'file-saver'; // Import file-saver to download the file

// Define an interface representing a user profile with at least 'id' and 'email' fields.
// Additional profile fields can be added as needed.
interface UserProfile {
  id: string;
  email: string;
  // add additional profile fields as needed
}

// Define interface for  theliked books
interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  cover_id?: number;
  description?: string;
  openLibraryLink?: string;
  isbn13?: string;
}

// Define the Profiles functional component using React.FC.
const Profiles: React.FC = () => {
  // Define state for storing the user's profile information; initially null.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // State for the new password input field.
  const [newPassword, setNewPassword] = useState('');
  // State for the confirm password input field.
  const [confirmPassword, setConfirmPassword] = useState('');
  // State to store and display messages related to password change actions.
  const [passwordMessage, setPasswordMessage] = useState('');
  // State to track export
  const [exporting, setExporting] = useState(false);
  // Get the router object for navigating between screens.
  const router = useRouter();

  // useEffect hook to fetch the user profile when the component mounts or when 'navigate' changes.
  useEffect(() => {
    const fetchProfile = async () => {
      // Get the current session details from Supabase authentication.
      const { data: { session } } = await supabase.auth.getSession();
      // Check if a user session exists.
      if (session?.user) {
        // If a valid session exists, store the user profile details in state.
        setProfile({
          id: session.user.id,
          email: session.user.email ?? '', // Use an empty string if email is null.
        });
      } else {
        // If no valid session exists, redirect to the LoginScreen.
        router.push('/LoginScreen');
      }
    };
    // Call the asynchronous function to fetch the profile.
    fetchProfile();
  }, [navigate]); // The dependency array includes 'navigate', ensuring the effect runs on changes (though this might be redundant).

  // Function to export liked books to Excel
  const exportLikedBooks = async () => {
    if (!profile?.id) return;
    
    try {
      setExporting(true);
      
      // Fetch liked books from Supabase
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author')
        .eq('user_id', profile.id)
        .eq('liked', true);
      
      if (error) {
        console.error('Error fetching liked books:', error.message);
        alert('Error fetching liked books. Please try again.');
        setExporting(false);
        return;
      }
      
      if (!data || data.length === 0) {
        alert('You have no liked books to export.');
        setExporting(false);
        return;
      }
      
      // Create worksheet with data
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Liked Books');
      
      // Generate Excel file as a binary string
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Convert buffer to Blob
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save file using FileSaver
      saveAs(blob, `liked-books-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (err) {
      console.error('Error exporting books:', err);
      alert('Error exporting books. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Function to handle user logout.
  const handleLogout = async () => {
    // Call Supabase's signOut method.
    const { error } = await supabase.auth.signOut();
    // Log an error if sign-out failed.
    if (error) {
      console.error('Error signing out:', error.message);
    }
    // Redirect the user to the LoginScreen after logging out.
    router.push('/LoginScreen');
  };

  // Function to handle the password change form submission.
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior.
    setPasswordMessage(''); // Clear any previous messages.

    // Check if the new password and confirmation password match.
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    // Validate that the new password meets the minimum length requirement.
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters long.');
      return;
    }

    // Attempt to update the user's password via Supabase.
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    // Check if there was an error updating the password.
    if (error) {
      console.error('Error updating password:', error.message);
      setPasswordMessage('Error updating password: ' + error.message);
    } else {
      // On success, inform the user and clear the input fields.
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Render the profile screen UI.
  return (
    <div className="profiles-container">
      <h1>Profile</h1>
      {/* Conditional rendering: display profile details if profile data exists */}
      {profile ? (
        <div className="profile-content">
          <p>Email: {profile.email}</p>

          <h2>Change Password</h2>
          {/* Form for changing the password */}
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="new-password">New Password:</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} // Update state with new password value.
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} // Update state with confirm password value.
                required
              />
            </div>
            <button type="submit" className="change-password-button">
              Change Password
            </button>

          <button 
            className="export-button" 
            onClick={exportLikedBooks}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>

          </form>

          {/* Display a message if there is any feedback from the password change action */}
          {passwordMessage && <p className="password-message">{passwordMessage}</p>}

          {/* Logout button for signing out; placed at the bottom of the profile content */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        // Display a loading message while the profile data is being fetched.
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profiles; // Export the Profiles component for use in other parts of the application.