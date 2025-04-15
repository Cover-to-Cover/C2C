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
    const fetchAwards = async () => {
      // Get current session
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

      // Query user_awards with the joined awards table
      const { data, error } = await supabase
        .from('user_awards')
        .select(`*, award:awards(*)`)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user awards:', error.message);
      } else if (data) {
        console.log('user_awards query result:', data);
        // Map records to extract the joined award data
        const awardsArray: Award[] = data
          .map((record: any) => record.award)
          .filter((award: Award) => award !== null);
        setUserAwards(awardsArray);
      }
      setIsLoading(false);
    };

    fetchAwards();
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