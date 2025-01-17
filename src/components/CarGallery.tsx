import React, { useEffect, useState } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { toast } from 'react-hot-toast';
import { CarCard } from './CarCard';
import { carService, FullCarMetadata } from '../services/carService';

export function CarGallery() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [cars, setCars] = useState<FullCarMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!client || !account.bech32Address) {
      setIsLoading(false);
      return;
    }

    try {
      const userCars = await carService.getUserCars(client, account.bech32Address);
      setCars(userCars);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading cars');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [client, account.bech32Address]);

  if (!client || !account.bech32Address) {
    return (
      <div className="text-center text-gray-300 py-8">
        Please connect your wallet to view your cars
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-300 py-8">
        Loading cars...
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center text-gray-300 py-8">
        You have no cars. Mint a new one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {cars.map((car) => (
        <CarCard
          key={car.car_id}
          car={car}
          onCancelListing={async () => {
            // Esta función se implementará cuando tengamos el marketplace
            toast.error('Function not implemented yet');
          }}
        />
      ))}
    </div>
  );
} 