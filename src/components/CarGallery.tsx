import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { PartDetailsDialog } from './PartDetailsDialog';
import { activeCarService } from '../services/activeCarService';
import { Car, Part } from '../types/car';
import { useNavigate } from 'react-router-dom';
import { Speedometer } from './Speedometer';

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
      setError(null);
      
      // Intentamos cargar los carros uno por uno para evitar que un error en uno afecte a los demás
      const userCars = await web3Service.getUserCars(address!);
      console.log('Carros obtenidos:', userCars);
      
      // Filtramos los carros que tienen datos válidos
      const validCars = userCars.filter(car => {
        try {
          // Verificamos que el carro tenga la estructura básica necesaria
          if (!car || !car.id || !car.carImageURI || !car.parts) {
            console.log(`Carro inválido (estructura incompleta):`, car);
            return false;
          }

          // Verificamos que las estadísticas sean válidas
          if (car.combinedStats) {
            const stats = [
              car.combinedStats.speed,
              car.combinedStats.acceleration,
              car.combinedStats.handling,
              car.combinedStats.driftFactor,
              car.combinedStats.turnFactor,
              car.combinedStats.maxSpeed
            ];

            // Si alguna estadística es undefined o NaN, la consideramos como 0
            const hasInvalidStats = stats.some(stat => 
              stat === undefined || 
              stat === null || 
              (typeof stat === 'number' && isNaN(stat))
            );

            if (hasInvalidStats) {
              console.log(`Carro ${car.id} tiene estadísticas inválidas:`, car.combinedStats);
              // Aún así lo incluimos, porque manejaremos las estadísticas inválidas en renderStats
              return true;
            }
          }

          return true;
        } catch (error) {
          console.error(`Error procesando carro ${car?.id}:`, error);
          return false;
        }
      });

      console.log('Carros válidos:', validCars);

      if (validCars.length === 0) {
        setError('No se encontraron carros válidos en tu colección.');
        return;
      }

      setCars(validCars);
      
      // Si hay un carro activo que fue filtrado, seleccionar el primer carro válido
      const storedActiveCar = activeCarService.getActiveCar();
      if (storedActiveCar && !validCars.find(car => car.id === storedActiveCar.id)) {
        handleSelectCar(validCars[0]);
      }
    } catch (err) {
      console.error('Error loading cars:', err);
      setError('Error cargando los carros. Por favor, intenta de nuevo más tarde.');
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
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      return 0;
    }
  };

  const renderStats = (stats: any) => {
    if (!stats) return '0';
    return typeof stats === 'number' ? stats.toString() : '0';
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
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadCars()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Intentar de nuevo
        </button>
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
    <div className="w-full">
      {activeCar && (
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-white">Carro Seleccionado</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayWithCar}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Jugar
              </button>
              <Speedometer value={calculateAverageStats(activeCar)} size={60} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/5 xl:w-1/3">
              <img
                src={activeCar.carImageURI}
                alt={`Car ${activeCar.id}`}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Velocidad:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.speed)}</span>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Aceleración:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.acceleration)}</span>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Manejo:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.handling)}</span>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Drift:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.driftFactor)}</span>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Giro:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.turnFactor)}</span>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-400 block">Vel. Máx:</span>
                <span className="text-2xl font-bold">{renderStats(activeCar.combinedStats?.maxSpeed)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Car #{car.id}</h3>
              <Speedometer value={calculateAverageStats(car)} size={40} />
            </div>

            <div className="relative mb-4">
              <img
                src={car.carImageURI}
                alt={`Car ${car.id}`}
                className="w-full h-48 object-contain rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400 block">Velocidad</span>
                <span className="text-xl font-bold">{renderStats(car.combinedStats?.speed)}</span>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <span className="text-gray-400 block">Aceleración</span>
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
              {activeCar?.id === car.id ? 'Seleccionado' : 'Seleccionar'}
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