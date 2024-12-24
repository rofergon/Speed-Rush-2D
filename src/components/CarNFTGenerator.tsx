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
        "A futuristic racing car",
        'cartoon'
      );
      setNftData(result);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Error generating NFT:', err);
      setError(err instanceof Error ? err.message : 'Error generating NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttributes = () => {
    if (!nftData?.metadata?.traits) return null;

    const traits = nftData.metadata.traits;
    const traitsList = [
      { key: 'speed', label: 'Speed', value: traits.speed },
      { key: 'acceleration', label: 'Acceleration', value: traits.acceleration },
      { key: 'handling', label: 'Handling', value: traits.handling },
      { key: 'drift_factor', label: 'Drift Factor', value: traits.drift_factor },
      { key: 'turn_factor', label: 'Turn Factor', value: traits.turn_factor },
      { key: 'max_speed', label: 'Max Speed', value: traits.max_speed }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {traitsList.map(({ key, label, value }) => (
          <div key={key} className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">{label}</div>
            <div className="font-bold">{value.toFixed(2)}</div>
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
        {isLoading ? 'Generating...' : 'Generate Car NFT'}
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
                Generated Car NFT
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
                alt="Car NFT"
                className="w-full rounded-lg"
              />
            </div>

            <div className="text-white">
              <h4 className="font-bold mb-2">Car Attributes</h4>
              {renderAttributes()}
            </div>

            <button
              onClick={() => setIsDialogOpen(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 