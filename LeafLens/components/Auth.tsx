import Button from "@/components/Button";
import Password from "@/components/Password";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

//used chatGPT for the function to check username and password

const Auth = () => {
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Supabase token refresh must be paused when app is backgrounded
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        try {
          supabase.auth.stopAutoRefresh();
        } catch {}
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    if (AppState.currentState === "active") {
      supabase.auth.startAutoRefresh();
    }

    return () => {
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      }
      try {
        supabase.auth.stopAutoRefresh();
      } catch {}
    };
  }, []);

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    }
  }

  async function signUpWithEmail() {
    const { isValid, errors } = checkErrors(email, password);
    if (!isValid) {
      Alert.alert("Can't sign up yet", errors.join("\n"));
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    }
  }

  const checkErrors = (username: string, password: string) => {
    const errors: string[] = [];

    if (username.length === 0) errors.push("Email is empty");
    if (!password) errors.push("Password is empty");
    if (password.length < 6)
      errors.push("Password must be at least 6 characters");
    if (!/\d/.test(password)) errors.push("Password must contain a number");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to LeafLens!</Text>
      </View>
      <TextField
        hide={false}
        title="Username"
        value={email}
        onChange={setEmail}
      />
      <View style={styles.input}>
        <Password value={password} onChange={setPassword} />
        <Button title="Sign in" onPress={signInWithEmail} />
        <Button title="Sign up" onPress={signUpWithEmail} />
      </View>
    </View>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: {
    flex: 5,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: colors.secondary,
  },
  input: {
    marginBottom:50,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.darkbackground,
    textAlign: "center",
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
});
