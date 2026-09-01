import { Stack } from 'expo-router';

export default function FleetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="request" />
    </Stack>
  );
}
