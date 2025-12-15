import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAI } from "../contexts/AIContext";
import { ChatMessage } from "../types/ai";

export function FullScreenChat() {
  const {
    messages,
    isLoading,
    isChatExpanded,
    error,
    sendMessage,
    collapseChat,
    clearConversation,
  } = useAI();

  const [inputValue, setInputValue] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isChatExpanded) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isChatExpanded]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      collapseChat();
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === "user";

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="sparkles" size={16} color={colors.primary[600]} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            message.error ? styles.errorBubble : undefined,
          ]}
        >
          {message.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={[styles.messageText, isUser && styles.userText]}>
              {message.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (!isChatExpanded) return null;

  return (
    <Modal
      visible={isChatExpanded}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              },
            ],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Ionicons name="chevron-down" size={28} color={colors.gray[700]} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Ionicons name="sparkles" size={20} color={colors.primary[600]} />
              <Text style={styles.headerText}>AI Fitness Coach</Text>
            </View>
            <TouchableOpacity
              onPress={clearConversation}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={colors.orange[500]} />
              <Text style={styles.errorText} numberOfLines={2}>
                {error}
              </Text>
            </View>
          )}

          {/* Messages */}
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map(renderMessage)}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask about workouts, nutrition, goals..."
                placeholderTextColor={colors.gray[400]}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleSend}
                multiline
                maxLength={500}
                editable={!isLoading}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (isLoading || !inputValue.trim()) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={
                      !inputValue.trim() ? colors.gray[400] : colors.white
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.orange[50],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.orange[200],
  },
  errorText: {
    fontSize: 13,
    color: colors.orange[500],
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  errorBubble: {
    borderColor: colors.orange[400],
    backgroundColor: colors.orange[50],
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray[800],
  },
  userText: {
    color: colors.white,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 100,
    color: colors.gray[900],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
});
