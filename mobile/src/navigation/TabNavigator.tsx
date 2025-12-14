import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  DashboardScreen,
  FoodDiaryScreen,
  AchievementsScreen,
  ProfileScreen,
} from "../screens";
import { TrainingStackNavigator } from "./TrainingStackNavigator";
import { colors } from "../theme/colors";
import { TabParamList } from "./RootNavigator";

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = "home" | "book" | "barbell" | "trophy" | "person";

const getTabIcon = (
  routeName: string,
  focused: boolean,
): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, TabIconName> = {
    Home: "home",
    Diary: "book",
    Training: "barbell",
    Awards: "trophy",
    Profile: "person",
  };
  const iconName = icons[routeName] || "home";
  return focused
    ? iconName
    : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap);
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Diary" component={FoodDiaryScreen} />
      <Tab.Screen name="Training" component={TrainingStackNavigator} />
      <Tab.Screen name="Awards" component={AchievementsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabBarLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
