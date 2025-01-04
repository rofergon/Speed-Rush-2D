import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';
import { Speedometer } from './Speedometer';
import { RefreshCw, Plus } from 'lucide-react';

const BACKEND_URL = "https://speed-rush-2d-backend-production.up.railway.app";

interface MintCarButtonProps {
  onMintSuccess?: () => void;
}

interface CarGenerationData {
  carImageURI: string;
  parts: {
    partType: number;
    stat1: number;
    stat2: number;
    stat3: number;
    imageURI: string;
  }[];
}

export function MintCarButton({ onMintSuccess }: MintCarButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { address } = useAccount();
  const toast = useToast();

  const generateCar = async (): Promise<CarGenerationData> => {
    try {
      console.log('Iniciando llamada a la API:', `${BACKEND_URL}/api/cars/generate`);
      
      const requestBody = {
        prompt: "Generate a cool racing car",
        style: "cartoon",
        engineType: "standard",
        transmissionType: "manual",
        wheelsType: "sport"
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${BACKEND_URL}/api/cars/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Respuesta de la API - Status:', response.status);
      const responseText = await response.text();
      console.log('Respuesta de la API - Texto:', responseText);

      if (!response.ok) {
        throw new Error(`Error al generar el carro: ${response.status} ${response.statusText} ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Datos parseados de la API:', JSON.stringify(data, null, 2));

      return {
        carImageURI: data.carImageURI,
        parts: data.parts
      };
    } catch (error) {
      console.error('Error al generar el carro:', error);
      throw error;
    }
  };

  const handleMint = async () => {
    if (!address) return;

    try {
      setIsGenerating(true);
      console.log('Iniciando proceso de generación del carro...');
      
      // Generar el carro
      const carData = await generateCar();
      console.log('Carro generado exitosamente:', carData);

      console.log('Iniciando proceso de minteo...');
      
      // Obtener el precio actual del contrato en wei
      const priceInWei = await web3Service.getMintPrice();
      const balance = await web3Service.getBalance(address);
      
      console.log('Balance actual:', ethers.formatEther(balance), 'GRASS');
      console.log('Precio a pagar:', ethers.formatEther(priceInWei), 'GRASS');
      
      // Enviar el precio exacto en wei al contrato
      await web3Service.mintCar(address, carData, priceInWei.toString());

      toast({
        title: 'Success',
        description: 'Car minted successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onMintSuccess) {
        onMintSuccess();
      }
    } catch (error) {
      console.error('Error minting car:', error);
      toast({
        title: 'Error',
        description: 'Failed to mint car',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      colorScheme="green"
      onClick={handleMint}
      isLoading={isGenerating}
      loadingText="Generating & Minting..."
      leftIcon={<Plus className="w-5 h-5" />}
    >
      Mint New Car
    </Button>
  );
} 