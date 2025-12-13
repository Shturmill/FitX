import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storageUtils, Product } from "../utils/storage";

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
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatsGoal, setFatsGoal] = useState(65);

  const [meals, setMeals] = useState<Meal[]>([
    // Default sample data
    {
      id: "1",
      name: "Oatmeal with Berries",
      calories: 320,
      protein: 12,
      carbs: 54,
      fats: 6,
      time: "8:30 AM",
      category: "breakfast",
    },
    {
      id: "2",
      name: "Greek Yogurt",
      calories: 200,
      protein: 20,
      carbs: 15,
      fats: 8,
      time: "8:45 AM",
      category: "breakfast",
    },
    {
      id: "3",
      name: "Grilled Chicken Salad",
      calories: 450,
      protein: 42,
      carbs: 25,
      fats: 18,
      time: "1:00 PM",
      category: "lunch",
    },
    {
      id: "4",
      name: "Apple",
      calories: 95,
      protein: 0,
      carbs: 25,
      fats: 0,
      time: "1:30 PM",
      category: "lunch",
    },
    {
      id: "5",
      name: "Protein Shake",
      calories: 135,
      protein: 25,
      carbs: 8,
      fats: 2,
      time: "2:00 PM",
      category: "lunch",
    },
    {
      id: "6",
      name: "Almonds",
      calories: 180,
      protein: 6,
      carbs: 6,
      fats: 15,
      time: "4:00 PM",
      category: "snack",
    },
  ]);

  const [products, setProducts] = useState<Product[]>([]);

  // Load product history and user goals on mount
  useEffect(() => {
    loadProductHistory();
    loadUserGoals();
  }, []);

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
