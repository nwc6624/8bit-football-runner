import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface Props {
  score?: number;
  highScore?: number;
  onPlayAgain?: () => void;
}

export default function GameOverScreen({ score = 0, highScore = 0, onPlayAgain }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>
      <Button title="Play Again" onPress={onPlayAgain || (() => {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
  },
  score: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  highScore: {
    color: '#FFD700',
    fontSize: 20,
    marginBottom: 30,
  },
}); 