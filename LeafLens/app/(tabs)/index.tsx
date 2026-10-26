import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system/legacy";
import "react-native-url-polyfill/auto";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const PLANT_ID_KEY = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY ?? "";
const PLANT_ID_URL = "https://plant.id/api/v3/identification";

function parsePlantIdResponse(data: any): ScanResult {
  const result = data?.result ?? {};
  const suggestions: any[] = result?.classification?.suggestions ?? [];

  let plant_name = "Unknown Plant";
  let scientific_name = "Unknown";
  let plant_family = "Unknown";
  let confidence = 0;

  if (suggestions.length > 0) {
    const top = suggestions[0];
    scientific_name = top.name ?? "Unknown";
    const commonNames: string[] = top.details?.common_names ?? [];
    plant_name = commonNames.length > 0 ? commonNames[0] : scientific_name;
    confidence = Math.round((top.probability ?? 0) * 1000) / 10;
    plant_family = top.details?.taxonomy?.family ?? "Unknown";
  }

  const health = result?.health_assessment ?? {};
  const is_healthy = (health?.is_healthy?.probability ?? 1.0) >= 0.5;

  const diseases: Disease[] = (health?.diseases?.suggestions ?? [] as any[])
    .slice(0, 3)
    .filter((d: any) => (d.probability ?? 0) >= 0.05)
    .map((d: any) => {
      const details = d.details ?? {};
      const raw = details.treatment ?? {};
      let treatment = "";
      if (typeof raw === "object") {
        const t = raw.biological ?? raw.chemical ?? raw.prevention ?? "";
        treatment = Array.isArray(t) ? t.join("; ") : String(t);
      } else {
        treatment = String(raw);
      }
      return {
        name: d.name ?? "Unknown",
        probability: Math.round((d.probability ?? 0) * 1000) / 10,
        description: String(details.description ?? "").slice(0, 400),
        treatment: treatment.slice(0, 300),
      };
    });

  return { plant_name, scientific_name, plant_family, confidence, is_healthy, diseases };
}

type Phase = "initial" | "captured" | "scanning" | "scanned" | "posting";

type Disease = {
  name: string;
  probability: number;
  description: string;
  treatment: string;
};

type ScanResult = {
  plant_name: string;
  scientific_name: string;
  plant_family: string;
  confidence: number;
  is_healthy: boolean;
  diseases: Disease[];
};

// Scan result card
function ScanResultCard({ result }: { result: ScanResult }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.plantName}>{result.plant_name}</Text>
          {result.scientific_name !== result.plant_name && (
            <Text style={styles.scientificName}>{result.scientific_name}</Text>
          )}
          {result.plant_family !== "Unknown" && (
            <Text style={styles.plantFamily}>{result.plant_family}</Text>
          )}
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{result.confidence}%</Text>
        </View>
      </View>

      <View style={[styles.healthBadge, result.is_healthy ? styles.healthyBg : styles.unhealthyBg]}>
        <MaterialCommunityIcons
          name={result.is_healthy ? "check-circle" : "alert-circle"}
          size={16}
          color={result.is_healthy ? "#2b712f" : "#c0392b"}
        />
        <Text style={[styles.healthText, result.is_healthy ? styles.healthyText : styles.unhealthyText]}>
          {result.is_healthy ? "Healthy" : "Disease Detected"}
        </Text>
      </View>

      {!result.is_healthy && result.diseases.length > 0 && (
        <View style={styles.diseaseSection}>
          <Text style={styles.diseaseSectionTitle}>Detected Issues</Text>
          {result.diseases.map((disease, i) => (
            <View key={i} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseName}>{disease.name}</Text>
                <Text style={styles.diseasePct}>{disease.probability}%</Text>
              </View>
              {!!disease.description && (
                <Text style={styles.diseaseDesc} numberOfLines={3}>{disease.description}</Text>
              )}
              {!!disease.treatment && (
                <Text style={styles.diseaseTreatment} numberOfLines={2}>
                  Treatment: {disease.treatment}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Main screen
export default function CameraScreen() {
  const { session } = useAuth();

  const [phase, setPhase] = useState<Phase>("initial");
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [postText, setPostText] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // reuse scan upload; skip re-upload when posting
  const [pinToMap, setPinToMap] = useState(false);

  // Camera
  const openCamera = async () => {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      const locPerm = await Location.requestForegroundPermissionsAsync();

      if (!camPerm.granted || !locPerm.granted) {
        Alert.alert("Permissions Required", "Camera and location permissions are needed.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.6,
      });

      if (result.canceled) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setImage(result.assets[0].uri);
      setCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      setPhase("captured");
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  // AI Scan
  const runAIScan = async () => {
    if (!image) return;
    if (!PLANT_ID_KEY) {
      Alert.alert("Missing API Key", "Add EXPO_PUBLIC_PLANT_ID_API_KEY to your LeafLens/.env file.");
      return;
    }
    setPhase("scanning");

    try {
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" as any });

      const resp = await fetch(PLANT_ID_URL, {
        method: "POST",
        headers: {
          "Api-Key": PLANT_ID_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: [`data:image/jpeg;base64,${base64}`],
          health: "all", // single call returns both plant ID and disease assessment
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Plant.id raw error:", errText);
        throw new Error(`Plant.id ${resp.status}: ${errText}`);
      }

      const result = parsePlantIdResponse(await resp.json());
      setScanResult(result);
      setPostText(buildPostText(result));

      // Auto-save: upload image and store scan in history
      const imageUrl = await uploadImage(image);
      setUploadedImageUrl(imageUrl);
      if (session?.user) {
        await supabase.from("plant_scans").insert([{
          user_id: session.user.id,
          image_url: imageUrl,
          plant_name: result.plant_name,
          scientific_name: result.scientific_name,
          plant_family: result.plant_family,
          confidence: result.confidence,
          is_healthy: result.is_healthy,
          diseases: result.diseases,
        }]);
      }

      setPhase("scanned");
    } catch (err: any) {
      console.error("Scan error:", err);
      Alert.alert("Scan Failed", err.message ?? "Unknown error");
      setPhase("captured");
    }
  };

  const buildPostText = (result: ScanResult): string => {
    let text = `Plant identified: ${result.plant_name}`;
    if (result.scientific_name !== result.plant_name) {
      text += ` (${result.scientific_name})`;
    } else if (result.plant_family && result.plant_family !== "Unknown") {
      text += ` (${result.plant_family})`;
    }
    text += `\nConfidence: ${result.confidence}%`;
    text += result.is_healthy
      ? "\nHealth: Healthy ✓"
      : "\nHealth: Issue detected ⚠";
    if (!result.is_healthy && result.diseases.length > 0) {
      const top = result.diseases[0];
      text += `\nDisease: ${top.name} (${top.probability}%)`;
    }
    if (caption.trim()) text += `\n\n${caption.trim()}`;
    return text;
  };

  // Storage helpers
  // React Native has no Buffer; convert base64 to bytes manually for Supabase upload
  const decode = (base64: string): Uint8Array => {
    const binary = global.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      const fileName = `${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(fileName, decode(base64), { contentType: "image/jpeg" });
      if (error) return null;
      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  // Post to community (with optional map pin)
  const postToCommunity = async () => {
    if (!session?.user || !postText.trim()) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }
    setPhase("scanning"); // reuse spinner state while post is submitting
    try {
      const imageUrl = uploadedImageUrl ?? await uploadImage(image!); // skip re-upload if scan already ran

      const { error } = await supabase.from("posts").insert({
        profile_id: session.user.id,
        content: postText.trim(),
        image_url: imageUrl,
      });
      if (error) throw new Error(error.message);

      // Optionally pin to map
      if (pinToMap && coords && imageUrl) {
        await supabase.from("photos").insert({
          image_url: imageUrl,
          caption: postText.trim(),
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }

      Alert.alert(
        "Posted!",
        pinToMap
          ? "Your plant has been shared and pinned on the map."
          : "Your plant has been shared with the community."
      );
      resetState();
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setPhase(scanResult ? "scanned" : "captured");
    }
  };

  const resetState = () => {
    setImage(null);
    setCaption("");
    setCoords(null);
    setScanResult(null);
    setPostText("");
    setUploadedImageUrl(null);
    setPinToMap(false);
    setPhase("initial");
  };

  // Render
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>LeafLens Camera</Text>

      {/* INITIAL */}
      {phase === "initial" && (
        <View style={styles.initialContainer}>
          <MaterialCommunityIcons
            name="leaf-circle-outline"
            size={80}
            color={colors.secondary}
            style={{ marginBottom: 24 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Add a note (optional)..."
            placeholderTextColor={colors.mediumgrey}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={openCamera}>
            <Ionicons name="camera" size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* IMAGE */}
      {image && phase !== "initial" && (
        <Image source={{ uri: image }} style={styles.photo} />
      )}

      {/* LOADING spinner */}
      {phase === "scanning" && (
        <View style={styles.spinnerRow}>
          <ActivityIndicator size="large" color={colors.primarylight} />
          <Text style={styles.scanningText}>Loading...</Text>
        </View>
      )}

      {/* CAPTURED */}
      {phase === "captured" && (
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.primaryBtn} onPress={runAIScan}>
            <MaterialCommunityIcons name="magnify-scan" size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>AI Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setPostText(caption.trim());
              setPhase("posting");
            }}
          >
            <Ionicons name="chatbox-ellipses" size={20} color={colors.primarylight} />
            <Text style={styles.secondaryBtnText}>Post to Community</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={resetState}>
            <Text style={styles.ghostBtnText}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SCANNED */}
      {phase === "scanned" && scanResult && (
        <>
          <ScanResultCard result={scanResult} />
          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase("posting")}>
              <Ionicons name="chatbox-ellipses" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Post to Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={resetState}>
              <Text style={styles.ghostBtnText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* POSTING */}
      {phase === "posting" && (
        <>
          {scanResult && <ScanResultCard result={scanResult} />}
          <View style={styles.postSection}>
            <Text style={styles.sectionLabel}>Share with Community</Text>
            <TextInput
              style={styles.postInput}
              value={postText}
              onChangeText={setPostText}
              multiline
              placeholder="Write something about this plant..."
              placeholderTextColor={colors.mediumgrey}
            />

            {/* Map pin checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPinToMap(!pinToMap)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, pinToMap && styles.checkboxChecked]}>
                {pinToMap && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Ionicons
                name="location"
                size={16}
                color={pinToMap ? colors.secondary : colors.mediumgrey}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.checkboxLabel, pinToMap && styles.checkboxLabelActive]}>
                Pin this location on the map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={postToCommunity}>
              <Text style={styles.primaryBtnText}>Submit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => setPhase(scanResult ? "scanned" : "captured")}
            >
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.lightbackground,
  },
  container: {
    padding: 20,
    paddingBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkbackground,
    marginBottom: 24,
  },
  initialContainer: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.mediumgrey,
    width: "100%",
    padding: 12,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    color: colors.darkgrey,
    minHeight: 50,
  },
  photo: {
    width: 300,
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  spinnerRow: {
    alignItems: "center",
    marginVertical: 16,
  },
  scanningText: {
    marginTop: 10,
    fontSize: 15,
    color: colors.darkgrey,
    fontStyle: "italic",
  },
  btnGroup: {
    width: "100%",
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.primarylight,
  },
  secondaryBtnText: {
    color: colors.primarylight,
    fontSize: 16,
    fontWeight: "600",
  },
  ghostBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  ghostBtnText: {
    color: colors.darkgrey,
    fontSize: 15,
  },
  resultCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
  },
  scientificName: {
    fontSize: 13,
    color: colors.primarylight,
    marginTop: 2,
    fontStyle: "italic",
  },
  plantFamily: {
    fontSize: 12,
    color: colors.darkgrey,
    marginTop: 1,
  },
  confidenceBadge: {
    backgroundColor: colors.primarylight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  healthyBg: { backgroundColor: "#e8f5e9" },
  unhealthyBg: { backgroundColor: "#fdecea" },
  healthText: { fontSize: 14, fontWeight: "600" },
  healthyText: { color: "#2b712f" },
  unhealthyText: { color: "#c0392b" },
  diseaseSection: { marginTop: 4 },
  diseaseSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.darkgrey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  diseaseCard: {
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
  },
  diseaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  diseaseName: {
    fontWeight: "600",
    color: colors.darkbackground,
    flex: 1,
    marginRight: 8,
  },
  diseasePct: { color: "#e74c3c", fontWeight: "700", fontSize: 13 },
  diseaseDesc: { fontSize: 13, color: colors.darkgrey, lineHeight: 18 },
  diseaseTreatment: { fontSize: 12, color: colors.secondary, marginTop: 4, lineHeight: 17 },
  postSection: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkbackground,
    marginBottom: 10,
  },
  postInput: {
    borderWidth: 1.5,
    borderColor: colors.mediumgrey,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.darkgrey,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
    backgroundColor: colors.lightbackground,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.mediumgrey,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.mediumgrey,
    flex: 1,
  },
  checkboxLabelActive: {
    color: colors.secondary,
    fontWeight: "600",
  },
});
