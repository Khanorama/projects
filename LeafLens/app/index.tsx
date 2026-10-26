import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import { useRouter } from "expo-router";
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Auth from "../components/Auth";

export default function Index() {
  const router = useRouter();
  const {session, isLoading} = useAuth();
  useEffect(() => {
    if (session?.user) {
      // Replace prevents going "back" to login screen
      router.replace("/(tabs)");
    }
  }, [router, session]);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (session?.user) {
    // redirecting, so nothing to render
    return null;
  }

  return (
    <View style={styles.container}>
     
      <Auth />
      
    </View>
  )
}


const styles = StyleSheet.create({
    container: {
    flex: 5,
    justifyContent: "center", 
    paddingHorizontal: 30,
    backgroundColor: colors.lightbackground,
  },
})


