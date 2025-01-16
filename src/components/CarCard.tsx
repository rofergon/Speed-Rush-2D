import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Speedometer } from './Speedometer';
import { FullCarMetadata } from '../services/carService';

interface CarCardProps {
  car: FullCarMetadata;
  onCancelListing?: () => Promise<void>;
}

export function CarCard({ car, onCancelListing }: CarCardProps) {
  return (
    <Card className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardMedia
        component="img"
        height="200"
        image={car.car_image_uri}
        alt={`Car #${car.car_id}`}
        className="h-48 object-cover"
      />
      <CardContent className="p-4">
        <Typography variant="h5" component="div" className="mb-4">
          Car #{car.car_id}
        </Typography>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Speedometer value={car.total_stats.speed} max={10} label="Velocidad" />
          <Speedometer value={car.total_stats.acceleration} max={10} label="Aceleración" />
          <Speedometer value={car.total_stats.handling} max={10} label="Manejo" />
          <Speedometer value={car.total_stats.max_speed} max={10} label="Vel. Máx" />
        </div>

        <div className="mt-4">
          <Typography variant="subtitle1" className="mb-2">
            Partes Equipadas:
          </Typography>
          <div className="space-y-2">
            {car.parts.map((part) => (
              <div key={part.part_id} className="flex justify-between items-center">
                <Typography variant="body2">
                  {part.part_type}
                </Typography>
                <div className="flex space-x-2">
                  <Speedometer value={part.stats.speed} max={10} label="Vel" size="small" />
                  <Speedometer value={part.stats.acceleration} max={10} label="Acel" size="small" />
                  <Speedometer value={part.stats.handling} max={10} label="Man" size="small" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {onCancelListing && (
          <Button
            variant="contained"
            color="secondary"
            onClick={onCancelListing}
            className="mt-4 w-full"
          >
            Cancelar Listado
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 