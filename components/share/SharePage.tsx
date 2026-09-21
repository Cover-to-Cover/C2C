// components/share/SharePage.tsx
//
// Landing page for links shared out of the app. Shows a preview of the thing
// that was shared and hands off to the app (or the App Store) so the link
// "routes back" instead of dead-ending on the web.
import { APP_STORE_URL, appDeepLink } from "@/constants/links";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const BG = "#022831";
const ACCENT = "#08c7f7";
const CARD = "rgba(0,0,0,0.35)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.75)";

export type SharePreview = {
  kicker: string; // "Event", "Restaurant", ...
  title: string;
  lines: string[]; // date, address, ...
  description?: string | null;
  imageUrl?: string | null;
  /** Path inside the mobile app, e.g. "event/123". */
  appPath: string;
  /** Google Maps target so the page is still useful without the app. */
  mapsQuery?: string | null;
};

function isMobile() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function SharePage({
  loading,
  error,
  preview,
}: {
  loading: boolean;
  error: string | null;
  preview: SharePreview | null;
}) {
  const { width } = useWindowDimensions();
  const [triedApp, setTriedApp] = useState(false);

  const openApp = () => {
    if (!preview) return;
    setTriedApp(true);
    Linking.openURL(appDeepLink(preview.appPath));
  };

  // On a phone, try the app straight away; the page stays behind as the
  // fallback for people who don't have it installed.
  useEffect(() => {
    if (preview && isMobile() && !triedApp) openApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.push("/")} accessibilityRole="button">
          <Image
            source={require("../../assets/images/halalfinders_logo.png")}
            style={{ width: Math.min(width * 0.7, 520), height: 60 }}
            resizeMode="contain"
          />
        </Pressable>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={ACCENT} size="large" />
          </View>
        ) : error || !preview ? (
          <View style={styles.card}>
            <Text style={styles.title}>Not found</Text>
            <Text style={styles.muted}>
              {error ?? "This link may have expired or been removed."}
            </Text>
            <Pressable onPress={() => Linking.openURL(APP_STORE_URL)} style={styles.primary}>
              <Text style={styles.primaryText}>Get HalalFinders</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            {!!preview.imageUrl && (
              <Image
                source={{ uri: preview.imageUrl }}
                style={styles.cover}
                resizeMode="cover"
              />
            )}
            <Text style={styles.kicker}>{preview.kicker}</Text>
            <Text style={styles.title}>{preview.title}</Text>
            {preview.lines.map((l) => (
              <Text key={l} style={styles.line}>
                {l}
              </Text>
            ))}
            {!!preview.description && (
              <Text style={styles.description}>{preview.description}</Text>
            )}

            <Pressable onPress={openApp} style={styles.primary}>
              <Text style={styles.primaryText}>Open in HalalFinders</Text>
            </Pressable>

            <Pressable onPress={() => Linking.openURL(APP_STORE_URL)} style={styles.secondary}>
              <Text style={styles.secondaryText}>Don&apos;t have the app? Get it on the App Store</Text>
            </Pressable>

            {!!preview.mapsQuery && (
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      preview.mapsQuery!,
                    )}`,
                  )
                }
                style={styles.secondary}
              >
                <Text style={styles.secondaryText}>View on Google Maps</Text>
              </Pressable>
            )}
          </View>
        )}

        <Text style={styles.footer}>© {new Date().getFullYear()} HalalFinders</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 },
  center: { paddingVertical: 60 },
  card: {
    width: "100%",
    maxWidth: 560,
    marginTop: 24,
    padding: 24,
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cover: { width: "100%", aspectRatio: 16 / 9, borderRadius: 12, marginBottom: 18 },
  kicker: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: { color: TEXT, fontSize: 28, fontWeight: "800", marginBottom: 10 },
  line: { color: MUTED, fontSize: 16, lineHeight: 24 },
  description: { color: MUTED, fontSize: 15, lineHeight: 22, marginTop: 14 },
  muted: { color: MUTED, fontSize: 16, lineHeight: 24 },
  primary: {
    marginTop: 22,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: BG, fontSize: 16, fontWeight: "800" },
  secondary: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  secondaryText: { color: ACCENT, fontSize: 14, fontWeight: "600" },
  footer: { color: MUTED, fontSize: 12, marginTop: 40 },
});
