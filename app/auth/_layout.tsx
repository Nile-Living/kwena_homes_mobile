import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1e293b" : "#ffffff",
          },
          headerTintColor: colorScheme === "dark" ? "#e2e8f0" : "#1f2937",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="signin" options={{ title: "Sign In" }} />
        <Stack.Screen name="signup" options={{ title: "Create Account" }} />
      </Stack>
    </>
  );
}