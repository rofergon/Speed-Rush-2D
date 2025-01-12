import React, { useState } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { web3Service } from '../services/web3Service';
import { toast } from 'react-hot-toast';

export function MintCarButton() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    if (!client || !account.bech32Address) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setIsMinting(true);
      // TODO: Actualizar esta función cuando actualicemos web3Service para XION
      // const price = await web3Service.getMintPrice();
      // await web3Service.mintCar(account.bech32Address, carData, price.toString());
      toast.success('¡Carro minteado exitosamente!');
    } catch (error) {
      console.error('Error minting car:', error);
      toast.error('Error al mintear el carro');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Button
      fullWidth
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
          Minteando...
        </span>
      ) : (
        <span>Mintear Nuevo Carro</span>
      )}
    </Button>
  );
} 