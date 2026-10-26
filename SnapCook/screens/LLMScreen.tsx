import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { GoogleGenAI, Chat } from "@google/genai";
import { friendlyError } from "../utils/friendlyError";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const COLORS = {
  primary: "#4CAF50",
  light: "#F5F5F5",
};

const SYSTEM_INSTRUCTION =
  "You are a friendly, expert AI Chef and nutritionist. Your goal is to provide helpful, healthy, and creative cooking advice, recipe ideas, and nutrition facts. Keep your answers concise but informative.";

type Message = { id: string; text: string; sender: "user" | "ai" };

export default function LLMScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you with your healthy cooking today? 🧑‍🍳",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    const newChat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    chatRef.current = newChat;

    return () => {
      chatRef.current = null;
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: userMessage, sender: "user" },
    ]);
    setInput("");
    setIsLoading(true);

    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }

    try {
      if (!chatRef.current) {
        throw new Error("Chat session not initialized.");
      }

      const response = await chatRef.current.sendMessage({
        message: userMessage,
      });

      const aiText = response.text || "Sorry, I didn't get a reply. Please try again.";
      const aiMessageId = userMessageId + "_ai";

      setMessages((prev) => {
        return [...prev, { id: aiMessageId, text: aiText, sender: "ai" }];
      });
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          text: friendlyError(error, "The AI chef"),
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" && styles.userMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ref={flatListRef}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chef AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={
              isLoading ? "Waiting for response..." : "Ask your AI Chef..."
            }
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <Button
            title="Send"
            onPress={handleSend}
            color={COLORS.primary}
            disabled={isLoading || !input.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  flex: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  message: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  aiMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
});
