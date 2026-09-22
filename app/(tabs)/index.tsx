// app/index.tsx
import { SiteFooter } from "@/components/site-footer";
import { StoreBadges } from "@/components/store-badges";
import { LOGO } from "@/constants/brand";
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

export default function HomePage() {
  const { width, height } = useWindowDimensions();

  // Square, up to 500x500. Shrinks on narrow or short viewports so the hero
  // and the footer still fit without the page needing to scroll.
  const logoSize = Math.min(width * 0.8, height * 0.5, 500);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Image
        source={LOGO}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>Judge freely.</Text>

        <Text style={styles.subtitle}>
          A book discovery app for people who pick by the art.
        </Text>

        <StoreBadges />
      </View>

      {/* Footer */}
      <SiteFooter style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#022831",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    paddingBottom: 88, // leaves room for the absolutely-positioned footer
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

  footer: {
    position: "absolute",
    bottom: 24,
  },
});
