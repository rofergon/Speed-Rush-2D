export enum PartType {
  Engine = "Engine",
  Transmission = "Transmission",
  Wheels = "Wheels"
}

export interface PartData {
  part_type: PartType;
  stat1: number;
  stat2: number;
  stat3: number;
  image_uri: string;
}

export interface PartStats {
  speed: number;
  acceleration: number;
  handling: number;
  drift_factor: number;
  turn_factor: number;
  max_speed: number;
}

export interface Part {
  part_id: number;
  part_type: string;
  stats: {
    stat1: number;
    stat2: number;
    stat3: number;
    image_uri: string;
  };
  slot_index?: number;
  isEquipped: boolean;
  equippedToCarId?: number;
  image_uri: string;
} 