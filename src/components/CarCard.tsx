import React from 'react';
import { Card, Typography, Box, Button, Chip } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Part } from '../types/parts';
import { PartSlot } from './PartSlot';

interface CarCardProps {
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
  isSelected: boolean;
  alternativeSkin: boolean;
}

const StatDisplay = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Box color="text.secondary" display="flex" alignItems="center">
      {icon}
    </Box>
    <Typography variant="body2" color="white">
      {label}: <strong>{value}</strong>
    </Typography>
  </Box>
);

export const CarCard: React.FC<CarCardProps> = ({
  id,
  imageUrl,
  stats,
  parts,
  availableParts,
  onSelect,
  onEquipPart,
  onUnequipPart,
  isSelected,
  alternativeSkin
}) => {
  // Función para obtener la parte equipada en un slot específico
  const getEquippedPart = (slotType: number) => {
    return parts.find(part => part.partType === slotType);
  };

  // Función para obtener las partes disponibles para un slot específico
  const getAvailablePartsForSlot = (slotType: number) => {
    console.log('Partes disponibles para slot', slotType, ':', 
      availableParts.filter(part => part.partType === slotType && !part.isEquipped)
        .map(p => ({ id: p.id, type: p.partType }))
    );
    return availableParts.filter(part => part.partType === slotType && !part.isEquipped);
  };

  const handlePartEquip = (partId: string, slotType: number) => {
    console.log('CarCard: Equipando parte', { partId, slotType });
    onEquipPart(partId, slotType);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        backgroundColor: alternativeSkin ? '#2C3E50' : '#1A1A1A',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out',
          borderColor: isSelected ? '#f44336' : 'rgba(255, 255, 255, 0.3)'
        }
      }}
      onClick={onSelect}
    >
      {isSelected && (
        <Chip 
          label="Selected" 
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(244, 67, 54, 0.9)',
            backdropFilter: 'blur(4px)',
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
      )}
      <Box 
        sx={{
          position: 'relative',
          paddingTop: '75%', // 4:3 Aspect Ratio
          overflow: 'hidden',
          background: 'linear-gradient(45deg, rgba(0,0,0,0.2), rgba(244, 67, 54, 0.1))'
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={`Car ${id}`}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }}
        />
      </Box>

      <Box 
        sx={{ 
          p: 2,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)'
        }}
      >
        <Box 
          sx={{ 
            mb: 2,
            pb: 2,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography 
            variant="h6" 
            component="div" 
            fontWeight="bold" 
            color="white"
            sx={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SportsScoreIcon /> Car #{id}
          </Typography>
        </Box>

        <Box className="space-y-1.5 mb-4">
          <StatDisplay label="Speed" value={stats.speed} icon={<SpeedIcon />} />
          <StatDisplay label="Max Speed" value={stats.maxSpeed} icon={<DirectionsCarIcon />} />
          <StatDisplay label="Acceleration" value={stats.acceleration} icon={<RocketLaunchIcon />} />
          <StatDisplay label="Handling" value={stats.handling} icon={<TuneIcon />} />
          <StatDisplay label="Drift Factor" value={stats.driftFactor} icon={<CompareArrowsIcon />} />
          <StatDisplay label="Turn Factor" value={stats.turnFactor} icon={<TurnSlightRightIcon />} />
        </Box>

        {/* Slots de partes */}
        <Box sx={{ mb: 2 }}>
          <PartSlot
            type={0}
            label="Motor"
            equippedPart={getEquippedPart(0)}
            availableParts={getAvailablePartsForSlot(0)}
            onEquip={(partId: string) => handlePartEquip(partId, 0)}
            onUnequip={onUnequipPart}
          />
          <PartSlot
            type={1}
            label="Transmission"
            equippedPart={getEquippedPart(1)}
            availableParts={getAvailablePartsForSlot(1)}
            onEquip={(partId: string) => handlePartEquip(partId, 1)}
            onUnequip={onUnequipPart}
          />
          <PartSlot
            type={2}
            label="Core"
            equippedPart={getEquippedPart(2)}
            availableParts={getAvailablePartsForSlot(2)}
            onEquip={(partId: string) => handlePartEquip(partId, 2)}
            onUnequip={onUnequipPart}
          />
        </Box>

        <Button
          variant="contained"
          onClick={onSelect}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: isSelected ? 
              'linear-gradient(45deg, #f44336 30%, #ff1744 90%)' : 
              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: isSelected ?
              '0 3px 5px 2px rgba(244, 67, 54, .3)' :
              '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}
        >
          {isSelected ? 'Selected for Modification' : 'Select for Modification'}
        </Button>
      </Box>
    </Card>
  );
}; 