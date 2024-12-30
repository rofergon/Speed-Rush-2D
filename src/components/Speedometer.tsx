import React from 'react';

interface SpeedometerProps {
  value: number; // value between 1 and 10
  size?: number; // speedometer size in pixels
}

export function Speedometer({ value, size = 100 }: SpeedometerProps) {
  // Ensure value is between 1 and 10
  const normalizedValue = Math.min(10, Math.max(1, value));
  
  // Convert value from 1-10 to percentage (0-100)
  const percentageValue = ((normalizedValue - 1) / 9) * 100;
  
  // Calculate angle for the indicator
  const startAngle = -150; // Start from -150 degrees
  const endAngle = 150; // End at 150 degrees
  const angleRange = endAngle - startAngle;
  
  // Determine color based on value (1-10)
  const getColor = (value: number) => {
    if (value <= 3) return '#EF4444'; // red
    if (value <= 6) return '#F59E0B'; // yellow
    return '#10B981'; // green
  };

  // Calculate dimensions relative to size
  const strokeWidth = size * 0.09;
  const radius = size * 0.4; // Adjusted to be relative to size
  const center = size * 0.5; // Center will always be half the size

  // Function to convert degrees to coordinates
  const polarToCartesian = (angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians)
    };
  };

  // Create SVG path for an arc
  const createArc = (start: number, end: number) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = Math.abs(end - start) <= 180 ? 0 : 1;

    return [
      'M', startPoint.x, startPoint.y,
      'A', radius, radius, 0, largeArcFlag, 1, endPoint.x, endPoint.y
    ].join(' ');
  };

  // Calculate final angle for progress arc
  const progressEndAngle = startAngle + ((endAngle - startAngle) * (percentageValue / 100));

  return (
    <div className="relative bg-gray-900 rounded-full" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background arc */}
        <path
          d={createArc(startAngle, endAngle)}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <path
          d={createArc(startAngle, progressEndAngle)}
          fill="none"
          stroke={getColor(normalizedValue)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Centered numeric value */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-bold"
          style={{ fontSize: size * 0.25 }}
        >
          {Math.round(normalizedValue)}
        </text>
        
        {/* Performance label */}
        <text
          x={center}
          y={center + (size * 0.15)}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-400"
          style={{ fontSize: size * 0.08 }}
        >
          Performance
        </text>
      </svg>
    </div>
  );
}