export interface Part {
  partId: string;
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
}

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