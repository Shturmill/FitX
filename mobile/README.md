# Fitness App - React Native (Expo)

A mobile fitness tracking application built with React Native and Expo.

## Features

- **Dashboard**: AI fitness coach, calorie tracking, daily stats, health metrics
- **Food Diary**: Meal logging, macronutrients tracking, water intake
- **Training**: Workout plans, exercise library, workout history
- **Achievements**: Badges, streaks, milestones
- **Profile**: User stats, goals, personal information

## Project Structure

```
mobile/
├── App.tsx                    # Main entry point
├── src/
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── Card.tsx
│   │       ├── Button.tsx
│   │       ├── Progress.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       ├── Avatar.tsx
│   │       └── index.ts
│   ├── navigation/
│   │   └── TabNavigator.tsx   # Bottom tab navigation
│   ├── screens/               # App screens
│   │   ├── DashboardScreen.tsx
│   │   ├── FoodDiaryScreen.tsx
│   │   ├── TrainingScreen.tsx
│   │   ├── AchievementsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── index.ts
│   └── theme/
│       └── colors.ts          # Color palette and gradients
├── package.json
├── app.json                   # Expo config
├── tsconfig.json
└── babel.config.js
```

## Getting Started

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation (Bottom Tabs)
- Expo Linear Gradient
- @expo/vector-icons (Ionicons)

## Customization

### Colors
Edit `src/theme/colors.ts` to customize the color palette.

### Adding New Screens
1. Create a new screen in `src/screens/`
2. Export it from `src/screens/index.ts`
3. Add to `TabNavigator.tsx` or create new navigation structure

### UI Components
All reusable components are in `src/components/ui/`. Each component is self-contained with its own styles.
