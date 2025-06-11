import { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import AppLayout from '../components/layouts/AppLayout';
import { useFinancialData } from '../contexts/FinancialDataContext';
import ReportCharts from '../components/reports/ReportCharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const { currentStatement, isLoading } = useFinancialData();
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y' | 'ytd' | 'custom'>('3m');
  const [startDate, setStartDate] = useState<Date>(() => subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const handleDateRangeChange = (range: '3m' | '6m' | '1y' | 'ytd' | 'custom') => {
    setDateRange(range);
    
    const now = new Date();
    
    switch (range) {
      case '3m':
        setStartDate(subMonths(now, 3));
        setEndDate(now);
        break;
      case '6m':
        setStartDate(subMonths(now, 6));
        setEndDate(now);
        break;
      case '1y':
        setStartDate(subMonths(now, 12));
        setEndDate(now);
        break;
      case 'ytd':
        setStartDate(startOfYear(now));
        setEndDate(now);
        break;
      // For custom, keep existing dates
    }
  };

  const generatePDF = () => {
    if (!currentStatement) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Financial Report', 105, 15, { align: 'center' });
    
    // Add statement details
    doc.setFontSize(12);
    doc.text(`Statement: ${currentStatement.name}`, 14, 30);
    doc.text(`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 14, 40);
    
    // Add summary data
    doc.setFontSize(14);
    doc.text('Summary', 14, 55);
    
    const filteredTransactions = currentStatement.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
    
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const totalDebits = filteredTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const netChange = totalCredits - totalDebits;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentStatement.currency,
      }).format(amount);
    };
    
    // Add summary table
    const summaryTableBody = [
      ['Total Credits', formatCurrency(totalCredits)],
      ['Total Debits', formatCurrency(totalDebits)],
      ['Net Change', formatCurrency(netChange)],
    ];
    
    (doc as any).autoTable({
      startY: 60,
      head: [['Item', 'Amount']],
      body: summaryTableBody,
      theme: 'striped',
      headStyles: { fillColor: [62, 100, 255] },
    });
    
    // Add transactions table
    doc.setFontSize(14);
    doc.text('Transactions', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const tableData = filteredTransactions.map(t => [
      format(new Date(t.date), 'MM/dd/yyyy'),
      t.description,
      t.reference,
      t.debit ? formatCurrency(t.debit) : '',
      t.credit ? formatCurrency(t.credit) : '',
      formatCurrency(t.balance),
    ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [62, 100, 255] },
    });
    
    // Save the PDF
    doc.save(`${currentStatement.name}_report.pdf`);
  };

  if (isLoading || !currentStatement) {
    return (
      <AppLayout title="Reports">
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
    <AppLayout title="Reports">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-sm text-gray-500">
              Generate and analyze financial reports
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDateRangeChange('3m')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === '3m'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 3 Months
                </button>
                <button
                  onClick={() => handleDateRangeChange('6m')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === '6m'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 6 Months
                </button>
                <button
                  onClick={() => handleDateRangeChange('1y')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === '1y'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last Year
                </button>
                <button
                  onClick={() => handleDateRangeChange('ytd')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === 'ytd'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Year to Date
                </button>
                <button
                  onClick={() => handleDateRangeChange('custom')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRange === 'custom'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateRange('custom');
                    setStartDate(new Date(e.target.value));
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateRange('custom');
                    setEndDate(new Date(e.target.value));
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <ReportCharts
          transactions={currentStatement.transactions}
          currency={currentStatement.currency}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </AppLayout>
  );
};

export default ReportsPage;