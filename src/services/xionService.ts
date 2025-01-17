import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GAME_CONTRACTS } from '../providers/XionProvider';
import { toast } from 'react-hot-toast';
import { PartType, PartData } from '../types/parts';
import axios from 'axios';
import { Car } from "../types/car";

interface CarMetadata {
  car_image_uri: string;
  parts_data: PartData[];
}

interface ApiResponse {
  carImageURI: string;
  parts: {
    partType: string;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }[];
}

class XionService {
  private readonly API_URL = 'https://speed-rush-2d-backend-production.up.railway.app';

  private getPartTypeString(type: number): PartType {
    switch (type) {
      case 0:
        return PartType.Engine;
      case 1:
        return PartType.Transmission;
      case 2:
        return PartType.Wheels;
      default:
        throw new Error(`Tipo de parte desconocido: ${type}`);
    }
  }

  private async generateCarMetadata(): Promise<CarMetadata> {
    try {
      console.log('Solicitando metadata del carro a la API...');
      
      const requestBody = {
        style: "cartoon",
        engineType: "standard",
        transmissionType: "manual",
        wheelsType: "sport"
      };
      
      const response = await axios.post<ApiResponse>(
        `${this.API_URL}/api/cars/generate`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta de la API:', response.data);

      // Definir los tipos de partes en orden
      const partTypes = [PartType.Engine, PartType.Transmission, PartType.Wheels];

      // Convertir la respuesta de la API al formato esperado
      const metadata: CarMetadata = {
        car_image_uri: response.data.carImageURI,
        parts_data: response.data.parts.map((part, index) => ({
          part_type: partTypes[index],
          stat1: part.stat1,
          stat2: part.stat2,
          stat3: part.stat3,
          image_uri: part.imageURI
        }))
      };
      
      // Verificar que todas las partes tengan su tipo
      metadata.parts_data.forEach((part, index) => {
        console.log(`Parte ${index}:`, part);
        if (!part.part_type) {
          console.error(`Parte ${index} no tiene tipo asignado`);
          part.part_type = partTypes[index];
        }
      });
      
      console.log('Metadata del carro generada:', metadata);
      return metadata;
    } catch (error: any) {
      console.error('Error generando metadata del carro:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      throw new Error('Error al generar la metadata del carro: ' + error.message);
    }
  }

  private validateAndFixPartsData(partsData: PartData[]): PartData[] {
    // Tipos de partes en orden
    const partTypes = [PartType.Engine, PartType.Transmission, PartType.Wheels];
    
    const validatedParts = partsData.map((part, index) => {
      const validatedPart = { ...part };
      
      // Asignar el tipo correspondiente si no está presente
      if (!validatedPart.part_type) {
        console.log(`Asignando tipo ${partTypes[index]} a la parte ${index}:`, part);
        validatedPart.part_type = partTypes[index];
      }
      
      return validatedPart;
    });

    // Verificación final
    validatedParts.forEach((part, index) => {
      console.log(`Parte ${index} validada:`, part);
      if (!part.part_type) {
        console.error(`¡Alerta! La parte ${index} aún no tiene tipo después de la validación`);
      }
    });

    return validatedParts;
  }

  async mintCar(
    client: SigningCosmWasmClient,
    senderAddress: string,
    treasuryAddress: string
  ) {
    try {
      console.log('Iniciando proceso de minteo...', {
        senderAddress,
        treasuryAddress,
        contractAddress: GAME_CONTRACTS.CAR_NFT
      });

      const metadata = await this.generateCarMetadata();
      console.log('Metadata generada exitosamente:', metadata);
      
      const validatedPartsData = this.validateAndFixPartsData(metadata.parts_data);
      console.log('Datos de partes validados:', validatedPartsData);
      
      const mintPrice = GAME_CONTRACTS.MINT_PRICE.replace('uxion', '');

      const mintMsg = {
        mint_car: {
          car_image_uri: metadata.car_image_uri,
          parts_data: validatedPartsData
        }
      };

      console.log('Mensaje de minteo preparado:', JSON.stringify(mintMsg, null, 2));
      console.log('Precio de minteo:', GAME_CONTRACTS.MINT_PRICE);

      const funds = [{ amount: mintPrice, denom: "uxion" }];

      const fee = {
        amount: [],
        gas: "1000000",
        granter: treasuryAddress
      };

      console.log('Configuración de fee:', fee);
      console.log('Fondos a enviar:', funds);

      const mintResult = await client.execute(
        senderAddress,
        GAME_CONTRACTS.CAR_NFT,
        mintMsg,
        fee,
        "Mint new car NFT with treasury",
        funds
      );

      console.log('Resultado del minteo:', {
        transactionHash: mintResult.transactionHash,
        gasUsed: mintResult.gasUsed,
        gasWanted: mintResult.gasWanted,
        events: mintResult.events
      });

      toast.success('¡Carro minteado exitosamente!');
      
      // Obtener el ID del carro minteado
      const carId = parseInt(mintResult.events
        .find(e => e.type === 'wasm')
        ?.attributes
        .find(a => a.key === 'car_id')
        ?.value || '0');

      // Consultar los datos completos del carro recién minteado
      const queryMsg = {
        get_full_car_metadata: {
          car_id: carId
        }
      };

      console.log('Consultando metadata del carro minteado:', queryMsg);

      const carMetadata = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      console.log('Metadata del carro obtenida:', carMetadata);

      // Construir el objeto Car con los datos reales
      const car: Car = {
        car_id: carId,
        car_image_uri: metadata.car_image_uri,
        owner: senderAddress,
        parts: carMetadata.parts.map((part: any) => ({
          part_id: part.part_id,
          part_type: part.part_type,
          stats: {
            stat1: part.stats.stat1,
            stat2: part.stats.stat2,
            stat3: part.stats.stat3,
            image_uri: part.stats.image_uri
          },
          isEquipped: true,
          image_uri: part.image_uri
        })),
        total_stats: {
          speed: carMetadata.total_stats.speed,
          max_speed: carMetadata.total_stats.max_speed,
          acceleration: carMetadata.total_stats.acceleration,
          handling: carMetadata.total_stats.handling,
          drift_factor: carMetadata.total_stats.drift_factor,
          turn_factor: carMetadata.total_stats.turn_factor,
          image_uri: metadata.car_image_uri,
          condition: 100
        }
      };

      return car;

    } catch (error: any) {
      console.error('Error detallado en el minteo:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error
      });
      
      toast.error('Error al mintear el carro: ' + error.message);
      throw error;
    }
  }

  async getMintPrice(client: SigningCosmWasmClient): Promise<string> {
    try {
      console.log('Consultando precio de minteo...');
      
      const queryMsg = {
        get_mint_price: {}
      };

      console.log('Query mensaje:', queryMsg);

      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      console.log('Precio de minteo obtenido:', result);
      return result.toString();
    } catch (error: any) {
      console.error('Error obteniendo precio de minteo:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      throw error;
    }
  }

  async getUserCars(
    client: SigningCosmWasmClient,
    ownerAddress: string
  ) {
    try {
      console.log('Obteniendo carros del usuario:', ownerAddress);

      const queryMsg = {
        get_all_car_metadata: {
          owner: ownerAddress
        }
      };

      const response = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      console.log('Respuesta de carros del usuario:', response);
      return response.cars;

    } catch (error: any) {
      console.error('Error al obtener los carros del usuario:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      toast.error('Error al cargar los carros: ' + error.message);
      throw error;
    }
  }

  async unequipPart(
    client: SigningCosmWasmClient,
    senderAddress: string,
    treasuryAddress: string,
    carId: number,
    partId: number
  ) {
    try {
      console.log('Desequipando parte...', {
        carId,
        partId,
        senderAddress,
        treasuryAddress
      });

      const unequipMsg = {
        unequip_part: {
          car_id: carId,
          part_id: partId
        }
      };

      // Configuración de fee solo para el gas
      const fee = {
        amount: [],
        gas: "500000",
        granter: treasuryAddress
      };

      const result = await client.execute(
        senderAddress,
        GAME_CONTRACTS.CAR_NFT,
        unequipMsg,
        fee,
        "Unequip car part"
      );

      console.log('Parte desequipada exitosamente:', result);
      toast.success('¡Parte desequipada exitosamente!');
      return result;

    } catch (error: any) {
      console.error('Error al desequipar la parte:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      toast.error('Error al desequipar la parte: ' + error.message);
      throw error;
    }
  }

  async equipPart(
    client: SigningCosmWasmClient,
    senderAddress: string,
    treasuryAddress: string,
    carId: number,
    partId: number,
    slotIndex: number
  ) {
    try {
      console.log('Equipando parte...', {
        carId,
        partId,
        slotIndex,
        senderAddress,
        treasuryAddress
      });

      const equipMsg = {
        equip_part: {
          car_id: carId,
          part_id: partId,
          slot_index: slotIndex
        }
      };

      // Configuración de fee solo para el gas
      const fee = {
        amount: [],
        gas: "500000",
        granter: treasuryAddress
      };

      const result = await client.execute(
        senderAddress,
        GAME_CONTRACTS.CAR_NFT,
        equipMsg,
        fee,
        "Equip car part"
      );

      console.log('Parte equipada exitosamente:', result);
      toast.success('¡Parte equipada exitosamente!');
      return result;

    } catch (error: any) {
      console.error('Error al equipar la parte:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      toast.error('Error al equipar la parte: ' + error.message);
      throw error;
    }
  }
}

const xionServiceInstance = new XionService();
export { xionServiceInstance as xionService }; 