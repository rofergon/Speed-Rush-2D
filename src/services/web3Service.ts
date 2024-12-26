import { ethers } from 'ethers';
import { Provider, Wallet } from 'zksync-ethers';
import CarNFTAbi from '../contracts/abis/CarNFT.json';
import CarPartAbi from '../contracts/abis/CarPart.json';
import CarWorkshopAbi from '../contracts/abis/CarWorkshop.json';
import RaceLeaderboardAbi from '../contracts/abis/RaceLeaderboard.json';

// Direcciones de los contratos en Lens Sepolia
const CAR_NFT_ADDRESS = import.meta.env.VITE_CAR_NFT_ADDRESS;
const CAR_PART_ADDRESS = import.meta.env.VITE_CAR_PART_ADDRESS;
const CAR_WORKSHOP_ADDRESS = import.meta.env.VITE_CAR_WORKSHOP_ADDRESS;
const RACE_LEADERBOARD_ADDRESS = import.meta.env.VITE_RACE_LEADERBOARD_ADDRESS;
const LENS_RPC_URL = import.meta.env.VITE_LENS_RPC_URL;
const LENS_EXPLORER_URL = import.meta.env.VITE_LENS_EXPLORER_URL;

// ID de la red Lens Sepolia
const LENS_SEPOLIA_CHAIN_ID = 37111;

export interface CarMetadata {
  carId: number;
  owner: string;
  carImageURI: string;
  condition: number;
  combinedStats: {
    speed: number;
    acceleration: number;
    handling: number;
    driftFactor: number;
    turnFactor: number;
    maxSpeed: number;
  };
  parts: Array<{
    partId: number;
    partType: number;
    imageURI: string;
    stats: {
      speed?: number;
      maxSpeed?: number;
      acceleration?: number;
      transmissionAcceleration?: number;
      transmissionSpeed?: number;
      transmissionHandling?: number;
      handling?: number;
      driftFactor?: number;
      turnFactor?: number;
    };
  }>;
}

export interface CarGenerationData {
  carImageURI: string;
  parts: Array<{
    partType: number;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }>;
}

export interface LeaderboardEntry {
  carId: number;
  owner: string;
  bestTime: number;
  lastRaceTime: number;
}

export const web3Service = {
  async checkNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== BigInt(LENS_SEPOLIA_CHAIN_ID)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${LENS_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Si la red no está agregada, la agregamos
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${LENS_SEPOLIA_CHAIN_ID.toString(16)}`,
                  chainName: 'Lens Network Sepolia Testnet',
                  nativeCurrency: {
                    name: 'GRASS',
                    symbol: 'GRASS',
                    decimals: 18,
                  },
                  rpcUrls: [LENS_RPC_URL],
                  blockExplorerUrls: [LENS_EXPLORER_URL],
                },
              ],
            });
          } catch (addError) {
            throw new Error('No se pudo agregar la red Lens Sepolia');
          }
        } else {
          throw new Error('No se pudo cambiar a la red Lens Sepolia');
        }
      }
    }
  },

  async getUserCars(walletAddress: string): Promise<CarMetadata[]> {
    try {
      await this.checkNetwork();
      
      const provider = new Provider(LENS_RPC_URL);
      const carNFTContract = new ethers.Contract(CAR_NFT_ADDRESS, CarNFTAbi.abi, provider);
      
      // Obtener el último ID de token
      const lastTokenId = await carNFTContract.getLastTokenId();
      const cars: CarMetadata[] = [];

      // Iterar sobre todos los tokens para encontrar los del usuario
      for (let i = 1; i <= lastTokenId; i++) {
        try {
          const owner = await carNFTContract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const carMetadata = await carNFTContract.getFullCarMetadata(i);
            cars.push(carMetadata);
          }
        } catch (error) {
          console.error(`Error checking car #${i}:`, error);
        }
      }

      return cars;
    } catch (error) {
      console.error('Error getting user cars:', error);
      throw error;
    }
  },

  async mintCar(
    walletAddress: string,
    carData: CarGenerationData,
    mintPrice: string
  ) {
    try {
      await this.checkNetwork();

      const provider = new Provider(LENS_RPC_URL);
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const carNFTContract = new ethers.Contract(CAR_NFT_ADDRESS, CarNFTAbi.abi, signer);

      const tx = await carNFTContract.mintCar(
        carData.carImageURI,
        carData.parts,
        { value: ethers.parseEther(mintPrice) }
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error minting car:', error);
      throw error;
    }
  },

  async replacePart(
    walletAddress: string,
    carId: number,
    oldPartId: number,
    newPartId: number
  ) {
    try {
      await this.checkNetwork();

      const provider = new Provider(LENS_RPC_URL);
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const carNFTContract = new ethers.Contract(CAR_NFT_ADDRESS, CarNFTAbi.abi, signer);

      const tx = await carNFTContract.replacePart(carId, oldPartId, newPartId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error replacing part:', error);
      throw error;
    }
  },

  async repairCar(walletAddress: string, carId: number) {
    try {
      await this.checkNetwork();

      const provider = new Provider(LENS_RPC_URL);
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const workshopContract = new ethers.Contract(CAR_WORKSHOP_ADDRESS, CarWorkshopAbi.abi, signer);

      const tx = await workshopContract.repairCar(carId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error repairing car:', error);
      throw error;
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const provider = new Provider(LENS_RPC_URL);
      const leaderboardContract = new ethers.Contract(RACE_LEADERBOARD_ADDRESS, RaceLeaderboardAbi.abi, provider);
      
      const entries = await leaderboardContract.getLeaderboard();
      return entries.map((entry: any) => ({
        carId: entry.carId.toNumber(),
        owner: entry.owner,
        bestTime: entry.bestTime.toNumber(),
        lastRaceTime: entry.lastRaceTime.toNumber(),
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  },

  async updateRaceTime(walletAddress: string, carId: number, raceTime: number) {
    try {
      await this.checkNetwork();

      const provider = new Provider(LENS_RPC_URL);
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const leaderboardContract = new ethers.Contract(RACE_LEADERBOARD_ADDRESS, RaceLeaderboardAbi.abi, signer);

      const tx = await leaderboardContract.updateRaceTime(carId, raceTime);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating race time:', error);
      throw error;
    }
  }
}; 