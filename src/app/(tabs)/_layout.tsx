import { COLORS } from "@/src/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.light,

          paddingTop: 5,
          height: 50 + insets.bottom,
        },
        headerStyle: {
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.light,
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={!focused ? "home-outline" : "home"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          headerShown: false,
          title: "Team",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={!focused ? "people-outline" : "people"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",

          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? "checkbox-marked-circle"
                  : "checkbox-marked-circle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
