import React, { useState } from 'react';
import GameScreen from './GameScreen';
import GameOverScreen from './GameOverScreen';

export default function Main() {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setHighScore((prev) => Math.max(prev, finalScore));
    setGameOver(true);
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setScore(0);
  };

  if (gameOver) {
    return (
      <GameOverScreen score={score} highScore={highScore} onPlayAgain={handlePlayAgain} />
    );
  }

  return (
    <GameScreen onGameOver={handleGameOver} />
  );
}
