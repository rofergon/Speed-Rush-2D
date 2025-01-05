import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../types/car';
import { Speedometer } from '../components/Speedometer';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { Search, Filter, SortDesc, Car as CarIcon, Info, Gamepad2, Wrench } from 'lucide-react';
import { Background } from '../components/Background';
import { marketplaceService } from '../services/marketplaceService';
import { toast } from 'react-hot-toast';

// Mock cars for sale
const mockCars: Car[] = [
  {
    id: '1',
    carImageURI: '/car1.png',
    combinedStats: {
      speed: 85,
      acceleration: 75,
      handling: 80,
      driftFactor: 70,
      turnFactor: 65,
      maxSpeed: 200
    },
    parts: [],
    price: 0.01, // GRASS
    seller: '0x1234...5678',
    condition: 100,
    listedAt: new Date().getTime()
  },
  {
    id: '2',
    carImageURI: '/car2.png',
    combinedStats: {
      speed: 90,
      acceleration: 85,
      handling: 70,
      driftFactor: 75,
      turnFactor: 60,
      maxSpeed: 220
    },
    parts: [],
    price: 0.015,
    seller: '0x8765...4321',
    condition: 85,
    listedAt: new Date().getTime() - 86400000
  },
  {
    id: '3',
    carImageURI: '/car3.png',
    combinedStats: {
      speed: 95,
      acceleration: 90,
      handling: 85,
      driftFactor: 80,
      turnFactor: 75,
      maxSpeed: 240
    },
    parts: [],
    price: 0.02,
    seller: '0x9876...1234',
    condition: 95,
    listedAt: new Date().getTime() - 172800000
  }
];

type SortOption = 'price-asc' | 'price-desc' | 'condition-desc' | 'recent';
type FilterOption = 'all' | 'high-speed' | 'high-handling' | 'perfect-condition';

export function MarketplacePage() {
  const { isConnected, address } = useAccount();
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showMyListings, setShowMyListings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadMarketplaceData();
    }
  }, [isConnected, address]);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      const listedCars = await marketplaceService.getListedCars();
      setCars(listedCars);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast.error('Error loading marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCar = async (carId: string, price: number) => {
    try {
      setIsLoading(true);
      await marketplaceService.buyCar(carId, price);
      toast.success('Car purchased successfully!');
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error buying car:', error);
      toast.error('Error buying car');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListCar = async (carId: string, price: number, includeSlots: boolean[]) => {
    try {
      setIsLoading(true);
      await marketplaceService.listCar(carId, price, includeSlots);
      toast.success('Car listed successfully!');
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error listing car:', error);
      toast.error('Error listing car');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelListing = async (carId: string) => {
    try {
      setIsLoading(true);
      await marketplaceService.cancelCarListing(carId);
      toast.success('Listing cancelled successfully!');
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Error cancelling listing');
    } finally {
      setIsLoading(false);
    }
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
      console.error('Error calculating statistics:', error);
      return 0;
    }
  };

  const filteredCars = cars
    .filter(car => {
      if (showMyListings && car.seller !== address) return false;
      if (searchTerm && !car.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      switch (filterBy) {
        case 'high-speed':
          return car.combinedStats.speed >= 90;
        case 'high-handling':
          return car.combinedStats.handling >= 80;
        case 'perfect-condition':
          return car.condition === 100;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'condition-desc':
          return (b.condition || 0) - (a.condition || 0);
        case 'recent':
          return (b.listedAt || 0) - (a.listedAt || 0);
        default:
          return 0;
      }
    });

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
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to Access the Market</h2>
              <p className="text-gray-400 mb-8">You need to connect your wallet to buy and sell vehicles</p>
              <ConnectKitButton />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Info className="w-4 h-4" />
                      <span className="text-sm">The prices are in GRASS, the native token of the game</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMyListings(!showMyListings)}
                    className={`${
                      showMyListings ? 'bg-red-600' : 'bg-gray-700'
                    } hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4 md:mt-0`}
                  >
                    {showMyListings ? 'View All' : 'My Listings'}
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Sort by */}
                  <div className="relative">
                    <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="condition-desc">Best Condition</option>
                    </select>
                  </div>

                  {/* Filter by */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                    >
                      <option value="all">All Cars</option>
                      <option value="high-speed">High Speed</option>
                      <option value="high-handling">High Handling</option>
                      <option value="perfect-condition">Perfect Condition</option>
                    </select>
                  </div>

                  {/* List Car Button */}
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <CarIcon className="w-5 h-5" />
                    <span>List My Car</span>
                  </button>
                </div>
              </div>

              {/* Marketplace Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Listed Cars</h3>
                  <p className="text-2xl font-bold text-white">{cars.length}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Average Price</h3>
                  <p className="text-2xl font-bold text-white">
                    {(cars.reduce((acc, car) => acc + (car.price || 0), 0) / cars.length).toFixed(3)} GRASS
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Best Speed</h3>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(...cars.map(car => car.combinedStats.speed))}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-gray-400 text-sm">Best Handling</h3>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(...cars.map(car => car.combinedStats.handling))}
                  </p>
                </div>
              </div>

              {/* Cars Grid */}
              <div className="bg-gray-800 rounded-lg p-6">
                {isLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading marketplace data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredCars.map((car) => (
                      <div key={car.id} className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={car.carImageURI}
                            alt={`Car ${car.id}`}
                            className="w-full h-48 object-contain rounded-lg mb-4"
                          />
                          <div className="absolute top-2 right-2">
                            <Speedometer value={calculateAverageStats(car)} size={60} />
                          </div>
                          <div className="absolute top-2 left-2 bg-gray-900/80 px-3 py-1 rounded-full">
                            <span className="text-sm text-gray-300">ID: #{car.id}</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <span className="text-gray-400 text-sm">Speed</span>
                              <p className="text-white font-bold">{car.combinedStats?.speed || 0}</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <span className="text-gray-400 text-sm">Acceleration</span>
                              <p className="text-white font-bold">{car.combinedStats?.acceleration || 0}</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <span className="text-gray-400 text-sm">Handling</span>
                              <p className="text-white font-bold">{car.combinedStats?.handling || 0}</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg">
                              <span className="text-gray-400 text-sm">Condition</span>
                              <p className="text-white font-bold">{car.condition}%</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                            <div>
                              <span className="text-gray-400 text-sm">Price</span>
                              <p className="text-white font-bold">{car.price} GRASS</p>
                            </div>
                            {car.seller === address ? (
                              <button 
                                onClick={() => handleCancelListing(car.id)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                            ) : (
                              <button 
                                onClick={() => car.price ? handleBuyCar(car.id, car.price) : null}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                disabled={isLoading || !car.price}
                              >
                                Buy
                              </button>
                            )}
                          </div>

                          <div className="text-sm text-gray-400">
                            <p>Seller: {car.seller}</p>
                            <p>Listed {Math.floor((new Date().getTime() - (car.listedAt || 0)) / 86400000)} days ago</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GRASS Information */}
              <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-red-600 p-3 rounded-full">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">About GRASS Token</h3>
                    <p className="text-gray-400 mb-4">
                      GRASS is Speed Rush 2D's native token. It is used for:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-2">
                      <li>Buying and selling NFT cars in the marketplace</li>
                      <li>Repairing your cars in the workshop</li>
                      <li>Minting new cars</li>
                      <li>Participating in special events</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 