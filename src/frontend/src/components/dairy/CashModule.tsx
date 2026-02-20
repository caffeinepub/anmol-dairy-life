import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useAddTransaction, useGetFarmerTransactions, useUpdateTransaction } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Transaction } from '../../backend';
import { format } from 'date-fns';

export default function CashModule() {
  const [customerID, setCustomerID] = useState('');
  const [transactionType, setTransactionType] = useState<'pay' | 'receive'>('pay');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editType, setEditType] = useState<'pay' | 'receive'>('pay');

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const transactionsQuery = useGetFarmerTransactions(customerID ? BigInt(customerID) : null, 0);
  const addTransactionMutation = useAddTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const farmer = farmerQuery.data;
  const transactions = transactionsQuery.data || [];

  const handleRecordTransaction = async () => {
    if (!farmer || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const transactionAmount = transactionType === 'pay' ? -amountValue : amountValue;
      const description = comment || (transactionType === 'pay' ? 'Cash payment' : 'Cash received');

      await addTransactionMutation.mutateAsync({
        farmerID: farmer.customerID,
        description,
        amount: transactionAmount,
      });

      toast.success('Transaction recorded successfully');
      setAmount('');
      setComment('');
      setTransactionType('pay');
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditComment(transaction.description);
    setEditType(transaction.amount < 0 ? 'pay' : 'receive');
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction || !farmer) return;

    const amountValue = parseFloat(editAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const transactionAmount = editType === 'pay' ? -amountValue : amountValue;
      const description = editComment || (editType === 'pay' ? 'Cash payment' : 'Cash received');

      await updateTransactionMutation.mutateAsync({
        farmerID: farmer.customerID,
        transactionID: editingTransaction.id,
        description,
        amount: transactionAmount,
      });

      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
      setEditAmount('');
      setEditComment('');
      setEditType('pay');
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && farmer && amount) {
      e.preventDefault();
      handleRecordTransaction();
    }
  };

  const handleRadioKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setTransactionType('pay');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setTransactionType('receive');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cash Module</CardTitle>
          <CardDescription>Record cash payments and receipts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4" onKeyDown={handleFormKeyDown}>
            <div className="space-y-2">
              <Label htmlFor="cash-customerID">Customer ID</Label>
              <Input
                id="cash-customerID"
                type="number"
                value={customerID}
                onChange={(e) => setCustomerID(e.target.value)}
                placeholder="Enter customer ID"
                aria-label="Customer ID"
                tabIndex={0}
              />
            </div>

            {farmer && (
              <>
                <div className="space-y-2">
                  <Label>Farmer Name</Label>
                  <div className="p-2 border rounded-md bg-muted">
                    <span className="font-medium">{farmer.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <RadioGroup
                    value={transactionType}
                    onValueChange={(v: 'pay' | 'receive') => setTransactionType(v)}
                    aria-label="Select transaction type"
                    onKeyDown={handleRadioKeyDown}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pay" id="pay" tabIndex={0} />
                      <Label htmlFor="pay" className="font-normal cursor-pointer">
                        Cash Payment (Debit)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="receive" id="receive" tabIndex={0} />
                      <Label htmlFor="receive" className="font-normal cursor-pointer">
                        Cash Received (Credit)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    aria-label="Transaction amount"
                    tabIndex={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comment (Optional)</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note about this transaction"
                    aria-label="Transaction comment"
                    tabIndex={0}
                  />
                </div>

                <Button
                  onClick={handleRecordTransaction}
                  disabled={addTransactionMutation.isPending}
                  className="w-full"
                  aria-label="Record transaction"
                  tabIndex={0}
                >
                  {addTransactionMutation.isPending ? 'Recording...' : 'Record Transaction'}
                </Button>

                {transactions.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <Label>Recent Transactions</Label>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.slice(0, 5).map((txn) => (
                            <TableRow key={txn.id.toString()}>
                              <TableCell className="text-sm">
                                {format(new Date(Number(txn.timestamp) / 1000000), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="text-sm">{txn.description}</TableCell>
                              <TableCell className={`text-right text-sm font-medium ${txn.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(txn.amount)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditTransaction(txn)}
                                  aria-label="Edit transaction"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={editType}
                onValueChange={(v: 'pay' | 'receive') => setEditType(v)}
                aria-label="Select transaction type"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pay" id="edit-pay" />
                  <Label htmlFor="edit-pay" className="font-normal cursor-pointer">
                    Cash Payment (Debit)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receive" id="edit-receive" />
                  <Label htmlFor="edit-receive" className="font-normal cursor-pointer">
                    Cash Received (Credit)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-comment">Description</Label>
              <Textarea
                id="edit-comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Add a note about this transaction"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateTransactionMutation.isPending}>
              {updateTransactionMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
