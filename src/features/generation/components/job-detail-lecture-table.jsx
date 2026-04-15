'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtMs, parseTitles } from '../utils/formatters';
import { batchLabel, classifyMissingCause, TASK_STATUSES } from '../utils/job-helpers';
import { StatusBadge } from './job-detail-status-badge';
import { BatchSection } from './job-detail-batch-section';
import { useJobActions } from '../hooks/use-job-actions';

export function LectureTable({ tasks, expandedTask, setExpandedTask, jobId }) {
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

/** Fix 1: Only lecture-scoped numbers. Batches are internal detail shown on expand. */
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

function LectureExpanded({ task, jobId }) {
  const allBatches = task.batches ?? [];
  const leafBatches = allBatches.filter((b) => b.isLeaf !== false);
  const [openSection, setOpenSection] = useState('problems'); // problems | batches | validation
  const { setTaskStatus, retryTask } = useJobActions(jobId);

  const updatingTask = setTaskStatus.isPending;
  const retryingTask = retryTask.isPending;

  const handleTaskStatusChange = (newStatus) => {
    if (newStatus === task.status || updatingTask) return;
    setTaskStatus.mutate({ taskId: task.taskId, status: newStatus }, {
      onError: (e) => console.error('Failed to update task status', e),
    });
  };

  const handleRetryTask = () => {
    if (retryingTask) return;
    retryTask.mutate(task.taskId, {
      onError: (e) => console.error('Failed to retry task', e),
    });
  };

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
        <PromptValidationTab task={task} batches={leafBatches} />
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

/** Section 1: Problems / Missing Items */
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

/** Section 3: Prompt & Validation tab (lecture-scoped token summary) */
function PromptValidationTab({ task, batches }) {
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
