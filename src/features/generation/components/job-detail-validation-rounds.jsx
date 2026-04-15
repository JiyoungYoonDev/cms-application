'use client';

import { useState } from 'react';
import {
  ChevronDown, ChevronRight, RefreshCw, ShieldCheck, Loader2,
  CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmtPct } from '../utils/formatters';
import { DIFF_STYLE } from '../utils/job-helpers';
import { useJobActions, useJobValidations } from '../hooks/use-job-actions';
import { compareRounds } from '../services/generation-admin-service';

export function ValidationRoundsSection({ jobId }) {
  const { data, isLoading } = useJobValidations(jobId);
  const { revalidate } = useJobActions(jobId);
  const [expanded, setExpanded] = useState(null);

  const revalidating = revalidate.isPending;

  function handleRevalidate() {
    if (!confirm('Re-validate this job? Only changed items will be re-checked.')) return;
    revalidate.mutate(undefined, {
      onError: (e) => alert('Re-validation failed: ' + (e?.message ?? 'unknown error')),
    });
  }

  const rounds = data?.rounds ?? [];

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ShieldCheck size={15} className='text-violet-500' />
          <h3 className='text-sm font-semibold text-muted-foreground'>
            Validation Rounds ({rounds.length})
          </h3>
        </div>
        <button
          onClick={handleRevalidate}
          disabled={revalidating}
          className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                     bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 disabled:opacity-50 transition-colors'
        >
          {revalidating ? <Loader2 size={12} className='animate-spin' /> : <RefreshCw size={12} />}
          {revalidating ? 'Validating...' : 'Re-validate'}
        </button>
      </div>

      {isLoading ? (
        <div className='h-20 rounded-lg bg-muted animate-pulse' />
      ) : rounds.length === 0 ? (
        <p className='text-xs text-muted-foreground text-center py-4'>No validation rounds yet.</p>
      ) : (
        <div className='space-y-2'>
          {rounds.map((round, idx) => {
            const isOpen = expanded === round.id;
            const passRate = Number(round.passRate ?? 0);
            const isPerfect = passRate === 100;
            const isGood = passRate >= 80;
            const prevRound = idx > 0 ? rounds[idx - 1] : null;

            return (
              <div key={round.id} className='rounded-lg border'>
                <button
                  onClick={() => setExpanded(isOpen ? null : round.id)}
                  className='w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className='text-sm font-medium'>Round {round.roundNumber}</span>
                    <Badge variant='outline' className={round.triggerType === 'AUTO' ? 'text-blue-600' : 'text-violet-600'}>
                      {round.triggerType}
                    </Badge>
                    <span className='text-[11px] text-muted-foreground'>
                      {round.createdAt ? new Date(round.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-xs'>
                    <span className='text-emerald-600'>{round.passedChecks} passed</span>
                    <span className='text-red-600'>{round.failedChecks} failed</span>
                    <span className={`font-bold ${isPerfect ? 'text-emerald-600' : isGood ? 'text-amber-600' : 'text-red-600'}`}>
                      {fmtPct(round.passRate)}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className='border-t px-4 py-3 space-y-2'>
                    {prevRound && <RoundDiff roundA={prevRound.id} roundB={round.id} />}

                    {round.failures?.length > 0 ? (
                      <div className='space-y-1.5'>
                        {round.failures.map((f) => (
                          <FailureItem key={f.id} f={f} jobId={jobId} />
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-emerald-600 flex items-center gap-1.5'>
                        <CheckCircle2 size={12} /> All checks passed
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FailureItem({ f, jobId }) {
  const { overrideFailure } = useJobActions(jobId);
  const isOverridden = Boolean(f.manualOverride);
  const overriding = overrideFailure.isPending;

  function handleOverride() {
    const reason = prompt(isOverridden ? 'Remove override?' : 'Override reason (why this is actually correct):');
    if (reason === null) return;
    overrideFailure.mutate(
      { failureId: f.id, override: !isOverridden, reason: reason || '' },
      { onError: (e) => alert('Override failed: ' + (e?.message ?? 'unknown')) },
    );
  }

  return (
    <div className={`flex items-start gap-2 text-xs ${isOverridden ? 'opacity-60' : ''}`}>
      {isOverridden
        ? <CheckCircle2 size={12} className='text-blue-500 mt-0.5 shrink-0' />
        : f.severity === 'ERROR'
          ? <XCircle size={12} className='text-red-500 mt-0.5 shrink-0' />
          : <AlertTriangle size={12} className='text-amber-500 mt-0.5 shrink-0' />}
      <div className='min-w-0 flex-1'>
        <span className={`font-medium ${isOverridden ? 'text-blue-600 line-through' : f.severity === 'ERROR' ? 'text-red-600' : 'text-amber-600'}`}>
          {f.ruleName}
        </span>
        <span className='text-muted-foreground ml-1.5'>{f.message}</span>
        {isOverridden && f.overrideReason && (
          <span className='text-blue-500 ml-1.5 italic'>({f.overrideReason})</span>
        )}
      </div>
      <button
        onClick={handleOverride}
        disabled={overriding}
        className='shrink-0 px-1.5 py-0.5 text-[10px] rounded border hover:bg-muted transition-colors disabled:opacity-50'
        title={isOverridden ? 'Remove override' : 'Mark as correct (override)'}
      >
        {overriding ? '...' : isOverridden ? 'Undo' : 'Override'}
      </button>
    </div>
  );
}

/**
 * Round diff is user-triggered and has no invalidation semantics, so it stays
 * as a direct service call rather than going through react-query. Single
 * call site, ephemeral state — adding a query entry would be overhead.
 */
function RoundDiff({ roundA, roundB }) {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadDiff() {
    setLoading(true);
    try {
      const res = await compareRounds(roundA, roundB);
      setDiff(res?.data ?? res);
    } catch { setDiff(null); }
    finally { setLoading(false); }
  }

  if (!diff && !loading) {
    return (
      <button onClick={loadDiff} className='text-[10px] text-violet-600 hover:underline'>
        Compare with previous round
      </button>
    );
  }
  if (loading) return <span className='text-[10px] text-muted-foreground'>Loading diff...</span>;
  if (!diff?.changes?.length) return <span className='text-[10px] text-muted-foreground'>No changes</span>;

  return (
    <div className='space-y-1 mt-2'>
      <div className='flex gap-2 text-[10px]'>
        <span className='text-emerald-600'>{diff.fixed} fixed</span>
        <span className='text-red-600'>{diff.regressed} regressed</span>
      </div>
      {diff.changes.map((c, i) => {
        const s = DIFF_STYLE[c.change] ?? DIFF_STYLE.NEW;
        return (
          <div key={i} className='flex items-center gap-2 text-[11px]'>
            <Badge variant='outline' className={`text-[9px] px-1.5 py-0 ${s.color}`}>{s.label}</Badge>
            <span className='font-medium'>{c.ruleName}</span>
            <span className='text-muted-foreground truncate'>{c.message}</span>
          </div>
        );
      })}
    </div>
  );
}
