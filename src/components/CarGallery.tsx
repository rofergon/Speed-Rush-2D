import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { web3Service, CarMetadata } from '../services/web3Service';

export function CarGallery() {
  const [cars, setCars] = useState<CarMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const loadCars = async () => {
      if (!address) return;
      
      try {
        setIsLoading(true);
        const userCars = await web3Service.getUserCars(address);
        setCars(userCars);
      } catch (err) {
        console.error('Error loading cars:', err);
        setError(err instanceof Error ? err.message : 'Error loading cars');
      } finally {
        setIsLoading(false);
      }
    };

    loadCars();
  }, [address]);

  if (!address) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Conecta tu wallet para ver tus carros</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Cargando carros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No tienes carros NFT todavía</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <div key={car.carId} className="bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={car.carImageURI}
            alt={`Car #${car.carId}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">Car #{car.carId}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Velocidad:</span>
                <span className="ml-2">{car.combinedStats.speed}</span>
              </div>
              <div>
                <span className="text-gray-400">Aceleración:</span>
                <span className="ml-2">{car.combinedStats.acceleration}</span>
              </div>
              <div>
                <span className="text-gray-400">Manejo:</span>
                <span className="ml-2">{car.combinedStats.handling}</span>
              </div>
              <div>
                <span className="text-gray-400">Drift:</span>
                <span className="ml-2">{car.combinedStats.driftFactor}</span>
              </div>
              <div>
                <span className="text-gray-400">Giro:</span>
                <span className="ml-2">{car.combinedStats.turnFactor}</span>
              </div>
              <div>
                <span className="text-gray-400">Vel. Máx:</span>
                <span className="ml-2">{car.combinedStats.maxSpeed}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Partes:</h4>
              <div className="space-y-2">
                {car.parts.map((part, index) => (
                  <div key={part.partId} className="flex items-center">
                    <img
                      src={part.imageURI}
                      alt={`Part ${part.partId}`}
                      className="w-8 h-8 rounded mr-2"
                    />
                    <span>
                      {part.partType === 0 ? 'Motor' :
                       part.partType === 1 ? 'Transmisión' : 'Ruedas'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-gray-400 text-sm">
                Condición: {car.condition}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 