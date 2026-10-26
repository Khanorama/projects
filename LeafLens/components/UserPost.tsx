import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import colors from "../styles/colors";

export const REACTIONS = [
  { key: "like",   emoji: "👍", label: "Like"   },
  { key: "love",   emoji: "❤️", label: "Love"   },
  { key: "sprout", emoji: "🌱", label: "Sprout" },
  { key: "fire",   emoji: "🔥", label: "Fire"   },
  { key: "wow",    emoji: "😮", label: "Wow"    },
];

type ReactionEntry = { reaction: string; user_id: string };

type Props = {
  username: string;
  initialText?: string;
  timestamp?: string;
  editable?: boolean;
  imageUrl?: string;
  reactions?: ReactionEntry[];
  currentUserId?: string;
  onPress: () => void;
  onChangeText?: (text: string) => void;
  onReact?: (reaction: string) => void;
};

export default function UserPost({
  username,
  initialText = "",
  timestamp,
  editable = true,
  imageUrl,
  reactions = [],
  currentUserId,
  onPress,
  onChangeText,
  onReact,
}: Props) {
  const [text, setText] = useState(initialText);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined); // set from onLoad so height matches natural image proportions

  const displayTime = timestamp
    ? new Date(timestamp).toLocaleString()
    : new Date().toLocaleString();

  const userReaction = reactions.find((r) => r.user_id === currentUserId)?.reaction;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.time}>{displayTime}</Text>
        </View>

        {/* IMAGE */}
        {!editable && !!imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.postImage, aspectRatio ? { aspectRatio } : { height: 200 }]}
            resizeMode="cover"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              if (width && height) setAspectRatio(width / height);
            }}
          />
        )}

        {/* TEXT */}
        {editable ? (
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(value) => {
              setText(value);
              onChangeText?.(value);
            }}
            placeholder="Make your first post today!"
            placeholderTextColor={colors.mediumgrey}
            multiline
          />
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}

        {/* REACTION BAR */}
        {!editable && (
          <View style={styles.reactionBar}>
            {REACTIONS.map(({ key, emoji }) => {
              const count = reactions.filter((r) => r.reaction === key).length;
              const isActive = userReaction === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.reactionBtn, isActive && styles.reactionBtnActive]}
                  onPress={() => onReact?.(key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  {count > 0 && (
                    <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
                      {count}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightbackground,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  username: {
    fontWeight: "bold",
    color: colors.secondary,
  },
  time: {
    fontSize: 12,
    color: colors.secondary,
  },
  postImage: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  text: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  reactionBar: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reactionBtnActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  reactionEmoji: {
    fontSize: 15,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.darkgrey,
  },
  reactionCountActive: {
    color: "#fff",
  },
});
