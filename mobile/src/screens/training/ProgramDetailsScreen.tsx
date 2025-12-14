import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, CardContent, Badge, Button } from "../../components/ui";
import { colors, gradients } from "../../theme/colors";
import { useTraining } from "../../contexts/TrainingContext";
import { TrainingStackParamList } from "../../navigation/TrainingStackNavigator";
import { workoutStorage } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "ProgramDetails">;
type RouteProps = RouteProp<TrainingStackParamList, "ProgramDetails">;

export function ProgramDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { program } = route.params;
  const { activeSession } = useTraining();

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "default";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const handleStartWorkout = () => {
    if (activeSession) {
      Alert.alert(
        "Workout in Progress",
        "You have an active workout. Do you want to continue it or start a new one?",
        [
          {
            text: "Continue Current",
            onPress: () => navigation.navigate("WorkoutRun", { program: activeSession.program }),
          },
          {
            text: "Start New",
            style: "destructive",
            onPress: () => navigation.navigate("WorkoutRun", { program }),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      navigation.navigate("WorkoutRun", { program });
    }
  };

  const formatExerciseTarget = (exercise: typeof program.exercises[0]) => {
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
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Info Card */}
        <Card gradient={gradients.primary} style={styles.programCard}>
          <View style={styles.programHeader}>
            <View style={styles.programInfo}>
              <Badge
                variant={getDifficultyVariant(program.difficulty) as any}
                style={styles.difficultyBadge}
              >
                {getDifficultyLabel(program.difficulty)}
              </Badge>
              <Text style={styles.programName}>{program.name}</Text>
              <Text style={styles.programCategory}>{program.category}</Text>
            </View>
            <View style={styles.programIcon}>
              <Ionicons name="barbell" size={40} color="rgba(255,255,255,0.8)" />
            </View>
          </View>

          <Text style={styles.programDescription}>{program.description}</Text>

          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>
                {workoutStorage.formatDuration(program.duration)}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{program.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>
                {workoutStorage.calculateTotalSets(program)}
              </Text>
              <Text style={styles.statLabel}>Total Sets</Text>
            </View>
          </View>
        </Card>

        {/* Exercise List */}
        <Text style={styles.sectionTitle}>Exercises</Text>

        {program.exercises.map((exercise, index) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseDetails}>
                  <View style={styles.exerciseDetail}>
                    <Ionicons name="repeat-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.exerciseDetailText}>
                      {formatExerciseTarget(exercise)}
                    </Text>
                  </View>
                  {exercise.weight && (
                    <View style={styles.exerciseDetail}>
                      <Ionicons name="fitness-outline" size={14} color={colors.gray[500]} />
                      <Text style={styles.exerciseDetailText}>{exercise.weight} kg</Text>
                    </View>
                  )}
                  <View style={styles.exerciseDetail}>
                    <Ionicons name="hourglass-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.exerciseDetailText}>
                      {workoutStorage.formatRestTime(exercise.restTime)} rest
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Start Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Ionicons name="play" size={20} color={colors.white} />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#EEF2FF",
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
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  programCard: {
    marginBottom: 24,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  programInfo: {
    flex: 1,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  programName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  programCategory: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textTransform: "capitalize",
  },
  programIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  programDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 20,
  },
  programStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 12,
  },
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 16,
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
    marginBottom: 6,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exerciseDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exerciseDetailText: {
    fontSize: 13,
    color: colors.gray[600],
  },
  bottomSpacer: {
    height: 100,
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
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
  },
});
