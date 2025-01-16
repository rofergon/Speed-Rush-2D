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
    console.log('Usando metadata fija para pruebas...');
    
    // Metadata fija para pruebas
    const metadata: CarMetadata = {
      car_image_uri: "https://gateway.lighthouse.storage/ipfs/bafkreiexph4xjmhnqted42xiqlvjxndxr3bej6adkumdmxvnyr667233vi",
      parts_data: [
        {
          part_type: "Engine",
          stat1: 1,
          stat2: 5,
          stat3: 4,
          image_uri: "https://gateway.lighthouse.storage/ipfs/bafybeidk45ji7saei3n5n63ctytgguuslhhgf4kmgyrkepef56cfkyi33u"
        },
        {
          part_type: "Transmission",
          stat1: 1,
          stat2: 4,
          stat3: 4,
          image_uri: "https://gateway.lighthouse.storage/ipfs/bafybeibb4qjha6lelejakxevu4of3jxijngj4mpsouaqngyrljgql5yolq"
        },
        {
          part_type: "Wheels",
          stat1: 9,
          stat2: 1,
          stat3: 4,
          image_uri: "https://gateway.lighthouse.storage/ipfs/bafkreighqtnw5rnbxkzrn2nwxzuf7bhfqtyoqty42nnk67jzrvp2ejmcl4"
        }
      ]
    };
    
    console.log('Metadata fija:', metadata);
    return metadata;
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