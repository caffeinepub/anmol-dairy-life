import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllInventory, useAddInventoryEntry, useUpdateInventory } from '@/hooks/useQueries';
import { Plus, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '' });
  const [updateQuantity, setUpdateQuantity] = useState('');

  const inventoryQuery = useGetAllInventory();
  const addInventoryMutation = useAddInventoryEntry();
  const updateInventoryMutation = useUpdateInventory();

  const inventory = inventoryQuery.data || [];

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.quantity) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addInventoryMutation.mutateAsync({
        productName: newProduct.name,
        quantity: parseFloat(newProduct.quantity),
      });

      toast.success('Product added successfully');
      setShowAddDialog(false);
      setNewProduct({ name: '', quantity: '' });
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !updateQuantity) {
      toast.error('Please enter quantity');
      return;
    }

    try {
      await updateInventoryMutation.mutateAsync({
        productName: selectedProduct,
        quantity: parseFloat(updateQuantity),
      });

      toast.success('Stock updated successfully');
      setShowUpdateDialog(false);
      setUpdateQuantity('');
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    } else if (e.key === 'Escape') {
      if (showAddDialog) setShowAddDialog(false);
      if (showUpdateDialog) setShowUpdateDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Management</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" aria-label="Add new product">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent role="dialog" aria-labelledby="add-product-title" aria-describedby="add-product-description">
              <DialogHeader>
                <DialogTitle id="add-product-title">Add New Product</DialogTitle>
                <DialogDescription id="add-product-description">Enter product details to add to inventory</DialogDescription>
              </DialogHeader>
              <div className="space-y-4" onKeyDown={(e) => handleDialogKeyDown(e, handleAddProduct)}>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Enter product name"
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Initial Quantity</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    step="0.1"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    aria-required="true"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={addInventoryMutation.isPending}>
                  {addInventoryMutation.isPending ? 'Adding...' : 'Add Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No products in inventory</p>
          </div>
        ) : (
          <Table role="table" aria-label="Inventory list">
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Quantity in Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.product.name}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell className="text-right">{item.quantityInStock.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(item.product.name);
                        setShowUpdateDialog(true);
                      }}
                      className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`Add stock to ${item.product.name}`}
                    >
                      Add Stock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent role="dialog" aria-labelledby="update-stock-title" aria-describedby="update-stock-description">
            <DialogHeader>
              <DialogTitle id="update-stock-title">Add Stock</DialogTitle>
              <DialogDescription id="update-stock-description">
                Add stock to {selectedProduct}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2" onKeyDown={(e) => handleDialogKeyDown(e, handleUpdateStock)}>
              <Label htmlFor="addQuantity">Quantity to Add</Label>
              <Input
                id="addQuantity"
                type="number"
                step="0.1"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(e.target.value)}
                placeholder="Enter quantity to add"
                aria-required="true"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStock} disabled={updateInventoryMutation.isPending}>
                {updateInventoryMutation.isPending ? 'Updating...' : 'Add Stock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
