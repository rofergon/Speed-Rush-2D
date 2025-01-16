import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { XionConnectButton } from '../components/XionConnectButton';
import { CarGallery } from '../components/CarGallery';
import { Background } from '../components/Background';
import { MintCarButton } from '../components/MintCarButton';
import { PartsInventory } from '../components/PartsInventory';
import { CarCard } from '../components/CarCard';
import { Gamepad2, Car as CarIcon, Wrench, RefreshCw } from 'lucide-react';
import { Part } from '../types/parts';
import { partsService } from '../services/partsService';
import { web3Service } from '../services/web3Service';
import { activeCarService } from '../services/activeCarService';
import { xionService } from '../services/xionService';
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
        <h3 className="text-xl font-bold mb-4">Listar Carro para Venta</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Precio (en XION)</label>
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
          <label className="block text-sm font-medium mb-2">Incluir Partes:</label>
          {carParts.map((part, index) => (
            <div key={part.part_id} className="flex items-center mb-2">
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
              <span>{part.part_type}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            structure="base"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(price, includeSlots)}
            structure="base"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={!price || parseFloat(price) <= 0}
          >
            Listar para Venta
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
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedCarForSale, setSelectedCarForSale] = useState<Car | null>(null);
  const [listedCars, setListedCars] = useState<Set<string>>(new Set());

  const handleSkinChange = (newSkinState: boolean) => {
    setIsAlternativeSkin(newSkinState);
  };

  useEffect(() => {
    const loadParts = async () => {
      if (!client || !account.bech32Address) return;
      try {
        setIsLoadingParts(true);
        setError(null);
        const userParts = await partsService.getUserParts(client, account.bech32Address);
        setParts(userParts);
      } catch (error: any) {
        console.error('Error cargando partes:', error);
        setError('Error al cargar las partes. Por favor intenta de nuevo.');
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (client && account.bech32Address) {
      loadParts();
    }
  }, [client, account.bech32Address]);

  const handleCarSelect = async (car: Car) => {
    try {
      // Obtener los datos actualizados del carro
      const updatedCarPart = await partsService.getPartDetails(client!, car.car_id);
      if (updatedCarPart) {
        const updatedCar: Car = {
          car_id: car.car_id,
          car_image_uri: car.car_image_uri,
          parts: [updatedCarPart],
          total_stats: car.total_stats
        };
        setSelectedCar(updatedCar);
        activeCarService.setActiveCar(updatedCar);
      }
    } catch (error) {
      console.error('Error al seleccionar carro:', error);
      setError('Error al seleccionar carro. Por favor intenta de nuevo.');
    }
  };

  const handleEquipPart = async (partId: number, carId: number, slotIndex: number) => {
    try {
      setError(null);
      // TODO: Implementar equipPart en xionService
      if (client && account.bech32Address) {
        const userParts = await partsService.getUserParts(client, account.bech32Address);
        setParts(userParts);
        if (selectedCar) {
          const updatedCarPart = await partsService.getPartDetails(client, selectedCar.car_id);
          if (updatedCarPart) {
            const updatedCar: Car = {
              car_id: selectedCar.car_id,
              car_image_uri: selectedCar.car_image_uri,
              parts: [updatedCarPart],
              total_stats: selectedCar.total_stats
            };
            setSelectedCar(updatedCar);
            activeCarService.setActiveCar(updatedCar);
          }
        }
      }
    } catch (error) {
      console.error('Error equipando parte:', error);
      setError('Error al equipar la parte. Por favor intenta de nuevo.');
    }
  };

  const handleUnequipPart = async (partId: number, carId: number) => {
    try {
      setError(null);
      // TODO: Implementar unequipPart en xionService
      if (client && account.bech32Address) {
        const userParts = await partsService.getUserParts(client, account.bech32Address);
        setParts(userParts);
        if (selectedCar) {
          const updatedCarPart = await partsService.getPartDetails(client, selectedCar.car_id);
          if (updatedCarPart) {
            const updatedCar: Car = {
              car_id: selectedCar.car_id,
              car_image_uri: selectedCar.car_image_uri,
              parts: [updatedCarPart],
              total_stats: selectedCar.total_stats
            };
            setSelectedCar(updatedCar);
            activeCarService.setActiveCar(updatedCar);
          }
        }
      }
    } catch (error) {
      console.error('Error desequipando parte:', error);
      setError('Error al desequipar la parte. Por favor intenta de nuevo.');
    }
  };

  useEffect(() => {
    const loadListedCars = async () => {
      if (!selectedCar) return;
      try {
        const listing = await web3Service.getCarListing(selectedCar.car_id.toString());
        if (listing && listing.isActive) {
          setListedCars(prev => new Set([...prev, selectedCar.car_id.toString()]));
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
      // TODO: Implementar listCarForSale en xionService
      toast.success('¡Carro listado exitosamente!');
      setListedCars(prev => new Set([...prev, selectedCarForSale.car_id.toString()]));
    } catch (error) {
      console.error('Error listando carro:', error);
      toast.error('Error al listar el carro para venta');
    } finally {
      setSellModalOpen(false);
      setSelectedCarForSale(null);
    }
  };

  const handleCancelListing = async (carId: string) => {
    try {
      // TODO: Implementar cancelCarListing en xionService
      toast.success('¡Listado cancelado exitosamente!');
      setListedCars(prev => {
        const newSet = new Set(prev);
        newSet.delete(carId);
        return newSet;
      });
    } catch (error) {
      console.error('Error cancelando listado:', error);
      toast.error('Error al cancelar el listado');
    }
  };

  useEffect(() => {
    const loadUserCars = async () => {
      if (!client || !account.bech32Address) return;
      
      try {
        setIsLoadingCars(true);
        setError(null);
        const cars = await xionService.getUserCars(client, account.bech32Address);
        setUserCars(cars);
      } catch (error: any) {
        console.error('Error cargando carros:', error);
        setError('Error al cargar los carros. Por favor intenta de nuevo.');
      } finally {
        setIsLoadingCars(false);
      }
    };

    if (client && account.bech32Address) {
      loadUserCars();
    }
  }, [client, account.bech32Address]);

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

        <main className="container mx-auto px-4 py-8">
          {!account.bech32Address ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Conecta tu wallet para ver tu perfil</h2>
              <XionConnectButton />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Mi Perfil</h1>
                  <p className="text-gray-400">Wallet: {account.bech32Address}</p>
                </div>
                <MintCarButton />
              </div>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('cars')}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    activeTab === 'cars' ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                >
                  <CarIcon className="mr-2" />
                  Mis Carros
                </button>
                <button
                  onClick={() => setActiveTab('parts')}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    activeTab === 'parts' ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                >
                  <Wrench className="mr-2" />
                  Partes
                </button>
              </div>

              {error && (
                <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {activeTab === 'cars' ? (
                isLoadingCars ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
                    <p>Cargando carros...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCars.map((car) => (
                      <CarCard
                        key={car.car_id}
                        car={car}
                        onCancelListing={
                          listedCars.has(car.car_id.toString())
                            ? () => handleCancelListing(car.car_id.toString())
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )
              ) : (
                <PartsInventory
                  parts={parts}
                  isLoading={isLoadingParts}
                  selectedCar={selectedCar}
                  onEquipPart={handleEquipPart}
                  onUnequipPart={handleUnequipPart}
                />
              )}
            </>
          )}
        </main>
      </div>

      <SellModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setSelectedCarForSale(null);
        }}
        onConfirm={handleSellCar}
        carParts={selectedCarForSale?.parts || []}
      />
    </>
  );
} 