import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';
import * as FaIcons from 'react-icons/fa';
import './Dashboard.css';
import { navigate } from 'expo-router/build/global-state/routing';

// Define the Work interface for book data from Open Library.
interface Work {
  key: string;
  title: string;
  cover_id: number;
  authors: { name: string }[];
}

// Map human-readable genre names to API slugs.
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
  // State variables for user info, works, current work, and UI states.
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  const [showBookInfo, setShowBookInfo] = useState(false); // (Currently unused)
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState("Science Fiction");
  const [isLoading, setIsLoading] = useState(false);
  // New state for button animations:
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showXAnim, setShowXAnim] = useState(false);
  const router = useRouter();

  // On component mount, check if user is authenticated.
  useEffect(() => {
    const checkUser = async () => {
      // Get the current session from Supabase.
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      if (session?.user?.email && session.user.id) {
        // If authenticated, store user email and ID.
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      } else {
        // Otherwise, redirect to the login page.
        router.push('/LoginScreen');
      }
    };
    checkUser();
  }, [navigate]);

  // Fetch works for a given genre using a random offset.
  const fetchWorksByGenre = async (genre: string) => {
    // Convert the selected genre to a slug for the API.
    const subjectSlug = genreMap[genre] || genre.toLowerCase().replace(/\s+/g, '_');
    try {
      // First, fetch one item to get the total count of works.
      const countResponse = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1`);
      const countData = await countResponse.json();
      const totalWorks = countData.work_count;
      if (totalWorks && totalWorks > 0) {
        // Calculate a random offset.
        const randomOffset = Math.floor(Math.random() * totalWorks);
        // Fetch one work at the random offset.
        const response = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1&offset=${randomOffset}`);
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          // Filter out works without a cover.
          const filteredWorks = data.works.filter((work: any) => work.cover_id);
          setWorks(filteredWorks);
          if (filteredWorks.length > 0) {
            // Set the first filtered work as the current work.
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

  // Handle form submission to change the genre.
  const handleGenreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowBookInfo(false); // Hide details if visible
    setBookDetails(null);   // Clear book info
    setCurrentWork(null);   // Clear current book
    await pickRandomWork(); // Reuse your retry-fetch logic
  };  

  // Fetch additional details (such as description) for the current work.
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (currentWork) {
        try {
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

  // Fetch a new random work from the current genre.
  const pickRandomWork = async () => {
    setIsLoading(true);
    setBookDetails(null);
    setCurrentWork(null);
  
    const existingISBNs = await getUserBookISBNs();
    let foundNewBook = false;
  
    for (let attempt = 1; attempt <= 15; attempt++) {
      const subjectSlug = genreMap[selectedGenre] || selectedGenre.toLowerCase().replace(/\s+/g, '_');
  
      try {
        const countResponse = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1`);
        const countData = await countResponse.json();
        const totalWorks = countData.work_count;
  
        if (totalWorks && totalWorks > 0) {
          const randomOffset = Math.floor(Math.random() * totalWorks);
          const response = await fetch(`https://openlibrary.org/subjects/${subjectSlug}.json?limit=1&offset=${randomOffset}`);
          const data = await response.json();
  
          if (data.works && data.works.length > 0) {
            const filteredWorks = data.works.filter((work: any) => work.cover_id);
            const potentialWork = filteredWorks[0];
  
            if (potentialWork) {
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
  
    if (!foundNewBook) {
      setBookDetails({ description: 'No more books available in this genre :(' });
    }
  
    setIsLoading(false);
  };  

  // Helper function to get a list of ISBNs for books already saved by the user.
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

  // Handle the "heart" button click (like a book).
  // If the book is not already in the user's list, add it with liked = true.
  const handleHeartClick = async () => {
    if (isLoading || !currentWork) return;
  
    // Trigger the heart animation: show it, then hide after 1s.
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  
    // Extract the ISBN from the work key.
    const isbnValue = currentWork.key.replace('/works/', '');
    const title = currentWork.title;
    const author = currentWork.authors?.[0]?.name || 'Unknown';
  
    // Check if the book is already saved.
    const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
  
    if (!exists) {
      console.log('Inserting record with:', { isbn: isbnValue, title, author, liked: true, user_id: userId });
      const { error } = await supabase
        .from('user_books')
        .insert([{ isbn: isbnValue, title, author, liked: true, user_id: userId }]);
      if (error) {
        console.error('Error inserting record:', error.message);
      }
    } else {
      console.log('Book already exists for user.');
    }
  
    // Fetch a new random work.
    await pickRandomWork();
  };  

  // Handle the "X" button click (dislike a book).
  // If the book is not already in the user's list, add it with liked = false.
  const handleXClick = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    if (currentWork) {
      // Trigger the X animation: show it, then hide after 1s.
      setShowXAnim(true);
      setTimeout(() => setShowXAnim(false), 1000);
  
      const isbnValue = currentWork.key.replace('/works/', '');
      const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
      if (!exists) {
        console.log('Inserting record with:', { isbn: isbnValue, liked: false, user_id: userId });
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
    // Fetch a new random work.
    await pickRandomWork();
  };

  // Determine the summary/description text from the fetched book details.
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
        {/* X button container with slide-down animation */}
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
        {/* Display the book cover if available, otherwise show loading text */}
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