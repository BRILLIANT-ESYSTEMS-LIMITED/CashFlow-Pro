import { useState } from 'react';
import { CalendarIcon, Download, Edit, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AppLayout from '../components/layouts/AppLayout';
import { useFinancialData, Statement } from '../contexts/FinancialDataContext';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const StatementsPage = () => {
  const { statements, deleteStatement, exportStatement, isLoading } = useFinancialData();
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null);

  if (isLoading) {
    return (
      <AppLayout title="Statements">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Statements">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Statements</h1>
            <p className="text-sm text-gray-500">
              Manage your financial statements and records
            </p>
          </div>
          
          <button
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Statement
          </button>
        </div>
        
        {statements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No statements</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new financial statement.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Statement
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {statements.map((statement) => (
                <li key={statement.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="sm:flex sm:items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {statement.name}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>
                            {format(parseISO(statement.startDate), 'MMM dd, yyyy')} - {format(parseISO(statement.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {statement.period.charAt(0).toUpperCase() + statement.period.slice(1)}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {statement.transactions.length} transactions
                        </span>
                        <span className="hidden sm:inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {statement.currency}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Opening: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: statement.currency,
                          }).format(statement.openingBalance)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Closing: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: statement.currency,
                          }).format(statement.closingBalance)}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-end sm:mt-0">
                        <button
                          onClick={() => exportStatement('excel', statement.id)}
                          className="mr-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label="Export statement"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          className="mr-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label="Edit statement"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setStatementToDelete(statement)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          aria-label="Delete statement"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {statementToDelete && (
        <DeleteConfirmationModal
          isOpen={!!statementToDelete}
          onClose={() => setStatementToDelete(null)}
          onConfirm={async () => {
            if (statementToDelete) {
              await deleteStatement(statementToDelete.id);
              setStatementToDelete(null);
            }
          }}
          title="Delete Statement"
          message={`Are you sure you want to delete the statement "${statementToDelete.name}"? This will permanently remove all associated transactions and cannot be undone.`}
        />
      )}
    </AppLayout>
  );
};

export default StatementsPage;