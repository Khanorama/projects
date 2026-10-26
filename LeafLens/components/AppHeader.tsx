import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname } from "expo-router";
import { Alert, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "./AuthProvider";

function getTitleFromPath(pathname: string) {
  if (pathname === "/") return "Scan Plant";
  if (pathname.includes("community")) return "Community Posts";
  if (pathname.includes("map")) return "Community Map";
  if (pathname.includes("profile")) return "Profile";
  if (pathname.includes("search")) return "Search for Plants";
  return "LeafLens";
}

export default function AppHeader() {
  const { session } = useAuth();
  const { top } = useSafeAreaInsets(); // accounts for Dynamic Island / status bar height
  const pathname = usePathname();

  if (!session) return null;

  const title = getTitleFromPath(pathname);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        Alert.alert("Logout failed", error.message);
      }
    } catch (err: any) {
      Alert.alert("Logout failed", err?.message ?? String(err));
    }
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.row}>
        {/* absolute overlay; pointerEvents="none" lets taps reach the logout button behind it */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableHighlight onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={28} color={colors.lightbackground} />
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
  },
  row: {
    height: 54,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.lightbackground,
  },
  logoutBtn: {
    paddingBottom: 1,
  },
});
