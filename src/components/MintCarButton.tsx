import React, { useState } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { toast } from 'react-hot-toast';
import { xionService } from '../services/xionService';
import { GAME_CONTRACTS } from '../providers/XionProvider';

export function MintCarButton() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    if (!client || !account.bech32Address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsMinting(true);
      
      const result = await xionService.mintCar(
        client,
        account.bech32Address,
        GAME_CONTRACTS.TREASURY
      );

      if (result) {
        toast.success('Car minted successfully!');
      }
    } catch (error) {
      console.error('Error minting car:', error);
      toast.error('Error minting the car');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Button
      onClick={handleMint}
      disabled={isMinting || !client}
      structure="base"
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isMinting ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Minting...
        </span>
      ) : (
        <span>Mint New Car</span>
      )}
    </Button>
  );
} 