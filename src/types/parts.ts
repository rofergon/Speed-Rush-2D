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
  id: string;
  partType: number;
  imageURI: string;
  stats: {
    speed?: number;
    maxSpeed?: number;
    acceleration?: number;
    handling?: number;
    driftFactor?: number;
    turnFactor?: number;
  };
  isEquipped: boolean;
  equippedToCarId?: string;
  slotIndex?: number;
} 