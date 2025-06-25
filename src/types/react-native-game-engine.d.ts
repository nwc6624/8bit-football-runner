import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

declare module 'react-native-game-engine' {
  export interface GameEngineUpdateEventOptionType {
    /** The amount of time (in ms) that has elapsed since the last update. */
    touches: any[];
    time: {
      current: number;
      delta: number;
      previousDelta: number | null;
      previousDeltaTimestamp: number | null;
      startTime: number;
    };
    dispatch: (event: any) => void;
    events: any[];
  };

  export type GameEngineSystem = (
    entities: any, 
    update: GameEngineUpdateEventOptionType
  ) => any;

  export interface GameEngineProperties {
    systems: GameEngineSystem[];
    entities: any;
    renderer?: (entities: any, window: any) => React.ReactNode;
    style?: StyleProp<ViewStyle>;
    running?: boolean;
    onEvent?: (event: any) => void;
    children?: React.ReactNode;
  }

  export interface GameEngineRef {
    dispatch: (event: { type: string; [key: string]: any }) => void;
    start: () => void;
    stop: () => void;
    swap: (newEntities: any) => void;
    startGameLoop: () => void;
    stopGameLoop: () => void;
  }

  const GameEngine: React.ForwardRefExoticComponent<
    GameEngineProperties & React.RefAttributes<GameEngineRef>
  >;

  export default GameEngine;
}

declare module 'react-native-game-engine/GameEngine' {
  import { GameEngine } from 'react-native-game-engine';
  export default GameEngine;
}

declare module 'react-native-game-engine/DefaultRenderer' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface DefaultRendererProps {
    entities: any;
    style?: ViewStyle;
    children?: React.ReactNode;
  }

  export default class DefaultRenderer extends Component<DefaultRendererProps> {}
}
