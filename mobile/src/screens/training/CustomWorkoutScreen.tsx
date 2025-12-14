import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, Button, Badge } from "../../components/ui";
import { colors } from "../../theme/colors";
import { useTraining } from "../../contexts/TrainingContext";
import { TrainingStackParamList } from "../../navigation/TrainingStackNavigator";
import { Exercise, WorkoutProgram, workoutStorage } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "CustomWorkout">;
type RouteProps = RouteProp<TrainingStackParamList, "CustomWorkout">;

interface ExerciseFormData {
  name: string;
  sets: string;
  reps: string;
  duration: string;
  restTime: string;
  weight: string;
  isTimeBased: boolean;
}

const emptyExercise: ExerciseFormData = {
  name: "",
  sets: "3",
  reps: "10",
  duration: "30",
  restTime: "60",
  weight: "",
  isTimeBased: false,
};

export function CustomWorkoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { loadPrograms } = useTraining();
  const editProgram = route.params?.program;

  // Program form state
  const [programName, setProgramName] = useState(editProgram?.name || "");
  const [programDescription, setProgramDescription] = useState(editProgram?.description || "");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">(
    editProgram?.difficulty || "beginner"
  );
  const [category, setCategory] = useState(editProgram?.category || "strength");
  const [exercises, setExercises] = useState<Exercise[]>(editProgram?.exercises || []);

  // Exercise modal state
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>(emptyExercise);

  const difficulties = [
    { value: "beginner", label: "Beginner", color: colors.green[500] },
    { value: "intermediate", label: "Intermediate", color: colors.yellow[500] },
    { value: "advanced", label: "Advanced", color: colors.red[500] },
  ];

  const categories = ["strength", "cardio", "hiit", "core", "flexibility", "full body"];

  const handleAddExercise = () => {
    setEditingExerciseIndex(null);
    setExerciseForm(emptyExercise);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (index: number) => {
    const exercise = exercises[index];
    setEditingExerciseIndex(index);
    setExerciseForm({
      name: exercise.name,
      sets: exercise.sets.toString(),
      reps: exercise.reps?.toString() || "",
      duration: exercise.duration?.toString() || "30",
      restTime: exercise.restTime.toString(),
      weight: exercise.weight?.toString() || "",
      isTimeBased: !!exercise.duration,
    });
    setShowExerciseModal(true);
  };

  const handleDeleteExercise = (index: number) => {
    Alert.alert("Delete Exercise", "Are you sure you want to remove this exercise?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const newExercises = [...exercises];
          newExercises.splice(index, 1);
          setExercises(newExercises);
        },
      },
    ]);
  };

  const handleSaveExercise = () => {
    if (!exerciseForm.name.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    const sets = parseInt(exerciseForm.sets) || 3;
    const restTime = parseInt(exerciseForm.restTime) || 60;

    const newExercise: Exercise = {
      id: editingExerciseIndex !== null ? exercises[editingExerciseIndex].id : Date.now().toString(),
      name: exerciseForm.name.trim(),
      sets,
      restTime,
      ...(exerciseForm.isTimeBased
        ? { duration: parseInt(exerciseForm.duration) || 30 }
        : { reps: parseInt(exerciseForm.reps) || 10 }),
      ...(exerciseForm.weight ? { weight: parseFloat(exerciseForm.weight) } : {}),
    };

    if (editingExerciseIndex !== null) {
      const newExercises = [...exercises];
      newExercises[editingExerciseIndex] = newExercise;
      setExercises(newExercises);
    } else {
      setExercises([...exercises, newExercise]);
    }

    setShowExerciseModal(false);
    setExerciseForm(emptyExercise);
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const newExercises = [...exercises];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const calculateDuration = () => {
    let totalSeconds = 0;
    exercises.forEach((ex) => {
      const exerciseTime = ex.duration ? ex.duration * ex.sets : ex.sets * 45; // 45s per rep-based set
      const restTime = ex.restTime * (ex.sets - 1);
      totalSeconds += exerciseTime + restTime;
    });
    return Math.ceil(totalSeconds / 60);
  };

  const handleSaveProgram = async () => {
    if (!programName.trim()) {
      Alert.alert("Error", "Please enter a program name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    const program: WorkoutProgram = {
      id: editProgram?.id || `custom-${Date.now()}`,
      name: programName.trim(),
      description: programDescription.trim() || `Custom ${category} workout`,
      difficulty,
      duration: calculateDuration(),
      category,
      exercises,
    };

    await workoutStorage.saveProgram(program);
    await loadPrograms();

    Alert.alert("Success", editProgram ? "Workout updated!" : "Workout created!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const formatExerciseTarget = (exercise: Exercise) => {
    if (exercise.duration) {
      return `${exercise.sets} sets × ${exercise.duration}s`;
    }
    return `${exercise.sets} sets × ${exercise.reps} reps`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editProgram ? "Edit Workout" : "Create Workout"}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProgram}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Program Details */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Program Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={programName}
                onChangeText={setProgramName}
                placeholder="e.g., Morning Strength"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={programDescription}
                onChangeText={setProgramDescription}
                placeholder="Describe your workout..."
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.optionsRow}>
                {difficulties.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[
                      styles.optionButton,
                      difficulty === d.value && { backgroundColor: d.color },
                    ]}
                    onPress={() => setDifficulty(d.value as any)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        difficulty === d.value && styles.optionTextActive,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.optionButton,
                        category === c && styles.optionButtonActive,
                      ]}
                      onPress={() => setCategory(c)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          category === c && styles.optionTextActive,
                        ]}
                      >
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </Card>

          {/* Exercises */}
          <View style={styles.exercisesHeader}>
            <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
            <Text style={styles.durationText}>~{calculateDuration()} min</Text>
          </View>

          {exercises.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubtext}>Tap the button below to add exercises</Text>
            </Card>
          ) : (
            exercises.map((exercise, index) => (
              <Card key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>{formatExerciseTarget(exercise)}</Text>
                    {exercise.weight && (
                      <Text style={styles.exerciseWeight}>{exercise.weight} kg</Text>
                    )}
                  </View>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMoveExercise(index, "up")}
                      disabled={index === 0}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={20}
                        color={index === 0 ? colors.gray[300] : colors.gray[600]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMoveExercise(index, "down")}
                      disabled={index === exercises.length - 1}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={index === exercises.length - 1 ? colors.gray[300] : colors.gray[600]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditExercise(index)}
                    >
                      <Ionicons name="pencil" size={18} color={colors.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteExercise(index)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}

          <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
            <Ionicons name="add-circle" size={24} color={colors.primary[600]} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Exercise Modal */}
      <Modal visible={showExerciseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExerciseIndex !== null ? "Edit Exercise" : "Add Exercise"}
              </Text>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exercise Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={exerciseForm.name}
                  onChangeText={(text) => setExerciseForm({ ...exerciseForm, name: text })}
                  placeholder="e.g., Push-ups"
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exercise Type</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      !exerciseForm.isTimeBased && styles.optionButtonActive,
                    ]}
                    onPress={() => setExerciseForm({ ...exerciseForm, isTimeBased: false })}
                  >
                    <Ionicons
                      name="repeat-outline"
                      size={18}
                      color={!exerciseForm.isTimeBased ? colors.white : colors.gray[600]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        !exerciseForm.isTimeBased && styles.optionTextActive,
                      ]}
                    >
                      Reps
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      exerciseForm.isTimeBased && styles.optionButtonActive,
                    ]}
                    onPress={() => setExerciseForm({ ...exerciseForm, isTimeBased: true })}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={exerciseForm.isTimeBased ? colors.white : colors.gray[600]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        exerciseForm.isTimeBased && styles.optionTextActive,
                      ]}
                    >
                      Time
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Sets</Text>
                  <TextInput
                    style={styles.textInput}
                    value={exerciseForm.sets}
                    onChangeText={(text) => setExerciseForm({ ...exerciseForm, sets: text })}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>
                    {exerciseForm.isTimeBased ? "Duration (sec)" : "Reps"}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={exerciseForm.isTimeBased ? exerciseForm.duration : exerciseForm.reps}
                    onChangeText={(text) =>
                      setExerciseForm({
                        ...exerciseForm,
                        [exerciseForm.isTimeBased ? "duration" : "reps"]: text,
                      })
                    }
                    keyboardType="numeric"
                    placeholder={exerciseForm.isTimeBased ? "30" : "10"}
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Rest (sec)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={exerciseForm.restTime}
                    onChangeText={(text) => setExerciseForm({ ...exerciseForm, restTime: text })}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={exerciseForm.weight}
                    onChangeText={(text) => setExerciseForm({ ...exerciseForm, weight: text })}
                    keyboardType="decimal-pad"
                    placeholder="Optional"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowExerciseModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSaveExercise}>
                  <Text style={styles.modalButtonPrimaryText}>
                    {editingExerciseIndex !== null ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  saveButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray[900],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  optionButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  optionTextActive: {
    color: colors.white,
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  durationText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600],
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  exerciseCard: {
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[600],
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  exerciseDetails: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 2,
  },
  exerciseWeight: {
    fontSize: 12,
    color: colors.primary[600],
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: "dashed",
    marginTop: 8,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary[600],
  },
  bottomSpacer: {
    height: 40,
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
    maxHeight: "80%",
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: "center",
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[700],
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary[600],
    alignItems: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
