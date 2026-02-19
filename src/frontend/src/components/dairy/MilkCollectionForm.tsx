import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetFarmer, useAddCollectionEntry, useGetAllCollectionsForSession, useGetRates } from '@/hooks/useQueries';
import { getCurrentSession, calculateAmount } from '@/utils/calculations';
import { formatCurrency, formatLessAdd } from '@/utils/formatters';
import SessionEntriesList from './SessionEntriesList';
import { toast } from 'sonner';
import { Session, MilkType } from '../../backend';

export default function MilkCollectionForm() {
  const [customerID, setCustomerID] = useState('');
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const [snf, setSnf] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const weightInputRef = useRef<HTMLInputElement>(null);
  const fatInputRef = useRef<HTMLInputElement>(null);

  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentSession = getCurrentSession();

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const ratesQuery = useGetRates();
  const addCollectionMutation = useAddCollectionEntry();
  const collectionsQuery = useGetAllCollectionsForSession(currentSession);

  const farmer = farmerQuery.data;
  const rates = ratesQuery.data || { vlc: 0, thekadari: 0 };

  useEffect(() => {
    if (!farmer) {
      setWeight('');
      setFat('');
      setSnf('');
    }
  }, [farmer]);

  const handlePreview = () => {
    if (!farmer || !weight || !fat) {
      toast.error('Please fill all required fields');
      return;
    }

    if (farmer.milkType === MilkType.vlc && !snf) {
      toast.error('SNF is required for VLC milk');
      return;
    }

    const rate = farmer.milkType === MilkType.vlc ? rates.vlc : rates.thekadari;

    const calculation = calculateAmount(
      farmer.milkType,
      parseFloat(weight),
      parseFloat(fat),
      snf ? parseFloat(snf) : undefined,
      rate
    );

    setPreviewData({
      farmer,
      weight: parseFloat(weight),
      fat: parseFloat(fat),
      snf: snf ? parseFloat(snf) : null,
      rate,
      ...calculation,
    });
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!farmer || !previewData) return;

    try {
      await addCollectionMutation.mutateAsync({
        farmerID: farmer.customerID,
        weight: previewData.weight,
        fat: previewData.fat,
        snf: previewData.snf,
        rate: previewData.rate,
        session: currentSession,
      });

      toast.success('Collection entry saved successfully');
      setShowPreview(false);
      setCustomerID('');
      setWeight('');
      setFat('');
      setSnf('');
      collectionsQuery.refetch();
    } catch (error) {
      toast.error('Failed to save collection entry');
    }
  };

  const handleCustomerIDKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && farmer) {
      e.preventDefault();
      weightInputRef.current?.focus();
    }
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fatInputRef.current?.focus();
    }
  };

  const handleFatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (farmer && weight && fat) {
        if (farmer.milkType === MilkType.vlc && !snf) {
          return; // Don't submit if SNF is required but missing
        }
        handlePreview();
      }
    }
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !addCollectionMutation.isPending) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Milk Collection Entry</CardTitle>
          <CardDescription>
            Date: {currentDate} | Session: {currentSession === Session.morning ? 'Morning' : 'Evening'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerID">Customer ID</Label>
              <Input
                id="customerID"
                type="number"
                value={customerID}
                onChange={(e) => setCustomerID(e.target.value)}
                onKeyDown={handleCustomerIDKeyDown}
                placeholder="Enter customer ID"
                aria-label="Customer ID"
                tabIndex={0}
              />
            </div>

            {farmer && (
              <>
                <div className="space-y-2">
                  <Label>Farmer Name</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <img
                      src={farmer.milkType === MilkType.vlc ? '/assets/generated/icon-cow.dim_64x64.png' : '/assets/generated/icon-buffalo.dim_64x64.png'}
                      alt={farmer.milkType}
                      className="h-6 w-6"
                    />
                    <span className="font-medium">{farmer.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({farmer.milkType === MilkType.vlc ? 'VLC' : 'Thekadari'})
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    ref={weightInputRef}
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={handleWeightKeyDown}
                    placeholder="Enter weight"
                    aria-label="Weight in kilograms"
                    tabIndex={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat">FAT (%)</Label>
                  <Input
                    id="fat"
                    ref={fatInputRef}
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    onKeyDown={handleFatKeyDown}
                    placeholder="Enter FAT"
                    aria-label="FAT percentage"
                    tabIndex={0}
                  />
                </div>

                {farmer.milkType === MilkType.vlc && (
                  <div className="space-y-2">
                    <Label htmlFor="snf">SNF (%)</Label>
                    <Input
                      id="snf"
                      type="number"
                      step="0.1"
                      value={snf}
                      onChange={(e) => setSnf(e.target.value)}
                      placeholder="Enter SNF"
                      aria-label="SNF percentage"
                      aria-required="true"
                      tabIndex={0}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {farmer && (
            <Button
              onClick={handlePreview}
              className="w-full"
              aria-label="Preview milk collection entry"
              tabIndex={0}
            >
              Preview Entry
            </Button>
          )}
        </CardContent>
      </Card>

      <SessionEntriesList session={currentSession} />

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent
          role="dialog"
          aria-labelledby="preview-title"
          aria-describedby="preview-description"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogHeader>
            <DialogTitle id="preview-title">Preview Collection Entry</DialogTitle>
            <DialogDescription id="preview-description">Please verify the details before saving</DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Farmer:</div>
                <div>{previewData.farmer.name}</div>

                <div className="font-medium">Milk Type:</div>
                <div>{previewData.farmer.milkType === MilkType.vlc ? 'VLC' : 'Thekadari'}</div>

                <div className="font-medium">Weight:</div>
                <div>{previewData.weight} kg</div>

                <div className="font-medium">FAT:</div>
                <div>{previewData.fat}%</div>

                {previewData.snf !== null && (
                  <>
                    <div className="font-medium">SNF:</div>
                    <div>{previewData.snf}%</div>
                  </>
                )}

                {previewData.lessAdd !== undefined && (
                  <>
                    <div className="font-medium">Less/Add:</div>
                    <div>{formatLessAdd(previewData.lessAdd)}</div>

                    <div className="font-medium">Net Milk:</div>
                    <div>{previewData.netMilk?.toFixed(2)} kg</div>
                  </>
                )}

                <div className="font-medium">Rate:</div>
                <div>{formatCurrency(previewData.rate)}</div>

                <div className="font-medium text-lg pt-2 border-t">Total Amount:</div>
                <div className="text-lg font-bold pt-2 border-t text-primary">
                  {formatCurrency(previewData.amount)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)} tabIndex={0}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={addCollectionMutation.isPending} tabIndex={0}>
              {addCollectionMutation.isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
