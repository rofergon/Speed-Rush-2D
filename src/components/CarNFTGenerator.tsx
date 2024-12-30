import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { web3Service } from '../services/web3Service';
import { generateCarNFT } from '../services/carApi';
import { LoadingSpinner } from './LoadingSpinner';

export function CarNFTGenerator() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCar = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Valores predeterminados
      const defaultPrompt = "A futuristic racing car";
      const defaultStyle = "cartoon";

      // Generar imagen y metadata
      const { imageUrl, metadata } = await generateCarNFT(defaultPrompt, defaultStyle);
      
      // Mintear el NFT
      await web3Service.mintCarNFT(address, imageUrl, metadata);
      
      // Recargar la página para mostrar el nuevo carro
      window.location.reload();
    } catch (err) {
      console.error('Error generating car:', err);
      setError('Error al generar el carro. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mb-4">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-2 text-sm underline hover:no-underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleGenerateCar}
        disabled={isLoading}
        className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Generando Carro NFT...</span>
          </div>
        ) : (
          'Generar Carro NFT'
        )}
      </button>
    </div>
  );
} 