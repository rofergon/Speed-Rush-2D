import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { CarGallery } from '../components/CarGallery';
import { Background } from '../components/Background';
import { MintCarButton } from '../components/MintCarButton';
import { MintPriceDebug } from '../components/MintPriceDebug';
import { PartsInventory } from '../components/PartsInventory';
import { Gamepad2, Car as CarIcon, Wrench, RefreshCw } from 'lucide-react';
import { Part } from '../types/parts';
import { partsService } from '../services/partsService';
import { web3Service } from '../services/web3Service';
import { activeCarService } from '../services/activeCarService';
import { Car } from '../types/car';

export function ProfilePage() {
  const { isConnected, address } = useAccount();
  const [isAlternativeSkin, setIsAlternativeSkin] = useState(false);
  const [activeTab, setActiveTab] = useState<'cars' | 'parts'>('cars');
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkinChange = (newSkinState: boolean) => {
    setIsAlternativeSkin(newSkinState);
  };

  useEffect(() => {
    const loadParts = async () => {
      if (!address) return;
      try {
        setIsLoadingParts(true);
        setError(null);
        const userParts = await partsService.getUserParts(address);
        setParts(userParts);
      } catch (error) {
        console.error('Error loading parts:', error);
        setError('Error loading parts. Please try again.');
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (isConnected) {
      loadParts();
    }
  }, [isConnected, address]);

  const handleCarSelect = async (car: Car) => {
    try {
      // Obtener los datos actualizados del carro
      const updatedCarParts = await web3Service.getCarParts(car.id);
      const updatedCar = {
        ...car,
        parts: updatedCarParts
      };
      setSelectedCar(updatedCar);
      activeCarService.setActiveCar(updatedCar);
    } catch (error) {
      console.error('Error selecting car:', error);
      setError('Error selecting car. Please try again.');
    }
  };

  const handleEquipPart = async (partId: string, carId: string, slotIndex: number) => {
    try {
      setError(null);
      await web3Service.equipPart(carId, partId, slotIndex);
      if (address) {
        const userParts = await partsService.getUserParts(address);
        setParts(userParts);
        if (selectedCar) {
          const updatedCarParts = await web3Service.getCarParts(selectedCar.id);
          const updatedCar = {
            ...selectedCar,
            parts: updatedCarParts
          };
          setSelectedCar(updatedCar);
          const activeCar = activeCarService.getActiveCar();
          if (activeCar && activeCar.id === selectedCar.id) {
            activeCarService.setActiveCar(updatedCar);
          }
        }
      }
    } catch (error) {
      console.error('Error equipping part:', error);
      setError('Error equipping part. Please try again.');
    }
  };

  const handleUnequipPart = async (partId: string, carId: string) => {
    try {
      setError(null);
      await web3Service.unequipPart(carId, partId);
      if (address) {
        const userParts = await partsService.getUserParts(address);
        setParts(userParts);
        if (selectedCar) {
          const updatedCarParts = await web3Service.getCarParts(selectedCar.id);
          const updatedCar = {
            ...selectedCar,
            parts: updatedCarParts
          };
          setSelectedCar(updatedCar);
          const activeCar = activeCarService.getActiveCar();
          if (activeCar && activeCar.id === selectedCar.id) {
            activeCarService.setActiveCar(updatedCar);
          }
        }
      }
    } catch (error) {
      console.error('Error unequipping part:', error);
      setError('Error unequipping part. Please try again.');
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen text-white relative z-10">
        {/* Navbar */}
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-[98%] mx-auto px-4">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
                  <span className="text-xl font-bold">Speed Rush 2D</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/game" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  <Gamepad2 className="inline-block w-5 h-5 mr-1" />
                  Play
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  <Wrench className="inline-block w-5 h-5 mr-1" />
                  Garage
                </Link>
                <Link to="/marketplace" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                  <CarIcon className="inline-block w-5 h-5 mr-1" />
                  Market
                </Link>
                <ConnectKitButton />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-[98%] mx-auto px-4 py-8">
          {!isConnected ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to View Your Garage</h2>
              <p className="text-gray-400 mb-8">You need to connect your wallet to view and manage your vehicles</p>
              <ConnectKitButton />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">My Garage</h1>
                    <p className="text-gray-400">Manage and customize your NFT vehicles</p>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'cars'
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('cars')}
                >
                  My Cars
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'parts'
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('parts')}
                >
                  My Parts
                </button>
              </div>

              {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Tab Content */}
              {activeTab === 'cars' ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                      <MintCarButton />
                      <MintPriceDebug />
                    </div>
                    <div className="flex gap-4">
                      {selectedCar && (
                        <Link 
                          to="/game"
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Gamepad2 className="w-5 h-5" />
                          Play with this car
                        </Link>
                      )}
                      <button
                        onClick={() => handleSkinChange(!isAlternativeSkin)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        {isAlternativeSkin ? 'Use Main Skin' : 'Use Core Skin'}
                      </button>
                    </div>
                  </div>
                  <CarGallery 
                    alternativeSkin={isAlternativeSkin} 
                    onSkinChange={handleSkinChange}
                    onSelectCar={handleCarSelect}
                  />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6">
                  <PartsInventory
                    parts={parts}
                    selectedCar={selectedCar}
                    onEquipPart={handleEquipPart}
                    onUnequipPart={handleUnequipPart}
                    isLoading={isLoadingParts}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 