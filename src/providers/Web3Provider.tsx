"use client"

import React, { useEffect } from 'react';
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import { Chain } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Definir la red de Lens Sepolia
const lensSepolia: Chain = {
  id: 37111,
  name: 'Lens Network Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GRASS',
    symbol: 'GRASS',
  },
  rpcUrls: {
    default: { 
      http: ['https://rpc.testnet.lens.dev']
    },
    public: {
      http: ['https://rpc.testnet.lens.dev']
    }
  },
  blockExplorers: {
    default: {
      name: 'Lens Block Explorer',
      url: 'https://block-explorer.testnet.lens.dev'
    }
  },
  testnet: true
};

// Componente para monitorear la conexión
function ConnectionMonitor() {
  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    console.log('Estado de conexión:', {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      network: 'Lens Network Sepolia Testnet',
      rpcUrl: 'https://rpc.testnet.lens.dev',
    });
  }, [isConnected, address, chain]);

  return null;
}

const config = createConfig(
  getDefaultConfig({
    chains: [lensSepolia],
    transports: {
      [lensSepolia.id]: http('https://rpc.testnet.lens.dev'),
    },

    walletConnectProjectId: process.env.VITE_WALLETCONNECT_PROJECT_ID!,

    appName: "Speed Rush 2D",
    appDescription: "Un emocionante juego de carreras 2D con integración Lens",
    appUrl: "https://speedrush2d.com", 
    appIcon: "/logo.png", 
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <ConnectionMonitor />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; 