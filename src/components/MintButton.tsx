import React, { useState, useEffect } from 'react';
import { Button, Text, VStack, useToast } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';

interface MintButtonProps {
  onMintSuccess?: () => void;
}

export function MintButton({ onMintSuccess }: MintButtonProps) {
  const [mintPrice, setMintPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const toast = useToast();

  useEffect(() => {
    loadMintPrice();
  }, []);

  const loadMintPrice = async () => {
    try {
      const price = await web3Service.getMintPrice();
      setMintPrice(ethers.formatEther(price));
    } catch (error) {
      console.error('Error loading mint price:', error);
      toast({
        title: 'Error',
        description: 'Could not load mint price',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMint = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const carData = {
        carImageURI: "https://example.com/car.png",
        parts: [
          {
            partType: 0, // ENGINE
            stat1: 5,
            stat2: 5,
            stat3: 5,
            imageURI: "https://example.com/engine.png"
          },
          {
            partType: 1, // TRANSMISSION
            stat1: 5,
            stat2: 5,
            stat3: 5,
            imageURI: "https://example.com/transmission.png"
          },
          {
            partType: 2, // CORE
            stat1: 5,
            stat2: 5,
            stat3: 5,
            imageURI: "https://example.com/core.png"
          }
        ]
      };

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
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={2}>
      <Text>Mint Price: {mintPrice} GRASS</Text>
      <Button
        colorScheme="green"
        onClick={handleMint}
        isLoading={isLoading}
        loadingText="Minting..."
        width="full"
      >
        Mint New Car
      </Button>
    </VStack>
  );
} 