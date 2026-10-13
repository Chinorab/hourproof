const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** "$1,234.50" */
export function money(n: number): string {
  return usd.format(Math.round(n * 100) / 100);
}

const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** "$580" for thresholds and other whole amounts */
export function moneyWhole(n: number): string {
  return usdWhole.format(n);
}

/** "62.5" (one decimal, trailing .0 dropped) */
export function hours(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
