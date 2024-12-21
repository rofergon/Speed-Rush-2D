"use client"

import React, { useEffect } from 'react';
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import { polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Connection monitoring component
function ConnectionMonitor() {
  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    console.log('Connection Status:', {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      network: 'Lens Sepolia',
      rpcUrl: import.meta.env.VITE_ALCHEMY_RPC_URL,
    });
  }, [isConnected, address, chain]);

  return null;
}

const config = createConfig(
  getDefaultConfig({
    chains: [polygon],
    transports: {
      [polygon.id]: http(import.meta.env.VITE_ALCHEMY_RPC_URL),
    },

    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,

    appName: "Speed Rush 2D",
    appDescription: "An exciting 2D racing game with Lens integration",
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