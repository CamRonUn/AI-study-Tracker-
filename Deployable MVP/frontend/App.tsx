import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarProvider } from './data/CalendarContext';

export type RootStackParamList = {
  login: undefined;
  onboard: { email: string; password: string; name: string };
  home: { initialOnboardingTask?: any } | undefined;
  reminders: undefined;
  quiz: undefined;
  profile: undefined;
  settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CalendarProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="onboard" component={OnboardingScreen} />
          <Stack.Screen name="home" component={DashboardScreen} />
          <Stack.Screen name="reminders" component={RemindersScreen} />
          <Stack.Screen name="quiz" component={QuizScreen} />
          <Stack.Screen name="profile" component={ProfileScreen} />
          <Stack.Screen name="settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CalendarProvider>
  );
}

