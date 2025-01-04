import React, { useState, useMemo } from 'react';
import { Part } from '../services/partsService';

interface PartsInventoryProps {
  parts: Part[];
  selectedCar?: {
    id: string;
    parts: Part[];
  };
  onEquipPart: (partId: string, carId: string) => Promise<void>;
  onUnequipPart: (partId: string, carId: string) => Promise<void>;
}

const partTypeNames = {
  0: 'Motor',
  1: 'Transmisión',
  2: 'Ruedas'
};

export function PartsInventory({ parts, selectedCar, onEquipPart, onUnequipPart }: PartsInventoryProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEquipped, setFilterEquipped] = useState<string>('all');

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const typeMatch = filterType === 'all' || part.partType === Number(filterType);
      const equippedMatch = filterEquipped === 'all' || 
        (filterEquipped === 'equipped' && part.isEquipped) ||
        (filterEquipped === 'unequipped' && !part.isEquipped);
      return typeMatch && equippedMatch;
    });
  }, [parts, filterType, filterEquipped]);

  const renderStats = (part: Part) => {
    return Object.entries(part.stats).map(([key, value]) => (
      <p key={key} className="text-sm">
        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
      </p>
    ));
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-4">
        <h2 className="text-xl font-bold">Inventario de Partes</h2>
        
        <div className="flex gap-4">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Todos los tipos</option>
            <option value="0">Motor</option>
            <option value="1">Transmisión</option>
            <option value="2">Ruedas</option>
          </select>

          <select 
            value={filterEquipped} 
            onChange={(e) => setFilterEquipped(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Todas las partes</option>
            <option value="equipped">Equipadas</option>
            <option value="unequipped">No equipadas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredParts.map((part) => (
          <div key={part.partId} className="bg-gray-700 rounded-lg p-4">
            <img 
              src={part.imageURI} 
              alt={`${partTypeNames[part.partType as keyof typeof partTypeNames]}`}
              className="w-full h-48 object-contain rounded-lg mb-3"
            />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-bold">
                  {partTypeNames[part.partType as keyof typeof partTypeNames]}
                </p>
                {part.isEquipped && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Equipado en Carro #{part.equippedToCarId}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {renderStats(part)}
              </div>

              {selectedCar && (
                <button
                  onClick={() => part.isEquipped ? 
                    onUnequipPart(part.partId, part.equippedToCarId!) : 
                    onEquipPart(part.partId, selectedCar.id)
                  }
                  className={`w-full mt-4 px-4 py-2 rounded-lg font-medium ${
                    part.isEquipped 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                >
                  {part.isEquipped ? 'Desequipar' : 'Equipar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredParts.length === 0 && (
        <p className="text-center mt-4 text-gray-400">
          No se encontraron partes con los filtros seleccionados
        </p>
      )}
    </div>
  );
} 