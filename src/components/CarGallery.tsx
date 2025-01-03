import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { PartDetailsDialog } from './PartDetailsDialog';
import { activeCarService } from '../services/activeCarService';
import { Car, Part } from '../types/car';
import { useNavigate } from 'react-router-dom';
import { Speedometer } from './Speedometer';

interface CarGalleryProps {
  alternativeSkin?: boolean;
  onSkinChange?: (newSkin: boolean) => void;
}

export function CarGallery({ alternativeSkin = false, onSkinChange }: CarGalleryProps) {
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

  useEffect(() => {
    const storedActiveCar = activeCarService.getActiveCar();
    if (storedActiveCar) {
      setActiveCar(storedActiveCar);
    }
  }, [alternativeSkin]);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userCars = await web3Service.getUserCars(address!);
      
      const validCars = userCars.filter(car => {
        try {
          if (!car || !car.id || !car.carImageURI || !car.parts) {
            return false;
          }

          if (car.combinedStats) {
            const stats = [
              car.combinedStats.speed,
              car.combinedStats.acceleration,
              car.combinedStats.handling,
              car.combinedStats.driftFactor,
              car.combinedStats.turnFactor,
              car.combinedStats.maxSpeed
            ];

            const hasInvalidStats = stats.some(stat => 
              stat === undefined || 
              stat === null || 
              (typeof stat === 'number' && isNaN(stat))
            );

            if (hasInvalidStats) {
              return true;
            }
          }

          return true;
        } catch {
          return false;
        }
      });

      if (validCars.length === 0) {
        setError('No valid cars found in your collection.');
        return;
      }

      setCars(validCars);
      
      const storedActiveCar = activeCarService.getActiveCar();
      if (storedActiveCar && !validCars.find(car => car.id === storedActiveCar.id)) {
        handleSelectCar(validCars[0]);
      }
    } catch (err) {
      setError('Error loading cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartClick = (part: Part, car: Car) => {
    if (part.partType === 2) {
      const newSkinState = !alternativeSkin;
      const carWithNewSkin = {
        ...car,
        displayImageURI: newSkinState ? part.imageURI : car.carImageURI
      };
      activeCarService.setActiveCar(carWithNewSkin);
      setActiveCar(carWithNewSkin);
      if (typeof onSkinChange === 'function') {
        onSkinChange(newSkinState);
      }
    } else {
      setSelectedPart(part);
    }
  };

  const handleSelectCar = (car: Car) => {
    const carWithCorrectSkin = {
      ...car,
      displayImageURI: alternativeSkin ? car.parts[2]?.imageURI : car.carImageURI
    };
    activeCarService.setActiveCar(carWithCorrectSkin);
    setActiveCar(carWithCorrectSkin);
  };

  const handlePlayWithCar = () => {
    if (activeCar) {
      navigate('/game');
    }
  };

  const renderParts = (car: Car) => {
    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-white mb-2">Parts:</h4>
        <div className="grid grid-cols-3 gap-4">
          {car.parts.map((part) => (
            <div
              key={part.partId}
              onClick={() => handlePartClick(part, car)}
              className={`bg-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors relative ${
                alternativeSkin && part.partType === 2 ? 'ring-2 ring-green-500' : ''
              } ${part.partType === 2 ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
            >
              <img
                src={part.imageURI}
                alt={`Part ${part.partId}`}
                className="w-full h-24 object-contain rounded-lg mb-2"
              />
              <div className="text-sm text-center text-gray-300">
                {part.partType === 0 ? "Engine" :
                 part.partType === 1 ? "Transmission" :
                 part.partType === 2 ? "Core" : "Unknown"}
              </div>
              {alternativeSkin && part.partType === 2 && (
                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              )}
              {part.partType === 2 && (
                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                  Click to change skin
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateAverageStats = (car: Car) => {
    try {
      const stats = car.combinedStats || {};
      const validStats = [
        stats.speed,
        stats.acceleration,
        stats.handling
      ].filter(stat => typeof stat === 'number' && !isNaN(stat));
      
      if (validStats.length === 0) return 0;
      
      const total = validStats.reduce((sum, stat) => sum + stat, 0);
      return Math.round(total / validStats.length);
    } catch {
      return 0;
    }
  };

  const renderStats = (stats: any) => {
    if (!stats) return '0';
    return typeof stats === 'number' ? stats.toString() : '0';
  };

  const getCarImage = (car: Car) => {
    return alternativeSkin ? car.parts[2]?.imageURI : car.carImageURI;
  };

  if (!address) {
    return (
      <div className="text-center text-gray-400 py-8">
        Please connect your wallet to view your cars
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        Loading cars...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadCars()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        You don't have any cars yet
      </div>
    );
  }

  return (
    <div className="w-full">
      {activeCar && (
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Selected Car</h3>
              <p className="text-sm text-gray-400">
                {alternativeSkin ? 'Using Core skin' : 'Using Main skin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayWithCar}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Play
              </button>
              <Speedometer value={calculateAverageStats(activeCar)} size={60} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/5 xl:w-1/3 relative">
              <img
                src={getCarImage(activeCar)}
                alt={`Car ${activeCar.id}`}
                className="w-full h-auto object-contain rounded-lg"
              />
              {alternativeSkin && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full">
                  Core Skin
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Speed</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.speed) || 0} size={120} />
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Acceleration</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.acceleration) || 0} size={120} />
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Handling</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.handling) || 0} size={120} />
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Drift</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.driftFactor) || 0} size={120} />
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Turn</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.turnFactor) || 0} size={120} />
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                <span className="text-gray-400 block mb-4">Max Speed</span>
                <div className="flex items-center justify-center">
                  <Speedometer value={Number(activeCar.combinedStats?.maxSpeed) || 0} size={120} />
                </div>
              </div>
            </div>
          </div>

          {renderParts(activeCar)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
              activeCar?.id === car.id ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleSelectCar(car)}
          >
            <div className="relative">
              <img
                src={getCarImage(car)}
                alt={`Car ${car.id}`}
                className="w-full h-48 object-contain rounded-lg mb-4"
              />
              <div className="absolute top-2 right-2">
                <Speedometer value={calculateAverageStats(car)} size={60} />
              </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Car #{car.id}</h3>
              <Speedometer value={calculateAverageStats(car)} size={50} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400 block">Speed</span>
                <span className="text-xl font-bold">{renderStats(car.combinedStats?.speed)}</span>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400 block">Acceleration</span>
                <span className="text-xl font-bold">{renderStats(car.combinedStats?.acceleration)}</span>
              </div>
            </div>

            <button
              onClick={() => handleSelectCar(car)}
              className={`w-full px-4 py-2 rounded-lg font-bold ${
                activeCar?.id === car.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {activeCar?.id === car.id ? 'Selected' : 'Select'}
            </button>

            {renderParts(car)}
          </div>
        ))}
      </div>

      {selectedPart && (
        <PartDetailsDialog
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
} 