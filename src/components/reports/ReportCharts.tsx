import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Transaction } from '../../contexts/FinancialDataContext';
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ReportChartsProps = {
  transactions: Transaction[];
  currency: string;
  startDate: Date;
  endDate: Date;
};

const ReportCharts = ({ transactions, currency, startDate, endDate }: ReportChartsProps) => {
  const [activeChart, setActiveChart] = useState<'overview' | 'categories' | 'trends'>('overview');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Aggregate data by month for trends chart
  const monthlyData = useMemo(() => {
    const months: Record<string, { credits: number; debits: number }> = {};
    
    // Initialize all months in the range
    let currentMonth = startOfMonth(startDate);
    while (currentMonth <= endOfMonth(endDate)) {
      const monthKey = format(currentMonth, 'MMM yyyy');
      months[monthKey] = { credits: 0, debits: 0 };
      currentMonth = startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }
    
    // Aggregate transactions by month
    filteredTransactions.forEach(transaction => {
      const date = parseISO(transaction.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (months[monthKey]) {
        if (transaction.credit) {
          months[monthKey].credits += transaction.credit;
        }
        if (transaction.debit) {
          months[monthKey].debits += transaction.debit;
        }
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      credits: data.credits,
      debits: data.debits,
      net: data.credits - data.debits,
    }));
  }, [filteredTransactions, startDate, endDate]);

  // Aggregate data by category
  const categoryData = useMemo(() => {
    const categories: Record<string, { credits: number; debits: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      
      if (!categories[category]) {
        categories[category] = { credits: 0, debits: 0 };
      }
      
      if (transaction.credit) {
        categories[category].credits += transaction.credit;
      }
      if (transaction.debit) {
        categories[category].debits += transaction.debit;
      }
    });
    
    return Object.entries(categories).map(([category, data]) => ({
      category,
      credits: data.credits,
      debits: data.debits,
      net: data.credits - data.debits,
    }));
  }, [filteredTransactions]);

  // Calculate total figures
  const totals = useMemo(() => {
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const totalDebits = filteredTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const netChange = totalCredits - totalDebits;
    
    return { totalCredits, totalDebits, netChange };
  }, [filteredTransactions]);

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  };

  // Line chart data for trends
  const lineChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Credits',
        data: monthlyData.map(d => d.credits),
        borderColor: '#2FC9BE',
        backgroundColor: 'rgba(47, 201, 190, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Debits',
        data: monthlyData.map(d => d.debits),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Net',
        data: monthlyData.map(d => d.net),
        borderColor: '#3E64FF',
        backgroundColor: 'rgba(62, 100, 255, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Bar chart for category comparison
  const barChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        label: 'Credits',
        data: categoryData.map(d => d.credits),
        backgroundColor: 'rgba(47, 201, 190, 0.7)',
      },
      {
        label: 'Debits',
        data: categoryData.map(d => d.debits),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  };

  // Pie chart for overview
  const pieChartData = {
    labels: ['Credits', 'Debits'],
    datasets: [
      {
        data: [totals.totalCredits, totals.totalDebits],
        backgroundColor: [
          'rgba(47, 201, 190, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(47, 201, 190, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Financial Reports</h2>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveChart('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'overview'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveChart('categories')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'categories'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveChart('trends')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeChart === 'trends'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trends
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm font-medium text-green-700">Total Credits</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(totals.totalCredits)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm font-medium text-red-700">Total Debits</p>
          <p className="text-2xl font-bold text-red-800">{formatCurrency(totals.totalDebits)}</p>
        </div>
        <div className={`rounded-lg p-4 border ${
          totals.netChange >= 0 
            ? 'bg-blue-50 border-blue-100' 
            : 'bg-orange-50 border-orange-100'
        }`}>
          <p className={`text-sm font-medium ${
            totals.netChange >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>Net Change</p>
          <p className={`text-2xl font-bold ${
            totals.netChange >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}>{formatCurrency(totals.netChange)}</p>
        </div>
      </div>
      
      <div className="h-80">
        {activeChart === 'overview' && <Pie data={pieChartData} options={chartOptions} />}
        {activeChart === 'categories' && <Bar data={barChartData} options={chartOptions} />}
        {activeChart === 'trends' && <Line data={lineChartData} options={chartOptions} />}
      </div>
      
      {activeChart === 'categories' && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Credits
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Debits
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{category.category}</td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">{formatCurrency(category.credits)}</td>
                    <td className="px-4 py-2 text-sm text-right text-red-600">{formatCurrency(category.debits)}</td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${
                      category.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(category.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCharts;