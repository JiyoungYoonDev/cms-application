/**
 * Pure helpers + display constants for job detail UI.
 * No React, no services. Safe to import from any job-detail-* component.
 */

/** Fix 4: Human-readable finish reason */
export function humanFinishReason(finishReason, truncated, repaired, errorMessage) {
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

export function finishReasonColor(finishReason, truncated) {
  if (truncated) return 'text-red-600';
  const upper = (finishReason ?? '').toUpperCase();
  if (upper === 'STOP') return 'text-emerald-600';
  if (upper === 'SAFETY' || upper === 'RECITATION') return 'text-red-600';
  return 'text-muted-foreground';
}

export function finishReasonColorWithError(finishReason, truncated, errorMessage) {
  if (errorMessage?.startsWith('Superseded')) return 'text-blue-500';
  return finishReasonColor(finishReason, truncated);
}

/** Fix 2: Meaningful batch name from item titles */
export function batchLabel(titles, itemTypes) {
  if (!titles || titles.length === 0) {
    return itemTypes || 'Batch';
  }
  const shorts = titles.map((t) => {
    const clean = t.replace(
      /^(Introduction to|Worked Examples?:?|Your Turn:?|Practice:?|Hands-on:?|Advanced:?|Test:?|Challenge:?)\s*/i,
      '',
    ).trim();
    const words = (clean || t).split(/\s+/).slice(0, 2).join(' ');
    return words.length > 20 ? words.slice(0, 18) + '..' : words;
  });
  return shorts.join(' + ');
}

/** Fix 3: Classify why an item is missing based on batch metadata */
export function classifyMissingCause(batch) {
  if (batch.truncated) return { label: 'Truncation', color: 'text-red-600', bg: 'bg-red-500/10' };
  if (batch.repaired) return { label: 'Parse repair', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
  if (batch.status === 'FAILED') return { label: 'Batch failed', color: 'text-red-600', bg: 'bg-red-500/10' };
  return { label: 'Title mismatch', color: 'text-orange-600', bg: 'bg-orange-500/10' };
}

/** Walk up the parentBatchId chain to collect all ancestors (newest → oldest). */
export function collectAncestors(leaf, batchMap) {
  const chain = [];
  let cur = batchMap[leaf.parentBatchId];
  while (cur) {
    chain.push(cur);
    cur = batchMap[cur.parentBatchId];
  }
  return chain;
}

export const TASK_STATUSES = ['COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED', 'PENDING'];
export const BATCH_STATUSES = ['COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED', 'PENDING'];

export const JOB_STATUS_STYLE = {
  COMPLETED:             { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Completed' },
  FAILED:                { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Failed' },
  PARTIALLY_COMPLETED:   { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Partial' },
  IN_PROGRESS:           { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Running' },
  PENDING:               { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
};

export const JOB_TYPE_STYLE = {
  COURSE:  { color: 'bg-violet-500/10 text-violet-600 border-violet-200', label: 'Course' },
  SECTION: { color: 'bg-sky-500/10 text-sky-600 border-sky-200', label: 'Section' },
  LECTURE: { color: 'bg-teal-500/10 text-teal-600 border-teal-200', label: 'Lecture' },
  ITEM:    { color: 'bg-orange-500/10 text-orange-600 border-orange-200', label: 'Item' },
};

export const DIFF_STYLE = {
  FIXED:     { label: 'Fixed', color: 'text-emerald-600 bg-emerald-500/10' },
  REGRESSED: { label: 'Regressed', color: 'text-red-600 bg-red-500/10' },
  NEW:       { label: 'New', color: 'text-blue-600 bg-blue-500/10' },
  REMOVED:   { label: 'Removed', color: 'text-muted-foreground bg-muted' },
};
