import React from 'react';

interface Part {
  partId: string;
  partType: number;
  imageURI: string;
  stats: {
    speed?: number;
    maxSpeed?: number;
    acceleration?: number;
    handling?: number;
    driftFactor?: number;
    turnFactor?: number;
  };
}

interface PartDetailsDialogProps {
  part: Part | null;
  onClose: () => void;
}

export function PartDetailsDialog({ part, onClose }: PartDetailsDialogProps) {
  if (!part) return null;

  const getPartTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "Motor";
      case 1:
        return "Transmisión";
      case 2:
        return "Ruedas";
      default:
        return "Desconocido";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {getPartTypeName(part.partType)} #{part.partId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <img
          src={part.imageURI}
          alt={`Part ${part.partId}`}
          className="w-full h-64 object-contain rounded-lg mb-4 bg-gray-900"
        />

        <div className="grid grid-cols-2 gap-4">
          {part.stats.speed !== undefined && (
            <div>
              <span className="text-gray-400">Velocidad:</span>{" "}
              <span className="text-white">{part.stats.speed}</span>
            </div>
          )}
          {part.stats.maxSpeed !== undefined && (
            <div>
              <span className="text-gray-400">Vel. Máx:</span>{" "}
              <span className="text-white">{part.stats.maxSpeed}</span>
            </div>
          )}
          {part.stats.acceleration !== undefined && (
            <div>
              <span className="text-gray-400">Aceleración:</span>{" "}
              <span className="text-white">{part.stats.acceleration}</span>
            </div>
          )}
          {part.stats.handling !== undefined && (
            <div>
              <span className="text-gray-400">Manejo:</span>{" "}
              <span className="text-white">{part.stats.handling}</span>
            </div>
          )}
          {part.stats.driftFactor !== undefined && (
            <div>
              <span className="text-gray-400">Drift:</span>{" "}
              <span className="text-white">{part.stats.driftFactor}</span>
            </div>
          )}
          {part.stats.turnFactor !== undefined && (
            <div>
              <span className="text-gray-400">Giro:</span>{" "}
              <span className="text-white">{part.stats.turnFactor}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 