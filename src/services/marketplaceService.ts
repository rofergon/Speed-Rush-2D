import { ethers } from 'ethers';
import CarMarketplaceABI from '../contracts/abis/CarMarketplace.json';
import CarNFTABI from '../contracts/abis/CarNFT.json';
import { web3Service } from './web3Service';
import { Car } from '../types/car';

interface CarListing {
  seller: string;
  carId: bigint;
  price: bigint;
  partSlots: Array<{
    included: boolean;
    partId: bigint;
  }>;
  active: boolean;
}

interface CarListedEvent extends ethers.Log {
  args: [bigint, string, bigint, boolean[]];
}

class MarketplaceService {
  private contract: ethers.Contract | null = null;
  private carNFTContract: ethers.Contract | null = null;

  async init() {
    if (!this.contract) {
      const provider = await web3Service.getProvider();
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(
        import.meta.env.VITE_CAR_MARKETPLACE_ADDRESS,
        CarMarketplaceABI.abi,
        signer
      );
      this.carNFTContract = new ethers.Contract(
        import.meta.env.VITE_CAR_NFT_ADDRESS,
        CarNFTABI.abi,
        signer
      );
    }
    return this.contract;
  }

  async getListedCars(): Promise<Car[]> {
    const contract = await this.init();
    if (!contract || !this.carNFTContract) return [];

    try {
      // Obtener todos los carros listados activos
      const filter = contract.filters.CarListed();
      const events = (await contract.queryFilter(filter)) as CarListedEvent[];
      const listedCars: Car[] = [];

      for (const event of events) {
        const [carId] = event.args;
        if (!carId) continue;

        try {
          const listing = (await contract.carListings(carId)) as CarListing;
          if (!listing.active) continue;

          // Obtener datos del carro desde el contrato CarNFT
          const carData = await this.carNFTContract.getCar(carId);
          const carURI = await this.carNFTContract.tokenURI(carId);

          listedCars.push({
            id: carId.toString(),
            carImageURI: carURI,
            combinedStats: {
              speed: Number(carData.stats.speed),
              acceleration: Number(carData.stats.acceleration),
              handling: Number(carData.stats.handling),
              driftFactor: Number(carData.stats.driftFactor),
              turnFactor: Number(carData.stats.turnFactor),
              maxSpeed: Number(carData.stats.maxSpeed)
            },
            parts: [], // Aquí podrías cargar las partes si es necesario
            price: Number(ethers.formatEther(listing.price)),
            seller: listing.seller,
            condition: 100, // Este valor podría venir del contrato si lo tienes
            listedAt: event.blockNumber ? (await event.getBlock()).timestamp * 1000 : Date.now()
          });
        } catch (error) {
          console.error(`Error loading car ${carId}:`, error);
          continue;
        }
      }

      return listedCars;
    } catch (error) {
      console.error('Error getting listed cars:', error);
      return [];
    }
  }

  async listCar(carId: string, price: number, includeSlots: boolean[]) {
    const contract = await this.init();
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.listCar(carId, priceInWei, includeSlots);
    await tx.wait();
    return tx;
  }

  async listPart(partId: string, price: number) {
    const contract = await this.init();
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.listPart(partId, priceInWei);
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

  async buyPart(partId: string, price: number) {
    const contract = await this.init();
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await contract.buyPart(partId, { value: priceInWei });
    await tx.wait();
    return tx;
  }

  async cancelCarListing(carId: string) {
    const contract = await this.init();
    const tx = await contract.cancelCarListing(carId);
    await tx.wait();
    return tx;
  }

  async cancelPartListing(partId: string) {
    const contract = await this.init();
    const tx = await contract.cancelPartListing(partId);
    await tx.wait();
    return tx;
  }

  async getCarListing(carId: string) {
    const contract = await this.init();
    const listing = await contract.carListings(carId) as CarListing;
    return {
      seller: listing.seller,
      carId: listing.carId.toString(),
      price: ethers.formatEther(listing.price),
      active: listing.active,
      partSlots: listing.partSlots
    };
  }

  async getPartListing(partId: string) {
    const contract = await this.init();
    const listing = await contract.partListings(partId);
    return {
      seller: listing.seller,
      partId: listing.partId.toString(),
      price: ethers.formatEther(listing.price),
      active: listing.active
    };
  }
}

export const marketplaceService = new MarketplaceService(); 