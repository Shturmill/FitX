import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardContent, Progress, Badge, Button } from '../components/ui';
import { colors, gradients } from '../theme/colors';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
}

interface Workout {
  id: string;
  name: string;
  duration: string;
  calories: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exercises: Exercise[];
}

export function TrainingScreen() {
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const workoutPlans: Workout[] = [
    {
      id: '1',
      name: 'Upper Body Strength',
      duration: '45 min',
      calories: '320',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: [
        { name: 'Bench Press', sets: '4', reps: '8-10' },
        { name: 'Dumbbell Rows', sets: '4', reps: '10-12' },
        { name: 'Shoulder Press', sets: '3', reps: '10' },
        { name: 'Bicep Curls', sets: '3', reps: '12' },
        { name: 'Tricep Dips', sets: '3', reps: '12' },
      ],
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      duration: '30 min',
      calories: '450',
      difficulty: 'Advanced',
      category: 'Cardio',
      exercises: [
        { name: 'Burpees', sets: '4', reps: '15' },
        { name: 'Mountain Climbers', sets: '4', reps: '20' },
        { name: 'Jump Squats', sets: '4', reps: '15' },
        { name: 'High Knees', sets: '4', reps: '30 sec' },
      ],
    },
    {
      id: '3',
      name: 'Lower Body Power',
      duration: '50 min',
      calories: '380',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: [
        { name: 'Squats', sets: '4', reps: '10' },
        { name: 'Deadlifts', sets: '4', reps: '8' },
        { name: 'Lunges', sets: '3', reps: '12 each' },
        { name: 'Leg Press', sets: '3', reps: '12' },
      ],
    },
    {
      id: '4',
      name: 'Core & Abs',
      duration: '25 min',
      calories: '180',
      difficulty: 'Beginner',
      category: 'Core',
      exercises: [
        { name: 'Plank', sets: '3', reps: '60 sec' },
        { name: 'Crunches', sets: '3', reps: '20' },
        { name: 'Russian Twists', sets: '3', reps: '20' },
        { name: 'Leg Raises', sets: '3', reps: '15' },
      ],
    },
  ];

  const workoutHistory = [
    { date: 'Today, 7:30 AM', name: 'Upper Body Strength', duration: '42 min', calories: '305' },
    { date: 'Yesterday, 6:00 PM', name: 'HIIT Cardio Blast', duration: '28 min', calories: '420' },
    { date: 'Nov 28, 7:00 AM', name: 'Lower Body Power', duration: '48 min', calories: '365' },
    { date: 'Nov 27, 6:30 PM', name: 'Core & Abs', duration: '25 min', calories: '180' },
  ];

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <Text style={styles.subtitle}>Choose your workout and start training</Text>
      </View>

      {/* Weekly Progress */}
      <Card gradient={gradients.primary} style={styles.section}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>This Week</Text>
            <Text style={styles.progressValue}>4 Workouts</Text>
            <Text style={styles.progressSubtext}>180 min - 1,270 calories burned</Text>
          </View>
          <Ionicons name="trending-up" size={40} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.weekDays}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View
              key={i}
              style={[styles.dayBar, i < 4 ? styles.dayComplete : styles.dayIncomplete]}
            />
          ))}
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
          onPress={() => setActiveTab('plans')}
        >
          <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
            Workout Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'plans' ? (
        <>
          {workoutPlans.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => setSelectedWorkout(workout)}
            >
              <Card style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutTitleRow}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Badge variant={getDifficultyVariant(workout.difficulty) as any}>
                      {workout.difficulty}
                    </Badge>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </View>
                <Text style={styles.workoutCategory}>{workout.category}</Text>

                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>{workout.duration}</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Ionicons name="flame-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>{workout.calories} cal</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Ionicons name="barbell-outline" size={16} color={colors.gray[500]} />
                    <Text style={styles.workoutStatText}>{workout.exercises.length} exercises</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.startButton}>
                  <Ionicons name="play" size={16} color={colors.white} />
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Custom Workout Card */}
          <Card style={[styles.customWorkoutCard, styles.lastSection]}>
            <Ionicons name="barbell" size={48} color={colors.gray[400]} />
            <Text style={styles.customTitle}>Create Custom Workout</Text>
            <Text style={styles.customSubtitle}>Build your own workout routine</Text>
            <Button variant="outline">Get Started</Button>
          </Card>
        </>
      ) : (
        <>
          {/* Stats Overview */}
          <View style={styles.historyStats}>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>18</Text>
              <Text style={styles.historyStatLabel}>Workouts</Text>
            </Card>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>12.5</Text>
              <Text style={styles.historyStatLabel}>Hours</Text>
            </Card>
            <Card style={styles.historyStat}>
              <Text style={styles.historyStatValue}>5.2K</Text>
              <Text style={styles.historyStatLabel}>Calories</Text>
            </Card>
          </View>

          {/* History List */}
          {workoutHistory.map((workout, index) => (
            <Card key={index} style={[styles.historyCard, index === workoutHistory.length - 1 && styles.lastSection]}>
              <View style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{workout.name}</Text>
                  <View style={styles.historyDateRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.gray[500]} />
                    <Text style={styles.historyDate}>{workout.date}</Text>
                  </View>
                  <View style={styles.historyStatsRow}>
                    <View style={styles.workoutStat}>
                      <Ionicons name="time-outline" size={12} color={colors.gray[500]} />
                      <Text style={styles.historyStatText}>{workout.duration}</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Ionicons name="flame-outline" size={12} color={colors.gray[500]} />
                      <Text style={styles.historyStatText}>{workout.calories} cal</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </View>
            </Card>
          ))}
        </>
      )}

      {/* Workout Details Modal */}
      <Modal visible={!!selectedWorkout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
                {selectedWorkout && (
                  <Badge variant={getDifficultyVariant(selectedWorkout.difficulty) as any} style={styles.modalBadge}>
                    {selectedWorkout.difficulty}
                  </Badge>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.workoutStat}>
                <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
                <Text style={styles.workoutStatText}>{selectedWorkout?.duration}</Text>
              </View>
              <View style={styles.workoutStat}>
                <Ionicons name="flame-outline" size={16} color={colors.gray[500]} />
                <Text style={styles.workoutStatText}>{selectedWorkout?.calories} cal</Text>
              </View>
            </View>

            <Text style={styles.exercisesTitle}>Exercises</Text>
            <ScrollView style={styles.exercisesList}>
              {selectedWorkout?.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets x {exercise.reps} reps
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.demoButton}>
                    <Ionicons name="videocam" size={16} color={colors.gray[600]} />
                    <Text style={styles.demoText}>Demo</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Button fullWidth onPress={() => setSelectedWorkout(null)}>
              Start This Workout
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  weekDays: {
    flexDirection: 'row',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.gray[900],
  },
  workoutCard: {
    marginTop: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  workoutCategory: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  customWorkoutCard: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[50],
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 12,
  },
  customSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
    marginBottom: 16,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  historyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  historyStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  historyCard: {
    marginTop: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  historyStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  historyStatText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalBadge: {
    marginTop: 8,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  exercisesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
  },
  demoText: {
    fontSize: 14,
    color: colors.gray[600],
  },
});
