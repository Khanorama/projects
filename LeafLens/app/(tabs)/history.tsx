import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Disease = {
  name: string;
  probability: number;
  description?: string;
  treatment?: string;
};

type Scan = {
  id: string;
  image_url: string | null;
  plant_name: string;
  scientific_name: string;
  plant_family: string;
  confidence: number;
  is_healthy: boolean;
  diseases: Disease[];
  created_at: string;
};

// Individual scan card
function ScanCard({ scan }: { scan: Scan }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(scan.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={styles.cardRow}>
        {scan.image_url ? (
          <Image source={{ uri: scan.image_url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <MaterialCommunityIcons name="leaf" size={28} color={colors.mediumgrey} />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.plantName} numberOfLines={1}>{scan.plant_name}</Text>
          {!!scan.scientific_name && scan.scientific_name !== scan.plant_name && (
            <Text style={styles.scientificName} numberOfLines={1}>{scan.scientific_name}</Text>
          )}
          {scan.plant_family !== "Unknown" && (
            <Text style={styles.plantFamily} numberOfLines={1}>{scan.plant_family}</Text>
          )}
          <View style={styles.badgeRow}>
            <View style={[styles.healthBadge, scan.is_healthy ? styles.healthyBg : styles.unhealthyBg]}>
              <MaterialCommunityIcons
                name={scan.is_healthy ? "check-circle" : "alert-circle"}
                size={12}
                color={scan.is_healthy ? "#2b712f" : "#c0392b"}
              />
              <Text style={[styles.healthText, scan.is_healthy ? styles.healthyText : styles.unhealthyText]}>
                {scan.is_healthy ? "Healthy" : "Disease"}
              </Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{scan.confidence}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.dateText}>{date}</Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.darkgrey}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          {scan.is_healthy ? (
            <Text style={styles.healthyNote}>No diseases detected.</Text>
          ) : (
            <>
              <Text style={styles.expandedTitle}>Detected Issues</Text>
              {scan.diseases.length === 0 ? (
                <Text style={styles.noDiseaseNote}>No specific diseases recorded.</Text>
              ) : (
                scan.diseases.map((d, i) => (
                  <View key={i} style={styles.diseaseRow}>
                    <View style={styles.diseaseMain}>
                      <Text style={styles.diseaseName}>{d.name}</Text>
                      {!!d.description && (
                        <Text style={styles.diseaseDesc} numberOfLines={2}>{d.description}</Text>
                      )}
                    </View>
                    <Text style={styles.diseasePct}>{d.probability}%</Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// History screen
export default function HistoryScreen() {
  const { session } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadScans = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("plant_scans")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) Alert.alert("Error loading history", error.message);
    else setScans(data ?? []);
  }, [session]);

  // useFocusEffect re-fetches every time the tab is opened, not just on mount
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadScans().finally(() => setLoading(false));
    }, [loadScans])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primarylight} />
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="leaf-off" size={64} color={colors.mediumgrey} />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptySubtitle}>
          Take a photo and tap “AI Scan” to identify plants and detect diseases
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ paddingBottom: 30, paddingTop: 12 }}
      data={scans}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScanCard scan={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primarylight}
        />
      }
    />
  );
}

// Styles
const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.lightbackground,
  },
  center: {
    flex: 1,
    backgroundColor: colors.lightbackground,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkbackground,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.darkgrey,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.lightbackground,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.secondary,
  },
  scientificName: {
    fontSize: 12,
    color: colors.primarylight,
    fontStyle: "italic",
    marginTop: 1,
  },
  plantFamily: {
    fontSize: 11,
    color: colors.darkgrey,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  healthyBg: { backgroundColor: "#e8f5e9" },
  unhealthyBg: { backgroundColor: "#fdecea" },
  healthText: { fontSize: 11, fontWeight: "600" },
  healthyText: { color: "#2b712f" },
  unhealthyText: { color: "#c0392b" },
  confidenceBadge: {
    backgroundColor: colors.primarylight,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardRight: {
    alignItems: "flex-end",
    minWidth: 54,
  },
  dateText: {
    fontSize: 11,
    color: colors.mediumgrey,
    textAlign: "right",
  },

  // Expanded section
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  expandedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.darkgrey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  healthyNote: {
    fontSize: 13,
    color: "#2b712f",
    fontStyle: "italic",
  },
  noDiseaseNote: {
    fontSize: 13,
    color: colors.darkgrey,
    fontStyle: "italic",
  },
  diseaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#fef0f0",
  },
  diseaseMain: { flex: 1, marginRight: 8 },
  diseaseName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkbackground,
  },
  diseaseDesc: {
    fontSize: 12,
    color: colors.darkgrey,
    lineHeight: 17,
    marginTop: 2,
  },
  diseasePct: {
    fontSize: 13,
    color: "#c0392b",
    fontWeight: "700",
  },
});
