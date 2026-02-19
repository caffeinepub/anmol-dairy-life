import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllCollectionsForSession, useGetAllFarmers } from '@/hooks/useQueries';
import { formatCurrency, formatLessAdd } from '@/utils/formatters';
import { calculateAmount } from '@/utils/calculations';
import { Session, MilkType } from '../../backend';
import type { Session as SessionType } from '../../backend';

interface SessionEntriesListProps {
  session: SessionType;
}

export default function SessionEntriesList({ session }: SessionEntriesListProps) {
  const collectionsQuery = useGetAllCollectionsForSession(session);
  const farmersQuery = useGetAllFarmers();

  const collections = collectionsQuery.data || [];
  const farmers = farmersQuery.data || [];

  const getFarmerName = (farmerID: bigint) => {
    const farmer = farmers.find((f) => f.customerID === farmerID);
    return farmer?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {session === Session.morning ? 'Morning' : 'Evening'} Session Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No entries for this session</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>FAT</TableHead>
                  <TableHead>SNF</TableHead>
                  <TableHead>Less/Add</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((entry, index) => {
                  const calc = calculateAmount(
                    entry.milkType,
                    entry.weight,
                    entry.fat,
                    entry.snf || undefined,
                    entry.rate
                  );
                  return (
                    <TableRow key={index}>
                      <TableCell>{entry.farmerID.toString()}</TableCell>
                      <TableCell>{getFarmerName(entry.farmerID)}</TableCell>
                      <TableCell>{entry.milkType === MilkType.vlc ? 'VLC' : 'Thekadari'}</TableCell>
                      <TableCell>{entry.weight.toFixed(2)}</TableCell>
                      <TableCell>{entry.fat.toFixed(1)}%</TableCell>
                      <TableCell>{entry.snf ? `${entry.snf.toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{calc.lessAdd !== undefined ? formatLessAdd(calc.lessAdd) : '-'}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(calc.amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
