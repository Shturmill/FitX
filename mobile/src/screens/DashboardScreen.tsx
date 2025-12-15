import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Progress,
  Avatar,
} from "../components/ui";
import { colors, gradients } from "../theme/colors";
import { useFoodContext } from "../contexts/FoodContext";
import { useAuth } from "../contexts/AuthContext";
import { useAI } from "../contexts/AIContext";
import { TabParamList } from "../navigation/RootNavigator";

type DashboardNavigationProp = BottomTabNavigationProp<TabParamList, "Home">;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const {
    getTotalCalories,
    calorieGoal,
    waterGlasses,
    waterGoal,
    healthMetrics,
    isLoadingHealthMetrics,
    syncHealthMetricsFromBackend,
  } = useFoodContext();
  const { userSettings } = useAuth();
  const { messages, isLoading, sendMessage, expandChat } = useAI();

  const [inputValue, setInputValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get calorie data from context
  const totalCalories = getTotalCalories();
  const remaining = calorieGoal - totalCalories;
  const percentage = Math.round((totalCalories / calorieGoal) * 100);

  // Calculate consumed and burned (simplified)
  const consumed = totalCalories;
  const burned = Math.round(totalCalories * 0.15); // Example: 15% burned through activity
  const netCalories = consumed - burned;

  // Show only last 3 messages in the preview
  const previewMessages = messages.slice(-3);

  const handleNavigateToFoodDiary = () => {
    navigation.navigate("Diary");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncHealthMetricsFromBackend();
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || isLoadingHealthMetrics}
          onRefresh={handleRefresh}
          colors={[colors.primary[600]]}
          tintColor={colors.primary[600]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>
            Welcome Back{userSettings?.name ? `, ${userSettings.name}` : ""}!
          </Text>
          <Text style={styles.subtitle}>Let's crush your goals today</Text>
          {isLoadingHealthMetrics && (
            <View style={styles.syncBadge}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={styles.syncBadgeText}>Syncing data...</Text>
            </View>
          )}
        </View>
        <Avatar
          initials={
            userSettings?.name
              ? userSettings.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "FX"
          }
          size={48}
        />
      </View>

      {/* AI Assistant Chat */}
      <Card style={styles.section}>
        <CardHeader>
          <TouchableOpacity
            onPress={expandChat}
            style={styles.cardTitleRowTouchable}
            activeOpacity={0.7}
          >
            <View style={styles.cardTitleRow}>
              <Ionicons name="sparkles" size={20} color={colors.primary[600]} />
              <Text style={styles.cardTitle}>AI Fitness Coach</Text>
            </View>
            <Ionicons name="expand" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </CardHeader>
        <CardContent>
          <TouchableOpacity onPress={expandChat} activeOpacity={0.9}>
            <View style={styles.chatContainer}>
              {previewMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.role === "user"
                      ? styles.userMessageRow
                      : styles.assistantMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    {message.isLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={colors.primary[600]} />
                        <Text style={styles.loadingText}>Thinking...</Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.messageText,
                          message.role === "user"
                            ? styles.userText
                            : styles.assistantText,
                        ]}
                        numberOfLines={3}
                      >
                        {message.content}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask me anything about fitness..."
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSendMessage}
              placeholderTextColor={colors.gray[400]}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      {/* Calorie Tracker - Now Clickable */}
      <TouchableOpacity onPress={handleNavigateToFoodDiary} activeOpacity={0.8}>
        <Card gradient={gradients.calories} style={styles.section}>
          <View style={styles.calorieHeader}>
            <View>
              <View style={styles.calorieIconRow}>
                <Ionicons name="flame" size={40} color={colors.white} />
                <Text style={styles.calorieLabel}>Calories Today</Text>
              </View>
              <View style={styles.calorieValues}>
                <Text style={styles.calorieMain}>{netCalories}</Text>
                <Text style={styles.calorieGoal}>/ {calorieGoal}</Text>
              </View>
            </View>
            <View style={styles.remainingBox}>
              <Text style={styles.remainingValue}>{remaining}</Text>
              <Text style={styles.remainingLabel}>Remaining</Text>
            </View>
          </View>

          <Progress
            value={percentage}
            height={12}
            backgroundColor="rgba(255,255,255,0.2)"
            fillColor={colors.white}
          />

          <View style={styles.calorieStats}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>{consumed}</Text>
              <Text style={styles.calorieStatLabel}>Consumed</Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>{burned}</Text>
              <Text style={styles.calorieStatLabel}>Burned</Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>{percentage}%</Text>
              <Text style={styles.calorieStatLabel}>Goal Met</Text>
            </View>
          </View>

          <View style={styles.tapHint}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.tapHintText}>Tap to view food diary</Text>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Daily Stats Grid */}
      <View style={styles.statsGrid}>
        <Card gradient={["#3B82F6", "#06B6D4"]} style={styles.statCard}>
          <Ionicons name="water" size={32} color={colors.white} />
          <Text style={styles.statValue}>{waterGlasses}/{waterGoal}</Text>
          <Text style={styles.statLabel}>Water Glasses</Text>
          <Progress
            value={(waterGlasses / waterGoal) * 100}
            height={8}
            backgroundColor="rgba(255,255,255,0.2)"
            fillColor={colors.white}
            style={styles.statProgress}
          />
        </Card>

        <Card gradient={["#22C55E", "#10B981"]} style={styles.statCard}>
          <Ionicons name="footsteps" size={32} color={colors.white} />
          <Text style={styles.statValue}>{healthMetrics.steps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Steps</Text>
          <Progress
            value={(healthMetrics.steps / healthMetrics.stepsGoal) * 100}
            height={8}
            backgroundColor="rgba(255,255,255,0.2)"
            fillColor={colors.white}
            style={styles.statProgress}
          />
        </Card>

        <Card gradient={["#A855F7", "#EC4899"]} style={styles.statCard}>
          <Ionicons name="trending-up" size={32} color={colors.white} />
          <Text style={styles.statValue}>{healthMetrics.activeMinutes} min</Text>
          <Text style={styles.statLabel}>Active Time</Text>
          <Progress
            value={(healthMetrics.activeMinutes / 60) * 100}
            height={8}
            backgroundColor="rgba(255,255,255,0.2)"
            fillColor={colors.white}
            style={styles.statProgress}
          />
        </Card>
      </View>

      {/* Health Metrics */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.cardTitleRow}>
            <Ionicons name="heart" size={20} color={colors.red[500]} />
            <Text style={styles.cardTitle}>Health Metrics</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.healthGrid}>
            <View
              style={[styles.healthCard, { backgroundColor: colors.red[50] }]}
            >
              <Ionicons name="heart" size={28} color={colors.red[500]} />
              <Text style={styles.healthValue}>{healthMetrics.heartRate > 0 ? `${healthMetrics.heartRate} bpm` : '--'}</Text>
              <Text style={styles.healthLabel}>Heart Rate</Text>
              <Text style={styles.healthStatus}>{healthMetrics.heartRate > 0 ? (healthMetrics.heartRate < 60 ? 'Low' : healthMetrics.heartRate <= 100 ? 'Normal' : 'High') : 'No data'}</Text>
            </View>

            <View
              style={[
                styles.healthCard,
                { backgroundColor: colors.purple[500] + "15" },
              ]}
            >
              <Ionicons name="moon" size={28} color={colors.purple[500]} />
              <Text style={styles.healthValue}>{healthMetrics.sleepHours > 0 ? `${healthMetrics.sleepHours} hrs` : '--'}</Text>
              <Text style={styles.healthLabel}>Sleep</Text>
              <Text style={styles.healthStatus}>{healthMetrics.sleepHours > 0 ? (healthMetrics.sleepHours >= 7 ? 'Good' : healthMetrics.sleepHours >= 5 ? 'Fair' : 'Poor') : 'No data'}</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Today's Goals */}
      <Card style={styles.lastSection}>
        <CardHeader>
          <Text style={styles.cardTitle}>Today's Goals</Text>
        </CardHeader>
        <CardContent>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Complete morning workout</Text>
            <Text style={styles.goalDone}>✓ Done</Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Drink {waterGoal} glasses of water</Text>
            <Text style={waterGlasses >= waterGoal ? styles.goalDone : styles.goalProgress}>
              {waterGlasses >= waterGoal ? '✓ Done' : `${waterGlasses}/${waterGoal}`}
            </Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Log all meals</Text>
            <Text style={styles.goalWarning}>2/3</Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Reach {healthMetrics.stepsGoal.toLocaleString()} steps</Text>
            <Text style={healthMetrics.steps >= healthMetrics.stepsGoal ? styles.goalDone : styles.goalProgress}>
              {healthMetrics.steps >= healthMetrics.stepsGoal ? '✓ Done' : healthMetrics.steps.toLocaleString()}
            </Text>
          </View>
        </CardContent>
      </Card>
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
  welcomeText: {
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
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitleRowTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  chatContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  messageRow: {
    marginBottom: 8,
  },
  userMessageRow: {
    alignItems: "flex-end",
  },
  assistantMessageRow: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: colors.primary[600],
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.gray[900],
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.primary[600],
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  calorieHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  calorieIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  calorieLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  calorieValues: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  calorieMain: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.white,
  },
  calorieGoal: {
    fontSize: 20,
    color: "rgba(255,255,255,0.75)",
  },
  remainingBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  remainingValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
  },
  remainingLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  calorieStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  calorieStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  calorieStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
  },
  calorieStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  statProgress: {
    marginTop: 12,
  },
  healthGrid: {
    flexDirection: "row",
    gap: 12,
  },
  healthCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  healthStatus: {
    fontSize: 12,
    color: colors.green[600],
    marginTop: 4,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  goalText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  goalDone: {
    fontSize: 14,
    color: colors.green[600],
    fontWeight: "500",
  },
  goalProgress: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "500",
  },
  goalWarning: {
    fontSize: 14,
    color: colors.orange[500],
    fontWeight: "500",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  tapHintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  syncBadgeText: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: "500",
  },
});
