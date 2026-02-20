import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useGetFarmerTransactions, useGetFarmerBalance } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { generateTransactionPDF } from '@/utils/pdfGenerator';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { FarmerID } from '../../backend';

interface FarmerTransactionHistoryProps {
  farmerID: FarmerID;
}

export default function FarmerTransactionHistory({ farmerID }: FarmerTransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const farmerQuery = useGetFarmer(farmerID);
  const transactionsQuery = useGetFarmerTransactions(farmerID, currentPage);
  const balanceQuery = useGetFarmerBalance(farmerID);

  const farmer = farmerQuery.data;
  const transactions = transactionsQuery.data || [];
  const balance = balanceQuery.data || 0;

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const pageSize = 50;
  const hasNextPage = transactions.length === pageSize;
  const hasPrevPage = currentPage > 0;

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

    try {
      generateTransactionPDF(farmerID);
      toast.success('Opening PDF in new window...');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

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
            <p className={`text-3xl font-bold mt-2 ${balanceColor}`}>
              Balance: {formatCurrency(balance)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCreatePDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Print Transaction
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn, index) => {
                    const amountColor = txn.amount < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400';
                    return (
                      <TableRow key={index}>
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} • Showing {transactions.length} transactions
              </p>
              <div className="flex gap-2" onKeyDown={handleKeyDown}>
                <Button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
