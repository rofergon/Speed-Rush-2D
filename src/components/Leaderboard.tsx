import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from './LeaderboardEntry';
import { Clock, Star, Trophy } from 'lucide-react';
import { ethers } from 'ethers';

interface RaceResult {
  player: string;
  carId: bigint;
  time: bigint;
  timestamp: bigint;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'allTime'>('daily');
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          import.meta.env.VITE_RACE_LEADERBOARD_ADDRESS,
          [
            "function getRaceResult(uint256 tokenId) view returns (tuple(address player, uint256 carId, uint256 time, uint256 timestamp))",
            "function mintRaceResult(uint256 carId, uint256 time) external returns (uint256)",
            "function raceResults(uint256) view returns (address player, uint256 carId, uint256 time, uint256 timestamp)"
          ],
          provider
        );

        // Get all results
        const allResults: RaceResult[] = [];
        let tokenId = 1;
        
        while (true) {
          try {
            const result = await contract.raceResults(tokenId);
            if (result.player === "0x0000000000000000000000000000000000000000") break;
            allResults.push(result);
            tokenId++;
          } catch (error) {
            break;
          }
        }

        // Filter based on active tab
        const now = BigInt(Math.floor(Date.now() / 1000));
        const dayInSeconds = BigInt(24 * 60 * 60);
        const weekInSeconds = dayInSeconds * BigInt(7);

        const filteredResults = allResults.filter(result => {
          const age = now - result.timestamp;
          switch(activeTab) {
            case 'daily':
              return age <= dayInSeconds;
            case 'weekly':
              return age <= weekInSeconds;
            default:
              return true;
          }
        });

        // Sort by time (ascending)
        filteredResults.sort((a, b) => Number(a.time - b.time));

        // Group by carId and keep only best time for each car
        const bestTimesByCarId = new Map<string, RaceResult>();
        filteredResults.forEach(result => {
          const carId = result.carId.toString();
          if (!bestTimesByCarId.has(carId) || result.time < bestTimesByCarId.get(carId)!.time) {
            bestTimesByCarId.set(carId, result);
          }
        });

        setResults(Array.from(bestTimesByCarId.values()));
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [activeTab]);

  const formatTime = (timeMs: bigint): string => {
    const totalSeconds = Number(timeMs) / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds * 100) % 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold">Leaderboard</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'daily' ? 'bg-red-600' : 'bg-gray-700'
            }`}
            onClick={() => setActiveTab('daily')}
          >
            <Clock className="w-4 h-4" />
            Daily
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'weekly' ? 'bg-red-600' : 'bg-gray-700'
            }`}
            onClick={() => setActiveTab('weekly')}
          >
            <Star className="w-4 h-4" />
            Weekly
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'allTime' ? 'bg-red-600' : 'bg-gray-700'
            }`}
            onClick={() => setActiveTab('allTime')}
          >
            <Trophy className="w-4 h-4" />
            All Time
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No results yet</div>
        ) : (
          results.map((result, index) => (
            <LeaderboardEntry
              key={`${result.player}-${result.timestamp}`}
              position={index + 1}
              username={result.player}
              time={formatTime(result.time)}
              carId={result.carId}
            />
          ))
        )}
      </div>
    </div>
  );
}