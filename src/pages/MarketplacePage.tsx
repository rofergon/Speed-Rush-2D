import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { XionConnectButton } from '../components/XionConnectButton';
import { Background } from '../components/Background';
import { Gamepad2, Car as CarIcon, Wrench } from 'lucide-react';
import { web3Service } from '../services/web3Service';
import { Car } from '../types/car';
import { toast } from 'react-hot-toast';
import { Button } from "@burnt-labs/ui";
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { MarketplaceCarCard } from '../components/MarketplaceCarCard';

interface CarListing {
  car: Car;
  price: string;
  seller: string;
  includedSlots: boolean[];
}

export function MarketplacePage() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);

  const loadListings = async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Actualizar esta función cuando actualicemos web3Service para XION
      // const allListings = await web3Service.getAllListings();
      // setListings(allListings);

      // Por ahora, usaremos datos de ejemplo
      setListings([]);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Error cargando listados. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [client]);

  const handleBuy = async (listing: CarListing) => {
    if (!client || !account.bech32Address) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      // TODO: Actualizar esta función cuando actualicemos web3Service para XION
      // await web3Service.buyCar(listing.car.id, listing.price);
      toast.success('¡Carro comprado exitosamente!');
      await loadListings();
    } catch (error) {
      console.error('Error buying car:', error);
      toast.error('Error al comprar el carro');
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
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to Access the Marketplace</h2>
              <p className="text-gray-400 mb-8">You need to connect your wallet to view and buy cars</p>
              <XionConnectButton />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
                  <div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Marketplace</h1>
                    <p className="text-gray-300 text-lg">Buy and sell NFT vehicles</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : listings.length === 0 ? (
                <Box textAlign="center" p={4}>
                  <Typography variant="h6" color="text.secondary">
                    No hay carros listados en el marketplace actualmente.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {listings.map((listing) => (
                    <Grid item xs={12} sm={6} lg={4} key={listing.car.id}>
                      <MarketplaceCarCard
                        listing={listing}
                        onBuy={() => handleBuy(listing)}
                        isOwnListing={listing.seller === account.bech32Address}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 