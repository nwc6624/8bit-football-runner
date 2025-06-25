import { Dimensions } from 'react-native';

// Screen dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Player constants
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 5;

// Game constants
export const GRAVITY = 0.8;
export const JUMP_FORCE = -15;
export const OBSTACLE_SPEED = 3;

// Colors
export const COLORS = {
  background: '#87CEEB', // Sky blue
  ground: '#228B22',   // Forest green
  player: '#FF0000',   // Red
  obstacle: '#8B4513',  // Saddle brown
  text: '#FFFFFF',      // White
  score: '#FFD700',     // Gold
  field: '#228B22',     // Field green
  yardLine: '#FFFFFF',  // White yard lines
  darkGreen: '#006400', // Dark green for field
  lightGreen: '#32CD32' // Light green for field pattern
} as const;

export default COLORS;

// Helper function to get screen dimensions
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
});
