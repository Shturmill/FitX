import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCT_HISTORY_KEY = "@fitx_product_history";

export interface Product {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  lastUsed: number; // timestamp
  useCount: number; // how many times used
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
        // Update existing product
        history[existingIndex] = {
          ...history[existingIndex],
          ...product,
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
};
