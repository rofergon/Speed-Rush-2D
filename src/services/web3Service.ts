import { ethers } from 'ethers';

interface PartData {
  partType: number;
  stat1: number;
  stat2: number;
  stat3: number;
  imageURI: string;
}

interface CarGenerationData {
  carImageURI: string;
  parts: PartData[];
}

class Web3Service {
  private provider: ethers.BrowserProvider;
  private carNFTContract: ethers.Contract | null = null;
  private carPartContract: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Contract addresses:', {
      carNFT: import.meta.env.VITE_CAR_NFT_ADDRESS,
      carPart: import.meta.env.VITE_CAR_PART_ADDRESS
    });
  }

  private async getCarNFTContract(): Promise<ethers.Contract> {
    if (!this.carNFTContract) {
      const signer = await this.provider.getSigner();
      const address = import.meta.env.VITE_CAR_NFT_ADDRESS;
      console.log('Creating CarNFT contract with address:', address);
      if (!address) {
        throw new Error('CarNFT contract address not found in environment variables');
      }
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
          "function equipPart(uint256 carId, uint256 partId, uint8 slotIndex)",
          "function unequipPart(uint256 carId, uint256 partId)",
          "function getLastTokenId() view returns (uint256)"
        ],
        signer
      );
    }
    return this.carNFTContract;
  }

  public async getCarPartContract(): Promise<ethers.Contract> {
    if (!this.carPartContract) {
      const signer = await this.provider.getSigner();
      this.carPartContract = new ethers.Contract(
        import.meta.env.VITE_CAR_PART_ADDRESS,
        [
          "function getPartStats(uint256 partId) view returns (tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI))",
          "function isEquipped(uint256 partId) view returns (bool)",
          "function getEquippedCar(uint256 partId) view returns (uint256)",
          "function exists(uint256 partId) view returns (bool)",
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function balanceOf(address owner) view returns (uint256)",
          "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
        ],
        signer
      );
    }
    return this.carPartContract;
  }

  async getMintPrice(): Promise<bigint> {
    try {
      const contract = await this.getCarNFTContract();
      const price = await contract.mintPrice();
      return price;
    } catch (error) {
      console.error('Error getting mint price:', error);
      throw error;
    }
  }

  async setMintPrice(newPrice: bigint): Promise<void> {
    try {
      const contract = await this.getCarNFTContract();
      const tx = await contract.setMintPrice(newPrice);
      await tx.wait();
    } catch (error) {
      console.error('Error setting mint price:', error);
      throw error;
    }
  }

  async mintCar(address: string, carData: CarGenerationData, mintPriceWei: string): Promise<string> {
    try {
      const contract = await this.getCarNFTContract();
      const tx = await contract.mintCar(carData.carImageURI, carData.parts, {
        value: mintPriceWei
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error minting car:', error);
      throw error;
    }
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
          console.log(`\nObteniendo detalles del carro ${carId.toString()}:`);
          
          // Obtener composición del carro
          const [partIds, carImageURI, slotOccupied] = await contract.getCarComposition(carId);
          console.log('Composición del carro:');
          console.log('- Parts IDs:', partIds.map((id: bigint) => id.toString()));
          console.log('- Slots ocupados:', slotOccupied);
          
          // Obtener detalles de las partes
          console.log('\nDetalles de las partes:');
          const parts = await Promise.all(partIds.map(async (partId: bigint, index: number) => {
            if (!slotOccupied[index]) {
              console.log(`Slot ${index}: Vacío`);
              return null;
            }
            
            const partStats = await carPartContract.getPartStats(partId);
            const isEquipped = await carPartContract.isEquipped(partId);
            const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(partId) : null;
            
            console.log(`\nParte ${partId.toString()} (Slot ${index}):`);
            console.log('- Tipo:', partStats.partType);
            console.log('- Stats:', {
              stat1: Number(partStats.stat1),
              stat2: Number(partStats.stat2),
              stat3: Number(partStats.stat3)
            });
            console.log('- Equipada:', isEquipped);
            if (isEquipped) console.log('- Equipada en carro:', equippedToCarId?.toString());
            
            return {
              partId: partId.toString(),
              partType: Number(partStats.partType),
              imageURI: partStats.imageURI,
              stats: this.mapPartStats(partStats),
              isEquipped,
              equippedToCarId: equippedToCarId?.toString()
            };
          }));

          // Obtener metadata completa
          console.log('\nObteniendo metadata completa...');
          const metadata = await contract.getFullCarMetadata(carId);
          console.log('Metadata del carro:');
          console.log('- Condición:', Number(metadata.condition));
          console.log('- Stats combinados:', {
            speed: Number(metadata.combinedStats.speed),
            acceleration: Number(metadata.combinedStats.acceleration),
            handling: Number(metadata.combinedStats.handling),
            driftFactor: Number(metadata.combinedStats.driftFactor),
            turnFactor: Number(metadata.combinedStats.turnFactor),
            maxSpeed: Number(metadata.combinedStats.maxSpeed)
          });

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
          if (error instanceof Error) {
            console.log('Mensaje de error:', error.message);
            console.log('Stack:', error.stack);
          }
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
      const contract = await this.getCarNFTContract();
      const tx = await contract.equipPart(carId, partId, slotIndex);
      await tx.wait();
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

  public async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  public async getCarParts(carId: string): Promise<any[]> {
    try {
      const contract = await this.getCarNFTContract();
      const carPartContract = await this.getCarPartContract();
      const [partIds, , slotOccupied] = await contract.getCarComposition(carId);
      
      // Obtener detalles de las partes
      const parts = await Promise.all(partIds.map(async (partId: bigint, index: number) => {
        if (!slotOccupied[index]) return null;
        
        const partStats = await carPartContract.getPartStats(partId);
        const isEquipped = await carPartContract.isEquipped(partId);
        const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(partId) : null;
        
        return {
          partId: partId.toString(),
          partType: Number(partStats.partType),
          imageURI: partStats.imageURI,
          stats: this.mapPartStats(partStats),
          isEquipped,
          equippedToCarId: equippedToCarId?.toString()
        };
      }));

      return parts.filter(part => part !== null);
    } catch (error) {
      console.error('Error getting car parts:', error);
      throw error;
    }
  }
}

export const web3Service = new Web3Service(); 