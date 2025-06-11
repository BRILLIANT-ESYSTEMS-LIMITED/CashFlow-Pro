import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import { generateMockData } from '../utils/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category: string;
  currency: string;
  notes?: string;
  tags?: string[];
};

export type Statement = {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  transactions: Transaction[];
  totalDebits: number;
  totalCredits: number;
  netChange: number;
  openingBalance: number;
  closingBalance: number;
  currency: string;
};

type FinancialDataContextType = {
  statements: Statement[];
  currentStatement: Statement | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchStatements: () => Promise<void>;
  setCurrentStatement: (statementId: string) => void;
  createStatement: (data: Omit<Statement, 'id' | 'transactions' | 'totalDebits' | 'totalCredits' | 'netChange' | 'closingBalance'>) => Promise<void>;
  updateStatement: (id: string, data: Partial<Statement>) => Promise<void>;
  deleteStatement: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'balance'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  bulkAddTransactions: (transactions: Omit<Transaction, 'id' | 'balance'>[]) => Promise<void>;
  exportStatement: (format: 'csv' | 'excel', statementId?: string) => Promise<void>;
  recalculateBalances: () => void;
};

const FinancialDataContext = createContext<FinancialDataContextType | null>(null);

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};

export const FinancialDataProvider = ({ children }: { children: ReactNode }) => {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [currentStatement, setCurrentStatementState] = useState<Statement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from an API
      // For demo, we'll use mock data
      const savedStatements = localStorage.getItem('financeAppStatements');
      
      if (savedStatements) {
        const parsedStatements = JSON.parse(savedStatements);
        setStatements(parsedStatements);
        
        // Set first statement as current if available
        if (parsedStatements.length > 0 && !currentStatement) {
          setCurrentStatementState(parsedStatements[0]);
        }
      } else {
        // Generate mock data for demo
        const mockData = generateMockData();
        setStatements(mockData);
        
        if (mockData.length > 0) {
          setCurrentStatementState(mockData[0]);
        }
        
        // Save to localStorage
        localStorage.setItem('financeAppStatements', JSON.stringify(mockData));
      }
    } catch (err) {
      console.error('Error fetching statements:', err);
      setError('Failed to load financial data');
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentStatement = (statementId: string) => {
    const statement = statements.find(s => s.id === statementId);
    if (statement) {
      setCurrentStatementState(statement);
    } else {
      toast.error('Statement not found');
    }
  };

  const createStatement = async (data: Omit<Statement, 'id' | 'transactions' | 'totalDebits' | 'totalCredits' | 'netChange' | 'closingBalance'>) => {
    setIsLoading(true);
    try {
      const newStatement: Statement = {
        id: crypto.randomUUID(),
        ...data,
        transactions: [],
        totalDebits: 0,
        totalCredits: 0,
        netChange: 0,
        closingBalance: data.openingBalance,
      };
      
      const updatedStatements = [...statements, newStatement];
      setStatements(updatedStatements);
      setCurrentStatementState(newStatement);
      
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Statement created successfully');
    } catch (err) {
      console.error('Error creating statement:', err);
      setError('Failed to create statement');
      toast.error('Failed to create statement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatement = async (id: string, data: Partial<Statement>) => {
    setIsLoading(true);
    try {
      const updatedStatements = statements.map(statement => 
        statement.id === id ? { ...statement, ...data } : statement
      );
      
      setStatements(updatedStatements);
      
      // Update current statement if it's the one being modified
      if (currentStatement?.id === id) {
        setCurrentStatementState({ ...currentStatement, ...data });
      }
      
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Statement updated successfully');
    } catch (err) {
      console.error('Error updating statement:', err);
      setError('Failed to update statement');
      toast.error('Failed to update statement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStatement = async (id: string) => {
    setIsLoading(true);
    try {
      const updatedStatements = statements.filter(statement => statement.id !== id);
      setStatements(updatedStatements);
      
      // If current statement is deleted, set first available or null
      if (currentStatement?.id === id) {
        setCurrentStatementState(updatedStatements.length > 0 ? updatedStatements[0] : null);
      }
      
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Statement deleted successfully');
    } catch (err) {
      console.error('Error deleting statement:', err);
      setError('Failed to delete statement');
      toast.error('Failed to delete statement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateBalances = () => {
    if (!currentStatement) return;
    
    let balance = currentStatement.openingBalance;
    const updatedTransactions = currentStatement.transactions.map(transaction => {
      if (transaction.credit) {
        balance += transaction.credit;
      }
      if (transaction.debit) {
        balance -= transaction.debit;
      }
      return { ...transaction, balance };
    });
    
    const totalDebits = updatedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredits = updatedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const netChange = totalCredits - totalDebits;
    const closingBalance = currentStatement.openingBalance + netChange;
    
    const updatedStatement = {
      ...currentStatement,
      transactions: updatedTransactions,
      totalDebits,
      totalCredits,
      netChange,
      closingBalance,
    };
    
    setCurrentStatementState(updatedStatement);
    
    // Update in statements array
    const updatedStatements = statements.map(statement => 
      statement.id === currentStatement.id ? updatedStatement : statement
    );
    
    setStatements(updatedStatements);
    localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'balance'>) => {
    if (!currentStatement) {
      toast.error('No statement selected');
      return;
    }
    
    try {
      let balance = currentStatement.transactions.length > 0 
        ? currentStatement.transactions[currentStatement.transactions.length - 1].balance 
        : currentStatement.openingBalance;
      
      if (transaction.credit) {
        balance += transaction.credit;
      }
      if (transaction.debit) {
        balance -= transaction.debit;
      }
      
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...transaction,
        balance,
      };
      
      const updatedTransactions = [...currentStatement.transactions, newTransaction];
      const totalDebits = updatedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredits = updatedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
      const netChange = totalCredits - totalDebits;
      const closingBalance = currentStatement.openingBalance + netChange;
      
      const updatedStatement = {
        ...currentStatement,
        transactions: updatedTransactions,
        totalDebits,
        totalCredits,
        netChange,
        closingBalance,
      };
      
      setCurrentStatementState(updatedStatement);
      
      // Update in statements array
      const updatedStatements = statements.map(statement => 
        statement.id === currentStatement.id ? updatedStatement : statement
      );
      
      setStatements(updatedStatements);
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Transaction added successfully');
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      toast.error('Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!currentStatement) {
      toast.error('No statement selected');
      return;
    }
    
    try {
      // Find transaction index
      const transactionIndex = currentStatement.transactions.findIndex(t => t.id === id);
      if (transactionIndex === -1) {
        toast.error('Transaction not found');
        return;
      }
      
      // Create updated transactions array with recalculated balances
      const updatedTransactions = [...currentStatement.transactions];
      updatedTransactions[transactionIndex] = { 
        ...updatedTransactions[transactionIndex], 
        ...data 
      };
      
      // Recalculate balances for this and all subsequent transactions
      let balance = transactionIndex === 0 
        ? currentStatement.openingBalance 
        : updatedTransactions[transactionIndex - 1].balance;
      
      for (let i = transactionIndex; i < updatedTransactions.length; i++) {
        const transaction = updatedTransactions[i];
        if (transaction.credit) {
          balance += transaction.credit;
        }
        if (transaction.debit) {
          balance -= transaction.debit;
        }
        updatedTransactions[i] = { ...transaction, balance };
      }
      
      const totalDebits = updatedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredits = updatedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
      const netChange = totalCredits - totalDebits;
      const closingBalance = currentStatement.openingBalance + netChange;
      
      const updatedStatement = {
        ...currentStatement,
        transactions: updatedTransactions,
        totalDebits,
        totalCredits,
        netChange,
        closingBalance,
      };
      
      setCurrentStatementState(updatedStatement);
      
      // Update in statements array
      const updatedStatements = statements.map(statement => 
        statement.id === currentStatement.id ? updatedStatement : statement
      );
      
      setStatements(updatedStatements);
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Transaction updated successfully');
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
      toast.error('Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!currentStatement) {
      toast.error('No statement selected');
      return;
    }
    
    try {
      const updatedTransactions = currentStatement.transactions.filter(t => t.id !== id);
      
      // Recalculate balances
      let balance = currentStatement.openingBalance;
      const recalculatedTransactions = updatedTransactions.map(transaction => {
        if (transaction.credit) {
          balance += transaction.credit;
        }
        if (transaction.debit) {
          balance -= transaction.debit;
        }
        return { ...transaction, balance };
      });
      
      const totalDebits = recalculatedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredits = recalculatedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
      const netChange = totalCredits - totalDebits;
      const closingBalance = currentStatement.openingBalance + netChange;
      
      const updatedStatement = {
        ...currentStatement,
        transactions: recalculatedTransactions,
        totalDebits,
        totalCredits,
        netChange,
        closingBalance,
      };
      
      setCurrentStatementState(updatedStatement);
      
      // Update in statements array
      const updatedStatements = statements.map(statement => 
        statement.id === currentStatement.id ? updatedStatement : statement
      );
      
      setStatements(updatedStatements);
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success('Transaction deleted successfully');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      toast.error('Failed to delete transaction');
      throw err;
    }
  };

  const bulkAddTransactions = async (transactions: Omit<Transaction, 'id' | 'balance'>[]) => {
    if (!currentStatement) {
      toast.error('No statement selected');
      return;
    }
    
    try {
      let balance = currentStatement.transactions.length > 0 
        ? currentStatement.transactions[currentStatement.transactions.length - 1].balance 
        : currentStatement.openingBalance;
      
      const newTransactions = transactions.map(transaction => {
        if (transaction.credit) {
          balance += transaction.credit;
        }
        if (transaction.debit) {
          balance -= transaction.debit;
        }
        
        return {
          id: crypto.randomUUID(),
          ...transaction,
          balance,
        };
      });
      
      const updatedTransactions = [...currentStatement.transactions, ...newTransactions];
      const totalDebits = updatedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredits = updatedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
      const netChange = totalCredits - totalDebits;
      const closingBalance = currentStatement.openingBalance + netChange;
      
      const updatedStatement = {
        ...currentStatement,
        transactions: updatedTransactions,
        totalDebits,
        totalCredits,
        netChange,
        closingBalance,
      };
      
      setCurrentStatementState(updatedStatement);
      
      // Update in statements array
      const updatedStatements = statements.map(statement => 
        statement.id === currentStatement.id ? updatedStatement : statement
      );
      
      setStatements(updatedStatements);
      localStorage.setItem('financeAppStatements', JSON.stringify(updatedStatements));
      toast.success(`${newTransactions.length} transactions added successfully`);
    } catch (err) {
      console.error('Error adding transactions:', err);
      setError('Failed to add transactions');
      toast.error('Failed to add transactions');
      throw err;
    }
  };

  const exportStatement = async (format: 'csv' | 'excel', statementId?: string) => {
    try {
      const statement = statementId 
        ? statements.find(s => s.id === statementId) 
        : currentStatement;
      
      if (!statement) {
        toast.error('No statement selected for export');
        return;
      }
      
      const fileName = `${statement.name.replace(/\s+/g, '_')}_${format === 'csv' ? 'csv' : 'xlsx'}`;
      
      if (format === 'csv') {
        exportToCSV(statement, fileName);
      } else {
        exportToExcel(statement, fileName);
      }
      
      toast.success(`Statement exported as ${format.toUpperCase()} successfully`);
    } catch (err) {
      console.error('Error exporting statement:', err);
      setError(`Failed to export statement as ${format.toUpperCase()}`);
      toast.error(`Failed to export statement as ${format.toUpperCase()}`);
      throw err;
    }
  };

  const value = {
    statements,
    currentStatement,
    transactions: currentStatement?.transactions || [],
    isLoading,
    error,
    fetchStatements,
    setCurrentStatement,
    createStatement,
    updateStatement,
    deleteStatement,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkAddTransactions,
    exportStatement,
    recalculateBalances,
  };

  return <FinancialDataContext.Provider value={value}>{children}</FinancialDataContext.Provider>;
};