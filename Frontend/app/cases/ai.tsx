import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

/* =====================
   TYPES
===================== */
type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
};

export default function CaseAIScreen() {
  const router = useRouter();
  const { client, title } = useLocalSearchParams<{
    client?: string;
    title?: string;
  }>();

  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text:
        "Hi 👋 I’m your AI legal assistant. Ask me anything about this case.",
    },
  ]);

  /* =====================
     HANDLERS
  ===================== */

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/cases");
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: input,
    };

    const aiReply: Message = {
      id: Date.now() + 1,
      role: "ai",
      text:
        "Based on the case details, this issue requires careful preparation before the next hearing. I recommend reviewing documents and aligning arguments.",
    };

    setMessages((prev) => [...prev, userMessage, aiReply]);
    setInput("");
  };

  /* =====================
     UI
  ===================== */

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
          <Text style={styles.backText}>All Cases</Text>
        </Pressable>

        <Text style={styles.headerTitle}>AI Case Analysis</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* CASE INFO */}
        <View style={styles.caseCard}>
          <Text style={styles.caseTitle}>{title}</Text>
          <Text style={styles.caseClient}>
            Client: <Text style={styles.bold}>{client}</Text>
          </Text>
        </View>

        {/* STATIC AI SECTIONS */}
        {!showChat && (
          <>
            <Section title="AI Summary" icon="sparkles-outline">
              This AI summary explains the background, risks, and legal
              posture of the case in a concise and actionable way.
            </Section>

            <Section title="Risk Assessment" icon="warning-outline">
              • Possible adjournments{"\n"}
              • Evidence dependency{"\n"}
              • Financial exposure
            </Section>

            <Section
              title="Recommended Actions"
              icon="checkmark-done-outline"
            >
              • Prepare written submissions{"\n"}
              • Review missing documents{"\n"}
              • Align strategy with client
            </Section>

            {/* CTA */}
            <Pressable
              style={styles.askBtn}
              onPress={() => setShowChat(true)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.askText}>Ask AI a Question</Text>
            </Pressable>
          </>
        )}

        {/* CHATBOT */}
        {showChat && (
          <View style={styles.chatBox}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.message,
                  msg.role === "user"
                    ? styles.userMsg
                    : styles.aiMsg,
                ]}
              >
                <Text style={styles.msgText}>{msg.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* INPUT */}
      {showChat && (
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask something about this case…"
            style={styles.input}
          />
          <Pressable onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

/* =====================
   REUSABLE SECTION
===================== */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color="#4F46E5" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.text}>{children}</Text>
      </View>
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  backText: { fontSize: 14, fontWeight: "600" },
  headerTitle: { fontSize: 22, fontWeight: "800" },

  content: { padding: 16, paddingBottom: 100 },

  caseCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  caseTitle: { fontSize: 16, fontWeight: "700" },
  caseClient: { fontSize: 13, marginTop: 4 },
  bold: { fontWeight: "700" },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  text: { fontSize: 14, lineHeight: 22 },

  askBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  askText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  chatBox: { gap: 10 },
  message: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 14,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5",
  },
  aiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  msgText: {
    color: "#020617",
  },

  inputBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 12,
  },
});
