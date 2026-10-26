import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../styles/colors";

type PropsType = {
  value: string;
  onChange: (text: string) => void;
};

const Password = ({ value, onChange}: PropsType) => {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.card}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={value}
          placeholderTextColor={colors.mediumgrey}
          secureTextEntry={hidden}
          onChangeText={onChange}
        />

        <TouchableOpacity
          onPress={() => setHidden(!hidden)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {hidden ? "Show" : "Hide"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Password;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightbackground,
    padding: 10,
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primarylight,
  },

  inputWrapper: {
    backgroundColor: colors.lightbackground,
    flexDirection: "row",
    alignItems: "center",
    
    paddingHorizontal: 16,
    borderColor: colors.secondary,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkgrey,
    paddingVertical: 2,
  },

  toggleButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  toggleText: {
    color: colors.textondark,
    fontSize: 14,
    fontWeight: "600",
  },
});
