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
        setError('Error cargando las partes. Por favor intenta de nuevo.');
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (isConnected) {
      loadParts();
    }
  }, [isConnected, address]);

  const handleCarSelect = async (car: { id: string; parts: Part[] }) => {
    setSelectedCar(car);
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
          setSelectedCar({
            ...selectedCar,
            parts: updatedCarParts
          });
        }
      }
    } catch (error) {
      console.error('Error equipando parte:', error);
      setError('Error al equipar la parte. Por favor intenta de nuevo.');
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
          setSelectedCar({
            ...selectedCar,
            parts: updatedCarParts
          });
        }
      }
    } catch (error) {
      console.error('Error desequipando parte:', error);
      setError('Error al desequipar la parte. Por favor intenta de nuevo.');
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
              <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet para Ver tu Garage</h2>
              <p className="text-gray-400 mb-8">Necesitas conectar tu wallet para ver y administrar tus vehículos</p>
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