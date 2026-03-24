export const fmt = (n: number): string =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export const fmtYen = (n: number): string => "¥" + n.toLocaleString("ja-JP");
