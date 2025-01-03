import React, { useState } from 'react';
import { web3Service } from '../services/web3Service';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Speedometer } from './Speedometer';
import { RefreshCw, Plus } from 'lucide-react';

const BACKEND_URL = "https://speed-rush-2d-backend-production.up.railway.app";

interface CarGenerationResponse {
  carImageURI: string;
  parts: {
    partType: number;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }[];
  metadata: {
    speed: number;
    acceleration: number;
    handling: number;
    driftFactor: number;
    turnFactor: number;
    maxSpeed: number;
  };
}

// Enum para los tipos de partes
enum PartType {
  ENGINE = 0,
  TRANSMISSION = 1,
  WHEELS = 2
}

interface MintedCar {
  id: string;
  carImageURI: string;
  parts: {
    partId: string;
    partType: number;
    imageURI: string;
    stats: {
      speed?: number;
      maxSpeed?: number;
      acceleration?: number;
      handling?: number;
      driftFactor?: number;
      turnFactor?: number;
    };
  }[];
  combinedStats: {
    speed: number;
    acceleration: number;
    handling: number;
    driftFactor: number;
    turnFactor: number;
    maxSpeed: number;
  };
}

export function MintCarButton() {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mintedCar, setMintedCar] = useState<MintedCar | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Función para generar el carro en el backend
  const generateCar = async (): Promise<CarGenerationResponse> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cars/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "Generate a cool racing car",
          style: "cartoon",
          engineType: "standard",
          transmissionType: "manual",
          wheelsType: "sport"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error al generar el carro: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Respuesta completa de la API:', JSON.stringify(data, null, 2));

      // Validar la estructura de la respuesta
      if (!data) {
        throw new Error('La respuesta de la API está vacía');
      }

      interface CarPart {
        partType: number;
        stat1: number;
        stat2: number;
        stat3: number;
        imageURI: string;
      }

      // Procesar las partes y calcular los metadatos combinados
      const processedParts = data.parts?.map((part: CarPart) => ({
        partType: Number(part.partType),
        stat1: Number(part.stat1 || 0),
        stat2: Number(part.stat2 || 0),
        stat3: Number(part.stat3 || 0),
        imageURI: part.imageURI || ''
      })) || [];

      // Calcular los metadatos combinados basados en las partes
      let combinedMetadata = {
        speed: 0,
        acceleration: 0,
        handling: 0,
        driftFactor: 0,
        turnFactor: 0,
        maxSpeed: 0
      };

      processedParts.forEach((part: CarPart) => {
        if (part.partType === 0) { // ENGINE
          combinedMetadata.speed += part.stat1;
          combinedMetadata.maxSpeed += part.stat2;
          combinedMetadata.acceleration += part.stat3;
        } else if (part.partType === 1) { // TRANSMISSION
          combinedMetadata.acceleration += part.stat1;
          combinedMetadata.speed += part.stat2;
          combinedMetadata.handling += part.stat3;
        } else if (part.partType === 2) { // WHEELS
          combinedMetadata.handling += part.stat1;
          combinedMetadata.driftFactor += part.stat2;
          combinedMetadata.turnFactor += part.stat3;
        }
      });

      console.log('Metadatos calculados:', combinedMetadata);

      const result = {
        carImageURI: data.carImageURI,
        parts: processedParts,
        metadata: combinedMetadata
      };

      console.log('Resultado final procesado:', result);
      return result;
    } catch (error) {
      console.error('Error detallado en generateCar:', error);
      if (error instanceof Error) {
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  };

  const handleMint = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Iniciando generación del carro...');

      // Primero, generar el carro en el backend
      const carData = await generateCar();
      console.log('Carro generado:', carData);

      setIsGenerating(false);
      setIsMinting(true);
      console.log('Iniciando proceso de minteo...');

      // Usar el servicio web3 existente para mintear
      const hash = await web3Service.mintCar(
        address,
        carData,
        '0.01' // Precio en ETH
      );

      console.log('Transacción enviada, hash:', hash);
      setTxHash(hash);

      // Esperar a que la transacción se confirme
      const provider = new ethers.BrowserProvider(window.ethereum);
      const receipt = await provider.waitForTransaction(hash);
      
      if (receipt && receipt.status === 1) {
        setIsMinting(false);

        // Crear el objeto mintedCar con los datos de la API
        const newMintedCar: MintedCar = {
          id: receipt.blockNumber?.toString() || Date.now().toString(),
          carImageURI: carData.carImageURI,
          parts: carData.parts.map((part, index) => ({
            partId: `${Date.now()}-${index}`,
            partType: part.partType,
            imageURI: part.imageURI,
            stats: {
              ...(part.partType === 0 ? {
                speed: part.stat1,
                maxSpeed: part.stat2,
                acceleration: part.stat3
              } : part.partType === 1 ? {
                acceleration: part.stat1,
                speed: part.stat2,
                handling: part.stat3
              } : {
                handling: part.stat1,
                driftFactor: part.stat2,
                turnFactor: part.stat3
              })
            }
          })),
          combinedStats: {
            speed: Math.min(10, Math.floor((Number(carData.parts[0].stat1) + Number(carData.parts[1].stat2)) / 2)), // Motor stat1 + Transmisión stat2
            acceleration: Math.min(10, Math.floor((Number(carData.parts[0].stat3) + Number(carData.parts[1].stat1)) / 2)), // Motor stat3 + Transmisión stat1
            handling: Math.min(10, Math.floor((Number(carData.parts[1].stat3) + Number(carData.parts[2].stat1)) / 2)), // Transmisión stat3 + Ruedas stat1
            driftFactor: Math.min(10, Number(carData.parts[2].stat2)), // Ruedas stat2
            turnFactor: Math.min(10, Number(carData.parts[2].stat3)), // Ruedas stat3
            maxSpeed: Math.min(10, Number(carData.parts[0].stat2)) // Motor stat2
          }
        };

        setMintedCar(newMintedCar);
        setShowDialog(true);

        // Actualizar la lista de carros en segundo plano
        web3Service.getUserCars(address).catch(console.error);
      } else {
        throw new Error('La transacción falló');
      }

    } catch (error) {
      console.error('Error detallado al mintear:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
      setIsGenerating(false);
      setIsMinting(false);
      alert(`Error al mintear: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getPartTypeName = (type: number) => {
    switch (type) {
      case PartType.ENGINE:
        return "Engine";
      case PartType.TRANSMISSION:
        return "Transmission";
      case PartType.WHEELS:
        return "Core";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <button
        onClick={handleMint}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
        disabled={isMinting || isGenerating}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Minting...</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>Mint New Car</span>
          </>
        )}
      </button>

      {/* Minted NFT Dialog */}
      {showDialog && mintedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">
                NFT Car Successfully Minted!
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main image and general stats */}
              <div>
                <div className="relative mb-4">
                  <img
                    src={mintedCar.carImageURI}
                    alt="Car NFT"
                    className="w-full rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Speedometer 
                      value={Math.floor((mintedCar.combinedStats.speed + 
                                      mintedCar.combinedStats.acceleration + 
                                      mintedCar.combinedStats.handling) / 3)} 
                      size={60} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">ID</span>
                    <p className="text-white font-bold">#{mintedCar.id}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Hash</span>
                    <a 
                      href={txHash ? `https://testnet.lenscan.io/tx/${txHash}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-red-400 font-bold text-sm truncate block"
                    >
                      {txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats and parts */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Speed</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.speed}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Acceleration</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.acceleration}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Handling</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.handling}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Drift</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.driftFactor}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Turn</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.turnFactor}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Max Speed</span>
                    <p className="text-white font-bold">{mintedCar.combinedStats.maxSpeed}</p>
                  </div>
                </div>

                {/* Car parts */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Parts</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mintedCar.parts.map((part) => (
                      <div key={part.partId} className="bg-gray-700 p-2 rounded-lg">
                        <img
                          src={part.imageURI}
                          alt={getPartTypeName(part.partType)}
                          className="w-full h-20 object-contain rounded mb-2"
                        />
                        <div className="text-center">
                          <p className="text-sm text-gray-400">{getPartTypeName(part.partType)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 