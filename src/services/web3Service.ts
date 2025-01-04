import { ethers } from 'ethers';

const CarNFTAbi = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
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
        },
        {
          internalType: "bool[]",
          name: "slotOccupied",
          type: "bool[]"
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
      name: "getCompactCarStats",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "imageURI",
              type: "string"
            },
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
            },
            {
              internalType: "uint8",
              name: "condition",
              type: "uint8"
            }
          ],
          internalType: "struct CarNFT.CompactCarStats",
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
        },
        {
          internalType: "uint256",
          name: "partId",
          type: "uint256"
        }
      ],
      name: "unequipPart",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "carId",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "partId",
          type: "uint256"
        },
        {
          internalType: "uint8",
          name: "slotIndex",
          type: "uint8"
        }
      ],
      name: "equipPart",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getLastTokenId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_newPrice",
          type: "uint256"
        }
      ],
      name: "setMintPrice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "mintPrice",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
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
    console.log('Iniciando mintCar con precio:', mintPrice);
    
    // Usar el provider configurado para Lens
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log('Red conectada:', {
      chainId: network.chainId,
      name: network.name
    });
    
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer obtenido:', signerAddress);

    // Verificar balance
    const balance = await provider.getBalance(signerAddress);
    console.log('Balance actual:', ethers.formatUnits(balance, 18), 'GRASS');

    if (balance < BigInt(mintPrice)) {
      throw new Error('insufficient funds for minting');
    }

    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    console.log('Contrato inicializado:', import.meta.env.VITE_CAR_NFT_ADDRESS);

    const partsData = carData.parts.map(part => ({
      partType: typeof part.partType === 'string' ? 
        part.partType === "ENGINE" ? 0 :
        part.partType === "TRANSMISSION" ? 1 :
        part.partType === "WHEELS" ? 2 : 0
      : Number(part.partType),
      stat1: Number(part.stat1),
      stat2: Number(part.stat2),
      stat3: Number(part.stat3),
      imageURI: part.imageURI
    }));

    console.log('PartsData preparado:', partsData);
    console.log('CarImageURI:', carData.carImageURI);

    // Estimar el gas necesario
    const gasEstimate = await carNFTContract.mintCar.estimateGas(
      carData.carImageURI,
      partsData,
      { value: mintPrice }
    );

    console.log('Gas estimado:', gasEstimate.toString());

    // Agregar un 20% extra al gas estimado para seguridad
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

    const tx = await carNFTContract.mintCar(
      carData.carImageURI,
      partsData,
      { 
        value: mintPrice,
        gasLimit
      }
    );

    console.log('Transacción enviada:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error en mintCar:', error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}

// Agregar esta función de ayuda para calcular stats
function calculateCombinedStats(parts: any[]) {
  let totalSpeed = 0;
  let totalAcceleration = 0;
  let totalHandling = 0;
  let totalDriftFactor = 0;
  let totalTurnFactor = 0;
  let totalMaxSpeed = 0;

  let speedContributors = 0;
  let accelerationContributors = 0;
  let handlingContributors = 0;
  let driftContributors = 0;
  let turnContributors = 0;
  let maxSpeedContributors = 0;

  parts.forEach(part => {
    if (!part) return;
    
    const stats = part.stats;
    if (stats.speed) {
      totalSpeed += stats.speed;
      speedContributors++;
    }
    if (stats.acceleration) {
      totalAcceleration += stats.acceleration;
      accelerationContributors++;
    }
    if (stats.handling) {
      totalHandling += stats.handling;
      handlingContributors++;
    }
    if (stats.driftFactor) {
      totalDriftFactor += stats.driftFactor;
      driftContributors++;
    }
    if (stats.turnFactor) {
      totalTurnFactor += stats.turnFactor;
      turnContributors++;
    }
    if (stats.maxSpeed) {
      totalMaxSpeed += stats.maxSpeed;
      maxSpeedContributors++;
    }
  });

  // Calcular promedios, evitando división por cero
  return {
    speed: speedContributors > 0 ? Math.floor(totalSpeed / speedContributors) : 0,
    acceleration: accelerationContributors > 0 ? Math.floor(totalAcceleration / accelerationContributors) : 0,
    handling: handlingContributors > 0 ? Math.floor(totalHandling / handlingContributors) : 0,
    driftFactor: driftContributors > 0 ? Math.floor(totalDriftFactor / driftContributors) : 0,
    turnFactor: turnContributors > 0 ? Math.floor(totalTurnFactor / turnContributors) : 0,
    maxSpeed: maxSpeedContributors > 0 ? Math.floor(totalMaxSpeed / maxSpeedContributors) : 0
  };
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

    console.log('Obteniendo carros para la dirección:', address);
    console.log('Usando contrato CarNFT en:', import.meta.env.VITE_CAR_NFT_ADDRESS);

    // Obtener el balance de NFTs del usuario
    const balance = await carNFTContract.balanceOf(address);
    console.log('Balance de NFTs:', balance.toString());

    if (balance === 0n) {
      console.log('El usuario no tiene carros');
      return [];
    }

    // Obtener el último ID de token
    const lastTokenId = await carNFTContract.getLastTokenId();
    console.log('Último ID de token:', lastTokenId.toString());

    // Buscar todos los tokens del usuario
    const carIds = [];
    for (let i = 1n; i <= lastTokenId; i++) {
      try {
        const owner = await carNFTContract.ownerOf(i);
        if (owner.toLowerCase() === address.toLowerCase()) {
          carIds.push(i);
        }
      } catch (error) {
        // Si el token no existe o fue quemado, continuamos con el siguiente
        continue;
      }
    }

    console.log('IDs de carros encontrados:', carIds);

    if (carIds.length === 0) {
      console.log('No se encontraron carros para esta dirección');
      return [];
    }

    const carPromises = carIds.map(async (carId: bigint) => {
      try {
        console.log('Obteniendo metadata para el carro:', carId.toString());
        
        // Obtener la composición del carro (partes)
        const [partIds, carImageURI, slotOccupied] = await carNFTContract.getCarComposition(carId);
        console.log('Composición del carro:', { partIds, carImageURI, slotOccupied });

        // Inicializar el contrato de partes
        const carPartContract = new ethers.Contract(
          import.meta.env.VITE_CAR_PART_ADDRESS,
          CarPartAbi.abi,
          signer
        );

        // Obtener los detalles de cada parte
        const parts = await Promise.all(partIds.map(async (partId: bigint, index: number) => {
          if (!slotOccupied[index]) {
            return null;
          }
          
          try {
            const partStats = await carPartContract.getPartStats(partId);
            return {
              partId: partId.toString(),
              partType: Number(partStats.partType),
              imageURI: partStats.imageURI,
              stats: {
                ...(Number(partStats.partType) === 0 ? {
                  speed: Number(partStats.stat1),
                  maxSpeed: Number(partStats.stat2),
                  acceleration: Number(partStats.stat3)
                } : Number(partStats.partType) === 1 ? {
                  acceleration: Number(partStats.stat1),
                  speed: Number(partStats.stat2),
                  handling: Number(partStats.stat3)
                } : {
                  handling: Number(partStats.stat1),
                  driftFactor: Number(partStats.stat2),
                  turnFactor: Number(partStats.stat3)
                })
              }
            };
          } catch (error) {
            console.error('Error al obtener stats de la parte:', partId.toString(), error);
            return null;
          }
        }));

        // Filtrar las partes nulas (slots no ocupados o con error)
        const validParts = parts.filter(part => part !== null);

        // Intentar obtener la metadata completa, si falla, calcular stats manualmente
        let metadata;
        try {
          metadata = await carNFTContract.getFullCarMetadata(carId);
        } catch (error) {
          console.log('Error al obtener metadata completa, calculando stats manualmente');
          const calculatedStats = calculateCombinedStats(validParts);
          metadata = {
            carId,
            owner: address,
            carImageURI,
            condition: 100,
            combinedStats: calculatedStats
          };
        }

        return {
          id: carId.toString(),
          carImageURI: metadata.carImageURI,
          owner: metadata.owner,
          condition: Number(metadata.condition),
          combinedStats: {
            speed: Number(metadata.combinedStats.speed),
            acceleration: Number(metadata.combinedStats.acceleration),
            handling: Number(metadata.combinedStats.handling),
            driftFactor: Number(metadata.combinedStats.driftFactor),
            turnFactor: Number(metadata.combinedStats.turnFactor),
            maxSpeed: Number(metadata.combinedStats.maxSpeed)
          },
          parts: validParts
        };
      } catch (error) {
        console.error('Error al obtener detalles del carro:', carId.toString(), error);
        return null;
      }
    });

    const cars = await Promise.all(carPromises);
    const validCars = cars.filter(car => car !== null);
    console.log('Carros procesados:', validCars);
    return validCars;
  } catch (error) {
    console.error('Error en getUserCars:', error);
    throw error;
  }
}

export async function getCarParts(carId: string): Promise<any[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
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

    console.log('Obteniendo partes para el carro:', carId);

    // Obtener la composición del carro (IDs de las partes)
    const composition = await carNFTContract.getCarComposition(carId);
    console.log('Composición del carro:', composition);

    // Obtener los detalles de cada parte
    const parts = await Promise.all(composition.partIds.map(async (partId: bigint) => {
      console.log('Obteniendo stats para la parte:', partId.toString());
      const stats = await carPartContract.getPartStats(partId);
      
      const mappedStats = {
        partId: partId.toString(),
        partType: Number(stats.partType),
        imageURI: stats.imageURI,
        stats: {}
      };

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
    }));

    console.log('Partes procesadas:', parts);
    return parts;
  } catch (error) {
    console.error('Error en getCarParts:', error);
    throw error;
  }
}

export async function equipPart(carId: string, partId: string, slotIndex: number): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    const tx = await carNFTContract.equipPart(carId, partId, slotIndex);
    return tx.hash;
  } catch (error) {
    throw error;
  }
}

export async function unequipPart(carId: string, partId: string): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    const tx = await carNFTContract.unequipPart(carId, partId);
    return tx.hash;
  } catch (error) {
    throw error;
  }
}

export async function setMintPrice(newPrice: string): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    console.log('Cambiando precio de minteo a:', newPrice);
    
    // Convertir el precio a wei
    const priceInWei = ethers.parseEther(newPrice);
    
    const tx = await carNFTContract.setMintPrice(priceInWei);
    console.log('Transacción enviada:', tx.hash);
    
    await tx.wait();
    console.log('Precio actualizado exitosamente');
    
    return tx.hash;
  } catch (error) {
    console.error('Error al cambiar el precio:', error);
    throw error;
  }
}

export async function getMintPrice(): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const carNFTContract = new ethers.Contract(
      import.meta.env.VITE_CAR_NFT_ADDRESS,
      CarNFTAbi.abi,
      signer
    );

    const price = await carNFTContract.mintPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error('Error al obtener el precio de minteo:', error);
    throw error;
  }
}

export const web3Service = {
  mintCar,
  getUserCars,
  getCarParts,
  equipPart,
  unequipPart,
  setMintPrice,
  getMintPrice
}; 