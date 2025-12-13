import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients } from "../theme/colors";
import { UserSettings } from "../utils/storage";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: UserSettings) => Promise<void>;
  currentSettings: UserSettings;
}

export function EditProfileModal({
  visible,
  onClose,
  onSave,
  currentSettings,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "goals">("basic");

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "active" | "very_active"
  >("moderate");
  const [goal, setGoal] = useState<
    "lose_weight" | "maintain" | "gain_weight" | "gain_muscle"
  >("maintain");

  // Initialize form with current settings
  useEffect(() => {
    if (currentSettings) {
      setName(currentSettings.name);
      setAge(currentSettings.age.toString());
      setWeight(currentSettings.weight.toString());
      setHeight(currentSettings.height.toString());
      setGender(currentSettings.gender);
      setActivityLevel(currentSettings.activityLevel);
      setGoal(currentSettings.goal);
    }
  }, [currentSettings, visible]);

  const calculateCalorieGoal = (): {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } => {
    const w = parseFloat(weight) || currentSettings.weight;
    const h = parseFloat(height) || currentSettings.height;
    const a = parseInt(age) || currentSettings.age;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let tdee = bmr * activityMultipliers[activityLevel];

    // Adjust based on goal
    const goalAdjustments = {
      lose_weight: -500,
      maintain: 0,
      gain_weight: 300,
      gain_muscle: 500,
    };
    const calories = Math.round(tdee + goalAdjustments[goal]);

    // Calculate macros
    let proteinGrams: number;
    let fatsGrams: number;
    let carbsGrams: number;

    if (goal === "gain_muscle") {
      proteinGrams = Math.round(w * 2.2);
      fatsGrams = Math.round((calories * 0.25) / 9);
      carbsGrams = Math.round(
        (calories - proteinGrams * 4 - fatsGrams * 9) / 4,
      );
    } else if (goal === "lose_weight") {
      proteinGrams = Math.round(w * 2.0);
      fatsGrams = Math.round((calories * 0.25) / 9);
      carbsGrams = Math.round(
        (calories - proteinGrams * 4 - fatsGrams * 9) / 4,
      );
    } else {
      proteinGrams = Math.round(w * 1.6);
      fatsGrams = Math.round((calories * 0.3) / 9);
      carbsGrams = Math.round(
        (calories - proteinGrams * 4 - fatsGrams * 9) / 4,
      );
    }

    return {
      calories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fats: fatsGrams,
    };
  };

  const handleSave = async () => {
    if (!name.trim() || !age || !weight || !height) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const goals = calculateCalorieGoal();

      const updatedSettings: UserSettings = {
        name: name.trim(),
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        gender,
        activityLevel,
        goal,
        calorieGoal: goals.calories,
        proteinGoal: goals.protein,
        carbsGoal: goals.carbs,
        fatsGoal: goals.fats,
        completedOnboarding: true,
      };

      await onSave(updatedSettings);
      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to current settings
    setName(currentSettings.name);
    setAge(currentSettings.age.toString());
    setWeight(currentSettings.weight.toString());
    setHeight(currentSettings.height.toString());
    setGender(currentSettings.gender);
    setActivityLevel(currentSettings.activityLevel);
    setGoal(currentSettings.goal);
    onClose();
  };

  const renderBasicInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "male" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("male")}
            >
              <Ionicons
                name="male"
                size={20}
                color={gender === "male" ? colors.white : colors.gray[600]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "female" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("female")}
            >
              <Ionicons
                name="female"
                size={20}
                color={gender === "female" ? colors.white : colors.gray[600]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle"
          size={20}
          color={colors.blue[500]}
        />
        <Text style={styles.infoText}>
          Updating your measurements will recalculate your daily calorie and
          macro goals.
        </Text>
      </View>
    </View>
  );

  const renderGoals = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.verticalOptions}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              activityLevel === "sedentary" && styles.optionCardActive,
            ]}
            onPress={() => setActivityLevel("sedentary")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  activityLevel === "sedentary" && styles.optionTitleActive,
                ]}
              >
                Sedentary
              </Text>
              {activityLevel === "sedentary" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Little or no exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              activityLevel === "light" && styles.optionCardActive,
            ]}
            onPress={() => setActivityLevel("light")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  activityLevel === "light" && styles.optionTitleActive,
                ]}
              >
                Light
              </Text>
              {activityLevel === "light" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Exercise 1-3 times/week</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              activityLevel === "moderate" && styles.optionCardActive,
            ]}
            onPress={() => setActivityLevel("moderate")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  activityLevel === "moderate" && styles.optionTitleActive,
                ]}
              >
                Moderate
              </Text>
              {activityLevel === "moderate" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Exercise 3-5 times/week</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              activityLevel === "active" && styles.optionCardActive,
            ]}
            onPress={() => setActivityLevel("active")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  activityLevel === "active" && styles.optionTitleActive,
                ]}
              >
                Active
              </Text>
              {activityLevel === "active" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Exercise 6-7 times/week</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              activityLevel === "very_active" && styles.optionCardActive,
            ]}
            onPress={() => setActivityLevel("very_active")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  activityLevel === "very_active" && styles.optionTitleActive,
                ]}
              >
                Very Active
              </Text>
              {activityLevel === "very_active" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Hard exercise daily</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fitness Goal</Text>
        <View style={styles.verticalOptions}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              goal === "lose_weight" && styles.optionCardActive,
            ]}
            onPress={() => setGoal("lose_weight")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  goal === "lose_weight" && styles.optionTitleActive,
                ]}
              >
                Lose Weight
              </Text>
              {goal === "lose_weight" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>-500 cal/day deficit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              goal === "maintain" && styles.optionCardActive,
            ]}
            onPress={() => setGoal("maintain")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  goal === "maintain" && styles.optionTitleActive,
                ]}
              >
                Maintain Weight
              </Text>
              {goal === "maintain" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>Stay at current weight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              goal === "gain_weight" && styles.optionCardActive,
            ]}
            onPress={() => setGoal("gain_weight")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  goal === "gain_weight" && styles.optionTitleActive,
                ]}
              >
                Gain Weight
              </Text>
              {goal === "gain_weight" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>+300 cal/day surplus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              goal === "gain_muscle" && styles.optionCardActive,
            ]}
            onPress={() => setGoal("gain_muscle")}
          >
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionTitle,
                  goal === "gain_muscle" && styles.optionTitleActive,
                ]}
              >
                Gain Muscle
              </Text>
              {goal === "gain_muscle" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </View>
            <Text style={styles.optionDesc}>+500 cal/day, high protein</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle"
          size={20}
          color={colors.blue[500]}
        />
        <Text style={styles.infoText}>
          Your daily calorie goal will be automatically recalculated based on
          your selections.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient colors={gradients.primary} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "basic" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("basic")}
            >
              <Ionicons
                name="person"
                size={20}
                color={
                  activeTab === "basic" ? colors.white : "rgba(255,255,255,0.6)"
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "basic" && styles.tabTextActive,
                ]}
              >
                Basic Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "goals" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("goals")}
            >
              <Ionicons
                name="flag"
                size={20}
                color={
                  activeTab === "goals" ? colors.white : "rgba(255,255,255,0.6)"
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "goals" && styles.tabTextActive,
                ]}
              >
                Goals
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === "basic" ? renderBasicInfo() : renderGoals()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tabContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  genderButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  verticalOptions: {
    gap: 10,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  optionCardActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  optionTitleActive: {
    color: colors.primary[600],
  },
  optionDesc: {
    fontSize: 14,
    color: colors.gray[600],
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[700],
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
