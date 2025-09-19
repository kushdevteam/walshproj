import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Coins } from 'lucide-react';
import { problemService } from '../services/api';

export const PostProblem: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const problem = await problemService.createProblem({
        title,
        description,
        reward_amount: parseFloat(rewardAmount)
      });
      navigate(`/problems/${problem.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Problem</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Problem Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title for your problem"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Problem Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the problem you need solved. Include all relevant context, constraints, and expected outcomes."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific and provide enough detail for solvers to understand the problem
            </p>
          </div>

          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
              Reward Amount (tokens) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="reward"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                min="1"
                step="0.1"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Higher rewards typically attract more and better solutions
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Posting...' : 'Post Problem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};