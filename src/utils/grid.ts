// src/components/utils/grid.ts
import { Position } from '../types';

/**
 * Snaps a position to the nearest grid point
 */
export const snapToGrid = (position: Position, gridSize: number): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

/**
 * Generates grid line data for rendering
 * Returns an array of line configurations that can be used by Konva
 */
export const renderGrid = (width: number, height: number, cellSize: number = 50, snapEnabled: boolean = false) => {
  const lines = [];
  const opacity = snapEnabled ? 0.3 : 0.15;
  const strokeColor = snapEnabled ? "#2196F3" : "#ffffff";

  // Vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    lines.push({
      key: `v-${x}`,
      points: [x, 0, x, height],
      stroke: strokeColor,
      strokeWidth: 0.5,
      opacity: opacity
    });
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    lines.push({
      key: `h-${y}`,
      points: [0, y, width, y],
      stroke: strokeColor,
      strokeWidth: 0.5,
      opacity: opacity
    });
  }

  return lines;
};