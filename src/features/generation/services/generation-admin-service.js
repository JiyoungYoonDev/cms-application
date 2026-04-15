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

// ── Job control ──
export const stopJob = (jobId) =>
  apiFetch(generationAdminRoutes.stopJob(jobId), { method: 'POST' });

export const resumeJob = (jobId) =>
  apiFetch(generationAdminRoutes.resumeJob(jobId), { method: 'POST' });

// ── Math validation ──
export const runMathCheck = (payload) =>
  apiFetch(generationAdminRoutes.mathCheck(), {
    method: 'POST',
    body: payload,
    signal: AbortSignal.timeout(300_000),
  });

// ── Validation Rounds ──
export const getJobValidations = (jobId) =>
  apiFetch(generationAdminRoutes.jobValidations(jobId));

export const revalidateJob = (jobId) =>
  apiFetch(generationAdminRoutes.revalidateJob(jobId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const overrideValidation = (resultId, manualOverride, reason) =>
  apiFetch(generationAdminRoutes.overrideValidation(resultId), {
    method: 'PATCH',
    body: { manualOverride, reason },
  });

export const compareRounds = (roundA, roundB) =>
  apiFetch(generationAdminRoutes.compareRounds(roundA, roundB));

// ── Scope-based Validation ──
// Runs content validation at Course / Section / Lecture / Item level.
// Each call creates a new ValidationRound for that scope target.
// Uses 300s timeout because Course-level validation can touch hundreds of items.

export const validateCourse = (courseId) =>
  apiFetch(generationAdminRoutes.validateCourse(courseId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const validateSection = (sectionId) =>
  apiFetch(generationAdminRoutes.validateSection(sectionId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const validateLecture = (lectureId) =>
  apiFetch(generationAdminRoutes.validateLecture(lectureId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });

export const validateItem = (itemId) =>
  apiFetch(generationAdminRoutes.validateItem(itemId), {
    method: 'POST',
    signal: AbortSignal.timeout(60_000),
  });

/**
 * Unified dispatcher — validate any scope by type.
 * @param {'COURSE'|'SECTION'|'LECTURE'|'ITEM'} scopeType
 * @param {number} targetId
 * @returns Promise<ValidationRoundSummary>
 */
export const validateByScope = (scopeType, targetId) => {
  switch (scopeType) {
    case 'COURSE':
      return validateCourse(targetId);
    case 'SECTION':
      return validateSection(targetId);
    case 'LECTURE':
      return validateLecture(targetId);
    case 'ITEM':
      return validateItem(targetId);
    default:
      throw new Error(
        `Unknown scopeType: "${scopeType}". Expected one of COURSE, SECTION, LECTURE, ITEM.`
      );
  }
};

/**
 * Fetch all validation rounds for a scope target.
 * scopeType is passed lowercase in the URL (backend accepts case-insensitive).
 */
export const getScopedRounds = (scopeType, targetId) =>
  apiFetch(generationAdminRoutes.scopedRounds(scopeType.toLowerCase(), targetId));

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
