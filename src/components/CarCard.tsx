import React, { useState, useEffect } from 'react';
import { Card, Typography, Box, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Car } from '../types/car';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { xionService } from '../services/xionService';
import { GAME_CONTRACTS } from '../providers/XionProvider';
import { toast } from 'react-hot-toast';
import { partsService } from '../services/partsService';

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

interface AvailablePartsDialogProps {
  open: boolean;
  onClose: () => void;
  partType: string;
  availableParts: any[];
  onSelectPart: (partId: number) => void;
  isLoading?: boolean;
}

interface Part {
  part_id: number;
  part_type: 'Engine' | 'Transmission' | 'Wheels';
  stats: {
    stat1: number;
    stat2: number;
    stat3: number;
    image_uri: string;
  };
}

const partTypes: Array<'Engine' | 'Transmission' | 'Wheels'> = ['Engine', 'Transmission', 'Wheels'];

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

const AvailablePartsDialog = ({ 
  open, 
  onClose, 
  partType, 
  availableParts,
  onSelectPart,
  isLoading 
}: AvailablePartsDialogProps) => (
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
        minWidth: '360px',
        maxWidth: '600px',
        maxHeight: '80vh'
      }
    }}
  >
    <DialogTitle sx={{ textAlign: 'center' }}>Available {partType}s</DialogTitle>
    <DialogContent sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      minHeight: '200px'
    }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando partes disponibles...
          </span>
        </Box>
      ) : availableParts.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: 'gray' }}>
          No hay partes disponibles de este tipo
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {availableParts.map((part) => (
            <Grid item xs={12} key={part.part_id}>
              <Box
                onClick={() => onSelectPart(part.part_id)}
                sx={{
                  backgroundColor: 'rgba(20, 40, 30, 0.6)',
                  borderRadius: '8px',
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 50, 40, 0.8)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={part.stats.image_uri}
                    alt={`${partType} #${part.part_id}`}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">
                      {partType} #{part.part_id}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="gray">Vel</Typography>
                        <Typography>{part.stats.stat1}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="gray">Acel</Typography>
                        <Typography>{part.stats.stat2}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="gray">Man</Typography>
                        <Typography>{part.stats.stat3}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </DialogContent>
    <DialogActions sx={{ padding: 2, justifyContent: 'center' }}>
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
        Close
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

const PartDisplay = ({ part, type, car_id }: { part: any, type: string, car_id: number }) => {
  const [unequipDialogOpen, setUnequipDialogOpen] = useState(false);
  const [availablePartsDialogOpen, setAvailablePartsDialogOpen] = useState(false);
  const [isUnequipping, setIsUnequipping] = useState(false);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  
  const stats = part?.stats || {};
  const imageUri = stats.image_uri || `https://gateway.lighthouse.storage/ipfs/default_part_${type.toLowerCase()}.png`;

  const loadAvailableParts = async () => {
    if (!client || !account.bech32Address) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setIsLoadingParts(true);
      const parts = await partsService.getUserParts(client, account.bech32Address);
      const availableParts = parts.filter(p => 
        p.part_type === type && !p.isEquipped
      );
      setAvailableParts(availableParts);
    } catch (error) {
      console.error('Error loading available parts:', error);
      toast.error('Error al cargar las partes disponibles');
    } finally {
      setIsLoadingParts(false);
    }
  };

  const handleClick = () => {
    if (part?.part_id) {
      setUnequipDialogOpen(true);
    } else {
      loadAvailableParts();
      setAvailablePartsDialogOpen(true);
    }
  };

  const handleConfirmUnequip = async () => {
    if (!client || !account.bech32Address) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setIsUnequipping(true);
      
      await xionService.unequipPart(
        client,
        account.bech32Address,
        GAME_CONTRACTS.TREASURY,
        car_id,
        part.part_id
      );

      setUnequipDialogOpen(false);
      window.location.reload();
      
    } catch (error) {
      console.error('Error al desequipar parte:', error);
      toast.error('Error al desequipar la parte');
    } finally {
      setIsUnequipping(false);
    }
  };

  const handleSelectPart = async (partId: number) => {
    if (!client || !account.bech32Address) {
      toast.error('Por favor conecta tu wallet primero');
      return;
    }

    try {
      const slotIndex = partTypes.indexOf(type);
      await xionService.equipPart(
        client,
        account.bech32Address,
        GAME_CONTRACTS.TREASURY,
        car_id,
        partId,
        slotIndex
      );

      setAvailablePartsDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al equipar parte:', error);
      toast.error('Error al equipar la parte');
    }
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: part?.part_id ? 'rgba(20, 40, 30, 0.6)' : 'rgba(20, 20, 20, 0.4)',
          borderRadius: '8px',
          p: 1,
          mb: 1,
          cursor: 'pointer',
          border: part?.part_id ? 'none' : '2px dashed rgba(255, 255, 255, 0.1)',
          '&:hover': part?.part_id ? {
            backgroundColor: 'rgba(30, 50, 40, 0.8)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          } : {
            backgroundColor: 'rgba(30, 30, 30, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }
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
                borderRadius: '4px',
                opacity: part?.part_id ? 1 : 0.5,
                filter: part?.part_id ? 'none' : 'grayscale(100%)'
              }}
              onError={(e: any) => {
                e.target.src = `https://gateway.lighthouse.storage/ipfs/default_part_${type.toLowerCase()}.png`;
              }}
            />
            <Typography variant="body2" color={part?.part_id ? 'white' : 'gray'}>
              {type}
            </Typography>
          </Box>
          <Typography variant="caption" color="gray">
            {part?.part_id ? `#${part.part_id}` : 'Empty'}
          </Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Vel</Typography>
            <Typography variant="body2" color={part?.part_id ? 'white' : 'gray'}>{stats.speed || stats.stat1 || 0}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Acel</Typography>
            <Typography variant="body2" color={part?.part_id ? 'white' : 'gray'}>{stats.acceleration || stats.stat2 || 0}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="gray">Man</Typography>
            <Typography variant="body2" color={part?.part_id ? 'white' : 'gray'}>{stats.handling || stats.stat3 || 0}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Dialog 
        open={unequipDialogOpen} 
        onClose={() => !isUnequipping && setUnequipDialogOpen(false)}
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
            alt={type}
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
              e.target.src = `https://gateway.lighthouse.storage/ipfs/default_part_${type.toLowerCase()}.png`;
            }}
          />
          <Typography>
            Are you sure you want to unequip this {type} (#{part?.part_id})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center', gap: 1 }}>
          <Button
            onClick={() => setUnequipDialogOpen(false)}
            variant="contained"
            disabled={isUnequipping}
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
            onClick={handleConfirmUnequip}
            variant="contained"
            disabled={isUnequipping}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              minWidth: '120px',
              position: 'relative'
            }}
          >
            {isUnequipping ? (
              <>
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Desequipando...
                </span>
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <AvailablePartsDialog
        open={availablePartsDialogOpen}
        onClose={() => setAvailablePartsDialogOpen(false)}
        partType={type}
        availableParts={availableParts}
        onSelectPart={handleSelectPart}
        isLoading={isLoadingParts}
      />
    </>
  );
};

export function CarCard({ car, onCancelListing, onSelect, selected }: CarCardProps) {
  const partsMap: Record<'Engine' | 'Transmission' | 'Wheels', Part | undefined> = {
    Engine: car.parts.find(part => part.part_type === 'Engine'),
    Transmission: car.parts.find(part => part.part_type === 'Transmission'),
    Wheels: car.parts.find(part => part.part_type === 'Wheels')
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
            {partTypes.map((type) => (
              <PartDisplay 
                key={type} 
                part={partsMap[type]} 
                type={type}
                car_id={car.car_id}
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