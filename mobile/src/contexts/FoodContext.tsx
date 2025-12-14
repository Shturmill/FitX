import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storageUtils, Product, HealthMetrics } from "../utils/storage";
import { healthMetricsAPI } from "../utils/api";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
}

interface FoodContextType {
  meals: Meal[];
  products: Product[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  waterGlasses: number;
  waterGoal: number;
  healthMetrics: HealthMetrics;
  addMeal: (meal: Omit<Meal, "id">) => Promise<void>;
  removeMeal: (id: string) => void;
  searchProducts: (query: string) => Promise<Product[]>;
  getTotalCalories: () => number;
  getTotalProtein: () => number;
  getTotalCarbs: () => number;
  getTotalFats: () => number;
  getMealsByCategory: (category: string) => Meal[];
  getCategoryCalories: (category: string) => number;
  loadProductHistory: () => Promise<void>;
  reloadUserGoals: () => Promise<void>;
  incrementWater: () => Promise<void>;
  decrementWater: () => Promise<void>;
  updateHealthMetrics: (metrics: Partial<HealthMetrics>) => Promise<void>;
  clearMeals: () => void;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatsGoal, setFatsGoal] = useState(65);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const waterGoal = 8;
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    steps: 0,
    stepsGoal: 10000,
    heartRate: 0,
    sleepHours: 0,
    activeMinutes: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const [meals, setMeals] = useState<Meal[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  // Load product history, user goals, water intake, and health metrics on mount
  useEffect(() => {
    loadProductHistory();
    loadUserGoals();
    loadWaterIntake();
    loadHealthMetrics();
    syncHealthMetricsWithAPI();
  }, []);

  const loadWaterIntake = async () => {
    const waterIntake = await storageUtils.getWaterIntake();
    setWaterGlasses(waterIntake.glasses);
  };

  const handleIncrementWater = async () => {
    const newGlasses = await storageUtils.incrementWater();
    setWaterGlasses(newGlasses);
  };

  const handleDecrementWater = async () => {
    const newGlasses = await storageUtils.decrementWater();
    setWaterGlasses(newGlasses);
  };

  const loadHealthMetrics = async () => {
    const metrics = await storageUtils.getHealthMetrics();
    setHealthMetrics(metrics);
  };

  const handleUpdateHealthMetrics = async (metrics: Partial<HealthMetrics>) => {
    const updated = await storageUtils.saveHealthMetrics(metrics);
    setHealthMetrics(updated);
    
    // Try to sync with backend API
    try {
      await healthMetricsAPI.updateHealthMetrics(metrics);
    } catch (error) {
      console.warn("Failed to sync health metrics with backend:", error);
      // Continue anyway - local storage is still updated
    }
  };

  // Sync health metrics from backend API
  const syncHealthMetricsWithAPI = async () => {
    try {
      const isConnected = await healthMetricsAPI.testConnection();
      if (isConnected) {
        const apiMetrics = await healthMetricsAPI.getHealthMetrics();
        setHealthMetrics(apiMetrics);
        // Also save to local storage
        await storageUtils.saveHealthMetrics(apiMetrics);
        console.log("Synced health metrics from backend API");
      }
    } catch (error) {
      console.warn("Could not sync with backend API:", error);
      // Continue with local storage
    }
  };

  const clearMeals = () => {
    setMeals([]);
  };

  const loadUserGoals = async () => {
    const settings = await storageUtils.getUserSettings();
    if (settings) {
      setCalorieGoal(settings.calorieGoal);
      setProteinGoal(settings.proteinGoal);
      setCarbsGoal(settings.carbsGoal);
      setFatsGoal(settings.fatsGoal);
    }
  };

  const loadProductHistory = async () => {
    const history = await storageUtils.getProductHistory();
    setProducts(history);
  };

  const addMeal = async (meal: Omit<Meal, "id">) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
    };

    setMeals((prev) => [...prev, newMeal]);

    // Save product to history with category
    await storageUtils.saveProduct({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      category: meal.category,
    });

    // Reload product history
    await loadProductHistory();
  };

  const removeMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    return await storageUtils.searchProducts(query);
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  const getTotalProtein = () => {
    return meals.reduce((sum, meal) => sum + meal.protein, 0);
  };

  const getTotalCarbs = () => {
    return meals.reduce((sum, meal) => sum + meal.carbs, 0);
  };

  const getTotalFats = () => {
    return meals.reduce((sum, meal) => sum + meal.fats, 0);
  };

  const getMealsByCategory = (category: string) => {
    return meals.filter((meal) => meal.category === category);
  };

  const getCategoryCalories = (category: string) => {
    return getMealsByCategory(category).reduce(
      (sum, meal) => sum + meal.calories,
      0,
    );
  };

  return (
    <FoodContext.Provider
      value={{
        meals,
        products,
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatsGoal,
        waterGlasses,
        waterGoal,
        addMeal,
        removeMeal,
        searchProducts,
        getTotalCalories,
        getTotalProtein,
        getTotalCarbs,
        getTotalFats,
        getMealsByCategory,
        getCategoryCalories,
        loadProductHistory,
        reloadUserGoals: loadUserGoals,
        incrementWater: handleIncrementWater,
        decrementWater: handleDecrementWater,
        updateHealthMetrics: handleUpdateHealthMetrics,
        clearMeals,
        healthMetrics,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFoodContext must be used within a FoodProvider");
  }
  return context;
}
