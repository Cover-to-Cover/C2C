// components/site-footer.tsx
//
// The same Contact / Privacy / About row on every page, so navigating off the
// landing page doesn't dead-end. Pages with a fixed, centered layout pass
// `style={{ position: "absolute", bottom: 24 }}`; scrolling pages let it sit
// at the end of the content.
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export function SiteFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.links}>
        <Pressable onPress={() => router.push("/support")}>
          <Text style={styles.link}>Contact</Text>
        </Pressable>

        <Text style={styles.separator}>·</Text>

        <Pressable onPress={() => router.push("/privacy")}>
          <Text style={styles.link}>Privacy</Text>
        </Pressable>

        <Text style={styles.separator}>·</Text>

        <Pressable onPress={() => router.push("/about")}>
          <Text style={styles.link}>About</Text>
        </Pressable>
      </View>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} Cover to Cover
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  links: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  link: {
    color: "#9fb7bf",
    fontSize: 13,
    fontWeight: "500",
  },

  separator: {
    color: "#9fb7bf",
    marginHorizontal: 8,
  },

  copyright: {
    color: "#9fb7bf",
    fontSize: 12,
  },
});
