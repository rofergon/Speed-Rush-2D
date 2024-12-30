import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { CarGallery } from '../components/CarGallery';
import { Header } from '../components/Header';
import { Background } from '../components/Background';

export function ProfilePage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <>
        <Background />
        <div className="min-h-screen text-white relative z-10">
          <div className="container mx-auto px-6 py-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet para Ver tu Perfil</h2>
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Background />
      <div className="min-h-screen text-white relative z-10">
        <div className="container mx-auto px-6 py-6">
          {/* Header con Wallet */}
          <Header />

          {/* Cars Grid */}
          <div className="w-full max-w-[98%] mx-auto">
            <CarGallery />
          </div>
        </div>
      </div>
    </>
  );
} 