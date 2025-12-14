import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../components/ui";
import { colors } from "../../theme/colors";
import { useTraining } from "../../contexts/TrainingContext";
import { TrainingStackParamList } from "../../navigation/TrainingStackNavigator";
import { CompletedWorkout } from "../../utils/workoutStorage";

type NavigationProp = NativeStackNavigationProp<TrainingStackParamList, "WorkoutHistory">;

export function WorkoutHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { history } = useTraining();

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
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Group workouts by date
  const groupedHistory = history.reduce((groups, workout) => {
    const date = workout.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {} as Record<string, CompletedWorkout[]>);

  const sortedDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate stats
  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((acc, w) => acc + w.duration, 0);
  const totalSets = history.reduce((acc, w) => acc + w.setsCompleted, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Ionicons name="barbell-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={colors.blue[500]} />
            <Text style={styles.statValue}>{Math.round(totalMinutes / 60 * 10) / 10}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="layers-outline" size={24} color={colors.green[500]} />
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </Card>
        </View>

        {/* History List */}
        {history.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first workout to see your progress here
            </Text>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {groupedHistory[date].map((workout) => (
                <Card key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutRow}>
                    <View style={styles.workoutIcon}>
                      <Ionicons name="checkmark" size={20} color={colors.white} />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.programName}</Text>
                      <Text style={styles.workoutTime}>{formatTime(workout.startTime)}</Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStatRow}>
                        <Ionicons name="time-outline" size={14} color={colors.gray[500]} />
                        <Text style={styles.workoutStatText}>{workout.duration} min</Text>
                      </View>
                      <View style={styles.workoutStatRow}>
                        <Ionicons name="layers-outline" size={14} color={colors.gray[500]} />
                        <Text style={styles.workoutStatText}>
                          {workout.setsCompleted}/{workout.totalSets}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Exercise Summary */}
                  <View style={styles.exerciseSummary}>
                    {workout.exercises
                      .filter((ex) => !ex.skipped && ex.completedSets.length > 0)
                      .slice(0, 3)
                      .map((ex, index) => (
                        <View key={index} style={styles.exerciseTag}>
                          <Text style={styles.exerciseTagText}>{ex.exerciseName}</Text>
                        </View>
                      ))}
                    {workout.exercisesCompleted > 3 && (
                      <View style={styles.exerciseTag}>
                        <Text style={styles.exerciseTagText}>
                          +{workout.exercisesCompleted - 3} more
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Completion percentage */}
                  <View style={styles.completionRow}>
                    <View style={styles.completionBar}>
                      <View
                        style={[
                          styles.completionFill,
                          {
                            width: `${(workout.setsCompleted / workout.totalSets) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.completionText}>
                      {Math.round((workout.setsCompleted / workout.totalSets) * 100)}%
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 4,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[900],
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 12,
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  workoutTime: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  workoutStats: {
    alignItems: "flex-end",
    gap: 4,
  },
  workoutStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workoutStatText: {
    fontSize: 13,
    color: colors.gray[600],
  },
  exerciseSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  exerciseTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseTagText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  completionBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  completionFill: {
    height: "100%",
    backgroundColor: colors.green[500],
    borderRadius: 3,
  },
  completionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.green[600],
    minWidth: 40,
    textAlign: "right",
  },
  bottomSpacer: {
    height: 40,
  },
});
