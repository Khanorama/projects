import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Share as RNShare,
  LayoutChangeEvent,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { GoogleGenAI, Type } from "@google/genai";
import { friendlyError } from "../utils/friendlyError";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// The model is noisy (a photo of leaves got 21 onion/chicken hits at 0.50-0.86).
// 0.7 cut that to 7; tune it against real food photos.
const MIN_CONFIDENCE = 0.7;

const NECESSITIES = [
  "salt",
  "black pepper",
  "olive oil",
  "butter",
  "sugar",
  "milk",
  "garlic",
  "onions",
  "water",
  "vinegar",
  "soy sauce",
];

const SINGLE_RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The full title of the recipe." },
    prep_time: {
      type: Type.STRING,
      description: "Estimated preparation time.",
    },
    cook_time: { type: Type.STRING, description: "Estimated cooking time." },
    servings: {
      type: Type.STRING,
      description: "How many people the recipe serves.",
    },
    calorie_count: {
      type: Type.STRING,
      description: "Estimated total calorie count.",
    },
    ingredients_list: {
      type: Type.ARRAY,
      description: "A detailed list of all ingredients with quantities.",
      items: { type: Type.STRING },
    },
    instructions: {
      type: Type.ARRAY,
      description: "Step-by-step instructions.",
      items: { type: Type.STRING },
    },
  },
  required: [
    "title",
    "ingredients_list",
    "instructions",
    "prep_time",
    "cook_time",
    "servings",
    "calorie_count",
  ],
};

const RECIPE_ARRAY_SCHEMA = { type: Type.ARRAY, items: SINGLE_RECIPE_SCHEMA };

const COLORS = {
  light: "#F5F8F6",
  primary: "#2E8B57",
  primaryLight: "#DFF3E8",
  primaryDisabled: "#BFDCC7",
  dark: "#243228",
  red: "#D32F2F",
  neutralBorder: "#E6EDE5",
};

type RecipeDetails = {
  title: string;
  ingredients: string;
  directions: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  calorie_count: string;
};

type RecipeOption = { label: string; value: string; details: RecipeDetails };

type GeminiRecipe = {
  title?: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  calorie_count: string;
  ingredients_list: string[];
  instructions: string[];
};

// x/y are the box center, in pixels of the image Roboflow analysed
type Detection = { x: number; y: number; width: number; height: number; class: string };

type IconName = React.ComponentProps<typeof Icon>["name"];

const encodeImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = String(reader.result ?? "").split(",")[1];
        if (base64String) resolve(base64String);
        else reject(new Error("Failed to extract Base64 string from Blob."));
      };
      reader.onerror = (error) =>
        reject(new Error(`FileReader failed: ${error}`));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error during Base64 encoding:", error);
    throw new Error(`Failed to read image file. Details: ${error instanceof Error ? error.message : error}`);
  }
};

export default function SnapScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [detectedImageSize, setDetectedImageSize] = useState<{ width: number; height: number } | null>(null);
  const [imageBoxSize, setImageBoxSize] = useState({ width: 0, height: 0 });
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [recipeDropdownOpen, setRecipeDropdownOpen] = useState(false);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState<string | null>(null);
  const [recipeOptions, setRecipeOptions] = useState<RecipeOption[]>([]);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<RecipeDetails | null>(null);

  const [customInstructions, setCustomInstructions] = useState("");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const headerHeight = useHeaderHeight();

  // recipes are stale once the ingredient list changes
  const resetRecipes = () => {
    setRecipeOptions([]);
    setSelectedRecipeTitle(null);
    setSelectedRecipeDetails(null);
  };

  const handleImagePickOrCamera = async (mode: "library" | "camera") => {
    let result = null;
    if (mode === "library") {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "We need media permissions to access your photos."
          );
          return;
        }
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.5,
      });
    } else {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "We need camera permissions to take a photo."
          );
          return;
        }
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
      });
    }

    // keep the ingredient list; scanning the new photo adds to it
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setDetections([]);
      setDetectedImageSize(null);
    }
  };

  const handleScanWithBase64 = async () => {
    if (!imageUri) {
      Alert.alert("No Image Selected", "Please select or take an image first.");
      return;
    }

    setIsScanning(true);
    setDetections([]);
    setDetectedImageSize(null);

    try {
      const base64Image = await encodeImageToBase64(imageUri);

      const API_KEY = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY;
      const endpoint =
        "https://serverless.roboflow.com/ingredientdetection-hbgvt/workflows/small-object-detection-sahi-2";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          inputs: { image: { type: "base64", value: base64Image } },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const predictions = result.outputs?.[0]?.predictions;

      const confident: Detection[] = (predictions?.predictions || []).filter(
        (p: Detection & { confidence: number }) => p.class && p.confidence >= MIN_CONFIDENCE
      );
      setDetections(confident);
      setDetectedImageSize(predictions?.image ?? null);

      const found = [...new Set(confident.map((p) => p.class.toLowerCase()))];
      const added = found.filter((name) => !ingredients.includes(name));
      if (added.length) {
        setIngredients((prev) => [...prev, ...added]);
        resetRecipes();
      }

      Alert.alert(
        "Scan Complete",
        found.length
          ? `Found ${found.length} ingredient${found.length === 1 ? "" : "s"} (${added.length} new).`
          : "No ingredients were detected with enough confidence. You can add them by hand."
      );
    } catch (error) {
      console.error("Scanning Error:", error);
      Alert.alert(
        "Detection Error",
        `${friendlyError(error, "The ingredient scanner")} You can still add ingredients by hand.`
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients((prev) => prev.filter((it) => it !== ingredientToRemove));
    resetRecipes();
  };

  // Alert.prompt is iOS-only, so use a modal on every platform
  const openAddModal = () => {
    setNewIngredient("");
    setAddModalVisible(true);
  };

  const submitNewIngredient = () => {
    const cleaned = newIngredient.trim().toLowerCase();
    if (!cleaned) return;
    if (ingredients.includes(cleaned)) {
      Alert.alert("Already Listed", `${cleaned} is already in the list.`);
      return;
    }
    setIngredients((prev) => [...prev, cleaned]);
    resetRecipes();
    setAddModalVisible(false);
  };

  const fetchRecipes = async () => {
    if (ingredients.length === 0) {
      Alert.alert(
        "No Ingredients",
        "No ingredients present. Please add ingredients below before generating recipes."
      );
      return;
    }

    setIsGenerating(true);
    resetRecipes();

    try {
      const ingredientString = ingredients.join(", ");
      const necessitiesString = NECESSITIES.join(", ");

      const safeCustomInstructions = customInstructions?.trim() || "None";

      const contentsPrompt = `
Generate 3 creative, complete, and delicious recipes.

Primary Ingredients (MUST use these): ${ingredientString}.

Assumed Necessities (can use without listing): ${necessitiesString}.

User Custom Instructions (STRICTLY FOLLOW IF PROVIDED): ${safeCustomInstructions}

Rules:
- Respect allergies and dietary restrictions absolutely.
- Match requested cuisine/style if specified.
- Prioritize health goals if mentioned (e.g., low sodium / high protein).
- Each recipe must include realistic prep time, cook time, servings, and total calories.
- Other than the assumed necessities, DO NOT ADD additional ingredients.
- Output MUST conform to the provided JSON schema.
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contentsPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RECIPE_ARRAY_SCHEMA,
        },
      });

      const parsedRecipesArray: GeminiRecipe[] = JSON.parse(response.text ?? "");

      if (
        !Array.isArray(parsedRecipesArray) ||
        parsedRecipesArray.length === 0
      ) {
        throw new Error("Gemini returned an empty or invalid recipe array.");
      }

      // the index keeps two recipes with the same title apart
      const dropdownOptions: RecipeOption[] = parsedRecipesArray.map((recipe, index) => ({
        label: recipe.title || `Recipe ${index + 1}`,
        value: `${index}-${recipe.title || "recipe"}`,
        details: {
          title: recipe.title || `Recipe ${index + 1}`,
          ingredients: recipe.ingredients_list
            .map((item) => `• ${item}`)
            .join("\n"),
          directions: recipe.instructions
            .map((step, i) => `${i + 1}. ${step}`)
            .join("\n\n"),
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          calorie_count: recipe.calorie_count,
        },
      }));

      setRecipeOptions(dropdownOptions);
      Alert.alert(
        "Recipes Generated",
        `Found ${dropdownOptions.length} recipes!`
      );
    } catch (error) {
      console.error("Gemini Error:", error);
      Alert.alert("Recipe Error", friendlyError(error, "The recipe service"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecipeSelection = (value: string | null) => {
    setSelectedRecipeTitle(value);
    const recipe = recipeOptions.find((opt) => opt.value === value);
    if (recipe) setSelectedRecipeDetails(recipe.details);
  };

  const formatText = (text?: string) => text?.trim() ?? "";

  const buildShareText = (details: RecipeDetails) => {
    return [
      details.title,
      "",
      "Ingredients:",
      details.ingredients,
      "",
      "Directions:",
      details.directions,
      "",
      `Prep: ${details.prep_time} | Cook: ${details.cook_time} | Serves: ${details.servings} | Calories: ${details.calorie_count}`,
      "",
      "Shared via SnapCook",
    ].join("\n");
  };

  const handleShare = async () => {
    if (!selectedRecipeDetails) {
      Alert.alert("No recipe selected");
      return;
    }

    try {
      await RNShare.share({
        message: buildShareText(selectedRecipeDetails),
      });
    } catch (error) {
      Alert.alert("Share failed", error instanceof Error ? error.message : String(error));
    }
  };

  const DetailItem = ({ iconName, label, value }: { iconName: IconName; label: string; value: string }) => (
    <View style={styles.detailItemRow}>
      <View
        style={{ flexDirection: "row", alignItems: "center", width: "40%" }}
      >
        <Icon
          name={iconName}
          size={18}
          color={COLORS.dark}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.detailItemLabel}>{label}:</Text>
      </View>
      <Text style={styles.detailItemValue}>{value}</Text>
    </View>
  );

  const onImageLayout = (e: LayoutChangeEvent) => setImageBoxSize(e.nativeEvent.layout);

  // map each box onto the photo as drawn with resizeMode "contain"
  const boxes = (() => {
    if (!detectedImageSize || !imageBoxSize.width) return [];
    const scale = Math.min(
      imageBoxSize.width / detectedImageSize.width,
      imageBoxSize.height / detectedImageSize.height
    );
    const offsetX = (imageBoxSize.width - detectedImageSize.width * scale) / 2;
    const offsetY = (imageBoxSize.height - detectedImageSize.height * scale) / 2;
    return detections.map((d) => ({
      label: d.class,
      style: {
        left: offsetX + (d.x - d.width / 2) * scale,
        top: offsetY + (d.y - d.height / 2) * scale,
        width: d.width * scale,
        height: d.height * scale,
      },
    }));
  })();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.content}>
          <Text style={styles.header}>Ingredient Scanner</Text>

          <View style={styles.imageContainer} onLayout={onImageLayout}>
            {isScanning ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.dark }}>
                  Scanning...
                </Text>
              </View>
            ) : imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.image} />
                {boxes.map((box, i) => (
                  <View key={`box-${i}`} style={[styles.detectionBox, box.style]} />
                ))}
                {boxes.map((box, i) => (
                  <Text
                    key={`label-${i}`}
                    numberOfLines={1}
                    style={[styles.detectionLabel, { left: box.style.left, top: Math.max(0, box.style.top - 16) }]}
                  >
                    {box.label}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.placeholderText}>
                Select image or take photo to scan
              </Text>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pickButton]}
              onPress={() => handleImagePickOrCamera("library")}
              disabled={isScanning}
            >
              <Icon name="file-upload" size={20} color="#fff" />
              <Text style={styles.buttonLabel}> Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={() => handleImagePickOrCamera("camera")}
              disabled={isScanning}
            >
              <Icon name="photo-camera" size={20} color="#fff" />
              <Text style={styles.buttonLabel}> Camera</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.scanButton,
              (!imageUri || isScanning) && styles.disabledButton,
            ]}
            onPress={handleScanWithBase64}
            disabled={!imageUri || isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Scan for Ingredients</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              Current Ingredients ({ingredients.length}):
            </Text>

            <View style={styles.addRow}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={openAddModal}
                disabled={isGenerating}
              >
                <Icon
                  name="add-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.addButtonText}>
                  {" "}
                  Add Missing Ingredient
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.clearAllButton]}
                onPress={() => {
                  setIngredients([]);
                  resetRecipes();
                }}
              >
                <Icon name="delete-sweep" size={18} color={COLORS.red} />
                <Text style={styles.clearAllText}> Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ingredientsList}>
              {ingredients.length === 0 ? (
                <Text style={styles.noIngredientsText}>
                  Please add ingredients above.
                </Text>
              ) : (
                ingredients.map((ingredient, index) => (
                  <View key={ingredient} style={styles.predictionRow}>
                    <Text style={styles.predictionText}>
                      {index + 1}.{" "}
                      {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(ingredient)}
                      style={styles.removeButton}
                    >
                      <Icon name="delete" size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {ingredients.length > 0 && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsHeader}>Custom Instructions</Text>
              <Text style={styles.instructionsSub}>
                (Cuisine, allergies, diet, spice level, health goals, etc.)
              </Text>

              <TextInput
                style={styles.instructionsInput}
                placeholder="Example: Italian cuisine, no peanuts, low sodium, high protein"
                placeholderTextColor="#6B7A70"
                value={customInstructions}
                onChangeText={setCustomInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                // keep the box (and Find Recipes) above the keyboard
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
              />
            </View>
          )}

          {ingredients.length > 0 && (
            <View style={styles.recipeSection}>
              <TouchableOpacity
                style={[
                  styles.recipeButton,
                  isGenerating && styles.disabledButton,
                ]}
                onPress={fetchRecipes}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Find Recipes</Text>
                )}
              </TouchableOpacity>

              {recipeOptions.length > 0 && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Select a Recipe:</Text>
                  <DropDownPicker
                    open={recipeDropdownOpen}
                    value={selectedRecipeTitle}
                    items={recipeOptions}
                    setOpen={setRecipeDropdownOpen}
                    setValue={setSelectedRecipeTitle}
                    onChangeValue={handleRecipeSelection}
                    style={styles.dropdown}
                    containerStyle={{
                      height: recipeDropdownOpen ? 200 : 40,
                      width: "100%",
                    }}
                    placeholder="Choose a recipe"
                    listMode="SCROLLVIEW"
                    zIndex={1000}
                  />
                </View>
              )}
            </View>
          )}

          {selectedRecipeDetails && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsHeader}>
                {selectedRecipeDetails.title}
              </Text>

              <View style={styles.timeContainer}>
                <DetailItem
                  iconName="schedule"
                  label="Prep Time"
                  value={selectedRecipeDetails.prep_time}
                />
                <DetailItem
                  iconName="whatshot"
                  label="Cook Time"
                  value={selectedRecipeDetails.cook_time}
                />
                <DetailItem
                  iconName="people"
                  label="Servings"
                  value={selectedRecipeDetails.servings}
                />
                <DetailItem
                  iconName="local-fire-department"
                  label="Calories"
                  value={selectedRecipeDetails.calorie_count}
                />
              </View>

              <Text style={styles.detailsSubHeader}>Ingredients:</Text>
              <Text style={styles.detailsBody}>
                {formatText(selectedRecipeDetails.ingredients)}
              </Text>

              <Text style={styles.detailsSubHeader}>Directions:</Text>
              <Text style={styles.detailsBody}>
                {formatText(selectedRecipeDetails.directions)}
              </Text>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Icon name="share" size={20} color="#fff" />
                <Text style={styles.shareLabel}> Share Recipe</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Missing Ingredient</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. spinach"
              placeholderTextColor="#6B7A70"
              value={newIngredient}
              onChangeText={setNewIngredient}
              onSubmitEditing={submitNewIngredient}
              returnKeyType="done"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAdd, !newIngredient.trim() && styles.disabledButton]}
                onPress={submitNewIngredient}
                disabled={!newIngredient.trim()}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20, alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.dark,
    marginTop: 10,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.neutralBorder,
    overflow: "hidden",
  },
  loadingOverlay: { justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  detectionBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FFD54F",
    borderRadius: 4,
  },
  detectionLabel: {
    position: "absolute",
    backgroundColor: "#FFD54F",
    color: COLORS.dark,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 4,
    borderRadius: 3,
    overflow: "hidden",
  },
  placeholderText: { color: COLORS.dark, fontSize: 18, fontStyle: "italic" },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
    zIndex: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  pickButton: { backgroundColor: COLORS.primary },
  cameraButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: { backgroundColor: COLORS.primaryDisabled, opacity: 0.9 },

  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // Ingredients
  resultsContainer: {
    width: "100%",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorder,
    marginBottom: 16,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: COLORS.dark,
  },
  addRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearAllText: { color: COLORS.red, fontWeight: "700", marginLeft: 6 },

  ingredientsList: { paddingHorizontal: 2 },
  noIngredientsText: {
    color: COLORS.dark,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  predictionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F6F3",
  },
  predictionText: { fontSize: 16, color: COLORS.dark, flex: 1 },
  removeButton: { padding: 6, marginLeft: 10 },

  // Custom instructions
  instructionsContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutralBorder,
    padding: 14,
    marginBottom: 16,
  },
  instructionsHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 4,
  },
  instructionsSub: {
    fontSize: 13,
    color: "#5F6F65",
    marginBottom: 8,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: COLORS.neutralBorder,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    minHeight: 90,
    color: COLORS.dark,
    backgroundColor: "#FAFCFB",
  },

  // Recipe Section
  recipeSection: { width: "100%", marginBottom: 20, zIndex: 1000 },
  recipeButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },

  dropdownContainer: { width: "100%", marginBottom: 8 },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
    color: COLORS.dark,
  },
  dropdown: { borderColor: COLORS.neutralBorder },

  // Details
  detailsContainer: {
    width: "100%",
    padding: 14,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 10,
    marginBottom: 50,
  },
  detailsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.dark,
    textAlign: "center",
  },
  timeContainer: {
    flexDirection: "column",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutralBorder,
    marginBottom: 8,
  },

  detailItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "center",
  },
  detailItemLabel: { fontSize: 15, fontWeight: "600", color: COLORS.dark },
  detailItemValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.dark,
    textAlign: "right",
  },

  detailsSubHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
    color: COLORS.dark,
  },
  detailsBody: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.dark,
  },
  shareButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  shareLabel: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.dark, marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.neutralBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.dark,
    backgroundColor: COLORS.light,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, gap: 10 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: COLORS.dark, fontSize: 16, fontWeight: "600" },
  modalAdd: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalAddText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
