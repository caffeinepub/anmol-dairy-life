import type { FarmerID } from '../backend';

export function generateTransactionPDF(farmerId: FarmerID): void {
  // Open the dedicated PDF route in a new window
  const pdfUrl = `/pdf/${farmerId.toString()}`;
  window.open(pdfUrl, '_blank');
}

export function cleanupPDFUrl(url: string): void {
  // No longer needed since we're using routes instead of blob URLs
  // Keeping for backward compatibility
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
