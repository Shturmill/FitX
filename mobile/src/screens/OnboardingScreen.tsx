import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients } from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { UserSettings } from "../utils/storage";

type Step = 1 | 2 | 3 | 4;

export function OnboardingScreen() {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

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

  const calculateCalorieGoal = (): {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } => {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;

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
      proteinGrams = Math.round(w * 2.2); // 2.2g per kg
      fatsGrams = Math.round((calories * 0.25) / 9);
      carbsGrams = Math.round(
        (calories - proteinGrams * 4 - fatsGrams * 9) / 4,
      );
    } else if (goal === "lose_weight") {
      proteinGrams = Math.round(w * 2.0); // 2.0g per kg
      fatsGrams = Math.round((calories * 0.25) / 9);
      carbsGrams = Math.round(
        (calories - proteinGrams * 4 - fatsGrams * 9) / 4,
      );
    } else {
      proteinGrams = Math.round(w * 1.6); // 1.6g per kg
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

  const handleComplete = async () => {
    if (!name.trim() || !age || !weight || !height) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const goals = calculateCalorieGoal();

      const settings: UserSettings = {
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

      await login(settings);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!name.trim() || !age)) {
      alert("Please enter your name and age");
      return;
    }
    if (currentStep === 2 && (!weight || !height)) {
      alert("Please enter your weight and height");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            currentStep >= step && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="person-circle" size={80} color={colors.primary[600]} />
      <Text style={styles.stepTitle}>Welcome to Fitx!</Text>
      <Text style={styles.stepSubtitle}>Let's get to know you</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              gender === "male" && styles.optionButtonActive,
            ]}
            onPress={() => setGender("male")}
          >
            <Ionicons
              name="male"
              size={24}
              color={gender === "male" ? colors.white : colors.gray[600]}
            />
            <Text
              style={[
                styles.optionText,
                gender === "male" && styles.optionTextActive,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              gender === "female" && styles.optionButtonActive,
            ]}
            onPress={() => setGender("female")}
          >
            <Ionicons
              name="female"
              size={24}
              color={gender === "female" ? colors.white : colors.gray[600]}
            />
            <Text
              style={[
                styles.optionText,
                gender === "female" && styles.optionTextActive,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="fitness" size={80} color={colors.primary[600]} />
      <Text style={styles.stepTitle}>Your Measurements</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your goals</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (kg) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Height (cm) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your height"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholderTextColor={colors.gray[400]}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="walk" size={80} color={colors.primary[600]} />
      <Text style={styles.stepTitle}>Activity Level</Text>
      <Text style={styles.stepSubtitle}>How active are you?</Text>

      <View style={styles.verticalOptions}>
        <TouchableOpacity
          style={[
            styles.verticalOption,
            activityLevel === "sedentary" && styles.verticalOptionActive,
          ]}
          onPress={() => setActivityLevel("sedentary")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                activityLevel === "sedentary" &&
                  styles.verticalOptionTitleActive,
              ]}
            >
              Sedentary
            </Text>
            {activityLevel === "sedentary" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              activityLevel === "sedentary" && styles.verticalOptionDescActive,
            ]}
          >
            Little or no exercise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            activityLevel === "light" && styles.verticalOptionActive,
          ]}
          onPress={() => setActivityLevel("light")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                activityLevel === "light" && styles.verticalOptionTitleActive,
              ]}
            >
              Light
            </Text>
            {activityLevel === "light" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              activityLevel === "light" && styles.verticalOptionDescActive,
            ]}
          >
            Exercise 1-3 times/week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            activityLevel === "moderate" && styles.verticalOptionActive,
          ]}
          onPress={() => setActivityLevel("moderate")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                activityLevel === "moderate" &&
                  styles.verticalOptionTitleActive,
              ]}
            >
              Moderate
            </Text>
            {activityLevel === "moderate" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              activityLevel === "moderate" && styles.verticalOptionDescActive,
            ]}
          >
            Exercise 3-5 times/week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            activityLevel === "active" && styles.verticalOptionActive,
          ]}
          onPress={() => setActivityLevel("active")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                activityLevel === "active" && styles.verticalOptionTitleActive,
              ]}
            >
              Active
            </Text>
            {activityLevel === "active" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              activityLevel === "active" && styles.verticalOptionDescActive,
            ]}
          >
            Exercise 6-7 times/week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            activityLevel === "very_active" && styles.verticalOptionActive,
          ]}
          onPress={() => setActivityLevel("very_active")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                activityLevel === "very_active" &&
                  styles.verticalOptionTitleActive,
              ]}
            >
              Very Active
            </Text>
            {activityLevel === "very_active" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              activityLevel === "very_active" &&
                styles.verticalOptionDescActive,
            ]}
          >
            Hard exercise daily or physical job
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="flag" size={80} color={colors.primary[600]} />
      <Text style={styles.stepTitle}>Your Goal</Text>
      <Text style={styles.stepSubtitle}>What do you want to achieve?</Text>

      <View style={styles.verticalOptions}>
        <TouchableOpacity
          style={[
            styles.verticalOption,
            goal === "lose_weight" && styles.verticalOptionActive,
          ]}
          onPress={() => setGoal("lose_weight")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                goal === "lose_weight" && styles.verticalOptionTitleActive,
              ]}
            >
              Lose Weight
            </Text>
            {goal === "lose_weight" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              goal === "lose_weight" && styles.verticalOptionDescActive,
            ]}
          >
            -500 cal/day deficit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            goal === "maintain" && styles.verticalOptionActive,
          ]}
          onPress={() => setGoal("maintain")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                goal === "maintain" && styles.verticalOptionTitleActive,
              ]}
            >
              Maintain Weight
            </Text>
            {goal === "maintain" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              goal === "maintain" && styles.verticalOptionDescActive,
            ]}
          >
            Stay at current weight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            goal === "gain_weight" && styles.verticalOptionActive,
          ]}
          onPress={() => setGoal("gain_weight")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                goal === "gain_weight" && styles.verticalOptionTitleActive,
              ]}
            >
              Gain Weight
            </Text>
            {goal === "gain_weight" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              goal === "gain_weight" && styles.verticalOptionDescActive,
            ]}
          >
            +300 cal/day surplus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalOption,
            goal === "gain_muscle" && styles.verticalOptionActive,
          ]}
          onPress={() => setGoal("gain_muscle")}
        >
          <View style={styles.verticalOptionHeader}>
            <Text
              style={[
                styles.verticalOptionTitle,
                goal === "gain_muscle" && styles.verticalOptionTitleActive,
              ]}
            >
              Gain Muscle
            </Text>
            {goal === "gain_muscle" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
            )}
          </View>
          <Text
            style={[
              styles.verticalOptionDesc,
              goal === "gain_muscle" && styles.verticalOptionDescActive,
            ]}
          >
            +500 cal/day, high protein
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={gradients.primary}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressBar()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={prevStep}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                currentStep === 1 && styles.nextButtonFull,
              ]}
              onPress={nextStep}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading
                  ? "Loading..."
                  : currentStep === 4
                    ? "Complete"
                    : "Next"}
              </Text>
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: {
    backgroundColor: colors.white,
    width: 40,
    borderRadius: 6,
  },
  stepContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: colors.white,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  optionTextActive: {
    color: colors.white,
  },
  verticalOptions: {
    width: "100%",
    gap: 12,
  },
  verticalOption: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  verticalOptionActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: colors.white,
  },
  verticalOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  verticalOptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  verticalOptionTitleActive: {
    color: colors.white,
  },
  verticalOptionDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  verticalOptionDescActive: {
    color: "rgba(255,255,255,0.9)",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary[600],
  },
});
