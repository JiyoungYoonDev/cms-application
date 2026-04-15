'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, Clock, Zap, Target, DollarSign,
  AlertCircle, RefreshCw, Layers, BookOpen, FileCode2, Eye,
  ShieldAlert, FileWarning, Search, Settings2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useJobDetail } from '../hooks/use-generation-job-detail';
import { updateBatchStatus, updateTaskStatus, retryTask, retryBatch } from '../services/generation-admin-service';
import { useQueryClient } from '@tanstack/react-query';

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

function fmtCost(n) {
  if (n == null) return '-';
  return '$' + Number(n).toFixed(4);
}

function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function parseTitles(raw) {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

/** Fix 4: Human-readable finish reason */
function humanFinishReason(finishReason, truncated, repaired, errorMessage) {
  if (errorMessage?.startsWith('Superseded')) return 'Regenerated';
  if (truncated) return 'Truncated (MAX_TOKENS)';
  if (!finishReason) return '-';
  const upper = finishReason.toUpperCase();
  if (upper === 'STOP') return repaired ? 'Completed (parse repaired)' : 'Completed normally';
  if (upper === 'MAX_TOKENS') return 'Truncated (MAX_TOKENS)';
  if (upper === 'SAFETY') return 'Blocked (safety filter)';
  if (upper === 'RECITATION') return 'Blocked (recitation)';
  if (upper === 'OTHER') return 'Stopped (other)';
  return finishReason;
}

function finishReasonColorWithError(finishReason, truncated, errorMessage) {
  if (errorMessage?.startsWith('Superseded')) return 'text-blue-500';
  return finishReasonColor(finishReason, truncated);
}

function finishReasonColor(finishReason, truncated) {
  if (truncated) return 'text-red-600';
  const upper = (finishReason ?? '').toUpperCase();
  if (upper === 'STOP') return 'text-emerald-600';
  if (upper === 'SAFETY' || upper === 'RECITATION') return 'text-red-600';
  return 'text-muted-foreground';
}

/** Fix 2: Meaningful batch name from item titles */
function batchLabel(titles, itemTypes) {
  if (!titles || titles.length === 0) {
    return itemTypes || 'Batch';
  }
  // Shorten titles: take first meaningful word(s) from each
  const shorts = titles.map((t) => {
    // Remove common prefixes like "Introduction to", "Worked Examples:", etc.
    const clean = t.replace(/^(Introduction to|Worked Examples?:?|Your Turn:?|Practice:?|Hands-on:?|Advanced:?|Test:?|Challenge:?)\s*/i, '').trim();
    // Take first 2 words
    const words = (clean || t).split(/\s+/).slice(0, 2).join(' ');
    return words.length > 20 ? words.slice(0, 18) + '..' : words;
  });
  return shorts.join(' + ');
}

/** Fix 3: Classify why an item is missing based on batch metadata */
function classifyMissingCause(batch) {
  if (batch.truncated) return { label: 'Truncation', color: 'text-red-600', bg: 'bg-red-500/10' };
  if (batch.repaired) return { label: 'Parse repair', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
  if (batch.status === 'FAILED') return { label: 'Batch failed', color: 'text-red-600', bg: 'bg-red-500/10' };
  return { label: 'Title mismatch', color: 'text-orange-600', bg: 'bg-orange-500/10' };
}

const STATUS_STYLE = {
  COMPLETED:           { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: '' },
  FAILED:              { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-300 dark:border-red-800' },
  PARTIALLY_COMPLETED: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-300 dark:border-amber-800' },
  IN_PROGRESS:         { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10', border: '' },
  PENDING:             { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', border: '' },
  SKIPPED:             { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted', border: '' },
  SPLIT:               { icon: Layers, color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-300 dark:border-violet-800' },
};

function StatusBadge({ status, size = 'default' }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const Icon = s.icon;
  const cls = size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${s.bg} ${s.color} ${cls}`}>
      <Icon size={size === 'sm' ? 10 : 11} />{status}
    </span>
  );
}

// ══════════════════════════════════════════
// JOB SUMMARY HEADER (Fix 5: clickable stat cards)
// ══════════════════════════════════════════

function JobSummary({ d, activeFilter, setActiveFilter }) {
  const tasksByStatus = d.tasksByStatus ?? {};
  const successLectures = (tasksByStatus.COMPLETED ?? 0);
  const partialLectures = (tasksByStatus.PARTIALLY_COMPLETED ?? 0);
  const failedLectures = (tasksByStatus.FAILED ?? 0);

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

// ══════════════════════════════════════════
// LECTURE TABLE (Fix 1: lecture-scoped only)
// ══════════════════════════════════════════

function LectureTable({ tasks, expandedTask, setExpandedTask, jobId }) {
  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b bg-muted/30'>
            <th className='text-left px-4 py-2 font-medium text-muted-foreground w-8' />
            <th className='text-left px-2 py-2 font-medium text-muted-foreground'>Lecture</th>
            <th className='text-center px-2 py-2 font-medium text-muted-foreground'>Status</th>
            <th className='text-center px-2 py-2 font-medium text-muted-foreground'>Items</th>
            <th className='text-center px-2 py-2 font-medium text-muted-foreground'>Issues</th>
            <th className='text-right px-2 py-2 font-medium text-muted-foreground'>Tokens</th>
            <th className='text-right px-2 py-2 font-medium text-muted-foreground'>Latency</th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {tasks.map((task) => {
            const isOpen = expandedTask === task.taskId;
            const hasIssues = task.truncations > 0 || task.repairs > 0
              || (task.itemsMatched != null && task.itemsTotal != null && task.itemsMatched < task.itemsTotal);

            return (
              <LectureRow key={task.taskId} task={task} isOpen={isOpen} hasIssues={hasIssues}
                jobId={jobId}
                onToggle={() => setExpandedTask(isOpen ? null : task.taskId)} />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Fix 1: Only lecture-scoped numbers. No "batches" column — that's internal detail shown on expand. */
function LectureRow({ task, isOpen, hasIssues, onToggle, jobId }) {
  const matched = task.itemsMatched ?? 0;
  const total = task.itemsTotal ?? 0;
  const matchColor = matched === total ? 'text-emerald-600' : matched > 0 ? 'text-amber-600' : 'text-red-600';
  const tokens = (task.promptTokens ?? 0) + (task.completionTokens ?? 0);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer hover:bg-muted/40 transition-colors ${hasIssues ? 'bg-red-500/[.02]' : ''}`}
      >
        <td className='px-4 py-2.5'>
          {isOpen ? <ChevronDown size={14} className='text-muted-foreground' />
                   : <ChevronRight size={14} className='text-muted-foreground' />}
        </td>
        <td className='px-2 py-2.5'>
          <p className='font-medium truncate max-w-[260px]'>{task.lectureTitle}</p>
          <p className='text-[10px] text-muted-foreground truncate'>{task.sectionTitle}</p>
        </td>
        <td className='px-2 py-2.5 text-center'><StatusBadge status={task.status} size='sm' /></td>
        <td className='px-2 py-2.5 text-center'>
          <span className={`text-xs font-bold tabular-nums ${matchColor}`}>{matched}/{total}</span>
          <span className='text-[10px] text-muted-foreground block'>items matched</span>
        </td>
        <td className='px-2 py-2.5 text-center'>
          <div className='flex items-center justify-center gap-1'>
            {task.truncations > 0 && <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300 px-1 py-0'>{task.truncations}T</Badge>}
            {task.repairs > 0 && <Badge className='text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-300 px-1 py-0'>{task.repairs}R</Badge>}
            {task.truncations === 0 && task.repairs === 0 && matched === total && (
              <span className='text-[10px] text-emerald-600'>Clean</span>
            )}
            {task.truncations === 0 && task.repairs === 0 && matched < total && matched > 0 && (
              <span className='text-[10px] text-amber-600'>Partial</span>
            )}
          </div>
        </td>
        <td className='px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground'>{fmt(tokens)}</td>
        <td className='px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground'>{fmtMs(task.latencyMs)}</td>
      </tr>

      {/* Fix 6: Expanded lecture = 3 sections */}
      {isOpen && (
        <tr>
          <td colSpan={7} className='p-0'>
            <LectureExpanded task={task} jobId={jobId} />
          </td>
        </tr>
      )}
    </>
  );
}

// ══════════════════════════════════════════
// FIX 6: LECTURE EXPANDED — 3 SECTIONS
// ══════════════════════════════════════════

const TASK_STATUSES = ['COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED', 'PENDING'];

function LectureExpanded({ task, jobId }) {
  const allBatches = task.batches ?? [];
  const leafBatches = allBatches.filter((b) => b.isLeaf !== false);
  const [openSection, setOpenSection] = useState('problems'); // problems | batches | validation
  const queryClient = useQueryClient();
  const [updatingTask, setUpdatingTask] = useState(false);
  const [retryingTask, setRetryingTask] = useState(false);

  const handleTaskStatusChange = useCallback(async (newStatus) => {
    if (newStatus === task.status || updatingTask) return;
    setUpdatingTask(true);
    try {
      await updateTaskStatus(task.taskId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['generation', 'job', jobId] });
    } catch (e) {
      console.error('Failed to update task status', e);
    } finally {
      setUpdatingTask(false);
    }
  }, [task.taskId, task.status, jobId, queryClient, updatingTask]);

  const handleRetryTask = useCallback(async () => {
    if (retryingTask) return;
    setRetryingTask(true);
    try {
      await retryTask(task.taskId);
      queryClient.invalidateQueries({ queryKey: ['generation', 'job', jobId] });
    } catch (e) {
      console.error('Failed to retry task', e);
    } finally {
      setRetryingTask(false);
    }
  }, [task.taskId, jobId, queryClient, retryingTask]);

  const isRetryable = task.status === 'FAILED' || task.status === 'PARTIALLY_COMPLETED';

  // Fix 3: Compute missing items across leaf batches only
  const missingItems = useMemo(() => {
    const missing = [];
    for (const b of leafBatches) {
      const allTitles = parseTitles(b.itemTitles);
      const matchedTitles = new Set(parseTitles(b.matchedItemTitles));
      const types = (b.itemTypes ?? '').split(',');
      const cause = classifyMissingCause(b);
      for (let i = 0; i < allTitles.length; i++) {
        if (!matchedTitles.has(allTitles[i])) {
          missing.push({
            title: allTitles[i],
            type: types[i]?.trim() ?? '?',
            batchIndex: b.batchIndex,
            batchLabel: batchLabel(allTitles, b.itemTypes),
            cause,
          });
        }
      }
    }
    return missing;
  }, [leafBatches]);

  const splitCount = allBatches.filter((b) => b.status === 'SPLIT').length;
  const hasMissing = missingItems.length > 0;
  const hasProblems = hasMissing || task.truncations > 0 || task.repairs > 0;

  return (
    <div className='bg-muted/5 border-t'>
      {/* Lecture / Section context */}
      <div className='flex items-center gap-3 px-4 py-1.5 border-b bg-muted/20 text-xs'>
        <span className='text-muted-foreground'>Section:</span>
        <span className='font-medium'>{task.sectionTitle ?? '—'}</span>
        <span className='text-muted-foreground/40'>›</span>
        <span className='text-muted-foreground'>Lecture:</span>
        <span className='font-medium'>{task.lectureTitle ?? '—'}</span>
      </div>
      {/* Task status override + retry */}
      <div className='flex items-center gap-4 px-4 py-2 border-b bg-muted/10'>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-semibold text-muted-foreground'>Task Status:</span>
          <div className='flex gap-1'>
            {TASK_STATUSES.map((s) => (
              <button
                key={s}
                disabled={updatingTask}
                onClick={() => handleTaskStatusChange(s)}
                className={[
                  'text-[10px] px-2 py-0.5 rounded border transition-colors',
                  s === task.status
                    ? 'bg-blue-500/15 text-blue-600 border-blue-400 font-semibold'
                    : 'text-muted-foreground border-muted hover:bg-muted/50 hover:text-foreground',
                  updatingTask ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
            {updatingTask && <RefreshCw size={10} className='animate-spin text-muted-foreground ml-1' />}
          </div>
        </div>
        {isRetryable && (
          <button
            disabled={retryingTask}
            onClick={handleRetryTask}
            className={[
              'inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded border font-medium transition-colors',
              'bg-amber-500/10 text-amber-600 border-amber-400 hover:bg-amber-500/20',
              retryingTask ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <RefreshCw size={10} className={retryingTask ? 'animate-spin' : ''} />
            {retryingTask ? 'Retrying...' : 'Retry Task'}
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className='flex border-b'>
        <SectionTab
          label={hasProblems ? `Problems (${missingItems.length} missing)` : 'No Problems'}
          active={openSection === 'problems'}
          alert={hasProblems}
          onClick={() => setOpenSection(openSection === 'problems' ? null : 'problems')}
        />
        <SectionTab
          label={`Batches (${leafBatches.length}${splitCount > 0 ? ` + ${splitCount} split` : ''})`}
          active={openSection === 'batches'}
          onClick={() => setOpenSection(openSection === 'batches' ? null : 'batches')}
        />
        <SectionTab
          label='Prompt & Validation'
          active={openSection === 'validation'}
          onClick={() => setOpenSection(openSection === 'validation' ? null : 'validation')}
        />
      </div>

      {/* Section content */}
      {openSection === 'problems' && (
        <ProblemSection task={task} batches={leafBatches} missingItems={missingItems} />
      )}
      {openSection === 'batches' && (
        <BatchSection batches={allBatches} jobId={jobId} />
      )}
      {openSection === 'validation' && (
        <ValidationSection task={task} batches={leafBatches} />
      )}
    </div>
  );
}

function SectionTab({ label, active, alert, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-xs font-medium transition-colors border-b-2',
        active ? 'border-blue-500 text-blue-600 bg-blue-500/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30',
        alert && !active ? 'text-red-600' : '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ── Section 1: Problems / Missing Items ──

function ProblemSection({ task, batches, missingItems }) {
  const hasProblems = missingItems.length > 0 || task.truncations > 0 || task.repairs > 0;

  if (!hasProblems) {
    return (
      <div className='px-6 py-6 text-center'>
        <CheckCircle2 size={24} className='text-emerald-500 mx-auto mb-2' />
        <p className='text-sm font-medium text-emerald-600'>All items generated successfully</p>
        <p className='text-xs text-muted-foreground mt-1'>
          {task.itemsMatched}/{task.itemsTotal} items matched across {batches.length} batches
        </p>
      </div>
    );
  }

  // Group causes
  const causeCounts = {};
  for (const m of missingItems) {
    causeCounts[m.cause.label] = (causeCounts[m.cause.label] ?? 0) + 1;
  }

  return (
    <div className='px-6 py-4 space-y-4'>
      {/* Summary bar */}
      <div className='flex items-center gap-3 flex-wrap'>
        <span className='text-xs font-semibold text-red-600'>
          {missingItems.length} missing item{missingItems.length !== 1 ? 's' : ''}
        </span>
        {Object.entries(causeCounts).map(([cause, count]) => (
          <Badge key={cause} variant='outline' className='text-[10px]'>
            {cause}: {count}
          </Badge>
        ))}
        {task.truncations > 0 && (
          <Badge className='text-[10px] bg-red-500/10 text-red-600 border-red-300'>
            {task.truncations} truncated batch{task.truncations !== 1 ? 'es' : ''}
          </Badge>
        )}
        {task.repairs > 0 && (
          <Badge className='text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-300'>
            {task.repairs} parse repair{task.repairs !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Missing items list */}
      {missingItems.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider'>Missing Items</p>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-xs'>
              <thead>
                <tr className='bg-muted/30 border-b'>
                  <th className='text-left px-3 py-1.5 font-medium text-muted-foreground'>Item</th>
                  <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Type</th>
                  <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Batch</th>
                  <th className='text-center px-2 py-1.5 font-medium text-muted-foreground'>Cause</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {missingItems.map((item, i) => (
                  <tr key={i} className='hover:bg-muted/20'>
                    <td className='px-3 py-1.5 font-medium'>{item.title}</td>
                    <td className='px-2 py-1.5 text-center'>
                      <span className='text-[9px] px-1.5 py-0.5 rounded bg-muted'>{item.type}</span>
                    </td>
                    <td className='px-2 py-1.5 text-center text-muted-foreground'>
                      #{item.batchIndex}
                    </td>
                    <td className='px-2 py-1.5 text-center'>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.cause.bg} ${item.cause.color} font-medium`}>
                        {item.cause.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section 2: Batches ──

/** Walk up the parentBatchId chain to collect all ancestors (newest → oldest). */
function collectAncestors(leaf, batchMap) {
  const chain = [];
  let cur = batchMap[leaf.parentBatchId];
  while (cur) {
    chain.push(cur);
    cur = batchMap[cur.parentBatchId];
  }
  return chain; // [parent, grandparent, ...]
}

function BatchSection({ batches, jobId }) {
  const [expandedBatch, setExpandedBatch] = useState(null);

  if (!batches.length) {
    return (
      <div className='px-8 py-4 text-xs text-muted-foreground'>No batches (legacy single-call mode)</div>
    );
  }

  // Index all batches by ID
  const batchMap = {};
  for (const b of batches) batchMap[b.batchId] = b;

  // Only show leaf batches (latest attempt) in the main table
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

const BATCH_STATUSES = ['COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED', 'PENDING'];

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
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (newStatus === b.status || updating) return;
    setUpdating(true);
    try {
      await updateBatchStatus(b.batchId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['generation', 'job', jobId] });
    } catch (e) {
      console.error('Failed to update batch status', e);
    } finally {
      setUpdating(false);
    }
  }, [b.batchId, b.status, jobId, queryClient, updating]);

  const handleRetryBatch = useCallback(async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await retryBatch(b.batchId);
      queryClient.invalidateQueries({ queryKey: ['generation', 'job', jobId] });
    } catch (e) {
      console.error('Failed to retry batch', e);
    } finally {
      setRetrying(false);
    }
  }, [b.batchId, jobId, queryClient, retrying]);

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

// ── Section 3: Prompt & Validation ──

function ValidationSection({ task, batches }) {
  // Collect all prompt versions and models used in this lecture's batches
  const promptVersions = [...new Set(batches.map((b) => b.promptVersion).filter(Boolean))];
  const totalTokens = batches.reduce((sum, b) => sum + (b.promptTokens ?? 0) + (b.completionTokens ?? 0), 0);
  const totalPromptTokens = batches.reduce((sum, b) => sum + (b.promptTokens ?? 0), 0);
  const totalCompletionTokens = batches.reduce((sum, b) => sum + (b.completionTokens ?? 0), 0);

  return (
    <div className='px-6 py-4 space-y-4'>
      {/* Prompt versions */}
      <div>
        <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Prompt Versions Used</p>
        {promptVersions.length > 0 ? (
          <div className='flex flex-wrap gap-1.5'>
            {promptVersions.map((v) => (
              <Badge key={v} variant='outline' className='text-xs'>{v}</Badge>
            ))}
          </div>
        ) : (
          <p className='text-xs text-muted-foreground'>No prompt version linked</p>
        )}
      </div>

      {/* Token summary for this lecture */}
      <div>
        <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Token Usage (this lecture)</p>
        <div className='grid grid-cols-3 gap-3'>
          <div className='rounded border bg-card p-2.5'>
            <p className='text-[10px] text-muted-foreground'>Total</p>
            <p className='text-sm font-bold tabular-nums'>{fmt(totalTokens)}</p>
          </div>
          <div className='rounded border bg-card p-2.5'>
            <p className='text-[10px] text-muted-foreground'>Input</p>
            <p className='text-sm font-bold tabular-nums text-blue-600'>{fmt(totalPromptTokens)}</p>
          </div>
          <div className='rounded border bg-card p-2.5'>
            <p className='text-[10px] text-muted-foreground'>Output</p>
            <p className='text-sm font-bold tabular-nums text-violet-600'>{fmt(totalCompletionTokens)}</p>
          </div>
        </div>
      </div>

      {/* Generation mode */}
      <div className='text-xs text-muted-foreground'>
        Mode: <span className='font-medium text-foreground'>{task.generationMode ?? 'SINGLE'}</span>
        {' · '}
        {batches.length} batch{batches.length !== 1 ? 'es' : ''}
        {' · '}
        Latency: {fmtMs(task.latencyMs)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════

// ── Job type + Form Inputs ──

const JOB_TYPE_STYLE = {
  COURSE:  { color: 'bg-violet-500/10 text-violet-600 border-violet-200', label: 'Course' },
  SECTION: { color: 'bg-sky-500/10 text-sky-600 border-sky-200', label: 'Section' },
  LECTURE: { color: 'bg-teal-500/10 text-teal-600 border-teal-200', label: 'Lecture' },
  ITEM:    { color: 'bg-orange-500/10 text-orange-600 border-orange-200', label: 'Item' },
};

function FormInputsSection({ d }) {
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

export default function JobDetailPanel({ jobId, onBack }) {
  const { data: res, isLoading } = useJobDetail(jobId);
  const detail = res?.data ?? {};
  const tasks = detail.tasks ?? [];
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // Fix 5

  // Fix 5: Filter tasks based on clicked stat card
  const filteredTasks = useMemo(() => {
    if (!activeFilter) return tasks;
    return tasks.filter((t) => {
      switch (activeFilter) {
        case 'failed':
          return t.status === 'FAILED';
        case 'partial':
          return t.itemsMatched != null && t.itemsTotal != null && t.itemsMatched < t.itemsTotal;
        case 'truncated':
          return t.truncations > 0;
        case 'repaired':
          return t.repairs > 0;
        default:
          return true;
      }
    });
  }, [tasks, activeFilter]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button onClick={onBack} className='p-1.5 rounded-lg hover:bg-muted transition-colors'>
          <ArrowLeft size={18} />
        </button>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-lg font-bold'>{detail.courseTitle ?? 'Job Detail'}</h2>
            <p className='text-xs text-muted-foreground'>
              Job #{jobId} · {detail.modelName} · {detail.status}
            </p>
          </div>
          {detail.jobType && (() => {
            const jt = JOB_TYPE_STYLE[detail.jobType];
            return jt ? <Badge variant='outline' className={jt.color}>{jt.label}</Badge> : null;
          })()}
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => <div key={i} className='h-16 rounded-lg bg-muted animate-pulse' />)}
        </div>
      ) : (
        <>
          {/* Summary — Fix 5: pass filter state */}
          <JobSummary d={detail} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          {/* Generation form inputs */}
          <FormInputsSection d={detail} />

          {/* Lecture breakdown */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground mb-3'>
              Lecture Breakdown
              {activeFilter
                ? ` (${filteredTasks.length} of ${tasks.length} — ${activeFilter})`
                : ` (${tasks.length})`
              }
            </h3>
            <LectureTable tasks={filteredTasks} expandedTask={expandedTask} setExpandedTask={setExpandedTask} jobId={jobId} />
          </div>
        </>
      )}
    </div>
  );
}
