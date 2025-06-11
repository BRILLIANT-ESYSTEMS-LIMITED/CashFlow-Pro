import { Statement } from '../contexts/FinancialDataContext';

export const generateMockData = (): Statement[] => {
  // Generate a unique ID
  const generateId = () => crypto.randomUUID();

  // Create the first statement (Current Month)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Create transaction data
  const transactions = [
    {
      id: generateId(),
      date: '2025-01-01',
      description: 'Opening Balance',
      reference: 'OPEN-001',
      debit: null,
      credit: 25000,
      balance: 25000,
      category: 'Income',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-05',
      description: 'Rent Payment',
      reference: 'RENT-001',
      debit: 2000,
      credit: null,
      balance: 23000,
      category: 'Rent',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-10',
      description: 'Grocery Store',
      reference: 'GROC-001',
      debit: 350.25,
      credit: null,
      balance: 22649.75,
      category: 'Groceries',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-15',
      description: 'Salary Deposit',
      reference: 'SAL-001',
      debit: null,
      credit: 5000,
      balance: 27649.75,
      category: 'Salary',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-20',
      description: 'Electric Bill',
      reference: 'UTIL-001',
      debit: 125.50,
      credit: null,
      balance: 27524.25,
      category: 'Utilities',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-25',
      description: 'Internet Service',
      reference: 'UTIL-002',
      debit: 80,
      credit: null,
      balance: 27444.25,
      category: 'Utilities',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-01-28',
      description: 'Restaurant Dinner',
      reference: 'ENT-001',
      debit: 120.75,
      credit: null,
      balance: 27323.50,
      category: 'Entertainment',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-02-01',
      description: 'Gym Membership',
      reference: 'HEALTH-001',
      debit: 50,
      credit: null,
      balance: 27273.50,
      category: 'Health',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-02-05',
      description: 'Gas Station',
      reference: 'TRANS-001',
      debit: 45.80,
      credit: null,
      balance: 27227.70,
      category: 'Transportation',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-02-10',
      description: 'Online Shopping',
      reference: 'SHOP-001',
      debit: 210.99,
      credit: null,
      balance: 27016.71,
      category: 'Shopping',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2025-02-15',
      description: 'Salary Deposit',
      reference: 'SAL-002',
      debit: null,
      credit: 5000,
      balance: 32016.71,
      category: 'Salary',
      currency: 'USD',
    },
  ];

  // Calculate totals
  const totalDebits = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredits = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const netChange = totalCredits - totalDebits;
  const openingBalance = 0;
  const closingBalance = openingBalance + netChange;

  // Create the statement
  const currentMonthStatement: Statement = {
    id: generateId(),
    name: 'Q1 2025 Statement',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    transactions,
    totalDebits,
    totalCredits,
    netChange,
    openingBalance,
    closingBalance,
    currency: 'USD',
  };

  // Create a second statement (previous month) with less data
  const prevMonthTransactions = [
    {
      id: generateId(),
      date: '2024-12-01',
      description: 'Opening Balance',
      reference: 'OPEN-001',
      debit: null,
      credit: 20000,
      balance: 20000,
      category: 'Income',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2024-12-05',
      description: 'Rent Payment',
      reference: 'RENT-001',
      debit: 2000,
      credit: null,
      balance: 18000,
      category: 'Rent',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2024-12-15',
      description: 'Salary Deposit',
      reference: 'SAL-001',
      debit: null,
      credit: 5000,
      balance: 23000,
      category: 'Salary',
      currency: 'USD',
    },
    {
      id: generateId(),
      date: '2024-12-20',
      description: 'Year-end Bonus',
      reference: 'BON-001',
      debit: null,
      credit: 2000,
      balance: 25000,
      category: 'Income',
      currency: 'USD',
    },
  ];

  // Calculate totals for previous month
  const prevTotalDebits = prevMonthTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const prevTotalCredits = prevMonthTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const prevNetChange = prevTotalCredits - prevTotalDebits;
  const prevOpeningBalance = 0;
  const prevClosingBalance = prevOpeningBalance + prevNetChange;

  // Create the previous month statement
  const prevMonthStatement: Statement = {
    id: generateId(),
    name: 'Q4 2024 Statement',
    period: 'quarterly',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    transactions: prevMonthTransactions,
    totalDebits: prevTotalDebits,
    totalCredits: prevTotalCredits,
    netChange: prevNetChange,
    openingBalance: prevOpeningBalance,
    closingBalance: prevClosingBalance,
    currency: 'USD',
  };

  return [currentMonthStatement, prevMonthStatement];
};