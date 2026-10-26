# SnapCook

A mobile app that turns the ingredients you have into healthy recipes. Take a photo
(or pick one from your library), and SnapCook detects the ingredients in it, then
suggests recipes you can make, with ingredient lists, directions, and a share button.

**[Watch the demo video](https://www.youtube.com/watch?v=vym1n1f9fgc)**

**Tabs**

- **Healthy Recipes:** browse recipe cards
- **Snap an Ingredient:** photo → detected ingredients → add preferences
  (e.g. "Italian, no peanuts, high protein") → recipe suggestions
- **AI Chef Chat:** ask cooking questions

**Built with:** React Native + Expo, React Navigation, Roboflow (ingredient detection),
Google Gemini (recipes and chat)

## Running it

You need Node.js and the Expo Go app (or an emulator), plus two free API keys:
[Gemini](https://aistudio.google.com/apikey) and [Roboflow](https://app.roboflow.com/settings/api).

```bash
cp .env.example .env    # then paste your keys into .env
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for the iOS or Android simulator.
`.env` is git-ignored, so your keys stay out of the repo.
