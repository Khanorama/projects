import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import SnapScreen from "../screens/SnapScreen";
import LLMScreen from "../screens/LLMScreen";
import WelcomeScreen from "../screens/WelcomeScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  primary: "#2E8B57",
  dark: "#243228",
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Snap")
            iconName = focused ? "camera" : "camera-outline";
          else if (route.name === "Chat")
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#EEF6EE" },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Healthy Recipes" }}
      />
      <Tab.Screen
        name="Snap"
        component={SnapScreen}
        options={{ title: "Snap an Ingredient" }}
      />
      <Tab.Screen
        name="Chat"
        component={LLMScreen}
        options={{ title: "AI Chef Chat" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
  );
}
