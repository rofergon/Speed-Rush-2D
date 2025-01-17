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
  private marketplaceContract: ethers.Contract | null = null;

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
          "function balanceOf(address owner) view returns (uint256)",
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function getLastTokenId() view returns (uint256)",
          "function getCarComposition(uint256 carId) view returns (uint256[] partIds, string carImageURI, bool[] slotOccupied)",
          "function getFullCarMetadata(uint256 carId) view returns (tuple(uint256 carId, address owner, string carImageURI, uint8 condition, tuple(uint8 speed, uint8 acceleration, uint8 handling, uint8 driftFactor, uint8 turnFactor, uint8 maxSpeed) combinedStats, tuple(uint256 partId, uint8 partType, string imageURI, tuple(uint8 speed, uint8 maxSpeed, uint8 acceleration, uint8 transmissionAcceleration, uint8 transmissionSpeed, uint8 transmissionHandling, uint8 handling, uint8 driftFactor, uint8 turnFactor) stats)[] parts))",
          "function mintCar(string memory carImageURI, tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI)[] memory partsData) payable",
          "function mintPrice() view returns (uint256)",
          "function equipPart(uint256 carId, uint256 partId, uint256 slotIndex)",
          "function unequipPart(uint256 carId, uint256 partId)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function setApprovalForAll(address operator, bool approved)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
          "function exists(uint256 tokenId) view returns (bool)",
          "function tokenURI(uint256 tokenId) view returns (string)",
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function transferFrom(address from, address to, uint256 tokenId)",
          "function safeTransferFrom(address from, address to, uint256 tokenId)",
          "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)"
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
          "function getOwnerEquippedParts(address owner) view returns (uint256[])",
          "function getOwnerUnequippedParts(address owner) view returns (uint256[])",
          "function getPartType(uint256 partId) view returns (uint8)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function setApprovalForAll(address operator, bool approved)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)"
        ],
        signer
      );
    }
    return this.carPartContract;
  }

  async getUserCars(address: string): Promise<any[]> {
    try {
      const contract = await this.getCarNFTContract();
      
      // Obtener el último ID de token
      const lastTokenId = await contract.getLastTokenId();
      if (lastTokenId === 0n) {
        return [];
      }

      // Buscar todos los tokens del usuario
      const carIds = [];
      for (let i = 1n; i <= lastTokenId; i++) {
        try {
          const exists = await contract.exists(i);
          if (!exists) continue;
          
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            carIds.push(i);
          }
        } catch (error) {
          continue;
        }
      }
      
      // Obtener detalles de cada carro usando getFullCarMetadata directamente
      const cars = await Promise.all(carIds.map(async (carId: bigint) => {
        try {
          const metadata = await contract.getFullCarMetadata(carId);
          
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
            parts: metadata.parts.map((part: any) => ({
              id: part.partId.toString(),
              partType: Number(part.partType),
              imageURI: part.imageURI,
              stats: {
                speed: Number(part.stats.speed || 0),
                maxSpeed: Number(part.stats.maxSpeed || 0),
                acceleration: Number(part.stats.acceleration || 0),
                transmissionAcceleration: Number(part.stats.transmissionAcceleration || 0),
                transmissionSpeed: Number(part.stats.transmissionSpeed || 0),
                transmissionHandling: Number(part.stats.transmissionHandling || 0),
                handling: Number(part.stats.handling || 0),
                driftFactor: Number(part.stats.driftFactor || 0),
                turnFactor: Number(part.stats.turnFactor || 0)
              },
              isEquipped: true,
              equippedToCarId: carId.toString()
            }))
          };
        } catch (error) {
          console.error(`Error getting car ${carId} metadata:`, error);
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
        throw new Error(`Error convirtiendo a BigInt: ${error}`);
      }

      // Llamar al contrato con los parámetros convertidos
      const tx = await contract.equipPart(carIdBigInt, partIdBigInt, slotIndexBigInt);
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
      
      // Obtener metadata completa del carro que incluye las partes
      const metadata = await contract.getFullCarMetadata(carId);
      
      // Obtener la composición actual del carro para verificar slots ocupados
      const [partIds, , slotOccupied] = await contract.getCarComposition(carId);
      
      // Mapear las partes a nuestro formato
      const parts = await Promise.all(metadata.parts.map(async (part: any, index: number) => {
        // Verificar si la parte está realmente equipada usando el contrato de partes
        const isEquipped = await carPartContract.isEquipped(part.partId);
        const equippedToCarId = isEquipped ? await carPartContract.getEquippedCar(part.partId) : null;
        
        // Solo incluir la parte si está realmente equipada y en el carro correcto
        if (isEquipped && equippedToCarId.toString() === carId && slotOccupied[index]) {
          return {
            id: part.partId.toString(),
            partType: Number(part.partType),
            imageURI: part.imageURI,
            stats: this.mapPartStats({
              partType: part.partType,
              stat1: part.stats.speed || part.stats.transmissionAcceleration || part.stats.handling,
              stat2: part.stats.maxSpeed || part.stats.transmissionSpeed || part.stats.driftFactor,
              stat3: part.stats.acceleration || part.stats.transmissionHandling || part.stats.turnFactor
            }),
            isEquipped: true,
            equippedToCarId: carId,
          };
        }
        return null;
      }));

      return parts.filter((part): part is Part => part !== null);
    } catch (error) {
      console.error('Error getting car parts:', error);
      throw error;
    }
  }

  private async getMarketplaceContract(): Promise<ethers.Contract> {
    if (!this.marketplaceContract) {
      const signer = await this.getSigner();
      this.marketplaceContract = new ethers.Contract(
        import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS,
        [
          "function listCar(uint256 carId, uint256 price, bool[3] memory includeSlots) external",
          "function cancelCarListing(uint256 carId) external",
          "function carListings(uint256) view returns (address seller, uint256 carId, uint256 price, bool[3] includedSlots, bool active)",
          "function buyCar(uint256 carId) external payable",
          "function getListingApprovalStatus(uint256 carId, bool[3] memory includeSlots) external view returns (bool carApproved, bool[] memory partsApproved)",
          "event CarListed(uint256 indexed carId, address indexed seller, uint256 price, bool[3] slotsIncluded)",
          "event CarSold(uint256 indexed carId, address indexed seller, address indexed buyer, uint256 price)",
          "event ListingCancelled(uint256 indexed carId, bool isCar)"
        ],
        signer
      );
    }
    return this.marketplaceContract;
  }

  async listCarForSale(carId: string, price: string, includeSlots: boolean[]): Promise<void> {
    try {
      const contract = await this.getMarketplaceContract();
      const priceInWei = ethers.parseEther(price);
      
      // Primero verificamos las aprobaciones
      const [carApproved, partsApproved] = await contract.getListingApprovalStatus(carId, includeSlots);
      
      // Si el carro no está aprobado, necesitamos aprobarlo
      if (!carApproved) {
        const carContract = await this.getCarNFTContract();
        const approveTx = await carContract.approve(import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS, carId);
        await approveTx.wait();
      }

      // Si hay partes incluidas que no están aprobadas, las aprobamos
      const carPartContract = await this.getCarPartContract();
      for (let i = 0; i < includeSlots.length; i++) {
        if (includeSlots[i] && !partsApproved[i]) {
          const [partIds] = await this.getCarComposition(carId);
          if (partIds[i]) {
            const approveTx = await carPartContract.approve(import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS, partIds[i]);
            await approveTx.wait();
          }
        }
      }

      // Finalmente listamos el carro
      const tx = await contract.listCar(carId, priceInWei, includeSlots);
      await tx.wait();
    } catch (error) {
      console.error('Error listing car for sale:', error);
      throw error;
    }
  }

  async cancelCarListing(carId: string): Promise<void> {
    try {
      const contract = await this.getMarketplaceContract();
      const tx = await contract.cancelCarListing(carId);
      await tx.wait();
    } catch (error) {
      console.error('Error canceling car listing:', error);
      throw error;
    }
  }

  async getCarListing(carId: string): Promise<{
    seller: string;
    price: string;
    isActive: boolean;
    includedSlots: boolean[];
  } | null> {
    try {
      const contract = await this.getMarketplaceContract();
      const listing = await contract.carListings(carId);
      
      if (!listing.active) {
        return null;
      }

      return {
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        isActive: listing.active,
        includedSlots: listing.includedSlots
      };
    } catch (error) {
      console.error('Error getting car listing:', error);
      return null;
    }
  }

  async getCarComposition(carId: string): Promise<[string[], string, boolean[]]> {
    const contract = await this.getCarNFTContract();
    const [partIds, carImageURI, slotOccupied] = await contract.getCarComposition(carId);
    return [
      partIds.map((id: bigint) => id.toString()),
      carImageURI,
      slotOccupied
    ];
  }
}

export const web3Service = new Web3Service(); 