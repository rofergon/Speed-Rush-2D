import React from 'react';
import { Card, Typography, Box, Chip, Button } from '@mui/material';
import { PartType } from '../types/parts';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

interface PartCardProps {
  partId: string;
  partType: number;
  stats: any;
  isEquipped: boolean;
  equippedToCarId?: string;
  imageURI: string;
  onEquip?: () => void;
  onUnequip?: () => void;
  canEquip?: boolean;
}

const getPartTypeLabel = (type: number): string => {
  switch (type) {
    case 0:
      return 'Motor';
    case 1:
      return 'Transmisión';
    case 2:
      return 'Ruedas';
    default:
      return 'Desconocido';
  }
};

const getPartTypeColor = (type: number): string => {
  switch (type) {
    case 0:
      return '#ff4444';
    case 1:
      return '#44b0ff';
    case 2:
      return '#44ff44';
    default:
      return '#999999';
  }
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

export const PartCard: React.FC<PartCardProps> = ({
  partId,
  partType,
  stats,
  isEquipped,
  equippedToCarId,
  imageURI,
  onEquip,
  onUnequip,
  canEquip
}) => {
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
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease-in-out',
          borderColor: getPartTypeColor(partType)
        }
      }}
    >
      <Box 
        sx={{
          position: 'relative',
          paddingTop: '75%', // 4:3 Aspect Ratio
          overflow: 'hidden',
          background: `linear-gradient(45deg, rgba(0,0,0,0.2), rgba(${partType === 0 ? '255,68,68' : partType === 1 ? '68,176,255' : '68,255,68'},0.1))`
        }}
      >
        <Box
          component="img"
          src={imageURI}
          alt={`Parte ${partId}`}
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
          label={isEquipped ? `Equipado #${equippedToCarId}` : 'No equipado'} 
          color={isEquipped ? "success" : "default"}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: isEquipped ? 'rgba(46, 125, 50, 0.9)' : 'rgba(66, 66, 66, 0.9)',
            backdropFilter: 'blur(4px)',
            '& .MuiChip-label': {
              fontWeight: 500
            }
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
            {getPartTypeLabel(partType)}
          </Typography>
        </Box>

        <Box className="space-y-1.5 mb-4">
          {partType === 0 && ( // Motor
            <>
              <StatDisplay label="Velocidad" value={stats.speed} icon={<SpeedIcon />} />
              <StatDisplay label="Velocidad Máxima" value={stats.maxSpeed} icon={<DirectionsCarIcon />} />
              <StatDisplay label="Aceleración" value={stats.acceleration} icon={<RocketLaunchIcon />} />
            </>
          )}
          {partType === 1 && ( // Transmisión
            <>
              <StatDisplay label="Aceleración" value={stats.acceleration} icon={<RocketLaunchIcon />} />
              <StatDisplay label="Velocidad" value={stats.speed} icon={<SpeedIcon />} />
              <StatDisplay label="Manejo" value={stats.handling} icon={<TuneIcon />} />
            </>
          )}
          {partType === 2 && ( // Ruedas
            <>
              <StatDisplay label="Manejo" value={stats.handling} icon={<TuneIcon />} />
              <StatDisplay label="Factor de Derrape" value={stats.driftFactor} icon={<CompareArrowsIcon />} />
              <StatDisplay label="Factor de Giro" value={stats.turnFactor} icon={<TurnSlightRightIcon />} />
            </>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          {canEquip && onEquip && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={onEquip}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
              }}
            >
              Equipar
            </Button>
          )}
          {isEquipped && onUnequip && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<RemoveCircleOutlineIcon />}
              onClick={onUnequip}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'rgba(244, 67, 54, 0.5)',
                '&:hover': {
                  borderColor: '#f44336',
                  background: 'rgba(244, 67, 54, 0.08)'
                }
              }}
            >
              Desequipar
            </Button>
          )}
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            display: 'block',
            opacity: 0.7,
            textAlign: 'right'
          }}
        >
          ID: {partId}
        </Typography>
      </Box>
    </Card>
  );
}; 