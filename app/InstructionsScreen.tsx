import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function InstructionsScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Play</Text>
      <Text style={styles.instruction}>• Swipe left/right to dodge</Text>
      <Text style={styles.instruction}>• Avoid obstacles</Text>
      <Text style={styles.instruction}>• Reach the finish line!</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
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
    fontSize: 28,
    fontFamily: 'SpaceMono',
    marginBottom: 24,
  },
  instruction: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    width: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
}); 