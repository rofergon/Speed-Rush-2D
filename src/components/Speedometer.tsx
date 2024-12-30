import React from 'react';

interface SpeedometerProps {
  value: number; // valor entre 1 y 10
  size?: number; // tamaño del tacómetro en píxeles
}

export function Speedometer({ value, size = 100 }: SpeedometerProps) {
  // Asegurar que el valor esté entre 1 y 10
  const normalizedValue = Math.min(10, Math.max(1, value));
  
  // Convertir el valor de 1-10 a porcentaje (0-100)
  const percentageValue = ((normalizedValue - 1) / 9) * 100;
  
  // Calcular el ángulo para el indicador
  const startAngle = -150; // Comenzar desde -150 grados
  const endAngle = 150; // Terminar en 150 grados
  const angleRange = endAngle - startAngle;
  
  // Determinar el color basado en el valor (1-10)
  const getColor = (value: number) => {
    if (value <= 3) return '#EF4444'; // rojo
    if (value <= 6) return '#F59E0B'; // amarillo
    return '#10B981'; // verde
  };

  // Calcular dimensiones relativas al tamaño
  const strokeWidth = size * 0.09;
  const radius = size * 0.4; // Ajustado para ser relativo al tamaño
  const center = size * 0.5; // El centro siempre será la mitad del tamaño

  // Función para convertir grados a coordenadas
  const polarToCartesian = (angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians)
    };
  };

  // Crear el path SVG para un arco
  const createArc = (start: number, end: number) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = Math.abs(end - start) <= 180 ? 0 : 1;

    return [
      'M', startPoint.x, startPoint.y,
      'A', radius, radius, 0, largeArcFlag, 1, endPoint.x, endPoint.y
    ].join(' ');
  };

  // Calcular el ángulo final para el arco de progreso
  const progressEndAngle = startAngle + ((endAngle - startAngle) * (percentageValue / 100));

  return (
    <div className="relative bg-gray-900 rounded-full" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Arco de fondo */}
        <path
          d={createArc(startAngle, endAngle)}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Arco de progreso */}
        <path
          d={createArc(startAngle, progressEndAngle)}
          fill="none"
          stroke={getColor(normalizedValue)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Valor numérico centrado */}
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
        
        {/* Etiqueta de Performance */}
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