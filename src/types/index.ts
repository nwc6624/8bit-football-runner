import { StackNavigationProp } from '@react-navigation/stack';

// 8-bit color palette
export const COLORS = {
  BLACK: '#000000',
  DARK_BLUE: '#1D2B53',
  DARK_PURPLE: '#7E2553',
  DARK_GREEN: '#008751',
  BROWN: '#AB5236',
  DARK_GRAY: '#5F574F',
  LIGHT_GRAY: '#C2C3C7',
  WHITE: '#FFF1E8',
  RED: '#FF004D',
  ORANGE: '#FFA300',
  YELLOW: '#FFEC27',
  GREEN: '#00E436',
  BLUE: '#29ADFF',
  LAVENDER: '#83769C',
  PINK: '#FF77A8',
  PEACH: '#FFCCAA',
} as const;

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  GameOver: { score: number };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
export type GameOverScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameOver'>;
