import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#3A3A3A",
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#F4B514",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontFamily: "Satoshi-Medium",
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: "Archive",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "archive" : "archive-outline"}
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Diary Chat",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-account"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="expense-tracker"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="mood-tracker"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="health-tracker"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
