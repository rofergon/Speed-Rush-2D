import { ethers } from 'ethers';

const CarNFTAbi = {
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "carImageURI",
          type: "string"
        },
        {
          components: [
            {
              internalType: "enum CarPart.PartType",
              name: "partType",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat1",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat2",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat3",
              type: "uint8"
            },
            {
              internalType: "string",
              name: "imageURI",
              type: "string"
            }
          ],
          internalType: "struct CarNFT.PartData[]",
          name: "partsData",
          type: "tuple[]"
        }
      ],
      name: "mintCar",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "getCarsByOwner",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "carId",
          type: "uint256"
        }
      ],
      name: "getFullCarMetadata",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "carId",
              type: "uint256"
            },
            {
              internalType: "address",
              name: "owner",
              type: "address"
            },
            {
              internalType: "string",
              name: "carImageURI",
              type: "string"
            },
            {
              internalType: "uint8",
              name: "condition",
              type: "uint8"
            },
            {
              components: [
                {
                  internalType: "uint8",
                  name: "speed",
                  type: "uint8"
                },
                {
                  internalType: "uint8",
                  name: "acceleration",
                  type: "uint8"
                },
                {
                  internalType: "uint8",
                  name: "handling",
                  type: "uint8"
                },
                {
                  internalType: "uint8",
                  name: "driftFactor",
                  type: "uint8"
                },
                {
                  internalType: "uint8",
                  name: "turnFactor",
                  type: "uint8"
                },
                {
                  internalType: "uint8",
                  name: "maxSpeed",
                  type: "uint8"
                }
              ],
              internalType: "struct CarNFT.CarStats",
              name: "combinedStats",
              type: "tuple"
            }
          ],
          internalType: "struct CarNFT.FullCarMetadata",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "carId",
          type: "uint256"
        }
      ],
      name: "getCarComposition",
      outputs: [
        {
          internalType: "uint256[]",
          name: "partIds",
          type: "uint256[]"
        },
        {
          internalType: "string",
          name: "carImageURI",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ]
};

const CarPartAbi = {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "partId",
          type: "uint256"
        }
      ],
      name: "getPartStats",
      outputs: [
        {
          components: [
            {
              internalType: "enum CarPart.PartType",
              name: "partType",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat1",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat2",
              type: "uint8"
            },
            {
              internalType: "uint8",
              name: "stat3",
              type: "uint8"
            },
            {
              internalType: "string",
              name: "imageURI",
              type: "string"
            }
          ],
          internalType: "struct CarPart.PartStats",
          name: "",
          type: "tuple"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ]
};

export interface CarGenerationData {
  carImageURI: string;
  parts: {
    partType: number;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }[];
}

export async function mintCar(
  address: string,
  carData: CarGenerationData,
  mintPrice: string
): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    // Convertir el precio de ETH a Wei
    const mintPriceWei = ethers.parseEther(mintPrice);

    // Preparar los datos de las partes para el contrato
    const partsData = carData.parts.map(part => ({
      partType: part.partType,
      stat1: part.stat1,
      stat2: part.stat2,
      stat3: part.stat3,
      imageURI: part.imageURI
    }));

    // Llamar a la función mintCar del contrato
    const tx = await carNFTContract.mintCar(
      carData.carImageURI,
      partsData,
      { value: mintPriceWei }
    );

    console.log('Mint transaction:', tx);
    return tx.hash;
  } catch (error) {
    console.error('Error minting car:', error);
    throw error;
  }
}

export async function getUserCars(address: string): Promise<any[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    // Obtener los IDs de los carros
    const carIds = await carNFTContract.getCarsByOwner(address);
    console.log('Car IDs for address:', address, carIds);

    // Convertir el resultado a un array y asegurar que son BigInt
    const carIdsArray = Array.from(carIds, (id: any) => BigInt(id.toString()));
    console.log('Converted car IDs:', carIdsArray);

    // Cargar los carros uno por uno para evitar que un error en uno afecte a los demás
    const cars = [];
    for (const carId of carIdsArray) {
      try {
        // Intentar obtener los metadatos del carro
        const metadata = await carNFTContract.getFullCarMetadata(carId);
        const parts = await getCarParts(carId.toString());
        
        // Mapear los datos del carro
        const mappedCar = {
          id: carId.toString(),
          carImageURI: metadata.carImageURI,
          owner: metadata.owner,
          condition: Number(metadata.condition),
          combinedStats: {
            speed: Number(metadata.combinedStats.speed) || 0,
            acceleration: Number(metadata.combinedStats.acceleration) || 0,
            handling: Number(metadata.combinedStats.handling) || 0,
            driftFactor: Number(metadata.combinedStats.driftFactor) || 0,
            turnFactor: Number(metadata.combinedStats.turnFactor) || 0,
            maxSpeed: Number(metadata.combinedStats.maxSpeed) || 0
          },
          parts: parts
        };

        console.log('Mapped car data:', mappedCar);
        cars.push(mappedCar);
      } catch (error) {
        console.error(`Error loading car ${carId}:`, error);
        // Continuamos con el siguiente carro si hay un error
        continue;
      }
    }

    console.log('Cars loaded:', cars);
    return cars;
  } catch (error) {
    console.error('Error getting user cars:', error);
    throw error;
  }
}

export async function getCarParts(carId: string): Promise<any[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Obtener las referencias a los contratos
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );
    
    const carPartContract = new ethers.Contract(
      import.meta.env.VITE_CAR_PART_ADDRESS,
      CarPartAbi.abi,
      signer
    );

    // Obtener la composición del carro (IDs de las partes)
    const { partIds } = await carNFTContract.getCarComposition(carId);
    console.log('Part IDs for car:', carId, partIds);

    // Obtener los detalles de cada parte
    const partPromises = partIds.map(async (partId: bigint) => {
      const stats = await carPartContract.getPartStats(partId);
      
      // Mapear los stats según el tipo de parte
      const mappedStats = {
        partId: partId.toString(),
        partType: Number(stats.partType),
        imageURI: stats.imageURI,
        stats: {}
      };

      // Asignar los stats según el tipo de parte
      switch(Number(stats.partType)) {
        case 0: // ENGINE
          mappedStats.stats = {
            speed: Number(stats.stat1),
            maxSpeed: Number(stats.stat2),
            acceleration: Number(stats.stat3)
          };
          break;
        case 1: // TRANSMISSION
          mappedStats.stats = {
            acceleration: Number(stats.stat1),
            speed: Number(stats.stat2),
            handling: Number(stats.stat3)
          };
          break;
        case 2: // WHEELS
          mappedStats.stats = {
            handling: Number(stats.stat1),
            driftFactor: Number(stats.stat2),
            turnFactor: Number(stats.stat3)
          };
          break;
      }

      return mappedStats;
    });

    const parts = await Promise.all(partPromises);
    console.log('Parts loaded:', parts);
    return parts;
  } catch (error) {
    console.error('Error getting car parts:', error);
    throw error;
  }
}

export const web3Service = {
  mintCar,
  getUserCars,
  getCarParts,
  mintCarNFT: async (address: string, imageUrl: string, metadata: any): Promise<string> => {
    try {
      const mintPrice = '0.01'; // ETH
      return await web3Service.mintCar(
        address,
        {
          carImageURI: imageUrl,
          parts: [
            {
              stat1: metadata.traits.speed,
              stat2: metadata.traits.max_speed,
              stat3: metadata.traits.acceleration,
              imageURI: imageUrl,
              partType: 0 // Motor
            },
            {
              stat1: metadata.traits.handling,
              stat2: metadata.traits.drift_factor,
              stat3: metadata.traits.turn_factor,
              imageURI: imageUrl,
              partType: 1 // Transmisión
            },
            {
              stat1: metadata.traits.handling,
              stat2: metadata.traits.drift_factor,
              stat3: metadata.traits.turn_factor,
              imageURI: imageUrl,
              partType: 2 // Ruedas
            }
          ]
        },
        mintPrice
      );
    } catch (error) {
      console.error('Error in mintCarNFT:', error);
      throw error;
    }
  }
}; 