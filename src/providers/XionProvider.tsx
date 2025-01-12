import React from 'react';
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";

// Configuración para el testnet de XION
const treasuryConfig = {
  treasury: "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h", 
  gasPrice: "0.001uxion",
};

export function XionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AbstraxionProvider config={treasuryConfig}>
      {children}
    </AbstraxionProvider>
  );
} 