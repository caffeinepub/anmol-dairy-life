import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetAllFarmers, useGetFarmerBalance } from '@/hooks/useQueries';
import { Search } from 'lucide-react';
import FarmerTransactionHistory from './FarmerTransactionHistory';
import { formatCurrency } from '@/utils/formatters';

export default function TransactionsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmerID, setSelectedFarmerID] = useState<bigint | null>(null);

  const farmersQuery = useGetAllFarmers();
  const farmers = farmersQuery.data || [];

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.customerID.toString().includes(searchQuery)
  );

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedFarmerID(null);
    }
  };

  if (selectedFarmerID) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setSelectedFarmerID(null)}
          onKeyDown={handleBackKeyDown}
          className="mb-4 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Back to all farmers"
        >
          ← Back to All Farmers
        </Button>
        <FarmerTransactionHistory farmerID={selectedFarmerID} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farmer Transactions</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search farmers"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2" role="list" aria-label="Farmers list">
          {filteredFarmers.map((farmer) => (
            <FarmerBalanceCard
              key={farmer.customerID.toString()}
              farmer={farmer}
              onSelect={() => setSelectedFarmerID(farmer.customerID)}
            />
          ))}
          {filteredFarmers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No farmers found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FarmerBalanceCard({ farmer, onSelect }: { farmer: any; onSelect: () => void }) {
  const balanceQuery = useGetFarmerBalance(farmer.customerID);
  const balance = balanceQuery.data || 0;

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      role="listitem"
      aria-label={`${farmer.name}, balance ${formatCurrency(balance)}`}
    >
      <div>
        <p className="font-medium">{farmer.name}</p>
        <p className="text-sm text-muted-foreground">ID: {farmer.customerID.toString()}</p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${balanceColor}`}>{formatCurrency(balance)}</p>
        <p className="text-xs text-muted-foreground">Balance</p>
      </div>
    </div>
  );
}
