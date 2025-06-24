import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../types';

const SPRITE_SIZE = 16; // Size of each sprite frame in pixels
const SCALE = 2; // Scale factor for better visibility

// Animation frames for running right (4 frames per animation cycle)
const RUN_RIGHT_FRAMES = [
  // Frame 1
  [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  // Frame 2
  [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  // Frame 3 (same as frame 1 but with slight variation)
  [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  // Frame 4 (similar to frame 2 but with different variation)
  [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
];

// Animation frames for running left (mirrored version of running right)
const RUN_LEFT_FRAMES = RUN_RIGHT_FRAMES.map(frame => 
  frame.map(row => [...row].reverse())
);

type PlayerSpriteProps = {
  direction: 'left' | 'right';
  isRunning: boolean;
  frame: number;
};

const PlayerSprite: React.FC<PlayerSpriteProps> = ({ direction, isRunning, frame }) => {
  // Get the appropriate frame based on direction and animation state
  const frames = direction === 'right' ? RUN_RIGHT_FRAMES : RUN_LEFT_FRAMES;
  const currentFrame = isRunning ? frames[frame % frames.length] : frames[0];

  return (
    <View style={[styles.container, { transform: [{ scale: SCALE }] }]}>
      {currentFrame.map((row, y) =>
        row.map((pixel, x) => (
          <View
            key={`${x}-${y}`}
            style={[
              styles.pixel,
              {
                backgroundColor: pixel ? COLORS.DARK_BLUE : 'transparent',
                left: x * SPRITE_SIZE,
                top: y * SPRITE_SIZE,
              },
            ]}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SPRITE_SIZE * 8,
    height: SPRITE_SIZE * 8,
    position: 'relative',
  },
  pixel: {
    position: 'absolute',
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
});

export default PlayerSprite;
