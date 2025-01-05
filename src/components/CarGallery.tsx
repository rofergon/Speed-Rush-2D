import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';
import { CarCard } from './CarCard';
import { web3Service } from '../services/web3Service';
import { partsService } from '../services/partsService';
import { Car } from '../types/car';
import { Part } from '../types/parts';

interface CarGalleryProps {
  alternativeSkin: boolean;
  onSkinChange: (newState: boolean) => void;
  onSelectCar?: (car: Car) => void;
}

export const CarGallery: React.FC<CarGalleryProps> = ({
  alternativeSkin,
  onSkinChange,
  onSelectCar
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const { address } = useAccount();

  const loadData = async () => {
    if (!address) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar carros y sus partes
      const userCars = await web3Service.getUserCars(address);
      const carsWithParts = await Promise.all(userCars.map(async (car: Car) => {
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

  const handleCarSelect = (car: Car) => {
    setSelectedCarId(car.id);
    if (onSelectCar) {
      onSelectCar(car);
    }
  };

  const handleEquipPart = async (partId: string, slotType: number) => {
    if (!selectedCarId) {
      console.error('No hay un carro seleccionado');
      return;
    }

    try {
      // Validar que partId no sea undefined o vacío
      if (!partId) {
        console.error('ID de parte inválido:', partId);
        throw new Error('El ID de la parte es requerido');
      }

      // Validar que slotType sea un número válido
      if (typeof slotType !== 'number' || slotType < 0) {
        console.error('Tipo de slot inválido:', slotType);
        throw new Error('El tipo de slot es inválido');
      }

      console.log('Intentando equipar parte:', {
        carId: selectedCarId,
        partId,
        slotType,
        tipoPartId: typeof partId,
        tipoSlotType: typeof slotType
      });

      await web3Service.equipPart(selectedCarId, partId, slotType);
      console.log('Parte equipada correctamente');
      await loadData(); // Recargar datos después de equipar
    } catch (error) {
      console.error('Error equipando parte:', error);
      // Aquí podrías mostrar un mensaje de error al usuario usando un toast o similar
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
      {cars.map((car) => (
        <Grid item xs={12} sm={6} md={3} key={car.id}>
          <CarCard
            id={car.id}
            imageUrl={car.carImageURI}
            stats={car.combinedStats}
            parts={car.parts}
            availableParts={availableParts}
            onSelect={() => handleCarSelect(car)}
            onEquipPart={handleEquipPart}
            onUnequipPart={handleUnequipPart}
            isSelected={selectedCarId === car.id}
            alternativeSkin={alternativeSkin}
          />
        </Grid>
      ))}
    </Grid>
  );
} 