import { SiteFooter } from "@/components/site-footer";
import { LOGO, LOGO_HEADER_WIDTH } from "@/constants/brand";
import { SUPPORT_EMAIL } from "@/constants/links";
import { router } from "expo-router";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#022831";
const ACCENT = "#08c7f7";
const CARD = "rgba(0,0,0,0.35)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.75)";

export default function SupportPage() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
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
                    width: LOGO_HEADER_WIDTH,
                    height: 140,
                    marginBottom: 12,
                  }}
                  resizeMode="contain"
                />
              </Pressable>

              <Text style={styles.title}>Support</Text>
              <Text style={styles.subtitle}>
                Need help, found a book with wrong details, or have feedback
                about Cover to Cover?
              </Text>
            </View>

            {/* Everything lives in one card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Get in Touch</Text>

              <Text style={styles.cardText}>
                Email us any time and we’ll get back to you as soon as we can.
                Bug reports, a book with the wrong cover or blurb, a title you
                want added, or just an idea for the app. All of it is welcome.
              </Text>

              <Pressable
                style={styles.button}
                onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                accessibilityRole="link"
              >
                <Text style={styles.buttonText}>{SUPPORT_EMAIL}</Text>
              </Pressable>
            </View>

            <SiteFooter style={styles.footer} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG, // ensures status bar / notch area matches
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 48,
    paddingBottom: 50,
  },
  inner: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 18,
  },

  // clickable logo
  logoPressable: {
    borderRadius: 16,
    padding: 6,
  },
  logoPressed: {
    opacity: 0.85,
  },

  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 520,
    lineHeight: 20,
  },

  card: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },

  cardTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: {
    color: BG,
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    marginTop: 32,
  },
});
