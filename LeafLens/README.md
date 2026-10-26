# LeafLens

A plant app: photograph a plant to identify it and check it for disease, keep a
history of your scans, look plants up in a plant database, and share posts and
scan locations with other users.

**Team project.** LeafLens was built by a team of three as a semester project for
a React Native class.

**My part:** the AI plant scan (taking the photo, sending it to the Plant.id API for
identification and disease detection, and showing the results), the scan history
screen, and the database setup for scans and post reactions. I also worked on
the community feed, post reactions, and the map. My teammates built plant search,
sign-in, profiles, the tab layout, and most of the map and community posts.

**Tabs**

- **Scan:** photograph a plant and get its name, family, and any diseases detected
- **Community:** posts from other users, with reactions
- **Map:** where scans and posts were made
- **Search:** look up plants in the Trefle plant database
- **History:** your past scans
- **Profile:** your name, location, and gardening experience

**Built with:** React Native + Expo (Expo Router), Supabase (sign-in, database,
photo storage), Plant.id API, Trefle API, React Native Maps

## Running it

You need Node.js, the Expo Go app (or an emulator), a free Supabase project, and
API keys for [Plant.id](https://web.plant.id) and [Trefle](https://trefle.io).

```bash
cp .env.example .env    # then fill in your keys
npm install
npx expo start
```

Supabase setup: the app expects `profiles`, `posts` and `photos` tables and a
`photos` storage bucket. Then run `supabase/plant_scans.sql` and
`supabase/reactions.sql` in the Supabase SQL editor.

`.env` is git-ignored, so your keys stay out of the repo.
