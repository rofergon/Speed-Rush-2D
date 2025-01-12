import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Button } from '@mui/material';
import { Gamepad2, Settings, ShoppingCart, X } from 'lucide-react';
import { Part } from '../types/parts';
import { Speedometer } from './Speedometer';

export interface CarCardProps {
  id: string;
  imageUrl: string;
  stats: {
    speed: number;
    maxSpeed: number;
    acceleration: number;
    handling: number;
    driftFactor: number;
    turnFactor: number;
  };
  parts: Part[];
  availableParts: Part[];
  onSelect: () => void;
  onEquipPart: (partId: string, slotType: number) => void;
  onUnequipPart: (partId: string) => void;
  onSell?: () => void;
  isSelected: boolean;
  alternativeSkin: boolean;
  isListed?: boolean;
  onCancelListing?: (carId: string) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  id,
  imageUrl,
  stats,
  parts,
  availableParts,
  onSelect,
  onEquipPart,
  onUnequipPart,
  onSell,
  isSelected,
  alternativeSkin,
  isListed,
  onCancelListing
}) => {
  return (
    <Card 
      className={`relative transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-red-500 transform scale-[1.02]' 
          : 'hover:scale-[1.01]'
      }`}
      sx={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={`Car ${id}`}
        sx={{ objectFit: 'contain', p: 2 }}
      />
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6" component="div" color="white">
            Car #{id}
          </Typography>
          <Box className="flex gap-2">
            {isListed ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<X />}
                onClick={() => onCancelListing?.(id)}
              >
                Cancel Listing
              </Button>
            ) : (
              <>
                <IconButton 
                  onClick={onSelect}
                  color="primary"
                  className="hover:bg-gray-700"
                >
                  <Settings className="w-5 h-5" />
                </IconButton>
                <IconButton 
                  onClick={onSell}
                  color="primary"
                  className="hover:bg-gray-700"
                >
                  <ShoppingCart className="w-5 h-5" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4 mb-4">
          <Speedometer value={stats.speed} label="Speed" max={100} />
          <Speedometer value={stats.maxSpeed} label="Max Speed" max={100} />
          <Speedometer value={stats.acceleration} label="Acceleration" max={100} />
          <Speedometer value={stats.handling} label="Handling" max={100} />
          <Speedometer value={stats.driftFactor} label="Drift" max={100} />
          <Speedometer value={stats.turnFactor} label="Turn" max={100} />
        </Box>

        <Box className="mt-4">
          <Typography variant="subtitle1" color="white" gutterBottom>
            Equipped Parts:
          </Typography>
          <Box className="space-y-2">
            {parts.map((part) => (
              <Box key={part.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <Typography variant="body2" color="white">
                  {part.partType === 0 ? 'Engine' : part.partType === 1 ? 'Transmission' : 'Wheels'}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => onUnequipPart(part.id)}
                >
                  Unequip
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 