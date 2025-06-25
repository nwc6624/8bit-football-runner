import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const DIFFICULTY_KEY = 'DIFFICULTY';
const SOUND_KEY = 'SOUND_ON';
const CONTROL_MODE_KEY = 'CONTROL_MODE';

export default function SettingsScreen() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(true);
  const [difficulty, setDifficulty] = useState('Normal');
  const [controlMode, setControlMode] = useState<'swipe' | 'tilt'>('tilt');

  useEffect(() => {
    (async () => {
      const sound = await AsyncStorage.getItem(SOUND_KEY);
      const diff = await AsyncStorage.getItem(DIFFICULTY_KEY);
      const mode = await AsyncStorage.getItem(CONTROL_MODE_KEY);
      if (sound !== null) setSoundOn(sound === 'true');
      if (diff) setDifficulty(diff);
      if (mode === 'swipe' || mode === 'tilt') setControlMode(mode);
    })();
  }, []);

  const saveSettings = async (newSound: boolean, newDiff: string, newMode: 'swipe' | 'tilt') => {
    await AsyncStorage.setItem(SOUND_KEY, newSound.toString());
    await AsyncStorage.setItem(DIFFICULTY_KEY, newDiff);
    await AsyncStorage.setItem(CONTROL_MODE_KEY, newMode);
  };

  const handleSoundToggle = () => {
    const newSound = !soundOn;
    setSoundOn(newSound);
    saveSettings(newSound, difficulty, controlMode);
  };

  const handleDifficulty = (level: string) => {
    setDifficulty(level);
    saveSettings(soundOn, level, controlMode);
  };

  const handleControlMode = (mode: 'swipe' | 'tilt') => {
    setControlMode(mode);
    saveSettings(soundOn, difficulty, mode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Sound</Text>
        <Switch value={soundOn} onValueChange={handleSoundToggle} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.difficultyRow}>
          {['Easy', 'Normal', 'Hard'].map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.diffButton, difficulty === level && styles.diffButtonActive]}
              onPress={() => handleDifficulty(level)}
            >
              <Text style={styles.diffText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Controls</Text>
        <View style={styles.difficultyRow}>
          {['tilt', 'swipe'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.diffButton, controlMode === mode && styles.diffButtonActive]}
              onPress={() => handleControlMode(mode as 'swipe' | 'tilt')}
            >
              <Text style={styles.diffText}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'SpaceMono',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 20,
    width: 100,
  },
  difficultyRow: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  diffButton: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  diffButtonActive: {
    backgroundColor: '#0ff',
  },
  diffText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  button: {
    backgroundColor: '#0ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    width: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
}); 