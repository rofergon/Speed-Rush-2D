import { web3Service } from './web3Service';

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
  isEquipped?: boolean;
  equippedToCarId?: string;
}

class PartsService {
  private parts: Part[] = [];

  async getUserParts(address: string): Promise<Part[]> {
    try {
      // Obtener todos los carros del usuario para extraer las partes
      const cars = await web3Service.getUserCars(address);
      const allParts: Part[] = [];
      const seenPartIds = new Set<string>();

      // Extraer partes de cada carro
      cars.forEach(car => {
        car.parts.forEach(part => {
          if (!seenPartIds.has(part.partId)) {
            seenPartIds.add(part.partId);
            allParts.push({
              ...part,
              isEquipped: true,
              equippedToCarId: car.id
            });
          }
        });
      });

      this.parts = allParts;
      return allParts;
    } catch (error) {
      console.error('Error getting user parts:', error);
      throw error;
    }
  }

  async equipPart(partId: string, carId: string): Promise<void> {
    try {
      const part = this.parts.find(p => p.partId === partId);
      if (!part) throw new Error('Parte no encontrada');

      // Si la parte está equipada en otro carro, primero hay que desequiparla
      if (part.isEquipped && part.equippedToCarId) {
        await web3Service.unequipPart(part.equippedToCarId, partId);
      }

      // Equipar la parte en el nuevo carro
      await web3Service.equipPart(carId, partId, part.partType);

      // Actualizar el estado local
      part.isEquipped = true;
      part.equippedToCarId = carId;
    } catch (error) {
      console.error('Error equipping part:', error);
      throw error;
    }
  }

  async unequipPart(partId: string, carId: string): Promise<void> {
    try {
      const part = this.parts.find(p => p.partId === partId);
      if (!part) throw new Error('Parte no encontrada');

      await web3Service.unequipPart(carId, partId);

      // Actualizar el estado local
      part.isEquipped = false;
      part.equippedToCarId = undefined;
    } catch (error) {
      console.error('Error unequipping part:', error);
      throw error;
    }
  }
}

export const partsService = new PartsService(); 