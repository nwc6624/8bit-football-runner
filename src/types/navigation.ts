import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
  GameOver: { score: number };
  Settings: undefined;
};

export type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

export interface GameScreenProps {
  navigation: GameScreenNavigationProp;
  route: {
    params?: {
      // Add any route params here if needed
    };
  };
}
