import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetFarmer, useGetFarmerTransactions } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime, formatLessAdd } from '@/utils/formatters';
import { calculateAmount } from '@/utils/calculations';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { MilkType, Session, type CollectionEntry } from '../../backend';

export default function BillGenerator() {
  const [customerID, setCustomerID] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const transactionsQuery = useGetFarmerTransactions(customerID ? BigInt(customerID) : null);

  const farmer = farmerQuery.data;
  const transactions = transactionsQuery.data || [];

  // Filter collection entries from transactions
  const collectionEntries = transactions
    .filter((txn) => txn.description.includes('Milk collection'))
    .filter((txn) => {
      if (!startDate || !endDate) return true;
      const txnDate = new Date(Number(txn.timestamp) / 1000000);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return txnDate >= start && txnDate <= end;
    });

  const totalAmount = collectionEntries.reduce((sum, txn) => sum + txn.amount, 0);
  const totalWeight = collectionEntries.length * 10; // Placeholder
  const totalDeductions = transactions
    .filter((txn) => txn.amount < 0 && !txn.description.includes('Milk collection'))
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  const netPayable = totalAmount - totalDeductions;

  const handleGenerateBill = () => {
    if (!farmer) {
      toast.error('Please select a farmer');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }

    window.print();
    toast.success('Bill generated successfully');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && farmer && startDate && endDate) {
      e.preventDefault();
      handleGenerateBill();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && farmer && startDate && endDate) {
        e.preventDefault();
        handleGenerateBill();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [farmer, startDate, endDate]);

  return (
    <>
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Bill Generator</CardTitle>
          <CardDescription>Generate bills for farmers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div className="space-y-2">
              <Label htmlFor="bill-customerID">Customer ID</Label>
              <Input
                id="bill-customerID"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      aria-label="Start date"
                      tabIndex={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      aria-label="End date"
                      tabIndex={0}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Total Entries:</span>
                      <span className="font-medium">{collectionEntries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Net Payable:</span>
                      <span className="text-primary">{formatCurrency(netPayable)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerateBill}
                  disabled={!startDate || !endDate}
                  className="w-full flex items-center gap-2"
                  aria-label="Generate and print bill"
                  tabIndex={0}
                >
                  <Printer className="h-4 w-4" />
                  Generate Bill (Ctrl+P)
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bill Content - Hidden on screen, visible in print */}
      {farmer && startDate && endDate && (
        <div className="bill-content">
          <div className="print-bill">
            <div className="bill-header">
              <h1>ANMOL DAIRY LIFE</h1>
              <p>Milk Collection Bill</p>
            </div>

            <div className="bill-info-grid">
              <div className="bill-left-section">
                <div className="info-row">
                  <span className="info-label">Farmer Name:</span>
                  <span className="info-value">{farmer.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Customer ID:</span>
                  <span className="info-value">{farmer.customerID.toString()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{farmer.phone}</span>
                </div>
              </div>
              <div className="bill-center-section">
                <div className="info-row">
                  <span className="info-label">Bill Period:</span>
                  <span className="info-value">{startDate} to {endDate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Milk Type:</span>
                  <span className="info-value">{farmer.milkType === MilkType.vlc ? 'VLC (Cow)' : 'Thekadari (Buffalo)'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Entries:</span>
                  <span className="info-value">{collectionEntries.length}</span>
                </div>
              </div>
            </div>

            <table className="bill-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Weight (kg)</th>
                  <th>FAT %</th>
                  {farmer.milkType === MilkType.vlc && <th>SNF %</th>}
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {collectionEntries.map((txn) => (
                  <tr key={txn.id.toString()}>
                    <td>{formatDateTime(txn.timestamp)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    {farmer.milkType === MilkType.vlc && <td>-</td>}
                    <td>-</td>
                    <td>{formatCurrency(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-totals-box">
              <div className="totals-row">
                <span className="totals-label">Total Amount:</span>
                <span className="totals-value">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Deductions:</span>
                <span className="totals-value">-{formatCurrency(totalDeductions)}</span>
              </div>
              <div className="totals-row totals-final">
                <span className="totals-label">Net Payable:</span>
                <span className="totals-value">{formatCurrency(netPayable)}</span>
              </div>
            </div>

            <div className="bill-footer">
              <div className="signature-section">
                <div className="signature-line"></div>
                <p className="signature-label">Farmer's Signature</p>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p className="signature-label">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
