import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function PrivacyPage() {
  const { width } = useWindowDimensions();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable
        onPress={() => router.push("/")}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.logoPressable,
          pressed && styles.logoPressed,
        ]}
      >
        <Image
          source={require("../../assets/images/halalfinders_logo.png")}
          style={{
            width: width * 0.7,
            maxWidth: 480,     // keeps it sane on desktop
            height: 140,
          }}
          resizeMode="contain"
        />
      </Pressable>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.updated}>
        Last updated: February 2026
      </Text>

      <Section title="Overview">
        HalalFinders respects your privacy. This Privacy
        Policy explains how information is collected, used, and protected when
        you use the HalalFinders mobile application and related services.
      </Section>

      <Section title="Information We Collect">
        • Email address (used for account creation and authentication)
        {"\n"}• Basic profile information you choose to provide
        {"\n"}• Precise location data (only when you grant permission)
        {"\n"}• Search queries performed within the app
        {"\n"}• Community contributions such as place submissions, verifications,
        and event details
        {"\n"}• Photos you choose to upload for events or community content
      </Section>

      <Section title="How We Use Your Information">
        • To create and manage user accounts
        {"\n"}• To display nearby halal restaurants, mosques, and events
        {"\n"}• To support map features and Qiblah direction
        {"\n"}• To enable community-driven verification and contributions
        {"\n"}• To maintain app security, performance, and reliability
      </Section>

      <Section title="Location Data">
        Location access is optional. If enabled, precise location data is used
        only to show nearby places, calculate distances, and support direction-
        based features such as Qiblah. Location data is not used for advertising
        or tracking purposes. You can disable location access at any time through
        your device settings.
      </Section>

      <Section title="Photos and User Content">
        If you choose to upload photos or submit content (such as events or
        verifications), that content will be stored and displayed as part of the
        app’s community features. You control what content you choose to share.
      </Section>

      <Section title="Data Sharing">
        We do not sell your personal information. Data may be shared only with
        trusted service providers required to operate core functionality (such
        as authentication, hosting, and maps), or when required by law.
      </Section>

      <Section title="Data Security">
        We use reasonable technical and organizational measures to protect your
        information. However, no method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </Section>

      <Section title="Your Choices">
        • Update or manage your account information
        {"\n"}• Control location permissions through your device settings
        {"\n"}• Choose whether to submit content or upload photos
        {"\n"}• Request account or data deletion by contacting us
      </Section>

      <Section title="Children’s Privacy">
        HalalFinders is not intended for children under the age of 13. We do not
        knowingly collect personal information from children.
      </Section>

      <Section title="Changes to This Policy">
        We may update this Privacy Policy from time to time. Continued use of
        HalalFinders after changes are posted indicates acceptance of the updated
        policy.
      </Section>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} HalalFinders
      </Text>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#022831",
  },

  content: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  updated: {
    color: "#9fb7bf",
    fontSize: 13,
    marginBottom: 32,
  },

  section: {
    maxWidth: 720,
    width: "100%",
    marginBottom: 28,
  },

  sectionTitle: {
    color: "#08c7f7",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  body: {
    color: "#9fb7bf",
    fontSize: 15,
    lineHeight: 24,
  },

  email: {
    color: "#08c7f7",
    fontWeight: "600",
  },

  footer: {
    color: "#9fb7bf",
    fontSize: 12,
    marginTop: 32,
  },

  logoPressable: {
    borderRadius: 16,
    padding: 6,
    marginBottom: 12,
  },

  logoPressed: {
    opacity: 0.85,
  },

  logo: {
    width: 320,
    height: 96,
  },
});
