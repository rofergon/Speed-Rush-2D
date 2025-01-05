import { Chain } from '@wagmi/core';

export const lensTestnet = {
  id: 80001,
  name: 'Lens Testnet',
  network: 'lens-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: [import.meta.env.VITE_LENS_RPC_URL] },
    default: { http: [import.meta.env.VITE_LENS_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: import.meta.env.VITE_LENS_EXPLORER_URL },
  },
  testnet: true,
} as const satisfies Chain; 