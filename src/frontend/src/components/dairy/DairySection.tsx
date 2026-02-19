import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MilkCollectionForm from './MilkCollectionForm';
import BillGenerator from './BillGenerator';
import DataReports from './DataReports';
import SellModule from './SellModule';
import CashModule from './CashModule';
import { useDairyKeyboardShortcuts } from '@/hooks/useDairyKeyboardShortcuts';

interface DairySectionProps {
  isActive: boolean;
}

export default function DairySection({ isActive }: DairySectionProps) {
  const [activeTab, setActiveTab] = useState('collection');

  // Dairy-specific keyboard shortcuts
  useDairyKeyboardShortcuts({
    isActive,
    onNavigateToMilkCollection: () => setActiveTab('collection'),
    onNavigateToBill: () => setActiveTab('bill'),
    onNavigateToData: () => setActiveTab('data'),
    onNavigateToSell: () => setActiveTab('sell'),
    onNavigateToCash: () => setActiveTab('cash'),
  });

  const handleTabKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabValue);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['collection', 'bill', 'data', 'sell', 'cash'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[prevIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['collection', 'bill', 'data', 'sell', 'cash'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setActiveTab(tabs[nextIndex]);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5" role="tablist" aria-label="Dairy module tabs">
          <TabsTrigger
            value="collection"
            onKeyDown={(e) => handleTabKeyDown(e, 'collection')}
            role="tab"
            tabIndex={activeTab === 'collection' ? 0 : -1}
            aria-selected={activeTab === 'collection'}
          >
            Milk Collection
          </TabsTrigger>
          <TabsTrigger
            value="bill"
            onKeyDown={(e) => handleTabKeyDown(e, 'bill')}
            role="tab"
            tabIndex={activeTab === 'bill' ? 0 : -1}
            aria-selected={activeTab === 'bill'}
          >
            Bill
          </TabsTrigger>
          <TabsTrigger
            value="data"
            onKeyDown={(e) => handleTabKeyDown(e, 'data')}
            role="tab"
            tabIndex={activeTab === 'data' ? 0 : -1}
            aria-selected={activeTab === 'data'}
          >
            Data Reports
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            onKeyDown={(e) => handleTabKeyDown(e, 'sell')}
            role="tab"
            tabIndex={activeTab === 'sell' ? 0 : -1}
            aria-selected={activeTab === 'sell'}
          >
            Sell
          </TabsTrigger>
          <TabsTrigger
            value="cash"
            onKeyDown={(e) => handleTabKeyDown(e, 'cash')}
            role="tab"
            tabIndex={activeTab === 'cash' ? 0 : -1}
            aria-selected={activeTab === 'cash'}
          >
            Cash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" role="tabpanel">
          <MilkCollectionForm />
        </TabsContent>

        <TabsContent value="bill" role="tabpanel">
          <BillGenerator />
        </TabsContent>

        <TabsContent value="data" role="tabpanel">
          <DataReports />
        </TabsContent>

        <TabsContent value="sell" role="tabpanel">
          <SellModule />
        </TabsContent>

        <TabsContent value="cash" role="tabpanel">
          <CashModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}
