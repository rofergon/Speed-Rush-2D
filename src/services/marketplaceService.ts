import { ethers } from 'ethers';
import { web3Service } from './web3Service';
import { Car } from '../types/car';
import { Log, EventLog, Result } from 'ethers';

interface CarListing {
  seller: string;
  carId: bigint;
  price: bigint;
  active: boolean;
}

class MarketplaceService {
  private contract: ethers.Contract | null = null;

  async init() {
    if (!this.contract) {
      const provider = await web3Service.getProvider();
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(
        import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS,
        [
          "function listCar(uint256 carId, uint256 price, bool[3] memory includeSlots) external",
          "function cancelCarListing(uint256 carId) external",
          "function carListings(uint256) view returns (address seller, uint256 carId, uint256 price, bool active)",
          "function buyCar(uint256 carId) external payable",
          "function getListingApprovalStatus(uint256 carId, bool[3] memory includeSlots) external view returns (bool carApproved, bool[] memory partsApproved)",
          "event CarListed(uint256 indexed carId, address indexed seller, uint256 price, bool[3] slotsIncluded)",
          "event CarSold(uint256 indexed carId, address indexed seller, address indexed buyer, uint256 price)",
          "event ListingCancelled(uint256 indexed carId, bool isCar)"
        ],
        signer
      );
    }
    return this.contract;
  }

  async isCarListed(carId: string): Promise<boolean> {
    try {
      const contract = await this.init();
      if (!contract) return false;

      const [, , , active] = await contract.carListings(carId);
      return active;
    } catch (error) {
      console.error(`Error checking if car ${carId} is listed:`, error);
      return false;
    }
  }

  async getCarListingPrice(carId: string): Promise<number | null> {
    try {
      const contract = await this.init();
      if (!contract) return null;

      const [, , price, active] = await contract.carListings(carId);
      return active ? Number(ethers.formatEther(price)) : null;
    } catch (error) {
      console.error(`Error getting car ${carId} listing price:`, error);
      return null;
    }
  }

  async getListedCars(): Promise<Car[]> {
    const contract = await this.init();
    if (!contract) return [];

    try {
      console.log('Buscando eventos CarListed...');
      // Obtener todos los eventos CarListed
      const filter = contract.filters.CarListed();
      const allEvents = await contract.queryFilter(filter);
      console.log('Eventos encontrados:', allEvents.length);

      const listedCars: Car[] = [];
      const processedCarIds = new Set<string>();

      // Procesar eventos en orden inverso (más recientes primero)
      for (const event of allEvents.reverse()) {
        // Extraer carId del topic indexado (está en la posición 1)
        const carId = BigInt(event.topics[1]).toString();
        // Extraer seller del topic indexado (está en la posición 2)
        const seller = `0x${event.topics[2].slice(26)}`;
        
        console.log('Procesando carro:', carId, 'seller:', seller);
        
        // Evitar procesar el mismo carro más de una vez
        if (processedCarIds.has(carId)) {
          console.log('Carro ya procesado:', carId);
          continue;
        }
        processedCarIds.add(carId);

        try {
          // Verificar si el listado sigue activo
          console.log('Verificando listado del carro:', carId);
          const [seller, carIdBN, price, active] = await contract.carListings(carId);
          console.log('Estado del listado:', { seller, carId: carIdBN.toString(), price: price.toString(), active });
          
          if (!active) {
            console.log('Listado no activo para el carro:', carId);
            continue;
          }

          // Obtener datos completos del carro usando web3Service
          console.log('Obteniendo datos completos del carro:', carId);
          const cars = await web3Service.getUserCars(seller);
          const carData = cars.find(car => car.id === carId);
          console.log('Datos del carro:', carData);

          if (carData) {
            listedCars.push({
              ...carData,
              seller: seller,
              price: Number(ethers.formatEther(price)),
              listedAt: (await this.getBlockTimestamp(event.blockNumber)) * 1000
            });
            console.log('Carro agregado a la lista:', carId);
          }
        } catch (error) {
          console.error(`Error loading car ${carId}:`, error);
          continue;
        }
      }

      console.log('Total de carros listados encontrados:', listedCars.length);
      return listedCars;
    } catch (error) {
      console.error('Error getting listed cars:', error);
      return [];
    }
  }

  private async getBlockTimestamp(blockNumber: number): Promise<number> {
    const provider = await web3Service.getProvider();
    const block = await provider.getBlock(blockNumber);
    return block ? Number(block.timestamp) : Math.floor(Date.now() / 1000);
  }

  async listCar(carId: string, price: number, includeSlots: boolean[]) {
    const contract = await this.init();
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.listCar(carId, priceInWei, includeSlots);
    await tx.wait();
    return tx;
  }

  async buyCar(carId: string, price: number) {
    const contract = await this.init();
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.buyCar(carId, { value: priceInWei });
    await tx.wait();
    return tx;
  }

  async cancelCarListing(carId: string) {
    const contract = await this.init();
    const tx = await contract.cancelCarListing(carId);
    await tx.wait();
    return tx;
  }
}

export const marketplaceService = new MarketplaceService(); 