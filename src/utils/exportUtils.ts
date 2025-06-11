import { Statement } from '../contexts/FinancialDataContext';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

// Export to CSV
export const exportToCSV = (statement: Statement, fileName: string): void => {
  // Convert transactions to CSV format
  const header = 'Date,Description,Reference,Debit,Credit,Balance,Category\n';
  const rows = statement.transactions.map(transaction => {
    const date = format(parseISO(transaction.date), 'MM/dd/yyyy');
    const description = `"${transaction.description.replace(/"/g, '""')}"`;
    const reference = `"${transaction.reference.replace(/"/g, '""')}"`;
    const debit = transaction.debit !== null ? transaction.debit : '';
    const credit = transaction.credit !== null ? transaction.credit : '';
    const balance = transaction.balance;
    const category = `"${transaction.category.replace(/"/g, '""')}"`;
    
    return `${date},${description},${reference},${debit},${credit},${balance},${category}`;
  }).join('\n');
  
  const csvContent = `${header}${rows}`;
  
  // Create a Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to Excel
export const exportToExcel = (statement: Statement, fileName: string): void => {
  // Prepare data for Excel
  const data = statement.transactions.map(transaction => ({
    Date: format(parseISO(transaction.date), 'MM/dd/yyyy'),
    Description: transaction.description,
    Reference: transaction.reference,
    Debit: transaction.debit || '',
    Credit: transaction.credit || '',
    Balance: transaction.balance,
    Category: transaction.category,
  }));
  
  // Add summary rows
  data.push({
    Date: '',
    Description: 'SUMMARY',
    Reference: '',
    Debit: '',
    Credit: '',
    Balance: '',
    Category: '',
  });
  
  data.push({
    Date: '',
    Description: 'Opening Balance',
    Reference: '',
    Debit: '',
    Credit: '',
    Balance: statement.openingBalance,
    Category: '',
  });
  
  data.push({
    Date: '',
    Description: 'Total Debits',
    Reference: '',
    Debit: statement.totalDebits,
    Credit: '',
    Balance: '',
    Category: '',
  });
  
  data.push({
    Date: '',
    Description: 'Total Credits',
    Reference: '',
    Debit: '',
    Credit: statement.totalCredits,
    Balance: '',
    Category: '',
  });
  
  data.push({
    Date: '',
    Description: 'Net Change',
    Reference: '',
    Debit: '',
    Credit: '',
    Balance: statement.netChange,
    Category: '',
  });
  
  data.push({
    Date: '',
    Description: 'Closing Balance',
    Reference: '',
    Debit: '',
    Credit: '',
    Balance: statement.closingBalance,
    Category: '',
  });
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add styling (column widths)
  ws['!cols'] = [
    { width: 12 }, // Date
    { width: 30 }, // Description
    { width: 15 }, // Reference
    { width: 12 }, // Debit
    { width: 12 }, // Credit
    { width: 12 }, // Balance
    { width: 15 }, // Category
  ];
  
  // Create workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Statement');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, fileName);
};