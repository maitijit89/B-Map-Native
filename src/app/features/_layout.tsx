import { Stack } from 'expo-router';

export default function FeaturesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="fastag" />
      <Stack.Screen name="ev-charging" />
      <Stack.Screen name="digipin" />
      <Stack.Screen name="fare-estimator" />
      <Stack.Screen name="sos" />
      <Stack.Screen name="environment" />
      <Stack.Screen name="report-hazard" />
    </Stack>
  );
}
