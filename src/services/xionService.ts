import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GAME_CONTRACTS } from '../providers/XionProvider';
import { toast } from 'react-hot-toast';
import { PartType, PartData } from '../types/parts';
import axios from 'axios';

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

      // Convertir la respuesta de la API al formato esperado
      const metadata: CarMetadata = {
        car_image_uri: response.data.carImageURI,
        parts_data: response.data.parts.map(part => ({
          part_type: this.getPartTypeString(Number(part.partType)),
          stat1: part.stat1,
          stat2: part.stat2,
          stat3: part.stat3,
          image_uri: part.imageURI
        }))
      };
      
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
      
      // Extraer el monto del MINT_PRICE
      const mintPrice = GAME_CONTRACTS.MINT_PRICE.replace('uxion', '');

      // Crear el mensaje para mintear el carro
      const mintMsg = {
        mint_car: {
          car_image_uri: metadata.car_image_uri,
          parts_data: metadata.parts_data
        }
      };

      console.log('Mensaje de minteo preparado:', JSON.stringify(mintMsg, null, 2));
      console.log('Precio de minteo:', GAME_CONTRACTS.MINT_PRICE);
      
      // Configuración de fee solo para el gas
      const fee = {
        amount: [], // Array vacío ya que el granter paga el gas
        gas: "1000000",
        granter: treasuryAddress
      };

      // Los fondos se envían por separado
      const funds = [{ amount: mintPrice, denom: "uxion" }];

      console.log('Configuración de fee:', fee);
      console.log('Fondos a enviar:', funds);

      // Ejecutamos el minteo con el pago incluido en funds
      const mintResult = await client.execute(
        senderAddress,
        GAME_CONTRACTS.CAR_NFT,
        mintMsg,
        fee,
        "Mint new car NFT with treasury",
        funds // Aquí enviamos los fondos
      );

      console.log('Resultado del minteo:', {
        transactionHash: mintResult.transactionHash,
        gasUsed: mintResult.gasUsed,
        gasWanted: mintResult.gasWanted,
        events: mintResult.events
      });

      toast.success('¡Carro minteado exitosamente!');
      return mintResult;

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
}

export const xionService = new XionService(); 