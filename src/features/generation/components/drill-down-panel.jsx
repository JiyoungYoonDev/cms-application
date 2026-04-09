'use client';

import { useState } from 'react';
import { X, ExternalLink, AlertTriangle, AlertCircle, RefreshCw, Activity, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Helpers ──

function fmt(n) {
  if (n == null) return '-';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtMs(ms) {
  if (ms == null) return '-';
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + 'm';
  if (ms >= 1_000) return (ms / 1_000).toFixed(1) + 's';
  return ms + 'ms';
}

function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

function parseTitles(raw) {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

function JobLink({ item }) {
  return (
    <a
      href={`/admin/courses/${item.jobId}`}
      className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
      onClick={(e) => e.stopPropagation()}
    >
      Job #{item.jobId} <ExternalLink size={9} />
    </a>
  );
}

function BatchHeader({ item, badges }) {
  const titles = parseTitles(item.itemTitles);
  return (
    <div className='mb-2'>
      <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
        <span className='text-sm font-medium truncate'>{item.lectureTitle}</span>
        <span className='text-[10px] text-muted-foreground'>Batch {item.batchIndex}</span>
        {badges}
        <JobLink item={item} />
      </div>
      <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
        <span>{item.sectionTitle}</span>
        {item.courseTitle && <span>· {item.courseTitle}</span>}
        {item.promptVersion && <span>· {item.promptVersion}</span>}
      </div>
      {titles.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-1'>
          {titles.map((t, i) => (
            <span key={i} className='text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <p className='text-sm text-muted-foreground text-center py-6'>{text}</p>;
}

function SummaryBar({ items }) {
  if (!items?.length) return null;
  return (
    <div className='flex flex-wrap gap-2 mb-3'>
      {items.map((s, i) => (
        <div key={i} className={`rounded-lg border px-3 py-2 text-center ${s.color ?? ''}`}>
          <p className='text-lg font-bold tabular-nums'>{s.value}</p>
          <p className='text-[10px] text-muted-foreground'>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════
// TRUNCATION DRILL-DOWN
// ══════════════════════════════════════════

function TruncationPanel({ data }) {
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

function PartialPanel({ data }) {
  const items = data?.partialDetails ?? [];
  const causes = data?.partialCauseBreakdown ?? [];
  if (!items.length) return <Empty text='No partial batches — all items matched.' />;

  return (
    <div className='space-y-4'>
      {/* Cause breakdown */}
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

      {/* Batch list */}
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

function ParseRepairPanel({ data }) {
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

// ══════════════════════════════════════════
// MATCH RATE DRILL-DOWN
// ══════════════════════════════════════════

function MatchRatePanel({ data }) {
  const [tab, setTab] = useState('lectures');
  const byLecture = data?.matchRateByLecture ?? [];
  const byItemType = data?.matchRateByItemType ?? [];
  const unmatched = data?.unmatchedDetails ?? [];

  return (
    <div className='space-y-4'>
      {/* Sub-tabs */}
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

function RetryPanel({ data }) {
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

// ══════════════════════════════════════════
// CONFIG + MAIN
// ══════════════════════════════════════════

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
