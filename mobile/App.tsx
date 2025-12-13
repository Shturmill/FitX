import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { FoodProvider } from "./src/contexts/FoodContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <FoodProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </FoodProvider>
    </SafeAreaProvider>
  );
}
