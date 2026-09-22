import { SiteFooter } from "@/components/site-footer";
import { LOGO } from "@/constants/brand";
import { SUPPORT_EMAIL } from "@/constants/links";
import { router } from "expo-router";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
          source={LOGO}
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
        Last updated: September 2026
      </Text>

      <Section title="Overview">
        Cover to Cover respects your privacy. This Privacy Policy explains how
        information is collected, used, and protected when you use the Cover to
        Cover mobile application and related services.
      </Section>

      <Section title="Information We Collect">
        • Email address (used for account creation and authentication)
        {"\n"}• Basic profile information you choose to provide
        {"\n"}• Your swipes — the covers you like and pass on
        {"\n"}• Books you save to your shelf and mark as read
        {"\n"}• Reading preferences such as genres you follow
        {"\n"}• Search queries performed within the app
        {"\n"}• Ratings, reviews, and other content you choose to submit
      </Section>

      <Section title="How We Use Your Information">
        • To create and manage user accounts
        {"\n"}• To show you book covers and keep track of what you have seen
        {"\n"}• To recommend books based on the covers you swipe on
        {"\n"}• To save your shelf and sync it across your devices
        {"\n"}• To maintain app security, performance, and reliability
      </Section>

      <Section title="Your Swipes and Recommendations">
        Your swipes are what make the app work. We use them to avoid showing you
        the same cover twice and to learn the kind of book art you respond to, so
        the next batch is a better fit. Your swipes are tied to your account and
        are not shown to other users or sold to anyone.
      </Section>

      <Section title="Book Data">
        Book titles, authors, descriptions, and cover images come from publisher
        and book catalog providers. If something about a book looks wrong, let us
        know and we will get it corrected.
      </Section>

      <Section title="User Content">
        If you choose to submit content — such as a rating, review, or a book
        request — that content will be stored and may be displayed as part of the
        app’s community features. You control what content you choose to share.
      </Section>

      <Section title="Data Sharing">
        We do not sell your personal information. Data may be shared only with
        trusted service providers required to operate core functionality (such as
        authentication, hosting, and book catalog data), or when required by law.
      </Section>

      <Section title="Data Security">
        We use reasonable technical and organizational measures to protect your
        information. However, no method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </Section>

      <Section title="Your Choices">
        • Update or manage your account information
        {"\n"}• Clear your shelf or your swipe history at any time
        {"\n"}• Choose whether to submit ratings, reviews, or book requests
        {"\n"}• Request account or data deletion by contacting us
      </Section>

      <Section title="Children’s Privacy">
        Cover to Cover is not intended for children under the age of 13. We do
        not knowingly collect personal information from children.
      </Section>

      <Section title="Changes to This Policy">
        We may update this Privacy Policy from time to time. Continued use of
        Cover to Cover after changes are posted indicates acceptance of the
        updated policy.
      </Section>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.body}>
          Questions about this policy, or want your data deleted? Email{" "}
          <Text
            style={styles.email}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            {SUPPORT_EMAIL}
          </Text>
          .
        </Text>
      </View>

      <SiteFooter style={styles.footer} />
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
});
