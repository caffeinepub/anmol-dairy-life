import type { Farmer, Transaction } from '../backend';
import { formatCurrency, formatDateTime } from './formatters';

interface PDFGeneratorOptions {
  farmer: Farmer;
  balance: number;
  transactions: Transaction[];
}

export function generateTransactionPDF({ farmer, balance, transactions }: PDFGeneratorOptions): string {
  // Create a hidden container for the PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.padding = '20mm';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Build the PDF content
  const balanceColor = balance < 0 ? '#dc2626' : '#16a34a';
  
  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 28px; color: #333;">Transaction History</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Farmer Details</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Name:</strong> ${farmer.name}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Customer ID:</strong> ${farmer.customerID.toString()}</p>
          </div>
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Phone:</strong> ${farmer.phone}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Milk Type:</strong> ${farmer.milkType.toUpperCase()}</p>
          </div>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${balanceColor};">
            Current Balance: ${formatCurrency(balance)}
          </p>
        </div>
      </div>
      
      <div>
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">Transaction Records (${transactions.length} total)</h2>
        ${transactions.length === 0 ? 
          '<p style="text-align: center; color: #666; padding: 40px 0;">No transactions found</p>' :
          `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6; border-bottom: 2px solid #333;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Date & Time</th>
                <th style="padding: 12px; text-align: left; font-weight: 600;">Description</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map((txn, index) => {
                const amountColor = txn.amount < 0 ? '#dc2626' : '#16a34a';
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                return `
                  <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px;">${formatDateTime(txn.timestamp)}</td>
                    <td style="padding: 12px;">${txn.description}</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600; color: ${amountColor};">
                      ${formatCurrency(txn.amount)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>`
        }
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Use browser's print functionality to generate PDF
  // Return the HTML content as a data URL that can be used for sharing
  const htmlContent = container.innerHTML;
  document.body.removeChild(container);
  
  // Create a blob URL from the HTML content
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Transaction History - ${farmer.name}</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `], { type: 'text/html' });
  
  return URL.createObjectURL(blob);
}

export function cleanupPDFUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
