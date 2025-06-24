import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const PlayerPixelArt = () => (
  <View style={styles.playerArt}>
    {/* Helmet */}
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 0, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 0, left: 20 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 10, left: 0 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 10, left: 30 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 20, left: 0 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.RED, top: 20, left: 30 }]} />
    
    {/* Face mask */}
    <View style={[styles.pixel, { backgroundColor: COLORS.BLACK, top: 10, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.BLACK, top: 10, left: 20 }]} />
    
    {/* Jersey */}
    <View style={[styles.pixel, { backgroundColor: COLORS.DARK_BLUE, top: 30, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.DARK_BLUE, top: 30, left: 20 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.DARK_BLUE, top: 30, left: 30 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 40, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 40, left: 20 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 40, left: 30 }]} />
    
    {/* Arms */}
    <View style={[styles.pixel, { backgroundColor: COLORS.PEACH, top: 30, left: 0 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.PEACH, top: 40, left: 0 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.PEACH, top: 30, left: 40 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.PEACH, top: 40, left: 40 }]} />
    
    {/* Legs */}
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 50, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 50, left: 20 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 60, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.WHITE, top: 60, left: 20 }]} />
    
    {/* Cleats */}
    <View style={[styles.pixel, { backgroundColor: COLORS.BLACK, top: 70, left: 10 }]} />
    <View style={[styles.pixel, { backgroundColor: COLORS.BLACK, top: 70, left: 20 }]} />
  </View>
);

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  console.log('HomeScreen rendering...');
  const [highScore, setHighScore] = useState<number>(0);
  
  useEffect(() => {
    console.log('HomeScreen mounted');
    
    const loadHighScore = async () => {
      try {
        console.log('Loading high score...');
        const savedHighScore = await AsyncStorage.getItem('highScore');
        console.log('Loaded high score:', savedHighScore);
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore, 10));
        }
      } catch (error) {
        console.error('Error loading high score:', error);
      }
    };
    
    loadHighScore();
    
    return () => {
      console.log('HomeScreen unmounting');
    };
  }, []);

  // 8-bit style pixel border
  const renderPixelBorder = () => (
    <>
      {/* Top border */}
      <View style={[styles.pixelBorder, styles.borderTop]} />
      {/* Right border */}
      <View style={[styles.pixelBorder, styles.borderRight]} />
      {/* Bottom border */}
      <View style={[styles.pixelBorder, styles.borderBottom]} />
      {/* Left border */}
      <View style={[styles.pixelBorder, styles.borderLeft]} />
      
      {/* Corners */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </>
  );

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.field}>
        {/* Field lines */}
        {[...Array(10)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.fieldLine, 
              { top: `${i * 20}%` },
              i % 2 === 0 ? styles.fieldLineLight : {}
            ]} 
          />
        ))}
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>8-BIT</Text>
          <Text style={styles.subtitle}>FOOTBALL</Text>
          <Text style={styles.title}>RUNNER</Text>
        </View>
        
        {/* Player pixel art */}
        <View style={styles.playerContainer}>
          <PlayerPixelArt />
        </View>
        
        {/* High score */}
        <View style={[styles.panel, styles.highScoreContainer]}>
          {renderPixelBorder()}
          <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScore}>{highScore}</Text>
        </View>

        {/* Play button */}
        <TouchableOpacity 
          style={[styles.button, styles.playButton]}
          onPress={() => navigation.navigate('Game')}
        >
          <Text style={styles.buttonText}>PLAY GAME</Text>
        </TouchableOpacity>

        {/* About button */}
        <TouchableOpacity 
          style={[styles.button, styles.aboutButton]}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>HOW TO PLAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK_GREEN,
  },
  field: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.GREEN,
  },
  fieldLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fieldLineLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'VT323-Regular',
    color: COLORS.WHITE,
    fontSize: 64,
    textAlign: 'center',
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    lineHeight: 60,
  },
  subtitle: {
    fontFamily: 'VT323-Regular',
    color: COLORS.YELLOW,
    fontSize: 72,
    textAlign: 'center',
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    lineHeight: 70,
    marginVertical: -10,
  },
  playerContainer: {
    marginBottom: 30,
    width: 80,
    height: 100,
    position: 'relative',
  },
  playerArt: {
    width: 50,
    height: 80,
    position: 'relative',
  },
  pixel: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  panel: {
    backgroundColor: COLORS.DARK_BLUE,
    borderColor: COLORS.WHITE,
    borderWidth: 2,
    padding: 20,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  highScoreContainer: {
    marginBottom: 30,
  },
  highScoreLabel: {
    fontFamily: 'VT323-Regular',
    color: COLORS.YELLOW,
    fontSize: 28,
    marginBottom: 5,
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  highScore: {
    fontFamily: 'VT323-Regular',
    color: COLORS.WHITE,
    fontSize: 48,
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  playButton: {
    backgroundColor: COLORS.RED,
    borderColor: COLORS.WHITE,
    borderWidth: 2,
  },
  aboutButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.WHITE,
    borderWidth: 2,
  },
  buttonText: {
    fontFamily: 'VT323-Regular',
    color: COLORS.WHITE,
    fontSize: 32,
    textShadowColor: COLORS.BLACK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  // Pixel border styles
  pixelBorder: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
  },
  borderTop: {
    top: 0,
    left: 10,
    right: 10,
    height: 2,
  },
  borderRight: {
    top: 10,
    right: 0,
    bottom: 10,
    width: 2,
  },
  borderBottom: {
    bottom: 0,
    left: 10,
    right: 10,
    height: 2,
  },
  borderLeft: {
    top: 10,
    left: 0,
    bottom: 10,
    width: 2,
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: COLORS.WHITE,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
});

export default HomeScreen;
