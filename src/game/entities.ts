import Matter from 'matter-js';

// Extend Matter.js types to include our custom properties
declare module 'matter-js' {
  interface IBodyDefinition {
    speed?: number;
    direction?: number;
    yardLine?: number;
  }
}


// 8-bit style sizing (multiples of 8 for pixel-perfect rendering)
export const PLAYER_WIDTH = 32;  // 4x8

export const PLAYER_HEIGHT = 48;  // 6x8
export const OPPONENT_WIDTH = 24;  // 3x8
export const OPPONENT_HEIGHT = 40;  // 5x8

// Grid size for 8-bit alignment
export const GRID_SIZE = 8;

export interface Point {
  x: number;
  y: number;
}

// Helper function to snap to grid
export const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const createPlayer = (world: Matter.World, pos: Point): Matter.Body => {
  // Snap position to grid for pixel-perfect 8-bit look
  const x = snapToGrid(pos.x);
  const y = snapToGrid(pos.y);
  
  const body = Matter.Bodies.rectangle(
    x,
    y,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    {
      label: 'player',
      friction: 0.05, // Slight friction for better control
      frictionAir: 0.01, // Air resistance for more natural movement
      restitution: 0.2,
      inertia: Infinity, // Prevent rotation
      collisionFilter: {
        group: -1, // Negative value means bodies in this group don't collide
        category: 0x0002,
        mask: 0xFFFFFFFF
      },
      render: {
        fillStyle: '#FF0000', // Player color (red)
        strokeStyle: '#000000',
        lineWidth: 2
      }
    }
  );
  
  Matter.World.add(world, [body]);
  return body;
};

export const createOpponent = (world: Matter.World, pos: Point): Matter.Body => {
  // Snap position to grid for pixel-perfect 8-bit look
  const x = snapToGrid(pos.x);
  const y = snapToGrid(pos.y);
  
  // Random team color (blue or white)
  const teamColors = ['#0000FF', '#FFFFFF'];
  const color = teamColors[Math.floor(Math.random() * teamColors.length)];
  
  const body = Matter.Bodies.rectangle(
    x,
    y,
    OPPONENT_WIDTH,
    OPPONENT_HEIGHT,
    {
      label: 'opponent',
      friction: 0.1,
      restitution: 0.4, // More bouncy than player
      inertia: Infinity, // Prevent rotation
      collisionFilter: {
        group: -1,
        category: 0x0004,
        mask: 0xFFFFFFFF
      },
      render: {
        fillStyle: color,
        strokeStyle: '#000000',
        lineWidth: 2
      },
      // Custom properties for AI (type assertion to include our custom properties)
      speed: 2 + Math.random() * 3 as unknown as undefined, // Random speed
      direction: (Math.random() > 0.5 ? 1 : -1) as unknown as undefined // Random initial direction
    }
  );
  
  Matter.World.add(world, [body]);
  return body;
};

export const createBoundaries = (world: Matter.World, width: number, height: number): Matter.Body[] => {
  const thickness = 40; // Thicker boundaries for better collision detection
  const boundaries = [
    // Bottom boundary (invisible, just for collision)
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, {
      isStatic: true,
      isSensor: true,
      label: 'boundary',
      render: {
        visible: false // Invisible but still collidable
      }
    }),
    // Left boundary
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      isSensor: true,
      label: 'boundary',
      render: {
        fillStyle: '#006400', // Dark green for side boundaries
        strokeStyle: '#000000',
        lineWidth: 2
      }
    }),
    // Right boundary
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      isSensor: true,
      label: 'boundary',
      render: {
        fillStyle: '#006400', // Dark green for side boundaries
        strokeStyle: '#000000',
        lineWidth: 2
      }
    }),
    // Top boundary (invisible, just to prevent objects from going off-screen at the top)
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
      isStatic: true,
      isSensor: true,
      label: 'boundary',
      render: {
        visible: false
      }
    })
  ];
  
  Matter.World.add(world, boundaries);
  return boundaries;
};

export const createFieldLines = (world: Matter.World, width: number, height: number): Matter.Body[] => {
  const fieldLines: Matter.Body[] = [];
  const lineSpacing = 100; // Space between yard lines (10 yards apart)
  const lineCount = Math.ceil(height / lineSpacing) + 2; // Extra lines for smooth scrolling
  const lineWidth = 8; // Thicker lines for 8-bit style
  
  for (let i = 0; i < lineCount; i++) {
    // Main yard line (thicker, white)
    fieldLines.push(
      Matter.Bodies.rectangle(
        width / 2, 
        i * lineSpacing, 
        width - 40, 
        lineWidth, 
        {
          isStatic: true,
          isSensor: true,
          label: 'fieldLine',
          render: {
            fillStyle: '#FFFFFF',
            strokeStyle: '#000000',
            lineWidth: 1
          },
          // Custom property to track yard line number (type assertion)
          yardLine: i * 10 as unknown as undefined // Each line represents 10 yards
        }
      )
    );
    
    // Add small hash marks at 5-yard intervals (thinner, white)
    if (i > 0) {
      fieldLines.push(
        Matter.Bodies.rectangle(
          width / 4, 
          i * lineSpacing - lineSpacing / 2, 
          20, 
          2, 
          {
            isStatic: true,
            isSensor: true,
            label: 'hashMark',
            render: {
              fillStyle: '#FFFFFF',
              strokeStyle: '#000000',
              lineWidth: 1
            }
          }
        ),
        Matter.Bodies.rectangle(
          (width / 4) * 3, 
          i * lineSpacing - lineSpacing / 2, 
          20, 
          2, 
          {
            isStatic: true,
            isSensor: true,
            label: 'hashMark',
            render: {
              fillStyle: '#FFFFFF',
              strokeStyle: '#000000',
              lineWidth: 1
            }
          }
        )
      );
    }
  }
  
  Matter.World.add(world, fieldLines);
  return fieldLines;
};
