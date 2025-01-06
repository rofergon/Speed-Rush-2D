import React from 'react';
import { Card, Typography, Box, Button, Chip, Grid } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SettingsIcon from '@mui/icons-material/Settings';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { Part } from '../types/parts';

interface MarketplaceCarCardProps {
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
  price: number;
  seller: string;
  condition: number;
  listedAt: number;
  onBuy?: () => void;
  onCancel?: () => void;
  isOwner: boolean;
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

const PartSlotDisplay = ({ type, part }: { type: number; part?: Part }) => {
  const getSlotIcon = (type: number) => {
    switch (type) {
      case 0:
        return <EngineeringIcon sx={{ opacity: 0.7 }} />;
      case 1:
        return <SettingsIcon sx={{ opacity: 0.7 }} />;
      case 2:
        return <PrecisionManufacturingIcon sx={{ opacity: 0.7 }} />;
      default:
        return null;
    }
  };

  const getSlotLabel = (type: number) => {
    switch (type) {
      case 0:
        return 'Motor';
      case 1:
        return 'Transmission';
      case 2:
        return 'Core';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box
      sx={{
        p: 1,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        background: part ? 
          'rgba(34, 197, 94, 0.15)' : 
          'rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        backdropFilter: 'blur(10px)',
      }}
    >
      {part ? (
        <Box
          component="img"
          src={part.imageURI}
          alt={`Part ${part.id}`}
          sx={{
            width: '32px',
            height: '32px',
            objectFit: 'cover',
            borderRadius: '4px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            opacity: 0.9
          }}
        />
      ) : (
        <Box 
          color="text.secondary"
          sx={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '4px',
            backdropFilter: 'blur(5px)'
          }}
        >
          {getSlotIcon(type)}
        </Box>
      )}
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {getSlotLabel(type)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {part ? `#${part.id}` : 'Empty'}
        </Typography>
      </Box>
    </Box>
  );
};

export const MarketplaceCarCard: React.FC<MarketplaceCarCardProps> = ({
  id,
  imageUrl,
  stats,
  parts,
  price,
  seller,
  condition,
  listedAt,
  onBuy,
  onCancel,
  isOwner
}) => {
  const daysAgo = Math.floor((new Date().getTime() - listedAt) / 86400000);
  const defaultImage = '/default-car.png';

  const getEquippedPart = (slotType: number) => {
    return parts.find(part => part.partType === slotType);
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
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
        }
      }}
    >
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
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = defaultImage;
          }}
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
        <Chip 
          label={`ID: #${id}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              <PartSlotDisplay type={0} part={getEquippedPart(0)} />
              <PartSlotDisplay type={1} part={getEquippedPart(1)} />
              <PartSlotDisplay type={2} part={getEquippedPart(2)} />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Condition: <strong>{condition}%</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Listed {daysAgo} days ago
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seller: {seller}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isOwner ? (
              <Button
                variant="contained"
                onClick={onCancel}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)'
                }}
              >
                Cancel Listing
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={onBuy}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                }}
              >
                Buy for {price} GRASS
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}; 