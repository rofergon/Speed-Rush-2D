import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Home, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CarGallery } from '../components/CarGallery';

export function ProfilePage() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet para Ver tu Perfil</h2>
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
            <h1 className="text-2xl font-bold">Mi Garage</h1>
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
          <h2 className="text-xl font-bold mb-4">Mis Carros</h2>
          <CarGallery />
        </div>
      </div>
    </div>
  );
} 