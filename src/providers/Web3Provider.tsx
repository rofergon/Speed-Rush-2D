"use client"

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.VITE_ALCHEMY_ID}`,
      ),
    },

    walletConnectProjectId: process.env.VITE_WALLETCONNECT_PROJECT_ID!,

    appName: "Speed Rush 2D",
    appDescription: "Un emocionante juego de carreras 2D",
    appUrl: "https://speedrush2d.com", 
    appIcon: "/logo.png", 
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; 