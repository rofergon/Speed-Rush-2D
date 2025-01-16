import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GAME_CONTRACTS } from '../providers/XionProvider';
import { toast } from 'react-hot-toast';

interface PartData {
  part_type: string;
  stat1: number;
  stat2: number;
  stat3: number;
  image_uri: string;
}

interface CarMetadata {
  car_image_uri: string;
  parts_data: PartData[];
}

interface ApiResponse {
  carImageURI: string;
  parts: {
    partType: number;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }[];
}

class XionService {
  private readonly API_URL = 'https://speed-rush-2d-backend-production.up.railway.app';

  private getPartType(partType: number): string {
    switch(partType) {
      case 0:
        return "Engine";
      case 1:
        return "Transmission";
      case 2:
        return "Wheels";
      default:
        return "Unknown";
    }
  }

  private async generateCarMetadata(): Promise<CarMetadata> {
    try {
      console.log('Iniciando generación de metadata del carro...');
      
      const requestBody = {
        style: "cartoon",
        engineType: "standard",
        transmissionType: "manual",
        wheelsType: "sport"
      };
      
      console.log('Request body:', requestBody);
      console.log('URL de la API:', `${this.API_URL}/api/cars/generate`);

      const response = await fetch(`${this.API_URL}/api/cars/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Respuesta de la API:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error en la API: ${response.statusText}. Detalles: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Datos recibidos de la API:', data);

      if (!data.carImageURI || !data.parts || !Array.isArray(data.parts)) {
        throw new Error('Formato de respuesta inválido de la API');
      }

      const parts: PartData[] = data.parts.map(part => {
        const mappedPart = {
          part_type: this.getPartType(part.partType),
          stat1: part.stat1,
          stat2: part.stat2,
          stat3: part.stat3,
          image_uri: part.imageURI
        };
        console.log('Parte mapeada:', mappedPart);
        return mappedPart;
      });

      const metadata = {
        car_image_uri: data.carImageURI,
        parts_data: parts
      };
      
      console.log('Metadata final generada:', metadata);
      return metadata;
    } catch (error: any) {
      console.error('Error detallado generando metadata:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error
      });
      throw error;
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
      console.log('Metadata generada exitosamente');
      
      const mintMsg = {
        mint_car: {
          car_image_uri: metadata.car_image_uri,
          parts_data: metadata.parts_data
        }
      };

      console.log('Mensaje de minteo preparado:', JSON.stringify(mintMsg, null, 2));

      // Configuración de la transacción
      const msg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: senderAddress,
          contract: GAME_CONTRACTS.CAR_NFT,
          msg: Buffer.from(JSON.stringify(mintMsg)).toString('base64'),
          funds: [{
            denom: "uxion",
            amount: "100"
          }]
        }
      };

      console.log('Mensaje configurado:', msg);

      // Usar el método signAndBroadcast de XION
      const result = await client.signAndBroadcast(
        senderAddress,
        [msg],
        {
          amount: [{
            denom: "uxion",
            amount: "100"
          }],
          gas: "500000"
        },
        "Mint new car NFT"
      );

      console.log('Resultado del minteo:', result);
      toast.success('¡Carro minteado exitosamente!');
      return result;

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
}

export const xionService = new XionService(); 