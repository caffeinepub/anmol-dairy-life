import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetFarmer, useGetCollectionsForBill } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { calculateAmount } from '@/utils/calculations';
import { Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MilkType, Session, type CollectionEntry } from '../../backend';

export default function BillGenerator() {
  const [customerID, setCustomerID] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shouldFetchBill, setShouldFetchBill] = useState(false);

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const collectionsQuery = useGetCollectionsForBill(
    customerID ? BigInt(customerID) : null,
    shouldFetchBill
  );

  const farmer = farmerQuery.data;
  const allCollections = collectionsQuery.data || [];

  // Filter collections by date range
  const filteredCollections = allCollections.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(Number(entry.date) / 1000000);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    return entryDate >= start && entryDate <= end;
  });

  const totalAmount = filteredCollections.reduce((sum, entry) => {
    const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
    return sum + calc.amount;
  }, 0);

  const totalWeight = filteredCollections.reduce((sum, entry) => sum + entry.weight, 0);

  // Format date for display in bill
  const formatDateForBill = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleGenerateBill = () => {
    if (!farmer) {
      toast.error('Please enter a valid customer ID');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    if (!shouldFetchBill) {
      toast.error('Please click "Load Bill Data" first');
      return;
    }

    if (filteredCollections.length === 0) {
      toast.error('No collections found for the selected date range');
      return;
    }

    window.print();
    toast.success('Bill generated successfully');
  };

  const handleLoadBillData = () => {
    if (!customerID) {
      toast.error('Please enter customer ID');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setShouldFetchBill(true);
    toast.success('Loading bill data...');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && farmer && startDate && endDate && shouldFetchBill) {
      e.preventDefault();
      handleGenerateBill();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && farmer && startDate && endDate && shouldFetchBill) {
        e.preventDefault();
        handleGenerateBill();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [farmer, startDate, endDate, shouldFetchBill, filteredCollections]);

  // Reset fetch state when inputs change
  useEffect(() => {
    setShouldFetchBill(false);
  }, [customerID, startDate, endDate]);

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
                tabIndex={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-start-date">Start Date</Label>
                <Input
                  id="bill-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  tabIndex={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-end-date">End Date</Label>
                <Input
                  id="bill-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  tabIndex={0}
                />
              </div>
            </div>

            {farmer && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Farmer:</strong> {farmer.name}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {farmer.phone}
                </p>
                <p className="text-sm">
                  <strong>Milk Type:</strong> {farmer.milkType.toUpperCase()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleLoadBillData}
                disabled={!customerID || !startDate || !endDate || collectionsQuery.isFetching}
                className="flex items-center gap-2"
                tabIndex={0}
              >
                {collectionsQuery.isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Bill Data'
                )}
              </Button>

              <Button
                onClick={handleGenerateBill}
                disabled={!shouldFetchBill || filteredCollections.length === 0 || collectionsQuery.isFetching}
                variant="default"
                className="flex items-center gap-2"
                aria-label="Generate PDF (Ctrl+P)"
                tabIndex={0}
              >
                <Printer className="h-4 w-4" />
                Generate PDF
              </Button>
            </div>

            {shouldFetchBill && !collectionsQuery.isFetching && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  <strong>Total Collections:</strong> {filteredCollections.length}
                </p>
                <p className="text-sm">
                  <strong>Total Weight:</strong> {totalWeight.toFixed(2)} kg
                </p>
                <p className="text-sm">
                  <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Printable Bill */}
      {shouldFetchBill && farmer && filteredCollections.length > 0 && (
        <div className="print-only">
          <div className="max-w-4xl mx-auto p-8 bg-white">
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
              <h1 className="text-3xl font-bold">Milk Collection Bill</h1>
              <p className="text-sm text-gray-600 mt-2">
                Generated on {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded">
              <h2 className="text-xl font-semibold mb-3">Farmer Details</h2>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Name:</strong> {farmer.name}
                </p>
                <p>
                  <strong>Customer ID:</strong> {farmer.customerID.toString()}
                </p>
                <p>
                  <strong>Phone:</strong> {farmer.phone}
                </p>
                <p>
                  <strong>Milk Type:</strong> {farmer.milkType.toUpperCase()}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p>
                  <strong>Billing Period:</strong> {formatDateForBill(startDate)} to {formatDateForBill(endDate)}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Collection Details</h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-800">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Session</th>
                    <th className="p-2 text-right">Quantity</th>
                    <th className="p-2 text-right">FAT</th>
                    <th className="p-2 text-right">SNF</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.map((entry, index) => {
                    const calc = calculateAmount(
                      entry.milkType,
                      entry.weight,
                      entry.fat,
                      entry.snf || undefined,
                      entry.rate
                    );
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="p-2">
                          {new Date(Number(entry.date) / 1000000).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-2 capitalize">{entry.session}</td>
                        <td className="p-2 text-right">{entry.weight.toFixed(2)} kg</td>
                        <td className="p-2 text-right">{entry.fat.toFixed(1)}%</td>
                        <td className="p-2 text-right">{entry.snf ? `${entry.snf.toFixed(1)}%` : '-'}</td>
                        <td className="p-2 text-right">{formatCurrency(entry.rate)}</td>
                        <td className="p-2 text-right">{formatCurrency(calc.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 border-t-2 border-gray-800 font-bold">
                    <td colSpan={2} className="p-2">
                      Total
                    </td>
                    <td className="p-2 text-right">{totalWeight.toFixed(2)} kg</td>
                    <td colSpan={3}></td>
                    <td className="p-2 text-right">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-gray-800 text-center text-xs text-gray-600">
              <p>This is a computer-generated document. No signature is required.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
