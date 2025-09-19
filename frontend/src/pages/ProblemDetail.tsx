import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Coins, User, Send, CheckCircle, XCircle } from 'lucide-react';
import { Problem, Solution } from '../types';
import { problemService, solutionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      
      try {
        const data = await problemService.getProblem(parseInt(id));
        setProblem(data);
      } catch (err: any) {
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !solution.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await solutionService.submitSolution({
        content: solution,
        problem_id: problem.id
      });
      setSuccess('Solution submitted successfully!');
      setSolution('');
      // Refresh problem to show new solution
      const updatedProblem = await problemService.getProblem(problem.id);
      setProblem(updatedProblem);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading problem...</div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const userHasSubmitted = problem.solutions?.some(s => s.solver_id === user?.id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Problem Details */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
          <div className="flex items-center space-x-1 text-primary-600 font-medium">
            <Coins className="h-5 w-5" />
            <span>{problem.reward_amount} tokens</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>Posted by {problem.author.username}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(problem.created_at)}</span>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
        </div>
      </div>

      {/* Submit Solution */}
      {user && user.id !== problem.author_id && !userHasSubmitted && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Your Solution</h2>
          <form onSubmit={handleSubmitSolution}>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describe your solution in detail..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              required
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mt-4">
                {success}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !solution.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Solution'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {userHasSubmitted && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mb-8">
          You have already submitted a solution for this problem.
        </div>
      )}

      {/* Solutions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Solutions ({problem.solutions?.length || 0})
        </h2>
        
        {problem.solutions && problem.solutions.length > 0 ? (
          <div className="space-y-6">
            {problem.solutions.map((sol: Solution) => (
              <div key={sol.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{sol.solver.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{formatDate(sol.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(sol.status)}
                    <span className={`text-sm font-medium ${
                      sol.status === 'approved' ? 'text-green-600' :
                      sol.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {getStatusText(sol.status)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{sol.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No solutions submitted yet. Be the first to solve this problem!
          </div>
        )}
      </div>
    </div>
  );
};