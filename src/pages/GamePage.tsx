import React, { useEffect, useState } from 'react';
import { Unity, useUnityContext } from "react-unity-webgl";
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { toast } from 'react-hot-toast';
import { Car } from '../types/car';

export function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const { data: account } = useAbstraxionAccount();
  const [isLoading, setIsLoading] = useState(true);

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data",
    frameworkUrl: "/Build/Build.framework.js",
    codeUrl: "/Build/Build.wasm",
  });

  useEffect(() => {
    // Verificar si hay un carro seleccionado en el state
    const carData = location.state?.selectedCar;
    if (carData) {
      setSelectedCar(carData);
    } else {
      toast.error('No car selected');
      navigate('/profile');
    }
  }, [location, navigate]);

  useEffect(() => {
    // Cuando Unity está cargado y tenemos los datos del carro, enviarlos
    if (isLoaded && selectedCar) {
      console.log('🎮 Sending car data to Unity:', selectedCar);
      
      // Enviar datos básicos del carro
      sendMessage("GameController", "SetCarStats", JSON.stringify({
        carId: selectedCar.car_id,
        speed: selectedCar.total_stats.speed,
        maxSpeed: selectedCar.total_stats.max_speed,
        acceleration: selectedCar.total_stats.acceleration,
        handling: selectedCar.total_stats.handling,
        driftFactor: selectedCar.total_stats.drift_factor,
        turnFactor: selectedCar.total_stats.turn_factor
      }));

      // Enviar datos de las partes equipadas
      selectedCar.parts.forEach(part => {
        if (part) {
          sendMessage("GameController", "SetPartStats", JSON.stringify({
            partId: part.part_id,
            partType: part.part_type,
            stats: part.stats
          }));
        }
      });

      setIsLoading(false);
    }
  }, [isLoaded, selectedCar, sendMessage]);

  // Verificar que el usuario esté conectado
  useEffect(() => {
    if (!account?.bech32Address) {
      toast.error('Please connect your wallet first');
      navigate('/profile');
    }
  }, [account, navigate]);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#0f172a'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#f44336' }} />
        <Typography variant="h6" color="white" sx={{ mt: 2 }}>
          Loading Game ({Math.round(loadingProgression * 100)}%)
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', backgroundColor: '#0f172a' }}>
      <Unity 
        unityProvider={unityProvider} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#0f172a'
        }}
      />
      <Button
        variant="contained"
        onClick={() => navigate('/profile')}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
          boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
        }}
      >
        Back to Profile
      </Button>
    </Box>
  );
} 