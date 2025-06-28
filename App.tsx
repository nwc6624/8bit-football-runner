import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, ActivityIndicator, LogBox } from 'react-native';
import * as Font from 'expo-font';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
  'Non-serializable values were found in the navigation state',
]);


// Types and constants
import { COLORS } from './src/types';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  GameOver: { score: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: COLORS.DARK_BLUE },
};

const App: React.FC = () => {
  console.log('App component rendering...');
  
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load fonts and other resources
  useEffect(() => {
    async function prepare() {
      try {
        console.log('Loading fonts...');
        // Pre-load fonts
        await Font.loadAsync({
          'PressStart2P-Regular': require('./assets/fonts/PressStart2P-Regular.ttf'),
          'VT323-Regular': require('./assets/fonts/VT323-Regular.ttf'),
        });
        console.log('Fonts loaded successfully');
        
        // Add a small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (e) {
        console.error('Error loading resources:', e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
        console.log('App preparation complete');
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Show loading screen until app is ready
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading 8-Bit Football...</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      </View>
    );
  }

  // Error boundary
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  // Main app navigation
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
          />
          <Stack.Screen 
            name="GameOver" 
            component={GameOverScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.DARK_BLUE,
  },
  loadingText: {
    color: 'white',
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.DARK_BLUE,
  },
  errorTitle: {
    fontSize: 24,
    color: 'red',
    marginBottom: 20,
    fontFamily: 'VT323-Regular',
  },
  errorText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'VT323-Regular',
  },
});

export default App;
