// app/index.tsx
import { APP_STORE_URL } from "@/constants/links";
import { router } from "expo-router";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function HomePage() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Image
        source={require("../../assets/images/halalfinders_logo.png")}
        style={{ width: 4750, height: 275 }}
        resizeMode="contain"
      />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>Find Halal. Anywhere.</Text>

        <Text style={styles.subtitle}>
          Discover halal restaurants, mosques, and verified spots near you.
        </Text>

        <Pressable onPress={() => Linking.openURL(APP_STORE_URL)}>
          <Image
            source={{ uri: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" }}
            style={styles.appStoreBadge}
            resizeMode="contain"
          />
        </Pressable>
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
          © {new Date().getFullYear()} HalalFinders
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
