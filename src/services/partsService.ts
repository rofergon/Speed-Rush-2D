import { web3Service } from './web3Service';
import { Part } from '../types/parts';

class PartsService {
  async getUserParts(address: string): Promise<Part[]> {
    try {
      const cars = await web3Service.getUserCars(address);
      const allParts: Part[] = [];

      for (const car of cars) {
        if (car.parts) {
          allParts.push(...car.parts.map((part: any) => ({
            partId: part.partId,
            partType: part.partType,
            stats: part.stats,
            isEquipped: part.isEquipped || false,
            equippedToCarId: part.equippedToCarId,
            imageURI: part.imageURI
          })));
        }
      }

      return allParts;
    } catch (error) {
      console.error('Error getting user parts:', error);
      throw error;
    }
  }
}

export const partsService = new PartsService(); 