import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, Progress, Button } from "../../components/ui";
import { colors, gradients } from "../../theme/colors";
import { useTraining } from "../../contexts/TrainingContext";
import { TrainingStackParamList } from "../../navigation/TrainingStackNavigator";
import { workoutStorage, Exercise } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "WorkoutRun">;
type RouteProps = RouteProp<TrainingStackParamList, "WorkoutRun">;

export function WorkoutRunScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { program } = route.params;
  const {
    activeSession,
    startWorkout,
    completeSet,
    skipExercise,
    endWorkout,
    endRest,
    getWorkoutProgress,
    getCurrentExercise,
  } = useTraining();

  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize workout if needed
  useEffect(() => {
    if (!activeSession || activeSession.programId !== program.id) {
      startWorkout(program);
    }
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession?.startTime]);

  // Rest timer
  useEffect(() => {
    if (activeSession?.isRestPhase && activeSession.restEndTime) {
      const checkRest = () => {
        const timeLeft = Math.max(0, Math.floor((activeSession.restEndTime! - Date.now()) / 1000));
        setRestTimeLeft(timeLeft);

        if (timeLeft <= 0) {
          endRest();
          if (restTimerRef.current) clearInterval(restTimerRef.current);
        }
      };

      checkRest();
      restTimerRef.current = setInterval(checkRest, 100);
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [activeSession?.isRestPhase, activeSession?.restEndTime]);

  // Update input fields when exercise changes
  useEffect(() => {
    if (activeSession) {
      const currentExercise = program.exercises[activeSession.currentExerciseIndex];
      if (currentExercise) {
        setRepsInput(currentExercise.reps?.toString() || "");
        setWeightInput(currentExercise.weight?.toString() || "");
      }
    }
  }, [activeSession?.currentExerciseIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCompleteSet = () => {
    const reps = parseInt(repsInput) || undefined;
    const weight = parseFloat(weightInput) || undefined;
    completeSet(reps, weight);
  };

  const handleSkipExercise = () => {
    Alert.alert("Skip Exercise", "Are you sure you want to skip this exercise?", [
      { text: "Cancel", style: "cancel" },
      { text: "Skip", style: "destructive", onPress: () => skipExercise() },
    ]);
  };

  const handleEndWorkout = () => {
    setShowEndModal(true);
  };

  const confirmEndWorkout = async (completed: boolean) => {
    setShowEndModal(false);
    await endWorkout(completed);
    navigation.navigate("ProgramList");
  };

  const handleSkipRest = () => {
    endRest();
  };

  if (!activeSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Starting workout...</Text>
      </View>
    );
  }

  const currentExercise = program.exercises[activeSession.currentExerciseIndex];
  const currentProgress = activeSession.exerciseProgress[activeSession.currentExerciseIndex];
  const progress = getWorkoutProgress();
  const isLastExercise = activeSession.currentExerciseIndex === program.exercises.length - 1;
  const isLastSet = currentProgress?.completedSets.length === currentExercise?.sets - 1;
  const isWorkoutComplete = isLastExercise && isLastSet && !activeSession.isRestPhase;

  // If workout is complete
  if (!currentExercise || (isLastExercise && currentProgress?.completedSets.length >= currentExercise.sets)) {
    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.green[500]} />
          </View>
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          <Text style={styles.completeSubtitle}>
            Great job! You've completed {progress.setsCompleted} of {progress.totalSets} sets
          </Text>
          <Text style={styles.completeTime}>Total time: {formatTime(elapsedTime)}</Text>
          <Button style={styles.finishButton} onPress={() => confirmEndWorkout(true)}>
            Save & Exit
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleEndWorkout}>
          <Ionicons name="close" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.elapsedTime}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Progress
          value={(progress.setsCompleted / progress.totalSets) * 100}
          height={6}
          fillColor={colors.primary[600]}
        />
        <Text style={styles.progressText}>
          {progress.setsCompleted} / {progress.totalSets} sets completed
        </Text>
      </View>

      {/* Rest Phase */}
      {activeSession.isRestPhase ? (
        <View style={styles.restContainer}>
          <Card gradient={gradients.water} style={styles.restCard}>
            <Text style={styles.restLabel}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimeLeft)}</Text>
            <Text style={styles.nextUpLabel}>Next up:</Text>
            <Text style={styles.nextUpText}>
              Set {(currentProgress?.completedSets.length || 0) + 1} of {currentExercise.sets}
            </Text>
          </Card>

          <TouchableOpacity style={styles.skipRestButton} onPress={handleSkipRest}>
            <Ionicons name="play-skip-forward" size={20} color={colors.primary[600]} />
            <Text style={styles.skipRestText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Exercise */}
          <View style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseLabel}>
                Exercise {activeSession.currentExerciseIndex + 1} of {program.exercises.length}
              </Text>
              <TouchableOpacity onPress={handleSkipExercise}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.exerciseName}>{currentExercise.name}</Text>

            <View style={styles.setIndicator}>
              <Text style={styles.setLabel}>Set</Text>
              <Text style={styles.setNumber}>
                {(currentProgress?.completedSets.length || 0) + 1} / {currentExercise.sets}
              </Text>
            </View>

            {/* Target Info */}
            <View style={styles.targetContainer}>
              {currentExercise.duration ? (
                <View style={styles.targetItem}>
                  <Ionicons name="time-outline" size={24} color={colors.gray[600]} />
                  <Text style={styles.targetValue}>{currentExercise.duration}s</Text>
                  <Text style={styles.targetLabel}>Duration</Text>
                </View>
              ) : (
                <View style={styles.targetItem}>
                  <Ionicons name="repeat-outline" size={24} color={colors.gray[600]} />
                  <Text style={styles.targetValue}>{currentExercise.reps}</Text>
                  <Text style={styles.targetLabel}>Reps</Text>
                </View>
              )}
              {currentExercise.weight && (
                <View style={styles.targetItem}>
                  <Ionicons name="fitness-outline" size={24} color={colors.gray[600]} />
                  <Text style={styles.targetValue}>{currentExercise.weight}</Text>
                  <Text style={styles.targetLabel}>kg</Text>
                </View>
              )}
              <View style={styles.targetItem}>
                <Ionicons name="hourglass-outline" size={24} color={colors.gray[600]} />
                <Text style={styles.targetValue}>
                  {workoutStorage.formatRestTime(currentExercise.restTime)}
                </Text>
                <Text style={styles.targetLabel}>Rest</Text>
              </View>
            </View>

            {/* Input Fields */}
            {!currentExercise.duration && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    value={repsInput}
                    onChangeText={setRepsInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>
                {currentExercise.weight !== undefined && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={weightInput}
                      onChangeText={setWeightInput}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.gray[400]}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Completed Sets */}
            {currentProgress && currentProgress.completedSets.length > 0 && (
              <View style={styles.completedSets}>
                <Text style={styles.completedSetsTitle}>Completed Sets</Text>
                {currentProgress.completedSets.map((set, index) => (
                  <View key={index} style={styles.completedSetRow}>
                    <Text style={styles.completedSetNumber}>Set {set.setNumber}</Text>
                    <Text style={styles.completedSetDetails}>
                      {set.reps && `${set.reps} reps`}
                      {set.weight && ` @ ${set.weight}kg`}
                    </Text>
                    <Ionicons name="checkmark-circle" size={18} color={colors.green[500]} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Bottom Action */}
      {!activeSession.isRestPhase && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSet}>
            <Ionicons name="checkmark" size={24} color={colors.white} />
            <Text style={styles.completeButtonText}>Complete Set</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* End Workout Modal */}
      <Modal visible={showEndModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Workout?</Text>
            <Text style={styles.modalSubtitle}>
              You've completed {progress.setsCompleted} of {progress.totalSets} sets
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowEndModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => confirmEndWorkout(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>End & Save</Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 22,
  },
  headerCenter: {
    alignItems: "center",
  },
  programName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  elapsedTime: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exerciseContainer: {
    marginTop: 24,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  skipText: {
    fontSize: 14,
    color: colors.red[500],
    fontWeight: "500",
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 16,
  },
  setIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  setLabel: {
    fontSize: 16,
    color: colors.gray[600],
  },
  setNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary[600],
  },
  targetContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  targetItem: {
    flex: 1,
    alignItems: "center",
  },
  targetValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: 8,
  },
  targetLabel: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[900],
    textAlign: "center",
  },
  completedSets: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  completedSetsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 12,
  },
  completedSetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  completedSetNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
    width: 60,
  },
  completedSetDetails: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
  },
  restContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  restCard: {
    alignItems: "center",
    paddingVertical: 48,
  },
  restLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 24,
  },
  nextUpLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  nextUpText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginTop: 4,
  },
  skipRestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    padding: 16,
  },
  skipRestText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary[600],
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.green[500],
    paddingVertical: 18,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  completeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  completeIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: 8,
  },
  completeTime: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary[600],
    marginBottom: 32,
  },
  finishButton: {
    paddingHorizontal: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
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
