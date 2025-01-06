import React from 'react';
import { web3Service } from '../services/web3Service';
import { ethers } from 'ethers';
import { Coins } from 'lucide-react';

export function MintPriceDebug() {
  const handleCheckPrice = async () => {
    try {
      const price = await web3Service.getMintPrice();
      console.log('Debug - Precio de minteo:');
      console.log('Wei:', price.toString());
      console.log('GRASS:', ethers.formatEther(price));
    } catch (error) {
      console.error('Error al obtener el precio:', error);
    }
  };

  return (
    <button
      onClick={handleCheckPrice}
      className="
        px-6 py-4 rounded-xl
        font-bold text-lg
        transition-all duration-200
        flex items-center justify-center gap-2
        bg-gradient-to-r from-blue-600 to-cyan-500
        hover:from-blue-500 hover:to-cyan-400
        hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20
      "
    >
      <Coins className="w-6 h-6" />
      <span>Check Price</span>
    </button>
  );
} 