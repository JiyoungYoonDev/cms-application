'use client';

import { X, AlertTriangle, AlertCircle, Activity, Target, RefreshCw } from 'lucide-react';
import { TruncationPanel, PartialPanel, ParseRepairPanel } from './drill-down-quality-panels';
import { MatchRatePanel, RetryPanel } from './drill-down-analysis-panels';

const DRILL_DOWN_CONFIG = {
  truncations: {
    title: 'Truncation Debugger',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    Panel: TruncationPanel,
  },
  partial: {
    title: 'Partial Batch Analysis',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    Panel: PartialPanel,
  },
  parseRepair: {
    title: 'Parse Repair Inspector',
    icon: Activity,
    iconColor: 'text-yellow-500',
    Panel: ParseRepairPanel,
  },
  matchRate: {
    title: 'Match Rate Analysis',
    icon: Target,
    iconColor: 'text-red-500',
    Panel: MatchRatePanel,
  },
  retries: {
    title: 'Retry Analysis',
    icon: RefreshCw,
    iconColor: 'text-slate-500',
    Panel: RetryPanel,
  },
};

export default function DrillDownPanel({ metricKey, data, onClose }) {
  const config = DRILL_DOWN_CONFIG[metricKey];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className='rounded-xl border bg-card shadow-lg'>
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='flex items-center gap-2'>
          <Icon size={16} className={config.iconColor} />
          <h3 className='text-sm font-semibold'>{config.title}</h3>
        </div>
        <button onClick={onClose} className='p-1 rounded hover:bg-muted transition-colors'>
          <X size={16} className='text-muted-foreground' />
        </button>
      </div>
      <div className='p-4 max-h-[520px] overflow-y-auto'>
        <config.Panel data={data} />
      </div>
    </div>
  );
}
