import { Part } from './parts';

export interface CarStats {
  image_uri: string;
  speed: number;
  acceleration: number;
  handling: number;
  drift_factor: number;
  turn_factor: number;
  max_speed: number;
  condition: number;
}

export interface Car {
  car_id: number;
  car_image_uri: string;
  parts: Part[];
  total_stats: CarStats;
}

export interface CarComposition {
  part_ids: number[];
  car_image_uri: string;
  slot_occupied: boolean[];
} 