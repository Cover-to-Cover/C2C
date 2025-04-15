// app/awards.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabaseClient';

interface Award {
  id: string;
  award_name: string;
  award_desc: string;
  award_img: string | null;
}

export default function Awards() {
  const [userAwards, setUserAwards] = useState<Award[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const processAwards = async () => {
      // 1. Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        setIsLoading(false);
        return;
      }
      if (!session?.user?.id) {
        router.push('/login');
        setIsLoading(false);
        return;
      }
      const userId = session.user.id;

      // 2. Fetch all awards (to know the possible award IDs)
      const { data: allAwards, error: allAwardsError } = await supabase
        .from('awards')
        .select('*');
      if (allAwardsError) {
        console.error('Error fetching awards:', allAwardsError.message);
        setIsLoading(false);
        return;
      }

      // 3. Get all awards already earned by the user
      const { data: userAwardRecords, error: userAwardError } = await supabase
        .from('user_awards')
        .select('*')
        .eq('user_id', userId);
      if (userAwardError) {
        console.error('Error fetching user awards:', userAwardError.message);
        setIsLoading(false);
        return;
      }

      // Create a set of award_ids the user already has
      const awardedIds = new Set(userAwardRecords.map((record: any) => record.award_id));

      // 4. Loop through each award and apply the conditions if the user doesn't have it yet.
      for (const award of allAwards) {
        if (!awardedIds.has(award.id)) {
          // Convert the award id to a number for our switch statement.
          const awardId = parseInt(award.id, 10);
          switch (awardId) {
            case 1: {
              // Award 1: If the user has at least 1 record in user_books, award award_id 1.
              const { data: userBooks, error: userBooksError } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId);
              if (userBooksError) {
                console.error('Error fetching user books for award 1:', userBooksError.message);
              } else if (userBooks && userBooks.length >= 1) {
                const { error: insertError } = await supabase
                  .from('user_awards')
                  .insert({ user_id: userId, award_id: awardId });
                if (insertError) {
                  console.error('Error inserting award 1:', insertError.message);
                }
              }
              break;
            }
            case 2: {
              // Award 2: If the user has at least 100 records in user_books, award award_id 2.
              const { data: userBooks, error: userBooksError } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId);
              if (userBooksError) {
                console.error('Error fetching user books for award 2:', userBooksError.message);
              } else if (userBooks && userBooks.length >= 100) {
                const { error: insertError } = await supabase
                  .from('user_awards')
                  .insert({ user_id: userId, award_id: awardId });
                if (insertError) {
                  console.error('Error inserting award 2:', insertError.message);
                }
              }
              break;
            }
            case 3: {
              // Award 3: If the user has at least 100 liked records in user_books, award award_id 3.
              const { data: likedBooks, error: likedError } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId)
                .eq('liked', true);
              if (likedError) {
                console.error('Error fetching liked books for award 3:', likedError.message);
              } else if (likedBooks && likedBooks.length >= 100) {
                const { error: insertError } = await supabase
                  .from('user_awards')
                  .insert({ user_id: userId, award_id: awardId });
                if (insertError) {
                  console.error('Error inserting award 3:', insertError.message);
                }
              }
              break;
            }
            case 4: {
              // Award 4: Do nothing.
              break;
            }
            case 5: {
              // Award 5: If the user has the same number of records with liked=true as liked=false,
              // award award_id 5.
              const { data: likedBooks, error: likedError } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId)
                .eq('liked', true);
              const { data: unlikedBooks, error: unlikedError } = await supabase
                .from('user_books')
                .select('*')
                .eq('user_id', userId)
                .eq('liked', false);
              if (likedError || unlikedError) {
                console.error(
                  'Error fetching liked/unliked books for award 5:',
                  likedError?.message || unlikedError?.message
                );
              } else if (
                likedBooks &&
                unlikedBooks &&
                likedBooks.length === unlikedBooks.length
              ) {
                const { error: insertError } = await supabase
                  .from('user_awards')
                  .insert({ user_id: userId, award_id: awardId });
                if (insertError) {
                  console.error('Error inserting award 5:', insertError.message);
                }
              }
              break;
            }
            default:
              // For any other award IDs, do nothing.
              break;
          }
        }
      }

      // 5. After processing, re-fetch the user awards (with joined award data for display)
      const { data: joinedAwardsData, error: joinedAwardsError } = await supabase
        .from('user_awards')
        .select(`*, award:awards(*)`)
        .eq('user_id', userId);
      if (joinedAwardsError) {
        console.error('Error fetching joined user awards:', joinedAwardsError.message);
      } else if (joinedAwardsData) {
        const awardsArray: Award[] = joinedAwardsData
          .map((record: any) => record.award)
          .filter((award: Award) => award !== null);
        setUserAwards(awardsArray);
      }
      setIsLoading(false);
    };

    processAwards();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Awards</Text>
      <Text style={styles.subHeader}>Your earned awards and recognitions:</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#f44336" />
      ) : userAwards.length > 0 ? (
        <ScrollView style={styles.table}>
          {userAwards.map((award) => (
            <View key={award.id} style={styles.row}>
              <Image
                source={{ uri: award.award_img || 'https://via.placeholder.com/50' }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.awardName}>{award.award_name}</Text>
                <Text style={styles.awardDescription}>{award.award_desc}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noAwardsText}>You have not earned any awards yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  table: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  awardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  awardDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  noAwardsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});