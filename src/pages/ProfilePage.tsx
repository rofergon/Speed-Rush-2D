import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { XionConnectButton } from '../components/XionConnectButton';
import { CarGallery } from '../components/CarGallery';
import { Background } from '../components/Background';
import { MintCarButton } from '../components/MintCarButton';
import { PartsInventory } from '../components/PartsInventory';
import { Gamepad2, Car as CarIcon, Wrench, RefreshCw } from 'lucide-react';
import { Part } from '../types/parts';
import { partsService } from '../services/partsService';
import { web3Service } from '../services/web3Service';
import { activeCarService } from '../services/activeCarService';
import { Car } from '../types/car';
import { toast } from 'react-hot-toast';
import { Button } from "@burnt-labs/ui";

// Agregar interfaces para el modal de venta
interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: string, includeSlots: boolean[]) => void;
  carParts: Part[];
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, onConfirm, carParts }) => {
  const [price, setPrice] = useState('');
  const [includeSlots, setIncludeSlots] = useState<boolean[]>([false, false, false]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-xl font-bold mb-4">List Car for Sale</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Price (in XION)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="0.01"
            step="0.001"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Include Parts:</label>
          {carParts.map((part, index) => (
            <div key={part.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={includeSlots[index]}
                onChange={(e) => {
                  const newIncludeSlots = [...includeSlots];
                  newIncludeSlots[index] = e.target.checked;
                  setIncludeSlots(newIncludeSlots);
                }}
                className="mr-2"
              />
              <span>{`${part.partType === 0 ? 'Engine' : part.partType === 1 ? 'Transmission' : 'Wheels'}`}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            structure="base"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(price, includeSlots)}
            structure="base"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={!price || parseFloat(price) <= 0}
          >
            List for Sale
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ProfilePage() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isAlternativeSkin, setIsAlternativeSkin] = useState(false);
  const [activeTab, setActiveTab] = useState<'cars' | 'parts'>('cars');
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedCarForSale, setSelectedCarForSale] = useState<Car | null>(null);
  const [listedCars, setListedCars] = useState<Set<string>>(new Set());

  const handleSkinChange = (newSkinState: boolean) => {
    setIsAlternativeSkin(newSkinState);
  };

  useEffect(() => {
    const loadParts = async () => {
      if (!account.bech32Address) return;
      try {
        setIsLoadingParts(true);
        setError(null);
        const userParts = await partsService.getUserParts(account.bech32Address);
        setParts(userParts);
      } catch (error) {
        console.error('Error loading parts:', error);
        setError('Error loading parts. Please try again.');
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (client) {
      loadParts();
    }
  }, [client, account.bech32Address]);

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
      if (account.bech32Address) {
        const userParts = await partsService.getUserParts(account.bech32Address);
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
      if (account.bech32Address) {
        const userParts = await partsService.getUserParts(account.bech32Address);
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

  useEffect(() => {
    const loadListedCars = async () => {
      if (!selectedCar) return;
      try {
        const listing = await web3Service.getCarListing(selectedCar.id);
        if (listing && listing.isActive) {
          setListedCars(prev => new Set([...prev, selectedCar.id]));
        }
      } catch (error) {
        console.error('Error loading car listing:', error);
      }
    };

    loadListedCars();
  }, [selectedCar]);

  const handleSellCar = async (price: string, includeSlots: boolean[]) => {
    if (!selectedCarForSale) return;
    
    try {
      await web3Service.listCarForSale(selectedCarForSale.id, price, includeSlots);
      toast.success('Car listed successfully!');
      setListedCars(prev => new Set([...prev, selectedCarForSale.id]));
    } catch (error) {
      console.error('Error listing car:', error);
      toast.error('Error listing car for sale');
    } finally {
      setSellModalOpen(false);
      setSelectedCarForSale(null);
    }
  };

  const handleCancelListing = async (carId: string) => {
    try {
      await web3Service.cancelCarListing(carId);
      toast.success('Listing cancelled successfully!');
      setListedCars(prev => {
        const newSet = new Set(prev);
        newSet.delete(carId);
        return newSet;
      });
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Error cancelling listing');
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
                <XionConnectButton />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-[98%] mx-auto px-4 py-8">
          {!client ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to View Your Garage</h2>
              <p className="text-gray-400 mb-8">You need to connect your wallet to view and manage your vehicles</p>
              <XionConnectButton />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
                  <div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">My Garage</h1>
                    <p className="text-gray-300 text-lg">Manage and customize your NFT vehicles</p>
                  </div>
                  <div>
                    <MintCarButton />
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b-2 border-gray-700/50 mb-6 bg-gray-800/30 rounded-t-xl p-2">
                <button
                  className={`px-8 py-4 font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'cars'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveTab('cars')}
                >
                  My Vehicles
                </button>
                <button
                  className={`px-8 py-4 font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'parts'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
                    onSellCar={(car) => {
                      setSelectedCarForSale(car);
                      setSellModalOpen(true);
                    }}
                    listedCars={listedCars}
                    onCancelListing={handleCancelListing}
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

      {selectedCarForSale && (
        <SellModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedCarForSale(null);
          }}
          onConfirm={handleSellCar}
          carParts={selectedCarForSale.parts || []}
        />
      )}
    </>
  );
} 