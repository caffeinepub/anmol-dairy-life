import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useGetFarmerTransactions, useGetFarmerBalance, useGetAllFarmerTransactions } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { generateTransactionPDF, cleanupPDFUrl } from '@/utils/pdfGenerator';
import { openSMSApp } from '@/utils/smsHelper';
import { FileText, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FarmerID } from '../../backend';

interface FarmerTransactionHistoryProps {
  farmerID: FarmerID;
}

export default function FarmerTransactionHistory({ farmerID }: FarmerTransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fetchAllForPDF, setFetchAllForPDF] = useState(false);

  const farmerQuery = useGetFarmer(farmerID);
  const transactionsQuery = useGetFarmerTransactions(farmerID, currentPage);
  const balanceQuery = useGetFarmerBalance(farmerID);
  const allTransactionsQuery = useGetAllFarmerTransactions(farmerID, fetchAllForPDF);

  const farmer = farmerQuery.data;
  const transactions = transactionsQuery.data || [];
  const balance = balanceQuery.data || 0;
  const allTransactions = allTransactionsQuery.data || [];

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const pageSize = 50;
  const hasNextPage = transactions.length === pageSize;
  const hasPrevPage = currentPage > 0;

  // Cleanup PDF URL on unmount or when new PDF is generated
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        cleanupPDFUrl(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrevPage) {
      handlePrevPage();
    } else if (e.key === 'ArrowRight' && hasNextPage) {
      handleNextPage();
    }
  };

  const handleCreatePDF = () => {
    if (!farmer) {
      toast.error('Farmer data not available');
      return;
    }

    // Trigger fetching all transactions for PDF
    setFetchAllForPDF(true);
  };

  // Generate PDF once all transactions are loaded
  useEffect(() => {
    if (fetchAllForPDF && !allTransactionsQuery.isFetching && allTransactions.length > 0 && farmer) {
      try {
        // Clean up previous PDF URL if exists
        if (pdfUrl) {
          cleanupPDFUrl(pdfUrl);
        }

        // Generate new PDF with all transactions
        const url = generateTransactionPDF({
          farmer,
          balance,
          transactions: allTransactions,
        });

        setPdfUrl(url);

        // Open PDF in new tab
        window.open(url, '_blank');
        toast.success('PDF generated successfully');
        
        // Reset fetch flag
        setFetchAllForPDF(false);
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF');
        setFetchAllForPDF(false);
      }
    }
  }, [fetchAllForPDF, allTransactionsQuery.isFetching, allTransactions, farmer, balance]);

  const handleSendSMS = () => {
    if (!farmer) {
      toast.error('Farmer data not available');
      return;
    }

    if (!farmer.phone) {
      toast.error('Farmer phone number not available');
      return;
    }

    try {
      // Generate PDF first if not already generated
      let url = pdfUrl;
      if (!url && allTransactions.length > 0) {
        url = generateTransactionPDF({
          farmer,
          balance,
          transactions: allTransactions,
        });
        setPdfUrl(url);
      } else if (!url) {
        // Need to fetch all transactions first
        toast.info('Loading transaction data...');
        setFetchAllForPDF(true);
        return;
      }

      // Create SMS message with PDF link
      const message = `Dear ${farmer.name},

Your transaction history is ready to view.

Current Balance: ${formatCurrency(balance)}
Total Transactions: ${allTransactions.length || transactions.length}

View your complete transaction history here:
${url}

Thank you for your business.`;

      // Open SMS app with pre-filled message
      openSMSApp({
        phoneNumber: farmer.phone,
        message,
      });

      toast.success('Opening SMS app...');
    } catch (error) {
      console.error('Error preparing SMS:', error);
      toast.error('Failed to prepare SMS');
    }
  };

  // Ctrl+P to generate PDF
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && farmer) {
        e.preventDefault();
        handleCreatePDF();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [farmer, balance, allTransactions, pdfUrl]);

  if (!farmer) {
    return <p>Loading farmer details...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{farmer.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">ID: {farmer.customerID.toString()}</p>
            <p className={`text-2xl font-bold mt-2 ${balanceColor}`}>
              Balance: {formatCurrency(balance)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreatePDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Create PDF (Ctrl+P)"
              tabIndex={0}
              disabled={allTransactionsQuery.isFetching}
            >
              {allTransactionsQuery.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Create PDF
                </>
              )}
            </Button>
            <Button
              onClick={handleSendSMS}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Send SMS with PDF link"
              tabIndex={0}
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table role="table" aria-label="Transaction history">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const amountColor = txn.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
                    return (
                      <TableRow key={txn.id.toString()}>
                        <TableCell>{formatDateTime(txn.timestamp)}</TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell className={`text-right font-medium ${amountColor}`}>
                          {formatCurrency(txn.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div 
              className="flex items-center justify-between pt-4 border-t mt-4"
              onKeyDown={handleKeyDown}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="flex items-center gap-2"
                aria-label="Previous page (Arrow Left)"
                tabIndex={0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-2"
                aria-label="Next page (Arrow Right)"
                tabIndex={0}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
