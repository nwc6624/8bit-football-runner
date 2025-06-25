// 8-bit Football Dodger GameScreen
// Uses React Native, Expo, TypeScript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Animated, TouchableOpacity } from 'react-native';
import { useTilt } from '../engine/sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const PLAYER_RADIUS = 24;
const ENEMY_RADIUS = 20;
const POWERUP_RADIUS = 18;
const PLAYER_Y = height - 120;
const LANES = 3;
const LANE_WIDTH = width / LANES;
const DISTANCE_GOAL = 1000;

const ENEMY_COLORS = ['#3498db']; // blue
const POWERUP_COLOR = '#2ecc40'; // green
const PLAYER_COLOR = '#e74c3c'; // red

type Difficulty = 'easy' | 'normal' | 'hard';
type ControlMode = 'swipe' | 'tilt';
interface Enemy { x: number; y: number; passed: boolean; }
interface PowerUp { x: number; y: number; }

const DIFFICULTY_SETTINGS: Record<Difficulty, { enemySpeed: number; enemyRate: number; maxEnemies: number }> = {
  easy:   { enemySpeed: 4, enemyRate: 0.02, maxEnemies: 3 },
  normal: { enemySpeed: 6, enemyRate: 0.035, maxEnemies: 5 },
  hard:   { enemySpeed: 8, enemyRate: 0.06, maxEnemies: 7 },
};

function randomLane() {
  return Math.floor(Math.random() * LANES);
}

function collides(a: {x: number, y: number}, b: {x: number, y: number}, rA: number, rB: number) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < (rA + rB);
}

export default function GameScreen() {
  // Settings (could be from context or AsyncStorage)
  const [controlMode, setControlMode] = useState<ControlMode>('tilt');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  // Game state
  const [playerLane, setPlayerLane] = useState<number>(1);
  const [playerX, setPlayerX] = useState<number>(LANE_WIDTH * 1.5);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [speedBurst, setSpeedBurst] = useState<boolean>(false);
  const [speedBurstCount, setSpeedBurstCount] = useState<number>(0);
  const [bgOffset, setBgOffset] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);

  // Controls
  const tilt = useTilt();
  const pan = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // For smooth swipe: track drag position
  const [dragX, setDragX] = useState<number | null>(null);

  // Load settings from AsyncStorage
  useEffect(() => {
    (async () => {
      const mode = await AsyncStorage.getItem('CONTROL_MODE');
      const diff = await AsyncStorage.getItem('DIFFICULTY');
      if (mode === 'swipe' || mode === 'tilt') setControlMode(mode);
      if (diff === 'easy' || diff === 'normal' || diff === 'hard') setDifficulty(diff);
    })();
  }, []);

  // PanResponder for smooth swipe
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => controlMode === 'swipe',
    onMoveShouldSetPanResponder: () => controlMode === 'swipe',
    onPanResponderGrant: (evt, gesture) => {
      if (paused || gameOver) return;
      setDragX(gesture.x0);
    },
    onPanResponderMove: (evt, gesture) => {
      if (paused || gameOver) return;
      // Clamp finger position to screen width
      let x = gesture.moveX;
      if (x < 0) x = 0;
      if (x > width) x = width;
      setPlayerX(x);
      setDragX(x);
    },
    onPanResponderRelease: (evt, gesture) => {
      setDragX(null);
      // Snap to nearest lane center
      let x = gesture.moveX;
      if (x < 0) x = 0;
      if (x > width) x = width;
      const lane = Math.round(x / LANE_WIDTH - 0.5);
      setPlayerLane(Math.max(0, Math.min(LANES - 1, lane)));
    },
  });

  // Tilt control
  useEffect(() => {
    if (controlMode !== 'tilt' || paused || gameOver) return;
    if (tilt < -0.2 && playerLane > 0) setPlayerLane(0);
    else if (tilt > 0.2 && playerLane < LANES - 1) setPlayerLane(2);
    else setPlayerLane(1);
  }, [tilt, controlMode, paused, gameOver]);

  // Update playerX when lane changes (unless dragging)
  useEffect(() => {
    if (dragX === null) {
      setPlayerX(LANE_WIDTH * (playerLane + 0.5));
    }
  }, [playerLane, dragX]);

  // Main game loop
  useEffect(() => {
    if (gameOver || paused) return;
    // Dynamic difficulty scaling
    let baseSettings = DIFFICULTY_SETTINGS[difficulty];
    // Increase difficulty as score increases
    let enemySpeed = baseSettings.enemySpeed + Math.floor(score / 10); // +1 speed every 10 points
    let enemyRate = baseSettings.enemyRate + Math.min(0.03, score * 0.001); // +0.001 per point, max +0.03
    let maxEnemies = baseSettings.maxEnemies + Math.floor(score / 20); // +1 max every 20 points
    const interval = setInterval(() => {
      setBgOffset(o => (o + enemySpeed) % height);
      setEnemies(prev => prev.map(e => ({ ...e, y: e.y + enemySpeed })));
      setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + enemySpeed })));
      setEnemies(prev => {
        if (prev.length < maxEnemies && Math.random() < enemyRate) {
          return [...prev, { x: LANE_WIDTH * (randomLane() + 0.5), y: -ENEMY_RADIUS, passed: false }];
        }
        return prev;
      });
      setPowerUps(prev => {
        if (Math.random() < 0.01 && prev.length < 1) {
          return [...prev, { x: LANE_WIDTH * (randomLane() + 0.5), y: -POWERUP_RADIUS }];
        }
        return prev;
      });
      setEnemies(prev => {
        return prev.filter(e => {
          // Collision with player
          if (collides({ x: playerX, y: PLAYER_Y }, e, PLAYER_RADIUS, ENEMY_RADIUS)) {
            if (speedBurst) {
              setSpeedBurstCount(c => c + 1);
              setScore(s => s + 1);
              return false; // Remove enemy
            } else {
              setGameOver(true);
              return false;
            }
          }
          // Passed player (increment score, but do NOT end game)
          if (!e.passed && e.y > PLAYER_Y + PLAYER_RADIUS) {
            setScore(s => s + 1);
            e.passed = true;
          }
          // Offscreen
          return e.y < height + ENEMY_RADIUS;
        });
      });
      setPowerUps(prev => {
        return prev.filter(p => {
          if (collides({ x: playerX, y: PLAYER_Y }, p, PLAYER_RADIUS, POWERUP_RADIUS)) {
            setSpeedBurst(true);
            setSpeedBurstCount(0);
            return false;
          }
          return p.y < height + POWERUP_RADIUS;
        });
      });
      if (speedBurst && speedBurstCount >= 3) {
        setSpeedBurst(false);
        setSpeedBurstCount(0);
      }
      setDistance(d => d + enemySpeed);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [playerX, speedBurst, speedBurstCount, gameOver, paused, difficulty, controlMode, distance, score]);

  // Pause/Resume
  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);
  const handleRestart = () => {
    setEnemies([]);
    setPowerUps([]);
    setScore(0);
    setDistance(0);
    setGameOver(false);
    setSpeedBurst(false);
    setSpeedBurstCount(0);
    setPaused(false);
    setPlayerLane(1);
    setDragX(null);
  };

  // UI
  return (
    <View style={styles.container}>
      {/* Score/Distance/Power-up UI */}
      <View style={styles.hud} pointerEvents={gameOver ? 'none' : 'auto'}>
        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={styles.hudText}>Distance: {distance} yds</Text>
        {speedBurst && <Text style={styles.hudText}>Speed Burst: {3 - speedBurstCount}</Text>}
      </View>
      {/* Pause Button */}
      {!gameOver && !paused && (
        <Text style={styles.pauseBtn} onPress={handlePause}>⏸️</Text>
      )}
      {/* Resume/Restart Menu */}
      {paused && !gameOver && (
        <View style={styles.pauseMenu} pointerEvents="auto">
          <Text style={styles.menuText}>Paused</Text>
          <Text style={styles.menuBtn} onPress={handleResume}>Resume</Text>
          <Text style={styles.menuBtn} onPress={handleRestart}>Restart</Text>
        </View>
      )}
      {/* Game Over Popup Overlay */}
      {gameOver && (
        <View style={[styles.overlay, {zIndex: 200}]}> {/* Fullscreen overlay to block input */}
          <View style={styles.pauseMenu} pointerEvents="auto">
            <Text style={styles.menuText}>GameOver!</Text>
            <Text style={styles.menuText}>Score: {score}</Text>
            <Text style={styles.menuText}>Distance: {distance} yds</Text>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <TouchableOpacity onPress={handleRestart} style={{ width: '80%' }}>
                <Text style={styles.menuBtn}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace('/HomeScreen')} style={{ width: '80%' }}>
                <Text style={styles.menuBtn}>Main Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Game Field (block input if gameOver) */}
      <View
        style={styles.field}
        {...(controlMode === 'swipe' && !gameOver && !paused ? panResponder.panHandlers : {})}
        pointerEvents={gameOver ? 'none' : 'auto'}
      >
        {/* Player */}
        {!gameOver && (
          <View style={{
            position: 'absolute',
            left: playerX - PLAYER_RADIUS,
            top: PLAYER_Y - PLAYER_RADIUS,
            width: PLAYER_RADIUS * 2,
            height: PLAYER_RADIUS * 2,
            borderRadius: PLAYER_RADIUS,
            backgroundColor: PLAYER_COLOR,
            borderWidth: 3,
            borderColor: '#fff',
          }} />
        )}
        {/* Enemies */}
        {!gameOver && enemies.map((e, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: e.x - ENEMY_RADIUS,
            top: e.y - ENEMY_RADIUS,
            width: ENEMY_RADIUS * 2,
            height: ENEMY_RADIUS * 2,
            borderRadius: ENEMY_RADIUS,
            backgroundColor: ENEMY_COLORS[0],
            borderWidth: 2,
            borderColor: '#fff',
          }} />
        ))}
        {/* Power-Ups */}
        {!gameOver && powerUps.map((p, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: p.x - POWERUP_RADIUS,
            top: p.y - POWERUP_RADIUS,
            width: POWERUP_RADIUS * 2,
            height: POWERUP_RADIUS * 2,
            borderRadius: POWERUP_RADIUS,
            backgroundColor: POWERUP_COLOR,
            borderWidth: 2,
            borderColor: '#fff',
          }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'flex-end',
  },
  field: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#333',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hud: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 10,
  },
  hudText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'SpaceMono',
  },
  pauseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 32,
    color: '#fff',
    zIndex: 20,
  },
  pauseMenu: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width / 2 - 120,
    width: 240,
    height: 200,
    backgroundColor: '#111d',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  menuText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'SpaceMono',
    marginBottom: 16,
  },
  menuBtn: {
    color: '#0ff',
    fontSize: 22,
    fontFamily: 'SpaceMono',
    marginVertical: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 