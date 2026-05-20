export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export const fmt = (n) => (n < 0 ? '-' : '') + '฿' + Math.abs(Math.round(n)).toLocaleString('en-US');

export const fmtCompact = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + '฿' + (abs / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return sign + '฿' + (abs / 1000).toFixed(1) + 'K';
  return sign + '฿' + Math.round(abs);
};

export const monthLabel = (m) =>
  ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m - 1] || '?';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const tradeKey = (s) => `${s.day}-${s.month}-${s.year}`;

/** Append to log, trim to last 80 entries. */
export function pushLog(state, text, kind = 'info') {
  const entry = { year: state.year, month: state.month, day: state.day, text, kind };
  const next = [...state.log, entry];
  if (next.length > 80) next.splice(0, next.length - 80);
  return next;
}
