import { useEffect } from 'react';
import { useGetFarmer, useGetAllFarmerTransactions, useGetFarmerBalance } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { FarmerID } from '../../backend';

interface PDFViewProps {
  farmerId: FarmerID;
}

export default function PDFView({ farmerId }: PDFViewProps) {
  const farmerQuery = useGetFarmer(farmerId);
  const balanceQuery = useGetFarmerBalance(farmerId);
  const allTransactionsQuery = useGetAllFarmerTransactions(farmerId, true);

  const farmer = farmerQuery.data;
  const balance = balanceQuery.data || 0;
  const transactions = allTransactionsQuery.data || [];

  const balanceColor = balance < 0 ? 'text-red-600' : 'text-green-600';

  // Trigger print dialog once data is loaded
  useEffect(() => {
    if (farmer && !farmerQuery.isFetching && !allTransactionsQuery.isFetching) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [farmer, farmerQuery.isFetching, allTransactionsQuery.isFetching]);

  if (farmerQuery.isLoading || allTransactionsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 text-lg">Farmer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-view-container">
      <div className="pdf-content">
        {/* Header Section */}
        <div className="pdf-header">
          <h1>Transaction History</h1>
          <p className="pdf-date">
            Generated on {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Farmer Details Section */}
        <div className="pdf-farmer-details">
          <div className="pdf-farmer-info">
            <div>
              <h2 className="pdf-farmer-name">{farmer.name}</h2>
              <p className="pdf-farmer-id">ID: {farmer.customerID.toString()}</p>
              <p className={`pdf-balance ${balanceColor}`}>
                Balance: {formatCurrency(balance)}
              </p>
            </div>
            <div className="pdf-farmer-meta">
              <p><strong>Phone:</strong> {farmer.phone}</p>
              <p><strong>Milk Type:</strong> {farmer.milkType.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Transaction Table Section */}
        <div className="pdf-table-container">
          {transactions.length === 0 ? (
            <div className="pdf-no-data">No transactions found</div>
          ) : (
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => {
                  const amountColor = txn.amount < 0 ? 'text-red-600' : 'text-green-600';
                  return (
                    <tr key={index}>
                      <td>{formatDateTime(txn.timestamp)}</td>
                      <td>{txn.description}</td>
                      <td className={`pdf-amount ${amountColor}`}>
                        {formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Section */}
        <div className="pdf-footer">
          <p className="pdf-total-txn">Total Transactions: {transactions.length}</p>
          <p className="pdf-disclaimer">This is a computer-generated document. No signature is required.</p>
        </div>
      </div>
    </div>
  );
}
