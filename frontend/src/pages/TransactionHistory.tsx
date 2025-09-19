import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Coins, Trophy, Target, Brain, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await userService.getUserTransactions();
        // Sort transactions by date (most recent first)
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransactions(sortedData);
      } catch (err: any) {
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'solution_reward':
        return <Brain className="h-5 w-5 text-green-600" />;
      case 'validation_reward':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'problem_post':
        return <Trophy className="h-5 w-5 text-orange-600" />;
      default:
        return <Coins className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'solution_reward':
        return { 
          label: 'Solution Reward', 
          color: 'bg-green-100 text-green-800' 
        };
      case 'validation_reward':
        return { 
          label: 'Validation Reward', 
          color: 'bg-blue-100 text-blue-800' 
        };
      case 'problem_post':
        return { 
          label: 'Problem Posted', 
          color: 'bg-orange-100 text-orange-800' 
        };
      default:
        return { 
          label: 'Transaction', 
          color: 'bg-gray-100 text-gray-800' 
        };
    }
  };

  const totalEarnings = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view transaction history</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading transaction history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">
          Track your token earnings, rewards, and spending
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">+{totalEarnings.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownLeft className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">-{totalSpent.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">{user.token_balance.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Transaction Timeline */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Transactions ({transactions.length})
        </h2>

        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const badge = getTransactionBadge(transaction.type);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`text-lg font-bold ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">tokens</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Start solving problems or validating solutions to see your transaction history!</p>
          </div>
        )}
      </div>
    </div>
  );
};