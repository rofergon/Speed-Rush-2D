import { createConfig, configureChains } from '@wagmi/core';
import { publicProvider } from '@wagmi/core/providers/public';
import { lensTestnet } from './chains';
import { InjectedConnector } from '@wagmi/core/connectors/injected';

const { chains, publicClient } = configureChains(
  [lensTestnet],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
}); 