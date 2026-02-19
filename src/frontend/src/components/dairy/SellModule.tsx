import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGetFarmer, useAddProductSale, useGetAllInventory } from '@/hooks/useQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { generateSellBillHTML } from '@/utils/sellBillGenerator';

export default function SellModule() {
  const [farmerID, setFarmerID] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [lastSaleData, setLastSaleData] = useState<{
    farmerName: string | null;
    productName: string;
    pricePerUnit: number;
    quantity: number;
    totalAmount: number;
    timestamp: Date;
  } | null>(null);

  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentTime = new Date().toLocaleTimeString('en-IN');

  const farmerQuery = useGetFarmer(farmerID ? BigInt(farmerID) : null);
  const inventoryQuery = useGetAllInventory();
  const addSaleMutation = useAddProductSale();

  const farmer = farmerQuery.data;
  const inventory = inventoryQuery.data || [];

  const totalAmount = quantity && price ? parseFloat(quantity) * parseFloat(price) : 0;

  const handleSave = async () => {
    if (!productName || !quantity || !price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const timestamp = new Date();
      const saleData = {
        farmerName: farmer?.name || null,
        productName,
        pricePerUnit: parseFloat(price),
        quantity: parseFloat(quantity),
        totalAmount: parseFloat(quantity) * parseFloat(price),
        timestamp,
      };

      await addSaleMutation.mutateAsync({
        farmerID: farmerID ? BigInt(farmerID) : null,
        productName,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(price),
      });

      toast.success('Product sale recorded successfully');
      setLastSaleData(saleData);

      // Trigger print after successful save
      setTimeout(() => {
        triggerPrint(saleData);
      }, 100);

      // Reset form
      setFarmerID('');
      setProductName('');
      setQuantity('');
      setPrice('');
    } catch (error) {
      toast.error('Failed to record sale');
    }
  };

  const triggerPrint = (saleData: typeof lastSaleData) => {
    if (!saleData) return;

    // Generate bill HTML
    const billHTML = generateSellBillHTML(saleData);

    // Create or get the hidden bill container
    let billContainer = document.getElementById('sell-bill-container');
    if (!billContainer) {
      billContainer = document.createElement('div');
      billContainer.id = 'sell-bill-container';
      billContainer.className = 'bill-content';
      document.body.appendChild(billContainer);
    }

    // Inject the bill HTML
    billContainer.innerHTML = billHTML;

    // Add no-print class to main app content
    const appContent = document.getElementById('root');
    if (appContent) {
      appContent.classList.add('no-print');
    }

    // Trigger print
    window.print();

    // Cleanup after print (or cancel)
    setTimeout(() => {
      if (appContent) {
        appContent.classList.remove('no-print');
      }
    }, 500);
  };

  const handlePrint = () => {
    if (!lastSaleData) {
      toast.error('No recent sale to print');
      return;
    }
    triggerPrint(lastSaleData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && productName && quantity && price) {
      handleSave();
    }
  };

  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell Product</CardTitle>
        <CardDescription>
          Date: {currentDate} | Time: {currentTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="sellFarmerID">Farmer ID (Optional)</Label>
            <Input
              id="sellFarmerID"
              type="number"
              value={farmerID}
              onChange={(e) => setFarmerID(e.target.value)}
              placeholder="Enter farmer ID"
              aria-label="Farmer ID (optional)"
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
            <Label htmlFor="product">Product</Label>
            <Select value={productName} onValueChange={setProductName}>
              <SelectTrigger
                id="product"
                onKeyDown={handleSelectKeyDown}
                aria-label="Select product"
              >
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.product.name} value={item.product.name}>
                    {item.product.name} (Stock: {item.quantityInStock.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              aria-label="Product quantity"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per Unit</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              aria-label="Price per unit"
              aria-required="true"
            />
          </div>

          {totalAmount > 0 && (
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="p-2 border rounded-md bg-muted">
                <span className="font-bold text-lg text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={addSaleMutation.isPending}
            className="flex-1 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Save product sale"
          >
            {addSaleMutation.isPending ? 'Saving...' : 'Save Sale'}
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Print receipt"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
