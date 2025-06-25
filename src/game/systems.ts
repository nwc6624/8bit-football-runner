import Matter, { Engine, World, Body, Bodies, Composite, Constraint, MouseConstraint } from 'matter-js';
import { Dimensions } from 'react-native';
import { GameEntities, System, GameEvent } from '../types';
import { PLAYER_WIDTH, OPPONENT_WIDTH, OPPONENT_HEIGHT } from './entities';

// Re-export types for use in other files
export type { System, GameEvent };

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// Extend Matter.js types to include our custom properties
declare module 'matter-js' {
  interface IBodyDefinition {
    speed?: number;
    direction?: number;
    yardLine?: number;
  }
}

// Systems
export const Physics: System = (entities, { time }) => {
  const { engine } = entities.physics;
  Matter.Engine.update(engine, 1000 / 60); // Fixed timestep for consistent physics
  return entities;
};

export const PlayerControl: System = (entities, { touches, time }) => {
  const { player, input } = entities;
  
  if (!player || !input) return entities;
  
  const { width: screenWidth } = require('react-native').Dimensions.get('window');
  const playerSpeed = 5;
  
  let moveX = 0;
  let moveY = 0;
  
  if (input.touches) {
    const touch = input.touches.find((t: any) => t.type === 'move' || t.type === 'start');
    if (touch) {
      const touchX = touch.event.locationX;
      const touchY = touch.event.locationY;
      
      if (touchY > screenWidth * 0.5) {
        const centerX = screenWidth / 2;
        const dx = touchX - centerX;
        const dy = touchY - (screenWidth * 0.75); // Bottom quarter of screen
        
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
          moveX = (dx / length) * playerSpeed;
          moveY = (dy / length) * playerSpeed;
        }
      }
    }
  }
  
  if (moveX !== 0 || moveY !== 0) {
    Body.setVelocity(player, { 
      x: moveX * 10, // Scale for better responsiveness
      y: moveY * 10
    });
  } else if (player.velocity) {
    Body.setVelocity(player, {
      x: player.velocity.x * 0.9,
      y: player.velocity.y * 0.9
    });
  }
  
  const halfWidth = PLAYER_WIDTH / 2;
  if (player.position.x < halfWidth) {
    Body.setPosition(player, { x: halfWidth, y: player.position.y });
    Body.setVelocity(player, { x: 0, y: player.velocity.y });
  } else if (player.position.x > screenWidth - halfWidth) {
    Body.setPosition(player, { x: screenWidth - halfWidth, y: player.position.y });
    Body.setVelocity(player, { x: 0, y: player.velocity.y });
  }
  
  return entities;
};

export const OpponentSpawner: System = (entities, { time = { current: 0 }, dispatch }) => {
  const { world } = entities.physics;
  const { width: screenWidth } = require('react-native').Dimensions.get('window');
  
  // Initialize lastSpawn if it doesn't exist
  if (entities.lastSpawn === undefined) {
    entities.lastSpawn = 0;
  }
  
  const currentTime = time.current;
  const lastSpawnTime = entities.lastSpawn;
  
  // Spawn a new opponent every 2-4 seconds
  if (currentTime - lastSpawnTime > 2000 + Math.random() * 2000) {
    entities.lastSpawn = currentTime;
    
    // Random position at the top of the screen
    const x = Math.random() * (WINDOW_WIDTH - OPPONENT_WIDTH * 2) + OPPONENT_WIDTH;
    const y = -OPPONENT_HEIGHT * 2; // Start above the screen
    
    // Create new opponent with random properties
    const opponentBody = Bodies.rectangle(
      x, 
      y, 
      OPPONENT_WIDTH, 
      OPPONENT_HEIGHT,
      {
        label: 'opponent',
        friction: 0.1,
        restitution: 0.4,
        render: {
          fillStyle: Math.random() > 0.5 ? '#0000FF' : '#FFFFFF',
          strokeStyle: '#000000',
          lineWidth: 2
        },
        // Add custom properties for AI
        speed: 2 + Math.random() * 3,
        direction: Math.random() > 0.5 ? 1 : -1
      } as any // Type assertion for custom properties
    );
    
    // Add to world and entities
    Composite.add(world, opponentBody);
    entities.opponents.push(opponentBody);
    
    // Dispatch event for sound effect
    if (dispatch) {
      // Use type assertion since we know the shape of the event
      (dispatch as any)({ type: 'spawnOpponent', opponent: opponentBody });
    }
  }
  
  // Move opponents down the screen
  if (entities.opponents) {
    entities.opponents.forEach((opponent: any) => {
      // Simple AI: move in a zig-zag pattern
      const speed = opponent.speed || 2;
      const direction = opponent.direction || 1;
      
      // Change direction occasionally
      if (Math.random() < 0.01) {
        opponent.direction = -direction;
      }
      
      // Apply movement
      Body.setVelocity(opponent, {
        x: direction * speed,
        y: 3 + Math.random() * 2 // Slight random vertical speed
      });
    });
  }
  
  return entities;
};

export const Cleanup: System = (entities) => {
  const { world } = entities.physics;
  const { height: screenHeight, width: screenWidth } = require('react-native').Dimensions.get('window');
  
  // Clean up opponents that are off-screen
  if (entities.opponents) {
    const toRemove: Body[] = [];
    
    entities.opponents.forEach((opponent: any) => {
      // Remove if below the screen or too far to the sides
      if (opponent.position.y > screenHeight + 100 ||
          opponent.position.x < -100 ||
          opponent.position.x > screenWidth + 100) {
        toRemove.push(opponent);
        Composite.remove(world, opponent);
      }
    });
    
    // Remove from entities
    entities.opponents = entities.opponents.filter(
      (opponent: any) => !toRemove.includes(opponent)
    );
  }
  
  return entities;
};

export const CollisionDetection: System = (entities, { dispatch }) => {
  const { player, opponents } = entities;
  
  if (!player || !opponents || !dispatch) return entities;
  
  // Check for collisions between player and opponents
  const collision = opponents.some(opponent => {
    return Matter.Collision.collides(player, opponent, undefined as any);
  });
  
  if (collision) {
    // Game over with final score
    dispatch({ 
      type: 'gameOver',
      score: entities.score || 0 
    });
  }
  
  return entities;
};

// Input system to handle touch controls
export const InputSystem: System = (entities, { touches = [] }) => {
  // Track touch state
  entities.input = { touches };
  return entities;
};
