import React, { useState } from 'react';
import { web3Service } from '../services/web3Service';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

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
}

// Enum para los tipos de partes
enum PartType {
  ENGINE = 0,
  TRANSMISSION = 1,
  WHEELS = 2
}

export function MintCarButton() {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Función para generar el carro en el backend
  const generateCar = async (): Promise<CarGenerationResponse> => {
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
    
    // Asegurarnos de que partType sea un número
    const processedParts = data.parts.map((part: any, index: number) => ({
      ...part,
      partType: index, // Asignar 0 para ENGINE, 1 para TRANSMISSION, 2 para WHEELS
      stat1: Number(part.stat1),
      stat2: Number(part.stat2),
      stat3: Number(part.stat3)
    }));

    return {
      carImageURI: data.carImageURI,
      parts: processedParts
    };
  };

  const handleMint = async () => {
    if (!address) {
      alert('Por favor conecta tu wallet primero');
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
      
      if (receipt.status === 1) {
        setIsMinting(false);
        alert('¡Carro minteado exitosamente!');
        // Forzar una recarga de los carros del usuario
        await web3Service.getUserCars(address);
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

  return (
    <button
      onClick={handleMint}
      disabled={isMinting || isGenerating}
      className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105 ${
        (isMinting || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span>
        {isGenerating ? 'Generando carro...' : 
         isMinting ? 'Minteando...' : 
         'Mintear Nuevo Carro'}
      </span>
    </button>
  );
} 