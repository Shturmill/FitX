import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { storageUtils, Product, HealthMetrics } from "../utils/storage";
import { healthApi, HealthMetricsResponse } from "../utils/healthApi";

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
  isLoadingHealthMetrics: boolean;
  addMeal: (meal: Omit<Meal, "id" | "date">) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  getTotalCalories: () => number;
  getTotalProtein: () => number;
  getTotalCarbs: () => number;
  getTotalFats: () => number;
  getMealsByCategory: (category: string) => Meal[];
  getCategoryCalories: (category: string) => number;
  loadProductHistory: () => Promise<void>;
  reloadUserGoals: () => Promise<void>;
  reloadMeals: () => Promise<void>;
  incrementWater: () => Promise<void>;
  decrementWater: () => Promise<void>;
  updateHealthMetrics: (metrics: Partial<HealthMetrics>) => Promise<void>;
  syncHealthMetricsFromBackend: () => Promise<void>;
  clearMeals: () => Promise<void>;
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
  const [isLoadingHealthMetrics, setIsLoadingHealthMetrics] = useState(false);

  // Load product history, user goals, water intake, health metrics, and meals on mount
  useEffect(() => {
    loadProductHistory();
    loadUserGoals();
    loadWaterIntake();
    loadHealthMetrics();
    loadMealsFromStorage();
    
    // Sync health metrics from backend immediately and then every 30 seconds
    syncHealthMetricsFromBackend();
    const intervalId = setInterval(() => {
      syncHealthMetricsFromBackend();
    }, 30000); // Sync every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
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

  const loadMealsFromStorage = async () => {
    try {
      const todayMeals = await storageUtils.getMeals();
      console.log("[FoodContext] Loaded meals from storage:", todayMeals);
      setMeals(todayMeals);
    } catch (error) {
      console.error("[FoodContext] Error loading meals from storage:", error);
    }
  };

  /**
   * Sync health metrics from backend (port 8000)
   */
  const syncHealthMetricsFromBackend = useCallback(async () => {
    setIsLoadingHealthMetrics(true);
    try {
      const backendMetrics = await healthApi.getHealthMetrics();
      
      if (backendMetrics) {
        console.log("[FoodContext] Synced metrics from backend:", backendMetrics);
        
        // Update local state with backend values
        const updatedMetrics: HealthMetrics = {
          steps: backendMetrics.steps,
          stepsGoal: backendMetrics.stepsGoal,
          heartRate: backendMetrics.heartRate,
          sleepHours: backendMetrics.sleepHours,
          activeMinutes: backendMetrics.activeMinutes,
          date: new Date().toISOString().split("T")[0],
        };
        
        setHealthMetrics(updatedMetrics);
        
        // Also save to local storage for persistence
        await storageUtils.saveHealthMetrics(updatedMetrics);
      } else {
        console.warn("[FoodContext] Failed to sync health metrics from backend");
      }
    } catch (error) {
      console.error("[FoodContext] Error syncing health metrics:", error);
    } finally {
      setIsLoadingHealthMetrics(false);
    }
  }, []);

  const handleUpdateHealthMetrics = async (metrics: Partial<HealthMetrics>) => {
    const updated = await storageUtils.saveHealthMetrics(metrics);
    setHealthMetrics(updated);
    
    // Also sync with backend
    const { date, ...backendUpdate } = updated;
    const backendResult = await healthApi.updateHealthMetrics(backendUpdate);
    
    if (backendResult) {
      console.log("[FoodContext] Updated metrics on backend:", backendResult);
    }
  };

  const clearMeals = async () => {
    await storageUtils.clearTodayMeals();
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

  const addMeal = async (meal: Omit<Meal, "id" | "date">) => {
    try {
      // Save meal to storage and get the saved meal with id and date
      const newMeal = await storageUtils.addMeal(meal);
      console.log("[FoodContext] Added meal:", newMeal);
      
      // Update local state with the new meal
      const updatedMeals = [...meals, newMeal];
      setMeals(updatedMeals);

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

      // Check calorie goal achievement
      const totalCaloriesAfterMeal = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
      await storageUtils.checkCalorieGoalAchievement(totalCaloriesAfterMeal, calorieGoal);
    } catch (error) {
      console.error("[FoodContext] Error adding meal:", error);
      throw error;
    }
  };

  const removeMeal = async (id: string) => {
    try {
      await storageUtils.removeMeal(id);
      console.log("[FoodContext] Removed meal with id:", id);
      
      // Update local state
      setMeals((prev) => prev.filter((meal) => meal.id !== id));
    } catch (error) {
      console.error("[FoodContext] Error removing meal:", error);
      throw error;
    }
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
        healthMetrics,
        isLoadingHealthMetrics,
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
        reloadMeals: loadMealsFromStorage,
        incrementWater: handleIncrementWater,
        decrementWater: handleDecrementWater,
        updateHealthMetrics: handleUpdateHealthMetrics,
        syncHealthMetricsFromBackend,
        clearMeals,
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
