import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetFarmer, useGetAllInventory, useAddProductSale } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

export default function SellModule() {
  const [customerID, setCustomerID] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [printBill, setPrintBill] = useState(false);

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const inventoryQuery = useGetAllInventory();
  const addProductSaleMutation = useAddProductSale();

  const farmer = farmerQuery.data;
  const inventory = inventoryQuery.data || [];

  const handleRecordSale = async () => {
    if (!selectedProduct || !quantity || !pricePerUnit) {
      toast.error('Please fill all required fields');
      return;
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(pricePerUnit);

    if (isNaN(quantityValue) || quantityValue <= 0 || isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter valid quantity and price');
      return;
    }

    try {
      await addProductSaleMutation.mutateAsync({
        farmerID: farmer?.customerID || null,
        productName: selectedProduct,
        quantity: quantityValue,
        pricePerUnit: priceValue,
      });

      toast.success('Sale recorded successfully');
      
      if (printBill) {
        window.print();
      }

      setCustomerID('');
      setSelectedProduct('');
      setQuantity('');
      setPricePerUnit('');
      setPrintBill(false);
    } catch (error) {
      toast.error('Failed to record sale');
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedProduct && quantity && pricePerUnit) {
      e.preventDefault();
      handleRecordSale();
    }
  };

  const totalAmount = quantity && pricePerUnit 
    ? parseFloat(quantity) * parseFloat(pricePerUnit) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell Module</CardTitle>
        <CardDescription>Record product sales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4" onKeyDown={handleFormKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="sell-customerID">Customer ID (Optional)</Label>
            <Input
              id="sell-customerID"
              type="number"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
              placeholder="Enter customer ID or leave blank"
              aria-label="Customer ID"
              tabIndex={0}
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
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" aria-label="Select product" tabIndex={0}>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.product.name} value={item.product.name}>
                    {item.product.name} (Stock: {item.quantityInStock})
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
              aria-label="Quantity"
              tabIndex={0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Price per Unit</Label>
            <Input
              id="pricePerUnit"
              type="number"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              placeholder="Enter price per unit"
              aria-label="Price per unit"
              tabIndex={0}
            />
          </div>

          {totalAmount > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="printBill"
              checked={printBill}
              onCheckedChange={(checked) => setPrintBill(checked as boolean)}
              aria-label="Print bill after recording sale"
              tabIndex={0}
            />
            <Label htmlFor="printBill" className="font-normal cursor-pointer">
              Print bill after recording sale
            </Label>
          </div>

          <Button
            onClick={handleRecordSale}
            disabled={addProductSaleMutation.isPending}
            className="w-full"
            aria-label="Record sale"
            tabIndex={0}
          >
            {addProductSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
