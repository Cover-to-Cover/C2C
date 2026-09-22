// app/about.tsx
import { SiteFooter } from "@/components/site-footer";
import { LOGO } from "@/constants/brand";
import { router } from "expo-router";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#022831";
const ACCENT = "#08c7f7";
const CARD = "rgba(0,0,0,0.35)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.75)";

export default function AboutPage() {
    const { width } = useWindowDimensions();
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
                                        width: width * 0.7,
                                        maxWidth: 480,
                                        height: 140,
                                        marginBottom: 12,
                                    }}
                                    resizeMode="contain"
                                />
                            </Pressable>

                            <Text style={styles.title}>About Cover to Cover</Text>
                            <Text style={styles.subtitle}>
                                Swipe through book covers and match with your next read.
                            </Text>
                        </View>

                        {/* Everything lives in one card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Our Mission</Text>

                            <Text style={styles.cardText}>
                                Cover to Cover is a book discovery app that works the way Tinder
                                and Bumble do, except here the whole point is to judge freely.
                                Covers come at you one at a time. Swipe right on the ones that
                                pull you in, swipe left on the ones that don’t, and match with
                                your next read.
                            </Text>
                            <Text style={styles.cardText}>
                                Every book has to sell itself in a single image, so trust your
                                gut. No bestseller lists, no algorithmic ranking, no wall of
                                reviews to wade through before you can decide. Just the cover,
                                the same way you would find a book by wandering a bookstore and
                                pulling one off the shelf because it looked good.
                            </Text>
                            <Text style={styles.cardText}>
                                Like what you see? Tap through for the title, author, and blurb,
                                then save it to your shelf for later. The more you swipe, the
                                better we get at knowing the kind of cover that stops you.
                            </Text>

                            <Text style={styles.sectionHeading}>How It Works</Text>
                            <View style={styles.bullets}>
                                <Text style={styles.bullet}>
                                    <Text style={styles.bulletAccent}>• </Text>
                                    <Text style={styles.bulletText}>
                                        Swipe right on covers you like, left on the ones you don’t.
                                    </Text>
                                </Text>
                                <Text style={styles.bullet}>
                                    <Text style={styles.bulletAccent}>• </Text>
                                    <Text style={styles.bulletText}>
                                        Match to reveal the title, author, and description.
                                    </Text>
                                </Text>
                                <Text style={styles.bullet}>
                                    <Text style={styles.bulletAccent}>• </Text>
                                    <Text style={styles.bulletText}>
                                        Save matches to your shelf and build a reading list you
                                        actually want to get to.
                                    </Text>
                                </Text>
                                <Text style={styles.bullet}>
                                    <Text style={styles.bulletAccent}>• </Text>
                                    <Text style={styles.bulletText}>
                                        Get recommendations that learn from your taste in covers,
                                        not from a chart.
                                    </Text>
                                </Text>
                            </View>

                            <Text style={[styles.cardText, { marginTop: 16 }]}>
                                Spot a book with wrong details, or want one added? The fastest
                                way to help is to send it through the Support page.
                            </Text>
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
    sectionHeading: {
        color: TEXT,
        fontSize: 16,
        fontWeight: "800",
        marginTop: 20,
    },
    cardText: {
        color: MUTED,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6,
    },

    bullets: {
        marginTop: 6,
    },
    bullet: {
        marginTop: 8,
    },
    bulletAccent: {
        color: ACCENT,
        fontWeight: "900",
    },
    bulletText: {
        color: MUTED,
        fontSize: 14,
        lineHeight: 20,
    },

    footer: {
        marginTop: 32,
    },
});
