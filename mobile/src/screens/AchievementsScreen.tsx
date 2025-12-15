import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardContent,
  Progress,
  Badge,
} from "../components/ui";
import { colors, gradients } from "../theme/colors";
import { storageUtils, Achievement } from "../utils/storage";

export function AchievementsScreen() {
  const [activeTab, setActiveTab] = useState<"unlocked" | "locked">("unlocked");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const stored = await storageUtils.getAchievements();
    setAchievements(stored);
  };

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "workout":
        return [colors.orange[400], colors.red[500]];
      case "nutrition":
        return [colors.green[400], colors.emerald[500]];
      case "streak":
        return [colors.yellow[400], colors.orange[500]];
      case "milestone":
        return [colors.purple[500], colors.pink[500]];
      default:
        return [colors.gray[400], colors.gray[500]];
    }
  };

  const categoryStats = [
    {
      label: "Workouts",
      icon: "💪",
      count: achievements.filter((a) => a.category === "workout" && a.unlocked)
        .length,
    },
    {
      label: "Nutrition",
      icon: "🥗",
      count: achievements.filter(
        (a) => a.category === "nutrition" && a.unlocked,
      ).length,
    },
    {
      label: "Streaks",
      icon: "🔥",
      count: achievements.filter((a) => a.category === "streak" && a.unlocked)
        .length,
    },
    {
      label: "Milestones",
      icon: "🏆",
      count: achievements.filter(
        (a) => a.category === "milestone" && a.unlocked,
      ).length,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          Track your fitness journey milestones
        </Text>
      </View>

      {/* Stats Overview */}
      <Card gradient={gradients.primary} style={styles.section}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewLabel}>Total Achievements</Text>
            <Text style={styles.overviewValue}>
              {unlockedAchievements.length}/{achievements.length}
            </Text>
          </View>
          <Ionicons name="trophy" size={64} color="rgba(255,255,255,0.8)" />
        </View>
        <Progress
          value={achievements.length > 0 ? (unlockedAchievements.length / achievements.length) * 100 : 0}
          height={8}
          backgroundColor="rgba(255,255,255,0.2)"
          fillColor={colors.white}
        />
        <Text style={styles.overviewSubtext}>
          {achievements.length - unlockedAchievements.length} more to unlock
        </Text>
      </Card>

      {/* Category Stats */}
      <View style={styles.categoryGrid}>
        {categoryStats.map((stat, index) => (
          <Card key={index} style={styles.categoryCard}>
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor:
                    getCategoryColor(stat.label.toLowerCase())[0] + "30",
                },
              ]}
            >
              <Text style={styles.categoryEmoji}>{stat.icon}</Text>
            </View>
            <Text style={styles.categoryCount}>{stat.count}</Text>
            <Text style={styles.categoryLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "unlocked" && styles.activeTab]}
          onPress={() => setActiveTab("unlocked")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "unlocked" && styles.activeTabText,
            ]}
          >
            Unlocked ({unlockedAchievements.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "locked" && styles.activeTab]}
          onPress={() => setActiveTab("locked")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "locked" && styles.activeTabText,
            ]}
          >
            Locked ({lockedAchievements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Achievement List */}
      {(activeTab === "unlocked"
        ? unlockedAchievements
        : lockedAchievements
      ).map((achievement, index, arr) => (
        <Card
          key={achievement.id}
          style={[
            styles.achievementCard,
            achievement.unlocked && styles.unlockedCard,
            index === arr.length - 1 && styles.lastCard,
          ]}
        >
          <View style={styles.achievementRow}>
            <View
              style={[
                styles.achievementIcon,
                achievement.unlocked
                  ? {
                      backgroundColor: getCategoryColor(
                        achievement.category,
                      )[0],
                    }
                  : styles.lockedIcon,
              ]}
            >
              {achievement.unlocked ? (
                <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
              ) : (
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color={colors.gray[400]}
                />
              )}
            </View>

            <View style={styles.achievementInfo}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                {achievement.unlocked ? (
                  <Ionicons name="star" size={20} color={colors.yellow[400]} />
                ) : (
                  <Badge variant="outline">{achievement.category}</Badge>
                )}
              </View>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              {achievement.unlocked ? (
                <View style={styles.achievementMeta}>
                  <Badge>{achievement.category}</Badge>
                  {achievement.date && (
                    <Text style={styles.achievementDate}>
                      Unlocked on {achievement.date}
                    </Text>
                  )}
                </View>
              ) : (
                achievement.progress !== undefined &&
                achievement.total !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>
                        {achievement.progress}/{achievement.total}
                      </Text>
                    </View>
                    <Progress
                      value={(achievement.progress / achievement.total) * 100}
                      height={8}
                    />
                  </View>
                )
              )}
            </View>
          </View>
        </Card>
      ))}

      {/* Next Achievement Card - Only show if there are locked achievements with progress */}
      {(() => {
        const nextAchievement = lockedAchievements.find(
          (a) => a.progress !== undefined && a.total !== undefined && a.progress > 0
        );
        if (!nextAchievement) return null;

        const progressPercent = Math.round(
          ((nextAchievement.progress || 0) / (nextAchievement.total || 1)) * 100
        );
        const remaining = (nextAchievement.total || 0) - (nextAchievement.progress || 0);

        return (
          <Card style={[styles.motivationCard, styles.lastSection]}>
            <View style={styles.motivationHeader}>
              <Text style={styles.motivationEmoji}>{nextAchievement.icon}</Text>
              <Text style={styles.motivationTitle}>Almost There!</Text>
            </View>
            <Text style={styles.motivationText}>
              {remaining} more to unlock "{nextAchievement.title}"
            </Text>
            <View style={styles.nextAchievement}>
              <View style={styles.nextHeader}>
                <Text style={styles.nextLabel}>{nextAchievement.title}</Text>
                <Text style={styles.nextPercent}>{progressPercent}%</Text>
              </View>
              <Progress value={progressPercent} height={8} />
            </View>
          </Card>
        );
      })()}

      {/* Spacer if no motivation card */}
      {!lockedAchievements.find(
        (a) => a.progress !== undefined && a.total !== undefined && a.progress > 0
      ) && <View style={styles.lastSection} />}
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
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  overviewValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
    marginTop: 4,
  },
  overviewSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  categoryCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
  },
  categoryLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
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
  achievementCard: {
    marginTop: 12,
  },
  unlockedCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.green[500],
  },
  lastCard: {
    marginBottom: 16,
  },
  achievementRow: {
    flexDirection: "row",
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: colors.gray[200],
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  motivationCard: {
    backgroundColor: colors.yellow[50],
    borderWidth: 1,
    borderColor: colors.yellow[400],
  },
  lastSection: {
    marginBottom: 100,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  motivationEmoji: {
    fontSize: 24,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  motivationText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
  },
  nextAchievement: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  nextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nextLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  nextPercent: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
});
