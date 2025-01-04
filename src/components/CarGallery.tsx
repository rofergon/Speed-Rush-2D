import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';
import { CarCard } from './CarCard';
import { web3Service } from '../services/web3Service';
import { partsService } from '../services/partsService';

interface CarGalleryProps {
  alternativeSkin: boolean;
  onSkinChange: (newState: boolean) => void;
  onSelectCar?: (car: { id: string; parts: any[] }) => void;
}

export const CarGallery: React.FC<CarGalleryProps> = ({
  alternativeSkin,
  onSkinChange,
  onSelectCar
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const { address } = useAccount();

  const loadData = async () => {
    if (!address) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar carros y sus partes
      const userCars = await web3Service.getUserCars(address);
      const carsWithParts = await Promise.all(userCars.map(async (car: any) => {
        const parts = await web3Service.getCarParts(car.id);
        return {
          ...car,
          parts
        };
      }));
      
      // Cargar todas las partes disponibles
      const userParts = await partsService.getUserParts(address);
      
      setCars(carsWithParts);
      setAvailableParts(userParts);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error cargando datos. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [address]);

  const handleCarSelect = (car: any) => {
    setSelectedCarId(car.id);
    if (onSelectCar) {
      onSelectCar(car);
    }
  };

  const handleEquipPart = async (partId: string, slotType: number) => {
    if (!selectedCarId) return;
    try {
      await web3Service.equipPart(selectedCarId, partId, slotType);
      await loadData(); // Recargar datos después de equipar
    } catch (error) {
      console.error('Error equipando parte:', error);
      throw error;
    }
  };

  const handleUnequipPart = async (partId: string) => {
    if (!selectedCarId) return;
    try {
      await web3Service.unequipPart(selectedCarId, partId);
      await loadData(); // Recargar datos después de desequipar
    } catch (error) {
      console.error('Error desequipando parte:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4} color="error.main">
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (cars.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No tienes ningún carro aún. ¡Crea uno nuevo para empezar!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {cars.map((car) => {
        const stats = car.combinedStats || car.stats || {};
        return (
          <Grid item xs={12} sm={6} md={3} key={car.id}>
            <CarCard
              id={car.id}
              imageUrl={alternativeSkin ? car.alternativeImageURI : car.carImageURI}
              stats={{
                speed: Number(stats.speed) || 0,
                maxSpeed: Number(stats.maxSpeed) || 0,
                acceleration: Number(stats.acceleration) || 0,
                handling: Number(stats.handling) || 0,
                driftFactor: Number(stats.driftFactor) || 0,
                turnFactor: Number(stats.turnFactor) || 0
              }}
              parts={car.parts}
              availableParts={availableParts}
              onSelect={() => handleCarSelect(car)}
              onEquipPart={handleEquipPart}
              onUnequipPart={handleUnequipPart}
              isSelected={selectedCarId === car.id}
              alternativeSkin={alternativeSkin}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}; 