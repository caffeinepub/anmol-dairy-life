export function formatLessAdd(value: number): string {
  const formattedValue = value.toFixed(2);
  return value >= 0 ? `+${formattedValue}` : formattedValue;
}

export function calculateLessAddTotal(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0);
}

export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
