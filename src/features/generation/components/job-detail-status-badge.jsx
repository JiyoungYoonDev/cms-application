'use client';

import {
  CheckCircle2, XCircle, AlertTriangle, Clock, AlertCircle, Layers,
} from 'lucide-react';

export const STATUS_STYLE = {
  COMPLETED:           { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: '' },
  FAILED:              { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-300 dark:border-red-800' },
  PARTIALLY_COMPLETED: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-300 dark:border-amber-800' },
  IN_PROGRESS:         { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10', border: '' },
  PENDING:             { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', border: '' },
  SKIPPED:             { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted', border: '' },
  CANCELLED:           { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-300 dark:border-orange-800' },
  SPLIT:               { icon: Layers, color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-300 dark:border-violet-800' },
};

export function StatusBadge({ status, size = 'default' }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const Icon = s.icon;
  const cls = size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${s.bg} ${s.color} ${cls}`}>
      <Icon size={size === 'sm' ? 10 : 11} />{status}
    </span>
  );
}
