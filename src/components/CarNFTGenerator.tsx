import React, { useState } from 'react';
import { generateCarNFT, CarMetadata } from '../services/carApi';

export function CarNFTGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [nftData, setNftData] = useState<{
    imageUrl: string;
    metadata: CarMetadata;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNFT = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCarNFT(
        "Un carro de carreras futurista",
        "cartoon"
      );
      setNftData(result);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Error generando NFT:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttributes = () => {
    if (!nftData?.metadata?.traits) return null;

    const traits = nftData.metadata.traits;
    const traitsList = [
      { key: 'speed', label: 'Velocidad', value: traits.speed },
      { key: 'acceleration', label: 'Aceleración', value: traits.acceleration },
      { key: 'handling', label: 'Manejo', value: traits.handling },
      { key: 'drift_factor', label: 'Factor de Derrape', value: traits.drift_factor },
      { key: 'turn_factor', label: 'Factor de Giro', value: traits.turn_factor },
      { key: 'max_speed', label: 'Velocidad Máxima', value: traits.max_speed }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {traitsList.map(({ key, label, value }) => (
          <div key={key} className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">{label}</div>
            <div className="font-bold">{value}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleGenerateNFT}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-105 disabled:opacity-50"
      >
        {isLoading ? 'Generando...' : 'Generar NFT de Carro'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isDialogOpen && nftData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Carro NFT Generado
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <img
                src={nftData.imageUrl}
                alt="Carro NFT"
                className="w-full rounded-lg"
              />
            </div>

            <div className="text-white">
              <h4 className="font-bold mb-2">Atributos del Carro</h4>
              {renderAttributes()}
            </div>

            <button
              onClick={() => setIsDialogOpen(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 