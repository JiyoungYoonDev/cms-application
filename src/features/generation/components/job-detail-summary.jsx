'use client';

import {
  Zap, Target, DollarSign, Clock, BookOpen, AlertTriangle, AlertCircle,
  Layers, Search, Settings2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtMs, fmtPct, fmtCost, fmtDate } from '../utils/formatters';
import { StatusBadge } from './job-detail-status-badge';

/** Fix 5: Clickable stat cards. Parent owns `activeFilter` and passes setter. */
export function JobSummary({ d, activeFilter, setActiveFilter }) {
  const tasksByStatus = d.tasksByStatus ?? {};
  const successLectures = tasksByStatus.COMPLETED ?? 0;
  const partialLectures = tasksByStatus.PARTIALLY_COMPLETED ?? 0;
  const failedLectures = tasksByStatus.FAILED ?? 0;

  function toggleFilter(name) {
    setActiveFilter((prev) => prev === name ? null : name);
  }

  return (
    <div className='space-y-4'>
      {/* Top row: key info */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <div className='rounded-lg border bg-card p-3'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5'>Course</p>
          <p className='text-sm font-semibold truncate'>{d.courseTitle ?? '-'}</p>
          {d.topic && <p className='text-[10px] text-muted-foreground truncate mt-0.5'>{d.topic}</p>}
        </div>
        <div className='rounded-lg border bg-card p-3'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5'>Model</p>
          <p className='text-sm font-semibold'>{d.modelName ?? '-'}</p>
          <p className='text-[10px] text-muted-foreground mt-0.5'>Started {fmtDate(d.createdAt)}</p>
        </div>
        <div className='rounded-lg border bg-card p-3'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5'>Prompt Versions</p>
          {(d.promptVersionsUsed ?? []).length > 0 ? (
            <div className='flex flex-wrap gap-1 mt-1'>
              {[...(d.promptVersionsUsed ?? [])].map((v) => (
                <Badge key={v} variant='outline' className='text-[10px]'>{v}</Badge>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>Not linked</p>
          )}
        </div>
        <div className='rounded-lg border bg-card p-3'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5'>Status</p>
          <div className='mt-1'><StatusBadge status={d.status} /></div>
          {d.errorMessage && <p className='text-[10px] text-red-500 truncate mt-1'>{d.errorMessage}</p>}
        </div>
      </div>

      {/* Stats row — Fix 5: clickable to filter */}
      <div className='grid grid-cols-3 lg:grid-cols-7 gap-2'>
        <MiniStat icon={Zap} label='Tokens' value={fmt((d.totalPromptTokens ?? 0) + (d.totalCompletionTokens ?? 0))}
          sub={`${fmt(d.totalPromptTokens)} in / ${fmt(d.totalCompletionTokens)} out`} />
        <MiniStat icon={DollarSign} label='Cost' value={fmtCost(d.totalCostUsd)} />
        <MiniStat icon={Clock} label='Wall Time' value={d.wallTimeMs ? fmtMs(d.wallTimeMs) : '-'}
          sub={`API: ${fmtMs(d.totalLatencyMs)}`} />
        <MiniStat icon={BookOpen} label='Lectures'
          value={`${successLectures}/${d.totalTasks ?? 0}`}
          sub={[
            partialLectures > 0 ? `${partialLectures} partial` : null,
            failedLectures > 0 ? `${failedLectures} failed` : null,
          ].filter(Boolean).join(', ') || 'all succeeded'}
          alert={failedLectures > 0}
          onClick={() => toggleFilter('failed')}
          active={activeFilter === 'failed'} />
        <MiniStat icon={Target} label='Match Rate' value={fmtPct(d.itemMatchRate)}
          sub={`${d.matchedItems ?? 0}/${d.totalItems ?? 0} items`}
          alert={Number(d.itemMatchRate) < 90}
          onClick={() => toggleFilter('partial')}
          active={activeFilter === 'partial'} />
        <MiniStat icon={AlertTriangle} label='Truncations' value={d.totalTruncations ?? 0}
          alert={d.totalTruncations > 0}
          onClick={() => toggleFilter('truncated')}
          active={activeFilter === 'truncated'} />
        <MiniStat icon={AlertCircle} label='Repairs' value={d.totalRepairs ?? 0}
          alert={d.totalRepairs > 0}
          onClick={() => toggleFilter('repaired')}
          active={activeFilter === 'repaired'} />
        {(d.totalSplits ?? 0) > 0 && (
          <MiniStat icon={Layers} label='Splits' value={d.totalSplits ?? 0}
            sub='auto-recovered' />
        )}
      </div>

      {activeFilter && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Search size={12} />
          <span>Filtering: <strong className='text-foreground'>{activeFilter}</strong> lectures</span>
          <button onClick={() => setActiveFilter(null)} className='text-blue-500 hover:underline ml-1'>Clear</button>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, alert, onClick, active }) {
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-lg border p-2.5 transition-colors',
        alert ? 'border-red-300 dark:border-red-800 bg-red-500/5' : 'bg-card',
        active ? 'ring-2 ring-blue-500 border-blue-400' : '',
        clickable ? 'cursor-pointer hover:bg-muted/50' : '',
      ].join(' ')}
    >
      <div className='flex items-center gap-1.5 mb-0.5'>
        {Icon && <Icon size={12} className='text-muted-foreground' />}
        <p className='text-[10px] text-muted-foreground'>{label}</p>
      </div>
      <p className={`text-base font-bold tabular-nums ${alert ? 'text-red-600' : ''}`}>{value}</p>
      {sub && <p className='text-[10px] text-muted-foreground truncate'>{sub}</p>}
    </div>
  );
}

export function FormInputsSection({ d }) {
  const entries = [
    { label: 'Job Type', value: d.jobType },
    { label: 'Level', value: d.level },
    { label: 'Target Audience', value: d.targetAudience },
    { label: 'Sections', value: d.numberOfSections },
    { label: 'Tone', value: d.tone },
    { label: 'Access Policy', value: d.accessPolicy },
    { label: 'Extra Instructions', value: d.extraInstructions },
  ].filter(e => e.value != null && e.value !== '');

  if (entries.length === 0) return null;

  return (
    <div className='rounded-xl border bg-card p-4'>
      <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
        <Settings2 size={13} />
        Generation Inputs
      </h4>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2'>
        {entries.map(({ label, value }) => (
          <div key={label} className={label === 'Extra Instructions' ? 'col-span-full' : ''}>
            <p className='text-[10px] text-muted-foreground uppercase tracking-wider'>{label}</p>
            <p className={`text-sm font-medium mt-0.5 ${label === 'Extra Instructions' ? 'whitespace-pre-wrap text-xs text-muted-foreground font-normal' : ''}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
