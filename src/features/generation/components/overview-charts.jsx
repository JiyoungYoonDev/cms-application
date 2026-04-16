'use client';

import { AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Job Status Distribution Bar ──

export function StatusDistribution({ ov }) {
  const total = ov.totalJobs ?? 0;
  if (total === 0) return null;

  const segments = [
    { key: 'completed', count: ov.completedJobs ?? 0, color: 'bg-emerald-500', label: 'Completed' },
    { key: 'partial', count: ov.partialJobs ?? 0, color: 'bg-amber-400', label: 'Partial' },
    { key: 'failed', count: ov.failedJobs ?? 0, color: 'bg-red-500', label: 'Failed' },
    { key: 'running', count: ov.runningJobs ?? 0, color: 'bg-blue-400', label: 'Running' },
    { key: 'pending', count: ov.pendingJobs ?? 0, color: 'bg-muted-foreground/30', label: 'Pending' },
  ].filter(s => s.count > 0);

  return (
    <div>
      <div className='flex rounded-full overflow-hidden h-2.5 gap-0.5'>
        {segments.map(s => (
          <div key={s.key} className={`${s.color} transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />
        ))}
      </div>
      <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap'>
        {segments.map(s => (
          <span key={s.key} className='flex items-center gap-1'>
            <span className={`w-2 h-2 rounded-full ${s.color} inline-block`} />
            {s.count} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Failure Analysis ──

export function FailureAnalysis({ ov }) {
  const reasons = ov.topFailureReasons ?? [];
  const problemJobs = ov.problemJobs ?? [];

  if (reasons.length === 0 && problemJobs.length === 0) return null;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {reasons.length > 0 && (
        <div className='rounded-xl border bg-card p-4'>
          <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
            <AlertTriangle size={13} className='text-red-500' />
            Top Failure Reasons
          </h4>
          <div className='space-y-2'>
            {reasons.map((r, i) => {
              const maxCount = reasons[0]?.count ?? 1;
              return (
                <div key={i}>
                  <div className='flex items-center justify-between text-sm mb-0.5'>
                    <span className='truncate mr-2'>{r.reason}</span>
                    <span className='font-bold text-red-600 tabular-nums shrink-0'>{r.count}</span>
                  </div>
                  <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-red-500/60 rounded-full' style={{ width: `${(r.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {problemJobs.length > 0 && (
        <div className='rounded-xl border bg-card p-4'>
          <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
            <XCircle size={13} className='text-red-500' />
            Failed / Partial Jobs
          </h4>
          <div className='space-y-2'>
            {problemJobs.map((j) => {
              const isFailed = j.status === 'FAILED';
              return (
                <div key={j.jobId} className={`rounded-lg p-2.5 border-l-2 ${isFailed ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-400 bg-amber-500/5'}`}>
                  <div className='flex items-center justify-between mb-0.5'>
                    <span className='text-sm font-medium truncate mr-2'>{j.courseTitle ?? `Job #${j.jobId}`}</span>
                    <Badge variant='outline' className={`text-[10px] ${isFailed ? 'text-red-600 border-red-300' : 'text-amber-600 border-amber-300'}`}>
                      {j.status}
                    </Badge>
                  </div>
                  {j.totalLectures != null && (
                    <p className='text-xs text-muted-foreground'>
                      Lectures: {j.completedLectures ?? 0}/{j.totalLectures}
                      {(j.failedLectures ?? 0) > 0 && <span className='text-red-500'> ({j.failedLectures} failed)</span>}
                    </p>
                  )}
                  {j.errorMessage && (
                    <p className='text-xs text-red-500 truncate mt-0.5'>{j.errorMessage}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 7-Day Trend ──

export function DailyTrend({ ov }) {
  const trend = ov.dailyTrend ?? [];
  if (trend.length === 0) return null;

  const maxDay = Math.max(...trend.map(d => (d.completed ?? 0) + (d.failed ?? 0) + (d.partial ?? 0)), 1);

  return (
    <div className='rounded-xl border bg-card p-4'>
      <h4 className='text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5'>
        <TrendingUp size={13} />
        Last 7 Days
      </h4>
      <div className='flex items-end gap-1.5 h-20'>
        {trend.map((d) => {
          const c = d.completed ?? 0;
          const f = d.failed ?? 0;
          const p = d.partial ?? 0;
          const total = c + f + p;
          const height = total > 0 ? Math.max((total / maxDay) * 100, 8) : 4;
          const dayLabel = d.date?.slice(5);

          return (
            <div key={d.date} className='flex-1 flex flex-col items-center gap-1' title={`${d.date}: ${c}C ${f}F ${p}P`}>
              <div className='w-full flex flex-col-reverse gap-px rounded-sm overflow-hidden' style={{ height: `${height}%` }}>
                {c > 0 && <div className='bg-emerald-500 flex-grow' style={{ flex: c }} />}
                {p > 0 && <div className='bg-amber-400 flex-grow' style={{ flex: p }} />}
                {f > 0 && <div className='bg-red-500 flex-grow' style={{ flex: f }} />}
                {total === 0 && <div className='bg-muted w-full h-full' />}
              </div>
              <span className='text-[9px] text-muted-foreground'>{dayLabel}</span>
            </div>
          );
        })}
      </div>
      <div className='flex items-center gap-3 mt-2 text-[10px] text-muted-foreground'>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block' />Completed</span>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-amber-400 inline-block' />Partial</span>
        <span className='flex items-center gap-1'><span className='w-1.5 h-1.5 rounded-full bg-red-500 inline-block' />Failed</span>
      </div>
    </div>
  );
}
