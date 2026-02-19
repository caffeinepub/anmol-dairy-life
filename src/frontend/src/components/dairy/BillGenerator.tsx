import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetFarmer, useGetAllCollectionsForSession } from '@/hooks/useQueries';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Share2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Session, MilkType } from '../../backend';
import { calculateAmount } from '@/utils/calculations';
import { formatCurrency, formatLessAdd } from '@/utils/formatters';

export default function BillGenerator() {
  const [customerID, setCustomerID] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const morningQuery = useGetAllCollectionsForSession(Session.morning);
  const eveningQuery = useGetAllCollectionsForSession(Session.evening);

  const farmer = farmerQuery.data;
  const allCollections = [...(morningQuery.data || []), ...(eveningQuery.data || [])];

  const getFilteredCollections = () => {
    if (!farmer || !fromDate || !toDate) return [];

    const fromTime = fromDate.getTime() * 1000000;
    const toTime = toDate.getTime() * 1000000 + (24 * 60 * 60 * 1000000000 - 1);

    return allCollections.filter(
      (entry) =>
        entry.farmerID === farmer.customerID &&
        Number(entry.date) >= fromTime &&
        Number(entry.date) <= toTime
    );
  };

  const filteredCollections = getFilteredCollections();

  const billTotals = filteredCollections.reduce(
    (acc, entry) => {
      const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
      return {
        quantity: acc.quantity + entry.weight,
        lessAdd: acc.lessAdd + (calc.lessAdd || 0),
        netMilk: acc.netMilk + (calc.netMilk || entry.weight),
        amount: acc.amount + calc.amount,
        totalFat: acc.totalFat + entry.fat,
        totalRate: acc.totalRate + entry.rate,
        count: acc.count + 1,
      };
    },
    { quantity: 0, lessAdd: 0, netMilk: 0, amount: 0, totalFat: 0, totalRate: 0, count: 0 }
  );

  const averageFat = billTotals.count > 0 ? billTotals.totalFat / billTotals.count : 0;
  const averageRate = billTotals.count > 0 ? billTotals.totalRate / billTotals.count : 0;

  const handleGeneratePDF = () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (filteredCollections.length === 0) {
      toast.error('No collections found for this period');
      return;
    }

    toast.info('Use your browser\'s Print function and select "Save as PDF"');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSharePDF = async () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (filteredCollections.length === 0) {
      toast.error('No collections found for this period');
      return;
    }

    const shareText = `Bill for ${farmer.name}\nPeriod: ${format(fromDate, 'PPP')} to ${format(toDate, 'PPP')}\nTotal Amount: ${formatCurrency(billTotals.amount)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bill for ${farmer.name}`,
          text: shareText,
        });
        toast.success('Shared successfully');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Bill details copied to clipboard');
      } catch {
        toast.info('Sharing not supported on this device');
      }
    }
  };

  const handlePrint = () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (filteredCollections.length === 0) {
      toast.error('No collections found for this period');
      return;
    }

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <>
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Generate Bill</CardTitle>
          <CardDescription>Generate milk collection bill for a farmer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billCustomerID">Customer ID</Label>
              <Input
                id="billCustomerID"
                type="number"
                value={customerID}
                onChange={(e) => setCustomerID(e.target.value)}
                placeholder="Enter customer ID"
                aria-label="Customer ID"
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

            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-label="Select from date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-label="Select to date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {farmer && fromDate && toDate && filteredCollections.length > 0 && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="text-sm text-muted-foreground mb-2">Bill Preview:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Entries:</span>
                  <span className="font-medium">{filteredCollections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-medium">{billTotals.quantity.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Fat:</span>
                  <span className="font-medium">{averageFat.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rate:</span>
                  <span className="font-medium">{formatCurrency(averageRate)}</span>
                </div>
                {farmer.milkType === MilkType.thekadari && (
                  <>
                    <div className="flex justify-between">
                      <span>Total Less/Add:</span>
                      <span className="font-medium">{formatLessAdd(billTotals.lessAdd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Net Milk:</span>
                      <span className="font-medium">{billTotals.netMilk.toFixed(2)} L</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Net Payable:</span>
                  <span className="font-bold text-primary">{formatCurrency(billTotals.amount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2"
              aria-label="Generate PDF"
              disabled={!farmer || !fromDate || !toDate || filteredCollections.length === 0}
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
            <Button
              onClick={handleSharePDF}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Share bill"
              disabled={!farmer || !fromDate || !toDate || filteredCollections.length === 0}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Print bill"
              disabled={!farmer || !fromDate || !toDate || filteredCollections.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print content - always rendered but hidden on screen */}
      {farmer && fromDate && toDate && filteredCollections.length > 0 && (
        <div className="bill-content">
          <div className="print-bill">
            {/* Header */}
            <div className="bill-header">
              <h1>DAIRYFLOW MILK COLLECTION</h1>
            </div>

            {/* Main content grid */}
            <div className="bill-info-grid">
              {/* Left section - Farmer details */}
              <div className="bill-left-section">
                <div className="info-row">
                  <span className="info-label">Village/Center Name, District</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">+91 9876543210</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Farmer Details:</span>
                </div>
                <div className="info-row indent">
                  <span className="info-value">{farmer.name}</span>
                </div>
                <div className="info-row indent">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{farmer.customerID.toString()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mobile:</span>
                  <span className="info-value">{farmer.phone}</span>
                </div>
              </div>

              {/* Center section - Bill period */}
              <div className="bill-center-section">
                <div className="info-row">
                  <span className="info-label">Bill Period:</span>
                </div>
                <div className="info-row">
                  <span className="info-value">{format(fromDate, 'dd MMM yyyy')} to {format(toDate, 'dd MMM yyyy')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Generated:</span>
                  <span className="info-value">{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* Collection table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Date Shift</th>
                  <th>Fat</th>
                  <th>SNF/CLR</th>
                  <th>Qty (L)</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((entry, index) => {
                  const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
                  const entryDate = new Date(Number(entry.date) / 1000000);
                  const shift = entry.session === Session.morning ? 'M' : 'E';
                  return (
                    <tr key={index}>
                      <td>{format(entryDate, 'dd/MM/yyyy')} {shift}</td>
                      <td>{entry.fat.toFixed(1)}</td>
                      <td>{entry.snf ? entry.snf.toFixed(1) : (farmer.milkType === MilkType.thekadari ? formatLessAdd(calc.lessAdd || 0) : '-')}</td>
                      <td>{entry.weight.toFixed(2)}</td>
                      <td>₹{entry.rate.toFixed(2)}</td>
                      <td>₹{calc.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals box */}
            <div className="bill-totals-box">
              <div className="totals-row">
                <span className="totals-label">Total Quantity:</span>
                <span className="totals-value">{billTotals.quantity.toFixed(2)} L</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Average Fat:</span>
                <span className="totals-value">{averageFat.toFixed(1)}%</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Average Rate:</span>
                <span className="totals-value">₹{averageRate.toFixed(2)}</span>
              </div>
              <div className="totals-row totals-final">
                <span className="totals-label">Net Payable:</span>
                <span className="totals-value">₹{billTotals.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="bill-footer">
              <div className="signature-section">
                <div className="signature-line"></div>
                <div className="signature-label">Collector Signature</div>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <div className="signature-label">Farmer Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
