import React, { useState } from "react";
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
import { Product } from "../utils/storage";

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
  const calorieGoal = 2000;
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
    setMealName(product.name);
    setCalories(product.calories.toString());
    setProtein(product.protein.toString());
    setCarbs(product.carbs.toString());
    setFats(product.fats.toString());
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
    setIsAddingMeal(false);
  };

  const handleCancelAddMeal = () => {
    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
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
              <Progress value={75} height={4} style={styles.macroProgress} />
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
              <Progress value={60} height={4} style={styles.macroProgress} />
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
              <Progress value={65} height={4} style={styles.macroProgress} />
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
      <Card style={[styles.section, styles.lastSection]}>
        <CardHeader>
          <Text style={styles.cardTitle}>Water Intake</Text>
        </CardHeader>
        <CardContent>
          <View style={styles.waterGrid}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waterGlass,
                  i < 6 ? styles.waterFilled : styles.waterEmpty,
                ]}
              />
            ))}
          </View>
          <Text style={styles.waterText}>6 / 8 glasses</Text>
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
              <AutocompleteInput
                label="Search or Enter Meal Name"
                placeholder="e.g., Grilled Chicken"
                value={mealName}
                onChangeText={setMealName}
                onSelectProduct={handleSelectProduct}
                onSearch={searchProducts}
                containerStyle={styles.inputContainer}
              />

              <View style={styles.inputRow}>
                <Input
                  label="Calories"
                  placeholder="0"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="Protein (g)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                  containerStyle={styles.halfInput}
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
                />
                <Input
                  label="Fats (g)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={fats}
                  onChangeText={setFats}
                  containerStyle={styles.halfInput}
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
  waterGrid: {
    flexDirection: "row",
    gap: 8,
  },
  waterGlass: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
  waterFilled: {
    backgroundColor: colors.blue[400],
  },
  waterEmpty: {
    backgroundColor: colors.gray[200],
  },
  waterText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 12,
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
});
