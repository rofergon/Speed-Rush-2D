import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { CarGallery } from '../components/CarGallery';
import { Background } from '../components/Background';
import { MintCarButton } from '../components/MintCarButton';
import { Gamepad2, Car as CarIcon, Wrench, RefreshCw } from 'lucide-react';
import { activeCarService } from '../services/activeCarService';

export function ProfilePage() {
  const { isConnected } = useAccount();
  const [isAlternativeSkin, setIsAlternativeSkin] = useState(false);

  const handleSkinChange = (newSkinState: boolean) => {
    setIsAlternativeSkin(newSkinState);
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
                  {/* Skin change button */}
                  <button
                    onClick={() => handleSkinChange(!isAlternativeSkin)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>{isAlternativeSkin ? 'Use Main Skin' : 'Use Core Skin'}</span>
                  </button>
                </div>
              </div>

              {/* Mint Button */}
              <div className="w-full flex justify-center my-6">
                <MintCarButton />
              </div>

              {/* Cars Grid */}
              <div className="w-full">
                <CarGallery 
                  alternativeSkin={isAlternativeSkin} 
                  onSkinChange={handleSkinChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 