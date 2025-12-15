import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ChatMessage, UserContext } from "../types/ai";
import { aiStorage } from "../utils/aiStorage";
import { aiApi } from "../utils/aiApi";
import { useAuth } from "./AuthContext";
import { useFoodContext } from "./FoodContext";
import { useTraining } from "./TrainingContext";

interface AIContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isChatExpanded: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  expandChat: () => void;
  collapseChat: () => void;
  clearConversation: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI fitness coach. I can help you with workout plans, nutrition advice, and reaching your fitness goals. How can I help you today?",
  timestamp: Date.now(),
};

export function AIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userSettings } = useAuth();
  const {
    getTotalCalories,
    getTotalProtein,
    getTotalCarbs,
    getTotalFats,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    waterGlasses,
    waterGoal,
    healthMetrics,
    meals,
  } = useFoodContext();
  const { history } = useTraining();

  // Load conversation from storage on mount
  useEffect(() => {
    loadConversation();
  }, []);

  const loadConversation = async () => {
    const conversation = await aiStorage.getConversation();
    if (conversation && conversation.messages.length > 0) {
      setMessages(conversation.messages);
    }
  };

  // Build user context from all available data
  const buildUserContext = useCallback((): UserContext | undefined => {
    if (!userSettings) return undefined;

    // Calculate monthly stats from workout history
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyWorkouts = history.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getMonth() === currentMonth &&
        workoutDate.getFullYear() === currentYear
      );
    });

    const uniqueDays = new Set(monthlyWorkouts.map((w) => w.date));

    return {
      profile: {
        name: userSettings.name,
        age: userSettings.age,
        gender: userSettings.gender,
        weight: userSettings.weight,
        height: userSettings.height,
        activityLevel: userSettings.activityLevel,
        goal: userSettings.goal,
      },
      nutrition: {
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatsGoal,
        todayCalories: getTotalCalories(),
        todayProtein: getTotalProtein(),
        todayCarbs: getTotalCarbs(),
        todayFats: getTotalFats(),
        mealsLogged: meals.length,
      },
      hydration: {
        waterGlasses,
        waterGoal,
      },
      activity: {
        steps: healthMetrics.steps,
        stepsGoal: healthMetrics.stepsGoal,
        activeMinutes: healthMetrics.activeMinutes,
        heartRate: healthMetrics.heartRate,
        sleepHours: healthMetrics.sleepHours,
      },
      training: {
        recentWorkouts: history.slice(0, 5).map((w) => ({
          date: w.date,
          name: w.programName,
          duration: w.duration,
          exercisesCompleted: w.exercisesCompleted,
        })),
        totalWorkoutsThisMonth: monthlyWorkouts.length,
        activeDaysThisMonth: uniqueDays.size,
      },
    };
  }, [
    userSettings,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    getTotalCalories,
    getTotalProtein,
    getTotalCarbs,
    getTotalFats,
    waterGlasses,
    waterGoal,
    healthMetrics,
    meals,
    history,
  ]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add placeholder for assistant response
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isLoading: true,
    };

    const newMessages = [...messages, userMessage, loadingMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const userContext = buildUserContext();
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome" && !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await aiApi.askAI(
        content,
        userContext,
        conversationHistory
      );

      // Update with actual response
      const assistantMessage: ChatMessage = {
        id: loadingMessage.id,
        role: "assistant",
        content: response.answer,
        timestamp: Date.now(),
        isLoading: false,
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);

      // Save to storage
      await aiStorage.saveConversation({
        id: "main",
        messages: finalMessages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to get response. Please try again.";
      setError(errorMessage);

      // Update loading message with error
      const errorResponse: ChatMessage = {
        id: loadingMessage.id,
        role: "assistant",
        content:
          "I apologize, but I encountered an issue. Please try again in a moment.",
        timestamp: Date.now(),
        isLoading: false,
        error: errorMessage,
      };

      const finalMessages = [...messages, userMessage, errorResponse];
      setMessages(finalMessages);

      // Still save to storage so error messages are preserved
      await aiStorage.saveConversation({
        id: "main",
        messages: finalMessages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const expandChat = () => setIsChatExpanded(true);
  const collapseChat = () => setIsChatExpanded(false);

  const clearConversation = async () => {
    await aiStorage.clearConversation();
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  return (
    <AIContext.Provider
      value={{
        messages,
        isLoading,
        isChatExpanded,
        error,
        sendMessage,
        expandChat,
        collapseChat,
        clearConversation,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
