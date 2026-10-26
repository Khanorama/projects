import React, { useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


function RecipeCard({ recipe }) {
  const {
    title = "Untitled",
    calorie_count = "",
    labels = [],
    labelMap = {},
    ingredients = [],
    instructions = "",
  } = recipe;

  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((s) => !s);
  };

  const renderBadge = (key) => {
    const meta = labelMap && labelMap[key];
    const text = meta?.text ?? key;
    const bg = meta?.color ?? "#BDBDBD";
    return (
      <View key={key} style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggle}
      style={[styles.card, expanded && styles.cardExpanded]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${calorie_count}. ${labels.join(", ")}`}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {calorie_count ? (
            <Text style={styles.cals}>{calorie_count}</Text>
          ) : null}
        </View>

        <View style={styles.badgesRow}>
          {labels && labels.length > 0 ? (
            labels.map((l) => renderBadge(l))
          ) : (
            <View style={[styles.badge, styles.badgeDefault]}>
              <Text style={styles.badgeText}>No labels</Text>
            </View>
          )}
        </View>
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <FlatList
            data={ingredients}
            keyExtractor={(item, idx) => `${recipe.id}-ing-${idx}`}
            renderItem={({ item }) => (
              <Text style={styles.listItem}>• {item}</Text>
            )}
            scrollEnabled={false}
            nestedScrollEnabled
          />

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Instructions
          </Text>
          <Text style={styles.instructions}>{instructions}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default memo(RecipeCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardExpanded: {
    elevation: 6,
    shadowOpacity: 0.12,
  },
  header: {
    flexDirection: "column",
  },
  titleBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginRight: 8,
  },
  cals: {
    fontSize: 12,
    color: "#616161",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  badgesRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  badgeDefault: {
    backgroundColor: "#BDBDBD",
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  details: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#424242",
  },
  listItem: {
    fontSize: 13,
    color: "#424242",
    marginBottom: 4,
  },
  instructions: {
    fontSize: 13,
    color: "#424242",
    lineHeight: 18,
  },
});
