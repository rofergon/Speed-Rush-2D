import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';
import { CarCard } from './CarCard';
import { web3Service } from '../services/web3Service';

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
  const { address } = useAccount();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      if (!address) return;
      try {
        setLoading(true);
        setError(null);
        const userCars = await web3Service.getUserCars(address);
        console.log('Cars loaded:', userCars);
        setCars(userCars);
      } catch (error) {
        console.error('Error loading cars:', error);
        setError('Error loading cars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [address]);

  const handleCarSelect = async (car: any) => {
    setSelectedCarId(car.id);
    if (onSelectCar) {
      onSelectCar(car);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" color="error.main" p={4}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (cars.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          You don't have any cars yet. Mint a new one to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {cars.map((car) => {
        const stats = car.combinedStats || car.stats || {};
        console.log('Car data:', {
          id: car.id,
          carImageURI: car.carImageURI,
          alternativeImageURI: car.alternativeImageURI,
          stats
        });
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
              onSelect={() => handleCarSelect(car)}
              isSelected={selectedCarId === car.id}
              alternativeSkin={alternativeSkin}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}; 