import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThirdwebProvider, metamaskWallet, coinbaseWallet, walletConnect } from "@thirdweb-dev/react";
import { Chain } from "@thirdweb-dev/chains";

const LensNetworkSepolia: Chain = {
  chainId: 37111,
  rpc: ["https://37111.rpc.thirdweb.com"],
  nativeCurrency: {
    name: "GRASS",
    symbol: "GRASS",
    decimals: 18,
  },
  shortName: "lens-sepolia",
  slug: "lens-sepolia",
  testnet: true,
  chain: "Lens Network Sepolia",
  name: "Lens Network Sepolia Testnet",
  explorers: [
    {
      name: "Lens Explorer",
      url: "https://testnet-explorer.lens.dev",
      standard: "EIP3091"
    }
  ]
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirdwebProvider 
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      supportedWallets={[
        metamaskWallet({
          recommended: true,
        }),
        coinbaseWallet(),
        walletConnect(),
      ]}
      activeChain={LensNetworkSepolia}
      supportedChains={[LensNetworkSepolia]}
      dAppMeta={{
        name: "Speed Rush 2D",
        description: "Juego de carreras en 2D usando Lens Network",
        logoUrl: "tu-logo-url",
        isDarkMode: true,
      }}
    >
      <App />
    </ThirdwebProvider>
  </StrictMode>
);
