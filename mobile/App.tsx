import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { FoodProvider } from "./src/contexts/FoodContext";
import { TrainingProvider } from "./src/contexts/TrainingContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { colors } from "./src/theme/colors";

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FoodProvider>
          <TrainingProvider>
            <AppContent />
          </TrainingProvider>
        </FoodProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
});
