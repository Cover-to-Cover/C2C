// app/liked.tsx
import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  cover_id?: number;
  description?: string;
  openLibraryLink?: string;
  isbn13?: string;
}

export default function LikedScreen() {
  const [userId, setUserId] = useState('');
  const [likedBooks, setLikedBooks] = useState<LikedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<LikedBook | null>(null);
  const router = useRouter();

  // Slide animation setup.
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const screenWidth = Dimensions.get('window').width;

  // Set up PanResponder to detect left-to-right swipe.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx > 20,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          handleBack();
        }
      },
    })
  ).current;

  // Check for an active session and set the userId, or redirect to login.
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

  // Fetch liked books for the current user.
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
      setLikedBooks(data || []);
    };
    fetchBooks();
  }, [userId]);

  // When a row is clicked: fetch extended details for the book then slide in.
  const handleRowClick = async (book: LikedBook) => {
    setSelectedBook(null); // Clear previous selection while loading.
    try {
      const workRes = await fetch(`https://openlibrary.org/works/${book.isbn}.json`);
      const workData = await workRes.json();
      let isbn13 = '';
      try {
        const editionsRes = await fetch(`https://openlibrary.org/works/${book.isbn}/editions.json?limit=1`);
        const editionsData = await editionsRes.json();
        const edition = editionsData.entries?.[0];
        const isbn13Candidate = edition?.isbn_13?.[0];
        if (isbn13Candidate) isbn13 = isbn13Candidate;
      } catch (err) {
        console.warn('Could not fetch ISBN-13 from editions.');
      }
      const extendedBook: LikedBook = {
        ...book,
        description:
          typeof workData.description === 'string'
            ? workData.description
            : workData.description?.value || 'No description available.',
        cover_id: workData.covers ? workData.covers[0] : undefined,
        openLibraryLink: `https://openlibrary.org/works/${book.isbn}`,
        isbn13,
      };
      setSelectedBook(extendedBook);
      // Animate slide in: from screenWidth to 0.
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Error fetching OpenLibrary data:', err);
      setSelectedBook({ ...book, description: 'No description available.' });
    }
  };

  // When the back arrow or swipe is triggered, slide out then clear selection.
  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedBook(null);
      slideAnim.setValue(screenWidth);
    });
  };

  // Remove a book from the liked list.
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
    setLikedBooks(likedBooks.filter(book => book.isbn !== selectedBook.isbn));
    handleBack(); // Return to list after removal.
  };

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

  const handleCompareOffers = () => {
    if (selectedBook && selectedBook.isbn13) {
      Linking.openURL(`https://www.directtextbook.com/isbn/${selectedBook.isbn13}`);
    }
  };

  // List view when no book is selected.
  if (!selectedBook) {
    return (
      <View style={styles.listContainer}>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Title</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Author</Text>
          </View>
          {likedBooks.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>No liked books found.</Text>
            </View>
          ) : (
            likedBooks.map((book) => (
              <TouchableOpacity
                key={book.isbn}
                style={styles.tableRow}
                onPress={() => handleRowClick(book)}
              >
                <Text style={styles.tableCell}>{book.title}</Text>
                <Text style={styles.tableCell}>{book.author}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Details view with slide-in animation and pan responder to detect swipe.
  return (
    <Animated.View
      style={[styles.detailsContainer, { transform: [{ translateX: slideAnim }] }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.detailsContent}>
        {selectedBook.cover_id && (
          <Image
            source={{ uri: `https://covers.openlibrary.org/b/id/${selectedBook.cover_id}-L.jpg` }}
            style={styles.bookCover}
            resizeMode="contain"
          />
        )}
        <Text style={styles.detailTitle}>{selectedBook.title}</Text>
        <Text style={styles.detailAuthor}>by {selectedBook.author}</Text>
        <Text style={styles.detailDescription}>{selectedBook.description}</Text>
        <View style={styles.buttonRow}>
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

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f4f7',
  },
  tableContainer: {
    padding: 10,
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
    marginTop: 4,
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
