import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Matter from 'matter-js';
import { setupWorld } from '../../engine/physics';
import { useTilt } from '../../engine/sensors';

const { width, height } = Dimensions.get('window');
const LANE_COUNT = 3;

interface Props {
  onGameOver?: (score: number) => void;
}

export default function GameScreen({ onGameOver }: Props) {
  const [score, setScore] = useState(0);
  const [playerLane, setPlayerLane] = useState(1); // 0,1,2
  const tilt = useTilt();
  const worldRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const laneWidth = width / LANE_COUNT;

  // Setup Matter.js world
  useEffect(() => {
    const { engine, world, player } = setupWorld(width, height, LANE_COUNT);
    worldRef.current = { engine, world };
    playerRef.current = player;
    // Start engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    return () => {
      Matter.Runner.stop(runner);
    };
  }, []);

  // Move player based on tilt
  useEffect(() => {
    let lane = 1;
    if (tilt < -0.2) lane = 0;
    else if (tilt > 0.2) lane = 2;
    setPlayerLane(lane);
    // Move player body in Matter.js
    if (playerRef.current) {
      Matter.Body.setPosition(
        playerRef.current,
        { x: laneWidth * (lane + 0.5), y: height - 100 }
      );
    }
  }, [tilt]);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <View style={styles.gameArea}>
        {/* Render player as a rectangle */}
        <View
          style={[
            styles.player,
            {
              left: laneWidth * playerLane + laneWidth * 0.2,
              top: height - 140,
              width: laneWidth * 0.6,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  score: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  gameArea: {
    width: width,
    height: height - 100,
    backgroundColor: '#333',
    borderColor: '#fff',
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  player: {
    position: 'absolute',
    height: 40,
    backgroundColor: '#0ff',
    borderRadius: 4,
  },
}); 