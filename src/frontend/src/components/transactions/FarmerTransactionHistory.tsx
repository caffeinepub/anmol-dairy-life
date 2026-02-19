import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useGetFarmerTransactions, useGetFarmerBalance } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
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

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const handleCreatePDF = () => {
    toast.info('PDF generation feature coming soon');
  };

  const handleSendSMS = async () => {
    if (!farmer) return;

    // Get last 3 transactions for summary
    const recentTransactions = transactions.slice(-3).reverse();
    
    // Format SMS message
    const transactionSummary = recentTransactions
      .map((txn) => {
        const date = new Date(Number(txn.timestamp) / 1000000).toLocaleDateString('en-IN');
        return `${date}: ${formatCurrency(txn.amount)}`;
      })
      .join('\n');

    const smsMessage = `${farmer.name}\nBalance: ${formatCurrency(balance)}\n\nRecent Transactions:\n${transactionSummary}\n\nView full details: ${window.location.origin}`;

    // Try to use Web Share API for SMS
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Transaction Summary - ${farmer.name}`,
          text: smsMessage,
        });
        toast.success('SMS prepared for sending');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Fallback to SMS URI
          window.location.href = `sms:${farmer.phone}?body=${encodeURIComponent(smsMessage)}`;
          toast.success('Opening SMS app...');
        }
      }
    } else {
      // Fallback to SMS URI
      window.location.href = `sms:${farmer.phone}?body=${encodeURIComponent(smsMessage)}`;
      toast.success('Opening SMS app...');
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
              aria-label="Send SMS"
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
