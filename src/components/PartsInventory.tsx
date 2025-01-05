import React, { useState } from 'react';
import { Grid, Box, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { PartCard } from './PartCard';
import { Part } from '../types/parts';

interface PartsInventoryProps {
  parts: Part[];
  selectedCar?: {
    id: string;
    parts: Part[];
  };
  onEquipPart: (partId: string, carId: string, slotIndex: number) => Promise<void>;
  onUnequipPart: (partId: string, carId: string) => Promise<void>;
  isLoading: boolean;
}

export const PartsInventory: React.FC<PartsInventoryProps> = ({
  parts,
  selectedCar,
  onEquipPart,
  onUnequipPart,
  isLoading
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEquipped, setFilterEquipped] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('PartsInventory: Partes recibidas:', parts.map(p => ({
    id: p.id,
    partId: (p as any).partId,
    type: p.partType,
    isEquipped: p.isEquipped
  })));

  const getSlotForPartType = (partType: number): number => {
    switch(partType) {
      case 0: return 0; // Engine
      case 1: return 1; // Transmission
      case 2: return 2; // Core
      default: return -1;
    }
  };

  const handleEquipPart = async (part: Part) => {
    if (!selectedCar) {
      console.error('No car selected');
      return;
    }
    
    console.log('PartsInventory: Llamando a handleEquipPart', {
      partId: part.id,
      carId: selectedCar.id,
      slotIndex: getSlotForPartType(part.partType)
    });

    await onEquipPart(
      part.id,
      selectedCar.id,
      getSlotForPartType(part.partType)
    );
  };

  const handleUnequipPart = async (partId: string, carId: string) => {
    console.log('PartsInventory: Llamando a handleUnequipPart', { partId, carId });
    await onUnequipPart(partId, carId);
  };

  const filteredParts = parts.filter(part => {
    const typeMatch = filterType === 'all' || part.partType === Number(filterType);
    const equippedMatch = filterEquipped === 'all' || 
      (filterEquipped === 'equipped' && part.isEquipped) ||
      (filterEquipped === 'unequipped' && !part.isEquipped);
    return typeMatch && equippedMatch;
  });

  if (isLoading || isRefreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <FormControl variant="outlined" className="bg-gray-700 rounded-lg" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="type-filter-label" sx={{ color: 'white' }}>Part Type</InputLabel>
            <Select
              labelId="type-filter-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Part Type"
              sx={{ color: 'white' }}
            >
              <MenuItem value="all">All Parts</MenuItem>
              <MenuItem value="0">Engine</MenuItem>
              <MenuItem value="1">Transmission</MenuItem>
              <MenuItem value="2">Wheels</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" className="bg-gray-700 rounded-lg" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="equipped-filter-label" sx={{ color: 'white' }}>Status</InputLabel>
            <Select
              labelId="equipped-filter-label"
              value={filterEquipped}
              onChange={(e) => setFilterEquipped(e.target.value)}
              label="Status"
              sx={{ color: 'white' }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="equipped">Equipped</MenuItem>
              <MenuItem value="unequipped">Unequipped</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <Grid container spacing={2}>
        {filteredParts.map((part) => (
          <Grid item xs={12} sm={6} md={3} key={part.id}>
            <PartCard 
              {...part}
              onEquip={() => handleEquipPart(part)}
              onUnequip={part.isEquipped && part.equippedToCarId ? 
                () => handleUnequipPart(part.id, part.equippedToCarId!) : 
                undefined
              }
              canEquip={!!selectedCar && !part.isEquipped && 
                !selectedCar.parts.some(p => p.partType === part.partType)
              }
            />
          </Grid>
        ))}
      </Grid>

      {filteredParts.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" mt={4}>
          No parts found with selected filters
        </Typography>
      )}
    </div>
  );
}; 