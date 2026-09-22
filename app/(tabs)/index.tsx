// app/index.tsx
import { LOGO } from "@/constants/brand";
import { APP_STORE_URL } from "@/constants/links";
import { router } from "expo-router";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

export default function HomePage() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Image
        source={LOGO}
        style={{ width: Math.min(width * 0.7, 480), height: 140 }}
        resizeMode="contain"
      />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>Judge a book by its cover.</Text>

        <Text style={styles.subtitle}>
          Swipe through covers, match with your next read. Cover to Cover turns
          finding a book into the best part of reading it.
        </Text>

        {APP_STORE_URL ? (
          <Pressable onPress={() => Linking.openURL(APP_STORE_URL)}>
            <Image
              source={{ uri: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" }}
              style={styles.appStoreBadge}
              resizeMode="contain"
            />
          </Pressable>
        ) : (
          <Text style={styles.comingSoon}>Coming soon to the App Store</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push("/support")}>
            <Text style={styles.footerLink}>Contact</Text>
          </Pressable>

          <Text style={styles.footerSeparator}>·</Text>

          <Pressable onPress={() => router.push("/privacy")}>
            <Text style={styles.footerLink}>Privacy</Text>
          </Pressable>

          <Text style={styles.footerSeparator}>·</Text>

          <Pressable onPress={() => router.push("/about")}>
            <Text style={styles.footerLink}>About</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Cover to Cover
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#022831",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

  hero: {
    maxWidth: 720,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  title: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },

  subtitle: {
    color: "#9fb7bf",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },

  appStoreBadge: {
    width: 180,
    height: 60,
  },

  comingSoon: {
    color: "#08c7f7",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  footerContainer: {
    position: "absolute",
    bottom: 24,
    alignItems: "center",
  },

  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  footerLink: {
    color: "#9fb7bf",
    fontSize: 13,
    fontWeight: "500",
  },

  footerSeparator: {
    color: "#9fb7bf",
    marginHorizontal: 8,
  },

  footer: {
    color: "#9fb7bf",
    fontSize: 12,
  },
});
