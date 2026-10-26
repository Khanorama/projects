import Auth from '@/components/Auth';
import { useAuth } from '@/components/AuthProvider';
import { Tabs } from "expo-router";
import { View } from "react-native";
import colors from "../../styles/colors";
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppHeader from '@/components/AppHeader';

export default function TabsLayout() {
const { session } = useAuth();


  // signed out while in the tabs: show the sign-in form here instead of navigating back to /
  if (session === null) {
    return (
      <View style={{ flex: 1 }}>
        <Auth />
      </View>
    );
  }



  return (
    <View style={{flex:1}}>
      <AppHeader />
    <Tabs
      screenOptions={{
         headerShown: false,
        tabBarActiveTintColor: colors.primarylight,
        tabBarInactiveTintColor: colors.mediumgrey,
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerShadowVisible: false,
        
        headerTintColor: colors.darkbackground,
        tabBarStyle: {
          backgroundColor: colors.lightbackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Camera",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "camera" : "camera-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          headerTitle: "Community",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          headerTitle: "Map",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerTitle: "Search",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? "magnify-expand" : "magnify"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          headerTitle: "Scan History",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? "leaf-maple" : "leaf-maple-off"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name={focused ? "account-circle" : "account-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
