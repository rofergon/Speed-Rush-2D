"use client"

import React, { useEffect } from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { useAccount } from "wagmi";
import { Chain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Definir la red de Lens
const lensNetwork: Chain = {
  id: 37111,
  name: 'Lens Network',
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
      chainName: chain?.name
    });
  }, [isConnected, address, chain]);

  return null;
}

// Configuración del cliente de consultas
const queryClient = new QueryClient();

// Configuración de ConnectKit
const config = createConfig(
  getDefaultConfig({
    // Configuración de las redes
    chains: [lensNetwork],
    transports: {
      [lensNetwork.id]: http('https://rpc.testnet.lens.dev'),
    },

    // Configuración de ConnectKit
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,

    // Metadata de la aplicación
    appName: "Speed Rush 2D",
    appDescription: "Un emocionante juego de carreras 2D con integración Lens",
    appUrl: "https://speedrush2d.com",
    appIcon: "/logo.png",
  }),
);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider 
          customTheme={{
            "--ck-font-family": '"Inter", sans-serif',
            "--ck-border-radius": "8px",
          }}
          mode="dark"
          options={{
            hideBalance: false,
            hideTooltips: false,
            hideQuestionMarkCTA: false,
            enforceSupportedChains: true,
            initialChainId: lensNetwork.id
          }}
        >
          <ConnectionMonitor />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 