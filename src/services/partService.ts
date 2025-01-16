import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GAME_CONTRACTS } from '../providers/XionProvider';

export interface PartStats {
  speed: number;
  acceleration: number;
  handling: number;
  drift_factor: number;
  turn_factor: number;
  max_speed: number;
}

export interface PartData {
  part_id: number;
  part_type: string;
  stats: PartStats;
  image_uri: string;
  is_equipped: boolean;
  equipped_to_car_id?: number;
}

class PartService {
  async getPartStats(client: SigningCosmWasmClient, partId: number): Promise<PartStats> {
    try {
      const queryMsg = {
        get_part_stats: {
          part_id: partId
        }
      };

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_PART,
        queryMsg
      );

      return result;
    } catch (error) {
      console.error('Error getting part stats:', error);
      throw error;
    }
  }

  async getPartType(client: SigningCosmWasmClient, partId: number): Promise<string> {
    try {
      const queryMsg = {
        get_part_type: {
          part_id: partId
        }
      };

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_PART,
        queryMsg
      );

      return result;
    } catch (error) {
      console.error('Error getting part type:', error);
      throw error;
    }
  }

  async getEquippedCarId(client: SigningCosmWasmClient, partId: number): Promise<number | undefined> {
    try {
      const queryMsg = {
        get_equipped_car: {
          part_id: partId
        }
      };

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_PART,
        queryMsg
      );

      return result.car_id || undefined;
    } catch (error) {
      console.error('Error getting equipped car ID:', error);
      return undefined;
    }
  }

  async getUserParts(client: SigningCosmWasmClient, ownerAddress: string): Promise<PartData[]> {
    try {
      // Obtener las partes equipadas del usuario
      const equippedPartsMsg = {
        get_owner_equipped_parts: {
          owner: ownerAddress
        }
      };

      // Obtener las partes no equipadas del usuario
      const unequippedPartsMsg = {
        get_owner_unequipped_parts: {
          owner: ownerAddress
        }
      };

      const [equippedParts, unequippedParts] = await Promise.all([
        client.queryContractSmart(GAME_CONTRACTS.CAR_PART, equippedPartsMsg),
        client.queryContractSmart(GAME_CONTRACTS.CAR_PART, unequippedPartsMsg)
      ]);

      // Obtener los detalles de cada parte
      const allPartIds = [...equippedParts, ...unequippedParts];
      const partPromises = allPartIds.map(async (partId: number) => {
        const [stats, partType, equippedCarId] = await Promise.all([
          this.getPartStats(client, partId),
          this.getPartType(client, partId),
          this.getEquippedCarId(client, partId)
        ]);

        return {
          part_id: partId,
          part_type: partType,
          stats,
          image_uri: "", // Esto debería venir de los metadatos del NFT
          is_equipped: equippedParts.includes(partId),
          equipped_to_car_id: equippedCarId
        };
      });

      return await Promise.all(partPromises);
    } catch (error) {
      console.error('Error getting user parts:', error);
      throw error;
    }
  }
}

export const partService = new PartService(); 