// app/liked.tsx
// This screen displays the user's list of liked books and allows for viewing extended details
// via a slide-in animation, handling swipe gestures for back navigation, and removing a book.
import React, { useEffect, useState, useRef } from 'react'; // Import React and hooks for state, effects, and references.
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  Animated,
  Dimensions,
  PanResponder,
  ActionSheetIOS,
  Share,
  Platform,
} from 'react-native'; // Import various React Native components and APIs for UI, animations, gestures, etc.
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client for backend operations.
import { useRouter } from 'expo-router'; // Import the router hook to handle navigation.
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons for UI elements.
import { ActivityIndicator } from 'react-native';

// Define a TypeScript interface that represents a liked book.
interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  created_at?: string;
  cover_id?: number;            // Optional cover ID to display the book cover.
  description?: string;         // Optional extended description of the book.
  openLibraryLink?: string;     // Optional link to the Open Library page for the book.
  isbn13?: string;              // Optional ISBN-13 for further details or comparison offers.
  isbn10?: string;
}

export default function LikedScreen() {
  // State to hold the current user's ID.
  const [userId, setUserId] = useState('');
  // State to store the list of liked books.
  const [likedBooks, setLikedBooks] = useState<LikedBook[]>([]);
  // State to store the currently selected book's extended details.
  const [selectedBook, setSelectedBook] = useState<LikedBook | null>(null);
  // Hook to manage navigation.
  const router = useRouter();
  // Set up an Animated value for the slide-in effect.
  // Starts off the screen to the right by setting the initial value to the window width.
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  // Retrieve screen width for later use in animation.
  const screenWidth = Dimensions.get('window').width;
  // Loader
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Set up PanResponder to detect left-to-right swipe gestures.
  // When a significant horizontal swipe is detected, trigger the "back" functionality.
  const panResponder = useRef(
    PanResponder.create({
      // Decide when a gesture should be handled.
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        // Only activate if horizontal movement is greater than vertical movement and the swipe is to the right.
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx > 20,
      // When the gesture is released, check if the swipe distance is enough to go back.
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          handleBack();
        }
      },
    })
  ).current;

  // Check for an active session on mount.
  // If a session is found, update userId; otherwise, redirect to the login screen.
  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error getting session:', error);
      if (!session?.user?.id) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
    };
    getUser();
  }, [router]);

  // Fetch liked books for the current user once userId is set.
  useEffect(() => {
    if (!userId) return; // Exit early if userId is not yet available.
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author, created_at')
        .eq('user_id', userId)
        .eq('liked', true)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching liked books:', error.message);
        return;
      }
      // Update likedBooks state with fetched data.
      setLikedBooks(data || []);
    };
    fetchBooks();
  }, [userId]);

  // Quick-remove handler from the list
  const handleQuickRemove = (book: LikedBook) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove this book from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('user_books')
              .delete()
              .eq('isbn', book.isbn)
              .eq('user_id', userId);
            if (error) {
              console.error('Error deleting record:', error.message);
              return;
            }
            setLikedBooks((prev) =>
              prev.filter((b) => b.isbn !== book.isbn)
            );
          },
        },
      ]
    );
  };

  // When a row is clicked in the list, fetch extended details from Open Library and slide in the details panel.
  const handleRowClick = async (book: LikedBook) => {
    setSelectedBook(null);
    try {
      const workRes = await fetch(`https://openlibrary.org/works/${book.isbn}.json`);
      const workData = await workRes.json();
  
      // Grab up to 20 editions so we have a better shot at finding an ISBN‑10
      const editionsRes = await fetch(`https://openlibrary.org/works/${book.isbn}/editions.json?limit=20`);
      const { entries } = await editionsRes.json();
  
      // Find the first edition that has an isbn_10 array
      const bestEdition = entries.find((e: any) => Array.isArray(e.isbn_10) && e.isbn_10.length > 0) || entries[0] || {};
      const isbn10 = Array.isArray(bestEdition.isbn_10) ? bestEdition.isbn_10[0] : '';
      const isbn13 = Array.isArray(bestEdition.isbn_13) ? bestEdition.isbn_13[0] : '';
  
      const extendedBook: LikedBook = {
        ...book,
        description:
          typeof workData.description === 'string'
            ? workData.description
            : workData.description?.value || 'No description available.',
        cover_id: workData.covers?.[0],
        openLibraryLink: `https://openlibrary.org/works/${book.isbn}`,
        isbn10,
        isbn13,
      };
  
      setSelectedBook(extendedBook);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } catch (err) {
      console.error('Error fetching OpenLibrary data:', err);
      setSelectedBook({ ...book, description: 'No description available.' });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle the "back" action: slide out the details view and clear the selection.
  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth, // Slide the details view off to the right.
      duration: 300, // Animation lasts 300ms.
      useNativeDriver: true,
    }).start(() => {
      setSelectedBook(null); // Clear the selection after animation completes.
      slideAnim.setValue(screenWidth); // Reset the animated value to the off-screen position.
    });
  };

  // Remove a book from the liked list.
  const handleRemove = async () => {
    if (!selectedBook) return; // Do nothing if there is no book selected.
    // Delete the book record from the Supabase 'user_books' table.
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('isbn', selectedBook.isbn)
      .eq('user_id', userId);
    if (error) {
      console.error('Error deleting record:', error.message);
      return;
    }
    // Update local state by filtering out the removed book.
    setLikedBooks(likedBooks.filter(book => book.isbn !== selectedBook.isbn));
    handleBack(); // Navigate back to the list view after removal.
  };

  // Confirm removal before deleting the book using an alert.
  const handleRemoveClick = () => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this book from your list?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: handleRemove, style: "destructive" }
      ]
    );
  };

  const handleShare = () => {
    if (!selectedBook) return;
  
    const { isbn10 } = selectedBook;
    if (!isbn10) {
      Alert.alert('Unable to find ISBN‑10 for sharing.');
      return;
    }
  
    const amazonUrl = `https://www.amazon.com/dp/${selectedBook.isbn10}/ref=nosim?tag=covertocove06-20`;
    const message = `I loved the cover of this book!\n${amazonUrl}`;
  
    Share.share(
      { message },
      { dialogTitle: 'Share this book' }
    ).catch(err => console.warn('Share error:', err));
  };   

  // Open an external URL for comparing offers if ISBN-13 is available.
  const handleCompareOffers = () => {
    // make sure we have the ASIN (ISBN-10)
    if (!selectedBook?.isbn10) {
      Alert.alert('ISBN-10 not available');
      return;
    }
  
    // build the URL here
    const amazonUrl = `https://www.amazon.com/dp/${selectedBook.isbn10}/ref=nosim?tag=covertocove06-20`;
    
    // open it
    Linking.openURL(amazonUrl);
  };

  if (loadingDetails) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f44336" />
        <Text style={{ marginTop: 10, color: '#333' }}>Loading details…</Text>
      </View>
    );
  }

  // If no book is selected, render the list view.
  if (!selectedBook) {
    return (
      <View style={styles.listContainer}>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Title</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Author</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Liked on</Text>
            <Text style={[styles.tableCell, styles.headerCell, { width: 40, textAlign: 'center' }]}>×</Text>
          </View>

          {likedBooks.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>No liked books found.</Text>
            </View>
          ) : (
            likedBooks.map((book) => (
              <View key={book.isbn} style={styles.tableRow}>
                <TouchableOpacity
                  style={styles.mainCell}
                  onPress={() => handleRowClick(book)}
                >
                  <Text style={styles.tableCell}>{book.title}</Text>
                  <Text style={styles.tableCell}>{book.author}</Text>
                  <Text style={styles.tableCell}>
                    {book.created_at
                      ? new Date(book.created_at).toLocaleDateString()
                      : '-'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButtonCell}
                  onPress={() => handleQuickRemove(book)}
                >
                  <FontAwesome name="times" size={18} color="white" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // If a book is selected, render the details view with a slide-in animation.
  return (
    <Animated.View
      style={[styles.detailsContainer, { transform: [{ translateX: slideAnim }] }]}
      {...panResponder.panHandlers} // Attach pan handlers to detect swipe gestures.
    >
      {/* Back button to exit the details view */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.detailsContent}>
        {/* Display book cover if available */}
        {selectedBook.cover_id && (
          <Image
            source={{ uri: `https://covers.openlibrary.org/b/id/${selectedBook.cover_id}-L.jpg` }}
            style={styles.bookCover}
            resizeMode="contain"
          />
        )}
        {/* Show title and author */}
        <Text style={styles.detailTitle}>{selectedBook.title}</Text>
        <Text style={styles.detailAuthor}>by {selectedBook.author}</Text>
        {/* Show book description */}
        <Text style={styles.detailDescription}>{selectedBook.description}</Text>
        {/* Buttons for external link and removal */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.linkButton} onPress={handleShare}>
            <Text style={styles.linkButtonText}>Share</Text>
          </TouchableOpacity>

          {selectedBook.isbn13 && (
            <TouchableOpacity style={styles.linkButton} onPress={handleCompareOffers}>
              <Text style={styles.linkButtonText}>Compare Offers</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={handleRemoveClick}>
            <Text style={styles.linkButtonText}>Remove from list</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// Define styles for the component.
const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f0f4f7',
  },
  loaderContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f0f4f7'
  },
  tableContainer: {
    padding: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderWidth: 2,
    borderColor: 'black',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderWidth: 2,
    borderColor: 'black',
    paddingVertical: 8,
  },
  mainCell: {
    flex: 1,
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    color: 'white',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  removeHeader: {
    width: 40,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  removeButtonCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  detailsContent: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  bookCover: {
    width: 200,
    height: 300,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    textAlign: 'center',
  },
  detailAuthor: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  detailDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 5,
    marginVertical: 5,
    width: 200,
    alignItems: 'center',
  },
  linkButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});