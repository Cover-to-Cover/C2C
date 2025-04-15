// app/DashboardScreen.tsx
// This component represents the dashboard page of the app. It displays a random work (book)
// from a selected genre fetched from the Open Library API, allows the user to switch genres,
// and provides "heart" (like) and "X" (dislike) buttons to add the work to the user's list.
// It also uses animated button effects and fetching logic to enrich the user experience.

import React, { useEffect, useState } from 'react'; // React and hooks for state and side effects.
import { supabase } from '../lib/supabaseClient'; // Supabase client for backend operations.
import { useRouter } from 'expo-router'; // Router for navigation between screens.
import * as FaIcons from 'react-icons/fa'; // FontAwesome icons for UI elements.
import './Dashboard.css'; // Import associated CSS styles.
import { navigate } from 'expo-router/build/global-state/routing'; // Import navigate (if needed).

// Define the Work interface for book data from Open Library.
interface Work {
  key: string;
  title: string;
  cover_id: number;
  authors: { name: string }[]; // Each work includes an array of authors (with their names).
}

// Map human-readable genre names to API slugs used by Open Library.
const genreMap: { [key: string]: string } = {
  "Mystery": "mystery",
  "Science Fiction": "science_fiction",
  "Fantasy": "fantasy",
  "Romance": "romance",
  "Horror": "horror",
  "Thriller": "thriller",
  "Historical Fiction": "historical_fiction",
  "Biography": "biography",
  "Memoir": "memoir",
  "Self-Help": "self_help",
  "Poetry": "poetry",
  "Drama": "drama",
  "Adventure": "adventure",
  "Crime Fiction": "crime_fiction",
  "Dystopian": "dystopian",
  "Paranormal": "paranormal",
  "Magical Realism": "magical_realism",
  "Classic Literature": "classic_literature",
  "Children's Literature": "children",
  "Young Adult Fiction": "young_adult",
  "Satire": "satire",
  "Philosophical Fiction": "philosophical_fiction",
  "Literary Fiction": "literary_fiction",
  "Western": "western",
  "Detective Fiction": "detective",
  "War Fiction": "war_fiction",
  "Gothic Fiction": "gothic",
  "Political Fiction": "political_fiction",
  "Cyberpunk": "cyberpunk",
  "Coming-of-Age Fiction": "coming_of_age"
};

const Dashboard: React.FC = () => {
  // State for user email and user ID, which are set on authentication.
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  // State for the list of works fetched from Open Library.
  const [works, setWorks] = useState<Work[]>([]);
  // State for the currently selected work that is shown on the dashboard.
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  // (Unused) Boolean flag to show detailed book info.
  const [showBookInfo, setShowBookInfo] = useState(false);
  // State for additional book details fetched from Open Library (for current work).
  const [bookDetails, setBookDetails] = useState<any>(null);
  // State for the genre selected by the user. Default is "Science Fiction".
  const [selectedGenre, setSelectedGenre] = useState("Science Fiction");
  // State for tracking if content is loading.
  const [isLoading, setIsLoading] = useState(false);
  // New state variables for button animations.
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showXAnim, setShowXAnim] = useState(false);

  // Get the router instance for navigation.
  const router = useRouter();

  // On component mount, check if the user is authenticated.
  useEffect(() => {
    const checkUser = async () => {
      // Retrieve the session from Supabase.
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      if (session?.user?.email && session.user.id) {
        // If session exists, store user email and ID.
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      } else {
        // Otherwise, redirect to LoginScreen.
        router.push('/LoginScreen');
      }
    };
    checkUser();
  }, [navigate]);

  // Function to fetch works (books) by the selected genre.
  // It uses a random offset to retrieve a different work each time.
  const fetchWorksByGenre = async (genre: string) => {
    // Convert the genre to the appropriate API slug.
    const subjectSlug = genreMap[genre] || genre.toLowerCase().replace(/\s+/g, '_');
    try {
      // Fetch one item to determine the total number of works.
      const countResponse = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1`);
      const countData = await countResponse.json();
      const totalWorks = countData.work_count;
      if (totalWorks && totalWorks > 0) {
        // Calculate a random offset into the work collection.
        const randomOffset = Math.floor(Math.random() * totalWorks);
        // Fetch one work starting at the random offset.
        const response = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1&offset=${randomOffset}`);
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          // Filter out works that do not have a cover image.
          const filteredWorks = data.works.filter((work: any) => work.cover_id);
          setWorks(filteredWorks);
          if (filteredWorks.length > 0) {
            // Set the first work as the current work.
            setCurrentWork(filteredWorks[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching works by genre:', error);
    }
  };

  // Fetch initial work when the component mounts.
  useEffect(() => {
    fetchWorksByGenre(selectedGenre);
  }, []);

  // Handle the form submission for changing the genre.
  const handleGenreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hide any book info and clear existing details.
    setShowBookInfo(false);
    setBookDetails(null);
    setCurrentWork(null);
    // Re-fetch a random work for the selected genre.
    await pickRandomWork();
  };

  // Fetch additional details (for example, description) for the current work.
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (currentWork) {
        try {
          // Construct a URL using the work key and fetch its JSON details.
          const response = await fetch(`https://openlibrary.org${currentWork.key}.json`);
          const data = await response.json();
          setBookDetails(data);
        } catch (error) {
          console.error('Error fetching book details:', error);
        }
      }
    };
    fetchBookDetails();
  }, [currentWork]);

  // Fetch a new random work from the current genre, retrying if the book already exists.
  const pickRandomWork = async () => {
    setIsLoading(true);
    setBookDetails(null);
    setCurrentWork(null);
  
    // Get a list of ISBNs already saved by the user.
    const existingISBNs = await getUserBookISBNs();
    let foundNewBook = false;
  
    // Try up to 15 times to find a new work.
    for (let attempt = 1; attempt <= 15; attempt++) {
      const subjectSlug = genreMap[selectedGenre] || selectedGenre.toLowerCase().replace(/\s+/g, '_');
  
      try {
        // Fetch total work count.
        const countResponse = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1`);
        const countData = await countResponse.json();
        const totalWorks = countData.work_count;
  
        if (totalWorks && totalWorks > 0) {
          // Choose a random offset.
          const randomOffset = Math.floor(Math.random() * totalWorks);
          // Fetch one work at that offset.
          const response = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1&offset=${randomOffset}`);
          const data = await response.json();
  
          if (data.works && data.works.length > 0) {
            // Filter works that have cover images.
            const filteredWorks = data.works.filter((work: any) => work.cover_id);
            const potentialWork = filteredWorks[0];
  
            if (potentialWork) {
              // Remove the '/works/' portion to compare ISBNs.
              const isbn = potentialWork.key.replace('/works/', '');
              if (!existingISBNs.includes(isbn)) {
                setCurrentWork(potentialWork);
                foundNewBook = true;
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);
      }
    }
  
    // If no new book was found after several attempts, show a message.
    if (!foundNewBook) {
      setBookDetails({ description: 'No more books available in this genre :(' });
    }
  
    setIsLoading(false);
  };

  // Helper function to retrieve ISBNs of books already saved by the user.
  const getUserBookISBNs = async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('user_books')
      .select('isbn')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching user books:', error.message);
      return [];
    }
    return data.map((row: any) => row.isbn);
  };

  // Handle the "heart" button click: add the current work to the user's liked books.
  const handleHeartClick = async () => {
    if (isLoading || !currentWork) return;
  
    // Trigger heart animation: show for 1 second.
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  
    // Extract the ISBN by removing '/works/' from the key.
    const isbnValue = currentWork.key.replace('/works/', '');
    const title = currentWork.title;
    const author = currentWork.authors?.[0]?.name || 'Unknown';
  
    // Check if the book already exists in the user's list.
    const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
  
    if (!exists) {
      console.log('Inserting record with:', { isbn: isbnValue, title, author, liked: true, user_id: userId });
      // Insert the record into the Supabase 'user_books' table.
      const { error } = await supabase
        .from('user_books')
        .insert([{ isbn: isbnValue, title, author, liked: true, user_id: userId }]);
      if (error) {
        console.error('Error inserting record:', error.message);
      }
    } else {
      console.log('Book already exists for user.');
    }
  
    // After adding the book, fetch a new random work.
    await pickRandomWork();
  };

  // Handle the "X" button click: add the current work as a disliked book.
  const handleXClick = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading.
    if (currentWork) {
      // Trigger the X animation: show for 1 second.
      setShowXAnim(true);
      setTimeout(() => setShowXAnim(false), 1000);
  
      const isbnValue = currentWork.key.replace('/works/', '');
      const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
      if (!exists) {
        console.log('Inserting record with:', { isbn: isbnValue, liked: false, user_id: userId });
        // Insert record with liked set to false.
        const { error } = await supabase
          .from('user_books')
          .insert([{ isbn: isbnValue, liked: false, user_id: userId }]);
        if (error) {
          console.error('Error inserting record:', error.message);
        }
      } else {
        console.log('Book already exists for user.');
      }
    }
    // Fetch a new random work regardless of outcome.
    await pickRandomWork();
  };

  // Determine the summary or description text from the fetched book details.
  let summaryText = '';
  if (bookDetails && bookDetails.description) {
    if (typeof bookDetails.description === 'string') {
      summaryText = bookDetails.description;
    } else if (typeof bookDetails.description === 'object' && bookDetails.description.value) {
      summaryText = bookDetails.description.value;
    }
  } else {
    summaryText = 'No description available.';
  }

  // Render the dashboard UI.
  return (
    <div className="dashboard-container">
      {/* Genre selection form */}
      <div className="genre-container">
        <form onSubmit={handleGenreSubmit}>
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            {Object.keys(genreMap).map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <button type="submit">Submit</button>
        </form>
      </div>
      {/* Main content container displaying the current work and action buttons */}
      <div className="content-container">
        {/* X button container with slide-down animation (handled via CSS) */}
        <div className="x-button-container">
          <button className="icon-button x-button" onClick={handleXClick} disabled={isLoading}>
            <FaIcons.FaTimes />
          </button>
          {showXAnim && (
            <div className="x-animation">
              <FaIcons.FaTimes />
            </div>
          )}
        </div>
        {/* Display the book cover if available; show a loading message if works are being fetched */}
        {isLoading ? (
          <p className="loading-message">Searching for a new book...</p>
        ) : currentWork ? (
          <div className="book-container">
            <img
              src={`https://covers.openlibrary.org/b/id/${currentWork.cover_id}-L.jpg`}
              alt={currentWork.title}
              className="book-cover"
            />
          </div>
        ) : bookDetails?.description ? (
          <div className="book-info">
            <p className="book-summary">{bookDetails.description}</p>
          </div>
        ) : null}
        {/* Heart button container with heart animation */}
        <div className="heart-button-container">
          <button className="icon-button heart-button" onClick={handleHeartClick} disabled={isLoading}>
            <FaIcons.FaHeart />
          </button>
          {showHeartAnim && (
            <div className="heart-animation">
              <FaIcons.FaHeart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;