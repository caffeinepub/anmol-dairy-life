import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetAllFarmers, useGetFarmerBalance } from '@/hooks/useQueries';
import { useArrowKeyNavigation } from '@/hooks/useArrowKeyNavigation';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import FarmerTransactionHistory from './FarmerTransactionHistory';
import type { FarmerID, Farmer } from '../../backend';

export default function TransactionsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmerID, setSelectedFarmerID] = useState<FarmerID | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const farmersQuery = useGetAllFarmers();
  const farmers = farmersQuery.data || [];

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.customerID.toString().includes(searchQuery)
  );

  // Arrow key navigation
  const { focusedIndex } = useArrowKeyNavigation({
    itemCount: filteredFarmers.length,
    onSelect: (index) => {
      setSelectedFarmerID(filteredFarmers[index].customerID);
    },
    isEnabled: !selectedFarmerID,
  });

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

  if (selectedFarmerID) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedFarmerID(null)}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Back to farmers list"
          tabIndex={0}
        >
          ← Back to Farmers List
        </button>
        <FarmerTransactionHistory farmerID={selectedFarmerID} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search farmers... (Ctrl+F)"
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
          {filteredFarmers.map((farmer, index) => (
            <FarmerListItem
              key={farmer.customerID.toString()}
              farmer={farmer}
              onClick={() => setSelectedFarmerID(farmer.customerID)}
              isFocused={index === focusedIndex}
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

function FarmerListItem({ 
  farmer, 
  onClick,
  isFocused 
}: { 
  farmer: Farmer; 
  onClick: () => void;
  isFocused: boolean;
}) {
  const balanceQuery = useGetFarmerBalance(farmer.customerID);
  const balance = balanceQuery.data || 0;

  const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer ${
        isFocused ? 'ring-2 ring-ring ring-offset-2 bg-accent' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      aria-label={`View transactions for ${farmer.name}`}
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
