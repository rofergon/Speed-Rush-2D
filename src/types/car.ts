import { Part } from './parts';

export interface CarStats {
  speed: number;
  acceleration: number;
  handling: number;
  driftFactor: number;
  turnFactor: number;
  maxSpeed: number;
}

export interface Car {
  id: string;
  carImageURI: string;
  combinedStats: CarStats;
  parts: Part[];
  price: number;
  seller?: string;
  condition: number;
  listedAt?: number;
} 