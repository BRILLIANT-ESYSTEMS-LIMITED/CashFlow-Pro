export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  details: string;
  type: 'income' | 'expense' | 'payment';
  amount: number;
  category?: string;
  balance: number;
  createdAt: Date;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalPayments: number;
  currentBalance: number;
  transactionCount: number;
  todayTransactions: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}