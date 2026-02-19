import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FarmerManagement from './FarmerManagement';
import RateSettings from './RateSettings';
import InventoryManagement from './InventoryManagement';

export default function SettingsSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="farmers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="rates">Rate Settings</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="farmers">
          <FarmerManagement />
        </TabsContent>

        <TabsContent value="rates">
          <RateSettings />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
