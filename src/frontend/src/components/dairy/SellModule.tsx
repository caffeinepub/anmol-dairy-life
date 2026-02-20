import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetFarmer, useGetAllInventory, useAddProductSale, useGetAllProductSales, useUpdateProductSale, useGetAllFarmers } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { ProductSale } from '../../backend';
import { format } from 'date-fns';

export default function SellModule() {
  const [customerID, setCustomerID] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [printBill, setPrintBill] = useState(false);
  const [editingSale, setEditingSale] = useState<ProductSale | null>(null);
  const [editCustomerID, setEditCustomerID] = useState('');
  const [editProduct, setEditProduct] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const farmerQuery = useGetFarmer(customerID ? BigInt(customerID) : null);
  const inventoryQuery = useGetAllInventory();
  const salesQuery = useGetAllProductSales();
  const farmersQuery = useGetAllFarmers();
  const addProductSaleMutation = useAddProductSale();
  const updateProductSaleMutation = useUpdateProductSale();

  const farmer = farmerQuery.data;
  const inventory = inventoryQuery.data || [];
  const sales = salesQuery.data || [];
  const farmers = farmersQuery.data || [];

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

  const handleEditSale = (sale: ProductSale) => {
    setEditingSale(sale);
    setEditCustomerID(sale.farmerID ? sale.farmerID.toString() : '');
    setEditProduct(sale.productName);
    setEditQuantity(sale.quantity.toString());
    setEditPrice(sale.pricePerUnit.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingSale || !editProduct || !editQuantity || !editPrice) {
      toast.error('Please fill all required fields');
      return;
    }

    const quantityValue = parseFloat(editQuantity);
    const priceValue = parseFloat(editPrice);

    if (isNaN(quantityValue) || quantityValue <= 0 || isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter valid quantity and price');
      return;
    }

    try {
      await updateProductSaleMutation.mutateAsync({
        saleID: editingSale.id,
        farmerID: editCustomerID ? BigInt(editCustomerID) : null,
        productName: editProduct,
        quantity: quantityValue,
        pricePerUnit: priceValue,
      });

      toast.success('Sale updated successfully');
      setEditingSale(null);
      setEditCustomerID('');
      setEditProduct('');
      setEditQuantity('');
      setEditPrice('');
    } catch (error) {
      toast.error('Failed to update sale');
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

  const editTotalAmount = editQuantity && editPrice
    ? parseFloat(editQuantity) * parseFloat(editPrice)
    : 0;

  const getFarmerName = (farmerID: bigint | undefined) => {
    if (!farmerID) return 'Walk-in Customer';
    const farmer = farmers.find((f) => f.customerID === farmerID);
    return farmer?.name || 'Unknown';
  };

  return (
    <>
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

            {sales.length > 0 && (
              <div className="mt-6 space-y-2">
                <Label>Recent Sales</Label>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.slice(0, 5).map((sale) => (
                        <TableRow key={sale.id.toString()}>
                          <TableCell className="text-sm">
                            {format(new Date(Number(sale.timestamp) / 1000000), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-sm">{getFarmerName(sale.farmerID)}</TableCell>
                          <TableCell className="text-sm">{sale.productName}</TableCell>
                          <TableCell className="text-right text-sm">{sale.quantity}</TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(sale.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSale(sale)}
                              aria-label="Edit sale"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Update the sale details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customerID">Customer ID (Optional)</Label>
              <Input
                id="edit-customerID"
                type="number"
                value={editCustomerID}
                onChange={(e) => setEditCustomerID(e.target.value)}
                placeholder="Enter customer ID or leave blank"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-product">Product</Label>
              <Select value={editProduct} onValueChange={setEditProduct}>
                <SelectTrigger id="edit-product">
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
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price per Unit</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Enter price per unit"
              />
            </div>

            {editTotalAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(editTotalAmount)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSale(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateProductSaleMutation.isPending}>
              {updateProductSaleMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
