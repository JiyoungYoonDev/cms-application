'use client';

import { Badge } from '@/components/ui/badge';
import { fmt, fmtMs } from '../utils/formatters';
import { BatchHeader, Empty, SummaryBar } from './drill-down-shared';

// ══════════════════════════════════════════
// TRUNCATION DRILL-DOWN
// ══════════════════════════════════════════

export function TruncationPanel({ data }) {
  const items = data?.truncationDetails ?? [];
  if (!items.length) return <Empty text='No truncations — batch sizing is working correctly.' />;

  return (
    <div className='space-y-4'>
      <SummaryBar items={[
        { value: items.length, label: 'Truncated', color: 'bg-red-500/5 border-red-300' },
        { value: items.filter(i => i.itemsMatched > 0).length, label: 'Partially Recovered', color: 'bg-amber-500/5 border-amber-300' },
        { value: items.filter(i => i.retried).length, label: 'Retried', color: 'bg-blue-500/5 border-blue-300' },
        { value: items.filter(i => i.itemsMatched === 0).length, label: 'Zero Match', color: 'bg-red-500/10 border-red-400' },
      ]} />

      <div className='space-y-2'>
        {items.map((item, i) => (
          <div key={item.batchId ?? i} className='rounded-lg border border-red-300 dark:border-red-800 bg-red-500/5 p-3'>
            <BatchHeader item={item} badges={
              <>
                <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>TRUNCATED</Badge>
                {item.repaired && <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300'>REPAIRED</Badge>}
                {item.retried && <Badge className='text-[9px] bg-blue-500/10 text-blue-600 border-blue-300'>RETRIED x{item.retryCount}</Badge>}
              </>
            } />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
              <div>
                <span className='text-muted-foreground'>Finish:</span>{' '}
                <span className='text-red-600 font-semibold'>{item.finishReason}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Tokens:</span>{' '}
                <span className='font-medium'>{fmt(item.completionTokens)} / {fmt(item.maxOutputTokens)}</span>
                {item.tokenUsagePct != null && (
                  <span className='text-red-500 ml-1'>({item.tokenUsagePct}%)</span>
                )}
              </div>
              <div>
                <span className='text-muted-foreground'>Matched:</span>{' '}
                <span className={item.itemsMatched === 0 ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>
                  {item.itemsMatched}/{item.itemsInBatch}
                </span>
                {item.unmatched > 0 && <span className='text-red-500 ml-1'>({item.unmatched} lost)</span>}
              </div>
              <div>
                <span className='text-muted-foreground'>Latency:</span>{' '}
                <span>{fmtMs(item.latencyMs)}</span>
              </div>
            </div>
            {item.parseStrategy && (
              <p className='text-[10px] text-muted-foreground mt-1'>Parse: {item.parseStrategy} · Types: {item.itemTypes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PARTIAL DRILL-DOWN
// ══════════════════════════════════════════

export function PartialPanel({ data }) {
  const items = data?.partialDetails ?? [];
  const causes = data?.partialCauseBreakdown ?? [];
  if (!items.length) return <Empty text='No partial batches — all items matched.' />;

  return (
    <div className='space-y-4'>
      <div>
        <h4 className='text-xs font-semibold text-muted-foreground mb-2'>Partial Cause Distribution</h4>
        <div className='flex flex-wrap gap-2'>
          {causes.map((c) => {
            const color = c.cause.includes('Truncation') ? 'bg-red-500/10 border-red-300 text-red-700'
              : c.cause.includes('Parse') ? 'bg-yellow-500/10 border-yellow-300 text-yellow-700'
              : c.cause.includes('mismatch') ? 'bg-blue-500/10 border-blue-300 text-blue-700'
              : 'bg-muted';
            return (
              <div key={c.cause} className={`rounded-lg border px-3 py-2 text-center ${color}`}>
                <p className='text-lg font-bold'>{c.count}</p>
                <p className='text-[10px]'>{c.cause}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className='space-y-2'>
        {items.map((item, i) => (
          <div key={item.batchId ?? i} className='rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-500/5 p-3'>
            <BatchHeader item={item} badges={
              <>
                <Badge className={`text-[9px] ${
                  item.cause?.includes('Truncation') ? 'bg-red-500/10 text-red-600 border-red-300'
                  : item.cause?.includes('Parse') ? 'bg-yellow-500/10 text-yellow-600 border-yellow-300'
                  : 'bg-blue-500/10 text-blue-600 border-blue-300'
                }`}>{item.cause}</Badge>
                {item.truncated && <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>TRUNCATED</Badge>}
                {item.repaired && <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300'>REPAIRED</Badge>}
              </>
            } />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
              <div>
                <span className='text-muted-foreground'>Matched:</span>{' '}
                <span className='text-amber-600 font-bold'>{item.itemsMatched}/{item.itemsInBatch}</span>
                <span className='text-red-500 ml-1'>({item.missing} missing)</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Types:</span>{' '}
                <span>{item.itemTypes}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Latency:</span>{' '}
                <span>{fmtMs(item.latencyMs)}</span>
              </div>
              {item.parseStrategy && (
                <div>
                  <span className='text-muted-foreground'>Parse:</span>{' '}
                  <span>{item.parseStrategy}</span>
                </div>
              )}
            </div>
            {item.errorMessage && (
              <p className='text-[10px] text-red-500 mt-1 truncate'>{item.errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PARSE REPAIR DRILL-DOWN
// ══════════════════════════════════════════

export function ParseRepairPanel({ data }) {
  const items = data?.parseRepairDetails ?? [];
  const fullMatch = data?.parseRepairFullMatch ?? 0;
  const partial = data?.parseRepairPartial ?? 0;
  if (!items.length) return <Empty text='No parse repairs — all outputs used structured schema.' />;

  return (
    <div className='space-y-4'>
      <SummaryBar items={[
        { value: items.length, label: 'Total Repairs', color: 'bg-yellow-500/5 border-yellow-300' },
        { value: fullMatch, label: 'Full Recovery', color: 'bg-emerald-500/5 border-emerald-300' },
        { value: partial, label: 'Partial Recovery', color: 'bg-amber-500/5 border-amber-300' },
        { value: items.length - fullMatch - partial, label: 'Zero Recovery', color: 'bg-red-500/5 border-red-300' },
      ]} />

      <div className='space-y-2'>
        {items.map((item, i) => {
          const borderColor = item.isFullMatch ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/5'
            : item.isPartial ? 'border-amber-300 dark:border-amber-800 bg-amber-500/5'
            : 'border-red-300 dark:border-red-800 bg-red-500/5';
          return (
            <div key={item.batchId ?? i} className={`rounded-lg border p-3 ${borderColor}`}>
              <BatchHeader item={item} badges={
                <>
                  <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300'>{item.parseStrategy}</Badge>
                  {item.isFullMatch && <Badge className='text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-300'>FULL MATCH</Badge>}
                  {item.isPartial && <Badge className='text-[9px] bg-amber-500/10 text-amber-600 border-amber-300'>PARTIAL</Badge>}
                  {!item.isFullMatch && !item.isPartial && <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>ZERO MATCH</Badge>}
                </>
              } />
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>Recovered:</span>{' '}
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
                <p className='text-[10px] text-yellow-700 dark:text-yellow-400 mt-1.5 bg-yellow-500/5 rounded px-2 py-1 font-mono break-all'>
                  {item.errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
