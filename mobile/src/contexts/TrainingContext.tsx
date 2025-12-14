import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  WorkoutProgram,
  WorkoutSession,
  CompletedWorkout,
  ExerciseProgress,
  CompletedSet,
  workoutStorage,
} from "../utils/workoutStorage";

interface TrainingContextType {
  programs: WorkoutProgram[];
  history: CompletedWorkout[];
  activeSession: WorkoutSession | null;
  isLoading: boolean;

  // Program actions
  loadPrograms: () => Promise<void>;

  // History actions
  loadHistory: () => Promise<void>;

  // Session actions
  startWorkout: (program: WorkoutProgram) => Promise<void>;
  completeSet: (reps?: number, weight?: number) => Promise<void>;
  skipExercise: () => Promise<void>;
  nextExercise: () => Promise<void>;
  startRest: () => void;
  endRest: () => void;
  endWorkout: (completed: boolean) => Promise<CompletedWorkout | null>;
  resumeSession: (session: WorkoutSession) => void;

  // Computed values
  getCurrentExercise: () => WorkoutProgram["exercises"][0] | null;
  getWorkoutProgress: () => { exercisesCompleted: number; totalExercises: number; setsCompleted: number; totalSets: number };
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadPrograms();
      await loadHistory();
      await checkActiveSession();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Auto-save active session when it changes
  useEffect(() => {
    if (activeSession) {
      workoutStorage.saveActiveSession(activeSession);
    }
  }, [activeSession]);

  const loadPrograms = async () => {
    const loadedPrograms = await workoutStorage.getPrograms();
    setPrograms(loadedPrograms);
  };

  const loadHistory = async () => {
    const loadedHistory = await workoutStorage.getHistory();
    setHistory(loadedHistory);
  };

  const checkActiveSession = async () => {
    const session = await workoutStorage.getActiveSession();
    if (session) {
      setActiveSession(session);
    }
  };

  const startWorkout = async (program: WorkoutProgram) => {
    const exerciseProgress: ExerciseProgress[] = program.exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetSets: ex.sets,
      targetReps: ex.reps,
      completedSets: [],
      skipped: false,
    }));

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      programId: program.id,
      programName: program.name,
      startTime: Date.now(),
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      exerciseProgress,
      isRestPhase: false,
      program,
    };

    setActiveSession(newSession);
    await workoutStorage.saveActiveSession(newSession);
  };

  const completeSet = async (reps?: number, weight?: number) => {
    if (!activeSession) return;

    const updatedSession = { ...activeSession };
    const currentProgress = updatedSession.exerciseProgress[updatedSession.currentExerciseIndex];
    const currentExercise = updatedSession.program.exercises[updatedSession.currentExerciseIndex];

    const completedSet: CompletedSet = {
      setNumber: updatedSession.currentSetIndex + 1,
      reps: reps ?? currentExercise.reps,
      weight: weight ?? currentExercise.weight,
      completed: true,
      timestamp: Date.now(),
    };

    currentProgress.completedSets.push(completedSet);

    // Check if all sets for this exercise are done
    if (currentProgress.completedSets.length >= currentExercise.sets) {
      // Move to next exercise
      if (updatedSession.currentExerciseIndex < updatedSession.program.exercises.length - 1) {
        updatedSession.currentExerciseIndex++;
        updatedSession.currentSetIndex = 0;
        updatedSession.isRestPhase = false;
      }
    } else {
      // Move to next set, start rest phase
      updatedSession.currentSetIndex++;
      updatedSession.isRestPhase = true;
      updatedSession.restEndTime = Date.now() + currentExercise.restTime * 1000;
    }

    setActiveSession(updatedSession);
  };

  const skipExercise = async () => {
    if (!activeSession) return;

    const updatedSession = { ...activeSession };
    const currentProgress = updatedSession.exerciseProgress[updatedSession.currentExerciseIndex];
    currentProgress.skipped = true;

    // Move to next exercise or mark workout complete
    if (updatedSession.currentExerciseIndex < updatedSession.program.exercises.length - 1) {
      updatedSession.currentExerciseIndex++;
      updatedSession.currentSetIndex = 0;
      updatedSession.isRestPhase = false;
      setActiveSession(updatedSession);
    } else {
      // This was the last exercise - mark as complete by moving index past the end
      updatedSession.currentExerciseIndex++;
      updatedSession.isRestPhase = false;
      setActiveSession(updatedSession);
    }
  };

  const nextExercise = async () => {
    if (!activeSession) return;

    const updatedSession = { ...activeSession };

    if (updatedSession.currentExerciseIndex < updatedSession.program.exercises.length - 1) {
      updatedSession.currentExerciseIndex++;
      updatedSession.currentSetIndex = 0;
      updatedSession.isRestPhase = false;
    }

    setActiveSession(updatedSession);
  };

  const startRest = () => {
    if (!activeSession) return;

    const currentExercise = activeSession.program.exercises[activeSession.currentExerciseIndex];
    setActiveSession({
      ...activeSession,
      isRestPhase: true,
      restEndTime: Date.now() + currentExercise.restTime * 1000,
    });
  };

  const endRest = () => {
    if (!activeSession) return;

    setActiveSession({
      ...activeSession,
      isRestPhase: false,
      restEndTime: undefined,
    });
  };

  const endWorkout = async (completed: boolean): Promise<CompletedWorkout | null> => {
    if (!activeSession) return null;

    const endTime = Date.now();
    const duration = Math.round((endTime - activeSession.startTime) / 60000); // minutes

    let setsCompleted = 0;
    let totalSets = 0;
    let exercisesCompleted = 0;

    activeSession.exerciseProgress.forEach((progress, index) => {
      const exercise = activeSession.program.exercises[index];
      totalSets += exercise.sets;
      setsCompleted += progress.completedSets.filter((s) => s.completed).length;

      // Consider exercise completed if at least one set was done
      if (progress.completedSets.length > 0 && !progress.skipped) {
        exercisesCompleted++;
      }
    });

    const completedWorkout: CompletedWorkout = {
      id: activeSession.id,
      programId: activeSession.programId,
      programName: activeSession.programName,
      date: new Date().toISOString().split("T")[0],
      startTime: activeSession.startTime,
      endTime,
      duration,
      exercisesCompleted,
      totalExercises: activeSession.program.exercises.length,
      setsCompleted,
      totalSets,
      exercises: activeSession.exerciseProgress,
    };

    await workoutStorage.saveWorkoutToHistory(completedWorkout);
    await workoutStorage.clearActiveSession();

    setActiveSession(null);
    await loadHistory(); // Refresh history

    return completedWorkout;
  };

  const resumeSession = (session: WorkoutSession) => {
    setActiveSession(session);
  };

  const getCurrentExercise = () => {
    if (!activeSession) return null;
    return activeSession.program.exercises[activeSession.currentExerciseIndex] ?? null;
  };

  const getWorkoutProgress = () => {
    if (!activeSession) {
      return { exercisesCompleted: 0, totalExercises: 0, setsCompleted: 0, totalSets: 0 };
    }

    let setsCompleted = 0;
    let totalSets = 0;
    let exercisesCompleted = 0;

    activeSession.exerciseProgress.forEach((progress, index) => {
      const exercise = activeSession.program.exercises[index];
      totalSets += exercise.sets;
      setsCompleted += progress.completedSets.filter((s) => s.completed).length;

      // Consider exercise completed if all sets done or skipped
      if (progress.completedSets.length >= exercise.sets || progress.skipped) {
        exercisesCompleted++;
      }
    });

    return {
      exercisesCompleted,
      totalExercises: activeSession.program.exercises.length,
      setsCompleted,
      totalSets,
    };
  };

  const value: TrainingContextType = {
    programs,
    history,
    activeSession,
    isLoading,
    loadPrograms,
    loadHistory,
    startWorkout,
    completeSet,
    skipExercise,
    nextExercise,
    startRest,
    endRest,
    endWorkout,
    resumeSession,
    getCurrentExercise,
    getWorkoutProgress,
  };

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error("useTraining must be used within a TrainingProvider");
  }
  return context;
}
