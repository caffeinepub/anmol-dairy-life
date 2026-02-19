import { formatCurrency } from './formatters';

interface SellBillData {
  farmerName: string | null;
  productName: string;
  pricePerUnit: number;
  quantity: number;
  totalAmount: number;
  timestamp: Date;
}

export function generateSellBillHTML({
  farmerName,
  productName,
  pricePerUnit,
  quantity,
  totalAmount,
  timestamp,
}: SellBillData): string {
  const dateStr = timestamp.toLocaleDateString('en-IN');
  const timeStr = timestamp.toLocaleTimeString('en-IN');

  return `
    <div class="print-bill">
      <div class="bill-header">
        <h1>ANMOL DAIRY LIFE</h1>
        <p style="margin: 5pt 0 0 0; font-size: 9pt; color: #666;">Product Sale Receipt</p>
      </div>
      
      <div class="bill-info-grid">
        <div class="bill-left-section">
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${dateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${timeStr}</span>
          </div>
          ${farmerName ? `
          <div class="info-row">
            <span class="info-label">Farmer:</span>
            <span class="info-value">${farmerName}</span>
          </div>
          ` : ''}
        </div>
        <div class="bill-center-section">
          <div class="info-row">
            <span class="info-label">Product:</span>
            <span class="info-value">${productName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Quantity:</span>
            <span class="info-value">${quantity.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Price/Unit:</span>
            <span class="info-value">${formatCurrency(pricePerUnit)}</span>
          </div>
        </div>
      </div>
      
      <table class="bill-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price/Unit</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${productName}</td>
            <td>${formatCurrency(pricePerUnit)}</td>
            <td>${quantity.toFixed(2)}</td>
            <td>${formatCurrency(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="bill-totals-box">
        <div class="totals-row totals-final">
          <span class="totals-label">Total Amount:</span>
          <span class="totals-value">${formatCurrency(totalAmount)}</span>
        </div>
      </div>
      
      <div class="bill-footer">
        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-label">Customer Signature</div>
        </div>
        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature</div>
        </div>
      </div>
    </div>
  `;
}
