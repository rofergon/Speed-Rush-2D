import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { PartDetailsDialog } from './PartDetailsDialog';
import { activeCarService } from '../services/activeCarService';
import { Car, Part } from '../types/car';
import { useNavigate } from 'react-router-dom';

export function CarGallery() {
  const { address } = useAccount();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [activeCar, setActiveCar] = useState<Car | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (address) {
      loadCars();
      const storedActiveCar = activeCarService.getActiveCar();
      if (storedActiveCar) {
        setActiveCar(storedActiveCar);
      }
    }
  }, [address]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const userCars = await web3Service.getUserCars(address!);
      setCars(userCars);
    } catch (err) {
      console.error('Error loading cars:', err);
      setError('Error cargando los carros');
    } finally {
      setLoading(false);
    }
  };

  const handlePartClick = (part: Part) => {
    setSelectedPart(part);
  };

  const handleSelectCar = (car: Car) => {
    activeCarService.setActiveCar(car);
    setActiveCar(car);
  };

  const handlePlayWithCar = () => {
    if (activeCar) {
      navigate('/game');
    }
  };

  const renderParts = (car: Car) => {
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-white mb-2">Partes:</h4>
        <div className="grid grid-cols-3 gap-4">
          {car.parts.map((part) => (
            <div
              key={part.partId}
              onClick={() => handlePartClick(part)}
              className="bg-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            >
              <img
                src={part.imageURI}
                alt={`Part ${part.partId}`}
                className="w-full h-24 object-contain rounded-lg mb-2"
              />
              <div className="text-sm text-center text-gray-300">
                {part.partType === 0 ? "Motor" :
                 part.partType === 1 ? "Transmisión" :
                 part.partType === 2 ? "Ruedas" : "Desconocido"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!address) {
    return (
      <div className="text-center text-gray-400 py-8">
        Por favor, conecta tu wallet para ver tus carros
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        Cargando carros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No tienes carros todavía
      </div>
    );
  }

  return (
    <div>
      {activeCar && (
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Carro Seleccionado</h3>
          <div className="flex items-center space-x-6">
            <img
              src={activeCar.carImageURI}
              alt={`Car ${activeCar.id}`}
              className="w-48 h-32 object-contain rounded-lg"
            />
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-400">Velocidad:</span> {activeCar.combinedStats.speed}
                </div>
                <div>
                  <span className="text-gray-400">Aceleración:</span> {activeCar.combinedStats.acceleration}
                </div>
                <div>
                  <span className="text-gray-400">Manejo:</span> {activeCar.combinedStats.handling}
                </div>
              </div>
            </div>
            <button
              onClick={handlePlayWithCar}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Jugar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <div key={car.id} className="bg-gray-800 rounded-lg p-6">
            <img
              src={car.carImageURI}
              alt={`Car ${car.id}`}
              className="w-full h-48 object-contain rounded-lg mb-4"
            />
            
            <div className="text-white mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Car #{car.id}</h3>
                <button
                  onClick={() => handleSelectCar(car)}
                  className={`px-4 py-2 rounded-lg font-bold ${
                    activeCar?.id === car.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {activeCar?.id === car.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Velocidad:</span> {car.combinedStats.speed}
                </div>
                <div>
                  <span className="text-gray-400">Aceleración:</span> {car.combinedStats.acceleration}
                </div>
                <div>
                  <span className="text-gray-400">Manejo:</span> {car.combinedStats.handling}
                </div>
                <div>
                  <span className="text-gray-400">Drift:</span> {car.combinedStats.driftFactor}
                </div>
                <div>
                  <span className="text-gray-400">Giro:</span> {car.combinedStats.turnFactor}
                </div>
                <div>
                  <span className="text-gray-400">Vel. Máx:</span> {car.combinedStats.maxSpeed}
                </div>
              </div>
            </div>

            {renderParts(car)}
          </div>
        ))}

        <PartDetailsDialog
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
        />
      </div>
    </div>
  );
} 