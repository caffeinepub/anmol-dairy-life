import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useGetFarmer, useAddTransaction } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

export default function CashModule() {
  const [customerID, setCustomerID] = useState('');
  const [transactionType, setTransactionType] = useState<'pay' | 'receive'>('pay');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const addTransactionMutation = useAddTransaction();

  const farmer = farmerQuery.data;

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
      const transactionAmount = transactionType === 'pay' ? amountValue : -amountValue;
      const description = comment || (transactionType === 'pay' ? 'Cash payment' : 'Cash received');

      await addTransactionMutation.mutateAsync({
        farmerID: farmer.customerID,
        description,
        amount: transactionAmount,
      });

      toast.success('Transaction recorded successfully');
      setCustomerID('');
      setAmount('');
      setComment('');
      setTransactionType('pay');
    } catch (error) {
      toast.error('Failed to record transaction');
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
                      Pay to Farmer (Credit)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="receive" id="receive" tabIndex={0} />
                    <Label htmlFor="receive" className="font-normal cursor-pointer">
                      Receive from Farmer (Debit)
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
