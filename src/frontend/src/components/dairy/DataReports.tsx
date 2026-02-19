import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useGetAllCollectionsForSession, useGetAllFarmers } from '@/hooks/useQueries';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatLessAdd } from '@/utils/formatters';
import { calculateAmount } from '@/utils/calculations';
import { Session, MilkType, CollectionEntry } from '../../backend';

export default function DataReports() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sessionFilter, setSessionFilter] = useState<'morning' | 'evening' | 'both'>('both');

  const morningQuery = useGetAllCollectionsForSession(Session.morning);
  const eveningQuery = useGetAllCollectionsForSession(Session.evening);
  const farmersQuery = useGetAllFarmers();

  const farmers = farmersQuery.data || [];

  const getFarmerName = (farmerID: bigint) => {
    const farmer = farmers.find((f) => f.customerID === farmerID);
    return farmer?.name || 'Unknown';
  };

  const filterCollections = () => {
    let collections: CollectionEntry[] = [];

    if (sessionFilter === 'both' || sessionFilter === 'morning') {
      collections = [...collections, ...(morningQuery.data || [])];
    }
    if (sessionFilter === 'both' || sessionFilter === 'evening') {
      collections = [...collections, ...(eveningQuery.data || [])];
    }

    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      collections = collections.filter((c) => {
        const collectionDate = new Date(Number(c.date) / 1000000);
        const collectionDateStr = format(collectionDate, 'yyyy-MM-dd');
        return collectionDateStr === selectedDateStr;
      });
    }

    return collections;
  };

  const filteredCollections = filterCollections();

  const totals = filteredCollections.reduce(
    (acc, entry) => {
      const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
      return {
        quantity: acc.quantity + entry.weight,
        fat: acc.fat + entry.fat,
        lessAdd: acc.lessAdd + (calc.lessAdd || 0),
        netMilk: acc.netMilk + (calc.netMilk || entry.weight),
        amount: acc.amount + calc.amount,
        count: acc.count + 1,
      };
    },
    { quantity: 0, fat: 0, lessAdd: 0, netMilk: 0, amount: 0, count: 0 }
  );

  const avgFat = totals.count > 0 ? totals.fat / totals.count : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Reports</CardTitle>
        <CardDescription>View milk collection data for specific dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Select date for report"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-filter">Session</Label>
            <Select value={sessionFilter} onValueChange={(v: any) => setSessionFilter(v)}>
              <SelectTrigger id="session-filter" aria-label="Select session filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data for selected filters</p>
        ) : (
          <div className="overflow-x-auto">
            <Table role="table" aria-label="Collection data report">
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>FAT</TableHead>
                  <TableHead>SNF</TableHead>
                  <TableHead>Less/Add</TableHead>
                  <TableHead>Net Milk</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((entry, index) => {
                  const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
                  return (
                    <TableRow key={index}>
                      <TableCell>{getFarmerName(entry.farmerID)}</TableCell>
                      <TableCell>{entry.weight.toFixed(2)} kg</TableCell>
                      <TableCell>{entry.fat.toFixed(1)}%</TableCell>
                      <TableCell>{entry.snf ? `${entry.snf.toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{calc.lessAdd !== undefined ? formatLessAdd(calc.lessAdd) : '-'}</TableCell>
                      <TableCell>{calc.netMilk ? calc.netMilk.toFixed(2) : entry.weight.toFixed(2)} kg</TableCell>
                      <TableCell className="text-right">{formatCurrency(calc.amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Totals</TableCell>
                  <TableCell className="font-bold">{totals.quantity.toFixed(2)} kg</TableCell>
                  <TableCell className="font-bold">{avgFat.toFixed(1)}%</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="font-bold">{formatLessAdd(totals.lessAdd)}</TableCell>
                  <TableCell className="font-bold">{totals.netMilk.toFixed(2)} kg</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totals.amount)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
