# Studyo — React Native (Expo)

Pastel-Tech student productivity app, ported from the web mockup.

## Setup
```
brew install watchman
npx expo install react-native-web react-dom @expo/metro-runtime
npm install
npx expo start
```

## Stack
- Expo + React Native
- `lucide-react-native` for icons
- `react-native-svg` for the Google logo & progress ring

## Screens
- LoginScreen — sign up / log in + Continue with Google
- OnboardingScreen — pick degree + initial courses
- DashboardScreen — date picker, progress ring, task list
- RemindersScreen — academic reminders feed
- QuizScreen — multiple choice with correct-state micro-interaction
- ProfileScreen — edit mode adds/removes courses
- SettingsScreen — change display name & major

`App.tsx` wires them together with simple state-based navigation. For
production, swap to `@react-navigation/native` (stack + bottom tabs).

## Theme
All colors and radii live in `theme.ts`. Tweak there to restyle.
