import Matter from 'matter-js';

export function setupWorld(width: number, height: number, laneCount: number) {
  const engine = Matter.Engine.create({ enableSleeping: false });
  const world = engine.world;

  // Lane width
  const laneWidth = width / laneCount;

  // Player body (start in center lane)
  const player = Matter.Bodies.rectangle(
    laneWidth * (Math.floor(laneCount / 2) + 0.5),
    height - 100,
    laneWidth * 0.6,
    40,
    { label: 'player', isStatic: false }
  );

  Matter.World.add(world, [player]);

  return {
    engine,
    world,
    player,
    laneWidth,
  };
} 