import { useState } from 'react';
import { useGetFarmer, useGetAllFarmerTransactions, useGetFarmerBalance } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FarmerID } from '../../backend';

interface FarmerPortalViewProps {
  farmerId: FarmerID;
}

export default function FarmerPortalView({ farmerId }: FarmerPortalViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const farmerQuery = useGetFarmer(farmerId);
  const balanceQuery = useGetFarmerBalance(farmerId);
  const allTransactionsQuery = useGetAllFarmerTransactions(farmerId, true);

  const farmer = farmerQuery.data;
  const balance = balanceQuery.data || 0;
  const transactions = allTransactionsQuery.data || [];

  const balanceColor = balance < 0 ? 'text-red-600' : 'text-green-600';

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (farmerQuery.isLoading || allTransactionsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg">Farmer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Farmer Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h2 className="text-3xl font-bold">{farmer.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer ID: {farmer.customerID.toString()}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="text-lg font-medium">{farmer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Milk Type</p>
                  <p className="text-lg font-medium uppercase">{farmer.milkType}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${balanceColor}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {balance < 0 ? 'Amount Due' : 'Credit Balance'}
            </p>
          </CardContent>
        </Card>

        {/* Transaction History Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total Transactions: {transactions.length}
            </p>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {currentTransactions.map((txn, index) => {
                    const amountColor = txn.amount < 0 ? 'text-red-600' : 'text-green-600';
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{txn.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDateTime(txn.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${amountColor}`}>
                              {formatCurrency(txn.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a read-only view of your account information.</p>
          <p className="mt-1">For any changes or queries, please contact the dairy office.</p>
        </div>
      </div>
    </div>
  );
}
