import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SettingsIcon from '@mui/icons-material/Settings';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import BuildIcon from '@mui/icons-material/Build';
import { Part } from '../types/parts';

interface PartSlotProps {
  type: number;
  label: string;
  equippedPart: Part | undefined;
  availableParts: Part[];
  onEquip: (partId: string) => void;
  onUnequip: (partId: string) => void;
}

export const PartSlot: React.FC<PartSlotProps> = ({
  type,
  label,
  equippedPart,
  availableParts,
  onEquip,
  onUnequip
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getSlotIcon = (type: number) => {
    switch (type) {
      case 0:
        return <EngineeringIcon sx={{ opacity: 0.7 }} />;
      case 1:
        return <SettingsIcon sx={{ opacity: 0.7 }} />;
      case 2:
        return <PrecisionManufacturingIcon sx={{ opacity: 0.7 }} />;
      default:
        return <BuildIcon sx={{ opacity: 0.7 }} />;
    }
  };

  const handleEquip = (partId: string) => {
    console.log('PartSlot: Equipando parte', { partId, type, label });
    if (!partId) {
      console.error('PartSlot: ID de parte inválido');
      return;
    }
    onEquip(partId);
    setIsDialogOpen(false);
  };

  console.log('PartSlot: Partes disponibles', {
    type,
    label,
    availableParts: availableParts.map(p => ({ id: p.id, type: p.partType }))
  });

  return (
    <>
      <Box
        onClick={() => !equippedPart && availableParts.length > 0 && setIsDialogOpen(true)}
        sx={{
          p: 1,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          background: equippedPart ? 'rgba(0, 255, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          mb: 1,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: equippedPart ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {equippedPart ? (
          <Box
            component="img"
            src={equippedPart.imageURI}
            alt={`Part ${equippedPart.id}`}
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
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {equippedPart ? `#${equippedPart.id}` : 'Empty'}
          </Typography>
        </Box>
        {equippedPart ? (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onUnequip(equippedPart.id);
            }}
            sx={{
              ml: 'auto',
              minWidth: 'auto',
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            ×
          </Button>
        ) : null}
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1A1A1A',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
            color: 'white',
            maxWidth: '600px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          Select Part for {label}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {availableParts.map((part) => (
              <Grid item xs={12} sm={6} key={part.id}>
                <Box
                  onClick={() => handleEquip(part.id)}
                  sx={{
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      component="img"
                      src={part.imageURI}
                      alt={`Part ${part.id}`}
                      sx={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1">Part #{part.id}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Object.entries(part.stats)
                          .filter(([, value]) => value !== undefined)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' | ')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 