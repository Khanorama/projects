import { StyleSheet, TextInput, View } from "react-native";
import colors from "../styles/colors";

type PropsType = {
  hide: boolean;
  title: string;
  value: string;
  onChange: (text: string) => void;
};

const TextField = ({ hide, title, value, onChange }: PropsType) => {
  return (
    <View style={styles.card}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputIn}
          placeholder={title}
          placeholderTextColor={colors.mediumgrey}
          secureTextEntry={hide}
          value={value}
          onChangeText={onChange}
        />
        </View>
    </View>
  );
};

export default TextField;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightbackground,
    padding: 17,
    borderRadius: 22,
    marginBottom: 20,

    borderWidth: 2,
    borderColor: colors.primarylight,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputWrapper: {
    backgroundColor: colors.lightbackground,
    flexDirection: "row",
    alignItems: "center",
    
    paddingHorizontal: 16,
    borderColor: colors.secondary,
  },
  inputWrapperIn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.secondary,
    flex: 1,
  },

  inputIn: {
    fontSize: 16,
    color: colors.darkgrey,
  },
});
