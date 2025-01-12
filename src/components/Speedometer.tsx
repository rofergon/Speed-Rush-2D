import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export interface SpeedometerProps {
  value: number;
  max: number;
  label: string;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ value, max, label }) => {
  const percentage = (value / max) * 100;

  return (
    <Box className="relative flex flex-col items-center">
      <Box className="relative w-16 h-16">
        <CircularProgress
          variant="determinate"
          value={100}
          size={64}
          thickness={4}
          sx={{
            color: 'rgba(255, 255, 255, 0.1)',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={64}
          thickness={4}
          sx={{
            color: percentage > 75 ? '#22c55e' : percentage > 50 ? '#eab308' : '#ef4444',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        <Box
          className="absolute inset-0 flex items-center justify-center"
        >
          <Typography variant="caption" color="white" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        color="white"
        className="mt-1 text-center"
      >
        {label}
      </Typography>
    </Box>
  );
};