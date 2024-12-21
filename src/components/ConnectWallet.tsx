import { ConnectWallet as ThirdwebConnectWallet } from "@thirdweb-dev/react";

export function ConnectWallet() {
  return (
    <ThirdwebConnectWallet 
      theme="dark"
      btnTitle="Conectar Wallet"
      modalTitle="Speed Rush 2D"
      modalSize="wide"
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
      hideTestnetFaucet={false}
      switchToActiveChain={true}
      displayBalanceToken="GRASS"
      auth={{
        loginOptional: false,
        onLogin() {
          console.log("Usuario conectado a Lens Network");
        },
      }}
    />
  );
} 