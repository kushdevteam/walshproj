import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Coins, User, ArrowRight } from 'lucide-react';
import { Problem } from '../types';

interface ProblemCardProps {
  problem: Problem;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card hover:border-primary-200 transition-colors">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {problem.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {problem.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{problem.author.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(problem.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-primary-600 font-medium">
            <Coins className="h-4 w-4" />
            <span>{problem.reward_amount} tokens</span>
          </div>
        </div>
        
        <Link
          to={`/problems/${problem.id}`}
          className="flex items-center justify-center space-x-2 bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <span>View Problem</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};