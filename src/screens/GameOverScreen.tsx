import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';

type GameOverScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameOver'>;
type GameOverScreenRouteProp = RouteProp<RootStackParamList, 'GameOver'>;

type Props = {
  navigation: GameOverScreenNavigationProp;
  route: GameOverScreenRouteProp;
};

const GameOverScreen: React.FC<Props> = ({ navigation, route }) => {
  const { score } = route.params;
  const [name, setName] = useState('');
  const [highScores, setHighScores] = useState<Array<{name: string, score: number}>>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Load high scores on mount
  useEffect(() => {
    loadHighScores();
  }, []);

  const loadHighScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem('highScores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error('Failed to load high scores', error);
    }
  };

  const saveScore = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      const newScore = { name: name.trim(), score };
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10 scores
      
      await AsyncStorage.setItem('highScores', JSON.stringify(updatedScores));
      setHighScores(updatedScores);
      setScoreSaved(true);
      Alert.alert('Success', 'Your score has been saved!');
    } catch (error) {
      console.error('Failed to save score', error);
      Alert.alert('Error', 'Failed to save score. Please try again.');
    }
  };

  const shareScore = () => {
    const message = `I scored ${score} yards in 16-Bit Football Runner! Can you beat my score? #16BitFootballRunner`;
    
    Share.open({
      message,
      title: 'Check out my score!',
    }).catch(err => {
      console.error('Error sharing:', err);
    });
  };

  const playAgain = () => {
    navigation.replace('Game');
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gameOverText}>GAME OVER</Text>
      <Text style={styles.scoreText}>YOUR SCORE: {score}</Text>
      
      {!scoreSaved ? (
        <View style={styles.nameInputContainer}>
          <Text style={styles.label}>Enter your name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={12}
            autoCapitalize="words"
            placeholder="Player"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveScore}>
            <Text style={styles.buttonText}>SAVE SCORE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={shareScore}>
            <Text style={styles.buttonText}>SHARE SCORE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Text style={styles.homeButtonText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {highScores.length > 0 && (
        <View style={styles.highScoresContainer}>
          <Text style={styles.highScoresTitle}>HIGH SCORES</Text>
          {highScores.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{index + 1}. {item.name}</Text>
              <Text style={styles.scoreValue}>{item.score}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  gameOverText: {
    fontFamily: 'PressStart2P-Regular',
    color: '#ff0000',
    fontSize: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreText: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 20,
    marginBottom: 40,
  },
  nameInputContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    color: '#fff',
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 5,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#4267B2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  homeButton: {
    padding: 10,
  },
  buttonText: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 14,
  },
  homeButtonText: {
    fontFamily: 'PressStart2P-Regular',
    color: '#888',
    fontSize: 12,
  },
  highScoresContainer: {
    marginTop: 30,
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
  },
  highScoresTitle: {
    fontFamily: 'PressStart2P-Regular',
    color: '#ffd700',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  scoreName: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 12,
  },
  scoreValue: {
    fontFamily: 'PressStart2P-Regular',
    color: '#fff',
    fontSize: 12,
  },
});

export default GameOverScreen;
