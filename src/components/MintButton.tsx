import React, { useState, useEffect } from 'react';
import { Button, Text, VStack, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Flex, Grid, GridItem, Image, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';
import { Car } from '../types/car';

interface MintButtonProps {
  onMintSuccess?: () => void;
}

export function MintButton({ onMintSuccess }: MintButtonProps) {
  const [mintPrice, setMintPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintedCar, setMintedCar] = useState<Car | null>(null);
  const [mintStatus, setMintStatus] = useState<string>('');
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
        description: 'Failed to load minting price',
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
      setMintStatus('Preparing transaction...');
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
      
      console.log('Current balance:', ethers.formatEther(balance), 'GRASS');
      console.log('Price to pay:', ethers.formatEther(priceInWei), 'GRASS');
      
      setMintStatus('Sending transaction...');
      // Enviar el precio exacto en wei al contrato
      const tx = await web3Service.mintCar(address, carData, priceInWei.toString());
      console.log('Transaction sent:', tx);

      setMintStatus('Waiting for confirmation...');
      toast({
        title: 'Transaction Sent',
        description: 'Waiting for network confirmation...',
        status: 'info',
        duration: null,
        isClosable: true,
      });

      // Esperar a que la transacción se confirme
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      setMintStatus('Fetching new car details...');
      // Obtener el ID del carro minteado del evento
      const lastTokenId = await web3Service.getLastTokenId();
      console.log('Minted car ID:', lastTokenId);

      // Obtener los detalles del carro minteado
      const cars = await web3Service.getUserCars(address);
      const newCar = cars.find(car => car.id === lastTokenId.toString());
      console.log('Minted car details:', newCar);

      if (newCar) {
        setMintedCar(newCar);
        setIsModalOpen(true);
        setMintStatus('');
        
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
      }
    } catch (error) {
      console.error('Error minting car:', error);
      setMintStatus('');
      toast({
        title: 'Error',
        description: 'Error minting the car',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <VStack spacing={2}>
        <Text>Mint Price: {mintPrice} XION</Text>
        <Button
          colorScheme="green"
          onClick={handleMint}
          isLoading={isLoading}
          loadingText={mintStatus || "Minting..."}
          width="full"
        >
          Mint New Car
        </Button>
        {mintStatus && (
          <Text fontSize="sm" color="gray.500">
            {mintStatus}
          </Text>
        )}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>New Car Minted!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {mintedCar && (
              <Box>
                <Flex direction="column" align="center" mb={6}>
                  <Image
                    src={mintedCar.carImageURI || '/default-car.png'}
                    alt={`Car #${mintedCar.id}`}
                    boxSize="200px"
                    objectFit="contain"
                    mb={4}
                  />
                  <Text fontSize="xl" fontWeight="bold">ID: #{mintedCar.id}</Text>
                </Flex>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Stat>
                    <StatLabel>Speed</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.speed}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Acceleration</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.acceleration}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Handling</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.handling}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Drift Factor</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.driftFactor}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Turn Factor</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.turnFactor}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Max Speed</StatLabel>
                    <StatNumber>{mintedCar.combinedStats.maxSpeed}</StatNumber>
                  </Stat>
                </Grid>

                <Box mt={6}>
                  <Text fontWeight="bold" mb={2}>Equipped Parts:</Text>
                  {mintedCar.parts.map((part, index) => (
                    <Flex key={part.id} align="center" mb={2}>
                      <Image
                        src={part.imageURI || '/default-part.png'}
                        alt={`Part ${part.id}`}
                        boxSize="40px"
                        mr={2}
                      />
                      <Text>
                        {part.partType === 0 ? 'Engine' : 
                         part.partType === 1 ? 'Transmission' : 'Core'}
                      </Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 