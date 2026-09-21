import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getSupabase } from "../lib/supabase";

export default function AuthRedirect() {
  useEffect(() => {
    // Supabase automatically reads the URL hash
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Auth redirect error:", error);
        return;
      }

      // If this is a recovery flow, user is now authenticated
      if (data.session) {
        router.replace("../reset-password");
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#08c7f7" size="large" />
      <Text style={styles.title}>Finishing sign-in…</Text>
      <Text style={styles.subtitle}>
        You can return to the HalalFinders app.
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#022831", // SAME dark HF background
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    color: "#ffffff", // SAME as index.tsx title
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    color: "#9fb7bf", // SAME muted HF text
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 420,
  },
});
