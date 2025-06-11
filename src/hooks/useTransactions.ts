import { useState, useEffect } from 'react';
import { Transaction, DashboardStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = () => {
    if (!user) return;
    
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = allTransactions.filter((t: Transaction) => t.userId === user.id);
    setTransactions(userTransactions);
    setLoading(false);
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'balance' | 'createdAt'>) => {
    if (!user) return;

    const currentBalance = transactions.length > 0 ? 
      transactions[transactions.length - 1].balance : 0;
    
    let newBalance = currentBalance;
    if (transactionData.type === 'income') {
      newBalance += transactionData.amount;
    } else {
      newBalance -= transactionData.amount;
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      userId: user.id,
      balance: newBalance,
      createdAt: new Date()
    };

    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    allTransactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(allTransactions));

    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = allTransactions.filter((t: Transaction) => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
    loadTransactions();
  };

  const getDashboardStats = (): DashboardStats => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = transactions.length > 0 ? 
      transactions[transactions.length - 1].balance : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today).length;

    return {
      totalIncome,
      totalExpenses,
      totalPayments,
      currentBalance,
      transactionCount: transactions.length,
      todayTransactions
    };
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getDashboardStats,
    refreshTransactions: loadTransactions
  };
};