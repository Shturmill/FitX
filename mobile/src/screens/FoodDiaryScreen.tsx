import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardContent,
  Progress,
  Button,
  Input,
  AutocompleteInput,
} from "../components/ui";
import { colors, gradients } from "../theme/colors";
import { useFoodContext } from "../contexts/FoodContext";
import { Product, storageUtils } from "../utils/storage";

interface MealSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: "breakfast" | "lunch" | "dinner" | "snack";
}

export function FoodDiaryScreen() {
  const {
    meals,
    addMeal,
    removeMeal,
    searchProducts,
    getTotalCalories,
    getTotalProtein,
    getTotalCarbs,
    getTotalFats,
    getCategoryCalories,
    getMealsByCategory,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    waterGlasses,
    incrementWater,
    decrementWater,
  } = useFoodContext();

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  // Form state
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // Weight and per-100g values state
  const [weight, setWeight] = useState("100");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDropdown, setShowDropdown] = useState(true);

  // Category-specific suggestions
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Load category-specific products when modal opens
  useEffect(() => {
    if (isAddingMeal) {
      loadCategoryProducts();
      setShowDropdown(true);
    }
  }, [isAddingMeal, selectedCategory]);

  // Recalculate nutritional values when weight changes
  useEffect(() => {
    if (selectedProduct) {
      const weightNum = parseFloat(weight) || 0;
      const multiplier = weightNum / 100;
      setCalories(Math.round(selectedProduct.calories * multiplier).toString());
      setProtein(Math.round(selectedProduct.protein * multiplier).toString());
      setCarbs(Math.round(selectedProduct.carbs * multiplier).toString());
      setFats(Math.round(selectedProduct.fats * multiplier).toString());
    }
  }, [weight, selectedProduct]);

  const loadCategoryProducts = async () => {
    const products = await storageUtils.getProductsByCategory(selectedCategory);
    setCategoryProducts(products);
  };

  const mealSections: MealSection[] = [
    {
      title: "Breakfast",
      icon: "cafe",
      category: "breakfast",
    },
    {
      title: "Lunch",
      icon: "sunny",
      category: "lunch",
    },
    {
      title: "Dinner",
      icon: "moon",
      category: "dinner",
    },
    {
      title: "Snacks",
      icon: "nutrition",
      category: "snack",
    },
  ];

  const totalCalories = getTotalCalories();
  const totalProtein = getTotalProtein();
  const totalCarbs = getTotalCarbs();
  const totalFats = getTotalFats();

  const handleOpenAddMeal = (
    category: "breakfast" | "lunch" | "dinner" | "snack",
  ) => {
    setSelectedCategory(category);
    setIsAddingMeal(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setMealName(product.name);
    setShowDropdown(false);
    // Initial values are calculated by the useEffect based on weight
    const weightNum = parseFloat(weight) || 100;
    const multiplier = weightNum / 100;
    setCalories(Math.round(product.calories * multiplier).toString());
    setProtein(Math.round(product.protein * multiplier).toString());
    setCarbs(Math.round(product.carbs * multiplier).toString());
    setFats(Math.round(product.fats * multiplier).toString());
  };

  const handleSelectCategoryProduct = (product: Product) => {
    handleSelectProduct(product);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setWeight("100");
    setShowDropdown(true);
  };

  const searchCategoryProducts = async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    const allProducts = await searchProducts(query);
    // Filter by category or return all
    return allProducts;
  };

  const handleAddMeal = async () => {
    if (!mealName.trim() || !calories.trim()) {
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    await addMeal({
      name: mealName,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0,
      time: timeString,
      category: selectedCategory,
    });

    // Reset form
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setWeight("100");
    setSelectedProduct(null);
    setShowDropdown(true);
    setIsAddingMeal(false);
  };

  const handleCancelAddMeal = () => {
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setWeight("100");
    setSelectedProduct(null);
    setShowDropdown(true);
    setIsAddingMeal(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Food Diary</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenAddMeal("breakfast")}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie Summary */}
      <Card gradient={gradients.primary} style={styles.section}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>Calories Today</Text>
            <View style={styles.summaryValues}>
              <Text style={styles.summaryMain}>{totalCalories}</Text>
              <Text style={styles.summaryGoal}>/ {calorieGoal}</Text>
            </View>
          </View>
          <Ionicons name="flame" size={48} color="rgba(255,255,255,0.8)" />
        </View>
        <Progress
          value={(totalCalories / calorieGoal) * 100}
          height={8}
          backgroundColor="rgba(255,255,255,0.2)"
          fillColor={colors.white}
        />
        <Text style={styles.remainingText}>
          {calorieGoal - totalCalories} calories remaining
        </Text>
      </Card>

      {/* Macros */}
      <Card style={styles.section}>
        <CardHeader>
          <Text style={styles.cardTitle}>Macronutrients</Text>
        </CardHeader>
        <CardContent>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroCircle,
                  { backgroundColor: colors.blue[500] },
                ]}
              >
                <Text style={styles.macroValue}>{totalProtein}g</Text>
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Progress
                value={(totalProtein / proteinGoal) * 100}
                height={4}
                style={styles.macroProgress}
              />
            </View>

            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroCircle,
                  { backgroundColor: colors.orange[500] },
                ]}
              >
                <Text style={styles.macroValue}>{totalCarbs}g</Text>
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Progress
                value={(totalCarbs / carbsGoal) * 100}
                height={4}
                style={styles.macroProgress}
              />
            </View>

            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroCircle,
                  { backgroundColor: colors.purple[500] },
                ]}
              >
                <Text style={styles.macroValue}>{totalFats}g</Text>
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
              <Progress
                value={(totalFats / fatsGoal) * 100}
                height={4}
                style={styles.macroProgress}
              />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Meals */}
      {mealSections.map((section, sectionIndex) => {
        const categoryMeals = getMealsByCategory(section.category);
        const categoryCalories = getCategoryCalories(section.category);

        return (
          <Card key={sectionIndex} style={styles.section}>
            <CardHeader>
              <View style={styles.mealHeaderRow}>
                <View style={styles.mealTitleRow}>
                  <Ionicons
                    name={section.icon}
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                <Text style={styles.mealCalories}>{categoryCalories} cal</Text>
              </View>
            </CardHeader>
            <CardContent>
              {categoryMeals.length === 0 ? (
                <View style={styles.emptyMeal}>
                  <Text style={styles.emptyText}>No meals logged yet</Text>
                  <TouchableOpacity
                    style={styles.addMealButton}
                    onPress={() => handleOpenAddMeal(section.category)}
                  >
                    <Ionicons name="add" size={16} color={colors.gray[600]} />
                    <Text style={styles.addMealText}>Add {section.title}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {categoryMeals.map((meal) => (
                    <TouchableOpacity key={meal.id} style={styles.mealItem}>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealTime}>{meal.time}</Text>
                        <View style={styles.mealMacros}>
                          <Text style={styles.mealMacroText}>
                            P: {meal.protein}g
                          </Text>
                          <Text style={styles.mealMacroText}>
                            C: {meal.carbs}g
                          </Text>
                          <Text style={styles.mealMacroText}>
                            F: {meal.fats}g
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mealRight}>
                        <Text style={styles.mealCalorieText}>
                          {meal.calories} cal
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeMeal(meal.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={colors.red[500]}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.addMoreButton}
                    onPress={() => handleOpenAddMeal(section.category)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={colors.primary[600]}
                    />
                    <Text style={styles.addMoreText}>Add more</Text>
                  </TouchableOpacity>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Water Intake */}
      <Card style={styles.lastSection}>
        <CardHeader>
          <View style={styles.waterHeaderRow}>
            <Text style={styles.cardTitle}>Water Intake</Text>
            <Text style={styles.waterInfo}>1 glass = 250ml</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.waterGrid}>
            {[...Array(8)].map((_, i) => {
              const isFilled = i < waterGlasses;
              const isNext = i === waterGlasses && waterGlasses < 8;
              const isLast = i === waterGlasses - 1 && waterGlasses > 0;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.waterGlassContainer,
                    isFilled && styles.waterGlassContainerFilled,
                    isLast && styles.waterGlassContainerLast,
                  ]}
                  onPress={
                    isNext
                      ? incrementWater
                      : isLast
                        ? decrementWater
                        : undefined
                  }
                  disabled={!isNext && !isLast}
                  activeOpacity={isNext || isLast ? 0.7 : 1}
                >
                  {isNext ? (
                    <View style={styles.waterGlassPlus}>
                      <Ionicons name="add" size={24} color={colors.blue[500]} />
                    </View>
                  ) : isLast ? (
                    <View style={styles.waterGlassContent}>
                      <Ionicons
                        name="water"
                        size={32}
                        color={colors.blue[500]}
                      />
                      <View style={styles.removeIcon}>
                        <Ionicons
                          name="close"
                          size={16}
                          color={colors.red[500]}
                        />
                      </View>
                    </View>
                  ) : (
                    <Ionicons
                      name={isFilled ? "water" : "water-outline"}
                      size={32}
                      color={isFilled ? colors.blue[500] : colors.gray[400]}
                    />
                  )}
                  <Text
                    style={[
                      styles.waterGlassLabel,
                      isFilled && styles.waterGlassLabelFilled,
                    ]}
                  >
                    {(i + 1) * 250}ml
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.waterText}>
            {waterGlasses} / 8 glasses ({waterGlasses * 250}ml / 2000ml)
          </Text>
        </CardContent>
      </Card>

      {/* Add Meal Modal */}
      <Modal visible={isAddingMeal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add{" "}
                {
                  mealSections.find((s) => s.category === selectedCategory)
                    ?.title
                }
              </Text>
              <TouchableOpacity onPress={handleCancelAddMeal}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Dropdown - shows immediately when modal opens */}
              {showDropdown && categoryProducts.length > 0 && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>
                    Select Product for{" "}
                    {
                      mealSections.find((s) => s.category === selectedCategory)
                        ?.title
                    }
                  </Text>
                  <Text style={styles.dropdownSubtitle}>
                    Values shown per 100g
                  </Text>
                  <View style={styles.dropdownList}>
                    {categoryProducts.map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectCategoryProduct(product)}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <Text style={styles.dropdownItemName}>
                            {product.name}
                          </Text>
                          <View style={styles.dropdownItemMacros}>
                            <Text style={styles.dropdownItemMacro}>
                              P: {product.protein}g
                            </Text>
                            <Text style={styles.dropdownItemMacro}>
                              C: {product.carbs}g
                            </Text>
                            <Text style={styles.dropdownItemMacro}>
                              F: {product.fats}g
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dropdownItemRight}>
                          <Text style={styles.dropdownItemCalories}>
                            {product.calories}
                          </Text>
                          <Text style={styles.dropdownItemCaloriesLabel}>
                            cal/100g
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Selected product info with weight input */}
              {selectedProduct && (
                <View style={styles.selectedProductContainer}>
                  <View style={styles.selectedProductHeader}>
                    <Text style={styles.selectedProductName}>
                      {selectedProduct.name}
                    </Text>
                    <TouchableOpacity onPress={handleClearSelection}>
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={colors.gray[400]}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.per100gInfo}>
                    <Text style={styles.per100gLabel}>Per 100g:</Text>
                    <Text style={styles.per100gValue}>
                      {selectedProduct.calories} cal | P: {selectedProduct.protein}g | C: {selectedProduct.carbs}g | F: {selectedProduct.fats}g
                    </Text>
                  </View>
                </View>
              )}

              {/* Search/Enter meal name - for new products or searching */}
              {!selectedProduct && (
                <AutocompleteInput
                  label="Or Search / Enter New Product"
                  placeholder="e.g., Grilled Chicken"
                  value={mealName}
                  onChangeText={(text) => {
                    setMealName(text);
                    if (text) setShowDropdown(false);
                    else setShowDropdown(true);
                  }}
                  onSelectProduct={handleSelectProduct}
                  onSearch={searchCategoryProducts}
                  containerStyle={styles.inputContainer}
                />
              )}

              {/* Weight input - always visible when product selected or entering new */}
              <Input
                label="Weight (g)"
                placeholder="100"
                keyboardType="numeric"
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  // If no selected product, don't auto-calculate
                  if (!selectedProduct) return;
                }}
                containerStyle={styles.weightInput}
              />

              {/* Calculated nutritional values */}
              <View style={styles.calculatedSection}>
                <Text style={styles.calculatedTitle}>
                  {selectedProduct ? "Calculated Values" : "Nutritional Values"}
                </Text>
                {selectedProduct && (
                  <Text style={styles.calculatedSubtitle}>
                    Based on {weight || 0}g
                  </Text>
                )}
              </View>

              <View style={styles.inputRow}>
                <Input
                  label="Calories"
                  placeholder="0"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                  containerStyle={styles.halfInput}
                  editable={!selectedProduct}
                />
                <Input
                  label="Protein (g)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                  containerStyle={styles.halfInput}
                  editable={!selectedProduct}
                />
              </View>

              <View style={styles.inputRow}>
                <Input
                  label="Carbs (g)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={carbs}
                  onChangeText={setCarbs}
                  containerStyle={styles.halfInput}
                  editable={!selectedProduct}
                />
                <Input
                  label="Fats (g)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={fats}
                  onChangeText={setFats}
                  containerStyle={styles.halfInput}
                  editable={!selectedProduct}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={handleCancelAddMeal}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button onPress={handleAddMeal} style={styles.addDiaryButton}>
                  Add to Diary
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    marginTop: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  summaryValues: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  summaryMain: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
  },
  summaryGoal: {
    fontSize: 18,
    color: "rgba(255,255,255,0.75)",
  },
  remainingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
  },
  macroProgress: {
    width: 60,
    marginTop: 8,
  },
  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealCalories: {
    fontSize: 14,
    color: colors.gray[600],
  },
  emptyMeal: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  addMealButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
  },
  addMealText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  mealTime: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  mealMacros: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  mealMacroText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  mealRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealCalorieText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  deleteButton: {
    padding: 4,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  addMoreText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "500",
  },
  waterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  waterInfo: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: "italic",
  },
  waterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  waterGlassContainer: {
    width: 70,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  waterGlassContainerFilled: {
    backgroundColor: colors.blue[50],
    borderColor: colors.blue[500],
  },
  waterGlassContainerLast: {
    borderColor: colors.red[400],
    borderWidth: 2,
  },
  waterGlassContent: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  removeIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.red[500],
  },
  waterGlassPlus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  waterGlassLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 4,
    fontWeight: "600",
  },
  waterGlassLabelFilled: {
    color: colors.blue[500],
  },
  waterText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[900],
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  addDiaryButton: {
    flex: 2,
  },
  recentProductsContainer: {
    marginBottom: 20,
  },
  recentProductsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 12,
  },
  recentProductCard: {
    width: 120,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  recentProductName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 6,
    height: 36,
  },
  recentProductCalories: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary[600],
    marginBottom: 8,
  },
  recentProductMacros: {
    gap: 4,
  },
  recentProductMacro: {
    fontSize: 11,
    color: colors.gray[600],
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 4,
  },
  dropdownSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 12,
  },
  dropdownList: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  dropdownItemLeft: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 4,
  },
  dropdownItemMacros: {
    flexDirection: "row",
    gap: 12,
  },
  dropdownItemMacro: {
    fontSize: 12,
    color: colors.gray[500],
  },
  dropdownItemRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  dropdownItemCalories: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary[600],
  },
  dropdownItemCaloriesLabel: {
    fontSize: 10,
    color: colors.gray[500],
  },
  // Selected product styles
  selectedProductContainer: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  selectedProductHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
  },
  per100gInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  per100gLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray[600],
    marginRight: 8,
  },
  per100gValue: {
    fontSize: 12,
    color: colors.gray[600],
  },
  // Weight input style
  weightInput: {
    marginBottom: 16,
  },
  // Calculated section styles
  calculatedSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calculatedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
  },
  calculatedSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: "italic",
  },
});
