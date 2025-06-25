import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'HIGH_SCORE';

export async function getHighScore(): Promise<number> {
  const value = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  return value ? parseInt(value, 10) : 0;
}

export async function setHighScore(score: number): Promise<void> {
  await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
} 