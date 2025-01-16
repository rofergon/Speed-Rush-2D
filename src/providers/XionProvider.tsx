import React from 'react';
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";

export const GAME_CONTRACTS = {
  CAR_NFT: "xion14836hqy3km4sardm2e89s2tw6l23d9lvcfwgjwlvp44lztlxjp4q3h5uck",
  CAR_PART: "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h",
  MINT_PRICE: "100uxion",
  OWNER: "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h",
  TREASURY: "xion10weet3zt54ul5nkc8ruc0a4ek4cn620ukqyp2su476tzzdg007nqly4vfe"
} as const;

const treasuryConfig = {
  treasury: GAME_CONTRACTS.TREASURY,
  // Optional params to activate mainnet config
  // rpcUrl: "https://rpc.xion-mainnet-1.burnt.com:443",
  // restUrl: "https://api.xion-mainnet-1.burnt.com:443",
};

export function XionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AbstraxionProvider config={treasuryConfig}>
      {children}
    </AbstraxionProvider>
  );
} 