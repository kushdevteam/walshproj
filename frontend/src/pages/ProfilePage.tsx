import React, { useEffect, useState } from 'react';
import { User, Coins, Trophy, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ReputationLevelComponent } from '../components/ReputationLevel';
import { AchievementBadges } from '../components/AchievementBadges';
import { userService } from '../services/api';
import { ReputationLevel } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [reputationData, setReputationData] = useState<ReputationLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReputationData = async () => {
      if (!user) return;
      
      try {
        const data = await userService.getUserReputation();
        setReputationData(data);
      } catch (error) {
        console.error('Failed to fetch reputation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputationData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and view your achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                  {user.is_validator && (
                    <div className="flex items-center space-x-1 text-secondary-600">
                      <Shield className="h-4 w-4" />
                      <span>Validator</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Coins className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-primary-700 font-medium">Token Balance</p>
                    <p className="text-2xl font-bold text-primary-900">{user.token_balance}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-secondary-600" />
                  <div>
                    <p className="text-sm text-secondary-700 font-medium">Reputation</p>
                    <p className="text-2xl font-bold text-secondary-900">{user.reputation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <AchievementBadges user={user} />
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Balance</span>
                <span className="font-semibold text-primary-600">{user.token_balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reputation Points</span>
                <span className="font-semibold text-secondary-600">{user.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type</span>
                <span className="font-semibold text-gray-900">
                  {user.is_validator ? 'Validator' : 'Solver'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {new Date(user.created_at).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Reputation Levels */}
          {loading ? (
            <div className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            reputationData && (
              <ReputationLevelComponent 
                reputationData={reputationData} 
                currentReputation={user.reputation} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};