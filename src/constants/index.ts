// Colors
export const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  DARK_GREEN: '#006400', // Dark green field
  LIGHT_GREEN: '#7CFC00', // Light green field lines
  RED: '#FF0000',
  YELLOW: '#FFFF00', // First down line
  BLUE: '#0000FF',
  DARK_BLUE: '#00008B',
  GRAY: '#808080',
  LIGHT_GRAY: '#D3D3D3',
  ORANGE: '#FFA500',
};

// Fonts
export const FONTS = {
  PRESS_START_2P: 'PressStart2P-Regular',
  VT323: 'VT323-Regular',
};

// Sizes
export const SIZES = {
  // Game
  PLAYER_SIZE: 40,
  OPPONENT_SIZE: 30,
  FIELD_WIDTH: 375, // Will be overridden by screen width
  FIELD_HEIGHT: 667, // Will be overridden by screen height
  FIELD_LINE_HEIGHT: 5,
  FIELD_LINE_SPACING: 50,
  
  // UI
  PADDING: 20,
  BORDER_RADIUS: 8,
  BUTTON_HEIGHT: 50,
  
  // Text
  TITLE: 28,
  SUBTITLE: 20,
  BODY: 16,
  SMALL: 12,
};

export const GAME = {
  GRAVITY: 0.5,
  PLAYER_SPEED: 5,
  OPPONENT_SPEED: 2,
  OPPONENT_SPAWN_RATE: 120, // frames
};

export default {
  COLORS,
  FONTS,
  SIZES,
  GAME,
};
