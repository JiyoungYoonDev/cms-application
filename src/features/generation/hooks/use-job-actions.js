'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  stopJob,
  resumeJob,
  updateTaskStatus,
  retryTask,
  updateBatchStatus,
  retryBatch,
  revalidateJob,
  overrideValidation,
  getJobValidations,
} from '../services/generation-admin-service';

/**
 * Central job detail query key — sub-components import this so invalidation
 * targets the exact cache entry fed by useJobDetail.
 */
export const jobDetailKey = (jobId) => ['generation', 'job', jobId];
export const jobValidationsKey = (jobId) => ['generation', 'job', jobId, 'validations'];

/**
 * Single hook that wraps every write action on a job.
 *
 * Each sub-component that needs actions calls `useJobActions(jobId)` at its
 * own top level. That way each component instance owns its own mutation
 * state (`isPending`, `error`) — e.g. two different FailureItems have
 * independent loading spinners, which a shared hook-at-the-top would not give.
 *
 * All mutations invalidate the job detail query on success. `revalidateJob`
 * additionally invalidates the validation overview query, matching the
 * previous inline behavior.
 */
export function useJobActions(jobId) {
  const qc = useQueryClient();
  const invalidateJob = () => {
    qc.invalidateQueries({ queryKey: jobDetailKey(jobId) });
    qc.invalidateQueries({ queryKey: jobValidationsKey(jobId) });
  };
  const invalidateValidationOverview = () =>
    qc.invalidateQueries({ queryKey: ['generation', 'validation', 'overview'] });

  const stop = useMutation({
    mutationFn: () => stopJob(jobId),
    onSuccess: invalidateJob,
  });

  const resume = useMutation({
    mutationFn: () => resumeJob(jobId),
    onSuccess: invalidateJob,
  });

  const setTaskStatus = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: invalidateJob,
  });

  const retryTaskMut = useMutation({
    mutationFn: (taskId) => retryTask(taskId),
    onSuccess: invalidateJob,
  });

  const setBatchStatus = useMutation({
    mutationFn: ({ batchId, status }) => updateBatchStatus(batchId, status),
    onSuccess: invalidateJob,
  });

  const retryBatchMut = useMutation({
    mutationFn: (batchId) => retryBatch(batchId),
    onSuccess: invalidateJob,
  });

  const overrideFailure = useMutation({
    mutationFn: ({ failureId, override, reason }) =>
      overrideValidation(failureId, override, reason),
    onSuccess: invalidateJob,
  });

  const revalidate = useMutation({
    mutationFn: () => revalidateJob(jobId),
    onSuccess: () => {
      invalidateJob();
      invalidateValidationOverview();
    },
  });

  return {
    stop,
    resume,
    setTaskStatus,
    retryTask: retryTaskMut,
    setBatchStatus,
    retryBatch: retryBatchMut,
    overrideFailure,
    revalidate,
  };
}

/**
 * Separate query for validation rounds. Replaces the pre-existing ad-hoc
 * useState(() => fetchRounds()) pattern (which was a latent bug — useState's
 * initializer ran the fetch as a side effect instead of setting initial state).
 */
export function useJobValidations(jobId) {
  return useQuery({
    queryKey: jobValidationsKey(jobId),
    queryFn: () => getJobValidations(jobId),
    select: (res) => res?.data ?? res,
    enabled: jobId != null,
  });
}
