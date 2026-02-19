import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetFarmer } from '@/hooks/useQueries';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Share2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BillGenerator() {
  const [customerID, setCustomerID] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const farmer = farmerQuery.data;

  const handleGeneratePDF = () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }
    // PDF generation will be implemented with proper bill format
    toast.info('Generating PDF bill...');
    // TODO: Implement PDF generation matching the reference template
  };

  const handleSharePDF = async () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bill for ${farmer.name}`,
          text: `Milk collection bill from ${format(fromDate, 'PPP')} to ${format(toDate, 'PPP')}`,
        });
        toast.success('Shared successfully');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      toast.info('Sharing not supported on this device');
    }
  };

  const handlePrint = () => {
    if (!farmer || !fromDate || !toDate) {
      toast.error('Please fill all fields');
      return;
    }
    window.print();
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  return (
    <Card>
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

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGeneratePDF}
            onKeyDown={(e) => handleKeyDown(e, handleGeneratePDF)}
            className="flex items-center gap-2"
            aria-label="Generate PDF"
          >
            <FileText className="h-4 w-4" />
            Generate PDF
          </Button>
          <Button
            onClick={handleSharePDF}
            onKeyDown={(e) => handleKeyDown(e, handleSharePDF)}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Share PDF"
          >
            <Share2 className="h-4 w-4" />
            Share PDF
          </Button>
          <Button
            onClick={handlePrint}
            onKeyDown={(e) => handleKeyDown(e, handlePrint)}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Print bill"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Hidden print content */}
        {farmer && fromDate && toDate && (
          <div className="print-content hidden">
            <div className="print-bill">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">ANMOL DAIRY LIFE</h1>
                <p className="text-sm">Contact: +91-XXXXXXXXXX</p>
                <p className="text-sm">Email: info@anmoldairy.com</p>
              </div>
              <div className="mb-4">
                <p><strong>Customer ID:</strong> {farmer.customerID.toString()}</p>
                <p><strong>Name:</strong> {farmer.name}</p>
                <p><strong>Phone:</strong> {farmer.phone}</p>
                <p><strong>Bill Period:</strong> {format(fromDate, 'PPP')} to {format(toDate, 'PPP')}</p>
              </div>
              <p className="text-center text-muted-foreground">Bill details will be populated here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
