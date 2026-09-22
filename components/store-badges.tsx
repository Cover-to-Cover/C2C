// components/store-badges.tsx
//
// App Store + Google Play buttons. Either badge is dropped when its URL in
// constants/links.ts is still empty, and with both empty this falls back to a
// "coming soon" line rather than rendering buttons that go nowhere.
//
// The two official assets aren't drawn to the same scale. Apple's SVG is
// 119.66x40 with the button filling the whole box, but Google's PNG is 646x250
// with the button only 564x168 of it — 41px of transparent padding on every
// side. So the Play badge is rendered oversized and pulled back in with
// negative margins, which leaves both buttons visually 60px tall and lets the
// Pressable around it size to the button rather than the padding.
import { APP_STORE_URL, PLAY_STORE_URL } from "@/constants/links";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";

const APP_STORE_BADGE =
  "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const PLAY_STORE_BADGE =
  "https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png";

export function StoreBadges() {
  if (!APP_STORE_URL && !PLAY_STORE_URL) {
    return (
      <Text style={styles.comingSoon}>
        Coming soon to the App Store and Google Play
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {!!APP_STORE_URL && (
        <Pressable
          onPress={() => Linking.openURL(APP_STORE_URL)}
          accessibilityRole="link"
          accessibilityLabel="Download Cover to Cover on the App Store"
          style={styles.slot}
        >
          <Image
            source={{ uri: APP_STORE_BADGE }}
            style={styles.appStoreBadge}
            resizeMode="contain"
          />
        </Pressable>
      )}

      {!!PLAY_STORE_URL && (
        <Pressable
          onPress={() => Linking.openURL(PLAY_STORE_URL)}
          accessibilityRole="link"
          accessibilityLabel="Get Cover to Cover on Google Play"
          style={styles.slot}
        >
          <Image
            source={{ uri: PLAY_STORE_BADGE }}
            style={styles.playStoreBadge}
            resizeMode="contain"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },

  // Spacing lives out here so the Play badge's negative margins stay purely
  // about cancelling its built-in padding.
  slot: {
    margin: 6,
  },

  appStoreBadge: {
    width: 180,
    height: 60,
  },

  playStoreBadge: {
    width: 231,
    height: 89,
    margin: -15,
  },

  comingSoon: {
    color: "#08c7f7",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
