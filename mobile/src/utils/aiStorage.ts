import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMessage, Conversation } from "../types/ai";

const CONVERSATION_KEY = "@fitx_ai_conversation";
const MAX_MESSAGES = 100;

export const aiStorage = {
  async getConversation(): Promise<Conversation | null> {
    try {
      const data = await AsyncStorage.getItem(CONVERSATION_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Error loading AI conversation:", error);
      return null;
    }
  },

  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const trimmedConversation: Conversation = {
        ...conversation,
        messages: conversation.messages.slice(-MAX_MESSAGES),
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(
        CONVERSATION_KEY,
        JSON.stringify(trimmedConversation)
      );
    } catch (error) {
      console.error("Error saving AI conversation:", error);
    }
  },

  async addMessage(message: ChatMessage): Promise<Conversation> {
    const existing = await this.getConversation();
    const conversation: Conversation = existing || {
      id: Date.now().toString(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    conversation.messages.push(message);
    await this.saveConversation(conversation);
    return conversation;
  },

  async clearConversation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONVERSATION_KEY);
    } catch (error) {
      console.error("Error clearing AI conversation:", error);
    }
  },

  async updateLastMessage(
    content: string,
    error?: string
  ): Promise<Conversation | null> {
    const conversation = await this.getConversation();
    if (conversation && conversation.messages.length > 0) {
      const lastIndex = conversation.messages.length - 1;
      conversation.messages[lastIndex] = {
        ...conversation.messages[lastIndex],
        content,
        error,
        isLoading: false,
      };
      await this.saveConversation(conversation);
      return conversation;
    }
    return null;
  },
};
