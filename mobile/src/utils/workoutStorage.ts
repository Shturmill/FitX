import AsyncStorage from "@react-native-async-storage/async-storage";

const WORKOUT_PROGRAMS_KEY = "@fitx_workout_programs";
const WORKOUT_HISTORY_KEY = "@fitx_workout_history";
const ACTIVE_SESSION_KEY = "@fitx_active_session";

// ============ Data Models ============

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds, for time-based exercises
  restTime: number; // seconds between sets
  weight?: number; // optional target weight in kg
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // estimated minutes
  category: string;
  exercises: Exercise[];
}

export interface CompletedSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  completed: boolean;
  timestamp: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps?: number;
  completedSets: CompletedSet[];
  skipped: boolean;
}

export interface WorkoutSession {
  id: string;
  programId: string;
  programName: string;
  startTime: number;
  currentExerciseIndex: number;
  currentSetIndex: number;
  exerciseProgress: ExerciseProgress[];
  isRestPhase: boolean;
  restEndTime?: number;
  program: WorkoutProgram;
}

export interface CompletedWorkout {
  id: string;
  programId: string;
  programName: string;
  date: string;
  startTime: number;
  endTime: number;
  duration: number; // actual minutes
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  exercises: ExerciseProgress[];
}

// ============ Mock Data ============

const MOCK_PROGRAMS: WorkoutProgram[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    description: "Build upper body strength with compound movements",
    difficulty: "beginner",
    duration: 45,
    category: "strength",
    exercises: [
      { id: "1-1", name: "Push-ups", sets: 3, reps: 12, restTime: 60 },
      { id: "1-2", name: "Dumbbell Rows", sets: 3, reps: 10, restTime: 60, weight: 10 },
      { id: "1-3", name: "Shoulder Press", sets: 3, reps: 10, restTime: 60, weight: 8 },
      { id: "1-4", name: "Bicep Curls", sets: 3, reps: 12, restTime: 45, weight: 6 },
      { id: "1-5", name: "Tricep Dips", sets: 3, reps: 10, restTime: 45 },
    ],
  },
  {
    id: "2",
    name: "HIIT Cardio Blast",
    description: "High intensity interval training for maximum calorie burn",
    difficulty: "intermediate",
    duration: 30,
    category: "cardio",
    exercises: [
      { id: "2-1", name: "Burpees", sets: 4, reps: 10, restTime: 30 },
      { id: "2-2", name: "Jump Squats", sets: 4, reps: 15, restTime: 30 },
      { id: "2-3", name: "Mountain Climbers", sets: 4, duration: 30, restTime: 20 },
      { id: "2-4", name: "High Knees", sets: 4, duration: 30, restTime: 20 },
      { id: "2-5", name: "Box Jumps", sets: 3, reps: 12, restTime: 30 },
    ],
  },
  {
    id: "3",
    name: "Lower Body Power",
    description: "Build strong legs and glutes",
    difficulty: "intermediate",
    duration: 50,
    category: "strength",
    exercises: [
      { id: "3-1", name: "Barbell Squats", sets: 4, reps: 10, restTime: 90, weight: 40 },
      { id: "3-2", name: "Romanian Deadlifts", sets: 4, reps: 10, restTime: 90, weight: 30 },
      { id: "3-3", name: "Walking Lunges", sets: 3, reps: 12, restTime: 60 },
      { id: "3-4", name: "Leg Press", sets: 3, reps: 12, restTime: 60, weight: 60 },
      { id: "3-5", name: "Calf Raises", sets: 4, reps: 15, restTime: 45 },
    ],
  },
  {
    id: "4",
    name: "Core & Abs",
    description: "Strengthen your core for better stability",
    difficulty: "beginner",
    duration: 20,
    category: "core",
    exercises: [
      { id: "4-1", name: "Plank", sets: 3, duration: 45, restTime: 30 },
      { id: "4-2", name: "Crunches", sets: 3, reps: 20, restTime: 30 },
      { id: "4-3", name: "Russian Twists", sets: 3, reps: 20, restTime: 30 },
      { id: "4-4", name: "Leg Raises", sets: 3, reps: 15, restTime: 30 },
      { id: "4-5", name: "Dead Bug", sets: 3, reps: 10, restTime: 30 },
    ],
  },
  {
    id: "5",
    name: "Full Body Circuit",
    description: "Complete full body workout with compound movements",
    difficulty: "advanced",
    duration: 60,
    category: "strength",
    exercises: [
      { id: "5-1", name: "Deadlifts", sets: 4, reps: 8, restTime: 90, weight: 50 },
      { id: "5-2", name: "Bench Press", sets: 4, reps: 10, restTime: 90, weight: 40 },
      { id: "5-3", name: "Pull-ups", sets: 4, reps: 8, restTime: 60 },
      { id: "5-4", name: "Overhead Press", sets: 3, reps: 10, restTime: 60, weight: 25 },
      { id: "5-5", name: "Barbell Rows", sets: 3, reps: 10, restTime: 60, weight: 30 },
      { id: "5-6", name: "Front Squats", sets: 3, reps: 10, restTime: 60, weight: 35 },
    ],
  },
];

// ============ Storage Utilities ============

export const workoutStorage = {
  // Programs
  async getPrograms(): Promise<WorkoutProgram[]> {
    try {
      const data = await AsyncStorage.getItem(WORKOUT_PROGRAMS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with mock data on first launch
      await this.initializeMockData();
      return MOCK_PROGRAMS;
    } catch (error) {
      console.error("Error loading workout programs:", error);
      return MOCK_PROGRAMS;
    }
  },

  async initializeMockData(): Promise<void> {
    try {
      await AsyncStorage.setItem(WORKOUT_PROGRAMS_KEY, JSON.stringify(MOCK_PROGRAMS));
    } catch (error) {
      console.error("Error initializing mock data:", error);
    }
  },

  async saveProgram(program: WorkoutProgram): Promise<void> {
    try {
      const programs = await this.getPrograms();
      const existingIndex = programs.findIndex((p) => p.id === program.id);
      if (existingIndex >= 0) {
        programs[existingIndex] = program;
      } else {
        programs.push(program);
      }
      await AsyncStorage.setItem(WORKOUT_PROGRAMS_KEY, JSON.stringify(programs));
    } catch (error) {
      console.error("Error saving program:", error);
    }
  },

  // Workout History
  async getHistory(): Promise<CompletedWorkout[]> {
    try {
      const data = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error("Error loading workout history:", error);
      return [];
    }
  },

  async saveWorkoutToHistory(workout: CompletedWorkout): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(workout); // Add to beginning (most recent first)
      // Keep only last 100 workouts
      const trimmedHistory = history.slice(0, 100);
      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("Error saving workout to history:", error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WORKOUT_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  },

  // Active Session (for crash recovery)
  async getActiveSession(): Promise<WorkoutSession | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Error loading active session:", error);
      return null;
    }
  },

  async saveActiveSession(session: WorkoutSession): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Error saving active session:", error);
    }
  },

  async clearActiveSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error("Error clearing active session:", error);
    }
  },

  // Helper functions
  calculateTotalSets(program: WorkoutProgram): number {
    return program.exercises.reduce((total, ex) => total + ex.sets, 0);
  },

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  formatRestTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return secs > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${mins}:00`;
    }
    return `0:${secs.toString().padStart(2, "0")}`;
  },
};
