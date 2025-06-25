import { Body, Engine, World } from 'matter-js';

export interface GameEntities {
  physics: {
    engine: Engine;
    world: World;
  };
  player: Body;
  opponents: Body[];
  boundaries: Body[];
  fieldLines: Body[];
  lastSpawn: number;
  input: {
    touches: Array<{ id: number; x: number; y: number }>;
  };
  score: number;
  isGameOver: boolean;
}

export interface GameState {
  lastSpawn: number;
  score: number;
  isGameOver: boolean;
  input: {
    touches: Array<{ id: number; x: number; y: number }>;
  };
  opponents: Body[];
}
