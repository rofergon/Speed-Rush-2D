import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

type LeaderboardEntryProps = {
  position: number;
  username: string;
  score: number;
  time: string;
};

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
};

export function LeaderboardEntry({ position, username, score, time }: LeaderboardEntryProps) {
  return (
    <div className={`flex items-center p-3 ${position <= 3 ? 'bg-gray-700/50' : 'bg-gray-800/30'} rounded-lg hover:bg-gray-600/50 transition-all`}>
      <div className="w-12 text-center flex items-center justify-center">
        {getRankIcon(position) || <span className="text-gray-400 font-medium">{position}</span>}
      </div>
      <div className="flex-1 px-4">
        <span className="font-medium text-gray-100">{username}</span>
      </div>
      <div className="px-4 text-right">
        <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
      </div>
      <div className="w-24 text-right">
        <span className="text-gray-400 font-medium">{time}</span>
      </div>
    </div>
  );
}