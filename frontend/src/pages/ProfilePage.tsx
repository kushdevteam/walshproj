import React from 'react';
import { User, Coins, Trophy, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

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
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* First Solver Badge */}
              {user.reputation > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-900">First Solver</p>
                  <p className="text-xs text-yellow-700">Solved your first problem</p>
                </div>
              )}
              
              {/* Token Collector Badge */}
              {user.token_balance >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Token Collector</p>
                  <p className="text-xs text-green-700">Earned 100+ tokens</p>
                </div>
              )}
              
              {/* Validator Badge */}
              {user.is_validator && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900">Validator</p>
                  <p className="text-xs text-purple-700">Trusted community validator</p>
                </div>
              )}

              {/* Placeholder for more achievements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center opacity-50">
                <div className="h-8 w-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-500">More Coming</p>
                <p className="text-xs text-gray-400">Keep solving!</p>
              </div>
            </div>
          </div>
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
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Level</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Level</span>
                <span className="font-semibold text-gray-900">
                  {user.reputation < 50 ? 'Novice' :
                   user.reputation < 100 ? 'Apprentice' :
                   user.reputation < 250 ? 'Expert' : 'Master'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary-600 h-2 rounded-full" 
                  style={{
                    width: `${Math.min((user.reputation % 50) * 2, 100)}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>Next: {Math.ceil(user.reputation / 50) * 50} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};