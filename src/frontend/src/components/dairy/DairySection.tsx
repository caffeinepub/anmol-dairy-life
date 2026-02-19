import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MilkCollectionForm from './MilkCollectionForm';
import BillGenerator from './BillGenerator';
import DataReports from './DataReports';
import SellModule from './SellModule';
import CashModule from './CashModule';

export default function DairySection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="collection">Milk Collection</TabsTrigger>
          <TabsTrigger value="bill">Bill</TabsTrigger>
          <TabsTrigger value="data">Data Reports</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <MilkCollectionForm />
        </TabsContent>

        <TabsContent value="bill">
          <BillGenerator />
        </TabsContent>

        <TabsContent value="data">
          <DataReports />
        </TabsContent>

        <TabsContent value="sell">
          <SellModule />
        </TabsContent>

        <TabsContent value="cash">
          <CashModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}
