import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WorkoutProgram } from "../utils/workoutStorage";
import {
  ProgramListScreen,
  ProgramDetailsScreen,
  WorkoutRunScreen,
  WorkoutHistoryScreen,
  CustomWorkoutScreen,
} from "../screens/training";
import { colors } from "../theme/colors";

export type TrainingStackParamList = {
  ProgramList: undefined;
  ProgramDetails: { program: WorkoutProgram };
  WorkoutRun: { program: WorkoutProgram };
  WorkoutHistory: undefined;
  CustomWorkout: { program?: WorkoutProgram } | undefined;
};

const Stack = createNativeStackNavigator<TrainingStackParamList>();

export function TrainingStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[50] },
      }}
    >
      <Stack.Screen name="ProgramList" component={ProgramListScreen} />
      <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
      <Stack.Screen
        name="WorkoutRun"
        component={WorkoutRunScreen}
        options={{
          gestureEnabled: false, // Prevent accidental back swipe during workout
        }}
      />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <Stack.Screen name="CustomWorkout" component={CustomWorkoutScreen} />
    </Stack.Navigator>
  );
}
