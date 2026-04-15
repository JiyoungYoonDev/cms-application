/**
 * Shared formatters for generation admin UI.
 * Pure functions, no React/imports. Safe to use anywhere.
 */

export function fmt(n) {
  if (n == null) return '-';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

export function fmtMs(ms) {
  if (ms == null) return '-';
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + 'm';
  if (ms >= 1_000) return (ms / 1_000).toFixed(1) + 's';
  return ms + 'ms';
}

export function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

export function fmtCost(n) {
  if (n == null) return '-';
  return '$' + Number(n).toFixed(4);
}

export function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function parseTitles(raw) {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}
