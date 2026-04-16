'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { fmtPct, fmtMs } from '../utils/formatters';
import { BatchHeader, Empty, SummaryBar } from './drill-down-shared';

// ══════════════════════════════════════════
// MATCH RATE DRILL-DOWN
// ══════════════════════════════════════════

export function MatchRatePanel({ data }) {
  const [tab, setTab] = useState('lectures');
  const byLecture = data?.matchRateByLecture ?? [];
  const byItemType = data?.matchRateByItemType ?? [];
  const unmatched = data?.unmatchedDetails ?? [];

  return (
    <div className='space-y-4'>
      <div className='flex border-b'>
        {[
          { key: 'lectures', label: `By Lecture (${byLecture.length})` },
          { key: 'types', label: `By Item Type (${byItemType.length})` },
          { key: 'zero', label: `Zero Match (${unmatched.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors
              ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'lectures' && (
        byLecture.length === 0 ? <Empty text='No lecture data.' /> : (
          <div className='space-y-1.5'>
            {byLecture.map((l) => {
              const rate = Number(l.matchRate);
              const color = rate >= 90 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600';
              const barColor = rate >= 90 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={l.taskId} className='rounded-lg border bg-card p-3'>
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <span className='text-sm font-medium truncate'>{l.lectureTitle}</span>
                      <Badge variant='outline' className={`text-[10px] ${l.status === 'FAILED' ? 'text-red-600 border-red-300' : ''}`}>{l.status}</Badge>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${color}`}>{fmtPct(l.matchRate)}</span>
                  </div>
                  <p className='text-[10px] text-muted-foreground mb-1.5'>{l.sectionTitle} · {l.itemsMatched}/{l.itemsTotal} items</p>
                  <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'types' && (
        byItemType.length === 0 ? <Empty text='No item type data.' /> : (
          <div className='space-y-2'>
            {byItemType.map((t) => {
              const rate = Number(t.matchRate);
              const color = rate >= 90 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600';
              const barColor = rate >= 90 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={t.itemType} className='rounded-lg border bg-card p-3'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-semibold'>{t.itemType}</span>
                    <span className={`text-sm font-bold tabular-nums ${color}`}>{fmtPct(t.matchRate)}</span>
                  </div>
                  <p className='text-[10px] text-muted-foreground mb-1.5'>{t.matchedItems}/{t.totalItems} items matched</p>
                  <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'zero' && (
        unmatched.length === 0 ? <Empty text='No fully unmatched batches.' /> : (
          <div className='space-y-2'>
            {unmatched.map((item, i) => (
              <div key={item.batchId ?? i} className='rounded-lg border border-red-300 dark:border-red-800 bg-red-500/5 p-3'>
                <BatchHeader item={item} badges={
                  <>
                    <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>0/{item.itemsInBatch}</Badge>
                    {item.truncated && <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>TRUNCATED</Badge>}
                    {item.repaired && <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300'>REPAIRED</Badge>}
                  </>
                } />
                <div className='text-xs text-muted-foreground'>
                  <span>Status: <span className='text-red-600 font-medium'>{item.status}</span></span>
                </div>
                {item.errorMessage && (
                  <p className='text-[10px] text-red-500 mt-1 truncate'>{item.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// RETRY DRILL-DOWN
// ══════════════════════════════════════════

export function RetryPanel({ data }) {
  const items = data?.retryDetails ?? [];
  const successCount = data?.retrySuccessCount ?? 0;
  const failCount = data?.retryFailCount ?? 0;
  const avgCount = data?.avgRetryCount ?? 0;
  if (!items.length) return <Empty text='No retries performed.' />;

  return (
    <div className='space-y-4'>
      <SummaryBar items={[
        { value: items.length, label: 'Retried Batches' },
        { value: successCount, label: 'Succeeded After Retry', color: 'bg-emerald-500/5 border-emerald-300' },
        { value: failCount, label: 'Still Failed', color: 'bg-red-500/5 border-red-300' },
        { value: avgCount, label: 'Avg Retries/Batch' },
      ]} />

      <div className='space-y-2'>
        {items.map((item, i) => {
          const succeeded = item.succeeded;
          const borderColor = succeeded ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/5'
            : 'border-red-300 dark:border-red-800 bg-red-500/5';
          return (
            <div key={item.batchId ?? i} className={`rounded-lg border p-3 ${borderColor}`}>
              <BatchHeader item={item} badges={
                <>
                  <Badge className={`text-[9px] ${succeeded ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300' : 'bg-red-500/10 text-red-600 border-red-300'}`}>
                    {succeeded ? 'RECOVERED' : 'STILL FAILED'}
                  </Badge>
                  <Badge variant='outline' className='text-[9px]'>x{item.retryCount}</Badge>
                </>
              } />
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>Reason:</span>{' '}
                  <span className='font-medium'>{item.retryReason}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Matched:</span>{' '}
                  <span className='font-bold'>{item.itemsMatched}/{item.itemsInBatch}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Latency:</span>{' '}
                  <span>{fmtMs(item.latencyMs)}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Status:</span>{' '}
                  <span>{item.status}</span>
                </div>
              </div>
              {item.errorMessage && (
                <p className='text-[10px] text-red-500 mt-1 truncate'>{item.errorMessage}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
