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

  async mintCar(address: string, carData: CarGenerationData, value: string): Promise<ethers.ContractTransactionResponse> {
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
      return tx;
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
          "function tokenURI(uint256 tokenId) view returns (string)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function setApprovalForAll(address operator, bool approved)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)"
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
          "function getPartType(uint256 partId) view returns (uint8)",
          "function approve(address to, uint256 tokenId)",
          "function getApproved(uint256 tokenId) view returns (address)",
          "function setApprovalForAll(address operator, bool approved)",
          "function isApprovedForAll(address owner, address operator) view returns (bool)",
          "function getOwnerParts(address owner) view returns (uint256[])",
          "function getOwnerPartsByType(address owner, uint8 partType) view returns (uint256[])",
          "function getOwnerEquippedParts(address owner) view returns (uint256[])",
          "function getOwnerUnequippedParts(address owner) view returns (uint256[])",
          "function getOwnerPartsWithDetails(address owner) view returns (tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI)[] allParts, tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI)[] equippedParts, tuple(uint8 partType, uint8 stat1, uint8 stat2, uint8 stat3, string imageURI)[] unequippedParts, uint256[] equippedInCarIds)"
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

      if (balance === 0n) {
        return [];
      }

      // Obtener el último ID de token
      const lastTokenId = await contract.getLastTokenId();

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

  private async getMarketplaceContract(): Promise<ethers.Contract> {
    if (!this.marketplaceContract) {
      const signer = await this.getSigner();
      this.marketplaceContract = new ethers.Contract(
        import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS,
        [
          "function listCar(uint256 carId, uint256 price, bool[3] memory includeSlots) external",
          "function cancelCarListing(uint256 carId) external",
          "function carListings(uint256) view returns (address seller, uint256 carId, uint256 price, tuple(bool included, uint256 partId)[3] partSlots, bool active)",
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

  async approveMarketplace(): Promise<void> {
    try {
      // Aprobar el marketplace para operar con todos los carros
      const carContract = await this.getCarNFTContract();
      const carApprovalTx = await carContract.setApprovalForAll(import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS, true);
      await carApprovalTx.wait();

      // Aprobar el marketplace para operar con todas las partes
      const carPartContract = await this.getCarPartContract();
      const partApprovalTx = await carPartContract.setApprovalForAll(import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS, true);
      await partApprovalTx.wait();
    } catch (error) {
      console.error('Error approving marketplace:', error);
      throw error;
    }
  }

  async listCarForSale(carId: string, price: string, includeSlots: boolean[]): Promise<void> {
    try {
      const contract = await this.getMarketplaceContract();
      const priceInWei = ethers.parseEther(price);
      
      // Verificamos las aprobaciones
      const [carApproved, partsApproved] = await contract.getListingApprovalStatus(carId, includeSlots);
      
      // Si falta alguna aprobación, aprobamos todo de una vez
      if (!carApproved || includeSlots.some((include, i) => include && !partsApproved[i])) {
        await this.approveMarketplace();
      }

      // Listamos el carro
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
      let listing;
      
      try {
        listing = await contract.carListings(carId);
      } catch (error) {
        console.log('Error al obtener listing, retornando null:', error);
        return null;
      }
      
      // Verificar si el listing es válido
      if (!listing || listing.seller === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Verificar si está activo
      if (!listing.active) {
        return null;
      }

      // Convertir los PartSlots a un array de booleanos
      let includedSlots: boolean[];
      try {
        includedSlots = listing.partSlots.map((slot: { included: boolean }) => slot.included);
      } catch (error) {
        console.log('Error al procesar partSlots, usando array vacío:', error);
        includedSlots = [false, false, false];
      }

      return {
        seller: listing.seller,
        price: ethers.formatEther(listing.price || 0),
        isActive: Boolean(listing.active),
        includedSlots
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

  async getUserPartsWithDetails(address: string): Promise<{
    allParts: Part[];
    equippedParts: Part[];
    unequippedParts: Part[];
    equippedInCarIds: string[];
  }> {
    try {
      const contract = await this.getCarPartContract();
      const result = await contract.getOwnerPartsWithDetails(address);

      const mapPartStats = (partStats: any, index: number, isEquipped: boolean = false, equippedToCarId?: string): Part => ({
        id: index.toString(), // El índice se usa como ID temporal
        partType: Number(partStats.partType),
        imageURI: partStats.imageURI,
        stats: this.mapPartStats(partStats),
        isEquipped,
        equippedToCarId
      });

      return {
        allParts: result.allParts.map((p: any, i: number) => mapPartStats(p, i)),
        equippedParts: result.equippedParts.map((p: any, i: number) => 
          mapPartStats(p, i, true, result.equippedInCarIds[i].toString())
        ),
        unequippedParts: result.unequippedParts.map((p: any, i: number) => 
          mapPartStats(p, i, false)
        ),
        equippedInCarIds: result.equippedInCarIds.map((id: bigint) => id.toString())
      };
    } catch (error) {
      console.error('Error getting user parts with details:', error);
      throw error;
    }
  }

  async getUserParts(address: string): Promise<Part[]> {
    try {
      const { allParts } = await this.getUserPartsWithDetails(address);
      return allParts;
    } catch (error) {
      console.error('Error getting user parts:', error);
      throw error;
    }
  }

  async getLastTokenId(): Promise<bigint> {
    const contract = await this.getCarNFTContract();
    return await contract.getLastTokenId();
  }
}

export const web3Service = new Web3Service(); 