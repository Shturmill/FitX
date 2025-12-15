import React, { useState, useEffect, useMemo } from "react";
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
import { WorkoutProgram, workoutStorage, WORKOUT_CATEGORIES, WorkoutCategory } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "ProgramList">;

type SortOption = "name" | "duration" | "difficulty";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

export function ProgramListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { programs, history, activeSession, isLoading, loadPrograms, deleteProgram } = useTraining();
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");

  // Filter and sort state
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);

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

  // Get category config
  const getCategoryConfig = (category: string) => {
    const normalizedCategory = category.toLowerCase() as WorkoutCategory;
    return WORKOUT_CATEGORIES[normalizedCategory] || { label: category, icon: "fitness-outline", color: colors.gray[500] };
  };

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category.toLowerCase() === categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "duration":
          return a.duration - b.duration;
        case "difficulty": {
          const order = { beginner: 0, intermediate: 1, advanced: 2 };
          return order[a.difficulty] - order[b.difficulty];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [programs, categoryFilter, difficultyFilter, sortBy]);

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

  const handleDeleteProgram = async (program: WorkoutProgram) => {
    await deleteProgram(program.id);
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

  // Get unique categories from programs
  const uniqueCategories = useMemo(() => {
    const cats = new Set(programs.map((p) => p.category.toLowerCase() as WorkoutCategory));
    return Array.from(cats);
  }, [programs]);

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
          {/* Filter/Sort Bar */}
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={styles.filterToggle}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options-outline" size={20} color={colors.gray[600]} />
              <Text style={styles.filterToggleText}>Filter & Sort</Text>
              <Ionicons
                name={showFilters ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.gray[500]}
              />
            </TouchableOpacity>
            {(categoryFilter !== "all" || difficultyFilter !== "all") && (
              <TouchableOpacity
                style={styles.clearFilters}
                onPress={() => {
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                <Ionicons name="close-circle" size={16} color={colors.primary[600]} />
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Options */}
          {showFilters && (
            <Card style={styles.filterCard}>
              {/* Sort */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort by</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: "name", label: "Name" },
                    { value: "duration", label: "Duration" },
                    { value: "difficulty", label: "Difficulty" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        sortBy === option.value && styles.filterChipActive,
                      ]}
                      onPress={() => setSortBy(option.value as SortOption)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          sortBy === option.value && styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        categoryFilter === "all" && styles.filterChipActive,
                      ]}
                      onPress={() => setCategoryFilter("all")}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          categoryFilter === "all" && styles.filterChipTextActive,
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {uniqueCategories.map((cat) => {
                      const config = getCategoryConfig(cat);
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.filterChip,
                            categoryFilter === cat && { backgroundColor: config.color },
                          ]}
                          onPress={() => setCategoryFilter(cat)}
                        >
                          <Ionicons
                            name={config.icon as any}
                            size={14}
                            color={categoryFilter === cat ? colors.white : config.color}
                          />
                          <Text
                            style={[
                              styles.filterChipText,
                              categoryFilter === cat && styles.filterChipTextActive,
                            ]}
                          >
                            {config.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Difficulty Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Difficulty</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: "all", label: "All", color: colors.gray[500] },
                    { value: "beginner", label: "Beginner", color: colors.green[500] },
                    { value: "intermediate", label: "Intermediate", color: colors.yellow[500] },
                    { value: "advanced", label: "Advanced", color: colors.red[500] },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        difficultyFilter === option.value && { backgroundColor: option.color },
                      ]}
                      onPress={() => setDifficultyFilter(option.value as DifficultyFilter)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          difficultyFilter === option.value && styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Programs Count */}
          <Text style={styles.programsCount}>
            {filteredPrograms.length} workout{filteredPrograms.length !== 1 ? "s" : ""} found
          </Text>

          {filteredPrograms.map((program) => {
            const categoryConfig = getCategoryConfig(program.category);
            return (
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

                  {/* Category Tag */}
                  <View style={[styles.categoryTag, { backgroundColor: categoryConfig.color + "20" }]}>
                    <Ionicons
                      name={categoryConfig.icon as any}
                      size={16}
                      color={categoryConfig.color}
                    />
                    <Text style={[styles.categoryTagText, { color: categoryConfig.color }]}>
                      {categoryConfig.label}
                    </Text>
                  </View>

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

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleStartWorkout(program)}
                    >
                      <Ionicons name="play" size={16} color={colors.white} />
                      <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>

                    {/* Edit and Delete for custom programs */}
                    {program.id.startsWith("custom-") && (
                      <View style={styles.programActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => navigation.navigate("CustomWorkout", { program })}
                          activeOpacity={0.6}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteProgram(program)}
                          activeOpacity={0.6}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}

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
            history.slice(0, 20).map((workout, index) => {
              const isLast = index === Math.min(history.length - 1, 19);
              return (
              <Card
                key={workout.id}
                style={isLast ? { ...styles.historyCard, ...styles.lastSection } : styles.historyCard}
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
              );
            })
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
  // Filter styles
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[600],
  },
  clearFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "500",
  },
  filterCard: {
    marginTop: 12,
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[700],
  },
  filterChipTextActive: {
    color: colors.white,
  },
  programsCount: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 12,
    marginBottom: 4,
  },
  workoutCard: {
    marginTop: 12,
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
  // Category tag styles
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  categoryTagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 10,
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
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  startButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  programActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.red[50],
    alignItems: "center",
    justifyContent: "center",
  },
  // Create custom card styles
  createCustomCard: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: "dashed",
  },
  createCustomIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  createCustomTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 4,
  },
  createCustomSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
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
