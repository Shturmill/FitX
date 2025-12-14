import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, Badge, Button } from "../../components/ui";
import { colors, gradients } from "../../theme/colors";
import { useTraining } from "../../contexts/TrainingContext";
import { TrainingStackParamList } from "../../navigation/TrainingStackNavigator";
import { WorkoutProgram, workoutStorage } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "ProgramList">;

export function ProgramListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { programs, history, activeSession, isLoading, loadPrograms } = useTraining();
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");

  useEffect(() => {
    loadPrograms();
  }, []);

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

  const handleProgramPress = (program: WorkoutProgram) => {
    navigation.navigate("ProgramDetails", { program });
  };

  const handleStartWorkout = (program: WorkoutProgram) => {
    if (activeSession) {
      Alert.alert(
        "Workout in Progress",
        "You have an active workout. Do you want to continue it or start a new one?",
        [
          { text: "Continue Current", onPress: () => navigation.navigate("WorkoutRun", { program: activeSession.program }) },
          { text: "Start New", style: "destructive", onPress: () => navigation.navigate("WorkoutRun", { program }) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      navigation.navigate("WorkoutRun", { program });
    }
  };

  // Calculate weekly stats from history
  const getWeeklyStats = () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekWorkouts = history.filter((w) => w.startTime >= oneWeekAgo);
    const totalMinutes = weekWorkouts.reduce((acc, w) => acc + w.duration, 0);
    const totalSets = weekWorkouts.reduce((acc, w) => acc + w.setsCompleted, 0);
    return {
      count: weekWorkouts.length,
      minutes: totalMinutes,
      sets: totalSets,
    };
  };

  const weeklyStats = getWeeklyStats();

  // Get last 7 days workout completion
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const hasWorkout = history.some((w) => w.date === dateStr);
      days.push({ hasWorkout });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <Text style={styles.subtitle}>Choose your workout and start training</Text>
      </View>

      {/* Active Workout Banner */}
      {activeSession && (
        <TouchableOpacity
          style={styles.activeWorkoutBanner}
          onPress={() => navigation.navigate("WorkoutRun", { program: activeSession.program })}
        >
          <View style={styles.activeWorkoutInfo}>
            <Ionicons name="play-circle" size={24} color={colors.white} />
            <View style={styles.activeWorkoutText}>
              <Text style={styles.activeWorkoutTitle}>Workout in Progress</Text>
              <Text style={styles.activeWorkoutName}>{activeSession.programName}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Weekly Progress */}
      <Card gradient={gradients.primary} style={styles.section}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>This Week</Text>
            <Text style={styles.progressValue}>{weeklyStats.count} Workouts</Text>
            <Text style={styles.progressSubtext}>
              {weeklyStats.minutes} min - {weeklyStats.sets} sets completed
            </Text>
          </View>
          <Ionicons name="trending-up" size={40} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.weekDays}>
          {weekDays.map((day, i) => (
            <View
              key={i}
              style={[styles.dayBar, day.hasWorkout ? styles.dayComplete : styles.dayIncomplete]}
            />
          ))}
        </View>
        <View style={styles.weekLabels}>
          {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
            <Text key={i} style={styles.weekLabel}>{label}</Text>
          ))}
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "plans" && styles.activeTab]}
          onPress={() => setActiveTab("plans")}
        >
          <Text style={[styles.tabText, activeTab === "plans" && styles.activeTabText]}>
            Workout Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "plans" ? (
        <>
          {programs.map((program) => (
            <TouchableOpacity key={program.id} onPress={() => handleProgramPress(program)}>
              <Card style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutTitleRow}>
                    <Text style={styles.workoutName}>{program.name}</Text>
                    <Badge variant={getDifficultyVariant(program.difficulty) as any}>
                      {getDifficultyLabel(program.difficulty)}
                    </Badge>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </View>
                <Text style={styles.workoutCategory}>{program.category}</Text>
                <Text style={styles.workoutDescription} numberOfLines={2}>
                  {program.description}
                </Text>

                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>
                      {workoutStorage.formatDuration(program.duration)}
                    </Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Ionicons name="barbell-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>
                      {program.exercises.length} exercises
                    </Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Ionicons name="layers-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>
                      {workoutStorage.calculateTotalSets(program)} sets
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartWorkout(program)}
                >
                  <Ionicons name="play" size={16} color={colors.white} />
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>

                {/* Edit button for custom programs */}
                {program.id.startsWith("custom-") && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate("CustomWorkout", { program })}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.primary[600]} />
                    <Text style={styles.editButtonText}>Edit Program</Text>
                  </TouchableOpacity>
                )}
              </Card>
            </TouchableOpacity>
          ))}

          {/* Create Custom Workout Card */}
          <TouchableOpacity
            style={styles.createCustomCard}
            onPress={() => navigation.navigate("CustomWorkout")}
          >
            <View style={styles.createCustomIcon}>
              <Ionicons name="add" size={32} color={colors.primary[600]} />
            </View>
            <Text style={styles.createCustomTitle}>Create Custom Workout</Text>
            <Text style={styles.createCustomSubtitle}>
              Build your own workout routine
            </Text>
          </TouchableOpacity>

          <View style={styles.lastSection} />
        </>
      ) : (
        <>
          {/* Stats Overview */}
          <View style={styles.historyStats}>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>{history.length}</Text>
              <Text style={styles.historyStatLabel}>Workouts</Text>
            </Card>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>
                {Math.round(history.reduce((acc, w) => acc + w.duration, 0) / 60 * 10) / 10}
              </Text>
              <Text style={styles.historyStatLabel}>Hours</Text>
            </Card>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>
                {history.reduce((acc, w) => acc + w.setsCompleted, 0)}
              </Text>
              <Text style={styles.historyStatLabel}>Sets</Text>
            </Card>
          </View>

          {/* History List */}
          {history.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first workout to see it here
              </Text>
            </Card>
          ) : (
            history.slice(0, 20).map((workout, index) => (
              <Card
                key={workout.id}
                style={[styles.historyCard, index === Math.min(history.length - 1, 19) && styles.lastSection]}
              >
                <View style={styles.historyRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{workout.programName}</Text>
                    <View style={styles.historyDateRow}>
                      <Ionicons name="calendar-outline" size={12} color={colors.gray[500]} />
                      <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                    </View>
                    <View style={styles.historyStatsRow}>
                      <View style={styles.workoutStat}>
                        <Ionicons name="time-outline" size={12} color={colors.gray[500]} />
                        <Text style={styles.historyStatText}>{workout.duration} min</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Ionicons name="checkmark-done-outline" size={12} color={colors.gray[500]} />
                        <Text style={styles.historyStatText}>
                          {workout.setsCompleted}/{workout.totalSets} sets
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>
                      {Math.round((workout.setsCompleted / workout.totalSets) * 100)}%
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
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
  section: {
    marginTop: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  activeWorkoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.green[500],
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  activeWorkoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeWorkoutText: {
    gap: 2,
  },
  activeWorkoutTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  activeWorkoutName: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  progressValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginTop: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  weekDays: {
    flexDirection: "row",
    gap: 8,
  },
  dayBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  dayComplete: {
    backgroundColor: colors.white,
  },
  dayIncomplete: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  weekLabels: {
    flexDirection: "row",
    marginTop: 8,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.gray[900],
  },
  workoutCard: {
    marginTop: 16,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  workoutTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  workoutCategory: {
    fontSize: 14,
    color: colors.primary[600],
    marginTop: 4,
    textTransform: "capitalize",
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
  },
  workoutStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  workoutStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  historyStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  historyStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  historyStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
  },
  historyStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
  },
  historyCard: {
    marginTop: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  historyDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  historyStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  historyStatText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  completionBadge: {
    backgroundColor: colors.green[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.green[600],
  },
});
