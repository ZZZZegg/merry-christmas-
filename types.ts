import { Color } from "three";

export type AnimationMode = 'TREE' | 'EXPLODE';

export interface ParticleData {
  initialPosition: [number, number, number]; // Explosion/Random state
  targetPosition: [number, number, number];  // Tree state
  scale: number;
  rotationSpeed: [number, number, number];
  color?: Color;
}

export interface InstancedGroupProps {
  mode: AnimationMode;
}

export interface HandCursorPosition {
  x: number;
  y: number;
  isPinching: boolean;
}