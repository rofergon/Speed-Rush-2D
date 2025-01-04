import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { CarGallery } from '../components/CarGallery';
import { Background } from '../components/Background';
import { MintCarButton } from '../components/MintCarButton';
import { PartsInventory } from '../components/PartsInventory';
import { Gamepad2, Car as CarIcon, Wrench, RefreshCw, Grid } from 'lucide-react';
import { activeCarService } from '../services/activeCarService';
import { partsService, type Part } from '../services/partsService';

export function ProfilePage() {
  const { isConnected, address } = useAccount();
  const [isAlternativeSkin, setIsAlternativeSkin] = useState(false);
  const [activeTab, setActiveTab] = useState<'cars' | 'parts'>('cars');
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedCar, setSelectedCar] = useState<{ id: string; parts: Part[] } | undefined>();
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkinChange = (newSkinState: boolean) => {
    setIsAlternativeSkin(newSkinState);
  };

  // Load user parts
  useEffect(() => {
    const loadParts = async () => {
      if (!address) return;
      
      try {
        setIsLoadingParts(true);
        setError(null);
        const userParts = await partsService.getUserParts(address);
        setParts(userParts);
      } catch (err) {
        console.error('Error loading parts:', err);
        setError('Error loading parts. Please try again.');
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (isConnected) {
      loadParts();
    }
  }, [isConnected, address]);

  const handleEquipPart = async (partId: string, carId: string) => {
    try {
      setError(null);
      await partsService.equipPart(partId, carId);
      if (address) {
        const updatedParts = await partsService.getUserParts(address);
        setParts(updatedParts);
      }
    } catch (err) {
      console.error('Error equipping part:', err);
      setError('Error equipping part. Please try again.');
    }
  };

  const handleUnequipPart = async (partId: string, carId: string) => {
    try {
      setError(null);
      await partsService.unequipPart(partId, carId);
      if (address) {
        const updatedParts = await partsService.getUserParts(address);
        setParts(updatedParts);
      }
    } catch (err) {
      console.error('Error unequipping part:', err);
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
                    <h1 className="text-3xl font-bold mb-2">Mi Garage</h1>
                    <p className="text-gray-400">Administra y personaliza tus vehículos NFT</p>
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
                  Mis Carros
                </button>
                <button
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'parts'
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('parts')}
                >
                  Mis Partes
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'cars' ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <MintCarButton />
                    <button
                      onClick={() => handleSkinChange(!isAlternativeSkin)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      {isAlternativeSkin ? 'Usar Skin Principal' : 'Usar Core Skin'}
                    </button>
                  </div>
                  <CarGallery 
                    alternativeSkin={isAlternativeSkin} 
                    onSkinChange={handleSkinChange}
                  />
                </div>
              ) : (
                <PartsInventory
                  parts={parts}
                  selectedCar={selectedCar}
                  onEquipPart={handleEquipPart}
                  onUnequipPart={handleUnequipPart}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 