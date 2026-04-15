'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getScopedRounds,
  overrideValidation,
  validateByScope,
} from '../services/generation-admin-service';

function fmtPct(n) {
  if (n == null) return '-';
  return Number(n).toFixed(1) + '%';
}

// ── Failure row with override toggle ──

function FailureItem({ f, onOverride }) {
  const [overriding, setOverriding] = useState(false);
  const isOverridden = Boolean(f.manualOverride);

  async function handleOverride() {
    const reason = prompt(
      isOverridden ? 'Remove override?' : 'Override reason (why this is actually correct):'
    );
    if (reason === null) return;
    setOverriding(true);
    try {
      await overrideValidation(f.id, !isOverridden, reason || '');
      onOverride?.();
    } catch (e) {
      alert('Override failed: ' + (e?.message ?? 'unknown'));
    } finally {
      setOverriding(false);
    }
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

// ── Main panel ──

/**
 * Validation rounds panel for a scope (Course / Section / Lecture / Item).
 *
 * @param {Object} props
 * @param {'COURSE'|'SECTION'|'LECTURE'|'ITEM'} props.scopeType
 * @param {number|string} props.targetId
 * @param {string} [props.title] - Section heading override
 */
export function ScopedValidationPanel({ scopeType, targetId, title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getScopedRounds(scopeType, targetId);
      setData(res?.data ?? res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [scopeType, targetId]);

  useEffect(() => {
    if (targetId != null) fetchRounds();
  }, [fetchRounds, targetId]);

  async function handleValidate() {
    const scopeLabel = scopeType.toLowerCase();
    if (!confirm(`Run validation for this ${scopeLabel}?`)) return;
    setValidating(true);
    try {
      await validateByScope(scopeType, targetId);
      await fetchRounds();
    } catch (e) {
      alert('Validation failed: ' + (e?.message ?? 'unknown error'));
    } finally {
      setValidating(false);
    }
  }

  const rounds = data?.rounds ?? [];
  const heading = title ?? `Validation Rounds (${rounds.length})`;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ShieldCheck size={15} className='text-violet-500' />
          <h3 className='text-sm font-semibold text-muted-foreground'>{heading}</h3>
          <Badge variant='outline' className='text-[10px] text-violet-600'>
            {scopeType}
          </Badge>
        </div>
        <button
          onClick={handleValidate}
          disabled={validating}
          className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                     bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 disabled:opacity-50 transition-colors'
        >
          {validating
            ? <Loader2 size={12} className='animate-spin' />
            : <ShieldCheck size={12} />}
          {validating ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {loading ? (
        <div className='h-20 rounded-lg bg-muted animate-pulse' />
      ) : rounds.length === 0 ? (
        <p className='text-xs text-muted-foreground text-center py-4'>
          No validation rounds yet. Click <span className='font-medium text-violet-600'>Validate</span> to run the first one.
        </p>
      ) : (
        <div className='space-y-2'>
          {rounds.map((round) => {
            const isOpen = expanded === round.id;
            const passRate = Number(round.passRate ?? 0);
            const isPerfect = passRate === 100;
            const isGood = passRate >= 80;

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
                    {round.failures?.length > 0 ? (
                      <div className='space-y-1.5'>
                        {round.failures.map((f) => (
                          <FailureItem key={f.id} f={f} onOverride={fetchRounds} />
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
