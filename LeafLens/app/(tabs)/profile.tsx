import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

export default function EditProfileScreen() {
  const { session, isLoading: authLoading } = useAuth();

  // PROFILE STATE
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");

  // LOADING
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!session?.user) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("profiles")
          .select("name, username, location, experience")
          .eq("id", session.user.id)
          .single();

        if (mounted && data) {
          setName(data.name ?? "");
          setUsername(data.username ?? "");
          setLocation(data.location ?? "");
          setExperience(
            data.experience !== null ? String(data.experience) : ""
          );
        }
      } catch {
        Alert.alert("Failed to load profile");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [session]);

  function validateProfile() {
    if (!name.trim()) return Alert.alert("Enter name"), false;
    if (!username.trim()) return Alert.alert("Enter username"), false;
    if (!location.trim()) return Alert.alert("Enter location"), false;
    if (!experience.trim()) return Alert.alert("Enter experience amount"), false;
    return true;
  }

  async function saveProfile() {
    if (!session?.user) return;
    if (!validateProfile()) return;

    setLoading(true);

    const payload = {
      id: session.user.id,
      name: name.trim(),
      username: username.trim(),
      location: location.trim(),
      experience: experience.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload);

    if (error) {
      Alert.alert("Save failed", error.message);
    } else {
      Alert.alert("Profile updated");
    }

    setLoading(false);
  }

  

  if (initialLoading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      
        <View style={styles.center}>
        <Text style={styles.Title}>Edit Your Profile</Text>
        </View>
        <TextField title="Full name" value={name} onChange={setName} hide={false}/>
        <TextField title="Username" value={username} onChange={setUsername} hide={false}/>
        <TextField title="Your current location" value={location} onChange={setLocation} hide={false}/>
        <TextField title="Your gardening experience" value={experience} onChange={setExperience} hide={false}/>

        <Button
          title={loading ? "Saving..." : "Save Profile"}
          onPress={saveProfile}
        />
      

      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  Title: {
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.secondary,
  },
});
