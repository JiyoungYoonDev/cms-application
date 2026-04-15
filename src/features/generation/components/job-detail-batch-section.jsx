'use client';

import { useState } from 'react';
import {
  ChevronDown, ChevronRight, RefreshCw, Eye, CheckCircle2, XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtMs, parseTitles } from '../utils/formatters';
import {
  batchLabel, collectAncestors, humanFinishReason,
  finishReasonColorWithError, BATCH_STATUSES,
} from '../utils/job-helpers';
import { StatusBadge } from './job-detail-status-badge';
import { useJobActions } from '../hooks/use-job-actions';

export function BatchSection({ batches, jobId }) {
  const [expandedBatch, setExpandedBatch] = useState(null);

  if (!batches.length) {
    return (
      <div className='px-8 py-4 text-xs text-muted-foreground'>No batches (legacy single-call mode)</div>
    );
  }

  const batchMap = {};
  for (const b of batches) batchMap[b.batchId] = b;

  const leafBatches = batches
    .filter((b) => b.isLeaf !== false)
    .sort((a, b) => a.batchIndex - b.batchIndex);

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-xs'>
        <thead>
          <tr className='border-b bg-muted/20'>
            <th className='text-left px-4 py-1.5 font-medium text-muted-foreground' />
            <th className='text-left px-2 py-1.5 font-medium text-muted-foreground'>Batch</th>
            <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Matched</th>
            <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Parse</th>
            <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Finish</th>
            <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Attempts</th>
            <th className='text-right px-2 py-1.5 font-medium text-muted-foreground'>Tokens</th>
            <th className='text-right px-2 py-1.5 font-medium text-muted-foreground'>Latency</th>
            <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Status</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-muted/40'>
          {leafBatches.map((b) => {
            const isOpen = expandedBatch === b.batchId;
            const titles = parseTitles(b.itemTitles);
            const matched = b.itemsMatched ?? 0;
            const total = b.itemsInBatch ?? 0;
            const ancestors = collectAncestors(b, batchMap);

            return (
              <BatchRow
                key={b.batchId}
                b={b}
                titles={titles}
                matched={matched}
                total={total}
                isOpen={isOpen}
                ancestors={ancestors}
                onToggle={() => setExpandedBatch(isOpen ? null : b.batchId)}
                jobId={jobId}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BatchRow({ b, titles, matched, total, isOpen, onToggle, ancestors = [], jobId }) {
  const matchColor = matched === total ? 'text-emerald-600' : matched > 0 ? 'text-amber-600' : 'text-red-600';
  const tokens = (b.promptTokens ?? 0) + (b.completionTokens ?? 0);
  const label = batchLabel(titles, b.itemTypes);
  const finishText = humanFinishReason(b.finishReason, b.truncated, b.repaired, b.errorMessage);
  const finishColor = finishReasonColorWithError(b.finishReason, b.truncated, b.errorMessage);
  const totalAttempts = ancestors.length + 1;

  let rowBg = '';
  if (b.truncated) rowBg = 'bg-red-500/[.03]';
  else if (b.status === 'FAILED') rowBg = 'bg-red-500/[.02]';
  else if (b.repaired) rowBg = 'bg-yellow-500/[.02]';

  return (
    <>
      <tr className={`cursor-pointer hover:bg-muted/30 transition-colors ${rowBg}`} onClick={onToggle}>
        <td className='px-4 py-2 w-6'>
          {isOpen ? <ChevronDown size={11} className='text-muted-foreground' />
                   : <ChevronRight size={11} className='text-muted-foreground' />}
        </td>
        <td className='px-2 py-2'>
          <div>
            <p className='font-medium text-foreground truncate max-w-[280px]'>{label}</p>
            {titles.length === 1 && titles[0] !== label && (
              <p className='text-[10px] text-muted-foreground truncate max-w-[280px]'>{titles[0]}</p>
            )}
            <p className='text-[9px] text-muted-foreground'>
              {titles.length} item{titles.length !== 1 ? 's' : ''} · {b.itemTypes}
            </p>
          </div>
        </td>
        <td className='px-2 py-2 text-center'>
          <span className={`font-bold ${matchColor}`}>{matched}/{total}</span>
        </td>
        <td className='px-2 py-2 text-center'>
          {b.repaired ? (
            <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300 px-1 py-0'>{b.parseStrategy}</Badge>
          ) : (
            <span className='text-emerald-600'>OK</span>
          )}
        </td>
        <td className='px-2 py-2 text-center'>
          <span className={`text-[10px] ${finishColor}`}>{finishText}</span>
        </td>
        <td className='px-2 py-2 text-center'>
          {totalAttempts > 1 ? (
            <span className='text-amber-600 font-medium'>#{totalAttempts}</span>
          ) : (
            <span className='text-muted-foreground'>1</span>
          )}
        </td>
        <td className='px-2 py-2 text-right tabular-nums'>
          <span>{fmt(tokens)}</span>
          <span className='text-muted-foreground block text-[9px]'>{fmt(b.promptTokens)}+{fmt(b.completionTokens)}</span>
        </td>
        <td className='px-2 py-2 text-right tabular-nums'>{fmtMs(b.latencyMs)}</td>
        <td className='px-2 py-2 text-center'><StatusBadge status={b.status} size='sm' /></td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={9} className='px-6 py-3 bg-muted/5 border-t border-muted/30'>
            <BatchExpandedDetail b={b} titles={titles} jobId={jobId} ancestors={ancestors} />
          </td>
        </tr>
      )}
    </>
  );
}

/** Single attempt row used in both current detail and history */
function AttemptDetail({ b, label }) {
  const tokens = (b.promptTokens ?? 0) + (b.completionTokens ?? 0);
  return (
    <div className='space-y-2'>
      {label && <p className='text-[10px] font-semibold text-muted-foreground'>{label}</p>}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
        <div><span className='text-muted-foreground'>Status:</span> <StatusBadge status={b.status} size='sm' /></div>
        <div><span className='text-muted-foreground'>Matched:</span> <span>{b.itemsMatched ?? 0}/{b.itemsInBatch ?? 0}</span></div>
        <div><span className='text-muted-foreground'>Finish:</span>{' '}
          <span className={finishReasonColorWithError(b.finishReason, b.truncated, b.errorMessage)}>{humanFinishReason(b.finishReason, b.truncated, b.repaired, b.errorMessage)}</span>
        </div>
        <div><span className='text-muted-foreground'>Parse:</span>{' '}
          <span className={b.repaired ? 'text-yellow-600' : ''}>{b.parseStrategy ?? 'STRUCTURED_SCHEMA'}</span>
        </div>
        <div><span className='text-muted-foreground'>Tokens:</span> <span className='tabular-nums'>{fmt(tokens)} ({fmt(b.promptTokens)}+{fmt(b.completionTokens)})</span></div>
        <div><span className='text-muted-foreground'>Latency:</span> <span className='tabular-nums'>{fmtMs(b.latencyMs)}</span></div>
        <div><span className='text-muted-foreground'>Prompt Ver:</span> <span>{b.promptVersion ?? '-'}</span></div>
        <div><span className='text-muted-foreground'>Split Reason:</span> <span>{b.splitReason ?? '-'}</span></div>
      </div>
      {b.errorMessage && (
        <div className='rounded border border-red-300 dark:border-red-800 bg-red-500/5 px-2 py-1.5'>
          <p className='text-xs text-red-500 font-mono break-all'>{b.errorMessage}</p>
        </div>
      )}
      {b.outputId && (
        <a
          href={`/admin/generation/output/${b.outputId}`}
          className='inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border hover:bg-muted transition-colors'
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={10} /> View Response
        </a>
      )}
    </div>
  );
}

function BatchExpandedDetail({ b, titles, jobId, ancestors = [] }) {
  const matchedTitles = new Set(parseTitles(b.matchedItemTitles));
  const types = (b.itemTypes ?? '').split(',');
  const { setBatchStatus, retryBatch } = useJobActions(jobId);
  const [showHistory, setShowHistory] = useState(false);

  const updating = setBatchStatus.isPending;
  const retrying = retryBatch.isPending;

  const handleStatusChange = (newStatus) => {
    if (newStatus === b.status || updating) return;
    setBatchStatus.mutate({ batchId: b.batchId, status: newStatus }, {
      onError: (e) => console.error('Failed to update batch status', e),
    });
  };

  const handleRetryBatch = () => {
    if (retrying) return;
    retryBatch.mutate(b.batchId, {
      onError: (e) => console.error('Failed to retry batch', e),
    });
  };

  const isBatchRetryable = b.status === 'FAILED' || b.status === 'PARTIALLY_COMPLETED';

  return (
    <div className='space-y-3'>
      {/* Status override + retry */}
      <div className='flex items-center gap-4 flex-wrap'>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-semibold text-muted-foreground'>Override Status:</span>
          <div className='flex gap-1'>
            {BATCH_STATUSES.map((s) => (
              <button
                key={s}
                disabled={updating}
                onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                className={[
                  'text-[10px] px-2 py-0.5 rounded border transition-colors',
                  s === b.status
                    ? 'bg-blue-500/15 text-blue-600 border-blue-400 font-semibold'
                    : 'text-muted-foreground border-muted hover:bg-muted/50 hover:text-foreground',
                  updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
            {updating && <RefreshCw size={10} className='animate-spin text-muted-foreground ml-1' />}
          </div>
        </div>
        {isBatchRetryable && (
          <button
            disabled={retrying}
            onClick={(e) => { e.stopPropagation(); handleRetryBatch(); }}
            className={[
              'inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded border font-medium transition-colors',
              'bg-amber-500/10 text-amber-600 border-amber-400 hover:bg-amber-500/20',
              retrying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <RefreshCw size={10} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Retrying...' : 'Retry Batch'}
          </button>
        )}
      </div>

      {/* Item titles with match status */}
      <div>
        <p className='text-[10px] font-semibold text-muted-foreground mb-1'>Items ({titles.length})</p>
        <div className='flex flex-wrap gap-1'>
          {titles.map((t, i) => {
            const isMatched = matchedTitles.has(t);
            return (
              <span key={i} className={[
                'text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1',
                isMatched ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-600 line-through',
              ].join(' ')}>
                {isMatched ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                {t}
                <span className='text-[8px] opacity-60'>{types[i]?.trim()}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Current attempt details */}
      <AttemptDetail b={b} label={ancestors.length > 0 ? `Latest Attempt (#${ancestors.length + 1})` : null} />

      {/* Retry History */}
      {ancestors.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className='inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors'
          >
            {showHistory ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Previous Attempts ({ancestors.length})
          </button>
          {showHistory && (
            <div className='mt-2 space-y-3 pl-3 border-l-2 border-muted/50'>
              {ancestors.map((anc, i) => (
                <AttemptDetail key={anc.batchId} b={anc} label={`Attempt #${ancestors.length - i}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
