import { useMemo, useState, useRef, useEffect } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender, 
  createColumnHelper, 
  ColumnDef,
  SortingState
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Plus, 
  Search,
  X
} from 'lucide-react';
import { Transaction, useFinancialData } from '../../contexts/FinancialDataContext';
import AddTransactionModal from '../modals/AddTransactionModal';
import EditTransactionModal from '../modals/EditTransactionModal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

const columnHelper = createColumnHelper<Transaction>();

type SpreadsheetTableProps = {
  transactions: Transaction[];
  currency: string;
};

const SpreadsheetTable = ({ transactions, currency }: SpreadsheetTableProps) => {
  const { updateTransaction, deleteTransaction } = useFinancialData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    transactions.forEach(transaction => {
      if (transaction.category) {
        uniqueCategories.add(transaction.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [transactions]);

  // Format currency function
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Columns definition
  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    columnHelper.accessor('date', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Date</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => {
        const date = info.getValue();
        try {
          return format(parseISO(date), 'MM/dd/yyyy');
        } catch (e) {
          return date;
        }
      },
    }),
    columnHelper.accessor('description', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Description</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('reference', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Reference</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('debit', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Debit</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => {
        const amount = info.getValue();
        return amount ? formatCurrency(amount) : '';
      },
    }),
    columnHelper.accessor('credit', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Credit</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => {
        const amount = info.getValue();
        return amount ? formatCurrency(amount) : '';
      },
    }),
    columnHelper.accessor('balance', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Balance</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('category', {
      header: () => (
        <div className="flex items-center justify-between px-2">
          <span>Category</span>
          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
        </div>
      ),
      cell: info => {
        const category = info.getValue();
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {category}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: info => (
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => setTransactionToEdit(info.row.original)}
            className="p-1 text-gray-500 hover:text-primary-500 transition-colors"
            aria-label="Edit transaction"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setTransactionToDelete(info.row.original)}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Delete transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }),
  ], [currency]);

  // Filter data based on search term and category
  const filteredData = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !filterCategory || transaction.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, filterCategory]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Add fixed header effect
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    const handleScroll = () => {
      const header = tableContainer.querySelector('thead');
      if (header) {
        if (tableContainer.scrollTop > 0) {
          header.classList.add('sticky-header');
        } else {
          header.classList.remove('sticky-header');
        }
      }
    };

    tableContainer.addEventListener('scroll', handleScroll);
    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-4 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="relative ml-2">
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {(searchTerm || filterCategory) && (
            <button
              onClick={clearFilters}
              className="ml-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Transaction
        </button>
      </div>
      
      <div 
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm mx-4 mb-4"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${
                        cell.column.id === 'balance'
                          ? 'font-medium'
                          : cell.column.id === 'debit'
                          ? 'text-red-600'
                          : cell.column.id === 'credit'
                          ? 'text-green-600'
                          : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      {transactionToEdit && (
        <EditTransactionModal
          transaction={transactionToEdit}
          isOpen={!!transactionToEdit}
          onClose={() => setTransactionToEdit(null)}
        />
      )}
      
      {transactionToDelete && (
        <DeleteConfirmationModal
          isOpen={!!transactionToDelete}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={async () => {
            if (transactionToDelete) {
              await deleteTransaction(transactionToDelete.id);
              setTransactionToDelete(null);
            }
          }}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default SpreadsheetTable;