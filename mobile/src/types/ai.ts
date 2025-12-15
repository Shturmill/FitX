// AI Assistant Types

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isLoading?: boolean;
  error?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose_weight" | "maintain" | "gain_weight" | "gain_muscle";
}

export interface NutritionData {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
  mealsLogged: number;
}

export interface HydrationData {
  waterGlasses: number;
  waterGoal: number;
}

export interface ActivityData {
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  heartRate: number;
  sleepHours: number;
}

export interface RecentWorkout {
  date: string;
  name: string;
  duration: number;
  exercisesCompleted: number;
}

export interface TrainingData {
  recentWorkouts: RecentWorkout[];
  totalWorkoutsThisMonth: number;
  activeDaysThisMonth: number;
}

export interface UserContext {
  profile?: UserProfile;
  nutrition?: NutritionData;
  hydration?: HydrationData;
  activity?: ActivityData;
  training?: TrainingData;
}

export interface AskAIRequest {
  question: string;
  userContext?: UserContext;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

export interface AskAIResponse {
  answer: string;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
