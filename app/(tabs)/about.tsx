// app/about.tsx
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
                                source={require("../../assets/images/halalfinders_logo.png")}
                                style={{
                                    width: width * 0.7,
                                    maxWidth: 480,
                                    height: 140,
                                    marginBottom: 12,
                                }}
                                resizeMode="contain"
                            />
                        </Pressable>

                        <Text style={styles.title}>About HalalFinders</Text>
                        <Text style={styles.subtitle}>
                            Helping Muslims find halal spots and places to pray—anywhere.
                        </Text>
                    </View>

                    {/* Mission */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Our Mission</Text>
                        <Text style={styles.cardText}>
                            HalalFinders exists to make it easier to live your deen on the go.
                            Whether you’re traveling, new to an area, or just exploring your
                            own city, the goal is simple: find halal food, find masajid, and
                            feel confident about it.
                        </Text>
                        <Text style={styles.cardText}>
                            We focus on clarity and trust—showing you nearby options,
                            highlighting what’s verified, and making it easy for the community
                            to contribute.
                        </Text>
                    </View>

                    {/* Why */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Why I Built It</Text>
                        <Text style={styles.cardText}>
                            I wanted something fast and practical—an app you can open, search,
                            and immediately know where to go. No digging through dozens of
                            reviews or guessing what “halal-ish” means.
                        </Text>
                        <Text style={styles.cardText}>
                            The vision is a community-powered map where people can help each
                            other by verifying places and keeping info fresh.
                        </Text>
                    </View>

                    {/* About you */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>About the Developer</Text>
                        <Text style={styles.cardText}>
                            My name is Alex, and I’m the developer and owner of HalalFinders.
                            I’ve been a revert for over 6 years and I practice Islam.
                        </Text>
                        <Text style={styles.cardText}>
                            I’m building HalalFinders with a lot of care because I’m solving a
                            problem I personally deal with: finding trustworthy halal options
                            and nearby places to pray—especially when traveling or in
                            unfamiliar areas.
                        </Text>
                    </View>

                    {/* Values / What to expect */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>What You Can Expect</Text>

                        <View style={styles.bullets}>
                            <Text style={styles.bullet}>
                                <Text style={styles.bulletAccent}>• </Text>
                                <Text style={styles.bulletText}>
                                    Simple and fast discovery (food + masajid).
                                </Text>
                            </Text>
                            <Text style={styles.bullet}>
                                <Text style={styles.bulletAccent}>• </Text>
                                <Text style={styles.bulletText}>
                                    Community-driven verification to improve trust.
                                </Text>
                            </Text>
                            <Text style={styles.bullet}>
                                <Text style={styles.bulletAccent}>• </Text>
                                <Text style={styles.bulletText}>
                                    Continuous updates as the app grows.
                                </Text>
                            </Text>
                        </View>

                        <Text style={[styles.cardText, { marginTop: 12 }]}>
                            If you spot incorrect info or want a place added, the best way to
                            help is to share feedback through the Support page.
                        </Text>
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

    // ✅ bigger logo
    logo: {
        width: 360,
        height: 110,
        marginBottom: 6,
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
        padding: 16,
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

    buttonPrimaryWide: {
        backgroundColor: ACCENT,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginTop: 12,
        alignItems: "center",
    },
    buttonPrimaryText: {
        color: "#001018",
        fontWeight: "800",
    },

    footerCard: {
        backgroundColor: "rgba(8,199,247,0.10)",
        borderColor: "rgba(8,199,247,0.45)",
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    footerTitle: {
        color: TEXT,
        fontSize: 16,
        fontWeight: "900",
    },
    footerText: {
        color: MUTED,
        fontSize: 14,
        marginTop: 6,
        lineHeight: 20,
    },
});
