import React, { useState } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { toast } from 'react-hot-toast';
import { GAME_CONTRACTS } from '../providers/XionProvider';

export function GetMintPriceButton() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [isLoading, setIsLoading] = useState(false);
  const [mintPrice, setMintPrice] = useState<string | null>(null);

  const handleGetPrice = async () => {
    if (!client) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setIsLoading(true);

      // Crear el mensaje de consulta según el contrato
      const queryMsg = {
        get_mint_price: {}
      };

      // Ejecutar la consulta
      const result = await client.queryContractSmart(
        GAME_CONTRACTS.CAR_NFT,
        queryMsg
      );

      // El resultado será un Uint128, lo convertimos a string para mostrarlo
      setMintPrice(result.toString());
      toast.success(`Precio de minteo: ${result} uxion`);
    } catch (error) {
      console.error('Error consultando precio:', error);
      toast.error('Error al consultar el precio de minteo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGetPrice}
      disabled={isLoading || !client}
      structure="base"
      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Consultando...
        </span>
      ) : (
        <span>
          {mintPrice ? `Precio: ${mintPrice} uxion` : 'Consultar Precio de Minteo'}
        </span>
      )}
    </Button>
  );
} 