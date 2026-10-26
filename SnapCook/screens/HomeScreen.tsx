import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import RecipeCard from "../components/RecipeCard";

const DIETARY_LABELS = {
  vegan: { text: "🌱 Vegan", color: "#4CAF50" },
  vegetarian: { text: "🥚 Veggie", color: "#8BC34A" },
  "nut-free": { text: "🚫 Nuts", color: "#FF9800" },
  "dairy-free": { text: "🥛 Dairy-Free", color: "#03A9F4" },
  "gluten-free": { text: "🌾 Gluten-Free", color: "#9C27B0" },
  "high-protein": { text: "💪 Protein", color: "#F44336" },
};


const SAMPLE_RECIPES = [
  {
    id: "1",
    title: "Avocado Toast with Egg",
    ingredients: [
      "2 slices of whole-wheat bread",
      "1 ripe avocado",
      "2 large eggs",
      "Salt, pepper, and red pepper flakes to taste",
    ],
    instructions:
      "1. Toast the bread. 2. Mash the avocado and spread it on the toast. 3. Fry or poach eggs and place them on top. 4. Season as desired.",
    calorie_count: "350 kcal",
    labels: ["vegetarian", "nut-free"],
  },
  {
    id: "2",
    title: "Quinoa Salad with Lemon Vinaigrette",
    ingredients: [
      "1 cup quinoa",
      "2 cups water",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/4 cup feta cheese",
      "Lemon Vinaigrette dressing",
    ],
    instructions:
      "1. Cook quinoa according to package directions. 2. Let it cool. 3. In a large bowl, combine quinoa, cucumber, tomatoes, and feta. 4. Drizzle with vinaigrette and toss to combine.",
    calorie_count: "420 kcal",
    labels: ["vegetarian", "gluten-free", "nut-free"],
  },
  {
    id: "3",
    title: "Green Smoothie Power Bowl",
    ingredients: [
      "1 cup spinach",
      "1/2 frozen banana",
      "1/4 cup almond milk",
      "1 tbsp chia seeds",
      "Toppings: granola, fresh berries, coconut flakes",
    ],
    instructions:
      "1. Blend spinach, banana, almond milk, and chia seeds until smooth. 2. Pour into a bowl. 3. Add your favorite toppings and enjoy immediately.",
    calorie_count: "310 kcal",
    labels: ["vegan", "dairy-free", "nut-free"],
  },
 
  {
    id: "4",
    title: "Spicy Tofu Scramble with Turmeric",
    ingredients: [
      "1 block firm tofu, crumbled",
      "1/2 chopped onion",
      "1 bell pepper, diced",
      "1 tsp turmeric",
      "1/2 tsp smoked paprika",
    ],
    instructions:
      "1. Sauté onion and pepper. 2. Add crumbled tofu and spices. 3. Cook until heated through, stirring occasionally.",
    calorie_count: "280 kcal",
    labels: ["vegan", "dairy-free", "gluten-free", "nut-free", "high-protein"],
  },
  {
    id: "5",
    title: "Lentil Soup with Rustic Bread",
    ingredients: [
      "1 cup brown or green lentils",
      "4 cups vegetable broth",
      "2 carrots, diced",
      "2 celery stalks, diced",
      "1 tsp dried thyme",
    ],
    instructions:
      "1. Sauté carrots and celery. 2. Add lentils, broth, and thyme. 3. Bring to a boil, then simmer for 30 minutes until lentils are tender. Serve with bread.",
    calorie_count: "380 kcal",
    labels: ["vegan", "dairy-free", "nut-free"],
  },
  {
    id: "6",
    title: "Baked Salmon with Asparagus",
    ingredients: [
      "4 salmon fillets",
      "1 bunch asparagus",
      "2 tbsp olive oil",
      "Lemon slices",
      "Salt and pepper",
    ],
    instructions:
      "1. Preheat oven to 400°F (200°C). 2. Toss asparagus with oil, salt, and pepper. 3. Place salmon and asparagus on a baking sheet. 4. Bake for 12-15 minutes.",
    calorie_count: "490 kcal",
    labels: ["dairy-free", "gluten-free", "nut-free", "high-protein"],
  },
  {
    id: "7",
    title: "Chicken and Vegetable Stir-fry",
    ingredients: [
      "1 lb chicken breast, sliced",
      "1 cup broccoli florets",
      "1 cup sliced carrots",
      "1/4 cup soy sauce",
      "1 tbsp sesame oil",
    ],
    instructions:
      "1. Cook chicken in a wok or large pan. 2. Add vegetables and cook until tender-crisp. 3. Stir in soy sauce and sesame oil. 4. Serve immediately.",
    calorie_count: "450 kcal",
    labels: ["dairy-free", "nut-free", "high-protein"],
  },
];

const COLORS = {
  light: "#F5F5F5",
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={SAMPLE_RECIPES}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={{ ...item, labelMap: DIETARY_LABELS }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  list: {
    padding: 16,
  },
});
