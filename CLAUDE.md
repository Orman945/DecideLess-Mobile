# DecideLess App - Custom Instructions for Claude

This file provides the context, structural rules, and the immediate next Phase (Phase 5) of the DecideLess app build. Read this carefully before executing commands.

## Architecture & Rules
1. **Framework:** This is an Expo (SDK 54) React Native application using Expo Router.
2. **Styling:** We use NativeWind (Tailwind CSS for Expo). Every component must be styled using the `className` prop strictly adhering to a high-contrast dark theme (`bg-zinc-950`, `text-white`, `border-zinc-800`).
3. **Components:** Never use web elements (`div`, `p`, `span`). Use only React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `Image`).
4. **State Logic:** Keep presentation decoupled. All complex AI fetch logic resides in `hooks/useWardrobeAi.ts`, `hooks/useFuelAi.ts`, and `hooks/useFocusAi.ts`.
5. **AI Integration:** We use `gpt-4o-mini` calling the REST API directly via `fetch`. Do not install the heavy OpenAI Node SDK.

---

## Your Next Task (Phase 5: Photo Context & History Tracking)

## 1. UI/UX: Active Photo Feedback
- **Update State:** Update the state hooks (`hooks/useWardrobeAi.ts`, `hooks/useFuelAi.ts`) to retain the URL of the currently uploaded image in a state variable like `currentImageUri`.
- **Placeholder Component:** In the `Wardrobe` (`app/(tabs)/index.tsx`) and `Fuel` (`app/(tabs)/fuel.tsx`) tabs, add an `<Image>` placeholder component *above* the AI suggestions list to display the `currentImageUri`.
- **Styling:** Style the photo placeholder to blend with the dark theme natively (e.g., `className="rounded-3xl border border-zinc-800 aspect-square w-full aspect-[4/3]"`).

## 2. History Navigation & Buttons
- Add a consistently styled "Past Recommendations" utility button at the bottom of the `Wardrobe`, `Fuel`, and `Focus` screen scroll views. This should link to the specific module's history or a unified history screen.

## 3. State Persistence (History Log)
- **Library:** Install and implement `AsyncStorage` from `@react-native-async-storage/async-storage` to log every successful AI run.
- **Log Schema:** The schema for a log entry should look like: 
  `{ id: string, timestamp: string, module: 'wardrobe' | 'fuel' | 'focus', imageUri?: string, textPrompt?: string, aiResponse: any }`.
- Save this log entry inside the `try/catch` block of each of the three hooks whenever the AI generates a successful response.

## 4. History Screens Setup (Expo Router)
- **List View:** Create a new Expo Router screen: `app/history/index.tsx`.
- **Detail View:** Create a new Expo Router dynamic detail screen: `app/history/[id].tsx`.

## 5. History UI Implementation
- **List View (`history/index.tsx`):** Map over the saved `AsyncStorage` history array, rendering touchable cards displaying the module name, time (HH:mm), and date. Sort them by most recent first.
- **Detail View (`history/[id].tsx`):** Read the `id` from the local search params (`useLocalSearchParams`), fetch the specific log from storage, and render the initial photo or text prompt (the "Context") followed by the AI's response (the "Recommendation").
- **Navigation Headers:** Ensure the native iOS/Android 'Back' navigation headers are handled by Expo Router's `<Stack.Screen />` configuration so the user can easily trace their steps backward.
