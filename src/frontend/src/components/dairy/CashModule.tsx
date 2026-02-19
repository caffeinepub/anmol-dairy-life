import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetFarmer, useAddTransaction } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function CashModule() {
  const [farmerID, setFarmerID] = useState('');
  const [transactionType, setTransactionType] = useState<'pay' | 'receive'>('receive');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentTime = new Date().toLocaleTimeString('en-IN');

  const farmerQuery = useGetFarmer(farmerID ? BigInt(farmerID) : null);
  const addTransactionMutation = useAddTransaction();

  const farmer = farmerQuery.data;

  const handleSave = async () => {
    if (!farmer || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const transactionAmount = transactionType === 'pay' ? -parseFloat(amount) : parseFloat(amount);
      const description = `Cash ${transactionType}${comment ? `: ${comment}` : ''}`;

      await addTransactionMutation.mutateAsync({
        farmerID: farmer.customerID,
        description,
        amount: transactionAmount,
      });

      toast.success('Cash transaction recorded successfully');
      setFarmerID('');
      setAmount('');
      setComment('');
      setTransactionType('receive');
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && farmer && amount) {
      handleSave();
    }
  };

  const handleRadioKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setTransactionType(transactionType === 'receive' ? 'pay' : 'receive');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Transaction</CardTitle>
        <CardDescription>
          Date: {currentDate} | Time: {currentTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="cashFarmerID">Farmer ID</Label>
            <Input
              id="cashFarmerID"
              type="number"
              value={farmerID}
              onChange={(e) => setFarmerID(e.target.value)}
              placeholder="Enter farmer ID"
              aria-label="Farmer ID"
            />
          </div>

          {farmer && (
            <div className="space-y-2">
              <Label>Farmer Name</Label>
              <div className="p-2 border rounded-md bg-muted">
                <span className="font-medium">{farmer.name}</span>
              </div>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={transactionType}
              onValueChange={(v: any) => setTransactionType(v)}
              onKeyDown={handleRadioKeyDown}
              aria-label="Transaction type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receive" id="receive" />
                <Label htmlFor="receive" className="font-normal cursor-pointer">
                  Receive (Positive Balance)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pay" id="pay" />
                <Label htmlFor="pay" className="font-normal cursor-pointer">
                  Pay (Negative Balance)
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
              aria-required="true"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any notes or comments"
              rows={3}
              aria-label="Transaction comment"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={addTransactionMutation.isPending}
          className="w-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Save cash transaction"
        >
          {addTransactionMutation.isPending ? 'Saving...' : 'Save Transaction'}
        </Button>
      </CardContent>
    </Card>
  );
}
