import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Part, PartType } from '../types/parts';
import { Car } from '../types/car';
import { PartCard } from './PartCard';
import { RefreshCw } from 'lucide-react';

interface PartsInventoryProps {
  parts: Part[];
  selectedCar?: Car;
  isLoading: boolean;
  onEquipPart: (partId: number, carId: number, slotIndex: number) => Promise<void>;
  onUnequipPart: (partId: number, carId: number) => Promise<void>;
}

export function PartsInventory({
  parts,
  selectedCar,
  isLoading,
  onEquipPart,
  onUnequipPart
}: PartsInventoryProps) {
  const getPartTypeLabel = (partType: PartType) => {
    switch(partType) {
      case PartType.Engine:
        return "Engines";
      case PartType.Transmission:
        return "Transmissions";
      case PartType.Core:
        return "Cores";
      default:
        return "Unknown Parts";
    }
  };

  // Agrupar partes por tipo
  const groupedParts = parts.reduce((acc, part) => {
    const type = part.part_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(part);
    return acc;
  }, {} as Record<PartType, Part[]>);

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
        <Typography>Loading parts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Object.entries(groupedParts).map(([type, typeParts]) => (
        <Box 
          key={type} 
          sx={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            p: 3
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
            {getPartTypeLabel(type as PartType)}
          </Typography>
          <Grid container spacing={3}>
            {typeParts.map((part) => (
              <Grid item xs={12} sm={6} md={4} key={part.part_id}>
                <PartCard
                  part={part}
                  selectedCar={selectedCar}
                  onEquip={onEquipPart}
                  onUnequip={onUnequipPart}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
} 