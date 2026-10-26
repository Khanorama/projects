import React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";
import colors from "../styles/colors";

type PropsType = {
  title: string;
  onPress: () => void;
};

const Button: React.FC<PropsType> = ({ title, onPress }) => {
  return (
    
    <TouchableHighlight
      style={styles.button}
      underlayColor={colors.secondary}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableHighlight>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 13,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.textondark,
    fontSize: 16,
    fontWeight: "600",
  },
});

