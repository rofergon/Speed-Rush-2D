import { Part } from './parts';

export interface Car {
  id: string;
  carImageURI: string;
  displayImageURI?: string;
  combinedStats: {
    speed: number;
    acceleration: number;
    handling: number;
    driftFactor: number;
    turnFactor: number;
    maxSpeed: number;
  };
  parts: Part[];
  price?: number;
  seller?: string;
  condition?: number;
  listedAt?: number;
} 