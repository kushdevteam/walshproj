import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, Users, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProblemCard } from '../components/ProblemCard';
import { Problem } from '../types';
import { problemService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemService.getProblems();
        setProblems(data);
      } catch (err: any) {
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading problems...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Problem Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Solve problems, earn tokens, and contribute to the network
            </p>
          </div>
          <Link
            to="/post-problem"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post Problem</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Problems</p>
                <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Solvers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(problems.map(p => p.author.username)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-secondary-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {problems.reduce((sum, p) => sum + p.reward_amount, 0)} tokens
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : problems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No problems yet</h3>
          <p className="text-gray-600 mb-6">Be the first to post a problem and start earning!</p>
          <Link
            to="/post-problem"
            className="btn-primary"
          >
            Post Your First Problem
          </Link>
        </div>
      )}
    </div>
  );
};