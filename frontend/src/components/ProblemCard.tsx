import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Coins, User, ArrowRight, CheckCircle, Clock3, Eye } from 'lucide-react';
import { Problem, ProblemStatus } from '../types';
import { statsService } from '../services/api';

interface ProblemCardProps {
  problem: Problem;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  const [status, setStatus] = useState<ProblemStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusData = await statsService.getProblemStatus(problem.id);
        setStatus(statusData);
      } catch (error) {
        // If status fetch fails, default to 'open'
        setStatus({ status: 'open', approved_solutions: 0, pending_solutions: 0 });
      }
    };

    fetchStatus();
  }, [problem.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusDisplay = () => {
    if (!status) return null;

    switch (status.status) {
      case 'solved':
        return (
          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Solved</span>
          </div>
        );
      case 'in_review':
        return (
          <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
            <Clock3 className="h-3 w-3" />
            <span>In Review</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
            <Eye className="h-3 w-3" />
            <span>Open</span>
          </div>
        );
    }
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
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-gray-500 text-xs">
                <User className="h-3 w-3" />
                <span>{problem.author.username}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatDate(problem.created_at)}</span>
              </div>
            </div>
            {getStatusDisplay()}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-primary-600 font-medium">
              <Coins className="h-4 w-4" />
              <span>{problem.reward_amount} tokens</span>
            </div>
            {status && (
              <div className="text-xs text-gray-500">
                {status.approved_solutions > 0 && (
                  <span>{status.approved_solutions} approved</span>
                )}
                {status.pending_solutions > 0 && (
                  <span className={status.approved_solutions > 0 ? 'ml-2' : ''}>
                    {status.pending_solutions} pending
                  </span>
                )}
              </div>
            )}
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