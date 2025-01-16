import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export interface SpeedometerProps {
  value: number;
  max: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
}

export function Speedometer({ value, max, label, size = 'medium' }: SpeedometerProps) {
  const percentage = (value / max) * 100;
  const sizeMap = {
    small: {
      width: 40,
      height: 40,
      fontSize: '0.75rem'
    },
    medium: {
      width: 60,
      height: 60,
      fontSize: '0.875rem'
    },
    large: {
      width: 80,
      height: 80,
      fontSize: '1rem'
    }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          sx={{
            color: 'rgba(255, 255, 255, 0.1)',
            position: 'absolute',
            width: width,
            height: height
          }}
        />
        <CircularProgress
          variant="determinate"
          value={percentage}
          sx={{
            color: 'primary.main',
            width: width,
            height: height
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="white"
            sx={{ fontSize }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        component="div"
        color="white"
        sx={{ mt: 1, fontSize }}
      >
        {label}
      </Typography>
    </Box>
  );
}