// app/liked.tsx
// This screen displays the user's list of liked books and allows for viewing extended details
// via a slide-in animation, handling swipe gestures for back navigation, and removing a book.
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
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ROCKETSOURCE_TOKEN } from '@env';

// Define a TypeScript interface that represents a liked book.
interface LikedBook {
  isbn: string;
  title: string;
  author: string;
  created_at?: string;
  cover_id?: number;
  description?: string;
  openLibraryLink?: string;
  isbn13?: string;
  isbn10?: string;
}

export default function LikedScreen() {
  const [userId, setUserId] = useState('');
  const [likedBooks, setLikedBooks] = useState<LikedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<LikedBook | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const screenWidth = Dimensions.get('window').width;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && gs.dx > 20,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 50) handleBack();
      },
    })
  ).current;

  // Check session
  useEffect(() => {
    (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      if (!session?.user?.id) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    })();
  }, [router]);

  // Fetch liked books
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_books')
        .select('isbn, title, author, created_at')
        .eq('user_id', userId)
        .eq('liked', true)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error.message);
      } else {
        setLikedBooks(data || []);
      }
    })();
  }, [userId]);

  const handleQuickRemove = (book: LikedBook) => {
    Alert.alert(
      'Confirm Removal',
      'Remove this book from your list?',
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
            if (error) console.error(error.message);
            else {
              setLikedBooks(prev => prev.filter(b => b.isbn !== book.isbn));
            }
          },
        },
      ]
    );
  };

  const handleRowClick = async (book: LikedBook) => {
    setSelectedBook(null);
    setLoadingDetails(true);

    try {
      const workRes = await fetch(`https://openlibrary.org/works/${book.isbn}.json`);
      const workData = await workRes.json();
      const editionsRes = await fetch(
        `https://openlibrary.org/works/${book.isbn}/editions.json?limit=20`
      );
      const { entries } = await editionsRes.json();
      const bestEdition =
        entries.find((e: any) => Array.isArray(e.isbn_10) && e.isbn_10.length > 0) ||
        entries[0] ||
        {};
      const isbn10 = Array.isArray(bestEdition.isbn_10) ? bestEdition.isbn_10[0] : '';
      const isbn13 = Array.isArray(bestEdition.isbn_13) ? bestEdition.isbn_13[0] : '';

      const extended: LikedBook = {
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

      setSelectedBook(extended);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error(err);
      setSelectedBook({ ...book, description: 'No description available.' });
    } finally {
      setLoadingDetails(false);
    }
  };

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

  const handleRemove = async () => {
    if (!selectedBook) return;
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('isbn', selectedBook.isbn)
      .eq('user_id', userId);
    if (error) console.error(error.message);
    else {
      setLikedBooks(prev => prev.filter(b => b.isbn !== selectedBook.isbn));
      handleBack();
    }
  };

  const handleShare = () => {
    if (!selectedBook?.isbn10) {
      Alert.alert('No ISBN-10 available for sharing.');
      return;
    }
    const url = `https://www.amazon.com/dp/${selectedBook.isbn10}`;
    Share.share({ message: `Check out this book! ${url}` }, { dialogTitle: 'Share' });
  };

  const CONVERT_ENDPOINT =
  Platform.OS === 'web'
    ? '/api/convert'                              // hits your Apache proxy + CORS
    : 'https://app.rocketsource.io/api/v3/convert'; // native can call RS directly

  const handleCompareOffers = async () => {
    if (!selectedBook?.isbn13) return;
    setLoadingOffers(true);

    try {
      const res = await fetch(CONVERT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ROCKETSOURCE_TOKEN}`,
        },
        body: JSON.stringify({
          marketplace: 'US',
          identifiers: [{ type: 'isbn', value: selectedBook.isbn13 }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const asin = data[selectedBook.isbn13]?.asin?.[0];
      if (!asin) {
        Alert.alert('ASIN not found.');
      } else {
        Linking.openURL(
          `https://www.amazon.com/dp/${asin}/ref=nosim?tag=covertocove06-20`
        );
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error fetching ASIN', err.message);
    } finally {
      setLoadingOffers(false);
    }
  };

  if (loadingDetails) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f44336" />
        <Text style={{ marginTop: 10, color: '#333' }}>Loading details…</Text>
      </View>
    );
  }

  if (!selectedBook) {
    return (
      <View style={styles.listContainer}>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell]}>Title</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Author</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Liked on</Text>
            <Text style={[styles.tableCell, styles.headerCell, { width: 40, textAlign: 'center' }]}>
              ×
            </Text>
          </View>

          {likedBooks.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>No liked books found.</Text>
            </View>
          ) : (
            likedBooks.map(book => (
              <View key={book.isbn} style={styles.tableRow}>
                <TouchableOpacity style={styles.mainCell} onPress={() => handleRowClick(book)}>
                  <Text style={styles.tableCell}>{book.title}</Text>
                  <Text style={styles.tableCell}>{book.author}</Text>
                  <Text style={styles.tableCell}>
                    {book.created_at ? new Date(book.created_at).toLocaleDateString() : '-'}
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
          <TouchableOpacity style={styles.linkButton} onPress={handleShare}>
            <Text style={styles.linkButtonText}>Share</Text>
          </TouchableOpacity>

          {selectedBook.isbn13 && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleCompareOffers}
              disabled={loadingOffers}
            >
              {loadingOffers ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.linkButtonText}>Compare Offers</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={handleRemove}>
            <Text style={styles.linkButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
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
  removeButtonCell: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
