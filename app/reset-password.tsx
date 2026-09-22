import { SUPPORT_EMAIL } from "@/constants/links";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function ResetPassword() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>

      <Text style={styles.subtitle}>
        Open the Cover to Cover app to finish setting a new password. This link
        signed you in, so you can pick up right where you left off.
      </Text>

      <Pressable onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
        <Text style={styles.link}>Having trouble? {SUPPORT_EMAIL}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#022831",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    color: "#9fb7bf",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 420,
    marginBottom: 28,
  },

  link: {
    color: "#08c7f7",
    fontSize: 15,
    fontWeight: "600",
  },
});
