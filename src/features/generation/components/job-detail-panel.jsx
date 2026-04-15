'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Square, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useJobDetail } from '../hooks/use-generation-job-detail';
import { useJobActions } from '../hooks/use-job-actions';
import { JOB_TYPE_STYLE } from '../utils/job-helpers';
import { JobSummary, FormInputsSection } from './job-detail-summary';
import { LectureTable } from './job-detail-lecture-table';
import { ValidationRoundsSection } from './job-detail-validation-rounds';

export default function JobDetailPanel({ jobId, onBack }) {
  const { data: res, isLoading } = useJobDetail(jobId);
  const { stop, resume } = useJobActions(jobId);

  const detail = res?.data ?? {};
  const tasks = detail.tasks ?? [];

  const [expandedTask, setExpandedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // Fix 5

  const isRunning = detail.status === 'IN_PROGRESS' || detail.status === 'PENDING';
  const isResumable = detail.status === 'CANCELLED' || detail.status === 'FAILED' || detail.status === 'PARTIALLY_COMPLETED';

  const stopping = stop.isPending;
  const resuming = resume.isPending;

  function handleStop() {
    if (!confirm('Stop this generation job?')) return;
    stop.mutate(undefined, {
      onError: (e) => alert('Stop failed: ' + (e?.message ?? 'unknown error')),
    });
  }

  function handleResume() {
    resume.mutate(undefined, {
      onError: (e) => alert('Resume failed: ' + (e?.message ?? 'unknown error')),
    });
  }

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
      <div className='flex items-center justify-between'>
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

        {/* Job actions */}
        <div className='flex items-center gap-2'>
          {isRunning && (
            <button
              onClick={handleStop}
              disabled={stopping}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50 transition-colors'
            >
              <Square size={12} />
              {stopping ? 'Stopping...' : 'Stop'}
            </button>
          )}
          {isResumable && (
            <button
              onClick={handleResume}
              disabled={resuming}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                         bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors'
            >
              <Play size={12} />
              {resuming ? 'Resuming...' : 'Resume'}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => <div key={i} className='h-16 rounded-lg bg-muted animate-pulse' />)}
        </div>
      ) : (
        <>
          <JobSummary d={detail} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          <FormInputsSection d={detail} />

          <ValidationRoundsSection jobId={jobId} />

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
