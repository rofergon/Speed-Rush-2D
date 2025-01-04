import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Input, useToast } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';

interface MintPriceProps {
  isOwner: boolean;
}

export function MintPrice({ isOwner }: MintPriceProps) {
  const [mintPrice, setMintPrice] = useState<string>('0');
  const [newPrice, setNewPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { address } = useAccount();

  useEffect(() => {
    loadMintPrice();
  }, []);

  const loadMintPrice = async () => {
    try {
      const price = await web3Service.getMintPrice();
      setMintPrice(ethers.formatEther(price));
    } catch (error) {
      console.error('Error loading mint price:', error);
    }
  };

  const handleUpdatePrice = async () => {
    if (!address || !isOwner || !newPrice) return;

    try {
      setIsLoading(true);
      const priceInWei = ethers.parseEther(newPrice);
      await web3Service.setMintPrice(priceInWei);
      await loadMintPrice();
      setNewPrice('');
      toast({
        title: 'Price Updated',
        description: `New mint price set to ${newPrice} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating mint price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mint price',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="gray.800" p={4} rounded="lg">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Current Mint Price: {mintPrice} ETH
      </Text>

      {isOwner && (
        <Box mt={4}>
          <Text mb={2}>Update Mint Price</Text>
          <Input
            type="number"
            step="0.001"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="New price in ETH"
            bg="gray.700"
            mb={2}
          />
          <Button
            onClick={handleUpdatePrice}
            colorScheme="blue"
            isLoading={isLoading}
            isDisabled={!newPrice}
            width="full"
          >
            Update Price
          </Button>
        </Box>
      )}
    </Box>
  );
} 