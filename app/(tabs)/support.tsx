import { LOGO } from "@/constants/brand";
import { SUPPORT_EMAIL } from "@/constants/links";
import { router } from "expo-router";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function SupportPage() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable
        onPress={() => router.push("/")}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.logoPressable,
          pressed && styles.logoPressed,
        ]}
      >
        <Image
          source={LOGO}
          style={{
            width: width * 0.7,
            maxWidth: 480,
            height: 140,
          }}
          resizeMode="contain"
        />
      </Pressable>

      {/* Content */}
      <View style={styles.hero}>
        <Text style={styles.title}>Support</Text>

        <Text style={styles.subtitle}>
          Need help, found a book with wrong details, or have feedback about
          Cover to Cover?
        </Text>

        <Text style={styles.body}>
          Reach out anytime and we’ll get back to you as soon as possible.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        >
          <Text style={styles.buttonText}>{SUPPORT_EMAIL}</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        © {new Date().getFullYear()} Cover to Cover
      </Text>
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
    marginBottom: 16,
    lineHeight: 26,
  },

  body: {
    color: "#9fb7bf",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },

  button: {
    backgroundColor: "#08c7f7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },

  buttonText: {
    color: "#022831",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    color: "#9fb7bf",
    fontSize: 12,
    position: "absolute",
    bottom: 24,
  },

  logoPressable: {
    borderRadius: 16,
    padding: 6,
    marginBottom: 12,
  },

  logoPressed: {
    opacity: 0.85,
  },
});
