import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Coins, MessageSquare } from 'lucide-react';
import { Solution } from '../types';
import { solutionService, validationService } from '../services/api';

export const ValidatorPage: React.FC = () => {
  const [pendingSolutions, setPendingSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingSolutions();
  }, []);

  const fetchPendingSolutions = async () => {
    try {
      const data = await solutionService.getPendingSolutions();
      setPendingSolutions(data);
    } catch (err: any) {
      setError('Failed to load pending solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (solutionId: number, decision: 'approved' | 'rejected') => {
    setValidating(solutionId);
    setError('');
    setSuccess('');

    try {
      await validationService.validateSolution({
        solution_id: solutionId,
        decision,
        feedback: feedback[solutionId] || undefined
      });
      setSuccess(`Solution ${decision} successfully!`);
      // Remove the validated solution from the list
      setPendingSolutions(prev => prev.filter(s => s.id !== solutionId));
      // Clear the feedback for this solution
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[solutionId];
        return newFeedback;
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${decision} solution`);
    } finally {
      setValidating(null);
    }
  };

  const updateFeedback = (solutionId: number, text: string) => {
    setFeedback(prev => ({ ...prev, [solutionId]: text }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading pending solutions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Validator Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Review and validate submitted solutions to earn validator rewards
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex items-center space-x-4">
          <Clock className="h-8 w-8 text-yellow-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Solutions: {pendingSolutions.length}
            </h2>
            <p className="text-sm text-gray-600">
              Solutions waiting for validation
            </p>
          </div>
        </div>
      </div>

      {pendingSolutions.length > 0 ? (
        <div className="space-y-6">
          {pendingSolutions.map((solution) => (
            <div key={solution.id} className="card">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {solution.problem?.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Solution by {solution.solver.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Submitted {formatDate(solution.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-primary-600">
                        <Coins className="h-4 w-4" />
                        <span>{solution.problem?.reward_amount} tokens reward</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Problem Description:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {solution.problem?.description}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Submitted Solution:</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {solution.content}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Validation Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback[solution.id] || ''}
                    onChange={(e) => updateFeedback(solution.id, e.target.value)}
                    placeholder="Provide feedback on this solution..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleValidation(solution.id, 'rejected')}
                    disabled={validating === solution.id}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>
                      {validating === solution.id ? 'Processing...' : 'Reject'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleValidation(solution.id, 'approved')}
                    disabled={validating === solution.id}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      {validating === solution.id ? 'Processing...' : 'Approve'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending solutions</h3>
          <p className="text-gray-600">All solutions have been validated. Great work!</p>
        </div>
      )}
    </div>
  );
};