import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, User, Plus, Gavel, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">PoI Network</h1>
        </Link>
        
        {user && (
          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/post-problem"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Post Problem</span>
            </Link>
            {user.is_validator && (
              <Link
                to="/validator"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium"
              >
                <Gavel className="h-4 w-4" />
                <span>Validate</span>
              </Link>
            )}
            <Link
              to="/transactions"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};