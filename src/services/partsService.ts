import { web3Service } from './web3Service';
import { Part } from '../types/parts';
import { ethers } from 'ethers';

class PartsService {
  async getUserParts(address: string): Promise<Part[]> {
    try {
      const carPartContract = await web3Service.getCarPartContract();
      
      // Obtener los IDs de las partes equipadas y no equipadas
      const equippedPartIds = await carPartContract.getOwnerEquippedParts(address);
      const unequippedPartIds = await carPartContract.getOwnerUnequippedParts(address);

      // Procesar partes equipadas
      const equippedPartsPromises = equippedPartIds.map(async (partId: bigint) => {
        const partStats = await carPartContract.getPartStats(partId);
        const equippedToCarId = await carPartContract.getEquippedCar(partId);
        
        return {
          id: partId.toString(),
          partType: Number(partStats.partType),
          stats: this.mapPartStats({
            partType: partStats.partType,
            stat1: partStats.stat1,
            stat2: partStats.stat2,
            stat3: partStats.stat3
          }),
          isEquipped: true,
          equippedToCarId: equippedToCarId.toString(),
          imageURI: partStats.imageURI
        };
      });

      // Procesar partes no equipadas
      const unequippedPartsPromises = unequippedPartIds.map(async (partId: bigint) => {
        const partStats = await carPartContract.getPartStats(partId);
        
        return {
          id: partId.toString(),
          partType: Number(partStats.partType),
          stats: this.mapPartStats({
            partType: partStats.partType,
            stat1: partStats.stat1,
            stat2: partStats.stat2,
            stat3: partStats.stat3
          }),
          isEquipped: false,
          equippedToCarId: null,
          imageURI: partStats.imageURI
        };
      });

      // Esperar a que se resuelvan todas las promesas
      const equippedParts = await Promise.all(equippedPartsPromises);
      const unequippedParts = await Promise.all(unequippedPartsPromises);

      // Combinar y ordenar todas las partes
      const partsArray = [...equippedParts, ...unequippedParts].sort((a, b) => {
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