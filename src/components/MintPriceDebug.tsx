import React from 'react';
import { Button } from '@chakra-ui/react';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';

export function MintPriceDebug() {
  const handleCheckPrice = async () => {
    try {
      const price = await web3Service.getMintPrice();
      console.log('Debug - Precio de minteo:');
      console.log('Wei:', price.toString());
      console.log('GRASS:', ethers.formatEther(price));
    } catch (error) {
      console.error('Error al obtener el precio:', error);
    }
  };

  return (
    <Button
      colorScheme="blue"
      onClick={handleCheckPrice}
      size="md"
    >
      Check Mint Price
    </Button>
  );
} 