import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="InstructionsScreen" options={{ headerShown: false }} />
        <Stack.Screen name="SettingsScreen" options={{ headerShown: false }} />
        <Stack.Screen name="GameScreen" options={{ headerShown: false }} />
        <Stack.Screen name="GameOverScreen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
