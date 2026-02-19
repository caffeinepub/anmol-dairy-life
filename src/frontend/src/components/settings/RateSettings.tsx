import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetRates, useUpdateRates } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function RateSettings() {
  const ratesQuery = useGetRates();
  const updateRatesMutation = useUpdateRates();

  const [vlcRate, setVlcRate] = useState('');
  const [thekadariRate, setThekadariRate] = useState('');

  const currentRates = ratesQuery.data || { vlc: 0, thekadari: 0 };

  const handleSaveVlcRate = async () => {
    if (!vlcRate) {
      toast.error('Please enter VLC rate');
      return;
    }

    try {
      await updateRatesMutation.mutateAsync({
        vlcRate: parseFloat(vlcRate),
        thekadariRate: currentRates.thekadari,
      });
      toast.success('VLC rate updated successfully');
      setVlcRate('');
    } catch (error) {
      toast.error('Failed to update VLC rate');
    }
  };

  const handleSaveThekadariRate = async () => {
    if (!thekadariRate) {
      toast.error('Please enter Thekadari rate');
      return;
    }

    try {
      await updateRatesMutation.mutateAsync({
        vlcRate: currentRates.vlc,
        thekadariRate: parseFloat(thekadariRate),
      });
      toast.success('Thekadari rate updated successfully');
      setThekadariRate('');
    } catch (error) {
      toast.error('Failed to update Thekadari rate');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Settings</CardTitle>
        <CardDescription>Configure global milk rates for VLC and Thekadari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VLC Rate */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">VLC (Cow) Milk Rate</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Current rate: ₹{currentRates.vlc.toFixed(2)} per kg
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                value={vlcRate}
                onChange={(e) => setVlcRate(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleSaveVlcRate)}
                placeholder="Enter new VLC rate"
                aria-label="VLC rate input"
              />
            </div>
            <Button
              onClick={handleSaveVlcRate}
              disabled={updateRatesMutation.isPending || !vlcRate}
              aria-label="Save VLC rate"
            >
              {updateRatesMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Thekadari Rate */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Thekadari (Buffalo) Milk Rate</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Current rate: ₹{currentRates.thekadari.toFixed(2)} per kg
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                value={thekadariRate}
                onChange={(e) => setThekadariRate(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleSaveThekadariRate)}
                placeholder="Enter new Thekadari rate"
                aria-label="Thekadari rate input"
              />
            </div>
            <Button
              onClick={handleSaveThekadariRate}
              disabled={updateRatesMutation.isPending || !thekadariRate}
              aria-label="Save Thekadari rate"
            >
              {updateRatesMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
