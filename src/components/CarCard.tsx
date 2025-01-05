import React from 'react';
import { Card, Typography, Box, Button, Chip, Grid } from '@mui/material';
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
  onSell?: () => void;
  isSelected: boolean;
  alternativeSkin: boolean;
  isListed?: boolean;
}

const StatDisplay = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: '120px' }}>
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
  onSell,
  isSelected,
  alternativeSkin,
  isListed
}) => {
  const getEquippedPart = (slotType: number) => {
    return parts.find(part => part.partType === slotType);
  };

  const getAvailablePartsForSlot = (slotType: number) => {
    return availableParts.filter(part => part.partType === slotType && !part.isEquipped);
  };

  const handlePartEquip = (partId: string, slotType: number) => {
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
        backgroundColor: alternativeSkin ? 
          'rgba(30, 41, 59, 0.85)' : // Azul grisáceo oscuro
          'rgba(15, 23, 42, 0.85)', // Versión más oscura
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out',
          borderColor: isSelected ? '#f44336' : 'rgba(255, 255, 255, 0.3)',
          backgroundColor: alternativeSkin ? 
            'rgba(30, 41, 59, 0.95)' : 
            'rgba(15, 23, 42, 0.95)',
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
            zIndex: 1,
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
      )}
      
      <Box 
        sx={{
          position: 'relative',
          paddingTop: '60%',
          overflow: 'hidden',
          background: 'linear-gradient(45deg, rgba(0,0,0,0.1), rgba(244, 67, 54, 0.05))'
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
            width: '85%',
            height: '85%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }}
        />
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="div" 
          fontWeight="bold" 
          color="white"
          sx={{
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}
        >
          <SportsScoreIcon /> Car #{id}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <StatDisplay label="Speed" value={stats.speed} icon={<SpeedIcon />} />
              <StatDisplay label="Max Speed" value={stats.maxSpeed} icon={<DirectionsCarIcon />} />
              <StatDisplay label="Acceleration" value={stats.acceleration} icon={<RocketLaunchIcon />} />
              <StatDisplay label="Handling" value={stats.handling} icon={<TuneIcon />} />
              <StatDisplay label="Drift Factor" value={stats.driftFactor} icon={<CompareArrowsIcon />} />
              <StatDisplay label="Turn Factor" value={stats.turnFactor} icon={<TurnSlightRightIcon />} />
            </Box>
          </Grid>

          <Grid item xs={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
          </Grid>
        </Grid>

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={onSelect}
            sx={{
              flex: 1,
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
          {onSell && (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onSell();
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                background: isListed ?
                  'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)' :
                  'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                minWidth: '120px'
              }}
            >
              {isListed ? 'Listed' : 'Sell Car'}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}; 