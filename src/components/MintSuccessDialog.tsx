import React from 'react';
import { Dialog, DialogContent, Box, Typography, Button } from '@mui/material';
import { Car } from '../types/car';
import Confetti from 'react-confetti';
import { CarCard } from './CarCard';

interface MintSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  car: Car | null;
}

export function MintSuccessDialog({ open, onClose, car }: MintSuccessDialogProps) {
  if (!car) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />
      
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2
            }}
          >
            🎉 Congratulations! 🎉
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500
            }}
          >
            You've successfully minted a new racing car!
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <CarCard
            car={car}
            onSelect={() => {}}
            selected={false}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              minWidth: '120px',
              py: 1.5,
              px: 4
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/profile'}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              minWidth: '120px',
              py: 1.5,
              px: 4
            }}
          >
            Go to Garage
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 