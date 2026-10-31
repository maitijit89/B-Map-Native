import React from 'react';
import { Tabs } from 'expo-router';
import { Route, Store, Car, User } from 'lucide-react-native';
import { AnimatedTabBar } from '@/shared/components/navigation/AnimatedTabBar';
import { DynamicCompassIcon } from '@/shared/components/ui';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size }) => (
            <DynamicCompassIcon size={size || 22} dynamic={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Routes',
          tabBarIcon: ({ color, focused, size }) => (
            <Route size={size || 22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, focused, size }) => (
            <Store size={size || 22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused, size }) => (
            <Car size={size || 22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="mine"
        options={{
          title: 'Mine',
          tabBarIcon: ({ color, focused, size }) => (
            <User size={size || 22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
