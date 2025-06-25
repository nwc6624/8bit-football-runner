import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Dodger</Text>
      {/* Animated background placeholder */}
      <View style={styles.animatedBg} />
      <TouchableOpacity style={styles.button} onPress={() => router.push('/GameScreen')}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/InstructionsScreen')}>
        <Text style={styles.buttonText}>How to Play</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/SettingsScreen')}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'SpaceMono',
    marginBottom: 40,
  },
  animatedBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: '#0ff',
  },
  button: {
    backgroundColor: '#0ff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontSize: 20,
    fontFamily: 'SpaceMono',
  },
}); 