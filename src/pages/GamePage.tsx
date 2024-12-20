import React from 'react';
import { UnityGame } from '../components/UnityGame';
import { Leaderboard } from '../components/Leaderboard';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GamePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-[95%] mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8"
        >
          <Home className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </Link>
        
        <div className="flex flex-col gap-8">
          <div className="w-full bg-gray-800 rounded-lg">
            <UnityGame />
          </div>
          <div className="max-w-2xl mx-auto w-full">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
} 