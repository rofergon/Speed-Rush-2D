import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Home, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { carStorage, StoredCar } from '../services/carStorage';

export function ProfilePage() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const [cars, setCars] = useState<StoredCar[]>([]);

  useEffect(() => {
    if (address) {
      const userCars = carStorage.getCars(address);
      setCars(userCars.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, [address]);

  const renderCarCard = (car: StoredCar) => {
    const traits = car.metadata.traits;
    return (
      <div key={car.id} className="bg-gray-800 rounded-lg overflow-hidden flex flex-col">
        <div className="relative pt-[100%] w-full bg-gray-900">
          <img 
            src={car.imageUrl} 
            alt={`Car NFT ${car.id}`}
            className="absolute inset-0 w-full h-full object-contain p-2"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Car #{car.id}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="text-gray-400">Speed</div>
            <div className="text-white font-medium">{traits.speed.toFixed(1)}</div>
            <div className="text-gray-400">Acceleration</div>
            <div className="text-white font-medium">{traits.acceleration.toFixed(1)}</div>
            <div className="text-gray-400">Handling</div>
            <div className="text-white font-medium">{traits.handling.toFixed(1)}</div>
            <div className="text-gray-400">Drift Factor</div>
            <div className="text-white font-medium">{traits.drift_factor.toFixed(1)}</div>
            <div className="text-gray-400">Turn Factor</div>
            <div className="text-white font-medium">{traits.turn_factor.toFixed(1)}</div>
            <div className="text-gray-400">Max Speed</div>
            <div className="text-white font-medium">{traits.max_speed.toFixed(1)}</div>
          </div>
          <div className="mt-auto flex space-x-2">
            <button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={() => navigate('/game')}
            >
              Race
            </button>
            <button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              onClick={() => {
                if (address && window.confirm('Are you sure you want to remove this car?')) {
                  carStorage.deleteCar(address, car.id);
                  setCars(cars.filter(c => c.id !== car.id));
                }
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to View Profile</h2>
            <ConnectKitButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-white"
            >
              <Home className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">My Garage</h1>
          </div>
          <ConnectKitButton />
        </div>

        {/* Profile Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Wallet</h2>
              <p className="text-gray-400">{address}</p>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">My Cars ({cars.length})</h2>
          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(renderCarCard)}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <Car className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No cars generated yet</p>
              <Link 
                to="/"
                className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full"
              >
                Generate Your First Car
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 