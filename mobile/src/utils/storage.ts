import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCT_HISTORY_KEY = "@fitx_product_history";
const WATER_INTAKE_KEY = "@fitx_water_intake";
const USER_SETTINGS_KEY = "@fitx_user_settings";
const AUTH_KEY = "@fitx_auth";
const HEALTH_METRICS_KEY = "@fitx_health_metrics";
const ACHIEVEMENTS_KEY = "@fitx_achievements";
const MEALS_KEY = "@fitx_meals";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  date: string; // YYYY-MM-DD to track which day the meal belongs to
}

export interface Product {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fats: number; // per 100g
  lastUsed: number; // timestamp
  useCount: number; // how many times used
  category?: "breakfast" | "lunch" | "dinner" | "snack"; // last used category
}

export interface UserSettings {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose_weight" | "maintain" | "gain_weight" | "gain_muscle";
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  completedOnboarding: boolean;
}

export interface WaterIntake {
  glasses: number; // number of 250ml glasses
  date: string; // YYYY-MM-DD
}

export interface AuthState {
  isLoggedIn: boolean;
  userId?: string;
}

export interface HealthMetrics {
  steps: number;
  stepsGoal: number;
  heartRate: number;
  sleepHours: number;
  activeMinutes: number;
  date: string; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  date?: string;
  category: "workout" | "nutrition" | "streak" | "milestone";
}

export const storageUtils = {
  // Load product history
  async getProductHistory(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(PRODUCT_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error("Error loading product history:", error);
      return [];
    }
  },

  // Save a product to history
  async saveProduct(
    product: Omit<Product, "id" | "lastUsed" | "useCount">,
  ): Promise<void> {
    try {
      const history = await this.getProductHistory();

      // Check if product already exists (by name)
      const existingIndex = history.findIndex(
        (p) => p.name.toLowerCase() === product.name.toLowerCase(),
      );

      if (existingIndex >= 0) {
        // Update existing product - update category to the most recent one used
        history[existingIndex] = {
          ...history[existingIndex],
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fats: product.fats,
          category: product.category || history[existingIndex].category,
          lastUsed: Date.now(),
          useCount: history[existingIndex].useCount + 1,
        };
      } else {
        // Add new product
        const newProduct: Product = {
          ...product,
          id: Date.now().toString(),
          lastUsed: Date.now(),
          useCount: 1,
        };
        history.unshift(newProduct);
      }

      // Keep only last 100 products
      const trimmedHistory = history.slice(0, 100);
      await AsyncStorage.setItem(
        PRODUCT_HISTORY_KEY,
        JSON.stringify(trimmedHistory),
      );
    } catch (error) {
      console.error("Error saving product:", error);
    }
  },

  // Search products by name
  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) return [];

    try {
      const history = await this.getProductHistory();
      const lowerQuery = query.toLowerCase();

      return history
        .filter((product) => product.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          // Sort by use count and recency
          if (b.useCount !== a.useCount) {
            return b.useCount - a.useCount;
          }
          return b.lastUsed - a.lastUsed;
        })
        .slice(0, 10); // Return top 10 matches
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  },

  // Clear all history (for testing/reset)
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PRODUCT_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  },

  // Get products by category (up to 20 for dropdown)
  async getProductsByCategory(
    category: "breakfast" | "lunch" | "dinner" | "snack",
  ): Promise<Product[]> {
    try {
      const history = await this.getProductHistory();
      return history
        .filter((product) => product.category === category)
        .sort((a, b) => {
          // Sort by use count first, then by recency
          if (b.useCount !== a.useCount) {
            return b.useCount - a.useCount;
          }
          return b.lastUsed - a.lastUsed;
        })
        .slice(0, 20);
    } catch (error) {
      console.error("Error getting products by category:", error);
      return [];
    }
  },

  // Water Intake Functions
  async getWaterIntake(): Promise<WaterIntake> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await AsyncStorage.getItem(WATER_INTAKE_KEY);
      if (data) {
        const waterIntake: WaterIntake = JSON.parse(data);
        // Reset if it's a new day
        if (waterIntake.date !== today) {
          return { glasses: 0, date: today };
        }
        return waterIntake;
      }
      return { glasses: 0, date: today };
    } catch (error) {
      console.error("Error loading water intake:", error);
      return { glasses: 0, date: new Date().toISOString().split("T")[0] };
    }
  },

  async saveWaterIntake(glasses: number): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const waterIntake: WaterIntake = { glasses, date: today };
      await AsyncStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(waterIntake));
    } catch (error) {
      console.error("Error saving water intake:", error);
    }
  },

  async incrementWater(): Promise<number> {
    try {
      const waterIntake = await this.getWaterIntake();
      const newGlasses = waterIntake.glasses + 1;
      await this.saveWaterIntake(newGlasses);
      return newGlasses;
    } catch (error) {
      console.error("Error incrementing water:", error);
      return 0;
    }
  },

  async decrementWater(): Promise<number> {
    try {
      const waterIntake = await this.getWaterIntake();
      const newGlasses = Math.max(0, waterIntake.glasses - 1);
      await this.saveWaterIntake(newGlasses);
      return newGlasses;
    } catch (error) {
      console.error("Error decrementing water:", error);
      return 0;
    }
  },

  // User Settings Functions
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const data = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Error loading user settings:", error);
      return null;
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  },

  // Auth Functions
  async getAuthState(): Promise<AuthState> {
    try {
      const data = await AsyncStorage.getItem(AUTH_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return { isLoggedIn: false };
    } catch (error) {
      console.error("Error loading auth state:", error);
      return { isLoggedIn: false };
    }
  },

  async saveAuthState(authState: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error("Error saving auth state:", error);
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_KEY, USER_SETTINGS_KEY]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  // Health Metrics Functions
  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await AsyncStorage.getItem(HEALTH_METRICS_KEY);
      if (data) {
        const metrics: HealthMetrics = JSON.parse(data);
        if (metrics.date !== today) {
          return { steps: 0, stepsGoal: 10000, heartRate: 0, sleepHours: 0, activeMinutes: 0, date: today };
        }
        return metrics;
      }
      return { steps: 0, stepsGoal: 10000, heartRate: 0, sleepHours: 0, activeMinutes: 0, date: today };
    } catch (error) {
      console.error("Error loading health metrics:", error);
      return { steps: 0, stepsGoal: 10000, heartRate: 0, sleepHours: 0, activeMinutes: 0, date: new Date().toISOString().split("T")[0] };
    }
  },

  async saveHealthMetrics(metrics: Partial<HealthMetrics>): Promise<HealthMetrics> {
    try {
      const current = await this.getHealthMetrics();
      const updated: HealthMetrics = {
        ...current,
        ...metrics,
        date: new Date().toISOString().split("T")[0],
      };
      await AsyncStorage.setItem(HEALTH_METRICS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error("Error saving health metrics:", error);
      throw error;
    }
  },

  // Default achievements definition
  getDefaultAchievements(): Achievement[] {
    return [
      {
        id: "first_calorie_goal",
        title: "First Calorie Goal",
        description: "Reach your daily calorie goal for the first time",
        icon: "🎯",
        unlocked: false,
        category: "nutrition",
      },
      {
        id: "calorie_champion",
        title: "Calorie Champion",
        description: "Reach your daily calorie goal 10 times",
        icon: "🏆",
        unlocked: false,
        progress: 0,
        total: 10,
        category: "nutrition",
      },
    ];
  },

  // Achievements Functions
  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (data) {
        const stored: Achievement[] = JSON.parse(data);
        // Merge with default achievements (in case new ones were added)
        const defaults = this.getDefaultAchievements();
        const mergedAchievements: Achievement[] = [];

        for (const defaultAch of defaults) {
          const existing = stored.find(a => a.id === defaultAch.id);
          if (existing) {
            mergedAchievements.push(existing);
          } else {
            mergedAchievements.push(defaultAch);
          }
        }

        return mergedAchievements;
      }
      // Return default achievements if none stored
      return this.getDefaultAchievements();
    } catch (error) {
      console.error("Error loading achievements:", error);
      return this.getDefaultAchievements();
    }
  },

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  },

  async unlockAchievement(id: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex(a => a.id === id);
      if (index >= 0) {
        achievements[index].unlocked = true;
        achievements[index].date = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        await this.saveAchievements(achievements);
      }
      return achievements;
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      return [];
    }
  },

  async updateAchievementProgress(id: string, progress: number): Promise<Achievement[]> {
    try {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex(a => a.id === id);
      if (index >= 0) {
        achievements[index].progress = progress;
        if (achievements[index].total && progress >= achievements[index].total) {
          achievements[index].unlocked = true;
          achievements[index].date = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
        await this.saveAchievements(achievements);
      }
      return achievements;
    } catch (error) {
      console.error("Error updating achievement progress:", error);
      return [];
    }
  },

  // Check and update calorie goal achievements
  async checkCalorieGoalAchievement(currentCalories: number, calorieGoal: number): Promise<{ unlocked: Achievement | null; updated: Achievement | null }> {
    const result: { unlocked: Achievement | null; updated: Achievement | null } = { unlocked: null, updated: null };

    // Only check if user reached or exceeded their calorie goal
    if (currentCalories < calorieGoal) {
      return result;
    }

    const today = new Date().toISOString().split("T")[0];
    const CALORIE_DAYS_KEY = "@fitx_calorie_goal_days";

    try {
      // Get the days when calorie goal was reached
      const daysData = await AsyncStorage.getItem(CALORIE_DAYS_KEY);
      const daysReached: string[] = daysData ? JSON.parse(daysData) : [];

      // Check if today was already counted
      if (daysReached.includes(today)) {
        return result;
      }

      // Add today to the list
      daysReached.push(today);
      await AsyncStorage.setItem(CALORIE_DAYS_KEY, JSON.stringify(daysReached));

      const achievements = await this.getAchievements();
      const totalDaysReached = daysReached.length;

      // Check "First Calorie Goal" achievement
      const firstGoalIndex = achievements.findIndex(a => a.id === "first_calorie_goal");
      if (firstGoalIndex >= 0 && !achievements[firstGoalIndex].unlocked) {
        achievements[firstGoalIndex].unlocked = true;
        achievements[firstGoalIndex].date = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        result.unlocked = achievements[firstGoalIndex];
      }

      // Update "Calorie Champion" progress
      const championIndex = achievements.findIndex(a => a.id === "calorie_champion");
      if (championIndex >= 0) {
        achievements[championIndex].progress = totalDaysReached;
        if (achievements[championIndex].total && totalDaysReached >= achievements[championIndex].total && !achievements[championIndex].unlocked) {
          achievements[championIndex].unlocked = true;
          achievements[championIndex].date = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          result.unlocked = achievements[championIndex];
        } else {
          result.updated = achievements[championIndex];
        }
      }

      await this.saveAchievements(achievements);
      return result;
    } catch (error) {
      console.error("Error checking calorie goal achievement:", error);
      return result;
    }
  },

  // Meals Functions
  async getMeals(): Promise<Meal[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await AsyncStorage.getItem(MEALS_KEY);
      if (data) {
        const meals: Meal[] = JSON.parse(data);
        // Return only today's meals
        return meals.filter(meal => meal.date === today);
      }
      return [];
    } catch (error) {
      console.error("Error loading meals:", error);
      return [];
    }
  },

  async saveMeals(meals: Meal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
    } catch (error) {
      console.error("Error saving meals:", error);
    }
  },

  async addMeal(meal: Omit<Meal, "id" | "date">): Promise<Meal> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const allMeals = await this.getAllMeals();

      const newMeal: Meal = {
        ...meal,
        id: Date.now().toString(),
        date: today,
      };

      allMeals.push(newMeal);
      await this.saveMeals(allMeals);
      return newMeal;
    } catch (error) {
      console.error("Error adding meal:", error);
      throw error;
    }
  },

  async removeMeal(id: string): Promise<void> {
    try {
      const allMeals = await this.getAllMeals();
      const filteredMeals = allMeals.filter(meal => meal.id !== id);
      await this.saveMeals(filteredMeals);
    } catch (error) {
      console.error("Error removing meal:", error);
    }
  },

  async getAllMeals(): Promise<Meal[]> {
    try {
      const data = await AsyncStorage.getItem(MEALS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error("Error loading all meals:", error);
      return [];
    }
  },

  async clearTodayMeals(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const allMeals = await this.getAllMeals();
      const filteredMeals = allMeals.filter(meal => meal.date !== today);
      await this.saveMeals(filteredMeals);
    } catch (error) {
      console.error("Error clearing today's meals:", error);
    }
  },
};
