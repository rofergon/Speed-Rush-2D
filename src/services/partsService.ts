import { web3Service } from './web3Service';
import { Part } from '../types/parts';
import { ethers } from 'ethers';

class PartsService {
  async getUserParts(address: string): Promise<Part[]> {
    try {
      const allParts = new Map<string, Part>();
      const carPartContract = await web3Service.getCarPartContract();
      
      // Get user's cars to verify equipped parts
      const cars = await web3Service.getUserCars(address);
      
      // First collect all parts equipped in cars
      for (const car of cars) {
        if (car.parts) {
          car.parts.forEach((part: any) => {
            allParts.set(part.id, {
              id: part.id,
              partType: part.partType,
              stats: part.stats,
              isEquipped: true,
              equippedToCarId: car.id,
              imageURI: part.imageURI
            });
          });
        }
      }

      // Search for unequipped parts by directly verifying ownership
      const maxPartId = 20; // Adjust as needed
      for (let i = 0; i < maxPartId; i++) {
        try {
          // If we already have this part from cars, skip it
          if (allParts.has(i.toString())) {
            continue;
          }

          // Verify if the part exists and if the user owns it
          const exists = await carPartContract.exists(i);
          if (!exists) {
            continue;
          }

          const owner = await carPartContract.ownerOf(i);
          if (owner.toLowerCase() !== address.toLowerCase()) {
            continue;
          }

          const partStats = await carPartContract.getPartStats(i);
          const isEquipped = await carPartContract.isEquipped(i);
          const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(i) : null;

          allParts.set(i.toString(), {
            id: i.toString(),
            partType: Number(partStats.partType),
            stats: this.mapPartStats(partStats),
            isEquipped,
            equippedToCarId: equippedToCarId?.toString() || null,
            imageURI: partStats.imageURI
          });
        } catch (error) {
          // If there's an error checking a part, continue with the next one
          continue;
        }
      }

      // Convert Map to array and sort
      const partsArray = Array.from(allParts.values()).sort((a, b) => {
        if (a.partType !== b.partType) {
          return a.partType - b.partType;
        }
        return Number(a.id) - Number(b.id);
      });

      return partsArray;
    } catch (error) {
      console.error('Error getting user parts:', error);
      throw error;
    }
  }

  private mapPartStats(stats: any) {
    switch(Number(stats.partType)) {
      case 0: // ENGINE
        return {
          speed: Number(stats.stat1),
          maxSpeed: Number(stats.stat2),
          acceleration: Number(stats.stat3)
        };
      case 1: // TRANSMISSION
        return {
          acceleration: Number(stats.stat1),
          speed: Number(stats.stat2),
          handling: Number(stats.stat3)
        };
      case 2: // WHEELS
        return {
          handling: Number(stats.stat1),
          driftFactor: Number(stats.stat2),
          turnFactor: Number(stats.stat3)
        };
      default:
        return {};
    }
  }

  async verifyPartExists(partId: string): Promise<boolean> {
    try {
      const carPartContract = await web3Service.getCarPartContract();
      return await carPartContract.exists(partId);
    } catch (error) {
      console.error('Error verifying part existence:', error);
      return false;
    }
  }

  async getPartDetails(partId: string): Promise<Part | null> {
    try {
      const carPartContract = await web3Service.getCarPartContract();
      const partStats = await carPartContract.getPartStats(partId);
      const isEquipped = await carPartContract.isEquipped(partId);
      const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(partId) : null;

      return {
        id: partId,
        partType: Number(partStats.partType),
        stats: this.mapPartStats(partStats),
        isEquipped,
        equippedToCarId: equippedToCarId?.toString() || null,
        imageURI: partStats.imageURI
      };
    } catch (error) {
      console.error('Error getting part details:', error);
      return null;
    }
  }
}

export const partsService = new PartsService(); 