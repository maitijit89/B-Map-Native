import { Stack } from 'expo-router';

export default function NavigateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="route-planner" />
      <Stack.Screen name="live" />
    </Stack>
  );
}
