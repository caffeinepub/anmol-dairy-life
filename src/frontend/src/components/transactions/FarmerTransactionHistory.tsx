import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useGetFarmerTransactions, useGetFarmerBalance } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { generateTransactionPDF, cleanupPDFUrl } from '@/utils/pdfGenerator';
import { openSMSApp } from '@/utils/smsHelper';
import { FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import type { FarmerID } from '../../backend';

interface FarmerTransactionHistoryProps {
  farmerID: FarmerID;
}

export default function FarmerTransactionHistory({ farmerID }: FarmerTransactionHistoryProps) {
  const farmerQuery = useGetFarmer(farmerID);
  const transactionsQuery = useGetFarmerTransactions(farmerID);
  const balanceQuery = useGetFarmerBalance(farmerID);

  const farmer = farmerQuery.data;
  const transactions = transactionsQuery.data || [];
  const balance = balanceQuery.data || 0;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  // Cleanup PDF URL on unmount or when new PDF is generated
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        cleanupPDFUrl(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleCreatePDF = () => {
    if (!farmer) {
      toast.error('Farmer data not available');
      return;
    }

    try {
      // Clean up previous PDF URL if exists
      if (pdfUrl) {
        cleanupPDFUrl(pdfUrl);
      }

      // Generate new PDF
      const url = generateTransactionPDF({
        farmer,
        balance,
        transactions,
      });

      setPdfUrl(url);

      // Open PDF in new tab
      window.open(url, '_blank');
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

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
      // Generate PDF first
      let url = pdfUrl;
      if (!url) {
        url = generateTransactionPDF({
          farmer,
          balance,
          transactions,
        });
        setPdfUrl(url);
      }

      // Create SMS message with PDF link
      const message = `Dear ${farmer.name},

Your transaction history is ready to view.

Current Balance: ${formatCurrency(balance)}
Total Transactions: ${transactions.length}

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

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
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
            <p className={`text-2xl font-bold mt-2 ${balanceColor}`}>
              Balance: {formatCurrency(balance)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreatePDF}
              onKeyDown={(e) => handleKeyDown(e, handleCreatePDF)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Create PDF"
            >
              <FileText className="h-4 w-4" />
              Create PDF
            </Button>
            <Button
              onClick={handleSendSMS}
              onKeyDown={(e) => handleKeyDown(e, handleSendSMS)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Send SMS with PDF link"
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
        )}
      </CardContent>
    </Card>
  );
}
