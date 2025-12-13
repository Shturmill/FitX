import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardContent, Progress, Avatar, Button } from '../components/ui';
import { colors, gradients } from '../theme/colors';

export function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <Card gradient={gradients.primary} style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.profileRow}>
            <Avatar initials="JD" size={80} gradient={[colors.white, colors.gray[100]]} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileRole}>Fitness Enthusiast</Text>
              <Text style={styles.profileSince}>Member since Jan 2025</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>68 kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>175 cm</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>23.5</Text>
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
            <Text style={styles.goalTitle}>Lose Weight</Text>
            <Text style={styles.goalTarget}>68 kg → 65 kg</Text>
          </View>
          <Progress value={40} height={8} style={styles.goalProgress} />
          <Text style={styles.goalSubtext}>40% Complete • 1.2 kg lost</Text>
          <View style={styles.targetDateRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.gray[500]} />
            <Text style={styles.targetDate}>Target date: March 15, 2025</Text>
          </View>
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <Card style={styles.section}>
        <CardHeader>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trending-up" size={20} color={colors.primary[600]} />
            <Text style={styles.cardTitle}>Monthly Statistics</Text>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.monthlyGrid}>
            <View style={[styles.monthlyCard, { backgroundColor: colors.orange[50] }]}>
              <Text style={styles.monthlyLabel}>Workouts</Text>
              <Text style={styles.monthlyValue}>18</Text>
              <Text style={styles.monthlyChange}>+3 from last month</Text>
            </View>
            <View style={[styles.monthlyCard, { backgroundColor: colors.blue[50] }]}>
              <Text style={styles.monthlyLabel}>Active Days</Text>
              <Text style={styles.monthlyValue}>22</Text>
              <Text style={styles.monthlyChange}>+5 from last month</Text>
            </View>
            <View style={[styles.monthlyCard, { backgroundColor: colors.green[50] }]}>
              <Text style={styles.monthlyLabel}>Avg. Calories</Text>
              <Text style={styles.monthlyValue}>1,850</Text>
              <Text style={styles.monthlyNote}>Daily average</Text>
            </View>
            <View style={[styles.monthlyCard, { backgroundColor: colors.purple[500] + '15' }]}>
              <Text style={styles.monthlyLabel}>Active Time</Text>
              <Text style={styles.monthlyValue}>42 hrs</Text>
              <Text style={styles.monthlyChange}>+8 hrs from last month</Text>
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
          <View style={[styles.achievementItem, { backgroundColor: colors.yellow[50] }]}>
            <View style={[styles.achievementIcon, { backgroundColor: colors.orange[400] }]}>
              <Text style={styles.achievementEmoji}>🔥</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>7 Day Streak</Text>
              <Text style={styles.achievementDesc}>Completed workouts 7 days in a row</Text>
            </View>
          </View>

          <View style={[styles.achievementItem, { backgroundColor: colors.blue[50] }]}>
            <View style={[styles.achievementIcon, { backgroundColor: colors.blue[400] }]}>
              <Text style={styles.achievementEmoji}>💪</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>First 10K</Text>
              <Text style={styles.achievementDesc}>Reached 10,000 steps milestone</Text>
            </View>
          </View>

          <View style={[styles.achievementItem, { backgroundColor: colors.green[50] }]}>
            <View style={[styles.achievementIcon, { backgroundColor: colors.green[400] }]}>
              <Text style={styles.achievementEmoji}>🎯</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Goal Achiever</Text>
              <Text style={styles.achievementDesc}>Met weekly calorie goals</Text>
            </View>
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
            <Text style={styles.infoValue}>28 years</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>Male</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={styles.infoValue}>Moderately Active</Text>
          </View>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Text style={styles.infoLabel}>Goal Type</Text>
            <Text style={styles.infoValue}>Weight Loss</Text>
          </View>
        </CardContent>
      </Card>

      {/* Actions */}
      <View style={[styles.actionsRow, styles.lastSection]}>
        <Button variant="outline" style={styles.actionButton}>
          Edit Profile
        </Button>
        <Button variant="outline" style={styles.actionButton}>
          Settings
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
  },
  headerCard: {
    marginTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
  },
  goalTarget: {
    fontSize: 16,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetDate: {
    fontSize: 14,
    color: colors.gray[600],
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthlyCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
  },
  monthlyLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: colors.gray[900],
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '500',
    color: colors.gray[900],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
