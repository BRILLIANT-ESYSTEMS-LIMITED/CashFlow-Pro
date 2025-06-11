import { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Plus, RefreshCw, Upload } from 'lucide-react';
import { useFinancialData } from '../contexts/FinancialDataContext';
import { format, parseISO, subMonths } from 'date-fns';
import AppLayout from '../components/layouts/AppLayout';
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable';
import ReportCharts from '../components/reports/ReportCharts';

const Dashboard = () => {
  const { 
    currentStatement, 
    statements,
    setCurrentStatement,
    exportStatement,
    recalculateBalances,
    isLoading 
  } = useFinancialData();
  
  const [showCharts, setShowCharts] = useState(true);
  
  // Default date range for reports (last 3 months)
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentStatement) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-full p-6">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No statements found</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Create your first financial statement to get started tracking your transactions.
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Statement
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentStatement.name}</h1>
            <p className="text-sm text-gray-500">
              {format(parseISO(currentStatement.startDate), 'MMM dd, yyyy')} - {format(parseISO(currentStatement.endDate), 'MMM dd, yyyy')}
            </p>
          </div>
          
          <div className="flex mt-4 sm:mt-0 space-x-2">
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={currentStatement.id}
              onChange={(e) => setCurrentStatement(e.target.value)}
            >
              {statements.map((statement) => (
                <option key={statement.id} value={statement.id}>
                  {statement.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showCharts ? 'Hide' : 'Show'} Charts
            </button>
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => exportStatement('csv')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
            
            <button
              onClick={recalculateBalances}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Opening Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentStatement.currency,
              }).format(currentStatement.openingBalance)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Net Change</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentStatement.currency,
              }).format(currentStatement.netChange)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-500">Closing Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentStatement.currency,
              }).format(currentStatement.closingBalance)}
            </p>
          </div>
        </div>
        
        {showCharts && (
          <div className="mb-6">
            <ReportCharts
              transactions={currentStatement.transactions}
              currency={currentStatement.currency}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
          </div>
          <SpreadsheetTable 
            transactions={currentStatement.transactions} 
            currency={currentStatement.currency}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;