import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Activity, Calendar } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';

const Dashboard: React.FC = () => {
  const { getDashboardStats, transactions } = useTransactions();
  const stats = getDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your financial activity</p>
        </div>
        <div className="mt-4 sm:mt-0 bg-blue-50 px-4 py-2 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Current Balance"
          value={formatCurrency(stats.currentBalance)}
          icon={Wallet}
          color={stats.currentBalance >= 0 ? 'green' : 'red'}
        />
        <StatsCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Total Transactions"
          value={stats.transactionCount.toString()}
          icon={Activity}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Today's Transactions</span>
              <span className="text-lg font-bold text-blue-600">{stats.todayTransactions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Payments Made</span>
              <span className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalPayments)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Net Change</span>
              <span className={`text-lg font-bold ${stats.totalIncome - stats.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalIncome - stats.totalExpenses - stats.totalPayments)}
              </span>
            </div>
          </div>
        </div>

        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;