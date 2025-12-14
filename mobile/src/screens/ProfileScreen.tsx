import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardContent,
  Progress,
  Avatar,
  Button,
} from "../components/ui";
import { colors, gradients } from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { useFoodContext } from "../contexts/FoodContext";
import { EditProfileModal } from "../components/EditProfileModal";
import { UserSettings } from "../utils/storage";

export function ProfileScreen() {
  const { userSettings, logout, updateSettings } = useAuth();
  const { reloadUserGoals } = useFoodContext();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async (settings: UserSettings) => {
    try {
      await updateSettings(settings);
      await reloadUserGoals(); // Reload food goals to reflect new settings
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const calculateBMI = () => {
    if (!userSettings) return "0.0";
    const heightInMeters = userSettings.height / 100;
    const bmi = userSettings.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getInitials = () => {
    if (!userSettings?.name) return "FX";
    return userSettings.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGoalText = () => {
    if (!userSettings) return "Maintain Weight";
    const goalMap = {
      lose_weight: "Lose Weight",
      maintain: "Maintain Weight",
      gain_weight: "Gain Weight",
      gain_muscle: "Gain Muscle",
    };
    return goalMap[userSettings.goal];
  };

  const getActivityLevelText = () => {
    if (!userSettings) return "Moderate";
    const activityMap = {
      sedentary: "Sedentary",
      light: "Light",
      moderate: "Moderate",
      active: "Active",
      very_active: "Very Active",
    };
    return activityMap[userSettings.activityLevel];
  };

  const getGenderText = () => {
    if (!userSettings) return "Not Set";
    return userSettings.gender === "male" ? "Male" : "Female";
  };

  if (!userSettings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <Card gradient={gradients.primary} style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.profileRow}>
            <Avatar
              initials={getInitials()}
              size={80}
              gradient={[colors.white, colors.gray[100]]}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userSettings.name}</Text>
              <Text style={styles.profileRole}>Fitness Enthusiast</Text>
              <Text style={styles.profileSince}>
                Member since{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userSettings.weight} kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userSettings.height} cm</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{calculateBMI()}</Text>
            <Text style={styles.statLabel}>BMI</Text>
          </View>
        </View>
      </Card>

      {/* Current Goal */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.cardTitleRow}>
            <Ionicons name="flag" size={20} color={colors.primary[600]} />
            <Text style={styles.cardTitle}>Current Goal</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{getGoalText()}</Text>
            <Text style={styles.goalTarget}>
              {userSettings.calorieGoal} cal/day
            </Text>
          </View>
          <Progress value={65} height={8} style={styles.goalProgress} />
          <Text style={styles.goalSubtext}>Daily calorie target</Text>
          <View style={styles.targetDateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.gray[500]}
            />
            <Text style={styles.targetDate}>
              Protein: {userSettings.proteinGoal}g • Carbs:{" "}
              {userSettings.carbsGoal}g • Fats: {userSettings.fatsGoal}g
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.cardTitleRow}>
            <Ionicons
              name="trending-up"
              size={20}
              color={colors.primary[600]}
            />
            <Text style={styles.cardTitle}>Monthly Statistics</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.monthlyGrid}>
            <View
              style={[
                styles.monthlyCard,
                { backgroundColor: colors.orange[50] },
              ]}
            >
              <Text style={styles.monthlyLabel}>Workouts</Text>
              <Text style={styles.monthlyValue}>--</Text>
              <Text style={styles.monthlyNote}>No data yet</Text>
            </View>
            <View
              style={[styles.monthlyCard, { backgroundColor: colors.blue[50] }]}
            >
              <Text style={styles.monthlyLabel}>Active Days</Text>
              <Text style={styles.monthlyValue}>--</Text>
              <Text style={styles.monthlyNote}>No data yet</Text>
            </View>
            <View
              style={[
                styles.monthlyCard,
                { backgroundColor: colors.green[50] },
              ]}
            >
              <Text style={styles.monthlyLabel}>Avg. Calories</Text>
              <Text style={styles.monthlyValue}>--</Text>
              <Text style={styles.monthlyNote}>No data yet</Text>
            </View>
            <View
              style={[
                styles.monthlyCard,
                { backgroundColor: colors.purple[500] + "15" },
              ]}
            >
              <Text style={styles.monthlyLabel}>Active Time</Text>
              <Text style={styles.monthlyValue}>--</Text>
              <Text style={styles.monthlyNote}>No data yet</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trophy" size={20} color={colors.primary[600]} />
            <Text style={styles.cardTitle}>Recent Achievements</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.emptyAchievements}>
            <Ionicons name="trophy-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No achievements yet</Text>
            <Text style={styles.emptySubtext}>Complete goals to earn achievements</Text>
          </View>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card style={styles.section}>
        <CardHeader>
          <Text style={styles.cardTitle}>Personal Information</Text>
        </CardHeader>
        <CardContent>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{userSettings.age} years</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{getGenderText()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={styles.infoValue}>{getActivityLevelText()}</Text>
          </View>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Text style={styles.infoLabel}>Goal Type</Text>
            <Text style={styles.infoValue}>{getGoalText()}</Text>
          </View>
        </CardContent>
      </Card>

      {/* Actions */}
      <View style={[styles.actionsRow, styles.lastSection]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.red[500]} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {userSettings && (
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleSaveProfile}
          currentSettings={userSettings}
        />
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
  headerCard: {
    marginTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
  },
  profileRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  profileSince: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[700],
  },
  goalTarget: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalSubtext: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  targetDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  targetDate: {
    fontSize: 14,
    color: colors.gray[600],
  },
  monthlyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  monthlyCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
  },
  monthlyLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: 4,
  },
  monthlyChange: {
    fontSize: 12,
    color: colors.green[600],
    marginTop: 4,
  },
  monthlyNote: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  actionsRow: {
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.red[50],
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red[400],
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.red[500],
  },
  emptyAchievements: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[500],
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
});
