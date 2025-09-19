import React from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import { ReputationLevel } from '../types';

interface ReputationLevelProps {
  reputationData: ReputationLevel;
  currentReputation: number;
}

export const ReputationLevelComponent: React.FC<ReputationLevelProps> = ({ 
  reputationData, 
  currentReputation 
}) => {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Novice':
        return <Star className="h-6 w-6 text-blue-600" />;
      case 'Expert':
        return <Award className="h-6 w-6 text-purple-600" />;
      case 'Master':
        return <Trophy className="h-6 w-6 text-yellow-600" />;
      default:
        return <Star className="h-6 w-6 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Novice':
        return 'bg-blue-500';
      case 'Expert':
        return 'bg-purple-500';
      case 'Master':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getNextLevel = (level: string) => {
    switch (level) {
      case 'Novice':
        return 'Expert';
      case 'Expert':
        return 'Master';
      case 'Master':
        return 'Grandmaster';
      default:
        return 'Expert';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getLevelIcon(reputationData.level)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{reputationData.level}</h3>
            <p className="text-sm text-gray-600">{currentReputation} reputation points</p>
          </div>
        </div>
        
        {reputationData.level !== 'Master' && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Next: {getNextLevel(reputationData.level)}</div>
            <div className="text-xs text-gray-500">
              {reputationData.max_reputation + 1 - currentReputation} points to go
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{reputationData.min_reputation}</span>
          <span className="text-gray-600">{reputationData.max_reputation}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${getLevelColor(reputationData.level)} transition-all duration-300`}
            style={{ width: `${reputationData.progress_percentage}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {reputationData.progress_percentage.toFixed(1)}% progress in {reputationData.level} level
        </div>
      </div>

      {reputationData.level === 'Master' && (
        <div className="mt-4 text-center text-sm text-yellow-600 font-medium">
          🏆 You've reached the highest level! 
        </div>
      )}
    </div>
  );
};