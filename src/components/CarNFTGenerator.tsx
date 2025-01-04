import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { web3Service, CarGenerationData } from '../services/web3Service';
import { ethers } from 'ethers';

const API_URL = 'https://speed-rush-2d-backend-production.up.railway.app';

interface CarGenerationOptions {
  prompt: string;
  style: 'cartoon' | 'realistic' | 'anime';
  engineType: 'standard' | 'turbo' | 'electric';
  transmissionType: 'manual' | 'automatic' | 'sequential';
  wheelsType: 'sport' | 'offroad' | 'racing';
}

export function CarNFTGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [nftData, setNftData] = useState<{
    imageUrl: string;
    stats: {
      speed: number;
      acceleration: number;
      handling: number;
      driftFactor: number;
      turnFactor: number;
      maxSpeed: number;
      condition: number;
    };
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<{
    hash: string;
    gasUsed?: string;
    effectiveGasPrice?: string;
    totalCost?: string;
  } | null>(null);
  const [options, setOptions] = useState<CarGenerationOptions>({
    prompt: 'A futuristic racing car',
    style: 'cartoon',
    engineType: 'standard',
    transmissionType: 'manual',
    wheelsType: 'sport'
  });
  const { address } = useAccount();
  const navigate = useNavigate();

  const handleGenerateNFT = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Transformar las opciones al formato que espera el backend
      const backendOptions = {
        prompt: options.prompt,
        style: options.style.toLowerCase(),
        engine: {
          type: options.engineType.toLowerCase()
        },
        transmission: {
          type: options.transmissionType.toLowerCase()
        },
        wheels: {
          type: options.wheelsType.toLowerCase()
        }
      };

      console.log('Sending options to backend:', backendOptions);

      // Primero, obtener los datos del carro del backend
      const response = await fetch(`${API_URL}/api/cars/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendOptions),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Backend error:', errorData);
        throw new Error(errorData?.message || 'Error generando el carro');
      }

      const carData: CarGenerationData = await response.json();

      console.log('Car data received:', carData);
      console.log('\nPart Details:');
      carData.parts.forEach((part, index) => {
        const types = ['Engine', 'Transmission', 'Wheels'];
        console.log(`\n${types[index]}:`);
        console.log(`- Stat1:`, part.stat1);
        console.log(`- Stat2:`, part.stat2);
        console.log(`- Stat3:`, part.stat3);
      });

      // Obtener el precio de minteo y estimar el gas
      const mintPrice = '0.01'; // ETH
      console.log('\nMint price:', mintPrice, 'ETH');

      // Mintear el carro en la blockchain
      const tx = await web3Service.mintCar(
        address,
        carData,
        mintPrice
      );

      console.log('Transaction sent:', tx);
      
      // Esperar a que la transacción se confirme
      const provider = new ethers.BrowserProvider(window.ethereum);
      const receipt = await provider.getTransactionReceipt(tx);
      
      if (receipt) {
        const feeData = await provider.getFeeData();
        setTransactionDetails({
          hash: tx,
          gasUsed: receipt.gasUsed?.toString(),
          totalCost: receipt.gasUsed && feeData.gasPrice ? 
            ethers.formatEther(receipt.gasUsed * feeData.gasPrice) : 
            undefined
        });
      }

      // Usar los datos que ya tenemos del backend
      setNftData({
        imageUrl: carData.carImageURI,
        stats: {
          speed: carData.parts[0].stat1,
          maxSpeed: carData.parts[0].stat2,
          acceleration: carData.parts[0].stat3,
          handling: carData.parts[2].stat1,
          driftFactor: carData.parts[2].stat2,
          turnFactor: carData.parts[2].stat3,
          condition: 100 // Carro nuevo comienza con condición 100%
        }
      });
      
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Error generating NFT:', err);
      setError(err instanceof Error ? err.message : 'Error generating NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (key: keyof CarGenerationOptions, value: string) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewInGarage = () => {
    setIsDialogOpen(false);
    navigate('/profile');
  };

  const renderAttributes = () => {
    if (!nftData?.stats) return null;

    const stats = nftData.stats;
    const statsList = [
      { key: 'speed', label: 'Speed', value: stats.speed },
      { key: 'acceleration', label: 'Acceleration', value: stats.acceleration },
      { key: 'handling', label: 'Handling', value: stats.handling },
      { key: 'driftFactor', label: 'Drift', value: stats.driftFactor },
      { key: 'turnFactor', label: 'Turn', value: stats.turnFactor },
      { key: 'maxSpeed', label: 'Max Speed', value: stats.maxSpeed },
      { key: 'condition', label: 'Condition', value: stats.condition }
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statsList.map(({ key, label, value }) => (
            <div key={key} className="bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-400">{label}</div>
              <div className="font-bold">{value}</div>
            </div>
          ))}
        </div>

        {transactionDetails && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg space-y-2">
            <h4 className="font-semibold text-gray-300">Transaction Details</h4>
            <div className="text-sm">
              <p>Hash: <span className="text-gray-400">{transactionDetails.hash.slice(0, 10)}...</span></p>
              {transactionDetails.gasUsed && (
                <p>Gas Used: <span className="text-gray-400">{transactionDetails.gasUsed}</span></p>
              )}
              {transactionDetails.totalCost && (
                <p>Total Cost: <span className="text-gray-400">{transactionDetails.totalCost} ETH</span></p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Car Style
          </label>
          <select
            value={options.style}
            onChange={(e) => handleOptionChange('style', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          >
            <option value="cartoon">Cartoon</option>
            <option value="realistic">Realistic</option>
            <option value="anime">Anime</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Engine Type
          </label>
          <select
            value={options.engineType}
            onChange={(e) => handleOptionChange('engineType', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          >
            <option value="standard">Standard</option>
            <option value="turbo">Turbo</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Transmission Type
          </label>
          <select
            value={options.transmissionType}
            onChange={(e) => handleOptionChange('transmissionType', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="sequential">Sequential</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wheels Type
          </label>
          <select
            value={options.wheelsType}
            onChange={(e) => handleOptionChange('wheelsType', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          >
            <option value="sport">Sport</option>
            <option value="offroad">Off-road</option>
            <option value="racing">Racing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Car Description
          </label>
          <textarea
            value={options.prompt}
            onChange={(e) => handleOptionChange('prompt', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
            rows={3}
            placeholder="Describe how you want your car to look..."
          />
        </div>
      </div>

      <button
        onClick={handleGenerateNFT}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-105 disabled:opacity-50"
      >
        {isLoading ? 'Minting...' : 'Generate Car NFT'}
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
                Car NFT Generated
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

            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleViewInGarage}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                View in Garage
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 