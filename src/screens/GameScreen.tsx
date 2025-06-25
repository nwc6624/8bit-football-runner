import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  BackHandler,
  Vibration,
  Platform,
  SafeAreaView
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { GameEngine } from 'react-native-game-engine';
import Matter, { Engine, World, Body, Events } from 'matter-js';
import type { Body as MatterBody, Engine as MatterEngine, World as MatterWorld } from 'matter-js';
import { useFocusEffect } from '@react-navigation/native';

// Import components and systems
import { createPlayer, createOpponent, createBoundaries } from '../game/entities';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock systems if they don't exist
const Physics = () => {};
const PlayerControl = () => {};
const OpponentSpawner = () => {};
const CollisionDetection = () => {};
const Cleanup = () => {};
const InputSystem = () => {};

// Types
interface ISubscription {
  remove: () => void;
}

type GameEngineRef = {
  dispatch: (event: any) => void;
  start: () => void;
  stop: () => void;
  swap: (newEntities: any) => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;
};

type GameScreenProps = {
  navigation: any;
  route: any;
};

interface GameState {
  player: Matter.Body | null;
  opponents: Matter.Body[];
  boundaries: Matter.Body[];
  fieldLines: Matter.Body[];
  physics: {
    engine: Matter.Engine | null;
    world: Matter.World | null;
  };
  touches: Array<{ id: number; x: number; y: number }>;
  score: number;
  isGameOver: boolean;
  lastSpawn: number;
  input: {
    touches: any[];
  };
}

// Game constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PLAYER_SIZE = 40;
const OPPONENT_SIZE = 30;
const FIELD_LINE_HEIGHT = 5;
const FIELD_LINE_SPACING = 50;
const OPPONENT_SPAWN_RATE = 2000; // ms

// Colors
const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  DARK_GREEN: '#006400',
  LIGHT_GREEN: '#90EE90',
  DARK_BLUE: '#00008B',
  RED: '#FF0000',
  YELLOW: '#FFFF00',
  BLUE: '#0000FF',
  GRAY: '#808080',
  LIGHT_GRAY: '#D3D3D3',
  ORANGE: '#FFA500',
};

// Fonts
const FONTS = {
  PRESS_START_2P: 'PressStart2P-Regular',
  VT323: 'VT323-Regular',
};

// Player and game constants
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;

// Extended game entities with all required properties
interface ExtendedGameEntities {
  physics: {
    engine: Matter.Engine | null;
    world: Matter.World | null;
  };
  player: Matter.Body | null;
  opponents: Matter.Body[];
  boundaries: Matter.Body[];
  fieldLines: Matter.Body[];
  lastSpawn: number;
  input: {
    touches: any[];
  };
  score: number;
  isGameOver: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation }) => {
  // Refs
  const gameEngineRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isMounted = useRef<boolean>(true);
  const subscriptionRef = useRef<ISubscription | null>(null);
  const entitiesRef = useRef<ExtendedGameEntities | null>(null);
  const physics = useRef<{ engine: Matter.Engine | null; world: Matter.World | null }>({ 
    engine: null, 
    world: null 
  });
  
  // Game state
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [isAccelerometerAvailable, setIsAccelerometerAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Game state ref
  const gameState = useRef<GameState>({
    player: null,
    opponents: [],
    boundaries: [],
    fieldLines: [],
    physics: { engine: null, world: null },
    touches: [],
    score: 0,
    isGameOver: false,
    lastSpawn: 0,
    input: { touches: [] }
  });
  
  // Get physics world helper
  const getPhysicsWorld = useCallback((): Matter.World | null => {
    return physics.current.world;
  }, []);
  
  // Initialize physics world
  const initPhysics = useCallback((): { engine: Matter.Engine; world: Matter.World } => {
    const engine = Engine.create({ enableSleeping: false });
    const world = engine.world;
    world.gravity.y = 0; // No gravity, we'll handle movement manually
    
    // Create game boundaries and player
    const gameBoundaries = createBoundaries(world, SCREEN_WIDTH, SCREEN_HEIGHT);
    const playerObj = createPlayer(world, { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 100 });
    
    if (!playerObj) {
      throw new Error('Failed to create player');
    }
    
    // Initialize game state with physics and entities
    const initialState: GameState = {
      player: playerObj,
      opponents: [],
      boundaries: gameBoundaries,
      fieldLines: [],
      physics: { engine, world },
      touches: [],
      lastSpawn: 0,
      score: 0,
      isGameOver: false,
      input: { touches: [] }
    };
    
    gameState.current = initialState;
    physics.current = { engine, world };
    return { engine, world };
  }, []);
  
  // Helper function to safely update game state with proper typing
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    if (!isMounted.current) return;
    
    gameState.current = {
      ...gameState.current,
      ...updates
    };
    
    // Update entities ref for rendering
    entitiesRef.current = {
      player: gameState.current.player,
      opponents: gameState.current.opponents,
      boundaries: gameState.current.boundaries,
      fieldLines: gameState.current.fieldLines,
      physics: physics.current,
      lastSpawn: gameState.current.lastSpawn,
      input: gameState.current.input,
      score: gameState.current.score,
      isGameOver: gameState.current.isGameOver,
    };
  }, []);
  
  // Initialize styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.DARK_GREEN,
    },
    gameContainer: {
      flex: 1,
      position: 'relative',
    },
    score: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: COLORS.WHITE,
      fontSize: 24,
      fontFamily: 'PressStart2P-Regular',
    },
    gameOver: {
      position: 'absolute',
      top: '40%',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: COLORS.RED,
    },
    gameOverContainer: {
      position: 'absolute',
      top: '40%',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: COLORS.RED,
    },
    gameOverText: {
      fontSize: 24,
      fontFamily: 'PressStart2P-Regular',
    },
    finalScore: {
      fontSize: 18,
      fontFamily: 'PressStart2P-Regular',
    },
    restartButton: {
      backgroundColor: COLORS.DARK_BLUE,
      padding: 10,
      borderRadius: 4,
      marginTop: 20,
    },
    restartButtonText: {
      color: COLORS.WHITE,
      fontSize: 18,
      fontFamily: 'PressStart2P-Regular',
    },
  });
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isMounted.current || !gameState.current.physics.engine) return;
    
    const { player, physics: gamePhysics } = gameState.current;
    const deltaTime = currentTime - (lastTime.current || 0);
    lastTime.current = currentTime;
    
    // Skip if game is over or physics engine not ready
    if (isGameOver || !gamePhysics.engine) return;
    
    try {
      // Update physics
      Engine.update(gamePhysics.engine, deltaTime);
      
      // Update game state based on physics
      if (player) {
        // Keep player in bounds
        Body.setPosition(player, {
          x: Math.max(0, Math.min(SCREEN_WIDTH - PLAYER_SIZE, player.position.x)),
          y: player.position.y
        });
      }
      
      // Spawn opponents
      const now = Date.now();
      if (now - gameState.current.lastSpawn > OPPONENT_SPAWN_RATE) {
        const world = getPhysicsWorld();
        if (world) {
          const opponent = createOpponent(
            world,
            { x: Math.random() * SCREEN_WIDTH, y: -50 }
          );
          
          if (opponent) {
            gameState.current.opponents.push(opponent);
            gameState.current.lastSpawn = now;
          }
        }
      }
      
      // Update score based on player position
      if (player) {
        const distance = Math.max(0, SCREEN_HEIGHT - player.position.y);
        const newScore = Math.floor(distance / 10);
        if (newScore > gameState.current.score) {
          gameState.current.score = newScore;
          setScore(newScore);
        }
      }
      
      // Check for collisions
      if (gamePhysics.engine) {
        const collisionHandler = (event: Matter.IEventCollision<Matter.Engine>) => {
          const pairs = event.pairs;
          
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            
            // Check if player collided with opponent
            if (
              (pair.bodyA === gameState.current.player && pair.bodyB.label === 'opponent') ||
              (pair.bodyB === gameState.current.player && pair.bodyA.label === 'opponent')
            ) {
              gameState.current.isGameOver = true;
              setIsGameOver(true);
              Matter.Events.off(gamePhysics.engine!, 'collisionStart', collisionHandler as any);
              return;
            }
          }
        };
        
        Matter.Events.on(gamePhysics.engine, 'collisionStart', collisionHandler as any);
      }
      
      // Clean up opponents that are off screen
      if (gamePhysics.world) {
        gameState.current.opponents = gameState.current.opponents.filter(opponent => {
          if (opponent.position.y > SCREEN_HEIGHT + 50) {
            Matter.World.remove(gamePhysics.world!, opponent);
            return false;
          }
          return true;
        });
      }
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
      
    } catch (error) {
      console.error('Error in game loop:', error);
    }
    
    // Continue the game loop
    if (isMounted.current) {
      requestAnimationFrame(gameLoop);
    }
  }, [isGameOver, getPhysicsWorld]);
  
  // Start game loop
  const startGameLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastTime.current = performance.now();
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);
  
  // Stop game loop
  const stopGameLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  // Initialize game
  const initGame = useCallback(async () => {
    try {
      // Initialize physics
      const { engine, world } = initPhysics();
      physics.current = { engine, world };
      
      // Start accelerometer
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (isAvailable) {
        await Accelerometer.setUpdateInterval(16); // ~60fps
        const sub = Accelerometer.addListener(accelData => {
          setAcceleration(accelData);
        });
        subscriptionRef.current = { remove: sub.remove };
        setIsAccelerometerAvailable(true);
      }
      
      // Start game loop
      startGameLoop();
      
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'Failed to initialize game. Please try again.');
    }
  }, [initPhysics, startGameLoop]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
      
      // Clean up physics engine
      if (physics.current.engine) {
        Matter.Engine.clear(physics.current.engine);
      }
    };
  }, []);
  
  // Render game
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.gameContainer as any}>
          <Text style={styles.score}>Score: {score}</Text>
          {isGameOver ? (
            <View style={styles.gameOverContainer as any}>
              <Text style={styles.gameOverText as any}>Game Over!</Text>
              <Text style={styles.finalScore as any}>Final Score: {score}</Text>
              <TouchableOpacity
                style={styles.restartButton as any}
                onPress={() => {
                  navigation.replace('Game');
                }}
              >
                <Text style={styles.restartButtonText as any}>Play Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gameArea as any}>
              <Text style={styles.instructions as any}>
                Tilt your device to move. Avoid the opponents!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_GREEN,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  } as any, // Using 'as any' to bypass TypeScript error for now
  instructions: {
    color: COLORS.WHITE,
    fontFamily: FONTS.PRESS_START_2P,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
    lineHeight: 24,
  } as any, // Using 'as any' to bypass TypeScript error for now
  score: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: COLORS.WHITE,
    fontSize: 20,
    fontFamily: FONTS.PRESS_START_2P,
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  gameOverText: {
    color: COLORS.RED,
    fontFamily: FONTS.PRESS_START_2P,
    fontSize: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
  finalScore: {
    color: COLORS.WHITE,
    fontFamily: FONTS.PRESS_START_2P,
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: COLORS.RED,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  restartButtonText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.PRESS_START_2P,
    fontSize: 16,
    textAlign: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderBottomWidth: 2,
    borderColor: '#FFF1E8',
  },
  scoreText: {
    color: '#FFF1E8',
    fontSize: 20,
    fontFamily: 'PressStart2P-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dpadContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: '#FFF1E8',
    borderRadius: 4,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadCenter: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 5,
  },
  dpadUp: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dpadDown: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  dpadLeft: {
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  dpadRight: {
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dpadText: {
    color: '#FFF1E8',
    fontSize: 24,
    fontFamily: 'PressStart2P-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    marginTop: -2, // Visual centering
  },
});

export default GameScreen;
