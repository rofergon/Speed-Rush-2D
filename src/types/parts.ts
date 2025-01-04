export enum PartType {
  ENGINE = 0,
  TRANSMISSION = 1,
  WHEELS = 2
}

export interface PartStats {
  speed?: number;
  maxSpeed?: number;
  acceleration?: number;
  handling?: number;
  driftFactor?: number;
  turnFactor?: number;
}

export interface Part {
  partId: string;
  partType: PartType;
  stats: PartStats;
  isEquipped: boolean;
  equippedToCarId?: string;
  imageURI: string;
} 