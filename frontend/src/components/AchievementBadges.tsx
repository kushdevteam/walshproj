import React from 'react';
import { Trophy, Target, Users, Zap, Brain, Star } from 'lucide-react';
import { User } from '../types';

interface AchievementBadgesProps {
  user: User;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  requirement?: string;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ user }) => {
  const badges: Badge[] = [
    {
      id: 'first_solution',
      name: 'Problem Solver',
      description: 'Submit your first solution',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-blue-500',
      earned: user.reputation > 0,
      requirement: 'Submit 1 solution'
    },
    {
      id: 'validator_badge',
      name: 'Validator',
      description: 'Validate solutions and maintain network quality',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-green-500',
      earned: user.is_validator,
      requirement: 'Become a validator'
    },
    {
      id: 'reputation_100',
      name: 'Rising Star',
      description: 'Reach 100 reputation points',
      icon: <Star className="h-5 w-5" />,
      color: 'bg-yellow-500',
      earned: user.reputation >= 100,
      requirement: '100 reputation points'
    },
    {
      id: 'reputation_500',
      name: 'Expert Level',
      description: 'Reach 500 reputation points',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-purple-500',
      earned: user.reputation >= 500,
      requirement: '500 reputation points'
    },
    {
      id: 'high_earner',
      name: 'Token Master',
      description: 'Accumulate over 200 tokens',
      icon: <Trophy className="h-5 w-5" />,
      color: 'bg-orange-500',
      earned: user.token_balance >= 200,
      requirement: '200+ tokens'
    },
    {
      id: 'community_contributor',
      name: 'Community Leader',
      description: 'Contribute to network growth and quality',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-indigo-500',
      earned: user.reputation >= 300 && user.is_validator,
      requirement: '300+ reputation + validator'
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Badges</h3>
      
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Earned ({earnedBadges.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className={`${badge.color} text-white p-2 rounded-full mb-2`}>
                  {badge.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Available ({availableBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60"
              >
                <div className="bg-gray-400 text-white p-2 rounded-full mb-2">
                  {badge.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">{badge.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{badge.requirement}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">Start solving problems to earn badges!</p>
        </div>
      )}
    </div>
  );
};