import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Shirt, Flame, Focus } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopWidth: 1,
          borderTopColor: '#18181b', // zinc-900
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarActiveTintColor: '#fafafa', // zinc-50
        tabBarInactiveTintColor: '#52525b', // zinc-600
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color, focused }) => (
            <Shirt color={color} size={focused ? 26 : 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          title: 'Fuel',
          tabBarIcon: ({ color, focused }) => (
            <Flame color={color} size={focused ? 26 : 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, focused }) => (
            <Focus color={color} size={focused ? 26 : 24} />
          ),
        }}
      />
    </Tabs>
  );
}
