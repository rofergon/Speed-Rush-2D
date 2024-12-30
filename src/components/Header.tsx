import React from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { Car } from 'lucide-react';

export const Header: React.FC = () => {
  const { address } = useAccount();

  return (
    <div className="w-full max-w-[98%] mx-auto bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 p-3 rounded-full">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mi Garage</h1>
            {address && (
              <p className="text-gray-400 text-sm mt-1 break-all">
                {address}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ConnectKitButton />
        </div>
      </div>
    </div>
  );
}; 