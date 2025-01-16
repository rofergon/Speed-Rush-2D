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
      console.log('👤 Obteniendo partes del usuario:', address);
      console.log('📍 Usando contrato de partes:', GAME_CONTRACTS.CAR_PART);

      // Primero obtenemos todas las partes del usuario
      const ownerPartsMsg = {
        get_owner_parts: {
          owner: address
        }
      };

      console.log('📤 Query mensaje para obtener todas las partes:', ownerPartsMsg);
      const allPartIds = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_PART,
        ownerPartsMsg
      );
      console.log('📥 IDs de todas las partes:', allPartIds);

      if (!Array.isArray(allPartIds) || allPartIds.length === 0) {
        console.log('❌ No se encontraron partes para el usuario');
        return [];
      }

      // Obtener detalles de cada parte
      const partsPromises = allPartIds.map(async (partId: number) => {
        try {
          console.log('🔄 Procesando parte ID:', partId);
          
          // Obtener stats de la parte
          const statsMsg = {
            get_part_stats: {
              part_id: partId
            }
          };
          const stats = await client.queryContractSmart(GAME_CONTRACTS.CAR_PART, statsMsg);

          // Verificar si está equipada y obtener el ID del carro
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

          console.log('✅ Parte procesada:', part);
          return part;
        } catch (error) {
          console.error(`❌ Error obteniendo detalles de la parte ${partId}:`, error);
          return null;
        }
      });

      const parts = await Promise.all(partsPromises);
      const filteredParts = parts.filter((part): part is Part => part !== null);
      console.log('📦 Todas las partes procesadas:', filteredParts);
      return filteredParts;
    } catch (error) {
      console.error('❌ Error al obtener las partes del usuario:', error);
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
      console.error(`Error obteniendo detalles de la parte ${partId}:`, error);
      return null;
    }
  }
}

export const partsService = new PartsService(); 