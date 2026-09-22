// components/store-badges.tsx
//
// App Store + Google Play buttons. Both badges always render; a badge whose
// URL in constants/links.ts is still empty just doesn't navigate.
//
// The two official assets aren't drawn to the same scale. Apple's SVG is
// 119.66x40 with the button filling the whole box, but Google's PNG is 646x250
// with the button only 564x168 of it, leaving 41px of transparent padding on
// every side. So the Play badge is rendered oversized and pulled back in with
// negative margins, which leaves both buttons visually 60px tall and lets the
// Pressable around it size to the button rather than the padding.
import { APP_STORE_URL, PLAY_STORE_URL } from "@/constants/links";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";

const APP_STORE_BADGE =
  "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const PLAY_STORE_BADGE =
  "https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png";

export function StoreBadges() {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => APP_STORE_URL && Linking.openURL(APP_STORE_URL)}
        disabled={!APP_STORE_URL}
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

      <Pressable
        onPress={() => PLAY_STORE_URL && Linking.openURL(PLAY_STORE_URL)}
        disabled={!PLAY_STORE_URL}
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
});
