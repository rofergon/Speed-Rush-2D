import { ethers } from 'ethers';
import { Part } from '../types/parts';

export interface CarGenerationData {
  carImageURI: string;
  parts: PartData[];
}

export interface PartData {
  partType: number;
  stat1: number;
  stat2: number;
  stat3: number;
  imageURI: string;
}

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private carNFTContract: ethers.Contract | null = null;
  private carPartContract: ethers.Contract | null = null;

  async getProvider() {
    if (!this.provider) {
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
    return this.provider;
  }

  async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  }

  async getAddress() {
    const provider = await this.getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }

  async getBalance(address: string): Promise<bigint> {
    const provider = await this.getProvider();
    return await provider.getBalance(address);
  }

  async getMintPrice(): Promise<bigint> {
    const contract = await this.getCarNFTContract();
    return await contract.mintPrice();
  }

  async mintCar(address: string, carData: CarGenerationData, value: string): Promise<void> {
    try {
      const contract = await this.getCarNFTContract();
      const tx = await contract.mintCar(
        carData.carImageURI,
        carData.parts.map(part => ({
          partType: part.partType,
          stat1: part.stat1,
          stat2: part.stat2,
          stat3: part.stat3,
          imageURI: part.imageURI
        })),
        { value }
      );
      await tx.wait();
    } catch (error) {
      console.error('Error minting car:', error);
      throw error;
    }
  }

  private async getCarNFTContract(): Promise<ethers.Contract> {
    if (!this.carNFTContract) {
      const signer = await this.getSigner();
      this.carNFTContract = new ethers.Contract(
        import.meta.env.VITE_CAR_NFT_ADDRESS,
        [
          "function mintPrice() view returns (uint256)",
          "function mintCar(string memory carImageURI, tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI)[] memory partsData) payable",
          "function setMintPrice(uint256 _newPrice)",
          "function balanceOf(address owner) view returns (uint256)",
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function getCarsByOwner(address owner) view returns (uint256[])",
          "function getCarComposition(uint256 carId) view returns (uint256[] partIds, string carImageURI, bool[] slotOccupied)",
          "function getFullCarMetadata(uint256 carId) view returns (tuple(uint256 carId, address owner, string carImageURI, uint8 condition, tuple(uint8 speed, uint8 acceleration, uint8 handling, uint8 driftFactor, uint8 turnFactor, uint8 maxSpeed) combinedStats))",
          "function equipPart(uint256 carId, uint256 partId, uint256 slotIndex)",
          "function unequipPart(uint256 carId, uint256 partId)",
          "function getLastTokenId() view returns (uint256)",
          "function getCar(uint256 carId) view returns (tuple(uint256 carId, address owner, string carImageURI, uint8 condition, tuple(uint8 speed, uint8 acceleration, uint8 handling, uint8 driftFactor, uint8 turnFactor, uint8 maxSpeed) combinedStats))",
          "function tokenURI(uint256 tokenId) view returns (string)"
        ],
        signer
      );
    }
    return this.carNFTContract;
  }

  async getCarPartContract(): Promise<ethers.Contract> {
    if (!this.carPartContract) {
      const signer = await this.getSigner();
      this.carPartContract = new ethers.Contract(
        import.meta.env.VITE_CAR_PART_ADDRESS,
        [
          "function getPartStats(uint256 partId) view returns (tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI))",
          "function isEquipped(uint256 partId) view returns (bool)",
          "function getEquippedCar(uint256 partId) view returns (uint256)",
          "function exists(uint256 partId) view returns (bool)",
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function balanceOf(address owner) view returns (uint256)",
          "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
          "function getPartType(uint256 partId) view returns (uint8)"
        ],
        signer
      );
    }
    return this.carPartContract;
  }

  async getUserCars(address: string): Promise<any[]> {
    try {
      const contract = await this.getCarNFTContract();
      const carPartContract = await this.getCarPartContract();
      
      // Obtener el balance de NFTs del usuario
      const balance = await contract.balanceOf(address);
      console.log('Balance de NFTs:', balance.toString());

      if (balance === 0n) {
        console.log('El usuario no tiene carros');
        return [];
      }

      // Obtener el último ID de token
      const lastTokenId = await contract.getLastTokenId();
      console.log('Último ID de token:', lastTokenId.toString());

      // Buscar todos los tokens del usuario
      const carIds = [];
      for (let i = 1n; i <= lastTokenId; i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            carIds.push(i);
          }
        } catch (error) {
          // Si el token no existe o fue quemado, continuamos con el siguiente
          continue;
        }
      }

      console.log('IDs de carros encontrados:', carIds);
      
      // Obtener detalles de cada carro
      const cars = await Promise.all(carIds.map(async (carId: bigint) => {
        try {
          // Obtener composición del carro
          const [partIds, carImageURI, slotOccupied] = await contract.getCarComposition(carId);
          
          // Obtener detalles de las partes
          const parts = await Promise.all(partIds.map(async (partId: bigint, index: number) => {
            if (!slotOccupied[index]) return null;
            
            const partStats = await carPartContract.getPartStats(partId);
            const isEquipped = await carPartContract.isEquipped(partId);
            const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(partId) : null;
            
            return {
              id: partId.toString(),
              partType: Number(partStats.partType),
              imageURI: partStats.imageURI,
              stats: this.mapPartStats(partStats),
              isEquipped,
              equippedToCarId: equippedToCarId?.toString(),
              slotIndex: index
            };
          }));

          // Obtener metadata completa
          const metadata = await contract.getFullCarMetadata(carId);

          return {
            id: carId.toString(),
            carImageURI,
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
            parts: parts.filter(part => part !== null)
          };
        } catch (error) {
          console.error('Error al obtener detalles del carro:', carId.toString(), error);
          return null;
        }
      }));

      return cars.filter(car => car !== null);
    } catch (error) {
      console.error('Error getting user cars:', error);
      throw error;
    }
  }

  private mapPartStats(stats: any) {
    switch(Number(stats.partType)) {
      case 0: // ENGINE
        return {
          speed: Number(stats.stat1),
          maxSpeed: Number(stats.stat2),
          acceleration: Number(stats.stat3)
        };
      case 1: // TRANSMISSION
        return {
          acceleration: Number(stats.stat1),
          speed: Number(stats.stat2),
          handling: Number(stats.stat3)
        };
      case 2: // WHEELS/CORE
        return {
          handling: Number(stats.stat1),
          driftFactor: Number(stats.stat2),
          turnFactor: Number(stats.stat3)
        };
      default:
        return {};
    }
  }

  async equipPart(carId: string, partId: string, slotIndex: number): Promise<void> {
    try {
      console.log('Parámetros recibidos:', { carId, partId, slotIndex });
      
      // Validar que los parámetros no sean undefined
      if (!carId || !partId || slotIndex === undefined) {
        throw new Error(`Parámetros inválidos: carId=${carId}, partId=${partId}, slotIndex=${slotIndex}`);
      }

      const contract = await this.getCarNFTContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Convertir los parámetros a BigInt
      let carIdBigInt: bigint, partIdBigInt: bigint, slotIndexBigInt: bigint;
      try {
        carIdBigInt = BigInt(carId);
        partIdBigInt = BigInt(partId);
        slotIndexBigInt = BigInt(slotIndex);
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Error desconocido';
        console.error('Error convirtiendo a BigInt:', { carId, partId, slotIndex });
        throw new Error(`Error convirtiendo a BigInt: ${error}`);
      }

      console.log('Valores convertidos:', { 
        carIdBigInt: carIdBigInt.toString(), 
        partIdBigInt: partIdBigInt.toString(), 
        slotIndexBigInt: slotIndexBigInt.toString() 
      });

      // Llamar al contrato con los parámetros convertidos
      const tx = await contract.equipPart(carIdBigInt, partIdBigInt, slotIndexBigInt);
      console.log('Transacción enviada:', tx.hash);
      await tx.wait();
      console.log('Parte equipada exitosamente');
    } catch (error) {
      console.error('Error equipping part:', error);
      throw error;
    }
  }

  async unequipPart(carId: string, partId: string): Promise<void> {
    try {
      const contract = await this.getCarNFTContract();
      const tx = await contract.unequipPart(carId, partId);
      await tx.wait();
    } catch (error) {
      console.error('Error unequipping part:', error);
      throw error;
    }
  }

  async getChainId() {
    const provider = await this.getProvider();
    const network = await provider.getNetwork();
    return network.chainId;
  }

  async switchNetwork(chainId: number) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Red no configurada en MetaMask');
      }
      throw error;
    }
  }

  async getCarParts(carId: string): Promise<Part[]> {
    try {
      const contract = await this.getCarNFTContract();
      const carPartContract = await this.getCarPartContract();
      
      // Obtener la composición del carro (IDs de partes y slots ocupados)
      const [partIds, , slotOccupied] = await contract.getCarComposition(carId);
      
      // Mapear las partes con sus detalles
      const parts = await Promise.all(partIds.map(async (partId: bigint, index: number) => {
        if (!slotOccupied[index]) return null;
        
        const partStats = await carPartContract.getPartStats(partId);
        const isEquipped = await carPartContract.isEquipped(partId);
        const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(partId) : null;
        
        return {
          id: partId.toString(),
          partType: Number(partStats.partType),
          imageURI: partStats.imageURI,
          stats: this.mapPartStats(partStats),
          isEquipped,
          equippedToCarId: equippedToCarId?.toString(),
          slotIndex: index
        };
      }));

      return parts.filter((part): part is Part => part !== null);
    } catch (error) {
      console.error('Error getting car parts:', error);
      throw error;
    }
  }
}

export const web3Service = new Web3Service(); 