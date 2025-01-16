import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GAME_CONTRACTS } from '../providers/XionProvider';

export interface CarComposition {
  part_ids: number[];
  car_image_uri: string;
  slot_occupied: boolean[];
}

export interface PartMetadata {
  part_id: number;
  part_type: string;
  stats: {
    speed: number;
    acceleration: number;
    handling: number;
    drift_factor: number;
    turn_factor: number;
    max_speed: number;
  };
  slot_index: number;
}

export interface FullCarMetadata {
  car_id: number;
  car_image_uri: string;
  parts: PartMetadata[];
  total_stats: {
    image_uri: string;
    speed: number;
    acceleration: number;
    handling: number;
    drift_factor: number;
    turn_factor: number;
    max_speed: number;
    condition: number;
  };
}

class CarService {
  async getLastTokenId(client: SigningCosmWasmClient): Promise<number> {
    try {
      const queryMsg = {
        get_last_token_id: {}
      };

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      return Number(result);
    } catch (error) {
      console.error('Error getting last token ID:', error);
      throw error;
    }
  }

  async getUserCars(client: SigningCosmWasmClient, ownerAddress: string): Promise<FullCarMetadata[]> {
    try {
      // Primero obtenemos los IDs de los carros del usuario
      const queryMsg = {
        get_owner_cars: {
          owner: ownerAddress
        }
      };

      const ownerCarsResponse = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      // Luego obtenemos los metadatos completos de cada carro
      const carPromises = ownerCarsResponse.car_ids.map(async (carId: number) => {
        const carQueryMsg = {
          get_full_car_metadata: {
            car_id: carId
          }
        };

        return await client.queryContractSmart(
          GAME_CONTRACTS.CAR_NFT,
          carQueryMsg
        );
      });

      const cars = await Promise.all(carPromises);
      return cars;
    } catch (error) {
      console.error('Error getting user cars:', error);
      throw error;
    }
  }

  async getCarMetadata(client: SigningCosmWasmClient, carId: number): Promise<FullCarMetadata> {
    try {
      const queryMsg = {
        get_full_car_metadata: {
          car_id: carId
        }
      };

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      return result;
    } catch (error) {
      console.error('Error getting car metadata:', error);
      throw error;
    }
  }
}

export const carService = new CarService(); 