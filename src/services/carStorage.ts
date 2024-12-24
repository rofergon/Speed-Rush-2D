import { CarMetadata } from './carApi';

export interface StoredCar {
  id: string;
  imageUrl: string;
  metadata: CarMetadata;
  createdAt: string;
  walletAddress: string;
}

const STORAGE_KEY = 'speed_rush_cars';

export const carStorage = {
  getCars(walletAddress: string): StoredCar[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const allCars: StoredCar[] = JSON.parse(stored);
      return allCars.filter(car => car.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    } catch (error) {
      console.error('Error getting cars from storage:', error);
      return [];
    }
  },

  saveCar(walletAddress: string, imageUrl: string, metadata: CarMetadata): StoredCar {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const cars: StoredCar[] = stored ? JSON.parse(stored) : [];
      
      const newCar: StoredCar = {
        id: `${Date.now()}`,
        imageUrl,
        metadata,
        createdAt: new Date().toISOString(),
        walletAddress
      };

      cars.push(newCar);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
      
      return newCar;
    } catch (error) {
      console.error('Error saving car to storage:', error);
      throw new Error('Failed to save car');
    }
  },

  deleteCar(walletAddress: string, carId: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const cars: StoredCar[] = JSON.parse(stored);
      const carIndex = cars.findIndex(
        car => car.id === carId && car.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );

      if (carIndex === -1) return false;

      cars.splice(carIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
      
      return true;
    } catch (error) {
      console.error('Error deleting car from storage:', error);
      return false;
    }
  }
}; 