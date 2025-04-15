// app/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import { FontAwesome } from '@expo/vector-icons';

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

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showXAnim, setShowXAnim] = useState(false);
  const router = useRouter();

  // For the custom dropdown:
  const [open, setOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("Science Fiction");
  const [items, setItems] = useState(
    Object.keys(genreMap).map((genre) => ({ label: genre, value: genre }))
  );

  // Check user authentication on mount.
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email && session.user.id) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      } else {
        router.push('/LoginScreen');
      }
    };
    checkUser();
  }, []);

  // Fetch a new random work from the selected genre.
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

  // Automatically fetch a new work when the selected genre changes.
  useEffect(() => {
    pickRandomWork();
  }, [selectedGenre]);

  // Fetch additional details for the current work.
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

  // Helper: Get user book ISBNs from Supabase.
  const getUserBookISBNs = async (): Promise<string[]> => {
    if (!userId) return []; // Avoid querying with an empty userId
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

  // Handle "heart" (like) button.
  const handleHeartClick = async () => {
    if (isLoading || !currentWork) return;
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
    const isbnValue = currentWork.key.replace('/works/', '');
    const title = currentWork.title;
    const author = currentWork.authors?.[0]?.name || 'Unknown';
    const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
    if (!exists) {
      const { error } = await supabase
        .from('user_books')
        .insert([{ isbn: isbnValue, title, author, liked: true, user_id: userId }]);
      if (error) console.error('Error inserting record:', error.message);
    }
    await pickRandomWork();
  };

  // Handle "X" (dislike) button.
  const handleXClick = async () => {
    if (isLoading) return;
    if (currentWork) {
      setShowXAnim(true);
      setTimeout(() => setShowXAnim(false), 1000);
      const isbnValue = currentWork.key.replace('/works/', '');
      const exists = await getUserBookISBNs().then(isbns => isbns.includes(isbnValue));
      if (!exists) {
        const { error } = await supabase
          .from('user_books')
          .insert([{ isbn: isbnValue, liked: false, user_id: userId }]);
        if (error) console.error('Error inserting record:', error.message);
      }
    }
    await pickRandomWork();
  };

  let summaryText = 'No description available.';
  if (bookDetails && bookDetails.description) {
    if (typeof bookDetails.description === 'string') {
      summaryText = bookDetails.description;
    } else if (typeof bookDetails.description === 'object' && bookDetails.description.value) {
      summaryText = bookDetails.description.value;
    }
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.dashboardContainer}>
        {/* Dropdown for Genre Selection */}
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={selectedGenre}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => {
              const newValue = callback(selectedGenre);
              setSelectedGenre(newValue);
            }}
            setItems={setItems}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            placeholder="Select Genre"
            zIndex={3000}
          />
        </View>
  
        {/* Content Area */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#f44336" />
          ) : currentWork ? (
            <>
              <View style={styles.bookContainer}>
                <Image
                  source={{ uri: `https://covers.openlibrary.org/b/id/${currentWork.cover_id}-L.jpg` }}
                  style={styles.bookCover}
                  resizeMode="contain"
                />
              </View>
              {/* Action Buttons placed side by side underneath the cover */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleXClick} disabled={isLoading}>
                  <FontAwesome name="times" size={50} color="#ff6b6b" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleHeartClick} disabled={isLoading}>
                  <FontAwesome name="heart" size={50} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </>
          ) : bookDetails?.description ? (
            <View style={styles.bookInfo}>
              <Text style={styles.bookSummary}>{summaryText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: -30,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: '#ff6b6b',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    height: 70,
  },
  dropdownText: {
    color: 'black',
    fontWeight: 'bold',
  },
  dropdownContainerStyle: {
    backgroundColor: '#ff6b6b',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bookContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  bookCover: {
    width: 325,
    height: 475,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  actionButton: {
    marginHorizontal: 45,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  bookInfo: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 4,
    maxWidth: 350,
  },
  bookSummary: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
});