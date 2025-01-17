import { GAME_CONTRACTS } from '../config/contracts';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

interface Part {
  part_id: number;
  part_type: string;
  stats: any;
  slot_index?: number;
  isEquipped: boolean;
  equippedToCarId?: number;
  image_uri: string;
}

class PartsService {
  async getUserParts(client: SigningCosmWasmClient, address: string): Promise<Part[]> {
    try {
      console.log('👤 Fetching user parts:', address);
      console.log('📍 Using parts contract:', GAME_CONTRACTS.CAR_PART);

      // First, get all user parts
      const ownerPartsMsg = {
        get_owner_parts: {
          owner: address
        }
      };

      console.log('📤 Query message to fetch all parts:', ownerPartsMsg);
      const allPartIds = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_PART,
        ownerPartsMsg
      );
      console.log('📥 IDs of all parts:', allPartIds);

      if (!Array.isArray(allPartIds) || allPartIds.length === 0) {
        console.log('❌ No parts found for the user');
        return [];
      }

      // Get details of each part
      const partsPromises = allPartIds.map(async (partId: number) => {
        try {
          console.log('🔄 Processing part ID:', partId);
          
          // Get part stats
          const statsMsg = {
            get_part_stats: {
              part_id: partId
            }
          };
          const stats = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, statsMsg);

          // Check if equipped and get car ID
          const equippedMsg = {
            is_equipped: {
              part_id: partId
            }
          };
          const isEquipped = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, equippedMsg);

          let equippedToCarId;
          if (isEquipped) {
            const carIdMsg = {
              get_equipped_car: {
                part_id: partId
              }
            };
            equippedToCarId = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, carIdMsg);
          }

          const part: Part = {
            part_id: partId,
            part_type: stats.part_type,
            stats: {
              stat1: stats.stat1,
              stat2: stats.stat2,
              stat3: stats.stat3,
              image_uri: stats.image_uri
            },
            isEquipped,
            equippedToCarId: equippedToCarId > 0 ? equippedToCarId : undefined,
            image_uri: stats.image_uri || `https://ipfs.io/ipfs/default_part_${stats.part_type}.png`
          };

          console.log('✅ Part processed:', part);
          return part;
        } catch (error) {
          console.error(`❌ Error fetching part details ${partId}:`, error);
          return null;
        }
      });

      const parts = await Promise.all(partsPromises);
      const filteredParts = parts.filter((part): part is Part => part !== null);
      console.log('📦 All parts processed:', filteredParts);
      return filteredParts;
    } catch (error) {
      console.error('❌ Error fetching user parts:', error);
      throw error;
    }
  }

  async getPartDetails(client: SigningCosmWasmClient, partId: number): Promise<Part | null> {
    try {
      // Obtener stats de la parte
      const statsMsg = {
        get_part_stats: {
          part_id: partId
        }
      };
      const stats = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, statsMsg);

      // Obtener tipo de parte
      const typeMsg = {
        get_part_type: {
          part_id: partId
        }
      };
      const typeResponse = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, typeMsg);

      // Verificar si está equipada
      const equippedMsg = {
        is_equipped: {
          part_id: partId
        }
      };
      const equippedResponse = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, equippedMsg);

      // Si está equipada, obtener el ID del carro
      let equippedToCarId;
      if (equippedResponse.is_equipped) {
        const carIdMsg = {
          get_equipped_car_id: {
            part_id: partId
          }
        };
        const carIdResponse = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, carIdMsg);
        equippedToCarId = carIdResponse.car_id;
      }

      return {
        part_id: partId,
        part_type: typeResponse.part_type,
        stats: stats,
        isEquipped: equippedResponse.is_equipped,
        equippedToCarId,
        image_uri: stats.image_uri || `https://ipfs.io/ipfs/default_part_${typeResponse.part_type}.png`
      };
    } catch (error) {
      console.error(`Error fetching part details ${partId}:`, error);
      return null;
    }
  }
}

export const partsService = new PartsService(); 