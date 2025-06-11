import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, DollarSign, Receipt, PieChart, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { Transaction } from '../../types';

const Reports: React.FC = () => {
  const { transactions, getDashboardStats } = useTransactions();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('summary');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const stats = getDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(t => new Date(t.date) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(t => new Date(t.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(t => new Date(t.date) >= filterDate);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter(t => new Date(t.date) >= filterDate);
          break;
      }
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= new Date(dateRange.start) && 
               transactionDate <= new Date(dateRange.end);
      });
    }

    return filtered;
  };

  const getTransactionsByCategory = (filteredTransactions: Transaction[]) => {
    const categories = new Map<string, { income: number; expense: number; payment: number; count: number }>();
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const existing = categories.get(category) || { income: 0, expense: 0, payment: 0, count: 0 };
      
      existing[transaction.type] += transaction.amount;
      existing.count += 1;
      categories.set(category, existing);
    });
    
    return Array.from(categories.entries()).map(([name, data]) => ({
      name,
      ...data,
      total: data.income + data.expense + data.payment
    }));
  };

  const getDailyTrends = (filteredTransactions: Transaction[]) => {
    const dailyData = new Map<string, { income: number; expense: number; payment: number; balance: number }>();
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      const existing = dailyData.get(date) || { income: 0, expense: 0, payment: 0, balance: 0 };
      
      existing[transaction.type] += transaction.amount;
      existing.balance = transaction.balance;
      dailyData.set(date, existing);
    });
    
    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        net: data.income - data.expense - data.payment
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const generateReport = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = filteredTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      transactions: filteredTransactions,
      totalIncome,
      totalExpenses,
      totalPayments,
      netIncome: totalIncome - totalExpenses - totalPayments,
      transactionCount: filteredTransactions.length,
      categories: getTransactionsByCategory(filteredTransactions),
      dailyTrends: getDailyTrends(filteredTransactions)
    };
  };

  const report = generateReport();

  const exportReport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      dateRange,
      summary: {
        totalIncome: report.totalIncome,
        totalExpenses: report.totalExpenses,
        totalPayments: report.totalPayments,
        netIncome: report.netIncome,
        transactionCount: report.transactionCount
      },
      transactions: report.transactions,
      categories: report.categories,
      dailyTrends: report.dailyTrends
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="bg-purple-600 rounded-lg p-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive analysis and insights</p>
          </div>
        </div>
        
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="trends">Trends</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(report.totalPayments)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${report.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Net Income</p>
            <p className={`text-2xl font-bold ${report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(report.netIncome)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {report.categories.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No category data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.categories.map((category) => (
                <div key={category.name} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <span className="text-sm text-gray-600">{category.count} transactions</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Income</p>
                      <p className="font-semibold text-green-600">{formatCurrency(category.income)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expenses</p>
                      <p className="font-semibold text-red-600">{formatCurrency(category.expense)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payments</p>
                      <p className="font-semibold text-purple-600">{formatCurrency(category.payment)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Receipt className="h-5 w-5 text-gray-400" />
          </div>
          
          {report.transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.transactions.slice(-10).reverse().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-100' :
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : transaction.type === 'expense' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.details}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' : 'text-purple-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Trends Chart */}
      {report.dailyTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-4">
                {report.dailyTrends.map((day, index) => (
                  <div key={day.date} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <span className={`text-sm font-semibold ${day.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Net: {formatCurrency(day.net)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Income</p>
                        <p className="font-semibold text-green-600">{formatCurrency(day.income)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expenses</p>
                        <p className="font-semibold text-red-600">{formatCurrency(day.expense)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Balance</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(day.balance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{report.transactionCount}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-1">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{report.categories.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-1">Active Days</p>
            <p className="text-2xl font-bold text-gray-900">{report.dailyTrends.length}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-1">Avg Daily Net</p>
            <p className={`text-2xl font-bold ${
              report.dailyTrends.length > 0 && 
              (report.dailyTrends.reduce((sum, day) => sum + day.net, 0) / report.dailyTrends.length) >= 0 
                ? 'text-green-600' : 'text-red-600'
            }`}>
              {report.dailyTrends.length > 0 
                ? formatCurrency(report.dailyTrends.reduce((sum, day) => sum + day.net, 0) / report.dailyTrends.length)
                : '$0.00'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;