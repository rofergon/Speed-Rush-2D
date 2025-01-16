import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Speedometer } from './Speedometer';
import { Part } from '../types/parts';
import { Car } from '../types/car';

interface UnequipDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageUri: string;
}

function UnequipDialog({ open, onClose, onConfirm, imageUri }: UnequipDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        style: {
          minWidth: '360px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        Unequip Part
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <img 
            src={imageUri} 
            alt="Part" 
            style={{ 
              width: '160px', 
              height: '160px', 
              borderRadius: '12px',
              padding: '3px',
              backgroundColor: '#2a2a2a'
            }} 
          />
        </Box>
        <Typography>
          Are you sure you want to unequip this part?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #FF512F 30%, #F09819 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF512F 10%, #F09819 70%)'
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface PartCardProps {
  part: Part;
  selectedCar?: Car;
  onEquip: (partId: number, carId: number, slotIndex: number) => Promise<void>;
  onUnequip: (partId: number, carId: number) => Promise<void>;
}

export function PartCard({ part, selectedCar, onEquip, onUnequip }: PartCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEquip = async () => {
    if (!selectedCar) return;
    await onEquip(part.part_id, selectedCar.car_id, part.slot_index || 0);
  };

  const handleUnequipClick = () => {
    console.log('Part state:', {
      part_id: part.part_id,
      isEquipped: part.isEquipped,
      equippedToCarId: part.equippedToCarId
    });
    setDialogOpen(true);
  };

  const handleConfirmUnequip = async () => {
    console.log('Confirming unequip for part:', {
      part_id: part.part_id,
      equippedToCarId: part.equippedToCarId
    });
    if (!part.equippedToCarId) {
      console.error('No equippedToCarId found for part:', part);
      return;
    }
    await onUnequip(part.part_id, part.equippedToCarId);
    setDialogOpen(false);
  };

  const canEquip = selectedCar && !part.isEquipped && 
    !selectedCar.parts.some(p => p.part_type === part.part_type);

  return (
    <>
      <Card sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
        }
      }}>
        <Box sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          background: 'linear-gradient(45deg, #FF512F 30%, #F09819 90%)',
        }}>
          <CardMedia
            component="img"
            image={part.image_uri}
            alt={`${part.part_type} #${part.part_id}`}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {part.part_type} #{part.part_id}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            <Speedometer value={part.stats.stat1} max={10} label="Stat 1" size="small" />
            <Speedometer value={part.stats.stat2} max={10} label="Stat 2" size="small" />
            <Speedometer value={part.stats.stat3} max={10} label="Stat 3" size="small" />
          </Box>

          {part.isEquipped ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleUnequipClick}
              sx={{
                background: 'linear-gradient(45deg, #FF512F 30%, #F09819 90%)',
                color: 'white',
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF512F 10%, #F09819 70%)'
                }
              }}
            >
              Unequip
            </Button>
          ) : canEquip ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleEquip}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #2196F3 10%, #21CBF3 70%)'
                }
              }}
            >
              Equip
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <UnequipDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmUnequip}
        imageUri={part.image_uri}
      />
    </>
  );
} 