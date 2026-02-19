import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetAllFarmers, useAddFarmer, useGetFarmerBalance, useUpdateFarmerDetails } from '@/hooks/useQueries';
import { Search, Plus, Edit } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { MilkType, type Farmer } from '../../backend';

export default function FarmerManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [newFarmer, setNewFarmer] = useState({
    name: '',
    phone: '',
    milkType: MilkType.vlc,
  });
  const [editFarmer, setEditFarmer] = useState({
    name: '',
    phone: '',
    milkType: MilkType.vlc,
    customerID: '',
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const farmersQuery = useGetAllFarmers();
  const addFarmerMutation = useAddFarmer();
  const updateFarmerMutation = useUpdateFarmerDetails();

  const farmers = farmersQuery.data || [];

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.customerID.toString().includes(searchQuery)
  );

  // Ctrl+F to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddFarmer = async () => {
    if (!newFarmer.name || !newFarmer.phone) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addFarmerMutation.mutateAsync({
        name: newFarmer.name,
        phone: newFarmer.phone,
        milkType: newFarmer.milkType,
      });

      toast.success('Farmer added successfully');
      setShowAddDialog(false);
      setNewFarmer({ name: '', phone: '', milkType: MilkType.vlc });
      
      // Return focus to add button
      setTimeout(() => addButtonRef.current?.focus(), 100);
    } catch (error) {
      toast.error('Failed to add farmer');
    }
  };

  const handleEditClick = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setEditFarmer({
      name: farmer.name,
      phone: farmer.phone,
      milkType: farmer.milkType,
      customerID: farmer.customerID.toString(),
    });
    setShowEditDialog(true);
  };

  const handleUpdateFarmer = async () => {
    if (!selectedFarmer || !editFarmer.name || !editFarmer.phone || !editFarmer.customerID) {
      toast.error('Please fill all fields');
      return;
    }

    const newCustomerID = BigInt(editFarmer.customerID);
    
    // Check if customer ID is being changed and if it's unique
    if (newCustomerID !== selectedFarmer.customerID) {
      const isDuplicate = farmers.some(
        (f) => f.customerID === newCustomerID && f.customerID !== selectedFarmer.customerID
      );
      if (isDuplicate) {
        toast.error('Customer ID already exists');
        return;
      }
    }

    try {
      await updateFarmerMutation.mutateAsync({
        id: selectedFarmer.customerID,
        name: editFarmer.name,
        phone: editFarmer.phone,
        milkType: editFarmer.milkType,
        customerID: newCustomerID,
      });

      toast.success('Farmer details updated successfully');
      setShowEditDialog(false);
      setSelectedFarmer(null);
      
      // Return focus to edit button
      setTimeout(() => editButtonRef.current?.focus(), 100);
    } catch (error) {
      toast.error('Failed to update farmer details');
    }
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Farmer Management</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button ref={addButtonRef} className="flex items-center gap-2" aria-label="Add new farmer" tabIndex={0}>
                <Plus className="h-4 w-4" />
                Add Farmer
              </Button>
            </DialogTrigger>
            <DialogContent role="dialog" aria-labelledby="add-farmer-title" aria-describedby="add-farmer-description">
              <DialogHeader>
                <DialogTitle id="add-farmer-title">Add New Farmer</DialogTitle>
                <DialogDescription id="add-farmer-description">Enter farmer details to create a new account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4" onKeyDown={(e) => handleDialogKeyDown(e, handleAddFarmer)}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newFarmer.name}
                    onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                    placeholder="Enter farmer name"
                    aria-required="true"
                    tabIndex={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newFarmer.phone}
                    onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
                    placeholder="Enter phone number"
                    aria-required="true"
                    tabIndex={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Milk Type</Label>
                  <RadioGroup
                    value={newFarmer.milkType}
                    onValueChange={(v: MilkType) => setNewFarmer({ ...newFarmer, milkType: v })}
                    aria-label="Select milk type"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={MilkType.vlc} id="add-vlc" tabIndex={0} />
                      <Label htmlFor="add-vlc" className="font-normal cursor-pointer">
                        VLC (Cow)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={MilkType.thekadari} id="add-thekadari" tabIndex={0} />
                      <Label htmlFor="add-thekadari" className="font-normal cursor-pointer">
                        Thekadari (Buffalo)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} tabIndex={0}>
                  Cancel
                </Button>
                <Button onClick={handleAddFarmer} disabled={addFarmerMutation.isPending} tabIndex={0}>
                  {addFarmerMutation.isPending ? 'Adding...' : 'Add Farmer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search by name or ID... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search farmers"
            tabIndex={0}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2" role="list" aria-label="Farmers list">
          {filteredFarmers.map((farmer) => (
            <FarmerCard
              key={farmer.customerID.toString()}
              farmer={farmer}
              onEdit={() => handleEditClick(farmer)}
              editButtonRef={editButtonRef}
            />
          ))}
          {filteredFarmers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No farmers found</p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent role="dialog" aria-labelledby="edit-farmer-title" aria-describedby="edit-farmer-description">
          <DialogHeader>
            <DialogTitle id="edit-farmer-title">Edit Farmer Details</DialogTitle>
            <DialogDescription id="edit-farmer-description">Update farmer information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4" onKeyDown={(e) => handleDialogKeyDown(e, handleUpdateFarmer)}>
            <div className="space-y-2">
              <Label htmlFor="edit-customerID">Customer ID</Label>
              <Input
                id="edit-customerID"
                type="number"
                value={editFarmer.customerID}
                onChange={(e) => setEditFarmer({ ...editFarmer, customerID: e.target.value })}
                placeholder="Enter customer ID"
                aria-required="true"
                tabIndex={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFarmer.name}
                onChange={(e) => setEditFarmer({ ...editFarmer, name: e.target.value })}
                placeholder="Enter farmer name"
                aria-required="true"
                tabIndex={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFarmer.phone}
                onChange={(e) => setEditFarmer({ ...editFarmer, phone: e.target.value })}
                placeholder="Enter phone number"
                aria-required="true"
                tabIndex={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Milk Type</Label>
              <RadioGroup
                value={editFarmer.milkType}
                onValueChange={(v: MilkType) => setEditFarmer({ ...editFarmer, milkType: v })}
                aria-label="Select milk type"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MilkType.vlc} id="edit-vlc" tabIndex={0} />
                  <Label htmlFor="edit-vlc" className="font-normal cursor-pointer">
                    VLC (Cow)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MilkType.thekadari} id="edit-thekadari" tabIndex={0} />
                  <Label htmlFor="edit-thekadari" className="font-normal cursor-pointer">
                    Thekadari (Buffalo)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} tabIndex={0}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFarmer} disabled={updateFarmerMutation.isPending} tabIndex={0}>
              {updateFarmerMutation.isPending ? 'Updating...' : 'Update Farmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function FarmerCard({ 
  farmer, 
  onEdit,
  editButtonRef 
}: { 
  farmer: Farmer; 
  onEdit: () => void;
  editButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const balanceQuery = useGetFarmerBalance(farmer.customerID);
  const balance = balanceQuery.data || 0;

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit();
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listitem"
    >
      <div>
        <p className="font-medium">{farmer.name}</p>
        <p className="text-sm text-muted-foreground">
          ID: {farmer.customerID.toString()} | {farmer.milkType === MilkType.vlc ? 'VLC' : 'Thekadari'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-lg font-bold ${balanceColor}`}>{formatCurrency(balance)}</p>
          <p className="text-xs text-muted-foreground">Balance</p>
        </div>
        <Button
          ref={editButtonRef}
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-2"
          aria-label={`Edit ${farmer.name}`}
          tabIndex={0}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
}
