import React, { useState } from 'react';
import { LeaderboardEntry } from './LeaderboardEntry';
import { Clock, Star, Trophy } from 'lucide-react';

const MOCK_DATA = [
  { id: 1, username: "SpeedMaster", score: 10200, time: "1:23.45" },
  { id: 2, username: "RacingQueen", score: 9800, time: "1:24.12" },
  { id: 3, username: "DriftKing", score: 9500, time: "1:24.89" },
  { id: 4, username: "NitroBoost", score: 9100, time: "1:25.34" },
  { id: 5, username: "RoadRunner", score: 8900, time: "1:25.67" },
];

type LeaderboardTab = 'daily' | 'weekly' | 'allTime';

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('daily');

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold">Leaderboard</h3>
        <div className="flex flex-wrap gap-2">
          <TabButton 
            active={activeTab === 'daily'} 
            onClick={() => setActiveTab('daily')}
            icon={<Clock className="w-4 h-4" />}
          >
            Daily
          </TabButton>
          <TabButton 
            active={activeTab === 'weekly'} 
            onClick={() => setActiveTab('weekly')}
            icon={<Star className="w-4 h-4" />}
          >
            Weekly
          </TabButton>
          <TabButton 
            active={activeTab === 'allTime'} 
            onClick={() => setActiveTab('allTime')}
            icon={<Trophy className="w-4 h-4" />}
          >
            All Time
          </TabButton>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {MOCK_DATA.map((entry, index) => (
          <LeaderboardEntry
            key={entry.id}
            position={index + 1}
            username={entry.username}
            score={entry.score}
            time={entry.time}
          />
        ))}
      </div>
    </div>
  );
}

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
};

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}