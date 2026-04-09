import { apiFetch } from '@/lib/api/api-client';
import { generationAdminRoutes, generationRoutes } from '@/lib/api/routes';

// ── Output Viewer ──
export const getGenerationOutput = (outputId) =>
  apiFetch(generationRoutes.generationOutput(outputId));

// ── Dashboard ──
export const getOverview = () =>
  apiFetch(generationAdminRoutes.overview());

export const getJobs = () =>
  apiFetch(generationAdminRoutes.jobs());

export const getJobDetail = (jobId) =>
  apiFetch(generationAdminRoutes.jobDetail(jobId));

// ── Validation ──
export const getValidationOverview = () =>
  apiFetch(generationAdminRoutes.validationOverview());

export const getOutputValidations = (outputId) =>
  apiFetch(generationAdminRoutes.outputValidations(outputId));

// ── Prompt Templates ──
export const getTemplates = () =>
  apiFetch(generationAdminRoutes.templates());

export const getTemplateVersions = (templateId) =>
  apiFetch(generationAdminRoutes.templateVersions(templateId));

export const getActiveVersion = (templateId) =>
  apiFetch(generationAdminRoutes.templateActiveVersion(templateId));

export const getVersionDetail = (versionId) =>
  apiFetch(generationAdminRoutes.versionDetail(versionId));

export const createVersion = (templateId, payload) =>
  apiFetch(generationAdminRoutes.createVersion(templateId), {
    method: 'POST',
    body: payload,
  });

export const activateVersion = (versionId) =>
  apiFetch(generationAdminRoutes.activateVersion(versionId), {
    method: 'POST',
  });

export const getVersionMetrics = (versionId) =>
  apiFetch(generationAdminRoutes.versionMetrics(versionId));

export const compareVersions = (versionA, versionB) =>
  apiFetch(generationAdminRoutes.compareVersions(versionA, versionB));

// ── Reviews ──
export const createReview = (payload) =>
  apiFetch(generationAdminRoutes.createReview(), {
    method: 'POST',
    body: payload,
  });

export const getJobReviews = (jobId) =>
  apiFetch(generationAdminRoutes.jobReviews(jobId));

// ── Status overrides ──
export const updateBatchStatus = (batchId, status) =>
  apiFetch(generationAdminRoutes.updateBatchStatus(batchId), {
    method: 'PATCH',
    body: { status },
  });

export const updateTaskStatus = (taskId, status) =>
  apiFetch(generationAdminRoutes.updateTaskStatus(taskId), {
    method: 'PATCH',
    body: { status },
  });

// ── Retry ──
export const retryJob = (jobId) =>
  apiFetch(generationRoutes.retryJob(jobId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const retryTask = (taskId) =>
  apiFetch(generationRoutes.retryTask(taskId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const retryBatch = (batchId) =>
  apiFetch(generationRoutes.retryBatch(batchId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });
