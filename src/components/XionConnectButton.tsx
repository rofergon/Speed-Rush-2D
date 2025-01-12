import React from 'react';
import { Abstraxion, useAbstraxionAccount, useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import "@burnt-labs/ui/dist/index.css";

export function XionConnectButton() {
  const { data: account } = useAbstraxionAccount();
  const [, setShowModal] = useModal();

  return (
    <>
      <Button
        fullWidth
        onClick={() => setShowModal(true)}
        structure="base"
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        {account.bech32Address ? (
          <div className="flex items-center justify-center">
            {account.bech32Address.slice(0, 6)}...{account.bech32Address.slice(-4)}
          </div>
        ) : (
          "Conectar Wallet"
        )}
      </Button>
      
      <Abstraxion
        onClose={() => {
          setShowModal(false);
        }}
      />
    </>
  );
} 