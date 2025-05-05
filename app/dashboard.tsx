// app/dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import { FontAwesome } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- types & constants ---
interface Work {
  key: string;
  title: string;
  cover_id: number;
  authors: { name: string }[];
}

const genreMap: Record<string, string> = {
  Mystery: 'mystery',
  'Science Fiction': 'science_fiction',
  Fantasy: 'fantasy',
  Romance: 'romance',
  Horror: 'horror',
  Thriller: 'thriller',
  'Historical Fiction': 'historical_fiction',
  Biography: 'biography',
  Memoir: 'memoir',
  'Self-Help': 'self_help',
  Poetry: 'poetry',
  Drama: 'drama',
  Adventure: 'adventure',
  'Crime Fiction': 'crime_fiction',
  Dystopian: 'dystopian',
  Paranormal: 'paranormal',
  'Magical Realism': 'magical_realism',
  'Classic Literature': 'classic_literature',
  "Children's Literature": 'children',
  'Young Adult Fiction': 'young_adult',
  Satire: 'satire',
  'Philosophical Fiction': 'philosophical_fiction',
  'Literary Fiction': 'literary_fiction',
  Western: 'western',
  'Detective Fiction': 'detective',
  'War Fiction': 'war_fiction',
  'Gothic Fiction': 'gothic',
  'Political Fiction': 'political_fiction',
  Cyberpunk: 'cyberpunk',
  'Coming-of-Age Fiction': 'coming_of_age',
};

export default function DashboardScreen() {
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // dropdown state
  const [open, setOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Science Fiction');
  const [items, setItems] = useState(
    Object.keys(genreMap).map((g) => ({ label: g, value: g }))
  );

  const router = useRouter();

  // fetch books user has already seen
  const getUserBookISBNs = async (): Promise<string[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('user_books')
      .select('isbn')
      .eq('user_id', userId);
    if (error) {
      console.error(error.message);
      return [];
    }
    return data.map((r: any) => r.isbn);
  };

  // like handler
  const handleHeartClick = async () => {
    if (isLoading || !currentWork) return;
    const isbn = currentWork.key.replace('/works/', '');
    const seen = await getUserBookISBNs();
    if (!seen.includes(isbn)) {
      await supabase.from('user_books').insert([
        {
          isbn,
          title: currentWork.title,
          author: currentWork.authors?.[0]?.name || 'Unknown',
          liked: true,
          user_id: userId,
        },
      ]);
    }
    pickRandomWork();
  };

  // dislike handler
  const handleXClick = async () => {
    if (isLoading || !currentWork) return;
    const isbn = currentWork.key.replace('/works/', '');
    const seen = await getUserBookISBNs();
    if (!seen.includes(isbn)) {
      await supabase.from('user_books').insert([
        { isbn, liked: false, user_id: userId },
      ]);
    }
    pickRandomWork();
  };

  // keep refs to latest handlers
  const heartRef = useRef(handleHeartClick);
  const xRef = useRef(handleXClick);
  useEffect(() => {
    heartRef.current = handleHeartClick;
    xRef.current = handleXClick;
  }, [handleHeartClick, handleXClick]);

  // animation values
  const pan = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const swipeThreshold = 100;

  // pan responder: swipe and fade out on release
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_e, { dx }) => {
        if (dx < -swipeThreshold) {
          // swipe left → like: slide off to left + fade out
          Animated.parallel([
            Animated.timing(pan, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(fade, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            heartRef.current();
            // pan/fade reset moved to book load effect
          });
        } else if (dx > swipeThreshold) {
          // swipe right → dislike: slide off to right + fade out
          Animated.parallel([
            Animated.timing(pan, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(fade, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            xRef.current();
            // pan/fade reset moved to book load effect
          });
        } else {
          // not far enough → spring back
          Animated.spring(pan, {
            toValue: 0,
            bounciness: 10,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // reset animations and fade-in after new book loads
  useEffect(() => {
    if (currentWork) {
      pan.setValue(0);
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [currentWork]);

  // auth check
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email && session.user.id) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      } else {
        router.push('/LoginScreen');
      }
    })();
  }, []);

  // fetch a new random work
  const pickRandomWork = async () => {
    setIsLoading(true);
    setBookDetails(null);
    setCurrentWork(null);
    const seen = await getUserBookISBNs();
    let found = false;

    for (let i = 0; i < 15; i++) {
      try {
        const slug =
          genreMap[selectedGenre] ||
          selectedGenre.toLowerCase().replace(/\s+/g, '_');
        const cntRes = await fetch(
          `https://openlibrary.org/subjects/${slug}.json?limit=1`
        );
        const { work_count } = await cntRes.json();
        const offset = Math.floor(Math.random() * work_count);
        const wkRes = await fetch(
          `https://openlibrary.org/subjects/${slug}.json?limit=1&offset=${offset}`
        );
        const data = await wkRes.json();
        const work = data.works?.find((w: any) => w.cover_id);
        if (work) {
          const isbn = work.key.replace('/works/', '');
          if (!seen.includes(isbn)) {
            setCurrentWork(work);
            found = true;
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!found) {
      setBookDetails({ description: 'No more books available in this genre :(' });
    }
    setIsLoading(false);
  };

  // auto-fetch when genre changes
  useEffect(() => {
    pickRandomWork();
  }, [selectedGenre]);

  // fetch details when we have a current work
  useEffect(() => {
    (async () => {
      if (!currentWork) return;
      try {
        const res = await fetch(
          `https://openlibrary.org${currentWork.key}.json`
        );
        setBookDetails(await res.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [currentWork]);

  // build summary text
  let summaryText = 'No description available.';
  if (bookDetails?.description) {
    summaryText =
      typeof bookDetails.description === 'string'
        ? bookDetails.description
        : bookDetails.description.value;
  }

  return (
    <View style={styles.container}>
      <View style={styles.dashboardContainer}>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={selectedGenre}
            items={items}
            setOpen={setOpen}
            setValue={(cb) => setSelectedGenre(cb(selectedGenre))}
            setItems={setItems}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            placeholder="Select Genre"
            zIndex={3000}
          />
        </View>

        <View style={styles.contentContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#f44336" />
          ) : currentWork ? (
            <>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.bookContainer,
                  { transform: [{ translateX: pan }], opacity: fade },
                ]}
              >
                <Image
                  source={{
                    uri: `https://covers.openlibrary.org/b/id/${currentWork.cover_id}-L.jpg`,
                  }}
                  style={styles.bookCover}
                  resizeMode="contain"
                />
              </Animated.View>

              <View style={styles.actionButtonsContainer}>
                {/* Like on the left */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleHeartClick}
                  disabled={isLoading}
                >
                  <FontAwesome name="heart" size={50} color="#ff6b6b" />
                </TouchableOpacity>
                {/* Dislike on the right */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleXClick}
                  disabled={isLoading}
                >
                  <FontAwesome name="times" size={50} color="#ff6b6b" />
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
  container: { flex: 1, backgroundColor: '#eef2f5' },
  dashboardContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: { width: '100%', marginBottom: -30, zIndex: 3000 },
  dropdown: {
    backgroundColor: '#ff6b6b',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    height: 70,
  },
  dropdownText: { color: 'black', fontWeight: 'bold' },
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
  bookContainer: { alignItems: 'center', marginBottom: 10 },
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
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 4,
    maxWidth: 350,
  },
  bookSummary: { fontSize: 14, color: '#444', textAlign: 'center' },
});
