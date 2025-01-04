import React, { useState } from 'react';
import { Card, Typography, Box, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BuildIcon from '@mui/icons-material/Build';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import SettingsIcon from '@mui/icons-material/Settings';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface CarStats {
  speed: number;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  driftFactor: number;
  turnFactor: number;
}

interface Part {
  partId: string;
  partType: number;
  stats: any;
  imageURI: string;
  isEquipped: boolean;
  equippedToCarId?: string;
}

interface CarCardProps {
  id: string;
  imageUrl: string;
  stats?: Partial<CarStats>;
  parts?: Part[];
  availableParts?: Part[];
  onSelect?: () => void;
  onEquipPart?: (partId: string, slotType: number) => Promise<void>;
  onUnequipPart?: (partId: string) => Promise<void>;
  isSelected?: boolean;
  alternativeSkin?: boolean;
}

const defaultStats: CarStats = {
  speed: 0,
  maxSpeed: 0,
  acceleration: 0,
  handling: 0,
  driftFactor: 0,
  turnFactor: 0
};

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

interface PartSlotProps {
  type: number;
  part?: Part;
  availableParts?: Part[];
  onEquipPart?: (partId: string) => Promise<void>;
  onUnequipPart?: (partId: string) => Promise<void>;
}

const PartSlot: React.FC<PartSlotProps> = ({ type, part, availableParts = [], onEquipPart, onUnequipPart }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUnequipDialogOpen, setIsUnequipDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const getSlotIcon = (type: number) => {
    switch (type) {
      case 0:
        return <EngineeringIcon />;
      case 1:
        return <SettingsIcon />;
      case 2:
        return <PrecisionManufacturingIcon />;
      default:
        return <BuildIcon />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (part) {
      setIsUnequipDialogOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleEquip = async (partId: string) => {
    if (onEquipPart) {
      setIsLoading(true);
      try {
        await onEquipPart(partId);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error equipando parte:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUnequip = async () => {
    if (part && onUnequipPart) {
      setIsLoading(true);
      try {
        await onUnequipPart(part.partId);
        setIsUnequipDialogOpen(false);
      } catch (error) {
        console.error('Error desequipando parte:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredParts = availableParts.filter(p => p.partType === type);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          background: part ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: part ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
          }
        }}
      >
        {part ? (
          <Box
            component="img"
            src={part.imageURI}
            alt={`Part ${part.partId}`}
            sx={{
              width: '32px',
              height: '32px',
              objectFit: 'cover',
              borderRadius: '4px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
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
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px'
            }}
          >
            {getSlotIcon(type)}
          </Box>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {getSlotLabel(type)}
          </Typography>
          <Typography variant="body2" color="white">
            {part ? `#${part.partId}` : 'Vacío'}
          </Typography>
        </Box>
      </Box>

      {/* Diálogo para mostrar partes disponibles */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            minWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'white'
        }}>
          <SettingsIcon color="primary" />
          Select {getSlotLabel(type)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box className="grid grid-cols-2 gap-2">
            {filteredParts.filter(p => !p.isEquipped).length > 0 ? (
              filteredParts
                .filter(p => !p.isEquipped)
                .map((availablePart) => (
                  <Box
                    key={availablePart.partId}
                    onClick={() => handleEquip(availablePart.partId)}
                    sx={{
                      p: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: 'rgba(33, 150, 243, 0.05)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'rgba(33, 150, 243, 0.1)',
                        borderColor: 'rgba(33, 150, 243, 0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={availablePart.imageURI}
                      alt={`Part ${availablePart.partId}`}
                      sx={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" color="white">
                        #{availablePart.partId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available {getSlotLabel(type)}
                      </Typography>
                    </Box>
                  </Box>
                ))
            ) : (
              <Typography color="text.secondary" className="col-span-2 text-center py-4">
                No available parts of this type
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)'
        }}>
          <Button 
            onClick={() => setIsDialogOpen(false)} 
            variant="text"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para desequipar */}
      <Dialog
        open={isUnequipDialogOpen}
        onClose={() => setIsUnequipDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            minWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'white'
        }}>
          <DeleteOutlineIcon color="error" />
          Unequip {getSlotLabel(type)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            background: 'rgba(244, 67, 54, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}>
            {part && (
              <Box
                component="img"
                src={part.imageURI}
                alt={`Part ${part.partId}`}
                sx={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                }}
              />
            )}
            <Box>
              <Typography variant="body1" color="white" gutterBottom>
                Are you sure you want to unequip this part?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The part will return to your inventory
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)'
        }}>
          <Button 
            onClick={() => setIsUnequipDialogOpen(false)} 
            variant="text"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnequip}
            variant="contained"
            disabled={isLoading}
            startIcon={<DeleteOutlineIcon />}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #f50057 90%)',
              }
            }}
          >
            {isLoading ? 'Unequipping...' : 'Unequip Part'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const CarCard: React.FC<CarCardProps> = ({
  id,
  imageUrl,
  stats = defaultStats,
  parts = [],
  availableParts = [],
  onSelect,
  onEquipPart,
  onUnequipPart,
  isSelected,
  alternativeSkin
}) => {
  const combinedStats = { ...defaultStats, ...stats };

  const handleSlotClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el click del slot propague al card
  };

  return (
    <Card 
      className="bg-gray-800 hover:bg-gray-700 transition-all duration-200"
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: onSelect ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out',
          borderColor: isSelected ? '#f44336' : 'rgba(255, 255, 255, 0.3)'
        }
      }}
      onClick={onSelect}
    >
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

        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Box className="space-y-1.5 mb-4">
              <StatDisplay label="Speed" value={combinedStats.speed} icon={<SpeedIcon />} />
              <StatDisplay label="Max Speed" value={combinedStats.maxSpeed} icon={<DirectionsCarIcon />} />
              <StatDisplay label="Acceleration" value={combinedStats.acceleration} icon={<RocketLaunchIcon />} />
              <StatDisplay label="Handling" value={combinedStats.handling} icon={<TuneIcon />} />
              <StatDisplay label="Drift Factor" value={combinedStats.driftFactor} icon={<CompareArrowsIcon />} />
              <StatDisplay label="Turn Factor" value={combinedStats.turnFactor} icon={<TurnSlightRightIcon />} />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box className="space-y-2 mt-1 mb-4" onClick={handleSlotClick}>
              <PartSlot 
                type={0} 
                part={parts.find(p => p.partType === 0)}
                availableParts={availableParts}
                onEquipPart={(partId) => onEquipPart?.(partId, 0)}
                onUnequipPart={onUnequipPart}
              />
              <PartSlot 
                type={1} 
                part={parts.find(p => p.partType === 1)}
                availableParts={availableParts}
                onEquipPart={(partId) => onEquipPart?.(partId, 1)}
                onUnequipPart={onUnequipPart}
              />
              <PartSlot 
                type={2} 
                part={parts.find(p => p.partType === 2)}
                availableParts={availableParts}
                onEquipPart={(partId) => onEquipPart?.(partId, 2)}
                onUnequipPart={onUnequipPart}
              />
            </Box>
          </Grid>
        </Grid>

        {onSelect && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<BuildIcon />}
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
        )}
      </Box>
    </Card>
  );
}; 