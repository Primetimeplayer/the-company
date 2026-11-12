/** Money helpers. Every amount is integer pence. */

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format integer pence as GBP, e.g. 123456 -> "£1,234.56". */
export function formatGBP(pence: number): string {
  return gbpFormatter.format(pence / 100);
}

/** Round a percentage of an integer-pence amount to the nearest penny. */
export function percentOfPence(valuePence: number, percent: number): number {
  return Math.round((valuePence * percent) / 100);
}

export function sumPence(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function formatPercent(percent: number): string {
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
}
