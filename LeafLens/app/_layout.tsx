import { AuthProvider } from "../components/AuthProvider";
import { PhotoProvider } from "../components/PhotoContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="inverted" />
      <PhotoProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PhotoProvider>
    </AuthProvider>
  );
}