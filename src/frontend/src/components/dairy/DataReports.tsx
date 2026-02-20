import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useGetAllCollectionsForSession, useGetAllFarmers, useUpdateCollectionEntry, useGetRates } from '@/hooks/useQueries';
import { CalendarIcon, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatLessAdd } from '@/utils/formatters';
import { calculateAmount } from '@/utils/calculations';
import { Session, MilkType, CollectionEntry } from '../../backend';
import { toast } from 'sonner';

export default function DataReports() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sessionFilter, setSessionFilter] = useState<'morning' | 'evening' | 'both'>('both');
  const [currentPage, setCurrentPage] = useState(0);
  const [editingEntry, setEditingEntry] = useState<CollectionEntry | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editFat, setEditFat] = useState('');
  const [editSnf, setEditSnf] = useState('');
  const [editSession, setEditSession] = useState<Session>(Session.morning);
  const pageSize = 50;

  const morningQuery = useGetAllCollectionsForSession(Session.morning, currentPage);
  const eveningQuery = useGetAllCollectionsForSession(Session.evening, currentPage);
  const farmersQuery = useGetAllFarmers();
  const ratesQuery = useGetRates();
  const updateCollectionMutation = useUpdateCollectionEntry();

  const farmers = farmersQuery.data || [];
  const rates = ratesQuery.data || { vlc: 0, thekadari: 0 };

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

  const hasNextPage = filteredCollections.length === pageSize;
  const hasPrevPage = currentPage > 0;

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrevPage) {
      handlePrevPage();
    } else if (e.key === 'ArrowRight' && hasNextPage) {
      handleNextPage();
    }
  };

  const handleEditEntry = (entry: CollectionEntry) => {
    setEditingEntry(entry);
    setEditWeight(entry.weight.toString());
    setEditFat(entry.fat.toString());
    setEditSnf(entry.snf ? entry.snf.toString() : '');
    setEditSession(entry.session);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    const weightValue = parseFloat(editWeight);
    const fatValue = parseFloat(editFat);
    const snfValue = editSnf ? parseFloat(editSnf) : null;

    if (isNaN(weightValue) || weightValue <= 0 || isNaN(fatValue) || fatValue <= 0) {
      toast.error('Please enter valid weight and fat values');
      return;
    }

    if (editingEntry.milkType === MilkType.vlc && (!snfValue || isNaN(snfValue) || snfValue <= 0)) {
      toast.error('Please enter a valid SNF value for VLC milk');
      return;
    }

    try {
      const rate = editingEntry.milkType === MilkType.vlc ? rates.vlc : rates.thekadari;

      await updateCollectionMutation.mutateAsync({
        farmerID: editingEntry.farmerID,
        entryID: editingEntry.id,
        weight: weightValue,
        fat: fatValue,
        snf: snfValue,
        rate,
        session: editSession,
        milkType: editingEntry.milkType,
      });

      toast.success('Collection entry updated successfully');
      setEditingEntry(null);
      setEditWeight('');
      setEditFat('');
      setEditSnf('');
    } catch (error) {
      toast.error('Failed to update collection entry');
    }
  };

  const calculateEditAmount = () => {
    if (!editingEntry || !editWeight || !editFat) return 0;

    const weightValue = parseFloat(editWeight);
    const fatValue = parseFloat(editFat);
    const snfValue = editSnf ? parseFloat(editSnf) : undefined;
    const rate = editingEntry.milkType === MilkType.vlc ? rates.vlc : rates.thekadari;

    const calc = calculateAmount(editingEntry.milkType, weightValue, fatValue, snfValue, rate);
    return calc.amount;
  };

  return (
    <>
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
            <>
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
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections.map((entry) => {
                      const calc = calculateAmount(entry.milkType, entry.weight, entry.fat, entry.snf || undefined, entry.rate);
                      return (
                        <TableRow key={entry.id.toString()}>
                          <TableCell className="font-medium">{getFarmerName(entry.farmerID)}</TableCell>
                          <TableCell>{entry.weight.toFixed(2)}</TableCell>
                          <TableCell>{entry.fat.toFixed(2)}</TableCell>
                          <TableCell>{entry.snf ? entry.snf.toFixed(2) : '-'}</TableCell>
                          <TableCell>{formatLessAdd(calc.lessAdd || 0)}</TableCell>
                          <TableCell>{(calc.netMilk || entry.weight).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(calc.amount)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditEntry(entry)}
                              aria-label="Edit entry"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">{totals.quantity.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">{avgFat.toFixed(2)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="font-bold">{formatLessAdd(totals.lessAdd)}</TableCell>
                      <TableCell className="font-bold">{totals.netMilk.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(totals.amount)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="flex items-center justify-between pt-4" onKeyDown={handleKeyDown} tabIndex={0}>
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  aria-label="Previous page"
                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  aria-label="Next page"
                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection Entry</DialogTitle>
            <DialogDescription>Update the milk collection details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (Quantity)</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                placeholder="Enter weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fat">FAT %</Label>
              <Input
                id="edit-fat"
                type="number"
                step="0.1"
                value={editFat}
                onChange={(e) => setEditFat(e.target.value)}
                placeholder="Enter fat percentage"
              />
            </div>

            {editingEntry?.milkType === MilkType.vlc && (
              <div className="space-y-2">
                <Label htmlFor="edit-snf">SNF %</Label>
                <Input
                  id="edit-snf"
                  type="number"
                  step="0.1"
                  value={editSnf}
                  onChange={(e) => setEditSnf(e.target.value)}
                  placeholder="Enter SNF percentage"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-session">Session</Label>
              <Select value={editSession} onValueChange={(v: Session) => setEditSession(v)}>
                <SelectTrigger id="edit-session">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Session.morning}>Morning</SelectItem>
                  <SelectItem value={Session.evening}>Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editWeight && editFat && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Calculated Amount:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(calculateEditAmount())}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateCollectionMutation.isPending}>
              {updateCollectionMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
