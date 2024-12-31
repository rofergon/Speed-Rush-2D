import React from 'react';
import { Coins, Car, Trophy, Wrench, Clock, Medal, Gauge, Cog } from 'lucide-react';

export function GameInfo() {
  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-800 rounded-lg p-8 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to Speed Rush 2D!</h2>
        <p className="text-gray-300">
          A racing game where your cars are unique NFTs on the blockchain and you compete for real rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Main Contracts */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Car className="w-6 h-6 mr-2 text-red-500" />
            Main Contracts
          </h3>
          
          <div className="space-y-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 flex items-center">
                <Gauge className="w-4 h-4 mr-2" />
                CarNFT
              </h4>
              <p className="text-sm text-gray-300">
                Main contract that manages your NFT cars. Each car is unique and has:
                <br />• Composition of 3 NFT parts (engine, transmission, wheels)
                <br />• Condition system that degrades with use
                <br />• Combined stats from all its parts
                <br />• Minting cost: 0.01 GRASS
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Stats include: speed, acceleration, handling, drift factor, turn factor, and max speed
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 flex items-center">
                <Cog className="w-4 h-4 mr-2" />
                CarPart
              </h4>
              <p className="text-sm text-gray-300">
                NFT parts system with three types:
                <br />• Engine: Affects speed, max speed, and acceleration
                <br />• Transmission: Affects acceleration, speed, and handling
                <br />• Wheels: Affects handling, drift, and turn factor
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Each part has stats from 1 to 10 and can be swapped between cars
              </p>
            </div>
          </div>
        </div>

        {/* Game System */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-red-500" />
            Game System
          </h3>
          
          <div className="space-y-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                3-Day Seasons
              </h4>
              <p className="text-sm text-gray-300">
                Every 3 days a season closes and players can mint their results on the Lens network.
                The minting cost goes to a reward pool that is distributed among the top 10 times.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 flex items-center">
                <Medal className="w-4 h-4 mr-2" />
                Reward System
              </h4>
              <p className="text-sm text-gray-300">
                The accumulated pool is distributed among the top 10 times:
                <br />• 1st place: 40% of the pool
                <br />• 2nd place: 20% of the pool
                <br />• 3rd to 10th place: 20% distributed equally
                <br />(approximately 2.5% each)
              </p>
              <p className="text-sm text-gray-300 mt-3">
                Results are recorded on Lens as NFTs, prove your achievements!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Coins className="w-6 h-6 mr-2 text-red-500" />
          Cost Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-red-400 mb-3">Car Minting</h4>
            <p className="text-sm text-gray-300">
              Minting cost: 0.01 GRASS<br />
              Includes the car and its 3 NFT parts
            </p>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-red-400 mb-3">Repairs</h4>
            <p className="text-sm text-gray-300">
              Repair cost: 0.01 GRASS<br />
              Restores condition to 100%
            </p>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h4 className="font-semibold text-red-400 mb-3">Lens Minting</h4>
            <p className="text-sm text-gray-300">
              Minting cost: 0.05 GRASS<br />
              100% goes to the reward pool
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-700 p-8 rounded-lg mt-12">
        <h4 className="font-semibold text-red-400 mb-6 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Tips
        </h4>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-3">
          <li>Keep your car in good condition for best performance</li>
          <li>Part stats directly affect racing performance</li>
          <li>Swap parts between your cars to optimize performance</li>
          <li>Participate in seasons to earn from the reward pool</li>
          <li>Your results will be permanently recorded on the Lens network</li>
          <li>Make it to the top 10 to secure your share of the rewards!</li>
        </ul>
      </div>
    </div>
  );
} 