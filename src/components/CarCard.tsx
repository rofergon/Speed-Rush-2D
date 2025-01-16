import React, { useState } from 'react';
import { Card, Typography, Box, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Car } from '../types/car';

interface CarCardProps {
  car: Car;
  onCancelListing?: () => Promise<void>;
  onSelect?: () => void;
  onUnequipPart?: (partId: number) => Promise<void>;
  selected?: boolean;
}

interface UnequipDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partType: string;
  partId: number;
  imageUri: string;
}

const UnequipDialog = ({ open, onClose, onConfirm, partType, partId, imageUri }: UnequipDialogProps) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'white',
        minWidth: '360px'
      }
    }}
  >
    <DialogTitle sx={{ textAlign: 'center' }}>Unequip Part</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box
        component="img"
        src={imageUri}
        alt={partType}
        sx={{
          width: '300px',
          height: '300px',
          objectFit: 'contain',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: 3,
          marginY: 2
        }}
        onError={(e: any) => {
          e.target.src = `https://gateway.lighthouse.storage/ipfs/default_part_${partType.toLowerCase()}.png`;
        }}
      />
      <Typography>
        Are you sure you want to unequip this {partType} (#{partId})?
      </Typography>
    </DialogContent>
    <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 1 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          minWidth: '120px'
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
          boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
          minWidth: '120px'
        }}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

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

const PartDisplay = ({ part, type, onUnequip }: { part: any, type: string, onUnequip?: (partId: number) => void }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const stats = part?.stats || {};
  const imageUri = stats.image_uri || `https://gateway.lighthouse.storage/ipfs/default_part_${type.toLowerCase()}.png`;

  const handleClick = () => {
    if (part?.part_id) {
      setDialogOpen(true);
    }
  };

  const handleConfirmUnequip = () => {
    if (onUnequip && part?.part_id) {
      onUnequip(part.part_id);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: 'rgba(20, 40, 30, 0.6)',
          borderRadius: '8px',
          p: 1,
          mb: 1,
          cursor: part?.part_id ? 'pointer' : 'default',
          '&:hover': part?.part_id ? {
            backgroundColor: 'rgba(30, 50, 40, 0.8)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          } : {}
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={imageUri}
              alt={type}
              sx={{
                width: 24,
                height: 24,
                objectFit: 'contain',
                borderRadius: '4px'
              }}
              onError={(e: any) => {
                e.target.src = `https://gateway.lighthouse.storage/ipfs/default_part_${type.toLowerCase()}.png`;
              }}
            />
            <Typography variant="body2" color="white">
              {type}
            </Typography>
          </Box>
          <Typography variant="caption" color="gray">
            #{part?.part_id || 'N/A'}
          </Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Vel</Typography>
            <Typography variant="body2" color="white">{stats.speed || stats.stat1 || 0}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Acel</Typography>
            <Typography variant="body2" color="white">{stats.acceleration || stats.stat2 || 0}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Man</Typography>
            <Typography variant="body2" color="white">{stats.handling || stats.stat3 || 0}</Typography>
          </Grid>
        </Grid>
      </Box>

      <UnequipDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmUnequip}
        partType={type}
        partId={part?.part_id}
        imageUri={imageUri}
      />
    </>
  );
};

export function CarCard({ car, onCancelListing, onSelect, onUnequipPart, selected }: CarCardProps) {
  const partTypes = ["Engine", "Transmission", "Wheels"];
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: selected ? '2px solid #f44336' : '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsScoreIcon /> Car #{car.car_id}
        </Typography>
        {selected && (
          <Chip 
            label="Selected" 
            color="error"
            size="small"
            sx={{
              backgroundColor: 'rgba(244, 67, 54, 0.9)',
              backdropFilter: 'blur(4px)'
            }}
          />
        )}
      </Box>

      {/* Car Image */}
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
          src={car.car_image_uri}
          alt={`Car #${car.car_id}`}
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

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex' }}>
        {/* Left side - Stats */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <StatDisplay label="Speed" value={car.total_stats.speed} icon={<SpeedIcon />} />
          <StatDisplay label="Max Speed" value={car.total_stats.max_speed} icon={<DirectionsCarIcon />} />
          <StatDisplay label="Acceleration" value={car.total_stats.acceleration} icon={<RocketLaunchIcon />} />
          <StatDisplay label="Handling" value={car.total_stats.handling} icon={<TuneIcon />} />
          <StatDisplay label="Drift Factor" value={car.total_stats.drift_factor} icon={<CompareArrowsIcon />} />
          <StatDisplay label="Turn Factor" value={car.total_stats.turn_factor} icon={<TurnSlightRightIcon />} />
        </Box>

        {/* Right side - Equipped Parts */}
        <Box sx={{ flex: 1, pl: 2 }}>
          <Typography variant="subtitle1" color="white" gutterBottom>
            Equipped Parts
          </Typography>
          <Box>
            {partTypes.map((type, index) => (
              <PartDisplay 
                key={type} 
                part={car.parts[index]} 
                type={type}
                onUnequip={onUnequipPart}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onSelect}
          fullWidth
          sx={{
            flex: 1,
            textTransform: 'none',
            fontWeight: 600,
            background: selected ? 
              'linear-gradient(45deg, #f44336 30%, #ff1744 90%)' : 
              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: selected ?
              '0 3px 5px 2px rgba(244, 67, 54, .3)' :
              '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}
        >
          {selected ? 'Selected for Modification' : 'Select for Modification'}
        </Button>
        <Button
          variant="contained"
          onClick={onCancelListing}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
            minWidth: '120px'
          }}
        >
          Sell Car
        </Button>
      </Box>
    </Card>
  );
} 