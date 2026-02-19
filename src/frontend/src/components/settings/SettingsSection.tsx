import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FarmerManagement from './FarmerManagement';
import RateSettings from './RateSettings';
import InventoryManagement from './InventoryManagement';

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState('farmers');

  const handleTabKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabValue);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['farmers', 'rates', 'inventory'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[prevIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['farmers', 'rates', 'inventory'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setActiveTab(tabs[nextIndex]);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" role="tablist" aria-label="Settings tabs">
          <TabsTrigger
            value="farmers"
            onKeyDown={(e) => handleTabKeyDown(e, 'farmers')}
            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            role="tab"
            aria-selected={activeTab === 'farmers'}
          >
            Farmers
          </TabsTrigger>
          <TabsTrigger
            value="rates"
            onKeyDown={(e) => handleTabKeyDown(e, 'rates')}
            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            role="tab"
            aria-selected={activeTab === 'rates'}
          >
            Rate Settings
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            onKeyDown={(e) => handleTabKeyDown(e, 'inventory')}
            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            role="tab"
            aria-selected={activeTab === 'inventory'}
          >
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farmers" role="tabpanel">
          <FarmerManagement />
        </TabsContent>

        <TabsContent value="rates" role="tabpanel">
          <RateSettings />
        </TabsContent>

        <TabsContent value="inventory" role="tabpanel">
          <InventoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
