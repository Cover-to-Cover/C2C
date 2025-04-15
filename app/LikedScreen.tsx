import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';
import './Liked.css';
import { navigate } from 'expo-router/build/global-state/routing';

// Define the structure of a liked book
interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  cover_id?: number;
  description?: string;
  openLibraryLink?: string;
  isbn13?: string;
}

const Liked: React.FC = () => {
  // State to hold current user's ID
  const [userId, setUserId] = useState('');

  // State to store liked books
  const [likedBooks, setLikedBooks] = useState<LikedBook[]>([]);

  // State to store the currently selected book's details
  const [selectedBook, setSelectedBook] = useState<LikedBook | null>(null);

  const router = useRouter();

  // On mount: fetch the user's session and redirect to login if not found
  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) console.error('Error getting session:', error);
      if (!session?.user?.id) {
        router.push('/LoginScreen');
        return;
      }

      setUserId(session.user.id);
    };
    getUser();
  }, [navigate]);

  // When userId is set: fetch the list of liked books from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author')
        .eq('user_id', userId)
        .eq('liked', true);

      if (error) {
        console.error('Error fetching liked books:', error.message);
        return;
      }

      setLikedBooks(data);
    };

    fetchBooks();
  }, [userId]);

  // When userId is set: fetch the list of liked books from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author')
        .eq('user_id', userId)
        .eq('liked', true);

      if (error) {
        console.error('Error fetching liked books:', error.message);
        return;
      }

      setLikedBooks(data);

      // Automatically load the first book's details if available
      if (data && data.length > 0) {
        handleRowClick(data[0]);
      }
    };

    fetchBooks();
  }, [userId]);

  // When a row is clicked: fetch full book data from Open Library
  const handleRowClick = async (book: LikedBook) => {
    setSelectedBook(null); // Clear previous selection while loading

    try {
      const workRes = await fetch(`https://openlibrary.org/works/${book.isbn}.json`);
      const workData = await workRes.json();

      let isbn13 = '';

      // Try to get the ISBN-13 from editions endpoint
      try {
        const editionsRes = await fetch(`https://openlibrary.org/works/${book.isbn}/editions.json?limit=1`);
        const editionsData = await editionsRes.json();
        const edition = editionsData.entries?.[0];
        const isbn13Candidate = edition?.isbn_13?.[0];
        if (isbn13Candidate) isbn13 = isbn13Candidate;
      } catch (err) {
        console.warn('Could not fetch ISBN-13 from editions.');
      }

      // Update selected book with extended details
      setSelectedBook({
        ...book,
        description:
          typeof workData.description === 'string'
            ? workData.description
            : workData.description?.value || 'No description available.',
        cover_id: workData.covers?.[0],
        openLibraryLink: `https://openlibrary.org/works/${book.isbn}`,
        isbn13,
      });
    } catch (err) {
      console.error('Error fetching OpenLibrary data:', err);
      setSelectedBook({ ...book, description: 'No description available.' });
    }
  };

  // Remove the book from Supabase and update local state
  const handleRemove = async () => {
    if (!selectedBook) return;

    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('isbn', selectedBook.isbn)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting record:', error.message);
      return;
    }

    // Remove book from the local list and clear the selection
    setLikedBooks(likedBooks.filter(book => book.isbn !== selectedBook.isbn));
    setSelectedBook(null);
  };

  // Confirm before removing a book from the liked list
  const handleRemoveClick = () => {
    if (window.confirm("Are you sure you want to remove this book from your list?")) {
      handleRemove();
    }
  };

  return (
    <div className="liked-container">
      {/* Book list table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {likedBooks.length === 0 ? (
              <tr>
                <td colSpan={3}>No liked books found.</td>
              </tr>
            ) : (
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

      {/* Book details panel */}
      {selectedBook && (
        <div className="details-container">
          {selectedBook.cover_id && (
            <img
              src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_id}-L.jpg`}
              alt={selectedBook.title}
              className="book-cover"
            />
          )}
          <h2>{selectedBook.title}</h2>
          <h4>by {selectedBook.author}</h4>
          <p>{selectedBook.description}</p>

          {/* Buttons for external link and removal */}
          <div className="buy-buttons">
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
            <button className="buy-link" onClick={handleRemoveClick}>
              Remove from list
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liked;