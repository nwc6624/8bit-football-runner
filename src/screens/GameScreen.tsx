import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Matter from 'matter-js';
import { Accelerometer } from 'expo-sensors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const OPPONENT_SIZE = 40;
const FIELD_LINE_HEIGHT = 20;

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

type Props = {
  navigation: GameScreenNavigationProp;
};

const GameScreen: React.FC<Props> = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const engine = useRef<Matter.Engine | null>(null);
  const world = useRef<Matter.World | null>(null);
  const player = useRef<Matter.Body | null>(null);
  const gameLoop = useRef<number | null>(null);
  const lastFieldLine = useRef(0);
  const fieldLines = useRef<Matter.Body[]>([]);
  const opponents = useRef<Matter.Body[]>([]);

  // Initialize game
  const initGame = () => {
    // Setup physics engine
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const world = engine.world;

    // Create player
    const player = Matter.Bodies.rectangle(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT - 100,
      PLAYER_SIZE,
      PLAYER_SIZE,
      { 
        label: 'player',
        friction: 0,
        restitution: 0,
        inertia: Infinity,
      }
    );

    // Create initial field lines
    const lines = [];
    for (let i = 0; i < 10; i++) {
      const line = Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT - (i * 100) - 50,
        SCREEN_WIDTH - 40,
        FIELD_LINE_HEIGHT,
        { 
          isStatic: true,
          isSensor: true,
          label: 'fieldLine',
          render: {
            fillStyle: '#4CAF50',
          },
        }
      );
      lines.push(line);
    }
    lastFieldLine.current = lines[lines.length - 1].position.y;

    // Add all bodies to the world
    Matter.Composite.add(world, [player, ...lines]);

    return { engine, world, player, lines };
  };

  // Handle accelerometer updates
  useEffect(() => {
    let subscription: any = null;
    
    const subscribe = async () => {
      await Accelerometer.setUpdateInterval(16); // ~60fps
      subscription = Accelerometer.addListener(accelerometerData => {
        if (player.current && !gameOver) {
          const { x } = accelerometerData;
          const newX = player.current.position.x - (x * 10);
          
          // Keep player within screen bounds
          const boundedX = Math.max(
            PLAYER_SIZE / 2,
            Math.min(SCREEN_WIDTH - PLAYER_SIZE / 2, newX)
          );
          
          Matter.Body.setPosition(player.current, {
            x: boundedX,
            y: player.current.position.y
          });
        }
      });
    };

    subscribe();
    return () => {
      subscription?.remove();
    };
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    // Initialize game
    const { engine: gameEngine, world: gameWorld, player: gamePlayer, lines } = initGame();
    engine.current = gameEngine;
    world.current = gameWorld;
    player.current = gamePlayer;
    fieldLines.current = lines;

    // Game loop
    const loop = () => {
      if (gameOver) return;
      
      // Update physics
      Matter.Engine.update(gameEngine, 1000 / 60);
      
      // Check for collisions
      const collisions = Matter.Query.collides(gamePlayer, [...fieldLines.current, ...opponents.current]);
      
      collisions.forEach((collision: Matter.Collision) => {
        if (collision.bodyB.label === 'opponent') {
          // Game over on opponent collision
          setGameOver(true);
          navigation.replace('GameOver', { score });
        } else if (collision.bodyB.label === 'fieldLine') {
          // Increase score when passing field lines
          const lineIndex = fieldLines.current.findIndex(line => line.id === collision.bodyB.id);
          if (lineIndex === fieldLines.current.length - 1) {
            setScore(prev => prev + 10);
          }
        }
      });

      // Generate new field lines
      const lastLine = fieldLines.current[fieldLines.current.length - 1];
      if (lastLine.position.y > 0) {
        const newLine = Matter.Bodies.rectangle(
          SCREEN_WIDTH / 2,
          lastLine.position.y - 100,
          SCREEN_WIDTH - 40,
          FIELD_LINE_HEIGHT,
          { 
            isStatic: true,
            isSensor: true,
            label: 'fieldLine',
            render: {
              fillStyle: '#4CAF50',
            },
          }
        );
        fieldLines.current.push(newLine);
        Matter.Composite.add(gameWorld, newLine);
        
        // Remove old lines that are off screen
        if (fieldLines.current.length > 10) {
          const removed = fieldLines.current.shift();
          if (removed) {
            Matter.Composite.remove(gameWorld, removed);
          }
        }
      }

      // Generate opponents
      if (Math.random() < 0.01) { // 1% chance per frame
        const x = Math.random() * (SCREEN_WIDTH - OPPONENT_SIZE) + OPPONENT_SIZE / 2;
        const opponent = Matter.Bodies.rectangle(
          x,
          -OPPONENT_SIZE,
          OPPONENT_SIZE,
          OPPONENT_SIZE,
          {
            label: 'opponent',
            friction: 0,
            restitution: 0,
            render: {
              fillStyle: '#ff0000',
            },
          }
        );
        
        // Apply downward force to make opponents fall
        Matter.Body.setVelocity(opponent, { x: 0, y: 5 });
        
        opponents.current.push(opponent);
        Matter.Composite.add(gameWorld, opponent);
        
        // Remove opponents that are off screen
        opponents.current = opponents.current.filter(opp => {
          if (opp.position.y > SCREEN_HEIGHT + OPPONENT_SIZE) {
            Matter.Composite.remove(gameWorld, opp);
            return false;
          }
          return true;
        });
      }
      
      // Continue the game loop
      gameLoop.current = requestAnimationFrame(loop);
    };
    
    // Start the game loop
    gameLoop.current = requestAnimationFrame(loop);
    
    // Cleanup
    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
      Matter.Engine.clear(gameEngine);
    };
  }, [gameOver]);

  // Handle screen touch for dodge
  const handleScreenPress = (side: 'left' | 'right') => {
    if (!player.current || gameOver) return;
    
    const distance = 100;
    const newX = side === 'left' 
      ? Math.max(PLAYER_SIZE / 2, player.current.position.x - distance)
      : Math.min(SCREEN_WIDTH - PLAYER_SIZE / 2, player.current.position.x + distance);
    
    Matter.Body.setPosition(player.current, {
      x: newX,
      y: player.current.position.y
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>SCORE: {score}</Text>
      </View>
      
      <View style={styles.gameContainer}>
        {/* Game will be rendered here by Matter.js */}
        <View style={styles.touchAreaLeft} onTouchStart={() => handleScreenPress('left')} />
        <View style={styles.touchAreaRight} onTouchStart={() => handleScreenPress('right')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  scoreText: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  touchAreaLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },
  touchAreaRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 10,
  },
});

export default GameScreen;
