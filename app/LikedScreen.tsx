// app/LikedScreen.tsx
import React, { useEffect, useState } from 'react'; // Import React and hooks to manage component state and side effects.
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client for backend operations.
import { useRouter } from 'expo-router'; // Import the router hook to navigate between screens.
import './Liked.css'; // Import the CSS file for styling this component.
import { navigate } from 'expo-router/build/global-state/routing'; // Import the navigate function (if needed) for navigation state.

// Define the structure of a liked book.
interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  cover_id?: number;            // Optional cover ID for displaying the book cover.
  description?: string;         // Optional description of the book.
  openLibraryLink?: string;     // Optional link to the book's details on Open Library.
  isbn13?: string;              // Optional ISBN-13 for further offers/comparisons.
}

const Liked: React.FC = () => {
  // State to hold the current user's ID.
  const [userId, setUserId] = useState('');
  // State to store the list of liked books fetched from the backend.
  const [likedBooks, setLikedBooks] = useState<LikedBook[]>([]);
  // State to store details of the currently selected book.
  const [selectedBook, setSelectedBook] = useState<LikedBook | null>(null);

  const router = useRouter(); // Get the router instance for redirection.

  // On component mount, fetch the user's session data.
  useEffect(() => {
    const getUser = async () => {
      // Retrieve the current session from Supabase.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) console.error('Error getting session:', error);
      // If no user session exists, redirect to the login screen.
      if (!session?.user?.id) {
        router.push('/LoginScreen');
        return;
      }

      // Store the user's ID for later use in fetching liked books.
      setUserId(session.user.id);
    };
    getUser();
  }, [navigate]); // Dependency on 'navigate' (although router is used directly).

  // When userId is available, fetch the list of liked books from Supabase.
  useEffect(() => {
    if (!userId) return; // Do nothing if userId is not yet set.

    const fetchBooks = async () => {
      // Query the 'user_books' table in Supabase to get liked books for the user.
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author')
        .eq('user_id', userId)
        .eq('liked', true);

      if (error) {
        console.error('Error fetching liked books:', error.message);
        return;
      }

      // Update local state with the fetched liked books.
      setLikedBooks(data);
    };

    fetchBooks();
  }, [userId]);

  // NOTE: This second useEffect appears to duplicate the previous fetching of liked books.
  // It additionally auto-loads the first book's details if available.
  useEffect(() => {
    if (!userId) return;

    const fetchBooks = async () => {
      // Query Supabase for liked books for the current user.
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author')
        .eq('user_id', userId)
        .eq('liked', true);

      if (error) {
        console.error('Error fetching liked books:', error.message);
        return;
      }

      // Update the local state with the list of liked books.
      setLikedBooks(data);

      // Automatically load the first book's details if any are returned.
      if (data && data.length > 0) {
        handleRowClick(data[0]);
      }
    };

    fetchBooks();
  }, [userId]);

  // Function to handle a row click in the liked books table.
  // It fetches additional details from Open Library for the selected book.
  const handleRowClick = async (book: LikedBook) => {
    setSelectedBook(null); // Clear any previous selection while loading new data.

    try {
      // Fetch work details from Open Library using the book's ISBN.
      const workRes = await fetch(`https://openlibrary.org/works/${book.isbn}.json`);
      const workData = await workRes.json();

      let isbn13 = '';

      // Attempt to fetch the ISBN-13 from the editions endpoint.
      try {
        const editionsRes = await fetch(`https://openlibrary.org/works/${book.isbn}/editions.json?limit=1`);
        const editionsData = await editionsRes.json();
        const edition = editionsData.entries?.[0];
        const isbn13Candidate = edition?.isbn_13?.[0];
        if (isbn13Candidate) isbn13 = isbn13Candidate;
      } catch (err) {
        console.warn('Could not fetch ISBN-13 from editions.');
      }

      // Update the selected book state with extended details from Open Library.
      setSelectedBook({
        ...book,  // Include original book properties.
        description:
          // Check the type of description in the response.
          typeof workData.description === 'string'
            ? workData.description
            : workData.description?.value || 'No description available.',
        cover_id: workData.covers?.[0], // Use the first cover image ID if available.
        openLibraryLink: `https://openlibrary.org/works/${book.isbn}`, // Construct a link to Open Library.
        isbn13,  // Add the ISBN-13 if fetched.
      });
    } catch (err) {
      console.error('Error fetching OpenLibrary data:', err);
      // In case of an error, update selected book with a fallback description.
      setSelectedBook({ ...book, description: 'No description available.' });
    }
  };

  // Function to handle the removal of a liked book.
  const handleRemove = async () => {
    if (!selectedBook) return; // Do nothing if no book is selected.

    // Delete the record from the 'user_books' table in Supabase.
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('isbn', selectedBook.isbn)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting record:', error.message);
      return;
    }

    // Update local state by removing the deleted book from the list.
    setLikedBooks(likedBooks.filter(book => book.isbn !== selectedBook.isbn));
    // Clear the current selected book.
    setSelectedBook(null);
  };

  // Function to confirm and handle removal on button click.
  const handleRemoveClick = () => {
    // Ask the user for confirmation before removing the book.
    if (window.confirm("Are you sure you want to remove this book from your list?")) {
      handleRemove();
    }
  };

  // Component render
  return (
    <div className="liked-container">
      {/* Table displaying the list of liked books */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {/* If no liked books are found, show a message */}
            {likedBooks.length === 0 ? (
              <tr>
                <td colSpan={3}>No liked books found.</td>
              </tr>
            ) : (
              // Map over liked books to create table rows.
              likedBooks.map((book) => (
                <tr key={book.isbn} onClick={() => handleRowClick(book)}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Panel displaying detailed information about the selected book */}
      {selectedBook && (
        <div className="details-container">
          {/* Show the book cover image if cover_id is available */}
          {selectedBook.cover_id && (
            <img
              src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_id}-L.jpg`}
              alt={selectedBook.title}
              className="book-cover"
            />
          )}
          {/* Display book title and author */}
          <h2>{selectedBook.title}</h2>
          <h4>by {selectedBook.author}</h4>
          {/* Display the book description */}
          <p>{selectedBook.description}</p>

          {/* Section with links/buttons for further actions */}
          <div className="buy-buttons">
            {/* If ISBN-13 is available, provide a link to compare offers */}
            {selectedBook.isbn13 && (
              <a
                href={`https://www.directtextbook.com/isbn/${selectedBook.isbn13}`}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-link"
              >
                Compare Offers
              </a>
            )}
            {/* Button to remove the book from the liked list */}
            <button className="buy-link" onClick={handleRemoveClick}>
              Remove from list
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liked; // Export the Liked component so it can be used elsewhere.