import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCT_HISTORY_KEY = "@fitx_product_history";
const WATER_INTAKE_KEY = "@fitx_water_intake";
const USER_SETTINGS_KEY = "@fitx_user_settings";
const AUTH_KEY = "@fitx_auth";

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
};
