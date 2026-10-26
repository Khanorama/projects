import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<{ Welcome: undefined; MainTabs: undefined }, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Welcome to SnapCook</Text>
      <Text style={styles.tagline}> Healthy Recipes in a Snap! </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("MainTabs")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E8B57",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
    width: 150,
    height: 150,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#2E8B57",
    fontSize: 18,
    fontWeight: "600",
  },
});
